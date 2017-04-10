(function() {
  'use strict';

  // Single-choice Question

  angular.module('lms')
    .directive('singleChoiceQuestion', ['OptionsService', 'QuestionsService', 'fileManagerConfig', '_', singleChoiceQuestion]);

  function singleChoiceQuestion(OptionsService, QuestionsService, fileManagerConfig, _) {
    return {
      scope: {
        question: '=',
        answer: '=',
        shuffle: '=',
        showAnswer: '=',
        mode: '=' // edit.view/study, result
      },
      templateUrl: '/src/client/lms/directives/questions/single-choice-question/single-choice-question.directive.client.view.html',
      link: function(scope, element, attributes) {
        scope.tinymce_options = fileManagerConfig;
        scope.$watch('question', function() {
          if (scope.question._id)
            scope.question.options = OptionsService.byQuestion({
              questionId: scope.question._id
            }, function(options) {
              if (scope.mode === 'study' && scope.shuffle) {
                if (!scope.question.shuffleIndex) {
                  scope.question.shuffleIndex = Math.floor(Math.randomw() * options.length);
                }
                scope.question.options = [];
                for (var i = 0; i < options.length; i++)
                  scope.question.options.push(options[(scope.question.shuffleIndex + i) % options.length]);
              }
              if (scope.mode === 'study' && !scope.shuffle) {
                scope.question.options = _.sortBy(scope.question.options, 'order');
              }
              if (scope.mode !== 'study' && scope.mode !== 'result') {
                _.each(scope.question.options, function(option) {
                  option.selected = _.contains(scope.question.correctOptions, option._id);
                });
              } else {
                if (scope.answer) {
                  _.each(scope.question.options, function(option) {
                    option.selected = _.contains(scope.answer.options, option._id);
                  });
                }
                _.each(scope.question.options, function(option) {
                  option.isCorrect = _.contains(scope.question.correctOptions, option._id);
                });
              }
            });
          else
            scope.question.options = [];
        });

        scope.translateContent = function() {
          return scope.question.description;
        };

        scope.addOption = function() {
          var option = new OptionsService();
          if (scope.question.options.length === 0)
            option.order = scope.question.options.length + 1;
          else
            option.order = _.max(scope.question.options, function(object) {return object.order;}).order + 1;
          option.question = scope.question._id;
          option.$save(function() {
            scope.question.options.push(option);
          });
        };

        scope.selectOption = function(option) {
          _.each(scope.question.options, function(obj) {
            if (obj._id !== option._id)
              obj.selected = false;
          });
          if (scope.mode === 'edit') {
            var correctOptions = _.filter(scope.question.options, function(option) {
              return option.selected;
            });
            scope.question.correctOptions = _.pluck(correctOptions, '_id');
          }
        };

        scope.removeOption = function(option) {
          if (option._id) {
            OptionsService.delete({
              optionId: option._id
            }, function() {
              scope.question.options = _.reject(scope.question.options, function(o) {
                return o._id === option._id;
              });
              scope.question.correctOptions = _.reject(scope.question.correctOptions, function(o) {
                return o === option._id;
              });
            });
          }
        };
      }
    };
  }
}());
