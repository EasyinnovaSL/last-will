
var HDWalletProvider = require("truffle-hdwallet-provider");
var seed = "utility unit joke key fit hip carpet phrase license bread undo eager";

module.exports = {
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "7",
            from: "0xff1fbfe19950b12ace5101de1459d765e062cb59",
            gas: 4612388,
            //gasPrice: 9000000000 // 9 GWei
        },
        rinkeby: {
            provider: function() {
                return new HDWalletProvider(seed, "https://rinkeby.infura.io/VzAp7t8qZU2Sn4vuyupa")
                // Main account: 0x3bdec9a3d0378738a36bc484d234bdd035072a7a
            },
            network_id: 4,
            gasPrice: 1000000000 // 1 GWei
        }
    }
};
