// https://threejs.org/docs/#manual/introduction/Import-via-modules
import * as THREE from 'three';

class Line extends THREE.Line {
    // ref. https://stackoverflow.com/questions/31399856/drawing-a-line-with-three-js-dynamically
    constructor(maxPoints, color=0xff0000) {
        let geometry = new THREE.BufferGeometry();
        let positions = new Float32Array( maxPoints * 3 );
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        let material = new THREE.LineBasicMaterial({
            color: color,
        });
        super(geometry, material);
    }
    _frustumCullingWorkaround() {
        // https://stackoverflow.com/questions/36497763/three-js-line-disappears-if-one-point-is-outside-of-the-cameras-view
        this.geometry.computeBoundingSphere();
        //----
        // this.frustumCulled = false;
    }
    updatePointsTwo(x0, y0, z0, x1, y1, z1) {
        let attrPos = this.geometry.attributes.position;
        if (attrPos.count < 2) return;
        attrPos.array[0] = x0;
        attrPos.array[1] = y0;
        attrPos.array[2] = z0;
        attrPos.array[3] = x1;
        attrPos.array[4] = y1;
        attrPos.array[5] = z1;
        attrPos.needsUpdate = true;
        this.geometry.setDrawRange(0, 2);
        this._frustumCullingWorkaround();
    }
    _setPointsRandomWalk(positions, numPoints) {
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0; i < numPoints; i++) {
            positions[3*i] = x;
            positions[3*i+1] = y;
            positions[3*i+2] = z;
            x += ( Math.random() - 0.5 ) * 2;
            y += ( Math.random() - 0.5 ) * 2;
            z += ( Math.random() - 0.5 ) * 2;
        }
    }
    updatePointsRandomWalk(numPoints) {
        let attrPos = this.geometry.attributes.position;
        let maxPoints = attrPos.count;
        console.log(maxPoints);
        if (numPoints > maxPoints) {
            numPoints = maxPoints;
        }
        this._setPointsRandomWalk(attrPos.array, numPoints);
        attrPos.needsUpdate = true;
        this.geometry.setDrawRange(0, numPoints);
        this._frustumCullingWorkaround();
    };
}

class Laser extends Line {
    constructor(color=0xff0000) {
        super(2, color);
        this._src = new THREE.Vector3(0, 0, 0);
    }
    point(x, y, z, color=null) {
        // console.log("point():", this._src, x, y, z);
        this.updatePointsTwo(
            this._src.x, this._src.y, this._src.z, x, y, z);
        if (color) {
            this.material.color.setHex(color);
        }
    }
    toggle(tf) {
        this.visible = tf;
    }
    setSource(x, y, z, camera=null) {
        // in case camera is given, treat (x, y, z) as in the camera coords
        let vec = new THREE.Vector3(x, y, z);
        this._src = camera ? vec.applyMatrix4(camera.matrixWorld) : vec;
    }
}

export default { Line, Laser };
