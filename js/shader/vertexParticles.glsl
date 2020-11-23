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
  pos.z = position.z + move * aSpeed + aOffset;



  vCoordinates = aCoordinates.xy;
  vPosition = position;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1. );
  gl_PointSize = 2000. * ( 1. / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}