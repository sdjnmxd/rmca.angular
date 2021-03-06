(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
    typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
      (factory((global.skinview3d = {}), global.THREE));
}(this, (function (exports, THREE) {
  'use strict';
  
  THREE = THREE && THREE.hasOwnProperty('default') ? THREE['default'] : THREE;
  
  var asyncGenerator = function () {
    function AwaitValue(value) {
      this.value = value;
    }
    
    function AsyncGenerator(gen) {
      var front, back;
      
      function send(key, arg) {
        return new Promise(function (resolve, reject) {
          var request = {
            key: key,
            arg: arg,
            resolve: resolve,
            reject: reject,
            next: null
          };
          
          if (back) {
            back = back.next = request;
          } else {
            front = back = request;
            resume(key, arg);
          }
        });
      }
      
      function resume(key, arg) {
        try {
          var result = gen[key](arg);
          var value = result.value;
          
          if (value instanceof AwaitValue) {
            Promise.resolve(value.value).then(function (arg) {
              resume("next", arg);
            }, function (arg) {
              resume("throw", arg);
            });
          } else {
            settle(result.done ? "return" : "normal", result.value);
          }
        } catch (err) {
          settle("throw", err);
        }
      }
      
      function settle(type, value) {
        switch (type) {
          case "return":
            front.resolve({
              value: value,
              done: true
            });
            break;
          
          case "throw":
            front.reject(value);
            break;
          
          default:
            front.resolve({
              value: value,
              done: false
            });
            break;
        }
        
        front = front.next;
        
        if (front) {
          resume(front.key, front.arg);
        } else {
          back = null;
        }
      }
      
      this._invoke = send;
      
      if (typeof gen.return !== "function") {
        this.return = undefined;
      }
    }
    
    if (typeof Symbol === "function" && Symbol.asyncIterator) {
      AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
        return this;
      };
    }
    
    AsyncGenerator.prototype.next = function (arg) {
      return this._invoke("next", arg);
    };
    
    AsyncGenerator.prototype.throw = function (arg) {
      return this._invoke("throw", arg);
    };
    
    AsyncGenerator.prototype.return = function (arg) {
      return this._invoke("return", arg);
    };
    
    return {
      wrap: function (fn) {
        return function () {
          return new AsyncGenerator(fn.apply(this, arguments));
        };
      },
      await: function (value) {
        return new AwaitValue(value);
      }
    };
  }();
  
  
  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  
  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    
    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();
  
  
  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };
  
  
  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    
    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };
  
  function toFaceVertices(x1, y1, x2, y2, w, h) {
    return [new THREE.Vector2(x1 / w, 1.0 - y2 / h), new THREE.Vector2(x2 / w, 1.0 - y2 / h), new THREE.Vector2(x2 / w, 1.0 - y1 / h), new THREE.Vector2(x1 / w, 1.0 - y1 / h)];
  }
  
  function toSkinVertices(x1, y1, x2, y2) {
    return toFaceVertices(x1, y1, x2, y2, 64.0, 64.0);
  }
  
  function toCapeVertices(x1, y1, x2, y2) {
    return toFaceVertices(x1, y1, x2, y2, 64.0, 32.0);
  }
  
  function addVertices(box, top, bottom, left, front, right, back) {
    box.faceVertexUvs[0] = [];
    box.faceVertexUvs[0][0] = [right[3], right[0], right[2]];
    box.faceVertexUvs[0][1] = [right[0], right[1], right[2]];
    box.faceVertexUvs[0][2] = [left[3], left[0], left[2]];
    box.faceVertexUvs[0][3] = [left[0], left[1], left[2]];
    box.faceVertexUvs[0][4] = [top[3], top[0], top[2]];
    box.faceVertexUvs[0][5] = [top[0], top[1], top[2]];
    box.faceVertexUvs[0][6] = [bottom[0], bottom[3], bottom[1]];
    box.faceVertexUvs[0][7] = [bottom[3], bottom[2], bottom[1]];
    box.faceVertexUvs[0][8] = [front[3], front[0], front[2]];
    box.faceVertexUvs[0][9] = [front[0], front[1], front[2]];
    box.faceVertexUvs[0][10] = [back[3], back[0], back[2]];
    box.faceVertexUvs[0][11] = [back[0], back[1], back[2]];
  }
  
  var esp = 0.002;
  
  var SkinObject = function (_THREE$Group) {
    inherits(SkinObject, _THREE$Group);
    
    function SkinObject(isSlim, layer1Material, layer2Material) {
      classCallCheck(this, SkinObject);
      
      // Head
      var _this = possibleConstructorReturn(this, (SkinObject.__proto__ || Object.getPrototypeOf(SkinObject)).call(this));
      
      _this.head = new THREE.Group();
      
      var headBox = new THREE.BoxGeometry(8, 8, 8, 0, 0, 0);
      addVertices(headBox, toSkinVertices(8, 0, 16, 8), toSkinVertices(16, 0, 24, 8), toSkinVertices(0, 8, 8, 16), toSkinVertices(8, 8, 16, 16), toSkinVertices(16, 8, 24, 16), toSkinVertices(24, 8, 32, 16));
      var headMesh = new THREE.Mesh(headBox, layer1Material);
      _this.head.add(headMesh);
      
      var head2Box = new THREE.BoxGeometry(9, 9, 9, 0, 0, 0);
      addVertices(head2Box, toSkinVertices(40, 0, 48, 8), toSkinVertices(48, 0, 56, 8), toSkinVertices(32, 8, 40, 16), toSkinVertices(40, 8, 48, 16), toSkinVertices(48, 8, 56, 16), toSkinVertices(56, 8, 64, 16));
      var head2Mesh = new THREE.Mesh(head2Box, layer2Material);
      head2Mesh.renderOrder = -1;
      _this.head.add(head2Mesh);
      
      _this.add(_this.head);
      
      // Body
      _this.body = new THREE.Group();
      
      var bodyBox = new THREE.BoxGeometry(8, 12, 4, 0, 0, 0);
      addVertices(bodyBox, toSkinVertices(20, 16, 28, 20), toSkinVertices(28, 16, 36, 20), toSkinVertices(16, 20, 20, 32), toSkinVertices(20, 20, 28, 32), toSkinVertices(28, 20, 32, 32), toSkinVertices(32, 20, 40, 32));
      var bodyMesh = new THREE.Mesh(bodyBox, layer1Material);
      _this.body.add(bodyMesh);
      
      var body2Box = new THREE.BoxGeometry(9, 13.5, 4.5, 0, 0, 0);
      addVertices(body2Box, toSkinVertices(20, 32, 28, 36), toSkinVertices(28, 32, 36, 36), toSkinVertices(16, 36, 20, 48), toSkinVertices(20, 36, 28, 48), toSkinVertices(28, 36, 32, 48), toSkinVertices(32, 36, 40, 48));
      var body2Mesh = new THREE.Mesh(body2Box, layer2Material);
      _this.body.add(body2Mesh);
      
      _this.body.position.y = -10;
      _this.add(_this.body);
      
      // Right Arm
      _this.rightArm = new THREE.Group();
      var rightArmPivot = new THREE.Group();
      
      var rightArmBox = new THREE.BoxGeometry((isSlim ? 3 : 4) - esp, 12 - esp, 4 - esp, 0, 0, 0);
      if (isSlim) {
        addVertices(rightArmBox, toSkinVertices(44, 16, 47, 20), toSkinVertices(47, 16, 50, 20), toSkinVertices(40, 20, 44, 32), toSkinVertices(44, 20, 47, 32), toSkinVertices(47, 20, 51, 32), toSkinVertices(51, 20, 54, 32));
      } else {
        addVertices(rightArmBox, toSkinVertices(44, 16, 48, 20), toSkinVertices(48, 16, 52, 20), toSkinVertices(40, 20, 44, 32), toSkinVertices(44, 20, 48, 32), toSkinVertices(48, 20, 52, 32), toSkinVertices(52, 20, 56, 32));
      }
      var rightArmMesh = new THREE.Mesh(rightArmBox, layer1Material);
      rightArmPivot.add(rightArmMesh);
      
      var rightArm2Box = new THREE.BoxGeometry((isSlim ? 3.375 : 4.5) - esp, 13.5 - esp, 4.5 - esp, 0, 0, 0);
      if (isSlim) {
        addVertices(rightArm2Box, toSkinVertices(44, 32, 47, 36), toSkinVertices(47, 32, 50, 36), toSkinVertices(40, 36, 44, 48), toSkinVertices(44, 36, 47, 48), toSkinVertices(47, 36, 51, 48), toSkinVertices(51, 36, 54, 48));
      } else {
        addVertices(rightArm2Box, toSkinVertices(44, 32, 48, 36), toSkinVertices(48, 32, 52, 36), toSkinVertices(40, 36, 44, 48), toSkinVertices(44, 36, 48, 48), toSkinVertices(48, 36, 52, 48), toSkinVertices(52, 36, 56, 48));
      }
      var rightArm2Mesh = new THREE.Mesh(rightArm2Box, layer2Material);
      rightArm2Mesh.renderOrder = 1;
      rightArmPivot.add(rightArm2Mesh);
      
      rightArmPivot.position.y = -6;
      _this.rightArm.add(rightArmPivot);
      _this.rightArm.position.y = -4;
      _this.rightArm.position.x = isSlim ? -5.5 : -6;
      _this.add(_this.rightArm);
      
      // Left Arm
      _this.leftArm = new THREE.Group();
      var leftArmPivot = new THREE.Group();
      
      var leftArmBox = new THREE.BoxGeometry((isSlim ? 3 : 4) - esp, 12 - esp, 4 - esp, 0, 0, 0);
      if (isSlim) {
        addVertices(leftArmBox, toSkinVertices(36, 48, 39, 52), toSkinVertices(39, 48, 42, 52), toSkinVertices(32, 52, 36, 64), toSkinVertices(36, 52, 39, 64), toSkinVertices(39, 52, 43, 64), toSkinVertices(43, 52, 46, 64));
      } else {
        addVertices(leftArmBox, toSkinVertices(36, 48, 40, 52), toSkinVertices(40, 48, 44, 52), toSkinVertices(32, 52, 36, 64), toSkinVertices(36, 52, 40, 64), toSkinVertices(40, 52, 44, 64), toSkinVertices(44, 52, 48, 64));
      }
      var leftArmMesh = new THREE.Mesh(leftArmBox, layer1Material);
      leftArmPivot.add(leftArmMesh);
      
      var leftArm2Box = new THREE.BoxGeometry((isSlim ? 3.375 : 4.5) - esp, 13.5 - esp, 4.5 - esp, 0, 0, 0);
      if (isSlim) {
        addVertices(leftArm2Box, toSkinVertices(52, 48, 55, 52), toSkinVertices(55, 48, 58, 52), toSkinVertices(48, 52, 52, 64), toSkinVertices(52, 52, 55, 64), toSkinVertices(55, 52, 59, 64), toSkinVertices(59, 52, 62, 64));
      } else {
        addVertices(leftArm2Box, toSkinVertices(52, 48, 56, 52), toSkinVertices(56, 48, 60, 52), toSkinVertices(48, 52, 52, 64), toSkinVertices(52, 52, 56, 64), toSkinVertices(56, 52, 60, 64), toSkinVertices(60, 52, 64, 64));
      }
      var leftArm2Mesh = new THREE.Mesh(leftArm2Box, layer2Material);
      leftArm2Mesh.renderOrder = 1;
      leftArmPivot.add(leftArm2Mesh);
      
      leftArmPivot.position.y = -6;
      _this.leftArm.add(leftArmPivot);
      _this.leftArm.position.y = -4;
      _this.leftArm.position.x = isSlim ? 5.5 : 6;
      _this.add(_this.leftArm);
      
      // Right Leg
      _this.rightLeg = new THREE.Group();
      var rightLegPivot = new THREE.Group();
      
      var rightLegBox = new THREE.BoxGeometry(4 - esp, 12 - esp, 4 - esp, 0, 0, 0);
      addVertices(rightLegBox, toSkinVertices(4, 16, 8, 20), toSkinVertices(8, 16, 12, 20), toSkinVertices(0, 20, 4, 32), toSkinVertices(4, 20, 8, 32), toSkinVertices(8, 20, 12, 32), toSkinVertices(12, 20, 16, 32));
      var rightLegMesh = new THREE.Mesh(rightLegBox, layer1Material);
      rightLegPivot.add(rightLegMesh);
      
      var rightLeg2Box = new THREE.BoxGeometry(4.5 - esp, 13.5 - esp, 4.5 - esp, 0, 0, 0);
      addVertices(rightLeg2Box, toSkinVertices(4, 32, 8, 36), toSkinVertices(8, 32, 12, 36), toSkinVertices(0, 36, 4, 48), toSkinVertices(4, 36, 8, 48), toSkinVertices(8, 36, 12, 48), toSkinVertices(12, 36, 16, 48));
      var rightLeg2Mesh = new THREE.Mesh(rightLeg2Box, layer2Material);
      rightLeg2Mesh.renderOrder = 1;
      rightLegPivot.add(rightLeg2Mesh);
      
      rightLegPivot.position.y = -6;
      _this.rightLeg.add(rightLegPivot);
      _this.rightLeg.position.y = -16;
      _this.rightLeg.position.x = -2;
      _this.add(_this.rightLeg);
      
      // Left Leg
      _this.leftLeg = new THREE.Group();
      var leftLegPivot = new THREE.Group();
      
      var leftLegBox = new THREE.BoxGeometry(4 - esp, 12 - esp, 4 - esp, 0, 0, 0);
      addVertices(leftLegBox, toSkinVertices(20, 48, 24, 52), toSkinVertices(24, 48, 28, 52), toSkinVertices(16, 52, 20, 64), toSkinVertices(20, 52, 24, 64), toSkinVertices(24, 52, 28, 64), toSkinVertices(28, 52, 32, 64));
      var leftLegMesh = new THREE.Mesh(leftLegBox, layer1Material);
      leftLegPivot.add(leftLegMesh);
      
      var leftLeg2Box = new THREE.BoxGeometry(4.5 - esp, 13.5 - esp, 4.5 - esp, 0, 0, 0);
      addVertices(leftLeg2Box, toSkinVertices(4, 48, 8, 52), toSkinVertices(8, 48, 12, 52), toSkinVertices(0, 52, 4, 64), toSkinVertices(4, 52, 8, 64), toSkinVertices(8, 52, 12, 64), toSkinVertices(12, 52, 16, 64));
      var leftLeg2Mesh = new THREE.Mesh(leftLeg2Box, layer2Material);
      leftLeg2Mesh.renderOrder = 1;
      leftLegPivot.add(leftLeg2Mesh);
      
      leftLegPivot.position.y = -6;
      _this.leftLeg.add(leftLegPivot);
      _this.leftLeg.position.y = -16;
      _this.leftLeg.position.x = 2;
      _this.add(_this.leftLeg);
      return _this;
    }
    
    return SkinObject;
  }(THREE.Group);
  
  var CapeObject = function (_THREE$Group2) {
    inherits(CapeObject, _THREE$Group2);
    
    function CapeObject(capeMaterial) {
      classCallCheck(this, CapeObject);
      
      // back = outside
      // front = inside
      var _this2 = possibleConstructorReturn(this, (CapeObject.__proto__ || Object.getPrototypeOf(CapeObject)).call(this));
      
      var capeBox = new THREE.BoxGeometry(10, 16, 1, 0, 0, 0);
      addVertices(capeBox, toCapeVertices(1, 0, 11, 1), toCapeVertices(11, 0, 21, 1), toCapeVertices(11, 1, 12, 17), toCapeVertices(12, 1, 22, 17), toCapeVertices(0, 1, 1, 17), toCapeVertices(1, 1, 11, 17));
      _this2.cape = new THREE.Mesh(capeBox, capeMaterial);
      _this2.cape.position.y = -8;
      _this2.cape.position.z = -0.5;
      _this2.add(_this2.cape);
      return _this2;
    }
    
    return CapeObject;
  }(THREE.Group);
  
  var PlayerObject = function (_THREE$Group3) {
    inherits(PlayerObject, _THREE$Group3);
    
    function PlayerObject(slim, layer1Material, layer2Material, capeMaterial) {
      classCallCheck(this, PlayerObject);
      
      var _this3 = possibleConstructorReturn(this, (PlayerObject.__proto__ || Object.getPrototypeOf(PlayerObject)).call(this));
      
      _this3.slim = slim;
      
      _this3.skin = new SkinObject(slim, layer1Material, layer2Material);
      _this3.skin.visible = false;
      _this3.add(_this3.skin);
      
      _this3.cape = new CapeObject(capeMaterial);
      _this3.cape.position.z = -2;
      _this3.cape.position.y = -4;
      _this3.cape.rotation.x = 25 * Math.PI / 180;
      _this3.cape.visible = false;
      _this3.add(_this3.cape);
      return _this3;
    }
    
    return PlayerObject;
  }(THREE.Group);
  
  /**
   * @license
   * Copyright (C) 2010-2017 three.js authors
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   */
  /**
   * @preserve
   * The code was originally from https://github.com/mrdoob/three.js/blob/d45a042cf962e9b1aa9441810ba118647b48aacb/examples/js/controls/OrbitControls.js
   */
  var OrbitControls = function (_THREE$EventDispatche) {
    inherits(OrbitControls, _THREE$EventDispatche);
    
    /**
     * @preserve
     * @author qiao / https://github.com/qiao
     * @author mrdoob / http://mrdoob.com
     * @author alteredq / http://alteredqualia.com/
     * @author WestLangley / http://github.com/WestLangley
     * @author erich666 / http://erichaines.com
     */
    
    // This set of controls performs orbiting, dollying (zooming), and panning.
    // Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
    //
    //    Orbit - left mouse / touch: one finger move
    //    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
    //    Pan - right mouse, or arrow keys / touch: three finger swipe
    
    function OrbitControls(object, domElement) {
      classCallCheck(this, OrbitControls);
      
      var _this = possibleConstructorReturn(this, (OrbitControls.__proto__ || Object.getPrototypeOf(OrbitControls)).call(this));
      
      _this.object = object;
      _this.domElement = domElement !== undefined ? domElement : document;
      
      // Set to false to disable this control
      _this.enabled = true;
      
      // "target" sets the location of focus, where the object orbits around
      _this.target = new THREE.Vector3();
      
      // How far you can dolly in and out (PerspectiveCamera only)
      _this.minDistance = 0;
      _this.maxDistance = Infinity;
      
      // How far you can zoom in and out (OrthographicCamera only)
      _this.minZoom = 0;
      _this.maxZoom = Infinity;
      
      // How far you can orbit vertically, upper and lower limits.
      // Range is 0 to Math.PI radians.
      _this.minPolarAngle = 0; // radians
      _this.maxPolarAngle = Math.PI; // radians
      
      // How far you can orbit horizontally, upper and lower limits.
      // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
      _this.minAzimuthAngle = -Infinity; // radians
      _this.maxAzimuthAngle = Infinity; // radians
      
      // Set to true to enable damping (inertia)
      // If damping is enabled, you must call controls.update() in your animation loop
      _this.enableDamping = false;
      _this.dampingFactor = 0.25;
      
      // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
      // Set to false to disable zooming
      _this.enableZoom = true;
      _this.zoomSpeed = 1.0;
      
      // Set to false to disable rotating
      _this.enableRotate = true;
      _this.rotateSpeed = 1.0;
      
      // Set to false to disable panning
      _this.enablePan = true;
      _this.keyPanSpeed = 7.0; // pixels moved per arrow key push
      
      // Set to true to automatically rotate around the target
      // If auto-rotate is enabled, you must call controls.update() in your animation loop
      _this.autoRotate = true;
      _this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
      
      // Set to false to disable use of the keys
      _this.enableKeys = true;
      
      // The four arrow keys
      _this.keys = {LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};
      
      // Mouse buttons
      _this.mouseButtons = {ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT};
      
      // for reset
      _this.target0 = _this.target.clone();
      _this.position0 = _this.object.position.clone();
      _this.zoom0 = _this.object.zoom;
      
      //
      // public methods
      //
      _this.getPolarAngle = function () {
        return spherical.phi;
      };
      _this.getAzimuthalAngle = function () {
        return spherical.theta;
      };
      _this.saveState = function () {
        scope.target0.copy(scope.target);
        scope.position0.copy(scope.object.position);
        scope.zoom0 = scope.object.zoom;
      };
      _this.reset = function () {
        scope.target.copy(scope.target0);
        scope.object.position.copy(scope.position0);
        scope.object.zoom = scope.zoom0;
        scope.object.updateProjectionMatrix();
        scope.dispatchEvent(changeEvent);
        scope.update();
        state = STATE.NONE;
      };
      
      // this method is exposed, but perhaps it would be better if we can make it private...
      _this.update = function () {
        var offset = new THREE.Vector3();
        // so camera.up is the orbit axis
        var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().inverse();
        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();
        return function update() {
          var position = scope.object.position;
          offset.copy(position).sub(scope.target);
          // rotate offset to "y-axis-is-up" space
          offset.applyQuaternion(quat);
          // angle from z-axis around y-axis
          spherical.setFromVector3(offset);
          if (scope.autoRotate && state === STATE.NONE) {
            rotateLeft(getAutoRotationAngle());
          }
          spherical.theta += sphericalDelta.theta;
          spherical.phi += sphericalDelta.phi;
          // restrict theta to be between desired limits
          spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));
          // restrict phi to be between desired limits
          spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
          spherical.makeSafe();
          spherical.radius *= scale;
          // restrict radius to be between desired limits
          spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));
          // move target to panned location
          scope.target.add(panOffset);
          offset.setFromSpherical(spherical);
          // rotate offset back to "camera-up-vector-is-up" space
          offset.applyQuaternion(quatInverse);
          position.copy(scope.target).add(offset);
          scope.object.lookAt(scope.target);
          if (scope.enableDamping === true) {
            sphericalDelta.theta *= 1 - scope.dampingFactor;
            sphericalDelta.phi *= 1 - scope.dampingFactor;
          } else {
            sphericalDelta.set(0, 0, 0);
          }
          scale = 1;
          panOffset.set(0, 0, 0);
          // update condition is:
          // min(camera displacement, camera rotation in radians)^2 > EPS
          // using small-angle approximation cos(x/2) = 1 - x^2 / 8
          if (zoomChanged || lastPosition.distanceToSquared(scope.object.position) > EPS || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
            scope.dispatchEvent(changeEvent);
            lastPosition.copy(scope.object.position);
            lastQuaternion.copy(scope.object.quaternion);
            zoomChanged = false;
            return true;
          }
          return false;
        };
      }();
      _this.dispose = function () {
        scope.domElement.removeEventListener("contextmenu", onContextMenu, false);
        scope.domElement.removeEventListener("mousedown", onMouseDown, false);
        scope.domElement.removeEventListener("wheel", onMouseWheel, false);
        scope.domElement.removeEventListener("touchstart", onTouchStart, false);
        scope.domElement.removeEventListener("touchend", onTouchEnd, false);
        scope.domElement.removeEventListener("touchmove", onTouchMove, false);
        document.removeEventListener("mousemove", onMouseMove, false);
        document.removeEventListener("mouseup", onMouseUp, false);
        window.removeEventListener("keydown", onKeyDown, false);
        //scope.dispatchEvent({ type: "dispose" }); // should this be added here?
      };
      //
      // internals
      //
      var scope = _this;
      var changeEvent = {type: "change"};
      var startEvent = {type: "start"};
      var endEvent = {type: "end"};
      var STATE = {NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5};
      var state = STATE.NONE;
      var EPS = 0.000001;
      // current position in spherical coordinates
      var spherical = new THREE.Spherical();
      var sphericalDelta = new THREE.Spherical();
      var scale = 1;
      var panOffset = new THREE.Vector3();
      var zoomChanged = false;
      var rotateStart = new THREE.Vector2();
      var rotateEnd = new THREE.Vector2();
      var rotateDelta = new THREE.Vector2();
      var panStart = new THREE.Vector2();
      var panEnd = new THREE.Vector2();
      var panDelta = new THREE.Vector2();
      var dollyStart = new THREE.Vector2();
      var dollyEnd = new THREE.Vector2();
      var dollyDelta = new THREE.Vector2();
      
      function getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
      }
      
      function getZoomScale() {
        return Math.pow(0.95, scope.zoomSpeed);
      }
      
      function rotateLeft(angle) {
        sphericalDelta.theta -= angle;
      }
      
      function rotateUp(angle) {
        sphericalDelta.phi -= angle;
      }
      
      var panLeft = function () {
        var v = new THREE.Vector3();
        return function panLeft(distance, objectMatrix) {
          v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
          v.multiplyScalar(-distance);
          panOffset.add(v);
        };
      }();
      var panUp = function () {
        var v = new THREE.Vector3();
        return function panUp(distance, objectMatrix) {
          v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
          v.multiplyScalar(distance);
          panOffset.add(v);
        };
      }();
      // deltaX and deltaY are in pixels; right and down are positive
      var pan = function () {
        var offset = new THREE.Vector3();
        return function pan(deltaX, deltaY) {
          var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
          if (scope.object instanceof THREE.PerspectiveCamera) {
            // perspective
            var position = scope.object.position;
            offset.copy(position).sub(scope.target);
            var targetDistance = offset.length();
            // half of the fov is center to top of screen
            targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180.0);
            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
            panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
          } else if (scope.object instanceof THREE.OrthographicCamera) {
            // orthographic
            panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
            panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
          } else {
            // camera neither orthographic nor perspective
            console.warn('[skinview] ' + 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
            scope.enablePan = false;
          }
        };
      }();
      
      function dollyIn(dollyScale) {
        if (scope.object instanceof THREE.PerspectiveCamera) {
          scale /= dollyScale;
        } else if (scope.object instanceof THREE.OrthographicCamera) {
          scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
          scope.object.updateProjectionMatrix();
          zoomChanged = true;
        } else {
          console.warn('[skinview] ' + 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
          scope.enableZoom = false;
        }
      }
      
      function dollyOut(dollyScale) {
        if (scope.object instanceof THREE.PerspectiveCamera) {
          scale *= dollyScale;
        } else if (scope.object instanceof THREE.OrthographicCamera) {
          scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
          scope.object.updateProjectionMatrix();
          zoomChanged = true;
        } else {
          console.warn('[skinview]' + ' WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
          scope.enableZoom = false;
        }
      }
      
      //
      // event callbacks - update the object state
      //
      function handleMouseDownRotate(event) {
        rotateStart.set(event.clientX, event.clientY);
      }
      
      function handleMouseDownDolly(event) {
        dollyStart.set(event.clientX, event.clientY);
      }
      
      function handleMouseDownPan(event) {
        panStart.set(event.clientX, event.clientY);
      }
      
      function handleMouseMoveRotate(event) {
        rotateEnd.set(event.clientX, event.clientY);
        rotateDelta.subVectors(rotateEnd, rotateStart);
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        // rotating across whole screen goes 360 degrees around
        rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
        // rotating up and down along whole screen attempts to go 360, but limited to 180
        rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
        rotateStart.copy(rotateEnd);
        scope.update();
      }
      
      function handleMouseMoveDolly(event) {
        dollyEnd.set(event.clientX, event.clientY);
        dollyDelta.subVectors(dollyEnd, dollyStart);
        if (dollyDelta.y > 0) {
          dollyIn(getZoomScale());
        } else if (dollyDelta.y < 0) {
          dollyOut(getZoomScale());
        }
        dollyStart.copy(dollyEnd);
        scope.update();
      }
      
      function handleMouseMovePan(event) {
        panEnd.set(event.clientX, event.clientY);
        panDelta.subVectors(panEnd, panStart);
        pan(panDelta.x, panDelta.y);
        panStart.copy(panEnd);
        scope.update();
      }
      
      function handleMouseWheel(event) {
        if (event.deltaY < 0) {
          dollyOut(getZoomScale());
        } else if (event.deltaY > 0) {
          dollyIn(getZoomScale());
        }
        scope.update();
      }
      
      function handleKeyDown(event) {
        switch (event.keyCode) {
          case scope.keys.UP:
            pan(0, scope.keyPanSpeed);
            scope.update();
            break;
          case scope.keys.BOTTOM:
            pan(0, -scope.keyPanSpeed);
            scope.update();
            break;
          case scope.keys.LEFT:
            pan(scope.keyPanSpeed, 0);
            scope.update();
            break;
          case scope.keys.RIGHT:
            pan(-scope.keyPanSpeed, 0);
            scope.update();
            break;
        }
      }
      
      function handleTouchStartRotate(event) {
        rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
      }
      
      function handleTouchStartDolly(event) {
        var dx = event.touches[0].pageX - event.touches[1].pageX;
        var dy = event.touches[0].pageY - event.touches[1].pageY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        dollyStart.set(0, distance);
      }
      
      function handleTouchStartPan(event) {
        panStart.set(event.touches[0].pageX, event.touches[0].pageY);
      }
      
      function handleTouchMoveRotate(event) {
        rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        rotateDelta.subVectors(rotateEnd, rotateStart);
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
        rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
        rotateStart.copy(rotateEnd);
        scope.update();
      }
      
      function handleTouchMoveDolly(event) {
        var dx = event.touches[0].pageX - event.touches[1].pageX;
        var dy = event.touches[0].pageY - event.touches[1].pageY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        dollyEnd.set(0, distance);
        dollyDelta.subVectors(dollyEnd, dollyStart);
        if (dollyDelta.y > 0) {
          dollyOut(getZoomScale());
        } else if (dollyDelta.y < 0) {
          dollyIn(getZoomScale());
        }
        dollyStart.copy(dollyEnd);
        scope.update();
      }
      
      function handleTouchMovePan(event) {
        panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        panDelta.subVectors(panEnd, panStart);
        pan(panDelta.x, panDelta.y);
        panStart.copy(panEnd);
        scope.update();
      }
      
      function onMouseDown(event) {
        if (scope.enabled === false) return;
        switch (event.button) {
          case scope.mouseButtons.ORBIT:
            if (scope.enableRotate === false) return;
            handleMouseDownRotate(event);
            state = STATE.ROTATE;
            break;
          case scope.mouseButtons.ZOOM:
            if (scope.enableZoom === false) return;
            handleMouseDownDolly(event);
            state = STATE.DOLLY;
            break;
          case scope.mouseButtons.PAN:
            if (scope.enablePan === false) return;
            handleMouseDownPan(event);
            state = STATE.PAN;
            break;
        }
        event.preventDefault();
        if (state !== STATE.NONE) {
          document.addEventListener("mousemove", onMouseMove, false);
          document.addEventListener("mouseup", onMouseUp, false);
          scope.dispatchEvent(startEvent);
        }
      }
      
      function onMouseMove(event) {
        if (scope.enabled === false) return;
        switch (state) {
          case STATE.ROTATE:
            if (scope.enableRotate === false) return;
            handleMouseMoveRotate(event);
            break;
          case STATE.DOLLY:
            if (scope.enableZoom === false) return;
            handleMouseMoveDolly(event);
            break;
          case STATE.PAN:
            if (scope.enablePan === false) return;
            handleMouseMovePan(event);
            break;
        }
        event.preventDefault();
      }
      
      function onMouseUp(event) {
        if (scope.enabled === false) return;
        document.removeEventListener("mousemove", onMouseMove, false);
        document.removeEventListener("mouseup", onMouseUp, false);
        scope.dispatchEvent(endEvent);
        state = STATE.NONE;
      }
      
      function onMouseWheel(event) {
        if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE && state !== STATE.ROTATE) return;
        event.preventDefault();
        event.stopPropagation();
        handleMouseWheel(event);
        scope.dispatchEvent(startEvent); // not sure why these are here...
        scope.dispatchEvent(endEvent);
      }
      
      function onKeyDown(event) {
        if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;
        handleKeyDown(event);
      }
      
      function onTouchStart(event) {
        if (scope.enabled === false) return;
        switch (event.touches.length) {
          case 1:
            // one-fingered touch: rotate
            if (scope.enableRotate === false) return;
            handleTouchStartRotate(event);
            state = STATE.TOUCH_ROTATE;
            break;
          case 2:
            // two-fingered touch: dolly
            if (scope.enableZoom === false) return;
            handleTouchStartDolly(event);
            state = STATE.TOUCH_DOLLY;
            break;
          case 3:
            // three-fingered touch: pan
            if (scope.enablePan === false) return;
            handleTouchStartPan(event);
            state = STATE.TOUCH_PAN;
            break;
          default:
            state = STATE.NONE;
        }
        if (state !== STATE.NONE) {
          scope.dispatchEvent(startEvent);
        }
      }
      
      function onTouchMove(event) {
        if (scope.enabled === false) return;
        switch (event.touches.length) {
          case 1:
            // one-fingered touch: rotate
            if (scope.enableRotate === false) return;
            if (state !== STATE.TOUCH_ROTATE) return; // is this needed?...
            handleTouchMoveRotate(event);
            break;
          case 2:
            // two-fingered touch: dolly
            if (scope.enableZoom === false) return;
            if (state !== STATE.TOUCH_DOLLY) return; // is this needed?...
            handleTouchMoveDolly(event);
            break;
          case 3:
            // three-fingered touch: pan
            if (scope.enablePan === false) return;
            if (state !== STATE.TOUCH_PAN) return; // is this needed?...
            handleTouchMovePan(event);
            break;
          default:
            state = STATE.NONE;
        }
        event.preventDefault();
        event.stopPropagation();
      }
      
      function onTouchEnd(event) {
        if (scope.enabled === false) return;
        scope.dispatchEvent(endEvent);
        state = STATE.NONE;
      }
      
      function onContextMenu(event) {
        if (scope.enabled === false || scope.enablePan === false) return;
        event.preventDefault();
      }
      
      //
      scope.domElement.addEventListener("contextmenu", onContextMenu, false);
      scope.domElement.addEventListener("mousedown", onMouseDown, false);
      scope.domElement.addEventListener("wheel", onMouseWheel, false);
      scope.domElement.addEventListener("touchstart", onTouchStart, false);
      scope.domElement.addEventListener("touchend", onTouchEnd, false);
      scope.domElement.addEventListener("touchmove", onTouchMove, false);
      window.addEventListener("keydown", onKeyDown, false);
      // force an update at start
      _this.update();
      return _this;
    }
    
    return OrbitControls;
  }(THREE.EventDispatcher);
  
  function copyImage(context, sX, sY, w, h, dX, dY, flipHorizontal) {
    var imgData = context.getImageData(sX, sY, w, h);
    if (flipHorizontal) {
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w / 2; x++) {
          var index = (x + y * w) * 4;
          var index2 = (w - x - 1 + y * w) * 4;
          var pA1 = imgData.data[index];
          var pA2 = imgData.data[index + 1];
          var pA3 = imgData.data[index + 2];
          var pA4 = imgData.data[index + 3];
      
          var pB1 = imgData.data[index2];
          var pB2 = imgData.data[index2 + 1];
          var pB3 = imgData.data[index2 + 2];
          var pB4 = imgData.data[index2 + 3];
          
          imgData.data[index] = pB1;
          imgData.data[index + 1] = pB2;
          imgData.data[index + 2] = pB3;
          imgData.data[index + 3] = pB4;
          
          imgData.data[index2] = pA1;
          imgData.data[index2 + 1] = pA2;
          imgData.data[index2 + 2] = pA3;
          imgData.data[index2 + 3] = pA4;
        }
      }
    }
    context.putImageData(imgData, dX, dY);
  }
  
  function convertSkinTo1_8(context, width) {
    var scale = width / 64.0;
    var copySkin = function copySkin(context, sX, sY, w, h, dX, dY, flipHorizontal) {
      return copyImage(context, sX * scale, sY * scale, w * scale, h * scale, dX * scale, dY * scale, flipHorizontal);
    };
    
    copySkin(context, 4, 16, 4, 4, 20, 48, true); // Top Leg
    copySkin(context, 8, 16, 4, 4, 24, 48, true); // Bottom Leg
    copySkin(context, 0, 20, 4, 12, 24, 52, true); // Outer Leg
    copySkin(context, 4, 20, 4, 12, 20, 52, true); // Front Leg
    copySkin(context, 8, 20, 4, 12, 16, 52, true); // Inner Leg
    copySkin(context, 12, 20, 4, 12, 28, 52, true); // Back Leg
    copySkin(context, 44, 16, 4, 4, 36, 48, true); // Top Arm
    copySkin(context, 48, 16, 4, 4, 40, 48, true); // Bottom Arm
    copySkin(context, 40, 20, 4, 12, 40, 52, true); // Outer Arm
    copySkin(context, 44, 20, 4, 12, 36, 52, true); // Front Arm
    copySkin(context, 48, 20, 4, 12, 32, 52, true); // Inner Arm
    copySkin(context, 52, 20, 4, 12, 44, 52, true); // Back Arm
  }
  
  var SkinViewer = function () {
    function SkinViewer(options) {
      var _this = this;
      
      classCallCheck(this, SkinViewer);
      
      this.domElement = options.domElement;
      this.animation = options.animation || null;
      this.animationPaused = false;
      this.animationSpeed = 3;
      this.animationTime = 0;
      this.disposed = false;
      
      // texture
      this.skinImg = new Image();
      this.skinCanvas = document.createElement("canvas");
      this.skinTexture = new THREE.Texture(this.skinCanvas);
      this.skinTexture.magFilter = THREE.NearestFilter;
      this.skinTexture.minFilter = THREE.NearestMipMapNearestFilter;
      
      this.capeImg = new Image();
      this.capeCanvas = document.createElement("canvas");
      this.capeTexture = new THREE.Texture(this.capeCanvas);
      this.capeTexture.magFilter = THREE.NearestFilter;
      this.capeTexture.minFilter = THREE.NearestMipMapNearestFilter;
      
      this.layer1Material = new THREE.MeshBasicMaterial({map: this.skinTexture, side: THREE.FrontSide});
      this.layer2Material = new THREE.MeshBasicMaterial({
        map: this.skinTexture,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide
      });
      this.capeMaterial = new THREE.MeshBasicMaterial({map: this.capeTexture});
      
      // scene
      this.scene = new THREE.Scene();
      
      this.camera = new THREE.PerspectiveCamera(65);
      this.camera.position.x = 20;
      this.camera.position.y = -4;
      this.camera.position.z = 25;
      this.renderer = new THREE.WebGLRenderer({angleRot: true, alpha: true, antialias: false});
      this.renderer.setSize(300, 300); // default size
      this.renderer.context.getShaderInfoLog = function () {
        return "";
      }; // shut firefox up
      this.domElement.appendChild(this.renderer.domElement);
      
      this.playerObject = new PlayerObject(options.slim === true, this.layer1Material, this.layer2Material, this.capeMaterial);
      this.scene.add(this.playerObject);
      
      // texture loading
      this.skinImg.crossOrigin = "";
      this.skinImg.onerror = function () {
        return console.error('[skinview] ' + '加载' + _this.skinImg.src + '皮肤失败');
      };
      this.skinImg.onload = function () {
        var isOldFormat = false;
        if (_this.skinImg.width !== _this.skinImg.height) {
          if (_this.skinImg.width === 2 * _this.skinImg.height) {
            isOldFormat = true;
          } else {
            console.error('[skinview] ' + '皮肤大小不正确, 无法正常渲染');
            return;
          }
        }
  
        var skinContext = _this.skinCanvas.getContext("2d");
        if (isOldFormat) {
          var width = _this.skinImg.width;
          _this.skinCanvas.width = width;
          _this.skinCanvas.height = width;
          skinContext.clearRect(0, 0, width, width);
          skinContext.drawImage(_this.skinImg, 0, 0, width, width / 2.0);
          convertSkinTo1_8(skinContext, width);
        } else {
          _this.skinCanvas.width = _this.skinImg.width;
          _this.skinCanvas.height = _this.skinImg.height;
          skinContext.clearRect(0, 0, _this.skinCanvas.width, _this.skinCanvas.height);
          skinContext.drawImage(_this.skinImg, 0, 0, _this.skinCanvas.width, _this.skinCanvas.height);
        }
        
        _this.skinTexture.needsUpdate = true;
        _this.layer1Material.needsUpdate = true;
        _this.layer2Material.needsUpdate = true;
        
        _this.playerObject.skin.visible = true;
      };
      
      this.capeImg.crossOrigin = "";
      this.capeImg.onerror = function () {
        return console.error('[skinview] ' + '加载' + _this.skinImg.src + '披风失败');
      };
      this.capeImg.onload = function () {
        if (_this.capeImg.width !== 2 * _this.capeImg.height) {
          console.error('[skinview] ' + '披风大小不正确, 不过暴力渲染了');
        }
        
        _this.capeCanvas.width = _this.capeImg.width;
        _this.capeCanvas.height = _this.capeImg.height;
        var capeContext = _this.capeCanvas.getContext("2d");
        capeContext.clearRect(0, 0, _this.capeCanvas.width, _this.capeCanvas.height);
        capeContext.drawImage(_this.capeImg, 0, 0, _this.capeCanvas.width, _this.capeCanvas.height);
        
        _this.capeTexture.needsUpdate = true;
        _this.capeMaterial.needsUpdate = true;
        
        _this.playerObject.cape.visible = true;
      };
      
      if (options.skinUrl) this.skinUrl = options.skinUrl;
      if (options.capeUrl) this.capeUrl = options.capeUrl;
      if (options.width) this.width = options.width;
      if (options.height) this.height = options.height;
  
      var draw = function draw() {
        if (_this.disposed) return;
        window.requestAnimationFrame(draw);
        if (!_this.animationPaused) {
          _this.animationTime++;
          if (_this.animation) {
            _this.animation(_this.playerObject, _this.animationTime / 100 * _this.animationSpeed);
          }
        }
        _this.renderer.render(_this.scene, _this.camera);
      };
      draw();
    }
    
    createClass(SkinViewer, [{
      key: "setSize",
      value: function setSize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }
    }, {
      key: "dispose",
      value: function dispose() {
        this.disposed = true;
        this.domElement.removeChild(this.renderer.domElement);
        this.renderer.dispose();
        this.skinTexture.dispose();
        this.capeTexture.dispose();
      }
    }, {
      key: "skinUrl",
      get: function get$$1() {
        return this.skinImg.src;
      },
      set: function set$$1(url) {
        this.skinImg.src = url;
      }
    }, {
      key: "capeUrl",
      get: function get$$1() {
        return this.capeImg.src;
      },
      set: function set$$1(url) {
        this.capeImg.src = url;
      }
    }, {
      key: "width",
      get: function get$$1() {
        return this.renderer.getSize().width;
      },
      set: function set$$1(newWidth) {
        this.setSize(newWidth, this.height);
      }
    }, {
      key: "height",
      get: function get$$1() {
        return this.renderer.getSize().height;
      },
      set: function set$$1(newHeight) {
        this.setSize(this.width, newHeight);
      }
    }]);
    return SkinViewer;
  }();
  
  var SkinControl = function () {
    function SkinControl(skinViewer) {
      var _this2 = this;
      
      classCallCheck(this, SkinControl);
      
      this.enableAnimationControl = true;
      this.skinViewer = skinViewer;
      
      this.orbitControls = new OrbitControls(skinViewer.camera, skinViewer.renderer.domElement);
      this.orbitControls.autoRotate = true
      this.orbitControls.enablePan = false;
      this.orbitControls.target = new THREE.Vector3(0, -12, 0);
      this.orbitControls.minDistance = 10;
      this.orbitControls.maxDistance = 256;
      this.orbitControls.update();
      
      this.animationPauseListener = function (e) {
        if (_this2.enableAnimationControl) {
          e.preventDefault();
          _this2.skinViewer.animationPaused = !_this2.skinViewer.animationPaused;
        }
      };
      this.skinViewer.domElement.addEventListener("contextmenu", this.animationPauseListener, false);
    }
    
    createClass(SkinControl, [{
      key: "dispose",
      value: function dispose() {
        this.skinViewer.domElement.removeEventListener("contextmenu", this.animationPauseListener, false);
        this.orbitControls.dispose();
      }
    }]);
    return SkinControl;
  }();
  
  var WalkAnimation = function WalkAnimation(player, time) {
    var skin = player.skin;
    var angleRot = time + Math.PI / 2;
    
    // Leg Swing
    skin.leftLeg.rotation.x = Math.cos(angleRot);
    skin.rightLeg.rotation.x = Math.cos(angleRot + Math.PI);
    
    // Arm Swing
    skin.leftArm.rotation.x = Math.cos(angleRot + Math.PI);
    skin.rightArm.rotation.x = Math.cos(angleRot);
    
    // Head Swing
    skin.head.rotation.y = Math.cos(angleRot + Math.PI);
  };
  
  /**
   * @license
   * skinview3d <https://github.com/to2mbn/skinview3d>
   *
   * Copyright (C) 2017 the original author or authors
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   * GNU General Public License for more details.
   *
   * You should have received a copy of the GNU General Public License
   * along with this program.  If not, see <http://www.gnu.org/licenses/>.
   *
   *
   * @author yushijinhun <https://github.com/yushijinhun>
   * @author Hacksore <https://github.com/Hacksore>
   * @author Kent Rasmussen <https://github.com/earthiverse>
   */
  
  exports.SkinObject = SkinObject;
  exports.CapeObject = CapeObject;
  exports.PlayerObject = PlayerObject;
  exports.SkinViewer = SkinViewer;
  exports.SkinControl = SkinControl;
  exports.WalkAnimation = WalkAnimation;
  
  Object.defineProperty(exports, '__esModule', {value: true});
  
})));
