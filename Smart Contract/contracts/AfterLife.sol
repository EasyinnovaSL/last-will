pragma solidity ^0.4.15;

contract AfterLife {

    struct KeyStorage{
        string[] listPasswords;
        mapping (string => bool) listPasswordsName;
        mapping (string => Hierarchy) listUsersHierarchy;
    }

    struct Hierarchy{
        address[] listUsers;
        mapping (address => Key[]) listUserKeys;
    }

    struct Key{
        string keyPart;
        uint8 order;
    }

    //Files Hashmap
    //mapping (address => Hierarchy[]) listFileHashmap;
    mapping (address => KeyStorage) listFileHashmap;


    function addHierarchy(address _userWithAccess, string _keyPart, uint8 _order, string _passwordName) public{

        if(!listFileHashmap[msg.sender].listPasswordsName[_passwordName]){

            listFileHashmap[msg.sender].listPasswords.push(_passwordName);
            listFileHashmap[msg.sender].listPasswordsName[_passwordName] = true;
        }
        //Add User
        listFileHashmap[msg.sender].listUsersHierarchy[_passwordName].listUsers.push(_userWithAccess);

        //Add Key
        listFileHashmap[msg.sender].listUsersHierarchy[_passwordName].listUserKeys[_userWithAccess].push(Key({keyPart: _keyPart, order: _order}));

        require(listFileHashmap[msg.sender].listUsersHierarchy[_passwordName].listUsers.length <= 7);
    }


    function getMyKeyPart(address _ownerAddress, string _passwordName) public returns (string, uint8){
        return (
            listFileHashmap[_ownerAddress].listUsersHierarchy[_passwordName].listUserKeys[msg.sender][0].keyPart,
            listFileHashmap[_ownerAddress].listUsersHierarchy[_passwordName].listUserKeys[msg.sender][0].order
        );
    }

    function addRestoreKey(address oldOwnerAddress, address newOwnerUserAddress, string _keyPart, uint8 _order, string _passwordName) public{
        listFileHashmap[oldOwnerAddress].listUsersHierarchy[_passwordName].listUserKeys[newOwnerUserAddress].push(Key({keyPart: _keyPart, order: _order}));
    }

    function getNumberHierarchyUsers(string _passwordName) public returns (uint) {
        return listFileHashmap[msg.sender].listUsersHierarchy[_passwordName].listUsers.length;
    }

    function getFullKey(address ownerAddress, string _passwordName)

    returns (string, string, string, string, string, string, string)
    {

        string[] memory listKeys = new string[](7);

        for (uint j = 0; j < listFileHashmap[ownerAddress].listUsersHierarchy[_passwordName].listUserKeys[msg.sender].length; j++) {
            listKeys[listFileHashmap[ownerAddress].listUsersHierarchy[_passwordName].listUserKeys[msg.sender][j].order] =  listFileHashmap[ownerAddress].listUsersHierarchy[_passwordName].listUserKeys[msg.sender][j].keyPart;
        }

        return (
        listKeys[0],
        listKeys[1],
        listKeys[2],
        listKeys[3],
        listKeys[4],
        listKeys[5],
        listKeys[6]
        );
    }



}