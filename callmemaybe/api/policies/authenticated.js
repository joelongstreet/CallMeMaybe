/**
* Allow any authenticated user.
*/
module.exports = function (req,res,ok) {
    console.log("woo", req.session);
    console.log()

    // User is allowed, proceed to controller
    if (req.session.authenticated) {
        return ok();
    }

    // User is not allowed
    else {

        if( !(req.isAjax || req.isJson || req.isSocket) ){
            return res.redirect('/login?returnTo='+encodeURI(req.path));
        } else {
            return res.send("You are not permitted to perform a "+req.method+" to this location.", 403);
        }
    }
};