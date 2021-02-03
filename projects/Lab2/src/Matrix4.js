export class Matrix4{
    constructor() {
        this.elements = new Float32Array(16);
    }
    /*  0  4  8  12
        1  5  9  13
        2  6  10 14
        3  7  11 15
    */
    
    static identity() {
        let ret = new Matrix4();
        ret.elements[0] = 1;
        ret.elements[5] = 1;
        ret.elements[10] = 1;
        ret.elements[15] = 1;
        return ret;
    }

    static scale(scaleFactor) {
        let ret = new Matrix4();
        ret.elements[0]  = scaleFactor[0];
        ret.elements[5]  = scaleFactor[1];
        ret.elements[10] = scaleFactor[2];
        ret.elements[15] = 1;
        return ret;
    }

    static translate(translateFactor){
        let ret = new Matrix4();
        ret.elements[12] = translateFactor[0];
        ret.elements[13] = translateFactor[1];
        ret.elements[14] = translateFactor[2];
        ret.elements[0] = 1;
        ret.elements[5] = 1;
        ret.elements[10] = 1;
        ret.elements[15] = 1;
        return ret;
    }

    static rotateZ(rotateFactor){
        let ret = new Matrix4();
        ret.elements[0] = Math.cos(rotateFactor);
        ret.elements[1] = Math.sin(rotateFactor);
        ret.elements[4] = Math.sin(rotateFactor) * -1;
        ret.elements[5] = Math.cos(rotateFactor);
        ret.elements[10] = 1;
        ret.elements[15] = 1;
        return ret;
    }

    static multiplyVector4(matrix, vector){
        let ret = new Float32Array(4);
        for(let i = 0; i < 4; i++) {
            ret [0] = ret[0]+(matrix[0+(i*4)]*vector[0]);
            ret [1] = ret[1]+(matrix[1+(i*4)]*vector[1]);
            ret [2] = ret[2]+(matrix[2+(i*4)]*vector[2]);
            ret [3] = ret[3]+(matrix[3+(i*4)]*vector[3]);
        }
        return ret;        
    }

    static multiplyMatrix4(matrix1, matrix2){
        let ret = new Matrix4();
        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                for(let k = 0; k < 4; k++) {
                    ret [i*4+j] = ret[i*4+j]+(matrix1[k*4+j]*matrix2[i*4+k]);
                }
            }
        }
        return ret;  
    }

    toBuffer(){
        return this.elements;
    }

}