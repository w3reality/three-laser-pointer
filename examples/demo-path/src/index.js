import DatGuiDefaults from 'dat-gui-defaults';
import * as THREE from 'three';
import Stats from 'stats.js';

import OrbitControls from 'three-es6-plugin/es6/OrbitControls';
import OBJLoader from 'three-es6-plugin/es6/OBJLoader';
import MTLLoader from 'three-es6-plugin/es6/MTLLoader';
import DDSLoader from 'three-es6-plugin/es6/DDSLoader';

import LaserPointer from '../../../src'; // for dev
console.log('LaserPointer:', LaserPointer);

// http://turfjs.org/getting-started/
import * as turf from '@turf/turf'


// begin -------- how to use DatGuiDefaults
if (0) {
    class DemoGui extends DatGuiDefaults {
        // override
        initGui(gui, data, params) {
            let config = data;
            let controller;
            controller = gui.addColor(params, 'color').name('Color');
            controller.onChange((value) => { // or onFinishChange
                config.color = value;
            });
            controller = gui.add(params, 'wireframe').name('Wireframe');
            controller.onChange((value) => {
                config.wireframe = value;
            });
            controller = gui.add(params, 'reset').name("Restore Defaults");
            controller.onChange((value) => {
                this.applyDefaults();
                Object.assign(config, params);
            });
        }
    }
    const config = { // defaults
        color: "0xff0000",
        wireframe: true,
    };
    const dg = new DemoGui(config);
    dg.setDefaults({
        color: config.color.replace("0x", "#"),
        wireframe: config.wireframe,
        reset: () => {},
    });
}
// end -------- how to use DatGuiDefaults

const canvas = document.getElementById("canvas");
const camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.1, 1000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({
    // alpha: true,
    canvas: canvas,
});

const controls = new OrbitControls(camera, renderer.domElement);

// https://stackoverflow.com/questions/29884485/threejs-canvas-size-based-on-container
const resizeCanvasToDisplaySize = (force=false) => {
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    // adjust displayBuffer size to match
    if (force || canvas.width != width || canvas.height != height) {
        // you must pass false here or three.js sadly fights the browser
        // console.log "resizing: #{canvas.width} #{canvas.height} -> #{width} #{height}"
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
};
resizeCanvasToDisplaySize(true); // first time

let data = (() => {
    let scene = new THREE.Scene();
    let material = new THREE.MeshPhongMaterial({
        color: 0xc0c0c0,
        // wireframe: true,
        side: THREE.FrontSide,
        // side: THREE.BackSide,
        // side: THREE.DoubleSide,
    });

    //======== add light
    // https://github.com/mrdoob/three.js/blob/master/examples/webvr_cubes.html
    scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );
    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light );

    //======== add walls
    let walls = new THREE.Mesh(
        new THREE.BoxGeometry( 8, 6.0, 4.5 ),
        new THREE.MeshPhongMaterial({
            color: 0xc0e0c0,
            side: THREE.BackSide,
            opacity: 1,
            transparent: true,
        }));
    walls.rotation.y = Math.PI / 6;
    walls.name = "walls";
    scene.add(walls);

    //======== for adding model (async)
    const addModel = (scene, cb) => {
        let onProgress = (xhr) => {
            if (xhr.lengthComputable) {
                let percentComplete = xhr.loaded / xhr.total * 100;
                console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
            }
        };
        let onError = (xhr) => {};

        // THREE.Loader.Handlers.add(/\.dds$/i, new DDSLoader());
        new MTLLoader()
            .setPath('../male02/')
            // .load('male02_dds.mtl', (materials) => { // for with DDSLoader()
            .load('male02.mtl', (materials) => {
                materials.preload();
                let objl = new OBJLoader()
                    .setMaterials(materials)
                    .setPath('../male02/')
                    .load('male02.obj', (object) => {
                        // console.log('object:', object);
                        object.name = "male02";
                        object.position.y = - 3.0;
                        object.children.forEach((mesh) => {
                            // https://stackoverflow.com/questions/24723471/three-js-scale-model-with-scale-set-or-increase-model-size
                            mesh.geometry.scale(0.05, 0.05, 0.05);
                            // mesh.scale.set(0.05, 0.05, 0.05);
                        })
                        scene.add(object);
                        cb(object);
                    }, onProgress, onError);
            });
    };

    // ======== for adding tiles (async)
    const addTiles = () => {
        // ~/Projects/peterqliu.github.io/bundle.js
        let origin = [36.2058, -112.4413];
        let radius = 5;
        let maxArea = radius*radius*2*1000000;
        const getBbox = (origin, radius) => {
            const reverseCoords = (coords) => {
                return [coords[1], coords[0]];
            };
            let northWest = turf.destination(
                turf.point(reverseCoords(origin)),
                radius, -45, {units: 'kilometers'}).geometry.coordinates;
            let southEast = turf.destination(
                turf.point(reverseCoords(origin)),
                radius, 135, {units: 'kilometers'}).geometry.coordinates;
            let testPolygon = {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                            ]
                        ]
                    }
                }]
            };
            testPolygon.features[0].geometry.coordinates[0] = [
                northWest,
                [southEast[0], northWest[1]],
                southEast,
                [northWest[0], southEast[1]],
                northWest
            ];
            console.log('testPolygon:', testPolygon);
            return {
                feature: testPolygon.features[0],
                northWest: northWest,
                southEast: southEast,
            };
        };
        let bbox = getBbox(origin, radius);
        console.log('bbox:', bbox);

    };
    console.log('zzzxx2211');
    addTiles();

    //======== add laser
    if (0) {
        let line = new LaserPointer.Line(32, 0x00ffff);
        line.updatePointsRandomWalk(32);
        scene.add(line);
    }

    let laser = new LaserPointer.Laser({
        color: 0xffffff
    });
    scene.add(laser);

    // register all meshes
    const meshes = [];
    addModel(scene, (model) => {  // add model async
        scene.traverse((node) => {
            // console.log('node.type:', node.type, node.name);
            if (node instanceof THREE.Mesh) {
                meshes.push(node);
            }
        });
    });


    const config = { // defaults
        color: "0xff0000",
        source: "VR-like",
        raytrace: true,
        maxReflect: 16,
    }
    return {
        scene: scene,
        pick: (mx, my, cam) => {
            let isect = laser.raycastFromCamera(
                mx, my, canvas.width, canvas.height, cam, meshes);
            if (isect !== null) {
                // console.log('isect:', isect);
                let pt = isect.point;

                if (config.source == "VR-like") {
                    laser.setSource(new THREE.Vector3(0.3, -0.4, -0.2), cam);
                } else {
                    laser.setSource(new THREE.Vector3(0, 0, 0));
                }

                let color = config.color.replace("#", "0x");
                if (config.raytrace) {
                    laser.pointWithRaytrace(pt, meshes, color, config.maxReflect);
                } else {
                    laser.point(pt, color);
                }
            } else {
                // console.log('no isects');
                laser.clearPoints();
            }
            // = 1(src point) + #(reflection points) + 1(end point)
            console.log('#points:', laser.getPoints().length);
        },
        config: config,
    };
})();

//---- begin render
const eventDrivenRender = 1;

let stats = new Stats();
document.body.appendChild(stats.dom);
let render = () => {
    stats.update();
    resizeCanvasToDisplaySize();
    renderer.render(data.scene, camera);
};

renderer.domElement.addEventListener('mousemove', (e) => {
    // https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/18053642#18053642
    let rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;
    // console.log('mouse:', mx, my, canvas.width, canvas.height);
    data.pick(mx, my, camera);
    if (eventDrivenRender) {
        render();
    }
});

if (eventDrivenRender) {
    render(); // first time
    controls.addEventListener('change', render);
} else {
    let stop = false;
    // setTimeout(() => { stop = true; }, 5*60*1000); // auto stop for dev
    let animate = () => {
        if (stop) {
            console.log('animate(): stopping');
            return;
        }
        requestAnimationFrame(animate);
        render();
    };
    animate();
}
//---- end render
