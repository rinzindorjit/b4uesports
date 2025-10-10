import { readBody, getStorage, jwtVerify } from "./utils";

// Mock storage for Vercel environment
let mockStorage = {
  transactions: [],
  users: {},
  packages: {}
};

// Mock services for Vercel environment
const mockPiNetworkService = {
  approvePayment: async (paymentId, apiKey) => {
    console.log('Mock approving payment:', paymentId);
    return true;
  },
  completePayment: async (paymentId, txid, apiKey) => {
    console.log('Mock completing payment:', paymentId, txid);
    return true;
  }
};

const mockEmailService = async (emailData) => {
  console.log('Mock sending email:', emailData);
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // For Vercel deployment, we'll use mock data
  const store = mockStorage;
  const piNetworkService = mockPiNetworkService;
  const emailService = mockEmailService;
  
  const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY || 'mock-api-key';

  try {
    if (req.method === "POST") {
      const body = await readBody(req);
      const { action, data } = body;
      
      switch (action) {
        case 'approve':
          // Server-Side Approval as required by Pi Network
          const paymentToApprove = store.transactions.find(txn => txn.paymentId === data.paymentId);
          if (!paymentToApprove) {
            return res.status(404).json({ message: 'Payment not found' });
          }
          
          // Approve payment with Pi Network
          const approved = await piNetworkService.approvePayment(data.paymentId, PI_SERVER_API_KEY);
          if (!approved) {
            return res.status(500).json({ message: 'Failed to approve payment with Pi Network' });
          }
          
          // Update payment status in our database
          paymentToApprove.status = 'approved';
          return res.json({ message: 'Payment approved', result: paymentToApprove });

        case 'complete':
          // Server-Side Completion as required by Pi Network
          const paymentToComplete = store.transactions.find(txn => txn.paymentId === data.paymentId);
          if (!paymentToComplete) {
            return res.status(404).json({ message: 'Payment not found' });
          }
          
          // Complete payment with Pi Network
          const completed = await piNetworkService.completePayment(data.paymentId, data.txid, PI_SERVER_API_KEY);
          if (!completed) {
            return res.status(500).json({ message: 'Failed to complete payment with Pi Network' });
          }
          
          // Update payment status in our database
          paymentToComplete.status = 'completed';
          paymentToComplete.txid = data.txid;
          
          // Send confirmation email if user has provided email
          try {
            const user = store.users[paymentToComplete.userId];
            const packageDetails = store.packages[paymentToComplete.packageId];
            
            // Format game account info for email
            let gameAccountInfo = '';
            if (paymentToComplete.gameAccount) {
              if (paymentToComplete.gameAccount.ign && paymentToComplete.gameAccount.uid) {
                gameAccountInfo = `IGN: ${paymentToComplete.gameAccount.ign}, UID: ${paymentToComplete.gameAccount.uid}`;
              } else if (paymentToComplete.gameAccount.userId && paymentToComplete.gameAccount.zoneId) {
                gameAccountInfo = `User ID: ${paymentToComplete.gameAccount.userId}, Zone ID: ${paymentToComplete.gameAccount.zoneId}`;
              }
            }
            
            if (user && user.email && packageDetails) {
              await emailService({
                to: user.email,
                username: user.username,
                packageName: packageDetails.name,
                piAmount: paymentToComplete.piAmount,
                usdAmount: paymentToComplete.usdAmount,
                gameAccount: gameAccountInfo,
                transactionId: data.txid,
                paymentId: data.paymentId,
                isTestnet: true
              });
            }
          } catch (emailError) {
            console.error('Failed to send purchase confirmation email:', emailError);
          }
          
          return res.json({ message: 'Payment completed', result: paymentToComplete });

        default:
          return res.status(400).json({ message: 'Invalid action' });
      }
    }
    
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error('Payment operation error:', error);
    return res.status(500).json({ message: 'Payment operation failed' });
  }
}