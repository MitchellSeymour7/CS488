import {Camera} from './Camera';

export class HeightmapCamera extends Camera {
    constructor(from, to, worldUp, heightmap, eyeLevel, scaleX = 1, scaleY = 1, scaleZ = 1) {
      // construct superclass
      // save instance variables
        super(from, to, worldUp);
        this.heightmap = heightmap;
        this.eyeLevel = eyeLevel;

        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.scaleZ = scaleZ;

        this.elevate()
        this.orient()
    }
  
    setScale(scaleX, scaleY, scaleZ) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.scaleZ = scaleZ;
    }

    elevate() {
        // clamp this.from.x to valid terrain coordinates
        // clamp this.from.z to valid terrain coordinates
        this.from.y = this.heightmap.lerp(this.from.x, this.from.z, this.scaleX, this.scaleY, this.scaleZ) + this.eyeLevel;
    }
  
    advance(delta) {
        let offset = this.forward.scalarMultiply(delta)
        this.from = this.from.add(offset);
        this.elevate()
        this.orient()
    }
  
    strafe(delta) {
        let offset = this.right.scalarMultiply(delta)
        this.from = this.from.add(offset);
        this.elevate()
        this.orient()
    }
}