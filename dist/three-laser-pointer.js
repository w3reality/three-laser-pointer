(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("THREE"));
	else if(typeof define === 'function' && define.amd)
		define(["THREE"], factory);
	else if(typeof exports === 'object')
		exports["LaserPointer"] = factory(require("THREE"));
	else
		root["LaserPointer"] = factory(root["THREE"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = __webpack_require__(1);

var THREE = _interopRequireWildcard(_three);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // https://threejs.org/docs/#manual/introduction/Import-via-modules


var Line = function (_THREE$Line) {
    _inherits(Line, _THREE$Line);

    // ref. https://stackoverflow.com/questions/31399856/drawing-a-line-with-three-js-dynamically
    function Line(maxPoints) {
        var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0xff0000;

        _classCallCheck(this, Line);

        var geometry = new THREE.BufferGeometry();
        var positions = new Float32Array(maxPoints * 3);
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        var material = new THREE.LineBasicMaterial({
            color: color
        });
        return _possibleConstructorReturn(this, (Line.__proto__ || Object.getPrototypeOf(Line)).call(this, geometry, material));
    }

    _createClass(Line, [{
        key: 'updatePointsTwo',
        value: function updatePointsTwo(x0, y0, z0, x1, y1, z1) {
            var attrPos = this.geometry.attributes.position;
            if (attrPos.count < 2) return;
            attrPos.array[0] = x0;
            attrPos.array[1] = y0;
            attrPos.array[2] = z0;
            attrPos.array[3] = x1;
            attrPos.array[4] = y1;
            attrPos.array[5] = z1;
            attrPos.needsUpdate = true;
            this.geometry.setDrawRange(0, 2);
        }
    }, {
        key: '_setPointsRandomWalk',
        value: function _setPointsRandomWalk(positions, numPoints) {
            var x = 0;
            var y = 0;
            var z = 0;
            for (var i = 0; i < numPoints; i++) {
                positions[3 * i] = x;
                positions[3 * i + 1] = y;
                positions[3 * i + 2] = z;
                x += (Math.random() - 0.5) * 2;
                y += (Math.random() - 0.5) * 2;
                z += (Math.random() - 0.5) * 2;
            }
        }
    }, {
        key: 'updatePointsRandomWalk',
        value: function updatePointsRandomWalk(numPoints) {
            var attrPos = this.geometry.attributes.position;
            var maxPoints = attrPos.count;
            console.log(maxPoints);
            if (numPoints > maxPoints) {
                numPoints = maxPoints;
            }
            this._setPointsRandomWalk(attrPos.array, numPoints);
            attrPos.needsUpdate = true;
            this.geometry.setDrawRange(0, numPoints);
        }
    }]);

    return Line;
}(THREE.Line);

var Laser = function (_Line) {
    _inherits(Laser, _Line);

    function Laser() {
        var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0xff0000;

        _classCallCheck(this, Laser);

        var _this2 = _possibleConstructorReturn(this, (Laser.__proto__ || Object.getPrototypeOf(Laser)).call(this, 2, color));

        _this2._ptr = new THREE.Vector3(0, 0, 0);
        return _this2;
    }

    _createClass(Laser, [{
        key: 'point',
        value: function point(x, y, z) {
            var color = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

            this.updatePointsTwo(this._ptr.x, this._ptr.y, this._ptr.z, x, y, z);
            if (color) {
                this.material.color.setHex(color);
            }
        }
    }, {
        key: 'toggle',
        value: function toggle(tf) {
            this.visible = tf;
        }
    }, {
        key: 'setPointer',
        value: function setPointer(camera, offsetX, offsetY, offsetZ) {
            this._ptr = new THREE.Vector3(offsetX, offsetY, offsetZ).applyMatrix4(camera.matrixWorld);
        }
    }]);

    return Laser;
}(Line);

exports.default = { Line: Line, Laser: Laser };
module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ })
/******/ ]);
});
//# sourceMappingURL=three-laser-pointer.js.map