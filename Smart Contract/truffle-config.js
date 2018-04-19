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
            from: "0xc0Eb469a948C5b7A163Df6e9bCa0a7115a74B7a9",
            //gas: 6712387,
            //gasPrice: 9000000000 // 9 GWei
        },
        rinkeby: {
            host: "localhost", // Connect to geth on the specified ip
            port: 8545, // Geth port
            from: "0xDbdaA17aa6a854fEE1E127e1917E0a98dad607d7", // default address to use for any
            network_id: 4, // Network ID
            gas: 4612388, // Gas limit used for deploys
            gasPrice: 3000000000 // 3 GWei
        },
        real: {
            host: "localhost",
            port: 8545,
            network_id: 1,
            from: "0x73645B5ce9B0c3f3bb622d4FFE89478C88D80E0d",
            gas: 2000000,
            gasPrice: 4000000000 // 4 GWei
        }
    }
};
