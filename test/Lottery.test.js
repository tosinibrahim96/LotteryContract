const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const {interface, bytecode} = require('../compile');

let lottery;
let accounts;

beforeEach(async ()=>{
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data:bytecode})
    .send({from:accounts[0], gas:'1000000'});
})


describe('Lottery Contract', () => {

  it('should deploy the contract', () => {
    assert.ok(lottery.options.address);
  });


  it('should allow a new account in the lottery', async () => {
    await lottery.methods.enter().send({
      from:accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    })

    const players = await lottery.methods.getPlayers().call();

    assert.strictEqual(accounts[0],players[0]);
    assert.strictEqual(1,players.length);
  });

  it('should allow many contestans in the lottery', async () => {

    await lottery.methods.enter().send({
      from:accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    })

    await lottery.methods.enter().send({
      from:accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    })

    await lottery.methods.enter().send({
      from:accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    })


    const players = await lottery.methods.getPlayers().call();

    assert.strictEqual(accounts[0],players[0]);
    assert.strictEqual(accounts[1],players[1]);
    assert.strictEqual(accounts[2],players[2]);
    assert.strictEqual(3,players.length);

  });

  it('should not allow less that 0.2ether', async () => {

    try {
      await lottery.methods.enter().send({
        from:accounts[1],
        value: 10
      })
      assert(false);
    } catch (error) {
      assert.ok(error);
    }
  });

  it('should allow only managers access the pickwinner function', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from:accounts[2],
      })
      assert(false);
    } catch (error) {
      assert.ok(error);
    }
  });

  it('should send money to the winner and reset the players array', async() => {
    await lottery.methods.enter().send({
      from:accounts[0],
      value: web3.utils.toWei('2', 'ether')
    })

    const initialBalance = await web3.eth.getBalance(accounts[0]);98
    await lottery.methods.pickWinner().send({from:accounts[0]});100

    const finalBalance = await web3.eth.getBalance(accounts[0]);100
    const difference = finalBalance - initialBalance;
    assert(difference > web3.utils.toWei('1.8','ether'))

  });

});