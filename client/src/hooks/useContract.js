import { useMemo } from 'react';
import { ethers } from 'ethers';
import {
  Contract,
  // ContractInterface
} from '@ethersproject/contracts';
import { AddressZero } from '@ethersproject/constants';
import { useWeb3React } from '@web3-react/core';

export function useContract(contractAddress, ABI) {
  // console.log(`useContract called with address: ${contractAddress} and ABI: ${ABI}.`);

  if (contractAddress === AddressZero) {
    throw Error(`Invalid 'contractAddress' parameter '${contractAddress}'.`);
  }

  const { library, account, provider } = useWeb3React();

  // const signerOrProvider = ethers.getDefaultProvider();

  const signerOrProvider = account ? library.getSigner(account).connectUnchecked() : library;

  console.log('signerOrProvider', signerOrProvider);

  return useMemo(() => {
    return new Contract(contractAddress, ABI, signerOrProvider);
  }, [contractAddress, ABI, signerOrProvider]);
}
