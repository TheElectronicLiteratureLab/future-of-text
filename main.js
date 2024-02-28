// Import three.js and modules
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { Text, getCaretAtPoint, getSelectionRects } from 'troika-three-text';
import { Timer } from 'three/addons/misc/Timer.js';
import TWEEN from '@tweenjs/tween.js';

// Set up the scene and camera for three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// Create a timer to track delta time
const timer = new Timer();
var deltaTime;

// Create and add a light to the scene
const topLight = new THREE.DirectionalLight( 0xC3E3F0, Math.PI * 0.15 );
scene.add( topLight );
topLight.position.x = 50;
topLight.position.z = 30;

// const bottomLight = new THREE.DirectionalLight( 0xffffff, Math.PI * 0.25 );
// scene.add( bottomLight );
// bottomLight.position.y = -50;
// bottomLight.position.z = -30;

const centerLight = new THREE.PointLight( 0xffffff, 1, Math.PI * 0.2 );
centerLight.distance = 100;
scene.add( centerLight );
centerLight.position.y = -0.25;

// Create a renderer element and add it to the HTML doc
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Disable foveation
renderer.xr.setFoveation(0);

// Change the scale of the renderer
renderer.xr.setFramebufferScaleFactor(2.0);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Set background
scene.background = new THREE.Color ( 0xdddddd );

// Create a skysphere
// var skyGeo = new THREE.SphereGeometry(1000, 25, 25);
// var skyMat = new THREE.MeshBasicMaterial( {
//         map: new THREE.TextureLoader().load(
//             // './skysphere-ell-lab.png'
//             // './snowy_forest_4k.png'
//             './steinbach_field_4k.png'
//     )
// } );
// var skysphere = new THREE.Mesh(skyGeo, skyMat);
//     skysphere.material.side = THREE.BackSide;
    // scene.add(skysphere);
    // skysphere.rotation.y = 2;


// Add a floor axis for testing
var floorAxisGeo = new THREE.PlaneGeometry(0.5, 0.5);
var floorAxisMat = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load(
            './axis.png'
    ),
        transparent: true
} );
var floorAxis = new THREE.Mesh( floorAxisGeo, floorAxisMat );
scene.add(floorAxis);
floorAxis.position.set( 0, -1.3, 0 );
floorAxis.rotation.set( -Math.PI / 2, 0, -Math.PI / 2 );









// Test loading files into three.js
var pdfDoc = null;
var pageNum = 1;
var pageRendering = false;
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var arrowHelp;
var allHighlights = [];
var pdfDefaultResolution = 3;

var TESTPDF = new THREE.Mesh();



// Function to render a page
function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function(page) {
        var viewport = page.getViewport({ scale: pdfDefaultResolution });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var renderContext = {
            canvasContext: context,
            viewport: viewport,
            intent: "print"
        };

        var renderTask = page.render(renderContext);
        renderTask.promise.then(function() {

            pageRendering = false;
            var texture = new THREE.CanvasTexture(canvas);
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            texture.colorSpace = THREE.SRGBColorSpace;
            var geometry = new THREE.PlaneGeometry(viewport.width / 1000 / pdfDefaultResolution , viewport.height / 1000 / pdfDefaultResolution);
            var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            var pdfPlane = new THREE.Mesh(geometry, material);

            scene.add(pdfPlane);

            // TESTPDF = pdfPlane;
            startPos(pdfPlane);

            // Make the pdf grabbable
            pdfPlane.userData.grabbable = "true";
            pdfPlane.layers.enable( 1 );

            // Assign data like page number, transform, and doc name
            pdfPlane.userData.objType = "pdf";
            
            // Return the text contents of the page after the pdf has been rendered in the canvas
      		// return page.getTextContent();
	    });
    });
}

// Function to load the PDF
function loadPDF(url) {
    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        renderPage(pageNum);
    });
}

// Progress the pages over time
function timeout() {
    setTimeout(function () {
        nextPage();
        timeout();
    }, 1000);
}

function nextPage() {
    if (pageNum < pdfDoc.numPages) {
        pageNum++;
        renderPage(pageNum);
    }
}













let hasFetchedMap = false;

function fetchMap() {
    hasFetchedMap = true;

// Test text with Troika
fetch('./testtext.json')
    .then((response) => response.json())
    .then((json) => {
        for (var i = json.nodes.length - 1; i >= 0; i--) {
        

        // Create:
        const myText = new Text()
        scene.add(myText)
        myText.userData.grabbable = "true";
        myText.layers.enable( 1 );

        // Set properties to configure:
        myText.text = json.nodes[i].title;
        myText.fontSize = 0.15;
        myText.color = 0x000000;
        // myText.strokeColor = 0xffffff;
        // myText.strokeWidth = 0.001;
        myText.anchorX = 'center';
        myText.anchorY = 'middle';

        myText.position.x = (Math.random()-0.5) * json.nodes.length / 5;
        myText.position.y = (Math.random()-0.5) * json.nodes.length / 15 + 2;
        myText.position.z = (Math.random()-0.5) * json.nodes.length / 50 - 7;


        // console.log(json.nodes[i].title);



        }


    // var width = json.nodes.length / 5 + 10;
    // var height = json.nodes.length / 15 + 8;
    // var geometry = new THREE.PlaneGeometry(width, height);
    // var material = new THREE.MeshBasicMaterial( {
    //     color: 0xffffff,
    //     transparent: true,
    //     opacity:0.75
    // } );
    // var mapBackground = new THREE.Mesh( geometry, material ) ;
    

    // scene.add( mapBackground );

    // mapBackground.position.z = (-0.5 * json.nodes.length / 20 - 7.1);
    // mapBackground.position.y = 2;





    });

// console.log(testtext);
}











// ================================== MENU CONTENT =========================================

const normalNone = new THREE.TextureLoader().load( './normal-none.jpg' );
const normalArtdeco = new THREE.TextureLoader().load( './normal-artdeco.jpg' );
const normalGrate = new THREE.TextureLoader().load( './normal-grate.jpg' );
const normalLace = new THREE.TextureLoader().load( './normal-lace.jpg' );
const normalScifi1 = new THREE.TextureLoader().load( './normal-scifi-1.jpg' );
const normalScifi2 = new THREE.TextureLoader().load( './normal-scifi-2.jpg' );
const normalScifi3 = new THREE.TextureLoader().load( './normal-scifi-3.jpg' );
const normalScifi4 = new THREE.TextureLoader().load( './normal-scifi-4.jpg' );
const normalScifi5 = new THREE.TextureLoader().load( './normal-scifi-5.jpg' );
const normalScifi6 = new THREE.TextureLoader().load( './normal-scifi-6.jpg' );
const normalScifi7 = new THREE.TextureLoader().load( './normal-scifi-7.jpg' );
const normalScifi8 = new THREE.TextureLoader().load( './normal-scifi-8.jpg' );
const normalScifi9 = new THREE.TextureLoader().load( './normal-scifi-9.jpg' );
const normalScifi10 = new THREE.TextureLoader().load( './normal-scifi-10.jpg' );
const normalScifi11 = new THREE.TextureLoader().load( './normal-scifi-11.jpg' );

const normalOptions = [normalArtdeco,normalGrate,normalLace,normalScifi1,normalScifi2,normalScifi3,
    normalScifi4,normalScifi5,normalScifi6,normalScifi7,normalScifi8,normalScifi9,normalScifi10,normalScifi11];

var nbtnArt,nbtnGrate,nbtnLace,nbtnSci1,nbtnSci2,nbtnSci3,nbtnSci4,nbtnSci5,nbtnSci6,nbtnSci7,
    nbtnSci8,nbtnSci9,nbtnSci10,nbtnSci11;

const normalBtns = [nbtnArt,nbtnGrate,nbtnLace,nbtnSci1,nbtnSci2,nbtnSci3,nbtnSci4,nbtnSci5,nbtnSci6,nbtnSci7,
    nbtnSci8,nbtnSci9,nbtnSci10,nbtnSci11];

var normalMainBtn, sliderMainBtn, settingsBackBtn, slidersBackBtn;

var sliderNormalScale, sliderEmissive, sliderReaderDistanceMin;

var sliderNormalBg, sliderEmissiveBg, sliderReaderDistanceBg;

// =========================================================================================









// var menuGeo = new THREE.PlaneGeometry(0.5, 0.2);
const menuGroup = new THREE.Group();

var menuGeo = new THREE.CylinderGeometry( 0.1, 0.1, 0.6, 3, 1, false );
var menuMat = new THREE.MeshStandardMaterial({ 
    color: 0x7c7c7c,
    transparent: false,
    opacity: 0.95,
    roughness: 0.32,
    metalness: 1,
    normalScale: new THREE.Vector2( 1, 1 ),
    emissive: 0xeeeeee,
    emissiveIntensity: 0.1,
    normalMap: normalNone
});
var menuSphereMat = menuMat.clone()
menuSphereMat.side = THREE.BackSide;

var menu = new THREE.Mesh( menuGeo, menuMat );

var sphereGeo = new THREE.SphereGeometry( 0.03 );
var sphereHelper = new THREE.Mesh( sphereGeo, menuSphereMat );
var sphereHelperSolid = new THREE.Mesh( sphereGeo, menuMat );

var isMenuOpen = false;
var isMenuActive = false;
var isMenuBusy = false;
var justClosedLibrary = false;

var menuMode = 0;
// 0 = main menu
// 1 = settings menu
// 2 = slider menu
// 99 = library view
var sliderBgGeo = new THREE.PlaneGeometry( 0.005, 0.5 );
var sliderBgMat = new THREE.MeshBasicMaterial({
    color: 0x2b2b2b,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide
});

var liveWrist1Pos, liveCameraPos;
var sphereHelperTransScale, sphereHelperTransPos;

var sphereAnimLength = 500;

// Create the helper sphere based on default position of the browser page
scene.add(sphereHelper);
sphereHelper.position.set( 0, 0, 0.45 );
sphereHelper.scale.set( 7.5, 7.5, 7.5 );

function initMenu() {
    menuGroup.add(menu);
    scene.add(menuGroup);

    menu.rotation.x = Math.PI / 2;
    menu.rotation.z = Math.PI / 2;

    // Create the buttons
    createMenuBtns(menu);

    menuGroup.visibility = false;
    menuGroup.position.y = -999;

    sphereHelper.position.set( 0, 0, 0 );

    toggleLibrary('close');

    scene.add(sphereHelperSolid);
    sphereHelperSolid.scale.set( 0.9, 0.9, 0.9 );
    sphereHelperSolid.position.set( wrist1.position.x, wrist1.position.y, wrist1.position.z );
    wrist1.attach(sphereHelperSolid);
}

function toggleLibrary(state) {
    if (state == 'open') {
        isMenuBusy = true;

        // Tween the helper sphere
        sphereHelperTransScale = new TWEEN.Tween( sphereHelper.scale )
                .to( {x: 170, y: 170, z: 170}, sphereAnimLength )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .start()
        ;
        liveCameraPos = new THREE.Vector3( camera.position.x, camera.position.y, camera.position.z );
        scene.attach(sphereHelper);
        sphereHelperTransPos = new TWEEN.Tween( sphereHelper.position )
                .to( liveCameraPos, sphereAnimLength )
                .easing( TWEEN.Easing.Circular.In )
                .dynamic(true)
                .start()
                .onUpdate(function() {
                    liveCameraPos.set( camera.position.x, camera.position.y, camera.position.z );
                })
                .onComplete(function() {
                    sphereHelper.position.set( camera.position.x, camera.position.y, camera.position.z );
                    // camera.attach(sphereHelper);
                    isMenuBusy = false;
                })
        ;


    } else if (state == 'close') {
        isMenuBusy = true;

        // Tween the helper sphere
        scene.attach(sphereHelper);
        sphereHelperTransScale = new TWEEN.Tween( sphereHelper.scale )
                .to( {x: 1, y: 1, z: 1}, sphereAnimLength )
                .easing( TWEEN.Easing.Circular.InOut )
                .start()
        ;
        liveWrist1Pos = new THREE.Vector3( wrist1.position.x, wrist1.position.y, wrist1.position.z );
        sphereHelperTransPos = new TWEEN.Tween( sphereHelper.position )
                .to( liveWrist1Pos, sphereAnimLength )
                .easing( TWEEN.Easing.Circular.Out )
                .dynamic(true)
                .start()
                .onUpdate(function() {
                    liveWrist1Pos.set( wrist1.position.x, wrist1.position.y, wrist1.position.z );
                })
                .onComplete(function() {
                    sphereHelper.position.set( wrist1.position.x, wrist1.position.y, wrist1.position.z );
                    wrist1.attach(sphereHelper);
                    isMenuBusy = false;
                })
        ;


    }
}

function browserSphereTransitionSetup() {
    sphereHelper.scale.set( 170, 170, 170 );
    sphereHelper.position.set( camera.position.x, camera.position.y, camera.position.z );
}

function tryMenu() {
    if ( indexFingerTip2.position.distanceTo(wrist1.position) <= 0.05 && !isMenuBusy) {
        if (firstInit && !isMenuBusy && menuMode != 99) { libraryTimer += deltaTime };
        
        if (menuMode == 99 && libraryTimer < libraryTimerHold) { // The library is open, close it
            console.log("LIBRARY: CLOSE");
            toggleLibrary('close');
            menuMode = 0;
            justClosedLibrary = true;
        } else if (isMenuOpen && !isMenuActive && menuMode != 99) { // The menu is open: close it now
            console.log("MENU: Close");
            isMenuOpen = false;
            menuGroup.visibility = false;
            menuGroup.position.y = -999;
            subMenu(0);
        }
        else if (!isMenuActive && menuMode != 99) { // The menu is closed: open it now
            console.log("MENU: Open");
            isMenuOpen = true;
            startPos(menuGroup);
        }

        if (libraryTimer >= libraryTimerHold && menuMode != 99 && !justClosedLibrary) { // The button has been held down: open the library
            console.log("LIBRARY: OPEN");
            toggleLibrary('open');

            // Close the menu if it is o
            isMenuOpen = false;
            menuGroup.visibility = false;
            menuGroup.position.y = -999;
            menuMode = 99;
        }

        isMenuActive = true; // The menu is now active: don't trigger anything again until the gesture is changed
    } else if (indexFingerTip2.position.distanceTo(wrist1.position) > 0.05 && isMenuActive) {
        isMenuActive = false;
        libraryTimer = 0;
        justClosedLibrary = false;
    }
}

const btnMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.32,
        metalness: 1,
        emissive: 0x6a6a6a
    });

const btnPressMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.32,
        metalness: 1,
        emissive: 0xffffff
    });



function createMenuBtns(menu) {
    var btnGeo = new THREE.CylinderGeometry( 0.03, 0.03, 0.005 );
    var sliderGeo = new THREE.CylinderGeometry( 0.02, 0.02, 0.005 );

    var distanceBetweenWidth = 0.085;
    var distanceBetweenHeight = 0.0425;

    // Create main buttons
    normalMainBtn = new THREE.Mesh( btnGeo, btnMat );
    menuGroup.add(normalMainBtn);
    normalMainBtn.position.set( menu.position.x, menu.position.y + 0.05, menu.position.z );
    normalMainBtn.translateX( distanceBetweenWidth/2 );
    normalMainBtn.layers.enable( 10 );
    menu.attach(normalMainBtn);
    normalMainBtn.userData.function = "normals-menu";
    normalMainBtn.translateZ( 0.02 );

    sliderMainBtn = new THREE.Mesh( btnGeo, btnMat );
    menuGroup.add(sliderMainBtn);
    sliderMainBtn.position.set( menu.position.x, menu.position.y + 0.05, menu.position.z );
    sliderMainBtn.translateX( -distanceBetweenWidth/2 );
    sliderMainBtn.layers.enable( 10 );
    menu.attach(sliderMainBtn);
    sliderMainBtn.userData.function = "slider-menu";
    sliderMainBtn.translateZ( 0.02 );

    settingsBackBtn = new THREE.Mesh( btnGeo, btnMat );
    menuGroup.add(settingsBackBtn);
    settingsBackBtn.position.set( menu.position.x, menu.position.y + 0.045, menu.position.z );
    settingsBackBtn.translateZ( -0.09 );
    settingsBackBtn.rotation.set( 0, Math.PI / 2, 1);
    settingsBackBtn.translateX( 0.05 );
    settingsBackBtn.layers.enable( 10 );
    menu.attach(settingsBackBtn);
    settingsBackBtn.userData.function = "back-menu";

    slidersBackBtn = new THREE.Mesh( btnGeo, btnMat );
    menuGroup.add(slidersBackBtn);
    slidersBackBtn.position.set( menu.position.x, menu.position.y + 0.045, menu.position.z );
    slidersBackBtn.translateZ( 0.09 );
    slidersBackBtn.rotation.set( 0, Math.PI / 2, -1);
    slidersBackBtn.translateX( -0.05 );
    slidersBackBtn.layers.enable( 10 );
    menu.attach(slidersBackBtn);
    slidersBackBtn.userData.function = "back-menu";


    // Create grid of normal-texture buttons
    for (var i = normalOptions.length - 1; i >= 0; i--) {
        normalBtns[i] = new THREE.Mesh( btnGeo, btnMat );

        menuGroup.add(normalBtns[i]);

        normalBtns[i].userData.function = "normal-" + i;

        normalBtns[i].position.set( menu.position.x, menu.position.y - 0.03, menu.position.z );
        normalBtns[i].rotation.set( 1, 0, 0 );
        normalBtns[i].translateY( -0.035 );
        normalBtns[i].translateZ( -0.025 );

        // First or second half of the total buttons
        if (i <= (normalOptions.length / 2) - 1) {
            normalBtns[i].translateX( (distanceBetweenWidth * i) - (distanceBetweenWidth * 3) );
            normalBtns[i].translateZ( - distanceBetweenHeight );
        }
        else {
            normalBtns[i].translateX( (distanceBetweenWidth * (i - normalOptions.length / 2)) - (distanceBetweenWidth * 3) );
            normalBtns[i].translateZ( distanceBetweenHeight );
        }

        normalBtns[i].layers.enable( 10 );
        menu.attach(normalBtns[i]);
    }


    // Create sliders for adjusting settings
    sliderNormalScale = new THREE.Mesh( sliderGeo, btnMat );
    sliderNormalBg = new THREE.Mesh( sliderBgGeo, sliderBgMat );
    menuGroup.add( sliderNormalScale );
    menuGroup.add( sliderNormalBg );
    sliderNormalScale.attach( sliderNormalBg );
    sliderNormalScale.position.set( menu.position.x, menu.position.y, menu.position.z );
    sliderNormalScale.rotation.set( 0, Math.PI / 2, -1.04);
    sliderNormalScale.translateY( -0.05 );
    sliderNormalScale.translateX( -0.035 );
    sliderNormalScale.layers.enable( 10 );
    menu.attach(sliderNormalScale);
    sliderNormalScale.userData.function = "slider-nscale";
    menu.attach(sliderNormalBg)
    sliderNormalBg.rotateX( Math.PI / 2 );


    sliderEmissive = new THREE.Mesh( sliderGeo, btnMat );
    sliderEmissiveBg = new THREE.Mesh( sliderBgGeo, sliderBgMat );
    menuGroup.add( sliderEmissive );
    menuGroup.add( sliderEmissiveBg );
    sliderEmissive.attach( sliderEmissiveBg );
    sliderEmissive.position.set( menu.position.x, menu.position.y, menu.position.z );
    sliderEmissive.rotation.set( 0, Math.PI / 2, -1.04);
    sliderEmissive.translateY( -0.051 );
    sliderEmissive.translateX( 0.035 );
    sliderEmissive.layers.enable( 10 );
    menu.attach(sliderEmissive);
    sliderEmissive.userData.function = "slider-intensity";
    menu.attach(sliderEmissiveBg)
    sliderEmissiveBg.rotateX( Math.PI / 2 );
    sliderEmissive.translateZ( -0.2 );


    sliderReaderDistanceMin = new THREE.Mesh( sliderGeo, btnMat );
    sliderReaderDistanceBg = new THREE.Mesh( sliderBgGeo, sliderBgMat );
    menuGroup.add( sliderReaderDistanceMin );
    menuGroup.add( sliderReaderDistanceBg );
    sliderReaderDistanceMin.attach( sliderReaderDistanceBg );
    sliderReaderDistanceMin.position.set( menu.position.x, menu.position.y + 0.05, menu.position.z );
    sliderReaderDistanceMin.rotation.set( 0, Math.PI / 2, 0);
    sliderReaderDistanceMin.translateY( 0.001 );
    sliderReaderDistanceMin.translateX( 0.035 );
    sliderReaderDistanceMin.layers.enable( 10 );
    menu.attach(sliderReaderDistanceMin);
    sliderReaderDistanceMin.userData.function = "slider-reader-min";
    menu.attach(sliderReaderDistanceBg)
    sliderReaderDistanceBg.rotateX( Math.PI / 2 );
    sliderReaderDistanceMin.translateZ( -0.2 );


    subMenu(0);

}


var isBtnPressed = false;
var menuRayDefault = 0.04;
var menuRaySlider = 0.06;
var menuRayDistance = menuRayDefault;

function tryBtns() {
    
    // raycast from finger tip forward and downward a short distance
    // if it hits a button, change the material and run a function

    if (isMenuOpen) {
        var raycaster = new THREE.Raycaster();
        raycaster.layers.set( 10 );
        var indexPointForward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(indexFingerTip2.quaternion);
        raycaster.set(indexDis2.getWorldPosition(new THREE.Vector3), indexPointForward);
        var intersects = raycaster.intersectObjects(scene.children);
        var intersect = intersects[0];

        // Draw a placeholder arrow to visualize the raycast
        // placeholderArrow(raycaster, menuRayDistance, 0x33ff77);

        if (intersect != undefined && intersect.distance <= menuRayDistance) {
            if (!isBtnPressed ) {
                btnPress(intersect);
            }
        } else {
            isBtnPressed = false;
            hasTouchedSlider = false;
            menuRayDistance = menuRayDefault;
        }

    }

}

var lastSliderPos;
var hasTouchedSlider = false;
var libraryTimer = 0;
var libraryTimerHold = 0.4; // How long to hold the pose for the library to trigger
var currentTool2 = 'none';

function btnPress(intersect) {
    intersect.object.material = btnPressMat;
    setTimeout(() => {intersect.object.material = btnMat;},200);
    var funct = intersect.object.userData.function;

    // ==================== Button Function Calls ===================
    if (funct == "normals-menu" && menuMode == 0) { // Button for the normals menu
        console.log("Normal Buttons");
        subMenu(1);
        isBtnPressed = true; // Consume the button press until the finger is removed
    } else if (funct == "slider-menu" && menuMode == 0) { // Button for the slider test menu
        console.log("Slider Settings");
        subMenu(2);
        isBtnPressed = true; // Consume the button press until the finger is removed
    } else if (funct == "back-menu" && menuMode != 0) { // Button for going back to the main menu
        console.log("Back to Menu");
        subMenu(0);
        isBtnPressed = true; // Consume the button press until the finger is removed
    } else if (funct.slice(0,7) == "normal-" && menuMode == 1) { // Button for switching normals
        console.log("Set Normal: " + funct.slice(7,9));
        menuMat.normalMap = normalOptions[funct.slice(7,9)];
        menuSphereMat.normalMap = normalOptions[funct.slice(7,9)];
        isBtnPressed = true; // Consume the button press until the finger is removed
    } else if (funct.slice(0,7) == "slider-"){//} && menuMode == 2) { // Sliders
        // console.log("Slider: Normal Scale");
        var localHitPos = intersect.object.parent.worldToLocal(intersect.point);
        if (!hasTouchedSlider) {
            lastSliderPos = localHitPos.y;
            hasTouchedSlider = true;
            menuRayDistance = menuRaySlider;
        }
        lastSliderPos -= localHitPos.y;
        if (localHitPos.y >= -0.25 && localHitPos.y <= 0.25) {
            intersect.object.translateZ(lastSliderPos);
            var normalizedResult = norm(localHitPos.y, 0.25, -0.25)
            // Check which slider is being used and apply that function
            if (funct.slice(7,99) == "nscale") {
                menuMat.normalScale = new THREE.Vector2(normalizedResult*2,normalizedResult*2);
                menuSphereMat.normalScale = new THREE.Vector2(normalizedResult*2,normalizedResult*2);
            } else if (funct.slice(7,99) == "intensity") {
                menuMat.emissiveIntensity = normalizedResult;
                menuSphereMat.emissiveIntensity = normalizedResult;
            } else if (funct.slice(7,13) == "reader") {
                var newRange = normalizedResult * 10 + 0.5;
                blockText.curveRadius = newRange;
                headText.curveRadius = newRange;
                blockText.position.set( blockText.position.x, blockText.position.y, -newRange );
                swipeRayLengthBase = newRange - 0.15;
            }
            
        }
        lastSliderPos = localHitPos.y;
        isBtnPressed = false; // This is a slider, so it does not consume the button press
    } else if (funct == "tool-swap") { // Button for swapping between tools
        if (currentTool2 == 'none') {
            console.log("Current Tool: Select");
            currentTool2 = 'select';
        }
        else if (currentTool2 == 'select') {
            console.log("Current Tool: None");
            currentTool2 = 'none';
        }
        isBtnPressed = true; // Consume the button press until the finger is removed
    }
}









function subMenu(v) {

    var menuDestination;
    var backBtnSettingsScale, backBtnSlidersScale;

    if (v == 0 ) { // Main menu
        setTimeout(() => {menuMode = 0},200);
        menuDestination = Math.PI * 2;
        backBtnSettingsScale = 0;
        backBtnSlidersScale = 0;
    

    } else if (v == 1) { // Setting sub menu
        setTimeout(() => {menuMode = 1},200);
        menuDestination = Math.PI * 2.667;
        backBtnSettingsScale = 1;
        backBtnSlidersScale = 0;

        
    } else if (v == 2) { // Slider sub menu
        setTimeout(() => {menuMode = 2},200);
        menuDestination = Math.PI * 1.333;
        backBtnSettingsScale = 0;
        backBtnSlidersScale = 1;


    }

    // Tween the menu rotation
    new TWEEN.Tween( menu.rotation )
            .to( {x: menuDestination}, 300 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .start()
    ;

    // Tween the back button scale for the settings page
    new TWEEN.Tween( settingsBackBtn.scale )
            .to( {x: backBtnSettingsScale, y: backBtnSettingsScale, z: backBtnSettingsScale}, 300 )
            .easing( TWEEN.Easing.Quartic.InOut )
            .start()
    ;

    // Tween the back button scale for the sliders page
    new TWEEN.Tween( slidersBackBtn.scale )
            .to( {x: backBtnSlidersScale, y: backBtnSlidersScale, z: backBtnSlidersScale}, 300 )
            .easing( TWEEN.Easing.Quartic.InOut )
            .start()
    ;

}

















let toolSelector, toolSelectorTip, toolSelectorBeam, toolSelectorDot;

function initTools() {

    const tipGeo = new THREE.BoxGeometry( 0.01, 0.01, 0.01 );
    const stickGeo = new THREE.BoxGeometry( 0.01, 0.01, 0.15 );
    const beamGeo = new THREE.BoxGeometry( 0.001, 0.001, 0.001 );
    const dotGeo = new THREE.SphereGeometry( 0.005, 9, 9 );
    var toolMat = new THREE.MeshStandardMaterial({ 
        color: 0xFFD663,
        transparent: true,
        opacity: 1,
        roughness: 0.32,
        metalness: 1,
        normalScale: new THREE.Vector2( 1, 1 ),
        emissive: 0xeeeeee,
        emissiveIntensity: 0.1,
        normalMap: normalNone,
        depthWrite: true
    });
    const colorMat = new THREE.MeshBasicMaterial( {
        color: 0xFCDD23,
        transparent: true,
        opacity: 1,
        depthWrite: true
    } );

    toolSelector = new THREE.Mesh( stickGeo, toolMat );
    toolSelectorTip = new THREE.Mesh( tipGeo, colorMat );
    toolSelectorBeam = new THREE.Mesh( beamGeo, colorMat );
    toolSelectorDot = new THREE.Mesh( dotGeo, colorMat );

    toolSelector.attach( toolSelectorTip );
    toolSelector.attach( toolSelectorBeam );
    toolSelector.attach( toolSelectorDot );

    toolSelectorBeam.translateZ( -0.081 );
    toolSelectorDot.translateZ( -0.081 );
    toolSelectorTip.translateZ( -0.081 );
    toolSelectorTip.rotateY( Math.PI / 4 );
    toolSelectorTip.rotateX( Math.PI / 4 );

    setToolPositions();

    toolSelector.renderOrder = 99;
    toolSelectorTip.renderOrder = 99;
    toolSelectorDot.renderOrder = 99;

}

function setToolPositions() {

    scene.attach( toolSelector );

    toolSelector.position.set( indexKnuckle2.position.x, indexKnuckle2.position.y, indexKnuckle2.position.z );
    toolSelector.rotation.set( wrist2.rotation.x, wrist2.rotation.y, wrist2.rotation.z );


    toolSelector.rotateX( -1.25 );
    toolSelector.translateY( -0.01 );
    toolSelector.translateZ( -0.04 );

    scene.add( toolSelector );
    wrist2.attach( toolSelector );

}

function animateTools() {
    // toolSelector.rotation.z += 0.01;
    toolSelectorTip.rotation.y -= 0.01;
    toolSelectorTip.rotation.x -= 0.01;
}


var tempSelectorQuat = new THREE.Quaternion();
var tempSelectorWorld = new THREE.Vector3();
var tempSelectorDotTween;
var tempSelectorActive = false;
var tempSelectorStart, tempSelectorEnd;

var highlightMat = new THREE.MeshBasicMaterial( {
    color: 0x000077,
    transparent:true,
    opacity:0.2,
    side: THREE.DoubleSide,
    blending: THREE.SubtractiveBlending
} );

function tryTools() {
    animateTools();
    let fingersMaxDist = 0.09;
    let fingersMinDist = 0.05;
    let fingersCurDist = thumbTip2.position.distanceTo(indexFingerTip2.position);
    let fingersNormalized = 1 - norm(fingersCurDist, fingersMinDist, fingersMaxDist);
    let fingersClamped = clamp(fingersNormalized, 0, 1);

    if (currentTool2) { // Change this to only trigger when the correct tool is active

        toolSelector.material.opacity = fingersClamped;
        toolSelectorTip.material.opacity = fingersClamped;

        toolSelectorTip.getWorldPosition(tempSelectorWorld);

        // If there are any highlights, clear them
        if (allHighlights.length > 0) {
            for (var i = allHighlights.length - 1; i >= 0; i--) {
                var highlight = allHighlights[i];
                if (highlight != null) {
                    
                    if (highlight.parent != null) {
                        highlight.parent.remove(highlight);
                    }

                    
                }
            }
        }

        if (fingersNormalized >= 1) {
            var raycaster = new THREE.Raycaster();
            raycaster.layers.set( 3 );
            toolSelector.getWorldQuaternion(tempSelectorQuat);
            var rayForward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(tempSelectorQuat);
            raycaster.set(tempSelectorWorld, rayForward);
            var intersects = raycaster.intersectObjects(scene.children);
            var intersect = intersects[0];

            if (intersect) {

                let beamScale = tempSelectorWorld.distanceTo(intersect.point) * 1000;
                toolSelectorBeam.scale.z = beamScale;
                toolSelectorBeam.position.z = -(beamScale/2000) - 0.081;

                toolSelectorDot.position.z = -(beamScale/1000) - 0.081;
            }

            if (intersect && fingersCurDist <= 0.01 && !tempSelectorActive) {
                tempSelectorActive = true;
                // Tween the selector dot
                tempSelectorDotTween = new TWEEN.Tween( toolSelectorDot.scale )
                    .to( {x: 3, y: 3, z: 3}, 100 )
                    .easing( TWEEN.Easing.Quadratic.Out )
                    .start()
                    .onComplete(() => {
                        new TWEEN.Tween(toolSelectorDot.scale)
                        .to( {x:1, y: 1, z: 1}, 100 )
                        .easing( TWEEN.Easing.Quadratic.In )
                        .start()
                    });

                var localHitPos = intersect.object.worldToLocal(intersect.point);

                var tempCaret = getCaretAtPoint(intersect.object.textRenderInfo, localHitPos.x, localHitPos.y);

                tempSelectorStart = tempCaret.charIndex;

            } else if (intersect && fingersCurDist <= 0.01 && tempSelectorActive) {

                var localHitPos = intersect.object.worldToLocal(intersect.point);

                var tempCaret = getCaretAtPoint(intersect.object.textRenderInfo, localHitPos.x, localHitPos.y);

                tempSelectorEnd = tempCaret.charIndex;

                // Display the selection box
                var tempSelectionBoxes = getSelectionRects(intersect.object.textRenderInfo, tempSelectorStart, tempSelectorEnd);

                for (var i = tempSelectionBoxes.length - 1; i >= 0; i--) {
                    var radius = intersect.object.curveRadius;
                    var height = intersect.object.fontSize;
                    var theta = (tempSelectionBoxes[i].left - tempSelectionBoxes[i].right) / radius;
                    var tempGeo = new THREE.CylinderGeometry( radius, radius, height, 32, 1, true, 0, theta );
                    var tempNewHighlight = new THREE.Mesh( tempGeo, highlightMat );
                    scene.add(tempNewHighlight);
                    allHighlights.push(tempNewHighlight);
                    intersect.object.parent.attach(tempNewHighlight);

                    tempNewHighlight.position.y = tempSelectionBoxes[i].bottom + height/2 + intersect.object.position.y;
                    tempNewHighlight.rotation.y = Math.PI - tempSelectionBoxes[i].left;

                    tempNewHighlight.renderOrder = 98;
                    console.log(intersect.object.parent.rotation.y);
                }

                // console.log(tempSelectionBoxes);

            } else if (fingersCurDist > 0.01 && tempSelectorActive) {
                tempSelectorActive = false;

                if (intersect != undefined){
                    var tempTextResult = intersect.object.text.slice(tempSelectorStart, tempSelectorEnd + 1);

                    console.log("RESULT: " + tempTextResult);
                }

            }

        } else {
            toolSelectorBeam.scale.z = 0;
            toolSelectorBeam.position.z = -0.081;
            toolSelectorDot.position.z = -0.081;

        }

    }

}

















var testDisplayHead = "Several Hypertexts"
var testDisplayText = "[1] Espen J Aarseth. 1994. Nonlinearity and literary theory.\n[2] Robert M. Akscyn, Donald L. McCracken, and Elise Yoder. 1987. KMS: A Distributed Hypermedia System for Managing Knowledge in Organizations.\n[3] G. L. Anderson. 1953. The McBee Keysort System for Mechanically Sorting Folklore Data.\n[4] Kenneth M. Anderson, Richard N. Taylor, and E. James Whitehead. 1994. Chimera: Hypertext for Heterogeneous Software Environments.\n[5] Mark W. R. Anderson, Les A. Carr, and David E. Millard. 2017. There and Here: Patterns of Content Transclusion in Wikipedia.\n[6] Mark W. R. Anderson and David Millard. 2022. Hypertext’s Meta-History: Documenting in-Conference Citations, Authors and Keyword Data, 1987-2021.\n[7] Claus Atzenbeck, Eelco Herder, and Daniel Roßner. 2023. Breaking The Routine: Spatial Hypertext Concepts for Active Decision Making in Recommender Systems.\n[8] Claus Atzenbeck, Peter Nürnberg, and Daniel Roßner. 2021. Synthesising augmentation and automation. New Review of Hypermedia and Multimedia.\n[9] Claus Atzenbeck and Peter J. Nürnberg. 2019. Hypertext as Method.\n[10] Claus Atzenbeck, Daniel Roßner, and Manolis Tzagarakis. 2018. Mother: An Integrated Approach to Hypertext Domains.\n[11] Claus Atzenbeck, Thomas Schedel, Manolis Tzagarakis, Daniel Roßner, and Lucas Mages. 2017. Revisiting Hypertext Infrastructure.\n[12] Ruth Aylett. 2000. Emergent narrative, social immersion and “storification”.\n[13] Albert Lásló Barabási, Hawoong Jeong, Zoltán Néda, Erzsébet Ravasz, András P. Schubert, and Tamás Vicsek. 2002. Evolution of the social network of scientific collaborations. Physica A: Statistical Mechanics and its Applications\n[14] Thierry Bardini. 2000. Bootstrapping: Douglas Engelbart, Coevolution, and the Origins of Personal Computing.\n[15] Belinda Barnet. 2013. Memory Machines: The Evolution of Hypertext.\n[16] Roland Barthes and S. Heath. 1977. Death of The Author.\n[17] Meltem Huri Baturay. 2015. An overview of the world of MOOCs.\n[18] Sean Bechhofer, Iain Buchan, David De Roure, Paolo Missier, John Ainsworth, Jiten Bhagat, Philip Couch, Don Cruickshank, Mark Delderfield, Ian Dunlop, et al. 2013. Why linked data is not enough for scientists.\n[19] Tim Berners-Lee. 2006. Linked Data.\n[20] Tim Berners-Lee, James A. Hendler, and Ora Lassila. 2001. The Semantic Web.\n[21] Tim Berners-Lee and Kieron O’Hara. 2013. The read–write Linked Data Web.\n[22] Mark Bernstein. 1988. The Bookmark and the Compass: Orientation Tools for Hypertext Users.\n[23] Mark Bernstein. 1998. Patterns of Hypertext.\n[24] Mark Bernstein. 1999. Where Are The Hypertexts?\n[25] Mark Bernstein. 2001. Card Shark and Thespis: Exotic Tools for Hypertext Narrative.\n[26] Mark Bernstein. 2002. Storyspace 1.\n[27] Mark Bernstein. 2002. Tinderbox. Eastgate Systems.\n[28] Mark Bernstein. 2009. On Hypertext Narrative.\n[29] Mark Bernstein. 2010. Criticism.\n[30] Mark Bernstein. 2022. On The Origins Of Hypertext In The Disasters Of The Short 20th Century.\n[31] Mark Bernstein and Clare J. Hooper. 2018. A Villain’s Guide To Social Media And Web Science.\n[32] Mark Bernstein, David E. Millard, and Mark J. Weal. 2002. On Writing Sculptural Hypertext.\n[33] Jay David Bolter. 1992. Virtual Reality and the Future of Hypertext (Abstract).\n[34] Jay David Bolter and Richard A. Grusin. 2000. Remediation: Understanding New Media.\n[35] Jay David Bolter and Michael Joyce. 1987. Hypertext and Creative Writing.\n[36] Jorge Luis Borges. 1941. The Garden of Forking Paths.\n[37] Rodrigo A. Botafogo, Ehud Rivlin, and Ben Shneiderman. 1992. Structural Analysis of Hypertexts: Identifying Hierarchies and Useful Metrics.\n[38] Sam Brooker. 2019. Man Proposes, God Disposes: Re-Assessing Correspondences in Hypertext and Anti-Authorist Literary Theory.\n[39] Peter J. Brown. 1987. Turning Ideas into Products: The Guide System.\n[40] Peter Brusilovsky. 2001. Adaptive Hypermedia.\n[41] Peter Brusilovsky, Alfred Kobsa, and Julita Vassileva. 1998. Adaptive Hypertext and Hypermedia. Kluwer Academic Publishers, Dordrecht. 274 pages. https://doi.org/10.1007/978-94-017-0617-9\n[42] Colin Burke. 1991. A Practical View of Memex: The Career of The Rapid Selector.\n[43] Vannevar Bush. 1945. As We May Think. The Atlantic Monthly\n[44] Christoph J. Bussler, John Davies, Dieter Fensel, and Rudi Studer (Eds.). 2004. The Semantic Web: Research and Applications.\n[45] Meeyoung Cha, Alan Mislove, and Krishna P. Gummadi. 2009. A Measurement-Driven Analysis of Information Propagation in the Flickr Social Network.\n[46] James M. Clark and Allan Paivio. 1991. Dual coding theory and education.\n[47] Jeff Conklin. 1987. Hypertext: An Introduction and Survey.\n[48] Jeff Conklin. 1987. A Survey of Hypertext.\n[49] Jeff Conklin and Michael L. Begeman. 1988. gIBIS: A Hypertext Tool for Exploratory Policy Discussion.\n[50] Cunningham & Cunningham, Inc. 2005. Wiki Gardener.\n[51] Nada Dabbagh and Anastasia Kitsantas. 2012. Personal Learning Environments, social media, and self-regulated learning: A natural formula for connecting formal and informal learning.\n[52] Hugh C. Davis, Andy Lewis, and Antoine Rizk. 1996. OHP: A Draft Proposal for a Standard Open Hypermedia Protocol.\n[53] Hugh C. Davis, Siegfried Reich, and David E. Millard. 1997. A Proposal for a Common Navigational Hypertext Protocol.\n[54] Paul M. E. De Bra and Jan-Peter Ruiter. 2001. AHA! Adaptive Hypermedia for All.\n[55] Norman M. Delisle and Mayer D. Schwartz. 1986. Neptune: A Hypertext System for CAD Applications.\n[56] Steven J. DeRose and Andries van Dam. 1999. Document Structure and Markup in the FRESS Hypertext System.\n[57] Jacques Derrida. 1967. La structure, le signe et le jeu dans le discours des sciences humaines.\n[58] Andrea A. Di Sessa. 1985. A Principled Design for an Integrated Computational Environment.\n[59] Darcy DiNucci. 1999. Fragmented Future.\n[60] J. Yellowlees Douglas. 1994. “How do I stop this thing?”: Closure and Indeterminacy in Interactive Narratives.\n[61] Deborah M. Edwards. 1989. Lost in Hyperspace: Cognitive Mapping And Navigation in A Hypertext Environment.\n[62] Electronic Literature Organization. 1999. Electronic Literature Organization (ELO).\n[63] William C. Elm and David D. Woods. 1985. Getting Lost: A Case Study in Interface Design.\n[64] Douglas Carl Engelbart. 1962. Augmenting Human Intellect: A Conceptual Framework.\n[65] Douglas Carl Engelbart. 1968. The Mother of All Demos.\n[66] Douglas Carl Engelbart. 1984. Authorship provisions in AUGMENT.\n[67] Douglas Carl Engelbart and William K. English. 1968. A Research Center for Augmenting Human Intellect.\n[58] Douglas Carl Engelbart and Eugene E. Kim. 2006. The Augmented Wiki.\n[69] Ayelet Even-Ezra. 2021. Lines of Thought.\n[70] Steven Feiner. 1988. Seeing the Forest for the Trees: Hierarchical Displays of Hypertext Structures.\n[71] Steven Feiner, Sandor Nagy, and Andries Van Dam. 1981. An Integrated System for Creating and Presenting Complex Computer-Based Documents.\n[72] Cliff Figallo. 1993. The WELL: small town on the Internet highway system adapted from a paper presented to the” Public Access to the Internet” conference, Harvard University.\n[73] Steven Roger Fischer. 2020. A History of Writing.\n[74] Jim Flanagan. 2003. Search Referral Zeitgeist.\n[75] Judith Flanders. 2020. A Place For Everything.\n[76] Andrew M. Fountain, Wendy Hall, Ian Heath, and Hugh C. Davis. 1990. MICROCOSM: An Open Model for Hypermedia with Dynamic Linking.\n[77] Mark S. Fox and Andrew J. Palay. 1979. The BROWSE system: an introduction.\n[78] Jane Friedhoff. 2013. Untangling Twine: A Platform Study.\n[79] David Gibson. 2004. The Site Browser: Catalyzing Improvements in Hypertext Organization.\n[80] Jennifer Golbeck and Jim Hendler. 2006. FilmTrust: Movie Recommendations using Trust in Web-based Social Networks.\n[81] Ira P. Goldstein and Daniel G. Bobrow. 1980. A Layered Approach to Software Design.\n[82] Danny Goodman et al. 1988. The Complete Hypercard Handbook.\n[83] Dene Grigar. 2017. The Legacy of Judy Malloy.\n[84] Dene Grigar. 2019. Tear Down the Walls: An Exhibition of Hypertext & Participatory Narrative.\n[85] Dene Grigar, Nicholas Schiller, Vanessa Rhodes, Veronica Whitney, Mariah Gwin, and Katie Bowen. 2018. Rebooting Electronic Literature, Volume 1.\n[86] Dimitris Gritzalis, Miltiadis Kandias, Vasilis Stavrou, and Lilian Mitrou. 2014. History of Information: The case of Privacy and Security in Social Media.\n[87] Jonathan Grudin. 1994. Computer-Supported Cooperative Work: History And Focus.\n[88] Kaj Grønbæk and Randall H. Trigg. 1994. Design Issues for a Dexter-Based Hypermedia System.\n[89] Eric Gullichsen, Dilip D’Souza, and Pat Lincoln. 1986. The PlaneText Book: Technical Report STP-333-86 (P).\n[90] Bernard J. Haan, Paul Kahn, Victor A. Riley, James H. Coombs, and Norman K. Meyrowitz. 1992. IRIS Hypermedia Services.\n[91] Sean Haas. 2022. Doug Engelbart, Edge Notched Cards, and Early Links.\n[92] Frank G. Halasz. 1987. Reflections on NoteCards: Seven Issues for the next Generation of Hypermedia Systems.\n[93] Frank G. Halasz. 1991. “Seven Issues”: Revisited.\n[94] Frank G. Halasz. 2001. Reflections on “Seven Issues”: Hypertext in the Era of the Web.\n[95] Frank G. Halasz, Thomas P. Moran, and Randall H. Trigg. 1986. NoteCards in a Nutshell.\n[96] Frank G. Halasz and Mayer Schwartz. 1990. The Dexter Hypertext Reference Model.\n[97] Wendy Hall. 2011. From Hypertext to Linked Data: The Ever Evolving Web.\n[98] Wendy Hall, Hugh C. Davis, and Gerard Hutchings. 1996. Rethinking Hypermedia: The Microcosm Approach.\n[99] Charlie Hargood, Rosamund Davies, David E. Millard, Matt R. Taylor, and Samuel Brooker. 2012. Exploring (the Poetics of) Strange (and Fractal) Hypertexts.\n[100] Charlie Hargood, Mark J. Weal, and David E. Millard. 2018. The StoryPlaces Platform: Building a Web-Based Locative Hypertext System."

const textGroup = new THREE.Group();
const headText = new Text();
const blockText = new Text();

function displayTextBlock(head, text) {
    // Create:
    textGroup.add(blockText)
    textGroup.add(headText)
    blockText.attach(headText);
    blockText.layers.enable( 3 );
    scene.add(textGroup);

    // Set properties to configure:
    blockText.text = text;
    blockText.fontSize = 0.02;
    blockText.color = 0x000000;
    blockText.anchorX = 'left';
    blockText.anchorY = 'top';
    blockText.curveRadius = 1;

    headText.text = head;
    headText.fontSize = 0.03;
    headText.color = 0x000000;
    headText.anchorX = 'left';
    headText.anchorY = 'bottom';
    headText.curveRadius = 1;

    blockText.position.set( 0, 0.0, -1.0 );

    blockText.userData.constrainMin = new THREE.Vector3(0, -0.1, 0);
    blockText.userData.constrainMax = new THREE.Vector3(0, 2.5, 0)

    // console.log(blockText);
    headText.sync();
    blockText.sync();
}

// displayTextBlock(testDisplayHead,testDisplayText);




































function startPos(mesh) {
    // Set position to the camera
    mesh.position.x = camera.position.x;
    mesh.position.y = camera.position.y - 0.3;
    mesh.position.z = camera.position.z;

    // Set rotation to the camera
    // mesh.rotation.x = camera.rotation.x;
    // mesh.rotation.y = camera.rotation.y;
    // mesh.rotation.z = camera.rotation.z;
    // -------------------------------------------- Rotate the menu so it spawns relative to the camera, but not angled ---------
    

    // Get the direction the camera is facing
    var pLocal = new THREE.Vector3( 0, 0, -1 );
    var pWorld = pLocal.applyMatrix4( camera.matrixWorld );
    var dir = pWorld.sub( camera.position ).normalize();

    // Move the mesh away from the camera in the direction it is facing
    mesh.position.add(dir.clone().multiplyScalar(0.5));

    // Look at the camera
    var newRot = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt( mesh.position, camera.position, new THREE.Vector3( 0, -1, 0 ) ) 
    );

    mesh.quaternion.copy( newRot );
}































// Logic to handle mouse clicks to select text
function onDocumentMouseDown(event) {
    event.preventDefault();

    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children);

    // Draw a placeholder arrow to visualize the raycast
    // placeholderArrow(raycaster, 1, 0x7d10d3);

    if (intersects.length > 0) {
    	// Get the first intersection (closest to the camera)
        var intersection = intersects[0];

        // Access the mesh that was hit
        var mesh = intersection.object;

        if (mesh.userData.objType == "pdf"){
            // Multiply by the dimensions of the mesh to get local coordinates
            var width = mesh.geometry.parameters.width * 100; // Adjust as needed
            var height = mesh.geometry.parameters.height * 100; // Adjust as needed
            var intersectionPoint = new THREE.Vector2(
                intersection.uv.x * width,
                intersection.uv.y * height
            );
            // Output intersectionPoint for reference
            // console.log('Intersection Point:', intersectionPoint);

            pdfDoc.getPage(pageNum).then(function(page) {
            return page.getTextContent();
            }).then(function(textContent) {
                var selectedText = getSelectedContent(textContent, intersectionPoint.x, intersectionPoint.y, mesh);
                console.log("Selected Text:", selectedText);
            });
        }
        else if (mesh.userData.objType == "highlight") {
            var foundHighlight = allHighlights.indexOf(mesh);
            allHighlights.splice(foundHighlight, 1);

            // mesh.position.x += 1;
            mesh.parent.remove(mesh);
            console.log("FCT: Removed Highlight");
        }
        else {
            console.log("ERR: Invalid Selection");
        }
    }
}

function getSelectedContent(textContent, canvasX, canvasY, mesh) {
    var selectedText = "";
    var mesh = mesh;

    // console.log(textContent);

    textContent.items.forEach(function (hitItem) {
        var bounds = hitItem.transform;
        var minX = bounds[4];
        var minY = bounds[5];
        var maxX = bounds[4] + hitItem.width;
        var maxY = bounds[5] + hitItem.height;
        if (canvasX >= minX && canvasX <= maxX && canvasY >= minY && canvasY <= maxY) {
            selectedText += hitItem.str;

            drawHighlight(minX/100,minY/100,maxX/100,maxY/100, mesh);
            // console.log(textContent.items[0]);
        }
    });

    return selectedText;
}

function drawHighlight(minX, minY, maxX, maxY, mesh) {
    var x = 0, y = 0;
    var mesh = mesh;

    var geometry = new THREE.PlaneGeometry(maxX-minX, maxY-minY);
    var material = new THREE.MeshBasicMaterial( {
        color: 0x000077,
        transparent:true,
        opacity:0.2,
        side: THREE.DoubleSide,
        blending: THREE.SubtractiveBlending
    } );
    var newHighlight = new THREE.Mesh( geometry, material ) ;
    var width = mesh.geometry.parameters.width;
    var height = mesh.geometry.parameters.height

    // Add this highlight to the current highlights array
    scene.add( newHighlight );
    allHighlights.push( newHighlight );

    // Set the relative position of the new highlight
    var relativePosition = new THREE.Vector3(
        - width/2 + minX + (maxX - minX)/2,
        - height/2 + minY + (maxY - minY)/2,
        0
    ); 

    // Create a matrix to represent the combined rotation and translation of the mesh
    var meshMatrix = new THREE.Matrix4();
    meshMatrix.compose(mesh.position, mesh.quaternion, mesh.scale);

    // Apply the matrix to the relative position
    relativePosition.applyMatrix4(meshMatrix);

    // Set the highlight's position
    newHighlight.position.copy(relativePosition);

    // Set the highlight's rotation
    newHighlight.rotation.x = mesh.rotation.x;
    newHighlight.rotation.y = mesh.rotation.y;
    newHighlight.rotation.z = mesh.rotation.z;

    // Move the highlight very slightly towards the camera to avoid clipping
    newHighlight.translateOnAxis(newHighlight.worldToLocal(new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z)), 0.002);

    // Attach the highlight to its parent
    TESTPDF.attach(newHighlight);

    // Assign custom data to the highlight
    newHighlight.userData.objType = "highlight";

    console.log(allHighlights);
}


// Event listener for mouse down
document.addEventListener('mousedown', onDocumentMouseDown, false);


































// -------------------- HAND TRACKING ----------------------
let hand1, hand2;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let wrist1, wrist2, thumbTip1, thumbTip2, thumbDistal1, thumbDistal2, indexFingerTip1, indexFingerTip2,
indexDis1, indexDis2, middleFingerTip1, middleFingerTip2, middleDistal1, middleDistal2, ringFingerTip1, ringFingerTip2, 
pinkyFingerTip1, pinkyFingerTip2, indexKnuckle1, indexKnuckle2;

let line1, line2;

let controls;
let controller1enabled = false;
let controller2enabled = false;

let velocityObjects = [];
let rotationObjects = [];

const grabDistance = 0.095;

var lHeldObj = THREE.object;
var rHeldObj = THREE.object;

let lineMaterial, lineMaterialSelect;

function init() {

    const controllerModelFactory = new XRControllerModelFactory();
    const handModelFactory = new XRHandModelFactory();

    // controllers
    controller1 = renderer.xr.getController( 0 );
    scene.add( controller1 );

    controller2 = renderer.xr.getController( 1 );
    scene.add( controller2 );

    // Hand 1
    controllerGrip1 = renderer.xr.getControllerGrip( 0 );
    controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
    scene.add( controllerGrip1 );
    
    hand1 = renderer.xr.getHand( 0 );
    hand1.addEventListener( 'pinchstart', onPinchStartLeft );
    hand1.addEventListener( 'pinchend', onPinchEndLeft );
    hand1.add( handModelFactory.createHandModel( hand1 ) );
    scene.add( hand1 );
    
    // Hand 2
    controllerGrip2 = renderer.xr.getControllerGrip( 1 );
    controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
    scene.add( controllerGrip2 );

    hand2 = renderer.xr.getHand( 1 );
    hand2.addEventListener( 'pinchstart', onPinchStartRight );
    hand2.addEventListener( 'pinchend', onPinchEndRight );
    hand2.add( handModelFactory.createHandModel( hand2 ) );
    scene.add( hand2 );

    // Lines drawn from hands
    const lineGeometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );
    lineMaterial = new THREE.LineBasicMaterial({ color: 0x555555, linewidth: 1 });
    lineMaterialSelect = new THREE.LineBasicMaterial({ color: 0x559999, linewidth: 2 });
    line1 = new THREE.Line( lineGeometry, lineMaterial );
    line2 = new THREE.Line( lineGeometry, lineMaterial );

    // Wait for the hand to connect, then get finger joints
    hand1.addEventListener('connected', (event) => {
        // Access finger joints
        wrist1 = event.target.joints['wrist'];
        thumbTip1 = event.target.joints['thumb-tip'];
        thumbDistal1 = event.target.joints[ 'thumb-phalanx-distal' ];
        indexFingerTip1 = event.target.joints['index-finger-tip'];
        indexDis1 = event.target.joints[ 'index-finger-phalanx-distal' ];
        indexKnuckle1 = event.target.joints['index-finger-phalanx-proximal'];
        middleFingerTip1 = event.target.joints['middle-finger-tip'];
        ringFingerTip1 = event.target.joints['ring-finger-tip'];
        pinkyFingerTip1 = event.target.joints['pinky-finger-tip'];
        middleDistal1 = event.target.joints['middle-finger-phalanx-distal'];

        indexKnuckle1.add( line1 );
        line1.visible = false;
        controller1enabled = true;
    });

    // Wait for the hand to connect, then get finger joints
    hand2.addEventListener('connected', (event) => {
        // Access finger joints
        wrist2 = event.target.joints['wrist'];
        thumbTip2 = event.target.joints['thumb-tip'];
        thumbDistal2 = event.target.joints[ 'thumb-phalanx-distal' ];
        indexFingerTip2 = event.target.joints['index-finger-tip'];
        indexDis2 = event.target.joints[ 'index-finger-phalanx-distal' ];
        indexKnuckle2 = event.target.joints['index-finger-phalanx-proximal'];
        middleFingerTip2 = event.target.joints['middle-finger-tip'];
        ringFingerTip2 = event.target.joints['ring-finger-tip'];
        pinkyFingerTip2 = event.target.joints['pinky-finger-tip'];
        middleDistal2 = event.target.joints['middle-finger-phalanx-distal'];

        indexKnuckle2.add( line2 );
        line2.visible = false;
        controller2enabled = true;
    });
}

var TESTSPAWNPDF = false;

function onPinchStartLeft( event ) {    

    const controller = event.target;
    const hand = 'left';
    startGrab (controller, hand);

    if (TESTSPAWNPDF) {
        TESTSPAWNPDF = false;
        loadPDF('3511095.3531286.pdf');
    }

}

function onPinchEndLeft( event ) {

    const controller = event.target;
    const hand = 'left';
    endGrab (controller, hand);

}

function onPinchStartRight( event ) {    

    const controller = event.target;
    const hand = 'right';
    startGrab (controller, hand);

}

function onPinchEndRight( event ) {

    const controller = event.target;
    const hand = 'right';
    endGrab (controller, hand);

}

function startGrab( controller, hand ) {

    const indexTip = controller.joints[ 'index-finger-tip' ];
    const indexStrt = controller.joints[ 'index-finger-phalanx-proximal' ];
    const thumbTip = controller.joints[ 'thumb-tip' ];
    const thumbStrt = controller.joints[ 'thumb-phalanx-proximal' ];
    const object = collideObject( indexTip, thumbTip, indexStrt, thumbStrt );

    if ( object ) {

        thumbTip.attach( object );
        
        if (hand == 'left') {
            lHeldObj = object;
            if (object == rHeldObj) {
                rHeldObj = undefined;
            }
            // If the remote grab is holding this, clear it
            if (lHeldObj == otherPointObject) {
                otherPointObject = undefined;
                controller2.userData.selected = undefined;
            }
        }
        else if (hand == 'right') {
            rHeldObj = object;
            if (object == lHeldObj) {
                lHeldObj = undefined;
            }
            // If the remote grab is holding this, clear it
            if (rHeldObj == pointObject) {
                pointObject = undefined;
                controller1.userData.selected = undefined;
            }
        }

        controller.userData.selected = object;
        // console.log( 'Selected', object );
    }
}

function endGrab( controller, hand ) {

    if ( controller.userData.selected != undefined ) {
        const object = controller.userData.selected;

        if (hand == 'left' && object != rHeldObj && lHeldObj != undefined && object != otherPointObject) {
            lHeldObj = undefined;
            scene.attach( object );
            // Apply the throw velocity to the grabbed object
            object.userData.velocity = velocityL;
            velocityObjects.push( object );
            rotationObjects.push( object );
        }
        else if (hand == 'right' && object != lHeldObj && rHeldObj != undefined && object != pointObject) {
            rHeldObj = undefined;
            scene.attach( object );
            // Apply the throw velocity to the grabbed object
            object.userData.velocity = velocityR;
            velocityObjects.push( object );
            rotationObjects.push( object );
        }
        controller.userData.selected = undefined;
    }
}

function collideObject( indexTip, thumbTip, indexStrt, thumbStrt ) {
    var attemptFailed = false;
    try { // Raycast forward from the thumb and get the first object hit
        var raycaster = new THREE.Raycaster();
        raycaster.layers.set( 1 );
        var thumbForward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(thumbTip.quaternion);
        raycaster.set(thumbStrt.getWorldPosition(new THREE.Vector3), thumbForward);
        var intersects = raycaster.intersectObjects(scene.children);
        var intersect = intersects[0];

        // Draw a placeholder arrow to visualize the raycast
        // placeholderArrow(raycaster, grabDistance, 0xff10d3);

        // Check if the hit object is something we want to grab
        if (intersect.object.userData.grabbable == "true" 
            && intersect.distance <= grabDistance * 1) {
            return intersect.object;
        }
    }
    catch { // The ray didn't hit anything
        attemptFailed = true;
    }

    // If the first ray failed, try a raycast based on the index finger instead.
    if (attemptFailed == true) {
        try {
            var backupRaycaster = new THREE.Raycaster();
            backupRaycaster.layers.set( 1 );
            var indexForward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(indexTip.quaternion);
            backupRaycaster.set(indexStrt.getWorldPosition(new THREE.Vector3), indexForward);
            var backupIntersects = backupRaycaster.intersectObjects(scene.children);
            var backupIntersect = backupIntersects[0];

            // Draw a placeholder arrow to visualize the raycast
            // placeholderArrow(raycaster, grabDistance, 0xffffff);

            // Check if the hit object is something we want to grab
            if (backupIntersect.object.userData.grabbable == "true" 
                && backupIntersect.distance <= grabDistance * 1.5) {
                return backupIntersect.object;
            }
        }
        catch { // The backup ray didn't hit anything either
            console.log("ERR: No Grabbable Found");
        }
        // Nothing succeeded, no valid hit results
        return null;
    }
}





var scaleStartDistance = 0;

function tryScaleObjects() {
    var touchedObject, otherTouchedObject;
    var intersect, otherIntersect;
    if (pointObject == undefined && otherPointObject == undefined && rHeldObj == undefined && lHeldObj == undefined) {

        if (indexFingerTip1.position.distanceTo(middleFingerTip1.position) <= 0.04) {
            try { // Raycast forward from the index and get the first object hit
                var raycaster = new THREE.Raycaster();
                raycaster.layers.set( 1 );
                var indexPointForward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(indexFingerTip1.quaternion);
                raycaster.set(indexDis1.getWorldPosition(new THREE.Vector3), indexPointForward);
                var intersects = raycaster.intersectObjects(scene.children);
                intersect = intersects[0];

                // Draw a placeholder arrow to visualize the raycast
                // placeholderArrow(raycaster, grabDistance, 0x33ff77);

                // Check if the hit object is something we want to scale
                if (intersect.object.userData.grabbable == "true" 
                    && intersect.distance <= grabDistance * 1) {
                    touchedObject = intersect.object;
                }
            }
            catch { // The ray didn't hit anything
                
            }
        }

        if (indexFingerTip1.position.distanceTo(middleFingerTip1.position) <= 0.04) {
            try { // Raycast forward from the index and get the first object hit (second hand)
                var otherRaycaster = new THREE.Raycaster();
                otherRaycaster.layers.set( 1 );
                var index2PointForward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(indexFingerTip2.quaternion);
                otherRaycaster.set(indexDis2.getWorldPosition(new THREE.Vector3), index2PointForward);
                var otherIntersects = otherRaycaster.intersectObjects(scene.children);
                otherIntersect = otherIntersects[0];

                // Draw a placeholder arrow to visualize the raycast
                // placeholderArrow(raycaster, grabDistance, 0xff7733);

                // Check if the hit object is something we want to scale
                if (otherIntersect.object.userData.grabbable == "true" 
                    && otherIntersect.distance <= grabDistance * 1) {
                    otherTouchedObject = otherIntersect.object;
                }
            }
            catch { // The ray didn't hit anything
                
            }
        }

        // If both fingers are touching the same object, try scaling
        if (touchedObject == otherTouchedObject && touchedObject != undefined) {
            var distance = calculateDistance(intersect.point, otherIntersect.point);
            var scale = mapDistanceToScale(distance);

            if (scaleStartDistance == 0) {
                scaleStartDistance = distance / touchedObject.scale.x;
            }
            
            // const scaleFactor = distance / scaleStartDistance;

            const scaleFactor = Math.min(Math.max(distance / scaleStartDistance, 0.25), 5);

            touchedObject.scale.set(scaleFactor, scaleFactor, scaleFactor);
        }
        else {
            scaleStartDistance = 0;
        }
    }
}

function calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
}

function mapDistanceToScale(distance) {
    // Adjust these values based on experimentation
    const minDistance = 0.1;  // Minimum distance for scaling
    const maxDistance = 1;    // Maximum distance for scaling
    const minScale = 0.25;    // Minimum scale factor
    const maxScale = 5.0;     // Maximum scale factor

    // Map distance to scale within the specified range
    const normalizedDistance = Math.min(Math.max(distance, minDistance), maxDistance);
    const scaleFactor = (normalizedDistance - minDistance) / (maxDistance - minDistance);
    const scaledValue = minScale + scaleFactor * (maxScale - minScale);

    return scaledValue;
}

function placeholderArrow(raycaster, length = grabDistance, color = 0x33ff77) {
    // Draw a placeholder arrow to visualize the raycast
    const arrowTest = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, length, color);
    scene.add(arrowTest);
    setTimeout(() => {scene.remove(arrowTest);},200);
}

function norm(value, min, max) {
    return (value - min) / (max - min);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
















//  TEST CUBE FOR GRABBING =================================
const testGeo = new THREE.BoxGeometry( 0.02, 0.02, 0.02 );
const testMat = new THREE.MeshBasicMaterial( {
    color: Math.random() * 0xffffff
} );
const testCube = new THREE.Mesh( testGeo, testMat );
testCube.geometry.computeBoundingSphere();

testCube.position.set( 0, 0, 0 );
// spawn.userData.grabbable = "true";
// testCube.layers.enable( 1 );

scene.add( testCube );

const testPillarGeo = new THREE.CylinderGeometry( 0.005, 0.005, 1.5, 4);
const testPillar = new THREE.Mesh( testPillarGeo, testMat );
scene.add( testPillar );
testPillar.position.set( 0, -0.75, 0 );
testPillar.visible = false;
// =========================================================










var prevControllerPosL = new THREE.Vector3(0.0,0.0,0.0);
var prevControllerPosR = new THREE.Vector3(0.0,0.0,0.0);
var velocityL = new THREE.Vector3(0.0,0.0,0.0);
var velocityR = new THREE.Vector3(0.0,0.0,0.0);

const velocityDampen = 0.95;

function calcControllerVelocity() {
    // Calculate velocity of the left hand
    if (controller1enabled) {
        velocityL = new THREE.Vector3(
        indexKnuckle1.position.x - prevControllerPosL.x,
        indexKnuckle1.position.y - prevControllerPosL.y,
        indexKnuckle1.position.z - prevControllerPosL.z);

        prevControllerPosL.x = indexKnuckle1.position.x;
        prevControllerPosL.y = indexKnuckle1.position.y;
        prevControllerPosL.z = indexKnuckle1.position.z;
    }

    // Calculate velocity of the right hand
    if (controller2enabled) {
        velocityR = new THREE.Vector3(
        indexKnuckle2.position.x - prevControllerPosR.x,
        indexKnuckle2.position.y - prevControllerPosR.y,
        indexKnuckle2.position.z - prevControllerPosR.z);

        prevControllerPosR.x = indexKnuckle2.position.x;
        prevControllerPosR.y = indexKnuckle2.position.y;
        prevControllerPosR.z = indexKnuckle2.position.z;
    }
}


function calcThrownObjs() {
    // Check if a thrown object exists
    if (velocityObjects.length > 0) {
        for (var i = velocityObjects.length - 1; i >= 0; i--) {
            var thrownObject = velocityObjects[i];

            // Update the position based on the throw velocity
            var thisVelocity = new THREE.Vector3(
                thrownObject.userData.velocity.x,
                thrownObject.userData.velocity.y,
                thrownObject.userData.velocity.z
            );

            // Clamp the velocity and dampen it
            thisVelocity.x *= velocityDampen;
            thisVelocity.y *= velocityDampen;
            thisVelocity.z *= velocityDampen;

            // Add velocity to the object thrown
            if (Math.abs(thisVelocity.x) > 0.0001 || Math.abs(thisVelocity.y) > 0.0001 || Math.abs(thisVelocity.z) > 0.0001) {
                thrownObject.position.add(thisVelocity);
            } else { // If the object has stopped moving, remove it from future calculations
                velocityObjects.splice(i,1);
            }
            thrownObject.userData.velocity = thisVelocity;
        }
    }
}


function calcRotationObjs() {
    // Check if any objects should be rotated
    if (rotationObjects.length > 0) {
        for (var i = rotationObjects.length -1; i >= 0; i--) {
            var spinObject = rotationObjects[i];

            if (spinObject.userData.targetQuaternion == undefined) {
                spinObject.userData.targetQuaternion = new THREE.Quaternion().copy(camera.quaternion);
            }

            var targetQuaternion = spinObject.userData.targetQuaternion;

            var step = 0.015;
            spinObject.quaternion.rotateTowards(targetQuaternion, step);

                // Get the rotation vector of the object facing the camera

                // Rotate the object towards that destination vector

                // If the object's rotation is close enough to the destination rotation, remove the object from the rotationObjects array
    
            if (spinObject.quaternion.equals(targetQuaternion)) {
                rotationObjects.splice(i,1);
                spinObject.userData.targetQuaternion = undefined;
            }
        }
    }
}


































// page mapping test
function cylMapTest(radius = 1, height = 1, thetaStart = 0, thetaLength = Math.PI * 2) {
    height = 1707 / 2000;
    thetaLength = 8192 / 2000;
    const geo = new THREE.CylinderGeometry( radius, radius, height, 64, 1, true, thetaStart, thetaLength );
    // const mat = new THREE.MeshBasicMaterial( {color: 0xfde0f0, side: THREE.DoubleSide} );
    const mat = new THREE.MeshBasicMaterial( {
        color: 0xffffff,
        side: THREE.BackSide,
        map: new THREE.TextureLoader().load(
            './12-page-spread-for-testing.jpg'
    )
} );
    const cyl = new THREE.Mesh ( geo, mat );
    scene.add( cyl );

    cyl.scale.x = -1;
    cyl.position.y = 1.5;
    cyl.layers.enable( 2 );
}

var offsetPositionY;
var offsetAngle;
var wrist2NormalXVector = new THREE.Vector3();
var wrist2NormalZVector = new THREE.Vector3();
var wrist2Roll, wrist2Pitch;
var curObjDir = new THREE.Vector3();
var swipeRayLengthBase = 0.75;

function trySwipe() {
    if ( rHeldObj == undefined && currentTool2 == 'none'
    && pinkyFingerTip2.position.distanceTo(wrist2.position) > 0.15 
    && ringFingerTip2.position.distanceTo(wrist2.position) > 0.15
    && middleFingerTip2.position.distanceTo(wrist2.position) > 0.15
    && indexFingerTip2.position.distanceTo(wrist2.position) > 0.15
    ) {
        // get the orientation of the palm
        palm2NormalX.getWorldPosition(wrist2NormalXVector);
        palm2NormalZ.getWorldPosition(wrist2NormalZVector);
        wrist2Roll = Math.abs(wrist2.position.y - wrist2NormalXVector.y);
        wrist2Pitch = Math.abs(wrist2.position.y - wrist2NormalZVector.y);

        // console.log("World Direction: " + wrist2Pitch);

        // Modify the ray length based on the palm pitch
        var swipeRayLength = swipeRayLengthBase;
        // 0 (flat) - 0.3 (vertical)

        // raycast for objects being pointed at
        var raycaster = new THREE.Raycaster();
        raycaster.layers.set( 3 );
        var forward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(wrist2.quaternion);
        raycaster.set(wrist2.getWorldPosition(new THREE.Vector3), forward);
        var intersects = raycaster.intersectObjects(scene.children);
        var intersect = intersects[0];
        var yMin = -99;
        var yMax = 99;

        // placeholder arrow
        // placeholderArrow(raycaster, swipeRayLength, 0xd310ff);

        // Check if the object has userdata that would constrain its movement
        if (intersect && intersect.object.userData.constrainMin && intersect.object.userData.constrainMax) {
            yMin = intersect.object.userData.constrainMin.y;
            yMax = intersect.object.userData.constrainMax.y;
        }

        // Check if the hand is gesturing vertically or horizontally
        // roll is large & pitch is small = horizontal
        // roll is large & pitch is large = nothing
        // roll is small & pitch is large = vertical
        // roll is small & pitch is small = vertical
        if (wrist2Roll < 0.23) { // VERTICAL

            offsetAngle = undefined;

            if (intersect && intersect.distance <= swipeRayLength) {

                if (!offsetPositionY) {
                    offsetPositionY = intersect.point.y;
                }

                var movement = intersect.point.y - offsetPositionY;

                if (movement && intersect.object.position.y + movement >= yMin && intersect.object.position.y + movement <= yMax) {
                    intersect.object.position.y += movement;
                    // console.log(intersect.object.position.y);
                }

                offsetPositionY = intersect.point.y;

            }
            else if (offsetPositionY) {
                offsetPositionY = undefined;
            }

        } else if (wrist2Pitch < 0.2) { // HORIZONTAL

            offsetPositionY = undefined;

            if (intersect && intersect.distance <= swipeRayLength) {

                var curObjDir = new THREE.Vector3();
                curObjDir.subVectors(intersect.point, intersect.object.parent.position).normalize();
                var angle = Math.atan2(curObjDir.x, curObjDir.z);

                if (!offsetAngle) {
                    offsetAngle = angle;
                }

                var movement = angle - offsetAngle;

                if (movement) {
                    intersect.object.parent.rotation.y += movement;
                    // console.log(movement + ' | ' + angle + ' | ' + offsetAngle);
                }

                offsetAngle = angle;

            }
            else if (offsetAngle) {
                offsetAngle = undefined;
            }
        }
    }
    else if (offsetPositionY || offsetAngle) {
        offsetPositionY = undefined;
        offsetAngle = undefined;
    }
}





let palm1NormalX, palm2NormalX, palm1NormalZ, palm2NormalZ;
function initHandNormals() {
    
    const geo = new THREE.BoxGeometry( 0.0, 0.0, 0.0 );
    const mat = new THREE.MeshBasicMaterial( {
        color: Math.random() * 0xffffff
    } );
    palm2NormalX = new THREE.Mesh( geo, mat );
    palm2NormalZ = new THREE.Mesh( geo, mat );

    palm2NormalX.position.set( wrist2.position.x, wrist2.position.y, wrist2.position.z );
    palm2NormalX.rotation.set( wrist2.rotation.x, wrist2.rotation.y, wrist2.rotation.z );
    palm2NormalZ.position.set( wrist2.position.x, wrist2.position.y, wrist2.position.z );
    palm2NormalZ.rotation.set( wrist2.rotation.x, wrist2.rotation.y, wrist2.rotation.z );

    scene.add( palm2NormalX );
    wrist2.attach( palm2NormalX );
    scene.add( palm2NormalZ );
    wrist2.attach( palm2NormalZ );

    palm2NormalX.translateX( 0.3 );
    palm2NormalZ.translateZ( 0.3 );

    // console.log("intialized: " + palm2NormalX);
}





































var pointObject, otherPointObject;
var breakPoint, breakOtherPoint = false;
var visiblePoseLine, visibleOtherPoseLine;
var remoteGrabbed, remoteOtherGrabbed = false;
var remoteIndexCurlStart, remoteOtherIndexCurlStart = 0;
var remoteObjAccel, remoteOtherObjAccel = undefined;
var remoteCurlStart, remoteOtherCurlStart = false;
var remoteSpecialGrip, remoteOtherSpecialGrip = false;

function tryRemoteGrab() {
    // LEFT hand (or controller1)
    // Check if the pose is pointing
    if ( lHeldObj == undefined
    && pinkyFingerTip1.position.distanceTo(wrist1.position) < 0.13 
    && ringFingerTip1.position.distanceTo(wrist1.position) < 0.13
    && middleFingerTip1.position.distanceTo(wrist1.position) < 0.13
    ) {
        // toggle line visibility
        if (visiblePoseLine) {
            line1.visible = true;
        }
        else {
            line1.visible = false;
        }

        // Check if the thumb is touching the middle finger
        if (thumbTip1.position.distanceTo(middleDistal1.position) < 0.035 ) {
            line1.material = lineMaterialSelect;

            // raycast for objects being pointed at
            var raycaster = new THREE.Raycaster();
            raycaster.layers.set( 1 );
            var indexPointForward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(indexKnuckle1.quaternion);
            raycaster.set(indexKnuckle1.getWorldPosition(new THREE.Vector3), indexPointForward);
            var intersects = raycaster.intersectObjects(scene.children);
            var intersect = intersects[0];

            if (intersect && controller1.userData.selected == undefined && !remoteGrabbed) {
                pointObject = intersect.object;
                controller1.userData.selected = pointObject;
                wrist1.attach(pointObject);
                visiblePoseLine = false;
                remoteGrabbed = true;
                // If the other hand is holding this, clear it
                if (rHeldObj == pointObject) {
                    rHeldObj = undefined;
                    controller2.userData.selected = undefined;
                }

            }
            else if (controller1.userData.selected != undefined && remoteGrabbed) {

                // If the index curl hasn't been set yet, do so.
                if (remoteIndexCurlStart == 0) {
                    // remoteIndexCurlStart = indexFingerTip1.position.distanceTo(thumbTip1.position);
                    remoteIndexCurlStart = 0.09;
                }

                var indexThumbDist = indexFingerTip1.position.distanceTo(thumbTip1.position);
                var remotePush = false;

                if (indexThumbDist <= (remoteIndexCurlStart / 2) + 0.02) {
                    // Move object closer
                    remoteObjAccel = (((remoteIndexCurlStart / 2) + 0.02) - indexThumbDist) * 2;
                    remoteCurlStart = true;
                }
                else if (remoteCurlStart) {
                    // Move object away
                    remoteObjAccel = (((remoteIndexCurlStart / 2) + 0.02) - indexThumbDist) * 2;
                    remotePush = true;
                }

                if (remoteObjAccel != undefined) {
                    scene.attach(pointObject);
                    // Check if the object is being pushed or pulled
                    if (remotePush && camera.position.distanceTo(pointObject.position) <= 7) {       

                        // Calculate the direction vector from the wrist to the hand
                        var direction = new THREE.Vector3().subVectors(wrist1.position, indexKnuckle1.position);

                        // Normalize the direction vector
                        direction.normalize();

                        // Move the object relative to the hand
                        pointObject.position.add(direction.multiplyScalar(remoteObjAccel));

                        wrist1.attach(pointObject);
                    }
                    else if (!remotePush && Math.abs(thumbTip1.position.distanceTo(pointObject.position)) >= .05) {

                        // Calculate the direction vector from the hand to the object
                        var direction = new THREE.Vector3().subVectors(thumbTip1.position, pointObject.position);

                        // Normalize the direction vector
                        direction.normalize();

                        // If moving the object would result in it being too close to the hand next iteration
                        // then snap to the hand position now.
                        if (Math.abs(thumbTip1.position.distanceTo(pointObject.position)) <= remoteObjAccel) {
                            pointObject.position.set(thumbTip1.position.x, thumbTip1.position.y, thumbTip1.position.z);
                        }
                        else {
                            // Move the object relative to the hand
                            pointObject.position.add(direction.multiplyScalar(remoteObjAccel));
                        }
                        wrist1.attach(pointObject);
                    }
                    else {
                        wrist1.attach(pointObject);
                    }
                }
            }
        }
        else {
            breakPoint = true;
        }
    }
    else {
        line1.visible = false;
        breakPoint = true;

        // Drop the object if the hand was pinching it
        // if (lHeldObj != undefined && remoteSpecialGrip) {
        //     scene.attach( lHeldObj );
        //     // Apply the throw velocity to the grabbed object
        //     lHeldObj.userData.velocity = velocityL;
        //     velocityObjects.push( lHeldObj );

        //     lHeldObj = undefined;
        //     remoteSpecialGrip = false;
        // }
    }

    if (breakPoint) {
        line1.scale.z = 2;
        line1.material = lineMaterial;
        visiblePoseLine = true;
        remoteGrabbed = false;
        remoteIndexCurlStart = 0;
        remoteObjAccel = undefined;
        remoteCurlStart = false;

        if (pointObject && controller1.userData.selected == pointObject) {
            // as long as a hand isn't holding this, drop the object
            if (rHeldObj != pointObject && pointObject != otherPointObject && lHeldObj != pointObject) {
                scene.attach( pointObject );
                // Apply the throw velocity to the grabbed object
                pointObject.userData.velocity = velocityL;
                velocityObjects.push( pointObject );
                rotationObjects.push( pointObject );
            }
            controller1.userData.selected = undefined;
            pointObject = undefined;
        }        
        breakPoint = false;
    }


// ============================================================= WHEN TAKEN BY OTHER REMOTE GRAB, DOESN'T DISENGAGE


    // RIGHT hand (or controller2)
    // Check if the pose is pointing
    if (pinkyFingerTip2.position.distanceTo(wrist2.position) < 0.13 
    && ringFingerTip2.position.distanceTo(wrist2.position) < 0.13
    && middleFingerTip2.position.distanceTo(wrist2.position) < 0.13
    ) {
        // toggle line visibility
        if (visibleOtherPoseLine) {
            line2.visible = true;
        }
        else {
            line2.visible = false;
        }

        // Check if the thumb is touching the middle finger
        if (thumbTip2.position.distanceTo(middleDistal2.position) < 0.035 ) {
            line2.material = lineMaterialSelect;

            // raycast for objects being pointed at
            var raycaster = new THREE.Raycaster();
            raycaster.layers.set( 1 );
            var indexPointForward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(indexKnuckle2.quaternion);
            raycaster.set(indexKnuckle2.getWorldPosition(new THREE.Vector3), indexPointForward);
            var intersects = raycaster.intersectObjects(scene.children);
            var intersect = intersects[0];

            if (intersect && controller2.userData.selected == undefined && !remoteOtherGrabbed) {
                otherPointObject = intersect.object;
                controller2.userData.selected = otherPointObject;
                wrist2.attach(otherPointObject);
                visibleOtherPoseLine = false;
                remoteOtherGrabbed = true;
                // If the other hand is holding this, clear it
                if (lHeldObj == otherPointObject) {
                    lHeldObj = undefined;
                    controller1.userData.selected = undefined;
                }
            }
            else if (controller2.userData.selected != undefined && remoteOtherGrabbed) {

                // If the index curl hasn't been set yet, do so.
                if (remoteOtherIndexCurlStart == 0) {
                    // remoteOtherIndexCurlStart = indexFingerTip2.position.distanceTo(thumbTip2.position);
                    remoteOtherIndexCurlStart = 0.09;
                }

                var indexOtherThumbDist = indexFingerTip2.position.distanceTo(thumbTip2.position);
                var remoteOtherPush = false;

                if (indexOtherThumbDist <= (remoteOtherIndexCurlStart / 2) + 0.02) {
                    // Move object closer
                    remoteOtherObjAccel = (((remoteOtherIndexCurlStart / 2) + 0.02) - indexOtherThumbDist) * 2;
                    remoteOtherCurlStart = true;
                }
                else if (remoteOtherCurlStart) {
                    // Move object away
                    remoteOtherObjAccel = (((remoteOtherIndexCurlStart / 2) + 0.02) - indexOtherThumbDist) * 2;
                    remoteOtherPush = true;
                }

                if (remoteOtherObjAccel != undefined) {
                    scene.attach(otherPointObject);
                    // Check if the object is being pushed or pulled
                    if (remoteOtherPush && camera.position.distanceTo(otherPointObject.position) <= 7) {       

                        // Calculate the direction vector from the wrist to the hand
                        var direction = new THREE.Vector3().subVectors(wrist2.position, indexKnuckle2.position);

                        // Normalize the direction vector
                        direction.normalize();

                        // Move the object relative to the hand
                        otherPointObject.position.add(direction.multiplyScalar(remoteOtherObjAccel));

                        wrist2.attach(otherPointObject);
                    }
                    else if (!remoteOtherPush && Math.abs(thumbTip2.position.distanceTo(otherPointObject.position)) >= .05) {

                        // Calculate the direction vector from the hand to the object
                        var direction = new THREE.Vector3().subVectors(thumbTip2.position, otherPointObject.position);

                        // Normalize the direction vector
                        direction.normalize();

                        // If moving the object would result in it being too close to the hand next iteration
                        // then snap to the hand position now.
                        if (Math.abs(thumbTip2.position.distanceTo(otherPointObject.position)) <= remoteOtherObjAccel) {
                            otherPointObject.position.set(thumbTip2.position.x, thumbTip2.position.y, thumbTip2.position.z);
                        }
                        else {
                            // Move the object relative to the hand
                            otherPointObject.position.add(direction.multiplyScalar(remoteOtherObjAccel));
                        }
                        wrist2.attach(otherPointObject);
                    }
                    else {
                        wrist2.attach(otherPointObject);
                    }
                }
            }
        }
        else {
            breakOtherPoint = true;
        }
    }
    else {
        line2.visible = false;
        breakOtherPoint = true;

        // Drop the object if the hand was pinching it
        // if (rHeldObj != undefined && remoteOtherSpecialGrip) {
        //     scene.attach( rHeldObj );
        //     // Apply the throw velocity to the grabbed object
        //     rHeldObj.userData.velocity = velocityR;
        //     velocityObjects.push( rHeldObj );

        //     rHeldObj = undefined;
        //     remoteOtherSpecialGrip = false;
        // }
    }

    if (breakOtherPoint) {
        line2.scale.z = 2;
        line2.material = lineMaterial;
        visibleOtherPoseLine = true;
        remoteOtherGrabbed = false;
        remoteOtherIndexCurlStart = 0;
        remoteOtherObjAccel = undefined;
        remoteOtherCurlStart = false;

        if (otherPointObject && controller2.userData.selected == otherPointObject) {
            // as long as a hand isn't holding this, drop the object
            if (lHeldObj != otherPointObject && pointObject != otherPointObject && rHeldObj != otherPointObject) {
                scene.attach( otherPointObject );
                // Apply the throw velocity to the grabbed object
                otherPointObject.userData.velocity = velocityR;
                velocityObjects.push( otherPointObject );
                rotationObjects.push( otherPointObject );
            }
            controller2.userData.selected = undefined;
            otherPointObject = undefined;
        }        
        breakOtherPoint = false;
    }

}









function repositionWorld() {

    const baseReferenceSpace = renderer.xr.getReferenceSpace();

    const offsetPosition = camera.position;

    // const offsetRotation = camera.quaternion;
    const offsetRotation = new THREE.Quaternion();

    const transform = new XRRigidTransform( offsetPosition, {x: offsetRotation.x, y: -(offsetRotation.y), z: offsetRotation.z, w: offsetRotation.w } );

    const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace( transform );

    renderer.xr.setReferenceSpace( teleportSpaceOffset );
}



// repositionWorld();

var recenterTimer = 0.0;
var recenterThreshold = 2;

function tryRecenter() {

    if (camera.position.distanceTo(testCube.position) > 0.5) {
        recenterTimer += deltaTime;
    }
    else if (recenterTimer > 0) {
        recenterTimer -= deltaTime;
    }

    // console.log(camera.position.distanceTo(testCube.position));

    if( recenterTimer >= recenterThreshold ) {
        console.log("RECENTERING");
        repositionWorld();
        setToolPositions();
        recenterTimer = 0;
    }
}


// vr-button
// Overwrite window.requestAnimationFrame so it runs in XR
// viewVR.addEventListener('click', e=>{
//     var optionalFeatures= [ 'local-floor', 'bounded-floor', 'hand-tracking'];
//     const sessionParams = { optionalFeatures };
//     navigator.xr.requestSession( 'immersive-vr', sessionParams )
//     .then( session => {
//         this.session = session;
//         this.renderer.xr.setSession( session );
//         window.oldRequestAnimationFrame = window.requestAnimationFrame;
//         window.requestAnimationFrame = session.requestAnimationFrame;
//     });
// });


function fetchHTML(url, callback) {
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'html',
        success: function(data) {
            callback(data);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching HTML: ', error);
        }
    });
}


function processHTML(htmlContent) {
    var $html = $(htmlContent);

    // Find all classes 'bib' and read their inner html
    var bibElements = $html.find('.bib');
    bibElements.each(function() {
        var innerHTML = $(this).html();
        console.log(innerHTML);
    });
}


fetchHTML('./3511095.3531271.html', processHTML);










































































var firstInit = false;
var secondInit = false;
var loadDelay = 1.0;

// Check if WebGL is available on this browser
if ( WebGL.isWebGLAvailable() ) {

    // Enable XR rendering for the WebGLRenderer
    renderer.xr.enabled = true;

    // Append the VRButton to the doc body
    document.body.appendChild( VRButton.createButton( renderer ) );

    // ================================================ RENDER LOOP ===================================================== //
    renderer.setAnimationLoop( function () {
        timer.update();
        deltaTime = timer.getDelta();

        if (renderer.xr.isPresenting && !firstInit && loadDelay > 0) {
            // When the VR mode is first launched
            browserSphereTransitionSetup();
        }

        calcControllerVelocity();
        calcThrownObjs();
        calcRotationObjs();

        // ===== ONLY RUN AFTER CONTROLLERS ARE INITIALIZED ===== //
        if (controller1enabled && controller2enabled) {
            if (loadDelay > 0) { loadDelay -= deltaTime };

            if (!firstInit && loadDelay <= 0) { // This runs once after the user is inside VR
                firstInit = true;
                // fetchMap();
                initHandNormals();
                repositionWorld();
                initMenu();
                initTools();
                displayTextBlock(testDisplayHead,testDisplayText);

                testPillar.visible = true;
            } else if (firstInit && !secondInit && indexFingerTip2.position.distanceTo(wrist2.position) > 0.1 && indexFingerTip1.position.distanceTo(wrist1.position)){
                // This runs once after the hands have properly loaded
                secondInit = true;
                setToolPositions();
            }

            if (firstInit && secondInit) { // This runs every frame after first initialization
                // tryRemoteGrab();
                // tryScaleObjects();
                trySwipe();
                tryMenu();
                tryBtns();
                tryRecenter();
                tryTools();
            }

        };

        testAnim(testCube,0.5);

        renderer.render( scene, camera );
        TWEEN.update();
    } );
    // ================================================================================================================== //

    init();

} else {

    // const warning = WebGL.getWebGLErrorMessage();
    // document.getElementById( 'container' ).appendChild( warning );

}

// Animate the doc for testing
function testAnim(object,n=0.2) {
    object.rotation.x -= n * deltaTime;
    object.rotation.y -= n * deltaTime;
}

// Call the loadPDF function with your PDF URL
// loadPDF('../3511095.3531286.pdf');
var pageNum = 10;
// timeout();

// Move some stuff around for the test layout
camera.position.z = 1;
// camera.rotation.z = 32;
// camera.rotation.y = 0.2;