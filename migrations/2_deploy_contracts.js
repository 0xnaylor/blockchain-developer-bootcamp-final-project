var Backend = artifacts.require("./Backend.sol");

module.exports = function (deployer) {
  deployer.deploy(Backend);
};
