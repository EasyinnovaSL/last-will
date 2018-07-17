function getLastWill() {
    var networkId = getNetworkId();
    var lastWillObject = localStorage.getItem("lastwill"+networkId);
    if (lastWillObject) {
        var lastWill = JSON.parse(lastWillObject);
        var timestamp = lastWill.timestamp;
        var jsonWill = lastWill.value;
        var now = new Date().getTime();
        var h = 1;
        if (now > timestamp + (h*60*60*1000)) {
            localStorage.removeItem("lastwill"+networkId);
        } else {
            return jsonWill;
        }
    }
    return null;
}

function setLastWill(lastwill) {
    var networkId = getNetworkId();
    var object = {value: lastwill, timestamp: new Date().getTime()}
    localStorage.setItem("lastwill"+networkId, JSON.stringify(object));
}

function removeLastWill() {
    var networkId = getNetworkId();
    localStorage.removeItem("lastwill"+networkId);
}

function getAddress() {
    var networkId = getNetworkId();
    return localStorage.getItem("address"+networkId);
}

function setAddress(address) {
    var networkId = getNetworkId();
    localStorage.setItem("address"+networkId, address);
}

function MyWills(options) {
    jQuery.extend(options, self.options);
    var _lastwill = getLastWill();
    this.lastwill = _lastwill || {witness:[],heirs:[],address:'', transactionHash: ''};
    this.confirmationsNeeded = 2;
    this.lastListOwnerValue = "";

    // Buttons Events
    $('#new-will').submit($.proxy(this._saveWill, this));
    $('.wills-container').on('click','button.deposit',$.proxy(this._depositWill,this));
    $('.wills-container').on('click','button.withdraw',$.proxy(this._withdrawWill,this));

    // Refresh wills when InfoModal, SendModal and WithdrawModal is hidden
    $('#InfoModal').on('hidden.bs.modal', function () {
        this._listWills();
    }.bind(this));
    $('#SendModal').on('hidden.bs.modal', function () {
        this._listWills();
    }.bind(this));
    $('#DepositModal').on('hidden.bs.modal', function () {
        this._listWills();
    }.bind(this));

    // list Wills input
    $("#listOwner").on('keyup', function(event){
        if (!event.ctrlKey &&  this.lastListOwnerValue != $(event.target).val()) {
            var web3 = new Web3();
            var address = $(event.target).val();
            this.lastListOwnerValue = address;
            if (web3.utils.isAddress(address)) {
                setAddress(address);
                this._listWills(address);
            } else {
                $(".wills-container").html("");
            }
        }
    }.bind(this));

    // Read saved address from cache
    var savedAddress = getAddress() || null;
    if (savedAddress !== null) {
        $("#listOwner").val(savedAddress);
        this._listWills(savedAddress);
    }

    // Load Previous Last Will
    if (_lastwill && _lastwill.address) {
        this.renderLastWill(this.lastwill);
        $("#last-will-links").show();
        $("#new-will-form").hide();
    } else {

        if(_lastwill && _lastwill.transactionHash){
            //Show modal
            $('#OkModal').modal('show');
            $('#OkModal .btn-success').hide();
            $('#OkModal .close').hide();
            $('#OkModal p').html("Contract creation hash "+_lastwill.transactionHash);


            onTransactioCompleted(_lastwill.transactionHash,function (){

                this.getWills(getAddress()).then(function(wills){
                        var lastwill=wills[wills.length -1];
                        this.setLasWillAddress(lastwill.address);
                        this._generateLinks(this.lastwill, lastwill.address);
                        $("#listOwner").val(getAddress());
                        $('#OkModal p').html("Last Will created successfully!<br><strong>Make sure to send the generated links or backup them.</strong>");
                        $('#OkModal .btn-success').show();
                        $('#OkModal .close').show();
                        this.renderLastWill();
                        $("#last-will-links").show();
                        $("#new-will-form").hide();

                    }.bind(this)


                );


            }.bind(this),2);
        }

        $("#last-will-links").hide();
        $("#new-will-form").show();
    }
}

MyWills.prototype.options = {}

MyWills.prototype._depositWill = function (event) {
    var contract = $(event.target).data('address');
    var count = $(event.target).data('count');
    var firstTime = parseInt($(event.target).data('status')) === 0;

    // Get the fee from SC
    var localWeb3 = new Web3(new Web3.providers.HttpProvider(getProvider()));
    var MyWill = new localWeb3.eth.Contract(getHierarchyContract().abi, contract);
    MyWill.methods.getCreationWeiCost().call(function(err, creationWeiCost){
        if (!err) {
            MyWill.methods.getWitnessWeiCost().call(function(err, witnessWeiCost){
                if (!err) {
                    // Check SC for the applied fees
                    var BN = localWeb3.utils.BN;
                    var creationCost = new BN(creationWeiCost);
                    var witnessCost = new BN(witnessWeiCost);
                    var allWitnessCost = witnessCost.mul(new BN(count));
                    var totalFeeWei = creationCost.add(allWitnessCost);
                    var totalFee = localWeb3.utils.fromWei(totalFeeWei, 'ether');

                    // Show Modal
                    var modal = $("#DepositModal");
                    modal.find('#fees-extended').collapse('hide');
                    modal.find('.fee-details').text('Show Fee Details');
                    modal.find("[name=address]").html(contract);
                    modal.find("[name=addressEnd]").html(contract.slice(-4));
                    modal.find("[name=addressCopy]").data('text',contract);
                    modal.find("[name=fee]").html(totalFee + " Eth");
                    modal.find("[name=feeCreation]").html(localWeb3.utils.fromWei(creationCost, 'ether'));
                    modal.find("[name=feeWitness]").html(localWeb3.utils.fromWei(witnessCost, 'ether'));

                    modal.find(".first-time").hide();
                    if (firstTime) {
                        modal.find(".first-time").show();
                        modal.find("[name=limit]").html("210.000");
                        modal.find("[name=limitCopy]").data('text',"210000");
                    } else {
                        modal.find("[name=limit]").html("50.000");
                        modal.find("[name=limitCopy]").data('text',"50000");
                    }

                    if (realContractSelected()){
                        modal.find('.content-real').show();
                        modal.find('.content-ropsten').hide();
                    } else {
                        modal.find('.content-real').hide();
                        modal.find('.content-ropsten').show();
                    }

                    modal.modal('show');

                }
            });
        }
    });
};

MyWills.prototype._showNewWillForm = function(event) {
    $("#new-will-form").show();
    $("#last-will-links").hide();
    removeLastWill();
};

MyWills.prototype._withdrawWill = function (event) {
    var contractAddress = $(event.target).data('address');
    var ownerAddress = $(event.target).data('owner');
    var contractBalance = $(event.target).data('balance');
    var modal = $("#SendModal");
    modal.find('input[name=to]').val("");
    modal.find('input[name=value]').val("");
    modal.find('input[name=max]').val(contractBalance);
    modal.find(".input-group").show();
    modal.find(".generate-group").hide();
    hideInputError(modal.find('input[name=to]'));
    hideInputError(modal.find('input[name=value]'));
    modal.find("button.generate").off('click').on('click', function(){
        var localWeb3 = new Web3(new Web3.providers.HttpProvider(getProvider()));

        // Get input
        var to = modal.find('input[name=to]').val();
        var value = modal.find('input[name=value]').val();
        var max = modal.find('input[name=max]').val();

        // Check input
        var error = false;
        if (!localWeb3.utils.isAddress(to)) {
            showInputError(modal.find('input[name=to]'), "Wrong address");
            error = true;
        } else {
            hideInputError(modal.find('input[name=to]'));
        }
        if (!value) {
            showInputError(modal.find('input[name=value]'), "Wrong value");
            error = true;
        } else {
            var valueWei = new localWeb3.utils.BN(localWeb3.utils.toWei(value, 'ether'));
            var maxWei = new localWeb3.utils.BN(localWeb3.utils.toWei(max, 'ether'));
            if (valueWei.isZero()) {
                showInputError(modal.find('input[name=value]'), "The value can't be 0");
                error = true;
            } else if (valueWei.gt(maxWei)) {
                showInputError(modal.find('input[name=value]'), "The maximum value is: " + max + "");
                error = true;
            } else {
                hideInputError(modal.find('input[name=value]'));
            }
        }
        if (error) return;

        // Calculate Data
        var contract = new localWeb3.eth.Contract(contracts.hierarchy.abi, contract);
        var data = contract.methods['execute'].apply(null, [to, localWeb3.utils.toWei(value, 'ether'), "0x00"]).encodeABI();

        // Show info
        modal.find(".generate-group strong[name=owner]").html(ownerAddress);
        modal.find(".generate-group strong[name=ownerEnd]").html(ownerAddress.slice(-4));
        modal.find(".generate-group strong[name=address]").html(contractAddress);
        modal.find(".generate-group strong[name=addressEnd]").html(contractAddress.slice(-4));
        modal.find(".generate-group div[name=addressCopy]").data('text',contractAddress);
        modal.find(".generate-group strong[name=data]").html(data);
        modal.find(".generate-group div[name=dataCopy]").data('text',data);
        modal.find(".input-group").hide();
        modal.find(".generate-group").show();
    });
    modal.modal('show');
};

MyWills.prototype._saveWill = function (event) {
    event.preventDefault();
    if(this.checkIfAllIn()) {
        var localWeb3 = new Web3();
        var heir=[];
        var heir_percentage=[];
        var witness=[];
        var lastwill = {witness:[], heirs:[], address:'', transactionHash: ''};

        $('div.field').each(function (){
            var account = localWeb3.eth.accounts.create([localWeb3.utils.randomHex(32)]);
            var type = $(this).find('select').val();
            if(type == '1' ){
                lastwill.witness.push({account:account});
                witness.push(account.address);
            }else if(type == '2'){
                heir.push(account.address);
                var val = $(this).find('input').val();
                var fval = parseFloat(val.replace(",","."));
                lastwill.heirs.push({account:account,percentage:fval});
                heir_percentage.push(Math.floor(fval*1000));
            }else if(type == '3'){
                lastwill.witness.push({account:account});
                heir.push(account.address);
                var val = $(this).find('input').val();
                var fval = parseFloat(val.replace(",","."));
                lastwill.heirs.push({account:account,percentage:fval});
                heir_percentage.push(Math.floor(fval*1000));
                witness.push(account.address);
            }
        });

        if (witness.length < 1) throw new Error("Invalid number of addresses");
        if (heir.length < 1) throw new Error("Invalid number of addresses");
        if (heir_percentage && heir_percentage.length !== heir.length) throw new Error("Invalid number of percentages (must be the same as addresses)");
        var totalpercentage = 0;
        heir_percentage.forEach(function (i){
            totalpercentage+=parseInt(i);
        });
        if (totalpercentage !== 100000) throw new Error("Invalid percentage (percentage must sum 100)");

        // Input params
        var ownerAddress = $("#ownerInput").val();
        var addresseswitnesStr = witness.join(";").toLowerCase();
        var addressesheirsStr = heir.join(";").toLowerCase();
        var percentagesheirsStr = heir_percentage.join(";").toLowerCase();

        var inputValue = $("#ethToContract").val();
        if (!inputValue) inputValue = 0;


        //Save will in localstorage before send the call
        this._lastWillToLocalStorage(lastwill);



        // Make Ajax post request
        $.ajax({
            type: "POST",
            url: "/will",
            data: {
                owner: ownerAddress,
                heirs: addressesheirsStr,
                percentages: percentagesheirsStr,
                witnesses: addresseswitnesStr,
                real: realContractSelected(),
                recaptcha:$('#g-recaptcha-response').val()
            },
            beforeSend: function() {
                // TODO show loading
                $('#OkModal').modal('show');
                $('#OkModal p').html("Creating last will contract...");
                $('#OkModal .btn-success').hide();
                $('#OkModal .close').hide();
            },
            success: function(hash){
                $('#OkModal p').html("Contract creation hash "+hash);
                this.setLasWillTransactionHash(hash);
                onTransactioCompleted(hash,function (){

                    this.getWills(ownerAddress).then(function(wills){
                            var lastwill=wills[wills.length -1];
                        setAddress(ownerAddress);

                        this.setLasWillAddress(lastwill.address);
                        this._generateLinks(this.lastwill, lastwill.address);
                        $("#listOwner").val(ownerAddress);
                            $('#OkModal p').html("Last Will created successfully!<br><strong>Make sure to send the generated links or backup them.</strong>");
                            $('#OkModal .btn-success').show();
                            $('#OkModal .close').show();
                            this.renderLastWill();
                            $("#last-will-links").show();
                            $("#new-will-form").hide();

                        }.bind(this)


                    );


                }.bind(this),2);

            }.bind(this),
            error: function(err){
                removeLastWill();
                setTimeout(function(){

                    $('#OkModal').modal('hide');
                    $('#ErrorModal').find('.modal-body').find('p').html(err.responseText);
                    $('#ErrorModal').modal('show');
                }.bind(this),500);
            },
        });
    }
};

function replaceAll(text,find,replace) {
    return text.replace(new RegExp('[' + find + ']', 'g'), replace);
}

MyWills.prototype._generateLinks = function (lastwill,address) {
    lastwill.heirs.forEach(function(item){
        var url = this._createLink("2",item.account,address);
        item.url = url;
        console.log(url);
        item.escapedUrl = replaceAll(url,"&", "%26");
        console.log("adsasd:"+item.escapedUrl);
    }.bind(this));

    lastwill.witness.forEach(function(item){
        var url = this._createLink("1",item.account,address);
        item.url = url;
        item.escapedUrl = replaceAll(url,"&", "%26");
    }.bind(this));

    this.lastwill = lastwill;
    setLastWill(lastwill);

    // Final render
    $('#OkModal p').html("Last Will created successfully!<br><strong>Make sure to send the generated links or backup them.</strong>");
    $('#OkModal .btn-success').show();
    $('#OkModal .close').show();
    this.renderLastWill();
    $("#last-will-links").show();
    $("#new-will-form").hide();

    this._listWills();

};

MyWills.prototype._lastWillToLocalStorage = function (lastwill) {
    this.lastwill = lastwill;
    setLastWill(lastwill);
};

MyWills.prototype.setLasWillTransactionHash = function (transactionHash) {
    this.lastwill.transactionHash = transactionHash;
    setLastWill(this.lastwill);
};

MyWills.prototype.setLasWillAddress = function (address) {
    this.lastwill.address = address;
    setLastWill(this.lastwill);
};


MyWills.prototype._listWills = function (forcedAddress = null) {
    var address = getAddress() || forcedAddress;
    if (address === null) return;
    $('.wills-container').html($("#generic-loader").clone().show());
    this.getWills(address).then(function(wills){
        if (wills !== null && wills && wills.length !== 0) {
            var template = $('#will-template').html();
            Mustache.parse(template);   // optional, speeds up future uses
            var rendered = Mustache.render(template, {'wills': wills});
            $('.wills-container').html(rendered);

            //Select the correct etherscan URL
            var isRealNetwork = realContractSelected();

            if(!isRealNetwork || !contracts.production){
                $("a.etherscan").each(function (index, value) {
                    $(this).attr('href', $(this).attr('href').replace("https://etherscan.io/", "https://ropsten.etherscan.io/"));
                });
            }

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
        return window.location.protocol + '//' + window.location.host+'/witness?pk='+account.privateKey+'&will='+will+'&network='+getNetworkId();
    }else{
        return window.location.protocol + '//' + window.location.host+'/heir?pk='+account.privateKey+'&will='+will+'&network='+getNetworkId();
    }
}

MyWills.prototype._sendMail=function(){

    var email=$('#input-email').val();

    if(!email.match("[a-z0-9!#$%&'*+\\/=?^_`\\{|\\}~-]+(?:\\.[a-z0-9!#$%&'*+\\/=?^_`\\{|\\}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?")){
        $('#OkModal').modal('hide');
        $('#ErrorModal').find('.modal-body').find('p').html("Enter a valid email address");
        $('#ErrorModal').modal('show');
        return false;
    }

    $.ajax({
        type: "POST",
        url: "/send-mail",
        data: {will:this.lastwill,email:email},
        beforeSend: function() {
            // TODO show loading
            $('#OkModal').modal('show');
            $('#OkModal p').html("Sending email...");
            $('#OkModal .btn-success').hide();
            $('#OkModal .close').hide();
        },
        success: function(address){
            $('#OkModal p').html("Email send");
            $('#OkModal .btn-success').show();
            $('#OkModal .close').show();
        }.bind(this),
        error: function(err){
            $('#OkModal').modal('hide');
            $('#ErrorModal').find('.modal-body').find('p').html(err.responseText);
            $('#ErrorModal').modal('show');
        },
    });
}

MyWills.prototype.getWills = function (address) {
    return new Promise(function(resolve, reject){
        $.ajax({
               type: "POST",
               url: "/contracts",
               data: {
                   owner: address,
                   real: realContractSelected()
               },
               success: function(wills){
                   // console.log(wills);
                   resolve(wills);
               },
               error: function(err){
                   console.error(err);
                   reject(err);
               },
           });
    }.bind(this));
};

MyWills.prototype.renderLastWill = function () {
    var template = $('#last-will-added-template').html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, this.lastwill);
    $('#last-will-links').html(rendered);
    $('[data-toggle="tooltip"]').tooltip();
    $('#send-email').click($.proxy(this._sendMail,this));
    $('#create-new-last-will').on('click', $.proxy(this._showNewWillForm,this));
};

MyWills.prototype.checkIfAllIn = function () {
    var i=0;
    $( ".percentatgeRepartir" ).each(function( index ) {
        if($( this ).val()!='-'){
            i+=Math.floor(parseFloat($( this ).val().replace(",","."))*1000);
        }
    });
    if(i!=100000){
        $('#ErrorModal').find('.modal-body').find('p').html('Percentage must sum 100');
        $('#ErrorModal').modal('show');
        return false;
    }
    var ownerAddress = $("#ownerInput").val();
    if(ownerAddress === ""){
        $('#ErrorModal').find('.modal-body').find('p').html('Owner address is required.');
        $('#ErrorModal').modal('show');
        return false;
    }
    if(ownerAddress.length !== 42){
        $('#ErrorModal').find('.modal-body').find('p').html('The owner address must be 42 characters length and starts with 0x.');
        $('#ErrorModal').modal('show');
        return false;
    }
    return true;
};

numberOfFields = 0;
percentagesModified = false;
addRowGeneric();

$('.percentatgeRepartir').blur(function(){
    if ($(this).val().length == 0) return;
    var num = parseFloat($(this).val());
    if (!isNaN(num)) {
        var cleanNum = num.toFixed(3);
        if (cleanNum != num) {
            $(this).val(cleanNum);
            if (num / cleanNum != 1) {
                $('#ErrorModal').find('.modal-body').find('p').html('Please enter a maximum of 3 decimal places.');
                $('#ErrorModal').modal('show');
            }
        }
    }
});

function addRowGeneric(){
    $("#divholder").append("<div id='row"+numberOfFields+"' class='field input-group mb-3'><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01' style='border: 1px solid #ced4da;\n" +
        "    margin: 0px;\n" +
        "    padding: 0px 10px;\n" +
        "    font-size: 23px;\n" +
        "    color: black;\n" +
        "    font-style: normal;\n" +
        "    background-color: white;'><span class='mbri-user'></span></label></div><select class='custom-select'  onchange='selectChanged(\""+numberOfFields+"\")' style='height: 49px;' id='inputGroupSelect"+numberOfFields+"'><option value='1'>Witness</option><option value='2'>Heir</option><option value='3' selected>Heir & Witness</option></select><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01' style='    border: 1px solid #ced4da;\n" +
        "    margin: 0px;\n" +
        "    padding: 0px 10px;\n" +
        "    font-size: 23px;\n" +
        "    color: black;\n" +
        "    font-style: normal;\n" +
        "    background-color: white;'>%</label></div><input type='text' id='percent"+numberOfFields+"' class='form-control percentatgeRepartir' style='background-color: white;border: 1px solid #ced4da; padding: 0px;line-height: 23px;font-size: 14px; text-align:center ' aria-label='Amount (to the nearest dollar)' value=''><div class='input-group-append'><button onclick='deleteRow(\"row"+numberOfFields+"\")' class='btn btn-outline-secondary' style='border: 1px solid #ced4da; margin: 0px; padding: 0px 10px; font-size: 23px; color: #e80000;' type='button' ><span class='mbri-trash'></span></button></div></div>");
    numberOfFields++;
    if (numberOfFields === 1) {
        percentagesModified = false;
    }
}

function deleteRow(rowD){
    $('#'+rowD).remove();
    numberOfFields--;
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

function showInputError(input, message){
    input.css('box-shadow', '0 0 0 0.2rem #ff0000');
    if (input.parent().find('p.error').length === 0) {
        var pTag = $('<p/>', {style: 'color: red; margin: 5px 0 0 5px;', class: "error"}).html(message);
        input.parent().append(pTag);
    }
}

function hideInputError(input) {
    input.css('box-shadow', '');
    input.parent().find('p.error').remove();
}

function onTransactioCompleted(hash,callback,numConfirmations=12){
 interval=setInterval(function (){
     localWeb3 = new Web3(new Web3.providers.HttpProvider(getProvider()));
     current_hash=hash;
     localWeb3.eth.getBlockNumber().then( function(blockNumber) {

         localWeb3.eth.getTransaction(current_hash).then(function(object)
         {

             if (object && object.blockNumber && blockNumber - object.blockNumber  >= numConfirmations) {
                 clearInterval(interval);
                 callback();
             }
         }
     );


     });




},10000)

}