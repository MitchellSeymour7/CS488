import { Matrix4 } from "./Matrix4";
import { Vector2 } from "./Vector2";
import { Vector3 } from "./Vector3";

export class Trackball {
    constructor()
    {
        this.mouseSphere0 = null;
        this.previousRotation = Matrix4.identity();
        this.rotation = Matrix4.identity();
        this.dimensions = new Vector2(0,0);
    }

    setViewport(width, height)
    {
        this.dimensions.x = width;
        this.dimensions.y = height;
    }

    pixelsToSphere(mousePixels)
    {
        const mouseNdcX = mousePixels.x / this.dimensions.x * 2 - 1;
        const mouseNdcY = mousePixels.y / this.dimensions.y * 2 - 1;
        const mouseNdc = new Vector2(mouseNdcX, mouseNdcY);

        const zSquared = 1 - Math.pow(mouseNdc.x, 2) - Math.pow(mouseNdc.y, 2);
        if(zSquared > 0) {
            return new Vector3(mouseNdc.x, mouseNdc.y, Math.pow(zSquared, 0.5));
        }
        else {
            return new Vector3(mouseNdc.x, mouseNdc.y, 0).normalize();
        }
    }

    start(mousePixels)
    {
        this.mouseSphere0 = this.pixelsToSphere(mousePixels);
    }

    drag(mousePixels, multiplier)
    {
        const mouseSphere = this.pixelsToSphere(mousePixels);
        const dot = this.mouseSphere0.dot(mouseSphere);
        if (Math.abs(dot) < 0.9999) {
            const radians = Math.acos(dot) * multiplier;
            const axis = this.mouseSphere0.cross(mouseSphere).normalize();
            const currentRotation = Matrix4.rotateAroundAxis(axis, radians * 180 / Math.PI);
            this.rotation = currentRotation.multiplyMatrix4(this.previousRotation);
        }
    }

    end()
    {
        this.previousRotation = this.rotation;
        this.mouseSphere0 = null;
    }

    cancel()
    {
        this.rotation = this.previousRotation;
        this.mouseSphere0 = null;
    }
}