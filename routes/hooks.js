var appAccounts       = require('../data/store.js').appAccounts;
var twilio            = require('twilio');
var contextio         = require('contextio');
var _                 = require('underscore');

var appAccounts       = require('../data/store.js').appAccounts;
var twilioSession     = require('../controllers/session');

var contextAPIKey     = process.env.contextAPIKey;
var contextAPISecret  = process.env.contextAPISecret;
var contextMailboxId  = process.env.contextMailboxId;
var twilioAPIKey      = process.env.TWILIO_KEY;
var twilioAPIToken    = process.env.TWILIO_TOKEN;
var twilioFrom        = '+' + process.env.TWILIO_FROM;

var contextClient     = new contextio.Client({key: contextAPIKey, secret: contextAPISecret}); //connect to contextio api account
var twilioClient      = new twilio.RestClient(twilioAPIKey, twilioAPIToken);


exports.create = function(req, res){
  var sess = req.sess;
  req.query.callback_url      = 'http://' + req.host + '/hook/reveal?accountId=' + sess.accountId;
  req.query.failure_notif_url = 'http://' + req.host + '/error';
  req.query.sync_period       = 'immediate';

  contextClient.accounts(sess.accountId).webhooks().post(req.query, function(err, body){
    if(err) { console.log(err); }
    else {
      res.send({hookId : body.body.webhook_id, poop : true });
    }
  });
};


exports.deleteMe = function(req, res){
  console.log('getting ready to delete ' + req.params.hookId);
  contextClient.accounts(req.sess.accountId).webhooks(req.params.hookId).delete(function(err, body){
    if(err){
      res.send({ error : true });
    }
    else{
      res.send({ success : true });  
    }
  });
};


exports.reveal = function(req, res){
  var accountId = req.query.accountId;
  var messageId = req.body.message_data.message_id;
  var url       = 'http://' + req.host + '/message/id/' + messageId + '?accountId=' + accountId;
  var account   = _.findWhere(appAccounts, {contextioMailboxId : accountId });
  var phoneNum  = account.phone;

  twilioClient.makeCall({to:phoneNum, from:twilioFrom, url:url}, function(err, call) {
      if (err) console.log(err);
      else{
        twilioSession.create({callSid: call.sid, accountId:accountId});
        console.log('calling ' + phoneNum + ' at ' + call.dateCreated);
      }
  });
};
