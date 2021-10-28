import React from 'react';
import { Container } from 'react-bootstrap';
import MintInteractionCard from './MintInteractionCard';
import ConnectWalletModal from '../../components/ConnectWalletModal';
import useWalletConnectionModal from '../../hooks/useWalletConnectionModal';

const Home = () => {
  const { isWalletConnectModalOpen } = useWalletConnectionModal();
  return (
    <Container className="mt-5">
      {/* {isWalletConnectModalOpen && <ConnectWalletModal />} */}
      <MintInteractionCard />
    </Container>
  );
};

export default Home;