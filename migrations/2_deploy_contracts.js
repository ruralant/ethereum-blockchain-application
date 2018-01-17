var SimpleWallet = artifacts.require("../contracts/SimpleWallet.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleWallet);
};
