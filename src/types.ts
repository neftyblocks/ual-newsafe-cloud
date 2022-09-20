export interface NewstackAuthenticatorOptions {
  appId: string;
  authUrl: string;
  signUrl: string;
  newgraphUrl: string;
  daoDomain: string;
  redirectPath: string;
}

export interface NewstackUserParams {
  accountName: string;
  chainId: string;
  authUrl: string;
}

export interface NGUserResponse {
  id: string;
  created: string;
  updated: string;
  longitude: number;
  latitude: number;
  fullName: string;
  displayName: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  powering: number;
  powered: number;
  status: string;
  stripeUid: string;
  subscriptionStatus: string;
  newcoinAccTx: string;
  newcoinPrivateKey: string;
  newcoinPublicKey: string;
  newcoinPoolTx: string;
  newcoinPoolId: string;
  newcoinPoolStake: number;
  newcoinOwnerPublicKey: string;
  newcoinActivePublicKey: string;
  newcoinPublisherPrivateKey: string;
  newcoinPublisherPublicKey: string;
  newcoinTicker: string;
  consentEmail: string;
  consentTestgroup: string;
  consentPrivacyPolicy: string;
  availableInvites: number;
  instagram: string;
  tiktok: string;
  youtube: string;
  twitter: string;
  spotify: string;
  pinterest: string;
  snapchat: string;
  reddit: string;
  discord: string;
  tumblr: string;
  soundcloud: string;
  apple: string;
  telegram: string;
  signal: string;
  medium: string;
  facebook: string;
  facebookId: string;
  youtubeId: string;
}

export interface NewsafeJwtPayload {
  credential: {
    origin: string;
  };
  identity: {
    username: string;
  };
  requestor: string;
  scopes: string[];
  config: {
    created: string;
    expires: string;
    renewable: boolean;
  };
  request: {
    referer: string;
    appOwner: string;
    redirectUrl: string;
    scopes: string[];
  };
  authority: string;
  version: string;
  iat: number;
}

export interface NewsafeTransactionResultPayload {
  transaction_id: string;
  processed: {
    id: string;
    block_num: number;
    block_time: string;
    producer_block_id: unknown;
    receipt: {
      status: string;
      cpu_usage_us: number;
      net_usage_words: number;
    };
    elapsed: number;
    net_usage: number;
    scheduled: boolean;
    action_traces: unknown;
    account_ram_delta: unknown;
    except: unknown;
    error_code: unknown;
  };
}
