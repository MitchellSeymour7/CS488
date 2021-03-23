import {Vector4} from './Vector4';
export class Vector3 {

    constructor(x, y, z)
    {
        this._x = x;
        this._y = y;
        this._z = z;
        this._magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    }

    get x() {
        return this._x;
    }

    set x(newX) {
        this._x = newX;
    }

    get y() {
        return this._y;
    }

    set y(newY) {
        this._y = newY;
    }

    get z() {
        return this._z;
    }

    set z(newZ) {
        this._z = newZ;
    }

    get magnitude() {
        return this._magnitude;
    }

    set magnitude(newMagnitude) {
        this._magnitude = newMagnitude;
    }

    normalize() 
    {
        const result = new Vector3(this.x / this.magnitude, this.y / this.magnitude, this.z / this.magnitude);
        return result;
    }

    cross(otherVector) 
    {
        const newX = (this.y * otherVector.z - this.z * otherVector.y);
        const newY = (this.z * otherVector.x - this.x * otherVector.z);
        const newZ = (this.x * otherVector.y - this.y * otherVector.x);

        const result = new Vector3(newX, newY, newZ);
        return result;
    }

    dot(otherVector) 
    {
        const result = this.x * otherVector.x + this.y * otherVector.y + this.z * otherVector.z;
        return result;
    }

    toVector4(wCoordinate) 
    {
        return new Vector4(this.x, this.y, this.z, wCoordinate);
    }
    
}