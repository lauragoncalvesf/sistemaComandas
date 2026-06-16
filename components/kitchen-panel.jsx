"use client";
import { useState } from "react";
import { Clock, Flame, CheckCircle2, Table2, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorDialog } from "@/components/error-dialog";
import { STATUS_LABELS, useStore, } from "@/lib/store";
import { cn } from "@/lib/utils";
const columns = [
    {
        status: "pendente",
        Icon: Clock,
        accent: "text-status-pending-foreground",
        dot: "bg-status-pending-foreground",
    },
    {
        status: "em_preparo",
        Icon: Flame,
        accent: "text-status-preparing-foreground",
        dot: "bg-status-preparing-foreground",
    },
    {
        status: "pronto",
        Icon: CheckCircle2,
        accent: "text-status-ready-foreground",
        dot: "bg-status-ready-foreground",
    },
];
function minutesAgo(ts) {
    const m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1)
        return "agora";
    return `${m} min`;
}
function groupTicketsByTable(tickets) {
    const groups = new Map();
    for (const ticket of tickets) {
        const current = groups.get(ticket.comandaId);
        if (current) {
            current.items.push(ticket);
            continue;
        }
        groups.set(ticket.comandaId, {
            comandaId: ticket.comandaId,
            table: ticket.table,
            customer: ticket.customer,
            createdAt: ticket.createdAt,
            items: [ticket],
        });
    }
    return Array.from(groups.values()).sort((a, b) => a.createdAt - b.createdAt);
}
export function KitchenPanel() {
    const { comandas, products, updateItemStatus } = useStore();
    const [error, setError] = useState("");
    const errorMessage = (error) => error instanceof Error ? error.message : "Nao foi possivel atualizar o pedido.";
    async function runStatusAction(action) {
        try {
            setError("");
            await action();
        }
        catch (error) {
            setError(errorMessage(error));
        }
    }
    const tickets = comandas
        .filter((c) => c.open)
        .flatMap((c) => c.items
        .filter((i) => {
        const product = products.find((p) => p.id === i.productId);
        return i.sentToKitchen && product?.goesToKitchen && i.status !== "entregue";
    })
        .map((i) => ({
        comandaId: c.id,
        itemId: i.id,
        table: c.table,
        customer: c.customer,
        name: i.name,
        qty: i.qty,
        status: i.status,
        waiter: i.waiter ?? c.waiter,
        createdAt: c.createdAt,
    })));
    return (<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <ErrorDialog open={Boolean(error)} message={error} title="Erro na cozinha" onOpenChange={(open) => !open && setError("")}/>
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <ChefHat className="size-5"/>
        </div>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Painel da Cozinha
          </h1>
          <p className="text-sm text-muted-foreground">
            {tickets.length} pedido{tickets.length === 1 ? "" : "s"} na fila
          </p>
        </div>
      </div>


      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {columns.map(({ status, Icon, accent, dot }) => {
            const items = tickets.filter((t) => t.status === status);
            const tableGroups = groupTicketsByTable(items);
            return (<section key={status} className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-4">
              <header className="flex items-center justify-between">
                <span className={cn("flex items-center gap-2 font-heading font-semibold", accent)}>
                  <Icon className="size-4"/>
                  {STATUS_LABELS[status]}
                </span>
                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {items.length}
                </span>
              </header>


              <div className="flex flex-col gap-3">
                {tableGroups.length === 0 && (<p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                    Sem pedidos
                  </p>)}
                {tableGroups.map((group) => (<article key={group.comandaId} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-start justify-between gap-3 border-b border-border bg-muted/45 p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <Table2 className="size-4"/>
                        </span>
                        <div>
                          <p className="font-heading text-sm font-semibold text-foreground">
                            {group.table}
                          </p>
                          {group.customer && (<p className="text-xs text-muted-foreground">
                              {group.customer}
                            </p>)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className={cn("size-2 rounded-full", dot)}/>
                        {group.items.length} item
                        {group.items.length === 1 ? "" : "s"}
                      </div>
                    </div>

                    <div className="flex flex-col divide-y divide-border">
                      {group.items.map((t) => (<div key={t.itemId} className="p-3.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold text-secondary-foreground tabular-nums">
                                {t.qty}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {t.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t.waiter} · enviado há {minutesAgo(t.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex gap-2">
                            {status !== "pendente" && (<Button variant="outline" size="sm" className="flex-1" onClick={() => runStatusAction(() => updateItemStatus(t.comandaId, t.itemId, status === "pronto" ? "em_preparo" : "pendente"))}>
                                Voltar
                              </Button>)}
                            {status !== "pronto" && (<Button size="sm" className="flex-1" onClick={() => runStatusAction(() => updateItemStatus(t.comandaId, t.itemId, status === "pendente" ? "em_preparo" : "pronto"))}>
                                {status === "pendente"
                                ? "Iniciar preparo"
                                : "Marcar pronto"}
                              </Button>)}
                          </div>
                        </div>))}
                    </div>
                  </article>))}
              </div>
            </section>);
        })}
      </div>
    </div>);
}
