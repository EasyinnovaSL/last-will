pragma solidity ^0.4.15;

/* https://github.com/Arachnid/solidity-stringutils */
import "./strings.sol";

contract HierarchyContract {

    using strings for *;

    address owner;
    address parentContract;
    string listHeirs;
    string listHeirsPercentages;
    mapping (string => bool) mapHeirsVoteOwnerHasDied;


    function () payable {}


    function HierarchyContract (address _owner) {
        owner =_owner;
        parentContract = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner || msg.sender == parentContract);
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

    function isOwner() returns (bool){
        return msg.sender == owner;
    }

    function getHeirs() returns (string, string) {
        return (listHeirs, listHeirsPercentages);
    }

    function getBalance() constant returns (uint) {
        return  address(this).balance;
    }

    function addHeirs(string _listHeirs, string _listHeirsPercentages) onlyOwner {
        listHeirs = _listHeirs;
        listHeirsPercentages = _listHeirsPercentages;


        /* Check List Percentages */
        var s = _listHeirsPercentages.toSlice().copy();
        var delim = ";".toSlice();
        var parts = new uint256[](s.count(delim) + 1);

        require(parts.length <= 5);

        uint256 countPercentage;
        for(uint i = 0; i < parts.length; i++) {
            countPercentage = countPercentage + stringToUint(s.split(delim).toString());
        }


        require(countPercentage == 100);

    }


    function ownerDied() onlyHeir {

        //Set owner as died
        mapHeirsVoteOwnerHasDied[addressToString(msg.sender)] = true;

        var heirs = listHeirs.toSlice().copy();
        uint256 listHeirsLength = heirs.count(";".toSlice()) + 1;
        uint8 count = 0;

        for(uint i = 0; i < listHeirsLength; i++) {

            if(mapHeirsVoteOwnerHasDied[heirs.split(";".toSlice()).toString()] == true){
                count = count + 1;
            }
        }

        if(count == listHeirsLength){

           require (this.balance > 0);

            var contractBalance = this.balance;
            heirs = listHeirs.toSlice().copy();
            var  percentages = listHeirsPercentages.toSlice().copy();

            for(i = 0; i < listHeirsLength; i++) {

                //parseAddr(heirs.split(";".toSlice()).toString()).transfer((contractBalance / (100/stringToUint(percentages.split(";".toSlice()).toString()))));
                parseAddr(heirs.split(";".toSlice()).toString()).transfer(((contractBalance * stringToUint(percentages.split(";".toSlice()).toString())) / 100));
            }
        }

    }

    function getPercentage()  returns (uint){
        var  percentages = listHeirsPercentages.toSlice().copy();
        uint256 listHeirsLength = percentages.count(";".toSlice()) + 1;

        for(var i = 0; i < listHeirsLength; i++) {

            if(i==0){

           return this.balance * stringToUint(percentages.split(";".toSlice()).toString()) / 100;
            }else{
                stringToUint(percentages.split(";".toSlice()).toString());
            }

        }

    }


    function getBalance() constant returns (uint) {
        return  address(this).balance;
    }



    function stringToUint(string s) constant returns (uint result) {
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

    function addressToString(address x) returns (string) {
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

    function char(byte b) returns (byte c) {
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
