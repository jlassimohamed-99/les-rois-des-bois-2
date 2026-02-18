import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate Bon de Commande PDF for an order using Puppeteer
 * @param {Object} order - Order document from database
 * @returns {Promise<string>} - Path to generated PDF file
 */
export const generateBonCommandePDF = async (order) => {
  let browser;
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

    // Generate HTML template
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bon de Commande - ${order.orderNumber}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
            color: #000;
            background: white;
            line-height: 1.4;
        }
        
        /* Perforation line at top */
        .perforation-line {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            border-top: 1px dashed #000;
            margin-top: -5mm;
        }
        
        /* Header container */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            margin-top: 5mm;
        }
        
        /* Left block - Company identity */
        .company-block {
            flex: 0 0 250px;
        }
        
        .company-name {
            font-size: 20pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }
        
        .company-address {
            font-size: 9pt;
            margin-bottom: 4px;
        }
        
        .company-phone {
            font-size: 9pt;
        }
        
        /* Right block - Document title */
        .document-block {
            flex: 0 0 200px;
            text-align: right;
        }
        
        .document-title {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .order-number {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .order-number-label {
            color: #000;
        }
        
        .order-number-value {
            color: #FF0000;
        }
        
        .date-line {
            font-size: 9pt;
        }
        
        .date-underline {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 120px;
            margin-left: 5px;
        }
        
        /* Recipient line */
        .recipient-line {
            margin-bottom: 15px;
            font-size: 10pt;
        }
        
        .recipient-underline {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 400px;
            margin-left: 5px;
        }
        
        /* Main table */
        .main-table {
            width: 100%;
            border: 1.5px solid #000;
            border-radius: 3px;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 20px;
        }
        
        .table-header {
            background: white;
        }
        
        .table-header th {
            padding: 8px 4px;
            text-align: center;
            font-weight: bold;
            font-size: 10pt;
            border-bottom: 1px solid #000;
            border-right: 1px solid #000;
        }
        
        .table-header th:last-child {
            border-right: none;
        }
        
        .col-qte {
            width: 12%;
        }
        
        .col-designation {
            width: 58%;
        }
        
        .col-pu {
            width: 15%;
        }
        
        .col-montant {
            width: 15%;
        }
        
        .table-body td {
            padding: 6px 4px;
            border-bottom: 1px dotted #000;
            border-right: 1px solid #000;
            height: 12mm;
            vertical-align: top;
        }
        
        .table-body td:last-child {
            border-right: none;
        }
        
        .table-body tr:last-child td {
            border-bottom: none;
        }
        
        .item-qte {
            text-align: center;
        }
        
        .item-designation {
            text-align: left;
        }
        
        .item-pu {
            text-align: right;
        }
        
        .item-montant {
            text-align: right;
        }
        
        /* Total row */
        .total-row {
            border-top: 2px solid #000;
            background: #f5f5f5;
        }
        
        .total-row td {
            padding: 10px 4px;
            font-weight: bold;
            border-bottom: none;
            border-right: 1px solid #000;
        }
        
        .total-row td:last-child {
            border-right: none;
        }
        
        .total-label {
            text-align: right;
            padding-right: 10px;
        }
        
        .total-value {
            text-align: right;
            font-size: 11pt;
        }
        
        /* Signature area */
        .signature-area {
            text-align: right;
            font-size: 9pt;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <!-- Perforation line -->
    <div class="perforation-line"></div>
    
    <!-- Header -->
    <div class="header">
        <!-- Left block - Company -->
        <div class="company-block">
            <div class="company-name">LES ROIS DU BOIS</div>
            <div class="company-address">Rte de Monastir 4070 M'saken</div>
            <div class="company-phone">Tél : 58 111 106 - 50 429 150 - 58 111 888</div>
        </div>
        
        <!-- Right block - Document -->
        <div class="document-block">
            <div class="document-title">Bon de Commande</div>
            <div class="order-number">
                <span class="order-number-label">N°</span>
                <span class="order-number-value">${order.orderNumber}</span>
            </div>
            <div class="date-line">
                Date, le: <span class="date-underline"></span>
            </div>
        </div>
    </div>
    
    <!-- Recipient line -->
    <div class="recipient-line">
        Livré à : <span class="recipient-underline"></span>
    </div>
    
    <!-- Main table -->
    <table class="main-table">
        <thead class="table-header">
            <tr>
                <th class="col-qte">Qté</th>
                <th class="col-designation">DESIGNATION</th>
                <th class="col-pu">P.U.</th>
                <th class="col-montant">MONTANT</th>
            </tr>
        </thead>
        <tbody class="table-body">
            ${items.map(item => `
                <tr>
                    <td class="item-qte">${item.quantity}</td>
                    <td class="item-designation">${item.designation}</td>
                    <td class="item-pu">${item.unitPrice}</td>
                    <td class="item-montant">${item.amount}</td>
                </tr>
            `).join('')}
            ${Array(Math.max(0, 15 - items.length)).fill(0).map(() => `
                <tr>
                    <td class="item-qte"></td>
                    <td class="item-designation"></td>
                    <td class="item-pu"></td>
                    <td class="item-montant"></td>
                </tr>
            `).join('')}
            <!-- Total row -->
            <tr class="total-row">
                <td colspan="3" class="total-label">TOTAL</td>
                <td class="total-value">${orderTotal} TND</td>
            </tr>
        </tbody>
    </table>
    
    <!-- Signature area -->
    <div class="signature-area">
        Signature & Cachet
    </div>
</body>
</html>
    `;

    console.log('📄 [BON COMMANDE] Launching Puppeteer...');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    });

    console.log('📄 [BON COMMANDE] Browser launched, creating page...');
    const page = await browser.newPage();
    
    console.log('📄 [BON COMMANDE] Setting HTML content...');
    // Set content with timeout
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    console.log('📄 [BON COMMANDE] Generating PDF...');
    // Generate PDF with exact margins
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      landscape: false,
      printBackground: true,
      margin: {
        top: '12mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
    });

    console.log('📄 [BON COMMANDE] PDF generated successfully:', pdfPath);
    await browser.close();
    
    const relativePath = `/uploads/bon-commande/bon-commande-${order.orderNumber}.pdf`;
    console.log('📄 [BON COMMANDE] Returning path:', relativePath);
    return relativePath;
  } catch (error) {
    console.error('❌ [BON COMMANDE] Error generating PDF:', error);
    console.error('❌ [BON COMMANDE] Error message:', error.message);
    console.error('❌ [BON COMMANDE] Error stack:', error.stack);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('❌ [BON COMMANDE] Error closing browser:', closeError);
      }
    }
    throw error;
  }
};
