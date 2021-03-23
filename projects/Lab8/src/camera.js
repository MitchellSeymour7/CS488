import {Matrix4} from './Matrix4';

export class Camera {
    constructor(inFrom, inTo, inWorldUP)
    {
        this.from = inFrom;
        this.to = inTo;
        this.worldUp = inWorldUP;
       
        //this.forward = (this.to - this.from).normalize();
        this.forward = this.to;
        this.forward.x -= this.from.x;
        this.forward.y -= this.from.y;
        this.forward.z -= this.from.z;
        this.forward = this.forward.normalize();

        // this.right;
        // this.up;

        this.matrix = new Matrix4();
        this.orient();
    }

    orient()
    {
        this.right = this.forward.cross(this.worldUp).normalize();
        this.up = this.right.cross(this.forward);
        let rotation = new Matrix4();
        rotation.elements[0] = this.right.x;
        rotation.elements[1] = this.up.x;
        rotation.elements[2] = -this.forward.x;

        rotation.elements[4] = this.right.y;
        rotation.elements[5] = this.up.y;
        rotation.elements[6] = -this.forward.y

        rotation.elements[8] = this.right.z
        rotation.elements[9] = this.up.z
        rotation.elements[10] = -this.forward.z
        rotation.elements[15] = 1;
        
        this.matrix = rotation.multiplyMatrix4(Matrix4.translate(-this.from.x, -this.from.y, -this.from.z));
    }
    strafe(distance)
    {
        this.from = this.from.add(this.right.scalarMultiply(distance));
        this.orient();
    }

    advance(distance)
    {
        this.from = this.from.add(this.forward.scalarMultiply(distance));
        this.orient();
    }

    yaw(degrees) 
    {
        this.forward = (Matrix4.rotateAroundAxis(this.worldUp, degrees).multiplyVector4(this.forward.toVector4(0))).toVector3();
        this.orient();
    }

    pitch(degrees) 
    {
        this.forward = (Matrix4.rotateAroundAxis(this.right, degrees).multiplyVector4(this.forward.toVector4(0))).toVector3();
        this.orient();
    }

    setFromTo(inFrom, inTo) {
        this.from = inFrom;
        this.to = inTo;

        this.forward = (to - from).normalize();

        this.orient();
    }
}






