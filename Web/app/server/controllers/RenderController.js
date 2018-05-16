
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
exports.heirDetail = function(req,res){
    return res.render('hierarchy/heir-detail');
};

exports.renderWitness = function(req,res){
    return res.render('hierarchy/witness',{pk:req.query.pk, will:req.query.will});
};
exports.renderHeir = function(req,res){
    return res.render('hierarchy/heir');
};