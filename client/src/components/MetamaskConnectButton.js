import React from 'react';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';
import { useWeb3React } from '@web3-react/core';
import MMLogo from '../static/metamask-logo.svg';
import Text from './Text';
import Card from './Card';
import { shortenAddress } from '../utils/shortenAddress';
import { useWalletConnection } from '../hooks/useWalletConnection';

const MetamaskLogo = styled.img.attrs({
  src: MMLogo,
})`
  height: 40px;
`;

const ConnectBtn = styled(Button).attrs({ variant: 'outline-dark' })``;

const MetamaskConnectButton = () => {
  const { active, account, deactivate } = useWeb3React();
  const { connectWallet } = useWalletConnection();

  if (active) {
    return (
      <Card className="d-flex flex-row justify-content-between" style={{ width: 350 }}>
        <MetamaskLogo />
        <Text uppercase color="black" t3 lineHeight="40px" className="mx-4">
          {shortenAddress(account)}
        </Text>
        <ConnectBtn onClick={deactivate}>Log Out</ConnectBtn>
      </Card>
    );
  }

  return (
    <Card className="d-flex flex-row justify-content-between" style={{ width: 350 }}>
      <MetamaskLogo />
      <Text uppercase color="black" t3 lineHeight="40px" className="mx-2">
        Metamask
      </Text>
      <ConnectBtn onClick={connectWallet}>Connect</ConnectBtn>
    </Card>
  );
};

export default MetamaskConnectButton;
