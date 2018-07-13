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

Demo
----

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

  Create a laser object with optional parameters.  For example,
  ``new Laser({color: 0x00ff00, maxPoints: 16})`` creates a green laser object
  that consists of maximally 15 (=16-1) line segments.

  - ``options.color``\=0xff0000 **number (integer)** An integer (0x000000 - 0xffffff) encoding an RGB color.
  - ``options.maxPoints``\=256 **number (integer)** The max number of 3D points that consist of the laser.
  - ``options.infLength``\=9999.0 **number** The length of the last laser segment when raytracing goes to an infinity point.

- **setSource(src, camera=null)**

  Set the values of ``src`` to the source point of the laser.  When ``camera``
  is provided, ``src`` is regarded as relative to the camera (i.e. camera
  coordinates).  If not, ``src`` is interpreted as world coordinates.

  - ``src`` **THREE.Vector3**
  - ``camera`` **THREE.PerspectiveCamera**

- **getSource()**

  Returns a new vector instance with values corresponding to the current source
  point set.
  
  Returns **THREE.Vector3**

- **point(pt, color=null)**

  Shoot ``pt`` by the laser rendering a line segment between the source point
  of the laser and ``pt``.  Optionally, ``color`` can be specified.
  
  - ``pt`` **THREE.Vector3** The target point to shoot.
  - ``color`` **number (integer)** 0x000000 - 0xffffff

- **pointWithRaytrace(pt, meshes=[], color=null, maxReflect=16)**

  Shoot ``pt`` by the laser with raytracing enabled.  Ray reflections by
  provided ``meshes`` are computed and rendered up to ``maxReflect`` times.
  (Note: regardless of ``maxReflect``, the number of reflections is also
  bounded less than or equal to ``maxPoints-2``.)
  

  - ``pt`` **THREE.Vector3** The target point to shoot.
  - ``meshes`` **Array<THREE.Mesh>**
  - ``color`` **number (integer)** 0x000000 - 0xffffff
  - ``maxReflect`` **number (integer)** The max number of reflections considered.

- **getPoints()**

  Get an array of the points (copied) that consist of the laser.
  
  Returns **Array<THREE.Vector3>** 

- **getMeshesHit()**

  Get an array of the meshes that are hit by the laser after calling
  ``pointWithRaytrace()``.

  Returns **Array<THREE.Mesh>**
     
- **updatePoints(arr, isFlatten=false)**

  Update (by overriding) the points that consist of the laser.  If
  ``isFlatten`` is ``true``, ``arr`` can be a flatten **number** array, i.e.
  (``[x0, y0, z0, x1, y1, z1, ...]``).
  
  - ``arr`` **Array<THREE.Vector3 | number>**
  - ``isFlatten`` **boolean**

- **clearPoints()**

  Clear the points that consist of the laser.  Thereafter, ``getPoints()``
  will return ``[]``.

- **raycastFromCamera(mx, my, width, height, camera, meshes)**

  A utility method that casts a mouse ray to ``meshes`` provided.  If there are
  intersects, it returns the nearest intersect from the camera.  Otherwise, it
  returns ``null``.
  
  - ``mx`` **number** Coordinate x of a canvas point.
  - ``my`` **number** Coordinate y of a canvas point.
  - ``width`` **number** Canvas width.
  - ``height`` **number** Canvas height.
  - ``camera`` **THREE.PerspectiveCamera**
  - ``meshes`` **Array<THREE.Mesh>** An array of meshes to test raycasting with.

  Returns **Object | null** An `intersect object <https://threejs.org/docs/#api/core/Raycaster.intersectObject>`__ of three.js.

- **setColor(color)**

  Set the RGB color of the laser.

  - ``color`` **number (integer)** An integer (0x000000 - 0xffffff) encoding an RGB color.

- **getColor()**

  Get the RGB color of the laser.

  Returns **number (integer)** An integer (0x000000 - 0xffffff) encoding an RGB color.

Build
-----

.. code::

   $ npm install  # set up build tools
   $ npm run build  # generate module files in lib/
