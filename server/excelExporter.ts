import ExcelJS from "exceljs";

interface ReservationData {
  id: number;
  clientName: string;
  clientEmail: string;
  clientWhatsapp: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  status: string;
  totalValue: string;
  toys: Array<{ toyName: string; quantity: number }>;
  notes?: string;
}

export async function generateReservationsExcel(reservations: ReservationData[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Reservas");

  // Set column widths
  worksheet.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "Cliente", key: "clientName", width: 20 },
    { header: "Email", key: "email", width: 25 },
    { header: "WhatsApp", key: "whatsapp", width: 15 },
    { header: "Data Início", key: "startDate", width: 15 },
    { header: "Data Fim", key: "endDate", width: 15 },
    { header: "Local", key: "location", width: 20 },
    { header: "Status", key: "status", width: 12 },
    { header: "Valor Total", key: "totalValue", width: 12 },
    { header: "Brinquedos", key: "toys", width: 30 },
    { header: "Observações", key: "notes", width: 25 },
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "center", wrapText: true };

  // Add data rows
  reservations.forEach((reservation, index) => {
    const toysText = reservation.toys.map((t) => `${t.toyName} (${t.quantity}x)`).join(", ");

    const row = worksheet.addRow({
      id: reservation.id,
      clientName: reservation.clientName,
      email: reservation.clientEmail,
      whatsapp: reservation.clientWhatsapp,
      startDate: reservation.startDate.toLocaleDateString("pt-BR"),
      endDate: reservation.endDate.toLocaleDateString("pt-BR"),
      location: reservation.location || "-",
      status: getStatusLabel(reservation.status),
      totalValue: `R$ ${parseFloat(reservation.totalValue).toFixed(2)}`,
      toys: toysText,
      notes: reservation.notes || "-",
    });

    // Alternate row colors
    if (index % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F2F2" },
      };
    }

    // Center align some columns
    row.getCell("id").alignment = { horizontal: "center" };
    row.getCell("status").alignment = { horizontal: "center" };
    row.getCell("totalValue").alignment = { horizontal: "right" };
  });

  // Freeze header row
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;
}

interface ClientData {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  address?: string;
  totalSpent: string;
  reservationCount: number;
  lastReservation?: Date;
}

export async function generateClientsExcel(clients: ClientData[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Clientes");

  worksheet.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "Nome", key: "name", width: 20 },
    { header: "Email", key: "email", width: 25 },
    { header: "WhatsApp", key: "whatsapp", width: 15 },
    { header: "Endereço", key: "address", width: 30 },
    { header: "Total Gasto", key: "totalSpent", width: 15 },
    { header: "Reservas", key: "reservationCount", width: 10 },
    { header: "Última Reserva", key: "lastReservation", width: 15 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "center", wrapText: true };

  clients.forEach((client, index) => {
    const row = worksheet.addRow({
      id: client.id,
      name: client.name,
      email: client.email,
      whatsapp: client.whatsapp,
      address: client.address || "-",
      totalSpent: `R$ ${parseFloat(client.totalSpent).toFixed(2)}`,
      reservationCount: client.reservationCount,
      lastReservation: client.lastReservation
        ? client.lastReservation.toLocaleDateString("pt-BR")
        : "-",
    });

    if (index % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F2F2" },
      };
    }

    row.getCell("id").alignment = { horizontal: "center" };
    row.getCell("totalSpent").alignment = { horizontal: "right" };
    row.getCell("reservationCount").alignment = { horizontal: "center" };
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;
}

interface FinancialData {
  date: Date;
  type: "income" | "expense";
  description: string;
  category: string;
  amount: string;
  relatedReservation?: number;
}

export async function generateFinancialExcel(financialData: FinancialData[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Financeiro");

  worksheet.columns = [
    { header: "Data", key: "date", width: 12 },
    { header: "Tipo", key: "type", width: 10 },
    { header: "Descrição", key: "description", width: 25 },
    { header: "Categoria", key: "category", width: 15 },
    { header: "Valor", key: "amount", width: 12 },
    { header: "Reserva", key: "relatedReservation", width: 10 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "center", wrapText: true };

  financialData.forEach((item, index) => {
    const row = worksheet.addRow({
      date: item.date.toLocaleDateString("pt-BR"),
      type: item.type === "income" ? "Receita" : "Despesa",
      description: item.description,
      category: item.category,
      amount: `R$ ${parseFloat(item.amount).toFixed(2)}`,
      relatedReservation: item.relatedReservation || "-",
    });

    if (index % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F2F2" },
      };
    }

    const amountCell = row.getCell("amount");
    if (item.type === "income") {
      amountCell.font = { color: { argb: "FF008000" } };
    } else {
      amountCell.font = { color: { argb: "FFFF0000" } };
    }
    amountCell.alignment = { horizontal: "right" };
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;
}

function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Pendente",
    confirmed: "Confirmada",
    completed: "Concluída",
    cancelled: "Cancelada",
  };
  return statusMap[status] || status;
}
