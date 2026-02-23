import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * TRIGGER 1: GENERATE PAYMENT RECEIPT
 */
export const downloadPDFReceipt = (data) => {
  const doc = new jsPDF();
  const themeColor = [37, 99, 235]; // Ayax Blue

  // Header Branded Bar
  doc.setFillColor(...themeColor);
  doc.rect(0, 0, 210, 40, "F");

  // Logo Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("AYAX ACADEMY", 20, 25);

  doc.setFontSize(10);
  doc.text("OFFICIAL PAYMENT RECEIPT", 140, 25);

  // Body
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text(`Student Name: ${data.name}`, 20, 60);
  doc.text(`Reference: ${data.ref}`, 20, 70);
  doc.text(`Amount Paid: ${data.amount}`, 20, 80);
  doc.text(`Date: ${data.date}`, 20, 90);
  doc.text(`Status: VERIFIED / SUCCESSFUL`, 20, 100);

  // Footer Signature Line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 260, 190, 260);
  doc.setFontSize(8);
  doc.text(
    "This is an electronically generated receipt. No signature required.",
    105,
    270,
    { align: "center" },
  );

  doc.save(`Ayax_Receipt_${data.ref}.pdf`);
};

/**
 * TRIGGER 2: GENERATE FILLED APPLICATION FORM
 */
export const downloadFilledForm = (data) => {
  const doc = new jsPDF();

  // Branded Header
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text("AYAX DIGITAL SOLUTIONS ACADEMY", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("2026 OFFICIAL ENROLLMENT DATA", 105, 30, { align: "center" });

  // Organizing Data into a Table
  const tableRows = [
    ["Full Name", data.name],
    ["Email Address", data.email],
    ["WhatsApp Number", data.phone],
    ["Course Selected", data.course],
    ["Transaction ID", data.ref],
    ["Current State", data.formData.currentState || "N/A"],
    ["LGA of Origin", data.formData.lgaOfOrigin || "N/A"],
    ["Address", data.formData.address || "N/A"],
  ];

  doc.autoTable({
    startY: 45,
    head: [["Field", "Information"]],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 10, cellPadding: 5 },
  });

  // Stamp / Verification Note
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.setTextColor(0, 150, 0); // Green
  doc.text("✓ DATA SECURED & VERIFIED", 20, finalY);

  doc.save(`Ayax_Form_${data.name.replace(/\s+/g, "_")}.pdf`);
};
