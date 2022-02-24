// Import external symbols
import * as THREE from 'three';
import DatGuiDefaults from 'dat-gui-defaults';
import Threelet from 'threelet';

// Import internal source
import Laser from '../../../src';
import TerrainHelper from './terrain-helper.js';

class Gui extends DatGuiDefaults {
    // override
    initGui(gui, config, params) {
        gui.add(params, 'laserMode', ["Raytrace", "Measure", "None"])
            .name('Laser Mode')
            .onChange(value => {
                config.laserMode = value;
            });
        gui.add(params, 'vis', ["Textured", "Wireframe", "None"])
            .name('Terrain')
            .onChange(value => {
                config.onChangeVis(value);
                config.vis = value;
            });
        gui.add(params, 'evRender')
            .name('Passive Render')
            .onChange(value => {
                config.onChangeEvRender(value);
                config.evRender = value;
            });
        gui.add(params, 'thunder')
            .name("Thunder")
            .onChange(value => {
                config.onThunder();
            });
        gui.add(params, 'reset')
            .name("Reset")
            .onChange(value => {
                this.applyDefaults();
                config.onChangeVis(params.vis);
                config.onChangeEvRender(params.evRender);
                config.onThunder(true);

                Object.assign(config, params);
            });
        gui.add(params, 'sourceCode')
            .name("Source Code")
            .onChange(value => {
                window.location.href = "https://github.com/w3reality/three-laser-pointer/tree/master/examples/demo-terrains";
            });
    }
}

class App extends Threelet {
    // override
    onCreate(params) {
        const { width, height } = this.canvas;
        const { config, pick, mark, markCancel } = App.init(
            this.scene, this.render, width, height);

        config.onChangeVis = value => {
            this.scene.traverse(node => {
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
                            break;
                    }
                }
            });
            this.render();
        };
        config.onChangeEvRender = value => {
            value ? this.updateLoop(0) : this.updateLoop(60);
        };

        //

        const thunders = new THREE.Group();
        this.scene.add(thunders);
        config.onThunder = (clear=false) => {
            if (clear) {
                thunders.clear();
            } else {
                const th = new Laser({
                    color: 0xffff00,
                    maxPoints: 32,
                });
                th.updatePointsRandomWalk(32);

                thunders.add(th);
            }

            this.render();
        };

        //

        const dg = new Gui(config);
        dg.setDefaults({
            vis: config.vis,
            laserMode: config.laserMode,
            evRender: config.evRender,
            thunder: () => {},
            reset: () => {},
            sourceCode: () => {},
        });

        //

        const cam = this.camera;
        cam.position.set(0, 0, 0.5);

        const msg = document.getElementById('msg');
        const updateRaytraceStats = laser => App._updateRaytraceStats(msg, laser);
        const updateMeasureStats = markPair => App._updateMeasureStats(msg, markPair);

        this.on('pointer-move', (mx, my) => pick(mx, my, cam, updateRaytraceStats));
        this.on('pointer-click', (mx, my) => mark(mx, my, cam, updateMeasureStats));
        this.on('pointer-click-right', (mx, my) => markCancel(updateMeasureStats));
    }

    //

    static _updateRaytraceStats(msg, laser) {
        const refPoints = laser.getPoints();
        const srcPt = refPoints.shift();
        const _infPt = refPoints.pop();

        this.clear(msg);
        if (refPoints.length > 0) {
            this.appendText(msg, `laser source: ${this.toCoords(srcPt)}`);
            this.appendText(msg, `# reflections: ${refPoints.length}`);
            this.appendText(msg, `reflection points: ${this.toCoordsArray(refPoints)}`);
            // this.appendText(msg, `reflection meshes: ${laser.getMeshesHit().map(mesh => mesh.uuid).join(', ')}`);
        }
    }

    static _updateMeasureStats(msg, markPair) {
        this.clear(msg);
        if (markPair.length === 1) {
            this.appendText(msg, `points: ${this.toCoords(markPair[0])} -> `);
        } else if (markPair.length === 2) {
            const [p0, p1] = markPair;
            this.appendText(msg, `points: ${this.toCoords(p0)} -> ${this.toCoords(p1)}`);
            this.appendText(msg, `length: ${p0.distanceTo(p1).toFixed(3)}`);
        }
    }

    static toCoords(vec, nFloats=3) {
        return `(${vec.x.toFixed(nFloats)}, ${vec.y.toFixed(nFloats)}, ${vec.z.toFixed(nFloats)})`;
    }

    static toCoordsArray(vecArray) {
        return vecArray.map(vec => this.toCoords(vec)).join(', ');
    }

    static appendText(el, text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        el.appendChild(div);
    }

    static clear(parent) {
        while (parent.firstChild) {
            parent.firstChild.remove();
        }
    }

    //

    static init(scene, render, width, height) {

        const thelper = new TerrainHelper({
            xSize: 1.0,
            ySize: 1.0,
            maxHeight: 0.1,
            minHeight: -0.1,
        });

        let meshesInteraction = []; // for registering meshes to interact with
        TerrainHelper.getBlendedMaterial(blend => {
            // const heightmap = './heightmap.png';
            const heightmap = './heightmapMods.png';
            TerrainHelper.loadHeightmapImage(heightmap, (img) => {
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
                render();
            });
        });

        TerrainHelper.getSkyDome(skyDome => {
            console.log('skyDome', skyDome);
            scene.add(skyDome);
            render();
        });
        scene.add(TerrainHelper.getWater());
        scene.add(TerrainHelper.getSunLight());
        scene.add(TerrainHelper.getSkyLight());

        //

        const _wireframeMat = new THREE.MeshBasicMaterial({color: 0x5566aa, wireframe: true});

        const _laser = new Laser({ color: 0xff0000 });
        scene.add(_laser);

        const _laserMarkTmp = new Laser({maxPoints: 2});
        scene.add(_laserMarkTmp);
        let markPair = []; // now markPair.length === 0
        let _laserMarkColor;

        const config = { // defaults
            vis: "Textured",
            laserMode: "Raytrace",
            evRender: true,
        };

        return { config,
            pick: (mx, my, cam, updateStats) => {
                if (config.laserMode === 'None') {
                    _laser.clearPoints();
                    return;
                }

                let isect = _laser.raycastFromCamera(mx, my, width, height, cam, meshesInteraction);
                if (isect !== null) {
                    // console.log('isect:', isect);
                    let pt = isect.point;
                    // console.log('pick pt:', pt);

                    let ptSrc = new THREE.Vector3(0.003, -0.004, 0.002);
                    if (config.laserMode === "Raytrace") {
                        _laser.setSource(ptSrc, cam);
                        _laser.pointWithRaytrace(pt, meshesInteraction, 0x00ffff, 16);

                        let meshesHit = _laser.getMeshesHit();
                        // console.log('meshesHit:', meshesHit);
                        meshesHit.forEach((mesh) => {
                            if (mesh.name !== 'terrain') {
                                mesh.material = _wireframeMat;
                            }
                        });
                    } else if (config.laserMode === "Measure") {
                        _laser.setSource(ptSrc, cam);
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

                if (config.evRender) render();

                // = 1(src point) + #(reflection points) + 1(end point)
                // console.log('#points:', _laser.getPoints().length);
                if (config.laserMode === "Raytrace") updateStats(_laser);
            },
            mark: (mx, my, cam, updateStats) => {
                if (config.laserMode !== 'Measure') return;

                let isect = _laser.raycastFromCamera(mx, my, width, height, cam, meshesInteraction);
                if (isect !== null) {
                    // console.log('isect:', isect);
                    let pt = isect.point;
                    console.log('mark pt:', pt);
                    if (markPair.length === 1) {
                        markPair.push(pt); // now markPair.length === 2
                        // console.log('registering markPair:', markPair);
                        let laser = new Laser({
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

                if (config.evRender) render();

                updateStats(markPair);
            },
            markCancel: (updateStats) => {
                markPair = []; // now markPair.length === 0
                updateStats(markPair);

                _laserMarkTmp.visible = false;
                if (config.evRender) render();
            },
        };
    }
}

const start = (OrbitControls, Stats) => {
    const app = new App({
        canvas: document.getElementById('canvas'),
        // optAxes: false,
    });
    app.setup('mod-stats', Stats, {panelType: 1});
    app.setup('mod-controls', OrbitControls);

    app.render(); // first time
};

export default start;