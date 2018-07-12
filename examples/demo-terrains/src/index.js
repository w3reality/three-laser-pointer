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

import $ from 'jquery';
// console.log('$:', $);

const canvas = document.getElementById("canvas");
const camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.001, 10000);
// camera.position.set(-0.1, 0.15, 0.5);
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
    const _render = () => {
        renderer.render(scene, camera);
    };

    //======== add light
    // https://github.com/mrdoob/three.js/blob/master/examples/webvr_cubes.html
    // scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );
    // const light = new THREE.DirectionalLight( 0xffffff );
    // light.position.set( 1, 1, 1 ).normalize();
    // scene.add( light );

    // const cam = new THREE.PerspectiveCamera(60, 1, 0.01, 0.5);
    // scene.add(new THREE.CameraHelper(cam));
    // cam.position.set(0, 0, 2);
    // cam.rotation.x = Math.PI / 4;
    // cam.updateMatrixWorld();  // reflect pose change to CameraHelper

    //======== add more
    scene.add(new THREE.AxesHelper(1));

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
    if (0) { // yellow thunder
        const _line = new LaserPointer.Line(32, 0xffff00);
        _line.updatePointsRandomWalk(32);
        scene.add(_line);
    }

    const _laser = new LaserPointer.Laser({
        color: 0xff0000,
    });
    scene.add(_laser);

    //======== add terrain
    const thelper = new TerrainHelper({
        xSize: 1.0,
        ySize: 1.0,
        maxHeight: 0.1,
        minHeight: -0.1,
    });

    // for registering meshes to interact with
    let meshesInteraction = [];

    TerrainHelper.getBlendedMaterial((blend) => {
        // TerrainHelper.loadHeightmapImage('./heightmap.png', (img) => {
        TerrainHelper.loadHeightmapImage('./heightmapMods.png', (img) => {
            // const terrainScene = thelper.getTerrainScene(blend); // use auto-generated heightmap
            const terrainScene = thelper.getTerrainScene(blend, img);
            console.log('terrainScene:', terrainScene);
            const terrain = terrainScene.children[0];
            terrain.name = "terrain";
            // terrain.rotation.x = 0.5 * Math.PI; // in case up-vector is (0,0,1)
            meshesInteraction.push(terrain);

            // Add randomly distributed foliage across the terrain geometry
            const scattered = thelper.getScatterMeshesScene(terrain.geometry, false);
            const scatterScene = scattered.scene;
            // _scatteredMat = scattered.material;
            console.log('scatterScene:', scatterScene);
            terrainScene.add(scatterScene);

            // scatterScene.children[10].material = new THREE.MeshBasicMaterial({color: 0x5566aa, wireframe: true});
            meshesInteraction = meshesInteraction.concat(scatterScene.children);
            console.log('meshesInteraction:', meshesInteraction);

            scene.add(terrainScene);
            _render();
        });
    });

    // set up other world components
    TerrainHelper.getSkyDome((skyDome) => {
        scene.add(skyDome);
        _render();
    });
    scene.add(TerrainHelper.getWater());
    scene.add(TerrainHelper.getSunLight());
    scene.add(TerrainHelper.getSkyLight());

    const _wireframeMat = new THREE.MeshBasicMaterial({color: 0x5566aa, wireframe: true});

    const $msg = $('#msg');
    const toCoords = (vec, nFloats=3) => {
        return `(${vec.x.toFixed(nFloats)}, ${vec.y.toFixed(nFloats)}, ${vec.z.toFixed(nFloats)})`;
    };
    const toCoordsArray = vecArray => {
        return vecArray.map(vec => toCoords(vec)).join(', ');
    };
    const showRaytraceStats = (laser) => {
        let refPoints = laser.getPoints();
        let srcPt = refPoints.shift();
        let infPt = refPoints.pop();
        // console.log('refPoints:', refPoints);
        $msg.empty();
        if (refPoints.length > 0) {
            $msg.append(`<div>laser source: ${toCoords(srcPt)}</div>`);
            $msg.append(`<div># reflections: ${refPoints.length}</div>`);
            $msg.append(`<div>reflection points: ${toCoordsArray(refPoints)}</div>`);
            // $msg.append(`<div>reflection meshes: ${laser.getMeshesHit().map(mesh => mesh.uuid).join(', ')}</div>`);
        }
    };
    const showMeasureStats = (markPair) => {
        $msg.empty();
        if (markPair.length === 1) {
            $msg.append(`<div>points: ${toCoords(markPair[0])} -> </div>`);
        } else if (markPair.length === 2) {
            let [p0, p1] = markPair;
            $msg.append(`<div>points: ${toCoords(p0)} -> ${toCoords(p1)}</div>`);
            $msg.append(`<div>length: ${p0.distanceTo(p1).toFixed(3)}</div>`);
        }
    };

    const _laserMarkTmp = new LaserPointer.Laser({maxPoints: 2});
    scene.add(_laserMarkTmp);
    let markPair = []; // now markPair.length === 0
    let _laserMarkColor;

    console.log('scene:', scene);
    return {
        scene: scene,
        render: _render,
        mark: (mx, my) => {
            if (guiData.laserMode !== 'Measure') return;

            let isect = _laser.raycastFromCamera(
                mx, my, canvas.width, canvas.height, camera, meshesInteraction);
            if (isect !== null) {
                // console.log('isect:', isect);
                let pt = isect.point;
                console.log('mark pt:', pt);
                if (markPair.length === 1) {
                    markPair.push(pt); // now markPair.length === 2
                    // console.log('registering markPair:', markPair);
                    let laser = new LaserPointer.Laser({
                        maxPoints: 2,
                        color: _laserMarkColor,
                    });
                    laser.updatePoints(markPair);
                    scene.add(laser);
                } else { // when markPair.length === 0 or 2
                    markPair = [pt,]; // now markPair.length === 1
                    // get a new random color
                    _laserMarkColor = Math.floor(0xffffff * Math.random());
                    console.log('new color:', _laserMarkColor);
                }
                // console.log('markPair:', markPair);
            }

            if (guiData.evRender) render();

            showMeasureStats(markPair);
        },
        markCancel: () => {
            markPair = []; // now markPair.length === 0
            showMeasureStats(markPair);

            _laserMarkTmp.visible = false;
            if (guiData.evRender) render();
        },
        pick: (mx, my) => {
            if (guiData.laserMode === 'None') {
                _laser.clearPoints();
                return;
            }

            let isect = _laser.raycastFromCamera(
                mx, my, canvas.width, canvas.height, camera, meshesInteraction);
            if (isect !== null) {
                // console.log('isect:', isect);
                let pt = isect.point;
                // console.log('pick pt:', pt);

                let ptSrc = new THREE.Vector3(0.003, -0.004, 0.002);
                if (guiData.laserMode === "Raytrace") {
                    _laser.setSource(ptSrc, camera);
                    _laser.pointWithRaytrace(pt, meshesInteraction, 0x00ffff, 16);

                    let meshesHit = _laser.getMeshesHit();
                    // console.log('meshesHit:', meshesHit);
                    meshesHit.forEach((mesh) => {
                        if (mesh.name !== 'terrain') {
                            mesh.material = _wireframeMat;
                        }
                    });
                } else if (guiData.laserMode === "Measure") {
                    _laser.setSource(ptSrc, camera);
                    _laser.point(pt, 0xffffff);

                    if (markPair.length === 1) {
                        _laserMarkTmp.setSource(markPair[0]);
                        _laserMarkTmp.point(pt, _laserMarkColor);
                        _laserMarkTmp.visible = true;
                    } else {
                        _laserMarkTmp.visible = false;
                    }
                }
            } else {
                // console.log('no isects');
                _laser.clearPoints();
            }

            if (guiData.evRender) render();

            // = 1(src point) + #(reflection points) + 1(end point)
            // console.log('#points:', _laser.getPoints().length);
            if (guiData.laserMode === "Raytrace") showRaytraceStats(_laser);
        },
    };
})(); // end of appData init

const onChangeVis = value => {
    console.log('vis:', value);
    appData.scene.traverse((node) => {
        if (!node instanceof THREE.Mesh) return;

        // console.log(node.name);
        if (!node.name) return;

        if (node.name === "terrain") {
            switch (value) {
                case "Textured":
                    node.material.wireframe = false;
                    node.material.needsUpdate = true;
                    node.visible = true;
                    break;
                case "Wireframe":
                    node.material.wireframe = true;
                    node.material.needsUpdate = true;
                    node.visible = true;
                    break;
                case "None":
                    node.visible = false;
            }
        }
    });
    appData.render();
};

const onChangeLaserMode = value => {
    //...
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

        controller = gui.add(params, 'laserMode',
            ["Raytrace", "Measure", "None"]).name('Laser Mode');
        controller.onChange((value) => {
            onChangeLaserMode(value);
            data.laserMode = value;
        });

        // controller = gui.addColor(params, 'color').name('Laser Color');
        // controller.onChange((value) => { // or onFinishChange
        //     data.color = value;
        // });

        controller = gui.add(params, 'vis',
            ["Textured", "Wireframe", "None"]).name('Terrain');
        controller.onChange((value) => {
            onChangeVis(value);
            data.vis = value;
        });

        controller = gui.add(params, 'evRender').name('Passive Render');
        controller.onChange((value) => {
            onChangeEvRender(value);
            data.evRender = value;
        });

        controller = gui.add(params, 'reset').name("Reset");
        controller.onChange((value) => {
            this.applyDefaults();
            onChangeVis(params.vis);
            onChangeLaserMode(params.laserMode);
            onChangeEvRender(params.evRender);

            Object.assign(data, params);
        });

        controller = gui.add(params, 'sourceCode').name("Source Code");
        controller.onChange((value) => {
            window.location.href = "https://github.com/w3reality/three-laser-pointer/tree/master/examples/demo-terrains";
        });
    }
}

const guiData = { // defaults
    vis: "Textured",
    // laserMode: "Raytrace",
    laserMode: "Measure",
    // color: "0x00ffff",
    evRender: true,
};
const dg = new Gui(guiData);
dg.setDefaults({
    vis: guiData.vis,
    laserMode: guiData.laserMode,
    // color: guiData.color.replace("0x", "#"),
    evRender: guiData.evRender,
    reset: () => {},
    sourceCode: () => {},
});
// dg.gui.close();

const getMouseCoords = e => {
    // https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/18053642#18053642
    let rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;
    // console.log('getMouseCoords():', mx, my, canvas.width, canvas.height);
    return [mx, my];
};

// https://stackoverflow.com/questions/6042202/how-to-distinguish-mouse-click-and-drag
let isDragging = false;
renderer.domElement.addEventListener("mousedown", e => {
    isDragging = false;
}, false);
renderer.domElement.addEventListener("mousemove", e => {
    isDragging = true;
    let coords = getMouseCoords(e);
    appData.pick(coords[0], coords[1]);
}, false);
renderer.domElement.addEventListener("mouseup", e => {
    // console.log('e:', e);
    if (isDragging) {
        console.log("mouseup: drag");
        // nop
    } else {
        console.log("mouseup: click");
        if (e.button === 0) {
            let coords = getMouseCoords(e);
            appData.mark(coords[0], coords[1]);
        } else if (e.button === 2) {
            appData.markCancel();
        }
    }
}, false);

if (guiData.evRender) {
    render(); // first time
    controls.addEventListener('change', render);
}
