var appAccounts = require('../data/store.js').appAccounts;
var twilioSession = require('../controllers/session');
var _ = require('underscore');
var request = require('request');
var passport = require('passport');
var db = require('../config/dbschema');

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

exports.postnewuser = function(req, res) {
  console.log(req);
  var account = new db.userModel({ 
    email: req.body.email
    , password: req.body.password
    , phone: req.body.phone 
  });

  account.save(function(err) {
    if(err) {
      console.log('Error: ' + err);
    } else {
      console.log('saved user: ' + account.email);
    }
  });
  return res.redirect('login');
}

exports.login = function(req, res){  
    res.render('login', { title: 'Log in' });
};

exports.home = function(req, res){ 
  console.log(req.user);
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

exports.postlogin = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.session.messages =  [info.message];
      console.log(info.message);
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/user/home');
    });
  })(req, res, next);
};

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/login');
};