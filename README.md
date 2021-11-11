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
- [x] Have at least 5 unit tests for your smart contract. In the code explain what the tests are covering and their expected behaviour.
- [ ] Include a deployed_address.txt file detailing the testnet address and network where the latest code is deployed.
- Have a frontend interface that includes:
  - [x] Detects the presence of metamask
  - [x] Connects to the current account
  - [x] Displays infomation from your smart contract
  - [x] Allows a user to submit a transaction to update the smart contract state
  - [x] Updates the frontend if the transaction is successful or not.
- [x] Host the frontend on Github Pages, Heroku, Netlify, Fleek or Surge. Include the address in the project README.
- Include clear instructions on:
  - [x] Installing dependencies
  - [x] Accessing or running your project
  - [x] Running the smart contract unit tests (which port a local testnet should be running on).
- [ ] Screencast of you walking through the project, including submitting transactions and seeing the updated state. Include link to recording in README.
- [x] Instruct the user how to populate the .env file with the required information.
- [x] The github repo should be named: https://github.com/YOUR_GITHUB_USERNAME_HERE/blockchain-developer-bootcamp-final-project

# README

## Prioject description

Mint an NFT
Fully on-chain

## Accessing the UI:

The frontend has already been deployed on Netlify and canm be accessed here:
https://618c0f1bea88700007f11808--silly-poincare-c82224.netlify.app/#/

## How to spin up the dapp locally:

To start the dapp locally requires two spearate tasks:

- Starting the frontend
- Deploying the smart contract to either a development blockchain or a testnet such as Rinkeby.

### Starting the frontend

Navigate to the `client` directory:

```
cd client
```

Install the dependencies

```
npm install
```

Start the application

```
npm run start
```

In the browser, visit:

localhost:3000

## Deploying the smart contract

In a new terminal, navigate to the project root and install the projects dependencies

```
npm install
```

Also install ganache-cli

```
npm install -g ganache-cli
```

### Deploying to a local dev network

Note: The etherscan and opensea links shown in the UI after initiating a mint will only work when connected to Rinkeby.

Deploy the contract

```
truffle migrate --network development --reset
```

**Important:** After redeploying you will need to add the new address of SurvivalKitClaim contract and to AppContext.js (line 12)

### Deploying to the rinkeby testnet

Create a .env file in the projects root directory and add the following:

- Your metamask seed
- Infura URL including API key.

Example:

```
MNEMONIC="This is not a real seed phrase as that would be silly"
INFURA_URL="https://rinkeby.infura.io/v3/a87687a687ddgy8686sss"
```

Then deploy the contract

```
truffle migrate --network rinkeby --reset
```

**Important:** After redeploying you will need to add the new address of SurvivalKitClaim contract and to AppContext.js (line 12)

## Running the test suite

Start a local development blockchain on port 8545 or alternatively, if on unix-based OS, run the script provided:

```
sudo scripts/start_gananche_cli.sh
```

Note: sudo is required to run the script because it needs permission to create the log file (/var/log/ganache.log).

To run the test suite simple enter the following command:

```
truffle test
```

To generate a test coverage report run the following command:

```
truffle run coverage
```

## Extra functionality to add if there is time.

- Automate the retrieval of the contract address from the generated JSON file, instead of having to manually copy and paste it after a new deployment.
- Maybe experiment with making the contract upgradable via a proxy
- Add an alert to the UI if you are not connected to the right network
- Remember to remove all console logs from both front end and back end before submission
- Add a note in this README about the time delay being able to see the metadata on OpenSea.
