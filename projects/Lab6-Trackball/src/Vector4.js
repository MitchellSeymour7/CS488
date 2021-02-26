import {Vector3} from './Vector3';
export class Vector4 {

    constructor(x, y, z, w)
    {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
        this._magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2) + Math.pow(w, 2));
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

    get w() {
        return this._w;
    }

    set w(newW) {
        this._w = newW;
    }

    get magnitude() {
        return this._magnitude;
    }

    set magnitude(newMagnitude) {
        this._magnitude = newMagnitude;
    }

    toVector3() 
    {
        return new Vector3(this.x, this.y, this.z);
    }
    
}