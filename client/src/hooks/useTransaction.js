import { useAppContext } from '../AppContext';

const useTransaction = () => {
  const { setTxnStatus, txnStatus, setOpenseaLink, openseaLink, setTransactionHash, transactionHash } = useAppContext();
  return { setTxnStatus, txnStatus, setOpenseaLink, openseaLink, setTransactionHash, transactionHash };
};

export default useTransaction;
