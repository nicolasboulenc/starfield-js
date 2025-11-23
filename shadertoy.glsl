float DistancePointToSegment(vec2 p, vec2 a, vec2 b)
{
    vec2 ab = b - a;
    vec2 pa = p - a;
    float t = clamp(dot(pa, ab) / dot(ab, ab), 0.0, 1.0);
    vec2 closestPoint = a + t * ab;
    float d = length(p - closestPoint);
    return d;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    // Coordinate normalization
    vec2 uv = fragCoord / iResolution.xy;
    uv -= 0.5;
    uv.x *= iResolution.x / iResolution.y;
    uv *= 2.0;
    
    // Line
    vec2 start = vec2(0.0, 0.0);
    float angle = 0.0;
    float trail_length = 0.5;
    vec2 dir = vec2(cos(angle), sin(angle)) * trail_length;
    
    float dist = DistancePointToSegment(uv, start, dir);
    //float thickness = smoothstep(0.2, 0.2, dist);
    float thickness = smoothstep(0.2, 0.2, dist);

    // Add glow effect
    vec3 finalColor = vec3(1.0, 0.0, 0.0) * thickness;
    fragColor = vec4(finalColor, 1.0);
}