
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
var web3 = new Web3(new Web3.providers.HttpProvider(Config.provider));
web3.eth.personal = new Web3EthPersonal(Config.provider);

var Production = false;
var urlContractBacktolifeLocal = "../contractBackToLife.json";
var urlContractHierarchyLocal = "../contractMyWill.json";
var urlContractBacktolifeTest = "../Production/Ropsten/contractBackToLife.json";
var urlContractHierarchyTest = "../Production/Ropsten/contractMyWill.json";
var urlContractBacktolifeReal = "../Production/Main/contractBackToLife.json";
var urlContractHierarchyReal = "../Production/Main/contractMyWill.json";

exports.getContractBacktoLife = function(real) {
    if (real) {
        return Production ? urlContractBacktolifeReal : urlContractBacktolifeTest;
    } else {
        return Production ? urlContractBacktolifeTest : urlContractBacktolifeLocal;
    }
}

exports.getContractMywill = function(real) {
    if (real) {
        return Production ? urlContractHierarchyReal : urlContractHierarchyTest;
    } else {
        return Production ? urlContractHierarchyTest : urlContractHierarchyLocal;
    }
}

// Read contract info
FileSystem.readFile(exports.getContractBacktoLife(false), 'utf8', function (err,data) {
    if (err) console.log(err);
    var config = JSON.parse(data);
    var abi = config.abi;
    var contractAddress = config.address;
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
    var baseContract = FileSystem.readFileSync(exports.getContractBacktoLife(false));
    if (!baseContract) return res.redirect("/error");
    var hierarchyContract = FileSystem.readFileSync(exports.getContractMywill(false));
    if (!hierarchyContract) return res.redirect("/error");
    var baseContractReal = FileSystem.readFileSync(exports.getContractBacktoLife(true));
    if (!baseContractReal) return res.redirect("/error");
    var hierarchyContractReal = FileSystem.readFileSync(exports.getContractMywill(true));
    if (!hierarchyContractReal) return res.redirect("/error");
    res.locals.contracts = {
        base: JSON.parse(baseContract),
        hierarchy: JSON.parse(hierarchyContract),
        baseReal: JSON.parse(baseContractReal),
        hierarchyReal: JSON.parse(hierarchyContractReal),
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

    if(recaptcha === undefined || recaptcha === '' || recaptcha === null) {
        return res.status(400).send("Please select captcha.");
    }

    if (!owner || !heirs || !percentages || !witnesses) {
        return res.status(400).send("Invalid Params.");
    }


    // Ether for witnesses
    var value = witnesses.split(";").length * 0.001;

    // Demo ether for the smart contract
    value = value + 0.1;

    // recaptcha
    var secretKey = "6LffzGAUAAAAAGxQl-J2mnFZqVkpQb6-AglNclxv";
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + recaptcha + "&remoteip=" + req.connection.remoteAddress;

    request(verificationUrl,function(error,response,body) {
        body = JSON.parse(body);
        // Success will be true or false depending upon captcha validation.
        if(body.success !== undefined && !body.success) {
            return res.status(400).send("Failed captcha verification");
        }

        return exports.sendTransaction('createLastWill', [owner,heirs,percentages,witnesses], {privateKey: Config.mainPrivateKey, from: Config.mainAddress, value: value.toString(), req: req}).then(function(lastWillAddress){
            return res.status(200).send(lastWillAddress);
        }).catch(function(err){
            return res.status(400).send(err.message);
        });

    });



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

    exports.getContract(req).methods.getContracts(owner).call({from: Config.mainAddress}, async function(err, addressesStr){
        if (err) {
            return res.status(400).send(err.message);
        } else {
            var wills = [];
            if (addressesStr.slice(-1) === ";") addressesStr = addressesStr.substring(0, addressesStr.length -1);
            var adrList = addressesStr.split(";");

            // For each will contract
            for (let willAddress of adrList) {
                if (willAddress === "") continue;

                var lwContract = new web3.eth.Contract(exports.getWillAbi(req),willAddress);

                // var isOwner = await lwContract.methods.isOwner(owner).call({from: Config.mainAddress});
                var isOwner = true;
                var balance = web3.utils.fromWei(await lwContract.methods.getBalance().call({from: Config.mainAddress}), 'ether');
                var witnesses = await lwContract.methods.getWitnesses().call({from: Config.mainAddress});
                var data = await lwContract.methods.getHeirs().call({from: Config.mainAddress});

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


                wills.push({address: willAddress, owner: isOwner, heirs: heirs, balance: balance, witnesses: listWitness});
            }
            return res.status(200).json(wills);
        }
    });
};

/**
 * Get Last Will Contract Address
 */
exports.getLastWillContract = function (owner,contract) {
    return new Promise(async function (resolve, reject) {
        contract.methods.getContracts(owner).call({from: Config.mainAddress}, function (err, addressesStr) {
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
            var value = "0x00";
            if (options.value) {
                value = web3.utils.toHex( web3.utils.toWei(options.value, 'ether') );
            }

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
            var lastWillAddress = await exports.getLastWillContract(parameters[0],contract);

            // Send transaction
            var serializedTx = tx.serialize();
            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('confirmation', async function (number, receipt){
                var currentLastWillAddress = await exports.getLastWillContract(parameters[0],contract);
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