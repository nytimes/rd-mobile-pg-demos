import { Scene, PerspectiveCamera, WebGLRenderer, sRGBEncoding, Color, MeshBasicMaterial } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { CameraRig, ScrollControls, ThreeDOFControls } from '@threebird/controls'

const canvasParent = document.querySelector('.canvas-parent')
const scrollElement = document.querySelector('.scroller')
const loading = document.querySelector('.loading')

const scene = new Scene()
const camera = new PerspectiveCamera(75, canvasParent.clientWidth/canvasParent.clientHeight, 0.001, 1000)
const renderer = new WebGLRenderer()
renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight)
renderer.outputEncoding = sRGBEncoding
scene.background = new Color( 0x1d1d1d )
canvasParent.appendChild(renderer.domElement)

const loader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://unpkg.com/three/examples/js/libs/draco/')
loader.setDRACOLoader(dracoLoader)

const rig = new CameraRig(camera, scene)
let scrollControls, threeDOFControls

function initializeControls(camera) {
  rig.setAnimationClip(camera.animations[0], 'translation_null', 'rotation_null')
  rig.setAnimationTime(0)
  scrollControls = new ScrollControls(rig, { 
    scrollElement, 
    dampingFactor: 0.5,
    startOffset: '-50vh',
    endOffset: '-50vh',
    scrollActions: [
      { 
        start: '0%', 
        end: '15%', 
        callback: transitionTop
      },
      { 
        start: '85%', 
        end: '100%', 
        callback: transitionBottom
      }
    ]
  })
  
  function transitionTop(progress) {
    renderer.domElement.style.opacity = progress
  }
  
  function transitionBottom(progress) {
    renderer.domElement.style.opacity = 1 - progress
  }

  threeDOFControls = new ThreeDOFControls(rig, {
    panFactor: Math.PI / 10,
    tiltFactor: Math.PI / 10,
    truckFactor: 0,
    pedestalFactor: 0,
  })

  scrollControls.enable()
  threeDOFControls.enable()
}

function resetMaterials(model) {
  model.scene.traverse( child => {
    if(child.isMesh) {
      const map = child.material.map
      child.material = new MeshBasicMaterial({map})
    }
  })
}

Promise.all([loader.loadAsync('./assets/0731_ALLEY_1M_6x2K_D_JP100.glb'), loader.loadAsync('./assets/0731_ANIM_CAM_001.glb')])
.then( assets => {
  const [model, camera] = assets
  resetMaterials(model)
  initializeControls(camera)
  scene.add(model.scene)
  loading.style.display = 'none'
})
.catch( e => console.log(e))


function render(t) {
  window.requestAnimationFrame(render)
  if(rig.hasAnimation) {
    scrollControls.update(t)
    threeDOFControls.update(t)
  }
  renderer.render(scene, camera)
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight)
})

render()
