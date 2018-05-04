function BackToLife(options){
    jQuery.extend(options,self.options);
    this.contract = web3.eth.contract(options.contract.abi).at(options.contract.address);
    this.hierarchyAbi = options.hierarchy.abi;
}

BackToLife.prototype.options={

};

BackToLife.prototype.getWills = function(){
    let self = this;
    let contract = this.contract;
    return new Promise(function(resolve, reject){
        contract.getMyContracts.call(async function(err, addressesStr){
            if (err) reject(err);
            let wills = [];
            if (addressesStr) {
                if (addressesStr.slice(-1) === ";") addressesStr = addressesStr.substring(0, addressesStr.length -1);
                var adrList = addressesStr.split(";");

                // For each will contract
                for (let willAddress of adrList) {
                    let info = await self.getHierarchyInfo(willAddress);
                    wills.push({
                                   address: willAddress,
                                   owner: info.owner,
                                   heirs: info.heirs,
                               });
                }
            }
            resolve(wills);
        });
    });
};

BackToLife.prototype.getHierarchyInfo = function(willAddress){
    let isOwner = false;
    let contract = web3.eth.contract(this.hierarchyAbi).at(willAddress);
    return new Promise(function(resolve, reject){
        contract.isOwner.call(function(err, value){
            if (err) return reject(err);
            isOwner = value;
            contract.getHeirs.call(function(err, data){
                if (err) return reject(err);

                var heirsStr = data[0];
                var percentStr = data[1];
                if (heirsStr.slice(-1) === ";") heirsStr = heirsStr.substring(0, heirsStr.length -1);
                if (percentStr.slice(-1) === ";") percentStr = percentStr.substring(0, percentStr.length -1);

                var heirsList = heirsStr.split(";");
                var percentList = percentStr.split(";");
                var heirs = [];
                for (var i in heirsList) {
                    heirs.push({
                        address: heirsList[i],
                        percentage: parseInt(percentList[i]),
                    });
                }

                resolve({owner: isOwner, heirs: heirs});
            });
        });
    });
};

/**
 * Hierarchy creations
 */
BackToLife.prototype.createVoteWill = function(addresses = null, percentages = null){
    // Validations
    if (addresses.length < 1 || addresses.length > 5) throw new Error("Invalid number of addresses");
    if (percentages && percentages.length !== addresses.length) throw new Error("Invalid number of percentages (must be the same as addresses");

    // Input params
    var addressesStr = addresses.join(";");
    var percentagesStr = "";
    if (percentages === null || percentages.length === 0) {
        switch (addresses.length) {
            case 1:
                percentagesStr = "100";
                break;
            case 2:
                percentagesStr = "50;50";
                break;
            case 3:
                percentagesStr = "33;33;34";
                break;
            case 4:
                percentagesStr = "25;25;25;25";
                break;
            case 5:
                percentagesStr = "20;20;20;20;20";
                break;
        }
    } else {
        percentagesStr = percentages.join(";");
    }

    // Do transaction
    let contract = this.contract;
    return new Promise(function(resolve, reject){
        // console.log("Params:");
        // console.log("  " + addressesStr);
        // console.log("  " + percentagesStr);
        contract.createHierarchyContract.sendTransaction(addressesStr, percentagesStr, {gas: 4500000}, function(err, txHash){
            if (err) reject(err);
            resolve(txHash);
        });
    });
};

BackToLife.prototype.createNotaryWill= function(will){
    // TODO new contract type notary
};

BackToLife.prototype.createKeepAliveWill= function(){
    // TODO new contract type keep alive
};

/**
 * Get last created will
 */
BackToLife.prototype.getLastWillHash = function(){
    let contract = this.contract;
    return new Promise(function(resolve, reject){
        contract.getMyContracts.call(function(err, addressesStr){
            if (err) reject(err);
            if (addressesStr.slice(-1) === ";") addressesStr = addressesStr.substring(0, addressesStr.length -1);
            var adrList = addressesStr.split(";");
            resolve(adrList[adrList.length-1]);
        });
    });
};