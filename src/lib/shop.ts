import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { listProducts } from "@/lib/server/catalog";

export const PRODUCTS_QUERY_KEY = ["products"] as const;

const rootRoute = getRouteApi("__root__");

export function useProducts() {
  const seeded = rootRoute.useLoaderData();
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: () => listProducts(),
    initialData: seeded.products,
  });
}

export function useShopOpen() {
  const query = useProducts();
  return {
    isPending: query.isPending,
    isOpen: (query.data?.length ?? 0) > 0,
  };
}
