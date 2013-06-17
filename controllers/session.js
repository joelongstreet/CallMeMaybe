var _           = require('underscore');
var user        = require('./user');
var sessions    = [];

exports.create = function(opts){

    var accountId = null;
    if(opts.accountId){
        accountId = opts.accountId;
    } else if(opts.phone){
        user.getAccountByPhone(opts.phone);
    }

    var session = {
        callSid         : opts.callSid,
        accountId       : accountId,
        currentMessage  : 0,
        hooks           : []
    };

    sessions.push(session);

    return session;
};


exports.delete = function(callSid){
    var session = _.findWhere(sessions, {callSid : callSid});
    return sessions.splice(session, 1);
};


exports.getByCallSid = function(callSid){
    return _.findWhere(sessions, {callSid : callSid});
};


exports.getByAccountId = function(accountId){
    return _.findWhere(sessions, {accountId : accountId});
};


exports.addHook = function(accountId, hookId){
    var session = _.findWhere(sessions, {accountId : accountId});
    if(session){
        session.hooks.push(hookId);
        return session
    }
};


exports.deleteHook = function(accountId, hookId){
    var session = _.findWhere(sessions, {accountId : accountId});
    session.hooks.splice(hookId, 1);
    return session;
};