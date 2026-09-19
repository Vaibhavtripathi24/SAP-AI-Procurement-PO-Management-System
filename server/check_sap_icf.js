const https = require('https');
const axios = require('axios');

async function checkSapService() {
  const host = 'https://merida.cob.csuchico.edu:8038';
  const user = 'GLBI-117';
  const pass = 'Bt@123';
  const client = '105';
  const agent = new https.Agent({ rejectUnauthorized: false });

  const urls = [
    `${host}/sap/public/ping`,
    `${host}/sap/bc/ping`,
    `${host}/sap/opu/odata/sap/ZAI_PROCUREMENT_SRV/`,
    `${host}/sap/opu/odata/sap/ZAI_PROCUREMENT_SRV/$metadata`
  ];

  for (const url of urls) {
    try {
      console.log(`\n--------------------------------------------`);
      console.log(`[TESTING] ${url}`);
      const res = await axios.get(url, {
        headers: { 'sap-client': client },
        auth: { username: user, password: pass },
        httpsAgent: agent,
        timeout: 5000
      });
      console.log(`[SUCCESS] Status: ${res.status} ${res.statusText}`);
      console.log(`[RESPONSE HEADERS]`, res.headers);
    } catch (err) {
      console.log(`[FAILED] Code/Status: ${err.code || (err.response ? err.response.status : err.message)}`);
      if (err.response) {
        console.log(`[FAILED DATA]`, err.response.data);
      }
    }
  }
}

checkSapService();
