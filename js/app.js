import * as THREE from "three";
import fragment from "./shader/fragment.glsl";
import fragmentP from "./shader/fragmentP.glsl";
import vertex from "./shader/vertex.glsl";
import vertexP from "./shader/vertexParticles.glsl";
import t1 from "./img/psyswirl.png";
import mask from "./img/magic_03.png";
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
    this.renderer.setClearColor(0x000000, 1); 
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 700);
    this.textures = [
      new THREE.TextureLoader().load(t1),
      new THREE.TextureLoader().load(mask)
    ];

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;
    
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
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
        map : { type: "t", value: this.textures[0]},
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
        this.positions.setXYZ(index,posX,(j-256),0);
        this.coordinates.setXYZ(index,i,j,0);
        this.offset.setX(index,rand(-1000,1000));
        this.speeds.setX(index,rand(0.4,1));
        index++;
      }
    }
    this.pointsGeometry.setAttribute("position", this.positions);
    this.pointsGeometry.setAttribute("aCoordinates", this.coordinates);
    this.pointsGeometry.setAttribute("aSpeed", this.speeds);
    this.pointsGeometry.setAttribute("aOffset", this.offset);

    this.points = new THREE.Points(this.pointsGeometry, this.pointsMaterial);

    this.scene.add(this.points);
    // this.scene.add(this.plane);

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
    this.time += 0.05;
    this.pointsMaterial.uniforms.time.value = this.time;
    this.pointsMaterial.uniforms.move.value = this.move;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container")
});
