function BackToLife(options){
    jQuery.extend(options,self.options);
    this.contract = web3.eth.contract(options.contract.abi).at(options.contract.address);
    this.heritageAbi = options.hierarchy.abi;
}

BackToLife.prototype.options={

};

BackToLife.prototype.getWills = function(){
    return new Promise(function(resolve, reject){
        this.contract.getMyContracts.call(async function(err, addressesStr){
            if (err) return reject(err);
            let wills = [];
            console.log("My Contracts: " + addressesStr);
            if (addressesStr) {
                if (addressesStr.slice(-1) === ";") addressesStr = addressesStr.substring(0, addressesStr.length -1);
                var adrList = addressesStr.split(";");

                // For each will contract
                for (let willAddress of adrList) {
                    let info = await this.getHierarchyInfo(willAddress);
                    wills.push({
                        address: willAddress,
                        owner: info.owner,
                        heirs: info.heirs,
                        balance: web3.fromWei(info.balance, 'ether'),
                    });
                }
            }
            resolve(wills);
        }.bind(this));
    }.bind(this));
};

BackToLife.prototype.getHierarchyInfo = function(willAddress){
    let MyHeritage = new Heritage({contract: {abi: this.heritageAbi, address: willAddress}});
    return new Promise(async function(resolve, reject){
        var owner = await MyHeritage.isOwner();
        var balance = await MyHeritage.getBalance();
        var data = await MyHeritage.getHeirs();

        var heirsList = data.heirs;
        var percentList = data.percentages;

        var heirs = [];
        for (var i in heirsList) {
            heirs.push({
                address: heirsList[i],
                percentage: parseInt(percentList[i]),
            });
        }

        resolve({owner: owner, heirs: heirs, balance: balance});
    });
};

/**
 * Hierarchy creations
 */
BackToLife.prototype.createVoteWill = function(addresseswitnes = null, addressesheirs = null, percentagesheirs = null){
    // Validations
    if (addresseswitnes.length < 1) throw new Error("Invalid number of addresses");
    if (addressesheirs.length < 1) throw new Error("Invalid number of addresses");
    if (percentagesheirs && percentagesheirs.length !== addressesheirs.length) throw new Error("Invalid number of percentages (must be the same as addresses");
    var totalpercentage=0;
    percentagesheirs.forEach(function (i){
        totalpercentage+=parseInt(i);
    })
    if (totalpercentage !== 100) throw new Error("Invalid percentage (percentage must sum 100");
    // Input params
    var addresseswitnesStr = addresseswitnes.join(";").toLowerCase();
    var addressesheirsStr = addressesheirs.join(";").toLowerCase();
    var percentagesheirsStr = percentagesheirs.join(";").toLowerCase();

    // Do transaction
    let contract = this.contract;
    return new Promise(function(resolve, reject){
        // console.log("Params:");
        // console.log("  " + addressesStr);
        // console.log("  " + percentagesStr);
        contract.createHierarchyContractPayable.sendTransaction(addressesheirsStr, percentagesheirsStr,addresseswitnesStr,{gas: 4500000,value: web3.toWei(1,"ether")}, function(err, txHash){
            if (err) return reject(err);
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