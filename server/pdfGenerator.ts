import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface BudgetData {
  clientName: string;
  clientEmail: string;
  clientWhatsapp: string;
  eventDate: string;
  eventEndDate?: string;
  location?: string;
  selectedToys: Array<{ toyId: number; quantity: number; toyName?: string; price?: number }>;
  totalEstimatedValue: string;
  additionalNotes?: string;
  companyName?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
}

export async function generateBudgetPDF(data: BudgetData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text(data.companyName || "Toy Rental Manager", 50, 50);
    doc.fontSize(10).font("Helvetica").text(data.companyAddress || "", 50, 80);
    doc.text(`Tel: ${data.companyPhone || ""}`, 50, 95);
    doc.text(`Email: ${data.companyEmail || ""}`, 50, 110);

    // Divider
    doc.moveTo(50, 130).lineTo(545, 130).stroke();

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text("ORÇAMENTO", 50, 150);

    // Client Info
    doc.fontSize(11).font("Helvetica-Bold").text("Dados do Cliente:", 50, 180);
    doc.fontSize(10).font("Helvetica").text(`Nome: ${data.clientName}`, 50, 200);
    doc.text(`Email: ${data.clientEmail}`, 50, 215);
    doc.text(`WhatsApp: ${data.clientWhatsapp}`, 50, 230);

    // Event Info
    doc.fontSize(11).font("Helvetica-Bold").text("Dados do Evento:", 50, 260);
    const eventDate = new Date(data.eventDate).toLocaleDateString("pt-BR");
    const eventEndDate = data.eventEndDate
      ? new Date(data.eventEndDate).toLocaleDateString("pt-BR")
      : "";
    doc.fontSize(10).font("Helvetica").text(
      `Data: ${eventDate}${eventEndDate ? ` até ${eventEndDate}` : ""}`,
      50,
      280
    );
    if (data.location) {
      doc.text(`Local: ${data.location}`, 50, 295);
    }

    // Items Table
    const tableTop = data.location ? 330 : 315;
    doc.fontSize(11).font("Helvetica-Bold").text("Brinquedos Selecionados:", 50, tableTop);

    const itemsTop = tableTop + 25;
    const colX = [50, 250, 350, 450];
    const rowHeight = 25;

    // Table header
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Brinquedo", colX[0], itemsTop);
    doc.text("Quantidade", colX[1], itemsTop);
    doc.text("Valor Unit.", colX[2], itemsTop);
    doc.text("Subtotal", colX[3], itemsTop);

    // Divider
    doc.moveTo(50, itemsTop + 15).lineTo(545, itemsTop + 15).stroke();

    // Table rows
    doc.fontSize(9).font("Helvetica");
    let currentY = itemsTop + 20;
    let totalValue = 0;

    data.selectedToys.forEach((toy) => {
      const toyName = toy.toyName || `Brinquedo #${toy.toyId}`;
      const price = toy.price || 0;
      const subtotal = price * toy.quantity;
      totalValue += subtotal;

      doc.text(toyName, colX[0], currentY, { width: 180 });
      doc.text(toy.quantity.toString(), colX[1], currentY);
      doc.text(`R$ ${price.toFixed(2)}`, colX[2], currentY);
      doc.text(`R$ ${subtotal.toFixed(2)}`, colX[3], currentY);

      currentY += rowHeight;
    });

    // Divider
    doc.moveTo(50, currentY).lineTo(545, currentY).stroke();

    // Total
    currentY += 10;
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("VALOR TOTAL:", colX[2], currentY);
    doc.text(`R$ ${parseFloat(data.totalEstimatedValue).toFixed(2)}`, colX[3], currentY);

    // Additional notes
    if (data.additionalNotes) {
      doc.fontSize(10).font("Helvetica-Bold").text("Observações:", 50, currentY + 40);
      doc.fontSize(9).font("Helvetica").text(data.additionalNotes, 50, currentY + 60, {
        width: 495,
      });
    }

    // Footer
    const footerY = doc.page.height - 50;
    doc.fontSize(8).font("Helvetica").text("Este orçamento é válido por 7 dias.", 50, footerY);
    doc.text("Para mais informações, entre em contato conosco.", 50, footerY + 15);

    doc.end();
  });
}

interface ContractData {
  clientName: string;
  clientEmail: string;
  clientWhatsapp: string;
  eventDate: string;
  eventEndDate?: string;
  location?: string;
  selectedToys: Array<{ toyId: number; quantity: number; toyName?: string }>;
  totalValue: string;
  terms?: string;
  companyName?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
}

export async function generateContractPDF(data: ContractData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20).font("Helvetica-Bold").text("CONTRATO DE ALUGUEL", 50, 50);

    // Company info
    doc.fontSize(10).font("Helvetica").text(`${data.companyName || "Toy Rental Manager"}`, 50, 80);
    doc.text(`${data.companyAddress || ""}`);
    doc.text(`Tel: ${data.companyPhone || ""} | Email: ${data.companyEmail || ""}`);

    // Divider
    doc.moveTo(50, 130).lineTo(545, 130).stroke();

    // Contract details
    doc.fontSize(11).font("Helvetica-Bold").text("1. PARTES CONTRATANTES", 50, 150);
    doc.fontSize(10).font("Helvetica").text(
      `Contratante: ${data.clientName} - ${data.clientEmail} - ${data.clientWhatsapp}`,
      50,
      170
    );

    // Event details
    doc.fontSize(11).font("Helvetica-Bold").text("2. OBJETO DO CONTRATO", 50, 210);
    const eventDate = new Date(data.eventDate).toLocaleDateString("pt-BR");
    const eventEndDate = data.eventEndDate
      ? new Date(data.eventEndDate).toLocaleDateString("pt-BR")
      : "";
    doc.fontSize(10).font("Helvetica").text(
      `Aluguel de brinquedos para evento em ${data.location || "local a definir"} no período de ${eventDate}${eventEndDate ? ` a ${eventEndDate}` : ""}`,
      50,
      230,
      { width: 495 }
    );

    // Items
    doc.fontSize(11).font("Helvetica-Bold").text("3. BRINQUEDOS ALUGADOS", 50, 280);
    let currentY = 300;

    data.selectedToys.forEach((toy, index) => {
      const toyName = toy.toyName || `Brinquedo #${toy.toyId}`;
      doc.fontSize(10).font("Helvetica").text(`${index + 1}. ${toyName} (${toy.quantity}x)`, 50, currentY);
      currentY += 20;
    });

    // Value
    doc.fontSize(11).font("Helvetica-Bold").text("4. VALOR DO CONTRATO", 50, currentY + 10);
    doc.fontSize(10).font("Helvetica").text(
      `Valor total: R$ ${parseFloat(data.totalValue).toFixed(2)}`,
      50,
      currentY + 30
    );

    // Terms
    if (data.terms) {
      doc.fontSize(11).font("Helvetica-Bold").text("5. TERMOS E CONDIÇÕES", 50, currentY + 60);
      doc.fontSize(9).font("Helvetica").text(data.terms, 50, currentY + 80, { width: 495 });
    }

    // Signature lines
    const signatureY = doc.page.height - 100;
    doc.moveTo(50, signatureY).lineTo(250, signatureY).stroke();
    doc.text("Assinatura do Cliente", 50, signatureY + 10, { width: 200, align: "center" });

    doc.moveTo(300, signatureY).lineTo(500, signatureY).stroke();
    doc.text("Assinatura da Empresa", 300, signatureY + 10, { width: 200, align: "center" });

    // Date
    doc.fontSize(9).font("Helvetica").text(`Data: ___/___/_____`, 50, doc.page.height - 30);

    doc.end();
  });
}
