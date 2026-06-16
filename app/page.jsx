"use client";
import { useState } from "react";
import { StoreProvider } from "@/lib/store";
import { LoginScreen } from "@/components/login-screen";
import { AppHeader } from "@/components/app-header";
import { WaiterPanel } from "@/components/waiter-panel";
import { KitchenPanel } from "@/components/kitchen-panel";
import { CashierPanel } from "@/components/cashier-panel";
import { ManagerPanel } from "@/components/manager-panel";
export default function Page() {
    const [session, setSession] = useState(null);
    return (<StoreProvider>
      {!session ? (<LoginScreen onLogin={(name, role) => setSession({ name, role })}/>) : (<div className="min-h-svh bg-background">
          <AppHeader role={session.role} name={session.name} onLogout={() => setSession(null)}/>
          {session.role === "garcom" && (<WaiterPanel waiterName={session.name}/>)}
          {session.role === "cozinha" && <KitchenPanel />}
          {session.role === "caixa" && <CashierPanel />}
          {session.role === "gerente" && <ManagerPanel />}
        </div>)}
    </StoreProvider>);
}
