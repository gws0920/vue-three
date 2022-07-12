<template>
  <div>
    <ul>
      <li v-for="item in lights" :key="item" :class="{active: activeLight === item}" @click="changeLight(item)">{{ item }}</li>
    </ul>
    <ul class="images">
      <li v-for="item in images" :key="item" :class="{active: activeImg === item}" @click="changeImage(item)">{{ item }}</li>
    </ul>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
const [backgroundW, backgroundH] = [160, 90] // 图卡背景尺寸

import * as THREE from 'three'
import { OrbitControls  } from 'three/examples/jsm/controls/OrbitControls'
import CT from '@/utils/ColorTemperature'
export default {
  data () {
    return {
      lights: ['D65_1200Lux', 'D65_100Lux', 'TL84_100Lux'],
      images: ['background.png', 'ColorcheckerSGLeica.jpg', 'DxoCf.jpg', 'DxoMtf.jpg'],
      camera: null,
      renderer: null,
      // 灯光
      spotLightR: null,
      spotLightL: null,
      activeLight: 'D65_1200Lux',
      // 图卡
      imgMaterial: null, // 图片材质
      activeImg: 'background.png'
    }
  },
  mounted() {
    this.init(true)
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    init() {
      this.initRenderer()
      const scene = new THREE.Scene()

      const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 1, 1000)
      camera.position.set(30, 100, 400)
      // 环境光
      const light = new THREE.AmbientLight( 0x303030, 0.2 ); // soft white light
      scene.add( light );
      this.render = () => {
				this.renderer.render( scene, camera );
			}
      // 地面
      let material = new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } );
      let geometry = new THREE.PlaneGeometry( 2000, 2000 );
      let mesh = new THREE.Mesh( geometry, material );
      mesh.position.set( 0, - 1, 0 );
      mesh.rotation.x = - Math.PI * 0.5;
      mesh.receiveShadow = true;
      scene.add( mesh );

      const group = this.groupBackground(this.render)
      scene.add(group)

      // 灯光
      this.spotLightL = this.renderLight({
        target: group,
        y: backgroundH / 2,
        x: backgroundW / 2
      })
      scene.add( this.spotLightL );
      this.spotLightR = this.renderLight({
        target: group,
        y: backgroundH / 2,
        x: -backgroundW / 2
      })
      scene.add( this.spotLightR );
      
      const controls = new OrbitControls( camera, this.renderer.domElement );
      controls.addEventListener( 'change', this.render );
      controls.minDistance = 20;
      controls.maxDistance = 500;
      controls.maxPolarAngle = 0.49 * Math.PI
      controls.minPolarAngle = 0.05 * Math.PI
      controls.enablePan = false;
      this.render();
      controls.reset()
    },
    initRenderer() {
      const { devicePixelRatio, innerWidth, innerHeight } = window
      this.renderer = new THREE.WebGLRenderer({canvas: this.$refs.canvas})
      this.renderer.setPixelRatio(devicePixelRatio)
      this.renderer.setSize(innerWidth, innerHeight)
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      this.renderer.outputEncoding = THREE.sRGBEncoding
    },
    // 图卡group
    groupBackground(render) {
      const [imgW, imgH] = [80, 60] // 图片显示的尺寸
      const texture = new THREE.TextureLoader().load("/DxoCf.jpg", () => {
        render()
      });
      const group = new THREE.Group()
      const backgroundBox = new THREE.BoxGeometry(backgroundW, backgroundH, 1)
      const backgroundMaterial = new THREE.MeshBasicMaterial({ color: 0x666666})
      const backgroundMesh = new THREE.Mesh(backgroundBox, backgroundMaterial)
      backgroundMesh.position.set(0, 0, 0)
      backgroundMesh.castShadow = true;

      const imgBox = new THREE.BoxGeometry(imgW, imgH, 1)
      this.imgMaterial = new THREE.MeshPhongMaterial({map: texture})
      const imgMesh = new THREE.Mesh(imgBox, [null, null, null, null, this.imgMaterial, null ])
      imgMesh.position.set(0, 0, 0.1)

      group.add(backgroundMesh)
      group.add(imgMesh)
      group.position.set(0, backgroundH / 2 ,0)
      return group
    },
    renderLight(option) {
      // 灯光距离
      const {
        x = backgroundW / 2,
        y = backgroundH / 4, 
        z = 80, // 灯光距离
        target,
      } = option || {}
      const [type, lux] = this.activeLight.split('_')
      const spotLight = new THREE.SpotLight(CT[type]);
      spotLight.position.set(x, y, z);
      spotLight.angle = Math.PI / 6; // 从聚光灯的位置以弧度表示聚光灯的最大范围
      spotLight.penumbra = 0.1; // 聚光锥的半影衰减百分比
      spotLight.decay = 1; // 沿着光照距离的衰减量。
      spotLight.distance = 200; // 距离
      // 光功率power = intensity * 4π （一样会影响光强度）
      // spotLight.intensity = 1 // 光照强度
      spotLight.power = parseInt(lux) / 150
      spotLight.castShadow = true;
      spotLight.shadow.mapSize.width = 512;
      spotLight.shadow.mapSize.height = 512;
      spotLight.shadow.camera.near = 10;
      spotLight.shadow.camera.far = 200;
      spotLight.shadow.focus = 1;
      spotLight.target = target
      return spotLight
    },
    // 图卡路径动画
    animatePath() {
      // const points = [
      //   new THREE.Vector3(0, 0, 0),
      //   new THREE.Vector3(0, 100, 0), 

      //   new THREE.Vector3(0, 100, 10),
      //   new THREE.Vector3(0, 0, 10),
      // ]

    },
    helpers(scene, { light }) {
      // 帮助线条
      const lightHelper = new THREE.SpotLightHelper( light ); // 灯光 helper
      scene.add( lightHelper );
      const axesHelper = new THREE.AxesHelper( 50 ); // 坐标轴 helper
      axesHelper.setColors(0xff0000, 0xffff00, 0x00ffff) // x, y, z
      scene.add( axesHelper );
      // const shadowCameraHelper = new THREE.CameraHelper( light.shadow.camera ); // 相机 helper
      // scene.add( shadowCameraHelper );

      return { 
        lightHelper,
        //  axesHelper, 
        //  shadowCameraHelper 
        }
    },
    onResize() {
      const { innerWidth, innerHeight } = window
      this.camera.aspect = innerWidth / innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(innerWidth, innerHeight);
    },
    changeLight(item) {
      const [type, lux] = item.split('_')
      const power = parseInt(lux) / 150
      const color = CT[type]
      this.spotLightL.color = new THREE.Color(color)
      this.spotLightL.power = power
      this.spotLightR.color = new THREE.Color(color)
      this.spotLightR.power = power
      this.render()
      this.activeLight = item
    },
    changeImage(item) {
      new THREE.TextureLoader().load(`/${item}`, texture => {
        this.imgMaterial.map = texture
        this.render()
      });
      this.activeImg = item
    }
  }
}
</script>

<style scoped>
div {
  position: relative;
}
ul {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  color: white;
  list-style: none;
}
ul.images {
  right: 150px;
}
li {
  cursor: pointer;
  transition: color .25s;
}
li:hover, li.active {
  color: #409EFF;
}

</style>
