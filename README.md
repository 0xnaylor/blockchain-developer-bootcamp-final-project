### To Do

- [ ] Protect against two attack vectors (incl. SWC Number). Same link as above
- [ ] Include a deployed_address.txt file detailing the testnet address and network where the latest code is deployed.
- [ ] Screencast of you walking through the project, including submitting transactions and seeing the updated state. Include link to recording in README.

# README

## Prioject description

The idea behind the dapp is that it would be part of a zombie apocalypse survival game. Using this dapp players are able to mint an NFT that represents a randomly generated survival kit for use in the game.
A survival kit consists of:

- A weapon
- A vehicle
- An item

NFTs content and metadata is fully on-chain.
After connecting their metamask wallet the UI will tell the player how many survival kits (NFTs) are remaining on the contract and give them the option to mint one for a cost of 0.01 ETH.

The UI displays opensea and etherscan links for the user to see their NFT and check the transction details. Once mint is successul the UI will update to show the remaining mints available on the contract.

## Public Ethereum Accounts (for NFT certification):

mainnet: 0x688625577399Bca4AdEb8e3574195A89D7ad65E2

rinkeby: 0x7Ed65bf3e8fABCd88347abB4B6aE470ADB909123

## Directory Structure

The root directory of the project contains the following sub-directories:

- client: contains all the frontend code, including all dependencies and configuration.
- contracts: contains all the solidity code. Also contains another sub-directory called "libraries" which holds a Base64.sol library.
- coverage: contains all files related to the solidity-coverage plugin.
- migrations: contains the migration scripts for deploying solidity contracts to the blockchain.
- node_modules: contains all smart contract dependencies
- tests - contains the smart contract unit tests (written in javascript). Also includes a utils sub-directory.

## Accessing the UI:

The frontend has already been deployed on Netlify and can be accessed here:

https://zombie-apocalypse-surival-kit.netlify.app/#/

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
ganache-cli -8545
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
ganache-cli -p 8545
```

To run the test suite simply enter the following command:

```
truffle test
```

To generate a test coverage report run the following command:

```
truffle run coverage
```

## Extra functionality to add in future releases:

- Automate the retrieval of the contract address from the generated JSON file, instead of having to manually copy and paste it after a new deployment.
- Make the contract upgradable via a proxy
- Use Chainlink VRF to add true randmoness to the NFT generation.
