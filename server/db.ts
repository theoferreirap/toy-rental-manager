import { eq, and, gte, lte, desc, asc, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  toys,
  clients,
  reservations,
  reservationItems,
  budgets,
  contracts,
  income,
  expenses,
  maintenance,
  companySettings,
  budgetRequests,
  InsertBudgetRequest,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== TOYS =====
export async function getAllToys() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(toys).orderBy(asc(toys.name));
}

export async function getToyById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(toys).where(eq(toys.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createToy(toy: typeof toys.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(toys).values(toy);
  return result;
}

export async function updateToy(id: number, toy: Partial<typeof toys.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(toys).set(toy).where(eq(toys.id, id));
}

export async function deleteToy(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(toys).where(eq(toys.id, id));
}

// ===== CLIENTS =====
export async function getAllClients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).orderBy(asc(clients.name));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function searchClients(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(clients)
    .where(like(clients.name, `%${query}%`))
    .orderBy(asc(clients.name));
}

export async function createClient(client: typeof clients.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(client);
  return result;
}

export async function updateClient(id: number, client: Partial<typeof clients.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(clients).set(client).where(eq(clients.id, id));
}

// ===== RESERVATIONS =====
export async function getAllReservations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reservations).orderBy(desc(reservations.createdAt));
}

export async function getReservationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getReservationsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(reservations)
    .where(eq(reservations.clientId, clientId))
    .orderBy(desc(reservations.eventDate));
}

export async function getReservationsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(reservations)
    .where(and(gte(reservations.eventDate, startDate), lte(reservations.eventDate, endDate)))
    .orderBy(asc(reservations.eventDate));
}

export async function createReservation(reservation: typeof reservations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reservations).values(reservation);
  return result;
}

export async function updateReservation(
  id: number,
  reservation: Partial<typeof reservations.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(reservations).set(reservation).where(eq(reservations.id, id));
}

// ===== RESERVATION ITEMS =====
export async function getReservationItems(reservationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(reservationItems)
    .where(eq(reservationItems.reservationId, reservationId));
}

export async function createReservationItem(item: typeof reservationItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(reservationItems).values(item);
}

export async function deleteReservationItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(reservationItems).where(eq(reservationItems.id, id));
}

// ===== BUDGETS =====
export async function getAllBudgets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(budgets).orderBy(desc(budgets.createdAt));
}

export async function getBudgetById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(budgets).where(eq(budgets.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createBudget(budget: typeof budgets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(budgets).values(budget);
}

export async function updateBudget(id: number, budget: Partial<typeof budgets.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(budgets).set(budget).where(eq(budgets.id, id));
}

// ===== CONTRACTS =====
export async function getAllContracts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contracts).orderBy(desc(contracts.createdAt));
}

export async function getContractById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createContract(contract: typeof contracts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(contracts).values(contract);
}

export async function updateContract(id: number, contract: Partial<typeof contracts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(contracts).set(contract).where(eq(contracts.id, id));
}

// ===== INCOME =====
export async function getAllIncome() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(income).orderBy(desc(income.incomeDate));
}

export async function getIncomeByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(income)
    .where(and(gte(income.incomeDate, startDate), lte(income.incomeDate, endDate)))
    .orderBy(desc(income.incomeDate));
}

export async function createIncome(inc: typeof income.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(income).values(inc);
}

// ===== EXPENSES =====
export async function getAllExpenses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).orderBy(desc(expenses.expenseDate));
}

export async function getExpensesByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(expenses)
    .where(and(gte(expenses.expenseDate, startDate), lte(expenses.expenseDate, endDate)))
    .orderBy(desc(expenses.expenseDate));
}

export async function createExpense(exp: typeof expenses.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(expenses).values(exp);
}

// ===== MAINTENANCE =====
export async function getAllMaintenance() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(maintenance).orderBy(desc(maintenance.startDate));
}

export async function getMaintenanceByToyId(toyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(maintenance)
    .where(eq(maintenance.toyId, toyId))
    .orderBy(desc(maintenance.startDate));
}

export async function createMaintenance(maint: typeof maintenance.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(maintenance).values(maint);
}

export async function updateMaintenance(
  id: number,
  maint: Partial<typeof maintenance.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(maintenance).set(maint).where(eq(maintenance.id, id));
}

// ===== COMPANY SETTINGS =====
export async function getCompanySettings() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(companySettings).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateCompanySettings(
  settings: Partial<typeof companySettings.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getCompanySettings();
  if (existing) {
    return db.update(companySettings).set(settings).where(eq(companySettings.id, existing.id));
  } else {
    return db.insert(companySettings).values(settings as typeof companySettings.$inferInsert);
  }
}

// ===== BUDGET REQUESTS =====
export async function getAllBudgetRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(budgetRequests).orderBy(desc(budgetRequests.createdAt));
}

export async function getBudgetRequestById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(budgetRequests).where(eq(budgetRequests.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getBudgetRequestsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(budgetRequests)
    .where(eq(budgetRequests.status, status as any))
    .orderBy(desc(budgetRequests.createdAt));
}

export async function createBudgetRequest(request: InsertBudgetRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(budgetRequests).values(request);
}

export async function updateBudgetRequest(id: number, request: Partial<InsertBudgetRequest>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(budgetRequests).set(request).where(eq(budgetRequests.id, id));
}

export async function deleteBudgetRequest(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(budgetRequests).where(eq(budgetRequests.id, id));
}
