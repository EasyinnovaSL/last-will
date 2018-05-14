pragma solidity ^0.4.15;

/* https://github.com/Arachnid/solidity-stringutils */
import "./strings.sol";
import "./HierarchyContract.sol";

contract BackToLife {

    using strings for *;

    mapping (address => string) mapOwnerStringContract;


    /* FallBack Payable function */
    function () payable {}

    function createHierarchyContract (string _listHeirs, string _listHeirsPercentages, string _listWitnesses) {

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
        _HierarchyContract.addHeirs(_listHeirs, _listHeirsPercentages, _listWitnesses);

    }


    function createHierarchyContractPayable (string _listHeirs, string _listHeirsPercentages, string _listWitnesses) payable {

        address newHierarchyContract = new HierarchyContract(msg.sender);

        HierarchyContract _HierarchyContract = HierarchyContract(newHierarchyContract);

        var stringContractAddress = addressToString(newHierarchyContract);

        mapOwnerStringContract[msg.sender] =  mapOwnerStringContract[msg.sender].toSlice().concat(stringContractAddress.toSlice()).toSlice().concat(";".toSlice());

        var s = _listHeirs.toSlice().copy();

        if (!s.endsWith(";".toSlice())){
            _listHeirs.toSlice().concat(";".toSlice());
        }

        s = _listWitnesses.toSlice().copy();
        if (!s.endsWith(";".toSlice())){
            _listWitnesses.toSlice().concat(";".toSlice());
        }

        s = _listHeirsPercentages.toSlice().copy();
        if (!s.endsWith(";".toSlice())){
            _listHeirsPercentages.toSlice().concat(";".toSlice());
        }

        /* Add contract to the list of each heirs */
        s = _listHeirs.toSlice().copy();
        var delim = ";".toSlice();
        uint256 listHeirsLength = s.count(delim) + 1;
        bool itsHeir = false;

        string memory senderStringAddress = addressToString(msg.sender);

        for(uint i = 0; i < listHeirsLength; i++) {

            address heirAddress = parseAddr(s.split(delim).toString());
            mapOwnerStringContract[heirAddress] =  mapOwnerStringContract[heirAddress].toSlice().concat(stringContractAddress.toSlice()).toSlice().concat(";".toSlice());
        }


        /* Add heirs to the contract */
        _HierarchyContract.addHeirs(_listHeirs, _listHeirsPercentages, _listWitnesses);


        //ms.value is the number of wei sent with the message
        if(!newHierarchyContract.send(msg.value)){
            throw;
        }
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

    function getBalance() constant returns (uint) {
        return  address(this).balance;
    }

}
