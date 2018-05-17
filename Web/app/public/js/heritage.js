function Heritage(options){
    jQuery.extend(options,self.options);
    var localWeb3 = new Web3(web3.currentProvider)
    this.contract = new localWeb3.eth.Contract(options.contract.abi,options.contract.address);
}

Heritage.prototype.options={
// web:web3
};

Heritage.prototype.isOwner = function(){
    return new Promise(function(resolve, reject){
        this.contract.methods.isOwner().call({from: web3.eth.defaultAccount},function(err, value){
            if (err) return reject(err);
            resolve(value);
        });
    }.bind(this));
};

Heritage.prototype.getBalance = function(){
    return new Promise(function(resolve, reject){
        this.contract.methods.getBalance().call({from: web3.eth.defaultAccount},function(err, value){
            if (err) return reject(err);
            resolve(value);
        });
    }.bind(this));
};

Heritage.prototype.getHeirs = function(){
    return new Promise(function(resolve, reject){
        this.contract.methods.getHeirs().call({from: web3.eth.defaultAccount},function(err, data){
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

Heritage.prototype.getWitnesses = function(){
    return new Promise(function(resolve, reject){
        this.contract.methods.getWitnesses().call({from: web3.eth.defaultAccount},function(err, witnessesStr){
            if (err) return reject(err);

            if (witnessesStr.slice(-1) === ";") witnessesStr = witnessesStr.substring(0, witnessesStr.length -1);

            var witnesses = [];
            for (var address of witnessesStr.split(";")) {
                witnesses.push({address: address});
            }

            resolve(witnesses);
        });
    }.bind(this));
};

Heritage.prototype.hasDied = function(){
    return new Promise(function(resolve, reject){
        this.contract.methods.hasDied().call({from: web3.eth.defaultAccount},function(err, value){
            if (err) return reject(err);
            resolve(value);
        });
    }.bind(this));
};
