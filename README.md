## Project Checklist

### What should be in the README

- [x] Description of the project and what it does
- [x] Description of the directory structure
- [x] How to access the frontend of the project.
- [x] Include public Ethereum account address to recieve the certifcation as an NFT

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

## Public Ethereum Accounts (for NFT certification):

mainnet: 0x688625577399Bca4AdEb8e3574195A89D7ad65E2
rinkeby: 0x7Ed65bf3e8fABCd88347abB4B6aE470ADB909123

## Prioject description

The idea behind the dapp is that it would be part of a zombie apocalypse survival game. Using this dapp players are able to mint an NFT that represents their survival kit.
A survival kit consists of a randomly generated combination of:

- A weapon
- A vehicle
- An item

The NFTs are fully on-chain.
After connecting their metamask wallet the UI will tell the player how many survival kits (NFTs) are remaining on the contract and give them the option to mint one.

## Directory Structure

The root directory of the project contains the following sub-directories:

- client: contains all the frontend code, including all dependencies and configuration.
- contracts: contains all the solidity code. Also contains another sub-directory called "libraries" which holds a Base64.sol library.
- coverage: contains all the file related to the solidity-coverage plugin.
- migrations: contains the migration scripts for deploying solidity contracts to the blockchain.
- node_modules: contains all smart contract dependencies
- scripts: contains the 'start_ganache_cli.sh' script for starting up a local development blockchain. (Required to run unit tests)
- tests - contains the smart contract unit tests (written in javascript). Also includes a utils sub-directory.

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

Start a local development blockchain on port 8545 by running:

```
gananche_cli
```

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

If not done already, start a local development blockchain on port 8545 by running:

```
gananche_cli
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
- useEagerConnect
- - make sure there is an error message if the user doesn't have metamask installed.
