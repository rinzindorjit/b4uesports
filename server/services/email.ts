import axios from 'axios';

// Check for EmailJS configuration
if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_PUBLIC_KEY) {
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
  // Check if EmailJS is configured
  if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_PUBLIC_KEY) {
    console.log("Email notification skipped - EmailJS not configured");
    return false;
  }

  const testnetWarning = params.isTestnet 
    ? `<div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 16px; border-radius: 8px; margin: 20px 0;">
         <p style="color: #92400E; margin: 0; font-weight: bold;">
           🚧 TESTNET TRANSACTION - No real Pi coins were deducted from your mainnet wallet.
         </p>
       </div>`
    : '';

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Purchase Confirmation - B4U Esports</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #7c3aed); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <img src="https://b4uesports.com/wp-content/uploads/2025/04/cropped-Black_and_Blue_Simple_Creative_Illustrative_Dragons_E-Sport_Logo_20240720_103229_0000-removebg-preview.png" alt="B4U Esports" style="height: 60px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Purchase Confirmed!</h1>
        <p style="color: #e5e7eb; margin: 10px 0 0 0;">Your gaming currency has been processed</p>
      </div>

      ${testnetWarning}

      <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <h2 style="color: #1f2937; margin-top: 0;">Transaction Details</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong>Customer:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${params.username}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong>Package:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">${params.packageName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong>Game Account:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-family: monospace;">${params.gameAccount}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong>Amount Paid:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">${params.piAmount} π (≈ $${params.usdAmount})</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;"><strong>Transaction ID:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-size: 12px;">${params.transactionId}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0;"><strong>Payment ID:</strong></td>
            <td style="padding: 12px 0; font-family: monospace; font-size: 12px;">${params.paymentId}</td>
          </tr>
        </table>
      </div>

      <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #065f46; margin: 0; font-weight: bold;">
          ✅ Your gaming currency will be delivered to your account within 5-10 minutes.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #6b7280;">Need help? Contact our support team:</p>
        <p style="margin: 10px 0;">
          <a href="mailto:info@b4uesports.com" style="color: #3b82f6; text-decoration: none;">info@b4uesports.com</a> | 
          <a href="tel:+97517875099" style="color: #3b82f6; text-decoration: none;">+975 17875099</a>
        </p>
        
        <div style="margin: 20px 0;">
          <a href="https://www.facebook.com/b4uesports" style="margin: 0 10px; color: #3b82f6; text-decoration: none;">Facebook</a>
          <a href="https://youtube.com/@b4uesports" style="margin: 0 10px; color: #3b82f6; text-decoration: none;">YouTube</a>
          <a href="https://www.instagram.com/b4uesports" style="margin: 0 10px; color: #3b82f6; text-decoration: none;">Instagram</a>
        </div>
      </div>

      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        <p>© 2025 B4U Esports. All Rights Reserved.</p>
        <p style="margin: 5px 0;">Powered by <img src="https://b4uesports.com/wp-content/uploads/2025/04/PI.jpg" alt="Pi Network" style="height: 16px; vertical-align: middle; border-radius: 50%;"> Pi Network</p>
      </div>
    </body>
    </html>
  `;

  try {
    // Send email via EmailJS
    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: params.to,
        from_name: 'B4U Esports',
        subject: `Purchase Confirmation - ${params.packageName} - B4U Esports`,
        message_html: emailHTML,
        // Add any other template parameters you need
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Email sent successfully via EmailJS');
    return true;
  } catch (error) {
    console.error('EmailJS email error:', error);
    return false;
  }
}