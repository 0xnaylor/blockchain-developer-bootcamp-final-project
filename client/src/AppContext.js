import React, { createContext, useReducer } from 'react';

const initialContext = {
  ethBalance: '--',
  setEthBalance: () => {},
  txnStatus: 'NOT_SUBMITTED',
  setTxnStatus: () => {},
  openseaLink: 'https://testnets.opensea.io',
  setOpenseaLink: () => {},
  transactionHash: '',
  setTransactionHash: () => {},
  contractAddress: '0x5feF963F0b0b1876bbb7FF3a0B9a68Bb1870F800',
  setContractAddress: () => {},
  minted: 0,
  setMinted: () => {},
};

const appReducer = (state, { type, payload }) => {
  switch (type) {
    case 'SET_ETH_BALANCE':
      return {
        ...state,
        ethBalance: payload,
      };

    case 'SET_TXN_STATUS':
      return {
        ...state,
        txnStatus: payload,
      };

    case 'SET_OPENSEA_LINK':
      return {
        ...state,
        openseaLink: payload,
      };

    case 'SET_TRANSACTION_HASH':
      return {
        ...state,
        transactionHash: payload,
      };

    case 'SET_CONTRACT_ADDRESS':
      return {
        ...state,
        contractAddress: payload,
      };

    case 'SET_MINTED':
      return {
        ...state,
        minted: payload,
      };

    default:
      return state;
  }
};

const AppContext = createContext(initialContext);
export const useAppContext = () => React.useContext(AppContext);
export const AppContextProvider = ({ children }) => {
  const [store, dispatch] = useReducer(appReducer, initialContext);

  const contextValue = {
    ethBalance: store.ethBalance,
    setEthBalance: (balance) => {
      dispatch({ type: 'SET_ETH_BALANCE', payload: balance });
    },
    txnStatus: store.txnStatus,
    setTxnStatus: (status) => {
      dispatch({ type: 'SET_TXN_STATUS', payload: status });
    },
    openseaLink: store.openseaLink,
    setOpenseaLink: (link) => {
      dispatch({ type: 'SET_OPENSEA_LINK', payload: link });
    },
    transactionHash: store.transactionHash,
    setTransactionHash: (hash) => {
      dispatch({ type: 'SET_TRANSACTION_HASH', payload: hash });
    },
    contractAddress: store.contractAddress,
    setContractAddress: (address) => {
      dispatch({ type: 'SET_CONTRACT_ADDRESS', payload: address });
    },
    minted: store.minted,
    setMinted: (minted) => {
      dispatch({ type: 'SET_MINTED', payload: minted });
    },
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
