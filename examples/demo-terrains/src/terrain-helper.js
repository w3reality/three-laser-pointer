
import * as THREE from 'three';

import getModule from './three-terrain.js';
const ThreeTerrain = getModule(THREE); // @@ hackish

//-------- https://discourse.threejs.org/t/three-geometry-will-be-removed-from-core-with-r125/22401/13
const __ge125 = () => THREE.REVISION >= '125';
console.warn('@@ __ge125():', __ge125());
//--------

class TerrainHelper {
    constructor(options={}) {
        const defaults = {
            xSize: 1.0,
            ySize: 1.0,
            maxHeight: 0.1,
            minHeight: -0.1,
            xS: 63,
            yS: 63,
        };
        let actual = Object.assign({}, defaults, options);
        this.xSize = actual.xSize;
        this.ySize = actual.ySize;
        this.maxHeight = actual.maxHeight;
        this.minHeight = actual.minHeight;
        this.xS = actual.xS;
        this.yS = actual.yS;
    }

    static loadHeightmapImage(src, cb) {
        let img = new Image();
        img.onload = () => {
            cb(img);
        };
        img.src = src;
    }
    getTerrainScene(mat, img=ThreeTerrain.DiamondSquare) {
        return ThreeTerrain({
            easing: ThreeTerrain.Linear,
            frequency: 2.5, //????
            heightmap: img,
            // material: new THREE.MeshBasicMaterial({color: 0x5566aa}),
            // material: new THREE.MeshBasicMaterial({color: 0x5566aa, wireframe: true}), // wireframe
            // material: new THREE.MeshPhongMaterial({color: 0x88aaaa, specular: 0x444455, shininess: 10}), // gray
            material: mat,
            steps: 1,
            useBufferGeometry: false, // need false for import/export according to the doc...
            xSize: this.xSize,
            ySize: this.ySize,
            maxHeight: this.maxHeight,
            minHeight: this.minHeight,
            xSegments: this.xS,
            ySegments: this.yS,
        });
    }
    static getBlendedMaterial(cb=null, mag=0.01) {
        const loader = new THREE.TextureLoader();
        loader.load('./sand1.jpg', (t1) => {
            t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
            loader.load('./grass1.jpg', (t2) => {
                loader.load('./stone1.jpg', (t3) => {
                    loader.load('./snow1.jpg', (t4) => {
                        // t2.repeat.x = t2.repeat.y = 2;
                        let blend = ThreeTerrain.generateBlendedMaterial([
                            {texture: t1},
                            {texture: t2, levels: [-80*mag, -35*mag, 20*mag, 50*mag]},
                            {texture: t3, levels: [20*mag, 50*mag, 60*mag, 85*mag]},
                            {texture: t4, glsl: `1.0 - smoothstep(${65.0*mag} + smoothstep(-256.0, 256.0, vPosition.x) * ${10.0*mag}, ${80.0*mag}, vPosition.z)`},
                            {texture: t3, glsl: `slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2`}, // between 27 and 45 degrees
                        ]);
                        // console.log('blend:', blend);
                        cb(blend);
                    });
                });
            });
        });
    }

    static buildTree(mag=0.001) {
        let material = [
            new THREE.MeshLambertMaterial({ color: 0x3d2817 }), // brown
            new THREE.MeshLambertMaterial({ color: 0x2d4c1e }), // green
        ];

        let c0 = new THREE.Mesh(new THREE.CylinderGeometry(2*mag, 2*mag, 12*mag, 6*mag, 1*mag, true));
        c0.position.y = 6*mag;
        let c1 = new THREE.Mesh(new THREE.CylinderGeometry(0*mag, 10*mag, 14*mag, 8*mag));
        c1.position.y = 18*mag;
        let c2 = new THREE.Mesh(new THREE.CylinderGeometry(0*mag, 9*mag, 13*mag, 8*mag));
        c2.position.y = 25*mag;
        let c3 = new THREE.Mesh(new THREE.CylinderGeometry(0*mag, 8*mag, 12*mag, 8*mag));
        c3.position.y = 32*mag;

        let g = new THREE.Geometry(); // @@ !__ge125() only
        c0.updateMatrix();
        c1.updateMatrix();
        c2.updateMatrix();
        c3.updateMatrix();
        g.merge(c0.geometry, c0.matrix); // @@ `.merge()` not working when `g` is a BufferGeometry.
        g.merge(c1.geometry, c1.matrix);
        g.merge(c2.geometry, c2.matrix);
        g.merge(c3.geometry, c3.matrix);

        let b = c0.geometry.faces.length;
        for (let i = 0, l = g.faces.length; i < l; i++) {
            g.faces[i].materialIndex = i < b ? 0 : 1;
        }

        let m = new THREE.Mesh(g, material);
        m.scale.x = m.scale.z = 5;
        m.scale.y = 1.25;
        return m;
    }
    getScatterMeshesScene(terrainGeom, merge=true, mag=0.001, spread=0.02) {
        let _mesh;
        if (__ge125()) {
            _mesh = new THREE.Mesh(
                new THREE.CylinderGeometry(10*mag, 10*mag, 60*mag, 5),
                new THREE.MeshBasicMaterial({color: 0xcccc00}));
        } else {
            _mesh = TerrainHelper.buildTree(mag);
        }
        console.log('@@ _mesh:', _mesh);

        if (!merge) {
            // @@ Since three r125, `BufferGeometry` is enforced, so the type of
            // `_mesh.geometry` is already `BufferGeometry`.
            if (!__ge125()) {
                // Kludge -
                // Here we want to track indivisual scattered meshes.
                // ThreeTerrain.ScatterMeshes() does not merge meshes when
                // the geometry is THREE.Geometry.  So convert to THREE.BufferGeometry.
                _mesh.geometry = new THREE.BufferGeometry().fromGeometry(_mesh.geometry);
            }
        }

        return {
            scene: ThreeTerrain.ScatterMeshes(terrainGeom, {
                mesh: _mesh,
                w: this.xS,
                h: this.yS,
                spread: spread,
                randomness: Math.random,
            }),
            material: _mesh.material,
        };
    }

    static getSkyDome(cb) {
        new THREE.TextureLoader().load('./sky1.jpg', (t1) => {
            t1.minFilter = THREE.LinearFilter; // Texture is not a power-of-two size; use smoother interpolation.
            const skyDome = new THREE.Mesh(
                new THREE.SphereGeometry(256, 16, 16, 0, Math.PI*2, 0, Math.PI*0.5),
                new THREE.MeshBasicMaterial({map: t1, side: THREE.BackSide, fog: false})
            );
            skyDome.position.y = -0.99;
            cb(skyDome);
        });
    }
    static getWater() {
        const water = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(16384+1024, 16384+1024, 16, 16),
            new THREE.MeshLambertMaterial({color: 0x006ba0, transparent: true, opacity: 0.6})
        );
        water.position.y = -0.99;
        water.rotation.x = -0.5 * Math.PI;
        return water;
    }
    static getSunLight() {
        const sunLight = new THREE.DirectionalLight(0xe8bdb0, 1.5);
        sunLight.position.set(2950, 2625, -160); // Sun on the sky texture
        return sunLight;
    }
    static getSkyLight() {
        const skyLight = new THREE.DirectionalLight(0xc3eaff, 0.75);
        skyLight.position.set(-1, -0.5, -1);
        return skyLight;
    }
}

export default TerrainHelper;
