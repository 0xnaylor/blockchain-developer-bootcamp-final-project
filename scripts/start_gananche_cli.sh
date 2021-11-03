ganache-cli --networkId 31 \
    --host '127.0.0.1' --port 8545 \
    --gasPrice 2.5E10 --gasLimit 4E8 \
    --deterministic \
    --defaultBalanceEther 10000 --accounts 10 --secure \
    --unlock 0 --unlock 1 --unlock 2 --unlock 3 --unlock 4 \
    --hardfork 'petersburg' \
    --blockTime 0 \
    --db '/var/lib/ganache-cli/data' >> /var/log/ganache.log 2>&1
