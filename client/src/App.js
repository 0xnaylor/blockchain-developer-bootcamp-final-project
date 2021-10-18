// import "./styles/App.css";
// import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import NftMinterJSON from "./contracts/NftMinter.json";
// import myEpicNFT from "./utils/MyEpicNft.json";

// Constants
// const TWITTER_HANDLE = "ben__naylor";
// const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// const OPENSEA_LINK = "";
// const TOTAL_MINT_COUNT = 5;

const App = () => {
  const CONTRACT_ADDRESS = "0xBBB14afb20d73ec09daA67d8359cf8880607f13e";

  // state variable used to store our users public wallet
  const [currentAccount, setCurrentAccount] = useState("");

  //   let [nftsAvailable, setNftsAvailable] = useState(5);

  const checkIfWalletIsConnected = async () => {
    // make sure we have access to window.ethereum
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask");
      return;
    } else {
      console.log("we have the ethereum object", ethereum);
    }

    // check if we're authorised to access the user's wallet
    const accounts = await ethereum.request({ method: "eth_accounts" });

    // User can have multiple authorised accounts, we grab the first one if its there
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("found an authorised account: ", account);
      setCurrentAccount(account);

      // Setup listener! This is for the case where a user comes to our site and ALREADY had their wallet connected + authorised.
      setupEventListener();
    } else {
      console.log("No authorised account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask");
        return;
      }

      // request access to account
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // should print out public address once checkIfWalletIsConnected
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site and connected their wallet for the first time.
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    console.log("askContractToMintNft called");
    try {
      const { ethereum } = window;

      if (ethereum) {
        let chainId = await ethereum.request({ method: "eth_chainId" });
        console.log("Connected to chain " + chainId);

        // String, hex code of the chainId of the Rinkebey test network
        // const rinkebyChainId = "0x4";
        // if (chainId !== rinkebyChainId) {
        //   alert("You are not connected to the Rinkeby Test Network!");
        //   return;
        // }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NftMinterJSON.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectContract.mintNFT();

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

  // This runs our function when the page loads
  useEffect(() => {
    checkIfWalletIsConnected();
    // updateRemainingNftCount();
  }, []);

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

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NftMinterJSON.abi,
          signer
        );

        // Catch the event when the contract emits it and display a message to the user.
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateRemainingNftCount = async () => {
    const { ethereum } = window;

    if (ethereum) {
      // Same stuff again
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NftMinterJSON.abi,
        signer
      );

      // setNftsAvailable = 5 - connectedContract.getTotalNFTsMintedSoFar();
      // console.log("nftsAvailable type: " + typeof nftsAvailable);
      // console.log(nftsAvailable);
      // console.log("NFTs left for minting: " + nftsAvailable);
    }
  };

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
        {/* <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div> */}
      </div>
    </div>
  );
};

export default App;
