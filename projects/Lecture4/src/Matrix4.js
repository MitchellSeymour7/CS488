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

    static rotateX(rotateFactor){
        let ret = new Matrix4();
        ret.elements[0] = Math.cos(rotateFactor);
        ret.elements[2] = Math.sin(rotateFactor);
        ret.elements[8] = Math.sin(rotateFactor) * -1;
        ret.elements[10] = Math.cos(rotateFactor);
        ret.elements[5] = 1;
        ret.elements[15] = 1;
        return ret;
    }
    
    static rotateY(rotateFactor){
        let ret = new Matrix4();
        ret.elements[5] = Math.cos(rotateFactor);
        ret.elements[6] = Math.sin(rotateFactor);
        ret.elements[9] = Math.sin(rotateFactor) * -1;
        ret.elements[10] = Math.cos(rotateFactor);
        ret.elements[0] = 1;
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

    static rotateAll(a,b,c){
        let ret = new Matrix4();
        let sinA = Math.sin(a);
        let cosA = Math.cos(a);
        let sinB = Math.sin(b);
        let cosB = Math.cos(b);
        let sinC = Math.sin(c);
        let cosC = Math.cos(c);
    
        ret.elements[0] = cosA*cosB*cosC-sinA*sinC;
        ret.elements[1] = sinA*cosB*cosC+cosA*sinC ;
        ret.elements[2] = -sinB*cosC ;

        ret.elements[4] = -cosA*cosB*sinC-sinA*cosC ;
        ret.elements[5] = -sinA*cosB*sinC+cosA*cosC ;
        ret.elements[6] = sinB*sinC ;

        ret.elements[8] = cosA*sinB ;
        ret.elements[9] = sinA*sinB ;
        ret.elements[10] = cosB ;
        

        ret.elements[15] = 1;
        return ret;
    }

    static multiplyVector4(matrix, vector){
        let ret = new Float32Array(4);
        for(let i = 0; i < 4; i++) {
            ret.elements[0] = ret.elements[0]+(matrix.elements[0+(i*4)]*vector[0]);
            ret.elements[1] = ret.elements[1]+(matrix.elements[1+(i*4)]*vector[1]);
            ret.elements[2] = ret.elements[2]+(matrix.elements[2+(i*4)]*vector[2]);
            ret.elements[3] = ret.elements[3]+(matrix.elements[3+(i*4)]*vector[3]);
        }
        return ret;        
    }

    static multiplyMatrix4(matrix1, matrix2){
        let ret = new Matrix4();
        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                for(let k = 0; k < 4; k++) {
                    ret.elements[i*4+j] = ret.elements[i*4+j]+((matrix1.elements[k*4+j])*(matrix2.elements[i*4+k]));
                }
            }
        }
        return ret;  
    }

    static multiply2Matrix4(matrix1, matrix2, matrix3){
        let ret = new Matrix4();
        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                for(let k = 0; k < 4; k++) {
                    ret.elements[i*4+j] = ret.elements[i*4+j]+((matrix1.elements[k*4+j])*(matrix2.elements[i*4+k]));
                }
            }
        }
        return this.multiplyMatrix4(ret,matrix3);  
    }

    toBuffer(){
        return this.elements;
    }

}