import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { comandas, employees, products } from "../server/data.js"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.comanda.deleteMany()
  await prisma.product.deleteMany()
  await prisma.employee.deleteMany()

  for (const employee of employees) {
    await prisma.employee.create({
      data: {
        id: employee.id,
        name: employee.name,
        username: employee.username,
        password: employee.password,
        role: employee.role,
        active: employee.active,
        createdAt: new Date(employee.createdAt),
      },
    })
  }

  for (const product of products) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        available: product.available,
        goesToKitchen: product.goesToKitchen,
      },
    })
  }

  const defaultWaiter = await prisma.employee.findUnique({
    where: { username: "garcom" },
  })

  for (const comanda of comandas) {
    await prisma.comanda.create({
      data: {
        id: comanda.id,
        table: comanda.table,
        customer: comanda.customer,
        waiterName: comanda.waiter,
        waiterId: defaultWaiter?.id,
        open: comanda.open,
        createdAt: new Date(comanda.createdAt),
        closedAt: comanda.closedAt ? new Date(comanda.closedAt) : null,
        items: {
          create: comanda.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            qty: item.qty,
            status: item.status,
            sentToKitchen: item.sentToKitchen,
            waiterName: item.waiter,
            waiterId: defaultWaiter?.id,
            notes: item.notes,
          })),
        },
        payments: {
          create: comanda.payments.map((payment) => ({
            id: payment.id,
            type: payment.type,
            amount: payment.amount,
            createdAt: new Date(payment.createdAt),
          })),
        },
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
