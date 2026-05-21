import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { generateBudgetPDF, generateContractPDF } from "./pdfGenerator";
import { generateReservationsExcel, generateClientsExcel, generateFinancialExcel } from "./excelExporter";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== TOYS =====
  toys: router({
    list: protectedProcedure.query(async () => {
      return db.getAllToys();
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getToyById(input.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          photoUrl: z.string().optional(),
          photoKey: z.string().optional(),
          lengthCm: z.number().optional(),
          widthCm: z.number().optional(),
          heightCm: z.number().optional(),
          quantityAvailable: z.number().default(0),
          dailyRentalPrice: z.string(),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createToy({
          name: input.name,
          description: input.description,
          photoUrl: input.photoUrl,
          photoKey: input.photoKey,
          lengthCm: input.lengthCm,
          widthCm: input.widthCm,
          heightCm: input.heightCm,
          quantityAvailable: input.quantityAvailable,
          dailyRentalPrice: input.dailyRentalPrice,
          category: input.category,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          photoUrl: z.string().optional(),
          photoKey: z.string().optional(),
          lengthCm: z.number().optional(),
          widthCm: z.number().optional(),
          heightCm: z.number().optional(),
          quantityAvailable: z.number().optional(),
          dailyRentalPrice: z.string().optional(),
          category: z.string().optional(),
          isUnderMaintenance: z.boolean().optional(),
          maintenanceNotes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return db.updateToy(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteToy(input.id);
      }),
  }),

  // ===== CLIENTS =====
  clients: router({
    list: protectedProcedure.query(async () => {
      return db.getAllClients();
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getClientById(input.id);
    }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return db.searchClients(input.query);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          whatsapp: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createClient(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          whatsapp: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return db.updateClient(id, updates);
      }),
  }),

  // ===== RESERVATIONS =====
  reservations: router({
    list: protectedProcedure.query(async () => {
      return db.getAllReservations();
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getReservationById(input.id);
    }),

    getByClientId: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return db.getReservationsByClientId(input.clientId);
      }),

    getByDateRange: protectedProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .query(async ({ input }) => {
        return db.getReservationsByDateRange(input.startDate, input.endDate);
      }),

    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          eventDate: z.date(),
          eventTime: z.string().optional(),
          eventAddress: z.string().optional(),
          eventCity: z.string().optional(),
          deliveryFee: z.string().default("0"),
          totalAmount: z.string(),
          depositAmount: z.string().default("0"),
          remainingAmount: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createReservation({
          clientId: input.clientId,
          eventDate: input.eventDate,
          eventTime: input.eventTime,
          eventAddress: input.eventAddress,
          eventCity: input.eventCity,
          deliveryFee: input.deliveryFee,
          totalAmount: input.totalAmount,
          depositAmount: input.depositAmount,
          remainingAmount: input.remainingAmount,
          status: "pending",
          paymentStatus: "pending",
          notes: input.notes,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
          paymentStatus: z.enum(["pending", "partial", "paid"]).optional(),
          depositAmount: z.string().optional(),
          remainingAmount: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return db.updateReservation(id, updates);
      }),
  }),

  // ===== BUDGETS =====
  budgets: router({
    list: protectedProcedure.query(async () => {
      return db.getAllBudgets();
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getBudgetById(input.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          budgetNumber: z.string(),
          eventDate: z.date(),
          deliveryFee: z.string().default("0"),
          totalAmount: z.string(),
          validUntil: z.date().optional(),
          items: z.any().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createBudget({
          clientId: input.clientId,
          budgetNumber: input.budgetNumber,
          eventDate: input.eventDate,
          deliveryFee: input.deliveryFee,
          totalAmount: input.totalAmount,
          validUntil: input.validUntil,
          items: input.items,
          status: "draft",
          notes: input.notes,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
          sentViaWhatsapp: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return db.updateBudget(id, updates);
      }),
  }),

  // ===== CONTRACTS =====
  contracts: router({
    list: protectedProcedure.query(async () => {
      return db.getAllContracts();
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getContractById(input.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          reservationId: z.number(),
          clientId: z.number(),
          contractNumber: z.string(),
          terms: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createContract({
          reservationId: input.reservationId,
          clientId: input.clientId,
          contractNumber: input.contractNumber,
          status: "draft",
          terms: input.terms,
          notes: input.notes,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["draft", "sent", "signed", "cancelled"]).optional(),
          sentViaWhatsapp: z.boolean().optional(),
          clientSignatureDate: z.date().optional(),
          clientSignatureName: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return db.updateContract(id, updates);
      }),
  }),

  // ===== FINANCIAL =====
  financial: router({
    getIncome: protectedProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .query(async ({ input }) => {
        return db.getIncomeByDateRange(input.startDate, input.endDate);
      }),

    getExpenses: protectedProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .query(async ({ input }) => {
        return db.getExpensesByDateRange(input.startDate, input.endDate);
      }),

    createIncome: protectedProcedure
      .input(
        z.object({
          reservationId: z.number().optional(),
          description: z.string(),
          amount: z.string(),
          incomeDate: z.date(),
          category: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createIncome({
          reservationId: input.reservationId,
          description: input.description,
          amount: input.amount,
          incomeDate: input.incomeDate,
          category: input.category,
          status: "pending",
          notes: input.notes,
        });
      }),

    createExpense: protectedProcedure
      .input(
        z.object({
          description: z.string(),
          amount: z.string(),
          expenseDate: z.date(),
          category: z.string(),
          paymentMethod: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createExpense(input);
      }),
  }),

  // ===== MAINTENANCE =====
  maintenance: router({
    list: protectedProcedure.query(async () => {
      return db.getAllMaintenance();
    }),

    getByToyId: protectedProcedure
      .input(z.object({ toyId: z.number() }))
      .query(async ({ input }) => {
        return db.getMaintenanceByToyId(input.toyId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          toyId: z.number(),
          startDate: z.date(),
          expectedEndDate: z.date().optional(),
          reason: z.string(),
          description: z.string().optional(),
          cost: z.string().default("0"),
        })
      )
      .mutation(async ({ input }) => {
        return db.createMaintenance({
          toyId: input.toyId,
          startDate: input.startDate,
          expectedEndDate: input.expectedEndDate,
          reason: input.reason,
          description: input.description,
          cost: input.cost,
          status: "scheduled",
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
          actualEndDate: z.date().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return db.updateMaintenance(id, updates);
      }),
  }),

  // ===== COMPANY SETTINGS =====
  companySettings: router({
    get: protectedProcedure.query(async () => {
      return db.getCompanySettings();
    }),

    update: protectedProcedure
      .input(
        z.object({
          companyName: z.string().optional(),
          ownerName: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          whatsapp: z.string().optional(),
          address: z.string().optional(),
          logoUrl: z.string().optional(),
          logoKey: z.string().optional(),
          website: z.string().optional(),
          taxId: z.string().optional(),
          bankAccount: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateCompanySettings(input);
      }),
  }),

  exports: router({
    reservationsExcel: protectedProcedure.query(async () => {
      const reservations = await db.getAllReservations();
      const toysData = await db.getAllToys();

      const reservationsWithToys = reservations.map((res) => {
        const toys = JSON.parse(res.selectedToys as string).map((toy: any) => {
          const toyData = toysData.find((t) => t.id === toy.toyId);
          return {
            toyName: toyData?.name || `Brinquedo #${toy.toyId}`,
            quantity: toy.quantity,
          };
        });

        return {
          id: res.id,
          clientName: "",
          clientEmail: "",
          clientWhatsapp: "",
          startDate: res.eventDate,
          endDate: res.eventDate,
          location: res.eventAddress || undefined,
          status: res.status,
          totalValue: "0",
          toys,
          notes: undefined,
        };
      });

      const buffer = await generateReservationsExcel(reservationsWithToys);
      return {
        buffer: buffer.toString("base64"),
        filename: `reservas_${Date.now()}.xlsx`,
      };
    }),

    clientsExcel: protectedProcedure.query(async () => {
      const clients = await db.getAllClients();
      const buffer = await generateClientsExcel(
        clients.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email || "",
          whatsapp: c.whatsapp || "",
          address: c.address || undefined,
          totalSpent: "0",
          reservationCount: 0,
          lastReservation: undefined,
        }))
      );
      return {
        buffer: buffer.toString("base64"),
        filename: `clientes_${Date.now()}.xlsx`,
      };
    }),

    financialExcel: protectedProcedure.query(async () => {
      const income = await db.getAllIncome();
      const expenses = await db.getAllExpenses();
      
      const financialData = [
        ...income.map((i) => ({
          date: i.incomeDate,
          type: "income" as const,
          description: i.description,
          category: i.category || "Receita",
          amount: i.amount,
          relatedReservation: i.reservationId || undefined,
        })),
        ...expenses.map((e) => ({
          date: e.expenseDate,
          type: "expense" as const,
          description: e.description,
          category: e.category || "Despesa",
          amount: e.amount,
          relatedReservation: undefined,
        })),
      ];
      
      const buffer = await generateFinancialExcel(financialData);
      return {
        buffer: buffer.toString("base64"),
        filename: `financeiro_${Date.now()}.xlsx`,
      };
    }),
  }),

  budgetRequests: router({
    list: protectedProcedure.query(async () => {
      return db.getAllBudgetRequests();
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getBudgetRequestById(input.id);
    }),

    getByStatus: protectedProcedure
      .input(z.object({ status: z.string() }))
      .query(async ({ input }) => {
        return db.getBudgetRequestsByStatus(input.status);
      }),

    create: publicProcedure
      .input(
        z.object({
          clientName: z.string().min(1),
          clientEmail: z.string().email(),
          clientWhatsapp: z.string().min(10),
          eventDate: z.string().transform((v) => new Date(v)),
          eventEndDate: z.string().transform((v) => new Date(v)).optional(),
          location: z.string().optional(),
          selectedToys: z.array(
            z.object({
              toyId: z.number(),
              quantity: z.number().min(1),
            })
          ),
          additionalNotes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const totalEstimatedValue = await calculateBudgetValue(input.selectedToys);
        return db.createBudgetRequest({
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientWhatsapp: input.clientWhatsapp,
          eventDate: input.eventDate,
          eventEndDate: input.eventEndDate,
          location: input.location,
          selectedToys: JSON.stringify(input.selectedToys),
          totalEstimatedValue: totalEstimatedValue.toString(),
          additionalNotes: input.additionalNotes,
          status: "pending",
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "contacted", "quoted", "accepted", "rejected", "cancelled"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateBudgetRequest(input.id, {
          status: input.status,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteBudgetRequest(input.id);
      }),

    generatePDF: protectedProcedure
      .input(
        z.object({
          id: z.number(),
        })
      )
      .query(async ({ input }) => {
        const budgetRequest = await db.getBudgetRequestById(input.id);
        if (!budgetRequest) {
          throw new Error("Solicitação de orçamento não encontrada");
        }

        const selectedToys = JSON.parse(budgetRequest.selectedToys as string);
        const toysWithDetails = await Promise.all(
          selectedToys.map(async (toy: any) => {
            const toyData = await db.getToyById(toy.toyId);
            return {
              ...toy,
              toyName: toyData?.name,
              price: parseFloat(toyData?.dailyRentalPrice || "0"),
            };
          })
        );

        const pdfBuffer = await generateBudgetPDF({
          clientName: budgetRequest.clientName,
          clientEmail: budgetRequest.clientEmail,
          clientWhatsapp: budgetRequest.clientWhatsapp,
          eventDate: budgetRequest.eventDate.toISOString(),
          eventEndDate: budgetRequest.eventEndDate?.toISOString(),
          location: budgetRequest.location || undefined,
          selectedToys: toysWithDetails,
          totalEstimatedValue: budgetRequest.totalEstimatedValue,
          additionalNotes: budgetRequest.additionalNotes || undefined,
        });

        return {
          buffer: pdfBuffer.toString("base64"),
          filename: `orcamento_${budgetRequest.id}_${Date.now()}.pdf`,
        };
      }),
  }),
});

async function calculateBudgetValue(
  selectedToys: Array<{ toyId: number; quantity: number }>
): Promise<number> {
  let total = 0;
  for (const item of selectedToys) {
    const toy = await db.getToyById(item.toyId);
    if (toy) {
      total += parseFloat(toy.dailyRentalPrice) * item.quantity;
    }
  }
  return total;
}

export type AppRouter = typeof appRouter;
