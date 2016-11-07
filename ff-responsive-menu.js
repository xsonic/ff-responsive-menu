;( function( $, window, document, undefined ) {

    "use strict";

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variables rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var ffResponsiveMenu = "ffResponsiveMenu",
        defaults = {
            pageWrapSelector:   ".ffrm-page-wrapper",
            menuBtnSelector:    ".ffrm-hamburger",
            menuBtnActiveClass: ".is-active",
            swipeTriggerClass:  ".ffrm-swipe-trigger",
            menuSpeed:          300,
            menuWidth:          250,
            overlayOpacity:     0.8
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {

        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = ffResponsiveMenu;

        this.menuSpeed = this.menuSpeed / 1000;

        // elements
        this.$body = $("body");

        this.$overlay = $('<div class="ffrm-overlay" />');

        this.menu = element;
        this.pageWrap = this.settings.pageWrapSelector;
        this.menuBtn = this.settings.menuBtnSelector;

        // variables
        this.box1 = $('.ffrp-swipe-trigger');
        this.startx = 0;
        this.dist = 0;
        this.starttime = 0;
        this.endtime = 0;

        this.init();
    }

    $.extend( Plugin.prototype, {
        init: function() {
            this.addHtmlMarkup();
            this.bindEvents();
            this.$body.addClass('ffrm-closed');

            console.log(this.settings.swipeTriggerClass);
        },
        addHtmlMarkup: function( text ) {
            this.$body.prepend('<div class="ffrm-swipe-trigger" />');
            this.$body.prepend( this.$overlay );
        },
        bindEvents: function() {
            var self = this;
            $(document).on('click', this.menuBtn, function( e ) {
                e.preventDefault();
                self.onMenuBtnClick( e );
            });
            $(document).on('touchstart', this.settings.swipeTriggerClass, function( e ) {
                e.preventDefault();
                self.onTouchStart( e );
            });
            $(document).on('touchmove', this.settings.swipeTriggerClass, function( e ) {
                e.preventDefault();
                self.onTouchMove( e );
            });
            $(document).on('touchend', this.settings.swipeTriggerClass, function( e ) {
                console.log("ente");
                e.preventDefault();
                self.onTouchEnd( e );
            });
        },
        openMenu: function( speed, easing ) {
            var self = this;

            this.setOverlayTransition( "ease-out" );
            this.setOverlayTransparency( this.settings.menuWidth );
            this.$body.toggleClass( "ffrm-open ffrm-closed" );
            this.toggleMenuBtnClass();
            this.setMenuTransition( speed, easing );

        },
        closeMenu: function( speed, easing ) {
            var self = this;

            this.$body.toggleClass( "ffrm-open ffrm-closed" );
            this.setOverlayTransition( "ease-out" );
            this.setOverlayTransparency( 0 );
            this.toggleMenuBtnClass();
            this.setMenuTransition( (speed), easing );

            setTimeout(function() {
                self.$body.removeClass( "ffrm-is-moving" );
            }, speed);
        },
        onMenuBtnClick: function( e ) {
            if(!$(this.menuBtn).hasClass( this.settings.menuBtnActiveClass )) {
                this.openMenu();
            } else if($(self.settings.menuBtnSelector).hasClass( this.settings.menuBtnActiveClass )) {
                this.closeMenu();
            }
            // set base Transition time in case it got already changed
            this.setMenuTransition( this.settings.menuSpeed, "ease-in" );
        },
        onTouchStart: function( e ) {

            console.log(e);
            var touchobj = e.originalEvent.changedTouches[0] // reference first touch point (ie: first finger)
            this.startx = parseInt(touchobj.clientX) // get x position of touch point relative to left edge of browser

            var d = new Date();
            this.starttime = d.getTime();

            this.setMenuTransition( 0, "linear" );

            // close it
            if( this.$body.hasClass('ffrm-open') ) {
                $(this.pageWrap).css({
                    "-webkit-transform" :   "translate3D(250px, 0, 0",
                    "-moz-transform" :   "translate3D(250px, 0, 0",
                    transform:   "translate3D(250px, 0, 0)"
                });
                $( this.menu ).css({
                    "-webkit-transform" :   "translate3D(-250px, 0, 0",
                    "-moz-transform" :   "translate3D(-250px, 0, 0",
                    transform:   "translate3D(-250px, 0, 0)"
                });
            }
        },
        onTouchMove: function( e ) {
            var touchobj = e.originalEvent.changedTouches[0]; // reference first touch point for this event
            var dist = parseInt(touchobj.clientX) - this.startx;
            var absDist = Math.abs(dist);
            var d = new Date();
            this.endtime = d.getTime();

            $(this.pageWrap).addClass('no-transition');
            this.$body.addClass('ffrm-is-moving');

            this.setOverlayTransition( "linear" );
            this.setOverlayTransparency( absDist );

            // close it
            if( this.$body.hasClass('ffrm-open') ) {
                dist = dist + this.startx;
                dist = (dist > 250) ? 250 : dist;

                console.log(dist);

                $(this.pageWrap).css({
                    "-webkit-transform" :   "translate3D(" + dist + "px, 0, 0)",
                    "-moz-transform" :   "translate3D(" + dist + "px, 0, 0)",
                    transform:   "translate3D(" + dist + "px, 0, 0)"
                });
                $( this.menu ).css({
                    "-webkit-transform" :   "translate3D(" + (dist - 250) + "px, 0, 0)",
                    "-moz-transform" :   "translate3D(" + (dist - 250) + "px, 0, 0)",
                    transform:   "translate3D(" + (dist - 250) + "px, 0, 0)"
                });
            // open it
            } else {
                dist = (dist < 0) ? 0 : dist;
                dist = (dist > 250) ? 250 : dist;

                $(this.pageWrap).css({
                    "-webkit-transform" :   "translate3D(" + dist + "px, 0, 0)",
                    "-moz-transform" :   "translate3D(" + dist + "px, 0, 0)",
                    transform:   "translate3D(" + dist + "px, 0, 0)"
                });
                $( this.menu ).css({
                    "-webkit-transform" :   "translate3D(" + (dist - 250) + "px, 0, 0)",
                    "-moz-transform" :   "translate3D(" + (dist - 250) + "px, 0, 0)",
                    transform:   "translate3D(" + (dist - 250) + "px, 0, 0)"
                });
            }
        },
        onTouchEnd: function( e ) {

            var touchobj = e.originalEvent.changedTouches[0]; // reference first touch point for this event
            var time = this.endtime - this.starttime;
            var distance = this.startx - touchobj.clientX;
            var absDist = Math.abs(distance);
            var speed = (time / absDist ) / 10;
            speed = (speed > .5) ? .5 : speed;

            this.$body.removeClass('ffrm-is-moving');
            $(this.pageWrap).removeClass('no-transition');

            console.log("Distance: " + absDist);
            console.log("Time: " + this.time);
            console.log("speed: " + speed);
            console.log("clientX: " + touchobj.clientX);

            this.setMenuTransition( speed, "ease-out" );

            // close it
            if (this.$body.hasClass('ffrm-open')) {
                if (distance > 80) {
                    console.log("close");
                    this.closeMenu( speed );
                }
            } else { // open it
                if (touchobj.clientX > 80) {
                    console.log("open");
                    this.openMenu( speed );
                } else {
                    this.setOverlayTransparency( 0 );
                }
            }
        },
        setMenuTransition: function( time, easing ) {
            $(this.pageWrap).add( this.menu ).css({
                transitionDuration: time + "s",
                transitionTimingFunction: easing
            });
        },
        setOverlayTransition: function( easing ) {
            this.$overlay.add( this.menu ).css({
                transitionTimingFunction: easing
            });
        },
        setOverlayTransparency: function( distance ) {
            console.log(distance);

            distance = (distance > this.settings.menuWidth) ? this.settings.menuWidth : distance;
            var opacity = (this.settings.overlayOpacity / ( this.settings.menuWidth / distance ));

            console.log(opacity);

            if( this.$body.hasClass('ffrm-open') )
                opacity = this.settings.overlayOpacity - opacity;

            this.$overlay.css({
                opacity: opacity
            });
        },
        toggleMenuBtnClass: function() {
            var self = this;
            if(!$(self.menuBtn).hasClass( self.settings.menuBtnActiveClass )) {
                $(self.menuBtn).addClass( self.settings.menuBtnActiveClass );
            } else if($(self.menuBtn).hasClass( self.settings.menuBtnActiveClass )) {
                $(self.menuBtn).removeClass( self.settings.menuBtnActiveClass );
            }
        }
    } );

    $.fn[ ffResponsiveMenu ] = function( options ) {
        return this.each( function() {
            if ( !$.data( this, "plugin_" + ffResponsiveMenu ) ) {
                $.data( this, "plugin_" +
                    ffResponsiveMenu, new Plugin( this, options ) );
            }
        } );
    };

} )( jQuery, window, document );















