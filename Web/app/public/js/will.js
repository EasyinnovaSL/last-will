function MyWills(options) {
    jQuery.extend(options, self.options);
    this.lastwill = JSON.parse(localStorage.getItem("lastwill")) || {witness:[],heirs:[],address:''};
    this.confirmationsNeeded = 2;

    // Buttons Events
    $('#new-will').submit($.proxy(this._saveWill, this));
    $('.wills-container').on('click','button.deposit',$.proxy(this._depositWill,this));
    $('.wills-container').on('click','button.send',$.proxy(this._sendWill,this));
    // $('.wills-container').on('click','button.withdraw',$.proxy(this._withdrawWill,this));

    // Refresh wills when InfoModal is hidden
    $('#InfoModal').on('hidden.bs.modal', function () {
        this._listWills();
    }.bind(this));

    // list Wills input
    $("#listOwner").on('keyup', function(event){
        if (!event.ctrlKey) {
            var web3 = new Web3();
            var address = $(event.target).val();
            if (web3.utils.isAddress(address)) {
                localStorage.setItem("address", address);
                this._listWills(address);
            } else {
                $(".wills-container").html("");
            }
        }
    }.bind(this));

    // Read saved address from cache
    var savedAddress = localStorage.getItem("address") || null;
    if (savedAddress !== null) {
        $("#listOwner").val(savedAddress);
        this._listWills(savedAddress);
    }
}

MyWills.prototype.options = {}

MyWills.prototype._depositWill = function (event) {
    var contract = $(event.target).attr('data-address');

    var html = "<p>Send <strong>ROPSTEN</strong> Ethers to the next address, using either an exchanger or an Ethereum Wallet:</p>"
               + "<h5>"+contract+"</h5>";
    if (!realContractSelected()) {
        html += "<p>Also, in this TestNet version, you can use the <a target=\"_blank\" href=\"http://faucet.ropsten.be:3001\">Ropsten official faucet</a></p>";
    }

    $("#InfoModal").find(".content").html(html);
    $("#InfoModal").modal('show');
};


MyWills.prototype._sendWill = function (event) {
    var contractAddress = $(event.target).attr('data-address');
    var ownerAddress = $(event.target).attr('data-owner');
    var modal = $("#SendModal");
    modal.find('input[name=to]').val("");
    modal.find('input[name=value]').val("");
    modal.find(".input-group").show();
    modal.find(".generate-group").hide();
    modal.find("button.generate").off('click').on('click', function(){
        // Get input
        var to = modal.find('input[name=to]').val();
        var value = modal.find('input[name=value]').val();

        // Calculate Data
        var localWeb3 = new Web3(new Web3.providers.HttpProvider(Config.provider));
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
        var lastwill = {witness:[],heirs:[],address:''};

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

        // Make Ajax post request
        $.ajax({
            type: "POST",
            url: "/will",
            data: {
                owner: ownerAddress,
                heirs: addressesheirsStr,
                percentages: percentagesheirsStr,
                witnesses: addresseswitnesStr,
                recaptcha:$('#g-recaptcha-response').val()
            },
            beforeSend: function() {
                // TODO show loading
                $('#OkModal').modal('show');
                $('#OkModal p').html("Creating last will contract...");
                $('#OkModal .btn-success').hide();
                $('#OkModal .close').hide();
            },
            success: function(address){
                    localStorage.setItem("address",ownerAddress);
                    $("#listOwner").val(ownerAddress);
                    this._generateLinks(lastwill,address);
            }.bind(this),
            error: function(err){
                setTimeout(function(){
                    $('#OkModal').modal('hide');
                    $('#ErrorModal').find('.modal-body').find('p').html(err.responseText);
                    $('#ErrorModal').modal('show');
                }.bind(this),500);
            },
        });
    }
};

MyWills.prototype._generateLinks = function (lastwill,address) {
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

    this.lastwill = lastwill;
    localStorage.setItem("lastwill", JSON.stringify(this.lastwill));

    // Final render
    $('#OkModal p').html("Last Will created successfully!");
    $('#OkModal .btn-success').show();
    $('#OkModal .close').show();
    this.renderLastWill();
    this._listWills();
};

MyWills.prototype._listWills = function (forcedAddress = null) {
    var address = localStorage.getItem("address") || forcedAddress;
    if (address === null) return;
    $('.wills-container').html($("#generic-loader").clone().show());
    this.getWills(address).then(function(wills){
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

MyWills.prototype._sendMail=function(){
    $.ajax({
        type: "POST",
        url: "/send-mail",
        data: {
            owner: ownerAddress,
            heirs: addressesheirsStr,
            percentages: percentagesheirsStr,
            witnesses: addresseswitnesStr,
            recaptcha:$('#g-recaptcha-response').val()
        },
        beforeSend: function() {
            // TODO show loading
            $('#OkModal').modal('show');
            $('#OkModal p').html("Creating last will contract...");
            $('#OkModal .btn-success').hide();
            $('#OkModal .close').hide();
        },
        success: function(address){
            localStorage.setItem("address",ownerAddress);
            $("#listOwner").val(ownerAddress);
            this._generateLinks(lastwill,address);
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
                   owner: address
               },
               success: function(wills){
                   console.log(wills);
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
};

MyWills.prototype.checkIfAllIn = function () {
    var i=0;
    $( ".percentatgeRepartir" ).each(function( index ) {
        if($( this ).val()!='-'){
            console.log("Percentage: " + $( this ).val());
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
    $("#divholder").append("<div id='row"+numberOfFields+"' class='field input-group mb-3'><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01'><i class='fa fa-user'></i></label></div><select class='custom-select'  onchange='selectChanged(\""+numberOfFields+"\")' style='height: 49px;' id='inputGroupSelect"+numberOfFields+"'><option value='1'>Witness</option><option value='2'>Heir</option><option value='3' selected>Heir & Witness</option></select><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01'>%</label></div><input type='text' id='percent"+numberOfFields+"' class='form-control percentatgeRepartir' style=' padding: 0px;line-height: 23px;font-size: 14px; text-align:center ' aria-label='Amount (to the nearest dollar)' value=''><div class='input-group-append'><button onclick='deleteRow(\"row"+numberOfFields+"\")' class='btn btn-outline-secondary' style='border: 1px solid #ced4da; margin: 0px; padding: 0px 10px; font-size: 23px; color: #e80000;' type='button' ><span class='mbri-trash'></span></button></div></div>");
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