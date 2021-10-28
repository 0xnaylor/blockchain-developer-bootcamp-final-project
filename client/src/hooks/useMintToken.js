import { useEffect, useState } from 'react';
import NftMinterJSON from '../contracts/NftMinter.json';
import { useWeb3React } from '@web3-react/core';
import { useContract } from './useContract';
import { useAppContext } from '../AppContext';
import useIsValidNetwork from './useIsValidNetwork';
import contractABI from '../static/contractABI';
import { Contract } from '@ethersproject/contracts';

export const useMintToken = () => {
  const { library, account, chainId, active } = useWeb3React();
  const { isValidNetwork } = useIsValidNetwork();
  const { setTxnStatus, setOpenseaLink } = useAppContext();

  // const getContractAddress = async () => {
  //   return NftMinterJSON.networks[chainId].address;
  // };

  const contractAddress = '0x534eA95F0eA22e6862E16355E7d0643461365dae';
  const contractABI = NftMinterJSON.abi;

  const contract = useContract(contractAddress, contractABI);

  const setupEventListener = async () => {
    console.log('setupEventListener called');
    if (active) {
      contract.on('NewEpicNFTMinted', (from, tokenId) => {
        console.log(from, tokenId.toNumber());
        setOpenseaLink(`https://testnets.opensea.io/assets/${contractAddress}/${tokenId.toNumber()}`);
      });
    }

    console.log('Setup event listener!');
  };

  const mint = async () => {
    console.log('mint function called');
    if (account && isValidNetwork) {
      try {
        setTxnStatus('MINING');
        const txn = await contract.mintNFT();
        console.log('txn hash: ', txn);
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
