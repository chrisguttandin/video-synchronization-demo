/* eslint-disable camelcase, eqeqeq, line-comment-position, no-console, no-param-reassign, no-shadow, no-undef, no-unused-expressions, no-var, node/no-sync, padding-line-between-statements, strict, unicorn/new-for-builtins, unicorn/prefer-includes, vars-on-top */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? factory(exports, require('@babel/runtime/helpers/defineProperty'), require('timing-object'))
        : typeof define === 'function' && define.amd
        ? define(['exports', '@babel/runtime/helpers/defineProperty', 'timing-object'], factory)
        : ((global = global || self), factory((global.subscribableThings = {}), global._defineProperty, global.timingObject));
})(this, function (exports, _defineProperty, timingObject) {
    'use strict';

    _defineProperty =
        _defineProperty && Object.prototype.hasOwnProperty.call(_defineProperty, 'default') ? _defineProperty['default'] : _defineProperty;

    function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            if (enumerableOnly)
                symbols = symbols.filter(function (sym) {
                    return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                });
            keys.push.apply(keys, symbols);
        }
        return keys;
    }

    function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            if (i % 2) {
                ownKeys(Object(source), true).forEach(function (key) {
                    _defineProperty(target, key, source[key]);
                });
            } else if (Object.getOwnPropertyDescriptors) {
                Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
            } else {
                ownKeys(Object(source)).forEach(function (key) {
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                });
            }
        }
        return target;
    }
    var createSkipUpdateFunction = function createSkipUpdateFunction(tolerance) {
        var lastMotionUpdate = null;
        var mediaElementDelay = 0;
        return function (timingStateVector, currentTime) {
            if (timingStateVector.position < 0 || timingStateVector.velocity === 0) {
                lastMotionUpdate = null;
                return {
                    position: timingStateVector.position,
                    velocity: timingStateVector.velocity
                };
            }

            if (lastMotionUpdate !== null) {
                var playheadDifference = Math.abs(currentTime - lastMotionUpdate.position); // Check if at least 10ms were played since the last motion update.

                if (playheadDifference < 0.01) {
                    return {
                        position: currentTime,
                        velocity: lastMotionUpdate.velocity
                    };
                }
            }

            var positionDifference = Math.abs(currentTime - timingStateVector.position);

            if (positionDifference > tolerance) {
                if (lastMotionUpdate !== null) {
                    var elapsedTime = timingStateVector.timestamp - lastMotionUpdate.timestamp;

                    var _translateTimingState = timingObject.translateTimingStateVector(
                            _objectSpread(
                                {
                                    acceleration: 0
                                },
                                lastMotionUpdate
                            ),
                            elapsedTime
                        ),
                        position = _translateTimingState.position;

                    mediaElementDelay = position - currentTime;
                }

                var positioWithDelay = timingStateVector.position + mediaElementDelay;
                lastMotionUpdate = {
                    position: positioWithDelay,
                    timestamp: timingStateVector.timestamp,
                    velocity: timingStateVector.velocity
                };
                return {
                    position: positioWithDelay,
                    velocity: timingStateVector.velocity
                };
            }

            lastMotionUpdate = null;
            return {
                position: currentTime,
                velocity: timingStateVector.velocity
            };
        };
    };

    var createPlaybackRateUpdateFunction = function createPlaybackRateUpdateFunction(timeConstant, threshold, tolerance) {
        return function (timingStateVector, currentTime) {
            if (timingStateVector.position < 0 || timingStateVector.velocity === 0) {
                return {
                    position: timingStateVector.position,
                    velocity: timingStateVector.velocity
                };
            }

            var positionDifference = Math.abs(currentTime - timingStateVector.position);

            if (positionDifference > threshold) {
                return {
                    position: timingStateVector.position,
                    velocity: timingStateVector.velocity
                };
            }

            if (positionDifference > tolerance) {
                return {
                    position: currentTime,
                    velocity: ((positionDifference + timeConstant) / timeConstant) * timingStateVector.velocity
                };
            }

            return {
                position: currentTime,
                velocity: timingStateVector.velocity
            };
        };
    };

    function ownKeys$1(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            if (enumerableOnly)
                symbols = symbols.filter(function (sym) {
                    return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                });
            keys.push.apply(keys, symbols);
        }
        return keys;
    }

    function _objectSpread$1(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            if (i % 2) {
                ownKeys$1(Object(source), true).forEach(function (key) {
                    _defineProperty(target, key, source[key]);
                });
            } else if (Object.getOwnPropertyDescriptors) {
                Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
            } else {
                ownKeys$1(Object(source)).forEach(function (key) {
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                });
            }
        }
        return target;
    }

    var play = function play(mediaElement) {
        if (!mediaElement.paused) {
            return;
        }

        mediaElement.play()['catch'](function (err) {
            console.error(err);
        });
    };

    var pause = function pause(mediaElement) {
        if (!mediaElement.paused) {
            mediaElement.pause();
        }
    };

    var DEFAULT_OPTIONS = {
        mode: navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1 ? 'skip' : 'adjust',
        // skew: 0,
        tolerance: 0.025
    };
    function mediaSync(mediaElement, timingObject) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var mergedOptions = _objectSpread$1(_objectSpread$1({}, DEFAULT_OPTIONS), options);

        var update_func_skip = createSkipUpdateFunction(mergedOptions.tolerance);
        var threshold = 1;
        var timeConstant = 0.5;
        var update_func_playbackspeed = createPlaybackRateUpdateFunction(timeConstant, threshold, mergedOptions.tolerance);
        var updateFunction = mergedOptions.mode === 'adjust' ? update_func_playbackspeed : update_func_skip;
        var requestId = null;

        var update = function update() {
            var currentTime = mediaElement.currentTime,
                duration = mediaElement.duration,
                playbackRate = mediaElement.playbackRate;

            var _updateFunction = updateFunction(timingObject.query(), currentTime),
                position = _updateFunction.position,
                velocity = _updateFunction.velocity;

            var sanitizedDuration = typeof duration === 'number' && !isNaN(duration) ? duration : 0;

            if (currentTime !== position) {
                if (position < 0) {
                    mediaElement.currentTime = 0;
                    pause(mediaElement);
                } else if (position > sanitizedDuration) {
                    mediaElement.currentTime = duration;
                    pause(mediaElement);
                } else {
                    mediaElement.currentTime = position;

                    if (velocity !== 0) {
                        if (playbackRate !== velocity) {
                            mediaElement.playbackRate = velocity;
                        }

                        play(mediaElement);
                    } else {
                        pause(mediaElement);
                    }
                }
            }

            requestId = requestAnimationFrame(update);
        };

        update();
        return function () {
            if (requestId !== null) {
                cancelAnimationFrame(requestId);
            }
        };
    }

    exports.mediaSync = mediaSync;

    Object.defineProperty(exports, '__esModule', { value: true });
});
