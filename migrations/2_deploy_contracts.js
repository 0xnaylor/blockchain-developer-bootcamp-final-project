const NftMinter = artifacts.require("../contracts/NftMinter.sol");
const Base64 = artifacts.require("../contracts/libraries/Base64.sol");

module.exports = function (deployer) {
  deployer.deploy(NftMinter);
  deployer.deploy(Base64);
};
