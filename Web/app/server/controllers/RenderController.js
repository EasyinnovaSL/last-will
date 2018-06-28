
var Config = require('../config/config');
var nodemailer = require('nodemailer');
var Mustache = require('mustache');
var fs = require('fs');
/**
 * Render pages
 */

exports.renderHome = function (req, res) {
    return res.render('index');
};
exports.renderMyWills = function (req, res) {
    return res.render('hierarchy/my-ethereum-will.html');
};
exports.renderRequirements = function(req,res){
    return res.render('hierarchy/requirements');
};
exports.renderWitness = function(req,res){
    return res.render('hierarchy/witness',{pk:req.query.pk, will:req.query.will});
};
exports.renderHeir = function(req,res){
    return res.render('hierarchy/heir-detail',{pk: req.query.pk, will: req.query.will});
};
exports.renderAboutUs = function (req, res) {
    return res.render('hierarchy/about-us');
};
exports.renderContactUs = function (req, res) {
    return res.render('hierarchy/contact-us');
};

exports.sendMail = function (req, res) {
    var email= req.body.email;
    var myWill= req.body.will;


    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: Config.email.user,
            pass: Config.email.password
        }
    });






    fs.readFile('./app/server/views/email/my-will-email.html', function (err, data) {
        if (err) throw err;
        var output = Mustache.render(data.toString(), myWill);

        var mailOptions = {
            from:  Config.email.address,
            to: email,
            subject: 'Last will',
          //  text: 'That was easy!',
            html: output
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                return res.status(400).send(error.message);
            } else {

                return res.status(200).json([]);
            }
        });
    });




};

/**
 * Load Configuration
 */
exports.renderConfiguration = function (req, res, next) {
    res.locals.Config = {
        provider: Config.provider
    };
    next();
};
