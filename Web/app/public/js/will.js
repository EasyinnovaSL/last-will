function MyWills(options){
    jQuery.extend(options,self.options);
    this.wills=[];
this.contract_address=options.contract_address;

}

MyWills.prototype.options={

}

MyWills.prototype._listWills=function(){
    //this.loading.show();

    var wills = this.getWills();
    if (wills){
    this.wills =wills;
    }
  //  this.lao
}

MyWills.prototype._addWill={

}
MyWills.prototype._editWill={

}

MyWills.prototype._editWill={

}
MyWills.prototype.getWills= function(){
    return JSON.parse(localStorage.getItem("wills"));

}
MyWills.prototype.postWill= function(will){
    this.wills[will.adress]=will;
    localStorage.setItem("wills", JSON.stringify(this.wills))
}