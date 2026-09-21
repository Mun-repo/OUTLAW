import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { EventManager } from "@/components/admin/event-manager";
import { OrdersPanel } from "@/components/admin/orders-panel";
import { ProductManager } from "@/components/admin/product-manager";
import { PromoManager } from "@/components/admin/promo-manager";
import { RegistrationsPanel } from "@/components/admin/registrations-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminSession } from "@/lib/admin-session";

export function AdminDashboard({ token }: { token: string }) {
  const clear = useAdminSession((s) => s.clear);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-4">
            <Logo imgClassName="h-7 md:h-8" />
            <span className="hidden text-xs tracking-lux uppercase text-muted-foreground sm:inline">
              Panneau admin
            </span>
          </div>
          <Button variant="outline" onClick={() => clear()}>
            <LogOut className="size-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <h1 className="font-display text-3xl font-medium md:text-4xl">
          Tableau de bord
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Catalogue, commandes, événements, inscriptions et codes promo.
        </p>

        <Tabs defaultValue="boutique" className="mt-8">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="boutique">Boutique</TabsTrigger>
            <TabsTrigger value="evenements">Événements</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="promos">Codes promo</TabsTrigger>
          </TabsList>
          <TabsContent value="boutique">
            <Tabs defaultValue="catalogue">
              <TabsList>
                <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
                <TabsTrigger value="commandes">Commandes</TabsTrigger>
              </TabsList>
              <TabsContent value="catalogue">
                <ProductManager token={token} />
              </TabsContent>
              <TabsContent value="commandes">
                <OrdersPanel token={token} />
              </TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="evenements">
            <EventManager token={token} />
          </TabsContent>
          <TabsContent value="registrations">
            <RegistrationsPanel token={token} />
          </TabsContent>
          <TabsContent value="promos">
            <PromoManager token={token} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
