
var Web3 = require('web3');
var Web3EthPersonal = require('web3-eth-personal');
var FileSystem = require('fs');
var request = require('request');
var Config = require('../config/config');
var EthereumTx = require('ethereumjs-tx');

var contract;
var willAbi;
var contractReal;
var willAbiReal;

exports.getWeb3 = function(real) {
    var web3 = new Web3(new Web3.providers.HttpProvider(exports.getProvider(real)));
    web3.eth.personal = new Web3EthPersonal(exports.getProvider(real));
    return web3;
}

exports.getMainAddress = function(real) {
    if (Config.production) {
        if (real) return Config.mainAddressReal;
        else return Config.mainAddressRopsten;
    } else {
        if (real) return Config.mainAddressRopsten;
        else return Config.mainAddressLocal;
    }
}

exports.getPrivateKey = function(real) {
    if (Config.production) {
        if (real) return Config.mainPrivateKeyReal;
        else return Config.mainPrivateKeyRopsten;
    } else {
        if (real) return Config.mainPrivateKeyRopsten;
        else return Config.mainPrivateKeyLocal;
    }
}

exports.getProvider = function(real) {
    if (Config.production) {
        if (real) return Config.providerReal;
        else return Config.providerRopsten;
    } else {
        if (real) return Config.providerRopsten;
        else return Config.providerLocal;
    }
}

exports.getContractBacktoLife = function(real) {
    if (real) {
        return Config.production ? Config.urlContractBacktolifeReal : Config.urlContractBacktolifeRopsten;
    } else {
        return Config.production ? Config.urlContractBacktolifeRopsten : Config.urlContractBacktolifeLocal;
    }
}

exports.getContractMywill = function(real) {
    if (real) {
        return Config.production ? Config.urlContractHierarchyReal : Config.urlContractHierarchyRopsten;
    } else {
        return Config.production ? Config.urlContractHierarchyRopsten: Config.urlContractHierarchyLocal;
    }
}

// Read contract info
FileSystem.readFile(exports.getContractBacktoLife(false), 'utf8', function (err,data) {
    if (err) console.log(err);
    var config = JSON.parse(data);
    var abi = config.abi;
    var contractAddress = config.address;
    var web3 = exports.getWeb3(false);
    contract = new web3.eth.Contract(abi,contractAddress);
});
FileSystem.readFile(exports.getContractMywill(false), 'utf8', function (err,data) {
    if (err) console.log(err);
    var config = JSON.parse(data);
    willAbi = config.abi;
});

// Read contract info Real
FileSystem.readFile(exports.getContractBacktoLife(true), 'utf8', function (err,data) {
    if (err) console.log(err);
    var config = JSON.parse(data);
    var abi = config.abi;
    var contractAddress = config.address;
    var web3 = exports.getWeb3(true);
    contractReal = new web3.eth.Contract(abi,contractAddress);
});
FileSystem.readFile(exports.getContractMywill(true), 'utf8', function (err,data) {
    if (err) console.log(err);
    var config = JSON.parse(data);
    willAbiReal = config.abi;
});

exports.getWillAbi = function(req) {
    if (req.session.real) return willAbiReal;
    return willAbi;
}

exports.getContract = function(req) {
    if (req.session.real) return contractReal;
    return contract;
}

/**
 * Get Smart Contracts Info
 */
exports.getContractsInfo = function (req, res, next) {
    // Read contracts
    var baseContractTest = FileSystem.readFileSync(exports.getContractBacktoLife(false));
    if (!baseContractTest) return res.redirect("/error");
    var hierarchyContractTest = FileSystem.readFileSync(exports.getContractMywill(false));
    if (!hierarchyContractTest) return res.redirect("/error");
    var baseContractReal = FileSystem.readFileSync(exports.getContractBacktoLife(true));
    if (!baseContractReal) return res.redirect("/error");
    var hierarchyContractReal = FileSystem.readFileSync(exports.getContractMywill(true));
    if (!hierarchyContractReal) return res.redirect("/error");
    res.locals.contracts = {
        baseTest: JSON.parse(baseContractTest),
        hierarchyTest: JSON.parse(hierarchyContractTest),
        baseReal: JSON.parse(baseContractReal),
        hierarchyReal: JSON.parse(hierarchyContractReal),
        providerTest: exports.getProvider(false),
        providerReal: exports.getProvider(true),
        production: Config.production,
        captcha: Config.captcha
    };

    // Continue
    next();
};

/**
 * Create Will Contract
 */
exports.createWillContract = function (req, res) {
    var owner = req.body.owner;
    var heirs = req.body.heirs;
    var percentages = req.body.percentages;
    var witnesses = req.body.witnesses;
    var recaptcha = req.body.recaptcha;
    req.session.real = req.body.real == "true";

    if (Config.captcha) {
        if (recaptcha === undefined || recaptcha === '' || recaptcha === null) {
            return res.status(400).send("Please select captcha.");
        }
    }

    if (!owner || !heirs || !percentages || !witnesses) {
        return res.status(400).send("Invalid Params.");
    }


    if (Config.captcha) {
        // recaptcha
        var secretKey = "6LffzGAUAAAAAGxQl-J2mnFZqVkpQb6-AglNclxv";
        var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + recaptcha + "&remoteip=" + req.connection.remoteAddress;

        request(verificationUrl, function (error, response, body) {
            body = JSON.parse(body);

            // Success will be true or false depending upon captcha validation.
            if (body.success !== undefined && !body.success) {
                return res.status(400).send("Failed captcha verification");
            }

            return exports.sendTransaction('createLastWill', [owner, heirs, percentages, witnesses], {
                privateKey: exports.getPrivateKey(req.session.real),
                from: exports.getMainAddress(req.session.real),
                req: req
            }).then(function (lastWillAddress) {
                return res.status(200).send(lastWillAddress);
            }).catch(function (err) {
                return res.status(400).send(err.message);
            });

        });
    } else {
        return exports.sendTransaction('createLastWill', [owner, heirs, percentages, witnesses], {
            privateKey: exports.getPrivateKey(req.session.real),
            from: exports.getMainAddress(req.session.real),
            value: value.toString(),
            req: req
        }).then(function (lastWillAddress) {
            return res.status(200).send(lastWillAddress);
        }).catch(function (err) {
            return res.status(400).send(err.message);
        });
    }


};

/**
 * Get Will Contracts
 */
exports.getWillContracts = async function (req, res) {
    var owner = req.body.owner;
    req.session.real = req.body.real == "true";

    if (!owner) {
        return res.status(400).send("Invalid Params.");
    }

    exports.getContract(req).methods.getContracts(owner).call({from: exports.getMainAddress(req.session.real)}, async function(err, addressesStr){
        if (err) {
            return res.status(400).send(err.message);
        } else {
            var wills = [];
            if (addressesStr.slice(-1) === ";") addressesStr = addressesStr.substring(0, addressesStr.length -1);
            var adrList = addressesStr.split(";");
            var web3 = exports.getWeb3(req.session.real);

            // For each will contract
            for (let willAddress of adrList) {
                if (willAddress === "") continue;

                var lwContract = new web3.eth.Contract(exports.getWillAbi(req),willAddress);

                // var isOwner = await lwContract.methods.isOwner(owner).call({from: exports.getMainAddress(req.session.real)});
                var isOwner = true;
                var balance = web3.utils.fromWei(await lwContract.methods.getBalance().call({from: exports.getMainAddress(req.session.real)}), 'ether');
                balance = parseFloat(balance).toFixed(5);
                var witnesses = await lwContract.methods.getWitnesses().call({from: exports.getMainAddress(req.session.real)});
                var data = await lwContract.methods.getHeirs().call({from: exports.getMainAddress(req.session.real)});
                var status = await lwContract.methods.getStatus().call({from: exports.getMainAddress(req.session.real)});

                var heirsStr = data[0];
                var percentStr = data[1];

                if (heirsStr.slice(-1) === ";") heirsStr = heirsStr.substring(0, heirsStr.length -1);
                if (percentStr.slice(-1) === ";") percentStr = percentStr.substring(0, percentStr.length -1);

                var heirsList = heirsStr.split(";");
                var percentList = percentStr.split(";");

                var heirs = [];
                for (var i in heirsList) {
                    heirs.push({
                        address: heirsList[i],
                        percentage: parseInt(percentList[i])/1000.0,
                    });
                }

                //Witnesses
                var listWitness = [];
                var witnessesList = witnesses.split(";");
                for (var i in witnessesList) {
                    listWitness.push({
                        address: witnessesList[i],
                    });
                }


                wills.push({address: willAddress, owner: isOwner, heirs: heirs, balance: balance, witnesses: listWitness, ownerAddress: owner, status: parseInt(status)});
            }
            return res.status(200).json(wills);
        }
    });
};

/**
 * Get Last Will Contract Address
 */
exports.getLastWillContract = function (owner,req) {
    return new Promise(async function (resolve, reject) {
        var contract = exports.getContract(req);
        var mainAddress = exports.getMainAddress(req.session.real);
        contract.methods.getContracts(owner).call({from: mainAddress}, function (err, addressesStr) {
            if (err) return reject(err);

            // Empty
            if (addressesStr === "") {
                return resolve(null);
            }

            // Get Last
            if (addressesStr.slice(-1) === ";") {
                addressesStr = addressesStr.substring(0, addressesStr.length -1);
            }
            var addresses = addressesStr.split(";");
            return resolve(addresses[addresses.length -1]);
        });
    });
};

/**
 * Send Transaction
 */
exports.sendTransaction = function (functionName, parameters, options) {
    return new Promise(async function (resolve, reject) {
        try {
            // Check input
            if (!options.from || !options.privateKey) {
                reject(false);
            }
            var web3 = exports.getWeb3(options.req.session.real);

            // Get data by params
            if (parameters === null) {
                parameters = [];
            }
            var contract = exports.getContract(options.req);
            var data = contract.methods[functionName].apply(null, parameters).encodeABI();

            // Sign transaction
            var privateKey = new Buffer(options.privateKey, 'hex');
            if (options.privateKey.startsWith("0x")) {
                privateKey = new Buffer(options.privateKey.slice(2), 'hex');
            }
            var nonce = await web3.eth.getTransactionCount(options.from);
            var rawTx = {
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(1000000000), // 1GWei
                gasLimit: web3.utils.toHex(2000000),
                to: contract._address,
                value: 0x00,
                data: data
            };
            var tx = new EthereumTx(rawTx);
            tx.sign(privateKey);

            // Get Last contract address
            var lastWillAddress = await exports.getLastWillContract(parameters[0],options.req);

            // Send transaction
            var serializedTx = tx.serialize();
            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('confirmation', async function (number, receipt){
                var currentLastWillAddress = await exports.getLastWillContract(parameters[0],options.req);
                if (lastWillAddress !== currentLastWillAddress) {
                    return resolve(currentLastWillAddress);
                }
                if (number === 24) {
                    return resolve(null);
                }
            }).on('error', function (err, receipt){
                console.error(err);
                reject(false);
            });


        } catch (e) {
            console.error(e);
            reject(false);
        }
    });
};