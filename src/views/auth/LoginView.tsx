import { useState, type FormEvent } from "react";
import { Activity, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";
import type { LoginCredentials, RegisterCredentials } from "@/models/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginViewProps {
  error: string | null;
  isSubmitting: boolean;
  onLogin: (credentials: LoginCredentials) => Promise<boolean>;
  onModeChange?: () => void;
  onRegister: (credentials: RegisterCredentials) => Promise<boolean>;
}

export function LoginView({
  error,
  isSubmitting,
  onLogin,
  onModeChange,
  onRegister,
}: LoginViewProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "register") {
      await onRegister({ nombre: name, email, contrasena: password });
      return;
    }

    await onLogin({ email, contrasena: password });
  };

  const isRegistering = mode === "register";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-border/60 bg-panel/40 lg:block">
          <div className="canvas-grid absolute inset-0 opacity-75" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[color:var(--neon-cyan)]/15 ring-1 ring-[color:var(--neon-cyan)]/45">
                <Activity className="h-5 w-5 text-[color:var(--neon-cyan)]" />
              </div>
              <div>
                <p className="text-sm font-semibold">StressFlow</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Laboratorio visual de carga
                </p>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-[color:var(--neon-cyan)]">
                Plataforma de simulación
              </p>
              <h1 className="text-5xl font-semibold leading-tight tracking-normal text-foreground">
                Diseña, valida y mejora arquitecturas distribuidas.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                Acceso privado al canvas, proyectos guardados, métricas y simulación de tráfico.
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3">
              {[
                ["Acceso", "email y clave"],
                ["Proyectos", "persistencia"],
                ["Simulación", "panel activo"],
              ].map(([title, subtitle]) => (
                <div
                  key={title}
                  className="rounded-lg border border-border/60 bg-card/55 p-3 backdrop-blur"
                >
                  <div className="font-mono text-sm text-[color:var(--neon-cyan)]">{title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[color:var(--neon-cyan)]/15 ring-1 ring-[color:var(--neon-cyan)]/45">
                <Activity className="h-5 w-5 text-[color:var(--neon-cyan)]" />
              </div>
              <p className="text-sm font-semibold">StressFlow</p>
            </div>

            <div className="rounded-lg border border-border/70 bg-panel/80 p-6 shadow-[var(--shadow-glow-cyan)] backdrop-blur">
              <div className="mb-7">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-[color:var(--neon-violet)]/15 ring-1 ring-[color:var(--neon-violet)]/40">
                  <ShieldCheck className="h-4 w-4 text-[color:var(--neon-violet)]" />
                </div>
                <h2 className="text-2xl font-semibold">
                  {isRegistering ? "Crear cuenta" : "Iniciar sesión"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isRegistering
                    ? "Registrate con datos mínimos y entrá al simulador."
                    : "Ingresá con tu email y contraseña."}
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {isRegistering && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        autoComplete="name"
                        className="h-11 pl-10"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="h-11 pl-10"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={isRegistering ? "new-password" : "current-password"}
                      minLength={10}
                      className="h-11 pl-10 pr-11"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md border border-[color:var(--status-saturated)]/45 bg-[color:var(--status-saturated)]/10 px-3 py-2 text-sm text-[color:var(--status-saturated)]">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full bg-[color:var(--neon-cyan)]/15 text-[color:var(--neon-cyan)] ring-1 ring-[color:var(--neon-cyan)]/50 hover:bg-[color:var(--neon-cyan)]/25"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Validando..." : isRegistering ? "Registrarme" : "Entrar"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-5 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
                {isRegistering ? "¿Ya tenés cuenta?" : "¿No tenés cuenta?"}{" "}
                <button
                  type="button"
                  className="font-medium text-[color:var(--neon-cyan)] hover:underline"
                  onClick={() => {
                    onModeChange?.();
                    setMode(isRegistering ? "login" : "register");
                  }}
                >
                  {isRegistering ? "Iniciar sesión" : "Crear cuenta"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
