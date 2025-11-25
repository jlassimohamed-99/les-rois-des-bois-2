# Pages Explanation - Les Rois Des Bois Admin Dashboard

This document explains what each admin page does and how to use them.

---

## 📦 Purchase Orders (أوامر الشراء)

**Location:** `/admin/purchase-orders`

**What it is:**
Purchase Orders (PO) are documents used to order products from suppliers. This page helps you manage all your purchasing activities.

**How to use:**
1. **Create a Purchase Order:**
   - Click "إنشاء أمر شراء" (Create Purchase Order)
   - Select a supplier
   - Add products you want to purchase with quantities and unit costs
   - Set expected delivery date
   - Add notes if needed
   - Click "إنشاء" (Create)

2. **Track PO Status:**
   - **Draft (مسودة):** Just created, not sent yet
   - **Sent (مرسل):** Sent to supplier
   - **Received (مستلم):** Products received - stock is automatically updated
   - **Completed (مكتمل):** Fully processed
   - **Canceled (ملغي):** Cancelled order

3. **Receive Products:**
   - When you receive products from supplier, click the checkmark button
   - This updates the status to "Received" and automatically adds stock to your inventory

**Use Cases:**
- Ordering raw materials from suppliers
- Restocking products
- Tracking supplier deliveries
- Managing purchase costs

---

## 💰 Expenses (المصروفات)

**Location:** `/admin/expenses`

**What it is:**
Track all business expenses like rent, utilities, marketing, maintenance, etc. This helps you monitor your operational costs.

**How to use:**
1. **Add an Expense:**
   - Click "إضافة مصروف" (Add Expense)
   - Select category (Operational, Administrative, Marketing, Maintenance, Transport, Other)
   - Enter amount in TND
   - Select expense date
   - Choose payment method (Cash, Card, Bank Transfer, Check)
   - Optionally link to a supplier
   - Add reference number (invoice number, etc.)
   - Write description
   - Click "إضافة" (Add)

2. **Filter Expenses:**
   - Filter by category
   - Filter by date range
   - View total expenses in the stats cards

3. **Edit/Delete:**
   - Click edit icon to modify an expense
   - Click delete icon to remove an expense

**Use Cases:**
- Track monthly operational costs
- Monitor marketing expenses
- Record maintenance costs
- Generate expense reports for accounting

---

## 🔄 Returns (المرتجعات)

**Location:** `/admin/returns`

**What it is:**
Manage product returns from customers. When a customer returns items, you can process refunds and restock the inventory.

**How to use:**
1. **Create a Return:**
   - Click "إنشاء مرتجع" (Create Return)
   - Select the original order
   - Select which products to return and quantities
   - Set refund amount for each item
   - Enter reason for return
   - Click "إنشاء" (Create)

2. **Process Return:**
   - **Pending (قيد الانتظار):** Return request created
   - **Approved (موافق عليه):** Return approved - click checkmark to approve
   - **Completed (مكتمل):** Items restocked - click package icon to restock
   - **Rejected (مرفوض):** Return rejected

3. **Restock Items:**
   - After approving, click the package icon to restock
   - This automatically adds the returned items back to inventory

**Use Cases:**
- Handle customer returns
- Process refunds
- Restock returned items
- Track return reasons for quality control

---

## 🛒 Cart Page Fix

**Issue:** Cart icon in header wasn't working properly.

**Fix Applied:**
- Changed from `<Link>` wrapper to `onClick` with `navigate()` for better control
- Fixed both desktop and mobile menu cart buttons
- Now clicking the cart icon properly navigates to `/shop/cart`

---

## 📝 Summary

All three pages are now fully functional with:
- ✅ Complete CRUD operations
- ✅ Modal forms for creating/editing
- ✅ Status management
- ✅ Filtering and search
- ✅ Statistics and totals
- ✅ Backend API integration
- ✅ Proper error handling

You can now use all these pages to manage your business operations effectively!

