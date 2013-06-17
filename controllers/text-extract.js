/**
 * Install dependencies :
 *      npm install alchemy-api async
 * Also, ensure you've exported your alchemy api key:
 *      export ALCHEMYAPI_KEY=<your-key-here>
**/

var request = require('request'),
    key     = process.env.ALCHEMYAPI_KEY,
    url     = 'http://access.alchemyapi.com/calls/html/HTMLGetRawText?apikey='+key+'&outputMode=json&html=';

//{{URL}}/html/HTMLGetRawText?apikey={{apikey}}&outputMode={{outputMode}}&html=

module.exports = function analyze(input, callback){
    request.post(url+encodeURI(input), callback);
};
