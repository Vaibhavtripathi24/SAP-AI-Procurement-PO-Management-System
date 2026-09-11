# SAP S/4HANA Procurement & AI Assistant

A full-stack SAP procurement management web application built with **SAP S/4HANA (ABAP OO, CDS Views, OData)** and an integrated **AI Assistant** for purchase order analysis.

---

## 📌 About The Project

In SAP MM, tracking purchase order delays and understanding vendor penalties often requires checking multiple transaction codes (`ME23N`, `MIGO`, `SE11`, `SE24`) and offline SOP policy documents.

I built this project to bring together real SAP S/4HANA transactional data with company procurement policies:
- **SAP S/4HANA Backend**: Custom DDIC tables, ABAP OO business logic, HANA CDS Views, and OData V2 services registered in SAP Gateway (`/n/IWFND/MAINT_SERVICE`).
- **Web App & AI Assistant**: A modern Fiori-inspired dashboard that displays PO metrics, vendor risk scorecards, exports formal penalty PDF reports, and provides an AI assistant to answer delay and policy queries using RAG.

---

## ✨ Features

- **Dashboard KPIs**: Real-time PO counts, delayed order tracking, on-time delivery rate, and high-risk vendor indicators.
- **Purchase Orders Directory**: Searchable list of POs with line-item details, warehouse posting logs, and status badges.
- **Vendor Scorecards**: Performance evaluation based on on-time delivery rates and average delay days.
- **SLA Penalty PDF Exporter**: Generates 1-click formal penalty audit reports for delayed POs with calculated invoice deductions.
- **Grounded AI Assistant**: Answers queries like *"Why was PO 45000103 delayed?"* using SAP database records and policy documents without AI hallucination.

---

## 🛠️ SAP Backend Architecture

1. **Tables (`SE11`)**: `ZPO_HEADER`, `ZPO_ITEM`, `ZGOODS_RECEIPT`, `ZVENDOR_SCORE`
2. **ABAP Logic (`SE24` / `SE38`)**: Class `ZCL_PROCUREMENT_ANALYSIS` and report `ZPROCUREMENT_ANALYSIS_REPORT` for ALV delay analysis.
3. **CDS Views (Eclipse ADT)**:
   - `ZI_PROCUREMENT_DATA`: Basic view using HANA `dats_days_between` function.
   - `ZC_PROCUREMENT_ANALYTICS`: Consumption view with UI annotations and `@OData.publish: true`.
4. **OData Service (`/n/IWFND/MAINT_SERVICE`)**: Technical service `ZC_PROCUREMENT_ANALYTICS_CDS` registered and verified in SAP Gateway.

---

## 📁 Repository Structure

```
├── client/              # Fiori-inspired HTML/CSS/JS frontend
├── sap-abap-core/       # DDIC tables, ABAP OO classes, CDS views, and SRVD files
├── knowledge-base/      # Corporate procurement policy SOP documents (.md)
├── server/              # Node.js Express server & RAG engine
└── README.md
```

---

## 🚀 How to Run

1. Clone the repo:
   ```bash
   git clone https://github.com/Vaibhavtripathi24/SAP-AI-Procurement-PO-Management-System.git
   cd SAP-AI-Procurement-PO-Management-System/server
   ```

2. Install dependencies and start:
   ```bash
   npm install
   npm start
   ```

3. Open in browser:
   `http://localhost:4000`

---

## 👤 Author

**Vaibhav Tripathi**  
*SAP S/4HANA ABAP & Fiori Developer*
