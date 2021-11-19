// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

// We selectedWeapon import some OpenZeppelin Contracts.
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "hardhat-console/contracts/console.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

// Import helper functions needed for Base62 encoding
import { Base64 } from "./libraries/Base64.sol";

/**
@title Zombie Apocalipse Survival kit generator
@author Ben Naylor
@notice This contract currently only handles free mints. No payment is taken.

 */
contract SurvivalKitClaim is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, VRFConsumerBase {

    uint private supplyCap = 3000;
    bytes32 keyHash;
    uint256 fee;
    uint256 public randomResult;
    mapping(bytes32 => address) public requestIdToSender;
    mapping(address => bytes32) public sendertoRequestId; // temporary for debugging
    mapping(bytes32 => uint256) public requestIdToTokenId;
    mapping(uint256 => uint256) public tokenIdToRandomNumber;

    /// @notice keep track of token ids using purpose built OpenZeppelin utility
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /// @dev We split the SVG at the part where it asks for the background color.
    string svgPartOne = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='";
    // string svgPartTwo = "'/><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";
    string svgPartTwo = "'/>";

    string[] weapon = ["Crossbow", "Shotgun", "Samuri Sword", "Baseball Bat", "Crowbar", "slingshot", "Axe", "Katana", "Sledge Hammer", "Machete", "Handgun", "Kunckle Duster", "Rifle", "Tomahawk", "Pointy Stick"];
    string[] transport = ["Motorbike", "Car", "Bicycle", "Jeep", "On Foot", "Helicopter", "Boat", "Skateboard", "Rollerblades", "Scooter"];
    string[] item = ["Torch", "Animal Snare", "Medicine", "Radio", "Map", "Wistle", "Candle", "Walkie-Talkie", "Water Bottle", "Water Purification Tablets", "Gloves", "Binoculars", "Watch", "Food Rations"];
    string[] colors = ["red", "black", "blue", "green", "indigo", "grey"];

    /// @notice Event to be emitted after a successful mint
    /// @param sender The address of the transaction sender
    /// @param tokenId The id of the token that has just been minted
    event SurvivalKitNftClaimed(address sender, uint256 tokenId);
    
    event RequestRandomNumber(bytes32 indexed requestId, uint256 indexed tokenId);

    event CreatedUnfinishedRandomSVG(uint256 indexed tokenId, uint256 randomNumber);
    
    /// @notice contract constructor. Takes parameters and passes them to the inherited ERC721 contract constructor
    /// @param _name the name of the contract
    /// @param _symbol the symbol that contract tokens will be represented by
    /// @param _supplyCap the maximum token that are mintable from this contract
    constructor(
        address _VRFCoordinator,
        address _linkToken,
        bytes32 _keyhash,
        string memory _name, 
        string memory _symbol, 
        uint _supplyCap)
    VRFConsumerBase(_VRFCoordinator, _linkToken)
    ERC721(_name, _symbol) {
        require(_supplyCap > 0, "supplyCap must be greater than 0");
        supplyCap = _supplyCap;
        keyHash = _keyhash;
        fee = 0.1 * 10 ** 18;
    }

    /// @notice pauses the contract. 
    /// @dev Inherits _pause() function from Pausable.sol and the onlyOwner modifier from Ownable.sol
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice unpauses the contract. 
    /// @dev Inherits _unpause() function from Pausable.sol and the onlyOwner modifier from Ownable.sol
    function unpause() public onlyOwner {
        _unpause();
    }

    /// @return maximum number of mints allowed on contract 
    function getSupplyCap() public view returns(uint256) {
        return supplyCap;
    }

    /// @return number of remaining mints on the contract
    function getRemainingMints () public view returns (uint256) {
        return supplyCap - _tokenIds.current();
    }

    /// @return number of tokens minted on the contract so far.
    function getTotalNFTsMintedSoFar () public view returns (uint256) {
        return _tokenIds.current();
    }

    /// @return a uint representing the balance (in wei) held by the contract.
    function balanceOfContract()  public view returns(uint){
        return address(this).balance;
    }

    /// @notice allows the contract owner to withdraw the funds currently being held by the contract. 
    function withdrawAllFunds()  public payable onlyOwner {
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    /// @notice allows the contract owner to withdraw the funds currently being held by the contract. 
    function withdrawFunds(uint amount)  public payable onlyOwner {
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }
    
    /** 
     * Requests randomness 
     */
    function create() public payable returns (bytes32 requestId) {
        require(msg.value >= 10000000000000000, "Not enough ETH sent; check price!");
        require(_tokenIds.current() <= supplyCap, "There are no NFTs left to mint");
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        
        // request random number from chainlink VRF
        requestId = requestRandomness(keyHash, fee);
        sendertoRequestId[msg.sender] = requestId;
        // map request to msg.sender and to a tokenId so we can match up the correct request later. 
        requestIdToSender[requestId] = msg.sender;
        requestIdToTokenId[requestId] = _tokenIds.current();
        emit RequestRandomNumber(requestId, _tokenIds.current());
        _tokenIds.increment();
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        address nftOwner = requestIdToSender[requestId];
        uint tokenId = requestIdToTokenId[requestId];
        
        // mint the token without any metadata
        _safeMint(nftOwner, tokenId);
        // map the tokenId with the returned random number
        tokenIdToRandomNumber[tokenId] = randomness;
        // good practice to emit an event after a mapping
        CreatedUnfinishedRandomSVG(tokenId, randomness);
        
        // finishMint(tokenId);
    }

    /// @notice pick a random weappon to equip the player with
    /// @dev the randomness could be improved by using an oracle feed.
    /// @param tokenId used to seed the random function
    /// @return A random weapon from the array of weapons available.
    // function pickRandomWeapon(uint256 tokenId) internal view returns (string memory) {
    //     // seed the random generator
    //     uint256 rand = random(string(abi.encodePacked("WEAPON", Strings.toString(tokenId))));
    //     // Squash the # between 0 and the length of the array to avoid going out of bounds.
    //     rand = rand % weapon.length;
    //     return weapon[rand];
    // }

    /// @notice pick a random transport to equip the player with
    /// @param tokenId used to seed the random function
    /// @return A random weapon from the array of transport available.
    // function pickRandomTransport(uint256 tokenId) internal view returns (string memory) {
    //     uint256 rand = random(string(abi.encodePacked("TRANSPORT", Strings.toString(tokenId))));
    //     rand = rand % transport.length;
    //     return transport[rand];
    // }

    /// @notice pick a random item to equip the player with
    /// @param tokenId used to seed the random function
    /// @return A random item from the array of items available.
    // function pickRandomItem(uint256 tokenId) internal view returns (string memory) {
    //     console.log("Random Seed: ", string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
    //     uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
    //     console.log("pickRandomItem rand: ", rand);
    //     rand = rand % item.length;
    //     console.log("pickRandomItem rand: ", rand);
    //     return item[rand];
    // }

    /// @notice pick a random background colour for the players card
    /// @param tokenId used to seed the random function
    /// @return A random background colour from the array of colours available.
    // function pickRandomBackgroundColour(uint256 tokenId) internal view returns (string memory) {
    //     uint256 rand = random(string(abi.encodePacked("COLOUR", Strings.toString(tokenId))));
    //     rand = rand % colors.length;
    //     return colors[rand];
    // } 

    /// @param input string input which is hashed to generate the 'random' number.
    /// @dev this function could be made truly random by using an oracle feed.
    /// @return A random integer
    // function random(string memory input) internal pure returns (uint256) {
    //     return uint(keccak256(abi.encodePacked(input)));
    // }

    /// @dev overriding this function was required to inherit from ERC721 and ERC721URIStorage
    function _burn(uint256 tokenId) internal whenNotPaused override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @param tokenId the tokenId to retrieve URI for
    /// @return the token URI containing the tokens metadata
    function tokenURI(uint256 tokenId) public view override (ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function placeItem(string memory claimedItem, string memory position) internal pure returns (string memory) {
        return string(abi.encodePacked("<text x='50%' y='", position, "' class='base' dominant-baseline='middle' text-anchor='middle'>", claimedItem, "</text>"));
    }
    
    function generateSVG(uint randomNumber) internal view returns (string memory) {
        
        // pick a weapon
        uint256 rand1 = randomNumber % weapon.length;
        string memory selectedWeapon = weapon[rand1];
        
        // pick a transport
        uint256 rand2 = randomNumber % transport.length;
        string memory selectedTransport = transport[rand2];
        
        // pick an item
        uint256 rand3 = randomNumber % item.length;
        string memory selectedItem = item[rand3];
        
        // // combine them together
        // string memory completeKit = string(abi.encodePacked(selectedWeapon, selectedTransport, selectedItem));
        
        // // get random background colour
        uint256 rand4 = randomNumber % colors.length;
        string memory randomColor = colors[rand4];
                
        // build the complete svg
        string memory finalSvg = string(abi.encodePacked(svgPartOne, randomColor, svgPartTwo, 
        placeItem(selectedWeapon, "40%"), 
        placeItem(selectedTransport, "50%"), 
        placeItem(selectedItem, "60%"), 
        "</svg>"));
        
        return finalSvg;
        
    }
    /// @notice mint an ERC721 token on the contract. The caller will receive a token containing a survival kit that includes a weapon, a transport and an item. All are randomly selected.  
    /// @dev currently does not accept payment
    /// @dev this function creates and stores the tokens URI. This is a JSON string constisting of name, description and image fields. The image is a BASE64 encoded SVG. Finally The whole JSON metadata string is BASE64 encoded and mapped to the tokenId.
    function finishMint(uint256 tokenId) public whenNotPaused{

        require(bytes(tokenURI(tokenId)).length <= 0, "tokenURI is already set!");
        require(_tokenIds.current() > tokenId, "TokenId has not been minted yet!");
        require(tokenIdToRandomNumber[tokenId] > 0, "Need to wait for the Chainlink node to respond!");

        uint randomNumber = tokenIdToRandomNumber[tokenId];

        string memory svg = generateSVG(randomNumber);

        // randomly grab one word from each of the arrays
        // string memory selectedWeapon = pickRandomWeapon(newItemId);
        // string memory selectedTransport = pickRandomTransport(newItemId);
        // string memory selectedItem = pickRandomItem(newItemId);
        // string memory completeKit = string(abi.encodePacked(selectedWeapon, selectedTransport, selectedItem));

        // console.log("completeKit: ", completeKit);

        // Add the random color in.
        // string memory randomColor = pickRandomBackgroundColour(newItemId);
        // string memory finalSvg = string(abi.encodePacked(svgPartOne, randomColor, svgPartTwo, completeKit, "</text></svg>"));
        // string memory finalSvg = string(abi.encodePacked(svgPartOne, randomColor, svgPartTwo, 
        // createItem(selectedWeapon, 1), 
        // createItem(selectedTransport, 2), 
        // createItem(selectedItem, 3), 
        // "</svg>"));

        // console.log("finalSvg: ", finalSvg);

        // get all the JSON metadata in place and base64 encode it
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',"Survival Kit",
                        '", "description": "Zombie Apocalypse Survival Kit", "image": "data:image/svg+xml;base64,',
                    // add data:image/svg+xml;base64 and then append our base64 encode our svg.
                    Base64.encode(bytes(svg)),
                    '"}'
                    )
                )
            )
        );
        console.log("BASE64 encoded JSON: ", json);

        // Just like before, we prepend data:application/json;base64, to our data.
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        console.log("finalTokenUri: ", finalTokenUri);

        console.log("\n--------------------");
        // console.log(finalTokenUri);
        console.log("--------------------\n");  

        // actually mint the NFT to the sender using msg.sender
        // _safeMint(msg.sender, newItemId);

        // store the tokens metadata
        _setTokenURI(tokenId, finalTokenUri);

        // increment the counter for when the next NFT is minted
        _tokenIds.increment();
        console.log("An NFT with ID %s has been minted to %s", tokenId, msg.sender);
        emit SurvivalKitNftClaimed(msg.sender, tokenId);
        
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal whenNotPaused override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}