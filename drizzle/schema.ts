import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  date,
  json,
  datetime,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Brinquedos (Toys) - Catálogo de brinquedos disponíveis para aluguel
 */
export const toys = mysqlTable("toys", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  photoUrl: varchar("photoUrl", { length: 500 }),
  photoKey: varchar("photoKey", { length: 255 }),
  lengthCm: varchar("lengthCm", { length: 10 }),
  widthCm: varchar("widthCm", { length: 10 }),
  heightCm: varchar("heightCm", { length: 10 }),
  quantityAvailable: int("quantityAvailable").default(0).notNull(),
  dailyRentalPrice: decimal("dailyRentalPrice", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  isUnderMaintenance: boolean("isUnderMaintenance").default(false).notNull(),
  maintenanceNotes: text("maintenanceNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Toy = typeof toys.$inferSelect;
export type InsertToy = typeof toys.$inferInsert;

/**
 * Clientes (Clients) - Dados dos clientes
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default(0).notNull(),
  totalReservations: varchar("totalReservations", { length: 10 }).default("0").notNull(),
  firstRentalDate: date("firstRentalDate"),
  lastRentalDate: date("lastRentalDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Reservas (Reservations) - Agendamentos de aluguel
 */
export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  eventDate: date("eventDate").notNull(),
  eventTime: varchar("eventTime", { length: 5 }),
  eventAddress: text("eventAddress"),
  eventCity: varchar("eventCity", { length: 100 }),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default(0).notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  depositAmount: decimal("depositAmount", { precision: 12, scale: 2 }).default(0).notNull(),
  remainingAmount: decimal("remainingAmount", { precision: 12, scale: 2 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "partial", "paid"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

/**
 * Itens de Reserva (Reservation Items) - Brinquedos inclusos em cada reserva
 */
export const reservationItems = mysqlTable("reservation_items", {
  id: int("id").autoincrement().primaryKey(),
  reservationId: int("reservationId").notNull(),
  toyId: int("toyId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  dailyPrice: decimal("dailyPrice", { precision: 10, scale: 2 }).notNull(),
  rentalDays: varchar("rentalDays", { length: 10 }).default("1").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReservationItem = typeof reservationItems.$inferSelect;
export type InsertReservationItem = typeof reservationItems.$inferInsert;

/**
 * Orçamentos (Budgets/Quotes) - Propostas de aluguel
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  reservationId: int("reservationId"),
  budgetNumber: varchar("budgetNumber", { length: 50 }).unique().notNull(),
  status: mysqlEnum("status", ["draft", "sent", "accepted", "rejected", "expired"]).default("draft").notNull(),
  eventDate: date("eventDate").notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default(0).notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  validUntil: date("validUntil"),
  items: json("items"),
  notes: text("notes"),
  sentViaWhatsapp: boolean("sentViaWhatsapp").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

/**
 * Contratos (Contracts) - Documentos digitais com assinatura
 */
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  reservationId: int("reservationId").notNull(),
  clientId: int("clientId").notNull(),
  contractNumber: varchar("contractNumber", { length: 50 }).unique().notNull(),
  status: mysqlEnum("status", ["draft", "sent", "signed", "cancelled"]).default("draft").notNull(),
  signatureLink: varchar("signatureLink", { length: 500 }),
  clientSignatureDate: timestamp("clientSignatureDate"),
  clientSignatureName: varchar("clientSignatureName", { length: 255 }),
  terms: text("terms"),
  notes: text("notes"),
  sentViaWhatsapp: boolean("sentViaWhatsapp").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

/**
 * Receitas (Income) - Registro de receitas
 */
export const income = mysqlTable("income", {
  id: int("id").autoincrement().primaryKey(),
  reservationId: int("reservationId"),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  incomeDate: date("incomeDate").notNull(),
  category: varchar("category", { length: 100 }),
  status: mysqlEnum("status", ["pending", "received"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Income = typeof income.$inferSelect;
export type InsertIncome = typeof income.$inferInsert;

/**
 * Despesas (Expenses) - Registro de despesas
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  expenseDate: date("expenseDate").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * Manutenção (Maintenance) - Registro de manutenção de brinquedos
 */
export const maintenance = mysqlTable("maintenance", {
  id: int("id").autoincrement().primaryKey(),
  toyId: int("toyId").notNull(),
  startDate: date("startDate").notNull(),
  expectedEndDate: date("expectedEndDate"),
  actualEndDate: date("actualEndDate"),
  reason: varchar("reason", { length: 255 }).notNull(),
  description: text("description"),
  cost: decimal("cost", { precision: 10, scale: 2 }).default(0).notNull(),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Maintenance = typeof maintenance.$inferSelect;
export type InsertMaintenance = typeof maintenance.$inferInsert;

/**
 * Configurações da Empresa (Company Settings)
 */
export const companySettings = mysqlTable("company_settings", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  ownerName: varchar("ownerName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  address: text("address"),
  logoUrl: varchar("logoUrl", { length: 500 }),
  logoKey: varchar("logoKey", { length: 255 }),
  website: varchar("website", { length: 255 }),
  taxId: varchar("taxId", { length: 50 }),
  bankAccount: varchar("bankAccount", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = typeof companySettings.$inferInsert;

/**
 * Solicitações de Orçamento (Budget Requests) - Solicitações de clientes via catálogo
 */
export const budgetRequests = mysqlTable("budget_requests", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientWhatsapp: varchar("clientWhatsapp", { length: 20 }).notNull(),
  eventDate: date("eventDate").notNull(),
  eventEndDate: date("eventEndDate"),
  location: text("location"),
  selectedToys: json("selectedToys").notNull(),
  totalEstimatedValue: decimal("totalEstimatedValue", { precision: 10, scale: 2 }),
  additionalNotes: text("additionalNotes"),
  status: mysqlEnum("status", ["pending", "contacted", "quoted", "accepted", "rejected", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BudgetRequest = typeof budgetRequests.$inferSelect;
export type InsertBudgetRequest = typeof budgetRequests.$inferInsert;
