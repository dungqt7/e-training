(function() {
  'use strict';

  // Courses controller
  angular
    .module('performance')
    .controller('SchedulesViewController', SchedulesViewController);

  SchedulesViewController.$inject = ['$scope', '$state', '$window', 'Authentication', '$timeout', 'scheduleResolve', 'CoursesService', 'Notification', 'CompetenciesService', 'Upload', '$q', '_'];

  function SchedulesViewController($scope, $state, $window, Authentication, $timeout, schedule, CoursesService, Notification, CompetenciesService, Upload, $q, _) {
    var vm = this;

    vm.authentication = Authentication;
    vm.schedule = schedule;
    // if (vm.schedule.competency)
    //     vm.competency = CompetenciesService.get({competencyId:vm.schedule.competency})
    var allCompetenciesPromise = [];

    _.each(vm.schedule.competencies, function(competencyId) {
      allCompetenciesPromise.push(CompetenciesService.get({
        competencyId: competencyId
      }).$promise);
    });

    $q.all(allCompetenciesPromise).then(function(competencies) {
      vm.competencies = competencies;
    });
  }
}());