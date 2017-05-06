var ScrollNavigation = function ScrollNavigation () {
  let _sensitivity = 4;
  let _mouseWheelCounter = 0;
  let _navListener = function (direction) {};
  // After navigating, block other attempts for a moment as to prevent
  // moving too fast.
  let coolDown = 1000;
  let cooling = false;

  let _mouseWheelHandler = function (e) {
    if (cooling) {
      // console.log('ScrollNavigation', 'chill dude');
      return;
    }
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    var scrollable = document.documentElement.offsetHeight - document.documentElement.clientHeight;
    var scrollVal = Math.abs(document.documentElement.getBoundingClientRect().top);

    if (scrollable === 0) {
      // There's no scroll bar.
      // console.log('ScrollNavigation', 'No scrollbar');
      if (delta === 1) {
        // If the user was scrolling in the opposite direction, reset and start.
        if (_mouseWheelCounter > 0) {
          _mouseWheelCounter = 0;
        }
        _mouseWheelCounter--;
      } else {
        // If the user was scrolling in the opposite direction, reset and start.
        if (_mouseWheelCounter < 0) {
          _mouseWheelCounter = 0;
        }
        _mouseWheelCounter++;
      }
    } else if (scrollVal === 0) {
      // console.log('ScrollNavigation', 'at the top');
      if (delta === 1) {
        _mouseWheelCounter--;
      }
    } else if (scrollable - scrollVal <= 0) {
      // console.log('ScrollNavigation', 'at the bottom');
      if (delta === -1) {
        _mouseWheelCounter++;
      }
    } else {
      // console.log('ScrollNavigation', 'somewhere in the middle');
      _mouseWheelCounter = 0;
    }

    if (_mouseWheelCounter === -_sensitivity) {
      // console.log('ScrollNavigation', 'navigation', 'prev');
      cooling = true;
      setTimeout(() => { cooling = false; }, coolDown);
      _navListener('prev');
    } else if (_mouseWheelCounter === _sensitivity) {
      // console.log('ScrollNavigation', 'navigation', 'next');
      cooling = true;
      setTimeout(() => { cooling = false; }, coolDown);
      _navListener('next');
    }
  };

  this.sesitivity = function (scollSensitivity) {
    if (scollSensitivity) {
      _sensitivity = scollSensitivity;
      return this;
    }
    return _sensitivity;
  };

  this.reset = function () {
    _mouseWheelCounter = 0;
  };

  this.start = function () {
    // IE9, Chrome, Safari, Opera
    document.addEventListener('mousewheel', _mouseWheelHandler, false);
    // Firefox
    document.addEventListener('DOMMouseScroll', _mouseWheelHandler, false);
    return this;
  };

  this.stop = function () {
    // IE9, Chrome, Safari, Opera
    document.removeEventListener('mousewheel', _mouseWheelHandler, false);
    // Firefox
    document.removeEventListener('DOMMouseScroll', _mouseWheelHandler, false);
    return this;
  };

  this.onNavigation = function (func) {
    _navListener = func;
    return this;
  };
};

module.exports = ScrollNavigation;
