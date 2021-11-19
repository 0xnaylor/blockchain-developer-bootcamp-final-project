import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Text from '../../components/Text';
import Card from '../../components/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import useTransaction from '../../hooks/useTransaction';
import { useWeb3React } from '@web3-react/core';
import { useMintToken } from '../../hooks/useMintToken';
import { injected } from '../../connectors';
import swal from 'sweetalert';
import { ethers } from 'ethers';

const ConnectBtn = styled(Button).attrs({ variant: 'outline-dark' })``;
const RINKEBY_CHAIN_ID = '0x4';
const { ethereum } = window;

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
  let { active, activate, chainId, deactivate } = useWeb3React();

  const {
    txnStatus,
    setTxnStatus,
    setOpenseaLink,
    openseaLink,
    setTransactionHash,
    transactionHash,
  } = useTransaction();

  const { mint, setupEventListener, getMinted } = useMintToken();
  const [minted, setMinted] = useState(0);

  useEffect(() => {
    setupEventListener();
  }, [active]);

  useEffect(() => {
    if (active) {
      renderMinted();
    }
  });

  const handleMintClick = () => {
    mint();
  };

  if (txnStatus === 'MINING') {
    return (
      <Container show>
        <Card style={{ maxWidth: 420, minHeight: 400 }}>
          <p>Transaction is being prosessed, you can check the progress here:</p>
          <br />
          <a href={`https://rinkeby.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">
            etherscan
          </a>
          <Spinner animation="border" role="status" className="m-auto" />
        </Card>
      </Container>
    );
  }

  if (txnStatus === 'COMPLETE') {
    return (
      <Container show>
        <Card style={{ maxWidth: 420, minHeight: 400 }}>
          <Text block center className="mb-5">
            Your claim was successful
          </Text>
          <p>
            You can view your kit on Opensea using the link below. Now get out of here they are almost upon you! I hope
            you got a fast vehicle!
          </p>
          <br />
          <a href={openseaLink} target="_blank" rel="noopener noreferrer">
            Opensea
          </a>
          <br />
          <a href={`https://rinkeby.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">
            etherscan
          </a>
          <Button
            onClick={() => {
              setTxnStatus('NOT_SUBMITTED');
              setOpenseaLink('');
              setTransactionHash('');
            }}
          >
            Go Back
          </Button>
        </Card>
      </Container>
    );
  }

  if (txnStatus === 'ERROR') {
    return (
      <Container show>
        <Card style={{ maxWidth: 420, minHeight: 400 }}>
          <Text>Txn ERROR</Text>
          <a href={`https://rinkeby.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">
            etherscan
          </a>
          <Button onClick={() => setTxnStatus('NOT_SUBMITTED')}>Go Back</Button>
        </Card>
      </Container>
    );
  }

  const handleChainChanged = async (_chainId) => {
    if (_chainId != '0x4') {
      swal('Whoops! Wrong Network', 'Please make sure you are connected to the Rinkeby Test Network!');
      await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: RINKEBY_CHAIN_ID }] });
    }
  };

  const connectWallet = async () => {
    activate(injected);
    ethereum.on('chainChanged', handleChainChanged);
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    if (chainId !== RINKEBY_CHAIN_ID) {
      try {
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: RINKEBY_CHAIN_ID }] });
        swal('Whoops! Wrong Network', 'Please make sure you are connected to the Rinkeby Test Network!');
      } catch (e) {
        if (e.message.includes("'wallet_switchEthereumChain' already pending")) {
          swal('Please open metamask and switch your network!');
        } else {
          console.debug('Error: ', e.message);
        }
      }
    }
  };

  const renderNotConnectedContainer = () => (
    <>
      <p>
        Quick! Connect your wallet to see if there are any left! I hear them coming! You will recieve a weapon,
        transport and an item.
      </p>
      <ConnectBtn onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect
      </ConnectBtn>
    </>
  );

  const renderMintUI = () => (
    <div>
      <p>{minted}/3000 claimed...</p>
      <p>Price: 0.01 Eth</p>
      <ConnectBtn onClick={handleMintClick} className="cta-button mint-button">
        Claim Yours
      </ConnectBtn>
    </div>
  );

  async function renderMinted() {
    setMinted(await getMinted());
  }

  return (
    <Container show>
      <Card style={{ maxWidth: 420, minHeight: 400 }}>
        <p className="sub-text">The zombie horde is approaching fast. Grab your survival kit before its too late!</p>
        <div className="header gradient-text">{active ? renderMintUI() : renderNotConnectedContainer()}</div>
      </Card>
    </Container>
  );
};

export default MintInteractionCard;
