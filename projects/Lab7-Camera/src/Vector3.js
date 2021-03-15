import {Vector4} from './Vector4';
export class Vector3 {

    constructor(x, y, z)
    {
        this._x = x;
        this._y = y;
        this._z = z;
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
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
    }

    normalize() 
    {
        let magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
        const result = new Vector3(this.x / magnitude, this.y / magnitude, this.z / magnitude);
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

    add(otherVector)
    {
        const newX = (this.x + otherVector.x);
        const newY = (this.y + otherVector.y);
        const newZ = (this.z + otherVector.z);

        const result = new Vector3(newX, newY, newZ);
        return result;
    }

    scalarMultiply(value)
    {
        const newX = (this.x * value);
        const newY = (this.y * value);
        const newZ = (this.z * value);

        const result = new Vector3(newX, newY, newZ);
        return result;
    }

    toVector4(wCoordinate) 
    {
        return new Vector4(this.x, this.y, this.z, wCoordinate);
    }
    
}