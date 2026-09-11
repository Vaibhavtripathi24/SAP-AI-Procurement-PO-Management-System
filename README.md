# 🚀 SAP S/4HANA AI Procurement & PO Management System
> **LLM + Grounded RAG Based Procurement Intelligence for SAP S/4HANA**

[![SAP S/4HANA](https://img.shields.io/badge/SAP-S%2F4HANA_2020%2B-0A6ED1?style=for-the-badge&logo=sap)](https://sap.com)
[![ABAP OO](https://img.shields.io/badge/ABAP-Object_Oriented-354A5F?style=for-the-badge)](https://sap.com)
[![CDS Views](https://img.shields.io/badge/SAP_CDS-Code_Pushdown-008080?style=for-the-badge)](https://sap.com)
[![OData V2](https://img.shields.io/badge/SAP_Gateway-OData_V2-FF6600?style=for-the-badge)](https://sap.com)
[![SAP Fiori](https://img.shields.io/badge/UI5-SAP_Fiori_Horizon-0A6ED1?style=for-the-badge&logo=sap)](https://sap.com)
[![RAG AI](https://img.shields.io/badge/AI Engine-Grounded_RAG-4B32C3?style=for-the-badge)](https://github.com)

---

## 📌 Project Overview

In enterprise procurement operations, buyers and managers frequently handle complex workflows involving **Vendors**, **Purchase Requisitions (PR)**, **Purchase Orders (PO)**, **Goods Receipts (GR)**, and **Corporate SLA Policies**. Investigating delayed orders or identifying penalty waivers requires navigating multiple SAP transactions (`ME23N`, `MIGO`, `SE11`, `SE24`) and dense SOP PDFs.

This repository provides an **End-to-End Enterprise Solution**:
1. **SAP Core Layer**: Implemented in native ABAP OO, S/4HANA CDS Views (Code Pushdown), and RAP/OData V2 services registered in SAP Gateway (`/n/IWFND/MAINT_SERVICE`).
2. **AI Intelligence Layer**: Powered by a **Grounded Retrieval-Augmented Generation (RAG)** engine that parses SAP transactional data alongside indexed enterprise SLA policy documents (`delivery_policy.md`, `vendor_management_sop.md`), delivering **100% fact-based responses without AI hallucination**.
3. **SAP Fiori UI5 Dashboard**: Production-grade UI featuring real-time KPI tiles, PO directory tables, vendor risk scorecards, automated PDF penalty export, and an interactive AI assistant drawer.

---

## 🏗️ System Architecture

```
                  USER (Procurement Manager / Analyst)
                                 │
                                 ▼
                     SAP Fiori UI5 Dashboard
        (KPI Tiles | PO Directory | Vendor Scorecards | PDF Export)
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
         OData V2 REST Service         Grounded RAG Engine
      (SAP Gateway / Node Server)   (SOP Document Vector Index)
                   │                           │
         ┌─────────┴─────────┐        ┌────────┴────────┐
         ▼                   ▼        ▼                 ▼
   SAP S/4HANA          ABAP OO   Indexed SOP      Grounded
   CDS Views            Classes   Policy Docs      AI Prompts
 (ZI_PROCUREMENT)    (ZCL_PROC...) (delivery_policy) (No Hallucination)
```

---

## ⚡ Key Features & 12-Phase Lifecycle

- **Phase 1: Business Flow & SLA Formula**: Formal delay calculation ($\text{Actual Date} - \text{Expected Date}$) and SLA thresholds.
- **Phase 2 & 3: Data Dictionary (DDIC)**: Custom transparent tables `ZPO_HEADER`, `ZPO_ITEM`, `ZGOODS_RECEIPT`, and `ZVENDOR_SCORE` created & activated in `SE11`.
- **Phase 4: Sample Data Population**: Executable report `ZPOPULATE_PROCUREMENT_DATA` populates test datasets with on-time, delayed, and overdue orders.
- **Phase 5 & 6: ABAP OO Business Logic**: `ZCL_PROCUREMENT_ANALYSIS` class and `ZPROCUREMENT_ANALYSIS_REPORT` for ALV color-coded delay analysis.
- **Phase 7: S/4HANA CDS Views**: Code Pushdown Interface View (`ZI_PROCUREMENT_DATA`) and Consumption View (`ZC_PROCUREMENT_ANALYTICS`) with Fiori UI annotations.
- **Phase 8: OData Service Exposure**: Registered service `ZC_PROCUREMENT_ANALYTICS_CDS` in `/n/IWFND/MAINT_SERVICE` and verified live with **`HTTP 200 OK`**.
- **Phase 9: SAP Fiori UI5 Integration**: Dynamic dashboard with search, status filter, and line-item details modal.
- **Phase 10: RAG Knowledge Base Indexing**: Semantic chunking of corporate SOPs (`delivery_policy.md`, `vendor_management_sop.md`, `po_approval_policy.md`).
- **Phase 11: Grounded RAG AI Assistant**: Fact-based AI query pipeline generating responses with empirical SAP evidence and SOP citations.
- **Phase 12: SLA Penalty PDF Report Export**: 1-Click print-ready SAP SLA Audit & Penalty PDF report generator with automated deduction calculations.

---

## 💻 Tech Stack & SAP Objects

### Backend & SAP ABAP Core
- **Database Tables**: `ZPO_HEADER`, `ZPO_ITEM`, `ZGOODS_RECEIPT`, `ZVENDOR_SCORE`
- **OO Class**: `ZCL_PROCUREMENT_ANALYSIS` (`SE24`)
- **Executable Report**: `ZPROCUREMENT_ANALYSIS_REPORT` (`SE38`)
- **Core Data Services**: `ZI_PROCUREMENT_DATA.cds` (Basic View), `ZC_PROCUREMENT_ANALYTICS.cds` (Consumption View)
- **OData Registration**: `/n/IWFND/MAINT_SERVICE` (`ZC_PROCUREMENT_ANALYTICS_CDS`)

### Frontend & AI Middleware
- **Frontend**: HTML5, CSS3 (SAP Fiori Horizon Design System), Vanilla JS (ES6+)
- **Middleware**: Node.js, Express.js, CORS
- **AI RAG Engine**: Custom Semantic Text Chunking & Vector/Keyword Similarity Index

---

## 🚀 Quick Setup & Installation Guide

### Prerequisites
- Node.js (v16.x or higher)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Vaibhavtripathi24/SAP-AI-Procurement-PO-Management-System.git
cd SAP-AI-Procurement-PO-Management-System
```

### 2. Install Dependencies & Start Server
```bash
cd server
npm install
npm start
```

### 3. Open Web Dashboard
Navigate to `http://localhost:4000` in Google Chrome or Microsoft Edge.

---

## 🤖 Sample AI RAG Prompts & Grounded Outputs

### Prompt 1: `Why was PO 45000103 delayed?`
- **Grounded Evidence**: PO 45000103 from vendor *Global Logistics & Steel Corp (V003)* was delayed by **7 days** (Expected: 15.08.2026, Actual: 22.08.2026). GR Remark: *"Severe 7-day delay. Port congestion in Rotterdam."*
- **SOP Citation**: `delivery_policy.md (Section 3: Vendor Penalties & Compensation)`
- **Action**: Applies 1.5%/week invoice penalty deduction ($510.00 USD) and 15-point vendor score reduction.

---

## 📄 SAP SLA Audit & Penalty PDF Report
Clicking **`📄 Export Penalty PDF`** generates an official audit report:
- Document ID: `SLA-AUDIT-45000103-XXXX`
- Breakdown of `ZPO_ITEM` line items
- Applied SLA Penalty Rate & Net Payable Calculation
- Formal Executive Signature Blocks for Procurement Lead & CPO

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for details.

---

### 👨‍💻 Developer & Maintainer
**Vaibhav Tripathi** — SAP ABAP & S/4HANA AI Developer  
*Built & Verified Live on SAP S/4HANA Server*
