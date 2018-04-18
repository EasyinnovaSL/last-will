
var RenderController = require('./controllers/RenderController');

module.exports = function (app) {

    // Home
    app.get('/', RenderController.renderHome);

    // Error fallback //
    // app.get('*', RenderController.renderError);

};