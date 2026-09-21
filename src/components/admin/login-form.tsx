import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSession } from "@/lib/admin-session";
import { adminLogin } from "@/lib/server/admin";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const setToken = useAdminSession((s) => s.setToken);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [shake, setShake] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await adminLogin({ data: { identifier, password } });
      setToken(result.token);
      toast.success("Connexion réussie");
    } catch {
      setError("Identifiants incorrects");
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <form
        onSubmit={onSubmit}
        className={cn(
          "w-full max-w-md rounded-xl border border-border bg-card p-8",
          shake && "shake-error",
        )}
      >
        <div className="flex flex-col items-center text-center">
          <Logo imgClassName="h-10 md:h-12" />
          <p className="mt-6 text-xs tracking-lux uppercase text-muted-foreground">
            Accès privé
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium">Connexion</h1>
        </div>

        <div className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-id">Identifiant</Label>
            <Input
              id="admin-id"
              name="username"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-password">Mot de passe</Label>
            <Input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Connexion…" : "Se connecter"}
          </Button>
        </div>
      </form>
    </main>
  );
}
