"use client";
import { useState } from "react";
import { LayoutDashboard, Receipt, Flame, CheckCircle2, DollarSign, Pencil, Trash2, Plus, Package, Users, UserRoundCheck, Eye, EyeOff, ChefHat, Ban, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { ErrorDialog } from "@/components/error-dialog";
import { comandaTotal, formatBRL, ROLE_LABELS, useStore, } from "@/lib/store";
export function ManagerPanel() {
    const { comandas, employees, products } = useStore();
    const openComandas = comandas.filter((c) => c.open);
    const sentItems = comandas.flatMap((c) => c.items.filter((i) => {
        const product = products.find((p) => p.id === i.productId);
        return i.sentToKitchen && product?.goesToKitchen && i.status !== "entregue";
    }));
    const preparing = sentItems.filter((i) => i.status === "em_preparo").length;
    const pending = sentItems.filter((i) => i.status === "pendente").length;
    const ready = sentItems.filter((i) => i.status === "pronto").length;
    const openRevenue = openComandas.reduce((s, c) => s + comandaTotal(c), 0);
    const closedRevenue = comandas
        .filter((c) => !c.open)
        .reduce((s, c) => s + comandaTotal(c), 0);
    return (<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <LayoutDashboard className="size-5"/>
        </div>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Dashboard do Gerente
          </h1>
          <p className="text-sm text-muted-foreground">
            Visão geral da operação em tempo real
          </p>
        </div>
      </div>


      {/* Metrics */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard Icon={Receipt} label="Comandas abertas" value={String(openComandas.length)} tone="accent"/>
        <MetricCard Icon={Flame} label="Pedidos em preparo" value={String(preparing)} hint={`${pending} pendentes`} tone="amber"/>
        <MetricCard Icon={CheckCircle2} label="Pedidos prontos" value={String(ready)} tone="green"/>
        <MetricCard Icon={DollarSign} label="Faturamento em aberto" value={formatBRL(openRevenue)} hint={`${formatBRL(closedRevenue)} já fechado`} tone="primary"/>
        <MetricCard Icon={Users} label="Funcionários ativos" value={String(employees.filter((employee) => employee.active).length)} hint={`${employees.length} cadastrados`} tone="accent"/>
      </div>


      {/* Reports + Products */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <ReportsCard openCount={openComandas.length} closedCount={comandas.length - openComandas.length} itemsSent={sentItems.length} avgTicket={openComandas.length
            ? openRevenue / openComandas.length
            : 0}/>
        <ProductsCard />
      </div>
      <div className="mt-6">
        <EmployeesCard />
      </div>
    </div>);
}
function MetricCard({ Icon, label, value, hint, tone, }) {
    const tones = {
        accent: "bg-primary text-primary-foreground",
        amber: "bg-status-pending text-status-pending-foreground",
        green: "bg-status-ready text-status-ready-foreground",
        primary: "bg-primary text-primary-foreground",
    };
    return (<div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className={`flex size-9 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-4"/>
        </span>
      </div>
      <p className="mt-4 font-heading text-2xl font-semibold text-foreground">
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>);
}
function ReportsCard({ openCount, closedCount, itemsSent, avgTicket, }) {
    const rows = [
        { label: "Comandas em atendimento", value: String(openCount) },
        { label: "Comandas fechadas", value: String(closedCount) },
        { label: "Itens enviados à cozinha", value: String(itemsSent) },
        { label: "Ticket médio (aberto)", value: formatBRL(avgTicket) },
    ];
    return (<div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        Relatório resumido
      </h2>
      <div className="mt-4 flex flex-col gap-2">
        {rows.map((r) => (<div key={r.label} className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
            <span className="text-sm text-muted-foreground">{r.label}</span>
            <span className="font-heading font-semibold text-foreground">
              {r.value}
            </span>
          </div>))}
      </div>
    </div>);
}
function EmployeesCard() {
    const { employees, removeEmployee, updateEmployee } = useStore();
    const [error, setError] = useState("");
    const errorMessage = (error) => error instanceof Error ? error.message : "Nao foi possivel concluir a acao.";
    async function runEmployeeAction(action) {
        try {
            setError("");
            await action();
        }
        catch (error) {
            setError(errorMessage(error));
        }
    }
    return (<div className="rounded-2xl border border-border bg-card p-5">
      <ErrorDialog open={Boolean(error)} message={error} title="Erro nos funcionários" onOpenChange={(open) => !open && setError("")}/>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
          <Users className="size-5 text-primary"/>
          Funcionários e acessos
        </h2>
        <EmployeeDialog />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {employees.map((employee) => (<div key={employee.id} className="flex items-start justify-between gap-3 rounded-xl border border-border px-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  {employee.name}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${employee.active
                ? "bg-status-ready text-status-ready-foreground"
                : "bg-muted text-muted-foreground"}`}>
                  {employee.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                @{employee.username} · {ROLE_LABELS[employee.role]}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => runEmployeeAction(() => updateEmployee(employee.id, employee.name, employee.username, employee.password ?? "", employee.role, !employee.active))} aria-label={employee.active ? "Desativar funcionário" : "Ativar funcionário"}>
                <UserRoundCheck className="size-4 text-muted-foreground"/>
              </Button>
              <EmployeeDialog employee={employee}/>
              <Button variant="ghost" size="icon" onClick={() => runEmployeeAction(() => removeEmployee(employee.id))} aria-label={`Remover ${employee.name}`}>
                <Trash2 className="size-4 text-destructive"/>
              </Button>
            </div>
          </div>))}
      </div>
    </div>);
}
function EmployeeDialog({ employee }) {
    const { addEmployee, updateEmployee, employees } = useStore();
    const editing = Boolean(employee);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(employee?.name ?? "");
    const [username, setUsername] = useState(employee?.username ?? "");
    const [password, setPassword] = useState(employee?.password ?? "");
    const [role, setRole] = useState(employee?.role ?? "garcom");
    const [active, setActive] = useState(employee?.active ?? true);
    const [error, setError] = useState("");
    const roleOptions = Object.keys(ROLE_LABELS).map((item) => ({
        value: item,
        label: ROLE_LABELS[item],
    }));
    const statusOptions = [
        { value: "active", label: "Ativo" },
        { value: "inactive", label: "Inativo" },
    ];
    function errorMessage(error) {
        return error instanceof Error ? error.message : "Nao foi possivel salvar o funcionario.";
    }
    async function handleSave() {
        const cleanName = name.trim();
        const cleanUsername = username.trim().toLowerCase();
        const duplicated = employees.some((item) => item.id !== employee?.id &&
            item.username.toLowerCase() === cleanUsername);
        if (!cleanName || !cleanUsername || (!editing && !password)) {
            setError("Preencha nome, usuário e senha.");
            return;
        }
        if (duplicated) {
            setError("Já existe um funcionário com esse usuário.");
            return;
        }
        try {
            if (editing && employee) {
                await updateEmployee(employee.id, cleanName, cleanUsername, password, role, active);
            }
            else {
                await addEmployee(cleanName, cleanUsername, password, role);
                setName("");
                setUsername("");
                setPassword("");
                setRole("garcom");
                setActive(true);
            }
            setError("");
            setOpen(false);
        }
        catch (error) {
            setError(errorMessage(error));
        }
    }
    return (<>
    <ErrorDialog open={Boolean(error)} message={error} title="Erro no funcionário" onOpenChange={(open) => !open && setError("")}/>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={editing ? (<Button variant="ghost" size="icon" aria-label={`Editar ${employee?.name}`}>
              <Pencil className="size-4 text-muted-foreground"/>
            </Button>) : (<Button size="sm" className="gap-2">
              <Plus className="size-4"/>
              Novo funcionário
            </Button>)}/>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">
            {editing ? "Editar funcionário" : "Novo funcionário"}
          </DialogTitle>
          <DialogDescription>
            Cadastre o acesso usado no login do sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="employee-name">Nome</Label>
            <Input id="employee-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Maria Souza"/>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="employee-username">Usuário</Label>
              <Input id="employee-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="maria"/>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="employee-password">Senha</Label>
              <Input id="employee-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="123"/>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Perfil</Label>
              <Select value={role} items={roleOptions} onValueChange={(value) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(ROLE_LABELS).map((item) => (<SelectItem key={item} value={item}>
                      {ROLE_LABELS[item]}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            {editing && (<div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select value={active ? "active" : "inactive"} items={statusOptions} onValueChange={(value) => setActive(value === "active")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>)}
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editing ? "Salvar alterações" : "Cadastrar funcionário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>);
}
function ProductsCard() {
    const { products, removeProduct, toggleProductAvailability, toggleProductKitchenFlow, } = useStore();
    const [error, setError] = useState("");
    const errorMessage = (error) => error instanceof Error ? error.message : "Nao foi possivel concluir a acao.";
    async function runProductAction(action) {
        try {
            setError("");
            await action();
        }
        catch (error) {
            setError(errorMessage(error));
        }
    }
    return (<div className="rounded-2xl border border-border bg-card p-5">
      <ErrorDialog open={Boolean(error)} message={error} title="Erro nos produtos" onOpenChange={(open) => !open && setError("")}/>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
          <Package className="size-5 text-primary"/>
          Produtos do cardápio
        </h2>
        <ProductDialog />
      </div>


      <div className="mt-4 flex flex-col gap-2">
        {products.map((p) => (<div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {p.name}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.available
                ? "bg-status-ready text-status-ready-foreground"
                : "bg-muted text-muted-foreground"}`}>
                  {p.available ? "Disponível" : "Indisponível"}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.goesToKitchen
                ? "bg-status-preparing text-status-preparing-foreground"
                : "bg-muted text-muted-foreground"}`}>
                  {p.goesToKitchen ? "Vai para cozinha" : "Direto ao salão"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{p.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground tabular-nums">
                {formatBRL(p.price)}
              </span>
              <Button variant="ghost" size="icon" onClick={() => runProductAction(() => toggleProductAvailability(p.id))} aria-label={p.available
                ? `Marcar ${p.name} como indisponível`
                : `Marcar ${p.name} como disponível`}>
                {p.available ? (<Eye className="size-4 text-muted-foreground"/>) : (<EyeOff className="size-4 text-muted-foreground"/>)}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => runProductAction(() => toggleProductKitchenFlow(p.id))} aria-label={p.goesToKitchen
                ? `${p.name} nao vai para cozinha`
                : `${p.name} vai para cozinha`}>
                {p.goesToKitchen ? (<ChefHat className="size-4 text-muted-foreground"/>) : (<Ban className="size-4 text-muted-foreground"/>)}
              </Button>
              <ProductDialog product={p}/>
              <Button variant="ghost" size="icon" onClick={() => runProductAction(() => removeProduct(p.id))} aria-label={`Remover ${p.name}`}>
                <Trash2 className="size-4 text-destructive"/>
              </Button>
            </div>
          </div>))}
      </div>
    </div>);
}
function ProductDialog({ product }) {
    const { addProduct, updateProduct } = useStore();
    const editing = Boolean(product);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(product?.name ?? "");
    const [price, setPrice] = useState(product ? String(product.price).replace(".", ",") : "");
    const [category, setCategory] = useState(product?.category ?? "");
    const [goesToKitchen, setGoesToKitchen] = useState(product?.goesToKitchen ?? true);
    const [error, setError] = useState("");
    function errorMessage(error) {
        return error instanceof Error ? error.message : "Nao foi possivel salvar o produto.";
    }
    async function handleSave() {
        const value = Number.parseFloat(price.replace(",", "."));
        if (!name.trim() || !Number.isFinite(value) || value < 0)
            return;
        try {
            setError("");
            if (editing && product) {
                await updateProduct(product.id, name.trim(), value, category.trim() || "Outros", goesToKitchen);
            }
            else {
                await addProduct(name.trim(), value, category.trim() || "Outros", goesToKitchen);
                setName("");
                setPrice("");
                setCategory("");
                setGoesToKitchen(true);
            }
            setOpen(false);
        }
        catch (error) {
            setError(errorMessage(error));
        }
    }
    return (<>
    <ErrorDialog open={Boolean(error)} message={error} title="Erro no produto" onOpenChange={(open) => !open && setError("")}/>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={editing ? (<Button variant="ghost" size="icon" aria-label={`Editar ${product?.name}`}>
              <Pencil className="size-4 text-muted-foreground"/>
            </Button>) : (<Button size="sm" className="gap-2">
              <Plus className="size-4"/>
              Novo
            </Button>)}/>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">
            {editing ? "Editar produto" : "Novo produto"}
          </DialogTitle>
          <DialogDescription>
            Defina nome, categoria e valor do item do cardápio.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="p-name">Nome</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Chopp 500ml"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-cat">Categoria</Label>
              <Input id="p-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Bebidas"/>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-price">Preço (R$)</Label>
              <Input id="p-price" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="0,00"/>
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm text-foreground">
            <input type="checkbox" checked={goesToKitchen} onChange={(e) => setGoesToKitchen(e.target.checked)} className="size-4"/>
            Produto preparado na cozinha/bar
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editing ? "Salvar alterações" : "Adicionar produto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>);
}
