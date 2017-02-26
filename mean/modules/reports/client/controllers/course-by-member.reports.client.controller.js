(function () {
  'use strict';

  angular
    .module('reports')
    .controller('CourseByMemberReportsController', CourseByMemberReportsController);

  CourseByMemberReportsController.$inject = ['$scope', '$rootScope','$state', 'Authentication', 'GroupsService','AdminService', 'CoursesService','CourseMembersService','CourseAttemptsService','$timeout', '$window','$translate', 'treeUtils','_'];
  
  function CourseByMemberReportsController($scope, $rootScope, $state, Authentication,GroupsService,AdminService, CoursesService,CourseMembersService, CourseAttemptsService, $timeout,$window,$translate, treeUtils,_) {
    var vm = this;
    vm.authentication = Authentication;
    vm.generateReport = generateReport;
    vm.getExportData = getExportData;
    vm.getExportHeader = getExportHeader;
    
    
    function generateReport(users) {
        vm.members = [];
        _.each(users,function(user) {
            CourseMembersService.byUser({userId:user._id},function(members) {
               _.each(members,function(member) {
                   member.time  = 0;
                   member.score  = 0;
                   CourseAttemptsService.byMember({memberId:member._id},function(attempts) {
                       member.lastAttempt = _.max(attempts, function(attempt){return new Date(attempt.start).getTime()}); 
                       member.firstAttempt = _.min(attempts, function(attempt){return new Date(attempt.start).getTime()});
                       _.each(attempts,function(attempt) {
                           if (attempt.status=='completed') {
                               var start = new Date(attempt.start);
                               var end = new Date(attempt.end);
                               member.time += Math.floor((end.getTime() - start.getTime())/1000);
                           }
                       });
                   });
                   vm.members.push(member);
               }) ;
            });
        });
    }

    
    function getExportData() {
        var data  = []
        _.each(vm.members,function(member) {
            data.push({
                        username:member.member.username,
                        code:member.course ? member.course.code:'',
                        name:member.course? member.course.name :'',
                        model:member.course ? member.course.model:'',
                        registered:moment(new Date(member.registered)).format('DD/MM/YYYY'),
                        firstAttempt:moment(new Date(member.firstAttempt.created)).format('DD/MM/YYYY'),
                        lastAttempt:moment(new Date(member.lastAttempt.created)).format('DD/MM/YYYY'),
                        enrollmentStatus:member.enrollmentStatus,
                        score:member.score,
                        time:member.time})
        });
        return data;
    }
    
    
    function getExportHeader() {
        return [
                $translate.instant('MODEL.USER.USERNAME'),
                $translate.instant('MODEL.COURSE.CODE'),
                $translate.instant('MODEL.COURSE.NAME'),
                $translate.instant('MODEL.COURSE.MODEL'),
                $translate.instant('REPORT.COURSE_BY_MEMBER.REGISTER_DATE'),
                $translate.instant('REPORT.COURSE_BY_MEMBER.FIRST_ATTEMPT'),
                $translate.instant('REPORT.COURSE_BY_MEMBER.LAST_ATTEMPT'),
                $translate.instant('MODEL.MEMBER.ENROLL_STATUS'),
                $translate.instant('REPORT.COURSE_BY_MEMBER.SCORE'),
                $translate.instant('REPORT.COURSE_BY_MEMBER.TIME'),
                ];
    }
   
  }
}());
