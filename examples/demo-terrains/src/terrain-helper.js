
// assuming THREE is globally defined...
import 'three.terrain.js';
// console.log(THREE.Terrain);

class TerrainHelper {
    // constructor(xSize=1, ySize=1, xS=63, yS=63) {
    constructor(params={}) {
        const defaults = {
            xSize: 1.0,
            ySize: 1.0,
            maxHeight: 0.1,
            minHeight: -0.1,
            xS: 63,
            yS: 63,
        };
        const actual = {};
        Object.assign(actual, defaults, params);
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
    getTerrainScene(mat, img=THREE.Terrain.DiamondSquare) {
        return THREE.Terrain({
            easing: THREE.Terrain.Linear,
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
                        let blend = THREE.Terrain.generateBlendedMaterial([
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

        let g = new THREE.Geometry();
        c0.updateMatrix();
        c1.updateMatrix();
        c2.updateMatrix();
        c3.updateMatrix();
        g.merge(c0.geometry, c0.matrix);
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
    getScatterMeshesScene(terrainGeom, mag=0.001, spread=0.02) {
        return THREE.Terrain.ScatterMeshes(terrainGeom, {
            // mesh: new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6)),
            // mesh: new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.06, 0.03)),
            mesh: TerrainHelper.buildTree(mag),
            w: this.xS,
            h: this.yS,
            spread: spread,
            randomness: Math.random,
        });
    }

    static getSkyDome(cb) {
        new THREE.TextureLoader().load('./sky1.jpg', (t1) => {
            t1.minFilter = THREE.LinearFilter; // Texture is not a power-of-two size; use smoother interpolation.
            const skyDome = new THREE.Mesh(
                new THREE.SphereGeometry(8192, 16, 16, 0, Math.PI*2, 0, Math.PI*0.5),
                new THREE.MeshBasicMaterial({map: t1, side: THREE.BackSide, fog: false})
            );
            // skyDome.position.y = -99;
            skyDome.position.y = -0.99;
            cb(skyDome);
        });
    }
    static getWater() {
        const water = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(16384+1024, 16384+1024, 16, 16),
            new THREE.MeshLambertMaterial({color: 0x006ba0, transparent: true, opacity: 0.6})
        );
        // water.position.y = -99;
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
