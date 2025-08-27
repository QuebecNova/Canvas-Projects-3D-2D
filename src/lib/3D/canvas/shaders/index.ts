import { ErrorHandler } from '@/lib/common/Error'
import fragment from './fragment.frag?raw'
import vertex from './vertex.vert?raw'

type InitialArguments = {
    gl: WebGLRenderingContext
}

export class Shaders {
    static vertex = vertex
    static fragment = fragment
    private gl: WebGLRenderingContext
    program?: WebGLProgram
    attribLocations: {
        vertexPosition: number
        vertexColor: number
        vertexTexture: number
        vertexBufferMatrix: number
    } = {
        vertexPosition: 0,
        vertexColor: 0,
        vertexTexture: 0,
        vertexBufferMatrix: 0,
    }
    uniformLocations: {
        projectionViewMatrix: WebGLUniformLocation | null
        viewMatrix: WebGLUniformLocation | null
        translationMatrix: WebGLUniformLocation | null
        rotationMatrix: WebGLUniformLocation | null
        scaleMatrix: WebGLUniformLocation | null
    } = {
        projectionViewMatrix: null,
        viewMatrix: null,
        translationMatrix: null,
        rotationMatrix: null,
        scaleMatrix: null,
    }

    constructor({ gl }: InitialArguments) {
        this.gl = gl
        const program = this.createProgram()
        if (!program) return

        this.program = program
        this.attribLocations = {
            vertexPosition: this.gl.getAttribLocation(program, 'a_position'),
            vertexColor: this.gl.getAttribLocation(program, 'a_color'),
            vertexTexture: this.gl.getAttribLocation(program, 'a_texcoord'),
            vertexBufferMatrix: this.gl.getAttribLocation(
                program,
                'a_buffer_matrix'
            ),
        }
        this.uniformLocations = {
            projectionViewMatrix: this.gl.getUniformLocation(
                program,
                'u_projection_view_matrix'
            ),
            viewMatrix: this.gl.getUniformLocation(program, 'u_view_matrix'),
            translationMatrix: this.gl.getUniformLocation(
                program,
                'u_translation_matrix'
            ),
            rotationMatrix: this.gl.getUniformLocation(
                program,
                'u_rotation_matrix'
            ),
            scaleMatrix: this.gl.getUniformLocation(program, 'u_scale_matrix'),
        }
    }

    private load(type: number, source: string) {
        const shader = this.gl.createShader(type)

        if (!shader) {
            ErrorHandler.throw(`Shader ${type} is failed to create`)
            return
        }

        this.gl.shaderSource(shader, source)

        this.gl.compileShader(shader)

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            ErrorHandler.throw(
                `An error occurred while compling shader ${this.gl.getShaderInfoLog(shader)}`
            )
            this.gl.deleteShader(shader)
            return
        }

        return shader
    }

    private createProgram() {
        const vertex = this.load(this.gl.VERTEX_SHADER, Shaders.vertex)
        const fragment = this.load(this.gl.FRAGMENT_SHADER, Shaders.fragment)

        if (!vertex || !fragment) {
            ErrorHandler.throw(
                `No shader is present, are you loading it correctly?`
            )
            return
        }

        const program = this.gl.createProgram()
        this.gl.attachShader(program, vertex)
        this.gl.attachShader(program, fragment)
        this.gl.linkProgram(program)

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            ErrorHandler.throw(
                `Unable to initialize shader program: ${this.gl.getProgramInfoLog(program)}`
            )
            return
        }

        return program
    }
}
