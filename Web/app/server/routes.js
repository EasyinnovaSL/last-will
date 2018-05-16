var RenderController = require('./controllers/RenderController');
var ContractsController = require('./controllers/ContractsController');

module.exports = function (app) {

    // Well known acme challenge
    app.get('/.well-known/acme-challenge/:hash', function (req,res){
        res.status(200).send(FileSystem.readFileSync('../.well-known/acme-challenge/'+req.params.hash));
    });

    // Home
    app.get('/', ContractsController.getContractsInfo, RenderController.renderHome);

    // Error meta mask
    app.get('/requirements', RenderController.renderRequirements);

// Meta Mask must be installed
    app.use('*', ContractsController.getContractsInfo, ContractsController.checkMetaMask);

    // Render hierarchy contracts list
    app.get('/my-wills', RenderController.renderMyWills);

    // Render witness link
    app.get('/witness', RenderController.renderWitness);

    // Render heir link
    app.get('/heir', RenderController.renderHeir);

    //Render heir-detail
    app.get('/heir-detail', RenderController.heirDetail);

    // Error fallback //
    // app.get('*', RenderController.renderError);

};