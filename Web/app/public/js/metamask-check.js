
/**
 * Created by easy on 03/05/2018.
 */

function logCurrentNetwork(netId) {
    switch (netId) {
        case "1":
            console.log('Detected Main network');
            break;
        case "2":
            console.log('Detected deprecated Morden test network.');
            break;
        case "3":
            console.log('Detected Ropsten test network.');
            break;
        case "4":
            console.log('Detected Rinkeby test network.');
            break;
        case "42":
            console.log('Detected Kovan test network.');
            break;
        default:
            console.log('This is an unknown network ('+netId+').');
    }
}

$(document).ready(function () {

    // Check if Web3 has been injected by the browser:
    if (typeof web3 !== 'undefined') {
        // You have a web3 browser!

        // Check which network is metamask attached
        web3.version.getNetwork((err, netId) => {
            // logCurrentNetwork(netId);
            // Force Rinkeby or Private Net
            if (netId !== "4") {
                window.location.href = "/requirements";
            }
        });

    } else {
        // Warn the user that they need to get a web3 browser
        // Or install MetaMask, maybe with a nice graphic.
        window.location.href = "/requirements";
    }
});