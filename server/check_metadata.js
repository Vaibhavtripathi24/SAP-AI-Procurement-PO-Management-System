const https = require('https');
const axios = require('axios');

async function inspectMetadata() {
  const host = 'https://merida.cob.csuchico.edu:8038';
  const path = '/sap/opu/odata/sap/ZAI_PROCUREMENT_SRV/$metadata';
  const agent = new https.Agent({ rejectUnauthorized: false });

  try {
    const res = await axios.get(`${host}${path}`, {
      headers: { 'sap-client': '105' },
      auth: { username: 'GLBI-117', password: 'Bt@123' },
      httpsAgent: agent
    });
    console.log(`[METADATA XML OUTPUT]:\n`, res.data);
  } catch (err) {
    console.error(`[METADATA ERROR]:`, err.message);
  }
}

inspectMetadata();
