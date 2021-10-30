import { useAppContext } from '../AppContext';

const useTransaction = () => {
  const {
    setTxnStatus,
    txnStatus,
    setOpenseaLink,
    openseaLink,
    setTransactionHash,
    transactionHash,
    setContractAddress,
    contactAddress,
  } = useAppContext();
  return {
    setTxnStatus,
    txnStatus,
    setOpenseaLink,
    openseaLink,
    setTransactionHash,
    transactionHash,
    setContractAddress,
    contactAddress,
  };
};

export default useTransaction;
