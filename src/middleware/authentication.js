'use strict';

const auth    = require('basic-auth');
const {User}  = require('../models/user');

//authenticate user
const authLogin = (req, res, next) => {
  let credentials = auth(req);
  if (credentials) {
    //find authenticated user in the database
    User.userAuthentication(credentials.name, credentials.pass, (err, user) => {
      if ( err || !user) {
        let err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.authUser = user;
        return next();
      }
    });
  } else if (!credentials) {
    let err = new Error('You must be logged in.');
    err.status = 401;
    return next(err);
  }
};

module.exports = {authLogin};
