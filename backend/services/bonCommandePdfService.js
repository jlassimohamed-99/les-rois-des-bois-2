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

      // Table dimensions
      const headerRowHeight = 20;
      const rowHeight = 16; // Row height for better visibility
      const totalRowHeight = 25;
      const maxRowsPerPage = 12; // Maximum rows per page (excluding header and total)
      
      // Column widths
      const tableWidth = 595.28 - marginLeft - marginRight;
      const colQte = tableWidth * 0.12; // ~12%
      const colDesignation = tableWidth * 0.58; // ~58%
      const colPU = tableWidth * 0.15; // ~15%
      const colMontant = tableWidth * 0.15; // ~15%
      
      // Calculate number of pages needed
      const totalItems = items.length;
      const numPages = Math.max(1, Math.ceil(totalItems / maxRowsPerPage));
      
      console.log(`📄 [BON COMMANDE] Total items: ${totalItems}, Pages needed: ${numPages}`);
      
      // Process items in pages
      for (let pageIndex = 0; pageIndex < numPages; pageIndex++) {
        const startIndex = pageIndex * maxRowsPerPage;
        const endIndex = Math.min(startIndex + maxRowsPerPage, totalItems);
        const pageItems = items.slice(startIndex, endIndex);
        const rowsOnThisPage = pageItems.length;
        
        // Add new page if not first page
        if (pageIndex > 0) {
          doc.addPage();
          
          // Redraw header on new page
          const newHeaderY = marginTop + 5;
          doc.fontSize(20)
            .font('Helvetica-Bold')
            .fillColor('black')
            .text('LES ROIS DU BOIS', marginLeft, newHeaderY, {
              width: 250,
              align: 'left'
            });
          
          doc.fontSize(9)
            .font('Helvetica')
            .text('Rte de Monastir 4070 M\'saken', marginLeft, newHeaderY + 25, {
              width: 250,
              align: 'left'
            });
          
          doc.fontSize(9)
            .text('Tél : 58 111 106 - 50 429 150 - 58 111 888', marginLeft, newHeaderY + 38, {
              width: 250,
              align: 'left'
            });
          
          const newRightBlockX = 595.28 - marginRight - 200;
          doc.fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('black')
            .text('Bon de Commande', newRightBlockX, newHeaderY, {
              width: 200,
              align: 'right'
            });
          
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .fillColor('red')
            .text(`N° ${order.orderNumber}`, newRightBlockX, newHeaderY + 18, {
              width: 200,
              align: 'right'
            });
        }
        
        // Table position for this page
        const tableY = pageIndex === 0 ? recipientY + 25 : marginTop + 70;
        const tableHeight = headerRowHeight + (rowsOnThisPage * rowHeight) + (pageIndex === numPages - 1 ? totalRowHeight : 0);
        
        // Table border
        doc.lineWidth(1.5)
          .strokeColor('black')
          .rect(marginLeft, tableY, tableWidth, tableHeight)
          .stroke();

        // Header row
        doc.fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('black');
        
        const headerTextY = tableY + (headerRowHeight / 2) - 4;
        doc.text('Qté', marginLeft + colQte / 2, headerTextY, { align: 'center', width: colQte });
        doc.text('DESIGNATION', marginLeft + colQte + colDesignation / 2, headerTextY, { align: 'center', width: colDesignation });
        doc.text('P.U.', marginLeft + colQte + colDesignation + colPU / 2, headerTextY, { align: 'center', width: colPU });
        doc.text('MONTANT', marginLeft + colQte + colDesignation + colPU + colMontant / 2, headerTextY, { align: 'center', width: colMontant });
        
        // Header row bottom border
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

        // Body rows - clear solid lines
        pageItems.forEach((item, itemIndex) => {
          const rowY = tableY + headerRowHeight + (itemIndex * rowHeight);
          const cellPadding = 5;
          const textY = rowY + cellPadding;
          
          // Item data
          doc.fontSize(11)
            .font('Helvetica')
            .fillColor('black');
          
          // Quantity - centered
          doc.text(String(item.quantity), marginLeft + colQte / 2, textY, { 
            align: 'center', 
            width: colQte - 6
          });
          
          // Designation - left aligned
          doc.text(item.designation, marginLeft + colQte + cellPadding, textY, { 
            width: colDesignation - cellPadding * 2,
            align: 'left'
          });
          
          // Unit Price - centered
          doc.text(item.unitPrice, marginLeft + colQte + colDesignation + colPU / 2, textY, { 
            align: 'center', 
            width: colPU - 6
          });
          
          // Amount - centered
          doc.text(item.amount, marginLeft + colQte + colDesignation + colPU + colMontant / 2, textY, { 
            align: 'center', 
            width: colMontant - 6
          });
          
          // Solid horizontal line below the row (no dots)
          doc.lineWidth(0.5)
            .moveTo(marginLeft, rowY + rowHeight)
            .lineTo(marginLeft + tableWidth, rowY + rowHeight)
            .stroke();
        });
        
        // Total row only on last page
        if (pageIndex === numPages - 1) {
          const totalRowY = tableY + headerRowHeight + (rowsOnThisPage * rowHeight);
          
          // Solid line above total
          doc.lineWidth(2)
            .moveTo(marginLeft, totalRowY)
            .lineTo(marginLeft + tableWidth, totalRowY)
            .stroke();
          
          // Total label and value
          doc.fontSize(11)
            .font('Helvetica-Bold')
            .fillColor('black');
          
          const totalLabelX = marginLeft + colQte + colDesignation + colPU;
          const totalLabelY = totalRowY + 8;
          doc.text('TOTAL', totalLabelX, totalLabelY, {
            width: colPU,
            align: 'right'
          });
          
          const totalValueX = marginLeft + colQte + colDesignation + colPU + colMontant / 2;
          const totalValueY = totalRowY + 8;
          doc.fontSize(12)
            .text(`${orderTotal} TND`, totalValueX, totalValueY, {
              width: colMontant,
              align: 'center'
            });
          
          // Bottom border of total row
          doc.lineWidth(1.5)
            .moveTo(marginLeft, totalRowY + totalRowHeight)
            .lineTo(marginLeft + tableWidth, totalRowY + totalRowHeight)
            .stroke();
        }
      }

      // Signature area (bottom-right) - only on last page
      const lastPageTableY = numPages === 1 ? recipientY + 25 : marginTop + 70;
      const lastPageRows = items.length % maxRowsPerPage || maxRowsPerPage;
      const lastPageTableHeight = headerRowHeight + (lastPageRows * rowHeight) + totalRowHeight;
      const signatureY = lastPageTableY + lastPageTableHeight + 30;
      
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
