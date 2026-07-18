export interface CartItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export const CART_STORAGE_KEY = "veya-cart";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as CartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => ({
      product_id: String(item.product_id || ""),
      title: String(item.title || ""),
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
      image: String(item.image || ""),
    }));
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

export function addCartItem(item: CartItem) {
  const current = loadCart();
  const existing = current.find((entry) => entry.product_id === item.product_id);

  const nextCart = existing
    ? current.map((entry) =>
        entry.product_id === item.product_id
          ? { ...entry, quantity: entry.quantity + item.quantity }
          : entry
      )
    : [...current, item];

  saveCart(nextCart);
  return nextCart;
}

export function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}
