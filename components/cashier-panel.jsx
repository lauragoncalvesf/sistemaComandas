"use client";
import { useMemo, useState } from "react";
import { Wallet, Table2, Plus, CheckCircle2, Banknote, CreditCard, Smartphone, Receipt, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { ErrorDialog } from "@/components/error-dialog";
import { Separator } from "@/components/ui/separator";
import { PAYMENT_LABELS, comandaBalance, comandaPaid, comandaTotal, formatBRL, useStore, } from "@/lib/store";
const paymentIcons = {
    dinheiro: Banknote,
    credito: CreditCard,
    debito: CreditCard,
    pix: Smartphone,
};
export function CashierPanel() {
    const { comandas } = useStore();
    const open = comandas.filter((c) => c.open);
    const [selectedId, setSelectedId] = useState(open[0]?.id ?? null);
    const selected = open.find((c) => c.id === selectedId) ?? open[0] ?? null;
    const openTotal = open.reduce((sum, c) => sum + comandaBalance(c), 0);
    return (<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Wallet className="size-5"/>
        </div>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Caixa
          </h1>
          <p className="text-sm text-muted-foreground">
            {open.length} comanda{open.length === 1 ? "" : "s"} aberta
            {open.length === 1 ? "" : "s"} · saldo a receber{" "}
            <span className="font-medium text-foreground">
              {formatBRL(openTotal)}
            </span>
          </p>
        </div>
      </div>


      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-3">
          {open.length === 0 && (<div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
              Nenhuma comanda aberta.
            </div>)}
          {open.map((c) => {
            const active = selected?.id === c.id;
            const balance = comandaBalance(c);
            return (<button key={c.id} onClick={() => setSelectedId(c.id)} className={`rounded-2xl border p-4 text-left transition-colors ${active
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-border bg-card hover:bg-muted"}`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-heading font-semibold text-foreground">
                    <Table2 className="size-4 text-primary"/>
                    {c.table}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatBRL(balance)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total {formatBRL(comandaTotal(c))} · Pago{" "}
                  {formatBRL(comandaPaid(c))}
                </p>
              </button>);
        })}
        </div>


        {selected ? (<CashierDetail comanda={selected} onClosed={() => setSelectedId(null)}/>) : (<div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
            Selecione uma comanda para registrar pagamentos.
          </div>)}
      </div>
    </div>);
}
function CashierDetail({ comanda, onClosed, }) {
    const { addPayment, closeComanda } = useStore();
    const [type, setType] = useState("dinheiro");
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");
    const total = comandaTotal(comanda);
    const paid = comandaPaid(comanda);
    const balance = comandaBalance(comanda);
    const itemsSummary = useMemo(() => {
        return comanda.items.map((i) => ({
            id: i.id,
            label: `${i.qty}x ${i.name}`,
            value: i.price * i.qty,
        }));
    }, [comanda.items]);
    function getErrorMessage(error) {
        return error instanceof Error ? error.message : "Nao foi possivel concluir a acao.";
    }
    async function handleAddPayment() {
        const value = Number.parseFloat(amount.replace(",", "."));
        if (!Number.isFinite(value) || value <= 0)
            return;
        try {
            setError("");
            await addPayment(comanda.id, type, value);
            setAmount("");
        }
        catch (error) {
            setError(getErrorMessage(error));
        }
    }
    async function payRemaining() {
        if (balance <= 0)
            return;
        try {
            setError("");
            await addPayment(comanda.id, type, Number(balance.toFixed(2)));
        }
        catch (error) {
            setError(getErrorMessage(error));
        }
    }
    async function handleCloseComanda() {
        try {
            setError("");
            await closeComanda(comanda.id);
            onClosed();
        }
        catch (error) {
            setError(getErrorMessage(error));
        }
    }
    return (<div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5">
      <ErrorDialog open={Boolean(error)} message={error} title="Erro no caixa" onOpenChange={(open) => !open && setError("")}/>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-foreground">
          <Table2 className="size-5 text-primary"/>
          {comanda.table}
        </h2>
        {comanda.customer && (<span className="text-sm text-muted-foreground">
            {comanda.customer}
          </span>)}
      </div>


      {/* Items summary */}
      <div className="rounded-xl border border-border">
        <p className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm font-medium text-foreground">
          <Receipt className="size-4 text-muted-foreground"/>
          Consumo
        </p>
        <div className="flex flex-col">
          {itemsSummary.map((row) => (<div key={row.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium text-foreground tabular-nums">
                {formatBRL(row.value)}
              </span>
            </div>))}
        </div>
      </div>


      {/* Payments list */}
      {comanda.payments.length > 0 && (<div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">
            Pagamentos registrados
          </p>
          {comanda.payments.map((p) => {
                const Icon = paymentIcons[p.type];
                return (<div key={p.id} className="flex items-center justify-between rounded-lg bg-status-ready/40 px-3 py-2 text-sm">
                <span className="flex items-center gap-2 text-status-ready-foreground">
                  <Icon className="size-4"/>
                  {PAYMENT_LABELS[p.type]}
                </span>
                <span className="font-medium text-status-ready-foreground tabular-nums">
                  - {formatBRL(p.amount)}
                </span>
              </div>);
            })}
        </div>)}


      {/* Add payment */}
      <div className="rounded-xl bg-muted/60 p-4">
        <Label className="mb-2 block text-sm">Registrar pagamento</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={type} onValueChange={(v) => setType(v)}>
            <SelectTrigger className="bg-card sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(PAYMENT_LABELS).map((t) => (<SelectItem key={t} value={t}>
                  {PAYMENT_LABELS[t]}
                </SelectItem>))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              R$
            </span>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00" className="bg-card pl-9"/>
          </div>
          <Button onClick={handleAddPayment} className="gap-2">
            <Plus className="size-4"/>
            Adicionar
          </Button>
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={payRemaining} disabled={balance <= 0}>
          Pagar restante ({formatBRL(Math.max(balance, 0))})
        </Button>
      </div>


      {/* Financial summary */}
      <div className="flex flex-col gap-2 rounded-xl bg-primary p-4 text-primary-foreground">
        <div className="flex justify-between text-sm text-primary-foreground/70">
          <span>Total da comanda</span>
          <span className="tabular-nums">{formatBRL(total)}</span>
        </div>
        <div className="flex justify-between text-sm text-primary-foreground/70">
          <span>Total pago</span>
          <span className="tabular-nums">{formatBRL(paid)}</span>
        </div>
        <Separator className="bg-primary-foreground/20"/>
        <div className="flex items-center justify-between">
          <span className="font-heading text-lg font-semibold">
            {balance > 0 ? "Saldo a pagar" : "Troco / Quitado"}
          </span>
          <span className="font-heading text-xl font-semibold tabular-nums">
            {formatBRL(Math.abs(balance))}
          </span>
        </div>
      </div>


      <Button size="lg" className="gap-2" disabled={balance > 0} onClick={handleCloseComanda}>
        <CheckCircle2 className="size-4"/>
        {balance > 0
            ? `Falta ${formatBRL(balance)} para fechar`
            : "Fechar comanda"}
      </Button>
    </div>);
}
