-- Store-scoped carts persist items only. They never reserve or deduct stock.
create table if not exists public.customer_carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, store_id)
);

create unique index if not exists customer_carts_one_active_per_customer_idx
  on public.customer_carts(customer_id) where is_active;

create table if not exists public.customer_cart_items (
  cart_id uuid not null references public.customer_carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (cart_id, product_id)
);

create index if not exists customer_cart_items_product_id_idx on public.customer_cart_items(product_id);
alter table public.customer_carts enable row level security;
alter table public.customer_cart_items enable row level security;

create policy "Customers can view own carts" on public.customer_carts for select
  using (customer_id = auth.uid());
create policy "Customers can view own cart items" on public.customer_cart_items for select
  using (exists (
    select 1 from public.customer_carts carts
    where carts.id = customer_cart_items.cart_id and carts.customer_id = auth.uid()
  ));

create or replace function public.add_customer_cart_item(p_product_id uuid, p_quantity integer default 1)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid := auth.uid();
  v_cart_id uuid;
  v_store_id uuid;
  v_stock integer;
  v_next_quantity integer;
begin
  if v_customer_id is null or not exists (select 1 from public.customers where id = v_customer_id) then
    raise exception 'Customer authentication is required';
  end if;
  if p_quantity < 1 then raise exception 'Quantity must be at least 1'; end if;

  select store_id, quantity into v_store_id, v_stock from public.products
  where id = p_product_id and status = 'active';
  if v_store_id is null or v_stock < 1 then raise exception 'This product is no longer available'; end if;

  update public.customer_carts set is_active = false, updated_at = now()
  where customer_id = v_customer_id and is_active;
  insert into public.customer_carts (customer_id, store_id, is_active)
  values (v_customer_id, v_store_id, true)
  on conflict (customer_id, store_id) do update set is_active = true, updated_at = now()
  returning id into v_cart_id;

  select coalesce(quantity, 0) + p_quantity into v_next_quantity
  from public.customer_cart_items where cart_id = v_cart_id and product_id = p_product_id;
  v_next_quantity := coalesce(v_next_quantity, p_quantity);
  if v_next_quantity > v_stock then
    raise exception 'Only % item(s) are currently in stock', v_stock;
  end if;

  insert into public.customer_cart_items (cart_id, product_id, quantity)
  values (v_cart_id, p_product_id, v_next_quantity)
  on conflict (cart_id, product_id) do update set quantity = excluded.quantity, updated_at = now();
end;
$$;

create or replace function public.set_customer_cart_item_quantity(p_product_id uuid, p_quantity integer)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_cart_id uuid;
  v_stock integer;
begin
  if auth.uid() is null then raise exception 'Customer authentication is required'; end if;
  if p_quantity < 1 then perform public.remove_customer_cart_item(p_product_id); return; end if;

  select carts.id, products.quantity into v_cart_id, v_stock
  from public.customer_carts carts
  join public.customer_cart_items items on items.cart_id = carts.id and items.product_id = p_product_id
  join public.products on products.id = items.product_id and products.store_id = carts.store_id
  where carts.customer_id = auth.uid() and carts.is_active and products.status = 'active';
  if v_cart_id is null or v_stock is null then raise exception 'Cart item not found'; end if;
  if p_quantity > v_stock then raise exception 'Only % item(s) are currently in stock', v_stock; end if;

  update public.customer_cart_items set quantity = p_quantity, updated_at = now()
  where cart_id = v_cart_id and product_id = p_product_id;
end;
$$;

create or replace function public.remove_customer_cart_item(p_product_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.customer_cart_items items using public.customer_carts carts
  where items.cart_id = carts.id and carts.customer_id = auth.uid() and items.product_id = p_product_id;
end;
$$;

create or replace function public.clear_customer_cart()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.customer_cart_items items using public.customer_carts carts
  where items.cart_id = carts.id and carts.customer_id = auth.uid() and carts.is_active;
end;
$$;

create or replace function public.get_customer_cart()
returns table (product_id uuid, store_id uuid, title text, price numeric, quantity integer, image text, available_quantity integer)
language sql security definer set search_path = public as $$
  select products.id, carts.store_id, products.product_name, products.price, items.quantity,
    products.main_image_url, products.quantity
  from public.customer_carts carts
  join public.customer_cart_items items on items.cart_id = carts.id
  join public.products on products.id = items.product_id and products.store_id = carts.store_id
  where carts.customer_id = auth.uid() and carts.is_active and products.status = 'active'
  order by items.created_at;
$$;

-- Locks every product in the active store cart, validates quantities, creates
-- exactly one store order and its items, then deducts stock and clears only that cart.
create or replace function public.create_customer_cart_order(
  p_customer_name text, p_phone text, p_whatsapp text, p_address text,
  p_notes text, p_sender_payment_number text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid := auth.uid();
  v_cart record;
  v_item record;
  v_store_type text;
  v_store_owner_id uuid;
  v_order_id uuid;
  v_subtotal numeric := 0;
  v_first_product_id uuid;
  v_download_url text;
begin
  if v_customer_id is null or not exists (select 1 from public.customers where id = v_customer_id) then
    raise exception 'Customer authentication is required';
  end if;
  if coalesce(trim(p_customer_name), '') = '' or coalesce(trim(p_phone), '') = ''
    or coalesce(trim(p_whatsapp), '') = '' or coalesce(trim(p_sender_payment_number), '') = '' then
    raise exception 'Missing required fields';
  end if;

  select id, store_id into v_cart from public.customer_carts
  where customer_id = v_customer_id and is_active for update;
  if v_cart.id is null then raise exception 'Your cart is empty'; end if;
  select store_type, user_id into v_store_type, v_store_owner_id from public.stores where id = v_cart.store_id;
  if v_store_type is null then raise exception 'Store not found'; end if;
  if v_store_owner_id = v_customer_id then raise exception 'You cannot purchase your own product'; end if;
  if v_store_type <> 'digital' and coalesce(trim(p_address), '') = '' then raise exception 'Missing required fields'; end if;
  if exists (
    select 1 from public.customer_cart_items items
    left join public.products products on products.id = items.product_id
    where items.cart_id = v_cart.id
      and (products.id is null or products.store_id <> v_cart.store_id or products.status <> 'active')
  ) then raise exception 'Your cart contains an unavailable product'; end if;

  for v_item in
    select items.product_id, items.quantity, products.price, products.quantity as stock, products.download_url
    from public.customer_cart_items items
    join public.products on products.id = items.product_id and products.store_id = v_cart.store_id
    where items.cart_id = v_cart.id and products.status = 'active'
    order by items.product_id for update of products
  loop
    if v_item.quantity > v_item.stock then
      raise exception 'Insufficient stock for product %', v_item.product_id;
    end if;
    v_subtotal := v_subtotal + (v_item.price * v_item.quantity);
    if v_first_product_id is null then
      v_first_product_id := v_item.product_id;
      v_download_url := v_item.download_url;
    end if;
  end loop;
  if v_first_product_id is null then raise exception 'Your cart is empty'; end if;

  insert into public.orders (
    product_id, store_id, customer_name, phone, whatsapp, address, notes,
    subtotal, delivery_fee, total, status, payment_status, sender_payment_number, download_url, customer_id
  ) values (
    v_first_product_id, v_cart.store_id, p_customer_name, p_phone, p_whatsapp, p_address, p_notes,
    v_subtotal, 0, v_subtotal, 'pending', 'waiting', p_sender_payment_number,
    case when v_store_type = 'digital' then v_download_url else null end, v_customer_id
  ) returning id into v_order_id;

  for v_item in
    select items.product_id, items.quantity, products.price
    from public.customer_cart_items items
    join public.products on products.id = items.product_id and products.store_id = v_cart.store_id
    where items.cart_id = v_cart.id
    order by items.product_id for update of products
  loop
    insert into public.order_items (order_id, product_id, quantity, price)
    values (v_order_id, v_item.product_id, v_item.quantity, v_item.price);
    update public.products set quantity = quantity - v_item.quantity where id = v_item.product_id;
  end loop;
  delete from public.customer_cart_items where cart_id = v_cart.id;
  return v_order_id;
end;
$$;

create or replace function public.create_customer_order(
  p_product_id uuid, p_store_id uuid, p_customer_name text, p_phone text,
  p_whatsapp text, p_address text, p_notes text, p_sender_payment_number text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid := auth.uid(); v_product record; v_store_type text; v_store_owner_id uuid; v_order_id uuid;
begin
  if v_customer_id is null or not exists (select 1 from public.customers where id = v_customer_id) then raise exception 'Customer authentication is required'; end if;
  if coalesce(trim(p_customer_name), '') = '' or coalesce(trim(p_phone), '') = '' or coalesce(trim(p_whatsapp), '') = '' or coalesce(trim(p_sender_payment_number), '') = '' then raise exception 'Missing required fields'; end if;
  select store_type, user_id into v_store_type, v_store_owner_id from public.stores where id = p_store_id;
  if v_store_type is null or v_store_owner_id = v_customer_id then raise exception 'Invalid purchase'; end if;
  if v_store_type <> 'digital' and coalesce(trim(p_address), '') = '' then raise exception 'Missing required fields'; end if;
  select id, price, quantity, download_url into v_product from public.products
  where id = p_product_id and store_id = p_store_id and status = 'active' for update;
  if v_product.id is null or v_product.quantity < 1 then raise exception 'This product is no longer available'; end if;
  insert into public.orders (product_id, store_id, customer_name, phone, whatsapp, address, notes, subtotal, delivery_fee, total, status, payment_status, sender_payment_number, download_url, customer_id)
  values (p_product_id, p_store_id, p_customer_name, p_phone, p_whatsapp, p_address, p_notes, v_product.price, 0, v_product.price, 'pending', 'waiting', p_sender_payment_number, case when v_store_type = 'digital' then v_product.download_url else null end, v_customer_id)
  returning id into v_order_id;
  insert into public.order_items (order_id, product_id, quantity, price) values (v_order_id, p_product_id, 1, v_product.price);
  update public.products set quantity = quantity - 1 where id = p_product_id;
  perform public.remove_customer_cart_item(p_product_id);
  return v_order_id;
end;
$$;

revoke all on function public.add_customer_cart_item(uuid, integer), public.set_customer_cart_item_quantity(uuid, integer), public.remove_customer_cart_item(uuid), public.clear_customer_cart(), public.get_customer_cart(), public.create_customer_cart_order(text, text, text, text, text, text), public.create_customer_order(uuid, uuid, text, text, text, text, text, text) from public;
grant execute on function public.add_customer_cart_item(uuid, integer), public.set_customer_cart_item_quantity(uuid, integer), public.remove_customer_cart_item(uuid), public.clear_customer_cart(), public.get_customer_cart(), public.create_customer_cart_order(text, text, text, text, text, text), public.create_customer_order(uuid, uuid, text, text, text, text, text, text) to authenticated;
