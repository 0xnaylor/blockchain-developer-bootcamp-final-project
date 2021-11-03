const NftMinter = artifacts.require("NftMinter");
const BigNumber = require("bignumber.js");
const TestUtils = require("./utils/testUtils");
var Chance = require("chance");

contract("NftMinter Test Suite", function (accounts) {
  "use strict";

  describe("Initial State Tests", async () => {
    let chance, admin, name, symbol, supply, contract;

    before(async () => {
      await unlockAccounts();
      [chance, admin, name, symbol, supply] = await createFixtures();
      contract = await NftMinter.new(name, symbol, supply, {
        from: admin,
      });
    });

    it("contract should be deployed with the correct name and symbol", async () => {
      assert.equal(await contract.name(), name);
      assert.equal(await contract.symbol(), symbol);
    });

    it("contract should be deployed with the correct supply cap", async () => {
      assert.equal(
        await contract.getSupplyCap(),
        supply,
        "The contracts supply cap did not match the expected value"
      );
    });

    it("contract should not be paused upon deployment", async () => {
      const paused = await contract.paused();
      assert.isFalse(paused);
    });

    it("the starting balance of all addresses is 0", async () => {
      let balance = 0;
      for (const acc of accounts) {
        balance = await contract.balanceOf(acc);
        assert.isTrue(balance.isZero());
      }
    });

    it("the starting total supply should be 0", async () => {
      const totalSupply = await contract.totalSupply();
      assert.isTrue(totalSupply.isZero());
    });
  });

  describe.only("minting an NFT", async () => {
    let chance, admin, name, symbol, supply, contract;
    before(async () => {
      await unlockAccounts();
      [chance, admin, name, symbol, supply] = await createFixtures();
      contract = await NftMinter.new(name, symbol, supply, {
        from: admin,
      });
    });

    it("correctly retrieve owner of mint", async () => {
      let minter = null;
      // select any account other than admin
      do {
        minter = chance.pickone(accounts);
      } while (minter == admin);

      const tokenId = await TestUtils.getCurrentMintCount();
      await contract.mintNFT({ from: minter });
      const owner = await contract.ownerOf(tokenId);
      assert.equal(
        minter,
        owner,
        "The minter address did not match the expected minter address"
      );
    });

    it("test contract returns correct current mint count", async () => {
      // check the current mint count
      const currentCount = await TestUtils.getCurrentMintCount();
      console.log("currentCount: ", currentCount);

      // mint and NFT
      await contract.mintNFT({ from: accounts[0] });

      // check that the new mint count is the previous +1
      const newCurrentCount = await TestUtils.getCurrentMintCount();
      console.log("newCurrentCount: ", newCurrentCount);

      assert.equal(
        newCurrentCount,
        currentCount + 1,
        "The mint count was not incremented correctly."
      );
    });

    it("test contract returns correct remaining nft count", async () => {
      const minted = await TestUtils.getCurrentMintCount();
      const remainingMints = new BigNumber(
        await contract.getRemainingMints()
      ).toNumber();
      assert.equal(
        supplyCap - minted,
        remainingMints,
        "The actual remaining mints did not match the expected value."
      );
    });
  });

  // describe("Check owner account balance", () => {
  //   it("Owner Account balance", async () => {
  //     const balance = await web3.eth.getBalance(ownerAddress);
  //     console.log(balance);
  //   });
  // });

  const createFixtures = async () => {
    const chance = new Chance();
    const admin = chance.pickone(accounts);
    const name = chance.word({ length: 5 });
    const symbol = chance
      .word({ length: chance.natural({ min: 1, max: 5 }) })
      .toUpperCase();
    const supply = chance.natural({ min: 1, max: 20 });
    return [chance, admin, name, symbol, supply];
  };

  const unlockAccounts = async () => {
    const output = [];
    for (const acct of accounts) {
      await web3.eth.personal.unlockAccount(acct);
      const obj = {
        address: acct,
        balance: await web3.eth.getBalance(acct),
      };
      output.push(obj);
    }
    console.debug(`The number of accounts : ${accounts.length}`);
    console.table(output);
  };
});

// contract("Contract2", function (accounts) {
//   const [ownerAddress, tokenHolderOneAddress, tokenHolderTwoAddress] = accounts;

//   before(async () => {
//     deplyedContract = await NftMinter.deployed();
//   });

//   it("Owner Account balance in second contract", async () => {
//     const balance = await deplyedContract.balanceOf(ownerAddress);
//     console.log(balance);
//   });
// });
