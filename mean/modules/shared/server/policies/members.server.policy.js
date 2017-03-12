'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Members Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/members',
      permissions: '*'
    }, {
        resources: '/api/members/byCourse/:courseId',
        permissions: '*'
      },
      {
          resources: '/api/members/byClass/:classroomId',
          permissions: '*'
        },{
          resources: '/api/members/byUserAndCourse/:userId/:courseId',
          permissions: '*'
        },
        {
            resources: '/api/members/byUser/:userId',
            permissions: 'get'
          },
      {
      resources: '/api/members/:memberId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/members',
      permissions: ['get', 'post']
    }, {
        resources: '/api/members/byCourse/:courseId',
        permissions: 'get'
      }, 
      {
          resources: '/api/members/byClass/:classroomId',
          permissions: '*'
        },{
          resources: '/api/members/byUserAndCourse/:userId/:courseId',
          permissions: 'get'
        },
        {
            resources: '/api/members/withdraw',
            permissions: 'put'
          },
      {
          resources: '/api/members/byUser/:userId',
          permissions: 'get'
        },
      {
      resources: '/api/members/:memberId',
      permissions: ['get','put']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/members',
      permissions: ['']
    },
    {
        resources: '/api/members/byCourse/:courseId',
        permissions: ''
      },
      {
      resources: '/api/members/:memberId',
      permissions: ['']
    }]
  }]);
};

/**
 * Check If Members Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Member is being processed and the current user created it then allow any manipulation
  if (req.member && req.user && req.member.user && req.member.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
