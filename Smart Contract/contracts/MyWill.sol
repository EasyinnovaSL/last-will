pragma solidity ^0.4.15;

/* https://github.com/Arachnid/solidity-stringutils */
import "./strings.sol";

contract MyWill {

    using strings for *;

    /* The club address */
    address club;

    /* The contract owner */
    address owner;

    /* The list of witnesses */
    string listWitnesses;

    /* The heirs with its respective percentages */
    string listHeirs;
    string listHeirsPercentages;

    /* The current votes */
    mapping (string => bool) mapHeirsVoteOwnerHasDied;

    /* The status of the contract*/
    enum Status {CREATED, ALIVE, DEAD}
    Status status;

    /* EVENTS */
    event Deposit(address from, uint value);
    event SingleTransact(address owner, uint value, address to, bytes data);

    /* ***************** */
    /* Contract creation */
    /* ***************** */

    function MyWill (address _owner, string _listHeirs, string _listHeirsPercentages, string _listWitnesses, address _club) {
        club = _club;
        owner = _owner;
        status = Status.CREATED;
        listHeirs = _listHeirs;
        listHeirsPercentages = _listHeirsPercentages;
        listWitnesses = _listWitnesses;

        /* Check List Percentages */
        var s = _listHeirsPercentages.toSlice().copy();
        var delim = ";".toSlice();
        var parts = new uint256[](s.count(delim) + 1);

        uint256 countPercentage;
        for(uint i = 0; i < parts.length; i++) {
            countPercentage = countPercentage + stringToUint(s.split(delim).toString());
        }

        require(countPercentage == 100000);
    }

    /* ********* */
    /* Modifiers */
    /* ********* */

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyAlive() {
        require(status == Status.ALIVE || status == Status.CREATED);
        _;
    }

    modifier onlyDead() {
        require(status == Status.DEAD);
        _;
    }

    modifier onlyHeir() {

        var s = listHeirs.toSlice().copy();
        var delim = ";".toSlice();
        string[] memory listOfHeirs = new string[](s.count(delim) + 1);
        bool itsHeir = false;

        string memory senderStringAddress = addressToString(msg.sender);

        for(uint i = 0; i < listOfHeirs.length; i++) {

            if(keccak256(senderStringAddress) == keccak256(s.split(delim).toString())){
                itsHeir = true;
                break;
            }
        }

        require(itsHeir);

        _;
    }

    modifier onlyWitness() {

        var s = listWitnesses.toSlice().copy();
        var delim = ";".toSlice();
        string[] memory arrayOfWitnesses = new string[](s.count(delim) + 1);
        bool itsWitness = false;

        string memory senderStringAddress = addressToString(msg.sender);

        for(uint i = 0; i < arrayOfWitnesses.length; i++) {

            if(keccak256(senderStringAddress) == keccak256(s.split(delim).toString())){
                itsWitness = true;
                break;
            }
        }

        require(itsWitness);

        _;
    }

    /* ********* */
    /* Functions */
    /* ********* */

    /* Deposit ether to contract */
    function () payable onlyAlive {
        if (status == Status.CREATED) {
            /* First time, provide witness with ether and pay the fee */

            // Check if the minimum ammount is provided
            var witnessesList = listWitnesses.toSlice().copy();
            var witnessesLength = witnessesList.count(";".toSlice()) + 1;
            var needed = 1000000000000000 * witnessesLength + 5000000000000000; // 0.001 for each witness and 0.005 for the costs of deploying the smart contract
            require(msg.value > needed);

            // Send ether to witnesses
            for (uint i = 0; i < witnessesLength; i++) {
                var witnessAddress = parseAddr(witnessesList.split(";".toSlice()).toString());
                witnessAddress.transfer(1000000000000000);
            }

            // Send ether to club
            club.transfer(5000000000000000);

            // Set the status to active
            status = Status.ALIVE;

            // Deposit event
            Deposit(msg.sender, msg.value - needed);
        } else {
            Deposit(msg.sender, msg.value);
        }
    }

    /* Witness executes owner died */
    function ownerDied() onlyWitness onlyAlive {

        require (this.balance > 0);

        //Set owner as died
        mapHeirsVoteOwnerHasDied[addressToString(msg.sender)] = true;

        var users = listWitnesses.toSlice().copy();
        uint256 listLength = users.count(";".toSlice()) + 1;
        uint8 count = 0;

        for(uint i = 0; i < listLength; i++) {

            if(mapHeirsVoteOwnerHasDied[users.split(";".toSlice()).toString()] == true){
                count = count + 1;
            }
        }

        if(count == listLength){

            /* Execute the last will */

            users = listHeirs.toSlice().copy();
            var  percentages = listHeirsPercentages.toSlice().copy();
            listLength = users.count(";".toSlice()) + 1;

            for(i = 0; i < listLength - 1; i++) {
                parseAddr(users.split(";".toSlice()).toString()).transfer(((this.balance * stringToUint(percentages.split(";".toSlice()).toString())) / 100000));
            }

            // Last one gets the remaining
            parseAddr(users.split(";".toSlice()).toString()).transfer(this.balance);

            status = Status.DEAD;
        }
    }

    /* ******** */
    /* Transfer */
    /* ******** */

    function execute(address _to, uint _value, bytes _data) external onlyOwner {
        SingleTransact(msg.sender, _value, _to, _data);
        _to.call.value(_value)(_data);
    }

    /* ******* */
    /* Getters */
    /* ******* */

    function isOwner() returns (bool){
        return msg.sender == owner;
    }

    function hasDied() returns (bool){
        return status == Status.DEAD;
    }

    function getHeirs() returns (string, string) {
        return (listHeirs, listHeirsPercentages);
    }

    function getWitnesses() returns (string) {
        return listWitnesses;
    }

    function getWitnessesCount() returns (uint) {
        return listWitnesses.toSlice().copy().count(";".toSlice()) + 1;
    }

    function getBalance() constant returns (uint) {
        return  address(this).balance;
    }

    function hasVoted() returns (bool){
        return mapHeirsVoteOwnerHasDied[addressToString(msg.sender)];
    }

    /* ***************** */
    /* Utility Functions */
    /* ***************** */

    function stringToUint(string s) constant private returns (uint result) {
        bytes memory b = bytes(s);
        uint i;
        result = 0;
        for (i = 0; i < b.length; i++) {
            uint c = uint(b[i]);
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
    }

    function addressToString(address x) private returns (string) {
        bytes memory s = new bytes(42);
        s[0] = "0";
        s[1] = "x";
        for (uint i = 0; i < 20; i++) {
            byte b = byte(uint8(uint(x) / (2**(8*(19 - i)))));
            byte hi = byte(uint8(b) / 16);
            byte lo = byte(uint8(b) - 16 * uint8(hi));
            s[2+2*i] = char(hi);
            s[2+2*i+1] = char(lo);
        }
        return string(s);
    }

    function char(byte b) private returns (byte c) {
        if (b < 10) return byte(uint8(b) + 0x30);
        else return byte(uint8(b) + 0x57);
    }


    function parseAddr(string _a) internal returns (address){
        bytes memory tmp = bytes(_a);
        uint160 iaddr = 0;
        uint160 b1;
        uint160 b2;
        for (uint i=2; i<2+2*20; i+=2){
            iaddr *= 256;
            b1 = uint160(tmp[i]);
            b2 = uint160(tmp[i+1]);
            if ((b1 >= 97)&&(b1 <= 102)) b1 -= 87;
            else if ((b1 >= 48)&&(b1 <= 57)) b1 -= 48;
            if ((b2 >= 97)&&(b2 <= 102)) b2 -= 87;
            else if ((b2 >= 48)&&(b2 <= 57)) b2 -= 48;
            iaddr += (b1*16+b2);
        }
        return address(iaddr);
    }


}
