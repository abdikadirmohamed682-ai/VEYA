-- Store type is a platform-level discriminator. It is intentionally retained
-- on stores so a future storefront can choose a template without inferring it
-- from products or categories.
alter table public.stores
  add column if not exists store_type text;

update public.stores
set store_type = 'digital'
where store_type is null;

alter table public.stores
  alter column store_type set default 'digital',
  alter column store_type set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'stores_store_type_check'
      and conrelid = 'public.stores'::regclass
  ) then
    alter table public.stores
      add constraint stores_store_type_check
      check (store_type in ('digital', 'fashion', 'restaurant', 'electronics', 'beauty', 'talent'));
  end if;
end $$;

-- Product categories are verified against the owning store. This closes the
-- API-level loophole where a client could submit a category absent from the UI.
create or replace function public.validate_product_category_for_store_type()
returns trigger
language plpgsql
as $$
declare
  current_store_type text;
begin
  select store_type into current_store_type
  from public.stores
  where id = new.store_id;

  if current_store_type is null then
    raise exception 'A valid store is required for product categories';
  end if;

  if not (
    (current_store_type = 'digital' and new.category in ('Downloads', 'Licenses')) or
    (current_store_type = 'fashion' and new.category in ('Clothes', 'Shoes', 'Accessories')) or
    (current_store_type = 'restaurant' and new.category in ('Meals', 'Drinks')) or
    (current_store_type = 'electronics' and new.category in ('Devices', 'Accessories')) or
    (current_store_type = 'beauty' and new.category in ('Cosmetics', 'Skin Care')) or
    (current_store_type = 'talent' and new.category in ('Services', 'Portfolio', 'Booking'))
  ) then
    raise exception 'Category "%" is not valid for a % store', new.category, current_store_type;
  end if;

  return new;
end;
$$;

drop trigger if exists products_validate_category_for_store_type on public.products;
create trigger products_validate_category_for_store_type
before insert or update of category, store_id on public.products
for each row execute function public.validate_product_category_for_store_type();
