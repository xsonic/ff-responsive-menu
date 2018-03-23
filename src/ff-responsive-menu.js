;(function($, window, document) {

  "use strict";

  const ffResponsiveMenu = "ffResponsiveMenu",
    defaults = {
      pageWrapSelector: ".ffrm-page-wrapper",           // CSS selector (class or id) for the content wrapper (part of the page that moves)
      menuBtnSelector: ".ffrm-hamburger",               // CSS selector (class or id) for the Menu button (FFRM won't add a button
      swipeTriggerSelector: ".ffrm-swipe-trigger",      // CSS selector (class or id) for the invisible element, initially placed on the very edge, used to catch the touch events
      overlaySelector: ".ffrm-overlay",                 // CSS selector (class or id) for the content overlay
      menuBtnActiveClass: "is-active",                  // CSS class that's gets added to the menubutton when the menu is open
      menuSpeed: .3,                                    // the animation speed of the menu
      menuWidth: 250,                                   // the width of the menu (must also be set in the CSS)
      overlayOpacity: 0.8,                              // opacity of the content overlay
      overlayContent: true,                             // add overlay when menu is open
      overlayClose: true,                               // close the menu by clicking on the overlay
      gestures: true,                                   // enable edge swiping to open the menu
      moveContent: false
    };


  function Plugin(element, options) {

    this.settings = $.extend({}, defaults, options);

    this.menuSpeed = this.menuSpeed / 1000;

    // elements
    this.menu = element;

    this.$menu = $(element);
    this.$body = $("body");
    this.$overlay = $('<div class="' + this.settings.overlaySelector.replace(".", "") + '" />');
    this.$swipeTrigger = $('<div class="' + this.settings.swipeTriggerSelector.replace(".", "") + '" />');
    this.$pageWrap = $(this.settings.pageWrapSelector);
    this.$menuBtn = $(this.settings.menuBtnSelector);

    // variables
    this.isOpen = false;
    this.startx = 0;
    this.starttime = 0;
    this.endtime = 0;

    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function() {
      this.addHtmlMarkup();
      this.bindEvents();
      this.$body.addClass('ffrm-closed');
      if (this.settings.moveContent)
        this.$body.addClass('ffrm-move-content');
    },
    addHtmlMarkup: function() {
      if (this.settings.overlayContent)
        this.$body.append(this.$overlay);
      this.$body.append(this.$swipeTrigger);
    },
    bindEvents: function() {
      const self = this;
      $(document).on('click', this.settings.menuBtnSelector, function(e) {
        e.preventDefault();
        self.onMenuBtnClick(e);
      });
      $(document).on('click', this.settings.swipeTriggerSelector, function(e) {
        e.preventDefault();
        self.setMenuTransition(self.settings.menuSpeed, "ease-in");
      });
      if (this.settings.gestures) {
        $(document).on('touchstart', this.settings.swipeTriggerSelector, function(e) {
          e.preventDefault();
          self.onTouchStart(e);
        });
        $(document).on('touchmove', this.settings.swipeTriggerSelector, function(e) {
          e.preventDefault();
          self.onTouchMove(e);
        });
        $(document).on('touchend', this.settings.swipeTriggerSelector, function(e) {
          e.preventDefault();
          self.onTouchEnd(e);
        });
      }

      $(document).on('ffrm:open', this.menu, function() {
        self.openMenu(self.settings.menuSpeed, "ease-in");
      });
      $(document).on('ffrm:close', this.menu, function() {
        self.closeMenu(self.settings.menuSpeed, "ease-in");
      });

    },
    openMenu: function(speed, easing) {
      $("body, html").css({
        overflow: "hidden"
      });

      this.setOverlayTransition(speed, "ease-out");
      this.setOverlayTransparency(this.settings.menuWidth);
      this.$body.toggleClass("ffrm-open ffrm-closed");
      this.isOpen = true;
      this.toggleMenuBtnClass();
      this.setMenuTransition(speed, easing);
    },
    closeMenu: function(speed, easing) {
      const self = this;
      $("body, html").css({
        overflowY: "auto"
      });
      this.$body.toggleClass("ffrm-open ffrm-closed");
      this.isOpen = false;
      this.setOverlayTransition(speed, "ease-out");
      this.setOverlayTransparency(0);
      this.toggleMenuBtnClass();
      this.setMenuTransition((speed), easing);

      setTimeout(function() {
        self.$body.removeClass("ffrm-is-moving");
      }, speed);
    },
    onMenuBtnClick: function() {
      if (!this.$menuBtn.hasClass(this.settings.menuBtnActiveClass)) {
        this.openMenu(this.settings.menuSpeed, "ease-in");
      } else if ($(this.settings.menuBtnSelector).hasClass(this.settings.menuBtnActiveClass)) {
        this.closeMenu(this.settings.menuSpeed, "ease-in");
      }
      // set base Transition time in case it got already changed
      this.setMenuTransition(this.settings.menuSpeed, "ease-in");
    },
    onTouchStart: function(e) {
      const touchObj = e.originalEvent.changedTouches[0]; // reference first touch point (ie: first finger)
      this.startx = parseInt(touchObj.clientX); // get x position of touch point relative to left edge of browser
      const d = new Date();
      this.starttime = d.getTime();

      this.setMenuTransition(0, "linear");

      // close it
      if (this.isOpen) {

        if (this.settings.moveContent) {
          this.$pageWrap.css({
            "-webkit-transform": "translate3D(" + this.settings.menuWidth + "px, 0, 0",
            "-moz-transform": "translate3D(" + this.settings.menuWidth + "px, 0, 0",
            transform: "translate3D(" + this.settings.menuWidth + "px, 0, 0)"
          });
        }
        $(this.menu).css({
          "-webkit-transform": "translate3D(-" + this.settings.menuWidth + "px, 0, 0",
          "-moz-transform": "translate3D(-" + this.settings.menuWidth + "px, 0, 0",
          transform: "translate3D(-" + this.settings.menuWidth + "px, 0, 0)"
        });
      }

      this.$menu.trigger('ffrm:onTouchStart', e);
    },
    onTouchMove: function(e) {
      const touchObj = e.originalEvent.changedTouches[0]; // reference first touch point for this event
      let dist = parseInt(touchObj.clientX) - this.startx;
      const d = new Date();
      this.endtime = d.getTime();

      this.$pageWrap.addClass('no-transition');
      this.$body.addClass('ffrm-is-moving');

      this.setOverlayTransition(0, "linear");
      this.setOverlayTransparency(dist);

      // close it
      if (this.isOpen) {
        dist = (dist + this.settings.menuWidth);
        dist = (dist < 0) ? 0 : dist;
        dist = (dist > this.settings.menuWidth) ? this.settings.menuWidth : dist;

        if (this.settings.moveContent) {
          this.$pageWrap.css({
            "-webkit-transform": "translate3D(" + dist + "px, 0, 0)",
            "-moz-transform": "translate3D(" + dist + "px, 0, 0)",
            transform: "translate3D(" + dist + "px, 0, 0)"
          });
        }
        $(this.menu).css({
          "-webkit-transform": "translate3D(" + (dist - this.settings.menuWidth) + "px, 0, 0)",
          "-moz-transform": "translate3D(" + (dist - this.settings.menuWidth) + "px, 0, 0)",
          transform: "translate3D(" + (dist - this.settings.menuWidth) + "px, 0, 0)"
        });
        // open it
      } else {
        dist = (dist < 0) ? 0 : dist;
        dist = (dist > this.settings.menuWidth) ? this.settings.menuWidth : dist;

        if (this.settings.moveContent) {
          this.$pageWrap.css({
            "-webkit-transform": "translate3D(" + dist + "px, 0, 0)",
            "-moz-transform": "translate3D(" + dist + "px, 0, 0)",
            transform: "translate3D(" + dist + "px, 0, 0)"
          });
        }
        $(this.menu).css({
          "-webkit-transform": "translate3D(" + (dist - this.settings.menuWidth) + "px, 0, 0)",
          "-moz-transform": "translate3D(" + (dist - this.settings.menuWidth) + "px, 0, 0)",
          transform: "translate3D(" + (dist - this.settings.menuWidth) + "px, 0, 0)"
        });
      }

      this.$menu.trigger('ffrm:onTouchMove', [dist]);
    },
    onTouchEnd: function(e) {
      const touchObj = e.originalEvent.changedTouches[0]; // reference first touch point for this event
      const time = this.endtime - this.starttime;
      const dist = this.startx - touchObj.clientX;
      const absDist = Math.abs(dist);
      let speed = (time / absDist) / 10;
      speed = (speed > .5) ? .5 : speed;

      this.$body.removeClass('ffrm-is-moving');
      this.$pageWrap.removeClass('no-transition');

      this.setMenuTransition(speed, "ease-out");

      // close it
      if (this.isOpen) {
        if (dist > 80 || dist === 0) {
          if (dist === 0 && this.settings.overlayClose) {
            this.closeMenu(this.settings.menuSpeed, "ease-in");
          } else {
            this.closeMenu(speed);
          }
        } else { // revert
          this.setOverlayTransition(speed, "ease-out");
          this.setOverlayTransparency(this.settings.menuWidth);
        }
        // open it
      } else {
        if (touchObj.clientX > 80) {
          this.openMenu(speed);
        } else { // revert
          this.setOverlayTransition(speed, "ease-out");
          this.setOverlayTransparency(0);
        }
      }

      this.$menu.trigger('ffrm:onTouchEnd', e, dist, speed);
    },
    setMenuTransition: function(time, easing) {
      this.$pageWrap.add(this.menu).css({
        transitionDuration: time + "s",
        transitionTimingFunction: easing
      });
    },
    setOverlayTransition: function(time, easing) {
      this.$overlay.add(this.menu).css({
        transitionDuration: time + "s",
        transitionTimingFunction: easing
      });
    },
    setOverlayTransparency: function(dist) {

      if (this.isOpen && dist > 0) {
        dist = 0;
      } else {
        dist = Math.abs(dist);
      }

      dist = (dist > this.settings.menuWidth) ? this.settings.menuWidth : dist;
      let opacity = (this.settings.overlayOpacity / (this.settings.menuWidth / dist));

      if (this.isOpen) {
        opacity = this.settings.overlayOpacity - opacity;
      }

      this.$overlay.css({
        opacity: opacity
      });
    },
    toggleMenuBtnClass: function() {
      const self = this;
      if (!self.$menuBtn.hasClass(self.settings.menuBtnActiveClass)) {
        self.$menuBtn.addClass(self.settings.menuBtnActiveClass);
      } else if (self.$menuBtn.hasClass(self.settings.menuBtnActiveClass)) {
        self.$menuBtn.removeClass(self.settings.menuBtnActiveClass);
      }
    }
  });

  $.fn[ffResponsiveMenu] = function(options) {
    return this.each(function() {
      if (!$.data(this, "plugin_" + ffResponsiveMenu)) {
        $.data(this, "plugin_" +
          ffResponsiveMenu, new Plugin(this, options));
      }
    });
  };

})(jQuery, window, document);















