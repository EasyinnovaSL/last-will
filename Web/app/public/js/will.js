function MyWills(options) {
    jQuery.extend(options, self.options);
    this.back_to_life = new BackToLife(options);
    this.heritageAbi = options.hierarchy.abi;
    this.lastwill= JSON.parse(localStorage.getItem("lastwill")) || {witness:[],heirs:[],address:''};


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
    web3.eth.sendTransaction({from:contract,to:web3.eth.defaultAccount,value:value},function () {
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
function addRowGeneric(){
    $("#divholder").append("<div id='row"+numberOfFields+"' class='field input-group mb-3'><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01'><i class='fa fa-user'></i></label></div><select class='custom-select type'  onchange='selectChanged(\""+numberOfFields+"\")' style='height: 49px;' id='inputGroupSelect"+numberOfFields+"'><option value='1'>Witness</option><option value='2' selected>Heir</option><option value='3'>both</option></select><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01'>%</label></div><input type='text' id='percent"+numberOfFields+"' class='form-control percentatgeRepartir' style=' padding: 0px;line-height: 23px;font-size: 14px;' aria-label='Amount (to the nearest dollar)' value='0'><div class='input-group-append'><div class='input-group-append'><span class='input-group-text'>.00</span></div><button onclick='deleteRow(\"row"+numberOfFields+"\")' class='btn btn-outline-secondary' style='margin: 0px; padding: 0px 10px; font-size: 23px; color: #cc2952;' type='button' ><span class='mbri-trash'></span></button></div></div>");
    numberOfFields++;
}
function checkIfAllIn(){
    $i=0;
    $( ".percentatgeRepartir" ).each(function( index ) {
        if($( this ).val()!='-'){
            $i=$i+parseInt($( this ).val());
        }
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
function selectChanged(rowNumber){
    switch($('#inputGroupSelect'+rowNumber+' option:selected').val()) {
        case '1':
            $("#percent"+rowNumber).attr("disabled", "disabled");
            $("#percent"+rowNumber).val('-');
            break;
        case '2':
            $("#percent"+rowNumber).removeAttr("disabled");
            $("#percent"+rowNumber).val('0');
            break;
        case '3':
            $("#percent"+rowNumber).removeAttr("disabled");
            $("#percent"+rowNumber).val('0');
            break;
    }
}


MyWills.prototype._saveWill = function (event) {
    event.preventDefault();
    if(checkIfAllIn()) {
        var localWeb3 = new Web3(web3.currentProvider)
        var heir=[];
        var heir_percentage=[];
        var witness=[];
        var lastwill = {witness:[],heirs:[],address:''};
        var self=this;

        $('div.field').each(function (){
            var account=localWeb3.eth.accounts.create([localWeb3.utils.randomHex(32)]);
            var type=$(this).find('select.custom-select').val();
            if(type == '1' ){
                lastwill.witness.push({link:self._createLink(type,account)});
                witness.push(account.address);
            }else if(type == '2'){
                lastwill.heirs.push({account:account,percentage:parseInt($(this).find('input').val())});
                heir.push(account.address);
                heir_percentage.push($(this).find('input').val());
            }else if(type == '3'){
                lastwill.heirs.push({account:account,percentage:parseInt($(this).find('input').val())});
                lastwill.witness.push({account:account});
                heir.push(account.address);
                heir_percentage.push($(this).find('input').val());
                witness.push(account.address);
            }
        });

        if (witness.length < 1) throw new Error("Invalid number of addresses");
        if (heir.length < 1) throw new Error("Invalid number of addresses");
        if (heir_percentage && heir_percentage.length !== heir.length) throw new Error("Invalid number of percentages (must be the same as addresses");
        var totalpercentage=0;
        heir_percentage.forEach(function (i){
            totalpercentage+=parseInt(i);
        })
        if (totalpercentage !== 100) throw new Error("Invalid percentage (percentage must sum 100");
        // Input params
        var addresseswitnesStr = witness.join(";").toLowerCase();
        var addressesheirsStr = heir.join(";").toLowerCase();
        var percentagesheirsStr = heir_percentage.join(";").toLowerCase();

        var localWeb3 = new Web3(web3.currentProvider);
        var contract = new localWeb3.eth.Contract(contracts.base.abi, contracts.base.address);

        contract.methods.createHierarchyContractPayable(addressesheirsStr, percentagesheirsStr,addresseswitnesStr).send({from: web3.eth.defaultAccount,gas: 4500000,value: web3.toWei(1,"ether")})
            .on('transactionHash', function(hash){
                console.log('transactionHash');
                console.log(hash);
            })
            .on('receipt', function(receipt){
                console.log('receipt');
                console.log(receipt);
                this.lastwill=lastwill;
                contract.methods.getMyContracts.call(function(err, addressesStr){
                    if (addressesStr.slice(-1) === ";") addressesStr = addressesStr.substring(0, addressesStr.length -1);
                    var adrList = addressesStr.split(";");
                   var address=adrList[adrList.length-1];
                    lastwill.heirs.forEach(function(item){
                        item.link=this._createLink(,account,_createLink)
                    }.bind(this));


                }.bind(this))



               localStorage.setItem("lastwill",JSON.stringify(this.lastwill));
                $('#OkModal').modal('show');
                var template = $('#last-will-added-template').html();
                Mustache.parse(template);   // optional, speeds up future uses

                var rendered = Mustache.render(template,  this.lastwill);
                $('.lastWillAdded').html(rendered);
                this._listWills();
            }.bind(this))
            /*.on('confirmation', function(confirmationNumber, receipt){
                console.log(confirmationNumber);
                console.log(receipt);
            })*/
            .on('error', console.error); // If a out of gas error, the second parameter is the receipt.
            /*
            .then(function (receip) {
                console.log(receip);
                $('#new-will')[0].reset();
                $('.wills-form').hide();
                $('#divholderBen').html("");
                $('#divholderTes').html("");
                $('#OkModal').modal('show');
                var template = $('#last-will-added-template').html();
                Mustache.parse(template);   // optional, speeds up future uses
                this.lastwill=lastwill;
                var rendered = Mustache.render(template,  this.lastwill);
                $('.lastWillAdded').html(rendered);
                this._listWills();
            }.bind(this));*/

        /*return new Promise(function(resolve, reject){
            // console.log("Params:");
            // console.log("  " + addressesStr);
            // console.log("  " + percentagesStr);
            contract.createHierarchyContractPayable.sendTransaction(addressesheirsStr, percentagesheirsStr,addresseswitnesStr,{gas: 4500000,value: web3.toWei(1,"ether")}, function(err, txHash){
                if (err) return reject(err);
                resolve(txHash);
            });
        });*/

       /* this.postWill(witness, heir, heir_percentage).then(function (txHash) {
            $('#new-will')[0].reset();
            $('.wills-form').hide();
            $('#divholderBen').html("");
            $('#divholderTes').html("");
            $('#OkModal').modal('show');
            var template = $('#last-will-added-template').html();
            Mustache.parse(template);   // optional, speeds up future uses
            this.lastwill=lastwill;
            var rendered = Mustache.render(template,  this.lastwill);
            $('.lastWillAdded').html(rendered);
            this._listWills();
        }.bind(this)).catch(function (err) {
            console.error(err);
            $('#ErrorModal').find('.modal-body').find('p').html('Something went wrong.');
            $('#ErrorModal').modal('show');
        });*/
    }
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

MyWills.prototype._createLink = function(type,account,will){
    if(type=="1"){
        return '/wills-witness?pk='+account.privatekey+'&will='+will;
    }else{
       return '/wills-heir?pk='+account.privatekey+'&will='+will;
    }
}

MyWills.prototype.getWills = function () {
    console.log("My Ether address: " + web3.eth.defaultAccount);
    return this.back_to_life.getWills();
};

MyWills.prototype.postWill = function (addresseswitnes, addressesheirs, percentagesheirs ) {
    return this.back_to_life.createVoteWill(addresseswitnes, addressesheirs, percentagesheirs);
};
