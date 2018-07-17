
var HDWalletProvider = require("truffle-hdwallet-provider");
var Config = require('../Web/app/server/config/config');

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
            from: Config.local.address,
            gas: 4600000,
            // gasPrice is set in ganache script
        },
        main: {
            provider: function() {
                return new HDWalletProvider(Config.main.seed, Config.main.provider)
            },
            network_id: 1,
            gas: 4600000,
            gasPrice: 8000000000 // 8 GWei
        },
        ropsten: {
            provider: function() {
                return new HDWalletProvider(Config.ropsten.seed, Config.ropsten.provider)
            },
            network_id: 3,
            gas: 4600000,
            gasPrice: 7000000000 // 7 GWei
        }
    }
};
