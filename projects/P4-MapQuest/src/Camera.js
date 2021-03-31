import { Matrix4 } from "./Matrix4";

export class Camera {
    constructor(from, to, worldUp)
    {
        this.from = from;
        this.to = to;
        this.worldUp = worldUp;
        this.forward = to.sub(from).normalize();
        this.orient();
    }

    orient()
    {
        this.right = this.forward.cross(this.worldUp).normalize();
        this.up = this.right.cross(this.forward);

        const rotation = new Matrix4();
        rotation.elements.fill(0);
        rotation.elements[0] = this.right.x;
        rotation.elements[1] = this.up.x;
        rotation.elements[2] = -this.forward.x;
        rotation.elements[4] = this.right.y;
        rotation.elements[5] = this.up.y;
        rotation.elements[6] = -this.forward.y;
        rotation.elements[8] = this.right.z;
        rotation.elements[9] = this.up.z;
        rotation.elements[10] = -this.forward.z;
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
        this.forward = Matrix4.rotateAroundAxis(this.worldUp, degrees).multiplyVector4(this.forward.toVector4(1).toFlatArray()).toVector3();
        this.orient();
    }

    pitch(degrees)
    {
        this.forward = Matrix4.rotateAroundAxis(this.right, degrees).multiplyVector4(this.forward.toVector4(1).toFlatArray()).toVector3();        
        this.orient();
    }

    
}


