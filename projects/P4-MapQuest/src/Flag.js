import {Vector3} from './Vector3';
import {VertexAttributes} from './vertex_attributes';
import {ShaderProgram} from './shader_program';
import {VertexArray} from './vertex_array';

export class Flag {
    
    static makeFlag() {
        let positions = [
          // Front Face
        -.03, 0,  .03,  .03, 0,  .03, -.03,  2,  .03,  .03,  2,  .03,
        // Back Face
        -.03, 0, -.03,  .03, 0, -.03, -.03,  2, -.03,  .03,  2, -.03,
        // Right Face
        .03, 0,  .03,  .03, 0, -.03,  .03,  2,  .03,  .03,  2, -.03,
         // Left Face
        -.03,  2,  .03, -.03,  2, -.03, -.03, 0,  .03, -.03, 0, -.03,
        // Top Face
        -.03,  2, -.03,  .03,  2, -.03, -.03,  2,  .03,  .03,  2,  .03,
        // Bottom Face
        -.03, 0, -.03,  .03, 0, -.03, -.03, 0,  .03,  .03, 0,  .03,

        //flag front 
        .03, 2, 0,
        1, 1.85, 0,
        .03, 1.7, 0,
        ];
        let faces = [
            0, 1, 2, 1, 3, 2,
        
            4, 5, 6, 5, 7, 6,
         
            8, 9, 10, 9, 11, 10,
        
            12, 13, 14, 13, 15, 14,
        
            16, 17, 18, 17, 19, 18,
        
            20, 21, 22, 21, 23, 22,

            //
            24, 25, 26,
            24, 26, 25,
         ];
        let normals = [
            // front
            0,0,1,0,0,1,0,0,1,0,0,1,
            // back
            0,0,-1,0,0,-1,0,0,-1,0,0,-1,
            // right
            1,0,0,1,0,0,1,0,0,1,0,0,
            // left
            -1,0,0,-1,0,0,-1,0,0,-1,0,0,
            // top
            0,1,0,0,1,0,0,1,0,0,1,0,
            // bottom
            0,-1,0,0,-1,0,0,-1,0,0,-1,0,
            //
            0,1,0,
            0,1,0,
            0,1,0,
        ];
        let colors = [
            1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,
            //
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
        ]
        return Flag.toSource(positions, faces, normals, colors);
    }

    static toSource(positions, faces, normals, colors) {
        const flagAttributes = new VertexAttributes();
        flagAttributes.addAttribute('position', positions.length / 3, 3, positions);
        flagAttributes.addAttribute('normal', normals.length / 3, 3, normals);
        flagAttributes.addAttribute('color', colors.length/3, 3, colors);

        flagAttributes.addIndices(faces);

        const vertexSource = `
        uniform mat4 clipFromEye;
        uniform mat4 eyeFromModel;
        uniform mat4 objPosition;

        in vec3 position;
        in vec3 normal;
        in vec3 color;

        out vec3 fnormal;
        out vec3 fposition;
        out vec3 fcolor;

        void main() {
            gl_Position = clipFromEye * eyeFromModel * objPosition * vec4(position, 1.0);
            fnormal = (objPosition  * vec4(normal, 0)).xyz;
            fposition = position;
            fcolor = color;
        }
        `;
        
        const fragmentSource = `
        uniform sampler2D image;

        const vec3 light_direction = normalize(vec3(1.0, 1.0, 1.0));
        const float ambientWeight = 0.5;

        in vec3 fnormal;
        in vec3 fposition;
        in vec3 fcolor;


        out vec4 fragmentColor;

        void main() {
            vec3 lightColor = fcolor;
            
            vec3 normal = normalize(fnormal);

            //diffuse
            float litness = max(0.0, dot(normal, light_direction));
            vec3 diffuse = litness * lightColor * (1.0 - ambientWeight);

            // Ambient
            vec3 ambient = lightColor * ambientWeight;

            vec3 rgb = ambient + diffuse;
            fragmentColor = vec4(rgb, 1.0);
        }
        `;
        let flagShaderProgram = new ShaderProgram(vertexSource, fragmentSource);
        let flagVertexArray = new VertexArray(flagShaderProgram, flagAttributes);
        return {flagShaderProgram, flagVertexArray};
    }

}

