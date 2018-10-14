const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const mid = require('../middleware/authentication'); 
const {User} = require('./../models/user');

router.use(bodyParser.json());

// GET /api/users 200 - Returns the currently authenticated user
router.get('/', mid.authLogin, function(req, res) {

	res.send(req.user).json();
})


//POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post('/', function(req, res, next) {
	var user = {
		fullName: req.body.fullName,
		emailAddress: req.body.emailAddress,
		password: req.body.password
	};

	User.create(user, (err, user) => {
		if (err) {
			res.status(400);
			return next(err);
		} else {
			res.location('/')
			.status(201).json();
		}
	});
})

module.exports = router;