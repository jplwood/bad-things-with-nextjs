Array.prototype.contains=function(e){for(var t=this.length;t--;)if(this[t]===e)return!0;return!1},"undefined"==typeof String.prototype.contains&&(String.prototype.contains=function(e){return-1!=this.indexOf(e)}),define("core/global/helpers",["jquery","underscore"],function(e,t){return console.log("global/helpers"),{getFuncFromString:function(e){var t,o,i,n;if("function"!=typeof e)for(t=e.split("."),i=t.length,o=0;i>o;o++)n=null!=n?n[t[o]]:window[t[o]];else n=e;return n},toBool:function(e){if(t.isBoolean(e))return e;if(t.isString(e))return"true"===e.toLowerCase();throw new Error("The toBool() function only works with strings and booleans.")},mapKeys:function(e,o){return t.each(e,function(t,i,n){var r=o[i];r&&(e[r]=t,delete e[i])}),e},constructUrl:function(t){var o;return o=e.param(t),o=o.length>0?"?"+o:document.location.pathname},isMobile:function(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)},validate:function(e,t){var o=!0;switch(e){case"name":if(t){var i=/^[a-zA-Z \-]+$/i;o=i.test(t)}break;case"email":if(t){var n=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;o=n.test(t)}break;case"phone":if(t){t=t.replace(/[.()-]/g,"").replace(/ /,"");var r=/^[0-9]{7,25}$/;o=r.test(t)}break;case"passport":if(t){var a=/^[\w\d]{1,12}$/;o=a.test(t)}break;case"countryCode":if(t){var s=/^[a-zA-Z]{3,}$/;o=s.test(t)}break;case"date":if(t){var u=/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/;o=u.test(t)}break;case"dateTextInput":if(t){var u=/^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}$/;o=u.test(t)}}return Boolean(o)},getCurrentDate:function(){var e=new Date,t=e.getDate(),o=e.getMonth()+1,i=e.getFullYear();return o+"/"+t+"/"+i}}}),function(e){"function"==typeof define&&define.amd?define("libs/jquery.cookie",["jquery"],e):e(jQuery)}(function(e){function t(e){return s.raw?e:encodeURIComponent(e)}function o(e){return s.raw?e:decodeURIComponent(e)}function i(e){return t(s.json?JSON.stringify(e):String(e))}function n(e){0===e.indexOf('"')&&(e=e.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return e=decodeURIComponent(e.replace(a," ")),s.json?JSON.parse(e):e}catch(t){}}function r(t,o){var i=s.raw?t:n(t);return e.isFunction(o)?o(i):i}var a=/\+/g,s=e.cookie=function(n,a,u){if(void 0!==a&&!e.isFunction(a)){if(u=e.extend({},s.defaults,u),"number"==typeof u.expires){var c=u.expires,p=u.expires=new Date;p.setTime(+p+864e5*c)}return document.cookie=[t(n),"=",i(a),u.expires?"; expires="+u.expires.toUTCString():"",u.path?"; path="+u.path:"",u.domain?"; domain="+u.domain:"",u.secure?"; secure":""].join("")}for(var l=n?void 0:{},d=document.cookie?document.cookie.split("; "):[],f=0,m=d.length;m>f;f++){var h=d[f].split("="),k=o(h.shift()),g=h.join("=");if(n&&n===k){l=r(g,a);break}n||void 0===(g=r(g))||(l[k]=g)}return l};s.defaults={},e.removeCookie=function(t,o){return void 0===e.cookie(t)?!1:(e.cookie(t,"",e.extend({},o,{expires:-1})),!e.cookie(t))}}),define("core/ef_plugins/disruptr",["jquery","core/global/helpers","underscore","libs/jquery.cookie"],function(e,t){!function(e,o,i,n){function r(o,i){this.element=o,this.$element=e(o),this.metadata=this.$element.data("disruptr-options"),this.options=e.extend({},c,i,this.metadata),this._defaults=c,this._name=u,this.options.startTimerOnInit=t.toBool(this.options.startTimerOnInit),this.isOpen=!1,this.viewCount=0,this.disable=!0,this.hasOpened=!1,this.init()}function a(e){this.plugin=e}function s(e){this.plugin=e}var u="disruptr",c={seconds:8,startTimerOnInit:!0,panelizrLink:"",sessionCookieName:"disruptedThisSession",longTermCookieName:"disruptedLongTerm",countKeyName:"Count",disableKeyName:"Disable",maxViewCount:2,openCallback:function(){},isMobile:!1,showDisruptr:!1};r.prototype={init:function(){var e=this;return e.options.openCallback&&!_.isFunction(e.options.openCallback)&&(e.options.openCallback=t.getFuncFromString(e.options.openCallback)),e.options.longTermCookieName&&(e.viewCount=e.readCookie(e.options.longTermCookieName,e.options.countKeyName),e.disable=e.readCookie(e.options.longTermCookieName,e.options.disableKeyName)),e.viewCount>=e.options.maxViewCount||e.hasSubmittedFormOrLogin()||"0"===e.facebookFormLink("hb")?void e.destroy():(this.timer=new a(e),void(e.options.startTimerOnInit&&e.timer.start()))},hasSubmittedFormOrLogin:function(){var e=this;return e.disable=e.readCookie(e.options.longTermCookieName,e.options.disableKeyName),1==e.disable},facebookFormLink:function(e){for(var t=o.location.search.substring(1),i=t.split("&"),n=0;n<i.length;n++){var r=i[n].split("=");if(r[0]==e)return r[1]}return!1},open:function(){var t=this;this.showMobile()?(this.mobilizr=new s(t),t.mobilizr.init()):t.options.panelizrLink&&e(t.options.panelizrLink).click(),t.options.openCallback(),t.setCookies(),t.hasOpened=!0},showMobile:function(){return this.options.showDisruptr},readCookie:function(t,o){var i,n,r,a=this;if(!t||"string"!=typeof t||!o)return!1;if(e.cookie.raw=!0,r=e.cookie(t),e.cookie.raw=!1,r&&(n=a.deparamCookieToObj(r),i=n[o]),isNaN(i)){if("true"===i)return!0;switch(o){case this.options.countKeyName:i=0;break;case this.options.disableKeyName:i=!1;break;default:i=!1}}return i},deparamCookieToObj:function(e){for(var t={},o=e.split("&"),i=0;i<o.length;i++){var n=o[i].split("=");if(n[0]=decodeURIComponent(n[0]),n[1]=decodeURIComponent(n[1]),"undefined"==typeof t[n[0]])t[n[0]]=n[1];else if("string"==typeof t[n[0]]){var r=[t[n[0]],n[1]];t[n[0]]=r}else t[n[0]].push(n[1])}return t},setCookies:function(){var t=i.domain.toString(),o=t.split("."),n="."+o[o.length-2]+"."+o[o.length-1],r=this;if(r.viewCount<r.options.maxViewCount&&r.viewCount++,e.cookie.raw=!0,e.cookie(r.options.sessionCookieName,"true",{path:"/",domain:n}),""!==r.options.longTermCookieName){var a="Count="+r.viewCount+"&Disable="+r.disable;e.cookie(r.options.longTermCookieName,a,{expires:180,path:"/",domain:n})}e.cookie.raw=!1},destroy:function(){var e=this;"object"==typeof e.timer&&"function"==typeof e.timer.stop&&e.timer.stop(),e.$element.removeData("plugin_"+u)}},e.fn[u]=function(t){return this.each(function(){e.data(this,"plugin_"+u)||e.data(this,"plugin_"+u,new r(this,t))})},a.prototype={timeout:null,running:!1,wasStarted:!1,plugin:{},start:function(e){var t=this,i=this.plugin;return t.running?!1:e!==!0||t.wasStarted?(t.timeout=o.setTimeout(function(){i.hasOpened||i.hasSubmittedFormOrLogin()||(i.open(),t.running=!1)},1e3*i.options.seconds),t.running=!0,t.wasStarted=!0,!0):!1},stop:function(){var e=this;return e.running?(o.clearTimeout(e.timeout),e.running=!1,!0):!1}},s.prototype={init:function(){var t=this.plugin,o=e(".bottom-slide-bar"),i=e(".bottom-slide-bar #opt-in"),n=e(".bottom-slide-bar #opt-out"),r=o.outerHeight();o.css({bottom:"-"+r+"px",display:"block"}).animate({bottom:"0"}),i.click(function(){t.options.panelizrLink&&(e(t.options.panelizrLink).click(),o.remove())}),n.click(function(){o.remove()})}}}(e,window,document)});
//# sourceMappingURL=disruptr.js.map