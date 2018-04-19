pragma solidity ^0.4.15;

contract AfterLife {

    struct Hierarchy{
        address[] listUsers;
        mapping (address => Key[]) listUserKeys;
    }

    struct Key{
        string keyPart;
        uint8 order;
    }

    //Files Hashmap
    mapping (address => Hierarchy) listFileHashmap;


    function addHierarchy(address _userWithAccess, string _keyPart, uint8 _order){

        //Add User
        listFileHashmap[msg.sender].listUsers.push(_userWithAccess);

        //Add Key
        listFileHashmap[msg.sender].listUserKeys[_userWithAccess].push(Key({keyPart: _keyPart, order: _order}));
    }

    function getMyKeyPart(address _ownerAddress) returns (string, uint8){
        return (listFileHashmap[_ownerAddress].listUserKeys[msg.sender][0].keyPart, listFileHashmap[_ownerAddress].listUserKeys[msg.sender][0].order);
    }


    function addRestoreKey(address oldOwnerAddress, address newOwnerUserAddress, string _keyPart, uint8 _order){
        listFileHashmap[oldOwnerAddress].listUserKeys[newOwnerUserAddress].push(Key({keyPart: _keyPart, order: _order}));
    }


    function getNumberHierarchyUsers() returns (uint) {
        return listFileHashmap[msg.sender].listUsers.length;
    }

}