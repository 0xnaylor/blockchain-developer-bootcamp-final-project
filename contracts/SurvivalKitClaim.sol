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
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Import helper functions needed for Base62 encoding
import { Base64 } from "./libraries/Base64.sol";

/**
@title Zombie Apocalipse Survival kit generator
@author Ben Naylor
 */
contract SurvivalKitClaim is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ReentrancyGuard {

    uint private supplyCap = 3000;

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

    /// @notice contract constructor. Takes parameters and passes them to the inherited ERC721 contract constructor
    /// @param _name the name of the contract
    /// @param _symbol the symbol that contract tokens will be represented by
    /// @param _supplyCap the maximum token that are mintable from this contract
    constructor(string memory _name, string memory _symbol, uint _supplyCap) ERC721(_name, _symbol) {
        require(_supplyCap > 0, "supplyCap must be greater than 0");
        supplyCap = _supplyCap;
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

    function compareStrings(string memory a, string memory b) public pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function pickRandomTrait(uint tokenId, string memory trait) internal view returns (string memory) {
        // create the psuedo random number using function paramters as a seed
        uint256 rand = random(string(abi.encodePacked(trait, Strings.toString(tokenId))));

        if (compareStrings(trait, "WEAPON")) {
            rand = rand % weapon.length;
            return weapon[rand];
        } else if (compareStrings(trait, "TRANSPORT")) {
            rand = rand % transport.length;
            return transport[rand];
        } else if (compareStrings(trait, "ITEM")) {
            rand = rand % item.length;
            return item[rand];
        } else if (compareStrings(trait, "COLOUR")) {
            rand = rand % colors.length;
            return colors[rand];
        } else {
            return "";
        }

    }

    /// @param input string input which is hashed to generate the 'random' number.
    /// @dev this function could be made truly random by using an oracle feed.
    /// @return A random integer
    function random(string memory input) internal pure returns (uint256) {
        return uint(keccak256(abi.encodePacked(input)));
    }

    /// @dev overriding this function was required to inherit from both ERC721 and ERC721URIStorage
    function _burn(uint256 tokenId) internal whenNotPaused override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @param tokenId the tokenId to retrieve URI for
    /// @return the token URI containing the tokens metadata
    function tokenURI(uint256 tokenId) public view override (ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /// @notice helper function to place items on separate lines. 
    /// @dev function seems clunky. This should be refactor into a more elegant solution.
    /// @param claimedItem the name of the item to be added to the NFT.
    /// @param itemNumber the position in which to display the item in the NFT art.
    /// @return An SVG string containing the item and its display position in the NFT art. 
    function createItem(string memory claimedItem, uint itemNumber) internal pure returns (string memory) {
        string memory position;
        if(itemNumber == 1) {
            position = "40%";
        } else if (itemNumber == 2) {
            position = "50%";
        } else {
            position = "60%";
        }
        
        return string(abi.encodePacked("<text x='50%' y='", position, "' class='base' dominant-baseline='middle' text-anchor='middle'>", claimedItem, "</text>"));
    }
    

    /// @notice mint an ERC721 token on the contract. The caller will receive a token containing a survival kit that includes a weapon, a transport and an item. All are randomly selected.  
    /// @dev currently does not accept payment
    /// @dev this function creates and stores the tokens URI. This is a JSON string constisting of name, description and image fields. The image is a BASE64 encoded SVG. Finally The whole JSON metadata string is BASE64 encoded and mapped to the tokenId.
    function mintNFT() public payable whenNotPaused { 
        require(_tokenIds.current() <= supplyCap, "There are no NFTs left to mint");
        require(msg.value >= 10000000000000000, "Not enough ETH sent; check price!");
        
        // get the current tokenId, this starts at 0
        uint newItemId = _tokenIds.current();

        // randomly grab one word from each of the arrays
        string memory selectedWeapon = pickRandomTrait(newItemId, "WEAPON");
        string memory selectedTransport = pickRandomTrait(newItemId, "TRANSPORT");
        string memory selectedItem = pickRandomTrait(newItemId, "ITEM");

        // Add the random color in.
        string memory randomColor = pickRandomTrait(newItemId, "COLOUR");
        string memory finalSvg = string(abi.encodePacked(svgPartOne, randomColor, svgPartTwo, 
        createItem(selectedWeapon, 1), 
        createItem(selectedTransport, 2), 
        createItem(selectedItem, 3), 
        "</svg>"));
        // get all the JSON metadata in place and base64 encode it
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',"Survival Kit",
                        '", "description": "Zombie Apocalypse Survival Kit", "image": "data:image/svg+xml;base64,',
                    // add data:image/svg+xml;base64 and then append our base64 encode our svg.
                    Base64.encode(bytes(finalSvg)),
                    '"}'
                    )
                )
            )
        );

        // Just like before, we prepend data:application/json;base64, to our data.
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        // actually mint the NFT to the sender using msg.sender
        _safeMint(msg.sender, newItemId);

        // store the tokens metadata
        _setTokenURI(newItemId, finalTokenUri);

        // increment the counter for when the next NFT is minted
        _tokenIds.increment();
        emit SurvivalKitNftClaimed(msg.sender, newItemId);
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal whenNotPaused override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /// @notice required override in order to inherit from both ERC721 and ERC721Enumerable
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}