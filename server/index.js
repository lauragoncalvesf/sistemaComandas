import cors from "cors"
import express from "express"
import { Prisma } from "@prisma/client"
import { prisma } from "./db.js"
import { itemStatuses, paymentTypes, roles } from "./data.js"

const app = express()
const port = Number(process.env.API_PORT ?? 3333)

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? true }))
app.use(express.json())

function badRequest(res, message) {
  return res.status(400).json({ error: message })
}

function notFound(res, message = "Registro nao encontrado.") {
  return res.status(404).json({ error: message })
}

function normalizeUsername(username) {
  return String(username ?? "").trim().toLowerCase()
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

function dateToTime(value) {
  return value ? new Date(value).getTime() : undefined
}

function serializeProduct(product) {
  return {
    ...product,
    price: Number(product.price),
    createdAt: dateToTime(product.createdAt),
    updatedAt: dateToTime(product.updatedAt),
  }
}

function serializeEmployee(employee, { includePassword = false } = {}) {
  const payload = {
    ...employee,
    createdAt: dateToTime(employee.createdAt),
  }

  if (!includePassword) delete payload.password
  return payload
}

function serializeItem(item) {
  return {
    id: item.id,
    productId: item.productId,
    name: item.name,
    price: Number(item.price),
    qty: item.qty,
    status: item.status,
    sentToKitchen: item.sentToKitchen,
    waiter: item.waiterName,
    notes: item.notes ?? undefined,
    createdAt: dateToTime(item.createdAt),
    updatedAt: dateToTime(item.updatedAt),
  }
}

function serializePayment(payment) {
  return {
    id: payment.id,
    type: payment.type,
    amount: Number(payment.amount),
    createdAt: dateToTime(payment.createdAt),
  }
}

function serializeComanda(comanda) {
  return {
    id: comanda.id,
    table: comanda.table,
    customer: comanda.customer ?? undefined,
    waiter: comanda.waiterName,
    items: (comanda.items ?? []).map(serializeItem),
    payments: (comanda.payments ?? []).map(serializePayment),
    open: comanda.open,
    createdAt: dateToTime(comanda.createdAt),
    closedAt: dateToTime(comanda.closedAt),
  }
}

function comandaInclude() {
  return {
    items: { orderBy: { createdAt: "asc" } },
    payments: { orderBy: { createdAt: "asc" } },
  }
}

async function findComanda(id) {
  return prisma.comanda.findUnique({
    where: { id },
    include: comandaInclude(),
  })
}

async function findEmployeeByName(name) {
  const cleanName = String(name ?? "").trim()
  if (!cleanName) return null

  return prisma.employee.findFirst({
    where: { name: { equals: cleanName, mode: "insensitive" } },
  })
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "sistema-comandas-api" })
})

app.get("/api/meta", (_req, res) => {
  res.json({ itemStatuses, paymentTypes, roles })
})

app.post(
  "/api/auth/login",
  asyncRoute(async (req, res) => {
    const { username, password, role } = req.body

    if (!roles.includes(role)) {
      return badRequest(res, "Perfil invalido.")
    }

    const employee = await prisma.employee.findFirst({
      where: {
        active: true,
        role,
        username: normalizeUsername(username),
        password: String(password ?? ""),
      },
    })

    if (!employee) {
      return res.status(401).json({ error: "Usuario, senha ou perfil incorreto." })
    }

    res.json({ employee: serializeEmployee(employee) })
  }),
)

app.get(
  "/api/products",
  asyncRoute(async (_req, res) => {
    const products = await prisma.product.findMany({ orderBy: { name: "asc" } })
    res.json({ products: products.map(serializeProduct) })
  }),
)

app.post(
  "/api/products",
  asyncRoute(async (req, res) => {
    const { name, price, category, goesToKitchen } = req.body
    const parsedPrice = toNumber(price)

    if (!String(name ?? "").trim()) {
      return badRequest(res, "Nome do produto e obrigatorio.")
    }

    if (parsedPrice === null || parsedPrice < 0) {
      return badRequest(res, "Preco invalido.")
    }

    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        price: parsedPrice,
        category: String(category ?? "").trim() || "Outros",
        available: true,
        goesToKitchen: goesToKitchen !== false,
      },
    })

    res.status(201).json({ product: serializeProduct(product) })
  }),
)

app.put(
  "/api/products/:id",
  asyncRoute(async (req, res) => {
    const { name, price, category, goesToKitchen } = req.body
    const parsedPrice = toNumber(price)

    if (!String(name ?? "").trim()) return badRequest(res, "Nome do produto e obrigatorio.")
    if (parsedPrice === null || parsedPrice < 0) return badRequest(res, "Preco invalido.")

    const existing = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!existing) return notFound(res, "Produto nao encontrado.")

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: String(name).trim(),
        price: parsedPrice,
        category: String(category ?? "").trim() || "Outros",
        goesToKitchen: Boolean(goesToKitchen),
      },
    })

    res.json({ product: serializeProduct(product) })
  }),
)

app.patch(
  "/api/products/:id/availability",
  asyncRoute(async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!product) return notFound(res, "Produto nao encontrado.")

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        available:
          typeof req.body?.available === "boolean" ? req.body.available : !product.available,
      },
    })

    res.json({ product: serializeProduct(updated) })
  }),
)

app.patch(
  "/api/products/:id/kitchen-flow",
  asyncRoute(async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!product) return notFound(res, "Produto nao encontrado.")

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        goesToKitchen:
          typeof req.body?.goesToKitchen === "boolean"
            ? req.body.goesToKitchen
            : !product.goesToKitchen,
      },
    })

    res.json({ product: serializeProduct(updated) })
  }),
)

app.delete(
  "/api/products/:id",
  asyncRoute(async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!product) return notFound(res, "Produto nao encontrado.")

    const usedCount = await prisma.orderItem.count({ where: { productId: product.id } })
    if (usedCount > 0) {
      return badRequest(res, "Produto ja foi usado em comandas e nao pode ser removido.")
    }

    await prisma.product.delete({ where: { id: product.id } })
    res.json({ product: serializeProduct(product) })
  }),
)

app.get(
  "/api/employees",
  asyncRoute(async (_req, res) => {
    const employees = await prisma.employee.findMany({ orderBy: { createdAt: "asc" } })
    res.json({ employees: employees.map(serializeEmployee) })
  }),
)

app.post(
  "/api/employees",
  asyncRoute(async (req, res) => {
    const { name, username, password, role } = req.body
    const cleanUsername = normalizeUsername(username)

    if (!String(name ?? "").trim() || !cleanUsername || !String(password ?? "")) {
      return badRequest(res, "Nome, usuario e senha sao obrigatorios.")
    }

    if (!roles.includes(role)) return badRequest(res, "Perfil invalido.")

    const duplicated = await prisma.employee.findUnique({ where: { username: cleanUsername } })
    if (duplicated) return badRequest(res, "Usuario ja cadastrado.")

    const employee = await prisma.employee.create({
      data: {
        name: String(name).trim(),
        username: cleanUsername,
        password: String(password),
        role,
        active: true,
      },
    })

    res.status(201).json({ employee: serializeEmployee(employee) })
  }),
)

app.put(
  "/api/employees/:id",
  asyncRoute(async (req, res) => {
    const employee = await prisma.employee.findUnique({ where: { id: req.params.id } })
    const { name, username, password, role, active } = req.body
    const cleanUsername = normalizeUsername(username)

    if (!employee) return notFound(res, "Funcionario nao encontrado.")

    if (!String(name ?? "").trim() || !cleanUsername) {
      return badRequest(res, "Nome e usuario sao obrigatorios.")
    }

    if (!roles.includes(role)) return badRequest(res, "Perfil invalido.")

    const duplicated = await prisma.employee.findFirst({
      where: { id: { not: employee.id }, username: cleanUsername },
    })
    if (duplicated) return badRequest(res, "Usuario ja cadastrado.")

    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        name: String(name).trim(),
        username: cleanUsername,
        password: String(password ?? "") ? String(password) : employee.password,
        role,
        active: Boolean(active),
      },
    })

    res.json({ employee: serializeEmployee(updated) })
  }),
)

app.patch(
  "/api/employees/:id/active",
  asyncRoute(async (req, res) => {
    const employee = await prisma.employee.findUnique({ where: { id: req.params.id } })
    if (!employee) return notFound(res, "Funcionario nao encontrado.")

    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        active: typeof req.body?.active === "boolean" ? req.body.active : !employee.active,
      },
    })

    res.json({ employee: serializeEmployee(updated) })
  }),
)

app.delete(
  "/api/employees/:id",
  asyncRoute(async (req, res) => {
    const employee = await prisma.employee.findUnique({ where: { id: req.params.id } })
    if (!employee) return notFound(res, "Funcionario nao encontrado.")

    await prisma.employee.delete({ where: { id: employee.id } })
    res.json({ employee: serializeEmployee(employee) })
  }),
)

app.get(
  "/api/comandas",
  asyncRoute(async (_req, res) => {
    const comandas = await prisma.comanda.findMany({
      include: comandaInclude(),
      orderBy: { createdAt: "desc" },
    })
    res.json({ comandas: comandas.map(serializeComanda) })
  }),
)

app.post(
  "/api/comandas",
  asyncRoute(async (req, res) => {
    const { table, customer, waiter } = req.body

    if (!String(table ?? "").trim()) return badRequest(res, "Mesa e obrigatoria.")

    const waiterEmployee = await findEmployeeByName(waiter)
    const comanda = await prisma.comanda.create({
      data: {
        table: String(table).trim(),
        customer: String(customer ?? "").trim() || null,
        waiterName: String(waiter ?? "").trim() || "Garcom",
        waiterId: waiterEmployee?.id,
        open: true,
      },
      include: comandaInclude(),
    })

    res.status(201).json({ comanda: serializeComanda(comanda) })
  }),
)

app.post(
  "/api/comandas/:id/items",
  asyncRoute(async (req, res) => {
    const comanda = await findComanda(req.params.id)
    const { productId, qty, waiter } = req.body
    const quantity = toNumber(qty)

    if (!comanda) return notFound(res, "Comanda nao encontrada.")
    if (!comanda.open) return badRequest(res, "Comanda fechada.")

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return notFound(res, "Produto nao encontrado.")
    if (!product.available) return badRequest(res, "Produto indisponivel.")
    if (quantity === null || quantity < 1 || !Number.isInteger(quantity)) {
      return badRequest(res, "Quantidade invalida.")
    }

    const existing = await prisma.orderItem.findFirst({
      where: { comandaId: comanda.id, productId: product.id, sentToKitchen: false },
    })

    let item
    if (existing) {
      item = await prisma.orderItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + quantity },
      })
    } else {
      const waiterEmployee = await findEmployeeByName(waiter)
      item = await prisma.orderItem.create({
        data: {
          comandaId: comanda.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: quantity,
          status: "pendente",
          sentToKitchen: false,
          waiterName: String(waiter ?? "").trim() || comanda.waiterName,
          waiterId: waiterEmployee?.id,
        },
      })
    }

    const updatedComanda = await findComanda(comanda.id)
    res.status(existing ? 200 : 201).json({
      comanda: serializeComanda(updatedComanda),
      item: serializeItem(item),
    })
  }),
)

app.delete(
  "/api/comandas/:id/items/:itemId",
  asyncRoute(async (req, res) => {
    const comanda = await findComanda(req.params.id)
    if (!comanda) return notFound(res, "Comanda nao encontrada.")

    const item = await prisma.orderItem.findFirst({
      where: { id: req.params.itemId, comandaId: comanda.id },
    })
    if (!item) return notFound(res, "Item nao encontrado.")
    if (item.sentToKitchen) return badRequest(res, "Item ja enviado para preparo.")

    await prisma.orderItem.delete({ where: { id: item.id } })
    const updatedComanda = await findComanda(comanda.id)
    res.json({ comanda: serializeComanda(updatedComanda), item: serializeItem(item) })
  }),
)

app.post(
  "/api/comandas/:id/send-to-kitchen",
  asyncRoute(async (req, res) => {
    const comanda = await findComanda(req.params.id)
    if (!comanda) return notFound(res, "Comanda nao encontrada.")
    if (!comanda.open) return badRequest(res, "Comanda fechada.")

    const kitchenProductIds = new Set(
      (await prisma.product.findMany({ where: { goesToKitchen: true }, select: { id: true } })).map(
        (product) => product.id,
      ),
    )

    const itemIds = comanda.items
      .filter((item) => kitchenProductIds.has(item.productId) && !item.sentToKitchen)
      .map((item) => item.id)

    if (itemIds.length > 0) {
      await prisma.orderItem.updateMany({
        where: { id: { in: itemIds } },
        data: { sentToKitchen: true },
      })
    }

    const updatedComanda = await findComanda(comanda.id)
    res.json({ comanda: serializeComanda(updatedComanda) })
  }),
)

app.patch(
  "/api/comandas/:id/items/:itemId/status",
  asyncRoute(async (req, res) => {
    const comanda = await findComanda(req.params.id)
    const { status } = req.body

    if (!comanda) return notFound(res, "Comanda nao encontrada.")
    if (!itemStatuses.includes(status)) return badRequest(res, "Status invalido.")

    const item = await prisma.orderItem.findFirst({
      where: { id: req.params.itemId, comandaId: comanda.id },
      include: { product: true },
    })
    if (!item) return notFound(res, "Item nao encontrado.")
    if (!item.product.goesToKitchen) return badRequest(res, "Item nao pertence ao fluxo da cozinha.")
    if (!item.sentToKitchen) return badRequest(res, "Item ainda nao foi enviado para preparo.")

    const updatedItem = await prisma.orderItem.update({
      where: { id: item.id },
      data: { status },
    })
    const updatedComanda = await findComanda(comanda.id)
    res.json({ comanda: serializeComanda(updatedComanda), item: serializeItem(updatedItem) })
  }),
)

app.post(
  "/api/comandas/:id/payments",
  asyncRoute(async (req, res) => {
    const comanda = await findComanda(req.params.id)
    const { type, amount } = req.body
    const parsedAmount = toNumber(amount)

    if (!comanda) return notFound(res, "Comanda nao encontrada.")
    if (!comanda.open) return badRequest(res, "Comanda fechada.")
    if (!paymentTypes.includes(type)) return badRequest(res, "Tipo de pagamento invalido.")
    if (parsedAmount === null || parsedAmount <= 0) return badRequest(res, "Valor invalido.")

    const payment = await prisma.payment.create({
      data: {
        comandaId: comanda.id,
        type,
        amount: parsedAmount,
      },
    })

    const updatedComanda = await findComanda(comanda.id)
    res.status(201).json({
      comanda: serializeComanda(updatedComanda),
      payment: serializePayment(payment),
    })
  }),
)

app.post(
  "/api/comandas/:id/close",
  asyncRoute(async (req, res) => {
    const comanda = await prisma.comanda.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { product: true }, orderBy: { createdAt: "asc" } },
        payments: { orderBy: { createdAt: "asc" } },
      },
    })

    if (!comanda) return notFound(res, "Comanda nao encontrada.")
    if (!comanda.open) return badRequest(res, "Comanda ja esta fechada.")

    const total = comanda.items.reduce((sum, item) => sum + Number(item.price) * item.qty, 0)
    const paid = comanda.payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
    const pendingKitchenItems = comanda.items.filter(
      (item) => item.sentToKitchen && item.product?.goesToKitchen && item.status !== "entregue",
    )

    if (paid + 0.009 < total) {
      return badRequest(res, "Comanda ainda possui saldo em aberto.")
    }

    if (pendingKitchenItems.length > 0) {
      return badRequest(res, "Existem itens da cozinha que ainda nao foram entregues.")
    }

    const updated = await prisma.comanda.update({
      where: { id: comanda.id },
      data: { open: false, closedAt: new Date() },
      include: comandaInclude(),
    })

    res.json({ comanda: serializeComanda(updated) })
  }),
)

app.use((req, res) => {
  res.status(404).json({ error: `Rota ${req.method} ${req.path} nao encontrada.` })
})

app.use((error, _req, res, next) => {
  void next
  console.error(error)

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return badRequest(res, "Registro duplicado.")
  }

  res.status(500).json({ error: "Erro interno da API." })
})

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`API rodando em http://localhost:${port}`)
})

process.on("SIGTERM", () => {
  server.close(() => process.exit(0))
})
