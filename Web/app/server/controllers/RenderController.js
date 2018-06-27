
var Config = require('../config/config');
var nodemailer = require('nodemailer');
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
    var will= req.body.email;


    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: Config.email.user,
            pass: Config.email.password
        }
    });

    var mailOptions = {
        from:  Config.email.address,
        to: email,
        subject: 'Last will',
        text: 'That was easy!'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
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
