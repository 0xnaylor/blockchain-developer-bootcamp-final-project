const NftMinter = artifacts.require("NftMinter");
const BigNumber = require("bignumber.js");

const getSupplyCap = async () => {
  const deployedContract = await NftMinter.deployed();
  return new BigNumber(await deployedContract.getSupplyCap()).toNumber();
};

exports.getSupplyCap = getSupplyCap;
