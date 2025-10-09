// @ts-nocheck
async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Simple test to confirm the API is working
    res.status(200).json({
      status: 'OK',
      message: 'API is working correctly',
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