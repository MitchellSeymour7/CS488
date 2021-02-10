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
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = Math.cos(degrees);
        m.elements[1] = Math.sin(degrees);
        m.elements[4] = -1 * Math.sin(degrees);
        m.elements[5] = Math.cos(degrees);
        m.elements[10] = 1;
        m.elements[15] = 1;
        return m; 
    }

    static rotateX(degrees)
    {
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[5] = Math.cos(degrees);
        m.elements[6] = Math.sin(degrees);
        m.elements[9] = -1 * Math.sin(degrees);
        m.elements[10] = Math.cos(degrees);
        m.elements[0] = 1;
        m.elements[15] = 1;
        return m; 
    }

    static rotateY(degrees)
    {
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = Math.cos(degrees);
        m.elements[2] = Math.sin(degrees);
        m.elements[8] = -1 * Math.sin(degrees);
        m.elements[10] = Math.cos(degrees);
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

    multiplyVector4(vector) 
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
                //console.log('looking at matrix index ' + r);
                let matrixVal = this.elements[r + (4*c)];
                currDotProduct += matrixVal * vector[vecIndexCounter];
                //console.log(currDotProduct);
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

    multiplyMatrix4(otherMatrix)
    {
        let result = new Matrix4();
        for(let r = 0; r < 4; r++)
        {
            for(let c = 0; c < 4; c++)
            {
                for(let i = 0; i < 4; i++)
                {
                    //console.log('writing to result element: ' + (r + (4*c)));
                    result.elements[r + (4*c)] += this.elements[r + (4*i)] * otherMatrix.elements[i + (4*c)];
                }
            }
        }
        return result;
    }

    toBuffer() 
    {
        return this.elements;
    }
}