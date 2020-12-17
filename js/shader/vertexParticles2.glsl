uniform float time;
varying vec2 vUv;
attribute vec3 aCoordinates;
varying vec2 vCoordinates;
varying vec3 vPosition;
attribute float aSpeed;
attribute float aOffset;

uniform float move;

float PI = 3.141592653589793238;
void main() {
  vUv = uv;
  vec3 pos = position;
  
  pos.z = mod(position.z + move * aSpeed + aOffset +time*29.0,2000.);
vec3 mixer = mix(pos, position, fract(-time*0.1));


  vCoordinates = aCoordinates.xy;
  vPosition = pos;
  vec4 mvPosition = modelViewMatrix * vec4( mixer, 1. );
  gl_PointSize = 2000. * ( 1. / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;

}