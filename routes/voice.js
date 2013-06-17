var twilio  = require('twilio');
var twilioAPIKey = process.env.TWILIO_KEY;
var twilioAPIToken = process.env.TWILIO_TOKEN;
var twilioFrom = '+' + process.env.TWILIO_FROM;

// singleton client for this route
var twilioClient  = new twilio.RestClient(twilioAPIKey, twilioAPIToken);

function Voice () {
    
    var personas = {
        'MAN' : {
            language: 'en-us',
            gender: 'male'
        },
        'WOMAN' : {
            language: 'en-us',
            gender: 'female'
        }
    };

    var Voice = function(options){
        this.persona    = personas[ options.gender || 'MAN' ];
    };

    Voice.prototype.gotoRoute = function (req, res) {
        route = req.params;
        this.host = 'http://'+req.host+'/voice';

        if (req.params.length < 1) {
            return this['messageAction'](req, res);
        } else {
            try {
                //console.log(route, this)
                return this[req.params[0]](req, res);
            } catch (e) {
                //console.log('OH SHIT', e);
                res.send({'oh shit': e.message});
            }
        }
        return this;
    };

    Voice.prototype.messageAction = function (req, res) {
        console.log('messageAction function', this);

        var _this = this;
        var doc = new twilio.TwimlResponse();

        doc.gather({
            action      : _this.host,
            finishOnKey : '1234567890#*',
            numDigits   : '1',
            timeout     : 3
        }, function() {
            var options = _this.persona;
            this.say(options, 'message Action options page');
        }).redirect(this.host+'/messageActionHandle');

        res.type('text/xml');
        res.send(doc.toString());
    };

    Voice.prototype.messageActionHandle = function (req, res) {
        console.log('messageActionHandle function');
        //console.log(req.body)
        var _this   = this;
        var doc     = new twilio.TwimlResponse();
        //console.log(req)
        //var body    = JSON.parse(req.body);
        if(typeof body.Digits === "undefined");
            return res.send({'ohnoes': 'no digits dawg'});
        // switch(body.Digits){
        //     case '1': 
        //         console.log(1);
        //         break;
        //     case '2':
        //         console.log(2);
        //         break;
        //     case '3':
        //         console.log(3);
        //         break;
        //     default: break;
        // }

        res.send('messageActionHandle');
    };

    Voice.prototype.listAction = function (req, res) {
        res.send('listAction');
    };

    return Voice;
}

module.exports = Voice();