// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily on-chain check-in on Base. No ETH accepted — user pays L2 gas only.
/// @dev `lastCheckInDay` stores (calendar_day + 1); raw 0 means "never checked in".
contract DailyCheckIn {
    /// @notice Encoded: 0 = never; else value is (dayIndex + 1) where dayIndex = block.timestamp / 1 days
    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 day, uint256 streakCount);

    error NoEthAllowed();
    error AlreadyCheckedInToday();

    function checkIn() external payable {
        if (msg.value != 0) revert NoEthAllowed();

        uint256 today = block.timestamp / 1 days;
        uint256 encoded = lastCheckInDay[msg.sender];
        uint256 lastDay = encoded == 0 ? type(uint256).max : encoded - 1;

        if (lastDay == today) revert AlreadyCheckedInToday();

        if (encoded == 0) {
            streak[msg.sender] = 1;
        } else if (lastDay == today - 1) {
            streak[msg.sender] += 1;
        } else {
            streak[msg.sender] = 1;
        }

        lastCheckInDay[msg.sender] = today + 1;
        emit CheckedIn(msg.sender, today, streak[msg.sender]);
    }
}
