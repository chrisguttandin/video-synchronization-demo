/* eslint-disable camelcase, eqeqeq, line-comment-position, multiline-comment-style, no-console, no-else-return, no-param-reassign, no-shadow, no-undef, no-unused-expressions, no-unused-vars, no-var, node/no-sync, object-shorthand, padding-line-between-statements, sort-keys, strict, unicorn/catch-error-name, unicorn/new-for-builtins, unicorn/no-for-loop, unicorn/no-zero-fractions, unicorn/prefer-includes, vars-on-top */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? factory(exports, require('@babel/runtime/helpers/defineProperty'))
        : typeof define === 'function' && define.amd
        ? define(['exports', '@babel/runtime/helpers/defineProperty'], factory)
        : ((global = global || self), factory((global.subscribableThings = {}), global._defineProperty));
})(this, function (exports, _defineProperty) {
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

    /**
     * MediaSync
     *
     * author: njaal.borch@motioncorporation.com
     *
     * Copyright 2015
     * License: LGPL
     */
    var setSync = function setSync(func, target, msv) {
        var state = msv.query();

        if (state.velocity === 0) {
            // We stopped, trigger a single sync when the MSV changes
            var handle_change = function handle_change() {
                setSync(func, target, msv);
            };

            msv.addEventListener('change', function () {
                if (this.query().velocity !== 0) {
                    msv.removeEventListener('change', handle_change);
                    handle_change();
                }
            });
            return;
        }

        var time_left = (target - state.position) / state.velocity;

        if (time_left > 0.001) {
            setTimeout(function () {
                setSync(func, target, msv);
            }, 1000 * (time_left / 2.0 / state.velocity));
            return;
        }

        func();
        return {
            cancel: function cancel() {}
        };
    };

    var DEFAULT_OPTIONS = {
        mode: navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1 ? 'skip' : 'auto',
        remember: false,
        // debug: false,
        skew: 0,
        target: 0.025,
        loop: false
    };
    function mediaSync(mediaElement, motion) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var API;

        var mergedOption = _objectSpread(_objectSpread({}, DEFAULT_OPTIONS), options);

        var mergedOptions = _objectSpread(
            _objectSpread({}, mergedOption),
            {},
            {
                original_target: mergedOption.target
            }
        );

        mergedOptions.target = mergedOptions.target * 2;

        if (
            /*mergedOptions.debug ||*/
            mergedOptions.remember === false
        ) {
            localStorage.removeItem('mediasync_vpbr');
            mergedOptions.remember = false;
        }

        if (mergedOptions.automute === undefined) {
            mergedOptions.automute = false;
        }

        var _auto_muted = false;

        var play = function play() {
            try {
                var p = mediaElement.play();

                if (p) {
                    p['catch'](function (_err) {
                        // _doCallbacks("error", {
                        //     event: "error",
                        //     op: "play",
                        //     msg: err
                        // });
                    });
                }
            } catch (err) {
                // _doCallbacks("error", {
                //     event: "error",
                //     op: "play"
                // });
            }
        };

        var onchange = function onchange() {
            _bad = 0;
            _samples = [];
            _last_skip = null; // If we're running but less than zero, we need to wake up when starting

            if (motion.query().position < -mergedOptions.skew && motion.query().velocity > 0) {
                setTimeout(function () {
                    setSync(onchange, -mergedOptions.skew, motion);
                }, 100);
                return;
            } // If we're paused, ignore
            //if (_stopped || _paused) {
            //  console.log("Not active");
            //  return;
            // }

            if (_update_func !== undefined) {
                _update_func();
            } else {
                console.log('WARNING: onchange but no update func yet');
            }
        };

        var setMotion = function setMotion(motion) {
            _bad = 0;

            if (_motion) {
                _motion.removeEventListener('change', onchange);
            }

            _motion = motion;

            _motion.addEventListener('change', onchange);
        };

        if (!motion) {
            console.log('WARNING: No motion has been set');
        }

        var _stopped = false;
        var _paused = false;

        var _motion;

        function onpaused() {
            if (_motion.query().velocity == 1) {
                play();
            }
        }

        function onplay() {
            if (_motion.query().velocity === 0) {
                mediaElement.pause();
            }
        }

        function onerror() {
            console.log(); // TODO: REPORT ERRORS

            stop();
        }

        var pause = function pause(val) {
            if (val === undefined) val = true;
            _paused = val;

            if (!_paused) {
                onchange();
            }
        };

        var stop = function stop() {
            _stopped = true;
            mediaElement.removeEventListener('paused', onpaused);
            mediaElement.removeEventListener('playing', onplay);
            mediaElement.removeEventListener('error', onerror);
        };

        var _update_func;

        var _bad = 0;
        var _amazing = 0;
        var last_update = 0;
        var _samples = [];
        var _vpbr = false; // Variable playback rate

        var _last_bad = 0;
        var _perfect = 5;
        var _is_in_sync = false;
        var _last_skip = null;
        var _thrashing = 0;

        var skip = function skip(position) {
            if (mediaElement.readyState === 0) {
                return;
            }

            if (_motion.query().velocity != 1) {
                // Just skip, don't do estimation
                mediaElement.currentTime = position;
                _last_skip = null; // _doCallbacks("skip", {
                //     event: "skip",
                //     position,
                //     target: _motion.query().position,
                //     adjust: 0
                // });

                return;
            }

            var adjust = 0;
            var now = performance.now();

            if (_last_skip) {
                if (now - _last_skip.ts < 1500) {
                    _thrashing += 1;

                    if (_thrashing > 3) {
                        // We skipped just a short time ago, we're thrashing
                        // _dbg("Lost all confidence (thrashing)");
                        mergedOptions.target = Math.min(1, mergedOptions.target * 2); // _doCallbacks("target_change", {
                        //     event: "target_change",
                        //     target: ops.target,
                        //     reason: "thrashing"
                        // });

                        _thrashing = 0;
                    }
                } else {
                    _thrashing = 0;
                }

                var elapsed = (now - _last_skip.ts) / 1000;
                var cur_pos = mediaElement.currentTime;
                var miss = loop(_last_skip.position + elapsed) - cur_pos;
                adjust = _last_skip.adjust + miss;
                if (Math.abs(adjust) > 5) adjust = 0; // Too sluggish, likely unlucky
            } // Ensure that we're playing back at speed 1

            mediaElement.playbackRate = 1.0; // _dbg({
            //     type: "skip",
            //     position: position + adjust,
            //     target: loop(_motion.query().position),
            //     adjust: adjust
            // });

            _perfect = Math.min(5, _perfect + 5);

            if (_motion.query().velocity != 1) {
                mediaElement.currentTime = position;
            } else {
                mediaElement.currentTime = position + adjust;
                _last_skip = {
                    ts: now,
                    //performance.now(),
                    position: position,
                    adjust: adjust
                };
            }

            if (_is_in_sync) {
                _is_in_sync = false; // _doCallbacks("sync", {
                //     event: "sync",
                //     sync: false
                // });
            } // _doCallbacks("skip", {
            //     event: "skip",
            //     position: position + adjust,
            //     target: _motion.query().position,
            //     adjust: adjust
            // });
        };

        function loop(position) {
            if (mergedOptions.loop) {
                if (mergedOptions.duration) {
                    return position % mergedOptions.duration;
                } else {
                    return position % mediaElement.duration;
                }
            }

            return position;
        } // onTimeChange handler for variable playback rate

        var last_pbr_diff = 0;

        var update_func_playbackspeed = function update_func_playbackspeed() {
            if (_stopped || _paused) {
                return;
            }

            var snapshot = query();

            if (loop(snapshot.position) == last_update);

            last_update = loop(snapshot.position); // If we're outside of the media range, don't stress the system

            var p = loop(snapshot.position + mergedOptions.skew);
            var duration = mediaElement.duration;

            if (duration) {
                if (p < 0 || p > duration) {
                    if (!mediaElement.paused) {
                        mediaElement.pause();
                    }

                    return;
                }
            } // Force element to play/pause correctly

            if (snapshot.velocity !== 0) {
                if (mediaElement.paused) {
                    play();
                }
            } else if (!mediaElement.paused) {
                mediaElement.pause();
            }

            try {
                if (!_vpbr && _bad > 40) {
                    if (_auto_muted) {
                        mediaElement.muted = false;
                        _auto_muted = false;
                    } // _doCallbacks("muted", {
                    //     event: "muted",
                    //     muted: false
                    // });

                    throw new Error('Variable playback rate seems broken - ' + _bad + ' bad');
                } // If we're WAY OFF, jump

                var ts = performance.now();
                var diff = p - mediaElement.currentTime;

                if (diff < -1 || snapshot.velocity === 0 || Math.abs(diff) > 1) {
                    // _dbg({
                    //     type: "jump",
                    //     diff: diff
                    // });
                    // Stationary, we need to just jump
                    var new_pos = loop(snapshot.position + mergedOptions.skew);

                    if (performance.now() - _last_bad > 150) {
                        //_bad += 10;
                        _last_bad = performance.now();
                        skip(new_pos);
                    }

                    return;
                } // If the diff is substantially larger than last time we updated it, trigger as broken

                if (last_pbr_diff && Math.abs(diff - last_pbr_diff) > 0.5) {
                    //console.log("VPBR broken it seems", diff-last_pbr_diff);
                    _bad += 10; //throw new Error("Variable playback rate seems broken");
                } // Need to smooth diffs, many browsers are too inconsistent!

                _samples.push({
                    diff: diff,
                    ts: ts,
                    position: p
                }); // var dp = _samples[_samples.length - 1].position - _samples[0].position;
                // var dt = _samples[_samples.length - 1].ts - _samples[0].ts;

                if (_samples.length >= 3) {
                    var avg = 0;

                    for (var i = 0; i < _samples.length; i++) {
                        avg += _samples[i].diff;
                    }

                    diff = avg / _samples.length;

                    if (_samples.length > 3) {
                        _samples = _samples.splice(0, 1);
                    }
                } else {
                    return;
                } // var pbr = 1000 * dp / dt;
                //console.log("Playback rate was:", pbr, "reported", elem.playbackRate, elem.playbackRate - pbr);
                // Actual sync
                // _dbg({
                //     type: "dbg",
                //     diff: diff,
                //     bad: _bad,
                //     vpbr: _vpbr
                // });

                var getRate = function getRate(limit, suggested) {
                    return Math.min(
                        _motion.query().velocity + limit,
                        Math.max(_motion.query().velocity - limit, _motion.query().velocity + suggested)
                    );
                };

                if (Math.abs(diff) > 1) {
                    _samples = [];
                    mediaElement.playbackRate = getRate(1, diff * 1.3); //Math.max(0, _motion.vel + (diff * 1.30));

                    last_pbr_diff = diff; // _dbg({
                    //     type: "vpbr",
                    //     level: "coarse",
                    //     rate: mediaElement.playbackRate
                    // });

                    _bad += 4;
                } else if (Math.abs(diff) > 0.5) {
                    _samples = [];
                    mediaElement.playbackRate = getRate(0.5, diff * 0.75); //Math.min(1.10, _motion.vel + (diff * 0.75));

                    last_pbr_diff = diff; // _dbg({
                    //     type: "vpbr",
                    //     level: "mid",
                    //     rate: mediaElement.playbackRate
                    // });

                    _bad += 2;
                } else if (Math.abs(diff) > 0.1) {
                    _samples = [];
                    mediaElement.playbackRate = getRate(0.4, diff * 0.75); //Math.min(1.10, _motion.vel + (diff * 0.75));

                    last_pbr_diff = diff; // _dbg({
                    //     type: "vpbr",
                    //     level: "midfine",
                    //     rate: mediaElement.playbackRate
                    // });

                    _bad += 1;
                } else if (Math.abs(diff) > 0.025) {
                    _samples = []; // var newpbr = pbr - mediaElement.playbackRate;
                    //console.log("New pbr", elem.playbackRate, "->", newpbr, getRate(0.30, diff*0.60));
                    //elem.playbackRate = newpbr;

                    mediaElement.playbackRate = getRate(0.3, diff * 0.6); //Math.min(1.015, _motion.vel + (diff * 0.30));

                    last_pbr_diff = diff; // _dbg({
                    //     type: "vpbr",
                    //     level: "fine",
                    //     rate: mediaElement.playbackRate
                    // });
                } else {
                    if (!_vpbr) {
                        _bad = Math.max(0, _bad - 20);
                        _amazing++;

                        if (_amazing > 5) {
                            _vpbr = true; // Very unlikely to get here if we don't support it!

                            if (localStorage && mergedOptions.remember) {
                                // _dbg("Variable Playback Rate capability stored");
                                localStorage.mediasync_vpbr = JSON.stringify({
                                    appVersion: navigator.appVersion,
                                    vpbr: true
                                });
                            }
                        }
                    }

                    if (!_is_in_sync) {
                        _is_in_sync = true; // _doCallbacks("sync", {
                        //     event: "sync",
                        //     sync: true
                        // });
                    } //elem.playbackRate = getRate(0.02, diff * 0.07) + (pbr - 1); //_motion.vel + (diff * 0.1);

                    mediaElement.playbackRate = getRate(0.02, diff * 0.07); //_motion.vel + (diff * 0.1);

                    last_pbr_diff = diff;
                }

                if (mergedOptions.automute) {
                    if (!mediaElement.muted && (mediaElement.playbackRate > 1.05 || mediaElement.playbackRate < 0.95)) {
                        _auto_muted = true;
                        mediaElement.muted = true; // _doCallbacks("muted", {
                        //     event: "muted",
                        //     muted: true
                        // });
                        // _dbg({
                        //     type: "mute",
                        //     muted: true
                        // });
                    } else if (mediaElement.muted && _auto_muted) {
                        _auto_muted = false;
                        mediaElement.muted = false; // _dbg({
                        //     type: "mute",
                        //     muted: false
                        // });
                        // _doCallbacks("muted", {
                        //     event: "muted",
                        //     muted: false
                        // });
                    }
                }
            } catch (err) {
                // Not supported after all!
                if (mergedOptions.automute) {
                    mediaElement.muted = false;
                }

                _last_skip = null; // Reset skip stuff

                if (localStorage && mergedOptions.remember) {
                    // _dbg("Variable Playback Rate NOT SUPPORTED, remembering this  ");
                    console.log('Variable playback speed not supported (remembered)');
                    localStorage.mediasync_vpbr = JSON.stringify({
                        appVersion: navigator.appVersion,
                        vpbr: false
                    });
                }

                console.log('Error setting variable playback speed - seems broken', err);

                _setUpdateFunc(update_func_skip);
            }
        };

        var last_pos = 0;
        var last_diff = 0; // timeUpdate handler for skip based sync

        var update_func_skip = function update_func_skip() /*ev: Event*/
        {
            if (_stopped || _paused) {
                return;
            }

            var snapshot = query();
            var duration = mediaElement.duration;
            var new_pos;

            if (duration) {
                if (snapshot.position < 0 || snapshot.position > duration) {
                    // Use snapshot, skew is not part of this
                    if (!mediaElement.paused) {
                        mediaElement.currentTime = duration - 0.03;
                        mediaElement.pause();
                    }

                    return;
                }
            }

            if (snapshot.velocity > 0) {
                if (mediaElement.paused) {
                    play();
                }
            } else if (!mediaElement.paused) {
                mediaElement.pause();
            }

            if (snapshot.velocity != 1) {
                if (loop(snapshot.position) == last_pos) {
                    return;
                }

                last_pos = snapshot.position; // _dbg("Jump, playback speed is not :", snapshot.velocity);
                // We need to just jump

                new_pos = loop(snapshot.position + mergedOptions.skew);

                if (mediaElement.currentTime != new_pos) {
                    skip(
                        new_pos
                        /*, "jump"*/
                    );
                }

                return;
            }

            var p = snapshot.position + mergedOptions.skew;
            var diff = p - mediaElement.currentTime;
            var ts = performance.now(); // If this was a Motion jump, skip immediately
            // if (ev !== undefined && ev.position !== undefined) {
            //     // _dbg("MOTION JUMP");
            //     new_pos = snapshot.position + mergedOptions.skew;
            //     skip(new_pos);
            //     return;
            // }
            // Smooth diffs as currentTime is often inconsistent

            _samples.push({
                diff: diff,
                ts: ts,
                position: p
            });

            if (_samples.length >= 3) {
                var avg = 0;

                for (var i = 0; i < _samples.length; i++) {
                    avg += _samples[i].diff;
                }

                diff = avg / _samples.length;

                _samples.splice(0, 1);
            } else {
                return;
            } // We use the number of very good hits to build confidence

            if (Math.abs(diff) < 0.001) {
                _perfect = Math.max(5, _perfect); // Give us some breathing space!
            }

            if (_perfect <= -2) {
                // We are failing to meet the target, make target bigger
                // _dbg("Lost all confidence");
                mergedOptions.target = Math.min(1, mergedOptions.target * 1.4);
                _perfect = 0; // _doCallbacks("target_change", {
                //     event: "target_change",
                //     target: ops.target,
                //     reason: "unknown"
                // });
            } else if (_perfect > 15) {
                // We are hitting the target, make target smaller if we're beyond the users preference
                // _dbg("Feels better");
                if (mergedOptions.target == mergedOptions.original_target) {
                    // We're improving yet 'perfect', trigger "good" sync event
                    if (!_is_in_sync) {
                        _is_in_sync = true; // _doCallbacks("sync", {
                        //     event: "sync",
                        //     sync: true
                        // });
                    }
                }

                mergedOptions.target = Math.max(Math.abs(diff) * 0.7, mergedOptions.original_target);
                _perfect -= 8; // _doCallbacks("target_change", {
                //     event: "target_change",
                //     target: ops.target,
                //     reason: "improving"
                // });
            } // _dbg({
            //     type: "dbg",
            //     diff: diff,
            //     target: ops.target,
            //     perfect: _perfect
            // });

            if (Math.abs(diff) > mergedOptions.target) {
                // Target miss - if we're still confident, don't do anything about it
                _perfect -= 1;

                if (_perfect > 0) {
                    return;
                } // We've had too many misses, skip

                new_pos = _motion.query().position + mergedOptions.skew; //_dbg("Adjusting time to " + new_pos);

                _perfect += 8; // Give some breathing space

                skip(new_pos);
            } else {
                // Target hit
                if (Math.abs(diff - last_diff) < mergedOptions.target / 2) {
                    _perfect++;
                }

                last_diff = diff;
            }
        };

        var _initialized = false;

        var init = function init() {
            if (_initialized) return;
            _initialized = true;

            if (_motion === undefined) {
                setMotion(motion);
            }

            if (localStorage && mergedOptions.remember) {
                if (localStorage.mediasync_vpbr) {
                    var vpbr = JSON.parse(localStorage.mediasync_vpbr);

                    if (vpbr.appVersion === navigator.appVersion) {
                        _vpbr = vpbr.vpbr;
                    }
                }
            }

            if (mergedOptions.mode === 'vpbr') {
                _vpbr = true;
            }

            if (mergedOptions.mode === 'skip' || _vpbr === false) {
                mediaElement.playbackRate = 1.0;
                _update_func = update_func_skip;
            } else {
                if (mergedOptions.automute) {
                    mediaElement.muted = true;
                    _auto_muted = true; // _doCallbacks("muted", {
                    //     event: "muted",
                    //     muted: true
                    // });
                }

                _update_func = update_func_playbackspeed;
            }

            mediaElement.removeEventListener('canplay', init);
            mediaElement.removeEventListener('playing', init);

            _setUpdateFunc(_update_func); //_motion.on("change", onchange);
        };

        mediaElement.addEventListener('canplay', init);
        mediaElement.addEventListener('playing', init);
        var _last_update_func = null;

        var _setUpdateFunc = function _setUpdateFunc(func) {
            if (_last_update_func) {
                mediaElement.removeEventListener('timeupdate', _last_update_func);
                mediaElement.removeEventListener('pause', _last_update_func);
                mediaElement.removeEventListener('ended', _last_update_func);
            }

            _last_update_func = func;
            mediaElement.playbackRate = 1.0;
            mediaElement.addEventListener('timeupdate', func);
            mediaElement.addEventListener('pause', func);
            mediaElement.addEventListener('ended', func);
        };

        var query = function query() {
            return _motion.query();
        };

        var setSkew = function setSkew(skew) {
            mergedOptions.skew = skew;
        };

        var getSkew = function getSkew() {
            return mergedOptions.skew;
        }; // var setOption = function(option, value) {
        //     ops[option] = value;
        //     if (option === "target") {
        //         ops.original_target = value;
        //     }
        // };

        /*
         * Return 'playbackRate' or 'skip' for play method
         */

        var getMethod = function getMethod() {
            if (_update_func === update_func_playbackspeed) {
                return 'playbackRate';
            }

            return 'skip';
        }; // As we are likely asynchronous, we don't really know if elem is already
        // ready!  If it has, it will not emit canplay.  Also, canplay seems shady
        // regardless

        var beater = setInterval(function () {
            if (mediaElement.readyState >= 2) {
                clearInterval(beater);

                try {
                    var event = new Event('canplay');
                    mediaElement.dispatchEvent(event);
                } catch (e) {
                    var event2 = document.createEvent('Event');
                    event2.initEvent('canplay', true, false);
                    mediaElement.dispatchEvent(event2);
                }
            }
        }, 100); // callbacks
        // var _callbacks = {
        //     skip: [],
        //     mode_change: [],
        //     target_change: [],
        //     muted: [],
        //     sync: [],
        //     error: []
        // };
        // var _doCallbacks = function(what, e) {
        //     if (!_callbacks.hasOwnProperty(what)) {
        //         throw "Unsupported event: " + what;
        //     }
        //     for (var i = 0; i < _callbacks[what].length; i++) {
        //         h = _callbacks[what][i];
        //         try {
        //             h.call(API, e);
        //         } catch (e2) {
        //             console.log("Error in " + what + ": " + h + ": " + e2);
        //         }
        //     }
        // };
        // unregister callback
        // var off = function(what, handler) {
        //     if (!_callbacks.hasOwnProperty(what))
        //         throw "Unknown parameter " + what;
        //     var index = _callbacks[what].indexOf(handler);
        //     if (index > -1) {
        //         _callbacks[what].splice(index, 1);
        //     }
        //     return API;
        // };
        // var on = function(what, handler, agentid) {
        //     if (!_callbacks.hasOwnProperty(what)) {
        //         throw new Error("Unsupported event: " + what);
        //     }
        //     if (!handler || typeof handler !== "function")
        //         throw "Illegal handler";
        //     var index = _callbacks[what].indexOf(handler);
        //     if (index != -1) {
        //         throw new Error("Already registered");
        //     }
        //     // register handler
        //     _callbacks[what].push(handler);
        //     // do immediate callback?
        //     setTimeout(function() {
        //         if (what === "sync") {
        //             _doCallbacks(what, {
        //                 event: what,
        //                 sync: _is_in_sync
        //             }, handler);
        //         }
        //         if (what === "muted") {
        //             _doCallbacks(what, {
        //                 event: what,
        //                 muted: _auto_muted
        //             }, handler);
        //         }
        //     }, 0);
        //     return API;
        // };
        // Export the API

        API = {
            setSkew: setSkew,
            getSkew: getSkew,
            // setOption: setOption,
            getMethod: getMethod,
            setMotion: setMotion,
            stop: stop,
            pause: pause,
            // on: on,
            // off: off,
            init: init
        };
        return API;
    }

    exports.mediaSync = mediaSync;

    Object.defineProperty(exports, '__esModule', { value: true });
});
