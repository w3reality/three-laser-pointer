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
    updatePoints(arr) {
        let attrPos = this.geometry.attributes.position;
        let maxPoints = attrPos.count;
        let numPoints = arr.length / 3;
        console.log(`numPoints/maxPoints: ${numPoints}/${maxPoints}`);
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
    }
    updatePointsRandomWalk(numPoints) {
        this.updatePoints(this._getPointsRandomWalk(numPoints));
    };
}

class Laser extends Line {
    constructor(color=0xff0000) {
        super(16, color);
        this._src = new THREE.Vector3(0, 0, 0);
        this._raycaster = new THREE.Raycaster();
    }
    toggle(tf) {
        this.visible = tf;
    }
    setSource(src, camera=null) {
        // in case camera is given, treat (x, y, z) as in the camera coords
        this._src = camera ? src.clone().applyMatrix4(camera.matrixWorld) : src.clone();
    }
    getSource() {
        return this._src.clone();
    }
    computeDirection(src, target) {
        return target.clone().sub(src).normalize();
    }
    computeReflection(d, n) {
        // r = d - 2 * (d.n) n;  https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
        return d.clone().sub(n.clone().multiplyScalar(2*d.dot(n)));
    }
    _raycast(meshes, recursive) {
        let intersects = this._raycaster.intersectObjects(meshes, recursive);
        return intersects.length > 0 ? intersects[0] : null;
    }
    raycast(origin, direction, meshes) {
        this._raycaster.set(origin, direction);
        return this._raycast(meshes, false);
    }
    raycastFromCamera(mx, my, width, height, cam, meshes, recursive=false) {
        let mouse = new THREE.Vector2( // normalized (-1 to +1)
            (mx / width) * 2 - 1,
            - (my / height) * 2 + 1);
        // https://threejs.org/docs/#api/core/Raycaster
        // update the picking ray with the camera and mouse position
        this._raycaster.setFromCamera(mouse, cam);
        return this._raycast(meshes, recursive);
    }
    point(pt, color=null) {
        // console.log("point():", this._src, pt);
        this.updatePointsTwo(
            this._src.x, this._src.y, this._src.z, pt.x, pt.y, pt.z);
        if (color) {
            this.material.color.setHex(color);
        }
    }
    pointWithRaytrace(pt, meshes=[], color=null) { // TODO trace level
        this.point(pt, color);
        let src = this.getSource();
        let dir = this.computeDirection(src, pt);
        let isect = this.raycast(src, dir, meshes);
        if (isect !== null) {
            let meshes2 = [...meshes].filter((m) => {
                return m !== isect.object;
            });
            let ref = this.computeReflection(dir, isect.face.normal);
            let isect2 = this.raycast(pt, ref, meshes2);
            console.log('isect2:', isect2);
            if (isect2 !== null) {
                this.updatePoints([
                    src.x, src.y, src.z,
                    pt.x, pt.y, pt.z,
                    isect2.point.x, isect2.point.y, isect2.point.z,
                ]);
            } else {
                let far = pt.clone().add(ref.multiplyScalar(9999.0));
                this.updatePoints([
                    src.x, src.y, src.z,
                    pt.x, pt.y, pt.z,
                    far.x, far.y, far.z,
                ]);
            }
        }
    }
}

export default { Line, Laser };
