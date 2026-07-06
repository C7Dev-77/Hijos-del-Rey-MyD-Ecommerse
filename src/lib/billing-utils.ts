export function exportToCSV(data: Record<string, unknown>[], filename: string, columns: { key: string; label: string }[]) {
  const header = columns.map(c => c.label).join(",");
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.key];
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatCurrencyCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDateCO(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function generateInvoicePDFContent(invoice: {
  number: string;
  client: string;
  nit: string;
  clientAddress?: string;
  clientPhone?: string;
  clientCity?: string;
  clientEmail?: string;
  date: string;
  dueDate: string;
  items: { description: string; quantity: number; unitPrice: number; tax: number }[];
}, settings?: {
  company_name: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  resolution_number?: string;
  resolution_date?: string;
  prefix?: string;
  start_range?: number;
  end_range?: number;
}) {
  const subtotal = invoice.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalTax = invoice.items.reduce((s, i) => s + (i.quantity * i.unitPrice * i.tax) / 100, 0);
  const total = subtotal + totalTax;
  const companyName = settings?.company_name || "M&D Hijos del Rey";
  const companyNit = settings?.nit || "900.123.456-7";
  const companyAddress = settings?.address || "Bogotá D.C.";
  const companyPhone = settings?.phone || "+57 1 234 5678";
  const companyEmail = settings?.email || "facturacion@mdhijos.com";
  const companyLogo = settings?.logo_url || window.location.origin + "/logo.png";
  const resolutionText = settings?.resolution_number
    ? `Resolución DIAN No. ${settings.resolution_number} del ${settings.resolution_date || 'YYYY-MM-DD'} | Rango ${settings.prefix}-${settings.start_range} a ${settings.prefix}-${settings.end_range}`
    : "Resolución DIAN pendiente de configurar";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${invoice.number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #2d1f14; padding: 40px; max-width: 800px; margin: auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid #4a3728; padding-bottom: 20px; }
    .header-left { display: flex; align-items: center; gap: 20px; }
    .company-info { display: flex; flex-direction: column; }
    .company-logo { width: 100px; height: auto; object-fit: contain; border-radius: 8px; }
    .company { font-size: 22px; font-weight: bold; color: #4a3728; line-height: 1.2; }
    .company-sub { font-size: 12px; color: #8a7060; margin-top: 2px; }
    .header-right { text-align: right; }
    .invoice-title { font-size: 26px; font-weight: bold; color: #4a3728; letter-spacing: -0.5px; }
    .invoice-num { font-size: 14px; color: #8a7060; margin-top: 4px; font-weight: 500; }
    .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .details-section { font-size: 13px; line-height: 1.8; }
    .details-section strong { color: #4a3728; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #4a3728; color: white; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e8ddd4; font-size: 13px; }
    tr:hover { background: #faf6f2; }
    .text-right { text-align: right; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-table { width: 280px; }
    .totals-table td { padding: 6px 12px; font-size: 13px; }
    .totals-table .total-row { font-weight: bold; font-size: 16px; color: #4a3728; border-top: 2px solid #4a3728; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #8a7060; border-top: 1px solid #e8ddd4; padding-top: 15px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      ${companyLogo ? `<img src="${companyLogo}" alt="Logo" class="company-logo">` : ''}
      <div class="company-info">
        <div class="company">${companyName}</div>
        <div class="company-sub">NIT: ${companyNit}</div>
        <div class="company-sub">${companyAddress}</div>
        <div class="company-sub">Tel: ${companyPhone} | ${companyEmail}</div>
      </div>
    </div>
    <div class="header-right">
      <div class="invoice-title">FACTURA ELECTRÓNICA</div>
      <div class="invoice-num">${invoice.number}</div>
    </div>
  </div>
  <div class="details">
    <div class="details-section">
      <strong>Cliente:</strong> ${invoice.client}<br>
      <strong>NIT:</strong> ${invoice.nit}<br>
      ${invoice.clientAddress ? `<strong>Dirección:</strong> ${invoice.clientAddress}<br>` : ''}
      ${invoice.clientCity ? `<strong>Ciudad:</strong> ${invoice.clientCity}<br>` : ''}
    </div>
    <div class="details-section text-right">
      <strong>Fecha:</strong> ${invoice.date}<br>
      <strong>Vencimiento:</strong> ${invoice.dueDate}<br>
      ${invoice.clientPhone ? `<strong>Teléfono:</strong> ${invoice.clientPhone}<br>` : ''}
      ${invoice.clientEmail ? `<strong>Email:</strong> ${invoice.clientEmail}<br>` : ''}
    </div>
  </div>
  <table>
    <thead><tr><th>Descripción</th><th class="text-right">Cantidad</th><th class="text-right">Precio Unit.</th><th class="text-right">IVA</th><th class="text-right">Total</th></tr></thead>
    <tbody>
      ${invoice.items.map(item => {
        const lineTotal = item.quantity * item.unitPrice;
        const lineTax = lineTotal * item.tax / 100;
        return `<tr><td>${item.description}</td><td class="text-right">${item.quantity}</td><td class="text-right">$${item.unitPrice.toLocaleString("es-CO")}</td><td class="text-right">${item.tax}%</td><td class="text-right">$${(lineTotal + lineTax).toLocaleString("es-CO")}</td></tr>`;
      }).join("")}
    </tbody>
  </table>
  <div class="totals">
    <table class="totals-table">
      <tr><td>Subtotal</td><td class="text-right">$${subtotal.toLocaleString("es-CO")}</td></tr>
      <tr><td>IVA</td><td class="text-right">$${totalTax.toLocaleString("es-CO")}</td></tr>
      <tr class="total-row"><td>Total</td><td class="text-right">$${total.toLocaleString("es-CO")}</td></tr>
    </table>
  </div>
  <div class="footer">
    <p>Factura electrónica generada por ${companyName}</p>
    <p>${resolutionText}</p>
  </div>
</body>
</html>`;
}

export function downloadInvoicePDF(
  invoice: Parameters<typeof generateInvoicePDFContent>[0],
  settings?: Parameters<typeof generateInvoicePDFContent>[1]
) {
  const html = generateInvoicePDFContent(invoice, settings);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 1000);
  }
}
