# Consensys blockchain developer bootcamp final project

## NFT rental market place

---

### **Why an NFT rental market place?**

As NFTs become more pervasive in popular culture some will become extrememly highly sort after. Users may want to hire NTFs because:

- Some NFTs allow access to exclusive clubs (permissioned Discord servers, Decentraland events etc). Not everyone is going to be able to pay hundreds of thousands of dollars for permanent ownership of a Cryptopunk or a Bored Ape but if they can rent them for a specified amount of time they can attend the event or get access the permission discord etc.
- Users might want to rent an in-game assets such as an Axie or a Revv car to participate in a specific event/tournament.
- Companies may want to lease land or hire a billboard in the any one of the virtual worlds.

The NFT owners benefit by gaining yield in a risk-free way from their NFTs without ever giving up ownership.

---

### Single workflow:

1. Jayne owns a rare Bored Ape that she would like to earn some yeild on.
2. She connects her wallet to the NFT rental market place and authenticates.
3. She fills in a form specifying that she is prepared to let someone hire the Bored Ape for 0.5 ETH per day. She submits the information to a smart contract but the Bored Ape remains in her wallet.
4. Ben really wants to attend a party on the Bored Ape yacht in Decentralandm so decides to rent the Bored Ape for 24 hrs. He connects his metamask wallet to the dapp and interacts with the smart contract.
5. The smart contract transfers 0.5 ETH from Ben's wallet to Jayne's Ethereum address and in exchange the Bored Ape NFT is transferred to Ben’s wallet.
6. At that exact moment a 24 hr count down timer is started.
7. Ben goes to the event on the Bored Ape Yacht and has a great time hanging out.
8. When the timer reaches 0:00 the Bored ape will automatically be transferred back to Jayne’s wallet.

---

### Initial essential tasks.

- Allow users to authenticate with the dapp using their metamask wallet.
- Give the user the option to list or rent
- Allow users to select NFTs to list and set parameters such as price.
- Also users to browse the current listings
- Allow exchange to occur between renter and lister.
- Set countdown timer.
- Automatic retrieval of NFT after countdown timer expires.

---

### **Potential Issues:**

- How do you prevent someone borrowing an NFT and then transferring it to a new wallet in an attemot to evade the automkatic retrieval?

---

### **Extensions of this idea/long-term vision:**

### DAO Ownership

- The rental market place could be owned and controlled by a DAO.
- Members of the DAO could purchase tokens, which would then be used to fund NFT purchases. Which NFT would be subject to community governance.
- These NFTs could then be rented out and profits distributed amongst contributing DAO members, relative to their DAO token holdings.
- A proportion of this could also be held in the DAO treasury for new purchases.
- Certain NFTs could be fractionalised and tokens distributed to DAO members.

### Loan extensions

- The renter will have the option to extend the loan time. If another user is requesting the NFT and auction can occur where the highest bidder will be the holder of the NFT.

---

### **Monetisation Ideas:**

1. Extracting a ‘finders fee’. A small percentage of the rental price could be transferred back to the treasury. Might not be in the spirit of crypto (i.e. removing the middle man)

2. Generate value by finding and purchasing potentially valuable NFTs early. Incentivise the community by offering retroactive rewards for finding NFTs that turn out to become very valuable. (Different take on Vitalik’s retrospective funding idea)
