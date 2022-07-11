<template>
  <div>
    <span>灯光设置</span>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls  } from 'three/examples/jsm/controls/OrbitControls'
export default {
  data () {
    return {

    }
  },
  mounted() {
    this.init(true)
  },
  methods: {
    init(showHelper = false) {
      const renderer = new THREE.WebGLRenderer({canvas: this.$refs.canvas})
      const { devicePixelRatio, innerWidth, innerHeight } = window
      renderer.setPixelRatio(devicePixelRatio)
      renderer.setSize(innerWidth, innerHeight)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputEncoding = THREE.sRGBEncoding

      const scene = new THREE.Scene()

      const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 1, 1000)
      camera.position.set(160, 40, 10)

      // 灯光
      const spotLight = this.renderLight()
      scene.add( spotLight );
      // 帮助线条
      const { lightHelper, shadowCameraHelper } = showHelper ? this.helpers(scene, { light: spotLight }) : {}

      // 地面
      let material = new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } );
      let geometry = new THREE.PlaneGeometry( 2000, 2000 );
      let mesh = new THREE.Mesh( geometry, material );
      mesh.position.set( 0, - 1, 0 );
      mesh.rotation.x = - Math.PI * 0.5;
      mesh.receiveShadow = true;
      scene.add( mesh );

      // 长方体
      material = new THREE.MeshPhongMaterial( { color: 0x4080ff, dithering: true } );
      geometry = new THREE.BoxGeometry(15, 3, 15);
      mesh = new THREE.Mesh( geometry, material );
      mesh.position.set( 0, 5, 0 );
      mesh.castShadow = true;
      scene.add( mesh );

      // 模拟光线圆锥
      // geometry = new THREE.ConeGeometry(50, 50, 32)
      // geometry.rotateX(Math.PI * 0.115)
      // material = new THREE.MeshBasicMaterial( { color: 'transparent', dithering: true } );
      // material.alphaMap = 0x000000
      // mesh = new THREE.Mesh( geometry, material );
      // mesh.position.set( 0, 16, 6 );
      // // mesh.castShadow = true;
      // scene.add( mesh );
      // console.log(geometry)
  
      const controls = new OrbitControls( camera, renderer.domElement );
      controls.addEventListener( 'change', render );
      controls.minDistance = 20;
      controls.maxDistance = 500;
      controls.maxPolarAngle = 0.4 * Math.PI
      controls.minPolarAngle = 0 * Math.PI
      controls.enablePan = false;
      function render() {

				lightHelper?.update();
				shadowCameraHelper?.update();

				renderer.render( scene, camera );

			}
      render();
      controls.reset()
    },
    renderLight() {
      const spotLight = new THREE.SpotLight( 0xffffff );
      spotLight.position.set( 0, 40, 15 );
      spotLight.angle = Math.PI / 4;
      spotLight.penumbra = 0.1;
      spotLight.decay = 2;
      spotLight.distance = 200;

      spotLight.castShadow = true;
      spotLight.shadow.mapSize.width = 512;
      spotLight.shadow.mapSize.height = 512;
      spotLight.shadow.camera.near = 10;
      spotLight.shadow.camera.far = 200;
      spotLight.shadow.focus = 1;
      return spotLight
    },
    helpers(scene, { light }) {
      // 帮助线条
      const lightHelper = new THREE.SpotLightHelper( light ); // 灯光 helper
      scene.add( lightHelper );
      // const axesHelper = new THREE.AxesHelper( 50 ); // 坐标轴 helper
      // axesHelper.setColors(0xff0000, 0xffff00, 0x00ffff) // x, y, z
      // scene.add( axesHelper );
      // const shadowCameraHelper = new THREE.CameraHelper( light.shadow.camera ); // 相机 helper
      // scene.add( shadowCameraHelper );

      return { 
        lightHelper,
        //  axesHelper, 
        //  shadowCameraHelper 
        }
    }
  }
}
</script>

<style scoped>
div {
  position: relative;
}
span {
  position: absolute;
  top: 0;
}
</style>
