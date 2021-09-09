import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  sRGBEncoding,
  Clock,
  Vector3,
  Quaternion,
  Matrix4,
  Euler,
  MathUtils,
  MeshBasicMaterial
} from 'three'
import { Loader3DTiles } from 'three-loader-3dtiles'
import { CameraRig, FreeMovementControls, StoryPointsControls, CameraHelper } from 'three-story-controls'
import cameraData from './camera-data.js'

const searchParams = new URLSearchParams(window.location.search)

const canvasParent = document.querySelector('.canvas-parent')
const captionElement = document.querySelector('.caption')
const scene = new Scene()
const camera = new PerspectiveCamera(75, canvasParent.clientWidth / canvasParent.clientHeight, 0.001, 1000)
const renderer = new WebGLRenderer()
renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight)
renderer.outputEncoding = sRGBEncoding
canvasParent.appendChild(renderer.domElement)

const clock = new Clock()
const rig = new CameraRig(camera, scene)
let tilesRuntime, controls, cameraHelper


if (searchParams.has('helper')) {
  controls = new FreeMovementControls(rig, {
    keyboardScaleFactor: 0.05,
    wheelScaleFactor: 0.01,
    panDegreeFactor: Math.PI / 3,
    tiltDegreeFactor: Math.PI / 10,
    domElement: renderer.domElement
  })
  cameraHelper = new CameraHelper(rig, controls, renderer.domElement)
  document.querySelector('.next').style.display = 'none'
  document.querySelector('.prev').style.display = 'none'
} else {
  const captions = [
    'Amet id elit et labore cillum elit sit deserunt do reprehenderit occaecat. Enim ipsum sit do sunt aliqua in est.',
    'Exercitation consectetur est anim excepteur dolor. Sit qui deserunt proident excepteur aliquip sunt esse ullamco ex ipsum Lorem minim consectetur.',
    'Dolor nostrud amet ad irure qui ea. Fugiat cupidatat anim aliqua duis cupidatat cupidatat nisi. Occaecat eu magna id aliqua.',
    'Amet cupidatat officia enim eu sunt pariatur tempor consequat culpa ullamco proident. In voluptate ad sit enim ipsum dolore. ',
    'Aliquip laboris ea non ex incididunt tempor.',
    'Ad incididunt esse duis occaecat proident nostrud. Minim non est proident consequat excepteur nulla ad esse exercitation amet id.',
    'Dolor consectetur sint excepteur officia quis do mollit commodo deserunt dolor adipisicing. Minim adipisicing aliqua ipsum voluptate elit amet do do ullamco Lorem Lorem consectetur.',
    'Amet cillum do laboris nulla. Amet id elit et labore cillum elit sit deserunt do reprehenderit occaecat.',
    'Amet cupidatat officia enim eu sunt pariatur tempor consequat culpa ullamco proident. In voluptate ad sit enim ipsum dolore. ',
    'Aliquip laboris ea non ex incididunt tempor.',
    'Ad incididunt esse duis occaecat proident nostrud. Minim non est proident consequat excepteur nulla ad esse exercitation amet id.',
    'Dolor consectetur sint excepteur officia quis do mollit commodo deserunt dolor adipisicing. Minim adipisicing aliqua ipsum voluptate elit amet do do ullamco Lorem Lorem consectetur.',
  ]
  const pois = cameraData.pois.map((poi, i) => {
    return {
      position: new Vector3(...poi.position),
      quaternion: new Quaternion(...poi.quaternion),
      duration: poi.duration,
      ease: 'power1.in',
    }
  })
  controls = new StoryPointsControls(rig, pois)
  document.querySelector('.next').addEventListener('click', () => controls.nextPOI())
  document.querySelector('.prev').addEventListener('click', () => controls.prevPOI())
  controls.addEventListener('update', (e) => {
    if (e.progress === 0) {
      captionElement.classList.remove('visible')
    } else if (e.progress === 1) {
      captionElement.classList.add('visible')
      captionElement.innerHTML = `
      <p><span> ${e.upcomingIndex + 1}/${captions.length} </span> ${captions[e.upcomingIndex]}</p>
      `
    }
  })
  captionElement.addEventListener('click', () => captionElement.classList.toggle('hidden'))
}

Loader3DTiles.load(
  {

    // https://console.cloud.google.com/storage/browser/_details/rd-big-files/tilesets/ONA360/TILESET/0731_FREEMAN_ALLEY_10M_A_36x8K__10K-PN_50P_DB/tileset_tileset.json
    url: 'https://storage.googleapis.com/rd-big-files/tilesets/ONA360/TILESET/0731_FREEMAN_ALLEY_10M_A_36x8K__10K-PN_50P_DB/tileset_tileset.json',
    renderer: renderer,
    options: {
      dracoDecoderPath: 'https://unpkg.com/three@0.129.0/examples/js/libs/draco',
      basisTranscoderPath: 'https://unpkg.com/three@0.129.0/examples/js/libs/basis',
      initialTransform:
        new Matrix4()
          .makeRotationFromEuler(new Euler(-Math.PI / 2, 0, 0))
          .setPosition(0, 0, 0)
    }
  }
).then(result => {
  const { model, runtime } = result
  tilesRuntime = runtime
  scene.add(model)
  controls.enable()
  if (!cameraHelper) controls.goToPOI(0)
})


function render(t) {
  const dt = clock.getDelta()
  if (tilesRuntime) {
    tilesRuntime.update(dt, renderer, camera)
  }
  controls.update(t)
  renderer.render(scene, camera)
  if (cameraHelper) cameraHelper.update(t)
  window.requestAnimationFrame(render)
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight)
})

render()
