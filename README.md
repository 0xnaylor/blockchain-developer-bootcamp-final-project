After downloading the repo run `npm install`

Create a .env file in the projects root directory and add the following:

- Your metamask seed
- Infura URL including API key.

To start up ganache-cli run the provided script:

```
sudo scripts/start_gananche_cli.sh
```

log file can be found here: /var/log/ganache.log

Test generate a test coverage report run the following command:

```
truffle run coverage
```

To start the application:

```
truffle migrate --network rinkeby --reset
```

Take the contract address of NftMinter and add it to the app context:
client/src/AppContext.js

```
cd client
npm run start
```

TODO:

- Cannot connect metamask to frontend when running the backend on Ganache.
- Automate the retrieval of the contract address from the generated JSON file, instead of having to manually copy and paste it after a new deployment.
- Make the contract pausable
- Maybe experiment with making the contract upgradable via a proxy
