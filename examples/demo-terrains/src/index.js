import DatGuiDefaults from 'dat-gui-defaults';
import Stats from 'stats.js';

// import * as THREE from 'three';
// for three.terrain.js, load threejs via script tag in index.html
import TerrainHelper from './terrain-helper.js';

import OrbitControls from 'three-es6-plugin/es6/OrbitControls';
import OBJLoader from 'three-es6-plugin/es6/OBJLoader';
import MTLLoader from 'three-es6-plugin/es6/MTLLoader';
import DDSLoader from 'three-es6-plugin/es6/DDSLoader';

// import LaserPointer from '../../../dist/three-laser-pointer.min'; // for prod
import LaserPointer from '../../../lib/three-laser-pointer'; // for dev
console.log('LaserPointer:', LaserPointer);

const canvas = document.getElementById("canvas");
const camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.001, 10000);
camera.position.set(0, 0, 0.5);
// camera.up = new THREE.Vector3(0, 0, 1); // important for OrbitControls
camera.up = new THREE.Vector3(0, 1, 0); // important for OrbitControls

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

const appData = (() => {
    const scene = new THREE.Scene();

    //======== add light
    // https://github.com/mrdoob/three.js/blob/master/examples/webvr_cubes.html
    // scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );
    // const light = new THREE.DirectionalLight( 0xffffff );
    // light.position.set( 1, 1, 1 ).normalize();
    // scene.add( light );

    //======== add more
    scene.add(new THREE.AxesHelper(1));

    // const cam = new THREE.PerspectiveCamera(60, 1, 0.01, 0.5);
    // scene.add(new THREE.CameraHelper(cam));
    // cam.position.set(0, 0, 2);
    // cam.rotation.x = Math.PI / 4;
    // cam.updateMatrixWorld();  // reflect pose change to CameraHelper

    const walls = new THREE.Mesh(
        new THREE.BoxGeometry( 1, 1, 1 ),
        new THREE.MeshPhongMaterial({
            color: 0xc0e0c0,
            side: THREE.BackSide,
            wireframe: true,
            opacity: 1,
            transparent: true,
        }));
    // walls.rotation.y = Math.PI / 6;
    walls.name = "walls";
    scene.add(walls);

    //======== add laser
    if (0) {
        const line = new LaserPointer.Line(32, 0x00ffff);
        line.updatePointsRandomWalk(32);
        scene.add(line);
    }

    const laser = new LaserPointer.Laser({
        color: 0xffffff,
    });
    scene.add(laser);

    const _render = () => {
        renderer.render(scene, camera);
    };

    //======== add terrain simple

    const thelper = new TerrainHelper({
        xSize: 1.0,
        ySize: 1.0,
        maxHeight: 0.1,
        minHeight: -0.1,
    });

    TerrainHelper.getBlendedMaterial((blend) => {
        // TerrainHelper.loadHeightmapImage('./heightmap.png', (img) => {
        TerrainHelper.loadHeightmapImage('./heightmapMods.png', (img) => {
            // const terrainScene = thelper.getTerrainScene(blend); // use auto-generated heightmap
            const terrainScene = thelper.getTerrainScene(blend, img);
            console.log('terrainScene:', terrainScene);
            const terrain = terrainScene.children[0];
            // terrain.rotation.x = 0.5 * Math.PI; // in case up-vector is (0,0,1)
            scene.add(terrainScene);

            // Add randomly distributed foliage across the terrain geometry
            terrainScene.add(thelper.getScatterMeshesScene(terrain.geometry));

            _render(); // first time
        });
    });

    // set up other world components
    TerrainHelper.getSkyDome((skyDome) => {
        scene.add(skyDome);
    });
    scene.add(TerrainHelper.getWater());
    scene.add(TerrainHelper.getSunLight());
    scene.add(TerrainHelper.getSkyLight());


    // for registering meshes to interact with
    const meshesInteraction = [];

    return {
        scene: scene,
        render: _render,
        pick: (mx, my, cam) => {
            let isect = laser.raycastFromCamera(
                mx, my, canvas.width, canvas.height, cam, meshesInteraction);
            if (isect !== null) {
                // console.log('isect:', isect);
                let pt = isect.point;
                // console.log('pt:', pt);

                if (1) {
                    // laser.setSource(new THREE.Vector3(0.3, -0.4, -0.2), cam);
                    laser.setSource(new THREE.Vector3(0.3, -0.4, 2.5), cam);
                } else {
                    laser.setSource(new THREE.Vector3(0, 0, 0));
                }

                let color = guiData.color.replace("#", "0x");
                if (1) {
                    laser.pointWithRaytrace(pt, meshesInteraction, color, 16);
                } else {
                    laser.point(pt, color);
                }
            } else {
                // console.log('no isects');
                laser.clearPoints();
            }
            // = 1(src point) + #(reflection points) + 1(end point)
            // console.log('#points:', laser.getPoints().length);
        },
        clearPick: () => {
            laser.clearPoints();
        },
    };
})(); // end of appData init

const updateVis = (vis) => {
    appData.scene.traverse((node) => {
        if (!(node instanceof THREE.Mesh) &&
            !(node instanceof THREE.Line)) return;

        // console.log(node.name);
        if (!node.name) return;

        if (node.name.startsWith('dem-rgb-')) {
            // console.log(`updating vis of ${node.name}`);
            if (vis === "Satellite" && node.name in appData.satelliteMats) {
                node.material = appData.satelliteMats[node.name];
                node.material.needsUpdate = true;
                node.visible = true;
            } else if (vis === "Wireframe") {
                node.material = appData.wireframeMat;
                node.material.needsUpdate = true;
                node.visible = true;
            } else if (vis === "Contours") {
                node.visible = false;
            }
        } else if (node.name.startsWith('dem-vec-')) {
            node.visible = vis === "Contours";
        }
    });
    appData.render();
};
const onChangeVis = (value) => {
    console.log('vis:', value);
    if (value === 'Contours') {
        appData.loadVectorDem(() => {
            updateVis(value);
        });
    } else {
        updateVis(value);
    }
};

// begin render stuff
let stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
let render = () => {
    stats.update();
    resizeCanvasToDisplaySize();
    appData.render();
};

let stopAnim = true;
const animate = () => {
    if (stopAnim) {
        console.log('animate(): stopping');
        return;
    }
    requestAnimationFrame(animate);
    render();
};
const onChangeEvRender = (value) => {
    if (value) {
        console.log('onChangeEvRender(): stopping anim...');
        stopAnim = true;
    } else {
        console.log('onChangeEvRender(): starting anim...');
        stopAnim = false;
        animate();
    }
};
// end render stuff

class Gui extends DatGuiDefaults {
    // override
    initGui(gui, data, params) {
        let controller;
        controller = gui.add(params, 'vis',
            ["Satellite", "Wireframe", "Contours"]).name('Visualization');
        controller.onChange((value) => {
            onChangeVis(value);
            data.vis = value;
        });
        controller = gui.add(params, 'laser').name('Laser');
        controller.onChange((value) => {
            data.laser = value;
        });
        controller = gui.addColor(params, 'color').name('Laser Color');
        controller.onChange((value) => { // or onFinishChange
            data.color = value;
        });
        controller = gui.add(params, 'evRender').name('evRender');
        controller.onChange((value) => {
            onChangeEvRender(value);
            data.evRender = value;
        });
        controller = gui.add(params, 'reset').name("Restore Defaults");
        controller.onChange((value) => {
            thiz.applyDefaults();
            onChangeVis(params.vis);
            onChangeEvRender(params.evRender);

            Object.assign(data, params);
        });
    }
}

const guiData = { // defaults
    vis: "Satellite",
    laser: false,
    color: "0xff0000",
    evRender: true,
};
const dg = new Gui(guiData);
dg.setDefaults({
    vis: guiData.vis,
    laser: guiData.laser,
    color: guiData.color.replace("0x", "#"),
    evRender: guiData.evRender,
    reset: () => {},
});
dg.gui.close();

renderer.domElement.addEventListener('mousemove', (e) => {
    if (guiData.laser) {
        // https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/18053642#18053642
        let rect = canvas.getBoundingClientRect();
        let mx = e.clientX - rect.left;
        let my = e.clientY - rect.top;
        // console.log('mouse:', mx, my, canvas.width, canvas.height);
        appData.pick(mx, my, camera);
    } else {
        appData.clearPick();
    }

    if (guiData.evRender) {
        render();
    }
});

if (guiData.evRender) {
    render(); // first time
    controls.addEventListener('change', render);
}
