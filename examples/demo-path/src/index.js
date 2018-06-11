import DatGuiDefaults from 'dat-gui-defaults';
import * as THREE from 'three';
import Stats from 'stats.js';

import OrbitControls from 'three-es6-plugin/es6/OrbitControls';
import OBJLoader from 'three-es6-plugin/es6/OBJLoader';
import MTLLoader from 'three-es6-plugin/es6/MTLLoader';
import DDSLoader from 'three-es6-plugin/es6/DDSLoader';

import LaserPointer from '../../../src'; // for dev
console.log('LaserPointer:', LaserPointer);

import env from './env.js';
import * as turf from '@turf/turf'; // http://turfjs.org/getting-started/
// console.log('turf:', turf);
import cover from '@mapbox/tile-cover';
import xhr from 'xhr';
import Pbf from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';
import uniq from 'uniq';


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

    const processTile = (tile, zoompos, geojson, bottomTiles) => {
        //populate geoJSON
        for (let i = 0; i < tile.layers.contour.length; i++) {
            // convert each feature (within #population) into a geoJSON polygon,
            // and push it into our variable
            let feature = tile.layers.contour.feature(i)
                .toGeoJSON(zoompos[0], zoompos[1], zoompos[2]);
            if (i === 0) bottomTiles.push(feature);

            // break multigons into multiple polygons
            if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach((polygon) => {
                    let feat = {
                        type: 'Feature',
                        properties: {ele: feature.properties.ele},
                        geometry: {type: 'Polygon', coordinates: polygon},
                    };
                    geojson.features.push(feat);
                });
            } else { // single polygons can be pushed in as-is
                geojson.features.push(feature);
            }
        }
    };
    const getEleList = (geojson) => {
        let mapper = (feature) => { return feature.properties.ele; };
        return uniq(geojson.features.map(mapper))
            .sort((a,b) => { return a-b; });
    };
    const addBottomEle = (geojson, bottomTiles, eleList) => {
        bottomTiles.forEach((bottom) => {
            let tileBottomEle = bottom.properties.ele;
            for (let k = eleList[0]; k < tileBottomEle; k += 10) {
                // console.log('k:', k);
                geojson.features.push({
                    type: "Feature",
                    geometry: bottom.geometry,
                    properties: {ele: k},
                });
            }
        });
    };
    const getContours = (eleList, geojson, polygon) => {
        let contours = [];

        // iterate through elevations, and merge polys of the same elevation
        for (let x = 0; x < eleList.length; x++) {
            let currentElevation = eleList[x];
            let elevationPolys = geojson.features.filter((feature) => {
                return feature.properties.ele === currentElevation;
            });

            // merge between tiles
            try {
                // this was commented...
                // let mergedElevationPoly = tbuffer(
                //     turf.featureCollection(elevationPolys), 0, 'miles').features[0];
                //========
                // this was being used...
                // let mergedElevationPoly = turf.merge(
                //     turf.featureCollection(elevationPolys));
                //========
                // - turf.merge is deprecated, so...
                // - https://github.com/turf-junkyard/turf-merge
                //     This module is now deprecated in favor of using
                //     the turf-union module repeatedly on an array.
                // - https://gis.stackexchange.com/questions/243460/turf-js-union-with-array-of-features
                // console.log('feat collection:', turf.featureCollection(elevationPolys));
                let mergedElevationPoly = turf.union.apply(
                    this, turf.featureCollection(elevationPolys).features);

                // trim to desired search area
                mergedElevationPoly = turf.intersect(
                    polygon, mergedElevationPoly);

                if (mergedElevationPoly) {
                    let contourArea = turf.area(mergedElevationPoly.geometry);
                    // FIXME: ???????? ???????? ???????? ????????
                    // L.mapbox.featureLayer().setGeoJSON(mergedElevationPoly).addTo(map);

                    contours.push({
                        'geometry': mergedElevationPoly,
                        'ele': currentElevation,
                        'area': contourArea,
                    });
                }
            } catch (error) { // on merge fail, insert the previous contour again and skip
                console.log('merge failed at elevation '+currentElevation);
                console.log(error.message);
            }
        }

        return contours;
    };

    // This function is an adaptation of
    // https://github.com/peterqliu/peterqliu.github.io/bundle.js
    const addTiles = () => {
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
            let polygon = testPolygon.features[0];
            polygon.geometry.coordinates[0] = [
                northWest,
                [southEast[0], northWest[1]],
                southEast,
                [northWest[0], southEast[1]],
                northWest,
            ];
            // console.log('testPolygon:', testPolygon);
            return {
                feature: polygon,
                northWest: northWest,
                southEast: southEast,
            };
        };
        let bbox = getBbox(origin, radius);
        console.log('bbox:', bbox);

        // given the isochrone polygon,
        // identify the relevant tiles (via tile-cover),
        // request those tile pbfs, translate into geoJSONs
        const getBlocks = (polygon) => {
            let limits = {
                min_zoom: 14,
                max_zoom: 14,
            };
            let tilesCovered = cover.tiles(polygon.geometry, limits);
            console.log(`about to download ${tilesCovered.length} tiles`);

            let geojson = {
                type: "FeatureCollection",
                features: [],
            };
            let queryCount = 0;
            let bottomTiles = [];
            // for each tile triplet (identified as z-x-y),
            // download corresponding PBF and convert to geoJSON
            const api = 'https://a.tiles.mapbox.com/v4/mapbox.mapbox-terrain-v2';
            const token = `${env.token}`;
            console.log('token:', token);

            let prevMilestone = Date.now();

            tilesCovered.forEach((zoompos, index) => {
                console.log('DOWNLOADING TILE');

                if (index > 0) return; //!!!!!!!!!!!!!!!!!!!!!!!
                xhr({
                    uri: "/dist/blob.dat",
                    responseType: 'blob',
                }, (error, response, blob) => {
                    console.log('blob:', blob);
                    // https://stackoverflow.com/questions/15341912/how-to-go-from-blob-to-arraybuffer
                    let fr = new FileReader();
                    fr.onload = (e) => {
                        let buffer = e.target.result;
                        console.log('arrayBuffer:', buffer); // ArrayBuffer(39353) {}
                        let tile = new VectorTile(new Pbf(buffer));
                        console.log('tile:', tile);

                        processTile(tile, zoompos, geojson, bottomTiles);
                        console.log('bottomTiles:', bottomTiles);

                        let eleList = getEleList(geojson);
                        console.log('eleList:', eleList);
                        addBottomEle(geojson, bottomTiles, eleList);
                        console.log('geojson:', geojson);

                        let contours = getContours(eleList, geojson, polygon);
                        console.log('contours:', contours);

                    };
                    fr.readAsArrayBuffer(blob);
                });
                if (index === 0) return; //!!!!!!!!!!!!!!!!!!!!!!!

                xhr({
                    uri: `${api}/${zoompos[2]}/${zoompos[0]}/${zoompos[1]}.vector.pbf?access_token=${token}`,
                    responseType: 'arraybuffer',
                }, (error, response, buffer) => {
                    queryCount++;
                    if (error) {
                        alert(error);
                        return;
                    };
                    console.log('buffer:', buffer); // ArrayBuffer(39353) {}

                    if (0) { // dump buffer
                        // https://discourse.threejs.org/t/how-to-create-a-new-file-and-save-it-with-arraybuffer-content/628/2
                        let file = new Blob([buffer], {type: "application/octet-stream"});
                        let a = document.createElement("a");
                        a.href = URL.createObjectURL(file);
                        a.download = "blob.dat";
                        document.body.appendChild(a);
                        a.click();
                    }
                    return; //!!!!!!!!!!!!!!!

                    let tile = new VectorTile(new Pbf(buffer));
                    processTile(tile, zoompos, geojson, bottomTiles);

                    // ONCE all tiles have been downloaded,
                    // get a list of all elevations used
                    if (queryCount === tilesCovered.length) {
                        console.log('finished downloading in '+(Date.now()-prevMilestone)+'ms');
                        prevMilestone = Date.now();

                        let eleList = getEleList(geojson);
                        console.log('eleList:', eleList);
                        addBottomEle(geojson, bottomTiles, eleList);
                        console.log('geojson:', geojson);

                        let contours = getContours(eleList, geojson, polygon);
                        console.log('contours:', contours);

                        // ONCE merging finished, draw the DEM
                        // if (x === eleList.length-1) {
                            console.log('merge operation took '+(Date.now()-prevMilestone)+'ms');
                            prevMilestone = Date.now();

                            //remove contour undercuts
                            for (var m=contours.length-2; m>=0; m--){
                                var currContour= contours[m]
                                var prevContour= contours[m+1]
                                if (currContour.area>= maxArea && prevContour.area>=maxArea){
                                    console.log('max area reached!')
                                    contours=contours.slice(m+1)
                                    break
                                }
                            }

                            //drawHistogram(contours.map(function(contour){return contour.area}))
                            //drawRain(origin)
                            drawDEM(contours, northWest,southEast,radius)
                        // }
                    }
                }); // end of xhr
            }); // end of tilesCovered.forEach
        };
        getBlocks(bbox.feature);

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
//    addModel(scene, (model) => {  // add model async
        scene.traverse((node) => {
            // console.log('node.type:', node.type, node.name);
            if (node instanceof THREE.Mesh) {
                meshes.push(node);
            }
        });
//    });


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
            // console.log('#points:', laser.getPoints().length);
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
