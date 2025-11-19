export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  isAvailable: boolean;
  provider?: any;
}

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any;
}

export const WALLETS: Omit<WalletInfo, "isAvailable" | "provider">[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/512px-MetaMask_Fox.svg.png",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "https://raw.githubusercontent.com/gist/taycaldwell/2291907115c0bb5589bc346661435007/raw/280eafdc84cb80ed0c60e36b4d0c563f6dca6b3e/cbw.svg",
  },
  {
    id: "okx",
    name: "OKX",
    icon: "https://play-lh.googleusercontent.com/N00SbjLJJrhg4hbdnkk3Llk2oedNNgCU29DvR9cpep7Lr0VkzvBkmLqajWNgFb0d7IOO=w240-h480-rw",
  },
  {
    id: "rabby",
    name: "Rabby",
    icon: "https://rabby.io/assets/logos/symbol-new.svg",
  },
  {
    id: "brave",
    name: "Brave Wallet",
    icon: "https://e7.pngegg.com/pngimages/849/900/png-clipart-brave-web-browser-ad-blocking-chromium-computer-software-android-orange-logo-thumbnail.png",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjTrKgy8TJ9muJphpzXZAGb-TTs5c2igXR6Q&s",
  },
  {
    id: "core",
    name: "Core",
    icon: "https://core.app/favicon.ico",
  },
];

const WALLET_MAPPING: Record<string, string> = {
  metamask: "metamask",
  "io.metamask": "metamask",
  "com.coinbase.wallet": "coinbase",
  "com.coinbase": "coinbase",
  "coinbase wallet": "coinbase",
  "okx wallet": "okx",
  "okx": "okx",
  "com.okex.wallet": "okx",
  rabby: "rabby",
  "io.rabby": "rabby",
  "com.brave.wallet": "brave",
  "brave wallet": "brave",
  trust: "trust",
  "trust wallet": "trust",
  "com.trustwallet": "trust",
  core: "core",
  "core wallet": "core",
  "app.core": "core",
  "com.avaxwallet.core": "core",
};

function normalizeWalletName(name: string): string {
  return name.toLowerCase().trim();
}

export function detectWallet(): {
  detected: Record<string, boolean>;
  providers: Record<string, any>;
} {
  if (typeof window === "undefined") {
    return { detected: {}, providers: {} };
  }

  const detected: Record<string, boolean> = {};
  const providers: Record<string, any> = {};
  const eip6963Providers: EIP6963ProviderDetail[] = [];

  // Step 1: Listen for EIP-6963 announcements
  const handleAnnounce = (event: Event) => {
    const customEvent = event as CustomEvent<EIP6963ProviderDetail>;
    if (customEvent.detail) {
      eip6963Providers.push(customEvent.detail);
    }
  };

  window.addEventListener("eip6963:announceProvider", handleAnnounce);

  // Step 2: Request providers to announce themselves
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  // Step 3: Process EIP-6963 providers (synchronous processing of already announced providers)
  eip6963Providers.forEach(({ info, provider }) => {
    const normalizedName = normalizeWalletName(info.name);
    const normalizedRdns = normalizeWalletName(info.rdns || "");
    
    // Find matching wallet ID
    const walletId =
      WALLET_MAPPING[normalizedName] ||
      WALLET_MAPPING[normalizedRdns] ||
      WALLET_MAPPING[normalizedName.split(" ")[0]];

    if (walletId) {
      detected[walletId] = true;
      providers[walletId] = provider;
    }
  });

  // Step 4: Check for mobile-specific wallet providers
  const mobileProviders: Record<string, any> = {
    trust: (window as any).trustwallet,
    coinbase: (window as any).coinbase,
    okx: (window as any).okxwallet,
    rabby: (window as any).rabby,
  };

  Object.entries(mobileProviders).forEach(([walletId, provider]) => {
    if (provider && !detected[walletId]) {
      detected[walletId] = true;
      providers[walletId] = provider;
    }
  });

  // Step 5: Fallback to legacy detection for wallets that don't support EIP-6963
  if (window.ethereum) {
    const ethereum = window.ethereum as any;
    const allProviders: any[] = [];

    // Collect all providers
    if (ethereum.providers && Array.isArray(ethereum.providers)) {
      ethereum.providers.forEach((p: any) => {
        if (p && !allProviders.includes(p)) {
          allProviders.push(p);
        }
      });
      if (!ethereum.providers.includes(ethereum)) {
        allProviders.push(ethereum);
      }
    } else {
      allProviders.push(ethereum);
    }

    // Check each provider for wallet-specific properties
    allProviders.forEach((provider: any) => {
      if (!provider) return;

      // MetaMask
      if (
        provider.isMetaMask === true &&
        !provider.isBraveWallet &&
        !provider.isRabbyWallet &&
        !provider.isCoinbaseWallet &&
        !detected.metamask
      ) {
        detected.metamask = true;
        providers.metamask = provider;
      }

      // Coinbase Wallet
      if (
        (provider.isCoinbaseWallet === true ||
          provider.isCoinWallet === true ||
          provider.constructor?.name === "CoinbaseWalletProvider") &&
        !detected.coinbase
      ) {
        detected.coinbase = true;
        providers.coinbase = provider;
      }

      // OKX
      if (
        (provider.isOKExWallet === true ||
          provider.isOkxWallet === true ||
          provider.isOKXWallet === true ||
          provider.constructor?.name === "OKExProvider") &&
        !detected.okx
      ) {
        detected.okx = true;
        providers.okx = provider;
      }

      // Rabby
      if (
        (provider.isRabbyWallet === true ||
          provider.isRabby === true ||
          provider.constructor?.name === "RabbyProvider") &&
        !detected.rabby
      ) {
        detected.rabby = true;
        providers.rabby = provider;
      }

      // Brave Wallet
      if (
        (provider.isBraveWallet === true || provider._isBraveWallet === true) &&
        !detected.brave
      ) {
        detected.brave = true;
        providers.brave = provider;
      }

      // Trust Wallet
      if (
        (provider.isTrust === true ||
          provider.isTrustWallet === true ||
          (provider.trust && provider.trust.isTrust === true) ||
          provider.constructor?.name === "TrustWeb3Provider") &&
        !detected.trust
      ) {
        detected.trust = true;
        providers.trust = provider;
      }

      // Core Wallet
      if (
        (provider.isCore === true ||
          provider.isCoreWallet === true ||
          provider.isAvalanche === true ||
          provider.constructor?.name === "CoreProvider" ||
          provider.constructor?.name === "AvalancheProvider") &&
        !detected.core
      ) {
        detected.core = true;
        providers.core = provider;
      }
    });
  }

  // Clean up event listener
  window.removeEventListener("eip6963:announceProvider", handleAnnounce);

  return { detected, providers };
}

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function getMobileWalletDeepLink(walletId: string): string | null {
  const currentUrl = encodeURIComponent(window.location.href);
  
  const deepLinks: Record<string, string> = {
    metamask: `https://metamask.app.link/dapp?url=${currentUrl}`,
    coinbase: `https://go.cb-w.com/dapp?url=${currentUrl}`,
    trust: `https://link.trustwallet.com/open_url?url=${currentUrl}`,
    okx: `https://www.okx.com/download?deeplink=${currentUrl}`,
    core: `https://core.app/wc?uri=${encodeURIComponent(`wc:${currentUrl}`)}`,
    rabby: `https://rabby.io/wc?uri=${encodeURIComponent(`wc:${currentUrl}`)}`,
    brave: `https://brave.com/wallet?uri=${encodeURIComponent(`wc:${currentUrl}`)}`,
  };

  return deepLinks[walletId] || null;
}

export function getWalletAvailability(
  walletId: string,
  detectedWallets: Record<string, boolean>
): boolean {
  // On mobile, wallets are available via deep links even if not detected
  if (isMobileDevice()) {
    return true;
  }
  return detectedWallets[walletId] === true;
}
