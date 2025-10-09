// @ts-nocheck
async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Simple test to check if we can import _utils
    let importResult = 'Not attempted';
    let importError = null;
    
    try {
      const utils = require('./_utils.js');
      importResult = 'Success';
    } catch (error) {
      importError = error.message;
      importResult = 'Failed';
    }

    res.status(200).json({
      importResult,
      importError,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
    });
  }
}

module.exports = handler;