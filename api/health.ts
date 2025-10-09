// @ts-nocheck
async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check environment variables
    const envCheck = {
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
      PI_SERVER_API_KEY: process.env.PI_SERVER_API_KEY ? 'Set' : 'Not set',
    };

    // Check if required modules are available
    const modulesCheck = {};
    try {
      require('./_utils');
      modulesCheck.utils = 'OK';
    } catch (error) {
      modulesCheck.utils = `Error: ${error.message}`;
    }

    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      modules: modulesCheck,
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
    });
  }
}

module.exports = handler;