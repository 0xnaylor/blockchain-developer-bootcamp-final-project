import { useEffect, useState } from 'react';
import SurvivalKitClaimJSON from '../contracts/SurvivalKitClaim.json';
import { useWeb3React } from '@web3-react/core';
import { useContract } from './useContract';
import { useAppContext } from '../AppContext';
import useIsValidNetwork from './useIsValidNetwork';
import { formatUnits, parseEther } from '@ethersproject/units';
import { BigNumber } from 'bignumber.js';

export const useMintToken = () => {
  const { library, account, chainId, active } = useWeb3React();
  const { isValidNetwork } = useIsValidNetwork();
  const { setTxnStatus, setOpenseaLink, setTransactionHash, contractAddress, setMinted } = useAppContext();
  const contractABI = SurvivalKitClaimJSON.abi;
  const contract = useContract(contractAddress, contractABI);

  const setupEventListener = async () => {
    if (active) {
      contract.on('SurvivalKitNftClaimed', (from, tokenId) => {
        setOpenseaLink(`https://testnets.opensea.io/assets/${contractAddress}/${tokenId.toNumber()}`);
      });
    }
  };

  const mint = async () => {
    const mintFee = new BigNumber(10000000000000000); // 0.01 ETH
    if (account && isValidNetwork) {
      try {
        const txn = await contract.mintNFT({
          from: account,
          value: parseEther('0.01'),
        });
        setTransactionHash(txn.hash);
        setTxnStatus('MINING');
        await txn.wait(1);
        setTxnStatus('COMPLETE');
        setMinted(getMinted());
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getMinted = async () => {
    const minted = await contract.getTotalNFTsMintedSoFar();
    return minted.toNumber();
  };

  return {
    mint,
    setupEventListener,
    getMinted,
  };
};
