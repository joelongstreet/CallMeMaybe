var session = require('../controllers/session');
session.create({accountId : 1, callSid : 123});

console.log(session.getByCallSid(123));
console.log(session.getByAccountId(1));