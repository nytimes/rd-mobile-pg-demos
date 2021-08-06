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
// https://github.com/mrdoob/three.js/pull/21654 - skypack+draco issues
dracoLoader.setDecoderPath('https://unpkg.com/three/examples/js/libs/draco/')
loader.setDRACOLoader(dracoLoader)

const rig = new CameraRig(camera, scene)
let controls

const controls3dof = new ThreeDOFControls(rig, {
  panFactor: Math.PI / 10,
  tiltFactor: Math.PI / 10,
  truckFactor: 0,
  pedestalFactor: 0,
})

function loadAsset(asset) {
  return new Promise( (resolve, reject) => {
    loader.load(asset, resolve, undefined, reject)
  })
}

Promise.all([loadAsset('./assets/0731_ALLEY_1M_6x2K_D_JP100.glb'), loadAsset('./assets/0731_ANIM_CAM_001.glb')])
.then( assets => {
  const [model, camera] = assets
  model.scene.traverse( child => {
    if(child.isMesh) {
      const map = child.material.map
      child.material = new MeshBasicMaterial({map})
    }
  })
  loading.style.display = 'none'
  scene.add(model.scene)
  rig.setAnimationClip(camera.animations[0], 'translation_null', 'rotation_null')
  rig.setAnimationTime(0)
  controls = new ScrollControls(rig, { 
    scrollElement, 
    dampingFactor: 1,
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
  controls.enable()
  controls3dof.enable()
})
.catch( e => console.log(e))


function render(t) {
  window.requestAnimationFrame(render)
  if(rig.hasAnimation) {
    controls.update(t)
    controls3dof.update(t)
  }
  renderer.render(scene, camera)
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight)
})


render()
