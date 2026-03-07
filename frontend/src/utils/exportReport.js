import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Format currency for display
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// Format date for display
const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

// Build table rows from transactions
const buildRows = (transactions) =>
    transactions.map((t, i) => [
        i + 1,
        fmtDate(t.date),
        t.title,
        t.type === "income" ? "Income" : "Expense",
        t.category,
        fmt(t.amount),
    ]);

const HEADERS = ["#", "Date", "Title", "Type", "Category", "Amount"];

// ─── PDF Export ───────────────────────────────────
export function exportPDF(transactions) {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("Expense Tracker — Transaction Report", 14, 20);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, 14, 28);

    // Summary
    const income = transactions
        .filter((t) => t.type === "income")
        .reduce((a, b) => a + Number(b.amount), 0);
    const expense = transactions
        .filter((t) => t.type === "expense")
        .reduce((a, b) => a + Number(b.amount), 0);

    doc.setFontSize(11);
    doc.setTextColor(40);
    doc.text(`Total Income: ${fmt(income)}`, 14, 38);
    doc.text(`Total Expense: ${fmt(expense)}`, 14, 45);
    doc.text(`Balance: ${fmt(income - expense)}`, 14, 52);

    // Table
    doc.autoTable({
        startY: 60,
        head: [HEADERS],
        body: buildRows(transactions),
        theme: "striped",
        headStyles: {
            fillColor: [99, 102, 241],
            textColor: 255,
            fontStyle: "bold",
        },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 10 },
            5: { halign: "right" },
        },
    });

    doc.save("expense-report.pdf");
}

// ─── Excel Export ─────────────────────────────────
export function exportExcel(transactions) {
    const data = transactions.map((t, i) => ({
        "#": i + 1,
        Date: fmtDate(t.date),
        Title: t.title,
        Type: t.type === "income" ? "Income" : "Expense",
        Category: t.category,
        Amount: Number(t.amount),
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws["!cols"] = [
        { wch: 5 },
        { wch: 14 },
        { wch: 25 },
        { wch: 10 },
        { wch: 14 },
        { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "expense-report.xlsx");
}

// ─── CSV Export ───────────────────────────────────
export function exportCSV(transactions) {
    const rows = [HEADERS.join(",")];

    transactions.forEach((t, i) => {
        rows.push(
            [
                i + 1,
                `"${fmtDate(t.date)}"`,
                `"${t.title}"`,
                t.type === "income" ? "Income" : "Expense",
                t.category,
                t.amount,
            ].join(",")
        );
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expense-report.csv";
    link.click();
    URL.revokeObjectURL(url);
}
