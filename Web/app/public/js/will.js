function MyWills(options) {
    jQuery.extend(options, self.options);
    this.back_to_life = new BackToLife(options);
    this.heritageAbi = options.hierarchy.abi;

  //  var localWeb3 = new Web3(web3.currentProvider)
    var localWeb3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/8tpuK9msQwcod7QVd94H"));
   // var account=localWeb3.eth.accounts.create([localWeb3.utils.randomHex(32)]);
    var account=localWeb3.eth.accounts.create(['asdf']);
    this.accounts=[];

  // console.log(account);
/*
    account2=localWeb3.eth.accounts.privateKeyToAccount("0x66c14ddb845e629975e138a5c28ad5a72a73552ea65b3d3ec99810c82751cc35");
    console.log(  account2);
    localWeb3.eth.accounts.wallet.add(account2);

    localWeb3.eth.getAccounts().then( a => console.log(a));
    // using the event emitter
    localWeb3.eth.sendTransaction({
        from:account2.address,
        to: '0x93fB725d2D8431F7Ab650Ae1892C268C1931f6fA',
        value: web3.toWei(0.01),
        gas:'100000'
    })
        .on('transactionHash', function(hash){
        console.log(hash);
        })
        .on('receipt', function(receipt){
       console.log(receipt);
        })
        .on('confirmation', function(confirmationNumber, receipt){
            console.log(confirmationNumber);
            console.log(receipt);
        })
        .on('error', console.error); // If a out of gas error, the second parameter is the receipt.
*/

    $('#new-will').submit($.proxy(this._saveWill, this));
    $('.wills-container').on('click','button.send',$.proxy(this._sendWill,this));
    $('.wills-container').on('click','button.withdraw',$.proxy(this._withdrawWill,this));
    //$('.wills-container').on('click','button.declare-dead',$.proxy(this._declareDead, this));
  //  $('.wills-container').on('click','button.declare-dead',$.proxy(this._declareDead, this));
   // this._listWills();
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


function addRow() {
    switch($('#inputGroupSelect01 option:selected').val()) {
        case '1':
            addW();
            break;
        case '2':
            addH();
            break;
        case '3':
            addW();
            addH();
            break;
    }
}

numberOfFields=0;
function addH(){
    $("#divholderBen").append("<div id='row"+numberOfFields+"' class='field input-group mb-3'><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01'><i class='fa fa-user'></i></label></div><select class='custom-select type'  style='height: 49px;' id='inputGroupSelect"+numberOfFields+"' disabled><option value='2' selected>Heir</option></select><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01'>%</label></div><input type='text' id='percent"+numberOfFields+"' class='form-control percentatgeRepartir' style=' padding: 0px;line-height: 23px;font-size: 14px;' aria-label='Amount (to the nearest dollar)'><div class='input-group-append'><div class='input-group-append'><span class='input-group-text'>.00</span></div><button onclick='deleteRow(\"row"+numberOfFields+"\")' class='btn btn-outline-secondary' style='margin: 0px; padding: 0px 10px; font-size: 23px; color: #cc2952;' type='button' >-</button></div></div>");
    $("#percent"+numberOfFields).val($("#originalPercent").val());
    numberOfFields++;
}
function addW(){
    $("#divholderTes").append("<div id='row"+numberOfFields+"' class='field input-group mb-3'><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01'><i class='fa fa-user'></i></label></div><select class='custom-select type'  style='height: 49px;' id='inputGroupSelect"+numberOfFields+"' disabled><option value='1' selected>Witness</option></select><div class='input-group-prepend'></div><button onclick='deleteRow(\"row"+numberOfFields+"\")' class='btn btn-outline-secondary' style='margin: 0px; padding: 0px 10px; font-size: 23px; color: #cc2952;' type='button' >-</button></div></div>");
    numberOfFields++;
}
function checkIfAllIn(){
    return true;
    $i=0;
    $( ".percentatgeRepartir" ).each(function( index ) {
        $i=$i+$( this ).val();
    });
    if($i!=100){
        alert('Percentage must sum 100');
        return false;
    }
    return true;
}
function deleteRow(rowD){
    $('#'+rowD).remove();
}
function selectChanged(){
    switch($('#inputGroupSelect01 option:selected').val()) {
        case '1':
            $("#originalPercent").attr("disabled", "disabled");
            $("#originalPercent").val('-');
            break;
        case '2':
            $("#originalPercent").removeAttr("disabled");
            $("#originalPercent").val('0');
            break;
        case '3':
            $("#originalPercent").removeAttr("disabled");
            $("#originalPercent").val('0');
            break;
    }
}

MyWills.prototype._addField = function () {
    // var account=localWeb3.eth.accounts.create([localWeb3.utils.randomHex(32)]);
    this.accounts[''+this.accountsId]={type:$(will-role).val(),percentage:$('#percentage').val(),account:localWeb3.eth.accounts.create([localWeb3.utils.randomHex(32)])}
    console.log( this.accounts[''+this.accountsId]);
    this.accountsId++;

};

MyWills.prototype._removeField = function () {

};

MyWills.prototype._saveWill = function (event) {
    if(checkIfAllIn()) {
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
        $('div.field').each(function (){
             var account=localWeb3.eth.accounts.create([localWeb3.utils.randomHex(32)]);
          if($(this).find('select.custom-select').val() == '2' ){
              heirs.push()
          }else{

          }
            console.log($(this).find('input').val())
        });


        this.postWill({type: type, heirs: heir}).then(function (txHash) {
            $('#new-will')[0].reset();
            $('.wills-form').hide();
            $('#OkModal').modal('show');
            this._listWills();
        }.bind(this)).catch(function (err) {
            console.error(err);
            $('#ErrorModal').find('.modal-body').find('p').html('Something went wrong.');
            $('#ErrorModal').modal('show');
        });
    }
};

MyWills.prototype._declareDead = function (event) {
    var address = $(event.target).data('address');
    let MyHeritage = new Heritage({contract: {abi: this.heritageAbi, address: address}});
    MyHeritage.ownerDied().then(function(){
        $('#OkModal').modal('show');
        this._listWills();
    }.bind(this)).catch(function(err){
        console.error(err);
        $('#ErrorModal').find('.modal-body').find('p').html('Something went wrong.');
        $('#ErrorModal').modal('show');
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
        $('#ErrorModal').find('.modal-body').find('p').html('Something went wrong listing wills.');
        $('#ErrorModal').modal('show');
    });

};

MyWills.prototype._editWill = {}

MyWills.prototype._createLink = function(type,pk){
    if(type=="1"){
        return '/wills-witness?pk='+pk;
    }else{
       return '/wills-heir?pk='+pk;
    }
}

MyWills.prototype.getWills = function () {
    console.log("My Ether address: " + web3.eth.accounts[0]);
    return this.back_to_life.getWills();
};

MyWills.prototype.postWill = function (will) {
    return this.back_to_life.createVoteWill(will.heirs);
};