three-laser-pointer
===================


Laser object for three.js

Demo 1: https://w3reality.github.io/three-laser-pointer/examples/demo-api/index.html

Demo 2: https://w3reality.github.io/three-laser-pointer/examples/demo-terrains/dist/index.html

.. image:: 000https://w3reality.github.io/three-laser-pointer/examples/demo-api/laser.png
   :target: https://w3reality.github.io/three-laser-pointer/examples/demo-api/index.html
..
   :width: 640

Demos
-----

dddddddd

Setup
-----

**Install**

.. code::
   
   $ npm install three-laser-pointer

**Loading**

Via script tags: use ``LaserPointer.Laser`` after

.. code::

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

- **constructor(xxxxxxxxxxxx)**

- **setSource(src, camera=null)**

  - ``src`` **THREE.Vector3**
  - ``camera`` **THREE.PerspectiveCamera**

- **getSource()**

  Returns **THREE.Vector3**

- **point(pt, color=null)**

  - ``x``
  - ``x``

- **pointWithRaytrace(pt, meshes=[], color=null, maxReflect=16)**

  - ``x``
  - ``x``
  - ``x``
  - ``x``

- **getPoints()**

  Returns **Array<THREE.Vector3>** 

- **getMeshesHit()**

  Returns
     
- **updatePoints(arr, isFlatten=false)**

  - ``arr`` **Array<THREE.Vector3 | Array<number>>**
  - ``isFlatten`` **boolean**

- **clearPoints()**

  aaaaaaaa

- **static flattenPoints(arrPoints)**

  - ``arrPoints`` **Array<THREE.Vector3>**

  Returns **Array<number>**

- **raycastFromCamera(mx, my, width, height, cam, meshes, recursive=false)**

  - ``x``
  - ``x``
  - ``x``
  - ``x``
  - ``x``
  - ``x``
  - ``x``
    
- **setColor(color)**

  - ``color`` **number** jjjjj

- **getColor()**

  Returns **number** An integer (0x000000 -- 0xffffff) encoding an RGB color.

   
Build
-----

.. code::

   $ npm install  # set up build tools
   $ npm run build  # generate module files in lib/
