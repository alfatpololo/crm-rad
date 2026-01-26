# Implementation Plan - PT RAD CRM

## Reference
User's 10-point request for a complete CRM system overhaul.

## 1. Core System & Authentication (Critical Fixes)
- [x] **Fix Login/Session Issue**: Resolve "Unable to detect Project Id" error to ensure Admin SDK works and users can log in.
- [ ] **Role-Based Access Control (RBAC)**:
    - [ ] Define Roles: `superadmin`, `admin`, `user` (peserta).
    - [ ] Update `AuthProvider` and Middleware to handle specific dashboards.

## 2. Menu Structure & Navigation (Points 9 & 10)
- [x] **Admin Sidebar**:
    - Dashboard
    - Invoice Manager
    - Master Data
    - CRM
    - Report
    - Setting
- [x] **User (Peserta) Sidebar**:
    - Dashboard (Events, Bills, Promos)
    - Services/Classes
    - Certificate Tracking
    - Request Extension
    - Attendance History
    - Payment History
    - Profile

## 3. CRM Module (Point 1)
- [ ] **Database Schema**: `participants` collection.
- [ ] **Features**:
    - List Participants (Search/Filter).
    - Certification History (Sub-collection or Reference).
    - Payment History.
    - Attendance (RSVP) History.
    - Certificate Tracking (Status: On Progress, Completed, Published -> PDF Preview).
    - Import/Export Data (Excel/CSV).
    - Blast Promo (Select All/Filtered Users).

## 4. Master Data Module (Point 2)
- [ ] **Services/Classes**: manageable list (CRUD).
- [ ] **Products/Merchandise**: manageable list with Stock management.
- [ ] **Categories**: for sorting services/products.
- [ ] **Payment Methods**: Full Payment vs Staggered Payment configuration.
- [ ] **Tax & Vouchers**: Configuration.

## 5. Invoice Generator (Point 3)
- [ ] **Refactor Existing Invoice Module**:
    - Auto-numbering logic.
    - Dynamic Items (Pick from Services/Products).
    - Auto-calculation (Tax, Vouchers).
    - Statuses: Paid, Unpaid, Partially, Cancelled, Overdue.
    - Notifications: Trigger Email/WhatsApp (simulated or API).

## 6. Dashboard Analytics (Admin - Point 4)
- [ ] **Widgets**:
    - Total Revenue (Current Batch).
    - Unpaid Bills.
    - Total Participants (All Batches).
    - Products Sold (Monthly).

## 7. Reports (Point 5)
- [ ] **Revenue Report**: Export Excel/PDF.
- [ ] **Expense Report**: Upload proof of payment.
- [ ] **Activity Log**: Superadmin view.

## 8. Settings (Point 6)
- [ ] **General**: User Roles, Logo Update.
- [ ] **Templates**: Invoice (PDF Editor/Settings), WhatsApp Notification, Blast Promo, Banner Promo.

## 9. Backup & Restore (Point 7)
- [ ] Export JSON features for collections.

## 10. Chatbot (Point 8)
- [ ] Simple follow-up automation logic.

---

## Immediate Next Steps (Session 1)
1. Fix Authentication (Admin SDK Project ID error).
2. Implement Admin Sidebar Menu Structure.
3. Begin CRM Participant List.
