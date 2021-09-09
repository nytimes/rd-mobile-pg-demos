# Mobile Photogrammetry Demos

3D storytelling techniques have the potential to make journalism more understandable by helping to visualize everything from the real world to abstract concepts. Constructing 3D models with photogrammetry allows journalists to share objects and environments with their audiences in a comprehensive, immersive way that can’t be achieved with photography or videography alone.

With the support of Online News Association’s Journalism 360 grant, the R&D team at The New York Times has spent the last six months uncovering how journalists can best use these powerful tools to report stories with greater depth. This resource compiles what we've learned into a series of guides, demos, and open-source software tools that we hope will aid anyone seeking to capture, process, and deliver high-quality 3D models.

This reposistory contains code for 4 demos:

* [Model Viewer](https://nytimes.github.io/rd-mobile-pg-demos/demo1/): A model loaded with Google's model-viewer, a library for 3d models on a webpage an HTML element
* [Sketchfab](https://nytimes.github.io/rd-mobile-pg-demos/demo2/): A model loaded with Sketchfab's Viewer API, using annotation points and the GSAP animation library to scroll through a camera path
* [Three.js - Scroll Controls](https://nytimes.github.io/rd-mobile-pg-demos/demo3/): A GLTF model loaded using Three.js with an imported camera path that’s controlled via scroll
* [Three.js - 3D Tiles](https://nytimes.github.io/rd-mobile-pg-demos/demo4/): A large model streamed as 3D tiles with preselected points of interests