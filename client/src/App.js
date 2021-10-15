import React, { Component, useEffect, useState } from "react";
import BackendContract from "./contracts/Backend.json";
import getWeb3 from "./getWeb3";
import backendJSON from "./contracts/Backend.json";

import "./App.css";
import Web3 from "web3";

const App = () => {
  // state = { storageValue: 0, web3: null, accounts: null, contract: null };

  const [currentAccount, setCurrentAccount] = useState("");
  const [contract, setContract] = useState("");
  const [web3, setWeb3] = useState();

  // This runs our function when the page loads
  useEffect(() => {
    getWeb3();
    checkIfWalletIsConnected();
  }, []);

  const getWeb3 = async () => {
    const { ethereum, web3 } = window;

    if (ethereum) {
      console.log("Ethereum object found");
      const web3 = new Web3(ethereum);
      console.log("Web3: ", web3);
      setWeb3(web3);
    }
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
  };
  // componentDidMount = async () => {
  //   console.log("componentDidMount");
  //   try {
  //     // Get network provider and web3 instance.
  //     setWeb3(await getWeb3());

  //     // Use web3 to get the user's accounts.
  //     const accounts = await web3.eth.getAccounts();
  //     console.log("Available Accounts: " + accounts);

  //     // Get the contract instance.
  //     const networkId = await web3.eth.net.getId();
  //     console.log("Network ID: " + networkId);

  //     const deployedNetwork = SimpleStorageContract.networks[networkId];
  //     console.log("Contract deployed at: " + deployedNetwork.address);

  //     const instance = new web3.eth.Contract(
  //       SimpleStorageContract.abi,
  //       deployedNetwork && deployedNetwork.address
  //     );

  //     setContract(instance);

  //     // Set web3, accounts, and contract to the state, and then proceed with an
  //     // example of interacting with the contract's methods.
  //     // this.setState({ web3, accounts, contract: instance }, this.runExample);
  //   } catch (error) {
  //     // Catch any errors for any of the above operations.
  //     alert(
  //       `Failed to load web3, accounts, or contract. Check console for details.`
  //     );
  //     console.error(error);
  //   }
  // };

  const checkIfWalletIsConnected = async () => {
    // Get network provider and web3 instance.
    // const web3 = await getWeb3();
    // setWeb3(web3);

    // Use web3 to get the user's accounts.
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    console.log("Available Accounts: " + accounts);

    // User can have multiple authorised accounts, we grab the first one if its there
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("found an authorised account: ", account);
      setCurrentAccount(account);

      // Setup listener! This is for the case where a user comes to our site and ALREADY had their wallet connected + authorized.
      // setupEventListener();
    } else {
      console.log("No authorised account found");
    }
    initContract();
  };

  const initContract = async () => {
    // Get the contract instance.
    const web3 = new Web3(window.ethereum);

    const networkId = await web3.eth.net.getId();
    console.log("Network ID: " + networkId);

    const deployedNetwork = BackendContract.networks[networkId];
    // console.log("Contract deployed at: " + deployedNetwork.address);

    const instance = new web3.eth.Contract(
      BackendContract.abi,
      deployedNetwork && deployedNetwork.address
    );
    setContract(instance);
  };

  const connectWallet = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // should print out public address once checkIfWalletIsConnected
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site and connected their wallet for the first time.
      // setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const chainId = await ethereum.request({ method: "eth_chainId" });
        console.log("Connected to chain " + chainId);

        // String, hex code of the chainId of the Rinkebey test network
        const rinkebyChainId = "0x4";
        if (chainId !== rinkebyChainId) {
          alert("You are not connected to the Rinkeby Test Network!");
          return;
        }

        // const provider = web3.setProvider(ethereum);
        // const signer = web3.currentProvider.selectedAddress;
        const backendContract = new web3.eth.Contract(
          backendJSON.abi,
          contract
        );
        backendContract.setProvider(web3.givenProvider);

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await backendContract.makeAnEpicNFT();

        console.log("Mining... Please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button
      onClick={askContractToMintNft}
      className="cta-button connect-wallet-button"
    >
      Mint NFT
    </button>
  );

  // const runExample = async () => {
  //   // const { accounts, contract } = this.state;

  //   // Stores a given value, 5 by default.
  //   await contract.methods.set(1000).send({ from: accounts[0] });

  //   // Get the value from the contract to prove it worked.
  //   const response = await contract.methods.get().call();

  //   // Update state with the result.
  //   this.setState({ storageValue: response });
  // };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {/* <p className="sub-text">There are {nftsAvailable} remaining</p> */}
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderMintUI()}
        </div>
        <div className="footer-container"></div>
      </div>
    </div>
  );
};

export default App;
