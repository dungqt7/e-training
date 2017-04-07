(function() {
  'use strict';

  // Focus the element on page load
  // Unless the user is on a small device, because this could obscure the page with a keyboard

  angular.module('core')
    .directive('programCard', ['CoursesService', '_', programCard]);

  function programCard(CoursesService, _) {
    return {
      scope: {
        program: '='
      },
      templateUrl: '/modules/core/client/directives/program-card/program.card.directive.client.view.html',
      link: function(scope, element, attributes) {}
    };
  }
}());
