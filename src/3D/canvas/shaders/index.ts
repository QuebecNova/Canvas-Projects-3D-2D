import { ErrorHandler } from '@/common/Error'
import fragment from './fragment.frag?raw'
import vertex from './vertex.vert?raw'

type InitialArguments = {
    gl: WebGL2RenderingContext
}

export class Shaders {
    static vertex = vertex
    static fragment = fragment
    private gl: WebGL2RenderingContext
    program: WebGLProgram
    attribLocations: {
        vertexBlockPosition: number
        vertexTexcoord: number
        vertexBlockData: number
    }
    uniformLocations: {
        normal: (face: number) => WebGLUniformLocation | null
        projectionViewMatrix: WebGLUniformLocation | null
        viewMatrix: WebGLUniformLocation | null
        translationMatrix: WebGLUniformLocation | null
        rotationMatrix: WebGLUniformLocation | null
        scaleMatrix: WebGLUniformLocation | null
    }

    constructor({ gl }: InitialArguments) {
        this.gl = gl
        const program = this.createProgram()

        this.program = program
        this.attribLocations = {
            vertexBlockPosition: this.gl.getAttribLocation(program, 'a_block_position'),
            vertexTexcoord: this.gl.getAttribLocation(program, 'a_texcoord'),
            vertexBlockData: this.gl.getAttribLocation(program, 'a_block_data'),
        }
        this.uniformLocations = {
            normal: (face: number) => this.gl.getUniformLocation(program, `u_normals[${face}]`),
            projectionViewMatrix: this.gl.getUniformLocation(program, 'u_projection_view_matrix'),
            viewMatrix: this.gl.getUniformLocation(program, 'u_view_matrix'),
            translationMatrix: this.gl.getUniformLocation(program, 'u_translation_matrix'),
            rotationMatrix: this.gl.getUniformLocation(program, 'u_rotation_matrix'),
            scaleMatrix: this.gl.getUniformLocation(program, 'u_scale_matrix'),
        }

        this.gl.useProgram(program)
    }

    private load(type: number, source: string) {
        const shader = this.gl.createShader(type)

        if (!shader) {
            throw ErrorHandler.throw(`Shader ${type} is failed to create`)
        }

        this.gl.shaderSource(shader, source)

        this.gl.compileShader(shader)

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            this.gl.deleteShader(shader)
            throw ErrorHandler.throw(`An error occurred while compling shader ${this.gl.getShaderInfoLog(shader)}`)
        }

        return shader
    }

    private createProgram() {
        const vertex = this.load(this.gl.VERTEX_SHADER, Shaders.vertex)
        const fragment = this.load(this.gl.FRAGMENT_SHADER, Shaders.fragment)

        if (!vertex || !fragment) {
            throw ErrorHandler.throw(`No shader is present, are you loading it correctly?`)
        }

        const program = this.gl.createProgram()
        this.gl.attachShader(program, vertex)
        this.gl.attachShader(program, fragment)
        this.gl.linkProgram(program)

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw ErrorHandler.throw(`Unable to initialize shader program: ${this.gl.getProgramInfoLog(program)}`)
        }

        return program
    }
}
