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
            host: "localhost", // Connect to geth on the specified
            port: 8545,
            network_id: 4,
            from: "0xF6BCe1f03efebeC361C8A952577d8652EBCcAB5D",
            gas: 4612388 // Gas limit used for deploys
        }
    }
};
