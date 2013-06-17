
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.faq = function(req, res){  
    res.render('faq', { title: 'Call Me... maybe?' });
};

exports.callme = function(req, res){  
    res.render('callme', { title: 'Call Me... maybe?' });
};
