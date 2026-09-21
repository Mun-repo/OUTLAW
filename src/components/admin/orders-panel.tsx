import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatOrderNumber,
  formatPrice,
  formatRegisteredAt,
} from "@/lib/format";
import { listOrders, setOrderStatus } from "@/lib/server/orders";
import type { OrderStatus, ShopOrder } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "En attente",
  pickup: "À récupérer",
  delivered: "Remis",
};

export function OrdersPanel({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["orders"],
    queryFn: () => listOrders({ data: { token } }),
  });

  const statusMutation = useMutation({
    mutationFn: (input: { id: number; status: "pickup" | "delivered" }) =>
      setOrderStatus({ data: { token, id: input.id, status: input.status } }),
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(
        order.status === "delivered"
          ? `${formatOrderNumber(order.orderNumber)} marquée comme remise`
          : `${formatOrderNumber(order.orderNumber)} à récupérer`,
      );
    },
    onError: (err: Error) => toast.error(err.message || "Mise à jour impossible"),
  });

  const rows = query.data ?? [];

  if (query.isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (rows.length === 0) {
    return (
      <p className="border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
        Aucune commande pour le moment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <thead className="border-b border-border bg-secondary/40 text-2xs tracking-lux uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Commande</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Nom</th>
            <th className="px-4 py-3 font-medium">Prénom</th>
            <th className="px-4 py-3 font-medium">E-mail</th>
            <th className="px-4 py-3 font-medium">Articles</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              pending={
                statusMutation.isPending &&
                statusMutation.variables?.id === order.id
              }
              onToggle={() =>
                statusMutation.mutate({
                  id: order.id,
                  status: order.status === "pickup" ? "delivered" : "pickup",
                })
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderRow({
  order,
  pending,
  onToggle,
}: {
  order: ShopOrder;
  pending: boolean;
  onToggle: () => void;
}) {
  const items = order.items
    .map((item) => `${item.title} × ${item.quantity}`)
    .join(", ");
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium tabular-nums">
        {formatOrderNumber(order.orderNumber)}
      </td>
      <td className="px-4 py-3 tabular-nums text-muted-foreground">
        {formatRegisteredAt(order.createdAt)}
      </td>
      <td className="px-4 py-3">{order.lastName}</td>
      <td className="px-4 py-3">{order.firstName}</td>
      <td className="px-4 py-3 text-muted-foreground">{order.email}</td>
      <td className="px-4 py-3">
        <p>{items || "—"}</p>
        <p className="mt-1 tabular-nums text-muted-foreground">
          {formatPrice(order.total)}
        </p>
      </td>
      <td className="px-4 py-3">
        <Badge variant={order.status === "delivered" ? "default" : "outline"}>
          {STATUS_LABEL[order.status]}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant={order.status === "pickup" ? "default" : "outline"}
          size="sm"
          disabled={pending}
          onClick={onToggle}
        >
          {order.status === "pickup" ? "Marquer remis" : "À récupérer"}
        </Button>
      </td>
    </tr>
  );
}
