import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const generateInvoicePDF = async (invoiceData) => {
  const { order, customer, payment, items } = invoiceData;
  
  // Crear nuevo documento PDF
  const doc = new jsPDF();
  
  // Configuración de colores
  const primaryColor = [37, 99, 235]; // Blue-600
  const secondaryColor = [75, 85, 99]; // Gray-600
  const lightGray = [243, 244, 246]; // Gray-100
  
  // Configurar fuente
  doc.setFont('helvetica');
  
  // Header - Logo y título
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MARKETPLACE CR', 15, 17);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Factura Electrónica', 150, 17);
  
  // Información de la empresa
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('Marketplace CR S.A.', 15, 35);
  doc.text('Cédula Jurídica: 3-101-123456', 15, 42);
  doc.text('San José, Costa Rica', 15, 49);
  doc.text('Tel: +506 2234-5678', 15, 56);
  doc.text('Email: info@marketplace-cr.com', 15, 63);
  
  // Información de la factura
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA #: ' + order.orderNumber, 120, 35);
  doc.setFont('helvetica', 'normal');
  doc.text('Fecha: ' + format(new Date(order.createdAt || new Date()), 'dd/MM/yyyy HH:mm', { locale: es }), 120, 42);
  doc.text('Estado: ' + (order.status === 'confirmed' ? 'PAGADA' : order.status.toUpperCase()), 120, 49);
  doc.text('Método de pago: Tarjeta de Crédito', 120, 56);
  doc.text('Autorización: ' + payment.authorizationCode, 120, 63);
  
  // Línea separadora
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, 70, 195, 70);
  
  // Información del cliente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DATOS DEL CLIENTE:', 15, 80);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Nombre: ' + customer.name, 15, 88);
  doc.text('Email: ' + customer.email, 15, 95);
  doc.text('Teléfono: ' + customer.phone, 15, 102);
  
  // Dirección de envío
  doc.setFont('helvetica', 'bold');
  doc.text('DIRECCIÓN DE ENVÍO:', 15, 112);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.address.address, 15, 120);
  doc.text(`${customer.address.city}, ${customer.address.postalCode}`, 15, 127);
  
  // Tabla de productos
  let yPosition = 140;
  
  // Header de la tabla
  doc.setFillColor(...lightGray);
  doc.rect(15, yPosition, 180, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PRODUCTO', 17, yPosition + 5);
  doc.text('TIENDA', 80, yPosition + 5);
  doc.text('CANT.', 120, yPosition + 5);
  doc.text('PRECIO', 140, yPosition + 5);
  doc.text('TOTAL', 170, yPosition + 5);
  
  yPosition += 10;
  
  // Productos
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  items.forEach((item, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Alternar color de fondo
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, yPosition - 2, 180, 8, 'F');
    }
    
    doc.setTextColor(0, 0, 0);
    
    // Nombre del producto (truncar si es muy largo)
    const productName = item.productName.length > 25 
      ? item.productName.substring(0, 25) + '...' 
      : item.productName;
    doc.text(productName, 17, yPosition + 3);
    
    // Tienda (truncar si es muy largo)
    const storeName = item.storeName?.length > 20 
      ? item.storeName.substring(0, 20) + '...' 
      : (item.storeName || 'N/A');
    doc.text(storeName, 80, yPosition + 3);
    
    doc.text(item.quantity.toString(), 125, yPosition + 3);
    doc.text('₡' + item.price.toLocaleString(), 142, yPosition + 3);
    doc.text('₡' + item.total.toLocaleString(), 172, yPosition + 3);
    
    yPosition += 8;
  });
  
  // Totales
  yPosition += 10;
  
  doc.setDrawColor(...secondaryColor);
  doc.line(120, yPosition, 195, yPosition);
  yPosition += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Subtotal:', 140, yPosition);
  doc.text('₡' + order.subtotal.toLocaleString(), 175, yPosition);
  yPosition += 6;
  
  if (order.shipping > 0) {
    doc.text('Envío:', 140, yPosition);
    doc.text('₡' + order.shipping.toLocaleString(), 175, yPosition);
    yPosition += 6;
  }
  
  doc.text('IVA (13%):', 140, yPosition);
  doc.text('₡' + order.tax.toLocaleString(), 175, yPosition);
  yPosition += 8;
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setFillColor(...primaryColor);
  doc.rect(135, yPosition - 3, 60, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL:', 140, yPosition + 2);
  doc.text('₡' + order.total.toLocaleString(), 175, yPosition + 2);
  
  // Información del pago
  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('INFORMACIÓN DE PAGO:', 15, yPosition);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  yPosition += 7;
  doc.text(`Tarjeta: **** **** **** ${payment.cardLast4} (${payment.cardBrand})`, 15, yPosition);
  yPosition += 5;
  doc.text('ID Transacción: ' + payment.transactionId, 15, yPosition);
  yPosition += 5;
  doc.text('Fecha de procesamiento: ' + format(new Date(payment.processedAt), 'dd/MM/yyyy HH:mm:ss', { locale: es }), 15, yPosition);
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Esta factura es un documento generado electrónicamente.', 15, pageHeight - 20);
  doc.text('Para consultas o reclamos, contacte a soporte@marketplace-cr.com', 15, pageHeight - 15);
  doc.text('Gracias por su compra en Marketplace CR', 15, pageHeight - 10);
  
  // Generar blob del PDF
  const pdfBlob = doc.output('blob');
  
  return pdfBlob;
};

// Función auxiliar para generar número de factura
export const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${year}${month}${day}-${random}`;
};
