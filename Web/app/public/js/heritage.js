function Heritage(options){
    jQuery.extend(options,self.options);
    var localWeb3 = new Web3(web3.currentProvider)
    this.contract = new localWeb3.eth.Contract(options.contract.abi,options.contract.address);
}

Heritage.prototype.options={
web:web3
};

Heritage.prototype.isOwner = function(){
    return new Promise(function(resolve, reject){
        this.contract.methods.isOwner().call(function(err, value){
            if (err) return reject(err);
            resolve(value);
        });
    }.bind(this));
};

Heritage.prototype.getBalance = function(){
    return new Promise(function(resolve, reject){
        this.contract.methods.getBalance().call(function(err, value){
            if (err) return reject(err);
            resolve(value);
        });
    }.bind(this));
};

Heritage.prototype.getHeirs = function(){
    return new Promise(function(resolve, reject){
        this.contract.methods.getHeirs().call(function(err, data){
            if (err) return reject(err);

            var heirsStr = data[0];
            var percentStr = data[1];

            if (heirsStr.slice(-1) === ";") heirsStr = heirsStr.substring(0, heirsStr.length -1);
            if (percentStr.slice(-1) === ";") percentStr = percentStr.substring(0, percentStr.length -1);

            var heirsList = heirsStr.split(";");
            var percentList = percentStr.split(";");

            resolve({heirs: heirsList, percentages: percentList});
        });
    }.bind(this));
};

Heritage.prototype.ownerDied = function(){
    return new Promise(function(resolve, reject){
        this.contract.ownerDied.sendTransaction(function(err, txHash){
            if (err) return reject(err);
            resolve();
        });
    }.bind(this));
};
