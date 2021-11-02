const NftMinter = artifacts.require("NftMinter");
const BigNumber = require("bignumber.js");

const getCurrentMintCount = async () => {
  const deployedContract = await NftMinter.deployed();
  const remaining = await deployedContract.getTotalNFTsMintedSoFar();
  return remaining.words[0];
};

exports.getCurrentMintCount = getCurrentMintCount;
