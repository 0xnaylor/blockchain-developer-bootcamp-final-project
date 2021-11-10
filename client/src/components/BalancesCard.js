import React, { useEffect } from 'react';
import Text from './Text';
import Card from './Card';
import { colors } from '../theme';
import { useWeb3React } from '@web3-react/core';
import useEth from '../hooks/useEth';
import { useAppContext } from '../AppContext';

const BalanceCard = () => {
  const { account } = useWeb3React();
  const { fetchEthBalance, ethBalance } = useEth();

  useEffect(() => {
    if (account) {
      fetchEthBalance();
    }
  }, [account]);

  return (
    <Card style={{ maxWidth: 300 }}>
      <Text block color={colors.black}>
        ETH balance: {ethBalance}
      </Text>
    </Card>
  );
};

export default BalanceCard;
