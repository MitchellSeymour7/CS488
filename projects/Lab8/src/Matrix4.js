import { Vector4 } from "./Vector4";

export class Matrix4 {
    constructor()
    {
        this.elements = new Float32Array(16);
        //0 4 8 12
        //1 5 9 13
        //2 6 10 14
        //3 7 11 15
    }

    static identity()
    {
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = 1;
        m.elements[5] = 1;
        m.elements[10] = 1;
        m.elements[15] = 1;
        return m;
    }

    static scale(fx, fy, fz)
    {
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = fx;
        m.elements[5] = fy;
        m.elements[10] = fz;
        m.elements[15] = 1;
        return m;
    }

    static translate(ox, oy, oz)
    {
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = 1;
        m.elements[5] = 1;
        m.elements[10] = 1;
        m.elements[15] = 1;
        m.elements[12] = ox;
        m.elements[13] = oy;
        m.elements[14] = oz;
        return m; 
    }

    static rotateZ(degrees)
    {
        let radians = degrees * (Math.PI/180);
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = Math.cos(radians);
        m.elements[1] = Math.sin(radians);
        m.elements[4] = -1 * Math.sin(radians);
        m.elements[5] = Math.cos(radians);
        m.elements[10] = 1;
        m.elements[15] = 1;
        return m; 
    }

    static rotateX(degrees)
    {
        let radians = degrees * (Math.PI/180);
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[5] = Math.cos(radians);
        m.elements[6] = Math.sin(radians);
        m.elements[9] = -1 * Math.sin(radians);
        m.elements[10] = Math.cos(radians);
        m.elements[0] = 1;
        m.elements[15] = 1;
        return m; 
    }

    static rotateY(degrees)
    {
        let radians = degrees * (Math.PI/180);
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = Math.cos(radians);
        m.elements[2] = Math.sin(radians);
        m.elements[8] = -1 * Math.sin(radians);
        m.elements[10] = Math.cos(radians);
        m.elements[5] = 1;
        m.elements[15] = 1;
        return m; 
    }

    static ortho(left, right, bottom, top, near, far)
    {
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = 2 / (right-left);
        m.elements[5] = 2 / (top-bottom);
        m.elements[10] = 2 / (near-far);
        m.elements[15] = 1;
        m.elements[12] = -1 * ((right + left) / (right - left));
        m.elements[13] = -1 * ((top + bottom) / (top - bottom));
        m.elements[14] = ((near + far) / (near - far));
        return m;
    }

    set(r, c, value) {
        this.elements[c * 4 + r] = value;
        return this;
    }

    static fovPerspective(fovY, aspect, near, far) {
        let y = near * Math.tan(fovY * 0.5 * Math.PI / 180);
        let x = y * aspect;
        return this.frustumPerspective(-x, x, -y, y, near, far);
    }
    
    static frustumPerspective(left, right, bottom, top, near, far) {
        let m = new Matrix4();
    
        m.set(0, 0, 2 * near / (right - left));
        m.set(1, 1, 2 * near / (top - bottom));
        m.set(2, 2, (near + far) / (near - far));
    
        m.set(0, 2, (right + left) / (right - left));
        m.set(1, 2, (top + bottom) / (top - bottom));
        m.set(2, 3, 2 * far * near / (near - far));
    
        m.set(3, 2, -1);
        m.set(3, 3, 0);
    
        return m;
    }

    multiplyVector4Array(vector) 
    {
        //0 4 8 12
        //1 5 9 13
        //2 6 10 14
        //3 7 11 15
        let result = [];
        let currDotProduct = 0;
        let vecIndexCounter = 0;
        for(let r = 0; r < 4; r++)
        {
            for(let c = 0; c < 4; c++)
            {
                let matrixVal = this.elements[r + (4*c)];
                currDotProduct += matrixVal * vector[vecIndexCounter];
                vecIndexCounter++;
                if(vecIndexCounter == 4)
                {
                    vecIndexCounter = 0;
                    result.push(currDotProduct);
                    currDotProduct = 0;
                } 
            }
        }
        return result;
    }

    multiplyVector4(vector) 
    {
        //0 4 8 12
        //1 5 9 13
        //2 6 10 14
        //3 7 11 15
        let input = [vector.x,vector.y,vector.z,vector.w];
        let result = [];
        let currDotProduct = 0;
        let vecIndexCounter = 0;
        for(let r = 0; r < 4; r++)
        {
            for(let c = 0; c < 4; c++)
            {
                let matrixVal = this.elements[r + (4*c)];
                currDotProduct += matrixVal * input[vecIndexCounter];
                vecIndexCounter++;
                if(vecIndexCounter == 4)
                {
                    vecIndexCounter = 0;
                    result.push(currDotProduct);
                    currDotProduct = 0;
                } 
            }
        }
        return new Vector4(result[0],result[1],result[2],result[3]);
    }

    multiplyMatrix4(otherMatrix)
    {
        let result = new Matrix4();
        for(let r = 0; r < 4; r++)
        {
            for(let c = 0; c < 4; c++)
            {
                for(let i = 0; i < 4; i++)
                {
                    result.elements[r + (4*c)] += this.elements[r + (4*i)] * otherMatrix.elements[i + (4*c)];
                }
            }
        }
        return result;
    }

    static rotateAroundAxis(axis, degrees)
    {
        //0 4 8 12
        //1 5 9 13
        //2 6 10 14
        //3 7 11 15
        let result = new Matrix4();
        let radians = degrees * (Math.PI/180);
        const s = Math.sin(radians);
        const c = Math.cos(radians);

        result.elements.fill(0);

        result.elements[0] = (1 - c) * axis.x * axis.x + c;
        result.elements[1] = (1 - c) * axis.y * axis.x + s * axis.z;
        result.elements[2] = (1 - c) * axis.z * axis.x - s * axis.y;
        result.elements[4] = (1 - c) * axis.x * axis.y - s * axis.z;
        result.elements[5] = (1 - c) * axis.y * axis.y + c;
        result.elements[6] = (1 - c) * axis.z * axis.y + s * axis.x;
        result.elements[8] = (1 - c) * axis.x * axis.z + s * axis.y;
        result.elements[9] = (1 - c) * axis.y * axis.z - s * axis.x;
        result.elements[10] = (1 - c) * axis.z * axis.z + c;
        result.elements[15] = 1;

        return result;
    }

    toBuffer() 
    {
        return this.elements;
    }
}