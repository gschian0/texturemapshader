/**
 * Full-screen textured quad shader
 */

var CopyShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"opacity": { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",
		" vec2 nuUV = vUv;",
		"nuUV.x += sin(20.0*nuUV.y);",
		"	vec4 texel = texture2D( tDiffuse, nuUV );",
		"	gl_FragColor = opacity * texel;",

		"}"

	].join( "\n" )

};

export { CopyShader };
