import { useWeb3React } from '@web3-react/core';
import { injected } from '../connectors';
import swal from 'sweetalert';

export const useWalletConnection = () => {
  const { activate } = useWeb3React();
  const { ethereum } = window;
  const RINKEBY_CHAIN_ID = '0x4';

  const handleChainChanged = async (_chainId) => {
    if (_chainId != '0x4') {
      swal('Whoops! Wrong Network', 'Please make sure you are connected to the Rinkeby Test Network!');
      await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: RINKEBY_CHAIN_ID }] });
    }
  };

  const connectWallet = async () => {
    // check to see if metamask is installed
    if (!ethereum) {
      swal({ text: 'Please install metamask before continuing' });
      return;
    }

    activate(injected);
    ethereum.on('chainChanged', handleChainChanged);
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    if (chainId !== RINKEBY_CHAIN_ID) {
      try {
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: RINKEBY_CHAIN_ID }] });
        swal('Whoops! Wrong Network', 'Please make sure you are connected to the Rinkeby Test Network!');
      } catch (e) {
        if (e.message.includes("'wallet_switchEthereumChain' already pending")) {
          swal('Please open metamask and switch your network!');
        } else {
          console.debug('Error: ', e.message);
        }
      }
    }
  };

  return {
    handleChainChanged,
    connectWallet,
  };
};
