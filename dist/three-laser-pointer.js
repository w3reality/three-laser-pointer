(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("THREE"));
	else if(typeof define === 'function' && define.amd)
		define(["THREE"], factory);
	else if(typeof exports === 'object')
		exports["Laser"] = factory(require("THREE"));
	else
		root["Laser"] = factory(root["THREE"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE_three__) {
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ \"three\");\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\n// if THREE is global (via script-tag loading), use that THREE to prevent\n// conflicts with ES6 version. (Line objects become broken, otherwise...)\n\n// console.log('window.THREE:', window.THREE);\nvar THREE = window.THREE ? window.THREE : three__WEBPACK_IMPORTED_MODULE_0__;\n\nvar Line = function (_THREE$Line) {\n    _inherits(Line, _THREE$Line);\n\n    // ref. https://stackoverflow.com/questions/31399856/drawing-a-line-with-three-js-dynamically\n    function Line(maxPoints) {\n        var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0xff0000;\n\n        _classCallCheck(this, Line);\n\n        var geometry = new THREE.BufferGeometry();\n        var positions = new Float32Array(maxPoints * 3);\n        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));\n        var material = new THREE.LineBasicMaterial({\n            color: color\n        });\n\n        var _this = _possibleConstructorReturn(this, (Line.__proto__ || Object.getPrototypeOf(Line)).call(this, geometry, material));\n\n        _this._maxPoints = maxPoints;\n        _this._numPoints = 0;\n        return _this;\n    }\n\n    _createClass(Line, [{\n        key: '_frustumCullingWorkaround',\n        value: function _frustumCullingWorkaround() {\n            // https://stackoverflow.com/questions/36497763/three-js-line-disappears-if-one-point-is-outside-of-the-cameras-view\n            this.geometry.computeBoundingSphere();\n            //----\n            // this.frustumCulled = false;\n        }\n    }, {\n        key: 'setColor',\n        value: function setColor(color) {\n            this.material.color.setHex(color);\n        }\n    }, {\n        key: 'getColor',\n        value: function getColor() {\n            return this.material.color;\n        }\n    }, {\n        key: 'getPoints',\n        value: function getPoints() {\n            var arr = this.geometry.attributes.position.array;\n            var points = [];\n            for (var i = 0; i < this._numPoints; i++) {\n                points.push(new THREE.Vector3(arr[3 * i], arr[3 * i + 1], arr[3 * i + 2]));\n            }\n            return points;\n        }\n    }, {\n        key: 'updatePoints',\n        value: function updatePoints(arr) {\n            var isFlatten = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;\n\n            if (!isFlatten) {\n                arr = Laser.flattenPoints(arr);\n            }\n            var attrPos = this.geometry.attributes.position;\n            var maxPoints = attrPos.count;\n            var numPoints = arr.length / 3;\n            // console.log(`numPoints/maxPoints: ${numPoints}/${maxPoints}`);\n            if (numPoints > maxPoints) {\n                numPoints = maxPoints;\n            }\n            for (var i = 0; i < numPoints; i++) {\n                attrPos.array[3 * i] = arr[3 * i];\n                attrPos.array[3 * i + 1] = arr[3 * i + 1];\n                attrPos.array[3 * i + 2] = arr[3 * i + 2];\n            }\n            attrPos.needsUpdate = true;\n            this.geometry.setDrawRange(0, numPoints);\n            this._frustumCullingWorkaround();\n            this._numPoints = numPoints;\n        }\n    }, {\n        key: 'clearPoints',\n        value: function clearPoints() {\n            this.updatePoints([], true);\n        }\n    }, {\n        key: 'updatePointsRandomWalk',\n        value: function updatePointsRandomWalk(numPoints) {\n            this.updatePoints(Line._getPointsRandomWalk(numPoints), true);\n        }\n    }], [{\n        key: '_getPointsRandomWalk',\n        value: function _getPointsRandomWalk(numPoints) {\n            var positions = [];\n            var x = 0;\n            var y = 0;\n            var z = 0;\n            for (var i = 0; i < numPoints; i++) {\n                positions.push(x);\n                positions.push(y);\n                positions.push(z);\n                x += (Math.random() - 0.5) * 2;\n                y += (Math.random() - 0.5) * 2;\n                z += (Math.random() - 0.5) * 2;\n            }\n            return positions;\n        }\n    }, {\n        key: 'flattenPoints',\n        value: function flattenPoints(arrPoints) {\n            return arrPoints.map(function (pt) {\n                return [pt.x, pt.y, pt.z];\n            }).reduce(function (acc, ele) {\n                return acc.concat(ele);\n            });\n        }\n    }]);\n\n    return Line;\n}(THREE.Line);\n\nvar Laser = function (_Line) {\n    _inherits(Laser, _Line);\n\n    function Laser() {\n        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};\n\n        _classCallCheck(this, Laser);\n\n        // https://stackoverflow.com/questions/9602449/a-javascript-design-pattern-for-options-with-default-values\n        var defaults = {\n            color: 0xff0000,\n            maxPoints: 256,\n            infLength: 9999.0\n        };\n        var actual = Object.assign({}, defaults, options);\n\n        var _this2 = _possibleConstructorReturn(this, (Laser.__proto__ || Object.getPrototypeOf(Laser)).call(this, actual.maxPoints, actual.color));\n\n        _this2._src = new THREE.Vector3(0, 0, 0);\n        _this2._raycaster = new THREE.Raycaster();\n        _this2._infLen = actual.infLength;\n        _this2._meshes = [];\n        return _this2;\n    }\n\n    _createClass(Laser, [{\n        key: 'setSource',\n        value: function setSource(src) {\n            var camera = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;\n\n            // in case camera is given, treat (x, y, z) as in the camera coords\n            this._src = camera ? src.clone().applyMatrix4(camera.matrixWorld) : src.clone();\n        }\n    }, {\n        key: 'getSource',\n        value: function getSource() {\n            return this._src.clone();\n        }\n    }, {\n        key: '_raycast',\n        value: function _raycast(meshes, recursive, faceExclude) {\n            var isects = this._raycaster.intersectObjects(meshes, recursive);\n            if (faceExclude) {\n                for (var i = 0; i < isects.length; i++) {\n                    if (isects[i].face !== faceExclude) {\n                        return isects[i];\n                    }\n                }\n                return null;\n            }\n            return isects.length > 0 ? isects[0] : null;\n        }\n    }, {\n        key: 'raycast',\n        value: function raycast(origin, direction, meshes) {\n            var faceExclude = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;\n            var recursive = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;\n\n            this._raycaster.set(origin, direction);\n            return this._raycast(meshes, recursive, faceExclude);\n        }\n    }, {\n        key: 'raycastFromCamera',\n        value: function raycastFromCamera(mx, my, width, height, cam, meshes) {\n            var recursive = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;\n\n            var mouse = new THREE.Vector2( // normalized (-1 to +1)\n            mx / width * 2 - 1, -(my / height) * 2 + 1);\n            // https://threejs.org/docs/#api/core/Raycaster\n            // update the picking ray with the camera and mouse position\n            this._raycaster.setFromCamera(mouse, cam);\n            return this._raycast(meshes, recursive, null);\n        }\n    }, {\n        key: 'getMeshesHit',\n        value: function getMeshesHit() {\n            return this._meshes;\n        }\n    }, {\n        key: 'point',\n        value: function point(pt) {\n            var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;\n\n            // console.log(\"point():\", this._src, pt);\n            this.updatePoints([this._src.x, this._src.y, this._src.z, pt.x, pt.y, pt.z], true);\n            this._meshes.length = 0;\n            if (color) {\n                this.material.color.setHex(color);\n            }\n        }\n    }, {\n        key: 'pointWithRaytrace',\n        value: function pointWithRaytrace(pt) {\n            var meshes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];\n            var color = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;\n            var maxReflect = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 16;\n\n            this.point(pt, color);\n            if (maxReflect < 1) return;\n\n            var src = this.getSource();\n            var dir = Laser.direct(src, pt);\n            var isect = this.raycast(src, dir, meshes);\n            if (!isect) return;\n\n            var arrRefs = this.computeReflections(pt, dir, isect, meshes, maxReflect);\n            this.updatePoints([src.x, src.y, src.z, pt.x, pt.y, pt.z].concat(_toConsumableArray(arrRefs)), true);\n        }\n\n        // DEPRECATED: this recursive version has stack depth limitation\n\n    }, {\n        key: '_computeReflectionsRecursive',\n        value: function _computeReflectionsRecursive(src, dir, isect, meshes, maxReflect) {\n            var arr = [];\n\n            // https://stackoverflow.com/questions/7065120/calling-a-javascript-function-recursively\n            // https://stackoverflow.com/questions/41681357/can-a-normal-or-arrow-function-invoke-itself-from-its-body-in-a-recursive-manner\n            var self = this;\n            (function me(src, dir, isect) {\n                // https://stackoverflow.com/questions/39082673/get-face-global-normal-in-three-js\n                // console.log('local normal:', isect.face.normal);\n                var normalMatrix = new THREE.Matrix3().getNormalMatrix(isect.object.matrixWorld);\n                var normalWorld = isect.face.normal.clone().applyMatrix3(normalMatrix).normalize();\n\n                var ref = Laser.reflect(dir, normalWorld);\n                var isectNew = self.raycast(src, ref, meshes, isect.face);\n                // console.log('isectNew:', isectNew);\n\n                if (isectNew) {\n                    var pt = isectNew.point;\n                    arr.push(pt.x, pt.y, pt.z);\n                    if (arr.length / 3 < maxReflect) {\n                        me(pt, ref, isectNew);\n                    }\n                } else {\n                    var inf = src.clone().add(ref.multiplyScalar(self._infLen));\n                    arr.push(inf.x, inf.y, inf.z);\n                }\n            })(src, dir, isect);\n            return arr;\n        }\n    }, {\n        key: '_computeReflections',\n        value: function _computeReflections(src, dir, isect, meshes, maxReflect) {\n            var arr = [];\n            this._meshes = [isect.object]; // re-init\n\n            while (1) {\n                var normalMatrix = new THREE.Matrix3().getNormalMatrix(isect.object.matrixWorld);\n                var normalWorld = isect.face.normal.clone().applyMatrix3(normalMatrix).normalize();\n\n                var ref = Laser.reflect(dir, normalWorld);\n                var isectNew = this.raycast(src, ref, meshes, isect.face);\n                if (isectNew) {\n                    var pt = isectNew.point;\n                    arr.push(pt.x, pt.y, pt.z);\n                    this._meshes.push(isectNew.object);\n                    if (arr.length / 3 < maxReflect) {\n                        src = pt;\n                        dir = ref;\n                        isect = isectNew;\n                        continue;\n                    }\n                    break;\n                } else {\n                    var inf = src.clone().add(ref.multiplyScalar(this._infLen));\n                    arr.push(inf.x, inf.y, inf.z);\n                    break;\n                }\n            }\n            return arr;\n        }\n    }, {\n        key: 'computeReflections',\n        value: function computeReflections(src, dir, isect, meshes, maxReflect) {\n            // return this._computeReflectionsRecursive(src, dir, isect, meshes, maxReflect);\n            return this._computeReflections(src, dir, isect, meshes, maxReflect);\n        }\n    }], [{\n        key: 'direct',\n        value: function direct(src, target) {\n            return target.clone().sub(src).normalize();\n        }\n    }, {\n        key: 'reflect',\n        value: function reflect(d, n) {\n            // r = d - 2 * (d.n) n;  https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector\n            return d.clone().sub(n.clone().multiplyScalar(2 * d.dot(n)));\n        }\n    }]);\n\n    return Laser;\n}(Line);\n\n//export default { Line, Laser }; // seems not go well with webpack4's \"libraryExport: default\"\n\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Laser);\n\n//# sourceURL=webpack://Laser/./src/index.js?");

/***/ }),

/***/ "three":
/*!************************!*\
  !*** external "THREE" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_three__;\n\n//# sourceURL=webpack://Laser/external_%22THREE%22?");

/***/ })

/******/ })["default"];
});