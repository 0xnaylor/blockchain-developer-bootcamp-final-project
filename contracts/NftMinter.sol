// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// We first import some OpenZeppelin Contracts.
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat-console/contracts/console.sol";

// Import helper functions needed for Base62 encoding
import { Base64 } from "./libraries/Base64.sol";

contract NftMinter is ERC721URIStorage {

    // Use OpenZeppelin utility to keep track of tokenIds
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // We split the SVG at the part where it asks for the background color.
    string svgPartOne = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='";
    string svgPartTwo = "'/><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    string[] firstWords = ["Slick", "Sliding", "Flapping", "Flipping", "Sodding", "Whopping"];
    string[] secondWords = ["Flange", "Simple", "Crapping", "Humongous", "Slippy", "fat"];
    string[] thirdWords = ["Mongy", "Cabbage", "Lettuce", "Turnip", "Fridge", "Carrot"];
    string[] colors = ["red", "#08C2A8", "black", "yellow", "blue", "green"];

    // define an event that canbe emitted after a mint
    event NewEpicNFTMinted(address sender, uint256 tokenId);

    constructor() ERC721("SquareNFT", "SQUARE") { //ERC721URIStorage inherits from the ERC721 contract which requires arguments to be passed into its constructor. 
        console.log("This is my NFT contract. Woah!");
    }

      // Bit of code duplication in the following 3 functions. This could probably be refactored to make it more DRY.
    function pickRandomFirstWord(uint256 tokenId) public view returns (string memory) {
        // I seed the random generator. More on this in the lesson. 
        uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));
        // Squash the # between 0 and the length of the array to avoid going out of bounds.
        rand = rand % firstWords.length;
        return firstWords[rand];
    }

    function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
        rand = rand % secondWords.length;
        return secondWords[rand];
    }

    function pickRandomThirdWord(uint256 tokenId) public view returns (string memory) {
        console.log("Random Seed: ", string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
        uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
        console.log("pickRandomThirdWord rand: ", rand);
        rand = rand % thirdWords.length;
        console.log("pickRandomThirdWord rand: ", rand);
        return thirdWords[rand];
    }

    function pickRandomColor(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("COLOR", Strings.toString(tokenId))));
        rand = rand % colors.length;
        return colors[rand];
    } 

    function random(string memory input) internal pure returns (uint256) {
        return uint(keccak256(abi.encodePacked(input)));
    }

    function getTotalNFTsMintedSoFar () public view returns (uint256) {
        return _tokenIds.current();
    }

    function mintNFT() public {

        // There will only be 5 NFT's available
        require(_tokenIds.current() <= 20, "There are no NFTs left to mint");
        
        // get the current tokenId, this starts at 0
        uint newItemId = _tokenIds.current();

        // randomly grab one word from each of the arrays
        string memory first = pickRandomFirstWord(newItemId);
        string memory second = pickRandomSecondWord(newItemId);
        string memory third = pickRandomThirdWord(newItemId);
        string memory combinedWord = string(abi.encodePacked(first, second, third));
        console.log("combinedWord: ", combinedWord);

        // Add the random color in.
        string memory randomColor = pickRandomColor(newItemId);
        string memory finalSvg = string(abi.encodePacked(svgPartOne, randomColor, svgPartTwo, combinedWord, "</text></svg>"));
        console.log("finalSvg: ", finalSvg);

        // get all the JSON metadata in place and base64 encode it
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',combinedWord,
                        '", "description": "A highly acclaimed collection of squares.", "image": "data:image/svg+xml;base64,',
                    // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                    Base64.encode(bytes(finalSvg)),
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
        _safeMint(msg.sender, newItemId);

        // set the NFTs data
        _setTokenURI(newItemId, finalTokenUri);

        // increment the counter for when the next NFT is minted
        _tokenIds.increment();
        console.log("An NFT with ID %s has been minted to %s", newItemId, msg.sender);
        emit NewEpicNFTMinted(msg.sender, newItemId);
    }
}