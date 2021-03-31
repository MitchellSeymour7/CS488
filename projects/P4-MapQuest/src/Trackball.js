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
        this.axis = null;
        this.mouseHistory = [null, null]; //used to determine when to infinitely spin model
        this.mouseHistoryIndex = 0; //used to fill mouseHistory array
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
        this.mouseHistory[this.mouseHistoryIndex] = mousePixels
        this.mouseHistoryIndex = (this.mouseHistoryIndex + 1) % 2;

        const mouseSphere = this.pixelsToSphere(mousePixels);
        const dot = this.mouseSphere0.dot(mouseSphere);
        if (Math.abs(dot) < 0.9999) {
            const radians = Math.acos(dot) * multiplier;
            this.axis = this.mouseSphere0.cross(mouseSphere).normalize();
            const currentRotation = Matrix4.rotateAroundAxis(this.axis, radians * 180 / Math.PI);
            this.rotation = currentRotation.multiplyMatrix4(this.previousRotation);
        }
    }

    end()
    {
        this.previousRotation = this.rotation;
        this.mouseSphere0 = null;

        //calculate and return magnitiude of difference of two vectors in mouseHistory
        const moustHistory1 = this.mouseHistory[0];
        const moustHistory2 = this.mouseHistory[1];

        const diffVector = new Vector2(Math.abs(moustHistory1.x - moustHistory2.x), Math.abs(moustHistory1.y - moustHistory2.y));
        const diffMagnitude = diffVector.magnitude;

        return diffMagnitude;
    }

    cancel()
    {
        this.rotation = this.previousRotation;
        this.mouseSphere0 = null;
    }

    spin(factor)
    {
        const currentRotation = Matrix4.rotateAroundAxis(this.axis, factor); //axis is the axis from the drag event
        this.previousRotation = currentRotation.multiplyMatrix4(this.previousRotation);
        this.rotation = this.previousRotation;
    }
}