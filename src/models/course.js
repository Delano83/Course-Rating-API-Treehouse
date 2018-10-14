const mongoose = require("mongoose");

//Course Schema
var CourseSchema = new mongoose.Schema ({
	user: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User'
	},
	title: {
		type: String, 
		required: true,
		trim: true
	},
	description: {
		type: String, 
		required: true
	},
	estimatedTime: {
		type: String
	},
	materialsNeeded: {
		type: String
	},
	steps: [{
		stepNumber: Number, 
		title: {
			type: String, 
			required: true
		}, 
		description: {
			type: String,
			required: true
		}
	}],
	reviews: [{
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Reviews'
	}]
});

var Course = mongoose.model('Course', CourseSchema);

module.exports = {Course};