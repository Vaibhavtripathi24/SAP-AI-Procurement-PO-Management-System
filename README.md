# SAP S/4HANA AI Procurement & Purchase Order Management System

A full-stack enterprise SAP procurement intelligence application built on **SAP S/4HANA (ABAP OO + CDS Views + RAP OData V2)** integrated with **SAP Fiori UI5** and an **LLM + RAG Procurement Assistant**.

Developed and tested live on an active SAP S/4HANA server environment.

---

## 💡 Motivation & Problem Statement

In enterprise supply chains, procurement teams handle large volumes of transactional data across Purchase Orders (POs), Goods Receipts (GRs), and Vendor Scorecards. Identifying why a specific PO is delayed or determining applicable vendor penalty clauses traditionally requires switching between multiple SAP transactions (`ME23N`, `MIGO`, `SE11`, `SE24`) and navigating offline SLA policy documents.

I designed and built this system to bridge SAP transactional data with enterprise policy documentation:
- **SAP S/4HANA Core**: Core procurement logic, delay calculation, and vendor scoring implemented using ABAP OO, HANA Code Pushdown CDS Views, and OData V2 services.
- **RAG & AI Layer**: A Node.js middleware server that indexes corporate procurement SOPs, fetches live SAP OData transactional evidence, and provides fact-based analysis without AI hallucination.
- **Frontend Layer**: A responsive SAP Fiori Horizon UI5 dashboard featuring KPI tiles, searchable PO directory tables, vendor risk matrices, and a 1-click formal SLA Audit PDF exporter.

---

## 🏗️ System Architecture & Workflow

```
                                USER (Procurement Analyst / Buyer)
                                                │
                                                ▼
                                    SAP Fiori Horizon UI5 App
                       (Dashboard KPIs | PO Directory | Vendor Scorecards)
                                                │
                   ┌────────────────────────────┴────────────────────────────┐
                   ▼                                                         ▼
         SAP Gateway OData V2                                    Node.js RAG Middleware
  (/sap/opu/odata/sap/ZC_PROCUREMENT_ANALYTICS_CDS)             (Semantic Index & Evidence Grounding)
                   │                                                         │
         ┌─────────┴─────────┐                                      ┌────────┴────────┐
         ▼                   ▼                                      ▼                 ▼
  SAP S/4HANA CDS       ABAP OO Class                            Corporate SOP    Grounded Response
 (ZI_PROCUREMENT_DATA) (ZCL_PROCUREMENT_ANALYSIS)                Policy Documents  Synthesis (No AI
                                                                 (delivery_policy)   Hallucination)
```

---

## 🛠️ SAP Backend Specs & Technical Objects

### 1. Data Dictionary (`SE11`)
Designed and activated custom transparent tables for procurement operations:
- `ZPO_HEADER`: Purchase order header details (PO ID, Vendor ID, Order Date, Expected Date, Status, Total Amount, Currency).
- `ZPO_ITEM`: Purchase order line items (Item ID, Material ID, Description, Quantity, Unit Price, Net Value).
- `ZGOODS_RECEIPT`: Goods receipt posting log (GR ID, PO ID, GR Date, Received Qty, Received By, Remarks).
- `ZVENDOR_SCORE`: Vendor evaluation scorecard metrics (On-time percentage, Average delay days, Risk category).

### 2. Business Logic Class (`SE24` & `SE38`)
- **Class `ZCL_PROCUREMENT_ANALYSIS`**: Implemented Open SQL queries and methods for delay calculation (`Actual GR Date - Expected Date`) and vendor performance scoring.
- **Report `ZPROCUREMENT_ANALYSIS_REPORT`**: Executable driver report producing ALV color-coded output (Green = On-time, Yellow = 1-2 days delay, Red = 3+ days delay).

### 3. S/4HANA Core Data Services (`Eclipse ADT`)
- **Interface View (`ZI_PROCUREMENT_DATA`)**: Basic CDS data model utilizing SAP HANA `dats_days_between` function for database-level code pushdown.
- **Consumption View (`ZC_PROCUREMENT_ANALYTICS`)**: User-facing CDS view with UI annotations (`@UI.lineItem`, `@UI.selectionField`, `@Search.searchable`) and `@OData.publish: true`.

### 4. OData Service Registration (`/n/IWFND/MAINT_SERVICE`)
- Activated and registered technical service `ZC_PROCUREMENT_ANALYTICS_CDS` in SAP Gateway Service Builder catalog.
- Verified live HTTP response code `200 OK` via SAP Gateway Client (`F8`).

---

## 🧠 AI RAG Engine & Grounding Architecture

### Why RAG over Direct LLM Prompts?
Directly asking a generic LLM about internal SAP purchase order delays causes hallucination because the LLM lacks access to private SAP database tables and company SLA guidelines. 

### RAG Pipeline Design:
1. **Document Chunking**: Corporate SOPs (`delivery_policy.md`, `vendor_management_sop.md`, `po_approval_policy.md`) are split into 14 semantic chunks.
2. **Context Retrieval**: When a query (e.g., *"Why was PO 45000103 delayed?"*) is submitted, the engine extracts the PO ID, fetches live SAP database records, and matches the relevant policy clause.
3. **Fact-Based Response**: Synthesizes a grounded output citing empirical SAP evidence alongside formal policy guidelines.

---

## 📂 Project Structure

```
├── client/
│   ├── index.html           # SAP Fiori Horizon Dashboard UI
│   ├── app.js               # Frontend Controller, OData fetch & PDF generator
│   └── style.css            # Custom SAP Fiori Horizon Design System styles
├── sap-abap-core/
│   ├── ZDDIC_DEFINITIONS.abap             # DDIC transparent table definitions
│   ├── ZCL_PROCUREMENT_ANALYSIS.abap      # OO ABAP business logic class
│   ├── ZPROCUREMENT_ANALYSIS_REPORT.abap # Executable ALV report
│   ├── ZI_PROCUREMENT_DATA.cds           # Interface CDS View (HANA Pushdown)
│   ├── ZC_PROCUREMENT_ANALYTICS.cds       # Consumption CDS View with UI Annotations
│   └── ZUI_PROCUREMENT_ANALYTICS.srvd     # RAP Service Definition
├── knowledge-base/
│   ├── delivery_policy.md                 # SLA & Vendor Penalty Guidelines
│   ├── vendor_management_sop.md           # Vendor Risk Matrix & Scoring SOP
│   └── po_approval_policy.md              # PO Approval Thresholds & 3-Way Match
├── server/
│   ├── server.js            # Express API server (OData Mock & RAG endpoints)
│   ├── rag_engine.js        # Vector/Keyword RAG search engine
│   └── data.js              # SAP procurement dataset
└── README.md
```

---

## 🚀 Running the Application Locally

### Prerequisites
- Node.js (v16.0+)
- npm

### Setup Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Vaibhavtripathi24/SAP-AI-Procurement-PO-Management-System.git
   cd SAP-AI-Procurement-PO-Management-System
   ```

2. Install dependencies:
   ```bash
   cd server
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:4000
   ```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).

---
**Author**: Vaibhav Tripathi  
*SAP S/4HANA ABAP & Fiori Developer*
