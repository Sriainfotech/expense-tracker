import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { formatDate } from "@/lib/format";
import type { Expense } from "@/lib/types";

// jsPDF's built-in fonts don't include the ₹ glyph, so PDFs use "Rs." instead
// of the app's usual "₹" symbol.
function formatINRForPdf(amount: number): string {
  return "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
}

// Brand palette (approximated in RGB from the app's teal/navy theme).
const COLORS = {
  navy: [15, 32, 41] as [number, number, number],
  teal: [13, 148, 136] as [number, number, number],
  tealDark: [10, 110, 101] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  rowAlt: [240, 249, 248] as [number, number, number],
  border: [220, 226, 228] as [number, number, number],
  muted: [100, 116, 122] as [number, number, number],
};

export function exportExpensesToPdf({
  scopeLabel,
  totalInvestment,
  totalExpenses,
  remainingBalance,
  expenses,
  fileName = "expense-report.pdf",
}: {
  /** e.g. "Company-wide" or a specific user's name. */
  scopeLabel: string;
  totalInvestment: number;
  totalExpenses: number;
  remainingBalance: number;
  expenses: Expense[];
  fileName?: string;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  // ---- Header band ----
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 78, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Ledgerly", margin, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 220, 218);
  doc.text("Expense Report", margin, 52);

  doc.setFontSize(9);
  const generatedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Scope: ${scopeLabel}`, pageWidth - margin, 34, { align: "right" });
  doc.text(`Generated: ${generatedAt}`, pageWidth - margin, 50, { align: "right" });

  // ---- Summary cards ----
  const cardsTop = 100;
  const cardHeight = 58;
  const gap = 14;
  const cardWidth = (pageWidth - margin * 2 - gap * 2) / 3;

  const cards: { label: string; value: string; color: [number, number, number] }[] = [
    { label: "TOTAL INVESTMENT", value: formatINRForPdf(totalInvestment), color: COLORS.teal },
    { label: "TOTAL EXPENSES", value: formatINRForPdf(totalExpenses), color: COLORS.amber },
    {
      label: "REMAINING BALANCE",
      value: formatINRForPdf(remainingBalance),
      color: remainingBalance >= 0 ? COLORS.green : COLORS.red,
    },
  ];

  cards.forEach((card, i) => {
    const x = margin + i * (cardWidth + gap);

    doc.setFillColor(250, 250, 251);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(x, cardsTop, cardWidth, cardHeight, 6, 6, "FD");

    // Left accent bar in the card's tone.
    doc.setFillColor(...card.color);
    doc.roundedRect(x, cardsTop, 5, cardHeight, 2, 2, "F");

    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(card.label, x + 16, cardsTop + 20);

    doc.setTextColor(...card.color);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(card.value, x + 16, cardsTop + 42);
  });

  // ---- Expense table ----
  const tableTop = cardsTop + cardHeight + 26;

  autoTable(doc, {
    startY: tableTop,
    margin: { left: margin, right: margin },
    head: [["ID", "Category", "Description", "Amount", "Date", "Payment", "Status"]],
    body: expenses.map((exp) => [
      exp.id,
      exp.category,
      exp.description || "—",
      formatINRForPdf(exp.amount),
      formatDate(exp.date),
      exp.paymentMethod,
      exp.status,
    ]),
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 6,
      lineColor: COLORS.border,
      lineWidth: 0.5,
      textColor: [40, 48, 50],
    },
    headStyles: {
      fillColor: COLORS.tealDark,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: { fillColor: COLORS.rowAlt },
    columnStyles: {
      0: { cellWidth: 32 },
      3: { halign: "right", fontStyle: "bold" },
      6: { halign: "center" },
    },
    didParseCell: (data) => {
      // Color the Amount column like the app (amber for expense amounts).
      if (data.section === "body" && data.column.index === 3) {
        data.cell.styles.textColor = COLORS.amber;
      }
      // Color the Status column green/red like the app's StatusBadge.
      if (data.section === "body" && data.column.index === 6) {
        const isActive = String(data.cell.raw).toLowerCase() === "active";
        data.cell.styles.textColor = isActive ? COLORS.green : COLORS.red;
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      const pageNumber = doc.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.muted);
      doc.text(
        `Page ${pageNumber} of ${pageCount}`,
        pageWidth - margin,
        doc.internal.pageSize.getHeight() - 20,
        { align: "right" },
      );
      doc.text(
        "Ledgerly · Capital Control Platform",
        margin,
        doc.internal.pageSize.getHeight() - 20,
      );
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `${expenses.length} expense${expenses.length === 1 ? "" : "s"} listed · expenses are shared/company-wide`,
    margin,
    Math.min(finalY + 20, doc.internal.pageSize.getHeight() - 40),
  );

  doc.save(fileName);
}
