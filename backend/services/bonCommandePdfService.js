import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate Bon de Commande PDF for an order
 * @param {Object} order - Order document from database
 * @returns {Promise<string>} - Path to generated PDF file
 */
export const generateBonCommandePDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads/bon-commande directory if it doesn't exist
      const bonCommandeDir = path.join(__dirname, '..', 'uploads', 'bon-commande');
      if (!fs.existsSync(bonCommandeDir)) {
        fs.mkdirSync(bonCommandeDir, { recursive: true });
      }

      const pdfPath = path.join(bonCommandeDir, `bon-commande-${order.orderNumber}.pdf`);
      
      // A4 portrait: 210 × 297 mm
      // Margins: 12-15mm left/right, 10-12mm top, 12-15mm bottom
      const marginLeft = 42.52; // 15mm in points (1mm = 2.83465 points)
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
        .text('Tél : ... ... ...', marginLeft, headerY + 38, {
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
      const tableHeight = 400; // Approximate height for 14-18 rows
      
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
      
      // Header row background (optional - white for now)
      doc.rect(marginLeft, tableY, tableWidth, headerRowHeight)
        .fillColor('white')
        .fill()
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

      // Body rows (14-18 rows with dotted horizontal lines)
      const rowHeight = 12; // ~12mm per row
      const numRows = 16;
      
      for (let i = 0; i < numRows; i++) {
        const rowY = tableY + headerRowHeight + (i * rowHeight);
        
        // Dotted horizontal line
        doc.dash(1, { space: 2 })
          .lineWidth(0.5)
          .moveTo(marginLeft, rowY)
          .lineTo(marginLeft + tableWidth, rowY)
          .stroke()
          .undash();
      }

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
        resolve(`/uploads/bon-commande/bon-commande-${order.orderNumber}.pdf`);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

