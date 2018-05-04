function MyWills(options){
    jQuery.extend(options,self.options);
    this.data=[];
this.contract_address=options.contract_address;
    $('.mbr-more').click($.proxy(this._addWill,this));
    $('#new-will').submit($.proxy(this._saveWill,this));

    this._listWills();
}

MyWills.prototype.options={

}



MyWills.prototype._addWill=function(){
$('.wills-form').show();
}
MyWills.prototype._saveWill=function(event){
    event.preventDefault();
    var formData = $('#new-will').serializeArray();
    var data={};

    for(var i in formData){
      data[formData[i].name]=formData[i].value;
    }
    var heir=[];
    var type=data['type'];
    for(var i=0;i<5;i++){
        if(data['heir'+i]!="")
            heir.push(data['heir'+i]);
    }

    this.postWill({'type':type,'heir':heir,'address':Math.random().toString()});
    $('#new-will')[0].reset();
    $('.wills-form').hide();
    $('#OkModal').modal('show');
    this._listWills();
}
MyWills.prototype._listWills=function(){
    var wills=this.getWills();
    console.log(JSON.stringify(wills));
    var template = $('#will-template').html();
    Mustache.parse(template);   // optional, speeds up future uses
    var rendered = Mustache.render(template, {'wills':wills});
    $('.wills-container').html(rendered);

}

MyWills.prototype._editWill={

}

MyWills.prototype._editWill={

}
MyWills.prototype.getWills= function(){
    var wills =JSON.parse(localStorage.getItem("wills"));
    if(wills)
    this.data = (wills)? wills.wills  :[];
    return this.data;

}
MyWills.prototype.postWill= function(will){
    this.data.push(will);
    localStorage.setItem("wills", JSON.stringify({'wills':this.data}))
}