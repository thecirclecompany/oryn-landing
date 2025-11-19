"use client";

import { useEffect, useState, useMemo } from "react";
import { useAccount, useConnect } from "wagmi";
import {
  WALLETS,
  detectWallet,
  getWalletAvailability,
} from "@/lib/walletDetection";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, isPending } = useConnect();
  const { isConnected } = useAccount();
  const [detectedWallets, setDetectedWallets] = useState<
    Record<string, boolean>
  >({});
  const [walletProviders, setWalletProviders] = useState<Record<string, any>>(
    {}
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const sortedWallets = useMemo(() => {
    return [...WALLETS].sort((a, b) => {
      const aAvailable = getWalletAvailability(a.id, detectedWallets);
      const bAvailable = getWalletAvailability(b.id, detectedWallets);
      
      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;
      
      return 0;
    });
  }, [detectedWallets]);

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
        await specificProvider.request({ method: "eth_requestAccounts" });
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="wallet-modal-background"
          className="fixed inset-0 z-100 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={onClose}
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
        >
          <div className="absolute inset-0 bg-black/60 " />
          <motion.div
            key="wallet-modal"
            initial={
              isMobile ? { y: "100%", opacity: 0 } : { scale: 0.9, opacity: 0 }
            }
            animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={
              isMobile ? { y: "100%", opacity: 0 } : { scale: 0.9, opacity: 0 }
            }
            transition={{
              type: "spring",
              stiffness: isMobile ? 250 : 250,
              damping: isMobile ? 35 : 20,
            }}
            className="relative w-full md:max-w-sm max-h-[85vh] md:max-h-[50vh] rounded-t-3xl md:rounded-2xl bg-black/80 border border-white/5 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pt-4 px-6">
              <h2 className="text-lg text-white">Connect Wallet</h2>
              <button
                onClick={onClose}
                className="text-white/60 cursor-pointer hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-2 sm:py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="space-y-1 sm:space-y-4 pb-4">
                  {sortedWallets.map((wallet) => {
                    const isAvailable = getWalletAvailability(
                      wallet.id,
                      detectedWallets
                    );
                    const canConnect =
                      isAvailable && injectedConnector && !isPending;

                    return (
                      <button
                        key={wallet.id}
                        onClick={() => canConnect && handleConnect(wallet.id)}
                        disabled={!canConnect}
                        className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-200 ${
                          canConnect
                            ? "bg-white/0 hover:bg-white/5 cursor-pointer group"
                            : "bg-white/0 opacity-30 cursor-not-allowed"
                        }`}
                      >
                        <div className="relative w-8 h-8 rounded-sm overflow-hidden">
                          <Image
                            src={wallet.icon}
                            alt={wallet.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium">
                            {wallet.name}
                          </div>
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
              <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            </div>

            <div className="px-6 py-4">
              <p className="text-xs text-white/80 text-center">
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
