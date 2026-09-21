import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fileToOptimizedDataUrl } from "@/lib/image";
import { formatPrice } from "@/lib/format";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "@/lib/server/catalog";
import { productImages, type Product } from "@/lib/types";

type FormState = {
  title: string;
  price: string;
  description: string;
  imageUrls: string[];
};

const emptyForm: FormState = {
  title: "",
  price: "",
  description: "",
  imageUrls: [],
};

function toForm(product?: Product): FormState {
  if (!product) return emptyForm;
  return {
    title: product.title,
    price: String(product.price),
    description: product.description,
    imageUrls: productImages(product),
  };
}

export function ProductManager({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => listProducts(),
  });

  const [form, setForm] = useState<FormState>(emptyForm);
  const [fileKey, setFileKey] = useState(0);
  const [editing, setEditing] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: FormState) =>
      createProduct({
        data: {
          token,
          title: payload.title,
          description: payload.description,
          price: Number(payload.price),
          imageUrl: payload.imageUrls[0] ?? null,
          imageUrls: payload.imageUrls,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setForm(emptyForm);
      setFileKey((k) => k + 1);
      toast.success("Article ajouté");
    },
    onError: (err: Error) => toast.error(err.message || "Erreur"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormState }) =>
      updateProduct({
        data: {
          token,
          id,
          title: payload.title,
          description: payload.description,
          price: Number(payload.price),
          imageUrl: payload.imageUrls[0] ?? null,
          imageUrls: payload.imageUrls,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditing(null);
      toast.success("Article mis à jour");
    },
    onError: (err: Error) => toast.error(err.message || "Erreur"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct({ data: { token, id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setPendingDelete(null);
      toast.success("Article supprimé");
    },
    onError: (err: Error) => toast.error(err.message || "Erreur"),
  });

  function submitCreate(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || form.price === "") return;
    createMutation.mutate(form);
  }

  function submitEdit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    updateMutation.mutate({ id: editing.id, payload: editForm });
  }

  async function onPickImages(files: FileList | null, target: "create" | "edit") {
    if (!files?.length) return;
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await fileToOptimizedDataUrl(file));
      }
      const apply = (current: FormState): FormState => ({
        ...current,
        imageUrls: [...current.imageUrls, ...urls],
      });
      if (target === "create") setForm(apply);
      else setEditForm(apply);
    } catch {
      toast.error("Impossible de lire l'image");
    }
  }

  const products = productsQuery.data ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <form
        onSubmit={submitCreate}
        className="h-fit rounded-xl border border-border bg-card p-5"
      >
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <Plus className="size-4" />
            <h2 className="font-display text-xl font-medium">Nouvel article</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Toujours disponible ici. La boutique n'apparaît sur le site public
            qu'à partir du premier article publié.
          </p>
        </div>
        <ProductFields
          idPrefix="create"
          fileKey={fileKey}
          form={form}
          onChange={setForm}
          onFiles={(files) => onPickImages(files, "create")}
        />
        <Button
          type="submit"
          className="mt-5 w-full"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Ajout…" : "Ajouter l'article"}
        </Button>
      </form>

      <div className="flex flex-col gap-4">
        {productsQuery.isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            Aucun article dans le catalogue.
          </p>
        ) : (
          products.map((product) => {
            const cover = productImages(product)[0];
            return (
              <div
                key={product.id}
                className="flex gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="size-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {cover ? (
                    <img src={cover} alt="" className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.title}</p>
                  <p className="text-sm tabular-nums text-muted-foreground">
                    {formatPrice(product.price)}
                  </p>
                  {product.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  ) : null}
                  {productImages(product).length > 1 ? (
                    <p className="mt-1 text-2xs tracking-lux uppercase text-muted-foreground">
                      {productImages(product).length} images
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="Modifier"
                    onClick={() => {
                      setEditing(product);
                      setEditForm(toForm(product));
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="Supprimer"
                    onClick={() => setPendingDelete(product)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
            <DialogDescription>
              Mise à jour du titre, du prix, de la description et des images.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEdit} className="flex flex-col gap-4">
            <ProductFields
              idPrefix="edit"
              fileKey={0}
              form={editForm}
              onChange={setEditForm}
              onFiles={(files) => onPickImages(files, "edit")}
            />
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `« ${pendingDelete.title} » sera retiré de la boutique.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductFields({
  idPrefix,
  fileKey,
  form,
  onChange,
  onFiles,
}: {
  idPrefix: string;
  fileKey: number;
  form: FormState;
  onChange: (next: FormState) => void;
  onFiles: (files: FileList | null) => void;
}) {
  const [url, setUrl] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-title`}>Titre</Label>
        <Input
          id={`${idPrefix}-title`}
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-price`}>Prix (€)</Label>
        <Input
          id={`${idPrefix}-price`}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={form.price}
          onChange={(e) => onChange({ ...form, price: e.target.value })}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          rows={4}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-image-url`}>Ajouter une URL d'image</Label>
        <div className="flex gap-2">
          <Input
            id={`${idPrefix}-image-url`}
            type="text"
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const next = url.trim();
              if (!next) return;
              onChange({ ...form, imageUrls: [...form.imageUrls, next] });
              setUrl("");
            }}
          >
            Ajouter
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-image-file`}>Importer des fichiers</Label>
        <Input
          id={`${idPrefix}-image-file`}
          key={fileKey}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>
      {form.imageUrls.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {form.imageUrls.map((src, i) => (
            <div key={`${src.slice(0, 24)}-${i}`} className="relative">
              <img src={src} alt="" className="h-24 w-full object-cover" />
              <button
                type="button"
                aria-label="Retirer l'image"
                className="absolute top-1 right-1 flex size-7 items-center justify-center border border-pure/40 bg-ink/80 text-pure"
                onClick={() =>
                  onChange({
                    ...form,
                    imageUrls: form.imageUrls.filter((_, index) => index !== i),
                  })
                }
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
