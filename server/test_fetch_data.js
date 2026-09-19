const https = require('https');
const axios = require('axios');

async function testFetchData() {
  const host = 'https://merida.cob.csuchico.edu:8038';
  const path = '/sap/opu/odata/sap/ZAI_PROCUREMENT_SRV/ZAI_C_PROCUREMENT_ANALYTICS?$format=json';
  const agent = new https.Agent({ rejectUnauthorized: false });

  try {
    const res = await axios.get(`${host}${path}`, {
      headers: { 'sap-client': '105' },
      auth: { username: 'GLBI-117', password: 'Bt@123' },
      httpsAgent: agent
    });
    console.log(`[REAL SAP DATA FETCH SUCCESS] Status: ${res.status}`);
    const results = res.data.d ? res.data.d.results : res.data.value;
    console.log(`[REAL SAP RECORDS FETCHED]:`, JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(`[FETCH ERROR]:`, err.message);
  }
}

testFetchData();
