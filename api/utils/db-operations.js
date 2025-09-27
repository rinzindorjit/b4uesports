// Database operations utility for Vercel API routes
import { db } from './db.js';

// Mock user data for testing
const MOCK_USER = {
  id: 'mock-user-123',
  piUID: 'mock-pi-uid-123',
  username: 'mock_user',
  email: 'mock@example.com',
  phone: '+1234567890',
  country: 'US',
  language: 'en',
  walletAddress: 'mock-wallet-address',
  gameAccounts: {},
  isProfileVerified: true,
  isActive: true,
  balance: '1000.00000000'
};

// Mock package data for testing
const MOCK_PACKAGE = {
  id: 'mock-package-123',
  game: 'PUBG',
  name: '660 UC',
  inGameAmount: 660,
  usdtValue: '12.0000',
  image: '/images/pubg-uc.jpg',
  isActive: true
};

/**
 * Store a mock payment in the database
 * @param {string} paymentId - The payment ID
 * @param {string} txid - The transaction ID
 * @param {object} paymentData - Additional payment data
 * @returns {Promise<object>} - The stored transaction
 */
export async function storeMockPayment(paymentId, txid, paymentData = {}) {
  if (!db) {
    console.warn('⚠️ Database not available, skipping payment storage');
    return null;
  }

  try {
    console.log('💾 Storing mock payment in database...');
    
    // In a real implementation, you would:
    // 1. Check if user exists, create if not
    // 2. Check if package exists, create if not
    // 3. Insert transaction record
    
    // For now, we'll just log what would be stored
    const transactionRecord = {
      userId: paymentData.userId || 'mock-user-' + Date.now(),
      packageId: paymentData.packageId || 'mock-package-' + Date.now(),
      paymentId: paymentId,
      txid: txid,
      piAmount: paymentData.piAmount || '100.00000000',
      usdAmount: paymentData.usdAmount || '10.0000',
      piPriceAtTime: paymentData.piPriceAtTime || '0.1000',
      status: paymentData.status || 'completed',
      gameAccount: paymentData.gameAccount || {},
      metadata: {
        ...paymentData.metadata,
        isMock: true,
        storedAt: new Date().toISOString()
      }
    };
    
    console.log('✅ Mock payment record prepared:', transactionRecord);
    
    // In a real implementation, you would uncomment the following lines:
    // const result = await db.insert(transactions).values(transactionRecord).returning();
    // console.log('✅ Mock payment stored in database:', result[0]);
    // return result[0];
    
    return transactionRecord;
  } catch (error) {
    console.error('❌ Failed to store mock payment:', error.message);
    throw error;
  }
}

/**
 * Store a payment approval in the database
 * @param {string} paymentId - The payment ID
 * @param {object} approvalData - Additional approval data
 * @returns {Promise<object>} - The stored approval record
 */
export async function storePaymentApproval(paymentId, approvalData = {}) {
  if (!db) {
    console.warn('⚠️ Database not available, skipping approval storage');
    return null;
  }

  try {
    console.log('💾 Storing payment approval in database...');
    
    // For now, we'll just log what would be stored
    const approvalRecord = {
      paymentId: paymentId,
      status: 'approved',
      metadata: {
        ...approvalData.metadata,
        isMock: true,
        approvedAt: new Date().toISOString()
      }
    };
    
    console.log('✅ Payment approval record prepared:', approvalRecord);
    
    // In a real implementation, you would update the transaction record in the database
    // const result = await db.update(transactions).set({ status: 'approved' }).where(eq(transactions.paymentId, paymentId)).returning();
    // console.log('✅ Payment approval stored in database:', result[0]);
    // return result[0];
    
    return approvalRecord;
  } catch (error) {
    console.error('❌ Failed to store payment approval:', error.message);
    throw error;
  }
}

/**
 * Get user balance
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - The user's balance
 */
export async function getUserBalance(userId) {
  if (!db) {
    console.warn('⚠️ Database not available, returning mock balance');
    return '1000.00000000';
  }

  try {
    // In a real implementation, you would:
    // const result = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId));
    // return result[0]?.balance || '0.00000000';
    
    // For now, return a mock balance
    return '1000.00000000';
  } catch (error) {
    console.error('❌ Failed to get user balance:', error.message);
    return '0.00000000';
  }
}

/**
 * Update user balance
 * @param {string} userId - The user ID
 * @param {string} newBalance - The new balance
 * @returns {Promise<boolean>} - Success status
 */
export async function updateUserBalance(userId, newBalance) {
  if (!db) {
    console.warn('⚠️ Database not available, skipping balance update');
    return false;
  }

  try {
    // In a real implementation, you would:
    // await db.update(users).set({ balance: newBalance }).where(eq(users.id, userId));
    
    console.log(`✅ User ${userId} balance updated to ${newBalance}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to update user balance:', error.message);
    return false;
  }
}

export { MOCK_USER, MOCK_PACKAGE };