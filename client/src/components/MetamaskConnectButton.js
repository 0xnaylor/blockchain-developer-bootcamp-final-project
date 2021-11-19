import React from 'react';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';
import { useWeb3React } from '@web3-react/core';
import MMLogo from '../static/metamask-logo.svg';
import Text from './Text';
import Card from './Card';
import { injected } from '../connectors';
import { shortenAddress } from '../utils/shortenAddress';
import swal from 'sweetalert';

const MetamaskLogo = styled.img.attrs({
  src: MMLogo,
})`
  height: 40px;
`;

const RINKEBY_CHAIN_ID = '0x4';

const ConnectBtn = styled(Button).attrs({ variant: 'outline-dark' })``;

const MetamaskConnectButton = () => {
  const { activate, active, account, deactivate, chainId } = useWeb3React();

  // const connectMetamask = () => {
  //   if (chainId !== RINKEBY_CHAIN_ID) {
  //     swal('Whoops! Wrong Network', 'Please make sure you are connected to the Rinkeby Test Network!');
  //     return;
  //   }
  //   activate(injected);
  // };

  const connectWallet = async () => {
    activate(injected);
    if (chainId !== RINKEBY_CHAIN_ID) {
      console.log('Chain ID detected: ', chainId, ' Should be: ', RINKEBY_CHAIN_ID);
      const { ethereum } = window;
      swal('Whoops! Wrong Network', 'Please make sure you are connected to the Rinkeby Test Network!');
      await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: RINKEBY_CHAIN_ID }] });
    }
  };

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
