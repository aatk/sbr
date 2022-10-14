const axios = require('axios');
const https = require('https');

const agent = new https.Agent({
    rejectUnauthorized: false,
});

const client = axios.create({
    withCredentials: true,
    httpsAgent: agent,
    maxContentLength: Infinity,
    maxBodyLength: Infinity
});

module.exports = client;