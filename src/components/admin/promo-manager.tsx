import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createPromoCode,
  deletePromoCode,
  listPromoCodes,
  updatePromoCode,
} from "@/lib/server/promos";
import { formatPrice } from "@/lib/format";
import type { PromoKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<PromoKind, string> = {
  percent: "Réduction %",
  fixed: "Réduction €",
  access: "Accès privilégié",
};

export function PromoManager({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["promos"],
    queryFn: () => listPromoCodes({ data: { token } }),
  });
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<PromoKind>("percent");
  const [value, setValue] = useState("10");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      createPromoCode({
        data: {
          token,
          code,
          kind,
          value: Number(value) || 0,
          description,
          active: true,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["promos"] });
      setCode("");
      setDescription("");
      toast.success("Code créé");
    },
    onError: (err: Error) => toast.error(err.message || "Erreur"),
  });

  const toggleMutation = useMutation({
    mutationFn: (promo: NonNullable<typeof query.data>[number]) =>
      updatePromoCode({
        data: {
          token,
          id: promo.id,
          code: promo.code,
          kind: promo.kind,
          value: promo.value,
          description: promo.description,
          active: !promo.active,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["promos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePromoCode({ data: { token, id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["promos"] });
      toast.success("Code supprimé");
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate();
  }

  const promos = query.data ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <form
        onSubmit={onSubmit}
        className="h-fit rounded-xl border border-border bg-card p-5"
      >
        <div className="mb-5 flex items-center gap-2">
          <Plus className="size-4" />
          <h2 className="font-display text-xl font-medium">Nouveau code</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="promo-code">Code</Label>
            <Input
              id="promo-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="OUTLAW10"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="promo-kind">Type</Label>
            <select
              id="promo-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as PromoKind)}
              className="h-11 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <option value="percent">Réduction en %</option>
              <option value="fixed">Réduction en euros</option>
              <option value="access">Accès privilégié</option>
            </select>
          </div>
          {kind !== "access" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="promo-value">
                {kind === "percent" ? "Pourcentage" : "Montant (€)"}
              </Label>
              <Input
                id="promo-value"
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="promo-desc">Description</Label>
            <Input
              id="promo-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Soirée privée, -20% boutique…"
            />
          </div>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Création…" : "Créer le code"}
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {query.isLoading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : promos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            Aucun code promo.
          </p>
        ) : (
          promos.map((promo) => (
            <div
              key={promo.id}
              className={cn(
                "flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4",
                !promo.active && "opacity-50",
              )}
            >
              <div className="min-w-0">
                <p className="font-mono text-sm tracking-widest">{promo.code}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {KIND_LABEL[promo.kind]}
                  {promo.kind === "percent"
                    ? ` · ${promo.value} %`
                    : promo.kind === "fixed"
                      ? ` · ${formatPrice(promo.value)}`
                      : null}
                </p>
                {promo.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {promo.description}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleMutation.mutate(promo)}
                >
                  {promo.active ? "Désactiver" : "Activer"}
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Supprimer"
                  onClick={() => deleteMutation.mutate(promo.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
