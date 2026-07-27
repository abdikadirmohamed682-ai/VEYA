export const STORE_TYPES = [
  "digital",
  "physical",
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
  physical: {
    label: "Physical Store",
    categories: ["Products"],
    dashboardItems: ["Products"],
    itemLabel: "items",
    storefrontTemplate: "physical",
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
