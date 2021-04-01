import {Vector3} from './Vector3';

export class Heightmap {
    constructor(grays, width, height) {
        this.heights = grays;
        this.width = width;
        this.height = height;
    }
    get(x, z) {
        return this.heights[z * this.width + x]
    }
    set(x, z, height) {
        this.heights[z * this.width + x] = height
    }
    toTriangleMesh() {
        let positions = [];
        let faces = [];
        let normals = [];
        let normalsVec = [];
        let textCoords = [];

        for (var z = 0; z < this.height; z++) {
            for (var x = 0; x < this.width; x++) {
            let y = this.get(x,z);
            positions.push(x, y, z);

            textCoords.push(x,z);
            normalsVec.push(new Vector3(0,0,0));
            }
        }

        for (var z = 0; z < this.height-1; z++) {
            let nextZ = z + 1
            for (var x = 0; x < this.width-1; x++) {
            let nextX = x + 1

            let p1 = z * this.width + x;
            let p2 = z * this.width + nextX;
            let p3 = nextZ * this.width + x;
            let p4 = nextZ * this.width + nextX;
            faces.push(p1, p2, p3);
            faces.push(p2, p4, p3);

            let v1 = new Vector3(positions[p1*3],positions[p1*3+1],positions[p1*3+2]);
            let v2 = new Vector3(positions[p2*3],positions[p2*3+1],positions[p2*3+2]);
            let v3 = new Vector3(positions[p3*3],positions[p3*3+1],positions[p3*3+2]);
            let v4 = new Vector3(positions[p4*3],positions[p4*3+1],positions[p4*3+2]);

            let e1 = v1.sub(v2);
            let e2 = v3.sub(v2);
            let e3 = v4.sub(v2);

            let n1 = (e1.cross(e2));
            let n2 = (e2.cross(e3));

            normalsVec[p1] = normalsVec[p1].add(n1);
            normalsVec[p2] = normalsVec[p2].add(n1);
            normalsVec[p3] = normalsVec[p3].add(n1);
            normalsVec[p2] = normalsVec[p2].add(n2);
            normalsVec[p3] = normalsVec[p3].add(n2);
            normalsVec[p4] = normalsVec[p4].add(n2);
            }
        }
        // normals
        for (var i = 0; i < normalsVec.length; i++) {
            let n = normalsVec[i].normalize();
            normals.push(n.x,n.y,n.z);
        }

        return {positions, faces, normals, textCoords};
    }
    lerp(x, z, scaleX, scaleY, scaleZ) {
        let floorX = Math.floor(x/scaleX);
        let floorZ = Math.floor(z/scaleZ);
        let fractionX = x/scaleX - floorX;
        let fractionZ = z/scaleZ - floorZ;
        let nearHeight = (1 - fractionX) * this.get(floorX, floorZ) + fractionX * this.get(floorX + 1, floorZ);
        let farHeight = (1 - fractionX) * this.get(floorX, floorZ + 1) + fractionX * this.get(floorX + 1, floorZ + 1);
        let y = (1 - fractionZ) * nearHeight + fractionZ * farHeight;
        console.log(floorX,floorZ);
        console.log(fractionX,fractionZ);
        console.log(nearHeight,farHeight);
        console.log(y*.01);
        return y*scaleY;
    }

}

