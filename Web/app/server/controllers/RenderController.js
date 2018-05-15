
/**
 * Render home
 */

exports.renderHome = function (req, res) {
    return res.render('index', {header: false});
};
exports.renderMyWills = function (req, res) {
    return res.render('hierarchy/my-ethereum-will.html');
};
exports.renderRequirements = function(req,res){
    return res.render('hierarchy/requirements');
};

