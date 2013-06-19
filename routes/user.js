var appAccounts = require('../data/store.js').appAccounts;
var twilioSession = require('../controllers/session');
var _ = require('underscore');
var request = require('request');
var passport = require('passport');

//fake a user login, just uses phone number - no password
exports.fakeLogin = function(req, res) {
  var filter = {phone : req.params.id};
  if (req.params.id.toString().search(/^-?[0-9]+$/) != 0) {
    filter = {email:req.params.id};
  }
  var appAccount = _.findWhere(appAccounts, filter);
  if (typeof(appAccount) == 'undefined') {
    res.send('Invalid login');
  }
  else {
    req.session.user = {phone:appAccount.phone, accountId:appAccount.contextioMailboxId, currentMessage:0};
    res.send('Logged in as ' + appAccount.email + '<br/><a href="/call">Read me stuff</a><br/><a href="/message/next">Next message TwiML</a>');
  }
}

//get the current session from either phone or browser
var getSession = function(req, res, next) {
  var sess = {accountId:0};
  //see if we have a twilio session
  try {
    sess = twilioSession.getByCallSid(req.body.CallSid);
    if (sess.accountId) {
      req.sess = sess;
      next();
    }
  }
  catch (e) {}
  
  //see if we have an express session
  try {
    sess = req.session.user;
    if (sess.accountId) {
      req.sess = sess;
      next();
    }
  }
  catch (e) {}
  
  //if the request has a valid phone number and callsid...
  try {
    var appAccount = _.findWhere(appAccounts, {phone:req.body.From.replace('+','')});
    if (typeof(appAccount) != 'undefined') {
      twilioSession.create({callSid: req.body.CallSid, accountId: appAccount.contextioMailboxId});
      req.sess = twilioSession.getByCallSid(req.body.CallSid);
      next();
    }
  }
  catch (e) {}
}
exports.getSession = getSession;

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.newuser = function(req, res){  
    res.render('createuser', { title: 'New user for call me... maybe?' });
};

exports.login = function(req, res){  
    res.render('login', { title: 'Log in' });
};

exports.home = function(req, res){  
  request('http://api.jambase.com/events?artistId=50077&page=0&api_key=TFT7JTWUN9C22H4VFZSBYBUQ', function(err, r, body){
    if(body.indexOf('403 Developer Over Rate') != -1){
      res.render('home', { title: 'My Preferences',  carlieInfo : { Events : []}});
    } else{
      res.render('home', { title: 'My Preferences',  carlieInfo : JSON.parse(body) });
    }
    
  });
};

exports.getlogin = function(req, res) {
  res.render('login', { user: req.user, message: req.session.messages });
};


// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
//   
/***** This version has a problem with flash messages
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });
*/
  
// POST /login
//   This is an alternative implementation that uses a custom callback to
//   acheive the same functionality.
exports.postlogin = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.session.messages =  [info.message];
      return res.redirect('/postlogin1')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
};

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};