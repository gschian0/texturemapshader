uniform float time;
uniform float progress;
uniform sampler2D t1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D map;
uniform sampler2D mask;
uniform float move;
varying vec2 vCoordinates;
//varying vec3 vColors;

float PI = 3.141592653589793238;
void main()	{
    vec4 maskTexture = texture2D(mask,gl_PointCoord);
	vec2 myUV = vec2(vCoordinates.x/512.,vCoordinates.y/512.);
    vec4 image = texture2D(map,myUV);
	float alpha = clamp(0.,1.,abs(vPosition.z/1000.0));
    gl_FragColor = image;
    
    
    //gl_FragColor = vec4(myUV,0.0,1.);
    gl_FragColor.a *= maskTexture.r*alpha;
    // gl_FragColor = vec4(alpha);
}