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
            port: 9595,
            network_id: "*",
            from: "0xAec3aE5d2BE00bfC91597d7A1b2c43818d84396A",
            //gas: 6712387,
            //gasPrice: 9000000000 // 9 GWei
        },
    }
};
