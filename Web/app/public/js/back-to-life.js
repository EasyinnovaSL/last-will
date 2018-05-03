function BackToLife(options){
    jQuery.extend(options,self.options);
    this.contract = web3.eth.contract(options.contract.abi).at(options.contract.address);
    this.address = web3.eth.accounts[0];
}

BackToLife.prototype.options={

};

BackToLife.prototype.getWills = function(){
    // TODO get form Smart Contract

    // Example Call
    LostPassword.getText.call(function(err, text){
        if (err) {
            return console.error("Something went wrong in call");
        }
        console.log(text);
    });

};

MyWills.prototype.createVoteWill= function(will){
    // TODO new contract type vote
};

MyWills.prototype.createNotaryWill= function(will){
    // TODO new contract type vote
};

MyWills.prototype.createKeepAliveWill= function(will){
    // TODO new contract type vote

    // Example transaction
    LostPassword.setText.sendTransaction("Hello World!",function(err, txHash){
        if (err) {
            return console.error("Something went wrong in TX");
        }
        console.log(txHash);
    });

};