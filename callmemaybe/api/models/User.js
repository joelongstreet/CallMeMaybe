/*---------------------
    :: User
    -> model
---------------------*/
module.exports = {

    attributes  : {

        email: 'STRING',
        password: 'STRING',
        phone: {
            type: 'STRING',
            defaultValue: '555-555-5555'
        }

        // email: 'STRING',
        // phone: 'SRING',
        // password: 'STRING',
        // sessionPair: {
        //  type: 'STRING',
        //  defaultValue: '1234'
        // }
        
    }

};