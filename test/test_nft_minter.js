const NftMinter = artifacts.require("NftMinter");
const BN = require("bn.js");
const TestUtils = require("./utils/testUtils");
const {
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const toBN = web3.utils.toBN;
const Chance = require("chance");
const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");

contract("NftMinter Test Suite", function (accounts) {
  "use strict";

  const EventNames = {
    Transfer: "Transfer",
    Approval: "Approval",
    Minted: "NewEpicNFTMinted",
  };

  let chance, admin, name, symbol, supply, contract, minter;

  before(async () => {
    await unlockAccounts();
    [chance, admin, name, symbol, supply] = await createFixtures();
    contract = await NftMinter.new(name, symbol, supply, {
      from: admin,
    });

    // pick a minter address
    do {
      minter = chance.pickone(accounts);
    } while (minter == admin);
  });

  describe("Initial State Tests", async () => {
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

  describe("minting an NFT", async () => {
    it("correctly retrieve owner of mint", async () => {
      const tokenId = await contract.totalSupply();
      await contract.mintNFT({ from: minter });
      const owner = await contract.ownerOf(tokenId);
      assert.equal(
        minter,
        owner,
        "The minter address did not match the expected minter address"
      );
    });

    it("return correct current mint count", async () => {
      // check the current mint count
      const currentCount = await contract.totalSupply();
      const expectedCount = currentCount.add(toBN(1));
      // mint and NFT
      await contract.mintNFT({ from: minter });
      // check that the new mint count is the previous +1
      const newCurrentCount = await contract.totalSupply();
      assert.isTrue(
        newCurrentCount.eq(expectedCount),
        "The mint count was not incremented correctly."
      );
    });

    it("returns correct remaining nft count", async () => {
      const minted = await contract.totalSupply();
      const remainingMints = new BN(
        await contract.getRemainingMints()
      ).toNumber();
      assert.equal(
        supply - minted,
        remainingMints,
        "The actual remaining mints did not match the expected value."
      );
    });

    it("when user mints a token their balance is increased correctly", async () => {
      // get current balance of minter
      const currentBalance = await contract.balanceOf(minter);
      // mint an NFT
      await contract.mintNFT({ from: minter });
      // get the new balance of the minter
      const newBalance = await contract.balanceOf(minter);
      // check that the minters balance has increased by 1
      assert.isTrue(
        newBalance.eq(currentBalance.add(toBN(1))),
        "users balance was not increased by 1"
      );
    });

    it("should fire a 'transfer' event after minting", async () => {
      const currentCount = await contract.totalSupply();
      expectEvent(
        await contract.mintNFT({ from: minter }),
        EventNames.Transfer,
        { 0: ZERO_ADDRESS, 1: minter, 2: currentCount }
      );
    });

    it("should fire a 'NewEpicNFTMinted' event after minting", async () => {
      const currentCount = await contract.totalSupply();
      expectEvent(await contract.mintNFT({ from: minter }), EventNames.Minted, {
        0: minter,
        1: currentCount,
      });
    });
  });

  describe("Transfers", () => {
    let sender = null,
      receiver = null;

    before(async () => {
      // pick a sender address
      sender = chance.pickone(accounts);
      // pick receiver address
      do {
        receiver = chance.pickone(accounts);
      } while (receiver == sender);

      // make sure the sender has something to send.
      await contract.mintNFT({ from: sender });
    });

    beforeEach(async () => {
      // make sure the sender has a token to transfer
      await contract.mintNFT({ from: sender });
    });

    it("a transfer decreases sender's balance and increasing recipient's balance by as much", async () => {
      // get both balances
      const preTransferSenderBalance = await contract.balanceOf(sender);
      const preTransferReceiverBalance = await contract.balanceOf(receiver);

      const [tokenId] = await transfer(sender, receiver);

      // get both updated balances
      const postTransferSenderBalance = await contract.balanceOf(sender);
      const postTransferReceiverBalance = await contract.balanceOf(receiver);

      // assert that the senders balance has decreased correctly
      assert.isTrue(
        postTransferSenderBalance.eq(preTransferSenderBalance.sub(toBN(1))),
        "The senders balance was not decreased correctly"
      );

      // assert that the receivers balance has increased correctly
      assert.isTrue(
        postTransferReceiverBalance.eq(preTransferReceiverBalance.add(toBN(1))),
        "The receivers balance was not increased correctly"
      );

      // assert that the receiver is now the owner of the tokenId transferred
      assert.isTrue(
        (await contract.ownerOf(tokenId)) == receiver,
        "The tokenId is not owned by the receiver"
      );
    });

    it("Can't transfer to ZERO address from any account", async () => {
      // get the id of the token owned by the sender
      await expectRevert.unspecified(transfer(sender, constants.ZERO_ADDRESS));
    });

    it("Can transfer to oneself, although it's pointless", async () => {
      // get sender balance
      const preTransferSenderBalance = await contract.balanceOf(sender);
      const [tokenId] = await transfer(sender, sender);
      // get new sender balance
      const postTransferSenderBalance = await contract.balanceOf(sender);

      // assert that the senders balance has decreased correctly
      assert.isTrue(
        postTransferSenderBalance.eq(preTransferSenderBalance),
        "The senders balance should not have changed"
      );

      // assert that the receiver is now the owner of the tokenId transferred
      assert.isTrue(
        (await contract.ownerOf(tokenId)) == sender,
        "The tokenId is not owned by the sender"
      );
    });

    it("Should not change balances of irrelative accounts(neither sender nor recipient", async () => {
      // pick an account that a different from both the sender and the receiver.
      let user = null;
      do {
        user = chance.pickone(accounts);
      } while (user == sender || user == receiver);

      const preTransferUserBalance = await contract.balanceOf(user);
      await transfer(sender, receiver);
      // get updated balance
      const postTransferUserBalance = await contract.balanceOf(user);

      // assert that the user balance has not changed.
      assert.isTrue(
        preTransferUserBalance.eq(postTransferUserBalance),
        "The user not involved in the transfer should not have seen their balance change."
      );
    });

    it("Should not change total supply at all after transfers", async () => {
      // get total supply
      const totalSupply = await contract.totalSupply();

      // make a transfer
      await transfer(sender, receiver);
      // assert new total supply is equal to the original total supply
      const totalSuuply2 = await contract.totalSupply();
      assert.isTrue(
        totalSupply.eq(totalSuuply2),
        "Total supply should not have changed."
      );
    });

    it("Should fire 'Transfer' event after transfer", async () => {
      const [tokenId, reciept] = await transfer(sender, receiver);
      expectEvent(reciept, EventNames.Transfer, {
        0: sender,
        1: receiver,
        2: tokenId,
      });
    });
  });

  const transfer = async (sender, receiver) => {
    // get the id of the token owned by the sender
    const tokenId = await contract.tokenOfOwnerByIndex(sender, 0);
    // do the transfer
    const receipt = await contract.safeTransferFrom(sender, receiver, tokenId, {
      from: sender,
    });

    return [tokenId, receipt];
  };

  const createFixtures = async () => {
    const chance = new Chance();
    const admin = chance.pickone(accounts);
    const name = chance.word({ length: 5 });
    const symbol = chance
      .word({ length: chance.natural({ min: 1, max: 5 }) })
      .toUpperCase();
    const supply = chance.natural({ min: 1000, max: 2000 });
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
  };
});
