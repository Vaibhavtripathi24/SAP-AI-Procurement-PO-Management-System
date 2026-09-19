require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const axios = require('axios');
const https = require('https');

async function testSapConnection() {
  const host = 'http://merida.cob.csuchico.edu:8038';
  const path = process.env.SAP_ODATA_SERVICE_PATH;
  const user = process.env.SAP_USER;
  const pass = process.env.SAP_PASSWORD;
  const client = process.env.SAP_CLIENT;

  console.log(`[TEST SAP] Target URL: ${host}${path}`);
  console.log(`[TEST SAP] User: ${user}, Client: ${client}`);

  // Ignore self-signed SSL certificate errors if any
  const agent = new https.Agent({ rejectUnauthorized: false });

  try {
    const res = await axios.get(`${host}${path}?$format=json`, {
      headers: { 'sap-client': client },
      auth: { username: user, password: pass },
      httpsAgent: agent,
      timeout: 5000
    });
    console.log(`[TEST SAP SUCCESS] Status Code: ${res.status}`);
    console.log(`[TEST SAP SUCCESS] Response Data Keys:`, Object.keys(res.data));
    if (res.data.d) {
      console.log(`[TEST SAP SUCCESS] OData Results Count:`, res.data.d.results ? res.data.d.results.length : (res.data.d.length || 0));
    }
  } catch (err) {
    console.error(`[TEST SAP FAILURE] Error Code/Status:`, err.code || (err.response ? err.response.status : err.message));
    if (err.response) {
      console.error(`[TEST SAP FAILURE] Response Status:`, err.response.status, err.response.statusText);
      console.error(`[TEST SAP FAILURE] Response Headers:`, err.response.headers);
    }
  }
}

testSapConnection();
