var appAccounts = require('../data/store.js').appAccounts;
var twilioSession = require('../controllers/session');
var _ = require('underscore');
var request = require('request');
var passport = require('passport');
var db = require('../config/dbschema');
var mailbox = require('../routes/mailbox');

//render new user view
exports.getnewuser = function(req, res){  
  res.render('createuser', { title: 'New user for call me... maybe?' });
};

//create new user from post data
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

//render home page
exports.home = function(req, res){ 
  if (!req.user.contextioAccountId) {
    res.redirect('/user/connect');
  } 
  else {
    request('http://api.jambase.com/events?artistId=50077&page=0&api_key=TFT7JTWUN9C22H4VFZSBYBUQ', function(err, r, body){
      if(body.indexOf('403 Developer Over Rate') != -1){
        res.render('home', { title: 'My Preferences',  carlieInfo : { Events : []}});
      } else{
        res.render('home', { title: 'My Preferences',  carlieInfo : JSON.parse(body) });
      }
    });
  }
};

//render login page
exports.getlogin = function(req, res) {
  res.render('login', { user: req.user, message: req.session.messages });
};

//authenticate user from login post data
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
      return res.redirect('/');
    });
  })(req, res, next);
};

//invalidate current user session
exports.logout = function(req, res) {
  req.logout();
  res.redirect('/login');
};

//get the current session from either phone or browser
exports.userSession = function(req, res, next) {
  //see if we already have a twilio phone session created
  try {
    var userSession = twilioSession.getByCallSid(req.body.CallSid);
    if (typeof userSession.accountId !== 'undefined' && userSession.accountId !== null) {
      req.session.userSession = userSession;
      next();
    }
  }
  catch (e) {}
  
  //see if we already have a web browser session created
  try {
    if (typeof req.session.user == 'undefined' || req.session.user == null) {
      req.session.user = {phone:req.user.phone, accountId:req.user.contextioAccountId, currentMessage:0};
    }
    req.session.userSession = req.session.user;
    next();
  }
  catch (e) {}
  
  /*
   *Not sure if we can do this yet.  Requires a phone # to be associated to only one account 
  //if the request has a valid phone number and callsid, we're receiving an incoming call so try to create a session
  try {
    //if we have an incoming call phone number...
    //TODO do we need more validation that the call is real before giving it access to a mailbox?
    if (typeof req.body.From !== 'undefined' && req.body.From !== null) {
      //see if we have an account for that phone number
      var account = db.users.find({phone:req.body.From.replace('+','')});
      if (typeof account !== 'undefined' && account !== null) {
        twilioSession.create({callSid: req.body.CallSid, accountId: appAccount.contextioMailboxId});
        req.session.userSession = twilioSession.getByCallSid(req.body.CallSid);
        next();
      }
    }
  }
  catch (e) {}
  */
}