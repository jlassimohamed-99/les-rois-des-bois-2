# Les Rois des Bois - Implementation Plan

## Status Overview

### ✅ Completed
1. Order model updated with `source` field (catalog, pos, commercial_pos, admin)
2. Invoice model updated with ROI-INV-YYYY-XXXX numbering format
3. Job model created for job queue
4. Client selection added to commercial/admin POS

### 🔄 In Progress
1. Unified order flow - linking all order sources
2. Invoice lifecycle (PDF generation, payments)
3. Analytics across sources
4. Job queue implementation

### ⏳ Pending
1. Admin Orders page updates
2. PDF generation service
3. Email service
4. Permission enforcement
5. UI polish
6. Tests and documentation

## Implementation Steps

### Phase 1: Order Flow Unification ✅
- [x] Add source field to Order model
- [ ] Update createOrder controller to accept source
- [ ] Update POS controllers to set source='pos'
- [ ] Update commercial order creation to set source='commercial_pos'
- [ ] Update client order creation to set source='catalog'
- [ ] Update admin order creation to set source='admin'

### Phase 2: Invoice System
- [ ] Create PDF generation service with Puppeteer
- [ ] Implement invoice numbering (ROI-INV-YYYY-XXXX)
- [ ] Add payment tracking to Invoice model
- [ ] Create invoice generation endpoint
- [ ] Implement email sending for invoices

### Phase 3: Job Queue
- [ ] Set up BullMQ
- [ ] Create worker process
- [ ] Implement PDF generation jobs
- [ ] Implement email jobs
- [ ] Create job monitoring UI

### Phase 4: Analytics
- [ ] Create analytics aggregation endpoints
- [ ] Filter by source, store, commercial
- [ ] Add caching layer
- [ ] Update frontend analytics page

### Phase 5: Permissions
- [ ] Review and enforce RBAC on all endpoints
- [ ] Add commercial filter middleware
- [ ] Add store filter middleware
- [ ] Secure admin routes

### Phase 6: UI/UX
- [ ] Update Admin Orders page with source filter
- [ ] Add order source badges
- [ ] Complete invoice management UI
- [ ] Add job monitoring page
- [ ] Fix broken links and buttons

### Phase 7: Testing & Documentation
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Create seed data script
- [ ] Write API documentation
- [ ] Create deployment guide

