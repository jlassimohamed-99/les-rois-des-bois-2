# Pages Documentation - Les Rois Du Bois Admin Dashboard

This document provides a comprehensive overview of all pages in the admin dashboard, explaining what each page does and its functionality.

---

## 📋 Table of Contents

1. [Authentication Pages](#authentication-pages)
2. [Dashboard Pages](#dashboard-pages)
3. [Product Management Pages](#product-management-pages)
4. [Inventory Management Pages](#inventory-management-pages)
5. [Order Management Pages](#order-management-pages)
6. [Invoice Management Pages](#invoice-management-pages)
7. [Point of Sale (POS) Pages](#point-of-sale-pos-pages)
8. [Supplier & Purchasing Pages](#supplier--purchasing-pages)
9. [Returns & Refunds Pages](#returns--refunds-pages)
10. [CRM Pages](#crm-pages)
11. [Analytics & Reports Pages](#analytics--reports-pages)
12. [System Pages](#system-pages)

---

## 🔐 Authentication Pages

### Login Page (`/login`)
**File:** `frontend/src/pages/Login.jsx`

**Purpose:** Admin authentication and access control.

**Features:**
- Email and password login form
- JWT token-based authentication
- Automatic redirect to dashboard after successful login
- Theme toggle (dark/light mode)
- Error handling and validation
- RTL (Right-to-Left) layout for Arabic

**What it does:**
- Validates admin credentials
- Stores JWT token in localStorage
- Sets up axios interceptors for authenticated requests
- Redirects unauthorized users to login page

---

## 📊 Dashboard Pages

### Dashboard Home (`/dashboard`)
**File:** `frontend/src/pages/Dashboard.jsx`

**Purpose:** Main analytics overview and KPIs dashboard.

**Features:**
- **Key Performance Indicators (KPIs):**
  - Total categories count
  - Total products count
  - Total special products count
  - Total users count
  - Total orders count (placeholder)
  - Pending orders count (placeholder)
  - Total revenue (placeholder)
  - Credit unpaid invoices (placeholder)

- **Charts and Visualizations:**
  - Sales per month (Line chart)
  - Top 5 products (Bar chart)
  - Stock distribution (Pie chart)

**What it does:**
- Displays real-time statistics from the database
- Shows visual charts using Recharts library
- Provides quick overview of business metrics
- Uses dummy data for placeholders (ready to connect to real data)

---

## 📦 Product Management Pages

### Categories Management (`/categories`)
**File:** `frontend/src/pages/Categories.jsx`

**Purpose:** Complete CRUD operations for product categories.

**Features:**
- **List View:**
  - Table displaying all categories
  - Category image preview
  - Category name, slug, description
  - Creation date
  - Search functionality by name

- **Create/Edit Modal:**
  - Category name input (Arabic)
  - Description textarea
  - Image upload with preview
  - Automatic slug generation
  - Validation and error handling

- **Delete Functionality:**
  - Prevents deletion if products depend on category
  - Shows error message with product count

**What it does:**
- Manages product categorization system
- Handles image uploads for categories
- Ensures data integrity by preventing orphaned products
- Provides search and filter capabilities

---

### Products Management (`/products`)
**File:** `frontend/src/pages/Products.jsx`

**Purpose:** Manage regular products with full CRUD operations.

**Features:**
- **List View:**
  - Product table with images
  - Product name, category, price, stock
  - Status indicator (visible/hidden)
  - Filter by category and status
  - Search functionality

- **Create/Edit Modal:**
  - Product name (Arabic)
  - Category selection
  - Price and cost fields
  - Stock quantity
  - Multiple image upload with preview
  - Description textarea
  - Status selection
  - **Variants Management:**
    - Add multiple variants (colors, materials, styles)
    - Upload image for each variant
    - Set additional price per variant
    - Variant name and value fields

**What it does:**
- Manages regular products inventory
- Handles product variants (essential for special products)
- Supports multiple product images
- All products use "piece" as unit (hardcoded)
- Validates stock availability

---

### Special Products Management (`/special-products`)
**File:** `frontend/src/pages/SpecialProducts.jsx`

**Purpose:** Manage composite products built from two regular products.

**Features:**
- **List View:**
  - Special products table
  - Shows base products (Product A & B)
  - Number of combinations
  - Final price
  - Status

- **Create/Edit Modal (4-Step Process):**
  1. **Step 1 - Choose Products:**
     - Select two base products
     - Enter special product name
  
  2. **Step 2 - Generate Combinations:**
     - Automatically generates all possible combinations
     - Shows variants from both products
  
  3. **Step 3 - Upload Combination Images:**
     - Upload final image for each combination
     - Shows combination details (variant A + variant B)
     - Required for all combinations
  
  4. **Step 4 - Final Details:**
     - Set final price
     - Add description
     - Set status

**What it does:**
- Creates composite products (e.g., table = table top + table legs)
- Automatically generates all variant combinations
- Stores each combination with its own image
- Enables complex product configurations

**Example Use Case:**
- Table Top (Red, Green, Blue) + Table Legs (Metal, Wood)
- Results in 6 combinations (3 × 2)
- Each combination has its own final product image

---

## 📦 Inventory Management Pages

### Inventory Management (`/inventory`)
**File:** `frontend/src/pages/Inventory/InventoryManagement.jsx`

**Purpose:** Complete inventory control and stock management.

**Features:**
- **Dashboard Stats:**
  - Total products count
  - Low stock products count
  - Total inventory value
  - Active stock alerts count

- **Stock Alerts Section:**
  - Displays products below threshold
  - Shows current stock vs. minimum threshold
  - Resolve alert functionality

- **Products Table:**
  - Product name
  - Current stock with color coding:
    - Red: ≤ 10 pieces (critical)
    - Yellow: ≤ 50 pieces (low)
    - Green: > 50 pieces (good)
  - Product price
  - Total value (stock × price)
  - Quick adjust stock button

- **Stock Adjustment Modal:**
  - Current stock display
  - Quantity change input (positive for increase, negative for decrease)
  - Reason selection (purchase, sale, return, adjustment, damage, other)
  - Notes field
  - Creates inventory log entry

- **Inventory Logs Table:**
  - Complete history of all stock changes
  - Shows before/after quantities
  - Change type and reason
  - User who made the change
  - Date and time
  - Filters by change type and date range

**What it does:**
- Tracks all inventory movements
- Provides real-time stock visibility
- Generates alerts for low stock
- Maintains complete audit trail
- Calculates inventory value

---

## 🛒 Order Management Pages

### Orders List (`/orders`)
**File:** `frontend/src/pages/Orders/OrdersList.jsx`

**Purpose:** View and manage all customer orders.

**Features:**
- **List View:**
  - Order number
  - Client name and phone
  - Order status with color coding
  - Total amount
  - Creation date
  - Quick view button

- **Filters:**
  - Filter by status (pending, preparing, ready, delivered, completed, canceled)
  - Filter by date range
  - Search functionality

- **Status Workflow:**
  - pending → preparing → ready → delivered → completed
  - Cancel option available

**What it does:**
- Displays all orders with filtering
- Shows order status progression
- Provides quick access to order details

---

### Order Detail (`/orders/:id`)
**File:** `frontend/src/pages/Orders/OrderDetail.jsx`

**Purpose:** Detailed view and management of a single order.

**Features:**
- **Status Flow Visualization:**
  - Visual progress indicator
  - Shows current status in workflow
  - "Next" button to advance status
  - Automatic stock deduction when status changes to "completed"

- **Order Items:**
  - List of all products in order
  - Product name, quantity, unit price
  - Item total
  - Special product combinations shown

- **Order Information:**
  - Client details (name, phone, email, address)
  - Payment method
  - Order notes

- **Order Summary:**
  - Subtotal
  - Discount
  - Tax (19%)
  - Total amount
  - Cost and profit calculations

- **Activity Timeline:**
  - Complete history of order changes
  - Who made changes and when
  - Status changes
  - Notes and comments

**What it does:**
- Provides complete order management
- Tracks order lifecycle
- Automatically manages inventory when order completes
- Maintains activity log for audit purposes

---

## 🧾 Invoice Management Pages

### Invoices List (`/invoices`)
**File:** `frontend/src/pages/Invoices/InvoicesList.jsx`

**Purpose:** Manage all invoices generated from orders.

**Features:**
- **List View:**
  - Invoice number
  - Client name
  - Invoice status (draft, sent, paid, partial, overdue, canceled)
  - Total amount
  - Paid amount
  - Remaining amount
  - Due date
  - Quick view button

- **Filters:**
  - Filter by status
  - Filter by date range

**What it does:**
- Displays all invoices
- Shows payment status
- Tracks outstanding amounts

---

### Invoice Detail (`/invoices/:id`)
**File:** `frontend/src/pages/Invoices/InvoiceDetail.jsx`

**Purpose:** Detailed invoice view and payment management.

**Features:**
- **Invoice Information:**
  - Invoice number
  - Client details
  - Issue date
  - Due date
  - Invoice status

- **Invoice Items:**
  - List of all products/services
  - Quantity, unit price, total per item

- **Payment History:**
  - All payments recorded for this invoice
  - Payment method, amount, date
  - Reference numbers

- **Payment Recording:**
  - Record new payment button
  - Payment modal with:
    - Amount input
    - Payment method (cash, card, bank transfer, check)
    - Payment date
    - Reference number
    - Notes
  - Automatically updates invoice status:
    - "paid" when fully paid
    - "partial" when partially paid

- **Actions:**
  - Download PDF button (placeholder)
  - Send email button (placeholder)

- **Summary:**
  - Subtotal
  - Tax
  - Total
  - Paid amount
  - Remaining amount

**What it does:**
- Manages invoice lifecycle
- Records payments and tracks outstanding amounts
- Updates invoice status automatically
- Maintains payment history

---

## 💳 Point of Sale (POS) Pages

### POS Dashboard (`/pos`)
**File:** `frontend/src/pages/POS/POSDashboard.jsx`

**Purpose:** Store-level point of sale interface for cashiers.

**Features:**
- **Today's Stats:**
  - Today's sales count
  - Today's revenue
  - Ongoing orders count

- **Quick Actions:**
  - Create new sale
  - View sales history
  - Check low stock items

**What it does:**
- Provides store-level dashboard
- Quick access to daily metrics
- Designed for cashier role users

**Note:** Full POS interface (product search, cart, payment processing) is a placeholder for future implementation.

---

## 🚚 Supplier & Purchasing Pages

### Suppliers List (`/suppliers`)
**File:** `frontend/src/pages/Suppliers/SuppliersList.jsx`

**Purpose:** Manage supplier/vendor information.

**Features:**
- **List View:**
  - Supplier name
  - Supplier code
  - Contact person name
  - Phone number
  - Edit and delete actions

- **CRUD Operations:**
  - Create new supplier
  - Edit supplier details
  - Soft delete (deactivate) supplier

**What it does:**
- Maintains supplier database
- Stores contact information
- Links to purchase orders

---

### Purchase Orders List (`/purchase-orders`)
**File:** `frontend/src/pages/PurchaseOrders/POList.jsx`

**Purpose:** Manage purchase orders from suppliers.

**Features:**
- **List View:**
  - PO number
  - Supplier name
  - PO status (draft, sent, received, completed, canceled)
  - Total amount
  - Creation date

**What it does:**
- Tracks purchases from suppliers
- Manages PO lifecycle
- Automatically updates stock when PO is received
- Links products to suppliers for cost tracking

---

### Expenses List (`/expenses`)
**File:** `frontend/src/pages/Expenses/ExpensesList.jsx`

**Purpose:** Track business expenses and costs.

**Features:**
- **List View:**
  - Expense number
  - Category (supplies, utilities, rent, salaries, marketing, other)
  - Description
  - Amount
  - Expense date

**What it does:**
- Records all business expenses
- Categorizes expenses
- Tracks spending over time
- Links to suppliers when applicable

---

## 🔄 Returns & Refunds Pages

### Returns List (`/returns`)
**File:** `frontend/src/pages/Returns/ReturnsList.jsx`

**Purpose:** Manage product returns and refunds.

**Features:**
- **List View:**
  - Return number
  - Related order number
  - Return status (pending, approved, rejected, completed)
  - Refund amount
  - Creation date

**What it does:**
- Processes customer returns
- Tracks return requests
- Manages refund amounts
- Handles restocking of returned items
- Links to credit notes

---

## 👥 CRM Pages

### Clients List (`/crm`)
**File:** `frontend/src/pages/CRM/ClientsList.jsx`

**Purpose:** Manage customer/client relationships.

**Features:**
- **List View:**
  - Client name
  - Email address
  - Phone number
  - Total orders count
  - Total spending amount

**What it does:**
- Maintains client database
- Tracks client purchase history
- Links clients to commercials (sales representatives)
- Calculates client lifetime value

**Note:** Full CRM features (leads, pipeline, commercial performance) are placeholders for future implementation.

---

## 📈 Analytics & Reports Pages

### Analytics Dashboard (`/analytics`)
**File:** `frontend/src/pages/Analytics/AnalyticsDashboard.jsx`

**Purpose:** Business intelligence and reporting.

**Features:**
- **Key Metrics:**
  - Total sales count
  - Total revenue
  - Average order value
  - Products sold count

- **Charts:**
  - **Sales Over Time:** Line chart showing sales and revenue trends
  - **Revenue by Category:** Pie chart showing revenue distribution
  - **Top Products:** Bar chart showing best-selling products

- **Date Range Filter:**
  - Select start and end dates
  - Filter all analytics by date range

**What it does:**
- Provides business insights
- Visualizes sales trends
- Identifies top-performing products
- Analyzes revenue by category
- Supports data-driven decision making

**Available Analytics:**
- Sales over time (daily/weekly/monthly)
- Revenue by category
- Revenue by product
- Revenue by commercial/sales rep
- Orders by status
- Profitability overview (revenue vs. cost)
- Top performing products
- Low stock alerts

---

## 🔍 System Pages

### Audit Logs (`/audit-logs`)
**File:** `frontend/src/pages/AuditLogs/AuditLogs.jsx`

**Purpose:** System-wide audit trail and activity logging.

**Features:**
- **Logs Table:**
  - Timestamp
  - User who performed action
  - Resource type (user, product, order, invoice, inventory, etc.)
  - Action type (create, update, delete, status_change, price_change, stock_change)
  - Change details (before/after values)

- **Filters:**
  - Filter by resource type
  - Filter by action type
  - Filter by user
  - Filter by date range

**What it does:**
- Records all important system changes
- Provides complete audit trail
- Tracks who changed what and when
- Essential for compliance and debugging
- Shows before/after values for changes

**Tracked Resources:**
- Users
- Products
- Categories
- Orders
- Invoices
- Inventory
- Special Products
- Suppliers
- Purchase Orders

---

### Job Queue (`/jobs`)
**File:** `frontend/src/pages/Jobs/JobQueue.jsx`

**Purpose:** Monitor background jobs and tasks.

**Features:**
- **Jobs Table:**
  - Job name/ID
  - Job type (PDF generation, image processing, report generation)
  - Job status (waiting, active, completed, failed)
  - Creation date
  - Retry/Cancel buttons

**What it does:**
- Monitors background job processing
- Tracks PDF generation jobs
- Tracks image processing jobs
- Tracks report generation jobs
- Allows retry of failed jobs
- Allows cancellation of pending jobs

**Job Types:**
- Invoice PDF generation
- Order PDF generation
- Receipt PDF generation
- Report PDF/CSV generation
- Composite image generation for special products

**Note:** Requires Redis and BullMQ configuration for full functionality.

---

## 🎨 Common Components

### Layout Component
**File:** `frontend/src/components/Layout.jsx`

**Features:**
- **Sidebar Navigation:**
  - Scrollable menu (all pages accessible)
  - Active page highlighting
  - Icons for each module
  - User info and theme toggle at bottom
  - Logout button

- **Main Content Area:**
  - Responsive layout
  - RTL support
  - Dark/Light mode

**What it does:**
- Provides consistent navigation
- Manages theme switching
- Handles user authentication state
- Responsive design for all screen sizes

---

## 🔑 Key Features Across All Pages

### 1. **RTL (Right-to-Left) Support**
- All pages support Arabic language
- Text alignment and layout optimized for RTL
- Date formatting in Arabic locale

### 2. **Dark/Light Mode**
- Theme toggle in sidebar
- Consistent color scheme (black/gold for dark, white/gold for light)
- All components support both themes

### 3. **Responsive Design**
- Mobile-friendly layouts
- Tablet optimization
- Desktop full-featured views

### 4. **Data Tables**
- Sortable columns
- Search functionality
- Pagination
- Filter options

### 5. **Form Validation**
- Client-side validation
- Server-side validation
- Error messages in Arabic
- Required field indicators

### 6. **Image Upload**
- Multiple image support
- Image preview
- File type validation
- Size limits (5MB per file)

### 7. **Status Management**
- Color-coded status badges
- Status workflow progression
- Status change history

### 8. **Audit Trail**
- All important actions logged
- User tracking
- Timestamp recording
- Before/after value tracking

---

## 📱 Page Access & Permissions

### Admin Role
- Full access to all pages
- All CRUD operations
- System configuration

### Commercial Role
- Access to: Orders, Invoices, CRM, Analytics
- Can create and manage orders
- Can view assigned clients

### Store Manager Role
- Access to: POS, Inventory (store level), Orders
- Can manage store inventory
- Can process sales

### Store Cashier Role
- Access to: POS only
- Can create sales
- Can view sales history

### Inventory Manager Role
- Access to: Inventory, Products
- Can adjust stock
- Can view inventory logs

### Accountant Role
- Access to: Invoices, Payments, Expenses, Analytics
- Can manage financial records
- Can generate reports

---

## 🔄 Data Flow

### Order Flow:
1. Create Order → Validate Stock → Calculate Totals
2. Update Status → Deduct Stock (when completed)
3. Create Invoice from Order
4. Record Payments → Update Invoice Status
5. Handle Returns → Restock Items → Issue Credit Note

### Inventory Flow:
1. Product Created → Initial Stock Set
2. Stock Adjustments → Inventory Log Created
3. Order Completed → Stock Deducted → Log Created
4. Purchase Order Received → Stock Increased → Log Created
5. Return Processed → Stock Restored → Log Created

### Special Product Flow:
1. Select Two Base Products
2. System Generates All Combinations
3. Upload Image for Each Combination
4. Save Special Product
5. Special Product Can Be Sold Like Regular Product

---

## 🚀 Future Enhancements (Placeholders)

The following features have placeholders but are not fully implemented:

1. **PDF Generation:**
   - Invoice PDFs
   - Order PDFs
   - Receipt PDFs
   - Reports PDFs
   - Requires: PDFKit library + Queue system

2. **Email System:**
   - Send invoices via email
   - Order confirmations
   - Requires: Nodemailer configuration

3. **Advanced Analytics:**
   - Custom date ranges
   - Export to CSV/Excel
   - Scheduled reports
   - Requires: Additional aggregation pipelines

4. **Full POS Interface:**
   - Product search
   - Shopping cart
   - Payment processing
   - Receipt printing
   - Requires: Complete POS UI implementation

5. **Job Queue System:**
   - Full BullMQ integration
   - Job monitoring dashboard
   - Retry mechanisms
   - Requires: Redis server

---

## 📝 Notes

- All prices are in TND (Tunisian Dinar)
- All products use "piece" as the unit (hardcoded)
- Tax rate is 19% (configurable in code)
- All dates are displayed in Arabic locale format
- Images are served from `/uploads` directory
- API base URL: `/api` (proxied to backend)
- All API calls require JWT authentication (except login)

---

This documentation provides a complete overview of all pages in the Les Rois Des Bois admin dashboard. Each page is designed to be intuitive, efficient, and scalable for future enhancements.

