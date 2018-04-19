var Licens3d = artifacts.require("./Licens3dV4.sol");

contract('Licens3d', function(accounts) {
    var sender = accounts[0];

    it("Licens3d Test v4", function() {
        var Licens3dContractInstance;

        var byte255 = 0xff;
        var byte27 = 0x1b; //00011011
        var byte28 = 0x1c; //00011100

        return Licens3d.deployed().then(function(instance) {
            Licens3dContractInstance = instance;
        }).then(function() {
            return Licens3dContractInstance.uploadFile("RAaQmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "KAQmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "TCQmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "testFileName.rn", "watermark", 1);
        }).then(function(result) {

            return Licens3dContractInstance.getPermissionByHash.call("QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t");
        }).then(function(bytePermission) {
            assert.equal(bytePermission.valueOf(), 0x01, "The byte representation is incorrect");
            return Licens3dContractInstance.getNumberOfFiles.call()
        }).then(function(numberOfFiles) {
            assert.equal(numberOfFiles.valueOf(), 1, "The Number Of Files Hashes are incorrect");

            Licens3dContractInstance.editFile("0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a", "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "1f802621da33e20016d272e1d20ea6af031ab0fbda8856390576b376e7774c216b39072be0a2430117e33c808f584065", "newRa", "newName", "newWatermark");

            return  Licens3dContractInstance.getNumberOfUsersByFile.call("1f802621da33e20016d272e1d20ea6af031ab0fbda8856390576b376e7774c216b39072be0a2430117e33c808f584065");
        }).then(function(numberOfFiles) {
            assert.equal(numberOfFiles.valueOf(), 1, "The Number Of Files For user are incorrect");

            Licens3dContractInstance.giveFileAccess("0xf1f42f995046E67b79DD5eBAfd224CE964740Da3", "1f802621da33e20016d272e1d20ea6af031ab0fbda8856390576b376e7774c216b39072be0a2430117e33c808f584065", 2, "raB", "kaB", "tcB");

            return Licens3dContractInstance.getPermissionByHashAddress.call("1f802621da33e20016d272e1d20ea6af031ab0fbda8856390576b376e7774c216b39072be0a2430117e33c808f584065", "0xf1f42f995046E67b79DD5eBAfd224CE964740Da3");

        }).then(function(permissionsOfTheUser) {
            assert.equal(permissionsOfTheUser.valueOf(), 0x03, "The byte representation is incorrect");

            return Licens3dContractInstance.toBytes.call(1);
        }).then(function(numberOfFiles) {
            //assert.equal(numberOfFiles.valueOf(), 3, "The byte representation is incorrect");

            return Licens3dContractInstance.getBit.call(numberOfFiles.valueOf(), 0);
        }).then(function(bitresult) {
            assert.equal(bitresult.valueOf(), true, "The byte representation is incorrect");

             return Licens3dContractInstance.setBit.call(byte27, 2);
        }).then(function(bitresult) {
            assert.equal(bitresult.valueOf(), 0x1f, "The byte representation is incorrect");
        })
    });



    /*it("Licens3d Upload File", function() {
        var Licens3dContractInstance;

        return Licens3d.deployed().then(function(instance) {
            Licens3dContractInstance = instance;
        }).then(function() {
            Licens3dContractInstance.uploadFile("RAaQmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "KAQmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "TCQmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "testFileName.rn", "watermark", "application/pdf");
            return Licens3dContractInstance.getNumberOfFiles.call();
        }).then(function(result) {
            assert.equal(result.valueOf(), 1, "The byte representation is incorrect");

            try{
                //Licens3dContractInstance.uploadFile("RAaQmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "KAQmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "TCQmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t", "testFileName.rn", "watermark", "application/pdf");
                //Licens3dContractInstance.editFile("0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a", "asdasdasdasad", "asdasdasd", "a", "testFileName.rn", "watermark");
            }catch (ex){
                console.log("Error on upload");
            }

            return Licens3dContractInstance.getNumberOfFiles.call();
        }).then(function(result) {
              assert.equal(result.valueOf(), 1, "The byte representation is incorrect");
        })
    });*/



});
