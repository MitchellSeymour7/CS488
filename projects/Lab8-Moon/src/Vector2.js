
export class Vector2 {

    constructor(x, y)
    {
        this._x = x;
        this._y = y;
        this._magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
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


    get magnitude() {
        return this._magnitude;
    }

    set magnitude(newMagnitude) {
        this._magnitude = newMagnitude;
    }
    
}