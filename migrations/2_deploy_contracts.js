const SurvivalKitClaim = artifacts.require("../contracts/SurvivalKitClaim.sol");
const Base64 = artifacts.require("../contracts/libraries/Base64.sol");

module.exports = function (deployer) {
  deployer.deploy(
    SurvivalKitClaim,
    "Zombie Apocalypse Survival Kit",
    "KIT",
    3000
  );
  deployer.deploy(Base64);
};
