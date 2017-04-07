'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Forums Permissions
 */
exports.invokeRolesPolicies = function() {
  acl.allow([
    {
      roles: ['admin'],
      allows: [
        {
          resources: '/api/forums',
          permissions: '*'
        },
        {
          resources: '/api/forums/:forumId',
          permissions: '*'
        },
        {
          resources: '/api/forums/byCourse/:courseId',
          permissions: '*'
        }
      ]
    },
    {
      roles: ['user'],
      allows: [
        {
          resources: '/api/forums',
          permissions: ['get', 'post']
        },
        {
          resources: '/api/forums/:forumId',
          permissions: ['get']
        },
        {
          resources: '/api/forums/byCourse/:courseId',
          permissions: 'get'
        }
      ]
    },
    {
      roles: ['guest'],
      allows: [
        {
          resources: '/api/forums',
          permissions: ['get']
        },
        {
          resources: '/api/forums/:forumId',
          permissions: ['get']
        }
      ]
    }
  ]);
};

/**
 * Check If Forums Policy Allows
 */
exports.isAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Forum is being processed and the current user created it then allow any manipulation
  if (req.forum && req.user && req.forum.user && req.forum.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
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
