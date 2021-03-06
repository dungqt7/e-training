(function() {
  'use strict';

  angular
    .module('shared')
    .service('preloaders', [
      '$rootScope',
      '$timeout',
      'utils',
      function($rootScope, $timeout, utils) {
        $rootScope.content_preloader_show = function(style, variant, container, w, h) {
          var $body = $('body');
          if (!$body.find('.content-preloader').length) {
            var image_density = utils.isHighDensity() ? '@2x' : '',
              width = w || 48,
              height = h || 48;

            var preloader_content = (style === 'regular')
              ? '<img src="assets/img/spinners/spinner' + image_density + '.gif" alt="" width="32" height="32">'
              : '<div class="md-preloader"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="' + height + '" width="' + width + '" viewbox="0 0 75 75"><circle cx="37.5" cy="37.5" r="33.5" stroke-width="8"/></svg></div>';

            var thisContainer = (typeof container !== 'undefined') ? $(container) : $body;

            thisContainer.append('<div class="content-preloader content-preloader-' + variant + '" style="height:' + height + 'px;width:' + width + 'px;margin-left:-' + width / 2 + 'px">' + preloader_content + '</div>');
            $timeout(function() {
              $('.content-preloader').addClass('preloader-active');
            });
          }
        };
        $rootScope.content_preloader_hide = function() {
          var $body = $('body');
          if ($body.find('.content-preloader').length) {
            // hide preloader
            $('.content-preloader').removeClass('preloader-active');
            // remove preloader
            $timeout(function() {
              $('.content-preloader').remove();
            }, 500);
          }
        };
      }
    ]);
}());
