console.log("sticky"),function(){!function(n,t){return"function"==typeof define&&define.amd?define("libs/jquery.waypoints-sticky",["jquery","waypoints"],t):t(n.jQuery)}(this,function(n){var t,s;return t={wrapper:'<div class="sticky-wrapper" />',stuckClass:"stuck"},s=function(n,t){return n.wrap(t.wrapper),n.parent()},n.waypoints("extendFn","sticky",function(e){var i,a,o;return a=n.extend({},n.fn.waypoint.defaults,t,e),i=s(this,a),o=a.handler,a.handler=function(t){var s,e;return s=n(this).children(":first"),e="down"===t||"right"===t,i.height(e?s.outerHeight():""),s.toggleClass(a.stuckClass,e),null!=o?o.call(this,t):void 0},i.waypoint(a),this.data("stuckClass",a.stuckClass)}),n.waypoints("extendFn","unsticky",function(){return this.parent().waypoint("destroy"),this.unwrap(),this.removeClass(this.data("stuckClass"))})})}.call(this),define("core/modules/subnav",["jquery","modernizr","libs/enquire","waypoints","libs/jquery.waypoints-sticky"],function(n,t,s){return{init:function(){function t(){window.innerWidth>1024?i():e()}function s(t){t.removeClass("subnav-open"),n(document).off("touchstart.subnav")}function e(){document.body.style.paddingTop="0px",a.classList.remove("stuck")}function i(){window.scrollY>=u?(document.body.style.paddingTop=a.offsetHeight+"px",a.classList.add("stuck")):e()}console.log("subnav");var a=document.querySelector(".subnav"),o=document.querySelector("#main"),u=o.offsetTop;if(EFTOURS.device.isTouch){const r=n(".subnav").hasClass("subnav-mobile");n(".subnav-haschildren > .subnav-item-link").on("click.subnav",function(t){var e=n(this),i=e.parent(".subnav-haschildren");t.preventDefault(),t.stopPropagation(),i.hasClass("subnav-open")?s(i):(i.addClass("subnav-open"),r||n(document).on("touchstart.subnav",function(t){n(t.target).parents(".subnav-haschildren").is(i)||s(i)}))})}else window.addEventListener("resize",t),window.addEventListener("scroll",t)}}});
//# sourceMappingURL=subnav.js.map