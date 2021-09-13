import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  sRGBEncoding,
  Clock,
  Vector3,
  Quaternion,
  Matrix4,
  Euler
} from 'three'
import { Loader3DTiles } from 'three-loader-3dtiles'
import { CameraRig, StoryPointsControls } from 'three-story-controls'
import cameraData from './camera-data.js'

// Set up the three.js scene
const canvasParent = document.querySelector('.canvas-parent')
const captionElement = document.querySelector('.caption')
const scene = new Scene()
const camera = new PerspectiveCamera(60, canvasParent.clientWidth / canvasParent.clientHeight, 0.001, 1000)
const renderer = new WebGLRenderer()
renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight)
renderer.outputEncoding = sRGBEncoding
canvasParent.appendChild(renderer.domElement)

const clock = new Clock()
const rig = new CameraRig(camera, scene)
let tilesRuntime

// Points of Interest (POIs) captions
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
// Create POIs with data exported from the CameraHelper tool 
// (see here for more: https://nytimes.github.io/three-story-controls/#camera-helper)
// Note: Any method of listing camera position and quaternion will work for StoryPointControls
const pois = cameraData.pois.map((poi, i) => {
  return {
    position: new Vector3(...poi.position),
    quaternion: new Quaternion(...poi.quaternion),
    duration: poi.duration,
    ease: 'power1.in',
  }
})
// Initialize StoryPointControls with poi data
const controls = new StoryPointsControls(rig, pois)
document.querySelector('.next').addEventListener('click', () => controls.nextPOI())
document.querySelector('.prev').addEventListener('click', () => controls.prevPOI())
// Update captions when the POI changes
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

// Load the tileset
// See here for more options: https://github.com/nytimes/three-loader-3dtiles/blob/dev/docs/three-loader-3dtiles.loaderprops.md
Loader3DTiles.load(
  {
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
  controls.goToPOI(0)
})

// Render loop
function render(t) {
  window.requestAnimationFrame(render)
  const dt = clock.getDelta()
  if (tilesRuntime) {
    tilesRuntime.update(dt, renderer, camera)
  }
  controls.update(t)
  renderer.render(scene, camera)
}

// Handle window resize events
window.addEventListener('resize', () => {
  camera.aspect = canvasParent.clientWidth / canvasParent.clientHeight
  camera.updateProjectionMatrix();
  renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight)
})

render()
