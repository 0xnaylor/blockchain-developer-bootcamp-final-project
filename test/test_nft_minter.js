const NftMinter = artifacts.require("NftMinter");
const BigNumber = require("bignumber.js");
const TestUtils = require("./utils/testUtils");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("NftMinter", function (accounts) {
  const [deployerAddress, tokenHolderOneAddress, tokenHolderTwoAddress] =
    accounts;
  const expectedMinter = accounts[0];
  let deplyedContract;
  let maxMints;

  before(async () => {
    deplyedContract = await NftMinter.deployed();
    maxMints = await TestUtils.getMaxMints();
  });

  describe("minting an NFT", async () => {
    it("correctly retrieve owner of mint", async () => {
      await deplyedContract.mintNFT({ from: tokenHolderOneAddress });
      const minter = await deplyedContract.ownerOf(0);
      assert.equal(
        minter,
        tokenHolderOneAddress,
        "The minter address did not match the expected minter address"
      );
    });

    it("test contract returns correct current mint count", async () => {
      // check the current mint count
      const currentCount = await TestUtils.getCurrentMintCount();

      // mint and NFT
      await deplyedContract.mintNFT({ from: accounts[0] });

      // check that the new mint count is the previous +1
      const newCurrentCount = await TestUtils.getCurrentMintCount();
      assert.equal(
        newCurrentCount,
        currentCount + 1,
        "The mint count was not incremented correctly."
      );
    });

    it("test contract returns correct remaining nft count", async () => {
      const minted = await TestUtils.getCurrentMintCount();
      const remainingMints = new BigNumber(
        await deplyedContract.getRemainingMints()
      ).toNumber();
      assert.equal(
        maxMints - minted,
        remainingMints,
        "The actual remaining mints did not match the expected value."
      );
    });

    it("");
  });

  describe("Test Suite 2", async () => {
    it("Placeholder test", () => {});
  });
});
