function Heritage(options){
    jQuery.extend(options,self.options);
    this.contract = options.contract;
}

Heritage.prototype.options = {
    contract: null
};

Heritage.prototype.isOwner = function(){
    return new Promise(function(resolve, reject){
        this.contract.isOwner.call(function(err, value){
            if (err) return reject(err);
            resolve(value);
        });
    }.bind(this));
};

Heritage.prototype.getBalance = function(){
    return new Promise(function(resolve, reject){
        this.contract.getBalance.call(function(err, value){
            if (err) return reject(err);
            resolve(value);
        });
    }.bind(this));
};

Heritage.prototype.getHeirs = function(){
    return new Promise(function(resolve, reject){
        this.contract.getHeirs.call(function(err, data){
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
