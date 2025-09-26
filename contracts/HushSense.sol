// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title HushSense Token
/// @notice ERC20 token for rewarding noise measurement contributions in the HushSense app
contract HushSense is ERC20, Ownable {

    /// @notice Emitted when tokens are minted as rewards
    event RewardMinted(address indexed to, uint256 amount);

    /// @notice Emitted when tokens are burned
    event TokensBurned(address indexed from, uint256 amount);

    /// @notice Constructor mints the total fixed supply to the deployer
    constructor() ERC20("HushSense Token", "HUSH") Ownable(msg.sender) {
        // Total supply: 10 billion tokens with 18 decimals
        _mint(msg.sender, 10_000_000_000 * 10 ** decimals());
    }

    /// @notice Allows owner (backend/admin) to mint tokens for rewards
    /// @param to Recipient address
    /// @param amount Amount of tokens (with 18 decimals)
    function mintReward(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit RewardMinted(to, amount);
    }

    /// @notice Allows token holders to burn their tokens
    /// @param amount Amount to burn from sender
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
}
