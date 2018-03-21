(function ($) {
  $.fn.ellipsis = function (options) {
    var defaults = {
      'row' : 1,
      'maxTitleRow' : 2,
      'maxDescriptionRow' : 4,
      'maxRow' : 5,
      'onlyFullWords' : false,
      'char' : '...',
      'captionElement' : { div : 'DIV', span : 'SPAN'},
      'callback': function () {}
    };

    options = $.extend(defaults, options);

    this.each(function () {
      var $description = $(this);
      var text = $description.text();
      if (!text.length) {
        if ($description[0].tagName == options.captionElement.div) {
          var $title = $description.parent().find(options.captionElement.span);
          var titleRows = parseInt($title.height() / parseInt($title.css('line-height')));
          if (titleRows > options.maxTitleRow) {
            $title.ellipsis();
          }
        }
        return;
      }
      if ($description[0].tagName == options.captionElement.div) {
        var $title = $description.parent().find(options.captionElement.span);
        var titleRows = parseInt($title.height() / parseInt($title.css('line-height')));
        if (titleRows > options.maxTitleRow) {
          $title.ellipsis();
          titleRows = options.maxTitleRow;
        }
        $description.css('height', 'auto');
        $description.css('min-height', '0');
        $description.css('max-height', 'none');
        options.row = options.maxDescriptionRow;
        if (titleRows > 1) {
          options.row = (options.maxRow - titleRows);
        }
      } else {
        options.row = options.maxTitleRow;
      }
      var fullHeight = $description.height();
      var lineHeight =  parseInt($description.css("lineHeight"));
      var originRows = fullHeight / lineHeight;
      if (originRows > options.row) {
        var targetHeight = lineHeight * options.row;
        var start = 1;
        var end = text.length;
        while (start < end) {
          var length = Math.ceil((start + end) / 2);
          $description.text(text.slice(0, length) + options['char']);
          if ($description.height() <= targetHeight) {
            start = length;
          } else {
            end = length - 1;
          }
        }
        text = text.slice(0, start);
        if (options.onlyFullWords) {
          text = text.replace(/[\u00AD\w]+$/, '');
        }
        $description.text(text + options['char']);
        $description.css('height', '');
        $description.css('min-height', '');
        $description.css('max-height', '');
        options.callback.call(this);
      } else {
        $description.text(text);
        $description.css('height', '');
        $description.css('min-height', '');
        $description.css('max-height', '');
        options.callback.call(this);
      }
    });
    return this;
  };
}) (OO.$);

//jQuery
/*
 * Swiper 1.9+ - Mobile Touch Slider
 * http: //www.idangero.us/sliders/swiper/
 *
 * Copyright 2012-2013, Vladimir Kharlampidi
 * The iDangero.us
 * http: //www.idangero.us/
 *
 * Licensed under GPL & MIT
 *
 * Updated on: March 16, 2013
 */
var Swiper = function (selector, params) {
  /*=========================
   A little bit dirty but required part for IE8 and old FF support
   ===========================*/
  if (!window.addEventListener) {
    if (!window.Element) {
      Element = function () {
      };
    }
    Element.prototype.addEventListener = HTMLDocument.prototype.addEventListener = addEventListener = function (type, listener) {
      this.attachEvent('on' + type, listener);
    };
    Element.prototype.removeEventListener = HTMLDocument.prototype.removeEventListener = removeEventListener = function (type, listener) {
      this.detachEvent('on' + type, listener);
    };
  }
  if (document.body.__defineGetter__) {
    if (HTMLElement) {
      var element = HTMLElement.prototype;
      if (element.__defineGetter__) {
        element.__defineGetter__("outerHTML", function () {
          return new XMLSerializer().serializeToString(this);
        });
      }
    }
  }
  if (!window.getComputedStyle) {
    window.getComputedStyle = function (el) {
      this.el = el;
      this.getPropertyValue = function (prop) {
        var re = /(\-([a-z]) {1})/g;
        if (prop == 'float') {
          prop = 'styleFloat';
        }
        if (re.test(prop)) {
          prop = prop.replace(re, function () {
            return arguments[2].toUpperCase();
          });
        }
        return el.currentStyle[prop] ? el.currentStyle[prop] : null;
      };
      return this;
    };
  }

  /* End Of Polyfills*/
  if (!(selector.nodeType)) {
    if (!document.querySelectorAll || document.querySelectorAll(selector).length == 0) {
      return;
    }
  }

  function dQ(s) {
    return document.querySelectorAll(s);
  }

  var _this = this;
  _this.touches = {};
  _this.positions = {
    current: 0
  };
  _this.id = (new Date()).getTime();
  _this.container = (selector.nodeType) ? selector : dQ(selector)[0];
  _this.times = {};
  _this.isTouched = false;
  _this.realIndex = 0;
  _this.activeSlide = 0;
  _this.previousSlide = null;
  _this.langDirection = window.getComputedStyle(_this.container, null).getPropertyValue('direction');
  /*=========================
   New Support Object
   ===========================*/
  _this.support = {
    touch: _this.isSupportTouch(),
    threeD: _this.isSupport3D()
  };
  //For fallback with older versions
  _this.use3D = _this.support.threeD;

  /*=========================
   Default Parameters
   ===========================*/
  var defaults = {
    mode: 'horizontal',
    ratio: 1,
    speed: 300,
    freeMode: false,
    freeModeFluid: false,
    slidesPerSlide: 1,
    slidesPerGroup: 1,
    simulateTouch: true,
    followFinger: true,
    autoPlay: false,
    onlyExternal: false,
    createPagination: true,
    pagination: false,
    resistance: true,
    scrollContainer: false,
    preventLinks: true,
    initialSlide: 0,
    keyboardControl: false,
    mousewheelControl: false,
    resizeEvent: 'auto', //or 'resize' or 'orientationchange'
    //Namespace
    slideClass: 'swiper-slide',
    wrapperClass: 'swiper-wrapper',
    paginationClass: 'swiper-pagination-switch',
    paginationActiveClass: 'swiper-active-switch'
  };
  params = params || {};
  for (var prop in defaults) {
    if (defaults.hasOwnProperty(prop)) {
      if (!(prop in params)) {
        params[prop] = defaults[prop];
      }
    }
  }
  _this.params = params;
  if (params.scrollContainer) {
    params.freeMode = true;
    params.freeModeFluid = true;
  }
  var _widthFromCSS = false;
  if (params.slidesPerSlide == 'auto') {
    _widthFromCSS = true;
    params.slidesPerSlide = 1;
  }

  //Default Vars
  var wrapper, isHorizontal, slideSize, numOfSlides, wrapperSize, direction, isScrolling, containerSize;

  //Define wrapper
  for (var i = _this.container.childNodes.length - 1; i >= 0; i--) {
    if (_this.container.childNodes[i].className) {
      var _wrapperClasses = _this.container.childNodes[i].className.split(' ');

      for (var j = 0; j < _wrapperClasses.length; j++) {
        if (_wrapperClasses[j] === params.wrapperClass) {
          wrapper = _this.container.childNodes[i];
        }
      }
    }
  }
  _this.wrapper = wrapper;

  //Mode
  isHorizontal = params.mode == 'horizontal';

  //Define Touch Events
  _this.touchEvents = {
    touchStart: _this.support.touch || !params.simulateTouch ? 'touchstart' : (_this.ie10 ? 'MSPointerDown' : 'mousedown'),
    touchMove: _this.support.touch || !params.simulateTouch ? 'touchmove' : (_this.ie10 ? 'MSPointerMove' : 'mousemove'),
    touchEnd: _this.support.touch || !params.simulateTouch ? 'touchend' : (_this.ie10 ? 'MSPointerUp' : 'mouseup')
  };

  /*=========================
   Slide API
   ===========================*/
  _this._extendSwiperSlide = function (el) {
    el.append = function () {
      _this.wrapper.appendChild(el);
      _this.reInit();
      return el;
    };
    el.prepend = function () {
      _this.wrapper.insertBefore(el, _this.wrapper.firstChild);
      _this.reInit();
      return el;
    };
    el.insertAfter = function (index) {
      if (typeof index === 'undefined') {
        return false;
      }
      var beforeSlide = _this.slides[index + 1];
      _this.wrapper.insertBefore(el, beforeSlide);
      _this.reInit();
      return el;
    };
    el.clone = function () {
      return _this._extendSwiperSlide(el.cloneNode(true));
    };
    el.remove = function () {
      _this.wrapper.removeChild(el);
      _this.reInit();
    };
    el.html = function (html) {
      if (typeof html === 'undefined') {
        return el.innerHTML;
      } else {
        el.innerHTML = html;
        return el;
      }
    };
    el.index = function () {
      var index;
      for (var i = _this.slides.length - 1; i >= 0; i--) {
        if (el == _this.slides[i]) {
          index = i;
        }
      }
      return index;
    };
    el.isActive = function () {
      return el.index() == _this.activeSlide;
    };
    if (!el.swiperSlideDataStorage) {
      el.swiperSlideDataStorage = {};
    }
    el.getData = function (name) {
      return el.swiperSlideDataStorage[name];
    };
    el.setData = function (name, value) {
      el.swiperSlideDataStorage[name] = value;
      return el;
    };
    el.data = function (name, value) {
      if (!value) {
        return el.getAttribute('data-' + name);
      } else {
        el.setAttribute('data-' + name, value);
        return el;
      }
    };
    return el;
  };

  //Calculate information about slides
  _this._calcSlides = function () {
    var oldNumber = _this.slides ? _this.slides.length : false;
    _this.slides = [];
    for (var i = 0; i < _this.wrapper.childNodes.length; i++) {
      if (_this.wrapper.childNodes[i].className) {
        var _slideClasses = _this.wrapper.childNodes[i].className.split(' ');
        for (var j = 0; j < _slideClasses.length; j++) {
          if (_slideClasses[j] === params.slideClass) {
            _this.slides.push(_this.wrapper.childNodes[i]);
          }
        }
      }
    }
    for (var i = _this.slides.length - 1; i >= 0; i--) {
      _this._extendSwiperSlide(_this.slides[i]);
    }
    if (!oldNumber) {
      return;
    }
    if (oldNumber != _this.slides.length && _this.createPagination) {
      // Number of slides has been changed
      _this.createPagination();
      _this.callPlugins('numberOfSlidesChanged')
    }
    /*
     if (_this.langDirection=='rtl') {
     for (var i = 0; i < _this.slides.length; i++) {
     _this.slides[i].style.float="right"
     };
     }
     */
  };
  _this._calcSlides();

  //Create Slide
  _this.createSlide = function (html, slideClassList, el) {
    var slideClassList = slideClassList || _this.params.slideClass;
    var el = el || 'div';
    var newSlide = document.createElement(el);
    newSlide.innerHTML = html || '';
    newSlide.className = slideClassList;
    return _this._extendSwiperSlide(newSlide);
  };

  //Append Slide
  _this.appendSlide = function (html, slideClassList, el) {
    if (!html) {
      return;
    }
    if (html.nodeType) {
      return _this._extendSwiperSlide(html).append();
    } else {
      return _this.createSlide(html, slideClassList, el).append();
    }
  };
  _this.prependSlide = function (html, slideClassList, el) {
    if (!html) {
      return;
    }
    if (html.nodeType) {
      return _this._extendSwiperSlide(html).prepend();
    } else {
      return _this.createSlide(html, slideClassList, el).prepend();
    }
  };
  _this.insertSlideAfter = function (index, html, slideClassList, el) {
    if (!index) {
      return false;
    }
    if (index.nodeType) {
      return _this._extendSwiperSlide(index).insertAfter(index);
    } else {
      return _this.createSlide(html, slideClassList, el).insertAfter(index);
    }
  };
  _this.removeSlide = function (index) {
    if (_this.slides[index]) {
      _this.slides[index].remove();
      return true;
    } else {
      return false;
    }
  };
  _this.removeLastSlide = function () {
    if (_this.slides.length > 0) {
      _this.slides[(_this.slides.length - 1)].remove();
      return true;
    } else {
      return false;
    }
  };
  _this.removeAllSlides = function () {
    for (var i = _this.slides.length - 1; i >= 0; i--) {
      _this.slides[i].remove()
    }
  };
  _this.getSlide = function (index) {
    return _this.slides[index];
  };
  _this.getLastSlide = function () {
    return _this.slides[_this.slides.length - 1];
  };
  _this.getFirstSlide = function () {
    return _this.slides[0];
  };

  //Currently Active Slide
  _this.currentSlide = function () {
    return _this.slides[_this.activeSlide];
  };

  /*=========================
   Find All Plugins
   !!! Plugins API is in beta !!!
   ===========================*/
  var _plugins = [];
  for (var plugin in _this.plugins) {
    if (params[plugin]) {
      var p = _this.plugins[plugin](_this, params[plugin]);
      if (p) {
        _plugins.push(p);
      }
    }
  }

  _this.callPlugins = function (method, args) {
    if (!args) {
      args = {};
    }
    for (var i = 0; i < _plugins.length; i++) {
      if (method in _plugins[i]) {
        _plugins[i][method](args);
      }
    }
  };

  /*=========================
   WP8 Fix
   ===========================*/
  if (_this.ie10 && !params.onlyExternal) {
    if (isHorizontal) {
      _this.wrapper.classList.add('swiper-wp8-horizontal');
    } else {
      _this.wrapper.classList.add('swiper-wp8-vertical');
    }
  }

  /*=========================
   Loop
   ===========================*/
  if (params.loop) {
    (function () {
      numOfSlides = _this.slides.length;
      var slideFirstHTML = '';
      var slideLastHTML = '';
      //Grab First Slides
      for (var i = 0; i < params.slidesPerSlide; i++) {
        slideFirstHTML += _this.slides[i].outerHTML;
      }
      //Grab Last Slides
      for (var i = numOfSlides - params.slidesPerSlide; i < numOfSlides; i++) {
        slideLastHTML += _this.slides[i].outerHTML;
      }
      wrapper.innerHTML = slideLastHTML + wrapper.innerHTML + slideFirstHTML;
      _this._calcSlides();
      _this.callPlugins('onCreateLoop');
    })();
  }

  //Init Function
  var firstInit = false;

  _this.init = function (reInit) {
    var _width = window.getComputedStyle(_this.container, null).getPropertyValue('width');
    var _height = window.getComputedStyle(_this.container, null).getPropertyValue('height');
    var newWidth = parseInt(_width, 10);
    var newHeight = parseInt(_height, 10);

    //IE8 Fixes
    if (isNaN(newWidth) || _this.ie8 && (_width.indexOf('%') > 0)) {
      newWidth = _this.container.offsetWidth - parseInt(window.getComputedStyle(_this.container, null).getPropertyValue('padding-left'), 10) - parseInt(window.getComputedStyle(_this.container, null).getPropertyValue('padding-right'), 10);
    }
    if (isNaN(newHeight) || _this.ie8 && (_height.indexOf('%') > 0)) {
      newHeight = _this.container.offsetHeight - parseInt(window.getComputedStyle(_this.container, null).getPropertyValue('padding-top'), 10) - parseInt(window.getComputedStyle(_this.container, null).getPropertyValue('padding-bottom'), 10);
    }
    if (!reInit) {
      if (_this.width == newWidth && _this.height == newHeight) {
        return;
      }
    }
    if (reInit || firstInit) {
      _this._calcSlides();
      if (params.pagination) {
        _this.updatePagination();
      }
    }
    _this.width = newWidth;
    _this.height = newHeight;
    var dividerVertical = isHorizontal ? 1 : params.slidesPerSlide, dividerHorizontal = isHorizontal ? params.slidesPerSlide : 1, slideWidth, slideHeight, wrapperWidth, wrapperHeight;
    numOfSlides = _this.slides.length;
    if (!params.scrollContainer) {
      if (!_widthFromCSS) {
        slideWidth = _this.width / dividerHorizontal;
        slideHeight = _this.height / dividerVertical;
      } else {
        slideWidth = _this.slides[0].offsetWidth;
        slideHeight = _this.slides[0].offsetHeight;
      }
      containerSize = isHorizontal ? _this.width : _this.height;
      slideSize = isHorizontal ? slideWidth : slideHeight;
      wrapperWidth = isHorizontal ? numOfSlides * slideWidth : _this.width;
      wrapperHeight = isHorizontal ? _this.height : 'auto';
      if (_widthFromCSS) {
        //Re-Calc sps for pagination
        params.slidesPerSlide = Math.round(containerSize / slideSize);
      }
    } else {
      //Unset dimensions in vertical scroll container mode to recalculate slides
      if (!isHorizontal) {
        wrapper.style.width = '';
        wrapper.style.height = '';
        _this.slides[0].style.width = '';
        _this.slides[0].style.height = '';
      }
      slideWidth = _this.slides[0].offsetWidth;
      slideHeight = _this.slides[0].offsetHeight;
      containerSize = isHorizontal ? _this.width : _this.height;
      slideSize = isHorizontal ? slideWidth : slideHeight;
      wrapperWidth = slideWidth;
      wrapperHeight = slideHeight;
    }
    wrapperSize = isHorizontal ? wrapperWidth : wrapperHeight;
    for (var i = 0; i < _this.slides.length; i++) {
      var el = _this.slides[i];
      if (!_widthFromCSS) {
        el.style.width = slideWidth + "px";
        el.style.height = slideHeight + "px";
      }
      if (params.onSlideInitialize) {
        params.onSlideInitialize(_this, el);
      }
    }
    wrapper.style.width = wrapperWidth + "px";
    wrapper.style.height = wrapperHeight + "px";

    // Set Initial Slide Position
    if (params.initialSlide > 0 && params.initialSlide < numOfSlides && !firstInit) {
      _this.realIndex = _this.activeSlide = params.initialSlide;
      if (params.loop) {
        _this.activeSlide = _this.realIndex - params.slidesPerSlide;
      }
      if (isHorizontal) {
        _this.positions.current = -params.initialSlide * slideWidth;
        _this.setTransform(_this.positions.current, 0, 0);
      } else {
        _this.positions.current = -params.initialSlide * slideHeight;
        _this.setTransform(0, _this.positions.current, 0);
      }
    }
    if (!firstInit) {
      _this.callPlugins('onFirstInit');
    } else {
      _this.callPlugins('onInit');
    }
    firstInit = true;
  };
  _this.init();

  //ReInitizize function . Good to use after dynamically changes of Swiper, like after add/remove slides
  _this.reInit = function () {
    _this.init(true)
  };

  //Get Max And Min Positions
  function maxPos() {
    var a = (wrapperSize - containerSize);
    if (params.loop) {
      a = a - containerSize;
    }
    if (params.scrollContainer) {
      a = slideSize - containerSize;
      if (a < 0) {
        a = 0;
      }
    }
    if (params.slidesPerSlide > _this.slides.length) {
      a = 0;
    }
    return a;
  }

  function minPos() {
    var a = 0;
    if (params.loop) {
      a = containerSize;
    }
    return a;
  }

  /*=========================
   Pagination
   ===========================*/
  _this.updatePagination = function () {
    if (_this.slides.length < 2) {
      return;
    }
    var activeSwitch = dQ(params.pagination + ' .' + params.paginationActiveClass);
    if (!activeSwitch) {
      return;
    }
    for (var i = 0; i < activeSwitch.length; i++) {
      activeSwitch.item(i).className = params.paginationClass;
    }
    var pagers = dQ(params.pagination + ' .' + params.paginationClass).length;
    var minPagerIndex = params.loop ? _this.realIndex - params.slidesPerSlide : _this.realIndex;
    var maxPagerIndex = minPagerIndex + (params.slidesPerSlide - 1);
    for (var i = minPagerIndex; i <= maxPagerIndex; i++) {
      var j = i;
      if (j >= pagers) {
        j = j - pagers;
      }
      if (j < 0) {
        j = pagers + j;
      }
      if (j < numOfSlides) {
        dQ(params.pagination + ' .' + params.paginationClass).item(j).className = params.paginationClass + ' ' + params.paginationActiveClass;
      }
      if (i == minPagerIndex) {
        dQ(params.pagination + ' .' + params.paginationClass).item(j).className += ' swiper-activeslide-switch';
      }
    }
  };
  _this.createPagination = function () {
    if (params.pagination && params.createPagination) {
      var paginationHTML = "";
      var numOfSlides = _this.slides.length;
      var numOfButtons = params.loop ? numOfSlides - params.slidesPerSlide * 2 : numOfSlides;
      for (var i = 0; i < numOfButtons; i++) {
        paginationHTML += '<span class="' + params.paginationClass + '"></span>';
      }
      dQ(params.pagination)[0].innerHTML = paginationHTML;
      _this.updatePagination();

      _this.callPlugins('onCreatePagination');
    }
  };
  _this.createPagination();


  //Window Resize Re-init
  _this.resizeEvent = params.resizeEvent === 'auto' ? ('onorientationchange' in window) ? 'orientationchange' : 'resize' : params.resizeEvent;

  _this.resizeFix = function () {
    _this.callPlugins('beforeResizeFix');
    _this.init();
    //To fix translate value
    if (!params.scrollContainer) {
      _this.swipeTo(_this.activeSlide, 0, false);
    } else {
      var pos = isHorizontal ? _this.getTranslate('x') : _this.getTranslate('y');
      if (pos < -maxPos()) {
        var x = isHorizontal ? -maxPos() : 0;
        var y = isHorizontal ? 0 : -maxPos();
        _this.setTransition(0);
        _this.setTransform(x, y, 0);
      }
    }
    _this.callPlugins('afterResizeFix');
  };
  if (!params.disableAutoResize) {
    //Check for resize event
    window.addEventListener(_this.resizeEvent, _this.resizeFix, false);
  }

  /*==========================================
   Autoplay
   ============================================*/

  var autoPlay;
  _this.startAutoPlay = function () {
    if (params.autoPlay && !params.loop) {
      autoPlay = setInterval(function () {
        var newSlide = _this.realIndex + 1;
        if (newSlide == numOfSlides) {
          newSlide = 0;
        }
        _this.swipeTo(newSlide);
      }, params.autoPlay);
    } else if (params.autoPlay && params.loop) {
      autoPlay = setInterval(function () {
        _this.fixLoop();
        _this.swipeNext(true);
      }, params.autoPlay);
    }
    _this.callPlugins('onAutoPlayStart');
  };
  _this.stopAutoPlay = function () {
    if (autoPlay) {
      clearInterval(autoPlay);
    }
    _this.callPlugins('onAutoPlayStop');
  };
  if (params.autoPlay) {
    _this.startAutoPlay();
  }

  /*==========================================
   Event Listeners
   ============================================*/

  if (!_this.ie10) {
    if (_this.support.touch) {
      wrapper.addEventListener('touchstart', onTouchStart, false);
      wrapper.addEventListener('touchmove', onTouchMove, false);
      wrapper.addEventListener('touchend', onTouchEnd, false);
    }
    wrapper.addEventListener('mousedown', onTouchStart, false);
    document.addEventListener('mousemove', onTouchMove, false);
    document.addEventListener('mouseup', onTouchEnd, false);
  } else {
    wrapper.addEventListener(_this.touchEvents.touchStart, onTouchStart, false);
    document.addEventListener(_this.touchEvents.touchMove, onTouchMove, false);
    document.addEventListener(_this.touchEvents.touchEnd, onTouchEnd, false);
  }

  //Remove Events
  _this.destroy = function (removeResizeFix) {
    removeResizeFix = removeResizeFix === false ? removeResizeFix : removeResizeFix || true;
    if (removeResizeFix) {
      window.removeEventListener(_this.resizeEvent, _this.resizeFix, false);
    }

    if (_this.ie10) {
      wrapper.removeEventListener(_this.touchEvents.touchStart, onTouchStart, false);
      document.removeEventListener(_this.touchEvents.touchMove, onTouchMove, false);
      document.removeEventListener(_this.touchEvents.touchEnd, onTouchEnd, false);
    } else {
      if (_this.support.touch) {
        wrapper.removeEventListener('touchstart', onTouchStart, false);
        wrapper.removeEventListener('touchmove', onTouchMove, false);
        wrapper.removeEventListener('touchend', onTouchEnd, false);
      }
      wrapper.removeEventListener('mousedown', onTouchStart, false);
      document.removeEventListener('mousemove', onTouchMove, false);
      document.removeEventListener('mouseup', onTouchEnd, false);
    }

    if (params.keyboardControl) {
      document.removeEventListener('keydown', handleKeyboardKeys, false);
    }
    if (params.mousewheelControl && _this._wheelEvent) {
      _this.container.removeEventListener(_this._wheelEvent, handleMousewheel, false);
    }
    if (params.autoPlay) {
      _this.stopAutoPlay();
    }
    _this.callPlugins('onDestroy');
  };
  /*=========================
   Prevent Links
   ===========================*/

  _this.allowLinks = true;
  if (params.preventLinks) {
    var links = _this.container.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', preventClick, false);
    }
  }
  function preventClick(e) {
    if (!_this.allowLinks) {
      e.preventDefault();
    }
  }

  /*==========================================
   Keyboard Control
   ============================================*/
  if (params.keyboardControl) {
    function handleKeyboardKeys(e) {
      var kc = e.keyCode || e.charCode;
      if (isHorizontal) {
        if (kc == 37 || kc == 39) {
          e.preventDefault();
        }
        if (kc == 39) {
          _this.swipeNext();
        }
        if (kc == 37) {
          _this.swipePrev();
        }
      } else {
        if (kc == 38 || kc == 40) {
          e.preventDefault();
        }
        if (kc == 40) {
          _this.swipeNext();
        }
        if (kc == 38) {
          _this.swipePrev();
        }
      }
    }
    document.addEventListener('keydown', handleKeyboardKeys, false);
  }

  /*==========================================
   Mousewheel Control. Beta!
   ============================================*/
  // detect available wheel event
  _this._wheelEvent = false;

  if (params.mousewheelControl) {
    if (document.onmousewheel !== undefined) {
      _this._wheelEvent = "mousewheel";
    }
    try {
      WheelEvent("wheel");
      _this._wheelEvent = "wheel";
    } catch (e) {
    }
    if (!_this._wheelEvent) {
      _this._wheelEvent = "DOMMouseScroll";
    }
    function handleMousewheel(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      var we = _this._wheelEvent;
      var delta;
      //Opera & IE
      if (e.detail) {
        delta = -e.detail;
      }
      //WebKits
      else if (we == 'mousewheel') {
        delta = e.wheelDelta;
      }
      //Old FireFox
      else if (we == 'DOMMouseScroll') {
        delta = -e.detail;
      }
      //New FireFox
      else if (we == 'wheel') {
        delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? -e.deltaX : -e.deltaY;
      }
      if (!params.freeMode) {
        if (delta < 0) {
          _this.swipeNext();
        } else {
          _this.swipePrev();
        }
      } else {
        //Freemode or scrollContainer:
        var currentTransform = isHorizontal ? _this.getTranslate('x') : _this.getTranslate('y');
        var x, y;
        if (isHorizontal) {
          x = _this.getTranslate('x') + delta;
          y = _this.getTranslate('y');
          if (x > 0) {
            x = 0;
          }
          if (x < -maxPos()) {
            x = -maxPos();
          }
        } else {
          x = _this.getTranslate('x');
          y = _this.getTranslate('y') + delta;
          if (y > 0) {
            y = 0;
          }
          if (y < -maxPos()) {
            y = -maxPos();
          }
        }
        _this.setTransition(0);
        _this.setTransform(x, y, 0);
      }

      e.preventDefault();
      return false;
    }

    if (_this._wheelEvent) {
      _this.container.addEventListener(_this._wheelEvent, handleMousewheel, false);
    }
  }
  /*=========================
   Grab Cursor
   ===========================*/
  if (params.grabCursor) {
    _this.container.style.cursor = 'move';
    _this.container.style.cursor = 'grab';
    _this.container.style.cursor = '-moz-grab';
    _this.container.style.cursor = '-webkit-grab';
  }
  /*=========================
   Handle Touches
   ===========================*/
  //Detect event type for devices with both touch and mouse support
  var isTouchEvent = false;

  function onTouchStart(event) {
    //Exit if slider is already was touched
    if (_this.isTouched || params.onlyExternal) {
      return false;
    }
    //Check For Nested Swipers
    _this.isTouched = true;
    isTouchEvent = event.type == 'touchstart';
    if (!isTouchEvent || event.targetTouches.length == 1) {
      _this.callPlugins('onTouchStartBegin');
      if (params.loop) {
        _this.fixLoop();
      }
      if (!isTouchEvent) {
        if (event.preventDefault) {
          event.preventDefault();
        } else {
          event.returnValue = false;
        }
      }
      var pageX = isTouchEvent ? event.targetTouches[0].pageX : (event.pageX || event.clientX);
      var pageY = isTouchEvent ? event.targetTouches[0].pageY : (event.pageY || event.clientY);

      //Start Touches to check the scrolling
      _this.touches.startX = _this.touches.currentX = pageX;
      _this.touches.startY = _this.touches.currentY = pageY;
      _this.touches.start = _this.touches.current = isHorizontal ? _this.touches.startX : _this.touches.startY;

      //Set Transition Time to 0
      _this.setTransition(0);

      //Get Start Translate Position
      _this.positions.start = _this.positions.current = isHorizontal ? _this.getTranslate('x') : _this.getTranslate('y');

      //Set Transform
      if (isHorizontal) {
        _this.setTransform(_this.positions.start, 0, 0);
      } else {
        _this.setTransform(0, _this.positions.start, 0);
      }

      //TouchStartTime
      var tst = new Date();
      _this.times.start = tst.getTime();

      //Unset Scrolling
      isScrolling = undefined;

      //Define Clicked Slide without additional event listeners
      if (params.onSlideClick || params.onSlideTouch) {
        (function () {
          var el = _this.container;
          var box = el.getBoundingClientRect();
          var body = document.body;
          var clientTop = el.clientTop || body.clientTop || 0;
          var clientLeft = el.clientLeft || body.clientLeft || 0;
          var scrollTop = window.pageYOffset || el.scrollTop;
          var scrollLeft = window.pageXOffset || el.scrollLeft;
          var x = pageX - box.left + clientLeft - scrollLeft;
          var y = pageY - box.top - clientTop - scrollTop;
          var touchOffset = isHorizontal ? x : y;
          var beforeSlides = -Math.round(_this.positions.current / slideSize);
          var realClickedIndex = Math.floor(touchOffset / slideSize) + beforeSlides;
          var clickedIndex = realClickedIndex;
          if (params.loop) {
            clickedIndex = realClickedIndex - params.slidesPerSlide;
            if (clickedIndex < 0) {
              clickedIndex = _this.slides.length + clickedIndex - (params.slidesPerSlide * 2);
            }

          }
          _this.clickedSlideIndex = clickedIndex;
          _this.clickedSlide = _this.getSlide(realClickedIndex);
          if (params.onSlideTouch) {
            params.onSlideTouch(_this);
            _this.callPlugins('onSlideTouch');
          }
        })();
      }

      //CallBack
      if (params.onTouchStart) {
        params.onTouchStart(_this);
      }
      _this.callPlugins('onTouchStartEnd');
    }
  }

  function onTouchMove(event) {
    // If slider is not touched - exit
    if (!_this.isTouched || params.onlyExternal) {
      return;
    }
    if (isTouchEvent && event.type == 'mousemove') {
      return;
    }
    var pageX = isTouchEvent ? event.targetTouches[0].pageX : (event.pageX || event.clientX);
    var pageY = isTouchEvent ? event.targetTouches[0].pageY : (event.pageY || event.clientY);

    //check for scrolling
    if (typeof isScrolling === 'undefined' && isHorizontal) {
      isScrolling = !!(isScrolling || Math.abs(pageY - _this.touches.startY) > Math.abs(pageX - _this.touches.startX));
    }
    if (typeof isScrolling === 'undefined' && !isHorizontal) {
      isScrolling = !!(isScrolling || Math.abs(pageY - _this.touches.startY) < Math.abs(pageX - _this.touches.startX));
    }
    if (isScrolling) {
      return;
    }

    //Check For Nested Swipers
    if (event.assignedToSwiper) {
      _this.isTouched = false;
      return;
    }
    event.assignedToSwiper = true;

    //Block inner links
    if (params.preventLinks) {
      _this.allowLinks = false;
    }

    //Stop AutoPlay if exist
    if (params.autoPlay) {
      _this.stopAutoPlay();
    }
    if (!isTouchEvent || event.touches.length == 1) {

      _this.callPlugins('onTouchMoveStart');

      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
      _this.touches.current = isHorizontal ? pageX : pageY;
      _this.positions.current = (_this.touches.current - _this.touches.start) * params.ratio + _this.positions.start;
      if (params.resistance) {
        //Resistance for Negative-Back sliding
        if (_this.positions.current > 0 && !(params.freeMode && !params.freeModeFluid)) {
          if (params.loop) {
            var resistance = 1;
            if (_this.positions.current > 0) {
              _this.positions.current = 0;
            }
          } else {
            var resistance = (containerSize * 2 - _this.positions.current) / containerSize / 2;
          }
          if (resistance < 0.5) {
            _this.positions.current = (containerSize / 2);
          } else {
            _this.positions.current = _this.positions.current * resistance;
          }
        }

        //Resistance for After-End Sliding
        if ((_this.positions.current) < -maxPos() && !(params.freeMode && !params.freeModeFluid)) {
          if (params.loop) {
            var resistance = 1;
            var newPos = _this.positions.current;
            var stopPos = -maxPos() - containerSize;
          } else {
            var diff = (_this.touches.current - _this.touches.start) * params.ratio + (maxPos() + _this.positions.start);
            var resistance = (containerSize + diff) / (containerSize);
            var newPos = _this.positions.current - diff * (1 - resistance) / 2;
            var stopPos = -maxPos() - containerSize / 2;
          }

          if (newPos < stopPos || resistance <= 0) {
            _this.positions.current = stopPos;
          } else {
            _this.positions.current = newPos;
          }
        }
      }

      //Move Slides
      if (!params.followFinger) {
        return;
      }
      if (isHorizontal) {
        _this.setTransform(_this.positions.current, 0, 0);
      } else {
        _this.setTransform(0, _this.positions.current, 0);
      }
      if (params.freeMode) {
        _this.updateActiveSlide(_this.positions.current);
      }

      //Prevent onSlideClick Fallback if slide is moved
      if (params.onSlideClick && _this.clickedSlide) {
        _this.clickedSlide = false;
      }

      //Grab Cursor
      if (params.grabCursor) {
        _this.container.style.cursor = 'move';
        _this.container.style.cursor = 'grabbing';
        _this.container.style.cursor = '-moz-grabbin';
        _this.container.style.cursor = '-webkit-grabbing';
      }
      var state = (_this.touches.current - _this.touches.start);
      state = state < 0 ? state * -1 : state;
      if (state <= 2) {
        _this.clickedSlide = _this.getSlide(_this.clickedSlideIndex);
      } else {
        _this.clickedSlide = false;
      }

      //Callbacks
      _this.callPlugins('onTouchMoveEnd');
      if (params.onTouchMove) {
        params.onTouchMove(_this);
      }
      return false;
    }
  }

  function onTouchEnd(event) {
    // If slider is not touched exit
    if (params.onlyExternal || !_this.isTouched) {
      return;
    }
    _this.isTouched = false;

    //Release inner links
    if (params.preventLinks) {
      setTimeout(function () {
        _this.allowLinks = true;
      }, 10);
    }

    //Return Grab Cursor
    if (params.grabCursor) {
      _this.container.style.cursor = 'move';
      _this.container.style.cursor = 'grab';
      _this.container.style.cursor = '-moz-grab';
      _this.container.style.cursor = '-webkit-grab';
    }

    //onSlideClick
    if (params.onSlideClick && _this.clickedSlide) {
      params.onSlideClick(_this, event);
      _this.callPlugins('onSlideClick');
    }

    //Check for Current Position
    if (!_this.positions.current && _this.positions.current !== 0) {
      _this.positions.current = _this.positions.start;
    }
    var tet = new Date();
    _this.times.end = tet.getTime();

    //Difference
    _this.touches.diff = _this.touches.current - _this.touches.start;
    _this.touches.abs = Math.abs(_this.touches.diff);
    _this.positions.diff = _this.positions.current - _this.positions.start;
    _this.positions.abs = Math.abs(_this.positions.diff);
    var diff = _this.positions.diff;
    var diffAbs = _this.positions.abs;
    if (diffAbs < 5 && diff != 0) {
      _this.swipeReset();
    }

    //Start Pods implementation
    if (wrapperSize == 'auto') {
      if (params.orientation == 'horizontal') {
        wrapperSize = _this.wrapper.clientWidth;
      } else {
        wrapperSize = _this.wrapper.clientHeight;
      }
    }
    //End Pods implementation

    var maxPosition = wrapperSize - containerSize;
    if (params.scrollContainer) {
      maxPosition = slideSize - containerSize;
    }
    var groupSize = slideSize * params.slidesPerGroup;
    //Start Pods implementation
    if (_this.container.parentNode.children[1] && _this.container.parentNode.children[1].className.indexOf('oo-previous') != -1) {
      _this.container.parentNode.children[1].style.display = 'block';
    }
    if (_this.container.parentNode.children[0] && _this.container.parentNode.children[0].className.indexOf('oo-next') != -1) {
      _this.container.parentNode.children[0].style.display = 'block';
    }

    if (_this.positions.current + groupSize * 0.5 >= 0) {
      if (_this.container.parentNode.children[1] && _this.container.parentNode.children[1].className.indexOf('oo-previous') != -1) {
        _this.container.parentNode.children[1].style.display = 'none';
      }
    }
    if (parseFloat(_this.wrapper.style.width) + _this.positions.current - containerSize == 0) {
      if (_this.container.parentNode.children[0] && _this.container.parentNode.children[0].className.indexOf('oo-next') != -1) {
        _this.container.parentNode.children[0].style.display = 'none';
      }
    }

    //Prevent Negative Back Sliding
    if (_this.positions.current > 0) {
      _this.swipeReset();

      //pods implementation
      if (_this.container.parentNode.children[1] && _this.container.parentNode.children[1].className.indexOf('oo-previous') != -1) {
        _this.container.parentNode.children[1].style.display = 'none';
      }
      if (params.onTouchEnd) {
        params.onTouchEnd(_this);
      }
      _this.callPlugins('onTouchEnd');
      return;
    }

    //Start pods implementation
    var spasing = params.spasing || 0;

    //End pods implementation
    //Prevent After-End Sliding
    if (_this.positions.current < -maxPosition - spasing) {
      _this.swipeReset();

      //pods implementation
      if (_this.container.parentNode.children[0] && _this.container.parentNode.children[0].className.indexOf('oo-next') != -1) {
        _this.container.parentNode.children[0].style.display = 'none';
      }
      if (params.onTouchEnd) {
        params.onTouchEnd(_this);
      }
      _this.callPlugins('onTouchEnd');
      return;
    }

    //Free Mode
    if (params.freeMode) {
      if ((_this.times.end - _this.times.start) < 300 && params.freeModeFluid) {
        var newPosition = _this.positions.current + _this.touches.diff * 2;
        if (newPosition < maxPosition * (-1)) {
          newPosition = -maxPosition;
        }
        if (newPosition > 0) {
          newPosition = 0;
        }
        if (isHorizontal) {
          _this.setTransform(newPosition, 0, 0);
        } else {
          _this.setTransform(0, newPosition, 0);
        }

        _this.setTransition((_this.times.end - _this.times.start) * 2);
        _this.updateActiveSlide(newPosition);
      }
      if (!params.freeModeFluid || (_this.times.end - _this.times.start) >= 300) {
        _this.updateActiveSlide(_this.positions.current);
      }
      if (params.onTouchEnd) {
        params.onTouchEnd(_this);
      }
      _this.callPlugins('onTouchEnd');
      return;
    }

    //Direction
    direction = diff < 0 ? "toNext" : "toPrev";

    //Short Touches
    if (direction == "toNext" && (_this.times.end - _this.times.start <= 300)) {
      if (diffAbs < 30) {
        if (diffAbs != 0) {
          _this.swipeReset();
        }
      } else {
        _this.swipeNext(true);
      }
    }
    if (direction == "toPrev" && (_this.times.end - _this.times.start <= 300)) {
      if (diffAbs < 30) {
        if (diffAbs != 0) {
          _this.swipeReset();
        }
      } else {
        _this.swipePrev(true);
      }
    }
    //Long Touches
    if (direction == "toNext" && (_this.times.end - _this.times.start > 300)) {
      if (diffAbs >= groupSize * 0.5) {
        _this.swipeNext(true);
      } else {
        if (diffAbs != 0) {
          _this.swipeReset();
        } else {
          _this.swipePrev(true);
        }
      }
    }
    if (direction == "toPrev" && (_this.times.end - _this.times.start > 300)) {
      if (diffAbs >= groupSize * 0.5) {
        _this.swipePrev(true);
      } else {
        if (_this.clickedSlide) {
          _this.swipeReset();
        } else {
          _this.swipeNext(true);
        }
      }
    }
    if (params.onTouchEnd) {
      params.onTouchEnd(_this);
    }
    _this.callPlugins('onTouchEnd');
  }

  /*=========================
   Swipe Functions
   ===========================*/
  _this.swipeNext = function (internal) {
    if (!internal && params.loop) {
      _this.fixLoop();
    }
    if (!internal && params.autoPlay) {
      _this.stopAutoPlay();
    }
    _this.callPlugins('onSwipeNext');
    var getTranslate = isHorizontal ? _this.getTranslate('x') : _this.getTranslate('y');
    var groupSize = slideSize * params.slidesPerGroup;
    var newPosition = Math.floor(Math.abs(getTranslate) / Math.floor(groupSize)) * groupSize + groupSize;
    var curPos = Math.abs(getTranslate);
    if (newPosition == wrapperSize) {
      return;
    }
    if (curPos >= maxPos() && !params.loop) {
      return;
    }
    if (newPosition > maxPos() && !params.loop) {
      newPosition = maxPos();
    }
    if (params.loop) {
      if (newPosition >= (maxPos() + containerSize)) {
        newPosition = maxPos() + containerSize;
      }
    }
    newPosition = parseInt(newPosition);
    if (isHorizontal) {
      _this.setTransform(-newPosition, 0, 0);
    } else {
      _this.setTransform(0, -newPosition, 0);
    }
    _this.setTransition(params.speed);

    //Update Active Slide
    _this.updateActiveSlide(-newPosition);

    //Run Callbacks
    slideChangeCallbacks();
    return true;
  };

  _this.swipePrev = function (internal) {
    if (!internal && params.loop) {
      _this.fixLoop();
    }
    if (!internal && params.autoPlay) {
      _this.stopAutoPlay();
    }
    _this.callPlugins('onSwipePrev');
    var getTranslate = isHorizontal ? _this.getTranslate('x') : _this.getTranslate('y');
    var groupSize = slideSize * params.slidesPerGroup;
    var newPosition = (Math.ceil(-getTranslate / groupSize) - 1) * groupSize;
    if (newPosition < 0) {
      newPosition = 0;
    }
    if (isHorizontal) {
      _this.setTransform(-newPosition, 0, 0);
    } else {
      _this.setTransform(0, -newPosition, 0);
    }
    _this.setTransition(params.speed);

    //Update Active Slide
    _this.updateActiveSlide(-newPosition);

    //Run Callbacks
    slideChangeCallbacks();
    return true;
  };

  _this.swipeReset = function () {
    _this.callPlugins('onSwipeReset');
    var getTranslate = isHorizontal ? _this.getTranslate('x') : _this.getTranslate('y');
    var groupSize = slideSize * params.slidesPerGroup;
    var newPosition = getTranslate < 0 ? Math.round(getTranslate / groupSize) * groupSize : 0;
    var maxPosition = -maxPos();
    if (params.scrollContainer) {
      newPosition = getTranslate < 0 ? getTranslate : 0;
      maxPosition = containerSize - slideSize;
    }
    if (newPosition <= maxPosition) {
      newPosition = maxPosition;
    }
    if (params.scrollContainer && (containerSize > slideSize)) {
      newPosition = 0;
    }

    if (params.mode == 'horizontal') {
      _this.setTransform(newPosition, 0, 0);
    } else {
      _this.setTransform(0, newPosition, 0);
    }
    _this.setTransition(params.speed);

    //Update Active Slide
    _this.updateActiveSlide(newPosition);

    //Reset Callback
    if (params.onSlideReset) {
      params.onSlideReset(_this);
    }
    return true;
  };

  var firstTimeLoopPositioning = true;

  _this.swipeTo = function (index, speed, runCallbacks) {

    index = parseInt(index, 10); //type cast to int
    _this.callPlugins('onSwipeTo', {index: index, speed: speed});

    if (index > (numOfSlides - 1)) {
      return;
    }
    if (index < 0 && !params.loop) {
      return;
    }
    runCallbacks = runCallbacks === false ? false : runCallbacks || true;
    var speed = speed === 0 ? speed : speed || params.speed;
    if (params.loop) {
      index = index + params.slidesPerSlide;
    }
    if (index > numOfSlides - params.slidesPerSlide) {
      index = numOfSlides - params.slidesPerSlide;
    }
    var newPosition = -index * slideSize;
    if (firstTimeLoopPositioning && params.loop && params.initialSlide > 0 && params.initialSlide < numOfSlides) {
      newPosition = newPosition - params.initialSlide * slideSize;
      firstTimeLoopPositioning = false;
    }
    if (isHorizontal) {
      _this.setTransform(newPosition, 0, 0);
    } else {
      _this.setTransform(0, newPosition, 0);
    }
    _this.setTransition(speed);
    _this.updateActiveSlide(newPosition);

    //Run Callbacks
    if (runCallbacks) {
      slideChangeCallbacks();
    }
    return true;
  };

  function slideChangeCallbacks() {
    //Transition Start Callback
    _this.callPlugins('onSlideChangeStart');
    if (params.onSlideChangeStart) {
      params.onSlideChangeStart(_this);
    }

    //Transition End Callback
    if (params.onSlideChangeEnd) {
      _this.transitionEnd(params.onSlideChangeEnd);
    }
  }

  _this.updateActiveSlide = function (position) {
    _this.previousSlide = _this.realIndex;
    _this.realIndex = Math.round(-position / slideSize);
    if (!params.loop) {
      _this.activeSlide = _this.realIndex;
    } else {
      _this.activeSlide = _this.realIndex - params.slidesPerSlide;
      if (_this.activeSlide >= numOfSlides - params.slidesPerSlide * 2) {
        _this.activeSlide = numOfSlides - params.slidesPerSlide * 2 - _this.activeSlide;
      }
      if (_this.activeSlide < 0) {
        _this.activeSlide = numOfSlides - params.slidesPerSlide * 2 + _this.activeSlide;
      }
    }
    if (_this.realIndex == numOfSlides) {
      _this.realIndex = numOfSlides - 1;
    }
    if (_this.realIndex < 0) {
      _this.realIndex = 0;
    }

    //Update Pagination
    if (params.pagination) {
      _this.updatePagination();
    }
  };

  /*=========================
   Loop Fixes
   ===========================*/
  _this.fixLoop = function () {
    //Fix For Negative Oversliding
    if (_this.realIndex < params.slidesPerSlide) {
      var newIndex = numOfSlides - params.slidesPerSlide * 3 + _this.realIndex;
      _this.swipeTo(newIndex, 0, false);
    }
    //Fix For Positive Oversliding
    if (_this.realIndex > numOfSlides - params.slidesPerSlide * 2) {
      var newIndex = -numOfSlides + _this.realIndex + params.slidesPerSlide;
      _this.swipeTo(newIndex, 0, false);
    }
  };
  if (params.loop) {
    _this.swipeTo(0, 0, false);
  }
};

Swiper.prototype = {
  plugins: {},
  //Transition End
  transitionEnd: function (callback) {
    var a = this;
    var el = a.wrapper;
    var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'];
    if (callback) {
      function fireCallBack() {
        callback(a);
        for (var i = 0; i < events.length; i++) {
          el.removeEventListener(events[i], fireCallBack, false);
        }
      }

      for (var i = 0; i < events.length; i++) {
        el.addEventListener(events[i], fireCallBack, false);
      }
    }
  },

  //Touch Support
  isSupportTouch: function () {
    return ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch;
  },

  // 3D Transforms Test
  isSupport3D: function () {
    var div = document.createElement('div');
    div.id = 'test3d';

    var s3d = false;
    if ("webkitPerspective" in div.style) {
      s3d = true;
    }
    if ("MozPerspective" in div.style) {
      s3d = true;
    }
    if ("OPerspective" in div.style) {
      s3d = true;
    }
    if ("MsPerspective" in div.style) {
      s3d = true;
    }
    if ("perspective" in div.style) {
      s3d = true;
    }

    /* Test with Media query for Webkit to prevent FALSE positive*/
    if (s3d && ("webkitPerspective" in div.style)) {
      var st = document.createElement('style');
      st.textContent = '@media (-webkit-transform-3d), (transform-3d), (-moz-transform-3d), (-o-transform-3d), (-ms-transform-3d) {#test3d{height: 5px}}';
      document.getElementsByTagName('head')[0].appendChild(st);
      document.body.appendChild(div);
      s3d = div.offsetHeight === 5;
      st.parentNode.removeChild(st);
      div.parentNode.removeChild(div);
    }

    return s3d;
  },

  //GetTranslate
  getTranslate: function (axis) {
    var el = this.wrapper;
    var matrix;
    var curTransform;
    if (window.WebKitCSSMatrix) {
      var transformMatrix = new WebKitCSSMatrix(window.getComputedStyle(el, null).webkitTransform);
      matrix = transformMatrix.toString().split(', ');
    } else {
      var transformMatrix = window.getComputedStyle(el, null).MozTransform || window.getComputedStyle(el, null).OTransform || window.getComputedStyle(el, null).MsTransform || window.getComputedStyle(el, null).msTransform || window.getComputedStyle(el, null).transform || window.getComputedStyle(el, null).getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1, ");
      matrix = transformMatrix.toString().split(', ');

    }
    if (axis == 'x') {
      //Crazy IE10 Matrix
      if (matrix.length == 16) {
        curTransform = parseInt(matrix[12], 10);
      }
      //Normal Browsers
      else {
        curTransform = parseInt(matrix[4], 10);
      }
    }
    if (axis == 'y') {
      //Crazy IE10 Matrix
      if (matrix.length == 16) {
        curTransform = parseInt(matrix[13], 10);
      }
      //Normal Browsers
      else {
        curTransform = parseInt(matrix[5], 10);
      }
    }
    return curTransform || 0;
  },

  //Set Transform
  setTransform: function (x, y, z) {
    var es = this.wrapper.style;
    x = parseInt(x) || 0;
    y = parseInt(y) || 0;
    z = parseInt(z) || 0;

    if (this.support.threeD) {
      es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)';
    } else {
      es.webkitTransform = es.MsTransform = es.msTransform = es.MozTransform = es.OTransform = es.transform = 'translate(' + x + 'px, ' + y + 'px)';
      if (this.ie8) {
        es.left = x + 'px';
        es.top = y + 'px';
      }
    }
    this.callPlugins('onSetTransform', {x: x, y: y, z: z})
  },

  //Set Transition
  setTransition: function (duration) {
    var es = this.wrapper.style;
    es.webkitTransitionDuration = es.MsTransitionDuration = es.msTransitionDuration = es.MozTransitionDuration = es.OTransitionDuration = es.transitionDuration = duration / 1000 + 's';
    this.callPlugins('onSetTransition', {duration: duration});
  },

  //Check for IE8
  ie8: (function () {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
      var ua = navigator.userAgent;
      var re = new RegExp("MSIE ([0-9]{1, }[\.0-9]{0, })");
      if (re.exec(ua) != null) {
        rv = parseFloat(RegExp.$1);
      }
    }
    return rv != -1 && rv < 9;
  })(),
  ie10: window.navigator.msPointerEnabled
};

/*=========================
 jQuery & Zepto Plugins
 ===========================*/
if (OO.$) {
  (function ($) {
    $.fn.swiper = function (params) {
      var s = new Swiper($(this)[0], params);
      $(this).data('swiper', s);
      return s;
    }
  })(OO.$)
}

OO.plugin("playlistsPlugin", function (OO, _, $) {

  var playlistsPlugin = {};

  playlistsPlugin.Playlists = function (mb) {
    this.elementId = '';
    this.messageBus = mb;
    this.instance = OO.publicApi ? new OO.publicApi.PlaylistsClass() : new OO.PlaylistsClass();
    this.init();
  };

  playlistsPlugin.Playlists.prototype = {
    init: function () {
      this.messageBus.subscribe(OO.EVENTS.SET_EMBED_CODE, 'podsPlugin', _.bind(this.onSetEmbedCode, this));
      this.messageBus.subscribe(OO.EVENTS.PLAYER_CREATED, 'podsPlugin', _.bind(this.onPlayerCreated, this));
    },

    onPlayerCreated: function (event, elementId, params) {
      if (params['playlistsPlugin']) {
        this.elementId = elementId;
        var mergedConfig = params['playlistsPlugin'];
        var playerParams = OO.playerParams;
        if (params.height) {
          playerParams.height = params.height;
        }
        if (params.width) {
          playerParams.width = params.width;
        }
        this.instance.Create(elementId, mergedConfig || params['playlistsPlugin'], $, _, playerParams, this.messageBus, params); //call create method
      }
    },

    onSetEmbedCode: function (event, embedCode) {
      if (OO.playerParams && OO.playerParams.ooyalaAds) {
        this.instance.ooyalaAds = true;
      } else {
        this.instance.ooyalaAds = false;
      }
      if (this.instance && this.instance.playerCreateParams && this.instance.setFirstVideoFromPlaylist === false &&
          JSON.parse(this.instance.playerCreateParams["useFirstVideoFromPlaylist"])) {
        this.instance.setFirstVideoFromPlaylist = true;
        if (this.instance.ooyalaAds) {
          this.instance.messageBus.publish(OO.EVENTS.SET_EMBED_CODE_AFTER_OOYALA_AD, this.instance.apiEmbedCode, OO.playerParams);
        } else {
          this.instance.messageBus.publish(OO.EVENTS.SET_EMBED_CODE, this.instance.apiEmbedCode, this.instance.playerCreateParams);
        }
      }
      
      if (this.instance.pluginState.currentEmbedCode == '' && this.instance.pluginState.initialVideoEmbedCode == '') {
        this.instance.pluginState.initialVideoEmbedCode = embedCode;
      }
      this.instance.pluginState.currentEmbedCode = embedCode;
    },
    __end_marker: true
  };

  return playlistsPlugin.Playlists;
});   // playlists oo plugin

(function () {
  var console = window.console;
  var PlaylistsClass;
  PlaylistsClass = function () {
    var Playlists, Identifiers, $, _, DataHelper;
    Playlists = function () {
      this.getMetadataURL = false;
      this.metadataCallFlag = false;
      this.apiEmbedCode = '';
      this.playerClass = '';
      this.wrapperID = 'PlaylistsPlayerWrapper-';
      this.aspectRatio = 1.77777;  // 16: 9
      this.isBound = false;
      this.Data = {};
      this.PlaylistsData = {};
      this.PlaylistMetaData = {};
      this.PlaylistsIDs = []; //id array of playlists
      this.PlaylistsMap = [];
      this.messageBus = {};
      this.swiperInstance = null;
      this.playerParams = null;
      this.playerCreateParams = null;
      this.pluginState = {
        currentPlaylist: '',
        currentEmbedCode: '',
        initialVideoEmbedCode: '',
        currentVideoIndex: 0,
        lastEmbedCodeInPlaylist: '',
        firstEmbedCodeInPlaylist: ''
      };

      //templates of pods. menu, current menu, pods, thumbnails
      //templates used by underscore
      this.templateSources = {
        Playlist: "<div id=\"<%- data.playlistID %>\" class=\"<%- data.playlistsClass %> unselectablePods\"><div class=\"oo-playlists-menu\"><ul class=\"oo-menu-items oo-cf\"></ul></div><div class=\"oo-thumbnail-scrolls\"><div class=\"oo-next\"></div><div class=\"oo-previous\"></div><div class=\"oo-playlists-thumbnails\"><ul id=\"oo-thumbnails-screensize\" class=\"oo-thumbnails-<%- data.playerId %>\"></ul></div></div></div>",

        Thumbnails: "<% _.each(data.playlist, function (thumbnail) { %><li class=\"oo-thumbnail\" id=\"<%- thumbnail.embed_code %>\" data-url=\"<%- thumbnail.url %>\" style=\"transform: translateX\(0\%\);\" ><img class=\"oo-thumbnail-image\" src=\"<%- thumbnail.image ? thumbnail.image : data.noPreview %>\" alt=\"\"><div class=\"oo-thumbnail-caption\"><div class=\"oo-caption-content\"><h3 class=\"oo-caption-title\"><span><%- thumbnail.name %></span></h3><div class=\"oo-caption-description\"><%- thumbnail.description %></div></div><p class=\"oo-caption-duration\"><%- data.timeConverter(thumbnail.duration) %></p></div></li> <% }); %>",

        MenuItems: "<% _.each(data.playlistsMap, " +
          "function (item, key) { %><li id=\"menu-item-<%- data.playlistsMap[key] %>\" class=\"oo-menu-item\"><a><%- data.playlistsMap[key] %></a></li> <% }); %>",
        CurrentMenuItem: "<div class=\"oo-menu-current\"><a onselectstart=\"return false;\"><span></span><%- data %></a></div>",
        CSS: "{1}.vs_showTitle_true .oo-caption-content"+
          "\n{"+
          "\n\toverflow:hidden; max-height:6.25em"+
          "\n}"+
          "\n{1} .oo-caption-content"+
          "\n{"+
          "\n\toverflow:hidden; max-height:5em"+
          "\n}"+
          "\n{0}"+
          "\n{"+
          "\n\tbackground:#000000;"+
          "\n}"+
          "\n{1} .oo-thumbnails-{2}, {1} .oo-menu-items"+
          "\n{"+
          "\n\tmargin: 0px; padding: 0px;"+
          "\n}"+
          "\n{1} a"+
          "\n{"+
          "\n\tcolor: white; text-decoration: none;"+
          "\n}"+
          "\n{0} .oo-menu-current.active + .oo-menu-items"+
          "\n{"+
          "\n\tdisplay:block;"+
          "\n}"+
          "\n{0}"+
          "\n{"+
          "\n\toverflow: hidden !important; position: absolute !important; z-index:999999;"+
          "\n}"+
          "\n{1}, #playerwrapper, .oo-thumbnail, .oo-thumbnail-caption"+
          "\n{"+
          "\n\tbox-sizing:border-box; -moz-box-sizing:border-box; -webkit-box-sizing:border-box; -ms-box-sizing:border-box; -o-box-sizing:border-box;"+
          "\n}"+
          "\n{1}"+
          "\n{"+
          "\n\twidth:100%; position:relative; padding:0px;"+
          "\n}"+
          "\n{1}[data-playlist-layout=none] {0}"+
          "\n{"+
          "\n\tdisplay:none;"+
          "\n}"+
          "\n{1}[data-playlist-layout=top]"+
          "\n{"+
          "\n\tpadding-top:0px"+
          "\n}"+
          "\n{1}[data-playlist-layout$=t] {0}"+
          "\n{"+
          "\n\theight:100%;"+
          "\n}"+
          "\n{1}[data-playlist-layout=bottom] {0}"+
          "\n{"+
          "\n\ttop:0px;left:0px;"+
          "\n}"+
          "\n{1}[data-playlist-layout=left] {0}"+
          "\n{"+
          "\n\tleft:0px;top:0px;"+
          "\n}"+
          "\n{1}[data-playlist-layout=right] {0}"+
          "\n{"+
          "\n\tright:0px;top:0px;"+
          "\n}"+
          "\n{0} .oo-playlists-thumbnails"+
          "\n{"+
          "\n\toverflow:hidden; position:relative;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=t] .oo-playlists-thumbnails"+
          "\n{"+
          "\n\twidth:100%; height:100%;"+
          "\n}"+
          "\n{0} .oo-thumbnails-{2}"+
          "\n{"+
          "\n\theight:auto !important;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=t] .oo-thumbnails-{2}"+
          "\n{"+
          "\n\twidth:100%!important;"+
          "\n}"+
          "\n{0} .oo-thumbnail-paging-{2}"+
          "\n{"+
          "\n\tfloat: left"+
          "\n}"+
          "\n{1}[data-playlist-layout*=o][data-playlist-pod-type=paging] .oo-thumbnails-{2}"+
          "\n{"+
          "\n\t"+
          "\n}"+
          "\n{1} .oo-thumbnails-{2}"+
          "\n{"+
          "\n\toverflow: hidden;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=o] .oo-playlists-thumbnails"+
          "\n{"+
          "\n\theight:100%;"+
          "\n}"+
          "\n{1}.vs-thumbnail-small[data-playlist-layout=right]"+
          "\n{"+
          "\n\tpadding-right:80px"+
          "\n}"+
          "\n{1}.vs-thumbnail-medium[data-playlist-layout=right]"+
          "\n{"+
          "\n\tpadding-right:120px"+
          "\n}"+
          "\n{1}.vs-thumbnail-large[data-playlist-layout=right]"+
          "\n{"+
          "\n\tpadding-right:160px"+
          "\n}"+
          "\n{1}.vs-thumbnail-small[data-playlist-layout=left]"+
          "\n{"+
          "\n\tpadding-left:80px"+
          "\n}"+
          "\n{1}.vs-thumbnail-medium[data-playlist-layout=left]"+
          "\n{"+
          "\n\tpadding-left:120px"+
          "\n}"+
          "\n{1}.vs-thumbnail-large[data-playlist-layout=left]"+
          "\n{"+
          "\n\tpadding-left:160px"+
          "\n}"+
          "\n{1}.vs-thumbnail-small[data-playlist-layout$=t] {0}"+
          "\n{"+
          "\n\twidth:80px"+
          "\n}"+
          "\n{1}.vs-thumbnail-medium[data-playlist-layout$=t] {0}"+
          "\n{"+
          "\n\twidth:120px"+
          "\n}"+
          "\n{1}.vs-thumbnail-large[data-playlist-layout$=t] {0}"+
          "\n{"+
          "\n\twidth:160px"+
          "\n}"+
          "\n{1}.vs-thumbnail-small[data-playlist-layout$=t] .oo-playlists-thumbnails,{1}.vs-thumbnail-small .oo-thumbnail,{1}.vs-thumbnail-small .oo-thumbnail-image"+
          "\n{"+
          "\n\twidth:80px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-medium[data-playlist-layout$=t] .oo-playlists-thumbnails,{1}.vs-thumbnail-medium .oo-thumbnail,{1}.vs-thumbnail-medium .oo-thumbnail-image"+
          "\n{"+
          "\n\twidth:120px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-large[data-playlist-layout$=t] .oo-playlists-thumbnails,{1}.vs-thumbnail-large .oo-thumbnail,{1}.vs-thumbnail-large .oo-thumbnail-image"+
          "\n{"+
          "\n\twidth:160px;"+
          "\n}"+
          "\n{1}.vs-caption-inside.vs-thumbnail-small .oo-thumbnail,{1}.vs-caption-inside.vs-thumbnail-small .oo-thumbnail-image"+
          "\n{"+
          "\n\theight:45px;"+
          "\n}"+
          "\n{1}.vs-caption-inside.vs-thumbnail-medium .oo-thumbnail,{1}.vs-caption-inside.vs-thumbnail-medium .oo-thumbnail-image"+
          "\n{"+
          "\n\theight:67.7px;"+
          "\n}"+
          "\n{1}.vs-caption-inside.vs-thumbnail-large .oo-thumbnail,{1}.vs-caption-inside.vs-thumbnail-large .oo-thumbnail-image"+
          "\n{"+
          "\n\theight:90px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-small.vs-caption-outside[data-playlist-layout$=t] .oo-thumbnail-image"+
          "\n{"+
          "\n\twidth:90px; height:51px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-medium.vs-caption-outside[data-playlist-layout$=t] .oo-thumbnail-image"+
          "\n{"+
          "\n\twidth:145px; height:82px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-large.vs-caption-outside[data-playlist-layout$=t] .oo-thumbnail-image"+
          "\n{"+
          "\n\twidth:190px;height:107px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-small.vs-caption-outside[data-playlist-layout$=t] .oo-thumbnail > *"+
          "\n{"+
          "\n\tmin-height:51px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-medium.vs-caption-outside[data-playlist-layout$=t] .oo-thumbnail > *"+
          "\n{"+
          "\n\tmin-height:82px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-large.vs-caption-outside[data-playlist-layout$=t] .oo-thumbnail> *"+
          "\n{"+
          "\n\tmin-height:107px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-small.vs-font-small  "+
          "\n{"+
          "\n\tfont-size:9px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-small.vs-font-medium "+
          "\n{"+
          "\n\tfont-size:10px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-small.vs-font-large  "+
          "\n{"+
          "\n\tfont-size:11px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-medium.vs-font-small "+
          "\n{"+
          "\n\tfont-size:10px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-medium.vs-font-medium"+
          "\n{"+
          "\n\tfont-size:12px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-medium.vs-font-large "+
          "\n{"+
          "\n\tfont-size:14px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-large.vs-font-small  "+
          "\n{"+
          "\n\tfont-size:12px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-large.vs-font-medium "+
          "\n{"+
          "\n\tfont-size:14px;"+
          "\n}"+
          "\n{1}.vs-thumbnail-large.vs-font-large  "+
          "\n{"+
          "\n\tfont-size:16px;"+
          "\n}"+
          "\n{1} .oo-thumbnail"+
          "\n{"+
          "\n\tdisplay:inline-block;  position:relative;  vertical-align:top;  cursor:pointer;  float:left;  overflow: hidden; line-height: normal;"+
          "\n}"+
          "\n{1}.vs-caption-outside[data-playlist-layout$=t] .oo-thumbnail"+
          "\n{"+
          "\n\twidth:100%;"+
          "\n}"+
          "\n{1}.vs-caption-outside[data-playlist-layout$=t] .oo-thumbnail-image"+
          "\n{"+
          "\n\tmargin:8px; vertical-align:top;"+
          "\n}"+
          "\n{1} .oo-thumbnail-caption"+
          "\n{"+
          "\n\tpadding:0px; font-size:1em;"+
          "\n}"+
          "\n{1}.vs-caption-outside[data-playlist-layout$=t] .oo-thumbnail-caption"+
          "\n{"+
          "\n\twidth:180px; float:none; display:inline-block; padding: 8px 8px 1.5em 4px;"+
          "\n}"+
          "\n{1}.vs-caption-outside[data-playlist-layout*=o] .oo-thumbnail-caption"+
          "\n{"+
          "\n\theight:7.5em;"+
          "\n}"+
          "\n{1}.vs-caption-outside.vs_showTitle_true.vs_showDuration_false.vs_showDescription_false[data-playlist-layout*=o] .oo-thumbnail-caption"+
          "\n{"+
          "\n\theight:1.7em;"+
          "\n}"+
          "\n{1}.vs-caption-outside.vs_showTitle_false.vs_showDuration_false.vs_showDescription_true[data-playlist-layout*=o] .oo-thumbnail-caption"+
          "\n{"+
          "\n\theight:5em;"+
          "\n}"+
          "\n{1}.vs-caption-outside.vs_showTitle_false.vs_showDuration_true.vs_showDescription_false[data-playlist-layout*=o] .oo-thumbnail-caption"+
          "\n{"+
          "\n\theight:1.5em;"+
          "\n}"+
          "\n{1}.vs-caption-outside.vs_showTitle_true.vs_showDuration_true.vs_showDescription_false[data-playlist-layout*=o] .oo-thumbnail-caption"+
          "\n{"+
          "\n\theight:4em;"+
          "\n}"+
          "\n{1}.vs-caption-outside.vs_showTitle_true.vs_showDuration_false.vs_showDescription_true[data-playlist-layout*=o] .oo-thumbnail-caption"+
          "\n{"+
          "\n\theight:6.25em;"+
          "\n}"+
          "\n{1}.vs-caption-outside.vs_showTitle_false.vs_showDuration_true.vs_showDescription_true[data-playlist-layout*=o] .oo-thumbnail-caption"+
          "\n{"+
          "\n\theight:6.5em;"+
          "\n}"+
          "\n{1}.vs-caption-inside .oo-thumbnail-caption"+
          "\n{"+
          "\n\tposition:absolute; bottom:0px; width:100%;max-height:100%; "+
          "\n}"+
          "\n{1}.vs-caption-inside[data-theme=\"dark\"] .oo-thumbnail-caption"+
          "\n{"+
          "\n\tbackground: none repeat scroll 0 0 rgba(0, 0, 0, 0.75); color:#A2A9A9;"+
          "\n}"+
          "\n{1}.vs-caption-inside[data-theme=\"light\"] .oo-thumbnail-caption"+
          "\n{"+
          "\n\tbackground: none repeat scroll 0 0 rgba(255, 255, 255, 0.6); color:#333333;"+
          "\n}"+
          "\n{1}.vs-caption-outside[data-theme=\"dark\"] .oo-thumbnail"+
          "\n{"+
          "\n\tbackground: none repeat scroll 0 0 #333333; color:#A2A9A9;"+
          "\n}"+
          "\n{1}.vs-caption-outside[data-theme=\"light\"] .oo-thumbnail"+
          "\n{"+
          "\n\tbackground: none repeat scroll 0 0 #EEEEEE; color:#333333;"+
          "\n}"+
          "\n{1}[data-theme=\"dark\"] .oo-caption-title"+
          "\n{"+
          "\n\tcolor:#D0D7DC;"+
          "\n}"+
          "\n{1}[data-theme=\"light\"] .oo-caption-title"+
          "\n{"+
          "\n\tcolor:#000000;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"] .oo-menu-current"+
          "\n{"+
          "\n\tdisplay:none!important;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=o] {0} .oo-menu-items"+
          "\n{"+
          "\n\toverflow:hidden;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=\"t\"] {0} .oo-menu-items"+
          "\n{"+
          "\n\tbackground: none repeat scroll 0 0 #333333; bottom: 0px; display: none; left: 0; overflow-y: auto; padding: 6px 0 0; position: absolute; top: 3em; width: 100%; z-index: 5;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout$=\"t\"] {0} .oo-menu-items"+
          "\n{"+
          "\n\tbackground: none repeat scroll 0 0 #E3E3E3;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=\"t\"] {0} .oo-menu-current"+
          "\n{"+
          "\n\tbackground: none repeat scroll 0 0 #000000; cursor: pointer;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout$=\"t\"] {0} .oo-menu-current"+
          "\n{"+
          "\n\tbackground: none repeat scroll 0 0 #FFFFFF; cursor: pointer;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=\"t\"] .menuShow .oo-menu-items"+
          "\n{"+
          "\n\tdisplay: block !important;"+
          "\n}"+
          "\n{1} {0} .oo-menu-item a"+
          "\n{"+
          "\n\tcolor: #B8C3CA; text-decoration: none;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=\"t\"] {0} .oo-menu-current a"+
          "\n{"+
          "\n\tdisplay: block; font-size: 1em; height: 1em; line-height: 1em; padding: 1em; overflow:hidden; text-overflow:ellipsis; "+
          "\n}"+
          "\n{1}[data-playlist-layout$=\"t\"] {0} .oo-menu-current a span"+
          "\n{"+
          "\n\tbackground: no-repeat scroll left center transparent; background-size: auto 0.45em !important; float:left; height:1em; width:0.5em;position: absolute; margin-left:-0.9em;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout$=\"t\"] {0} .oo-menu-current a"+
          "\n{"+
          "\n\tcolor: #222;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout$=\"t\"] {0} .oo-menu-current a span"+
          "\n{"+
          "\n\tbackground:  no-repeat scroll left center transparent; "+
          "\n}"+
          "\n{1}[data-playlist-layout$=\"t\"] .menuShow .oo-menu-current a span"+
          "\n{"+
          "\n\tbackground-position: right center !important;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout$=\"t\"] {0} .oo-menu-item a"+
          "\n{"+
          "\n\tbackground-color: #e3e3e3;"+
          "\n}"+
          "\n{1}  {0} .oo-menu-discover a"+
          "\n{"+
          "\n\tbackground-position: 15px center; background-repeat: no-repeat;"+
          "\n}"+
          "\n{1}[data-theme=light]  {0} .oo-menu-discover a"+
          "\n{"+
          "\n\t"+
          "\n}"+
          "\n.oo-menu-item a"+
          "\n{"+
          "\n\tcursor: pointer;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=\"t\"] {0} .oo-menu-item a"+
          "\n{"+
          "\n\tcolor: #B8C3CA; display: block; font-size: 1.1em; overflow: hidden; padding: 0.3em 0.3em 0.3em 1em; text-overflow: ellipsis;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout$=\"t\"] {0} .oo-menu-item a"+
          "\n{"+
          "\n\tcolor: #444;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=\"t\"] {0} .oo-menu-active a"+
          "\n{"+
          "\n\tcolor: #555555;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout$=\"t\"] {0} .oo-menu-active a"+
          "\n{"+
          "\n\tcolor: black;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"] {0} .oo-menu-active a"+
          "\n{"+
          "\n\tcolor: #555555;"+
          "\n}"+
          "\n{1}[data-theme=light] .oo-playlists-thumbnails"+
          "\n{"+
          "\n\tbackground-color: transparent;"+
          "\n}"+
          "\n{1}[data-theme=dark] .oo-playlists-thumbnails"+
          "\n{"+
          "\n\tbackground-color: transparent;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"] {0} .oo-menu-items"+
          "\n{"+
          "\n\toverflow: hidden;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"] {0} .menuShow .oo-menu-items"+
          "\n{"+
          "\n\tdisplay: block !important;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"] {0} .oo-playlists-menu"+
          "\n{"+
          "\n\theight:auto; overflow: hidden;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"] {0} .oo-menu-item"+
          "\n{"+
          "\n\tposition: relative; display: block; float: left; margin: 0 3px 0 0; line-height:2.5em; max-height: 2.5em; white-space:nowrap; max-width:48%; overflow:hidden; text-overflow:ellipsis; font-size:inherit;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"] {0} .oo-menu-item a"+
          "\n{"+
          "\n\tbackground-color: #313131; border-radius: 4px 4px 0 0; display: inline-block; font-size: 1.1em; padding: 0px 10px; overflow:hidden; text-overflow:ellipsis; box-sizing:border-box; -moz-box-sizing:border-box; -webkit-box-sizing:border-box; -o-box-sizing:border-box; -ms-box-sizing:border-box; width:100%; line-height:2.3em;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"] {0} .oo-menu-item a:after"+
          "\n{"+
          "\n\tcontent:\'\'; display:block; position:absolute; right:0px; height:100%; width:2px; background-color:transparent;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"][data-theme=light] {0} .oo-menu-item a"+
          "\n{"+
          "\n\tbackground-color: #aaaaaa; color:#FFFFFF;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"] {0} .oo-menu-discover a"+
          "\n{"+
          "\n\tbackground-position: 10px 46%; background-repeat: no-repeat; padding-left: 31px !important;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout*=\"o\"] {0} .oo-menu-discover a"+
          "\n{"+
          "\n\t"+
          "\n}"+
          "\n.theme-light {1}[data-playlist-layout*=\"o\"] {0} .oo-menu-active a"+
          "\n{"+
          "\n\tcolor:#fff; background-color: #999;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-current"+
          "\n{"+
          "\n\tdisplay: block !important; background: none repeat scroll 0 0 #000000; cursor: pointer;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-current"+
          "\n{"+
          "\n\tdisplay: block !important; background: none repeat scroll 0 0 #000000; cursor: pointer;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-current"+
          "\n{"+
          "\n\tbackground: none repeat scroll 0 0 #FFFFFF;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-current a span"+
          "\n{"+
          "\n\tbackground: no-repeat scroll left center transparent; background-size: auto 0.45em !important; float:left; height:1em; width:0.5em;position: absolute; margin-left:-0.9em;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-current a"+
          "\n{"+
          "\n\tdisplay: block; font-size: 1em; height: 1em; line-height: 1em; padding: 1em 15px 1em 37px; overflow:hidden; text-overflow:ellipsis; margin-left:0.5em;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .menuShow .oo-menu-current a span"+
          "\n{"+
          "\n\tbackground-position: center right !important;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-current a"+
          "\n{"+
          "\n\tbackground:  no-repeat scroll center left transparent; color: #222;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-items"+
          "\n{"+
          "\n\tbackground: none repeat scroll 0 0 #333; bottom: 0; display: none; left: 0; overflow-y: visible; padding: 6px 0 0; position: absolute; top: 3em; width: 100%; z-index: 5;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-items"+
          "\n{"+
          "\n\tbackground: none repeat scroll 0 0 #E3E3E3;"+
          "\n}"+
          "\n{1}[data-playlists-menu-style=buttons][data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-playlists-menu"+
          "\n{"+
          "\n\tpadding-bottom: 0px; position: static;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-item"+
          "\n{"+
          "\n\twidth: 50%;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-item a"+
          "\n{"+
          "\n\tbackground: none; padding-left: 31px;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-item a"+
          "\n{"+
          "\n\tbackground: none; color: #444; padding-left: 31px;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-active a"+
          "\n{"+
          "\n\tcolor: #000000;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-discover"+
          "\n{"+
          "\n\tbackground-position: 10px 46%; background-repeat: no-repeat;"+
          "\n}"+
          "\n{1}[data-theme=light][data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-menu-discover"+
          "\n{"+
          "\n\t"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"][data-playlist-menu-size=big] {0} .oo-playlists-menu"+
          "\n{"+
          "\n\theight: auto;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=t] .oo-next,{1}[data-playlist-layout$=t] .oo-previous"+
          "\n{"+
          "\n\twidth:100%; height:32px;  display:block; position:absolute; z-index:1; background-position: center center; background-repeat:no-repeat;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=t] .oo-next"+
          "\n{"+
          "\n\tbottom:0; "+
          "\n}"+
          "\n.theme-light  {1}[data-playlist-layout$=t] .oo-next"+
          "\n{"+
          "\n\t"+
          "\n}"+
          "\n{1}[data-playlist-layout$=t] .oo-previous"+
          "\n{"+
          "\n\ttop:0; "+
          "\n}"+
          "\n.theme-light {1}[data-playlist-layout$=t] .oo-previous"+
          "\n{"+
          "\n\t"+
          "\n}"+
          "\n.oo-thumbnail-scrolls"+
          "\n{"+
          "\n\tposition:relative;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=t] .oo-thumbnail-scrolls"+
          "\n{"+
          "\n\t-webkit-box-sizing: border-box; -moz-box-sizing: border-box; -o-box-sizing: border-box; -ms-box-sizing: border-box; box-sizing: border-box; "+
          "\n}"+
          "\n{1}[data-playlist-layout*=o] .oo-next,{1}[data-playlist-layout*=o] .oo-previous"+
          "\n{"+
          "\n\tbackground-position: center center; background-repeat: no-repeat; display: block; height: 100%; position: absolute; width: 32px; z-index: 1;"+
          "\n}"+
          "\n{1} .oo-next, .oo-previous"+
          "\n{"+
          "\n\tbackground-color: rgba(0, 0, 0, 0.75);"+
          "\n}"+
          "\n{1}.theme-light .oo-previous, {1}.theme-light .oo-next"+
          "\n{"+
          "\n\tbackground-color: rgba(255, 255, 255, 0.6);"+
          "\n}"+
          "\n{1}[data-playlist-layout*=o] .oo-next"+
          "\n{"+
          "\n\tright:0; top: 0;"+
          "\n}"+
          "\n.theme-light  {1}[data-playlist-layout*=o] .oo-next"+
          "\n{"+
          "\n\tright:0; top: 0;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=o] .oo-previous"+
          "\n{"+
          "\n\tleft:0; top: 0 "+
          "\n}"+
          "\n.theme-light  {1}[data-playlist-layout*=o] .oo-previous"+
          "\n{"+
          "\n\tleft:0; top:0}.color-picker-class"+
          "\n{"+
          "\n\tbackground-color: #313131; width: 19px; height: 19px; position: absolute; top: 5px; left: 3px; border: 1px solid rgba(0, 0, 0, .2); border-radius: 3px;"+
          "\n}"+
          "\n{1}[data-playlists-menu-style=\"buttons\"][data-playlist-layout*=\"o\"] {0} .oo-playlists-menu"+
          "\n{"+
          "\n\tposition:relative; padding-bottom:10px;"+
          "\n}"+
          "\n{1}[data-playlists-menu-style=\"buttons\"][data-playlist-layout*=\"o\"] {0} .oo-menu-item"+
          "\n{"+
          "\n\t"+
          "\n}"+
          "\n{1}[data-playlists-menu-style=\"buttons\"][data-playlist-layout*=\"o\"] {0} .oo-menu-items "+
          "\n{"+
          "\n\t"+
          "\n}"+
          "\n{1}[data-playlists-menu-style=\"buttons\"][data-playlist-layout*=\"o\"] .oo-menu-item a"+
          "\n{"+
          "\n\tborder-radius: 5em;  padding:0px 13px; "+
          "\n}"+
          "\n{1} .oo-caption-title,.vs_showTitle_false .oo-caption-title,{1} .oo-caption-description,.vs_showDescription_false .oo-caption-description,{1} .oo-caption-duration,.vs_showDuration_false .oo-caption-duration,{1}.vs_showTitle_false.vs_showDescription_false.vs_showDuration_false .oo-thumbnail-caption"+
          "\n{"+
          "\n\tdisplay:none;"+
          "\n}"+
          "\n{1}.vs_showTitle_true .oo-caption-title"+
          "\n{"+
          "\n\tdisplay:block;"+
          "\n}"+
          "\n{1}.vs_showDescription_true .oo-caption-description"+
          "\n{"+
          "\n\tdisplay:block;"+
          "\n}"+
          "\n{1}.vs_showDuration_true .oo-caption-duration"+
          "\n{"+
          "\n\tdisplay:block; margin: 0;"+
          "\n}"+
          "\n{1} .oo-thumbnail-caption"+
          "\n{"+
          "\n\tmargin:0; top:100%; bottom:0; padding: 0 0.25em; padding-left:0.5em;"+
          "\n}"+
          "\n{1} .oo-caption-title"+
          "\n{"+
          "\n\tmax-height:2.5em; overflow:hidden; font-weight:normal; font-size:1em; margin:0; padding: 0; line-height:1.25em;"+
          "\n}"+
          "\n{1} .oo-caption-title > span"+
          "\n{"+
          "\n\tfont-size:1.1em;  padding:0; font-weight:normal; word-break: break-word;"+
          "\n}"+
          "\n{1} .oo-caption-description"+
          "\n{"+
          "\n\tline-height: 1.25em; margin: 0; min-height: 3.75em; height: 6.25em; overflow: hidden; max-height:6.25em; word-break: break-word;"+
          "\n}"+
          "\n{1}.vs-caption-outside .oo-caption-duration"+
          "\n{"+
          "\n\tposition:absolute; bottom:0;"+
          "\n}"+
          "\n{1} .oo-caption-duration"+
          "\n{"+
          "\n\twhite-space:nowrap; overflow:hidden; height: 1.5em; line-height: 1.5em;"+
          "\n}"+
          "\n{1}.vs_showTitle_true.vs-caption-inside .oo-thumbnail-caption"+
          "\n{"+
          "\n\tmargin-top:-1.25em;"+
          "\n}"+
          "\n.vs_browser_chrome .vs_showTitle_true.vs-caption-inside .oo-thumbnail-caption"+
          "\n{"+
          "\n\tmargin-top:-1.25em;"+
          "\n}"+
          "\n{1}.vs_showTitle_true.vs_showDescription_false.vs_showDuration_false.vs-caption-inside .oo-thumbnail-caption"+
          "\n{"+
          "\n\tbottom:0; top:auto; margin-top:0;"+
          "\n}"+
          "\n{1} li.oo-thumbnail:hover .oo-thumbnail-caption"+
          "\n{"+
          "\n\tmargin-top:0; top:auto;"+
          "\n}"+
          "\n{1} .oo-one-tab .oo-thumbnail-scrolls"+
          "\n{"+
          "\n\ttop:0 !important;"+
          "\n}"+
          "\n{1} .oo-playlists-menu.oo-one-tab"+
          "\n{"+
          "\n\tdisplay: none;"+
          "\n}"+
          "\n{1}[data-playlist-layout*=\"o\"].oo-one-tab .oo-playlists-menu"+
          "\n{"+
          "\n\t display: none;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=\"t\"].oo-one-tab .oo-playlists-menu"+
          "\n{"+
          "\n\t display: none;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=\"t\"].oo-one-tab .oo-thumbnail-scrolls"+
          "\n{"+
          "\n\t top:0;"+
          "\n}"+
          "\n{1}[data-playlist-layout$=\"t\"].oo-one-tab .oo-playlists-thumbnails, {1}[data-playlist-layout$=\"t\"].oo-one-tab .oo-thumbnail-scrolls"+
          "\n{"+
          "\n\t height:100% !important;"+
          "\n}"+
          "\n{1}[data-playlist-layout=top] {0}"+
          "\n{"+
          "\n\t  width: 100%;  top: 0; left: 0;  position:  relative !important;"+
          "\n}"+
          "\n{1}[data-playlist-layout=bottom] {0}"+
          "\n{"+
          "\n\t width: 100%;  top: 0px;  left: 0;  position:  absolute !important;"+
          "\n}"+
          "\n{1}[data-playlist-layout=left] {0}"+
          "\n{"+
          "\n\t height: 100%; top: 0; left: 0;  position: absolute !important;"+
          "\n}"+
          "\n{1}[data-playlist-layout=left] .oo-thumbnail-scrolls"+
          "\n{"+
          "\n\t  position: absolute; top: 3em; bottom: 0;  left: 0;  right: 0;"+
          "\n}"+
          "\n{1}[data-playlist-layout=right] .oo-thumbnail-scrolls"+
          "\n{"+
          "\n\t  position: absolute; top: 3em; bottom: 0;  left: 0;  right: 0;"+
          "\n}"+
          "\n{1}[data-playlist-layout=right] {0}"+
          "\n{"+
          "\n\t  height: 100%; top: 0; right: 0; position: absolute !important;"+
          "\n}"+
          "\n{1}[data-playlist-layout=none] {0}"+
          "\n{"+
          "\n\t  display: none;"+
          "\n}"+
          "\n .unselectablePods div, .unselectablePods p, .unselectablePods a"+
          "\n{"+
          "\n\t-moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-o-user-select:none;user-select:none;"+
          "\n}"+
          "\n .innerWrapper.oo-fullscreen"+
          "\n{"+
          "\n\t margin: 0 !important;"+
          "\n\t left: 0 !important;"+
          "\n}"+
          "\n .innerWrapper:fullscreen"+
          "\n{"+
          "\n\t margin: 0 !important;"+
          "\n\t left: 0 !important;"+
          "\n}"+
          "\n .innerWrapper:-moz-full-screen"+
          "\n{"+
          "\n\t margin: 0 !important;"+
          "\n\t left: 0 !important;"+
          "\n}"+
          "\n .innerWrapper:-webkit-full-screen"+
          "\n{"+
          "\n\t margin: 0 !important;"+
          "\n\t left: 0 !important;"+
          "\n}",
        Images: {
          'oo-next-horizontal': 'data: image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAA4AAAAUCAYAAAC9BQwsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjBBN0RENTEwODY5MTFFMkI2RkM4Mzc4NTUyRUM4RDgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NjBBN0RENTIwODY5MTFFMkI2RkM4Mzc4NTUyRUM4RDgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2MEE3REQ0RjA4NjkxMUUyQjZGQzgzNzg1NTJFQzhEOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2MEE3REQ1MDA4NjkxMUUyQjZGQzgzNzg1NTJFQzhEOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrPtloQAAAIiSURBVHjajJPvT9NAGMefdd1YNzuGVCREJSEsIU4MkTfLeEdiJJGEmGjwjb7wlSEmvCPZK/8I/wTeK280JoMQhrANpolRpsQlA3+gDENpB7tubVefI7dZlzZ4ySe93t2n1z73LcDf5qHouj7S7MN/NLrISwh5aFlWRtO0GXp/lkwneVmWH1Gpiaqqs3TcTebYhM80zX46YBgGmA0LRFG8ryjKE7edm6JfkqT5QqGQ5Xke6jUNSK0O4XB42k3mbAOeWCy2kMvl3guCABqpwpGiuspUbCA6UkUq8Xh8IZPJfOiKRICg/Kt8AALK+20yFS0mVpDflEQi8SKN8jmpF05OjuFraRf8gjhd2j9syTwTDYTYqszplrdOCH5rVTtdEMS+LB920HogGscW2+XK28KXqavXro9+L25DTdehs/cSbGaz6RtDg8/pCdCHc+1l/rT7c0bquTj+bXsLDLMB5/uuQHp5KT91a/xVe1VbIdja2ZvrCARu7xU/4yt4oKd/ANZX0/kH9+68xHmVFZDWw2pmkv9Y+jEXCoUmyztF4H1+6BuIwtrqSv7u5ASVDpAycsQ+x2wl51hVKsFgELqlCxAdHoZ3G29cJVaT0zx2ItHXi4tPG5jTVCr1DO8nkFHkMiI65dbLxEFkLJlMPsbrzbMkDysQPZ8I0oUISA1RnF7vn5+X7Rpg+GxnqjlJYA8429lry6/JrpbbT+zUB1uiHNsfAQYAQqnqwYZyNgkAAAAASUVORK5CYII=',
          'oo-next-vertical': 'data: image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABQAAAAOCAYAAAAvxDzwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjBBN0RENEQwODY5MTFFMkI2RkM4Mzc4NTUyRUM4RDgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NjBBN0RENEUwODY5MTFFMkI2RkM4Mzc4NTUyRUM4RDgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxQUM2ODZCODA4NjIxMUUyQjZGQzgzNzg1NTJFQzhEOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2MEE3REQ0QzA4NjkxMUUyQjZGQzgzNzg1NTJFQzhEOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PlW/ZE8AAAIaSURBVHjahJJLaxNRGIa/TC4MSdparUqUAS/MQkqLVJBCleqqbRqlG0FXgtC/oBV/Rf0NoiIuXNR2stGK1sEshBIXgaRK0DSaGCcxk8tkbr4nzNB0SMyBhzmX9zxnZr5DdNB8gNN1/a5hGA9Y35nztm6OZVh2UI5NBOr1+j3btmVGq9V6hLmgJ8z6Qaw9NJHpgBL2sL1uzrVz2Wx2NhqNrpoYNJtN4nk+oarqWk+4e2hFVe9bPH9zL7dH+W95sn2h1Z3P6VnXxTkn+0VRzKBt+jHQdINK5TKFI5F49UAaKCiQcXwil/5CjWabQqNHKb27uzk3M5VhDuo5mQdHwKk329t3rszPzxV/FKijaXRMOEuK8mfLMEwrHI4s7+cyeA0/TQhnKCV/3Lm9svwM+/ZBFbRdIftXY+AkiL3ckBJXr12/XPyaI72j0XhMIMuyqFLIUyAYotg5keQP7z7duhF/jXwR/AI1oPv7VIh78fRJcfriTFicnD7dqFWpXa+RqTVpZGSMzk9eoNT7t6mV+JKE7G9QASroAPtQlUEUCOASWHz+amNd0Ww5/70g/yyVu9VPJpPrbM3JCM6ewMCr45VKkvTYvUqsP0zm6yP1O0UaByfAcbzVEvuWxYWFLTzKoAQUVgRgej+VhkgnwKiz9tf5b31lg4ReKZNFnPmGI+0r+5+wV8quVMiZY5XUB8mGCXsvvpuze+jb/gkwAFK56p0pz8a0AAAAAElFTkSuQmCC',
          'oo-previous-horizontal': 'data: image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAA4AAAAUCAYAAAC9BQwsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0JCQjE5MDMyMzUzMTFFMjgwNDg4QjI5RUQ4NjU2NTMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0JCQjE5MDQyMzUzMTFFMjgwNDg4QjI5RUQ4NjU2NTMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDQkJCMTkwMTIzNTMxMUUyODA0ODhCMjlFRDg2NTY1MyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDQkJCMTkwMjIzNTMxMUUyODA0ODhCMjlFRDg2NTY1MyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvXK6z4AAAImSURBVHjatJLLaxNRFIdPkmnTiUySahqftSopiGlFrIvQUoSCWKhQBKVudOFKSsGdkJV7t/4JbkVdtFJIRYjiJBoFKY2WFh9VYh/a6UzNPHJnMp4T7oRoUyqCAx/3zj3zce/vzvG5rgv/8vjhPz0+gjF2ypv/rRQwTXMc48iGYVyj951kKgqapt0kyUNRlOu0TnX/djupqjohSdIVp+qCbdu1guM4XTi0NBPrUjgcHjOsClQsEwRBgGKxmIvFYvew3vqn+Ju0oWpgGjqIogj5fP5tMpl81JCvLtakFZRElJZX18BAqT0aBVmWZ1OpFEmbiI4wpOrdUuDjyvrELikytry0BIxZ0L6/E3eSZwf7+x9i/TuyhmiIRaLAxVZFWQ8G29pA1/XagmGYwNxABac/uLRBywjdlOvnYsvp44kHr3K5bGTfIbAYg6+L83Ci52Tf6+LCKD9mXdrScqPnhx5nnz4p7D5wGGynCl/m5yAW3zv07vO38Wa96vLAFFy7evni1Itn2UK86xgWfFBafA8YYWTuU+mW9/Ohof/okkQkisSRjvuT0yMDg2fPlD4sgM0qED+SgHK5PNlz9OAdOrK3o8Mz0AWs0mVcujA89ebl80J3by/siXVAKBSCn5q66XXOlv5EJKQT6UOGM5nM3Sr26fTMzG1870Yi/DvYST6XTqdv4DiAJLgY8G3X5A2Z6cMgj6LwOJbQRGzMTHOTn4LxOY3uLwEGAJbj6MfFK0wyAAAAAElFTkSuQmCC',
          'oo-previous-vertical': 'data: image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABQAAAAOCAYAAAAvxDzwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTg1NkI0QzMyMzUzMTFFMjlDQ0FCNjFCMkRCNTYyNTkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTg1NkI0QzQyMzUzMTFFMjlDQ0FCNjFCMkRCNTYyNTkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFODU2QjRDMTIzNTMxMUUyOUNDQUI2MUIyREI1NjI1OSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFODU2QjRDMjIzNTMxMUUyOUNDQUI2MUIyREI1NjI1OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pip0qkIAAAILSURBVHjanJJBSxtREMdndxNNmlSiaUKx6kUqodBSEFekgRIQXhPFr1DozS+gFOm951689yRtKUI1Ji0UEUqgh5biYTWbqkgbiNFuTXaJuptsZ9q34SGmlj74scub//znvTcjwd+XJEDLFbhwKZeYUbwLCfKv9L+GnlkAiSC9SIjvNZFWJ1PlEjMyiiPXkKuInxs5nUx9/2AWy+fzacp8wNgafmSuNZATfmK30zWpQBgZREbJI5fLPXNdt0DQP+3x2CDX+oSmtatdeLKl5ZX0eIqN7X8rQ6V6CIyxMTotxbiml+conqk3EjLvZIQL489fvE4n76fU6v4uClzw+30QDIZg4OYwbLx7+zHz5/oHnJ9Ig95VFprjGUZfreTSLDOl1iplkLFcX/8QhKLXwTB+gPb5C9xRk+rLN1m6epTnBL0Gi4b0Ft3v19fZzBRTT4wqhK4EYPj2XZAUac2VYHVg5Ba0mg6UvxZhVJ0YX1peZZTDcxXxyjQOPZqmzSYSiYxxXAP77BRisRjULCsbCYefkvi7Yc51dQemyyUNWlih78YQ6Ntb2cl76iKGa4jdboiu60nqpINYlvW7q6ZpPuHF2oWPTHPBwlhRLxX0nb1CxTwtfPi0mRQb0x6Zer3+yBuRRqOxIJiJOj/GHjdRc4YcYM750RHFsm3bDx3HmefvK3WYV5k0pD2v+yXAANZK1DkI6cTMAAAAAElFTkSuQmCC',
          'icon-menu-toggle': 'data: image/png;base64, iVBORw0KGgoAAAANSUhEUgAAADIAAAAGCAYAAACB1M0KAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3QYODSQw0gJlmwAAAOBJREFUOMtjYBiCQDG7/79idv9/ZDGm9t4J/59/+vH/6Yev/x+/+/z/4ZtP/++/+vD/3sv3/xvauv4PNk+Iusb+51Y1YuBWNWIQdY2Fu4+RgYGBYcehY/9VlFUZXj++D1Esq8hw9+5tBnc7K8bB5hHtvv3/GZmYGBgYGBj+//vHcLXIkRHuEQYGBobrj178//PtCwMLMzMDt6AQg5wI/6DzhHr9qv+sguIoYr/fv2S42RjGiOLYT3/+/2dlZmDgZGQcdJ6QS2z8z6fvgFXu06XDqALr1q37v3Hjxv9DsQAAACztUkG1yxsKAAAAAElFTkSuQmCC',
          //light
          'oo-next-horizontal-light': 'data: image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAA4AAAAUCAYAAAC9BQwsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OUE0NkZEM0QyQUJGMTFFMkE1OEVGODA5MjQ0RUZDRkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OUE0NkZEM0UyQUJGMTFFMkE1OEVGODA5MjQ0RUZDRkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5QTQ2RkQzQjJBQkYxMUUyQTU4RUY4MDkyNDRFRkNGRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5QTQ2RkQzQzJBQkYxMUUyQTU4RUY4MDkyNDRFRkNGRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqFzM4gAAAIpSURBVHjafJPPaxNBFIDf/srutk13U7DVak0DKdXUgxg0jbURTURBwWM9eehJiuCtV2/5B/wTelRsBRW9ePCQ5hAEjRGhUlCk1HTVNGt203Tj+l47G9ak24GP2Xk73/D2zVtwXRcYHCGK4lnv2feuB78kKIpyFwBWZVleoPVhsieJuq7Pk+QRDocfUDxI5nETh0iCIERxBkwVBJ4D0zTvaJp2H0MC2/Pf8MSQYRhLiUSi6DgOhGQFVDkE9Xp9LkjmfQGuUqmspFKp97Ztg6L2ga4NBsok/kV2EQsxi8XiSjqdLv+u1UBF+ejwEbBRHumSSXSZaCIGUSgUljMo/zE2ob9/AE7GotCyzbnYyFBHFpnoILaXMh0oce2WquK39il7AQufI5EhmeqBNHm22S+bycTE7U8fPyRPxCdBliTY3vwO56en3777/OUp3QAdzneX+XT02IJR/XF1bHIKRIGHXxvfIHMlW3r2+s3L7qp66YlT46OLO83mzdH4KQy4UP26DhdnM6Wlx8sv8H2dFZDqsd+TJJ2JHV9sNBq3hsfj4Oy2YGN9DWZmL5eePH9F0hZSRWrsc9qdzhkY1EzLsuCnsQVr5TKcu3ApUNqrCetHDZm4ns0+xFNWc7ncI1zfQJLIGBLu7ltgfwGJcWQmn8/fw/naYRJBC0qX7kdHIoiK7CDbPen5hlcc6gaFIfnutHmQ5ImdbmEHeP3bZnOP5BfhoH8uSKLxT4ABAPxZahvQba5DAAAAAElFTkSuQmCC',
          'oo-next-vertical-light': 'data: image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABQAAAAOCAYAAAAvxDzwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OUE0NkZENDEyQUJGMTFFMkE1OEVGODA5MjQ0RUZDRkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OUE0NkZENDIyQUJGMTFFMkE1OEVGODA5MjQ0RUZDRkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5QTQ2RkQzRjJBQkYxMUUyQTU4RUY4MDkyNDRFRkNGRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5QTQ2RkQ0MDJBQkYxMUUyQTU4RUY4MDkyNDRFRkNGRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ponbbc8AAAIpSURBVHjahJNda9NQGMefJidt7MJcN9PR1lnmWuiFZaBQNjd0CLarhjFEhrtREPYVdMNvsS+h4I0gbe3VLG7IduGNN4PgC1Qsc9XpaNos3Zo9z3aCIbYz8Cvn5X9+ec7JKdi2DRwfIjDGHomi+JTafAw8nOQoQ1lvzh1iiqI8BoD3hCzLz3BM8kipLeHcioAZCVFxDa11cjgOPkRIJpMTjUZjScROMBgE0zQ1fMEydhnPEGxIUZ4Ipjk3lhiD+GgcfLa1NHU1PUEOytAPPaKu69upVKp4hJ2AxCCsqtA0jDsDf6UsFkJZx9QS6SvQF5TB2v8F6fHx4saHj9vkIBGVSW+WkQEkemtmZnG9UpmKXIyBPxCAn9UvEAoNlhgTO82mcTeaSIHdOYJ69StkJq9vvHhVeI7rviO/EdMR4nHAeWQYidzXZrV3b9cykcsJkPwB2KtVQRAEGIrF4bBtQe2zDpPTNzdfvi4WMF9DdpA/SNsR0tbP8SrDxMOFe/n1ylpGvTQKNh5fu30IrZYB3/RPcON2dqtYLpcw94ND1bWQzsmX4Qcu8q2HuFR9MK/ly6VCpj8chYMDC3Z265DNZrfKp7JdLtujrSJ0/P/cL/r8CjKCXENmc7ncqnOVqE1jfG6EZ5n7ajkVOk/XSlGUp4k3Z1XmCDzCbtILSD+f20fqvWS9hF4pyfr4uMGlXWVnCd1SulJ+PmbR1egl+58QXH85H+/bLro+xwIMAEqaQ+in/dI1AAAAAElFTkSuQmCC',
          'oo-previous-horizontal-light': 'data: image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAA4AAAAUCAYAAAC9BQwsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDAxREE1M0MyQUMwMTFFMkE1OEVGODA5MjQ0RUZDRkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDAxREE1M0QyQUMwMTFFMkE1OEVGODA5MjQ0RUZDRkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5QTQ2RkQ0MzJBQkYxMUUyQTU4RUY4MDkyNDRFRkNGRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5QTQ2RkQ0NDJBQkYxMUUyQTU4RUY4MDkyNDRFRkNGRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PjJzJncAAAI+SURBVHjahJPPaxNBFMe/2R/ZTdJ0t4W2GqyxklBNL2LUNP4IaCIWKngR6smDJymF3rx6y8Grf0KPilVoRS+CimkOQdA0Ilj8hUpNtzZmJZs2abZv4qykaWwDH2Z2Zz775r28gW3b2AUXQ5KkY87cWdtLEhVFmQSwoKrqdfbsyLtJkt/vn2aSg67rN9h7ti5g589FiJqmTZmmeU0UXKCjNhdEUQzSILM9wv+kcrk84VHccCsq6vU6IpFI1jCMGVp3t4vbJF3rhurxwrIsxGKxN4VC4SHfg1axKQ2QZJG0r78PHpLWSiXE4/F8NptlkklUiBrREBxpaKB3asMyJw4OBeHzdeGPsYwESZlMZpbWDY7JRVviorunp1dZr1bh9XpBxaaIKmTX5gZNV4kVokRYRJ2JTkT59fulBydHR1/8Xv4GRZZxIDSMd4tvo9FI+AqP9E9iuW2r6qOnzx4nzidzv358hSQKGBwegVH8eeFocP9k+38m8C/UeOLlmXuz86fPJXLFLx/pKDYCoSOgFMZHDgVu0bqTGpr9x4rD0iJ0op/ou3p5bPzVy+cnAofDkGQ3ip+XqGi+ucVP3++wIzsRN3kOrABFVoz7c0/mj586m/uQz2PVWEGlUkFXt2Y6nbOjPwk/MUhEibFUKnWXjrRwKZm8Tc9hQmP7OjZ3m3wxnU7fpPEMEeKi+PeKdOjXlpw1QuGprPF01qUOt6M1Zzav8mrW+LzZOZ0itkYWeHQ2NvgHG3uJaLkN7SfClgADAFSdZq+uS1WVAAAAAElFTkSuQmCC',
          'oo-previous-vertical-light': 'data: image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABQAAAAOCAYAAAAvxDzwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDAxREE1NDAyQUMwMTFFMkE1OEVGODA5MjQ0RUZDRkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDAxREE1NDEyQUMwMTFFMkE1OEVGODA5MjQ0RUZDRkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowMDFEQTUzRTJBQzAxMUUyQTU4RUY4MDkyNDRFRkNGRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowMDFEQTUzRjJBQzAxMUUyQTU4RUY4MDkyNDRFRkNGRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pt4A+fwAAAIOSURBVHjahJJRaxNBEMfn7vbSa/Y4vdpLIdpK6VU9EKRII0iRIuglNUIRlT4p+NYvUJHiu8+++D2EpB4IRagcBgRRkKD0pVQRg7VIY2Jje86kE1hD0yz8uGXnP//duRktSRI4YmkKtBKFQ5foY2YgJpLis12khez1MhV9zCzEQSSf15FfSLOXqehj5iLDbApsRrGfvUxFH7MM4oVhWKDAiyhawY/O2sNNqSmMhgjERkaRi0gezZ6iLCZoT2ccG2Wt4Ny2j37Uyxbmi4U3q9H02KksjHjDEEXRNL2WYqxxOcfoTAI5a1zGIHKchZl7d28V1l6t5ryxcaxHg1brLzQaddj8vA5Xrl2vlA/K/85sIw1kv/NCQzE8cbuYL0TlUs4ZycI+/p2trxtQ//ENXHcIgqkL8L6ylrtzcy5PWs4ZZA9QDalBA1dnZ8PnpShnuR7Ufzdh/cM7SPaSFS2B0uanj6AbArITZ+BtJb60MH8jpBzONdSSaXidIAgWq9XqnHvMATM1ALVaDRwpy9s7O09IfNK1l3b/NItZPwAdb9j6sgGTZ8+VX76uPOORanW6a/i+P0OdxGvidDrd7qqU8jHGTNYQ5pCUy2mMTfoTsT9+Os7IVHx56vwMebQfp46MbdsPOiNiWdayYqbqTIw9wn8VY1mxhznq6HTPoS6EuG8YxkPad5n9pyMNabt1/wQYABlcMrl+0cA5AAAAAElFTkSuQmCC',
          'icon-menu-toggle-light': 'data: image/png;base64, iVBORw0KGgoAAAANSUhEUgAAADIAAAAGCAYAAACB1M0KAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QYODSQXdwjQ8AAAAKpJREFUOMvV0rFqQkEUBNCzKwgBm/cBaRarFCE2WqVICot8jfg3Qn7ClGlTRQRt02zadNoFhKw2a/Mw/XNgijsztxjuDa4NMfXwXqepkv8gimkhpuM/XHSwyhzPlfOzGMR0gzXuWgtfGCn5t0PXGOMD/aoc8KjkVaiBB3y2AhMlbztUYoANhi3nG/c9cNz9CM0eL9WcKfmtUw8Vmlc8XXAa3LZbL8W0dIU4AVRHKNTfLzv1AAAAAElFTkSuQmCC',
          'no-preview': 'data: image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAJwAAABYCAIAAACPowm4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAACdtJREFUeNrsm09MXNcVxrEDxYMLxEAiUswCK0AlI4GaoIAbUcVe2M04qaoGdZVEyqKxVFUx7iqy5UUqlFUcS1FUN5sIR11U8SKqIKoijV1brU2CKjGWHctDZSdhSCwb/AcSMJ6Q9Dccc3J9572ZsZnisXw+PT29d+f+m/Od79xz70BJicFgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYLhXUFtbW/A+I5GI+7p+EQXsv7TgM167ZvVzPet++UQ1z0fjMwc/mvrm+nd5tm1pae7q6uKupkwmk4nE2OHDR6amprKbfvPmp2io1qE+DYeHh7mLHXfseFk+GhoaksJMvPDC8zI0I8bjcVr19b3S3//63NxcZuXubibbxcP77x9invl7CX3u2bNXXrdvjzY3N1dUROLxk4ODQ0VKqjIKftFeyf3Pf7+Uz1fFoLDilYsXQ9jQ0IeB3xm7YxcqZHbY3c3VBX8HDvwFVrD7UrVoIrE/0KWozwOVE4kEDx0d7fTD/cSJ4cA5y4ShJH/7MAQN29vbcRr1v6wee9tYXXBSH29d674Kr9kBbbt3v6qMLtp0TC6tE40+3de3M5PRXbt2uoxqQ9UW3fb3/4kh8AkpVPI8RKNRedCaDKr3QkFm684Zn+AqILGFV6qH2VyxV4iRZQZTEspcWbhChAzUfPDge/rpiy8+r/EWKcdih904SSvaRhZBzX379hNUlSdPfHQuXoVxqSYlEopFkWER+7aAM8k3lc4ZCweSr5B/AF8Jpf6kLNIZWcdV98CP0uvoyRn3U5bVtDPW1LZufZarvq3Da97b+5wyit09WwvNSiRGUUHzTBCTZyqovBRwQ4dSiOG2bNlMHRGErMHeaqrO4UrKE/Ey4Ypen5OLKKLw21pe+avKRx6PrOPqrV4PwYeOXjl07Mqnn1+/dPVbHgY+mqpqaOz5496Wrc9wdb70e6h1haiRcGDgvbDvBtO6Aqmt9QHyAtc8sZeuxFJfORMRu+uc1JeuZNlzdbz8NNjrhKXaS4OLhdSfV9zyVdErd3h97eCXf3jrCx7SxG99tixS8cN32/qM+8U0WVDaAjE4eJMMsTXW0cAr0TIMfCpixYKYFc40H0a7nmiICp7HqJ8tf2XVPnUCgUv73Se1fFXuHsrC/VE9l4Q+eycY1819amtrtDxnijE6Gl9q2CJbGrWyrNkyDU3N1NyMeODAOzLuMoWl0me2uppkJu1FQerkwg33dWYhFZArXZ4Ke2WLpmtnzrHGx5Nuwnyzt9ncDS9fvuy+uuSRQKllVabKH7KGA/GJZQrLXSxkD7207+oqOlKPfH1x/vvvlOB/zwaI5vQHf5ueGJfn1NzsyLtvO3nQ7J2Nm48TZIFqBfUof5mRVgK7hvc7FpYrfVmztU85vigsSpev1L9e/aK2tJznL1PBhobIo2+8VvtoK8+wm3KITCYnJCjV1NTkHKux0VXn1FJYy91w/fqGpYazuoRjXFclmkBpOsMaL4FdslNig3dokD9U+ohe3FE6l80SPRdX9gtQKnRyNaxr5KpaU33LqWFl2UMNa7mm/nuWK3WrNDWiasYUBpWUnA1pQzdjClOJ5rHuXpNgq3J3jyFVjidOfOxmW8sRq0pfXQcMD3/8f1pZC3P4UF5a/uuf/bbuxw/La+zMP858dYqHhqbKzi0NZeUP8Hx18vo/P/gsNb/gNsRhsaycD5CwZDn83L79aTfroRVthS12um++uT+8YVTV6QqCHvAM2fWq+NydDIFBY4O3Lbmt0x+VPiO6sUGDE4WuhxULqe2Njymj4Mnmp85dGpv/dl4ZBQ/Wrel4sn4kNpG55dBTHomKgefs7smRNhQCMk+a3BMc1YGrkpzpTJY9DOWBY+XsE8cN61MORorr7Jeo6wm3rjLNsTKqoThoAzqkAoIblz+Jurt3v6oOjjVVJcRS5YkKfX073eMCOtmx43d6ToQWww4oAk9C8lkgb2snkx1dXU8UXfidmZsuefDWBGrmYjpFml9web1xI/gceN++/bt27RQuMWuYZaHQIwaHIIhJfT28zQSMDgzk1pYezFI/8EAjGo0yhHDvVsj8pUGi/Z49e92dTGCGJT/2yd4mp9utKKmfnD/e9NCj5Ys5cNoo4/8h9qbXv39dIALfzIHnFz795GLY/qS//3U5uA8UgWzYA4/UKY/HT/b2/ibwGI+esWaekU0JGBz8MDAdjUSOiN9QM/sxlrigK/2wn4SpJuGEvU2hSF1VKMnD6E8faeM+cXV84sq4lpP3PtyQ/jHuszNXvplJ5QyABLfmZv9H8nx2EUQ570fysbEx3UKESVMGEmsKAWx7shCmaRdN2E3JEVUgYrHDFRUV0mdYruCdVhZwWTUYDAaDwWAwGAyGexWr7voMGhdx7ty5Cxcu8FpVVdXW1nbq1Knp6Wle6+vrW1tbKeSZCmfPnpVyhdTXV3aZiUSCu1cuzRlFR3Q/unbtGlvJDRs26DQA47KLHR0dbWpqqq6uPn78eGaf6QOW0dGOjg7tfOPGjVQeX0RJ+kyxo6ysbGRkZCVNuvquk8oOHdthC748r9x5lWcY7ezsLC0thSdMRvmmTZuo7zaX+nIOxTNsdXd3e+Wyx2cIeNIRZQgFvkKhSzZc0gr/gCQ5o/D6VDdyGzJnOfZTl/UGWgGUFknEwNAIBSG6hdCQSqWOHTvGXaQGqS0tLYjDa55MJqUtysCO7oGUlGPZbdu2uUeJBAPv3A5eoUQDAE1EbWFjKeTnbvkWQPyjZOkvsAr85/f3hFIFmA9luE6NWTEQRAqjYh3X7vkAVYluREn6lw9A9CcQ9QuF0r/UDyRV+wSyLujfEguLBBVhlyF4nZycvE+VSoDFmkhT7SgEeye3ECx29CB/a0ITPoV4lY67fFJ4+vRpNwy4oyM+sT4N8aS6ujo8wFu/3SRA+2StZUkWL5HRNTmQqQZ2cl+QigXPnz9PaPVMwILqraBZOoFyVCL/26QBABOzlCIv4q2KHkCwkKGuw9BMA99iJvARKFPpUz+SDkWpNIFXPINCicCADt1B7y9SJWohOP3dA0thDkys8iKgYTjNTrOvc8oW9TFxT08P63EsFlMTS8br1acyS7sIMXAg6dNrSJ+STzE9mQado3UmHOYZ98WaKqZBZK4WUQx2gQxcXjJh4f7OwgA9uyEX5lodqAol72UyYaQyGbehrMfQ7K6v+rrysbe4lCo2dXNXvJ7wi3TgVVgn772zZJKucAs6V+l4W1VRGBwwSljeq6S6WTTxVldfae5mvCufJRXF4UNOSPpzV/YGBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwXAv4n8CDAAuAajFWKw96gAAAABJRU5ErkJggg=='
        }
      };

      //playlists
      //old config
      this.config = {
        IsDocked: false,

        //playlist
        Position: 'bottom',
        Orientation: 'horizontal',
        PodType: 'scrolling',
        MenuStyle: 'tabs',
        ActiveMenuColor: '#ffbb00',
        RowsNumber: 1,

        //thumbnails
        ThumbnailsSize: 150,
        ThumbnailsSizes: {Width: '150'},
        ThumbnailsSpacing: 3,
        Caption: 'title',
        CaptionPosition: 'inside',

        //style
        Theme: 'dark',

        //fontSize
        WrapperFontSize: 14,
        TabsFontSize: 13,
        MenuFontSize: 14,

        //font family
        WrapperFontFamily: 'Arial',
        TabsFontFamily: 'Arial',
        MenuFontFamily: 'Arial'
      };

      //current (rendered config)
      this.currentConfig = {
        IsDocked: false,
        ID: 'oo-playlists-',

        //playlist
        Position: 'bottom',
        Orientation: 'horizontal',
        PodType: 'scrolling',
        MenuStyle: 'tabs',
        ActiveMenuColor: '#ffbb00',
        RowsNumber: 1,

        //thumbnails
        ThumbnailsSize: 150,
        ThumbnailsSizes: {Width: '150'},
        ThumbnailsSpacing: 3,
        Caption: 'title',
        CaptionPosition: 'inside',

        //style
        Theme: 'dark',

        //fontSize
        TabsFontSize: 13,
        MenuFontSize: 14,

        //font family
        TabsFontFamily: 'Arial',
        MenuFontFamily: 'Arial'
      };
      this.isInitialized = false;

      // [PBK-563] Flag used to support 'useFirstVideoFromPlaylist' and
      // publish SET_EMBED_CODE only once
      this.setFirstVideoFromPlaylist = false;

      //object to init some tmp data Example: this.tmpData.someTmpData = 'new string';
      this.tmpData = {};
    };
    Identifiers = {
      classThumbnails: ' .oo-thumbnails-',
      classThumbnail: ' .oo-thumbnail',
      classSlide: ' .slide-',
      classPlaylistThumbnails: ' .oo-playlists-thumbnails',
      classThumbnailPaging: ' .oo-thumbnail-paging-',
      classThumbnailImage: ' .oo-thumbnail-image',
      classThumbnailCaption: ' .oo-thumbnail-caption',
      classCaptionDescription: ' .oo-caption-description',
      classPlaylistMenu: ' .oo-playlists-menu',
      classMenuCurrent: ' .oo-menu-current',
      classMenuActive: ' .oo-menu-active',
      classMenuItems: ' .oo-menu-items',
      classMenuItem: ' .oo-menu-item',
      classPreviousButton: ' .oo-previous',
      classNextButton: ' .oo-next'
    };
    $ = null;
    _ = null;
    DataHelper = {
      apiHost: '',
      pCode: '',
      withCredentials: false,
      isOOStudio: false,
      apiEmbedCode: '',

      init: function (apiHost, pCode, playerID, isOOStudio) {
        this.apiHost = apiHost + '/api';
        this.metadataApiHost = apiHost + '/player_api';
        this.pCode = pCode || '';
        this.playerID = playerID || '';
        this.isOOStudio = isOOStudio;
        this.firstEmbedCodeInPlaylist = '';
      },

      executeQuery: function (url, method, body, queryType, callback, failcallback) {
        $.ajax({
          async: false, // TODO: Is this safe to do?
          type: method,
          url: url,
          data: body,
          dataType: 'text',
          success: function (json) {
            if (typeof json === "string" && json.length > 0) {
              json = JSON.parse(json);
            }
            if (!queryType && json['items'][0]) {
              this.apiEmbedCode = json['items'][0];
              apiEmbedCode = this.apiEmbedCode;
            }
            callback(json);
          },
          error: function (data) {
            if (failcallback) {
              try {
                var failedData = JSON.parse(data.responseText);
                failcallback(failedData.data.length ? false : true, failedData.playlist, data.status);
              } catch (exeption) {
                if (console) {
                  console.log(exeption);
                }
              }
            }
          }
        });
      },

      getUrl: function (path, parameters) {
        var keys = [], key, sortedParameters = {}, i, key2, key3, url, qs = '';

        if (parameters === null) {
          parameters = {};
        }

        // sort parameters by keys
        for (key in parameters) {
          if (parameters.hasOwnProperty(key)) {
            keys.push(key);
          }
        }
        keys.sort();
        for (i in keys) {
          if (keys.hasOwnProperty(i)) {
            key2 = keys[i];
            sortedParameters[key2] = parameters[key2];
          }
        }
        parameters = sortedParameters;

        for (key3 in parameters) {
          if (parameters.hasOwnProperty(key3)) {
            if (qs.length > 0) {
              qs = qs + '&';
            }
            qs = qs + encodeURIComponent(key3) + '=' + encodeURIComponent(parameters[key3]);
          }
        }
        if(this.getMetadataURL == true)
        {
          url = this.metadataApiHost + path;
        }
        else
        {
          url = this.apiHost + path;
        }
        if (qs.length > 0) {
          url = url + '?' + qs;
        }
        return url;
      },

      getPlaylist: function (playlistId, callback, failcallback) {
        var url = this.getUrl('/v1/playlist/' + this.pCode + '/' + playlistId, null);
        this.getMetadataURL = false;
        this.executeQuery(url, "GET", null, false, function (item) {
           callback(item);
        }, failcallback);
      },

      getMetadata: function (playlistId, callback, failcallback) {
        this.getMetadataURL = true;
        var url = this.getUrl('/v1/metadata/embed_code/' + this.playerID+ '/' + apiEmbedCode + '?videoPcode=' + this.pCode + '&', null);
        this.executeQuery(url, "GET", null, true, function (item) {
          callback(item);
        }, failcallback);
        this.getMetadataURL = false;
      }
    };

    Playlists.prototype.StringFormat = function () {
      var s = arguments[0];
      for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
      }
      return s;
    };

    Playlists.prototype.UseTemplates = function (firstCall) {
      var wrapperObject = $('#' + this.wrapperID);
      if (firstCall) {
        wrapperObject.append(this.templatePlaylists({
          playlistID: this.currentConfig.ID,
          playlistsClass: 'oo-playlists',
          playerId: this.playerId
        }));
      }
      if (ObjToArray(this.Data, true).length && !ObjToArray(this.PlaylistsData, true).length) {
        if (DataHelper.isOOStudio && window.FakeDataPlaylistsMap) {
          this.PlaylistsMap = window.FakeDataPlaylistsMap;
        }
      }
      $('#' + this.currentConfig.ID + Identifiers.classMenuCurrent).remove();
      $('#' + this.currentConfig.ID + Identifiers.classPlaylistMenu).append(this.templateCurrentMenu(this.PlaylistsMap[0]));
      if (ObjToArray(this.Data, true).length <= 1) {
        wrapperObject.addClass('oo-one-tab');
      } else {
        wrapperObject.removeClass('oo-one-tab');
      }
      this.pluginState.currentPlaylist = this.PlaylistsMap[0] || '';
      this.pluginState.firstEmbedCodeInPlaylist = this.Data[this.PlaylistsMap[0]][0].embed_code;
      this.apiEmbedCode = this.pluginState.firstEmbedCodeInPlaylist;
      this.pluginState.lastEmbedCodeInPlaylist = this.Data[this.PlaylistsMap[0]][this.Data[this.PlaylistsMap[0]].length - 1].embed_code;
      var classMenuItems = $('#' + this.currentConfig.ID + Identifiers.classMenuItems);
      classMenuItems.append(this.templateMenu({ menuItems: this.Data, playlistsMap: this.PlaylistsMap, ObjToArray: ObjToArray }));
      classMenuItems.append(this.templateThumbnails({
          playlist: this.Data[this.PlaylistsMap[0]] || {},
          timeConverter: TimeConverter,
          noPreview: this.templateSources.Images['no-preview']
      }));
      $('#' + this.currentConfig.ID + Identifiers.classMenuCurrent + ' a span').css('background-image', 'url("' + this.templateSources.Images['icon-menu-toggle' + (this.currentConfig.Theme == 'light' ? '-light' : '')] + '")');
      $('#' + this.currentConfig.ID + Identifiers.classMenuItem).first().addClass(Identifiers.classMenuActive.substr(2));
      $('#' + this.currentConfig.ID + Identifiers.classMenuCurrent + ' a').text();
    };

    Playlists.prototype.GetData = function (playlistID, index, callback, failcallback) {
      if (this.PlaylistsData[playlistID] && (this.Data[this.PlaylistsData[playlistID].name || this.PlaylistsData[playlistID].playlist])) {
        return;
      }
      var me = this;
      DataHelper.getPlaylist(playlistID, function (playlist) {
        if (!playlist) {
          return;
        }
        var playlistName = playlist.name;
        me.PlaylistsData[playlistID] = playlist;
        me.Data[playlistName] = playlist.data;
        me.PlaylistsMap[index] = playlistName;
        if (callback) {
          callback();
        }
      }, function (isData, playlistId, status) {
        if (failcallback) {
          failcallback(isData, playlistId, status, callback);
        }
      });
    };

    Playlists.prototype.GetDataForMetadata = function (playlistID, index, callback, failcallback) {
      this.metadataCallFlag = true;
      var me = this;
      DataHelper.getMetadata(playlistID, function (playlist) {
        if (!playlist) {
          return;
        }
        me.PlaylistMetaData[playlistID] = playlist.metadata[this.apiEmbedCode].modules['v3-playlists'].metadata;

        if (callback) {
          callback({params:me.PlaylistMetaData[playlistID]});
        }
      }, function (isData, playlistId, status) {
        if (failcallback) {

          failcallback(isData, playlistId, status, callback);
        }
      });
    };

    // This method display scroll buttons oo-next, oo-prev if they needed
    Playlists.prototype.ScrollCheck = function () {
      var previousButton = $('#' + this.currentConfig.ID + Identifiers.classPreviousButton);
      var nextButton = $('#' + this.currentConfig.ID + Identifiers.classNextButton);
      previousButton.hide();
      if (!this.swiperInstance) {
        nextButton.hide();
        return;
      }
      var translateX = this.swiperInstance.getTranslate('x');
      var translateY = this.swiperInstance.getTranslate('y');
      if (translateX < 0) {
        previousButton.show();
      }

      if (this.currentConfig.Orientation == 'horizontal') {
        if (translateX + $('#' + this.currentConfig.ID + Identifiers.classThumbnails).width() > $('#' + this.currentConfig.ID + Identifiers.classPlaylistThumbnails).width()) {
          nextButton.show();
        } else {
          nextButton.hide();
        }
      } else {
        if (this.swiperInstance.slides.length > 1) {
          nextButton.show();
        } else {
          nextButton.hide();
        }
      }
      if (this.currentConfig.Orientation == 'vertical' && translateY < 0) {
        nextButton.show();
      }
      if (this.currentConfig.Orientation == 'vertical') {
        if (this.swiperInstance.container.offsetHeight - translateY < this.swiperInstance.wrapper.offsetHeight) {
          nextButton.show();
        } else {
          nextButton.hide();
        }
      }
    };

    Playlists.prototype.MenuItemClick = function (node) {
      var id = this.currentConfig.ID;
      $('#' + id + Identifiers.classMenuActive).each(function (index, value) {
        $(value).removeClass(Identifiers.classMenuActive.substr(2));
      });
      $(node).parent().addClass(Identifiers.classMenuActive.substr(2));
      var menuItem = $('#' + id + Identifiers.classMenuCurrent + ' a'), spanClone = menuItem.find('span').clone();
      menuItem.text('');
      menuItem.text($(node).text());
      menuItem.prepend(spanClone);
      $('#' + this.currentConfig.ID + Identifiers.classPreviousButton).hide();
      if (this.swiperInstance) {
        this.swiperInstance.swipeTo(0, 0);
      }
      this.SortDataByPlaylist(id, $(node).text());
    };

    //this method changed active menu color (class .oo-menu-active)
    Playlists.prototype.ChangeActiveMenuColor = function (color, deleteOnly) {
      $('#oo-active-incode-' + this.playerId).remove();
      if (!deleteOnly) {
        $('head').append('<style type="text/css" id="oo-active-incode-' + this.playerId + '">#' + this.wrapperID + '[data-playlist-orientation*="o"] .oo-playlists ' + Identifiers.classMenuActive + ' a {background-color: ' + color + '!important}</style>');
      }
    };

    //milliseconds to hh: mm: ss
    var TimeConverter = function (timeToParse) {
      var time = parseFloat(timeToParse), sec, min, hour, out;
      time = Math.round(time);
      sec = time % 60;
      min = parseInt(time / 60);
      hour = parseInt(min / 60) > 0 ? parseInt(min / 60) : 0;
      min = min - hour * 60;
      out = '';
      if (hour != 0) {
        out += hour + ': ';
      }

      if (min < 10) {
        min = '0' + min;
      }

      if (sec < 10) {
        sec = '0' + sec;
      }

      out += min + ': ' + sec;
      return out;
    };

    //convert object to array Example: {Title: 'new object', Value: '20'}. method return  ["new object", "20"]
    //if getKeys true return array of object keys
    var ObjToArray = function (o, getKeys) {
      var result = [];
      for (var name in o) {
        if (o.hasOwnProperty(name)) {
          if (getKeys) {
            result.push(name);
          } else {
            result.push(o[name]);
          }
        }
      }
      return result;
    };

    //only for outside captions and vertical position
    Playlists.prototype.CalculateThumbnailSize = function () {
      var out = +this.currentConfig.ThumbnailsSize + $(Identifiers.classThumbnailCaption).width() + parseInt($(Identifiers.classThumbnailCaption).css('padding-left')) + parseInt($(Identifiers.classThumbnailCaption).css('padding-right')) + parseInt($(Identifiers.classThumbnailCaption).css('margin-left')) + parseInt($(Identifiers.classThumbnailCaption).css('margin-right')) + parseInt($(Identifiers.classThumbnailImage).css('padding-left')) + parseInt($(Identifiers.classThumbnailImage).css('padding-right')) + parseInt($(Identifiers.classThumbnailImage).css('margin-left')) + parseInt($(Identifiers.classThumbnailImage).css('margin-right'));
      return out || (this.currentConfig.ThumbnailsSize + (this.currentConfig.Orientation == 'vertical' ? 108 : 0));
    };

    // this method changed thumbnail size (.oo-thumbnail)
    Playlists.prototype.ThumbnailsSizeChanger = function (width) {
      var newWidth = width;
      $('#' + this.wrapperID).attr('data-playlists-thumbnails-size',width);
      if (this.currentConfig.Orientation == 'vertical' && this.currentConfig.CaptionPosition == 'outside') {
        newWidth = this.CalculateThumbnailSize();
      }
      $('#ThumbnailsSizes-styles-' + this.playerId).remove();
      if (this.currentConfig.Position != 'none') {
        $('head').append('<style type="text/css" id="ThumbnailsSizes-styles-' + this.playerId + '">' + '#' + this.currentConfig.ID + Identifiers.classThumbnailImage + ' { width: ' + width + 'px !important; height: ' + (width / this.aspectRatio) + 'px; !important }' + (newWidth == width ? '#' + this.currentConfig.ID + Identifiers.classThumbnail + ' { width: ' + newWidth + 'px !important; height: ' + (this.currentConfig.CaptionPosition == 'outside' ? 'auto' : ((newWidth / this.aspectRatio) + 'px')) + ' !important; }' : '') + '</style>');
      }

      if (this.currentConfig.Orientation == 'vertical') {
        $('#' + this.currentConfig.ID).width(newWidth);
      } else {
        $('#' + this.currentConfig.ID).width('');
      }
    };

    //this method apply margin to .oo-thumbnail
    Playlists.prototype.ThumbnailsSpacingChanger = function (ID, spacing) {
      this.currentConfig.ThumbnailsSpacing = parseInt(spacing);
      var marginTop = 0;
      if ((parseInt(this.currentConfig.RowsNumber) > 1 && this.currentConfig.PodType == 'paging') || this.currentConfig.Orientation == 'vertical') {
        if ($('#' + this.currentConfig.ID + Identifiers.classThumbnail).length > 0) {
          marginTop = spacing;
        }
      }
      var marginRight = this.currentConfig.Orientation == 'vertical' ? 0 : spacing;
      $('#ThumbnailsSpacing-styles-' + this.playerId).remove();
      $('head').append('<style type="text/css" id="ThumbnailsSpacing-styles-' + this.playerId + '">' + '#' + this.currentConfig.ID + Identifiers.classThumbnail + ' { margin-left: ' + marginRight + 'px !important;  }' + (this.swiperInstance ? (this.currentConfig.Orientation == 'vertical' ? '#' + this.currentConfig.ID + Identifiers.classSlide + ': first-child { margin-top: -' + marginTop + 'px !important;  }' + '#' + this.currentConfig.ID + Identifiers.classThumbnail + '{margin-top: ' + marginTop + 'px !important;}' : '#' + this.currentConfig.ID + Identifiers.classThumbnail + ' { margin-top: ' + marginTop + 'px !important;  }') : (this.currentConfig.Orientation == 'vertical' ? '#' + this.currentConfig.ID + Identifiers.classThumbnail + ': nth-child(n+2) { margin-top: ' + marginTop + 'px !important;  }' : '#' + this.currentConfig.ID + Identifiers.classThumbnail + ' { margin-top: ' + marginTop + 'px !important;  }')
        ) + (this.currentConfig.Orientation == 'vertical' ? '#' + this.currentConfig.ID + Identifiers.classThumbnail + ': nth-child(n+2) { margin-top: ' + marginTop + 'px !important;  }' : '#' + this.currentConfig.ID + Identifiers.classThumbnail + ' { margin-top: ' + marginTop + 'px !important;  }') + '#' + this.currentConfig.ID + Identifiers.classPlaylistThumbnails + ' {margin-left: -' + marginRight + 'px !important;} ' + Identifiers.classThumbnails + '{ margin-top: -' + ( this.currentConfig.Orientation == 'vertical' ? marginTop : ( ObjToArray(this.Data).length > 1 ? marginTop : 0)) + 'px !important;}' + '</style>');
    };

    // this method collapse tabs menu to current menu if tabs count to many and on resize
    Playlists.prototype.CheckMenuHeight = function () {
      var classMenuItems = $('#' + this.currentConfig.ID + Identifiers.classMenuItems);
      var wrapperObject = $('#' + this.wrapperID);
      if (this.currentConfig.Orientation == 'vertical') {
        this.tmpData.menuItemsWidth = 0;
        return;
      }
      $('#' + this.currentConfig.ID + Identifiers.classMenuCurrent).css('display', '');
      classMenuItems.css('display', '');
      wrapperObject.attr('data-playlist-menu-size', 'normal');
      var summaryWidth = 0;
      $('#' + this.currentConfig.ID + Identifiers.classMenuItem).each(function () {
        summaryWidth += $(this).width() + parseInt($(this).css('margin-right')) + parseInt($(this).css('margin-left'));
      });
      this.tmpData.menuItemsWidth = summaryWidth;
      if (classMenuItems.width() < this.tmpData.menuItemsWidth) {
        this.ChangeActiveMenuColor(this.currentConfig.ActiveMenuColor, true);
        wrapperObject.attr('data-playlist-menu-size', 'big');
      } else {
        this.ChangeActiveMenuColor(this.currentConfig.ActiveMenuColor);
        wrapperObject.attr('data-playlist-menu-size', 'normal');
      }
    };

    Playlists.prototype.FixWrapperSizes = function () {
      var wrapperObject = $('#' + this.wrapperID);
      if (this.currentConfig.Orientation == 'horizontal' && this.currentConfig.Position != 'none') {
        wrapperObject.height('');
        //wrapperObject.height() = "ooplayer height" + $('#' + this.currentConfig.ID + Identifiers.classThumbnails).height();
      }
      if (this.currentConfig.Orientation == 'vertical' && this.currentConfig.Position != 'none') {
        wrapperObject.height('');
      }
      if (!this.currentConfig.IsDocked) {
        wrapperObject.height('100%');
        wrapperObject.width('100%');
      } else {
        wrapperObject.height('');
        wrapperObject.width('');
      }
    };

    Playlists.prototype.FixScrollButtonsSize = function () {
      var previousButton = $('#' + this.currentConfig.ID + Identifiers.classPreviousButton);
      var nextButton = $('#' + this.currentConfig.ID + Identifiers.classNextButton);
      nextButton.height('');
      previousButton.height('');
      if (this.currentConfig.Orientation == 'horizontal' && this.currentConfig.PodType == 'paging' && parseInt(this.currentConfig.RowsNumber) > 1) {
        nextButton.height(nextButton.parent().height() - this.currentConfig.ThumbnailsSpacing);
        previousButton.height(previousButton.parent().height() - this.currentConfig.ThumbnailsSpacing);
      }
    };

    Playlists.prototype.FontSizeChanger = function (target, fontsize) {
      $('#' + this.wrapperID).css('font-size', fontsize);
    };

    Playlists.prototype.FontFamilyChanger = function (target, fontfamily) {
      var wrapperObject = $('#' + this.wrapperID);
      var ID = this.wrapperID;
      switch (target) {
        case 'wrapper':
          this.currentConfig.WrapperFontFamily = fontfamily;
          ID = this.wrapperID;
          wrapperObject.attr('global-font-family', fontfamily);
          break;
        case 'tabs':
          this.currentConfig.TabsFontFamily = fontfamily;
          ID = this.currentConfig.ID + Identifiers.classMenuItems;
          wrapperObject.attr('tabs-font-family', fontfamily);
          break;
        case 'menu':
          this.currentConfig.MenuFontFamily = fontfamily;
          ID = this.currentConfig.ID + Identifiers.classMenuCurrent;
          wrapperObject.attr('menu-font-family', fontfamily);
          break;
      }
    };

    //this method calculate .oo-playlists-thumbnails
    Playlists.prototype.CalculateThumbnailsSizes = function () {
      var clThumbnail = $('#' + this.currentConfig.ID + Identifiers.classThumbnail);
      var clThumbnails = $('#' + this.currentConfig.ID + Identifiers.classThumbnails);
      var playlistThumbnails = $('#' + this.currentConfig.ID + Identifiers.classPlaylistThumbnails);
      if (this.currentConfig.Orientation == 'vertical') {
        clThumbnails.width('');
        clThumbnails.height('');
        playlistThumbnails.height('');
        return;
      }
      var rows = this.currentConfig.RowsNumber;
      if (this.currentConfig.PodType == 'scrolling') {
        clThumbnails.width(clThumbnail.length * (
            clThumbnail.outerWidth() + parseInt(clThumbnail.css('margin-left'))
            ));
        rows = 1;
      } else {
        var newWidth = playlistThumbnails.width();
        clThumbnails.width(($('#' + this.currentConfig.ID + Identifiers.classThumbnailPaging).length * newWidth) || '100%');
      }
      var height = parseInt(rows) * (clThumbnail.height());
      if (parseInt(rows) > 1) {
        height += parseInt(rows) * this.currentConfig.ThumbnailsSpacing;
      }
      playlistThumbnails.height(Math.round(height));
    };

    Playlists.prototype.CompareObjects = function (first, second, properties) {
      first = this.currentConfig;
      second = this.config;
      if (!properties) {
        if (first.ActiveMenuColor != second.ActiveMenuColor || first.Caption != second.Caption || first.CaptionPosition != second.CaptionPosition || first.MenuFontFamily != second.MenuFontFamily || first.MenuFontSize != second.MenuFontSize || first.MenuStyle != second.MenuStyle || first.Orientation != second.Orientation || first.PodType != second.PodType || first.Position != second.Position || first.RowsNumber != second.RowsNumber || first.ThumbnailsSize != second.ThumbnailsSize || first.ThumbnailsSpacing != second.ThumbnailsSpacing) {
          return false;
        }
      } else {
        for (var propKey in properties) {
          if (first[propKey] != second[propKey]) {
            return false;
          }
        }
      }
      return true;
    };

    Playlists.prototype.SwiperInit = function () {
      var reInit = true;
      var me = this;
      if (me.swiperInstance && me.swiperInstance.params && !me.CompareObjects(me.currentConfig, me.config)) {
        if (!DataHelper.isOOStudio) {
          me.swiperInstance.swipeTo(0, 0);
        }
      }
      if (reInit && me.swiperInstance) {
        me.swiperInstance.destroy(true);
        me.swiperInstance = null;
      }
      me.ThumbnailsWrapper();
      var slidesPerSlide = 0;
      var wholeSlidesPerSlide = 0;
      if (me.currentConfig.Orientation == 'horizontal') {
        slidesPerSlide = $('#' + me.currentConfig.ID + Identifiers.classPlaylistThumbnails).width() / (parseInt(me.currentConfig.ThumbnailsSize) + me.currentConfig.ThumbnailsSpacing);
        wholeSlidesPerSlide = parseInt(slidesPerSlide);
      } else {
        slidesPerSlide = $('#' + me.currentConfig.ID + Identifiers.classPlaylistThumbnails).height() / $('#' + me.currentConfig.ID + Identifiers.classSlide).height();
        wholeSlidesPerSlide = parseInt(slidesPerSlide);
      }
      var sliderClass = me.currentConfig.PodType == 'paging' && me.currentConfig.Orientation == 'horizontal' ? (Identifiers.classThumbnailPaging.substr(2)) : (Identifiers.classSlide.substr(2));
      if (me.currentConfig.PodType == 'paging') {
        slidesPerSlide = me.currentConfig.PodType == 'paging' && me.currentConfig.Orientation == 'horizontal' ? 1 : slidesPerSlide;
        wholeSlidesPerSlide = me.currentConfig.PodType == 'paging' && me.currentConfig.Orientation == 'horizontal' ? 1 : wholeSlidesPerSlide;
      }
      if ($('#' + me.currentConfig.ID + ' .' + sliderClass).length <= wholeSlidesPerSlide || wholeSlidesPerSlide == 0) {
        me.CalculateThumbnailsSizes();
        //        me.ScrollCheck();
        return;
      }
      me.swiperInstance = $('#' + me.currentConfig.ID + Identifiers.classPlaylistThumbnails).swiper({
        mode: me.currentConfig.Orientation,
        slidesPerSlide: slidesPerSlide,
        slideClass: sliderClass,
        wrapperClass: Identifiers.classThumbnails.substr(2),
        wholeSlidesPerSlide: wholeSlidesPerSlide,
        currentPlaylist: $('#' + me.currentConfig.ID + Identifiers.classMenuCurrent + ' a').text(),
        currentPlaylistPosition: me.currentConfig.Position,
        spasing: me.currentConfig.ThumbnailsSpacing,
        freeMode: false,
        onSlideClick: function (event, _this) {
          if (_this.button != 0) {
            return;
          }
          if (!_this.target) {
            return;
          }
          var id = _this.target.id == '' ? $(_this.target).parents(Identifiers.classThumbnail).attr('id') : _this.target.id;
          if (!!id) {
            me.pluginState.currentPlaylist = $('#' + me.wrapperID + Identifiers.classMenuCurrent + ' a').text();
            me.pluginState.lastEmbedCodeInPlaylist = $(event.slides[event.slides.length - 1]).find('.oo-thumbnail').attr('id');
            me.pluginState.firstEmbedCodeInPlaylist = $(event.slides[0]).find('.oo-thumbnail').attr('id');
            var index = 0;
            for (var key in me.Data[me.pluginState.currentPlaylist]) {
              if (me.Data[me.pluginState.currentPlaylist].hasOwnProperty(key)) {
                if (me.Data[me.pluginState.currentPlaylist][key].embed_code != id) {
                  index++;
                } else {
                  break;
                }
              }
            }
            me.pluginState.currentVideoIndex = index;
            if (me.messageBus && !me.swiperInstance.isTouched) {
              if (me.messageBus._interceptArgs.setEmbedCode[0] != id) {
                if (me.ooyalaAds) {
                  me.messageBus.publish("setEmbedCodeAfterOoyalaAd", id, OO.playerParams);
                } else {
                  me.messageBus.publish(OO.EVENTS['SET_EMBED_CODE'], id, me.playerCreateParams);
                }
                me.tmpData.needPlayerPlay = true;
              }
            } else if ($('#' + id).attr('data-url')) {
              window.location = $('#' + id).attr('data-url');
            }
          }
        },
        onTouchMove: function () {
          if (me.tmpData.swiperMoved) {
            me.tmpData.swiperMoved++;
          } else {
            me.tmpData.swiperMoved = 1;
          }
        },
        onTouchEnd: function () {
          me.tmpData.swiperMoved = 0;
          var translate = me.swiperInstance.getTranslate(me.currentConfig.Orientation == 'horizontal' ? 'x' : 'y');
          var diff = 0;
          if (me.currentConfig.Orientation == 'horizontal') {
            if (me.currentConfig.PodType == 'paging') {
              $('#' + me.currentConfig.ID + Identifiers.classNextButton).show();
              $('#' + me.currentConfig.ID + Identifiers.classPreviousButton).show();

              if (me.swiperInstance.currentSlide() == me.swiperInstance.slides[me.swiperInstance.slides.length - 1]) {
                $('#' + me.currentConfig.ID + Identifiers.classNextButton).hide();
              }
              if (me.swiperInstance.currentSlide() == me.swiperInstance.slides[0]) {
                $('#' + me.currentConfig.ID + Identifiers.classPreviousButton).hide();
              }
            }
          } else {
            if (translate < 0) {
              $('#' + me.currentConfig.ID + Identifiers.classPreviousButton).show();
            }
            if ($('#' + me.currentConfig.ID + Identifiers.classNextButton).css('display') == 'block') {
              $('#' + me.currentConfig.ID + Identifiers.classPreviousButton).show();
            }

            if (me.swiperInstance.container.offsetHeight + Math.round(me.currentConfig.ThumbnailsSize / me.aspectRatio) - translate >= me.swiperInstance.wrapper.offsetHeight - Math.round(me.currentConfig.ThumbnailsSize / me.aspectRatio)) {
              $('#' + me.currentConfig.ID + Identifiers.classNextButton).hide();
            } else {
              $('#' + me.currentConfig.ID + Identifiers.classNextButton).show();
            }
            if (me.swiperInstance.getTranslate('y') >= 0) {
              if ($('#' + me.currentConfig.ID + Identifiers.classPreviousButton).css('display') == 'block') {
                $('#' + me.currentConfig.ID + Identifiers.classNextButton).show();
              }

              me.swiperInstance.swipeTo(0, 0);
              $('#' + me.currentConfig.ID + Identifiers.classPreviousButton).hide();
            }
          }
        }
      });
      me.CalculateThumbnailsSizes();
      me.ScrollCheck();
    };

    //this method bind all ui events
    //if u re render all pods u must set this.isBound = false before u call this method
    Playlists.prototype.BindEvents = function () {
      var me = this;
      me.SwiperInit();
      me.BindEventsPlayerLoopAutoPlay();
      if (!me.swiperInstance) {
        $('#' + me.wrapperID + Identifiers.classThumbnail).on('click', function () {
          me.pluginState.currentPlaylist = $('#' + me.wrapperID + Identifiers.classMenuCurrent + ' a').text();
          me.pluginState.lastEmbedCodeInPlaylist = $(this).parent().parent().find('.oo-thumbnail').last().attr('id');
          me.pluginState.firstEmbedCodeInPlaylist = $(this).parent().parent().find('.oo-thumbnail').first().attr('id');
          var index = 0;
          for (var key in me.Data[me.pluginState.currentPlaylist]) {
            if (me.Data[me.pluginState.currentPlaylist].hasOwnProperty(key)) {
              if (me.Data[me.pluginState.currentPlaylist][key].embed_code != $(this).attr('id')) {
                index++;
              } else {
                break;
              }
            }
          }
          me.pluginState.currentVideoIndex = index;
          if (me.messageBus) {
            if (me.messageBus._interceptArgs.setEmbedCode[0] != $(this).attr('id')) {
              me.messageBus.publish(OO.EVENTS['SET_EMBED_CODE'], $(this).attr('id'), me.playerCreateParams);
              me.tmpData.needPlayerPlay = true;
              me.tmpData.isEmbedCodeChanged = true;
            }
          } else {
            if ($(this).attr('data-url')) {
              window.location = $(this).attr('data-url');
            }
          }
        });
      }
      $('#' + me.wrapperID + Identifiers.classThumbnail + ' img').on('error', function () {
        this.src = me.templateSources.Images['no-preview'];
      });
      if (!this.isBound) {
        this.isBound = true;
        var timerResize;

        //on window resize
        $(window).resize(function () {
          if (timerResize) {
            clearTimeout(timerResize);
          }
          timerResize = setTimeout(function () {
            me.SwiperInit();
            me.FixWrapperSizes();
            me.CheckMenuHeight();
            me.ScrollCheck();
          }, 200);
        });

        //on .oo-menu-current click (in menu type or in tabs when they are collapsed)
        $('#' + this.wrapperID + ' #' + this.currentConfig.ID + Identifiers.classMenuCurrent).unbind('click').on('click', {ID: this.currentConfig.ID, wrapperID: this.wrapperID}, function (event) {
          var id = event.data.ID;
          if ($('#' + event.data.wrapperID).attr('data-playlists-menu-style') == 'single') {
            return;
          }
          if ($('#' + id + Identifiers.classPlaylistMenu)[0].className.indexOf('menuShow') != -1) {
            $('#' + id + Identifiers.classPlaylistMenu).removeClass('menuShow');
          } else {
            $('#' + id + Identifiers.classPlaylistMenu).addClass('menuShow');
          }
        });

        //on tab click (.oo-menu-item a)
        $('#' + this.wrapperID + ' #' + this.currentConfig.ID + ' .oo-menu-item a').on('click', {ID: this.currentConfig.ID, orientation: this.currentConfig.Orientation, playerClass: this.playerClass, wrapperID: this.wrapperID}, function (event) {
          if ($('#' + event.data.wrapperID).attr('data-playlist-orientation') == 'vertical') {
            $('#' + me.currentConfig.ID + Identifiers.classPlaylistMenu).removeClass('menuShow');
          }
          if ($('#' + event.data.wrapperID).attr('data-playlist-menu-size') == 'big' && $('#' + event.data.wrapperID).attr('data-playlist-orientation') == 'horizontal') {
            $('#' + me.currentConfig.ID + Identifiers.classPlaylistMenu).removeClass('menuShow');
          }
          if ($(this).text() == $('#' + event.data.ID + Identifiers.classMenuCurrent + ' a').text()) {
            return;
          }
          me.MenuItemClick(this);
          me.CalculateThumbnailsSizes();
          me.ScrollCheck('#' + event.data.ID, $('#' + event.data.wrapperID).attr('data-playlist-orientation'), event.data.wrapperID);
          me.FixScrollButtonsSize();
        });
        if (Playlists.prototype.BindEvents.caller != Playlists.prototype.RefreshData) {
          var diffLength = 0;

          //on next button click (if button showed) (scroll)
          $('#' + this.wrapperID + ' #' + this.currentConfig.ID + Identifiers.classNextButton).on('click', {ID: this.currentConfig.ID, wrapperID: this.wrapperID, thumbnailsSizes: this.currentConfig.ThumbnailsSizes, playerClass: this.playerClass}, function () {
            if (!me.swiperInstance) {
              return;
            }

            $('#' + me.currentConfig.ID + Identifiers.classPreviousButton).show();
            me.swiperInstance.swipeNext();
            var translate = me.swiperInstance.getTranslate(me.currentConfig.Orientation == 'horizontal' ? 'x' : 'y');
            if (translate < 0) {
              translate *= -1;
            }
            var diff = 0;
            if (me.currentConfig.Orientation == 'horizontal') {
              if (me.currentConfig.PodType == 'scrolling') {
                if ($('#' + me.currentConfig.ID + Identifiers.classPlaylistThumbnails).width() + translate + me.currentConfig.ThumbnailsSize + me.currentConfig.ThumbnailsSpacing > $('#' + me.currentConfig.ID + Identifiers.classThumbnails).width()) {
                  $('#' + me.currentConfig.ID + Identifiers.classNextButton).hide();
                }
              } else {
                if (me.swiperInstance.currentSlide() == me.swiperInstance.slides[me.swiperInstance.slides.length - 1]) {
                  $('#' + me.currentConfig.ID + Identifiers.classNextButton).hide();
                } else {
                  $('#' + me.currentConfig.ID + Identifiers.classNextButton).show();
                }
              }
            } else {
              var thumbnailHeight = Math.round(me.currentConfig.ThumbnailsSize / me.aspectRatio);
              var translateDelta = translate + me.swiperInstance.container.offsetHeight + thumbnailHeight;
              var thumbnailWrapperHeight = me.swiperInstance.wrapper.offsetHeight - thumbnailHeight;
              if (translateDelta >= thumbnailWrapperHeight) {
                diff = translate + me.swiperInstance.container.offsetHeight - me.swiperInstance.wrapper.offsetHeight;
                $('#' + me.currentConfig.ID + Identifiers.classNextButton).hide();
                me.swiperInstance.setTransform(0, me.swiperInstance.getTranslate('y') + diff);
              }
            }
            diffLength = diff;
          });

          //on prev button click (if button showed) (scroll)
          $('#' + this.wrapperID + ' #' + this.currentConfig.ID + Identifiers.classPreviousButton).on('click', {ID: this.currentConfig.ID, wrapperID: this.wrapperID, thumbnailsSizes: this.currentConfig.ThumbnailsSizes, playerClass: this.playerClass}, function () {
            if (!me.swiperInstance) {
              return;
            }
            $('#' + me.currentConfig.ID + Identifiers.classNextButton).show();
            var translate = me.swiperInstance.getTranslate(me.currentConfig.Orientation == 'horizontal' ? 'x' : 'y');
            me.swiperInstance.swipePrev();
            if (me.currentConfig.Orientation == 'horizontal') {
              if (me.currentConfig.PodType == 'scrolling') {
                if (translate + parseFloat(me.swiperInstance.currentSlide().style.width) >= 0) {
                  $('#' + me.currentConfig.ID + Identifiers.classPreviousButton).hide();
                }
              } else {
                if (me.swiperInstance.currentSlide() == me.swiperInstance.slides[0]) {
                  $('#' + me.currentConfig.ID + Identifiers.classPreviousButton).hide();
                } else {
                  $('#' + me.currentConfig.ID + Identifiers.classPreviousButton).show();
                }
              }
            } else {
              diffLength > 0 ? me.swiperInstance.setTransform(0, translate + (diffLength * -1)) : _.delay(function() { me.swiperInstance.swipePrev(); }, 200);
              if (translate + Math.round(me.currentConfig.ThumbnailsSize / me.aspectRatio) + me.currentConfig.ThumbnailsSpacing * 2 >= 0) {
                _.delay(function() { $('#' + me.currentConfig.ID + Identifiers.classPreviousButton).hide(); }, 200);
              }
            }
            diffLength = 0;
          });
        }
      }
    };

    Playlists.prototype.BindEventsPlayerLoopAutoPlay = function () {
      var pluginStateLocal = this.pluginState;
      var me = this;
      if (me.messageBus && me.messageBus.subscribe) {
        me.messageBus.unsubscribe(OO.EVENTS.PLAYED, 'podsPlugin2');
        me.messageBus.unsubscribe(OO.EVENTS.EMBED_CODE_CHANGED, 'podsPlugin2');
        me.messageBus.subscribe(OO.EVENTS.PLAYED, 'podsPlugin2', function () {
          var isAutoPlayOn = me.playerCreateParams.autoPlay || me.playerCreateParams.autoplay;
          var isAutoRepeatOn = me.playerCreateParams.loop;
          if (me.currentConfig.Position == 'none' || window.stopPlayingVideoOneByOne) {
            return;
          }
          if (isAutoPlayOn) {
            if (me.pluginState.currentVideoIndex == 0) {
              if (me.pluginState.currentEmbedCode == '' && me.pluginState.initialVideoEmbedCode != me.pluginState.firstEmbedCodeInPlaylist) {
                me.messageBus.publish(OO.EVENTS.SET_EMBED_CODE, me.pluginState.firstEmbedCodeInPlaylist, me.playerCreateParams);
                return;
              }
              if (me.pluginState.currentEmbedCode != '' && me.pluginState.currentEmbedCode != me.pluginState.firstEmbedCodeInPlaylist) {
                me.messageBus.publish(OO.EVENTS.SET_EMBED_CODE, me.pluginState.firstEmbedCodeInPlaylist, me.playerCreateParams);
                return;
              }
            }
            if (isAutoRepeatOn && me.pluginState.currentEmbedCode == me.pluginState.lastEmbedCodeInPlaylist) {
              me.pluginState.currentVideoIndex = 0;
              me.messageBus.publish(OO.EVENTS.SET_EMBED_CODE, me.pluginState.firstEmbedCodeInPlaylist, me.playerCreateParams);
              return;
            }

            if (me.Data[me.pluginState.currentPlaylist] && me.Data[me.pluginState.currentPlaylist][me.pluginState.currentVideoIndex + 1]) {
              var nextIndex = me.pluginState.currentVideoIndex + 1;
              me.pluginState.currentVideoIndex = nextIndex;
              me.messageBus.publish(OO.EVENTS.SET_EMBED_CODE, me.Data[me.pluginState.currentPlaylist][nextIndex].embed_code, me.playerCreateParams);
            }
          } else {
            if (isAutoRepeatOn && me.pluginState.currentEmbedCode == me.pluginState.lastEmbedCodeInPlaylist) {
              me.pluginState.currentVideoIndex = 0;
              me.messageBus.publish(OO.EVENTS.SET_EMBED_CODE, me.pluginState.firstEmbedCodeInPlaylist, me.playerCreateParams);
            }
          }
        });
      }
    };

    //use this method if u need change pods position
    //param position can get values : 'top', 'bottom', 'left', 'right', 'none'
    Playlists.prototype.PlaylistPositionChanger = function (position) {
      var wrapperObject = $('#' + this.wrapperID);
      this.currentConfig.Position = position;
      this.currentConfig.Orientation = position == 'top' || position == 'bottom' ? 'horizontal' : 'vertical';
      if (ObjToArray(this.Data).length > 0) {
        this.currentConfig.Position = position;
        this.currentConfig.Orientation = position == 'top' || position == 'bottom' ? 'horizontal' : 'vertical';
        $('#' + this.currentConfig.ID + Identifiers.classMenuItems).css('display', '');
        $('#' + this.currentConfig.ID + Identifiers.classMenuCurrent).css('display', '');
        wrapperObject.attr('data-playlist-layout', position);
        wrapperObject.attr('data-playlist-orientation', this.currentConfig.Orientation);
        this.isBound = false;
        this.ThumbnailsSpacingChanger(this.currentConfig.ID, this.currentConfig.ThumbnailsSpacing);
        this.BindEvents();
        this.FixWrapperSizes();
      } else {
        wrapperObject.attr('data-playlist-layout', position);
        wrapperObject.attr('data-playlist-orientation', this.currentConfig.Orientation);
      }
      this.CheckMenuHeight();
    };

    //method that render thumbnails on playlist change(menu item click)
    Playlists.prototype.RefreshPlaylist = function (playlistsID, data) {
      $('#' + playlistsID + Identifiers.classThumbnail).remove();
      $('#' + playlistsID + Identifiers.classThumbnailPaging).remove();
      $('#' + playlistsID + Identifiers.classThumbnails).append(this.templateThumbnails({
        playlist: data,
        timeConverter: TimeConverter,
        noPreview: this.templateSources.Images['no-preview']
      }));

      this.BindEvents();
      if ($(Identifiers.classCaptionDescription).length) {
        $(Identifiers.classCaptionDescription).ellipsis();
      }
    };

    Playlists.prototype.SortDataByPlaylist = function (playlistsID, playlistID) {
      this.RefreshPlaylist(playlistsID, this.Data[playlistID]);
    };

    //used when only paging mode
    Playlists.prototype.ThumbnailsWrapper = function () {
      var clThumbnail = $('#' + this.currentConfig.ID + Identifiers.classThumbnail);
      var clThumbnailPaging = $('#' + this.currentConfig.ID + Identifiers.classThumbnailPaging);
      if (clThumbnailPaging.length) {
        $('#' + this.currentConfig.ID + Identifiers.classThumbnails).append(clThumbnail);
        clThumbnailPaging.remove();
      }
      if ($('#' + this.currentConfig.ID + Identifiers.classSlide).length) {
        $('#' + this.currentConfig.ID + Identifiers.classThumbnails).append(clThumbnail);
        $('#' + this.currentConfig.ID + Identifiers.classSlide).remove();
      }
      if (this.currentConfig.PodType != 'paging' || this.currentConfig.Orientation != 'horizontal') {
        clThumbnail.wrap('<div class="slide-' + this.playerId + '"></div>');
        $('#PlaylistsSlide-style-' + this.playerId).remove();
        var slideWidth = clThumbnail.width();
        var slideHeight = clThumbnail.height();
        if (this.currentConfig.Orientation == 'horizontal') {
          slideWidth += this.currentConfig.ThumbnailsSpacing;
          if (this.currentConfig.PodType == 'paging' && this.currentConfig.RowsNumber > 1) {
            slideHeight += this.currentConfig.ThumbnailsSpacing;
          }
        } else {
          slideHeight += this.currentConfig.ThumbnailsSpacing;
        }
        if(this.currentConfig.Position == 'left') {
          $('head').append('<style id="PlaylistsSlide-style-' + this.playerId + '">#' + this.currentConfig.ID + Identifiers.classSlide + '{width: ' + slideWidth + 'px !important; height: ' + slideHeight + 'px !important; float: left;}' +
            // Chrome
            '\n.innerWrapper:not(-webkit-full-screen) {left: ' + slideWidth + 'px !important; width: calc(100% - ' + slideWidth + 'px) !important;}'+
            // Mozilla
            '\n.innerWrapper:not(-moz-full-screen) {left: ' + slideWidth + 'px !important; width: calc(100% - ' + slideWidth + 'px) !important;}'+
            // IE
            '\n.innerWrapper:not(-ms-fullscreen) {left: ' + slideWidth + 'px !important; width: calc(100% - ' + slideWidth + 'px) !important;}'+
            // CSS3 & Edge
            '\n.innerWrapper:not(fullscreen) {left: ' + slideWidth + 'px !important; width: calc(100% - ' + slideWidth + 'px) !important;}'+
            '\n#oo-thumbnails-screensize{position:relative;}</style>');
        } else if(this.currentConfig.Position == 'right') {
          $('head').append('<style id="PlaylistsSlide-style-' + this.playerId + '">#' + this.currentConfig.ID + Identifiers.classSlide + '{width: ' + slideWidth + 'px !important; height: ' + slideHeight + 'px !important; float: right;}\n.innerWrapper {left: 0px !important; width: calc(100% - ' + slideWidth + 'px) !important;}\n#oo-thumbnails-screensize{position:relative;}</style>');
        } else {
          $('head').append('<style id="PlaylistsSlide-style-' + this.playerId + '">#' + this.currentConfig.ID + Identifiers.classSlide + '{width: ' + slideWidth + 'px !important; height: ' + slideHeight + 'px !important; float: left;}\n#oo-thumbnails-screensize{position:relative;}</style>');
        }
      } else {
        var i;
        var itemsInWrappers = parseInt($('#' + this.currentConfig.ID + Identifiers.classPlaylistThumbnails).width() / (parseInt(this.currentConfig.ThumbnailsSize) + parseInt(this.currentConfig.ThumbnailsSpacing))) * this.currentConfig.RowsNumber;
        var slidesCount = parseInt(clThumbnail.length / itemsInWrappers);
        if (clThumbnail.length / itemsInWrappers != slidesCount) {
          slidesCount++;
        }
        for (i = 0; i < slidesCount; i++) {
          $(clThumbnail.slice(i * itemsInWrappers, (i + 1) * itemsInWrappers)).wrapAll('<div class="' + Identifiers.classThumbnailPaging.substr(2) + '"></div>');
        }
        var slideWidth = $('#' + this.currentConfig.ID + Identifiers.classPlaylistThumbnails).width();
        clThumbnailPaging.width(slideWidth);
        if (parseInt(this.currentConfig.RowsNumber) > 1) {
          clThumbnailPaging.height(parseInt(this.currentConfig.RowsNumber) * $('#' + this.currentConfig.ID + Identifiers.classThumbnail).height() + parseInt(this.currentConfig.RowsNumber) * this.currentConfig.ThumbnailsSpacing);
        }
        else {
          $('#' + this.currentConfig.ID + Identifiers.classThumbnails).height('');
        }
      }
    };

    //wrap div that contain OOYALA player
    Playlists.prototype.Wrap = function (elementID) {
      if (this.currentConfig.IsDocked) {
        $('#' + elementID).children().wrapAll('<div id="' + this.wrapperID + '" class="oo-playlists-wrapper"/>');
      } else {
        if (this.currentConfig.Position == 'bottom') {
          $('#' + elementID).append('<div id="' + this.wrapperID + '" class="oo-playlists-wrapper"/>');
        } else {
          $('#' + elementID).prepend('<div id="' + this.wrapperID + '" class="oo-playlists-wrapper"/>');
        }
      }
      // Substituting JQuery calls with a variable for the wrapperObject breaks this functionality.
      $('#' + this.wrapperID).attr('data-playlist-layout', this.currentConfig.Position).attr('data-playlist-orientation', this.currentConfig.Orientation).attr('data-playlists-menu-style', this.currentConfig.MenuStyle).attr('data-playlists-rows', this.currentConfig.RowsNumber).attr('data-playlists-thumbnails-size', this.currentConfig.ThumbnailsSize).attr('aspect-ratio', this.aspectRatio).attr('data-theme', this.currentConfig.Theme).attr('data-playlist-pod-type', this.currentConfig.PodType).attr('data-caption-position', this.currentConfig.CaptionPosition).attr('data-caption', this.currentConfig.Caption).addClass('oo-playlists-wrapper');
      if (this.currentConfig.Caption.indexOf('title') != -1) {
        $('#' + this.wrapperID).addClass('vs_showTitle_true').removeClass('vs_showTitle_false');
      } else {
        $('#' + this.wrapperID).removeClass('vs_showTitle_true').addClass('vs_showTitle_false');
      }
      if (this.currentConfig.Caption.indexOf('description') != -1) {
        $('#' + this.wrapperID).addClass('vs_showDescription_true').removeClass('vs_showDescription_false');
      } else {
        $('#' + this.wrapperID).removeClass('vs_showDescription_true').addClass('vs_showDescription_false');
      }
      if (this.currentConfig.Caption.indexOf('duration') != -1) {
        $('#' + this.wrapperID).addClass('vs_showDuration_true').removeClass('vs_showDuration_false');
      } else {
        $('#' + this.wrapperID).removeClass('vs_showDuration_true').addClass('vs_showDuration_false');
      }
      $('#' + this.wrapperID).addClass('vs-caption-' + this.currentConfig.CaptionPosition).addClass('vs-font-' + this.currentConfig.WrapperFontSize);
      $('#' + this.wrapperID).addClass('theme-' + this.currentConfig.Theme);
      $('#' + this.wrapperID).css('font-size', this.currentConfig.WrapperFontSize + 'px');
      $('#' + this.wrapperID).css('overflow', 'visible');
      if (this.playerParams && this.playerParams.width) {
        $('#' + this.wrapperID).width(parseInt(this.playerParams.width));
      }
      if (this.playerParams && this.playerParams.height) {
        $('#' + this.wrapperID).height(parseInt(this.playerParams.height));
      }
    };

    //draw pods on create;
    Playlists.prototype.DrawPlaylists = function () {
      _.templateSettings.variable = "data";
      $('#' + this.currentConfig.ID).remove();
      this.templatePlaylists = _.template(this.templateSources.Playlist);
      this.templateMenu = _.template(this.templateSources.MenuItems);
      this.templateThumbnails = _.template(this.templateSources.Thumbnails);
      this.templateCurrentMenu = _.template(this.templateSources.CurrentMenuItem);
      if (ObjToArray(this.Data).length > 0) {
        this.UseTemplates(true);
        if (ObjToArray(this.Data).length <= 1) {
          $('#' + this.wrapperID).attr('data-playlists-menu-style', 'single');
        }
        this.ChangeActiveMenuColor(this.currentConfig.ActiveMenuColor);
        $('#' + this.currentConfig.ID + Identifiers.classMenuItem).first().addClass(Identifiers.classMenuActive.substr(2));
        this.PlaylistPositionChanger(this.currentConfig.Position);
        var oldSpacing = this.currentConfig.ThumbnailsSpacing;
        if (this.currentConfig.Orientation == 'horizontal') {
          this.currentConfig.ThumbnailsSpacing = parseInt($('#' + this.currentConfig.ID + Identifiers.classThumbnail).css('margin-left'));
        } else {
          this.currentConfig.ThumbnailsSpacing = parseInt($('#' + this.currentConfig.ID + Identifiers.classThumbnail).css('margin-top'));
        }
        this.currentConfig.ThumbnailsSpacing = this.currentConfig.ThumbnailsSpacing != 0 ? this.currentConfig.ThumbnailsSpacing : oldSpacing;
        this.ThumbnailsSpacingChanger(this.currentConfig.ID, this.currentConfig.ThumbnailsSpacing, this.currentConfig.Orientation, this.currentConfig.RowsNumber);
      } else {
        $('#' + this.currentConfig.ID).hide();
        $('#' + this.wrapperID).attr('data-playlist-layout', 'none');
      }
      this.FontSizeChanger('wrapper', this.currentConfig.WrapperFontSize);
      this.FontFamilyChanger('wrapper', this.currentConfig.WrapperFontFamily);
      this.PlaylistPositionChanger(this.currentConfig.Position);
      this.ThumbnailsSpacingChanger(this.currentConfig.ID, this.currentConfig.ThumbnailsSpacing, this.currentConfig.Orientation, this.currentConfig.RowsNumber);
      this.ThumbnailsSizeChanger(this.currentConfig.ThumbnailsSize);
      this.CalculateThumbnailsSizes();
      this.CheckMenuHeight();
      if ($(Identifiers.classCaptionDescription).length) {
        $(Identifiers.classCaptionDescription).ellipsis();
      }
      delete _.templateSettings.variable;
    };

    //Called only from OOyala Studio
    //When we change data in playlists
    Playlists.prototype.RefreshData = function (data, callback) {
      if (!this.isInitialized) {
        return;
      }
      this.PlaylistsIDs = {};
      this.PlaylistsData = {};
      this.PlaylistsMap = [];
      this.Data = {};
      this.pluginState.currentEmbedCode = '';
      this.pluginState.currentPlaylist = '';
      this.pluginState.currentVideoIndex = 0;
      this.pluginState.firstEmbedCodeInPlaylist = '';
      this.pluginState.lastEmbedCodeInPlaylist = '';
      if (data) {
        if (data.length != undefined) {
          this.PlaylistsIDs = data;
        } else {
          this.Data = data;
        }
      }
      var me = this;
      $('#' + me.currentConfig.ID + Identifiers.classMenuActive).removeClass(Identifiers.classMenuActive.substr(2));
      if (this.PlaylistsIDs.length > 0) {
        var counter = me.PlaylistsIDs.length;
        for (var i = 0; i < me.PlaylistsIDs.length; i++) {
          me.GetData(me.PlaylistsIDs[i], i, function () {
            counter--;
            if (counter == 0) {
              if (ObjToArray(me.Data).length > 0 && me.currentConfig.Position != 'none') {
                $('#' + me.wrapperID).attr('data-playlist-layout', me.currentConfig.Position);
                me.UseTemplates();
                me.PlaylistPositionChanger(me.currentConfig.Position);
                me.CheckMenuHeight();
                me.CalculateThumbnailsSizes();
                me.ThumbnailsSizeChanger(me.currentConfig.ThumbnailsSize);
                me.ScrollCheck('#' + me.currentConfig.ID, me.currentConfig.Orientation, me.wrapperID);
                if ($(Identifiers.classCaptionDescription).length) {
                  $(Identifiers.classCaptionDescription).ellipsis();
                }
              } else {
                $('#' + me.wrapperID).attr('data-playlist-layout', 'none');
              }
              
              me.CheckMenuHeight();
              me.FixScrollButtonsSize();
              if (callback) {
                callback();
              }
            }
          }, function (isData, playlistId, status, callback) {
            if (status == 404 && isData) {
              if (console) {
                console.log('Playlist with id "' + playlistId + '" is EMPTY!');
              }
            }
            if (!isData) {
              if (console) {
                console.log('Playlist with id "' + playlistId + '"' + ' is failed to load with status code ' + status);
              }
            }
            me.PlaylistsIDs.forEach(function (data, index) {
              if (data == playlistId) {
                me.PlaylistsIDs.splice(index, 1);
              }
            });
            if (callback) {
              callback();
            }
          });
        }
      } else {
        if (ObjToArray(me.Data).length > 0 && me.currentConfig.Position != 'none') {
          $('#' + me.wrapperID).attr('data-playlist-layout', me.currentConfig.Position);
          me.UseTemplates();
          me.PlaylistPositionChanger(me.currentConfig.Position);
          me.CheckMenuHeight();
          me.CalculateThumbnailsSizes();
          me.ThumbnailsSizeChanger(me.currentConfig.ThumbnailsSize);
          me.ScrollCheck('#' + me.currentConfig.ID, me.currentConfig.Orientation, me.wrapperID);
          if ($(Identifiers.classCaptionDescription).length) {
            $(Identifiers.classCaptionDescription).ellipsis();
          }
        } else {
          $('#' + me.wrapperID).attr('data-playlist-layout', 'none');
        }
        me.CheckMenuHeight();
        me.FixScrollButtonsSize();
        if (callback) {
          callback();
        }
      }
    };

    Playlists.prototype.DrawImages = function () {
      if (this.currentConfig.Position == 'none') {
        return;
      }
      $('#' + this.currentConfig.ID + Identifiers.classNextButton).css('background-image', 'url("' + this.templateSources.Images['oo-next-' + this.currentConfig.Orientation + (this.currentConfig.Theme == 'light' ? '-light' : '')] + '")');
      $('#' + this.currentConfig.ID + Identifiers.classPreviousButton).css('background-image', 'url("' + this.templateSources.Images['oo-previous-' + this.currentConfig.Orientation + (this.currentConfig.Theme == 'light' ? '-light' : '')] + '")');
      $('#' + this.currentConfig.ID + Identifiers.classMenuCurrent + ' a span').css('background-image', 'url("' + this.templateSources.Images['icon-menu-toggle' + (this.currentConfig.Theme == 'light' ? '-light' : '')] + '")');
    };

    Playlists.prototype.RenderPods = function (playerID, params, messageBus) {
      //Apply configs from themebuilder to overwrite default values.
      if(this.metadataCallFlag == true) {
        for (key in this.PlaylistMetaData) {
          if (this.PlaylistMetaData.hasOwnProperty(key)) {
            this.currentConfig = this.ExtendConfig(this.currentConfig, this.PlaylistMetaData[key]);
          }
        }
      }
      //Apply local JSON configuration data to overwrite themebuilder and default values.
      params = params == undefined ? {} : params;
      this.currentConfig = this.ExtendConfig(this.currentConfig, params);
      this.currentConfig = this.ValidateConfig();
      this.currentConfig.ID += playerID;
      this.wrapperID += playerID;
      this.playerId = playerID;
      var playerIdentification = $('#' + playerID).children().first().attr('class');
      if (!playerIdentification) {
        $('#' + playerID).addClass('innerWrapperPL');
        playerIdentification = '.innerWrapperPL';
      } else {
        playerIdentification = '.' + playerIdentification;
      }
      this.playerClass = playerIdentification;
      $('head').append('<style id="OO-Playlists-Styles-' + playerID + '" type="text/css"> ' + this.StringFormat(this.templateSources.CSS, '#' + this.currentConfig.ID, '#' + this.wrapperID, this.playerId) + ' </style>');
      this.Wrap(playerID);
      this.DrawPlaylists();
      this.DrawImages();
      this.BindEvents();
      this.ScrollCheck('#' + this.currentConfig.ID, this.currentConfig.Orientation, this.wrapperID);
      this.isInitialized = true;
      if (messageBus && messageBus.publish) {
        messageBus.publish(OO.EVENTS.PLAYLISTS_READY, 'podsPlugin');
      }
    };

    //To validate the respective datatypes of the data passed from JSON and metadata
    Playlists.prototype.ValidateConfig = function (param) {
      if (!param) {
        param = this.currentConfig;
      }
      if (typeof param.isDocked === 'string') {
        param.isDocked = param.isDocked == 'true';
      }
      if (typeof param.isGenerated === 'string') {
        param.isGenerated = param.isGenerated == 'true';
      }
      if (typeof param.menuFontSize === 'string') {
        param.menuFontSize = parseInt(param.menuFontSize);
      }
      if (typeof param.tabsFontSize === 'string') {
        param.tabsFontSize = parseInt(param.tabsFontSize);
      }
      if (typeof param.rowsNumber === 'string') {
        param.rowsNumber = parseInt(param.rowsNumber);
      }
      if (typeof param.thumbnailsSize === 'string') {
        param.thumbnailsSize = parseInt(param.thumbnailsSize);
      }
      if (typeof param.thumbnailsSpacing === 'string') {
        param.thumbnailsSpacing = parseInt(param.thumbnailsSpacing);
      }
      if (typeof param.wrapperFontSize === 'string') {
        param.wrapperFontSize = parseInt(param.wrapperFontSize);
      }
      return param;
    };

    //Initialize Classes
    Playlists.prototype.InitClasses = function () {
      Identifiers.classSlide += this.playerId;
      Identifiers.classThumbnails += this.playerId;
      Identifiers.classThumbnailPaging += this.playerId;
    };

    //Copies the values from 'from' to respective 'to' params
    //Enforces rules over position before orientation before defaults.
    //Sets Docking according to position.
    Playlists.prototype.ExtendConfig = function (to, from) {
      if (from.position || from.Position) {
        to.Position = from.position || from.Position;
        to.Orientation = to.Position == 'top' || to.Position == 'bottom' ? 'horizontal' : 'vertical';
      } else if (from.orientation || from.Orientation) {
        to.Orientation = from.orientation || from.Orientation;
        to.Position = to.Orientation == 'vertical' ? 'right' : 'bottom';
      }

      for (param in from) {
        if (from.hasOwnProperty(param)) {
          switch (param) {
            case "podType":
            case "PodType":
              to.PodType = (from.podType || from.PodType);
            break;
            case "activeMenuColor":
            case "ActiveMenuColor":
              to.ActiveMenuColor = (from.activeMenuColor || from.ActiveMenuColor);
            break;
            case "rowsNumber":
            case "RowsNumber":
              to.RowsNumber = parseInt((from.rowsNumber || from.RowsNumber));
            break;
            case "thumbnailsSize":
            case "ThumbnailsSize":
              to.ThumbnailsSize = parseInt((from.thumbnailsSize || from.ThumbnailsSize));
            break;
            case "thumbnailsSpacing":
            case "ThumbnailsSpacing":
              to.ThumbnailsSpacing = parseInt((from.thumbnailsSpacing || from.ThumbnailsSpacing));
            break;
            case "caption":
            case "Caption":
              to.Caption = (from.caption || from.Caption);
            break;
            case "captionPosition":
            case "CaptionPosition":
              to.CaptionPosition = (from.captionPosition || from.CaptionPosition);
            break;
            case "theme":
            case "Theme":
              to.Theme = (from.theme || from.Theme);
            break;
            case "wrapperFontSize":
            case "WrapperFontSize":
              to.WrapperFontSize = parseInt((from.wrapperFontSize || from.WrapperFontSize));
            break;
            case "tabsFontSize":
            case "TabsFontSize":
              to.TabsFontSize = parseInt((from.tabsFontSize || from.TabsFontSize));
            break;
            case "menuFontSize":
            case "MenuFontSize":
              to.MenuFontSize = parseInt((from.menuFontSize || from.MenuFontSize));
            break;
          }
        }
      }
      to.IsDocked = to.Position == 'top' || to.Position == 'bottom' ? false : true;
      return to;
    };

    //First called method that calls the wrapper and other function that are used for creating pods;
    //all data transferred in Player create method recived there in params var;
    Playlists.prototype.Create = function (playerID, params, $ref, _ref, playerParams, messageBus, playerCreateParams) {
      $ = $ref || OO.$;
      _ = _ref || OO._;
      this.messageBus = messageBus;
      this.playerParams = $.extend({}, playerParams || OO.__internal.playerParams);
      this.playerCreateParams = $.extend({}, playerCreateParams);
      this.playerId = playerID;
      this.InitClasses();
      if (typeof window.isDebugMode === 'undefined') {
        window.isDebugMode = null;
      }
      var OOStudio = window ? window.OOStudio : null;
      // OO.SERVER.API doesn't necessarily work for local Allspark. Many devs host pages on local Rails (port 3000),
      // so this code will hit 'dev.corp.ooyala.com:3000' instead of port 1338 (the port Allspark listens to).
      // TODO(jdlew): We should change this here or environment.js to intelligently hit local Allspark.
      DataHelper.init(OO.SERVER.API, OOStudio ? OOStudio.pCode : this.playerParams.pcode, this.playerParams.playerBrandingId, !!OOStudio);
      params = params ? params : {};

      if (this.currentConfig.position == 'none' && !DataHelper.isOOStudio) {
        return;
      }
      if (params.data) {
        if (params.data.length != undefined) {
          this.PlaylistsIDs = params.data;
        } else {
          this.Data = params.data;
        }
      } else {
        if (!DataHelper.isOOStudio) {
          return;
        }
      }
      if (!this.PlaylistsIDs.length && !ObjToArray(this.Data, true).length) {
        return;
      }
      var pods = this;
      var counter = this.PlaylistsIDs.length;
      if (counter > 0) {
        var me = this;
        for (var i = 0; i < counter; i++) {
          this.GetData(this.PlaylistsIDs[i], i);
          this.GetDataForMetadata(this.PlaylistsIDs[i], i);
        }
        me.RenderPods(playerID, params, pods.messageBus);
      } else {
        this.RefreshData(params.data);
        this.RenderPods(playerID, params, this.messageBus);
      }
      if (OO) {
        if (OO.publicApi && DataHelper.isOOStudio) {
          OO.publicApi.Playlists = OO.publicApi.Playlists || {};
          OO.publicApi.Playlists[playerID] = (this);
        } else {
          OO.Playlists = OO.Playlists || {};
          OO.Playlists[playerID] = (this);
        }
      }
    };
    return new Playlists();
  };

  OO.publicApi ? OO.publicApi.PlaylistsClass = PlaylistsClass : OO.PlaylistsClass = PlaylistsClass;
  var Pod = {};
  Pod.create = function (elementId, playlistsIds, params) {
    if (!elementId) {
      return null;
    }
    if (!params) {
      params = {};
    }
    if (playlistsIds.length) {
      var pod = OO.publicApi ? new OO.publicApi.PlaylistsClass() : new OO.PlaylistsClass();
      var messageBus = null;
      var playerParams = $.extend({}, playerParams || OO.__internal.playerParams);
      if (params['linkedPlayer']) {
        messageBus = eval(params['linkedPlayer']+".mb");
        delete params['linkedPlayer'];
      }
      var mergedConfig = params;
      mergedConfig.data = playlistsIds;
      pod.Create(elementId, mergedConfig, OO.$, OO._, playerParams, messageBus); //call create method
      if (params && pod && messageBus && pod.setFirstVideoFromPlaylist === false && JSON.parse(params["useFirstVideoFromPlaylist"])) {
        pod.setFirstVideoFromPlaylist = true;
        messageBus.publish(OO.EVENTS.SET_EMBED_CODE, pod.apiEmbedCode, playerParams);
      }
      return pod;
    } else {
      return null;
    }
  };
  OO.publicApi ? OO.publicApi.Pod = Pod : OO.Pod = Pod;
})(window);
