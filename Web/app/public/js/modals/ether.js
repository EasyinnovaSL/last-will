/**
 * Created by easy on 24/01/2018.
 */

function resetCoockies(){
    $.removeCookie('eth', { path: '/' });
    window.location.reload();
}

$(document).ready(function () {

    var modal = $("#ether-modal");

    // Bind buttons
    modal.find("#saveBotton").click(function(){
        var privateKey = modal.find('input[name=address]').val().replace(/ /g, '');
        if (privateKey.length == 66 && privateKey.startsWith("0x")) {
            modal.find('#error-privkey').hide();
            // Do petition
            $.post('/eth/parse-private', {privateKey: privateKey}, function(response) {
                $.cookie('eth', JSON.stringify(response));
                window.location.reload();
            });
        } else {
            modal.find('#error-privkey').show();
        }
    });

    var eth = $.cookie("eth");
    if (!eth) {
        modal.modal('show');
    } else {
        eth = JSON.parse(eth);
        if (!eth.hasOwnProperty('privateKey') || !eth.hasOwnProperty('publicKey') || !eth.hasOwnProperty('address')) {
            modal.modal('show');
        } else {
            // Show info
            $('#address-span').html(eth.address);
            $('#privateKey-span').html(eth.privateKey);
            $('#publicKey-span').html(eth.publicKey);
            modal.find('input[name=address]').val(eth.privateKey);
        }
    }
});