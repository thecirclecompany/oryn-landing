interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
    isCoinWallet?: boolean;
    isOKExWallet?: boolean;
    isOkxWallet?: boolean;
    isOKXWallet?: boolean;
    isRabbyWallet?: boolean;
    isRabby?: boolean;
    isBraveWallet?: boolean;
    isTrust?: boolean;
    isTrustWallet?: boolean;
    trust?: {
      isTrust?: boolean;
    };
    providers?: any[];
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  };
  coinbase?: any;
  okxwallet?: any;
  rabby?: any;
}

