// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DailyCheckIn} from "../src/DailyCheckIn.sol";

contract DailyCheckInTest is Test {
    DailyCheckIn public c;

    address alice = address(0xA11CE);

    function setUp() public {
        vm.warp(1_700_000_000);
        c = new DailyCheckIn();
    }

    function test_RevertWhenSendingEth() public {
        vm.expectRevert(DailyCheckIn.NoEthAllowed.selector);
        c.checkIn{value: 1 wei}();
    }

    function test_FirstCheckInSetsStreakOne() public {
        uint256 day = block.timestamp / 1 days;
        vm.prank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);
        assertEq(c.lastCheckInDay(alice), day + 1);
    }

    function test_CannotCheckInTwiceSameDay() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(DailyCheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_ConsecutiveDayIncrementsStreak() public {
        uint256 day0 = block.timestamp / 1 days;
        vm.prank(alice);
        c.checkIn();

        vm.warp((day0 + 1) * 1 days + 100);
        vm.prank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 2);
    }

    function test_SkipDayResetsStreak() public {
        uint256 day0 = block.timestamp / 1 days;
        vm.prank(alice);
        c.checkIn();

        vm.warp((day0 + 2) * 1 days + 100);
        vm.prank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);
    }
}
