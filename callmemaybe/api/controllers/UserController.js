/*---------------------
    :: Users
    -> controller
---------------------*/
//var appAccounts = require('../data/store.js').appAccounts;
//var twilioSession = require('../controllers/session');
var _           = require('underscore');
var request     = require('request');
var jambasekey = process.env.JAMBASE_KEY;
function getJambase(endpoint, opts, callback){
    var url = [
        'http://api.jambase.com/',
        endpoint,
        '?artistId='+opts.id,
        '&page=0',
        '&api_key='+jambasekey].join('');

    request(url, callback);
}

var UserController = {

    toggleEmail: function(){

    },

    setHook: function(){

    },

    home: function (req, res) {

        getJambase('events', { id: 50077 }, function(err, r, body){
            var options = {
                title       : 'My Preferences',
                carlieInfo  : { Events : [] },
                user        : req.session.user
            };

            if(body.indexOf('403 Developer Over Rate') === -1){
                options.carlieInfo = JSON.parse(body);
            }

            res.render('user/home', options);
        });
    }

};
module.exports = UserController;