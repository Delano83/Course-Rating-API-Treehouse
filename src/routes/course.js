"use-strict";

const express = require("express");
const router = express.Router();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const mid = require('../middleware/authentication'); 
const {Course} = require('./../models/course');
const {Review} = require('./../models/review');

router.use(bodyParser.json());


// GET /api/courses 200 - Returns the Course "_id" and "title" properties
router.get('/', function(req, res, next) {
	Course.find({}, 'title _id', function(err, courses) {
		if (err) {
			err.status = 400 
			return next(err);
		}
		res.send(courses);
	});
})

// GET /api/course/:courseId 200 - Returns all Course properties and related documents for the provided course ID
// When returning a single course for the GET /api/courses/:courseId route, use Mongoose population to load the related user and reviews documents.
router.get('/:courseId', function(req, res, next) {
	Course.findOne({
		_id: req.params.courseId
	}, function(err, course) {
			if (err) {
				return next(err); 
			}
		res.send(course);
	});
})

//function(err,obj) { console.log(obj); });

//POST /api/courses 201 - Creates a course, sets the Location header, and returns no content
router.post('/', mid.authLogin, function(req, res, next) {
	var course = new Course(req.body);

	course.save(function(err, course) {
		if (err) {
			res.status(400);
			return next(err);
		} else {
			res.location('/');
			res.status(201).json();
		}
	});
})

// PUT /api/courses/:courseId 204 - Updates a course and returns no content
router.put('/:courseId', mid.authLogin, function(req, res, next) {
	Course.findByIdAndUpdate(req.params.courseId, {$set:req.body}, {new: true}, function(err, course) {
		if (err) {
            res.status(400);
			return next(err);
		}
		res.status(204).json();
	});
})


//POST /api/courses/:courseId/reviews 201 - Creates a review for the specified course ID, sets the Location header to the related course, and returns no content
router.post('/:courseId/reviews', mid.authLogin, function(req, res, next) {
	Course.findById(req.params.courseId)
		.populate('user')
		.exec(function(err, course) {
			if (err) {
				return next(err);
			}

	var newReview = new Review(req.body);
	course.reviews.push(newReview);

	newReview.save(function(err){
        if (err) {
			return next(err);
		}
    });

	course.save(function(err){
		if (err) {
			return next(err);
		}
	});

	res.location('/' + req.params.courseId)
	.status(201).json();
	});
})

module.exports = router;

