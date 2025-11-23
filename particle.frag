#version 300 es
precision highp float;

in vec4 v_color;
out vec4 fragColor;

void main() {
    // Create circular particles
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    // Discard fragments outside the circle
    if (dist > 0.3) {
        discard;
    }
    
    // Soft edges
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    
    // Color variation based on lifetime
    vec3 color = v_color.rgb;
    fragColor = vec4(color, v_color.a * alpha);
}