pragma solidity ^0.4.17;

/**
 * @title Lottery
 */
contract Lottery {

    address public manager;
    address[] public players;

    function Lottery() public{
        manager = msg.sender;
    }

    function enter() public payable{
        require(msg.value > .01 ether );
        players.push(msg.sender);
    }

    function random() private view returns(uint){
        return uint(keccak256(block.difficulty, now, players));
    }

    function pickWinner() public restricted{

        uint indexOfWinner = random() % players.length;
        players[indexOfWinner].transfer(this.balance);
        players = new address[](0);
    }

    modifier restricted(){
         //Verify that the person taking an action is the manager
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns(address[]){
        return players;
    }
}
