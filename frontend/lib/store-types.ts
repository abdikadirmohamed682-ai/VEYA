export const STORE_TYPES = [
  "digital",
  "fashion",
  "restaurant",
  "electronics",
  "beauty",
  "talent",
] as const;

export type StoreType = (typeof STORE_TYPES)[number];

export type StoreTypeDefinition = {
  label: string;
  categories: readonly string[];
  dashboardItems: readonly string[];
  itemLabel: string;
  storefrontTemplate: string;
};

// This is the single source of truth for merchant experiences today and
// storefront template selection in a future customer-facing task.
export const STORE_TYPE_DEFINITIONS: Record<StoreType, StoreTypeDefinition> = {
  digital: {
    label: "Digital Store",
    categories: ["Downloads", "Licenses"],
    dashboardItems: ["Products", "Downloads", "Licenses"],
    itemLabel: "products",
    storefrontTemplate: "digital",
  },
  fashion: {
    label: "Fashion Store",
    categories: ["Clothes", "Shoes", "Accessories"],
    dashboardItems: ["Clothes", "Shoes", "Accessories"],
    itemLabel: "items",
    storefrontTemplate: "fashion",
  },
  restaurant: {
    label: "Restaurant",
    categories: ["Meals", "Drinks"],
    dashboardItems: ["Menu", "Meals", "Drinks"],
    itemLabel: "menu items",
    storefrontTemplate: "restaurant",
  },
  electronics: {
    label: "Electronics Store",
    categories: ["Devices", "Accessories"],
    dashboardItems: ["Devices", "Accessories"],
    itemLabel: "items",
    storefrontTemplate: "electronics",
  },
  beauty: {
    label: "Beauty Store",
    categories: ["Cosmetics", "Skin Care"],
    dashboardItems: ["Cosmetics", "Skin Care"],
    itemLabel: "items",
    storefrontTemplate: "beauty",
  },
  talent: {
    label: "Talent Store",
    categories: ["Services", "Portfolio", "Booking"],
    dashboardItems: ["Services", "Portfolio", "Booking"],
    itemLabel: "offerings",
    storefrontTemplate: "talent",
  },
};

export function isStoreType(value: unknown): value is StoreType {
  return typeof value === "string" && STORE_TYPES.includes(value as StoreType);
}

export function getStoreTypeDefinition(storeType: unknown): StoreTypeDefinition {
  return STORE_TYPE_DEFINITIONS[isStoreType(storeType) ? storeType : "digital"];
}

export function isCategoryForStoreType(category: string, storeType: unknown) {
  return getStoreTypeDefinition(storeType).categories.includes(category);
}
