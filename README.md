<<<<<<< HEAD
# AcxiomCRM — Enterprise Customer Relationship Management Platform

A role-based, production-structured Customer Relationship Management (CRM) web application built with **Java (Spring Boot 3.3.4)**, **Spring Security (JWT + BCrypt)**, **Hibernate / JPA**, and a **React 18 + Vite** frontend.

Designed strictly in accordance with the **AcxiomCRM Functional & Technical Project Specification**.

---

## 🌟 Key Features & Specification Compliance

### 1. Authentication & Security (Section 4.2, 6, 14)
* **Secure Password Hashing:** Powered by BCrypt adaptive hashing with salted hashes. Passwords and hashes are never exposed in responses or logs.
* **Password Policy:** Minimum 8 characters, requiring at least one letter and one number.
* **Account Lockout Policy:** Automatically tracks failed login attempts. Upon 5 consecutive failed attempts, the account is temporarily locked for 15 minutes.
* **Administrator Unlock:** Administrators can view lockout states and immediately unlock accounts with 1 click.
* **Stateless JWT Tokens:** Stateless session authorization passed via HTTP Bearer tokens.

### 2. Role-Based Access Control (RBAC) (Section 7, 17.10)
| Role | Access Scope |
| :--- | :--- |
| **👑 Admin** | Full system access: User & Role Administration, Audit Log Trail, CRM master records, and Global Reports. |
| **💼 Manager** | Team/Business scope: Team pipeline, team records, management reports, and view-level audit logs. |
| **🚀 Sales Executive** | Scoped access: View and manage assigned customers, leads, opportunities, follow-ups, and personal activities. |

> **⚡ 1-Click Persona Switcher:** The login page features 1-click demo login buttons for **Admin**, **Manager**, and **Sales Executive** so evaluators can instantly test each permission scope without entering passwords.

---

### 3. Core CRM Modules

* **📊 Executive Dashboard (Section 4.3, 17.11, 17.12):**
  * Live KPI Cards: Total Customers, Total Leads, Open Leads, Total Opportunities, Won Deals, Lost Deals, Total Pipeline Value, Weighted Pipeline Value, Pending Follow-Ups, and Overdue Alert counter.
  * **Chart.js Visualizations:**
    * Lead Status Distribution (Doughnut Chart: *New, Contacted, Qualified, Unqualified, Converted, Lost*)
    * Opportunity Pipeline Stage Values (Bar Chart: *Qualification, Proposal, Negotiation, Won, Lost*)
    * Monthly Closed Won Revenue Trends (Line Chart: trailing 6 months)
  * Period Filtering: *All Time, Today, This Week, This Month*.

* **👥 Customer Management (Section 4.4, 17.5):**
  * Auto-generated Customer Codes (`CUST-1001`).
  * Contact info, company, address, city, state, account owner assignment.
  * Validations: Client-side and server-side email validation, 10-digit phone validation, uniqueness enforcement, and duplicate customer detection.

* **🎯 Lead Management & Conversion (Section 4.5, 8, 17.6):**
  * Lead capture with source, priority (*Low, Medium, High*), status, and expected deal size.
  * **1-Click Lead-to-Customer & Opportunity Conversion:** Converts qualified leads into both a Customer account and an active Opportunity deal in the sales pipeline, recording the conversion event in the immutable audit trail.

* **📈 Sales Opportunities & Pipeline (Section 4.8, 17.7):**
  * Interactive **List View** and visual **Kanban Pipeline Board**.
  * Pipeline stages: *Qualification, Proposal, Negotiation, Won, Lost*.
  * **Derived Weighted Pipeline Value:** Auto-calculated using `(Amount × Probability) / 100`.
  * Business Validations:
    * Amount must be > 0.
    * Probability must be between 0 and 100.
    * Expected close date cannot be in the past for active deals.

* **📅 Follow-Up & Reminder Management (Section 4.6, 17.7):**
  * Activity types: *Call, Meeting, Demo, Email, Check-In*.
  * Distinct status tabs: *All, Upcoming, Overdue, Completed*.
  * Business Validation: Follow-up date cannot be earlier than today for planned touchpoints.
  * 1-Click quick actions: *Mark as Completed* or *Reschedule*.

* **📝 Activity Management (Section 17.2, 17.3):**
  * Complete timeline of client interactions (*Calls, Meetings, Emails, Tasks*).

* **🛡️ Security & Audit Logging (Section 4.9, 17.16):**
  * Append-only, tamper-resistant audit trail.
  * Records: Timestamp, User, Action (*LOGIN, LOGIN_FAILED, ACCOUNT_LOCKED, CREATE, UPDATE, DELETE, LEAD_CONVERTED, ROLE_CHANGE*), Entity, Before/After values, IP Address, and status.

* **📑 Reports & Data Exports (Section 4.11, 11):**
  * Stage-wise & Owner-wise Pipeline analysis.
  * Lead Conversion efficiency metrics.
  * Team effort & activity matrix.
  * **1-Click CSV Exports:** Direct CSV download for Customers, Leads, Opportunities, Follow-Ups, and Audit Logs.

---

### 4. 🔗 Universal Interconnection & Shared Demo Data Architecture

Every page in AcxiomCRM is directly linked to every other page, sharing identical customer accounts, contacts, pipeline deals, follow-up schedules, and touchpoint logs:

1. **🔗 Persistent Quick-Jump Hub Ribbon (`CrossModuleNav`):**
   * Located at the top of every screen for 1-click transitions between **Dashboard, Customers, Leads, Deals, Follow-Ups, Activities, Reports, Users, and Audit Logs**.
   * Displays live counter badges for each active module.
2. **👥 Customers ↔ Pipeline ↔ Tasks ↔ Activities:**
   * Clicking any customer name opens a **Customer 360° Profile Modal** displaying their connected Deals, scheduled Follow-Ups, and Activity history.
   * Direct in-row navigation pills jump to filtered deals (`"2 Deals (₹85L)"`) or tasks (`"1 Task"`).
   * 1-click action buttons to schedule a follow-up or log an activity for that client.
3. **🎯 Leads ↔ Customers ↔ Deals:**
   * Inbound leads feature direct buttons to **Schedule Follow-Up** or **Log Touchpoint**.
   * Converting a qualified lead automatically provisions the Customer Account + Pipeline Deal and renders a **Conversion Success Banner** with 1-click jump buttons to view the created Customer or active Deal.
4. **💼 Opportunities (Kanban & Table) ↔ Customers:**
   * Customer names in Kanban cards and table rows are clickable links that jump straight to the Customer Directory with that client pre-filtered.
   * Action buttons on each deal to schedule touchpoints or log notes.
5. **📅 Follow-Ups ↔ Customers & Leads:**
   * Linked customer and lead names jump straight to their respective profiles.
   * **"Mark Done & Log Activity"** button marks the task completed and auto-navigates to the Activity Log with the meeting context pre-filled.
6. **📝 Activities ↔ Next Steps:**
   * Touchpoints provide a **"Schedule Next Follow-Up"** shortcut to plan the next cadence without losing context.
7. **📈 Reports ↔ Deep Drill-Downs:**
   * Every analytics card links to the underlying operational module (e.g., Open Pipeline Board, Inspect Leads, View Touchpoints).
8. **🔍 Omnipresent Global Search:**
   * Header search bar provides instant typeahead preview across Customers, Leads, and Deals with 1-click navigation.

---

## 🛠️ Technology Stack

* **Backend:**
  * Java 21+ / Spring Boot 3.3.4
  * Spring Security 6 with JWT
  * Spring Data JPA / Hibernate
  * H2 Database (File-persisted under `backend/crm_data/acxiomcrm`)
  * Jakarta Bean Validation (Hibernate Validator)
* **Frontend:**
  * React 18 + Vite 5
  * Chart.js + `react-chartjs-2`
  * Lucide React Icons
  * Bootstrap 5.3 + Custom Design Tokens (`index.css`)

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Java JDK 21+** (`java -version`)
2. **Apache Maven 3.8+** (`mvn -version`)
3. **Node.js 18+ and npm** (`node -v`, `npm -v`)

---

### Option A: 1-Click Launchers (Windows)
Double-click either launcher script in the project root:
* **`start_project.bat`** (or right-click `start_project.ps1` -> Run with PowerShell)

This will automatically launch the Spring Boot backend on **port 8080** and the React frontend on **port 5173**.

---

### Option B: Manual Command Line Execution

#### 1. Start the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
* Backend API starts at: `http://localhost:8080`
* H2 Database Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./crm_data/acxiomcrm`, User: `sa`, Password: empty)

#### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
* Web Interface opens at: `http://localhost:5173`

---

## 👥 Pre-Configured Demo Accounts

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@acxiom.com` | `Admin@1234` | Full system governance, User admin, Audit logs (Aarav Sharma) |
| **💼 Manager** | `manager@acxiom.com` | `Manager@1234` | Team pipeline, Conversion metrics, Management reports (Pooja Verma) |
| **🚀 Sales Executive** | `sales@acxiom.com` | `Sales@1234` | Rohan Verma's assigned customers, leads, deals & follow-ups |
| **🚀 Sales Executive** | `rachel@acxiom.com` | `Rachel@1234` | Neha Gupta's assigned sales portfolio |

*(Tip: You can also click the demo persona cards directly on the login screen or use the "Switch Persona" button in the top navigation bar at any time).*

---

## 🧪 Automated Testing & Acceptance Verification

Automated test cases covering the mandatory checklist from **Section 13, 17.17, and 17.19** of the specification are included in `AcxiomCrmApplicationTests.java`.

To execute the test suite:
```bash
cd backend
mvn test
```

### Verified Acceptance Scenarios:
1. `testValidLogin`: Valid login succeeds with token, role, and user profile.
2. `testAccountLockout`: 5 consecutive failed login attempts locks account for 15 minutes.
3. `testOpportunityAmountZeroOrNegative`: Opportunity with Amount <= 0 is rejected with `"Opportunity Amount must be greater than 0."`
4. `testOpportunityProbabilityGreaterThan100`: Probability > 100 is rejected with `"Probability must be between 0 and 100."`
5. `testOpportunityCloseDateInPast`: Close date in the past is rejected for active deals with `"Expected Close Date cannot be in the past."`
6. `testFollowUpDateBeforeToday`: Follow-up date earlier than today is rejected with `"Follow-up date cannot be earlier than today."`
7. `testCustomerDuplicateEmail`: Duplicate email creation is blocked and returns conflict.
8. `testLeadConversion`: Qualified lead conversion automatically generates Customer + Opportunity records and logs audit history.
9. `testDashboardStats`: Live calculation of role-based KPI sums, stage values, and Chart.js datasets.

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public (Rate-limited/Lockout) |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & role | Authenticated |
| `GET` | `/api/dashboard/stats` | Role-filtered KPIs, pipeline values & chart data | Authenticated |
| `GET` | `/api/customers` | Search & list customer records | Authorized scope |
| `POST` | `/api/customers` | Create customer with validations | Authorized |
| `PUT` | `/api/customers/{id}` | Update customer record | Authorized |
| `DELETE` | `/api/customers/{id}` | Delete / de-activate customer | Authorized |
| `GET` | `/api/leads` | Search & list inbound leads | Authorized scope |
| `POST` | `/api/leads` | Capture new lead | Authorized |
| `POST` | `/api/leads/{id}/convert`| Convert lead into Customer + Opportunity | Authorized |
| `GET` | `/api/opportunities` | Search & list deals (List / Kanban) | Authorized scope |
| `POST` | `/api/opportunities` | Create deal with Amount/Prob/Date rules | Authorized |
| `GET` | `/api/followups` | Filter upcoming & overdue touchpoints | Authorized scope |
| `POST` | `/api/followups` | Schedule follow-up (Date >= today) | Authorized |
| `GET` | `/api/activities` | Log of Calls, Meetings, Emails & Tasks | Authorized scope |
| `GET` | `/api/reports/pipeline`| Stage-wise & Owner-wise pipeline report | Authorized |
| `GET` | `/api/reports/conversion`| Lead conversion rate analytics | Authorized |
| `GET` | `/api/reports/export` | Export CSV for any CRM module | Authorized |
| `GET` | `/api/users` | List application users | Admin / Manager |
| `POST` | `/api/users/{id}/unlock`| Unlock locked user account | Admin only |
| `GET` | `/api/audit-logs` | Query append-only audit trail | Admin / Manager |
=======
# Acxiom_CRM_Project
>>>>>>> origin/main
