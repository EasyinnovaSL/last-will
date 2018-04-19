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


    function addHierarchy(address _userWithAccess, string _keyPart, uint8 _order) public{

        //Add User
        listFileHashmap[msg.sender].listUsers.push(_userWithAccess);

        //Add Key
        listFileHashmap[msg.sender].listUserKeys[_userWithAccess].push(Key({keyPart: _keyPart, order: _order}));

        require(listFileHashmap[msg.sender].listUsers.length <= 7);
    }

    function getMyKeyPart(address _ownerAddress) public view returns (string, uint8){
        return (listFileHashmap[_ownerAddress].listUserKeys[msg.sender][0].keyPart, listFileHashmap[_ownerAddress].listUserKeys[msg.sender][0].order);
    }


    function addRestoreKey(address oldOwnerAddress, address newOwnerUserAddress, string _keyPart, uint8 _order) public{
        listFileHashmap[oldOwnerAddress].listUserKeys[newOwnerUserAddress].push(Key({keyPart: _keyPart, order: _order}));
    }


    function getNumberHierarchyUsers() public view returns (uint) {
        return listFileHashmap[msg.sender].listUsers.length;
    }

    function getFullKey(address ownerAddress) view  returns (string, string, string, string, string, string, string){

        string[] memory listKeys = new string[](7);

        for (uint j = 0; j < listFileHashmap[ownerAddress].listUserKeys[msg.sender].length; j++) {
            listKeys[listFileHashmap[ownerAddress].listUserKeys[msg.sender][j].order] =  listFileHashmap[ownerAddress].listUserKeys[msg.sender][j].keyPart;
        }

        return (listKeys[0], listKeys[1], listKeys[2], listKeys[3], listKeys[4], listKeys[5], listKeys[6]);
    }

}