function MyWills(options) {
    jQuery.extend(options, self.options);
    this.back_to_life = new BackToLife(options);

    $('.mbr-more').click($.proxy(this._addWill, this));
    $('#new-will').submit($.proxy(this._saveWill, this));
    $('.wills-container').on('click','a.edit',this._editWill, this);

    this._listWills();
}

MyWills.prototype.options = {}

MyWills.prototype._editWill = function () {

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

MyWills.prototype._listWills = function () {
    this.getWills().then(function(wills){
        var template = $('#will-template').html();
        Mustache.parse(template);   // optional, speeds up future uses
        var rendered = Mustache.render(template, {'wills': wills});
        $('.wills-container').html(rendered);
    }).catch(function(err){
        alert("Error " + err.message);
    });

};

MyWills.prototype._editWill = {}

MyWills.prototype._editWill = {}

MyWills.prototype.getWills = function () {
    return this.back_to_life.getWills();
};

MyWills.prototype.postWill = function (will) {
    return this.back_to_life.createVoteWill(will.heirs);
};