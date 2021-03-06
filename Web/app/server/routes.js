var RenderController = require('./controllers/RenderController');
var ContractsController = require('./controllers/ContractsController');

module.exports = function (app) {

    // Well known acme challenge
    app.get('/.well-known/acme-challenge/:hash', function (req,res){
        res.status(200).send(FileSystem.readFileSync('../.well-known/acme-challenge/'+req.params.hash));
    });

    // Home
    app.get('/', RenderController.renderHome);

    // Render hierarchy contracts list
    app.get('/my-wills', ContractsController.getContractsInfo, RenderController.renderMyWills);

    // Render witness link
    app.get('/witness', ContractsController.getContractsInfo, RenderController.renderWitness);

    // Render heir link
    app.get('/heir', ContractsController.getContractsInfo, RenderController.renderHeir);

    // Create new Will Contract
    app.post('/will', ContractsController.createWillContract);

    // Create new Will Contract
    app.post('/send-mail', RenderController.sendMail);

    // List my contracts
    app.post('/contracts', ContractsController.getWillContracts);

    // Render About Us
    app.get('/about-us', RenderController.renderAboutUs);

    // Render Contact Us
    app.get('/contact-us', RenderController.renderContactUs);

    // Error fallback //
    // app.get('*', RenderController.renderError);

};