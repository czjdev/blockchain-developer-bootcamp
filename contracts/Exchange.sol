// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;

    mapping(address => mapping(address => uint256)) public tokens;

    constructor (address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    } 

    // deposit tokens
    function depositToken(address _token, uint256 _amount) public {
        // transfer tokens to exchange
        Token(_token).transferFrom(msg.sender, address(this), _amount);
        // update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
        // emit an event
    }

    // check balances
}