import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {handleErrorMessagesFactory} from "@/app/utils/handleErrorMessages";

// Create the ENS resolver hook
export function useENSResolver(input: string) {
  const [address, setAddress] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");
  const handleErrorMessages = handleErrorMessagesFactory(setLocalError);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Provide the desired RPC here
  const rpcPoint = 'https://ethereum.blockpi.network/v1/rpc/public';

  useEffect(() => {
    // If there's no input, reset the states
    if (!input) {
      setAddress(null);
      setError(null);
      return;
    }

    const resolveAddress = async () => {
      setLoading(true);
      setError(null);
      setAddress(null);

      try {
        const provider = new ethers.JsonRpcProvider(rpcPoint);

        // If the input ends with `.eth`, attempt ENS resolution
        if (input.endsWith('.eth')) {
          const resolvedAddress = await provider.resolveName(input);
          if (resolvedAddress) {
            setAddress(resolvedAddress);
          } else {
            setError('No address found associated with this ENS. Try again.');
          }
        } else {
          // Otherwise, try to validate the input as an Ethereum address
          try {
            const validatedAddress = ethers.getAddress(input);
            setAddress(validatedAddress);
          } catch (validationError) {
            setError('Invalid Ethereum address.');
          }
        }
      } catch (err) {
        setLocalError('Error resolving ENS name or validating address.');
      } finally {
        setLoading(false);
      }
    };

    resolveAddress();
  }, [input]); // The hook runs whenever the input changes

  return { address, error, loading };
}
