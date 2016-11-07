;( function( $, window, document, undefined ) {

    "use strict";

    var ffResponsiveMenu = "ffResponsiveMenu",
        defaults = {
            pageWrapSelector:       ".ffrm-page-wrapper",
            menuBtnSelector:        ".ffrm-hamburger",
            swipeTriggerSelector:   ".ffrm-swipe-trigger",
            overlaySelector:        ".ffrm-overlay",
            menuBtnActiveClass:     "is-active",
            menuSpeed:              .3,
            menuWidth:              250,
            overlayOpacity:         0.8
        };

    function Plugin ( element, options ) {

        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = ffResponsiveMenu;

        this.menuSpeed = this.menuSpeed / 1000;

        // elements
        this.$body = $("body");
        this.$overlay = $('<div class="' + this.settings.overlaySelector.replace(".","") + '" />');
        this.$swipeTrigger = $('<div class="' + this.settings.swipeTriggerSelector.replace(".","") + '" />');

        this.menu = element;
        this.$pageWrap = $(this.settings.pageWrapSelector);
        this.$menuBtn = $(this.settings.menuBtnSelector);

        // variables
        this.isOpen = false;
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
        },
        addHtmlMarkup: function( text ) {
            this.$body.append( this.$swipeTrigger );
            this.$body.append( this.$overlay );
        },
        bindEvents: function() {
            var self = this;
            $(document).on('click', this.settings.menuBtnSelector, function( e ) {
                e.preventDefault();
                self.onMenuBtnClick( e );
            });
            $(document).on('click', this.settings.swipeTriggerSelector, function( e ) {
                e.preventDefault();
                console.log('click overlay')
                self.setMenuTransition( self.settings.menuSpeed, "ease-in" );
            });
            $(document).on('touchstart', this.settings.swipeTriggerSelector, function( e ) {
                e.preventDefault();
                self.onTouchStart( e );
            });
            $(document).on('touchmove', this.settings.swipeTriggerSelector, function( e ) {
                e.preventDefault();
                self.onTouchMove( e );
            });
            $(document).on('touchend', this.settings.swipeTriggerSelector, function( e ) {
                e.preventDefault();
                self.onTouchEnd( e );
            });
        },
        openMenu: function( speed, easing ) {
            var self = this;

            this.setOverlayTransition( speed, "ease-out" );
            this.setOverlayTransparency( this.settings.menuWidth );
            this.$body.toggleClass( "ffrm-open ffrm-closed" );
            this.isOpen = true;
            this.toggleMenuBtnClass();
            this.setMenuTransition( speed, easing );

        },
        closeMenu: function( speed, easing ) {
            var self = this;

            console.log('close IIIT')

            this.$body.toggleClass( "ffrm-open ffrm-closed" );
            this.isOpen = false;
            this.setOverlayTransition( speed, "ease-out" );
            this.setOverlayTransparency( 0 );
            this.toggleMenuBtnClass();
            this.setMenuTransition( (speed), easing );

            setTimeout(function() {
                self.$body.removeClass( "ffrm-is-moving" );
            }, speed);
        },
        onMenuBtnClick: function( e ) {
            if( !this.$menuBtn.hasClass( this.settings.menuBtnActiveClass ) ) {
                this.openMenu( this.settings.menuSpeed, "ease-in");
                console.log('1')
            } else if( $(this.settings.menuBtnSelector).hasClass( this.settings.menuBtnActiveClass ) ) {
                this.closeMenu( this.settings.menuSpeed, "ease-in");
                console.log('2')
            }
            // set base Transition time in case it got already changed
            this.setMenuTransition( this.settings.menuSpeed, "ease-in" );
        },
        onTouchStart: function( e ) {
            var touchobj = e.originalEvent.changedTouches[0] // reference first touch point (ie: first finger)
            this.startx = parseInt(touchobj.clientX) // get x position of touch point relative to left edge of browser

            var d = new Date();
            this.starttime = d.getTime();

            this.setMenuTransition( 0, "linear" );

            // close it
            if( this.isOpen ) {
                this.$pageWrap.css({
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
            var d = new Date();
            this.endtime = d.getTime();

            this.$pageWrap.addClass('no-transition');
            this.$body.addClass('ffrm-is-moving');

            this.setOverlayTransition( 0, "linear" );
            this.setOverlayTransparency( dist );

            // close it
            if( this.isOpen ) {
                //dist = dist + this.startx;
                //console.log( "dist" )
                //console.log( dist )
                //dist = Math.abs( this.startx - dist - 250 );
                //
                //console.log( ( this.startx - dist - 250 ) )
                //console.log( dist )
                //
                //if( (dist + this.startx) !== )
                //dist = (dist > 250) ? 250 : dist;

                console.log( dist )
                dist = (  dist + 250 );
                console.log( "dist" )
                console.log( dist )

                dist = ( dist < 0 ) ? 0 : dist;
                dist = ( dist > 250 ) ? 250 : dist;


                this.$pageWrap.css({
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

                this.$pageWrap.css({
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
            this.$pageWrap.removeClass('no-transition');

            console.log('touchend')

            console.log("Distance: " + absDist);
            //console.log("Time: " + this.time);
            //console.log("speed: " + speed);
            //console.log("clientX: " + touchobj.clientX);

            this.setMenuTransition( speed, "ease-out" );

            // close it
            if (this.isOpen) {
                if (distance > 80 || distance == 0) {
                    if( distance == 0) {
                        this.closeMenu( this.settings.menuSpeed, "ease-in");
                    } else {
                        this.closeMenu( speed );
                    }
                } else { // revert
                    this.setOverlayTransition( speed, "ease-out" );
                    this.setOverlayTransparency( this.settings.menuWidth );
                }
            // open it
            } else {
                if (touchobj.clientX > 80) {
                    this.openMenu( speed );
                } else { // revert
                    this.setOverlayTransition( speed, "ease-out" );
                    this.setOverlayTransparency( 0 );
                }
            }
        },
        setMenuTransition: function( time, easing ) {
            this.$pageWrap.add( this.menu ).css({
                transitionDuration: time + "s",
                transitionTimingFunction: easing
            });
        },
        setOverlayTransition: function( time, easing ) {
            this.$overlay.add( this.menu ).css({
                transitionDuration: time + "s",
                transitionTimingFunction: easing
            });
        },
        setOverlayTransparency: function( distance ) {
            //console.log("distance: " + distance);

            if( this.isOpen && distance > 0 ) {
                distance = 0;
            } else {
                distance = Math.abs( distance );
            }

            distance = (distance > this.settings.menuWidth) ? this.settings.menuWidth : distance;

            //console.log("distance: " + distance);

            var opacity = (this.settings.overlayOpacity / ( this.settings.menuWidth / distance ));

            //console.log("opacity: " + opacity);

            if( this.isOpen ) {
                opacity = this.settings.overlayOpacity - opacity;
            }

            this.$overlay.css({
                opacity: opacity
            });
        },
        toggleMenuBtnClass: function() {
            var self = this;
            if(!self.$menuBtn.hasClass( self.settings.menuBtnActiveClass )) {
                self.$menuBtn.addClass( self.settings.menuBtnActiveClass );
            } else if(self.$menuBtn.hasClass( self.settings.menuBtnActiveClass )) {
                self.$menuBtn.removeClass( self.settings.menuBtnActiveClass );
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















