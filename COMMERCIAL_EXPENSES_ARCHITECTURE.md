# Commercial Expenses & Analytics System - Architecture Documentation

## 📋 Table of Contents
1. [Database Structure](#database-structure)
2. [API Endpoints](#api-endpoints)
3. [Frontend Components](#frontend-components)
4. [User Flow](#user-flow)
5. [Implementation Guide](#implementation-guide)

---

## 🗄️ Database Structure

### ExpenseCategory Model (Updated)
```javascript
{
  _id: ObjectId,
  name: String, // "Commercial Expenses"
  orderIndex: Number,
  isCommercialExpense: Boolean, // true for Commercial Expenses
  subcategories: [String], // ["fuel", "toll", "transport", "other"]
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Model (Updated)
```javascript
{
  _id: ObjectId,
  expenseNumber: String, // Unique
  categoryId: ObjectId (ref: ExpenseCategory),
  label: String,
  amount: Number,
  date: Date,
  commercialId: ObjectId (ref: User), // Required for commercial expenses
  subcategory: String, // "fuel" | "toll" | "transport" | "other"
  customSubcategory: String, // Free text when subcategory = "other"
  notes: String,
  receiptPath: String, // Path to uploaded receipt
  recordedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### CommercialAnalytics Model (New)
```javascript
{
  _id: ObjectId,
  commercialId: ObjectId (ref: User),
  period: String, // "2024-01", "2024-Q1", "2024"
  metrics: {
    // Sales Performance
    totalRevenue: Number,
    totalOrders: Number,
    averageOrderValue: Number,
    newCustomers: Number,
    returningCustomers: Number,
    cancelledOrders: Number,
    refundedOrders: Number,
    conversionRate: Number,
    
    // Expenses
    totalExpenses: Number,
    fuelExpenses: Number,
    tollExpenses: Number,
    transportExpenses: Number,
    otherExpenses: Number,
    expenseToRevenueRatio: Number,
    
    // Productivity
    callsMade: Number,
    leadsAdded: Number,
    quotesSent: Number,
    quoteToOrderRate: Number,
    
    // Risk Indicators
    cancellationRate: Number,
    averageResponseTime: Number, // minutes
  },
  createdAt: Date,
  updatedAt: Date
}
```

### CommercialActivity Model (New - for tracking)
```javascript
{
  _id: ObjectId,
  commercialId: ObjectId (ref: User),
  activityType: String, // "call", "lead", "quote", "order", "expense"
  activityData: Object, // Flexible structure
  timestamp: Date,
  metadata: Object
}
```

---

## 🔌 API Endpoints

### Expense Categories
- `GET /api/expense-categories` - List all categories
- `POST /api/expense-categories` - Create category
- `PUT /api/expense-categories/:id` - Update category
- `DELETE /api/expense-categories/:id` - Delete category

### Expenses (Updated)
- `GET /api/expenses?commercialId=&subcategory=&from=&to=` - List expenses with filters
- `POST /api/expenses` - Create expense (supports commercial expenses)
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/commercial/:commercialId` - Get expenses for a commercial

### Commercial Analytics (New)
- `GET /api/analytics/commercials` - List all commercials with metrics
- `GET /api/analytics/commercials/:id` - Detailed analytics for one commercial
- `GET /api/analytics/commercials/:id/expenses` - Expense breakdown
- `GET /api/analytics/commercials/:id/sales` - Sales performance
- `GET /api/analytics/commercials/:id/productivity` - Productivity metrics
- `GET /api/analytics/commercials/compare` - Compare multiple commercials
- `GET /api/analytics/commercials/:id/export?format=pdf|excel` - Export analytics

### Upload
- `POST /api/uploads/expense/receipt` - Upload receipt (image or PDF)

---

## 🎨 Frontend Components

### 1. ExpenseModal (Updated)
- Conditionally show commercial expense UI
- Subcategory dropdown (Fuel, Toll, Transport, Other)
- Custom text input for "Other"
- Commercial selector dropdown
- Receipt upload component
- Real-time validation

### 2. CommercialExpenseForm (New)
- Special form for commercial expenses
- All fields required for commercial expenses
- Receipt preview
- Upload progress indicator

### 3. CommercialAnalyticsDashboard (New)
- Main dashboard page
- KPI cards at top
- Multiple chart sections
- Filters and date range picker
- Export buttons

### 4. CommercialPerformanceChart (New)
- Line/Bar charts for sales over time
- Recharts library

### 5. ExpenseAnalyticsChart (New)
- Donut/Pie chart for expense breakdown
- Bar chart for expense trends

### 6. CommercialComparisonTable (New)
- Comparison table
- Sortable columns
- Ranking leaderboard

### 7. CommercialDetailPage (New)
- Individual commercial profile
- All metrics and charts
- Expense table with filters
- Activity timeline
- Notes section

### 8. ExpenseTable (Enhanced)
- Filters: commercial, category, subcategory, date range
- Receipt view modal
- Export to CSV

---

## 🔄 User Flow

### Adding Commercial Expense
1. User clicks "Add Expense"
2. Selects "Commercial Expenses" category
3. Special UI appears:
   - Commercial dropdown (required)
   - Subcategory dropdown (Fuel, Toll, Transport, Other)
   - If "Other" selected → text input appears
   - Amount field
   - Date picker
   - Notes (optional)
   - Receipt upload (required)
4. Form validation
5. Submit → Expense created with commercial link

### Viewing Analytics
1. Navigate to Commercial Analytics Dashboard
2. See overview of all commercials
3. Click on commercial → Detailed view
4. Filter by date range
5. View different metrics tabs
6. Export reports

---

## 🛠️ Implementation Guide

### Step 1: Initialize Commercial Expenses Category
Create a script to add the category with subcategories.

### Step 2: Update Expense Modal UI
Add conditional rendering for commercial expenses.

### Step 3: Create Analytics Controller
Build all analytics endpoints with aggregation queries.

### Step 4: Create Dashboard Components
Build all chart and table components.

### Step 5: Add Export Functionality
Implement PDF and Excel export.

---

## 📊 Analytics Metrics Calculation

### Sales Performance
- Total Revenue: Sum of order totals
- Average Order Value: Total Revenue / Order Count
- Conversion Rate: (Orders / Quotes) * 100
- Growth %: ((Current - Previous) / Previous) * 100

### Expense Analytics
- Expense to Revenue Ratio: (Total Expenses / Total Revenue) * 100
- Profit: Revenue - Expenses
- Expense Anomaly: Expenses > (Average * 1.5)

### Productivity
- Quote to Order Rate: (Orders / Quotes) * 100
- Average Response Time: Average time between lead and first contact

---

## 🎯 Next Steps

1. Create initialization script for Commercial Expenses category
2. Update ExpenseModal component
3. Create analytics controller with all endpoints
4. Build dashboard UI components
5. Add export functionality
6. Implement permissions (admin vs commercial view)


