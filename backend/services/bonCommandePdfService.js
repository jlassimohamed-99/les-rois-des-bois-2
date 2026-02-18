import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate Bon de Commande PDF for an order using PDFKit
 * @param {Object} order - Order document from database
 * @returns {Promise<string>} - Path to generated PDF file
 */
export const generateBonCommandePDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('📄 [BON COMMANDE] Starting PDF generation for order:', order.orderNumber);
      
      // Validate order data
      if (!order || !order.orderNumber) {
        throw new Error('Order data is invalid');
      }

      // Create uploads/bon-commande directory if it doesn't exist
      const bonCommandeDir = path.join(__dirname, '..', 'uploads', 'bon-commande');
      if (!fs.existsSync(bonCommandeDir)) {
        fs.mkdirSync(bonCommandeDir, { recursive: true });
      }

      const pdfPath = path.join(bonCommandeDir, `bon-commande-${order.orderNumber}.pdf`);

      // Prepare order items data
      const items = (order.items || []).map(item => {
        const productName = typeof item.productId === 'object' && item.productId?.name
          ? item.productId.name
          : item.productName || 'N/A';
        
        return {
          quantity: item.quantity || 0, // Number of pieces
          designation: productName, // Product name
          unitPrice: item.unitPrice ? item.unitPrice.toFixed(2) : '0.00', // Price of one unit
          amount: item.total ? item.total.toFixed(2) : '0.00', // Total of each product (quantity * unitPrice)
        };
      });

      console.log('📄 [BON COMMANDE] Items count:', items.length);

      // Calculate total of the full order
      const orderTotal = order.total ? order.total.toFixed(2) : 
        items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toFixed(2);

      // A4 portrait: 210 × 297 mm
      // Margins: 12-15mm left/right, 10-12mm top, 12-15mm bottom
      // Convert mm to points: 1mm = 2.83465 points
      const marginLeft = 42.52; // 15mm
      const marginRight = 42.52;
      const marginTop = 34.02; // 12mm
      const marginBottom = 42.52;
      
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: {
          top: marginTop,
          bottom: marginBottom,
          left: marginLeft,
          right: marginRight
        }
      });

      // Create write stream
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // Perforation/tear line at the very top (thin dotted line)
      doc.moveTo(marginLeft, marginTop - 5)
        .lineTo(595.28 - marginRight, marginTop - 5) // A4 width - right margin
        .dash(2, { space: 2 })
        .strokeColor('black')
        .lineWidth(0.5)
        .stroke()
        .undash();

      // Header: Two blocks (left + right)
      const headerY = marginTop + 5;
      
      // Left block: Company identity
      doc.fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('black')
        .text('LES ROIS DU BOIS', marginLeft, headerY, {
          width: 250,
          align: 'left'
        });
      
      doc.fontSize(9)
        .font('Helvetica')
        .text('Rte de Monastir 4070 M\'saken', marginLeft, headerY + 25, {
          width: 250,
          align: 'left'
        });
      
      doc.fontSize(9)
        .text('Tél : 58 111 106 - 50 429 150 - 58 111 888', marginLeft, headerY + 38, {
          width: 250,
          align: 'left'
        });

      // Right block: Document title + number + date
      const rightBlockX = 595.28 - marginRight - 200; // Right aligned, 200pt width
      
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('black')
        .text('Bon de Commande', rightBlockX, headerY, {
          width: 200,
          align: 'right'
        });
      
      // Order number in red
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('red')
        .text(`N° ${order.orderNumber}`, rightBlockX, headerY + 18, {
          width: 200,
          align: 'right'
        });
      
      // Date line
      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('black')
        .text('Date, le: ___________________', rightBlockX, headerY + 35, {
          width: 200,
          align: 'right'
        });

      // Recipient line ("Livré à")
      const recipientY = headerY + 70;
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('black')
        .text('Livré à : ___________________________________________________________', 
          marginLeft, recipientY, {
          width: 595.28 - marginLeft - marginRight,
          align: 'left'
        });

      // Main table
      const tableY = recipientY + 25;
      const tableWidth = 595.28 - marginLeft - marginRight;
      const tableHeight = 400; // Approximate height for rows
      
      // Column widths
      const colQte = tableWidth * 0.12; // ~12%
      const colDesignation = tableWidth * 0.58; // ~58%
      const colPU = tableWidth * 0.15; // ~15%
      const colMontant = tableWidth * 0.15; // ~15%
      
      // Table border with rounded corners (thicker black stroke)
      const cornerRadius = 3;
      doc.lineWidth(1.5)
        .strokeColor('black')
        .roundedRect(marginLeft, tableY, tableWidth, tableHeight, cornerRadius)
        .stroke();

      // Header row
      const headerRowHeight = 20;
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('black');
      
      // Column titles (centered)
      const headerTextY = tableY + (headerRowHeight / 2) - 4;
      doc.text('Qté', marginLeft + colQte / 2, headerTextY, { align: 'center', width: colQte });
      doc.text('DESIGNATION', marginLeft + colQte + colDesignation / 2, headerTextY, { align: 'center', width: colDesignation });
      doc.text('P.U.', marginLeft + colQte + colDesignation + colPU / 2, headerTextY, { align: 'center', width: colPU });
      doc.text('MONTANT', marginLeft + colQte + colDesignation + colPU + colMontant / 2, headerTextY, { align: 'center', width: colMontant });
      
      // Header row borders
      doc.lineWidth(1)
        .moveTo(marginLeft, tableY + headerRowHeight)
        .lineTo(marginLeft + tableWidth, tableY + headerRowHeight)
        .stroke();
      
      // Vertical column separators
      doc.lineWidth(1)
        .moveTo(marginLeft + colQte, tableY)
        .lineTo(marginLeft + colQte, tableY + tableHeight)
        .stroke()
        .moveTo(marginLeft + colQte + colDesignation, tableY)
        .lineTo(marginLeft + colQte + colDesignation, tableY + tableHeight)
        .stroke()
        .moveTo(marginLeft + colQte + colDesignation + colPU, tableY)
        .lineTo(marginLeft + colQte + colDesignation + colPU, tableY + tableHeight)
        .stroke();

      // Body rows
      const rowHeight = 12; // ~12mm per row
      const numRows = 15; // 15 empty rows + items
      let currentRow = 0;
      
      // Add order items
      items.forEach((item, index) => {
        if (currentRow >= numRows) return; // Don't exceed table height
        
        const rowY = tableY + headerRowHeight + (currentRow * rowHeight);
        
        // Item data
        doc.fontSize(9)
          .font('Helvetica')
          .fillColor('black')
          .text(String(item.quantity), marginLeft + colQte / 2, rowY + 2, { align: 'center', width: colQte });
        
        doc.text(item.designation, marginLeft + colQte + 2, rowY + 2, { 
          width: colDesignation - 4,
          align: 'left'
        });
        
        doc.text(item.unitPrice, marginLeft + colQte + colDesignation + colPU / 2, rowY + 2, { align: 'center', width: colPU });
        
        doc.text(item.amount, marginLeft + colQte + colDesignation + colPU + colMontant / 2, rowY + 2, { align: 'center', width: colMontant });
        
        // Dotted horizontal line
        doc.dash(1, { space: 2 })
          .lineWidth(0.5)
          .moveTo(marginLeft, rowY + rowHeight)
          .lineTo(marginLeft + tableWidth, rowY + rowHeight)
          .stroke()
          .undash();
        
        currentRow++;
      });
      
      // Fill remaining rows with empty lines
      for (let i = currentRow; i < numRows; i++) {
        const rowY = tableY + headerRowHeight + (i * rowHeight);
        
        // Dotted horizontal line
        doc.dash(1, { space: 2 })
          .lineWidth(0.5)
          .moveTo(marginLeft, rowY + rowHeight)
          .lineTo(marginLeft + tableWidth, rowY + rowHeight)
          .stroke()
          .undash();
      }

      // Total row
      const totalRowY = tableY + headerRowHeight + (numRows * rowHeight);
      doc.lineWidth(2)
        .moveTo(marginLeft, totalRowY)
        .lineTo(marginLeft + tableWidth, totalRowY)
        .stroke();
      
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('black')
        .text('TOTAL', marginLeft + colQte + colDesignation + colPU - 10, totalRowY + 8, {
          width: colPU + colMontant,
          align: 'right'
        });
      
      doc.fontSize(11)
        .text(`${orderTotal} TND`, marginLeft + colQte + colDesignation + colPU + colMontant / 2, totalRowY + 8, {
          width: colMontant,
          align: 'center'
        });

      // Signature area (bottom-right)
      const signatureY = tableY + tableHeight + 30;
      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('black')
        .text('Signature & Cachet', 595.28 - marginRight - 100, signatureY, {
          width: 100,
          align: 'right'
        });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        console.log('📄 [BON COMMANDE] PDF generated successfully:', pdfPath);
        const relativePath = `/uploads/bon-commande/bon-commande-${order.orderNumber}.pdf`;
        resolve(relativePath);
      });

      stream.on('error', (err) => {
        console.error('❌ [BON COMMANDE] Stream error:', err);
        reject(err);
      });
    } catch (error) {
      console.error('❌ [BON COMMANDE] Error generating PDF:', error);
      console.error('❌ [BON COMMANDE] Error message:', error.message);
      console.error('❌ [BON COMMANDE] Error stack:', error.stack);
      reject(error);
    }
  });
};
