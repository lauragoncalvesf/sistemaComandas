"use client";
import { useState } from "react";
import { UtensilsCrossed, User, Lock, ChefHat, Wallet, ClipboardList, LayoutDashboard, ArrowRight, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorDialog } from "@/components/error-dialog";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, useStore } from "@/lib/store";
const roleOptions = [
    { role: "garcom", Icon: ClipboardList, desc: "Comandas e pedidos" },
    { role: "cozinha", Icon: ChefHat, desc: "Preparo dos itens" },
    { role: "caixa", Icon: Wallet, desc: "Pagamentos" },
    { role: "gerente", Icon: LayoutDashboard, desc: "Visão geral" },
];
export function LoginScreen({ onLogin, }) {
    const { authenticateEmployee } = useStore();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("garcom");
    const [error, setError] = useState("");
    const [loggingIn, setLoggingIn] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setLoggingIn(true);
        const employee = authenticateEmployee(username, password, role)
            .finally(() => setLoggingIn(false));
        const authenticatedEmployee = await employee;
        if (!authenticatedEmployee) {
            setError("Usuário, senha ou perfil incorreto.");
            return;
        }
        setError("");
        onLogin(authenticatedEmployee.name, authenticatedEmployee.role);
    }
    return (<main className="flex min-h-svh items-center justify-center bg-primary p-4">
      <ErrorDialog open={Boolean(error)} message={error} title="Erro no login" onOpenChange={(open) => !open && setError("")}/>
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-card shadow-2xl md:grid-cols-2">
        {/* Brand side */}
        <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <UtensilsCrossed className="size-6"/>
            </div>
            <span className="font-heading text-xl font-semibold">
              GestorComandas
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="font-heading text-3xl font-semibold leading-tight text-balance">
              Gerencie comandas do salão à cozinha em um só lugar
            </h1>
            <p className="text-pretty text-primary-foreground/70 leading-relaxed">
              Controle pedidos, agilize o preparo e feche contas com rapidez.
              Tudo em uma plataforma feita para bares e restaurantes.
            </p>
          </div>
          <p className="text-sm text-primary-foreground/50">
            Sistema acadêmico de Engenharia de Software
          </p>
        </div>


        {/* Form side */}
        <div className="p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <UtensilsCrossed className="size-5"/>
            </div>
            <span className="font-heading text-lg font-semibold text-foreground">
              GestorComandas
            </span>
          </div>


          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Bem-vindo de volta
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com suas credenciais e selecione seu perfil.
          </p>


          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                <Input id="username" value={username} onChange={(e) => {
            setUsername(e.target.value);
            setError("");
        }} placeholder="usuario" className="pl-9" autoComplete="username"/>
              </div>
            </div>


            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                <Input id="password" type="password" value={password} onChange={(e) => {
            setPassword(e.target.value);
            setError("");
        }} placeholder="senha" className="pl-9" autoComplete="current-password"/>
              </div>
            </div>


            <div className="flex flex-col gap-2">
              <Label>Perfil de acesso</Label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map(({ role: r, Icon, desc }) => {
            const active = role === r;
            return (<button type="button" key={r} onClick={() => {
                    setRole(r);
                    setError("");
                }} aria-pressed={active ? "true" : "false"} className={cn("relative flex flex-col gap-1 rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50", active
                    ? "border-white bg-primary text-primary-foreground shadow-sm ring-2 ring-white"
                    : "border-border hover:bg-muted")}>
                      <span className={cn("flex size-8 items-center justify-center rounded-lg", active
                    ? "bg-white/15 text-primary-foreground"
                    : "bg-muted text-muted-foreground")}>
                        <Icon className="size-4"/>
                      </span>
                      <span className={cn("mt-1 text-sm", active
                    ? "font-bold text-primary-foreground"
                    : "font-medium text-foreground")}>
                        {ROLE_LABELS[r]}
                      </span>
                      <span className={cn("text-xs", active
                    ? "font-bold text-primary-foreground/80"
                    : "text-muted-foreground")}>
                        {desc}
                      </span>
                    </button>);
        })}
              </div>
            </div>


            <Button type="submit" size="lg" className="mt-1 gap-2" disabled={loggingIn}>
              {loggingIn ? "Entrando..." : `Entrar como ${ROLE_LABELS[role]}`}
              <ArrowRight className="size-4"/>
            </Button>
          </form>
        </div>
      </div>
    </main>);
}
