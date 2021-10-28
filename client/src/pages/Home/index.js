import React from 'react';
import { Container } from 'react-bootstrap';
import MintInteractionCard from './MintInteractionCard';

const Home = () => {
  return (
    <Container className="mt-5">
      {/* {isWalletConnectModalOpen && <ConnectWalletModal />} */}
      <MintInteractionCard />
    </Container>
  );
};

export default Home;
