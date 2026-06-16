"use client";
import { useMemo, useState } from "react";
import { Plus, Send, Trash2, Table2, Receipt, Minus, CheckCheck, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { ErrorDialog } from "@/components/error-dialog";
import { StatusBadge } from "@/components/status-badge";
import { comandaTotal, formatBRL, useStore, } from "@/lib/store";
export function WaiterPanel({ waiterName }) {
    const { comandas } = useStore();
    const open = comandas.filter((c) => c.open);
    const [selectedId, setSelectedId] = useState(open[0]?.id ?? null);
    const selected = open.find((c) => c.id === selectedId) ?? open[0] ?? null;
    return (<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Comandas abertas
          </h1>
          <p className="text-sm text-muted-foreground">
            {open.length} comanda{open.length === 1 ? "" : "s"} em atendimento
          </p>
        </div>
        <NewComandaDialog waiterName={waiterName} onCreated={setSelectedId}/>
      </div>


      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Comanda list */}
        <div className="flex flex-col gap-3">
          {open.length === 0 && (<EmptyState text="Nenhuma comanda aberta. Crie uma nova para começar."/>)}
          {open.map((c) => {
            const active = selected?.id === c.id;
            return (<button key={c.id} onClick={() => setSelectedId(c.id)} className={`rounded-2xl border p-4 text-left transition-colors ${active
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-border bg-card hover:bg-muted"}`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-heading font-semibold text-foreground">
                    <Table2 className="size-4 text-primary"/>
                    {c.table}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatBRL(comandaTotal(c))}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.customer ? `${c.customer} · ` : ""}
                  {c.items.length} item{c.items.length === 1 ? "" : "s"}
                </p>
              </button>);
        })}
        </div>


        {/* Detail */}
        {selected ? (<ComandaDetail comanda={selected} waiterName={waiterName}/>) : (<EmptyState text="Selecione ou crie uma comanda para gerenciar os pedidos."/>)}
      </div>
    </div>);
}
function ComandaDetail({ comanda, waiterName, }) {
    const { products, addItem, removeItem, sendToKitchen, updateItemStatus } = useStore();
    const [productId, setProductId] = useState(products[0]?.id ?? "");
    const [qty, setQty] = useState(1);
    const [error, setError] = useState("");
    const selectedProduct = products.find((p) => p.id === productId);
    const pendingToSend = comanda.items.filter((i) => {
        const product = products.find((p) => p.id === i.productId);
        return product?.goesToKitchen && !i.sentToKitchen;
    });
    const productOptions = useMemo(() => products.map((p) => ({
        value: p.id,
        label: `${p.name} — ${formatBRL(p.price)}${p.available ? "" : " (indisponível)"}`,
    })), [products]);
    const grouped = useMemo(() => {
        const cats = {};
        for (const p of products) {
            cats[p.category] = cats[p.category] || [];
            cats[p.category].push(p);
        }
        return cats;
    }, [products]);
    function errorMessage(error) {
        return error instanceof Error ? error.message : "Nao foi possivel concluir a acao.";
    }
    async function runAction(action) {
        try {
            setError("");
            await action();
        }
        catch (error) {
            setError(errorMessage(error));
        }
    }
    async function handleAdd() {
        if (!productId || !selectedProduct?.available)
            return;
        await runAction(async () => {
            await addItem(comanda.id, productId, qty, waiterName);
            setQty(1);
        });
    }
    return (<div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5">
      <ErrorDialog open={Boolean(error)} message={error} title="Erro na comanda" onOpenChange={(open) => !open && setError("")}/>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-foreground">
            <Table2 className="size-5 text-primary"/>
            {comanda.table}
          </h2>
          {comanda.customer && (<p className="text-sm text-muted-foreground">{comanda.customer}</p>)}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total parcial</p>
          <p className="font-heading text-xl font-semibold text-foreground">
            {formatBRL(comandaTotal(comanda))}
          </p>
        </div>
      </div>


      {/* Add item */}
      <div className="rounded-xl bg-muted/60 p-4">
        <Label className="mb-2 block text-sm">Adicionar item</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={productId} items={productOptions} onValueChange={(v) => setProductId(v ?? "")}>
            <SelectTrigger className="flex-1 bg-card">
              <SelectValue placeholder="Selecione um produto"/>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(grouped).map(([cat, items]) => (<div key={cat}>
                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {cat}
                  </p>
                  {items.map((p) => (<SelectItem key={p.id} value={p.id} disabled={!p.available}>
                      <span className="flex w-full items-center justify-between gap-3">
                        <span>
                          {p.name} — {formatBRL(p.price)}
                        </span>
                        {!p.available && (<span className="text-xs font-medium text-muted-foreground">
                            Indisponível
                          </span>)}
                        {p.available && !p.goesToKitchen && (<span className="text-xs font-medium text-muted-foreground">
                            Direto
                          </span>)}
                      </span>
                    </SelectItem>))}
                </div>))}
            </SelectContent>
          </Select>


          <div className="flex items-center rounded-md border border-input bg-card">
            <Button type="button" variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir quantidade">
              <Minus className="size-4"/>
            </Button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">
              {qty}
            </span>
            <Button type="button" variant="ghost" size="icon" onClick={() => setQty((q) => q + 1)} aria-label="Aumentar quantidade">
              <Plus className="size-4"/>
            </Button>
          </div>


          <Button onClick={handleAdd} className="gap-2" disabled={!selectedProduct?.available}>
            <Plus className="size-4"/>
            Adicionar
          </Button>
        </div>
        {!selectedProduct?.available && (<p className="mt-3 text-xs font-medium text-muted-foreground">
            Este produto está indisponível no cardápio.
          </p>)}
      </div>


      {/* Items */}
      <div className="flex flex-col gap-2">
        {comanda.items.length === 0 && (<p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum item adicionado ainda.
          </p>)}
        {comanda.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            const goesToKitchen = Boolean(product?.goesToKitchen);
            return (<div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-secondary-foreground tabular-nums">
                  {item.qty}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBRL(item.price * item.qty)} · {item.waiter ?? comanda.waiter}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.sentToKitchen && goesToKitchen ? (item.status === "pronto" ? (<>
                      <StatusBadge status={item.status}/>
                      <Button size="sm" onClick={() => runAction(() => updateItemStatus(comanda.id, item.id, "entregue"))}>
                        Marcar entregue
                      </Button>
                    </>) : (<StatusBadge status={item.status}/>)) : (<>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {goesToKitchen ? "Novo" : "Direto ao salão"}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => runAction(() => removeItem(comanda.id, item.id))} aria-label="Remover item">
                      <Trash2 className="size-4 text-destructive"/>
                    </Button>
                  </>)}
              </div>
            </div>);
        })}
      </div>


      <Button size="lg" className="gap-2" disabled={pendingToSend.length === 0} onClick={() => runAction(() => sendToKitchen(comanda.id))}>
        {pendingToSend.length === 0 ? (<>
            <CheckCheck className="size-4"/>
            Sem itens pendentes para cozinha
          </>) : (<>
            <Send className="size-4"/>
            Enviar {pendingToSend.length} item
            {pendingToSend.length === 1 ? "" : "s"} para a cozinha
          </>)}
      </Button>
    </div>);
}
function NewComandaDialog({ waiterName, onCreated, }) {
    const { createComanda, comandas } = useStore();
    const [open, setOpen] = useState(false);
    const [table, setTable] = useState("");
    const [customer, setCustomer] = useState("");
    const [error, setError] = useState("");
    async function handleCreate() {
        if (!table.trim())
            return;
        try {
            setError("");
            const createdId = await createComanda(table.trim(), customer.trim(), waiterName);
            setOpen(false);
            setTable("");
            setCustomer("");
            onCreated(createdId ?? comandas[0]?.id ?? "");
        }
        catch (error) {
            setError(error instanceof Error ? error.message : "Nao foi possivel criar a comanda.");
        }
    }
    return (<>
    <ErrorDialog open={Boolean(error)} message={error} title="Erro ao criar comanda" onOpenChange={(open) => !open && setError("")}/>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" className="gap-2">
            <Plus className="size-4"/>
            Nova Comanda
          </Button>}/>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Receipt className="size-5 text-primary"/>
            Abrir nova comanda
          </DialogTitle>
          <DialogDescription>
            Informe a mesa e, opcionalmente, o nome do cliente.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="table">Mesa / Identificação</Label>
            <Input id="table" value={table} onChange={(e) => setTable(e.target.value)} placeholder="Ex: Mesa 12" autoFocus/>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="customer">Cliente (opcional)</Label>
            <Input id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Ex: Maria"/>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!table.trim()}>
            Criar comanda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>);
}
function EmptyState({ text }) {
    return (<div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>);
}
