'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Question = mongoose.model('Question'),
  Option = mongoose.model('Option'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');



exports.bulkCreate = function (req, res) {
    var questions = req.body.questions;
    var promises = [];
    _.each(questions,function(question) {        
        var promise =  new Promise(function (resolve, reject) {
            var newQuestion = new Question(question);
            var correctOptions = questions.correctOptions;
            var wrongOptions = questions.wrongOptions;
            console.log(newQuestion);
            newQuestion.correctOptions = [];
            newQuestion.save(function (err) {
                if (err) {
                  reject(err);
                } else {     
                    var optionPromises = [];
                    _.each(correctOptions,function(content) {
                        var optionPromise =  new Promise(function (resolve, reject) {
                            var option = new Option({content:content,question:newQuestion._id});
                            option.save(function(err) {
                                if (err)
                                    reject(err);
                                else{
                                    newQuestion.correctOptions.push(option._id);
                                    newQuestion.save(function(err) {
                                        resolve();
                                    });                                    
                                }
                            });
                        });
                        optionPromises.push(optionPromise);                        
                    });
                    _.each(wrongOptions,function(content) {
                        var optionPromise =  new Promise(function (resolve, reject) {
                            var option = new Option({content:content,question:newQuestion._id});
                            option.save(function(err) {
                                if (err)
                                    reject(err);
                                else{
                                    resolve();
                                }
                            });
                        });
                        optionPromises.push(optionPromise);                        
                    })
                    Promise.all(optionPromises).then(
                            function () 
                            {
                                resolve();
                            },
                            function (err) 
                            {
                                reject();
                            });
                }            
            });
        });
        promises.push(promise);
    });
    
    Promise.all(promises).then(
            function () 
            {
                res.json({success:true});
            },
            function (err) 
            {
                return res.status(422).send({
                    message: errorHandler.getErrorMessage(err)
                  });
            });

}

/**
 * Create a Question
 */
exports.create = function(req, res) {
  var question = new Question(req.body);
  question.user = req.user;

  question.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(question);
    }
  });
};

/**
 * Show the current Question
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var question = req.question ? req.question.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  question.isCurrentUserOwner = req.user && question.user && question.user._id.toString() === req.user._id.toString();

  res.jsonp(question);
};

/**
 * Update a Question
 */
exports.update = function(req, res) {
  var question = req.question;

  question = _.extend(question, req.body);

  question.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(question);
    }
  });
};

/**
 * Delete an Question
 */
exports.delete = function(req, res) {
  var question = req.question;

  question.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(question);
    }
  });
};

/**
 * List of Questions
 */
exports.list = function(req, res) {
  Question.find().sort('-created').populate('user', 'displayName').populate('category').exec(function(err, questions) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(questions);
    }
  });
};

  
exports.listByCategoryAndLevel = function(req, res) {
    Question.find({category:req.group._id, level:req.params.level }).sort('-created').populate('user', 'displayName').populate('category').exec(function(err, questions) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(questions);
    }
  });
};

exports.listByIds = function(req, res) {
    var questionIds = req.params.questionIds.split(',');
    Question.find({_id:{$in:questionIds} }).sort('-created').populate('user', 'displayName').populate('category').exec(function(err, questions) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(questions);
    }
  });
};

exports.listByCategory = function(req, res) {
    Question.find({category:req.group._id }).sort('-created').populate('user', 'displayName').populate('category').exec(function(err, questions) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(questions);
    }
  });
};

/**
 * Question middleware
 */
exports.questionByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Question is invalid'
    });
  }

  Question.findById(id).populate('user', 'displayName').populate('subQuestions').exec(function (err, question) {
    if (err) {
      return next(err);
    } else if (!question) {
      return res.status(422).send({
        message: 'No Question with that identifier has been found'
      });
    }
    req.question = question;
    next();
  });
};
