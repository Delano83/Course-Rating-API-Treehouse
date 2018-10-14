'use strict';

const express = require('express');
const morgan = require('morgan');

const mongoose = require('mongoose');

const seeder = require('mongoose-seeder');
const session = require('express-session');

const data = require('./data/data.json');
const Review = require('./models/review');
const Course = require('./models/course');
const User = require('./models/user');

const courseRoutes = require('./routes/course');
const userRoutes = require('./routes/user');

const app = express();

//Using Mongoose, create a connection to your MongoDB database.
mongoose.Promise = global.Promise; //optional
mongoose.connect("mongodb://localhost:27017/CourseRating", {useMongoClient: true});
const port = 3000; //subject to change based on Mongo's settings.

//Write a message to the console if there's an error connecting to the database.
var db = mongoose.connection;
db.on('error', function(err) {
	console.log(err);
});

//Write a message to the console once the connection has been successfully opened.
db.on('open', function() {
	console.log("The database connection has been established successfully");
	    // Seed data when the connection is open
	seeder.seed(data)
	    // The database objects are stored in dbData
	.then(function(dbData) {
		console.log("Yes! The data has been seeded.");
	})
	.catch(function(err) {
		// handle error
		console.log(err);
	});
	console.log("Hoooray! You've successfully connected to the Mongo database.");
});

//set our port
app.set('port', process.env.PORT || 5000);

//Morgan dev package for http request logging
app.use(morgan('dev'));


//include routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

//setup our static route to serve files from the "public" folder
app.use('/', express.static('public'));

//Error Handling
app.use(function(req, res, next) {
	var err = new Error('File Not Found');
	err.status = 404;
	next(err);
});

// Express's global error handler
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.json({
		error: {
			message: err.message
		}
	});
});

// start listening on our port
app.listen(app.get('port'), function() {
	console.log('Express server is listening on port 5000');
});

module.exports = {app};