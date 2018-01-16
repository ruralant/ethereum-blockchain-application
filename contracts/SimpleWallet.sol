pragma solidity ^0.4.18;

contract SimpleWallet {

  address owner;

  struct WithdrawlStruct {
    address to;
    uint amount;
  }

  struct Senders {
    bool allowed;
    uint amountSends;
    mapping(uint => WithdrawlStruct) withdrawls;
  }

  mapping(address => Senders) isAllowedToSendFundsMapping;


  event Deposit(address _sender, uint amount);
  event Withdrawl(address _sender, uint amount, address _beneficiary);

  function SimpleWallet() public {
    owner = msg.sender;
  }

  function() public payable {
    if (isAllowedToSend(msg.sender)) {
      Deposit(msg.sender, msg.value);
    } else {
      revert();
    }
  }

  function sendFunds(uint amount, address receiver) public returns (uint) {
      if (isAllowedToSend(msg.sender)) {
        if (this.balance >= amount) {
          if (!receiver.send(amount)) {
            revert();
          }
          Withdrawl(msg.sender, amount, receiver);
          isAllowedToSendFundsMapping[msg.sender].amountSends++;
          isAllowedToSendFundsMapping[msg.sender].withdrawls[isAllowedToSendFundsMapping[msg.sender].amountSends].to = receiver;
          isAllowedToSendFundsMapping[msg.sender].withdrawls[isAllowedToSendFundsMapping[msg.sender].amountSends].amount = amount;
          return this.balance;
        }
      }
    }

    function getAmountOfWithdrawls(address _address) public constant returns (uint) {
      return isAllowedToSendFundsMapping[_address].amountSends;
    }

    function getWithdrawlForAddress(address _address, uint index) public constant returns (address, uint) {
      return (isAllowedToSendFundsMapping[_address].withdrawls[index].to, isAllowedToSendFundsMapping[_address].withdrawls[index].amount);
    }

    function allowAddressToSendMoney(address _address) public {
      if (msg.sender == owner) {
          isAllowedToSendFundsMapping[_address].allowed = true;
        }
    }

    function disallowAddressToSendMoney(address _address) public {
      if (msg.sender == owner) {
          isAllowedToSendFundsMapping[_address].allowed = false;
        }
    }

    function isAllowedToSend(address _address) public constant returns (bool) {
      return isAllowedToSendFundsMapping[_address].allowed || _address == owner;
    }

    function killWallet() public {
      if (msg.sender == owner) {
        selfdestruct(owner);
      }
    }
}