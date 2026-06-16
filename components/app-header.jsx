"use client";
import { UtensilsCrossed, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/store";
export function AppHeader({ role, name, onLogout, }) {
    return (<header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-5"/>
          </div>
          <div className="leading-tight">
            <p className="font-heading text-base font-semibold text-foreground">
              GestorComandas
            </p>
            <p className="text-xs text-muted-foreground">
              Painel · {ROLE_LABELS[role]}
            </p>
          </div>
        </div>


        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm" aria-hidden>
            {name.charAt(0).toUpperCase()}
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Sair">
            <LogOut className="size-4"/>
          </Button>
        </div>
      </div>
    </header>);
}
