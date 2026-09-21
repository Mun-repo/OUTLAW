import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Providers } from "@/components/layout/providers";
import { FilmGrain } from "@/components/layout/film-grain";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { listProducts } from "@/lib/server/catalog";
import appCss from "../styles.css?url";

const APP_NAME = "Outlaw";

export const Route = createRootRoute({
  loader: async () => ({
    products: await listProducts(),
  }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#000000" },
      {
        name: "description",
        content:
          "Outlaw — collectif indépendant et plateforme culturelle. Culture underground, mode alternative, événements immersifs.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Syne:ital,wght@0,500;0,600;0,700;0,800;1,600;1,700&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="fr" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <PreviewHostBridge />
        <FilmGrain />
        <AuthProvider>
          <Providers>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <Outlet />
              <SiteFooter />
            </div>
          </Providers>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
