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
            from: "0xc0Eb469a948C5b7A163Df6e9bCa0a7115a74B7a9",
            //gas: 6712387,
            //gasPrice: 9000000000 // 9 GWei
        },
    }
};
