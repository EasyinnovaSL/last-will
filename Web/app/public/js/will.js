function MyWills(options) {
    jQuery.extend(options, self.options);
    this.back_to_life = new BackToLife(options);
    this.heritageAbi = options.hierarchy.abi;

    $('.mbr-more').click($.proxy(this._addWill, this));
    $('#new-will').submit($.proxy(this._saveWill, this));
    $('.wills-container').on('click','button.declare-dead',$.proxy(this._declareDead, this));
    $('.wills-container').on('click','button.send',$.proxy(this._sendWill,this));
    $('.wills-container').on('click','button.withdraw',$.proxy(this._withdrawWill,this));
    this._listWills();
}

MyWills.prototype.options = {}

MyWills.prototype._sendWill = function (event) {

    var contract=$(event.target).attr('data-address');
    var value=web3.toWei(parseFloat($('input[name=value-'+contract+']').val()), "ether");
    web3.eth.sendTransaction({to:contract,value:value},function () {

        $('#OkModal').modal('show');
        this._listWills();
    }.bind(this));
};
MyWills.prototype._withdrawWill = function (event) {
    var contract=$(event.target).attr('data-address');
    var value=web3.toWei(parseFloat($('input[name=value-'+contract+']').val()), "ether");
    web3.eth.sendTransaction({from:contract,to:web3.eth.accounts[0],value:value},function () {

        $('#OkModal').modal('show');
        this._listWills();
    }.bind(this));
};

MyWills.prototype._addWill = function () {
    $('.wills-form').show();
};

MyWills.prototype._saveWill = function (event) {
    event.preventDefault();
    var formData = $('#new-will').serializeArray();
    var data = {};

    for (var i in formData) {
        data[formData[i].name] = formData[i].value;
    }
    var heir = [];
    var type = data['type'];
    for (var i = 0; i < 5; i++) {
        if (data['heir' + i] != "") {
            heir.push(data['heir' + i]);
        }
    }

    this.postWill({type: type, heirs: heir}).then(function(txHash){
        $('#new-will')[0].reset();
        $('.wills-form').hide();
        $('#OkModal').modal('show');
        this._listWills();
    }.bind(this)).catch(function(err){
        console.error(err);
        alert("Error creating a will!")
    });
};

MyWills.prototype._declareDead = function (event) {
    var address = $(event.target).data('address');
    let MyHeritage = new Heritage({contract: {abi: this.heritageAbi, address: address}});
    MyHeritage.ownerDied().then(function(){
        $('#OkModal').modal('show');
        this._listWills();
    }).catch(function(){
        alert('Error in Smart Contract')
    });
};

MyWills.prototype._listWills = function () {
    this.getWills().then(function(wills){
        if (wills !== null && wills && wills.length !== 0) {
            var template = $('#will-template').html();
            Mustache.parse(template);   // optional, speeds up future uses
            var rendered = Mustache.render(template, {'wills': wills});
            $('.wills-container').html(rendered);
        }
    }).catch(function(err){
        console.error(err);
        alert("Error " + err.message);
    });

};

MyWills.prototype._editWill = {}

MyWills.prototype._editWill = {}

MyWills.prototype.getWills = function () {
    console.log(web3.eth.accounts[0]);
    return this.back_to_life.getWills();
};

MyWills.prototype.postWill = function (will) {
    return this.back_to_life.createVoteWill(will.heirs);
};