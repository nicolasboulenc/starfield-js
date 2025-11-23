"use strict"

class ParticleSystem {
    constructor(gl) {
        this.gl = gl;
        this.particleCount = 500;
        this.init();
    }

    init() {
        // Create particle data
        const positions = new Float32Array(this.particleCount * 2);
        const sizes = new Float32Array(this.particleCount);
        const colors = new Float32Array(this.particleCount * 4);

        for (let i = 0; i < this.particleCount; i++) {
            // Random positions
            positions[i * 2] = Math.random();
            positions[i * 2 + 1] = Math.random();
            
            // Random sizes
            sizes[i] = 2.0 + Math.random() * 8.0;
            
            // Random colors (pastel)
            colors[i * 4] = 0.5 + Math.random() * 0.5;     // R
            colors[i * 4 + 1] = 0.5 + Math.random() * 0.5; // G
            colors[i * 4 + 2] = 0.5 + Math.random() * 0.5; // B
            colors[i * 4 + 3] = 0.7 + Math.random() * 0.3; // A
        }

        // Create and setup buffers
        this.createBuffer('position', positions, 2);
        this.createBuffer('size', sizes, 1);
        this.createBuffer('color', colors, 4);

        // Create shader program
        this.program = this.createProgram(vertexShader, fragmentShader);
        
        // Get attribute locations
        this.attribs = {
            position: gl.getAttribLocation(this.program, 'a_position'),
            size: gl.getAttribLocation(this.program, 'a_size'),
            color: gl.getAttribLocation(this.program, 'a_color'),
        };

        // Get uniform locations
        this.uniforms = {
            resolution: gl.getUniformLocation(this.program, 'u_resolution'),
        };
    }

    createBuffer(name, data, size) {
        if (!this.buffers) this.buffers = {};
        
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
        
        this.buffers[name] = {
            buffer,
            data,
            size
        };
    }

    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
        }
        
        return program;
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
        }
        
        return shader;
    }

    render() {
        const gl = this.gl;
        const time = (Date.now() - this.startTime) * 0.001;
        
        gl.useProgram(this.program);
        
        // Set uniforms
        gl.uniform2f(this.uniforms.resolution, gl.canvas.width, gl.canvas.height);
        
        // Setup attributes
        this.setupAttribute('position', this.attribs.position, 2);
        this.setupAttribute('size', this.attribs.size, 1);
        this.setupAttribute('color', this.attribs.color, 4);
        
        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        
        // Draw particles
        gl.drawArrays(gl.POINTS, 0, this.particleCount);
    }

    setupAttribute(name, location, size) {
        const gl = this.gl;
        const buffer = this.buffers[name];
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    }
}


async function init(gl) {

    let response = await fetch("particle.vert")
    vertexShader = await response.text()

    response = await fetch("particle.frag")
    fragmentShader = await response.text()
    
    particleSystem = new ParticleSystem(gl);
    animate()
}


// Initialize WebGL context
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl2');

let vertexShader, fragmentShader;
let particleSystem
init(gl)

// Create particle system

// Animation loop
function animate() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    particleSystem.render();
    requestAnimationFrame(animate);
}


window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
});