var SimpleWallet = artifacts.require("../contracts/SimpleWallet.sol");

contract('SimpleWallet', function (accounts) {
  it ('the owner is allowed to send funds', function() {
    return SimpleWallet.deployed().then(function(instance) {
      return instance.isAllowedToSend.call(accounts[0]);
    }).then(function(isAllowed) {
      assert.equal(isAllowed, true, 'the user must be allowed to send funds');
    });
  });

  it('the other account should not be allowed to send funds', function() {
    return SimpleWallet.deployed().then(function(instance) {
      return instance.isAllowedToSend.call(accounts[2]);
    }).then(function(isAllowed) {
      assert.equal(isAllowed, false, 'the other account was allowed!');
    });
  });

  it('adding accounts to the allowed list' , function() {
    var myAccount;
    return SimpleWallet.deployed().then(function(instance) {
      myAccount = instance;
      // check if the second account is allowed to send funds
      return instance.isAllowedToSend.call(accounts[1]);
    }).then(function(isAllowed) {
      // it shouldn't
      assert.equal(isAllowed, false, 'the other account was allowed!');
    }).then(function() {
      // allow the address to send money
      return myAccount.allowAddressToSendMoney(accounts[1]);
    }).then(function() {
      // check again if is allowed to send
      return myAccount.isAllowedToSend.call(accounts[1]);
    }).then(function(isAllowed) {
      // should be allowed
      assert.equal(true, isAllowed, 'the other account was not allowed!');
    }).then(function() {
      // remove the ability to send the moneny
      return myAccount.disallowAddressToSendMoney(accounts[1]);
    }).then(function() {
      // check again if is allowed to send
      return myAccount.isAllowedToSend.call(accounts[1]);
    }).then(function(isAllowed) {
       // shouldn't be allowed anymore
      assert.equal(false, isAllowed, 'the other account was allowed!');
    });
  });

  it("should check Deposit Events", function (done) {
    var meta;
    SimpleWallet.deployed().then(function(instance) {
      meta = instance;
      var event = meta.allEvents();
      event.watch(function (error, result) {
        if (error) {
          console.err(error);
        } else {
          // now we'll check that the events are correct
          assert.equal(result.event, "Deposit");
          assert.equal(web3.fromWei(result.args.amount.valueOf(), "ether"), 1);
          assert.equal(result.args._sender.valueOf(), web3.eth.accounts[0]);
          event.stopWatching();
          done();
        }
      });
      // we'll send ether
      web3.eth.sendTransaction({from: web3.eth.accounts[0], to: meta.address, value: web3.toWei(1, "ether")});
    });
  });

  it("should check not allowed Deposit Events", function (done) {
    var meta;
    SimpleWallet.deployed().then(function(instance) {
      meta = instance;

      // we'll send ether
      web3.eth.sendTransaction({
        from: web3.eth.accounts[1],
        to: meta.address,
        value: web3.toWei(1, "ether")
      }, function (error, result) {
        if (error) {
          done();
        } else {
          done(result);
        }
      });
    });
  });
}); 