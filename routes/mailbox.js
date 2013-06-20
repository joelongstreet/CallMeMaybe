//modules
var twilio  = require('twilio');
var contextio = require('contextio');
var twilioSession = require('../controllers/session');
var textExtract = require('../controllers/text-extract.js');
var _ = require('underscore');
var db = require('../config/dbschema');

//variables
var contextAPIKey = process.env.contextAPIKey;
var contextAPISecret = process.env.contextAPISecret;
var twilioAPIKey = process.env.TWILIO_KEY;
var twilioAPIToken = process.env.TWILIO_TOKEN;
var twilioFrom = '+' + process.env.TWILIO_FROM;
// Create API Clients
var contextClient = new contextio.Client({key: contextAPIKey, secret: contextAPISecret}); //connect to contextio api account
var twilioClient  = new twilio.RestClient(twilioAPIKey, twilioAPIToken);

//call a specified number and read latest emails from associated mailbox
exports.call = function(req, res) {
  twilioClient.makeCall({to:'+'+req.sess.phone, from:twilioFrom, url:'http://' + req.host + '/message/next'}, function(err, call) {
    if (err) console.log(err);    
    console.log('This call\'s unique ID is: ' + call.sid);
    console.log('This call was created at: ' + call.dateCreated);

    twilioSession.create({callSid: call.sid, accountId:req.sess.accountId});
  });
  res.end('calling out to ' + req.sess.phone + '...');
};

//build and return a twiml of an email message
exports.message = function(req, res) {
  sess = req.sess;
  var opts = {limit:1, include_body:1, folder:'INBOX'};
  var accountId = req.sess.accountId;

  if (req.params.messageid) { //if a messageid param was passed...
    contextClient.accounts(accountId).messages(req.params.messageid).get(opts, function(err, response) {
      if (err) throw err;
      createDocument(response.body, 'http://' + req.host + '/message', res, req);  
    });
  }
  else { //else just get the first message
    contextClient.accounts(accountId).messages().get(opts, function(err, response) {
      if (err) throw err;
      createDocument(response.body[0], 'http://' + req.host + '/message', res, req);  
    });
  }
}

//build and return the next email message. "next" is determined by the currentMessage index of the call twilioSession
exports.nextmessage = function(req, res) {
  var sess = req.sess;
  console.log(req.sess);
  var opts = {limit:1, offset:0, include_body:1, folder:'INBOX'};
  var accountId = sess.accountId;
  opts.offset = sess.currentMessage;
  sess.currentMessage++;
  contextClient.accounts(accountId).messages().get(opts, function(err, response) {
    if (err) throw err;
    createDocument(response.body[0], 'http://' + req.host + '/message/next', res, req);  
  }); 
}

var createDocument = function(message, redirect, res, req) {
  //prepare body text
  var body = _.findWhere(message.body, {type:'text/html'});
  if (typeof(body) == 'undefined') {
    body = message.body[0];
  }
  try { body = body.content; } 
  catch (e) { body = ''; }
  body = body.replace('\n', '');
  body = body.replace('\r', '');
  // clean html tags from body text
  textExtract(body, function(err, extractResult) {
    if (err) throw err;
    try {
        body = (JSON.parse(extractResult.body)).text;
    } catch (e) { }
    //build twiml doc
    var doc = new twilio.TwimlResponse();
    var options = {voice:'woman', loop : 1};

    doc.gather({
        action      : 'http://' + req.host + '/message/next',
        finishOnKey : '1234567890#*',
        numDigits   : '1',
        timeout     : 64000000
    }, function() {
        this.say(options, 'Message from ' + message.addresses.from.name)
          .say(options, 'With subject ' + message.subject)
          .say(options, body)
          .say(options, 'End of message');
    }).redirect(redirect);

    res.writeHead(200, { 'Content-Type' : 'text/xml' });
    res.end(doc.toString());
  });
}

/* this is supposed to give me unread counts but isn't.  come back later
contextClient.accounts(contextMailboxId).sources('0').folders().messages().get({include_extended_counts:1}, function (err, res) {
  console.log(res);
  console.log(err);
});
*/

//connect a contextio acccount to a user account
exports.connect = function(req, res) {
  if (!req.query.contextio_token) {
    var opts = {
      callback_url: 'http://' + req.headers.host + '/user/connect', 
      email: req.user.email, 
      source_sync_flags: 1
    }
    contextClient.connectTokens().post(opts, function(err, response) {
      if (err) throw err;
      res.render('connect', { user: req.user, connectLink: response.body.browser_redirect_url });
    });
  }
  else {
    contextClient.connectTokens(req.query.contextio_token).get(function(err, response) {
      if (err) throw err; 
      if (response.body.account.id) {
        db.userModel.update({ email: req.user.email }, { contextioAccountId: response.body.account.id }, { multi: false }, function (err, numberAffected, raw) {
          if (err) return handleError(err);
          console.log('The number of updated documents was %d', numberAffected);
          console.log('The raw response from Mongo was ', raw);
        });
      }
      
      res.redirect('/');
    });
  }
}