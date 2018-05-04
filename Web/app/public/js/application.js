/**
 * Created by easy on 24/01/2018.
 */

$(document).ready(function () {
    let BTL = new BackToLife({contract: contracts.base, hierarchy: contracts.hierarchy});
    BTL.createVoteWill(["0x8585f3E392F85D1E5b3B105193f458D4BF00b41d","0x1DE3CE1B51CafAF17f0FFdfcc93970d43D2B59b3"]).then(function(value){
        console.log("TX Hash: " + value);
        return BTL.getLastWillHash();
    }).then(function(value){
        console.log("Last will address: " + value);
        return BTL.getWills();
    }).then(function(value){
        console.log("Wills: ");
        console.log(value.valueOf());
    }).catch(function(err){
        if (err.message.indexOf("User denied transaction signature") !== -1) {
            alert("User denied transaction!");
        } else {
            console.log(err.message);
        }
    })
});