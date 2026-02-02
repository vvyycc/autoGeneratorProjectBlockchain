// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SaleManager is Ownable {
    struct Round {
        uint8 kind; // 0 presale, 1 public
        uint64 start;
        uint64 end;
        uint256 priceWeiPerToken; // Price in wei per token (assumes 18 decimals)
        uint256 hardCapTokens;
        uint256 minBuyTokens;
        uint256 maxBuyTokens;
        uint256 soldTokens;
        bool whitelistEnabled;
        bool vestingEnabled;
    }

    IERC20 public immutable token;

    mapping(bytes32 => Round) public rounds;
    mapping(bytes32 => bool) public roundExists;
    bytes32[] public roundIds;
    mapping(bytes32 => mapping(address => uint256)) public purchasedTokens;
    mapping(bytes32 => mapping(address => bool)) public whitelist;
    mapping(bytes32 => mapping(address => uint256)) public claimable;

    event RoundCreated(bytes32 indexed roundId, uint8 kind, uint64 start, uint64 end);
    event RoundUpdated(bytes32 indexed roundId);
    event TokensPurchased(bytes32 indexed roundId, address indexed buyer, uint256 tokens, uint256 value);
    event TokensClaimed(bytes32 indexed roundId, address indexed buyer, uint256 tokens);

    constructor(address token_) {
        require(token_ != address(0), "Token required");
        token = IERC20(token_);
    }

    function createRound(bytes32 roundId, Round calldata params) external onlyOwner {
        require(!roundExists[roundId], "Round exists");
        require(params.priceWeiPerToken > 0, "Price required");
        require(params.end > params.start, "Invalid time");

        Round memory round = params;
        round.soldTokens = 0;
        rounds[roundId] = round;
        roundExists[roundId] = true;
        roundIds.push(roundId);

        emit RoundCreated(roundId, params.kind, params.start, params.end);
    }

    function setRound(bytes32 roundId, Round calldata params) external onlyOwner {
        require(roundExists[roundId], "Round missing");
        require(params.priceWeiPerToken > 0, "Price required");
        require(params.end > params.start, "Invalid time");

        Round storage existing = rounds[roundId];
        uint256 currentSold = existing.soldTokens;
        existing.kind = params.kind;
        existing.start = params.start;
        existing.end = params.end;
        existing.priceWeiPerToken = params.priceWeiPerToken;
        existing.hardCapTokens = params.hardCapTokens;
        existing.minBuyTokens = params.minBuyTokens;
        existing.maxBuyTokens = params.maxBuyTokens;
        existing.soldTokens = currentSold;
        existing.whitelistEnabled = params.whitelistEnabled;
        existing.vestingEnabled = params.vestingEnabled;

        emit RoundUpdated(roundId);
    }

    function setWhitelist(
        bytes32 roundId,
        address[] calldata users,
        bool enabled
    ) external onlyOwner {
        require(roundExists[roundId], "Round missing");
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[roundId][users[i]] = enabled;
        }
    }

    function buyETH(bytes32 roundId) external payable {
        require(roundExists[roundId], "Round missing");
        Round storage round = rounds[roundId];

        require(block.timestamp >= round.start && block.timestamp <= round.end, "Round inactive");
        require(msg.value > 0, "Value required");
        if (round.whitelistEnabled) {
            require(whitelist[roundId][msg.sender], "Not whitelisted");
        }

        uint256 tokensToBuy = (msg.value * 1e18) / round.priceWeiPerToken;
        require(tokensToBuy > 0, "Zero tokens");
        if (round.minBuyTokens > 0) {
            require(tokensToBuy >= round.minBuyTokens, "Below min buy");
        }
        if (round.maxBuyTokens > 0) {
            require(purchasedTokens[roundId][msg.sender] + tokensToBuy <= round.maxBuyTokens, "Above max buy");
        }
        if (round.hardCapTokens > 0) {
            require(round.soldTokens + tokensToBuy <= round.hardCapTokens, "Hard cap reached");
        }

        purchasedTokens[roundId][msg.sender] += tokensToBuy;
        round.soldTokens += tokensToBuy;

        if (round.vestingEnabled) {
            claimable[roundId][msg.sender] += tokensToBuy;
        } else {
            require(token.transfer(msg.sender, tokensToBuy), "Token transfer failed");
        }

        emit TokensPurchased(roundId, msg.sender, tokensToBuy, msg.value);
    }

    function claimTokens(bytes32 roundId) external {
        require(roundExists[roundId], "Round missing");
        uint256 amount = claimable[roundId][msg.sender];
        require(amount > 0, "Nothing to claim");
        claimable[roundId][msg.sender] = 0;
        require(token.transfer(msg.sender, amount), "Token transfer failed");
        emit TokensClaimed(roundId, msg.sender, amount);
    }

    function withdrawETH(address to) external onlyOwner {
        require(to != address(0), "Invalid address");
        payable(to).transfer(address(this).balance);
    }
}
