const NftMinter = artifacts.require("../contracts/NftMinter.sol");
const Base64 = artifacts.require("../contracts/libraries/Base64.sol");

module.exports = function (deployer) {
  deployer.deploy(NftMinter, "Zombie Apocalypse Survival Kit", "Kit", 3000);
  deployer.deploy(Base64);
};
