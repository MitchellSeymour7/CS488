import {Vector3} from './Vector3';
import {VertexAttributes} from './vertex_attributes';
import {ShaderProgram} from './shader_program';
import {VertexArray} from './vertex_array';

export class Rock {
    
    static makeRock() {
        let positions = [
            1,-.7,0,
            .4,-.6,1,
            -.3,-.5,-.2,
            0, .1, .8,
            1, .0, .8,
            .9, .2, -.6,
            0, .5, -.3,
            .5, .8, .3,

        ];
        let faces = [
            0,1,2, 
            1,3,2,
            3,4,1,
            0,4,1,
            0,4,5,
            0,5,2,
            5,2,6,
            6,2,3,
            3,6,7,
            3,4,7,
            5,4,7,
            5,6,7,
         ];
        let normals = positions
        let colors = [
            .5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,
            .5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,
        ]
        return Rock.toSource(positions, faces, normals, colors);
    }

    static toSource(positions, faces, normals, colors) {
        const rockAttributes = new VertexAttributes();
        rockAttributes.addAttribute('position', positions.length / 3, 3, positions);
        rockAttributes.addAttribute('normal', normals.length / 3, 3, normals);
        rockAttributes.addAttribute('color', colors.length/3, 3, colors);

        rockAttributes.addIndices(faces);

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
        let rockShaderProgram = new ShaderProgram(vertexSource, fragmentSource);
        let rockVertexArray = new VertexArray(rockShaderProgram, rockAttributes);
        return {rockShaderProgram, rockVertexArray};
    }

}

