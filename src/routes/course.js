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
// router.get('/:courseId', function(req, res, next) {
// Course.findOne({
// 		_id: req.params.courseId
// 	})
// 	.populate('user')
// 	.populate('review')
// 	.exec(function(err, course) {
// 		if (err) return next(err);
// 		res.send(course.toJSON( { virtuals: true }));
// 	});
// });
//function(err,obj) { console.log(obj); });

router.get('/:courseId', (req, res, next) => {
	/* Get all course properties and related user and reviews. Use deep population to only select the fullName and id of associated user */
	Course.findOne({ _id: req.params.courseId })
	  .populate([{
		  path: 'user',
		  model: 'User',
		  select: 'fullName _id'
		},
		{
		  path: 'reviews',
		  model: 'Review',
		  populate: {
			path: 'user',
			model: 'User',
			select: 'fullName _id'
		  }
		}
	  ])
	  .exec(function(err, course) {
		if (err) return next(err);
		res.status = 200; // 200 - OK
		res.json(course);
	  })
  });


//POST /api/courses 201 - Creates a course, sets the Location header, and returns no content
router.post('/', mid.authLogin, (req, res, next) => {
	if (req.body.title &&
	  req.body.description &&
	  req.body.user &&
	  req.body.steps) {
  
	  /* Create Course */
	  Course.create(req.body, function(err, course) {
		/* If a Mongoose error occurs, pass it to Express' global error handler with a 400 status code */
		if (err) {
		  if (err.name === 'MongoError' || err.name === "ValidationError") {
			err.status = 400; // 400 - Bad Request
		  }
		  return next(err);
		}
  
		/* Set location header to / and return 201 status */
		res.setHeader('Location', '/');
		res.status(201).send();
	  })
  
	} else {
	  var err = new Error();
	  err.message = 'Title, description, user and steps fields required.';
	  err.status = 401; // 401 - Unauthorized
	  return next(err);
	}
  });

  
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
router.post('/:courseId/reviews', mid.authLogin, (req, res, next) => {

	/* If a rating exists, create new review and save it to database */  
	if (req.body.rating) {
	  const newReview = {
		user: req.user,
		rating: req.body.rating,
		review: req.body.review
	  }
	  
	  Review.create(newReview, function(err, review) {
		if (err) {
		  if (err.name === 'MongoError' || err.name === "ValidationError") {
			err.status = 400; // 400 - Bad Request
		  }
		  return next(err);
		} else {
		  /* Set location header to / and return 201 status */
		  res.setHeader('Location', '/courses/' + req.params.courseId);
		  res.status(201).send(); // 201 - Created
		}
	  });
  
	} else {
	  var err = new Error();
	  err.message = 'Rating is required.';
	  err.status = 401; // 401 - Unauthorized
	  return next(err);
	}
  });

module.exports = router;

