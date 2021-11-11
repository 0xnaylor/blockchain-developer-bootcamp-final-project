const SurvivalKitClaim = artifacts.require("SurvivalKitClaim");
const BN = require("bn.js");
const toBN = web3.utils.toBN;
const Chance = require("chance");
const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");
const catchRevert = require("./utils/exceptions").catchRevert;
const {
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");

contract("SurvivalKitClaim Test Suite", function (accounts) {
  "use strict";

  const EventNames = {
    Transfer: "Transfer",
    Approval: "Approval",
    Minted: "SurvivalKitNftClaimed",
    Pause: "Paused",
    Unpause: "Unpaused",
  };

  let chance, admin, name, symbol, supply, contract, minter;

  before(async () => {
    await unlockAccounts();
    [chance, admin, name, symbol, supply] = await createFixtures();
    contract = await SurvivalKitClaim.new(name, symbol, supply, {
      from: admin,
    });

    // pick a minter address
    do {
      minter = chance.pickone(accounts);
    } while (minter == admin);
  });

  describe("Initial State Tests", async () => {
    // Test that the contract deploys with the expect state
    it("contract should be deployed with the correct name and symbol", async () => {
      assert.equal(
        await contract.name(),
        name,
        "The contract was not deployed with the expected name"
      );
      assert.equal(
        await contract.symbol(),
        symbol,
        "The contract was not deployed with the expected symbol"
      );
    });

    it("contract should be deployed with the correct supply cap", async () => {
      assert.equal(
        await contract.getSupplyCap(),
        supply,
        "The contracts supply cap did not match the expected value"
      );
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

    it("contract should not be paused upon deployment", async () => {
      assert.isFalse(
        await contract.paused(),
        "contract should not be paused upon deployment"
      );
    });
  });

  describe("minting an NFT", async () => {
    // tests covering the minting of an NFT
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
        "The mint count was not incremented correctly. Each mint should increment the count by 1"
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
    // tests covering the transferring of tokens between addresses
    let sender = null,
      receiver = null;

    before(async () => {
      // pick a sender address
      sender = chance.pickone(accounts);
      // pick receiver address
      do {
        receiver = chance.pickone(accounts);
      } while (receiver == sender);
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
        "The senders balance was not decreased correctly. It should have decreased by 1"
      );

      // assert that the receivers balance has increased correctly
      assert.isTrue(
        postTransferReceiverBalance.eq(preTransferReceiverBalance.add(toBN(1))),
        "The receivers balance was not increased correctly. It should have been increased by 1"
      );

      // assert that the receiver is now the owner of the tokenId transferred
      assert.isTrue(
        (await contract.ownerOf(tokenId)) == receiver,
        "The tokenId is not owned by the receiver"
      );
    });

    it("transfering to ZERO address from any account should revert", async () => {
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
        "The tokenId should still be owned by the sender"
      );
    });

    it("Should not change balances of accounts not involved in the transaction", async () => {
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
      const totalSupply2 = await contract.totalSupply();
      assert.isTrue(
        totalSupply.eq(totalSupply2),
        "Total supply should not have changed."
      );
    });

    it("Should fire 'Transfer' event after transferring a token", async () => {
      const [tokenId, reciept] = await transfer(sender, receiver);
      expectEvent(reciept, EventNames.Transfer, {
        0: sender,
        1: receiver,
        2: tokenId,
      });
    });
  });

  describe("Approval", () => {
    // tests covering approvals
    let tokenId = null;
    let accToApprove = null;
    let owner = null;

    beforeEach(async () => {
      await contract.mintNFT({ from: owner });
      tokenId = await contract.tokenOfOwnerByIndex(owner, 0);
    });

    before(async () => {
      owner = minter;
      // pick a new account to approve
      do {
        accToApprove = chance.pickone(accounts);
      } while (accToApprove == owner);
    });

    it("A token should have no accounts approved on it by default", async () => {
      const approved = await contract.getApproved(tokenId);
      assert.equal(
        approved,
        constants.ZERO_ADDRESS,
        `The token should have no accounts approved by default`
      );
    });

    it("Owner of the token can approve another account on it", async () => {
      const owner = await contract.ownerOf(tokenId);

      await contract.approve(accToApprove, tokenId, { from: owner });

      const approvedAccount = await contract.getApproved(tokenId);
      assert.equal(
        approvedAccount,
        accToApprove,
        `The token did not have the expected account approval set`
      );
    });

    it("Should fire 'Approval' event after approval", async () => {
      const owner = await contract.ownerOf(tokenId);
      const receipt = await contract.approve(accToApprove, tokenId, {
        from: owner,
      });
      expectEvent(receipt, EventNames.Approval, {
        0: owner,
        1: accToApprove,
        2: tokenId,
      });
    });
  });

  describe("Pausing the contract", () => {
    let sender = null;

    before(async () => {
      sender = chance.pickone(accounts);
      await contract.mintNFT({ from: sender });
    });

    beforeEach(async () => {
      if (!(await contract.paused())) {
        await contract.pause({ from: admin });
      }
    });

    it("only owner should be able to pause the contract", async () => {});

    it("accounts should be unable to mint if the contract is paused", async () => {
      await catchRevert(contract.mintNFT());
    });

    it("accounts should be unable to transfer if the contract is paused", async () => {
      let receiver = null;
      // pick receiver address
      do {
        receiver = chance.pickone(accounts);
      } while (receiver == sender);

      await catchRevert(transfer(sender, receiver));
    });

    it("pausing a contract should emit a pause event", async () => {
      await contract.unpause({ from: admin });
      expectEvent(await contract.pause({ from: admin }), EventNames.Pause);
    });

    it("unpausing a contract should emit an unpause event", async () => {
      expectEvent(await contract.unpause({ from: admin }), EventNames.Unpause);
    });
  });

  // helper function to transfer a token from a sender account to a receiver account
  // returns the tokenId of the token owned by the sender as well as the reciept (promise) created from the transaction.
  const transfer = async (sender, receiver) => {
    // get the id of the token owned by the sender
    const tokenId = await contract.tokenOfOwnerByIndex(sender, 0);
    // do the transfer
    const receipt = await contract.safeTransferFrom(sender, receiver, tokenId, {
      from: sender,
    });

    return [tokenId, receipt];
  };

  // A helper function to set up and return various parameters required for tests.
  const createFixtures = async () => {
    // chance is used to inject randomness into the tests. This enhances the likelihood of capturing bugs.
    const chance = new Chance();
    const admin = chance.pickone(accounts);
    const name = chance.word({ length: 5 });
    const symbol = chance
      .word({ length: chance.natural({ min: 1, max: 5 }) })
      .toUpperCase();
    const supply = chance.natural({ min: 1000, max: 2000 });
    return [chance, admin, name, symbol, supply];
  };

  // A helper function to unlock all test accounts
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
