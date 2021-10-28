import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Text from '../../components/Text';
import Card from '../../components/Card';
import Button from 'react-bootstrap/Button';
import { colors } from '../../theme';
import { useAppContext } from '../../AppContext';
import Spinner from 'react-bootstrap/Spinner';
import useTransaction from '../../hooks/useTransaction';
import { useWeb3React } from '@web3-react/core';
import { useMintToken } from '../../hooks/useMintToken';
import { injected } from '../../connectors';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 100px;
  -webkit-box-align: center;
  align-items: center;
  flex: 1 1 0%;
  overflow: hidden auto;
  z-index: 1;
`;

const MintInteractionCard = () => {
  const { active, activate } = useWeb3React();
  const { txnStatus, setTxnStatus, setOpenseaLink, openseaLink } = useTransaction();
  const { mint, setupEventListener } = useMintToken();

  useEffect(() => {
    setupEventListener();
  }, [active]);

  const handleMintClick = () => {
    console.log('handleMintClick called');
    mint();
  };

  if (txnStatus === 'MINING') {
    return (
      <Container show>
        <Card style={{ maxWidth: 420, minHeight: 400 }}>
          <Spinner animation="border" role="status" className="m-auto" />
        </Card>
      </Container>
    );
  }

  if (txnStatus === 'COMPLETE') {
    console.log('Opensea Link: ', openseaLink);
    return (
      <Container show>
        <Card style={{ maxWidth: 420, minHeight: 400 }}>
          <Text block center className="mb-5">
            Txn Was successful!
          </Text>
          {/* <p>{openseaLink}</p> */}
          <Button onClick={() => setTxnStatus('NOT_SUBMITTED')}>Go Back</Button>
        </Card>
      </Container>
    );
  }

  if (txnStatus === 'ERROR') {
    return (
      <Container show>
        <Card style={{ maxWidth: 420, minHeight: 400 }}>
          <Text>Txn ERROR</Text>
          <Button onClick={() => setTxnStatus('NOT_SUBMITTED')}>Go Back</Button>
        </Card>
      </Container>
    );
  }

  const connectWallet = () => {
    activate(injected);
  };

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
  // onClick={connectWallet}

  const renderMintUI = () => (
    <button onClick={handleMintClick} className="cta-button mint-button">
      Mint NFT
    </button>
  );

  return (
    <Container show>
      <Card style={{ maxWidth: 420, minHeight: 400 }}>
        <p className="sub-text">Each unique. Each beautiful. Discover your NFT today.</p>
        <p className="header gradient-text">{active ? renderMintUI() : renderNotConnectedContainer()}</p>
      </Card>
    </Container>
  );
};

export default MintInteractionCard;
