export interface PiUser {
  uid: string;
  username: string;
  roles: string[];
}

export interface PaymentData {
  amount: number;
  memo: string;
  metadata: {
    type: 'backend';
    userId: string;
    packageId: string;
    gameAccount: Record<string, string>;
    [key: string]: any;
  };
}

export interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PaymentDTO) => void;
}

export interface PaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  from_address: string;
  to_address: string;
  direction: 'user_to_app' | 'app_to_user';
  created_at: string;
  network: 'Pi Testnet' | 'Pi Network';
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: null | {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

export interface PiPrice {
  price: number;
  lastUpdated: Date;
}

export interface Package {
  id: string;
  game: string;
  name: string;
  inGameAmount: number;
  usdtValue: string;
  image: string;
  isActive: boolean;
  piPrice?: number;
  currentPiPrice?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  language: string;
  walletAddress: string;
  profileImage?: string;
  gameAccounts?: {
    pubg?: { ign: string; uid: string };
    mlbb?: { userId: string; zoneId: string };
  };
  referralCode?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  packageId: string;
  paymentId: string;
  txid?: string;
  piAmount: string;
  usdAmount: string;
  piPriceAtTime: string;
  status: string;
  gameAccount: Record<string, string>;
  metadata?: Record<string, any>;
  emailSent: boolean;
  createdAt: string;
  updatedAt: string;
}