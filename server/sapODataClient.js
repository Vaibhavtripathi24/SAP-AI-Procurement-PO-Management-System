/**
 * SAP S/4HANA OData Service Client & Integration Layer
 * Connects to SAP Gateway OData V2/V4 Services with authentication, CSRF handling,
 * and transparent fallback to DEVELOPMENT_MOCK_MODE when SAP system is unreachable.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');
const { PURCHASE_ORDERS, VENDORS, getVendorScorecards } = require('./data');

class SAPODataClient {
  constructor() {
    this.mode = process.env.SAP_INTEGRATION_MODE || 'DEVELOPMENT_MOCK_MODE';
    this.host = process.env.SAP_GATEWAY_HOST || '';
    this.servicePath = process.env.SAP_ODATA_SERVICE_PATH || '/sap/opu/odata/sap/ZAI_PROCUREMENT_SRV/';
    this.user = process.env.SAP_USER || '';
    this.password = process.env.SAP_PASSWORD || '';
    this.client = process.env.SAP_CLIENT || '';
    this.csrfToken = null;

    console.log(`[SAP ODATA CLIENT] Initialized in mode: [${this.mode}]`);
    if (this.mode === 'REAL_SAP') {
      console.log(`[SAP ODATA CLIENT] Target SAP Host: ${this.host}${this.servicePath}`);
    } else {
      console.log(`[SAP ODATA CLIENT] Running in DEVELOPMENT_MOCK_MODE. (Set SAP_INTEGRATION_MODE=REAL_SAP in .env to connect live SAP)`);
    }
  }

  // Create configured Axios instance for SAP Gateway HTTP requests
  getAxiosClient() {
    const https = require('https');
    const agent = new https.Agent({ rejectUnauthorized: false });

    const headers = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };

    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    if (this.client) {
      headers['sap-client'] = this.client;
    }

    const config = {
      baseURL: this.host,
      timeout: 10000,
      headers: headers,
      httpsAgent: agent
    };

    if (this.user && this.password) {
      config.auth = {
        username: this.user,
        password: this.password
      };
    }

    return axios.create(config);
  }

  formatSapDate(sapDateStr) {
    if (!sapDateStr) return '';
    if (sapDateStr.includes('/Date(')) {
      const ms = parseInt(sapDateStr.replace(/\/Date\((.*?)\)\//, '$1'), 10);
      if (!isNaN(ms)) {
        return new Date(ms).toISOString().split('T')[0];
      }
    }
    return sapDateStr;
  }

  // Fetch CSRF Token from SAP Gateway (Required for POST/PUT/DELETE operations)
  async fetchCsrfToken() {
    if (this.mode !== 'REAL_SAP') return 'MOCK_CSRF_TOKEN';

    try {
      const axiosClient = this.getAxiosClient();
      const res = await axiosClient.get(`${this.servicePath}`, {
        headers: { 'X-CSRF-Token': 'Fetch' }
      });
      this.csrfToken = res.headers['x-csrf-token'];
      console.log('[SAP ODATA CLIENT] Fetched CSRF Token successfully from SAP Gateway.');
      return this.csrfToken;
    } catch (err) {
      console.error('[SAP ODATA CLIENT] Failed to fetch CSRF token:', err.message);
      throw err;
    }
  }

  // Fetch Purchase Orders from SAP Gateway OData Service
  async getPurchaseOrders(query = {}) {
    if (this.mode === 'REAL_SAP') {
      try {
        console.log(`[REAL_SAP] Fetching Purchase Orders from SAP Gateway OData Service (ZAI_PROCUREMENT_SRV)...`);
        const client = this.getAxiosClient();
        let url = `${this.servicePath}ZAI_C_PROCUREMENT_ANALYTICS?$format=json`;

        if (query.status && query.status !== 'ALL') {
          if (query.status === 'DELAYED') {
            url += `&$filter=DelayDays gt 2`;
          } else if (query.status === 'ON_TIME') {
            url += `&$filter=DelayDays le 2`;
          }
        }

        const response = await client.get(url);
        const results = response.data.d ? response.data.d.results : response.data.value;

        console.log(`[REAL_SAP SUCCESS] Successfully fetched ${results.length} live records from SAP Gateway!`);

        // Map OData Entity Set structure to application model
        return results.map(item => ({
          po_id: item.PurchaseOrder || item.po_id,
          vendor_id: item.VendorID || item.vendor_id,
          vendor_name: item.VendorName || item.vendor_name,
          po_date: this.formatSapDate(item.PurchaseOrderDate || item.po_date),
          expected_date: this.formatSapDate(item.ExpectedDeliveryDate || item.expected_date),
          actual_date: this.formatSapDate(item.ActualDeliveryDate || item.actual_date),
          delay_days: parseInt(item.DelayDays || item.delay_days || 0, 10),
          status: item.POStatus || item.status,
          total_amount: parseFloat(item.TotalAmount || item.total_amount || 0),
          currency: item.Currency || item.currency || 'USD',
          items: item.to_Items ? item.to_Items.results : [],
          gr_records: item.to_GoodsReceipt ? item.to_GoodsReceipt.results : []
        }));
      } catch (err) {
        console.error('[REAL_SAP ERROR] OData Service call failed:', err.message);
        throw new Error(`SAP Gateway OData Request Failed: ${err.message}`);
      }
    }

    // DEVELOPMENT_MOCK_MODE Fallback
    console.log(`[DEVELOPMENT_MOCK_MODE] Returning local sample Purchase Orders.`);
    let results = [...PURCHASE_ORDERS];

    if (query.status && query.status !== 'ALL') {
      if (query.status === 'DELAYED') {
        results = results.filter(p => p.delay_days > 2);
      } else if (query.status === 'ON_TIME') {
        results = results.filter(p => p.delay_days <= 2);
      }
    }

    if (query.search) {
      const q = query.search.toLowerCase();
      results = results.filter(p =>
        p.po_id.toLowerCase().includes(q) ||
        p.vendor_name.toLowerCase().includes(q) ||
        p.vendor_id.toLowerCase().includes(q)
      );
    }

    return results;
  }

  // Fetch Dashboard Procurement Summary KPIs
  async getProcurementSummary() {
    const pos = await this.getPurchaseOrders();
    const total_pos = pos.length;
    const delayed_pos = pos.filter(p => p.delay_days > 2).length;
    const ontime_pos = total_pos - delayed_pos;
    const scorecards = await this.getVendorScorecards();
    const high_risk_vendors = scorecards.filter(v => v.risk_level === 'HIGH').length;
    const total_value = pos.reduce((acc, p) => acc + (p.total_amount || 0), 0);

    return {
      mode: this.mode,
      total_pos,
      delayed_pos,
      ontime_pos,
      high_risk_vendors,
      total_value: `$${(total_value / 1000).toFixed(1)}k USD`,
      ontime_rate: `${((ontime_pos / (total_pos || 1)) * 100).toFixed(1)}%`
    };
  }

  // Fetch Vendor Performance Scorecards
  async getVendorScorecards() {
    if (this.mode === 'REAL_SAP') {
      try {
        const client = this.getAxiosClient();
        const response = await client.get(`${this.servicePath}/ZVENDOR_SCORE?$format=json`);
        const results = response.data.d ? response.data.d.results : response.data.value;
        return results;
      } catch (err) {
        console.error('[REAL_SAP ERROR] Vendor OData call failed:', err.message);
      }
    }

    return getVendorScorecards();
  }

  // Fetch Single Purchase Order Details
  async getPoDetail(poId) {
    const pos = await this.getPurchaseOrders();
    return pos.find(p => p.po_id === poId) || null;
  }
}

module.exports = new SAPODataClient();
