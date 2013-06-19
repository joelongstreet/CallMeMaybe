/*---------------------
	:: Main 
	-> controller
---------------------*/

var MainController = {

    index: function (req, res) {
        res.view();
    },

    faq: function(req, res){
        res.view();
    },

    logout: function(req, res){
        if(req.session.authenticated){
            req.session.destroy();
        }
        req.flash('info', 'You have been logged out.');
        res.redirect('/login');
    },

    signup: function (req, res) {
        res.view();
    },

    signupAction: function (req, res) {
        var email    = req.param('email'),
            password = req.param('password'),
            phone    = req.param('phone');

        User.findByEmail(email, function (err, usr){
            if (err) {
                res.send(500, { error: 'DB Error' });
            } else if (usr) {
                res.send(400, { error: 'Username already Taken' });
            } else {
                var hasher = require('password-hash'),
                    newuser = { 
                        email   : email, 
                        password: hasher.generate(password),
                        phone   : phone
                    };

                User.create(newuser).done(function (error, user) {
                    if (error) {
                        res.send(500, {error: 'DB Error'});
                    } else {
                        req.session.user = user;
                        req.session.authenticated = true;
                        req.session.save(function(err){
                            if(err) throw err;
                            res.send(usr);
                        });
                    }
                });
            }
        });
    },

    login: function (req, res) {
        var locals = { };
        if (typeof req.flash('info') !== 'undefined' && req.flash('info') !== ''){
            locals.flash = { notice: req.flash('info') };
        }
        res.view('main/login', { locals: locals });
    },

    loginAction: function (req, res) {
        var email = req.param('email');
        var password = req.param('password');
         
        User.findByEmail(email).done(function (err, usr) {
            if (err) {
                res.send(500, { error: 'DB Error' });
            } else {
                if (usr) {
                    var hasher = require('password-hash');
                    if (hasher.verify(password, usr.password)) {
                        req.session.user = usr;
                        req.session.authenticated = true;
                        req.session.save(function(err){
                            if(err) throw err;

                            if( req.isAjax || req.isJson || req.isSocket ){
                                res.redirect('/home');
                            } else {
                                res.send(usr);
                            }
                        });
                    } else {
                        if( req.isAjax || req.isJson || req.isSocket ){
                            res.send(400, { error: 'Wrong Password' });
                        } else {
                            req.flash('info', 'Wrong Password');
                            res.redirect('/login');
                        }
                    }
                } else {
                    res.send(404, { error: 'User not Found' });
                }
            }
        });
    }
};

module.exports = MainController;   