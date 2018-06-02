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

        this._maxPoints = maxPoints;
        this._numPoints = 0;
    }
    _frustumCullingWorkaround() {
        // https://stackoverflow.com/questions/36497763/three-js-line-disappears-if-one-point-is-outside-of-the-cameras-view
        this.geometry.computeBoundingSphere();
        //----
        // this.frustumCulled = false;
    }

    _getPointsRandomWalk(numPoints) {
        let positions = [];
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0; i < numPoints; i++) {
            positions.push(x);
            positions.push(y);
            positions.push(z);
            x += ( Math.random() - 0.5 ) * 2;
            y += ( Math.random() - 0.5 ) * 2;
            z += ( Math.random() - 0.5 ) * 2;
        }
        return positions;
    }
    getPoints() {
        let arr = [...this.geometry.attributes.position.array]; // dup
        arr.length = this._numPoints * 3; // truncate
        return arr;
    }
    updatePoints(arr) {
        let attrPos = this.geometry.attributes.position;
        let maxPoints = attrPos.count;
        let numPoints = arr.length / 3;
        // console.log(`numPoints/maxPoints: ${numPoints}/${maxPoints}`);
        if (numPoints > maxPoints) {
            numPoints = maxPoints;
        }
        for (let i = 0; i < numPoints; i++) {
            attrPos.array[3*i] = arr[3*i];
            attrPos.array[3*i+1] = arr[3*i+1];
            attrPos.array[3*i+2] = arr[3*i+2];
        }
        attrPos.needsUpdate = true;
        this.geometry.setDrawRange(0, numPoints);
        this._frustumCullingWorkaround();
        this._numPoints = numPoints;
    }
    clearPoints() {
        this.updatePoints([]);
    }
    updatePointsRandomWalk(numPoints) {
        this.updatePoints(this._getPointsRandomWalk(numPoints));
    };
}

class Laser extends Line {
    constructor(options={}) {
        // https://stackoverflow.com/questions/9602449/a-javascript-design-pattern-for-options-with-default-values
        let defaults = {
            color: 0xff0000,
            maxPoints: 256,
            infLength: 9999,
        };
        let actual = Object.assign({}, defaults, options);
        super(actual.maxPoints, actual.color);

        this._src = new THREE.Vector3(0, 0, 0);
        this._raycaster = new THREE.Raycaster();
        this._infLen = actual.infLength;
    }
    setSource(src, camera=null) {
        // in case camera is given, treat (x, y, z) as in the camera coords
        this._src = camera ? src.clone().applyMatrix4(camera.matrixWorld) : src.clone();
    }
    getSource() {
        return this._src.clone();
    }
    direct(src, target) {
        return target.clone().sub(src).normalize();
    }
    reflect(d, n) {
        // r = d - 2 * (d.n) n;  https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
        return d.clone().sub(n.clone().multiplyScalar(2*d.dot(n)));
    }
    _raycast(meshes, recursive, faceExclude) {
        let isects = this._raycaster.intersectObjects(meshes, recursive);
        if (faceExclude) {
            for (let i = 0; i < isects.length; i++) {
                if (isects[i].face != faceExclude) {
                    return isects[i];
                }
            }
            return null;
        }
        return isects.length > 0 ? isects[0] : null;
    }
    raycast(origin, direction, meshes, faceExclude=null) {
        this._raycaster.set(origin, direction);
        return this._raycast(meshes, false, faceExclude);
    }
    raycastFromCamera(mx, my, width, height, cam, meshes, recursive=false) {
        let mouse = new THREE.Vector2( // normalized (-1 to +1)
            (mx / width) * 2 - 1,
            - (my / height) * 2 + 1);
        // https://threejs.org/docs/#api/core/Raycaster
        // update the picking ray with the camera and mouse position
        this._raycaster.setFromCamera(mouse, cam);
        return this._raycast(meshes, recursive, null);
    }
    point(pt, color=null) {
        // console.log("point():", this._src, pt);
        this.updatePoints([
            this._src.x, this._src.y, this._src.z,
            pt.x, pt.y, pt.z]);
        if (color) {
            this.material.color.setHex(color);
        }
    }
    pointWithRaytrace(pt, meshes=[], color=null, maxReflect=16) {
        this.point(pt, color);
        if (maxReflect < 1) return;

        let src = this.getSource();
        let dir = this.direct(src, pt);
        let isect = this.raycast(src, dir, meshes);
        if (!isect) return;

        let arrRefs = this.computeReflections(
            pt, dir, isect, meshes, maxReflect);
        this.updatePoints([src.x, src.y, src.z, pt.x, pt.y, pt.z, ...arrRefs]);
    }
    computeReflections(src, dir, isect, meshes, maxReflect) {
        const self = this;
        const arr = [];
        // https://stackoverflow.com/questions/7065120/calling-a-javascript-function-recursively
        // https://stackoverflow.com/questions/41681357/can-a-normal-or-arrow-function-invoke-itself-from-its-body-in-a-recursive-manner
        (function me (src, dir, isect) {
            // https://stackoverflow.com/questions/39082673/get-face-global-normal-in-three-js
            // console.log('local normal:', isect.face.normal);
            let normalMatrix = new THREE.Matrix3().getNormalMatrix(isect.object.matrixWorld);
            let normalWorld = isect.face.normal.clone().applyMatrix3(normalMatrix).normalize();

            let ref = self.reflect(dir, normalWorld);
            let isectNew = self.raycast(src, ref, meshes, isect.face);
            // console.log('isectNew:', isectNew);

            if (isectNew) {
                let pt = isectNew.point;
                arr.push(pt.x);
                arr.push(pt.y);
                arr.push(pt.z);
                if (arr.length / 3 < maxReflect) {
                    me(pt, ref, isectNew);
                }
            } else {
                let inf = src.clone().add(ref.multiplyScalar(self._infLen));
                arr.push(inf.x);
                arr.push(inf.y);
                arr.push(inf.z);
            }
        })(src, dir, isect);
        return arr;
    }
}

export default { Line, Laser };
