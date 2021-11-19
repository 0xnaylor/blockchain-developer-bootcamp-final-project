import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';

const supportedNetworks = [4, 1337];

function useIsValidNetwork() {
  const { chainId } = useWeb3React();

  const isSupportedNetwork = useMemo(() => {
    return supportedNetworks.includes(chainId);
  }, [chainId]);

  return {
    isValidNetwork: isSupportedNetwork,
  };
}

export default useIsValidNetwork;
