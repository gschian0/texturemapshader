import * as THREE from "three";
import {EffectComposer} from "../node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "../node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import {ShaderPass} from "../node_modules/three/examples/jsm/postprocessing/ShaderPass.js";
import {BloomPass } from "../node_modules/three/examples/jsm/postprocessing/BloomPass.js";
import {GlitchPass } from "../node_modules/three/examples/jsm/postprocessing/GlitchPass.js";
import {LUTPass } from "../node_modules/three/examples/jsm/postprocessing/GlitchPass.js";
import {HalftonePass } from "../node_modules/three/examples/jsm/postprocessing/HalfTonePass.js";
import {CopyShader} from "./shader/CopyShaderC.js";
import {ColorifyShader} from "../node_modules/three/examples/jsm/shaders/ColorifyShader.js";

import ppf from "./shader/ppf.glsl";
import ppv from "./shader/ppv.glsl";
import fragment from "./shader/fragment.glsl";
import fragmentP from "./shader/fragmentP.glsl";
import vertex from "./shader/vertex.glsl";
import vertexP from "./shader/vertexParticles.glsl";
import t1 from "./img/wispy.png";
import t2 from "./img/gtrpng.png";
import t3 from "./img/psyswirl.png";
import mask from "./img/smoke_04.png";
import dat from "dat-gui";
let checker = require('glsl-checker');
let map2 = require('glsl-map');
let OrbitControls = require("three-orbit-controls")(THREE);

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({antialias:'true'});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xffffff, 1); 
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.composer = new EffectComposer(this.renderer);

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      5000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 1000);
    this.textures = [
      new THREE.TextureLoader().load(t1),
      new THREE.TextureLoader().load(mask),
      new THREE.TextureLoader().load(t2),
      new THREE.TextureLoader().load(t3),
    ];

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;
    this.move = 0;

    this.isPlaying = true;

    
    

    this.mouseEffects();
    
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    this.composeEffects();
    // this.settings();
  }

  composeEffects(){
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.colShade = ColorifyShader;
    //this.colShade.uniforms.color.value.set = new THREE.Color(1.0,1.0,0.1);
    this.bloomPass = new ShaderPass(this.colShade);
    this.bloomPass.renderToScreen ='true';
    this.composer.addPass(this.bloomPass);
    
  }

  mouseEffects() {
    window.addEventListener('mousewheel',(e)=>{
      console.log(e.wheelDeltaY);
      this.move += e.wheelDeltaY/1000;
    })
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    let count = 512;
    let number = count*count;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        },
        t1 : { type: "t", value: this.textures[0]},
        
      },
      // wireframe: true,
       transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    this.geometry = new THREE.PlaneGeometry(512, 512, 100, 100);

    this.plane = new THREE.Mesh(this.geometry, this.material);
   

    this.pointsMaterial = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        },
        map : { type: "t", value: this.textures[3]},
        mask : {type: "t", value: this.textures[1]}, 
        move : {type: "f", value: 0},
      },
      // wireframe: true,
       transparent: true,
       depthTest: false,
       depthWrite: false,
      vertexShader: vertexP,
      fragmentShader: fragmentP
    });

    this.pointsGeometry = new THREE.BufferGeometry();

    this.positions = new THREE.BufferAttribute(new Float32Array(number*3),3);
    this.colors = new THREE.BufferAttribute(new Float32Array(number*3),3);
    this.coordinates = new THREE.BufferAttribute(new Float32Array(number*3),3);
    this.speeds = new THREE.BufferAttribute(new Float32Array(number),1);
    this.offset = new THREE.BufferAttribute(new Float32Array(number),1);
    function rand(a,b){
      return a+(b-a)*Math.random();
    };

    let index = 0;
    for(let i = 0; i < count; i++){
      let posX = i - count/2;
      for (let j = 0; j < count; j++){
        this.positions.setXYZ(index,posX,(j-256),Math.sin(i*j));
        this.coordinates.setXYZ(index,i,j,0);
        this.offset.setX(index,rand(-1000,1000));
        this.speeds.setX(index,rand(0,1));
        this.colors.setXYZ(index,Math.random(0.,1.),Math.random(0.,1.),Math.random(0.,1.));
        index++;
      }
    }
    this.pointsGeometry.setAttribute("position", this.positions);
    this.pointsGeometry.setAttribute("aCoordinates", this.coordinates);
    this.pointsGeometry.setAttribute("aSpeed", this.speeds);
    this.pointsGeometry.setAttribute("aOffset", this.offset);
    this.pointsGeometry.setAttribute("aColors", this.colors);
    

    this.points = new THREE.Points(this.pointsGeometry, this.pointsMaterial);

    this.scene.add(this.points);

    // this.sphereGeometry = new THREE.SphereBufferGeometry(5,5,5,5);
    // this.sphereMaterial = new THREE.MeshNormalMaterial();
    //  this.scene.add(this.plane);

  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {

    
    if (!this.isPlaying) return;
    this.time += 0.09;
    this.pointsMaterial.uniforms.time.value = this.time;
    this.pointsMaterial.uniforms.move.value = this.move;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    //this.composer.render(this.time);
  }
}

new Sketch({
  dom: document.getElementById("container")
});
