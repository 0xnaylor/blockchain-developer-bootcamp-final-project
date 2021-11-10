import { useEffect, useState } from 'react';
import NftMinterJSON from '../contracts/NftMinter.json';
import { useWeb3React } from '@web3-react/core';
import { useContract } from './useContract';
import { useAppContext } from '../AppContext';
import useIsValidNetwork from './useIsValidNetwork';

export const useMintToken = () => {
  const { library, account, chainId, active } = useWeb3React();
  const { isValidNetwork } = useIsValidNetwork();
  const { setTxnStatus, setOpenseaLink, setTransactionHash, contractAddress, setMinted } = useAppContext();
  const contractABI = NftMinterJSON.abi;

  const contract = useContract(contractAddress, contractABI);

  const setupEventListener = async () => {
    console.log('setupEventListener called');
    if (active) {
      contract.on('SurvivalKitNftClaimed', (from, tokenId) => {
        setOpenseaLink(`https://testnets.opensea.io/assets/${contractAddress}/${tokenId.toNumber()}`);
      });
    }

    console.log('Setup event listener!');
  };

  const mint = async () => {
    console.log('mint function called using account: ', account);
    if (account && isValidNetwork) {
      try {
        const txn = await contract.mintNFT();
        console.log('txn hash: ', txn.hash);
        setTransactionHash(txn.hash);
        setTxnStatus('MINING');
        await txn.wait(1);
        setTxnStatus('COMPLETE');
        setMinted(getMinted());
      } catch (error) {
        console.log(error);
      }
    }
    console.log('didnt attemp contract call');
  };

  useEffect(() => {
    console.log('useMintToken render');
  });

  const getMinted = async () => {
    const minted = await contract.getTotalNFTsMintedSoFar();
    // console.log('getMinted called from useMintToken hook: ', minted.toNumber());
    // return minted.toNumber();
    return minted.toNumber();
  };

  return {
    mint,
    setupEventListener,
    getMinted,
  };
};
