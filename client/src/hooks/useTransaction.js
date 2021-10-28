import { useAppContext } from '../AppContext';

const useTransaction = () => {
  const { setTxnStatus, txnStatus, setOpenseaLink, openseaLink } = useAppContext();
  return { setTxnStatus, txnStatus, setOpenseaLink, openseaLink };
};

export default useTransaction;
