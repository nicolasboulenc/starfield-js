#version 300 es
precision highp float;

// Particle attributes
in vec2 a_position;
in float a_size;
in vec4 a_color;

// Uniforms
uniform vec2 u_resolution;

// Output to fragment shader
out vec4 v_color;


void main() {
    // Calculate normalized position
    vec2 position = a_position;
    
    // Convert to clip space
    vec2 clipSpace = (position * 2.0 - 1.0) * vec2(1.0, u_resolution.y / u_resolution.x);
    
    // Output
    gl_Position = vec4(clipSpace, 0.0, 1.0);
    gl_PointSize = a_size;
    
    // Fade based on lifetime
    // float alpha = 1.0 - abs(fract(a_lifetime + time * 0.5) - 0.5) * 2.0;
    // v_color = vec4(a_color.rgb, a_color.a * alpha);
    v_color = a_color;
    // v_lifetime = a_lifetime;
}