"use client";
import { createContext, useEffect, useContext, useMemo, useState, } from "react";
export const ROLE_LABELS = {
    garcom: "Garçom",
    cozinha: "Cozinha",
    caixa: "Caixa",
    gerente: "Gerente",
};
export const PAYMENT_LABELS = {
    dinheiro: "Dinheiro",
    credito: "Cartão de Crédito",
    debito: "Cartão de Débito",
    pix: "Pix",
};
export const STATUS_LABELS = {
    pendente: "Pendente",
    em_preparo: "Em Preparo",
    pronto: "Pronto",
    entregue: "Entregue",
};
function uid() {
    return Math.random().toString(36).slice(2, 10);
}
const seedProducts = [
    { id: "prod-chopp-pilsen", name: "Chopp Pilsen 500ml", price: 14.9, category: "Bebidas", available: true, goesToKitchen: false },
    { id: "prod-caipirinha", name: "Caipirinha", price: 22.0, category: "Bebidas", available: true, goesToKitchen: true },
    { id: "prod-refrigerante", name: "Refrigerante Lata", price: 7.5, category: "Bebidas", available: true, goesToKitchen: false },
    { id: "prod-agua", name: "Água Mineral", price: 5.0, category: "Bebidas", available: true, goesToKitchen: false },
    { id: "prod-batata-frita", name: "Porção de Batata Frita", price: 32.0, category: "Porções", available: true, goesToKitchen: true },
    { id: "prod-isca-frango", name: "Isca de Frango", price: 38.0, category: "Porções", available: true, goesToKitchen: true },
    { id: "prod-calabresa", name: "Calabresa Acebolada", price: 36.0, category: "Porções", available: true, goesToKitchen: true },
    { id: "prod-hamburguer", name: "Hambúrguer Artesanal", price: 34.0, category: "Pratos", available: true, goesToKitchen: true },
    { id: "prod-file-fritas", name: "Filé com Fritas", price: 58.0, category: "Pratos", available: true, goesToKitchen: true },
    { id: "prod-pudim", name: "Pudim", price: 16.0, category: "Sobremesas", available: true, goesToKitchen: true },
];
const seedEmployees = [
    {
        id: uid(),
        name: "Gerente",
        username: "gerente",
        password: "123",
        role: "gerente",
        active: true,
        createdAt: Date.now(),
    },
    {
        id: uid(),
        name: "Garçom",
        username: "garcom",
        password: "123",
        role: "garcom",
        active: true,
        createdAt: Date.now(),
    },
    {
        id: uid(),
        name: "Caixa",
        username: "caixa",
        password: "123",
        role: "caixa",
        active: true,
        createdAt: Date.now(),
    },
    {
        id: uid(),
        name: "Cozinha",
        username: "cozinha",
        password: "123",
        role: "cozinha",
        active: true,
        createdAt: Date.now(),
    },
];
const API_BASE = process.env.NEXT_PUBLIC_API_URL ??
    (typeof window === "undefined"
        ? "http://localhost:3333"
        : `${window.location.protocol}//${window.location.hostname}:3333`);
async function apiRequest(path, options) {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.error ?? "Erro ao comunicar com a API.");
    }
    return data;
}
function handleMutationError(action, error) {
    console.error(`Falha ao ${action}.`, error);
    throw error;
}
function isProductNotFound(error) {
    return error instanceof Error && error.message.includes("Produto nao encontrado");
}
function seedComandas() {
    return [];
}
export function comandaTotal(c) {
    return c.items.reduce((sum, i) => sum + i.price * i.qty, 0);
}
export function comandaPaid(c) {
    return c.payments.reduce((sum, p) => sum + p.amount, 0);
}
export function comandaBalance(c) {
    return comandaTotal(c) - comandaPaid(c);
}
export function formatBRL(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}
const StoreContext = createContext(null);
export function StoreProvider({ children }) {
    const [products, setProducts] = useState(seedProducts);
    const [employees, setEmployees] = useState(seedEmployees);
    const [comandas, setComandas] = useState(() => seedComandas(seedProducts));
    async function refreshData() {
        const [productsData, employeesData, comandasData] = await Promise.all([
            apiRequest("/api/products"),
            apiRequest("/api/employees"),
            apiRequest("/api/comandas"),
        ]);
        setProducts(productsData.products);
        setEmployees(employeesData.employees);
        setComandas(comandasData.comandas);
    }
    useEffect(() => {
        void Promise.resolve().then(refreshData).catch((error) => {
            console.warn("API indisponivel, usando dados locais.", error);
        });
    }, []);
    const value = useMemo(() => {
        return {
            products,
            employees,
            comandas,
            async authenticateEmployee(username, password, role) {
                try {
                    const data = await apiRequest("/api/auth/login", {
                        method: "POST",
                        body: JSON.stringify({ username, password, role }),
                    });
                    return data.employee;
                }
                catch (error) {
                    console.error("Falha ao autenticar funcionario.", error);
                    return null;
                }
            },
            async createComanda(table, customer, waiter) {
                try {
                    const data = await apiRequest("/api/comandas", {
                        method: "POST",
                        body: JSON.stringify({ table, customer, waiter }),
                    });
                    setComandas((prev) => [data.comanda, ...prev]);
                    return data.comanda.id;
                }
                catch (error) {
                    return handleMutationError("abrir comanda", error);
                }
            },
            async addItem(comandaId, productId, qty, waiter) {
                try {
                    const data = await apiRequest(`/api/comandas/${comandaId}/items`, {
                        method: "POST",
                        body: JSON.stringify({ productId, qty, waiter }),
                    });
                    setComandas((prev) => prev.map((c) => (c.id === comandaId ? data.comanda : c)));
                    return;
                }
                catch (error) {
                    return handleMutationError("adicionar item", error);
                }
            },
            async removeItem(comandaId, itemId) {
                try {
                    const data = await apiRequest(`/api/comandas/${comandaId}/items/${itemId}`, { method: "DELETE" });
                    setComandas((prev) => prev.map((c) => (c.id === comandaId ? data.comanda : c)));
                    return;
                }
                catch (error) {
                    return handleMutationError("remover item", error);
                }
            },
            async sendToKitchen(comandaId) {
                try {
                    const data = await apiRequest(`/api/comandas/${comandaId}/send-to-kitchen`, { method: "POST" });
                    setComandas((prev) => prev.map((c) => (c.id === comandaId ? data.comanda : c)));
                    return;
                }
                catch (error) {
                    return handleMutationError("enviar itens para a cozinha", error);
                }
            },
            async updateItemStatus(comandaId, itemId, status) {
                try {
                    const data = await apiRequest(`/api/comandas/${comandaId}/items/${itemId}/status`, {
                        method: "PATCH",
                        body: JSON.stringify({ status }),
                    });
                    setComandas((prev) => prev.map((c) => (c.id === comandaId ? data.comanda : c)));
                    return;
                }
                catch (error) {
                    return handleMutationError("atualizar status do item", error);
                }
            },
            async addPayment(comandaId, type, amount) {
                if (amount <= 0)
                    return;
                try {
                    const data = await apiRequest(`/api/comandas/${comandaId}/payments`, {
                        method: "POST",
                        body: JSON.stringify({ type, amount }),
                    });
                    setComandas((prev) => prev.map((c) => (c.id === comandaId ? data.comanda : c)));
                    return;
                }
                catch (error) {
                    return handleMutationError("adicionar pagamento", error);
                }
            },
            async closeComanda(comandaId) {
                try {
                    const data = await apiRequest(`/api/comandas/${comandaId}/close`, { method: "POST" });
                    setComandas((prev) => prev.map((c) => (c.id === comandaId ? data.comanda : c)));
                    return;
                }
                catch (error) {
                    return handleMutationError("fechar comanda", error);
                }
            },
            async addProduct(name, price, category, goesToKitchen = true) {
                try {
                    const data = await apiRequest("/api/products", {
                        method: "POST",
                        body: JSON.stringify({ name, price, category, goesToKitchen }),
                    });
                    setProducts((prev) => [...prev, data.product]);
                    return;
                }
                catch (error) {
                    return handleMutationError("adicionar produto", error);
                }
            },
            async updateProduct(id, name, price, category, goesToKitchen) {
                try {
                    const data = await apiRequest(`/api/products/${id}`, {
                        method: "PUT",
                        body: JSON.stringify({ name, price, category, goesToKitchen }),
                    });
                    setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
                    return;
                }
                catch (error) {
                    return handleMutationError("atualizar produto", error);
                }
            },
            async toggleProductAvailability(id) {
                try {
                    const data = await apiRequest(`/api/products/${id}/availability`, { method: "PATCH" });
                    setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
                    return;
                }
                catch (error) {
                    if (isProductNotFound(error)) {
                        await refreshData().catch(() => null);
                        return;
                    }
                    return handleMutationError("alterar disponibilidade do produto", error);
                }
            },
            async toggleProductKitchenFlow(id) {
                try {
                    const data = await apiRequest(`/api/products/${id}/kitchen-flow`, { method: "PATCH" });
                    setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
                    return;
                }
                catch (error) {
                    await refreshData().catch(() => null);
                    if (isProductNotFound(error)) {
                        return;
                    }
                    return handleMutationError("alterar fluxo de cozinha do produto", error);
                }
            },
            async removeProduct(id) {
                try {
                    await apiRequest(`/api/products/${id}`, {
                        method: "DELETE",
                    });
                }
                catch (error) {
                    return handleMutationError("remover produto", error);
                }
                setProducts((prev) => prev.filter((p) => p.id !== id));
            },
            async addEmployee(name, username, password, role) {
                try {
                    const data = await apiRequest("/api/employees", {
                        method: "POST",
                        body: JSON.stringify({ name, username, password, role }),
                    });
                    setEmployees((prev) => [...prev, data.employee]);
                    return;
                }
                catch (error) {
                    return handleMutationError("cadastrar funcionario", error);
                }
            },
            async updateEmployee(id, name, username, password, role, active) {
                try {
                    const data = await apiRequest(`/api/employees/${id}`, {
                        method: "PUT",
                        body: JSON.stringify({ name, username, password, role, active }),
                    });
                    setEmployees((prev) => prev.map((employee) => (employee.id === id ? data.employee : employee)));
                    return;
                }
                catch (error) {
                    return handleMutationError("atualizar funcionario", error);
                }
            },
            async removeEmployee(id) {
                try {
                    await apiRequest(`/api/employees/${id}`, {
                        method: "DELETE",
                    });
                }
                catch (error) {
                    return handleMutationError("remover funcionario", error);
                }
                setEmployees((prev) => prev.filter((employee) => employee.id !== id));
            },
        };
    }, [products, employees, comandas]);
    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore() {
    const ctx = useContext(StoreContext);
    if (!ctx)
        throw new Error("useStore must be used within StoreProvider");
    return ctx;
}
