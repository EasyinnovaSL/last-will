function MyWills(options) {
    jQuery.extend(options, self.options);
    this.back_to_life = new BackToLife(options);
    this.heritageAbi = options.hierarchy.abi;

   // var localWeb3 = new Web3(web3.currentProvider)
   // var localWeb3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/8tpuK9msQwcod7QVd94H"));
   // var account=localWeb3.eth.accounts.create([localWeb3.utils.randomHex(32)]);


  // console.log(account);

    // account2=localWeb3.eth.accounts.privateKeyToAccount("0x66c14ddb845e629975e138a5c28ad5a72a73552ea65b3d3ec99810c82751cc35");
    // console.log(  account2);
    // localWeb3.eth.accounts.wallet.add(account2);
    //
    // localWeb3.eth.getAccounts().then( a => console.log(a));
    // // using the event emitter
    // localWeb3.eth.sendTransaction({
    //     from:account2.address,
    //     to: '0x93fB725d2D8431F7Ab650Ae1892C268C1931f6fA',
    //     value: web3.toWei(0.01),
    //     gas:'100000'
    // })
    //     .on('transactionHash', function(hash){
    //     console.log(hash);
    //     })
    //     .on('receipt', function(receipt){
    //    console.log(receipt);
    //     })
    //     .on('confirmation', function(confirmationNumber, receipt){
    //         console.log(confirmationNumber);
    //         console.log(receipt);
    //     })
    //     .on('error', console.error); // If a out of gas error, the second parameter is the receipt.


    $('#new-will').submit($.proxy(this._saveWill, this));
    $('.wills-container').on('click','button.send',$.proxy(this._sendWill,this));
    $('.wills-container').on('click','button.withdraw',$.proxy(this._withdrawWill,this));

    this._listWills();
}

MyWills.prototype.options = {}

MyWills.prototype._sendWill = function (event) {
    var contract = $(event.target).attr('data-address');
    var inputValue = parseFloat($('input[name=value-'+contract+']').val());
    if (!isNaN(inputValue)) {
        var value = web3.toWei(inputValue, "ether");
        web3.eth.sendTransaction({to:contract,value:value},function () {
            $('#OkModal').modal('show');
            this._listWills();
        }.bind(this));
    }
};
MyWills.prototype._withdrawWill = function (event) {
    var contractAddress = $(event.target).attr('data-address');
    var inputValue = parseFloat($('input[name=value-'+contractAddress+']').val());
    if (!isNaN(inputValue)) {
        var contract = web3.eth.contract(contracts.hierarchy.abi).at(contractAddress);
        var value = web3.toWei(inputValue, "ether");
        contract.transferBalanceWithAmount.sendTransaction(web3.eth.defaultAccount, value, function (err) {
            if (err) {
                $('#ErrorModal').modal('show');
                return;
            }
            $('#OkModal').modal('show');
            this._listWills();
        }.bind(this));
    }
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


MyWills.prototype._saveWill = function (event) {
    if(checkIfAllIn()) {
        event.preventDefault();
        var localWeb3 = new Web3(web3.currentProvider)
        var heir=[];
        var heir_percentage=[];
        var witness=[];
        $('div.field').each(function (){
            var account=localWeb3.eth.accounts.create([localWeb3.utils.randomHex(32)]);
            var type=$(this).find('select.custom-select').val();
            if(type == '1' ){
                witness.push(account.address);
            }else if(type == '2'){
                heir.push(account.address);
                heir_percentage.push($(this).find('input').val());
            }else if(type == '3'){
                heir.push(account.address);
                heir_percentage.push($(this).find('input').val());
                witness.push(account.address);
            }
        });

        this.postWill(witness, heir, heir_percentage).then(function (txHash) {
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

MyWills.prototype._listWills = function () {
    $('.wills-container').html($("#generic-loader").clone());
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

MyWills.prototype._createLink = function(type,pk){
    if(type=="1"){
        return '/wills-witness?pk='+pk;
    }else{
       return '/wills-heir?pk='+pk;
    }
}

MyWills.prototype.getWills = function () {
    console.log("My Ether address: " + web3.eth.defaultAccount);
    return this.back_to_life.getWills();
};

MyWills.prototype.postWill = function (addresseswitnes, addressesheirs, percentagesheirs ) {
    return this.back_to_life.createVoteWill(addresseswitnes, addressesheirs, percentagesheirs);
};
