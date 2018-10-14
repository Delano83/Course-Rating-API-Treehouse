const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

//User Schema
var UserSchema = new mongoose.Schema ({
	fullName: {
		type: String, 
		required: true,
        trim: true
	},
	emailAddress: {
		type: String, 
		required: true, 
		unique: true, 
		trim: true,
		validate: {
			validator: validator.isEmail, 
			isAsync: false, 
			message: 'Not a valid email.'
		}
	},
	password: {
		type: String,
		required: true
	} 
})

//Method that will attempt find a match to a set of credentials in the Mongo database
UserSchema.statics.userAuthentication = function(email, password, callback) {
	var User = this;

	User.findOne({emailAddress: email}, function(err, user) {
		if (err){
			return callback(err);
		} else if (!user) {
			return new Error("User not found.");
		}

		bcrypt.compare(password, user.password, function(err, res) {
			if (res === true) {
				return callback(null, user);
			} else {
				return callback(err);
			}
		});
	});
}

//Store the password as hashed value in the User model
UserSchema.pre('save', function(next) {
	var User = this;

	bcrypt.hash(User.password, 10, function(err, hash) {
		if (err) {
			return next(err);
		}
		
		User.password = hash;
		next(); 
		});
	}
)

var User = mongoose.model('User', UserSchema);
module.exports = {User};









