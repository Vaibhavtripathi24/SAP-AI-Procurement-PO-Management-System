/**
 * SAP S/4HANA AI Procurement & PO Management Server
 * Hybrid Middleware routing OData requests to SAP Gateway or DEVELOPMENT_MOCK_MODE
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const sapODataClient = require('./sapODataClient');
const ragEngine = require('./rag_engine');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// ---------------------------------------------------------------------
// SAP ODATA API ENDPOINTS
// ---------------------------------------------------------------------

// 1. System Status & Integration Mode Endpoint
app.get('/api/sap/status', (req, res) => {
  res.json({
    mode: sapODataClient.mode,
    sap_host: sapODataClient.mode === 'REAL_SAP' ? sapODataClient.host : 'Not Configured (DEVELOPMENT_MOCK_MODE)',
    service_path: sapODataClient.servicePath,
    authenticated_user: sapODataClient.user || 'None'
  });
});

// 2. Dashboard KPI Summary
app.get('/api/sap/summary', async (req, res) => {
  try {
    const summary = await sapODataClient.getProcurementSummary();
    res.json(summary);
  } catch (err) {
    console.error('[API ERROR] Summary endpoint failed:', err.message);
    res.status(500).json({ error: "Failed to fetch procurement summary from SAP Gateway", details: err.message });
  }
});

// 3. Purchase Orders Directory Endpoint
app.get('/api/sap/pos', async (req, res) => {
  try {
    const pos = await sapODataClient.getPurchaseOrders(req.query);
    res.json(pos);
  } catch (err) {
    console.error('[API ERROR] Purchase Orders endpoint failed:', err.message);
    res.status(500).json({ error: "Failed to fetch Purchase Orders from SAP Gateway", details: err.message });
  }
});

// 4. Single Purchase Order Detail
app.get('/api/sap/pos/:id', async (req, res) => {
  try {
    const po = await sapODataClient.getPoDetail(req.params.id);
    if (!po) {
      return res.status(404).json({ error: "Purchase Order not found in SAP system" });
    }
    res.json(po);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch PO details from SAP Gateway", details: err.message });
  }
});

// 5. Vendor Performance Scorecards Endpoint
app.get('/api/sap/vendors', async (req, res) => {
  try {
    const scorecards = await sapODataClient.getVendorScorecards();
    res.json(scorecards);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Vendor Scorecards from SAP Gateway", details: err.message });
  }
});

// ---------------------------------------------------------------------
// GROUNDED AI RAG INTELLIGENCE API ENDPOINT
// ---------------------------------------------------------------------
app.post('/api/ai/ask', async (req, res) => {
  const { query } = req.body;
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: "Query prompt is required." });
  }

  try {
    console.log(`[AI RAG API] Processing Query: "${query}"`);
    // Fetch live PO dataset from SAP OData integration layer
    const liveSapPOs = await sapODataClient.getPurchaseOrders();
    const response = ragEngine.analyzeQueryWithSapData(query, liveSapPOs);
    res.json(response);
  } catch (err) {
    console.error('[AI RAG ERROR]:', err.message);
    res.status(500).json({ error: "AI RAG processing failed", details: err.message });
  }
});

// Fallback to client Single Page Application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SAP S/4HANA AI Procurement Server Running on Port ${PORT}`);
  console.log(`  Integration Mode: [${sapODataClient.mode}]`);
  console.log(`  Status API:  http://localhost:${PORT}/api/sap/status`);
  console.log(`  Dashboard:   http://localhost:${PORT}/`);
  console.log(`=======================================================`);
});
