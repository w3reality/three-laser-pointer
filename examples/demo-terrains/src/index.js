import DatGuiDefaults from 'dat-gui-defaults';
import Stats from 'stats.js';

// import * as THREE from 'three';
//--------
// for three.terrain.js, load threejs via script tag in index.html
import 'three.terrain.js';
// console.log(THREE.Terrain);

import OrbitControls from 'three-es6-plugin/es6/OrbitControls';
import OBJLoader from 'three-es6-plugin/es6/OBJLoader';
import MTLLoader from 'three-es6-plugin/es6/MTLLoader';
import DDSLoader from 'three-es6-plugin/es6/DDSLoader';

// import LaserPointer from '../../../dist/three-laser-pointer.min'; // for prod
import LaserPointer from '../../../lib/three-laser-pointer'; // for dev
console.log('LaserPointer:', LaserPointer);

const canvas = document.getElementById("canvas");
const camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.001, 1000);
camera.position.set(0, 0, 0.5);
camera.up = new THREE.Vector3(0, 0, 1); // important for OrbitControls

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
    scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );
    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light );

    //======== add more
    scene.add(new THREE.AxesHelper(1));

    const cam = new THREE.PerspectiveCamera(60, 1, 0.01, 0.5);
    scene.add(new THREE.CameraHelper(cam));
    cam.position.set(0, 0, 2);
    cam.rotation.x = Math.PI / 4;
    cam.updateMatrixWorld();  // reflect pose change to CameraHelper

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
    const xS = 63, yS = 63;
    let terrainScene = THREE.Terrain({
        easing: THREE.Terrain.Linear,
        frequency: 2.5,
        // frequency: 0.25,
        heightmap: THREE.Terrain.DiamondSquare,
        material: new THREE.MeshBasicMaterial({color: 0x5566aa}),
        // maxHeight: 100,
        // minHeight: -100,
        maxHeight: 0.1,
        minHeight: -0.1,
        steps: 1,
        useBufferGeometry: false,
        xSegments: xS,
        // xSize: 1024,
        xSize: 1,
        ySegments: yS,
        // ySize: 1024,
        ySize: 1,
    });
    scene.add(terrainScene);

    // Optional:
    // Get the geometry of the terrain across which you want to scatter meshes
    const geoTerrain = terrainScene.children[0].geometry;
    // Add randomly distributed foliage
    let decoScene = THREE.Terrain.ScatterMeshes(geoTerrain, {
        // mesh: new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6)),
        mesh: new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.06, 0.03)),
        w: xS,
        h: yS,
        spread: 0.02,
        randomness: Math.random,
    });
    terrainScene.add(decoScene);

    //======== ======== ======== ========
    let webglExists = true;
    let useFPS = false;

    let skyLight = new THREE.DirectionalLight(0xe8bdb0, 1.5);
    skyLight.position.set(2950, 2625, -160); // Sun on the sky texture
    scene.add(skyLight);

    // let light = new THREE.DirectionalLight(0xc3eaff, 0.75);
    // light.position.set(-1, -0.5, -1);
    // scene.add(light);

    function buildTree() {
        var material = [
            new THREE.MeshLambertMaterial({ color: 0x3d2817 }), // brown
            new THREE.MeshLambertMaterial({ color: 0x2d4c1e }), // green
        ];

        var c0 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6, 1, true));
        c0.position.y = 6;
        var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 14, 8));
        c1.position.y = 18;
        var c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 13, 8));
        c2.position.y = 25;
        var c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 12, 8));
        c3.position.y = 32;

        var g = new THREE.Geometry();
        c0.updateMatrix();
        c1.updateMatrix();
        c2.updateMatrix();
        c3.updateMatrix();
        g.merge(c0.geometry, c0.matrix);
        g.merge(c1.geometry, c1.matrix);
        g.merge(c2.geometry, c2.matrix);
        g.merge(c3.geometry, c3.matrix);

        var b = c0.geometry.faces.length;
        for (var i = 0, l = g.faces.length; i < l; i++) {
            g.faces[i].materialIndex = i < b ? 0 : 1;
        }

        var m = new THREE.Mesh(g, material);

        m.scale.x = m.scale.z = 5;
        m.scale.y = 1.25;
        return m;
    }


    let thiz = {};

    var heightmapImage = new Image();
    heightmapImage.src = 'demo/img/heightmap.png';
    function Settings() {
        var that = thiz;
        var mat = new THREE.MeshBasicMaterial({color: 0x5566aa, wireframe: true});
        var gray = new THREE.MeshPhongMaterial({ color: 0x88aaaa, specular: 0x444455, shininess: 10 });
        var blend;
        var elevationGraph = document.getElementById('elevation-graph'),
        slopeGraph = document.getElementById('slope-graph'),
        analyticsValues = document.getElementsByClassName('value');
        var loader = new THREE.TextureLoader();
        loader.load('demo/img/sand1.jpg', function(t1) {
            t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
            sand = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(16384+1024, 16384+1024, 64, 64),
                new THREE.MeshLambertMaterial({map: t1})
            );
            sand.position.y = -101;
            sand.rotation.x = -0.5 * Math.PI;
            scene.add(sand);
            loader.load('demo/img/grass1.jpg', function(t2) {
                loader.load('demo/img/stone1.jpg', function(t3) {
                    loader.load('demo/img/snow1.jpg', function(t4) {
                        // t2.repeat.x = t2.repeat.y = 2;
                        blend = THREE.Terrain.generateBlendedMaterial([
                            {texture: t1},
                            {texture: t2, levels: [-80, -35, 20, 50]},
                            {texture: t3, levels: [20, 50, 60, 85]},
                            {texture: t4, glsl: '1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.z)'},
                            {texture: t3, glsl: 'slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2'}, // between 27 and 45 degrees
                        ]);
                        that.Regenerate();
                    });
                });
            });
        });
        thiz.easing = 'Linear';
        thiz.heightmap = 'PerlinDiamond';
        thiz.smoothing = 'None';
        thiz.maxHeight = 200;
        thiz.segments = webglExists ? 63 : 31;
        thiz.steps = 1;
        thiz.turbulent = false;
        thiz.size = 1024;
        thiz.sky = true;
        thiz.texture = webglExists ? 'Blended' : 'Wireframe';
        thiz.edgeDirection = 'Normal';
        thiz.edgeType = 'Box';
        thiz.edgeDistance = 256;
        thiz.edgeCurve = 'EaseInOut';
        thiz['width:length ratio'] = 1.0;
        thiz['Flight mode'] = useFPS;
        thiz['Light color'] = '#' + skyLight.color.getHexString();
        thiz.spread = 60;
        thiz.scattering = 'PerlinAltitude';
        thiz.after = function(vertices, options) {
            if (that.edgeDirection !== 'Normal') {
                (that.edgeType === 'Box' ? THREE.Terrain.Edges : THREE.Terrain.RadialEdges)(
                    vertices,
                    options,
                    that.edgeDirection === 'Up' ? true : false,
                    that.edgeType === 'Box' ? that.edgeDistance : Math.min(options.xSize, options.ySize) * 0.5 - that.edgeDistance,
                    THREE.Terrain[that.edgeCurve]
                );
            }
        };
        window.rebuild = thiz.Regenerate = function() {
            var s = parseInt(that.segments, 10),
            h = that.heightmap === 'heightmap.png';
            var o = {
                after: that.after,
                easing: THREE.Terrain[that.easing],
                heightmap: h ? heightmapImage : (that.heightmap === 'influences' ? customInfluences : THREE.Terrain[that.heightmap]),
                material: that.texture == 'Wireframe' ? mat : (that.texture == 'Blended' ? blend : gray),
                maxHeight: that.maxHeight - 100,
                minHeight: -100,
                steps: that.steps,
                stretch: true,
                turbulent: that.turbulent,
                useBufferGeometry: false,
                xSize: that.size,
                ySize: Math.round(that.size * that['width:length ratio']),
                xSegments: s,
                ySegments: Math.round(s * that['width:length ratio']),
                _mesh: typeof terrainScene === 'undefined' ? null : terrainScene.children[0], // internal only
            };
            scene.remove(terrainScene);
            terrainScene = THREE.Terrain(o);
            applySmoothing(that.smoothing, o);
            scene.add(terrainScene);
            skyDome.visible = sand.visible = water.visible = that.texture != 'Wireframe';
            var he = document.getElementById('heightmap');
            if (he) {
                o.heightmap = he;
                THREE.Terrain.toHeightmap(terrainScene.children[0].geometry.vertices, o);
            }
            that['Scatter meshes']();
            lastOptions = o;

            var analysis = THREE.Terrain.Analyze(terrainScene.children[0], o),
            deviations = getSummary(analysis),
            prop;
            analysis.elevation.drawHistogram(elevationGraph, 10);
            analysis.slope.drawHistogram(slopeGraph, 10);
            for (var i = 0, l = analyticsValues.length; i < l; i++) {
                prop = analyticsValues[i].getAttribute('data-property').split('.');
                var analytic = analysis[prop[0]][prop[1]];
                if (analyticsValues[i].getAttribute('class').split(/\s+/).indexOf('percent') !== -1) {
                    analytic *= 100;
                }
                analyticsValues[i].textContent = cleanAnalytic(analytic);
            }
            for (prop in deviations) {
                if (deviations.hasOwnProperty(prop)) {
                    document.querySelector('.summary-value[data-property="' + prop + '"]').textContent = deviations[prop];
                }
            }
        };

        function altitudeProbability(z) {
            if (z > -80 && z < -50) return THREE.Terrain.EaseInOut((z + 80) / (-50 + 80)) * that.spread * 0.002;
            else if (z > -50 && z < 20) return that.spread * 0.002;
            else if (z > 20 && z < 50) return THREE.Terrain.EaseInOut((z - 20) / (50 - 20)) * that.spread * 0.002;
            return 0;
        }
        thiz.altitudeSpread = function(v, k) {
            return k % 4 === 0 && Math.random() < altitudeProbability(v.z);
        };
        var mesh = buildTree();
        var decoMat = mesh.material.map(function(mat) {
            return mat.clone();
        }); // new THREE.MeshBasicMaterial({color: 0x229966, wireframe: true});
        decoMat[0].wireframe = true;
        decoMat[1].wireframe = true;
        thiz['Scatter meshes'] = function() {
            var s = parseInt(that.segments, 10),
            spread,
            randomness;
            var o = {
                xSegments: s,
                ySegments: Math.round(s * that['width:length ratio']),
            };
            if (that.scattering === 'Linear') {
                spread = that.spread * 0.0005;
                randomness = Math.random;
            }
            else if (that.scattering === 'Altitude') {
                spread = that.altitudeSpread;
            }
            else if (that.scattering === 'PerlinAltitude') {
                spread = (function() {
                    var h = THREE.Terrain.ScatterHelper(THREE.Terrain.Perlin, o, 2, 0.125)(),
                    hs = THREE.Terrain.InEaseOut(that.spread * 0.01);
                    return function(v, k) {
                        var rv = h[k],
                        place = false;
                        if (rv < hs) {
                            place = true;
                        }
                        else if (rv < hs + 0.2) {
                            place = THREE.Terrain.EaseInOut((rv - hs) * 5) * hs < Math.random();
                        }
                        return Math.random() < altitudeProbability(v.z) * 5 && place;
                    };
                })();
            }
            else {
                spread = THREE.Terrain.InEaseOut(that.spread*0.01) * (that.scattering === 'Worley' ? 1 : 0.5);
                randomness = THREE.Terrain.ScatterHelper(THREE.Terrain[that.scattering], o, 2, 0.125);
            }
            var geo = terrainScene.children[0].geometry;
            terrainScene.remove(decoScene);
            decoScene = THREE.Terrain.ScatterMeshes(geo, {
                mesh: mesh,
                w: s,
                h: Math.round(s * that['width:length ratio']),
                spread: spread,
                smoothSpread: that.scattering === 'Linear' ? 0 : 0.2,
                randomness: randomness,
                maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
                maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
            });
            if (decoScene) {
                if (that.texture == 'Wireframe') {
                    decoScene.children[0].material = decoMat;
                }
                else if (that.texture == 'Grayscale') {
                    decoScene.children[0].material = gray;
                }
                terrainScene.add(decoScene);
            }
        };
    } // end of Settings()
    var settings = new Settings();
    console.log('settings:', settings);
    console.log('thiz:', thiz);
    //======== ======== ======== ========


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
