var camera, scene, renderer, proyector;

var arrows, origin, up_arrow;

var radarStuff

var isUserInteracting = false,
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
lon = 0, onMouseDownLon = 0,
lat = 0, onMouseDownLat = 0,
phi = 0, theta = 0;

init();
animate();

function init() {

  var container, mesh;

  radarStuff = setUpMap();

  container = document.getElementById( 'container' );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
  camera.target = new THREE.Vector3( 0, 0, 0 );

  scene = new THREE.Scene();
  origin = new THREE.Vector3(0,0,1);
  projector = new THREE.Projector();

  var geometry = new THREE.SphereGeometry( 500, 60, 40 );
  geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

  var material = new THREE.MeshBasicMaterial( {
    map: THREE.ImageUtils.loadTexture( 'imgs/foto.jpg' )
  } );
  material.overdraw = 0.5;

  mesh = new THREE.Mesh( geometry, material );

  scene.add( mesh );

  var box_geometry = new THREE.BoxGeometry(0,50,50);
  var boxMaterialArray = [];

  for(var i = 0 ; i < 6 ; i++ ) {

    var boxMaterial;
    if(i === 1){
      boxMaterial = new THREE.MeshBasicMaterial( {
        map: THREE.ImageUtils.loadTexture( 'up.png' ),
        transparent: true,
        opacity: 0.5
      } );
    }
    else {
      boxMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: false,
        opacity: 0.0
      } );
    }

    boxMaterialArray.push(boxMaterial);
  }

  var boxMaterials = new THREE.MeshFaceMaterial( boxMaterialArray );

  arrows = new THREE.Object3D();

  up_arrow = new THREE.Mesh( box_geometry, boxMaterials );
  up_arrow.position.y += 70;

  var down_arrow = new THREE.Mesh( box_geometry, boxMaterials );
  down_arrow.position.y -= 70;
  down_arrow.rotation.x += Math.PI;

  var left_arrow = new THREE.Mesh( box_geometry, boxMaterials );
  left_arrow.position.z -= 70;
  left_arrow.rotation.x -= Math.PI / 2;

  var right_arrow = new THREE.Mesh( box_geometry, boxMaterials );
  right_arrow.position.z += 70;
  right_arrow.rotation.x += Math.PI / 2;

  arrows.add(up_arrow);
  arrows.add(down_arrow);
  arrows.add(left_arrow);
  arrows.add(right_arrow);
  arrows.rotation.z -= Math.PI / 2;
  arrows.position.y = -100;
  scene.add( arrows);

  renderer = webglAvailable() ? new THREE.WebGLRenderer(): new THREE.CanvasRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
  document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);

  var domEvents   = new THREEx.DomEvents(camera, renderer.domElement)

  domEvents.addEventListener(up_arrow, 'click', function(event){
    alert('you clicked on UP')
  }, false)
  domEvents.addEventListener(down_arrow, 'click', function(event){
    alert('you clicked on DOWN')
  }, false)
  domEvents.addEventListener(left_arrow, 'click', function(event){
    alert('you clicked on LEFT')
  }, false)
  domEvents.addEventListener(right_arrow, 'click', function(event){
    alert('you clicked on RIGHT')
  }, false)

  document.addEventListener( 'dragover', function ( event ) {

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';

  }, false );

  document.addEventListener( 'dragenter', function ( event ) {

    document.body.style.opacity = 0.5;

  }, false );

  document.addEventListener( 'dragleave', function ( event ) {

    document.body.style.opacity = 1;

  }, false );

  document.addEventListener( 'drop', function ( event ) {

    event.preventDefault();

    var reader = new FileReader();
    reader.addEventListener( 'load', function ( event ) {

      material.map.image.src = event.target.result;
      material.map.needsUpdate = true;

    }, false );
    reader.readAsDataURL( event.dataTransfer.files[ 0 ] );

    document.body.style.opacity = 1;

  }, false );

  window.addEventListener( 'resize', onWindowResize, false );

}

function webglAvailable() {
    try {
        var canvas = document.createElement("canvas");
        return !!
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl"));
    } catch(e) {
        return false;
    }
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseDown( event ) {

  event.preventDefault();

  isUserInteracting = true;

  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;

  onPointerDownLon = lon;
  onPointerDownLat = lat;

}

function onDocumentMouseMove( event ) {

  if ( isUserInteracting === true ) {

    lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
    lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

  }

}

function onDocumentMouseUp( event ) {

  isUserInteracting = false;

}

function onDocumentMouseWheel( event ) {

  // WebKit

  if ( event.wheelDeltaY ) {

    camera.fov -= event.wheelDeltaY * 0.05;

  // Opera / Explorer 9

  } else if ( event.wheelDelta ) {

    camera.fov -= event.wheelDelta * 0.05;

  // Firefox

  } else if ( event.detail ) {

    camera.fov += event.detail * 1.0;

  }
  camera.fov = Math.max(40, Math.min(100, camera.fov));
  camera.updateProjectionMatrix();

}

function animate() {

  requestAnimationFrame( animate );
  update();

}

function update() {

  if ( isUserInteracting === false ) {

    //lon += 0.1;

  }

  lat = Math.max( - 85, Math.min( 85, lat ) );
  phi = THREE.Math.degToRad( 90 - lat );
  theta = THREE.Math.degToRad( lon );

  camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
  camera.target.y = 500 * Math.cos( phi );
  camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

  //console.log( Math.sin( theta ));
  //console.log( Math.cos( theta ));

  arrows.position.x = camera.target.x - 250 * Math.cos( theta );
  arrows.position.z = camera.target.z - 250 * Math.sin( theta );

  //arrow.position.y = camera.target.y;
  //console.log(arrows.matrix)

  //arrows.rotation.y = -theta;
  // arrows.rotation.y = -theta/2;
  //arrows.rotateOnAxis( origin, -theta );
  //arrows.rotation.z = theta;

  camera.lookAt( camera.target );

  /*
  // distortion
  camera.position.copy( camera.target ).negate();
  */
  drawMap(theta);

  renderer.render( scene, camera );

}

function setUpMap() {
  stuff = {}

  var stage = new Kinetic.Stage({
          container: 'radar',
          width: 250,
          height: 150
        });

  var layer = new Kinetic.Layer();

  var arc = new Kinetic.Arc({
    outerRadius: 40,
    stroke: "rgb(109,109,101)",
    strokeWidth: 1,
    fill: "rgb(142,143,136)",
    angle: 70,
    rotationDeg: 0,
    x: stage.getWidth() / 2,
    y: stage.getHeight() / 2,
  });
  arc.opacity(0.7);

  layer.add(arc);
  stage.add(layer);

  stuff["stage"] = stage;
  stuff["layer"] = layer;
  stuff["arc"] = arc;

  return stuff;
}

function drawMap(theta) {
  radarStuff["arc"].rotation(180 * theta / Math.PI);
  stuff["layer"].draw();
}
