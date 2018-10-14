const auth = require('basic-auth');
const {User} = require('../models/user'); 

function authLogin(req, res, next) {
	//get credentials from header
	var credentials = auth (req);
	//check the credentials against the database
	if (!credentials) {
		var err = new Error("You must enter your username and password.");
		err.status = 401;
		next(err);
	} else {
        //Use the authenticate static method you built on the user schema to check the credentials against the database
		User.userAuthentication(credentials.name, credentials.pass, function(err, user) {
			if (err || !user) {
				var error = new Error("Username and password incorrect, please retry!");
				res.status = 401;
				next(err);
			} else {
				req.user = user;
				next();
			}
		});
	}	
}

module.exports.authLogin = authLogin;