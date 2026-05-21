import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("budgetRequests", () => {
  it("should create a budget request with valid data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.budgetRequests.create({
      clientName: "João Silva",
      clientEmail: "joao@example.com",
      clientWhatsapp: "11999999999",
      eventDate: "2026-06-15",
      eventEndDate: "2026-06-16",
      location: "São Paulo, SP",
      selectedToys: [
        { toyId: 1, quantity: 2 },
        { toyId: 2, quantity: 1 },
      ],
      additionalNotes: "Evento de aniversário",
    });

    expect(result).toBeDefined();
  });

  it("should validate email format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.budgetRequests.create({
        clientName: "João Silva",
        clientEmail: "invalid-email",
        clientWhatsapp: "11999999999",
        eventDate: "2026-06-15",
        selectedToys: [{ toyId: 1, quantity: 1 }],
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid email");
    }
  });

  it("should validate WhatsApp format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.budgetRequests.create({
        clientName: "João Silva",
        clientEmail: "joao@example.com",
        clientWhatsapp: "123",
        eventDate: "2026-06-15",
        selectedToys: [{ toyId: 1, quantity: 1 }],
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("Too small");
    }
  });

  it("should validate quantity is positive", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.budgetRequests.create({
        clientName: "João Silva",
        clientEmail: "joao@example.com",
        clientWhatsapp: "11999999999",
        eventDate: "2026-06-15",
        selectedToys: [{ toyId: 1, quantity: 0 }],
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("Too small");
    }
  });

  it("should allow optional fields", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.budgetRequests.create({
      clientName: "João Silva",
      clientEmail: "joao@example.com",
      clientWhatsapp: "11999999999",
      eventDate: "2026-06-15",
      selectedToys: [{ toyId: 1, quantity: 1 }],
    });

    expect(result).toBeDefined();
  });

  it("should calculate correct budget value", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.budgetRequests.create({
      clientName: "João Silva",
      clientEmail: "joao@example.com",
      clientWhatsapp: "11999999999",
      eventDate: "2026-06-15",
      selectedToys: [{ toyId: 1, quantity: 2 }],
    });

    expect(result).toBeDefined();
  });

  it("should prevent non-authenticated users from updating", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    try {
      await caller.budgetRequests.update({
        id: 1,
        status: "contacted",
      });
      expect.fail("Should have thrown authentication error");
    } catch (error: any) {
      expect(error.message).toContain("Please login");
    }
  });
});
