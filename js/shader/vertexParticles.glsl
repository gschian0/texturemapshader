#pragma glslify: map2 = require('glsl-map')
uniform sampler2D mask;
uniform float time;
varying vec2 vUv;
attribute vec3 aCoordinates;
varying vec2 vCoordinates;
varying vec3 vPosition;
attribute float aSpeed;
attribute float aOffset;
attribute vec3 aColors;
varying vec3 vColors;
uniform float move;

float PI = 3.141592653589793238;
void main() {
  vUv = uv;
  vec3 pos = position;
  vec4 texture = texture2D(mask, vUv);
  float disp = texture.b;
  pos.z = mod(position.z + move * aSpeed + aOffset +time*10.0,2000.);
  vec3 mixer = mix(position, position, fract(-time*0.1));
  // vec3 boom = vec3(map2( pos, 0.,1000., 0.,50.0));
  vColors = aColors;
  vCoordinates = aCoordinates.xy;
  vPosition = pos;
  vec3 newPos = position + normal * disp* 10.0;
  vec4 mvPosition = modelViewMatrix * vec4( newPos, 1. );
  gl_PointSize = 2000. * ( 1. / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;

}