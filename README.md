## Project Checklist

### What should be in the README

- [ ] Description of the project and what it does
- [ ] Description of the directory structure
- [ ] How to access the frontend of the project.
- [ ] Include public Ethereum account address to recieve the certifcation as an NFT

### Project requirements

- [x] Fully commented code to the standards outlined here: https://docs.soliditylang.org/en/latest/natspec-format.html
- [x] At least two design patterns from the 'Smart Contracts' section: https://docs.google.com/document/d/1tthsXLlv5BDXEGUfoP6_MAsL_8_T0sRBNQs_1OnPxak/edit
- [ ] Protect against two attack vectors (incl. SWC Number). Same link as above
- [x] Contain a markdown file named design_pattern_decisions.md and avoiding_common_attacks.md to describe design pattern and security decisions.
- [ ] Have at least 5 unit tests for your smart contract. In the code explain what the tests are covering and their expected behaviour.
- [ ] Include a deployed_address.txt file detailing the testnet address and network where the latest code is deployed.
- Have a frontend interface that includes:
  - [x] Detects the presence of metamask
  - [x] Connects to the current account
  - [x] Displays infomation from your smart contract
  - [x] Allows a user to submit a transaction to update the smart contract state
  - [x] Updates the frontend if the transaction is successful or not.
- [ ] Host the frontend on Github Pages, Heroku, Netlify, Fleek or Surge. Include the address in the project README.
- [ ] Include clear instructions on:
  - [ ] Installing dependencies
  - [ ] Accessing or running your project
  - [ ] Running the smart contract unit tests (which port a local testnet should be running on).
- [ ] Screencast of you walking through the project, including submitting transactions and seeing the updated state. Include link to recording in README.
- [ ] Instruct the user how to populate the .env file with the required information.
- [ ] The github repo should be named: https://github.com/YOUR_GITHUB_USERNAME_HERE/blockchain-developer-bootcamp-final-project

# README

Application Ui can be found here:

https://618c0f1bea88700007f11808--silly-poincare-c82224.netlify.app/#/

## Prioject description

Mint an NFT
Fully on-chain

After downloading the repo run `npm install`

Create a .env file in the projects root directory and add the following:

- Your metamask seed
- Infura URL including API key.

## Running the test suite

To start up ganache-cli run the provided script:

```
sudo scripts/start_gananche_cli.sh
```

sudo is required because the script creates a log file that can be found here: /var/log/ganache.log

To run the test suite simple enter the following command:

```
truffle test
```

To generate a test coverage report run the following command:

```
truffle run coverage
```

## Starting the application:

To manually start the dapp, run the following commands

```
cd client
npm run start
```

To redeploy the dapp run the following command:

```
truffle migrate --network rinkeby --reset
```

**Important:** After redeploying you will need to add the new address of NftMinter contract and to AppContext.js (line 12)

## Extra functionality to add if there is time.

- Cannot connect metamask to frontend when running the backend on Ganache.
- Automate the retrieval of the contract address from the generated JSON file, instead of having to manually copy and paste it after a new deployment.
- Maybe experiment with making the contract upgradable via a proxy
- Add an alert to the UI if you are not connected to the right network
- Get Words appearing on new lines
- Remember to remove all console logs from both front end and back end before submission
- Add a note in this README about the time delay being able to see the metadata on OpenSea.
