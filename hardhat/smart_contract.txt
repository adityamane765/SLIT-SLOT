//  SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SlotMachine {
    address public owner;

    event BetPlaced(address indexed player, uint256 amount, uint8[3] slots, uint256 payout);
    event OwnerWithdrawal(uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Access only for owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // main code
    function play() external payable {
        
        require(msg.value > 0, "Please choose a positive value : ");
        require(address(this).balance >= msg.value * 2, "Insufficient contract balance for this bet amount");

    // 3 random numbers added in hashing
        uint8[3] memory slots = [
            uint8(uint256(keccak256(abi.encodePacked(block.timestamp+1247, msg.sender))) % 4),
            uint8(uint256(keccak256(abi.encodePacked(block.timestamp+2758, msg.sender))) % 4),
            uint8(uint256(keccak256(abi.encodePacked(block.timestamp+4759, msg.sender))) % 4)
        ];

        uint256 loot = winnings(slots, msg.value);
        if (loot > 0) {
            payable(msg.sender).transfer(loot);
        }
        emit BetPlaced(msg.sender, msg.value, slots, loot);
    }

    function winnings(uint8[3] memory slots, uint256 betAmount) public returns (uint256) {
        if (slots[0] == slots[1] && slots[1] == slots[2]) {
            return betAmount * 2;
        } else if (slots[0] == slots[1] || slots[1] == slots[2] || slots[0] == slots[2]) {
            return betAmount;
        } else {
            return 0;
        }
    }

    function withdraw_winnings(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        payable(owner).transfer(amount);
        emit OwnerWithdrawal(amount);
    }

    receive() external payable {}
}
