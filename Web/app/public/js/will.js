function MyWills(options) {
    jQuery.extend(options, self.options);
    this.back_to_life = new BackToLife(options);
    this.heritageAbi = options.hierarchy.abi;

    $('.mbr-more').click($.proxy(this._addWill, this));
    $('#new-will').submit($.proxy(this._saveWill, this));
    $('.wills-container').on('click','button.send',$.proxy(this._sendWill,this));
    $('.wills-container').on('click','button.withdraw',$.proxy(this._withdrawWill,this));
    $('.wills-container').on('click','button.declare-dead',$.proxy(this._declareDead, this));
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
    $("#divholderBen").append("<div id='row"+numberOfFields+"' class='input-group mb-3'><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01'><i class='fa fa-user'></i></label></div><select class='custom-select'  style='height: 49px;' id='inputGroupSelect"+numberOfFields+"' disabled><option value='2' selected>Heir</option></select><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01'>%</label></div><input type='text' id='percent"+numberOfFields+"' class='form-control' style=' padding: 0px;line-height: 23px;font-size: 14px;' aria-label='Amount (to the nearest dollar)'><div class='input-group-append'><div class='input-group-append'><span class='input-group-text'>.00</span></div><button onclick='deleteRow(\"row"+numberOfFields+"\")' class='btn btn-outline-secondary' style='margin: 0px; padding: 0px 10px; font-size: 23px; color: #cc2952;' type='button' >-</button></div></div>");
    $("#percent"+numberOfFields).val($("#originalPercent").val());
    numberOfFields++;
}
function addW(){
    $("#divholderTes").append("<div id='row"+numberOfFields+"' class='input-group mb-3'><div class='input-group-prepend'><label class='input-group-text' for='inputGroupSelect01'><i class='fa fa-user'></i></label></div><select class='custom-select'  style='height: 49px;' id='inputGroupSelect"+numberOfFields+"' disabled><option value='1' selected>Witness</option></select><div class='input-group-prepend'></div><button onclick='deleteRow(\"row"+numberOfFields+"\")' class='btn btn-outline-secondary' style='margin: 0px; padding: 0px 10px; font-size: 23px; color: #cc2952;' type='button' >-</button></div></div>");
    numberOfFields++;
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
        $('#ErrorModal').find('.modal-body').find('p').html('Something went wrong.');
        $('#ErrorModal').modal('show');
    });
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

MyWills.prototype._editWill = {}

MyWills.prototype.getWills = function () {
    console.log("My Ether address: " + web3.eth.accounts[0]);
    return this.back_to_life.getWills();
};

MyWills.prototype.postWill = function (will) {
    return this.back_to_life.createVoteWill(will.heirs);
};