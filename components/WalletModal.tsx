"use client";

import { useEffect, useState, useMemo } from "react";
import { useAccount, useConnect } from "wagmi";
import { WALLETS, detectWallet, getWalletAvailability } from "@/lib/walletDetection";
import Image from "next/image";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, isPending } = useConnect();
  const { isConnected } = useAccount();
  const [detectedWallets, setDetectedWallets] = useState<Record<string, boolean>>({});
  const [walletProviders, setWalletProviders] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      
      const { detected, providers } = detectWallet();
      setDetectedWallets(detected);
      setWalletProviders(providers);
      
      const walletMapping: Record<string, string> = {
        metamask: "metamask",
        "io.metamask": "metamask",
        "com.coinbase.wallet": "coinbase",
        "com.coinbase": "coinbase",
        "coinbase wallet": "coinbase",
        "okx wallet": "okx",
        okx: "okx",
        "com.okex.wallet": "okx",
        rabby: "rabby",
        "io.rabby": "rabby",
        "com.brave.wallet": "brave",
        "brave wallet": "brave",
        trust: "trust",
        "trust wallet": "trust",
        "com.trustwallet": "trust",
      };
      
      const handleAnnounce = (event: Event) => {
        const customEvent = event as CustomEvent<{ info: any; provider: any }>;
        if (customEvent.detail) {
          const { info, provider } = customEvent.detail;
          const normalizedName = info.name?.toLowerCase().trim() || "";
          const normalizedRdns = (info.rdns || "").toLowerCase().trim();
          
          const walletId =
            walletMapping[normalizedName] ||
            walletMapping[normalizedRdns] ||
            walletMapping[normalizedName.split(" ")[0]];
          
          if (walletId) {
            setDetectedWallets((prev) => ({ ...prev, [walletId]: true }));
            setWalletProviders((prev) => ({ ...prev, [walletId]: provider }));
          }
        }
      };
      
      window.addEventListener("eip6963:announceProvider", handleAnnounce);
      window.dispatchEvent(new Event("eip6963:requestProvider"));
      
      return () => {
        window.removeEventListener("eip6963:announceProvider", handleAnnounce);
        document.body.style.overflow = "unset";
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  useEffect(() => {
    if (isConnected && isOpen) {
      onClose();
    }
  }, [isConnected, isOpen, onClose]);

  const injectedConnector = useMemo(
    () => connectors.find((c) => c.id === "injected"),
    [connectors]
  );

  const isUserRejection = (error: any): boolean => {
    return (
      error?.code === 4001 ||
      error?.message?.toLowerCase().includes("reject") ||
      error?.message?.toLowerCase().includes("user denied") ||
      error?.message?.toLowerCase().includes("user rejected") ||
      error?.message?.toLowerCase().includes("user cancelled")
    );
  };

  const handleConnect = async (walletId: string) => {
    const specificProvider = walletProviders[walletId];
    
    if (specificProvider) {
      try {
        await specificProvider.request({ method: 'eth_requestAccounts' });
        onClose();
      } catch (error: any) {
        if (!isUserRejection(error)) {
          if (process.env.NODE_ENV === "development") {
            console.error("Connection error:", error);
          }
        }
      }
    } else if (injectedConnector) {
      try {
        connect({ connector: injectedConnector });
        onClose();
      } catch (error: any) {
        if (!isUserRejection(error) && process.env.NODE_ENV === "development") {
          console.error("Connection error:", error);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div
        className="relative w-full max-w-md max-h-[50vh] rounded-2xl bg-black/95 border border-white/20 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-white">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-3 pb-4">
              {WALLETS.map((wallet) => {
                const isAvailable = getWalletAvailability(wallet.id, detectedWallets);
                const canConnect = isAvailable && injectedConnector && !isPending;

                return (
                  <button
                    key={wallet.id}
                    onClick={() => canConnect && handleConnect(wallet.id)}
                    disabled={!canConnect}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                      canConnect
                        ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#C7FF6F]/30 hover:shadow-[0_0_20px_rgba(199,255,111,0.2)] cursor-pointer group"
                        : "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <Image
                        src={wallet.icon}
                        alt={wallet.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-semibold">{wallet.name}</div>
                      {!isAvailable && (
                        <div className="text-xs text-white/60 mt-1">
                          Not available
                        </div>
                      )}
                    </div>
                    {canConnect && (
                      <div className="text-white/40 group-hover:text-[#C7FF6F] group-hover:translate-x-1 transition-all">
                        →
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Bottom blur gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10" />
        </div>

        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <p className="text-xs text-white/60 text-center">
            New to Ethereum wallets?{" "}
            <a
              href="https://metamask.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C7FF6F] hover:text-[#F9FF8D] transition-colors"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}