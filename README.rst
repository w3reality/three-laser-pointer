three-laser-pointer
===================

[DRAFT]

Laser object for three.js

Demo 1: https://w3reality.github.io/three-laser-pointer/examples/demo-api/index.html

Demo 2: https://w3reality.github.io/three-laser-pointer/examples/demo-terrains/dist/index.html

.. image:: 000https://w3reality.github.io/three-laser-pointer/examples/demo-api/laser.png
   :target: https://w3reality.github.io/three-laser-pointer/examples/demo-api/index.html
..
   :width: 640

Demos
-----

zzzzzzzzzzzz

Setup
-----

**Install**

.. code::
   
   $ npm install three-laser-pointer

**Loading**

Via script tags: use ``LaserPointer.Laser`` after

.. code::

   <script src="three.min.js"></script>
   <script src="dist/three-laser-pointer.min.js"></script>

Via the ES6 module system: use ``Laser`` after
   
.. code::

   import { Laser } from 'three-laser-pointer';

Usage
-----

- VR-like laser pointing:

.. code::

    // create and add a red laser in the scene
    var laser = new Laser({color: 0xff0000});
    scene.add(laser);

    var pt = new THREE.Vector3(0, 0, -1); // the target point

    // set the source point relative to the camera
    // with offset (0.3, -0.4, -0.2)
    laser.setSource(new THREE.Vector3(0.3, -0.4, -0.2), camera);

    // shoot the target from the source point
    laser.point(pt);

- VR-like laser pointing with raytracing against THREE.Mesh objects in the scene:
    
.. code::

    // create and add a green laser in the scene
    var laser = new Laser({color: 0x00ff00});
    scene.add(laser);

    var pt = new THREE.Vector3(0, 0, 1); // the target point

    // prepare an array of THREE.Mesh objects that interact with the laser
    var meshes = [...];

    // set the source point relative to the camera
    laser.setSource(new THREE.Vector3(0.3, -0.4, -0.2), camera);

    // shoot the target and raytrace against the meshes in the scene
    laser.pointWithRaytrace(pt, meshes);

API
---

**Laser**

- **constructor(options={})**

  - ``options.color`` **number** 0xff0000
  - ``options.maxPoints`` **number** 256
  - ``options.infLength`` **number** 9999

- **setSource(src, camera=null)**

  - ``src`` **THREE.Vector3**
  - ``camera`` **THREE.PerspectiveCamera**

- **getSource()**

  Returns **THREE.Vector3**

- **point(pt, color=null)**

  - ``pt`` **THREE.Vector3**
  - ``color`` **number**

- **pointWithRaytrace(pt, meshes=[], color=null, maxReflect=16)**

  - ``pt`` **THREE.Vector3**
  - ``meshes`` **Array<THREE.Mesh>**
  - ``color`` **number**
  - ``maxReflect`` **number**

- **getPoints()**

  Returns **Array<THREE.Vector3>** 

- **getMeshesHit()**

  Returns **Array<THREE.Mesh>**
     
- **updatePoints(arr, isFlatten=false)**

  - ``arr`` **Array<THREE.Vector3 | number>**
  - ``isFlatten`` **boolean**

- **clearPoints()**

  aaaaaaaa

- **static flattenPoints(arr)**

  - ``arr`` **Array<THREE.Vector3>**

  Returns **Array<number>**

- **raycastFromCamera(mx, my, width, height, cam, meshes)**

  - ``mx`` **number**
  - ``my`` **number**
  - ``width`` **number**
  - ``height`` **number**
  - ``cam`` **THREE.PerspectiveCamera**
  - ``meshes`` **Array<THREE.Mesh>**

  Returns **Array<Object>** threejs intersect objects

- **setColor(color)**

  - ``color`` **number** jjjjj

- **getColor()**

  Returns **number** An integer (0x000000 -- 0xffffff) encoding an RGB color.

   
Build
-----

.. code::

   $ npm install  # set up build tools
   $ npm run build  # generate module files in lib/
