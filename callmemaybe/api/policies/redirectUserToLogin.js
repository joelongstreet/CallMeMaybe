module.exports = function (req, res, next) {
    console.log("redirectUserToLogin policy", req.session);
    if (req.session.authenticated) {
        res.redirect('/home');
    } else {
        next();
    }
};