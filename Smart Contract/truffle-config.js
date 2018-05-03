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
            network_id: "*",
            from: "0xff1fbfe19950b12ace5101de1459d765e062cb59",
            //gas: 6712387,
            //gasPrice: 9000000000 // 9 GWei
        },
    }
};
