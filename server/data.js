const roles = ["garcom", "cozinha", "caixa", "gerente"]
const itemStatuses = ["pendente", "em_preparo", "pronto", "entregue"]
const paymentTypes = ["dinheiro", "credito", "debito", "pix"]

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const products = [
  { id: "prod-chopp-pilsen", name: "Chopp Pilsen 500ml", price: 14.9, category: "Bebidas", available: true, goesToKitchen: false },
  { id: "prod-caipirinha", name: "Caipirinha", price: 22.0, category: "Bebidas", available: true, goesToKitchen: true },
  { id: "prod-refrigerante", name: "Refrigerante Lata", price: 7.5, category: "Bebidas", available: true, goesToKitchen: false },
  { id: "prod-agua", name: "Agua Mineral", price: 5.0, category: "Bebidas", available: true, goesToKitchen: false },
  { id: "prod-batata-frita", name: "Porcao de Batata Frita", price: 32.0, category: "Porcoes", available: true, goesToKitchen: true },
  { id: "prod-isca-frango", name: "Isca de Frango", price: 38.0, category: "Porcoes", available: true, goesToKitchen: true },
  { id: "prod-calabresa", name: "Calabresa Acebolada", price: 36.0, category: "Porcoes", available: true, goesToKitchen: true },
  { id: "prod-hamburguer", name: "Hamburguer Artesanal", price: 34.0, category: "Pratos", available: true, goesToKitchen: true },
  { id: "prod-file-fritas", name: "File com Fritas", price: 58.0, category: "Pratos", available: true, goesToKitchen: true },
  { id: "prod-pudim", name: "Pudim", price: 16.0, category: "Sobremesas", available: true, goesToKitchen: true },
]

const employees = [
  { id: uid(), name: "Gerente", username: "gerente", password: "123", role: "gerente", active: true, createdAt: Date.now() },
  { id: uid(), name: "Garcom", username: "garcom", password: "123", role: "garcom", active: true, createdAt: Date.now() },
  { id: uid(), name: "Caixa", username: "caixa", password: "123", role: "caixa", active: true, createdAt: Date.now() },
  { id: uid(), name: "Cozinha", username: "cozinha", password: "123", role: "cozinha", active: true, createdAt: Date.now() },
]

function seedComandas() {
  return []
}

const comandas = seedComandas()

export { comandas, employees, itemStatuses, paymentTypes, products, roles, uid }
