import { useEffect, useState } from 'react';
import NftMinterJSON from '../contracts/NftMinter.json';
import { useWeb3React } from '@web3-react/core';
import { useContract } from './useContract';
import { useAppContext } from '../AppContext';
import useIsValidNetwork from './useIsValidNetwork';

export const useMintToken = () => {
  const { library, account, chainId, active } = useWeb3React();
  const { isValidNetwork } = useIsValidNetwork();
  const { setTxnStatus, setOpenseaLink, setTransactionHash } = useAppContext();
  const contractAddress = '0x8097B7457B35378EE9e038C0B9D4d2cD8a10DC3E';
  const contractABI = NftMinterJSON.abi;

  const contract = useContract(contractAddress, contractABI);

  const setupEventListener = async () => {
    console.log('setupEventListener called');
    if (active) {
      contract.on('NewEpicNFTMinted', (from, tokenId) => {
        setOpenseaLink(`https://testnets.opensea.io/assets/${contractAddress}/${tokenId.toNumber()}`);
      });
    }

    console.log('Setup event listener!');
  };

  const mint = async () => {
    console.log('mint function called');
    if (account && isValidNetwork) {
      try {
        const txn = await contract.mintNFT();
        console.log('txn hash: ', txn.hash);
        setTransactionHash(txn.hash);
        setTxnStatus('MINING');
        await txn.wait(1);
        setTxnStatus('COMPLETE');
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    console.log('useMintToken render');
  });

  return {
    mint,
    setupEventListener,
  };
};
