import emailjs from 'emailjs-com';

// EmailJS configuration - you'll need to set these environment variables
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.EMAILJS_SERVICE_ID || '',
  TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID || '',
  ADMIN_TEMPLATE_ID: process.env.EMAILJS_ADMIN_TEMPLATE_ID || '',
  PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || '',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@b4uesports.com',
};

// Check if EmailJS is configured
const isEmailJSConfigured = EMAILJS_CONFIG.SERVICE_ID && EMAILJS_CONFIG.TEMPLATE_ID && EMAILJS_CONFIG.PUBLIC_KEY;

if (!isEmailJSConfigured) {
  console.warn("EmailJS environment variables not set - email notifications will be disabled");
}

interface PurchaseEmailParams {
  to: string;
  username: string;
  packageName: string;
  piAmount: string;
  usdAmount: string;
  gameAccount: string;
  transactionId: string;
  paymentId: string;
  isTestnet: boolean;
}

export async function sendPurchaseConfirmationEmail(params: PurchaseEmailParams): Promise<boolean> {
  if (!isEmailJSConfigured) {
    console.log("Email notification skipped - EmailJS not configured");
    return false;
  }

  const testnetWarning = params.isTestnet 
    ? `🚧 TESTNET TRANSACTION - No real Pi coins were deducted from your mainnet wallet.`
    : '';

  // Send email to user
  try {
    const userTemplateParams = {
      to_email: params.to,
      username: params.username,
      package_name: params.packageName,
      pi_amount: params.piAmount,
      usd_amount: params.usdAmount,
      game_account: params.gameAccount,
      transaction_id: params.transactionId,
      payment_id: params.paymentId,
      testnet_warning: testnetWarning,
      is_testnet: params.isTestnet ? 'YES' : 'NO'
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      userTemplateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    // Send email to admin
    const adminTemplateParams = {
      to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
      username: params.username,
      package_name: params.packageName,
      pi_amount: params.piAmount,
      usd_amount: params.usdAmount,
      game_account: params.gameAccount,
      transaction_id: params.transactionId,
      payment_id: params.paymentId,
      user_email: params.to,
      testnet_warning: testnetWarning,
      is_testnet: params.isTestnet ? 'YES' : 'NO'
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.ADMIN_TEMPLATE_ID,
      adminTemplateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    return true;
  } catch (error) {
    console.error('EmailJS email error:', error);
    return false;
  }
}
