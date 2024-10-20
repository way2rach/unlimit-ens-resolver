"use client";

import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { isMobile } from "react-device-detect";
import { handleErrorMessagesFactory } from "@/app/utils/handleErrorMessages";
import { ethers } from "ethers";
import Image from 'next/image';
import { useENSResolver } from "@/app/hooks/useENSResolver";
import { GateFiSDK } from "@gatefi/js-sdk"; 

export default function Home() {
  const [destAddress, setDestAddress] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [invalidEntry, setInvalidEntry] = useState(false);
  const { account } = useWeb3React();
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const { address, error, loading } = useENSResolver(inputValue);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [overlayInstance, setOverlayInstance] = useState<GateFiSDK | null>(null);

  function handleAddressInput(event: React.ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value;

    setInputValue(newValue);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      if (!newValue) {
        setDestAddress('');
        setInvalidEntry(false);
        return;
      }

      if (address) {
        setDestAddress(address);
        setInvalidEntry(false);
        return;
      }

      try {
        const checkedAddress = ethers.getAddress(newValue);
        setDestAddress(checkedAddress);
        setInvalidEntry(false);
      } catch (e) {
        setInvalidEntry(true);
      }
    }, 500);

    setTypingTimeout(newTimeout);
  }

  useEffect(() => {
    if (address) {
      setInvalidEntry(false);
    }

    if (error) {
      setInvalidEntry(true);
    }
  }, [address, error]);

  useEffect(() => {
    if (address) {
      const instance = new GateFiSDK({
        merchantId: "922f92b0-9cc5-462d-a1e5-ec07c91e4f47",
        displayMode: "overlay",
        nodeSelector: "#overlay-button",
        isSandbox: true,
        walletAddress: address,
        defaultFiat: {
          currency: "USD",
          amount: "64",
        },
        defaultCrypto: {
          currency: "ETH"
        },
      });

      setOverlayInstance(instance);
    }
  }, [address]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {localError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-5">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{localError}</span>
          </div>
        )}

        <div className="text-center max-w-5xl mb-8">
          <h1 className="text-4xl md:text-6xl font-bold">The Monk Store</h1>
          <p className="mt-3 mb-8 text-lg font-medium text-gray-500">
            {isMobile
              ? "The easiest way to buy instantly"
              : "The easiest way to buy your Monk NFT instantly with credit card, debit card or Apple Pay"}
          </p>
          <div className="flex justify-center items-center">
            <Image
              src="/monk.png"
              alt="Monk"
              width={500}
              height={500}
            />
          </div>

          {/* Input section */}
          <div className="flex flex-col items-center">
            <div className="w-full">
              <label className="block text-gray-700 text-lg font-bold mb-2">
                Enter the receiving address
              </label>
              <input
                value={inputValue}
                onChange={handleAddressInput}
                className={`appearance-none border-2 ${
                  !invalidEntry ? "border-green-200" : "border-gray-200"
                } rounded-xl w-full py-4 px-3 text-gray-700 focus:outline-none text-2xl ${
                  !invalidEntry ? "focus:border-green-400" : "focus:border-blue-400"
                }`}
                type="text"
                placeholder="0x... or ENS name"
              />
            </div>

            {loading && <p className="text-blue-500">Resolving ENS...</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>

          <button id="overlay-button"
                  className="mt-8 px-6 py-3 bg-green-500 text-white rounded-full shadow-lg hover:shadow-green-400 transition ease-in-out duration-300">
            Buy Crypto
          </button>
        </div>

      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
