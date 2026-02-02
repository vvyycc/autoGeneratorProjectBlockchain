// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    uint256 public immutable maxSupply;     // 0 => sin limite
    uint16 public immutable burnFeeBps;     // 0..10000

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        uint256 maxSupply_,
        uint16 burnFeeBps_
    ) ERC20(name_, symbol_) Ownable() {
        require(burnFeeBps_ <= 10_000, "Burn fee too high");
        maxSupply = maxSupply_;
        burnFeeBps = burnFeeBps_;

        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    function mint(address to, uint256 amount) external onlyOwner {
        if (maxSupply != 0) {
            require(totalSupply() + amount <= maxSupply, "Max supply exceeded");
        }
        _mint(to, amount);
    }

    // OZ v4: usar _transfer como hook
    function _transfer(address from, address to, uint256 amount) internal override {
        if (burnFeeBps == 0 || from == address(0) || to == address(0)) {
            super._transfer(from, to, amount);
            return;
        }

        uint256 burnAmount = (amount * burnFeeBps) / 10_000;
        uint256 sendAmount = amount - burnAmount;

        if (burnAmount > 0) {
            _burn(from, burnAmount);
        }
        super._transfer(from, to, sendAmount);
    }
}
