var _           = require('underscore');
var users       = [
    {
        accountId : 1,
        emailAddress : 'joelongstreet@gmail.com',
        phones : [123, 456]
    },
    {
        accountId : 2,
        emailAddress : 'user@gmail.com',
        phones : [123, 456]
    },
    {
        accountId : process.env.contextMailboxId
    }
];

exports.getByAccountId = function(id){
    return _.findWhere(users, {accountId : id});
};

exports.getAccountByPhone = function(phone){
    var user = {};
    for(var i=0; i<users.length; i++){
        if(users.indexOf(phone) != -1) {
            return users[i];
        };
    };
};