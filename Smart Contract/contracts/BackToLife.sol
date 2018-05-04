pragma solidity ^0.4.15;

/* https://github.com/Arachnid/solidity-stringutils */
import "./strings.sol";

contract BackToLife {

    using strings for *;

    mapping (address => string) mapOwnerStringContract;


    function createHierarchyContract (string _listHeirs, string _listHeirsPercentages) {

        address newHierarchyContract = new HierarchyContract(msg.sender);

        HierarchyContract _HierarchyContract = HierarchyContract(newHierarchyContract);

        var stringContractAddress = addressToString(newHierarchyContract);

        mapOwnerStringContract[msg.sender] =  mapOwnerStringContract[msg.sender].toSlice().concat(stringContractAddress.toSlice()).toSlice().concat(";".toSlice());

        /* Add contract to the list of each heirs */
        var s = _listHeirs.toSlice().copy();
        var delim = ";".toSlice();
        uint256 listHeirsLength = s.count(delim) + 1;
        bool itsHeir = false;

        string memory senderStringAddress = addressToString(msg.sender);

        for(uint i = 0; i < listHeirsLength; i++) {

            address heirAddress = parseAddr(s.split(delim).toString());
            mapOwnerStringContract[heirAddress] =  mapOwnerStringContract[heirAddress].toSlice().concat(stringContractAddress.toSlice()).toSlice().concat(";".toSlice());
        }


        /* Add heirs to the contract */
        _HierarchyContract.addHeirs(_listHeirs, _listHeirsPercentages);




    }



    function getMyContracts() returns (string) {
        return mapOwnerStringContract[msg.sender];
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

    function addHeirs(string _listHeirs, string _listHeirsPercentages) onlyOwner {
        listHeirs = _listHeirs;
        listHeirsPercentages = _listHeirsPercentages;


        /* Check List Percentages */
        var s = _listHeirsPercentages.toSlice();
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

        var s = listHeirs.toSlice().copy();
        var delim = ";".toSlice();
        uint256 listHeirsLength = s.count(delim) + 1;
        uint8 count = 0;

        for(uint i = 0; i < listHeirsLength; i++) {

            if(mapHeirsVoteOwnerHasDied[s.split(delim).toString()]){
                count = count + 1;
            }
        }



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
