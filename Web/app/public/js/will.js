function MyWills(options) {
    jQuery.extend(options, self.options);
    this.back_to_life = new BackToLife(options);
    this.heritageAbi = options.hierarchy.abi;
    this.lastwill= JSON.parse(localStorage.getItem("lastwill")) || {witness:[],heirs:[],address:''};
    this.confirmationsNeeded = 2;

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
            var type=$(this).find('select').val();
            if(type == '1' ){
                lastwill.witness.push({account:account});
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

        var inputValue = $("#ethToContract").val();
        if (!inputValue) inputValue = 0;
        contract.methods.createHierarchyContractPayable(addressesheirsStr, percentagesheirsStr,addresseswitnesStr).send({from: web3.eth.defaultAccount,gas: 4500000,value: web3.toWei(inputValue,"ether")})
            .on('transactionHash', function(hash){
                $('#OkModal').modal('show');
                $('#OkModal p').html("Confirming transaction...");
                $('#OkModal .btn-success').hide();
                $('#OkModal .close').hide();
            })
            .on('confirmation', function(confirmationNumber, receipt){
                if (confirmationNumber === this.confirmationsNeeded) {
                    contract.methods.getMyContracts().call({from: web3.eth.defaultAccount},function(err, addressesStr){
                        // Generate Links
                        console.log("Addresses: " + addressesStr);
                        if (addressesStr.slice(-1) === ";") addressesStr = addressesStr.substring(0, addressesStr.length -1);
                        var adrList = addressesStr.split(";");
                        var address=adrList[adrList.length-1];
                        console.log("Address: " + address);
                        lastwill.heirs.forEach(function(item){
                            var url = this._createLink("2",item.account,address);
                            item.url = url;
                            item.escapedUrl = url.replace("&", "%26");
                        }.bind(this));

                        lastwill.witness.forEach(function(item){
                            var url = this._createLink("1",item.account,address);
                            item.url = url;
                            item.escapedUrl = url.replace("&", "%26");
                        }.bind(this));

                        this.lastwill=lastwill;
                        localStorage.setItem("lastwill",JSON.stringify(this.lastwill));

                        // Final render
                        $('#OkModal p').html("Transaction send successfully!");
                        $('#OkModal .btn-success').show();
                        $('#OkModal .close').show();
                        this.renderLastWill(this.lastwill);
                        this._listWills();

                    }.bind(this))
                }
            }.bind(this))
            .on('error', console.error); // If a out of gas error, the second parameter is the receipt.
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
        } else {
            $('.wills-container').html("");
        }
    }).catch(function(err){
        console.error(err);
        $('#ErrorModal').find('.modal-body').find('p').html('Something went wrong listing wills.');
        $('#ErrorModal').modal('show');
    });

};

MyWills.prototype._createLink = function(type,account,will){
    if(type=="1"){
        return window.location.protocol + '//' + window.location.host+'/witness?pk='+account.privateKey+'&will='+will;
    }else{
        return window.location.protocol + '//' + window.location.host+'/heir?pk='+account.privateKey+'&will='+will;
    }
}

MyWills.prototype.getWills = function () {
    console.log("My Ether address: " + web3.eth.defaultAccount);
    return this.back_to_life.getWills();
};

MyWills.prototype.postWill = function (addresseswitnes, addressesheirs, percentagesheirs ) {
    return this.back_to_life.createVoteWill(addresseswitnes, addressesheirs, percentagesheirs);
};

MyWills.prototype.renderLastWill = function (lastWill) {
    var template = $('#last-will-added-template').html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, lastWill);
    $('#last-will-links').html(rendered);
    $('[data-toggle="tooltip"]').tooltip();
};



numberOfFields = 0;
percentagesModified = false;
addRowGeneric();
function addRowGeneric(){
    $("#divholder").append("<div id='row"+numberOfFields+"' class='field input-group mb-3'><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01'><i class='fa fa-user'></i></label></div><select class='custom-select'  onchange='selectChanged(\""+numberOfFields+"\")' style='height: 49px;' id='inputGroupSelect"+numberOfFields+"'><option value='1'>Witness</option><option value='2'>Heir</option><option value='3' selected>Heir & Witness</option></select><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01'>%</label></div><input type='text' id='percent"+numberOfFields+"' class='form-control percentatgeRepartir' style=' padding: 0px;line-height: 23px;font-size: 14px;' aria-label='Amount (to the nearest dollar)' value='0'><div class='input-group-append'><div class='input-group-append'><span class='input-group-text' style='border-bottom-right-radius: 0; border-top-right-radius: 0;'>.00</span></div><button onclick='deleteRow(\"row"+numberOfFields+"\")' class='btn btn-outline-secondary' style='border: 1px solid #ced4da; margin: 0px; padding: 0px 10px; font-size: 23px; color: #cc2952;' type='button' ><span class='mbri-trash'></span></button></div></div>");
    numberOfFields++;
    if (numberOfFields === 1) {
        percentagesModified = false;
    }
    // recalculatePercentages();
}
function recalculatePercentages() {
    if (!percentagesModified && numberOfFields > 0) {
        var value = parseInt(100 / numberOfFields);
        $("#divholder").find('.percentatgeRepartir').each(function (index){
            // If Last, add modulus
            if (index === numberOfFields-1){
                value = value + (100 % numberOfFields);
            }
            $(this).val(value);
        })
    }
    $(".percentatgeRepartir").on('keyup', function(event){
        event.preventDefault();
        event.stopPropagation();
        percentagesModified = true;
    });
}
function checkIfAllIn(){
    $i=0;
    $( ".percentatgeRepartir" ).each(function( index ) {
        if($( this ).val()!='-'){
            $i=$i+parseInt($( this ).val());
        }
    });
    if($i!=100){
        $('#ErrorModal').find('.modal-body').find('p').html('Percentage must sum 100.');
        $('#ErrorModal').modal('show');
        return false;
    }
    var amount = parseInt($("#ethToContract").val());
    if (amount < 0.1) {
        $('#ErrorModal').find('.modal-body').find('p').html('The minimum amount to send is 0.1 Eth.');
        $('#ErrorModal').modal('show');
        return false;
    }
    return true;
}
function deleteRow(rowD){
    $('#'+rowD).remove();
    numberOfFields--;
    // recalculatePercentages();
}
function selectChanged(rowNumber){
    var percentField = $("#percent"+rowNumber);
    switch($('#inputGroupSelect'+rowNumber+' option:selected').val()) {
        case '1':
            percentField.attr("disabled", "disabled");
            percentField.data('val', percentField.val());
            percentField.val('-');
            break;
        case '2':
            percentField.removeAttr("disabled");
            var actual = percentField.val();
            if (actual === "-") {
                percentField.val(percentField.data('val') || '0');
            }
            break;
        case '3':
            percentField.removeAttr("disabled");
            var actual = percentField.val();
            if (actual === "-") {
                percentField.val(percentField.data('val') || '0');
            }
            break;
    }
}