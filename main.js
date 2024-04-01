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

// Set up the default workspace
var workspace = new THREE.Group();
scene.add(workspace);

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
floorAxis.visible = false;


// Universal axis definitions

const _xbackward = new THREE.Vector3( -1, 0, 0 );
const _xforward = new THREE.Vector3( 1, 0, 0 );
const _ybackward = new THREE.Vector3( 0, -1, 0 );
const _yforward = new THREE.Vector3( 0, 1, 0 );
const _zbackward = new THREE.Vector3( 0, 0, -1 );
const _zforward = new THREE.Vector3( 0, 0, 1 );

var debugMode = false;
const readerStartDistance = 3;


















// ================================== MENU CONTENT =========================================

const normalNone = new THREE.TextureLoader().load( './normal-none.jpg' );
// const normalArtdeco = new THREE.TextureLoader().load( './normal-artdeco.jpg' );
// const normalGrate = new THREE.TextureLoader().load( './normal-grate.jpg' );
// const normalLace = new THREE.TextureLoader().load( './normal-lace.jpg' );
// const normalScifi1 = new THREE.TextureLoader().load( './normal-scifi-1.jpg' );
// const normalScifi2 = new THREE.TextureLoader().load( './normal-scifi-2.jpg' );
// const normalScifi3 = new THREE.TextureLoader().load( './normal-scifi-3.jpg' );
// const normalScifi4 = new THREE.TextureLoader().load( './normal-scifi-4.jpg' );
// const normalScifi5 = new THREE.TextureLoader().load( './normal-scifi-5.jpg' );
// const normalScifi6 = new THREE.TextureLoader().load( './normal-scifi-6.jpg' );
// const normalScifi7 = new THREE.TextureLoader().load( './normal-scifi-7.jpg' );
// const normalScifi8 = new THREE.TextureLoader().load( './normal-scifi-8.jpg' );
// const normalScifi9 = new THREE.TextureLoader().load( './normal-scifi-9.jpg' );
// const normalScifi10 = new THREE.TextureLoader().load( './normal-scifi-10.jpg' );
// const normalScifi11 = new THREE.TextureLoader().load( './normal-scifi-11.jpg' );

// const normalOptions = [normalArtdeco,normalGrate,normalLace,normalScifi1,normalScifi2,normalScifi3,
//     normalScifi4,normalScifi5,normalScifi6,normalScifi7,normalScifi8,normalScifi9,normalScifi10,normalScifi11];

// var nbtnArt,nbtnGrate,nbtnLace,nbtnSci1,nbtnSci2,nbtnSci3,nbtnSci4,nbtnSci5,nbtnSci6,nbtnSci7,
//     nbtnSci8,nbtnSci9,nbtnSci10,nbtnSci11;

// const normalBtns = [nbtnArt,nbtnGrate,nbtnLace,nbtnSci1,nbtnSci2,nbtnSci3,nbtnSci4,nbtnSci5,nbtnSci6,nbtnSci7,
//     nbtnSci8,nbtnSci9,nbtnSci10,nbtnSci11];

var normalMainBtn, sliderMainBtn, settingsBackBtn, slidersBackBtn;

var sliderNormalScale, sliderEmissive, sliderReaderDistanceMin;

var sliderNormalBg, sliderEmissiveBg, sliderReaderDistanceBg;

var debugBtn, debugText;

var exportBtn, exportText;

// =========================================================================================









const menuGroup = new THREE.Group();

var menuGeo = new THREE.CylinderGeometry( 0.1, 0.1, 0.6, 3, 1, false );
var menuMat = new THREE.MeshStandardMaterial({ 
    color: 0x7c7c7c,
    transparent: false,
    opacity: 0.95,
    roughness: 0.32,
    metalness: 0.1,
    normalScale: new THREE.Vector2( 1, 1 ),
    emissive: 0xeeeeee,
    emissiveIntensity: 0.1,
    normalMap: normalNone
});
var menuSphereMat = menuMat.clone()
menuSphereMat.side = THREE.BackSide;

var menu = new THREE.Mesh( menuGeo, menuMat );

var sphereGeo = new THREE.SphereGeometry( 0.038 );
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
var debugBtnMat = new THREE.MeshStandardMaterial({ 
    color: 0x990000,
    roughness: 0.32,
    metalness: 0
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
            consoleLog("LIBRARY: CLOSE");
            toggleLibrary('close');
            menuMode = 0;
            justClosedLibrary = true;
        } else if (isMenuOpen && !isMenuActive && menuMode != 99) { // The menu is open: close it now
            consoleLog("MENU: Close");
            isMenuOpen = false;
            menuGroup.visibility = false;
            menuGroup.position.y = -999;
            subMenu(0);
        }
        else if (!isMenuActive && menuMode != 99) { // The menu is closed: open it now
            consoleLog("MENU: Open");
            isMenuOpen = true;
            startPos(menuGroup);
        }

        if (libraryTimer >= libraryTimerHold && menuMode != 99 && !justClosedLibrary) { // The button has been held down: open the library
            consoleLog("LIBRARY: OPEN");
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
    normalMainBtn.userData.defaultMat = btnMat;

    sliderMainBtn = new THREE.Mesh( btnGeo, btnMat );
    menuGroup.add(sliderMainBtn);
    sliderMainBtn.position.set( menu.position.x, menu.position.y + 0.05, menu.position.z );
    sliderMainBtn.translateX( -distanceBetweenWidth/2 );
    sliderMainBtn.layers.enable( 10 );
    menu.attach(sliderMainBtn);
    sliderMainBtn.userData.function = "slider-menu";
    sliderMainBtn.translateZ( 0.02 );
    sliderMainBtn.userData.defaultMat = btnMat;

    settingsBackBtn = new THREE.Mesh( btnGeo, btnMat );
    menuGroup.add(settingsBackBtn);
    settingsBackBtn.position.set( menu.position.x, menu.position.y + 0.045, menu.position.z );
    settingsBackBtn.translateZ( -0.09 );
    settingsBackBtn.rotation.set( 0, Math.PI / 2, 1);
    settingsBackBtn.translateX( 0.05 );
    settingsBackBtn.layers.enable( 10 );
    menu.attach(settingsBackBtn);
    settingsBackBtn.userData.function = "back-menu";
    settingsBackBtn.userData.defaultMat = btnMat;

    slidersBackBtn = new THREE.Mesh( btnGeo, btnMat );
    menuGroup.add(slidersBackBtn);
    slidersBackBtn.position.set( menu.position.x, menu.position.y + 0.045, menu.position.z );
    slidersBackBtn.translateZ( 0.09 );
    slidersBackBtn.rotation.set( 0, Math.PI / 2, -1);
    slidersBackBtn.translateX( -0.05 );
    slidersBackBtn.layers.enable( 10 );
    menu.attach(slidersBackBtn);
    slidersBackBtn.userData.function = "back-menu";
    slidersBackBtn.userData.defaultMat = btnMat;


// ============================ Create grid of normal-texture buttons ============================
    // for (var i = normalOptions.length - 1; i >= 0; i--) {
    //     normalBtns[i] = new THREE.Mesh( btnGeo, btnMat );

    //     menuGroup.add(normalBtns[i]);

    //     normalBtns[i].userData.function = "normal-" + i;

    //     normalBtns[i].position.set( menu.position.x, menu.position.y - 0.03, menu.position.z );
    //     normalBtns[i].rotation.set( 1, 0, 0 );
    //     normalBtns[i].translateY( -0.035 );
    //     normalBtns[i].translateZ( -0.025 );

    //     // First or second half of the total buttons
    //     if (i <= (normalOptions.length / 2) - 1) {
    //         normalBtns[i].translateX( (distanceBetweenWidth * i) - (distanceBetweenWidth * 3) );
    //         normalBtns[i].translateZ( - distanceBetweenHeight );
    //     }
    //     else {
    //         normalBtns[i].translateX( (distanceBetweenWidth * (i - normalOptions.length / 2)) - (distanceBetweenWidth * 3) );
    //         normalBtns[i].translateZ( distanceBetweenHeight );
    //     }

    //     normalBtns[i].layers.enable( 10 );
    //     menu.attach(normalBtns[i]);
    // }

// DEBUG BUTTON
    var debugBtnGeo = new THREE.BoxGeometry( 0.08, 0.005, 0.04 );

    debugText = new Text();
    debugText.text = "debug";
    debugText.color = 0xff9999;
    debugText.fontSize = 0.02;
    debugText.anchorX = 'center';
    debugText.anchorY = 'middle';

    debugBtn = new THREE.Mesh( debugBtnGeo, debugBtnMat );
    debugBtn.userData.function = "debug-toggle";
    debugBtn.userData.defaultMat = debugBtnMat;

    scene.add(debugBtn);
    debugBtn.attach(debugText);

    debugText.position.set( debugBtn.position.x, debugBtn.position.y, debugBtn.position.z );
    debugBtn.position.set( menu.position.x, menu.position.y - 0.03, menu.position.z );
    debugBtn.rotation.set( 1, 0, 0 );
    debugBtn.translateY( -0.035 );
    debugBtn.translateZ( -0.025 );
    debugText.rotateX( Math.PI / 2 );
    debugText.translateZ( 0.003 );

    debugBtn.layers.enable( 10 );
    menu.attach(debugBtn);

    debugText.sync();



// EXPORT SCENE DATA BUTTON

    exportText = new Text();
    exportText.text = "export";
    exportText.color = 0xff9999;
    exportText.fontSize = 0.02;
    exportText.anchorX = 'center';
    exportText.anchorY = 'middle';

    exportBtn = new THREE.Mesh( debugBtnGeo, debugBtnMat );
    exportBtn.userData.function = "export";
    exportBtn.userData.defaultMat = debugBtnMat;

    scene.add(exportBtn);
    exportBtn.attach(exportText);

    exportText.position.set( exportBtn.position.x, exportBtn.position.y, exportBtn.position.z );
    exportBtn.position.set( menu.position.x, menu.position.y - 0.03, menu.position.z );
    exportBtn.rotation.set( 0, Math.PI / 2, -1.04 );
    exportBtn.translateY( -0.05 );
    exportBtn.translateX( -0.035 );
    exportBtn.rotateY( -Math.PI / 2 );
    exportText.rotateX( Math.PI / 2 );
    exportText.translateZ( 0.003 );

    exportBtn.layers.enable( 10 );
    menu.attach(exportBtn);

    exportText.sync();


// ============================ Create sliders for adjusting settings ============================
    // sliderNormalScale = new THREE.Mesh( sliderGeo, btnMat );
    // sliderNormalBg = new THREE.Mesh( sliderBgGeo, sliderBgMat );
    // menuGroup.add( sliderNormalScale );
    // menuGroup.add( sliderNormalBg );
    // sliderNormalScale.attach( sliderNormalBg );
    // sliderNormalScale.position.set( menu.position.x, menu.position.y, menu.position.z );
    // sliderNormalScale.rotation.set( 0, Math.PI / 2, -1.04);
    // sliderNormalScale.translateY( -0.05 );
    // sliderNormalScale.translateX( -0.035 );
    // sliderNormalScale.layers.enable( 10 );
    // menu.attach(sliderNormalScale);
    // sliderNormalScale.userData.function = "slider-nscale";
    // menu.attach(sliderNormalBg)
    // sliderNormalBg.rotateX( Math.PI / 2 );


    // sliderEmissive = new THREE.Mesh( sliderGeo, btnMat );
    // sliderEmissiveBg = new THREE.Mesh( sliderBgGeo, sliderBgMat );
    // menuGroup.add( sliderEmissive );
    // menuGroup.add( sliderEmissiveBg );
    // sliderEmissive.attach( sliderEmissiveBg );
    // sliderEmissive.position.set( menu.position.x, menu.position.y, menu.position.z );
    // sliderEmissive.rotation.set( 0, Math.PI / 2, -1.04);
    // sliderEmissive.translateY( -0.051 );
    // sliderEmissive.translateX( 0.035 );
    // sliderEmissive.layers.enable( 10 );
    // menu.attach(sliderEmissive);
    // sliderEmissive.userData.function = "slider-intensity";
    // menu.attach(sliderEmissiveBg)
    // sliderEmissiveBg.rotateX( Math.PI / 2 );
    // sliderEmissive.translateZ( -0.2 );

    var sliderReaderText = new Text();
    sliderReaderText.text = "Reading Distance";
    sliderReaderText.color = 0xffffff;
    sliderReaderText.fontSize = 0.01;
    sliderReaderText.anchorX = 'center';
    sliderReaderText.anchorY = 'top';

    sliderReaderDistanceMin = new THREE.Mesh( sliderGeo, btnMat );
    sliderReaderDistanceBg = new THREE.Mesh( sliderBgGeo, sliderBgMat );
    menuGroup.add( sliderReaderDistanceMin );
    menuGroup.add( sliderReaderDistanceBg );

    sliderReaderDistanceBg.attach(sliderReaderText);

    sliderReaderDistanceMin.attach( sliderReaderDistanceBg );
    sliderReaderDistanceMin.position.set( menu.position.x, menu.position.y + 0.05, menu.position.z );
    sliderReaderDistanceMin.rotation.set( 0, Math.PI / 2, 0);
    sliderReaderDistanceMin.translateY( 0.001 );
    sliderReaderDistanceMin.translateX( 0.035 );
    sliderReaderDistanceMin.layers.enable( 10 );
    menu.attach(sliderReaderDistanceMin);
    sliderReaderDistanceMin.userData.function = "slider-reader-min";
    sliderReaderDistanceMin.userData.defaultMat = btnMat;
    menu.attach(sliderReaderDistanceBg)
    sliderReaderDistanceBg.rotateX( Math.PI / 2 );
    sliderReaderDistanceMin.translateZ( -0.2 );

    sliderReaderText.rotateX( Math.PI );
    sliderReaderText.rotateZ( -Math.PI / 2 );
    sliderReaderText.translateZ( 0.001 );
    sliderReaderText.translateY( 0.035 );
    sliderReaderText.sync();

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

// const dummyButton = new THREE.Object3D();
// dummyButton.material = menuMat;
// dummyButton.userData.defaultMat = menuMat;
// dummyButton.userData.function = "slider-reader";


var lastSliderPos;
var hasTouchedSlider = false;
var libraryTimer = 0;
var libraryTimerHold = 0.4; // How long to hold the pose for the library to trigger
var currentTool2 = 'none';

function btnPress(intersect) {
    intersect.object.material = btnPressMat;
    setTimeout(() => {intersect.object.material = intersect.object.userData.defaultMat;},200);
    var funct = intersect.object.userData.function;

    // ==================== Button Function Calls ===================
    if (funct == "normals-menu" && menuMode == 0) { // Button for the normals menu
        consoleLog("MENU: Switch to sub:+");
        subMenu(1);
        isBtnPressed = true; // Consume the button press until the finger is removed
    } else if (funct == "slider-menu" && menuMode == 0) { // Button for the slider test menu
        consoleLog("MENU: Switch to sub:-");
        subMenu(2);
        isBtnPressed = true; // Consume the button press until the finger is removed
    } else if (funct == "back-menu" && menuMode != 0) { // Button for going back to the main menu
        consoleLog("MENU: Back to Menu");
        subMenu(0);
        isBtnPressed = true; // Consume the button press until the finger is removed
    } else if (funct.slice(0,7) == "normal-" && menuMode == 1) { // Button for switching normals
        consoleLog("Set Normal: " + funct.slice(7,9));
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
            var normalizedResult = norm(localHitPos.y, 0.25, -0.25);
            // Check which slider is being used and apply that function
            if (funct.slice(7,13) == "reader") {
                var newRange = normalizedResult * 10 + 0.5;
                for (var i = snapDistanceOne.length - 1; i >= 0; i--) {
                    var thisGroup = snapDistanceOne[i];
                    // Set the curve radius and position of the header
                    if (thisGroup.userData.header != undefined) {
                        var headText = thisGroup.userData.header;
                        headText.curveRadius = newRange;
                        headText.position.set( headText.position.x, headText.position.y, -newRange );
                    }
                    // Set the curve radius and position of all text block elements
                    if (thisGroup.userData.textBlock != undefined) {
                        var textBlock = thisGroup.userData.textBlock;
                        for (var j = textBlock.length - 1; j >= 0; j--) {
                            textBlock[j].curveRadius = newRange;
                            textBlock[j].position.z = -newRange;
                        }
                    }
                    // Set the position of the handle
                    if (thisGroup.userData.handle != undefined) {
                        var handle = thisGroup.userData.handle;
                        handle.position.z = -newRange;
                    }

                }

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
    } else if (funct == "debug-toggle" && menuMode == 1) { // Button for swapping between tools
        if (debugMode) {
            debugMode = false;
            debugBtnMat.color.setHex( 0x990000 );
            debugText.color = 0xff9999;
        } else {
            debugMode = true;
            debugBtnMat.color.setHex( 0x009900 );
            debugText.color = 0x99ff99;
        }
        showDebug();
        isBtnPressed = true; // Consume the button press until the finger is removed
    } else if (funct == "export" && menuMode == 2) { // Button for exporting workspace data
        saveWorkspace();
        isBtnPressed = true; // Consume the button press until the finger is removed
    }
}

 



function download(file) {
    const link = document.createElement('a')
    const url = URL.createObjectURL(file)

    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
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

















let toolSelector, toolSelectorCore, toolSelectorTip, toolSelectorTip2, toolSelectorBeam, toolSelectorDot, toolSelectorDotFX;

const toolColorMat = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthWrite: true
} );

function initTools() {

    const tipGeo = new THREE.BoxGeometry( 0.01, 0.01, 0.01 );
    const stickGeo = new THREE.BoxGeometry( 0.01, 0.01, 0.15 );
    const beamGeo = new THREE.BoxGeometry( 0.001, 0.001, 0.001 );
    const dotGeo = new THREE.SphereGeometry( 0.005, 9, 9 );
    var toolMat = new THREE.MeshStandardMaterial({ 
        color: 0x93dbf0,
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
        // color: 0x659fe6,
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        depthWrite: true
    } );
    var fxMat = new THREE.MeshBasicMaterial( {
        color: 0xffffff,
        transparent: true,
        opacity: 0.75,
        depthWrite: false
    } );

    toolSelector = new THREE.Group();
    toolSelectorCore = new THREE.Group();
    toolSelectorTip = new THREE.Mesh( tipGeo, toolColorMat );
    toolSelectorTip2 = new THREE.Mesh( tipGeo, toolColorMat );
    toolSelectorBeam = new THREE.Mesh( beamGeo, toolColorMat );
    toolSelectorDot = new THREE.Mesh( dotGeo, colorMat );
    toolSelectorDotFX = new THREE.Mesh( dotGeo, fxMat );

    toolSelectorCore.attach( toolSelectorTip );
    toolSelectorCore.attach( toolSelectorTip2 );
    toolSelectorCore.attach( toolSelectorBeam );
    toolSelectorCore.attach( toolSelectorDot );
    toolSelectorDot.attach( toolSelectorDotFX );

    toolSelectorTip.rotateY( Math.PI / 4 );
    toolSelectorTip.rotateX( Math.PI / 4 );

    toolSelectorTip2.rotateY( Math.PI / 4 );
    toolSelectorTip2.rotateX( Math.PI / 4 );

    toolSelectorCore.translateZ( -0.111 );
    toolSelectorCore.translateY( -0.113 );
    toolSelectorCore.translateX( -0.015 );

    toolSelectorCore.rotateX( -Math.PI / 2.9);

    toolSelector.attach( toolSelectorCore );
    scene.add( toolSelector );

    toolSelector.renderOrder = 99;
    toolSelectorTip.renderOrder = 99;
    toolSelectorTip2.renderOrder = 99;
    toolSelectorDot.renderOrder = 99;
    // toolSelectorDotFX.renderOrder = 98;

    toolSelectorBeam.visible = false;
    toolSelectorTip.visible = false;
    toolSelectorTip2.visible = false;

    for (var i = toolSelectorSmoothSteps - 1; i >= 0; i--) {
        // var rotVector = [wrist2.rotation.x, wrist2.rotation.y, wrist2.rotation.z];
        var rotQuat = [wrist2.quaternion.x, wrist2.quaternion.y, wrist2.quaternion.z, wrist2.quaternion.w];
        toolSelectorPrevRotations.push(rotQuat);

        var posVector = [wrist2.position.x, wrist2.position.y, wrist2.position.z];
        toolSelectorPrevPositions.push(posVector);
    }

}

var toolSelectorSmoothSteps = 25;
var toolSelectorPrevRotations = [];
var toolSelectorPrevPositions = [];

function setToolPositions() {

    var runningRotQuaternion = [0.0,0.0,0.0,0.0];
    var runningPosVector = [0.0,0.0,0.0];

    for (var i = toolSelectorSmoothSteps - 1; i >= 0; i--) {
        var rotQuaternion = toolSelectorPrevRotations[i];
        runningRotQuaternion[0] += rotQuaternion[0];
        runningRotQuaternion[1] += rotQuaternion[1];
        runningRotQuaternion[2] += rotQuaternion[2];
        runningRotQuaternion[3] += rotQuaternion[3];

        var posVector = toolSelectorPrevPositions[i];
        runningPosVector[0] += posVector[0];
        runningPosVector[1] += posVector[1];
        runningPosVector[2] += posVector[2];
    }

    // add the current wrist position & rotation to the end of the arrays
    toolSelectorPrevRotations.push([wrist2.quaternion.x, wrist2.quaternion.y, wrist2.quaternion.z, wrist2.quaternion.w]);
    toolSelectorPrevPositions.push([wrist2.position.x, wrist2.position.y, wrist2.position.z]);
    // remove the first elements of the arrays
    toolSelectorPrevRotations.shift();
    toolSelectorPrevPositions.shift();

    // Move the tool to 'chase' the destination average (reduce jitter)
    toolSelector.position.set( runningPosVector[0] / toolSelectorSmoothSteps, runningPosVector[1] / toolSelectorSmoothSteps, runningPosVector[2] / toolSelectorSmoothSteps );
    toolSelector.quaternion.set( runningRotQuaternion[0] / toolSelectorSmoothSteps, runningRotQuaternion[1] / toolSelectorSmoothSteps, runningRotQuaternion[2] / toolSelectorSmoothSteps, runningRotQuaternion[3] / toolSelectorSmoothSteps );



}

function animateTools() {

    if (toolSelectorActive) { setToolPositions() };
    
    toolSelectorTip.rotation.y -= 0.01;
    toolSelectorTip.rotation.x -= 0.01;
    toolSelectorTip2.rotation.y += 0.01;
    toolSelectorTip2.rotation.x += 0.01;
}


var tempSelectorQuat = new THREE.Quaternion();
var tempSelectorWorld = new THREE.Vector3();
var tempSelectorDotTween, tempSelectorIntroTween, tempSelectorIntroTween2, tempSelectorOutroTween2;
var tempSelectorActive = false;
var tempSelectorStart, tempSelectorEnd, tempSelectorDotIntroTween, tempSelectorOutroTween, tempSelectorDotOutroTween;
var tempSelectorTweenedIn = true;
var tempSelectorTweenedOut = false;

var highlightMat = new THREE.MeshBasicMaterial( {
    color: 0x000077,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    blending: THREE.SubtractiveBlending
} );

var textsToReset = [];
var linesToHide = [];
var toolSelectorActive = false;


var toolSelectorVisible = false; // Change this to show/hide the selector beam and tool
var toolSelectorTimer = 0; // Current amout of time not pointing at anything
var toolSelectorTimeout = 3; // How long until the line fades in
var toolSelectorFading = false;

function tryPointer() {
    animateTools();
    let fingersMaxDist = 0.09;
    let fingersMinDist = 0.07;
    let fingersCurDist = thumbTip2.position.distanceTo(indexFingerTip2.position);
    let fingersNormalized = 1 - norm(fingersCurDist, fingersMinDist, fingersMaxDist);
    let fingersClamped = clamp(fingersNormalized, 0, 1);

    if ( pinkyFingerTip2.position.distanceTo(wrist2.position) < 0.13 
    && ringFingerTip2.position.distanceTo(wrist2.position) < 0.13
    && middleFingerTip2.position.distanceTo(wrist2.position) < 0.13
    ) {

        toolSelectorActive = true;
        toolSelectorTimer += deltaTime;
        // consoleLog(toolSelectorTimer);

        // Animate in the selector core
        if (!tempSelectorTweenedIn && tempSelectorTweenedOut) {
            consoleLog("...fading in!");
            tempSelectorTweenedOut = false;

            toolSelectorTip.visible = toolSelectorVisible;
            toolSelectorTip2.visible = toolSelectorVisible;
            toolSelectorBeam.visible = toolSelectorVisible;

            toolSelectorBeam.scale.z = 500;
            toolSelectorBeam.position.z = -0.25;

            tempSelectorIntroTween = new TWEEN.Tween( toolSelectorTip.scale )
                    .to( {x: 1, y: 1, z: 1}, 300 )
                    .easing( TWEEN.Easing.Quadratic.Out )
                    .start()
                    .onComplete(() => {
                        tempSelectorTweenedIn = true;
                    });

            tempSelectorIntroTween2 = new TWEEN.Tween( toolSelectorTip2.scale )
                    .to( {x: 1, y: 1, z: 1}, 300 )
                    .easing( TWEEN.Easing.Quadratic.Out )
                    .start()
                    .onComplete(() => {
                        tempSelectorTweenedIn = true;
                    });

            tempSelectorDotIntroTween = new TWEEN.Tween( toolSelectorDot.scale )
                    .to( {x: 1, y: 1, z: 1}, 300 )
                    .easing( TWEEN.Easing.Quadratic.Out )
                    .start()
                    ;
        }

        // Fade the line if the user hasn't been pointing at anything for awhile
        if (toolSelectorTimer >= toolSelectorTimeout && !toolSelectorFading && toolColorMat.opacity < 1) {
            consoleLog("POINTER: Fade in");
            toolSelectorVisible = true;

            toolSelectorTip.scale.set( 0, 0, 0 );
            toolSelectorTip2.scale.set( 0, 0, 0 );
            tempSelectorTweenedOut = true;
            tempSelectorTweenedIn = false;

            toolSelectorFading = true;

            const toolSelectorFadeInTween = new TWEEN.Tween( toolColorMat )
            .to( { opacity: 1 }, 1000 )
            .easing( TWEEN.Easing.Linear.None )
            .start()
            .onComplete(() => {
                toolSelectorFading = false;
            });
        } else if (toolSelectorTimer < toolSelectorTimeout && !toolSelectorFading && toolColorMat.opacity > 0) {
            consoleLog("POINTER: Fade out");
            toolSelectorFading = true;
            const toolSelectorFadeOutTween = new TWEEN.Tween( toolColorMat )
            .to( { opacity: 0 }, 300 )
            .easing( TWEEN.Easing.Linear.None )
            .start()
            .onComplete(() => {
                toolSelectorBeam.visible = false;
                toolSelectorFading = false;
                toolSelectorVisible = false;
            });
        }






        toolSelectorTip.getWorldPosition(tempSelectorWorld);

        // If there are any bolded texts, clear them
        if (textsToReset.length > 0) {
            for (var i = textsToReset.length - 1; i >= 0; i--) {
                var thisText = textsToReset[i];
                thisText.fontSize = thisText.userData.fontSize;
                thisText.fontWeight = "normal";
                textsToReset.splice(i, 1);
            }
        }

        // If there are any visible lines, hide them
        if (linesToHide.length > 0) {
            for (var i = linesToHide.length - 1; i >= 0; i--) {
                var thisLine = linesToHide[i];
                if (thisLine.userData.persistent == undefined) {
                    thisLine.visible = false;
                }
                linesToHide.splice(i, 1);
            }
        }

        if (fingersNormalized >= 1) {
            var raycaster = new THREE.Raycaster();
            raycaster.layers.set( 3 );
            toolSelectorCore.getWorldQuaternion(tempSelectorQuat);
            var rayForward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(tempSelectorQuat);
            raycaster.set(tempSelectorWorld, rayForward);
            var intersects = raycaster.intersectObjects(scene.children);
            var intersect = intersects[0];

            placeholderArrow(raycaster, 0.2, 0x65e6ae);

            if (intersect) {

                toolSelectorDot.visible = true;
                toolSelectorTimer = 0;

                let beamScale = tempSelectorWorld.distanceTo(intersect.point) * 1000;
                // toolSelectorBeam.visible = toolSelectorVisible;
                toolSelectorBeam.scale.z = beamScale;
                toolSelectorBeam.position.z = -(beamScale/2000);

                toolSelectorDot.position.z = -(beamScale/1000);

                let distScale = (beamScale / 2000) + 1;
                toolSelectorDot.scale.set( distScale, distScale, distScale );

                intersect.object.fontSize = intersect.object.userData.fontSize * 1.1;
                intersect.object.fontWeight = "bold";

                textsToReset.push(intersect.object);

                // Show connection lines, if applicable
                if (intersect.object.userData.lines != undefined) {
                    const lines = intersect.object.userData.lines;
                    // console.log(lines);
                    for (var i = lines.length - 1; i >= 0; i--) {
                        lines[i].visible = true;
                        linesToHide.push(lines[i]);
                    }
                }

            }

            // Selection function - user has clamped their fingers together while pointing
            if (intersect && fingersCurDist <= 0.008 && !tempSelectorActive) {
                tempSelectorActive = true;

                // Tween the selector dot
                tempSelectorDotTween = new TWEEN.Tween( toolSelectorDotFX.scale )
                    .to( {x: 3, y: 3, z: 3}, 150 )
                    .easing( TWEEN.Easing.Quadratic.Out )
                    .start()
                    .onUpdate(function() {
                        toolSelectorDotFX.material.opacity = 3 - toolSelectorDotFX.scale.x;
                    })
                    .onComplete(() => {
                        toolSelectorDotFX.scale.set( 1, 1, 1 );
                        toolSelectorDotFX.material.opacity = 1;
                    });

                if (intersect.object.userData.type == "citation") {
                    popupMenu(intersect.object);
                } else if (intersect.object.userData.type == "popup-find") {
                    var target = intersect.object.userData.target;
                    var tempTextResult = target.text.slice(1).split(']')[0];
                    var tempSource = target.userData.source;
                    findCitation(tempSource, tempTextResult, target);
                    popupMenu(undefined);
                    consoleLog("POPUP: Find " + tempTextResult, 0x555555);
                } else if (intersect.object.userData.type == "popup-close") {
                    popupMenu(undefined);
                    consoleLog("POPUP: Close", 0x555555);
                } else if (intersect.object.userData.type == "popup-detach" || intersect.object.userData.type == "popup-clone") {
                    var thisfunction = intersect.object.userData.type.slice(6,99);

                    var target = intersect.object.userData.target;

                    var oldGroup = target.parent;

                    const newPlaceholder = new THREE.Mesh( testGeo, testMat );
                    oldGroup.attach( newPlaceholder );
                    newPlaceholder.userData.sequenceOrder = target.userData.sequenceOrder;
                    oldGroup.userData.textBlock.push( newPlaceholder );
                    newPlaceholder.position.set( 
                        target.position.x,
                        target.position.y,
                        target.position.z
                    );
                    newPlaceholder.rotation.set( 
                        target.rotation.x,
                        target.rotation.y,
                        target.rotation.z
                    );
                    target.userData.origin = newPlaceholder;

                    var newGroup = new THREE.Group();
                    newGroup.position.set( 
                        oldGroup.position.x,
                        oldGroup.position.y,
                        oldGroup.position.z
                    );
                    newGroup.rotation.set( 
                        oldGroup.rotation.x,
                        oldGroup.rotation.y,
                        oldGroup.rotation.z
                    );
                    workspace.add(newGroup);

                    if (thisfunction == "clone") {
                        var newText = new Text();
                        newText.text = target.text;
                        newText.fontSize = target.fontSize;
                        newText.curveRadius = target.curveRadius;
                        newText.color = target.color;
                        newText.outlineWidth = target.outlineWidth;
                        newText.outlineColor = target.outlineColor;
                        workspace.add(newText);
                        oldGroup.attach(newText);
                        newText.position.set( target.position.x, target.position.y, target.position.z );
                        newText.rotation.set( target.rotation.x, target.rotation.y, target.rotation.z );
                        newText.sync();
                        newText.layers.enable( 3 );
                        newText.userData.layers = 3;
                        
                        for (i in target.userData) {
                            newText.userData[i] = target.userData[i];
                            consoleLog("Cloned data: " + i, 0x65e6ae);
                        }

                        newText.userData.isClone = true;
                        newText.userData.cloneSource = target;
                        target = newText;
                    }

                    newGroup.attach(target);
                    var tempNewGroupTween = new TWEEN.Tween( newGroup.rotation )
                        .to( {x: oldGroup.rotation.x, y: oldGroup.rotation.y + 0.1, z: oldGroup.rotation.z }, 500 )
                        .easing( TWEEN.Easing.Quadratic.InOut )
                        .start()
                    target.userData.detachedParent = oldGroup;
                    createHandle(target);

                    if (thisfunction == "detach") {
                        const index = oldGroup.userData.textBlock.indexOf(target);
                        oldGroup.userData.textBlock.splice(index,1);
                    }

                    var newArray = [];
                    newArray.push(target);
                    newGroup.userData.textBlock = newArray;
                    snapDistanceOne.push(newGroup);
                    popupMenu(undefined);

                    if (thisfunction == "detach") {
                        const missingPiece = target.userData.sequenceOrder;
                        for (var i = oldGroup.userData.textBlock.length - 1; i >= 0; i--) {
                            if (oldGroup.userData.textBlock[i].userData.sequenceOrder > missingPiece) {
                                var thisPiece = oldGroup.userData.textBlock[i];
                                // console.log(thisPiece);
                                var tempNewTween = new TWEEN.Tween( thisPiece.position )
                                .to( {x: thisPiece.position.x, y: thisPiece.position.y + 0.03, z: thisPiece.position.z }, 500 )
                                .easing( TWEEN.Easing.Quadratic.InOut )
                                .start()
                            }
                        }
                        consoleLog("POPUP: Detach from location |" + (missingPiece + 1) + "|", 0x555555);
                    } else if (thisfunction == "clone"){
                        consoleLog("POPUP: Cloned", 0x555555);
                    }
                } else if (intersect.object.userData.type == "popup-attach" || intersect.object.userData.type == "popup-return") {
                    var thisfunction = intersect.object.userData.type.slice(6,99);

                    var target = intersect.object.userData.target;
                    var oldGroup = target.userData.detachedParent;
                    var newGroup = target.parent;
                    var destination = [
                        target.userData.origin.position.x,
                        target.userData.origin.position.y,
                        target.userData.origin.position.z,
                        target.userData.origin.rotation.x,
                        target.userData.origin.rotation.y,
                        target.userData.origin.rotation.z
                    ];
                    oldGroup.attach(target);
                    target.userData.detachedParent = undefined;
                    // Tween to the original position and rotation
                    var tempReturnPosTween = new TWEEN.Tween( target.position )
                    .to( {x: destination[0], y: destination[1], z: -target.curveRadius}, 500 )
                    .easing( TWEEN.Easing.Quadratic.InOut )
                    .start()
                    var tempReturnRotTween = new TWEEN.Tween( target.rotation )
                    .to( {x: destination[3], y: destination[4], z: destination[5]}, 500 )
                    .easing( TWEEN.Easing.Quadratic.InOut )
                    .start()
                    .onComplete(() => {
                        if (target.userData.isClone != undefined) {
                            if (target.userData.lines != undefined) {
                                let lines = target.userData.lines;
                                for (var i = lines.length - 1; i >= 0; i--) {
                                    lines[i].userData.startObj = target.userData.cloneSource.uuid;
                                }
                            }
                            target.parent.remove(target);
                        }
                    });
                    oldGroup.userData.textBlock.push(target);
                    const index = snapDistanceOne.indexOf(newGroup);
                    snapDistanceOne.splice(index,1);
                    newGroup.parent.remove(newGroup);
                    popupMenu(undefined);

                    if (thisfunction == "attach") {
                        const missingPiece = target.userData.sequenceOrder;
                        for (var i = oldGroup.userData.textBlock.length - 1; i >= 0; i--) {
                            if (oldGroup.userData.textBlock[i].userData.sequenceOrder > missingPiece) {
                                var thisPiece = oldGroup.userData.textBlock[i];
                                var tempNewTween = new TWEEN.Tween( thisPiece.position )
                                .to( {x: thisPiece.position.x, y: thisPiece.position.y - 0.03, z: thisPiece.position.z }, 500 )
                                .easing( TWEEN.Easing.Quadratic.InOut )
                                .start()
                                .onComplete(() => {
                                    oldGroup.remove(target.userData.origin);
                                    target.userData.origin = null;
                                });
                            }
                        }
                        consoleLog("POPUP: Attach to location |" + (missingPiece + 1) + "|", 0x555555);
                    } else if (thisfunction == "return") {
                        consoleLog("POPUP: Returned", 0x555555);
                    }
                } else if (intersect.object.userData.type == "handle") {
                    startSwipe(intersect.object);
                    popupMenu(undefined);
                } else if (intersect.object.userData.type == "reference") {
                    popupMenu(intersect.object, "reference");
                } else if (intersect.object.userData.type == "popup-remove") {
                    var target = intersect.object.userData.target;

                    if (target.userData.lines != undefined) {
                        const lines = target.userData.lines;
                        for (var i = lines.length - 1; i >= 0; i--) {
                            var line = lines[i];
                            var index = animatedConnections.indexOf(line);
                            animatedConnections.splice(index,1);
                            scene.remove(line);
                        }
                    }
                    
                    scene.remove(target.parent);
                    popupMenu(undefined);
                    consoleLog("POPUP: Remove", 0x555555);
                } else if (intersect.object.userData.type == "popup-connections-show") {
                    var target = intersect.object.userData.target;
                    target.userData.persistentLines = true;
                    // linesToHide = [];

                    if (target.userData.lines != undefined) {
                        let lines = target.userData.lines;
                        for (var i = lines.length - 1; i >= 0; i--) {
                            lines[i].visible = true;
                            lines[i].userData.persistent = true;
                        }
                    }

                    popupMenu(undefined);
                    consoleLog("POPUP: Show Connections", 0x555555);
                } else if (intersect.object.userData.type == "popup-connections-hide") {
                    var target = intersect.object.userData.target;
                    target.userData.persistentLines = undefined;
                    if (target.userData.lines != undefined) {
                        const lines = target.userData.lines;
                        for (var i = lines.length - 1; i >= 0; i--) {
                            linesToHide.push(lines[i]);
                            lines[i].userData.persistent = undefined;
                        }
                    }
                    popupMenu(undefined);
                    consoleLog("POPUP: Hide Connections", 0x555555);
                } else if (intersect.object.userData.type == "popup-mark") {
                    var target = intersect.object.userData.target;
                    popupMenu(target, "markup");
                } else if (intersect.object.userData.type == "popup-color") {
                    var target = intersect.object.userData.target;
                    var color = intersect.object.userData.color;
                    target.outlineWidth = 0.01;
                    // target.outlineOpacity = 0.7;
                    target.outlineColor = color;
                    // target.color = color;
                    popupMenu(undefined);
                } else if (intersect.object.userData.type == "popup-unmark") {
                    var target = intersect.object.userData.target;
                    target.userData.hasMarkup = undefined;
                    target.outlineWidth = 0;
                    popupMenu(undefined);
                }










            } else if (fingersCurDist > 0.02 && tempSelectorActive) {
                tempSelectorActive = false;
                stopSwipe();
            }

        } else {
            // toolSelectorBeam.scale.z = 0;
            // toolSelectorBeam.visible = false;
            // toolSelectorBeam.position.z = 0;
            toolSelectorDot.position.z = 0;
            toolSelectorDot.visible = false;
            stopSwipe();
        }

    } else {

        toolSelectorActive = false;
        stopSwipe();

        // Animate out the selector core
        if (tempSelectorTweenedIn && !tempSelectorTweenedOut) {
            tempSelectorTweenedIn = false;
            toolSelectorBeam.visible = false;
            
            tempSelectorOutroTween = new TWEEN.Tween( toolSelectorTip.scale )
                    .to( {x: 0, y: 0, z: 0}, 300 )
                    .easing( TWEEN.Easing.Quadratic.In )
                    .start()
                    .onComplete(() => {
                        tempSelectorTweenedOut = true;
                        toolSelectorTip.visible = false;
                    });

            tempSelectorOutroTween2 = new TWEEN.Tween( toolSelectorTip2.scale )
                    .to( {x: 0, y: 0, z: 0}, 300 )
                    .easing( TWEEN.Easing.Quadratic.In )
                    .start()
                    .onComplete(() => {
                        tempSelectorTweenedOut = true;
                        toolSelectorTip2.visible = false;
                    });

            tempSelectorDotOutroTween = new TWEEN.Tween( toolSelectorDot.scale )
                    .to( {x: 0, y: 0, z: 0}, 300 )
                    .easing( TWEEN.Easing.Quadratic.In )
                    .start()
                    .onComplete(() => {
                        toolSelectorDot.visible = false;
                    });

        }

    }

}






var newPopup;

var popupMat = new THREE.MeshStandardMaterial({ 
    color: 0x7c7c7c,
    transparent: false,
    roughness: 0.92,
    metalness: 0,
    normalScale: new THREE.Vector2( 1, 1 ),
    normalMap: normalNone
});

var centerSource = new THREE.Vector3();

function popupMenu(target, variation = "citation") {

    var popupItems = [];

    if (newPopup != undefined) { newPopup.parent.remove(newPopup); newPopup = undefined; };
    
    if (target != undefined) {

        // popup background panel
        const popupGeo = new THREE.PlaneGeometry(0.25, 0.4);
        newPopup = new THREE.Mesh( popupGeo, popupMat );

        // popup header text
        const popupHead = new Text();
        scene.add(popupHead);
        popupHead.fontSize = 0.015;
        popupHead.color = 0xffffff;
        popupHead.anchorX = 'center';
        if (target.text.length >= 30) {
            popupHead.text = target.text.slice(0,28) + '...';
        } else {
            popupHead.text = target.text;
        }
        newPopup.attach(popupHead);
        popupHead.position.y = 0.185;
        popupItems.push(popupHead);

        if (variation == "citation") {  //======================================================
    // DETACH / REATTACH popup button
            const popupDetach = new Text();
            scene.add(popupDetach);
            if (target.userData.detachedParent != undefined && !target.userData.isClone) {
            // ATTACH
                popupDetach.text = "Reattach to Group";
                popupDetach.userData.type = "popup-attach";
            } else if (target.userData.detachedParent == undefined) {
            // DETACH
                popupDetach.text = "Detach from Group";
                popupDetach.userData.type = "popup-detach";
            }
            popupDetach.fontSize = 0.02;
            popupDetach.userData.fontSize = 0.02;
            popupDetach.color = 0xffffff;
            popupDetach.anchorX = 'left';
            popupDetach.anchorY = 'middle';
            newPopup.attach(popupDetach);
            popupDetach.position.x = -0.11;
            popupDetach.position.y = 0.1;
            popupDetach.layers.enable( 3 );
            popupDetach.userData.target = target;
            popupItems.push(popupDetach);

    // CLONE / RETURN popup button
            const popupClone = new Text();
            scene.add(popupClone);
            if (target.userData.detachedParent != undefined && target.userData.isClone) {
            // RETURN
                popupClone.text = "Return to Group";
                popupClone.userData.type = "popup-return";
            } else if (target.userData.detachedParent == undefined) {
            // CLONE
                popupClone.text = "Clone from Group";
                popupClone.userData.type = "popup-clone";
            }
            popupClone.fontSize = 0.02;
            popupClone.userData.fontSize = 0.02;
            popupClone.color = 0xffffff;
            popupClone.anchorX = 'left';
            popupClone.anchorY = 'middle';
            newPopup.attach(popupClone);
            popupClone.position.x = -0.11;
            popupClone.position.y = 0.05;
            popupClone.layers.enable( 3 );
            popupClone.userData.target = target;
            popupItems.push(popupClone);

    // FIND IN DOCUMENT popup button
            const popupFind = new Text();
            scene.add(popupFind);
            popupFind.text = "Find in Document";
            popupFind.fontSize = 0.02;
            popupFind.userData.fontSize = 0.02;
            popupFind.color = 0xffffff;
            popupFind.anchorX = 'left';
            popupFind.anchorY = 'middle';
            newPopup.attach(popupFind);
            popupFind.position.x = -0.11;
            popupFind.position.y = 0.0;
            popupFind.layers.enable( 3 );
            popupFind.userData.type = "popup-find";
            popupFind.userData.target = target;
            popupItems.push(popupFind);

    // MARK THIS TEXT popup button
            const popupMark = new Text();
            scene.add(popupMark);
            if (target.userData.hasMarkup != undefined) {
            // REMOVE COLOR
            popupMark.text = "Unmark this Text";
            popupMark.userData.type = "popup-unmark";
            } else {
            // ADD COLOR
            popupMark.text = "Mark this Text";
            popupMark.userData.type = "popup-mark";
            }
            popupMark.fontSize = 0.02;
            popupMark.userData.fontSize = 0.02;
            popupMark.color = 0xffffff;
            popupMark.anchorX = 'left';
            popupMark.anchorY = 'middle';
            newPopup.attach(popupMark);
            popupMark.position.x = -0.11;
            popupMark.position.y = -0.05;
            popupMark.layers.enable( 3 );
            popupMark.userData.target = target;
            popupItems.push(popupMark);

        } else if (variation == "reference") { //======================================================
    // REMOVE popup button
            const popupRemove = new Text();
            scene.add(popupRemove);
            popupRemove.text = "Remove";
            popupRemove.userData.type = "popup-remove";
            popupRemove.fontSize = 0.02;
            popupRemove.userData.fontSize = 0.02;
            popupRemove.color = 0xffffff;
            popupRemove.anchorX = 'left';
            popupRemove.anchorY = 'middle';
            newPopup.attach(popupRemove);
            popupRemove.position.x = -0.11;
            popupRemove.position.y = 0.1;
            popupRemove.layers.enable( 3 );
            popupRemove.userData.target = target;
            popupItems.push(popupRemove);

    // SHOW / HIDE CONNECTIONS popup button
            const popupConnections = new Text();
            scene.add(popupConnections);
            if (target.userData.persistentLines != undefined) {
            // HIDE
                popupConnections.text = "Hide Connections";
                popupConnections.userData.type = "popup-connections-hide";
            } else {
            // SHOW
                popupConnections.text = "Show Connections";
                popupConnections.userData.type = "popup-connections-show";
            }
            popupConnections.fontSize = 0.02;
            popupConnections.userData.fontSize = 0.02;
            popupConnections.color = 0xffffff;
            popupConnections.anchorX = 'left';
            popupConnections.anchorY = 'middle';
            newPopup.attach(popupConnections);
            popupConnections.position.x = -0.11;
            popupConnections.position.y = 0.0;
            popupConnections.layers.enable( 3 );
            popupConnections.userData.target = target;
            popupItems.push(popupConnections);

        } else if (variation == "markup") { //======================================================
            const popupColors = [0xE6DE54, 0x4FE362, 0x55BBE6, 0xE08DE5, 0xE6556F];

    // COLOR / REMOVE HIGHLIGHTS popup buttons
            for (var i = popupColors.length - 1; i >= 0; i--) {
                var popupColor = new Text();
                scene.add(popupColor);
                popupColor.text = "Highlight Text";
                popupColor.fontSize = 0.02;
                popupColor.userData.fontSize = 0.02;
                popupColor.anchorX = 'left';
                popupColor.anchorY = 'middle';
                newPopup.attach(popupColor);
                popupColor.position.x = -0.11;
                popupColor.layers.enable( 3 );
                popupColor.userData.target = target;
                popupColor.userData.color = popupColors[i];
                target.userData.hasMarkup = true;
                popupColor.userData.type = "popup-color";
                popupColor.color = popupColors[i];
                popupColor.position.y = 0.1 - (0.05 * i);

                popupItems.push(popupColor);
            }
            
            

            


        }

// CLOSE popup button
        const popupClose = new Text();
        scene.add(popupClose);
        popupClose.text = "Close";
        popupClose.fontSize = 0.02;
        popupClose.userData.fontSize = 0.02;
        popupClose.color = 0xffffff;
        popupClose.anchorX = 'left';
        popupClose.anchorY = 'middle';
        newPopup.attach(popupClose);
        popupClose.position.x = -0.11;
        popupClose.position.y = -0.173;
        popupClose.layers.enable( 3 );
        popupClose.userData.type = "popup-close";
        popupItems.push(popupClose);

        // display and position popup
        var tempWorldPos = new THREE.Vector3();
        toolSelectorDot.getWorldPosition(tempWorldPos);
        newPopup.position.set( tempWorldPos.x, tempWorldPos.y, tempWorldPos.z );

        centerSource.set( camera.position.x, tempWorldPos.y, camera.position.z );

        var newRot = new THREE.Quaternion().setFromRotationMatrix(
            new THREE.Matrix4().lookAt( centerSource, newPopup.position, _yforward ) 
        );

        newPopup.quaternion.copy( newRot );

        // newPopup.rotation.set( target.parent.rotation.x, target.parent.rotation.y, target.parent.rotation.z );

        for (var i = popupItems.length - 1; i >= 0; i--) {
            popupItems[i].translateZ(0.001);
            popupItems[i].sync();
        }

        newPopup.translateZ(0.1);
        
        scene.add(newPopup);
        newPopup.layers.enable( 3 );

        popupHead.sync();

        newPopup.scale.set( 0, 0, 0 );

        var tempScale = camera.position.distanceTo(newPopup.position);

        // tween the popup
        new TWEEN.Tween( newPopup.scale )
                .to( {x: tempScale, y: tempScale, z: tempScale}, 300 )
                .easing( TWEEN.Easing.Quadratic.Out )
                .start()
        ;
    }
}


















const snapDistanceOne = [];

function loadTextBlock(url) {

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'html',
        success: function(data) {

            // set up the variables
            var displayHead, displayText;
            var $html = $(data);

            // get the title
            var results = $html.find('.title');
            results.each(function() {
                displayHead = $(this).html();
            });

            // get the citations
            var displayText = [];
            var citationMain = $html.find('.bibUl').first();
            var allCitations = citationMain.find('li');
            var citationNumb = 0;
            allCitations.each(function() {
                citationNumb++;
                var listItem = $(this).text();
                var number = "[" + citationNumb + "]";
                var newListItem = number.concat(' ', listItem);
                displayText.push(newListItem);
            })

            // pass the data to be built
            displayTextBlock( displayHead, displayText, url )
        },
        error: function(xhr, status, error) {
            console.error('Error fetching HTML: ', error);
        }
    });
}

function findCitation(url, num, object) {
    // console.log(url + " " + num);
    var object = object;

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'html',
        success: function(data) {
            var $html = $(data);

            // Find all classes 'bib' and read their inner html
            var bibElements = $html.find('.bib');
            bibElements.each(function() {
                var innerHTML = $(this).html();
                if (innerHTML == num) {
                    var result = $(this).parent().text();
                    displayCitation(result, object);
                }
            });
        },
        error: function(xhr, status, error) {
            console.error('Error fetching HTML: ', error);
        }
    });
}


var animatedConnections = [];
var lineArray = [];

function displayCitation(text, object) {
    var temporaryCitation;
    var temporaryCitationGroup;
    var temporaryCitationLine;
    consoleLog(text.slice(0,48) + "...", 0xdddddd);

    if (temporaryCitation != undefined) {
        temporaryCitation.parent.remove(temporaryCitation);
        temporaryCitation = undefined;
        temporaryCitationLine.parent.remove(temporaryCitationLine);
        temporaryCitationLine = undefined;
    }

    var distanceModifier = object.curveRadius;
    // console.log(distanceModifier);

    temporaryCitationGroup = new THREE.Group();
    temporaryCitation = new Text();
    temporaryCitation.text = text;
    // temporaryCitation.userData.text = text;
    temporaryCitation.fontSize = 0.015;
    temporaryCitation.color = 0x000000;
    temporaryCitation.anchorX = 'left';
    temporaryCitation.anchorY = 'top';
    temporaryCitation.maxWidth = 1;
    temporaryCitation.curveRadius = distanceModifier;

    temporaryCitation.userData.text = temporaryCitation.text;
    temporaryCitation.userData.fontSize = temporaryCitation.fontSize;
    temporaryCitation.userData.color = temporaryCitation.color;
    temporaryCitation.userData.anchorX = temporaryCitation.anchorX;
    temporaryCitation.userData.anchorY = temporaryCitation.anchorY;
    temporaryCitation.userData.curveRadius = temporaryCitation.curveRadius;
    temporaryCitation.userData.maxWidth = temporaryCitation.maxWidth;

    temporaryCitationGroup.add(temporaryCitation);
    workspace.add(temporaryCitationGroup);

// Either or for these, grouped to move with the parent, otherwise enable layers 3
    // object.parent.attach(temporaryCitationGroup);
    temporaryCitation.layers.enable( 3 );
    temporaryCitation.userData.layers = 3;

    temporaryCitationGroup.position.set( object.parent.position.x, object.parent.position.y, object.parent.position.z );
    temporaryCitation.position.set( object.position.x, object.position.y, object.position.z );

    temporaryCitationGroup.rotation.set( object.parent.rotation.x, object.parent.rotation.y + (1.1 / distanceModifier), object.parent.rotation.z );

    temporaryCitation.sync();

    snapDistanceOne.push(temporaryCitationGroup);
    var newArray = [];
    newArray.push(temporaryCitation);
    temporaryCitationGroup.userData.textBlock = newArray;
    temporaryCitation.userData.type = "reference";

    temporaryCitation.addEventListener("synccomplete", function passHandle() {
        createHandle(temporaryCitation);
        this.removeEventListener("synccomplete", passHandle);
    });
    

    // Citation line
    const lineGeo = new THREE.BoxGeometry( 0.001, 0.001, 1 );
    const lineMat = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    temporaryCitationLine = new THREE.Mesh( lineGeo, lineMat );

    workspace.add(temporaryCitationLine);
    lineArray.push(temporaryCitationLine);
    workspace.userData.lineArray = lineArray;

    temporaryCitationLine.userData.startObj = object.uuid;
    temporaryCitationLine.userData.endObj = temporaryCitation.uuid;

    if (object.userData.lines != undefined) {
        object.userData.lines.push( temporaryCitationLine );
    } else {
        var newArray = [];
        newArray.push( temporaryCitationLine );
        object.userData.lines = newArray;
    }

    if (temporaryCitation.userData.lines != undefined) {
        temporaryCitation.userData.lines.push( temporaryCitationLine );
    } else {
        var newArray = [];
        newArray.push( temporaryCitationLine );
        temporaryCitation.userData.lines = newArray;
    }

    temporaryCitationLine.visible = false;

    animatedConnections.push(temporaryCitationLine);

}

var temporaryCitationWorldPos = new THREE.Vector3();
var temporaryCitationBlockWorldPos = new THREE.Vector3();

function animateCitationLines() {
    
    if (animatedConnections.length > 0) {
        for (var i = animatedConnections.length - 1; i >= 0; i--) {

            var thisLine = animatedConnections[i];

            if (thisLine.userData.startObjRef == undefined) {
                var newstart = workspace.getObjectByProperty('uuid', thisLine.userData.startObj);
                if (newstart != undefined) {
                    thisLine.userData.startObjRef = newstart;
                }
                // consoleLog("start object found from uuid: " + thisLine.userData.startObjRef);
            }
            if (thisLine.userData.endObjRef == undefined) {
                var newend = workspace.getObjectByProperty('uuid', thisLine.userData.endObj);
                if (newend != undefined) {
                    thisLine.userData.endObjRef = newend;
                }
                // consoleLog("end object found from uuid: " + thisLine.userData.endObjRef);
            }

            if (thisLine.userData.startObjRef != undefined && thisLine.userData.endObjRef != undefined) {

                var startObj = thisLine.userData.startObjRef;
                var endObj = thisLine.userData.endObjRef;

                endObj.getWorldPosition(temporaryCitationWorldPos);
                startObj.getWorldPosition(temporaryCitationBlockWorldPos);

                thisLine.position.set(
                    temporaryCitationBlockWorldPos.x,
                    temporaryCitationBlockWorldPos.y,
                    temporaryCitationBlockWorldPos.z 
                );

                var lineLength = thisLine.position.distanceTo(temporaryCitationWorldPos);

                thisLine.scale.z = lineLength;

                var newRot = new THREE.Quaternion().setFromRotationMatrix(
                    new THREE.Matrix4().lookAt( thisLine.position, temporaryCitationWorldPos, _ybackward ) 
                );

                thisLine.quaternion.copy( newRot );

                thisLine.translateZ(-lineLength/2);

            }

        }

    }

}

// loadTextBlock('./3511095.3531271.html');

var tempSize = new THREE.Vector3();

function displayTextBlock(head, text, source) {
    // Create:
    const textBlock = [];
    const headText = new Text();
    const textGroup = new THREE.Group();

    textGroup.add(headText)
    workspace.add(textGroup);

    let textOffset = -0.03;
    let totalTextOffset = textOffset;

    let totalPreInstance = 0;
    let totalPostInstance = 0;

    for (var i = 0; i <= text.length - 1; i++) {
        let tempText = new Text();
        textGroup.add(tempText);
        tempText.layers.enable( 3 );
        tempText.userData.layers = 3;

        tempText.position.set( 0, 0.0, -readerStartDistance );

        tempText.text = text[i];
        tempText.fontSize = 0.02;
        tempText.color = 0x000000;
        tempText.anchorX = 'left';
        tempText.anchorY = 'top';
        tempText.curveRadius = readerStartDistance;
        
        // tempText.maxWidth = 2;

        tempText.userData.text = tempText.text;
        tempText.userData.fontSize = tempText.fontSize;
        tempText.userData.color = tempText.color;
        tempText.userData.anchorX = tempText.anchorX;
        tempText.userData.anchorY = tempText.anchorY;
        tempText.userData.curveRadius = tempText.curveRadius;
        

        tempText.position.y = totalTextOffset;
        totalTextOffset += textOffset;

        tempText.sync();

        textBlock.push(tempText);

        tempText.userData.source = source;
        tempText.userData.type = "citation";
        tempText.userData.sequenceOrder = i;

        totalPreInstance++;

        tempText.addEventListener("synccomplete", () => {

            totalPostInstance++;
            if (totalPreInstance == totalPostInstance && totalPreInstance > 0) {
                createHandle(tempText, true);
            }
        });

    }

    headText.text = head;
    headText.fontSize = 0.03;
    headText.color = 0x000000;
    headText.anchorX = 'left';
    headText.anchorY = 'bottom';
    headText.curveRadius = readerStartDistance;
    headText.position.set( 0, 0.0, -readerStartDistance );

    headText.userData.text = headText.text;
    headText.userData.fontSize = headText.fontSize;
    headText.userData.color = headText.color;
    headText.userData.anchorX = headText.anchorX;
    headText.userData.anchorY = headText.anchorY;
    headText.userData.curveRadius = headText.curveRadius;
    headText.name = "header";

    // textGroup.userData.constrainMin = new THREE.Vector3(0, -0.15, 0);
    // textGroup.userData.constrainMax = new THREE.Vector3(0, 2.5, 0);

    // console.log(headText);
    headText.sync();
    textGroup.userData.header = headText;
    textGroup.userData.textBlock = textBlock;
    snapDistanceOne.push(textGroup);

}

// displayTextBlock(testDisplayHead,testDisplayText);

function HTMLtitle(htmlContent) {
    var $html = $(htmlContent);
    var results = $html.find('.title');
    var innerHTML;

    results.each(function() {
        innerHTML = $(this).html();
    });

    return innerHTML;

}

function fetchHTML(url, callback) {
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'html',
        success: function(data) {
            // console.log(callback(data));
            return callback(data);
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

























function startPos(mesh) {
    // Set position to the camera
    mesh.position.x = camera.position.x;
    mesh.position.y = camera.position.y - 0.3;
    mesh.position.z = camera.position.z;

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















// BUGS:
// Lines use circular references and break json exports - fix and re-enable

// NOTES:
// image-based light??
// remove three-finger curl?
// popup menu to change snap distance
// larger selection zone for each button
// tags and sticky notes for document content
// pass info to llm (chatgpt or claude) and return
// handle is thin, then grows when pointed at
// word wrap for citation block

// WIP:
// create workspace group for all modular items (not including user stuff like menu, hands, etc)
// export workspace data & import workspace data (include spacial information and all userdata)

// COMPLETE THIS UPDATE:
// clone is now more robust with copying userdata
// popup menu - highlight bits of text to "mark"
// finger selection pinch now requires a tighter pinch to trigger


















function createHandle(object, useParentY = false) {
    var width = 0.05;

    const tempBox = new THREE.Box3().setFromObject(object.parent);
    tempBox.getSize(tempSize);
    var height = tempSize.y;

    if (height <= 0.00001 ) {
        height = 0.027;
    }

    const boundingGeo = new THREE.PlaneGeometry( width, height );
    // const boundingWire = new THREE.EdgesGeometry( boundingGeo, 90 );
    // const boundingLine = new THREE.LineSegments( boundingWire );
    var boundingMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const boundingMesh = new THREE.Mesh( boundingGeo, boundingMat );

    workspace.add( boundingMesh );
    object.parent.attach( boundingMesh );
    boundingMesh.layers.enable( 3 );
    boundingMesh.userData.layers = 3;
    boundingMesh.userData.type = "handle";
    object.parent.userData.handle = boundingMesh;

    if ( useParentY ) {
        boundingMesh.position.set( object.position.x, object.parent.position.y - height/2 + 0.036, object.position.z );
    } else {
        boundingMesh.position.set( object.position.x, object.position.y - height/2 - 0.002, object.position.z );
    }
    
    boundingMesh.rotation.set( object.parent.rotation.x, 0, object.parent.rotation.z );
    boundingMesh.translateX( -0.04 );
}
















































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

const handModels = {
    left: null,
    right: null
};

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
    scene.add( hand1 );

    handModels.left = [
        handModelFactory.createHandModel( hand1, 'mesh' ),
        handModelFactory.createHandModel( hand1, 'boxes' )
        // handModelFactory.createHandModel( hand1, 'spheres' )
    ];

    for ( let i = 0; i < 2; i ++) {
        const model = handModels.left[ i ];
        model.visible = i == 0;
        hand1.add( model );
    }

    // hand1.addEventListener( 'pinchstart', onPinchStartLeft );
    // hand1.addEventListener( 'pinchend', onPinchEndLeft );
    
    
    // Hand 2
    controllerGrip2 = renderer.xr.getControllerGrip( 1 );
    controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
    scene.add( controllerGrip2 );

    hand2 = renderer.xr.getHand( 1 );
    scene.add( hand2 );
    
    handModels.right = [
        handModelFactory.createHandModel( hand2, 'mesh' ),
        handModelFactory.createHandModel( hand2, 'boxes' )
        // handModelFactory.createHandModel( hand2, 'spheres' )
    ];

    for ( let i = 0; i < 2; i ++) {
        const model = handModels.right[ i ];
        model.visible = i == 0;
        hand2.add( model );
    }

    // hand2.addEventListener( 'pinchstart', onPinchStartRight );
    // hand2.addEventListener( 'pinchend', onPinchEndRight );

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
            // console.log("ERR: No Grabbable Found");
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
    if (debugMode) {
        // Draw a placeholder arrow to visualize the raycast
        const arrowTest = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, length, color);
        scene.add(arrowTest);
        setTimeout(() => {scene.remove(arrowTest);},100);
    }
}

function norm(value, min, max) {
    return (value - min) / (max - min);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}



























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

















































var offsetPositionY;
var offsetAngle;
var wrist2NormalXVector = new THREE.Vector3();
var wrist2NormalZVector = new THREE.Vector3();
var wrist2Roll, wrist2Pitch;
var curObjDir = new THREE.Vector3();
var swipeRayLengthBase = 0.75;
var rSwipeObj = undefined;



function startSwipe(object) {
    consoleLog("==== drag started on " + object + " ====", 0x5500aa);
    rSwipeObj = object.parent;
}


function stopSwipe() {
    // consoleLog("==== drag stopped ====");
    rSwipeObj = undefined;
}















var toolSelectorDotWorld = new THREE.Vector3();
var curObjDir = new THREE.Vector3();
var swipeInverter = 1;

function trySwipe() {
    if ( rSwipeObj != undefined ) {

        if (rSwipeObj.userData.swipeInverter != undefined) {
            swipeInverter = rSwipeObj.userData.swipeInverter;
        }

        toolSelectorDot.getWorldPosition(toolSelectorDotWorld);

        // Vertical movement
        if (!offsetPositionY) {
            offsetPositionY = toolSelectorDotWorld.y;
        }

        var movement = toolSelectorDotWorld.y - offsetPositionY;

        if (movement) {
            rSwipeObj.position.y += movement;
        }

        offsetPositionY = toolSelectorDotWorld.y;

        // Horizontal movement
        curObjDir.subVectors(toolSelectorDotWorld, rSwipeObj.position).normalize();
        var angle = Math.atan2(curObjDir.x, curObjDir.z);

        if (!offsetAngle) {
            offsetAngle = angle;
        }

        var rotation = angle - offsetAngle;

        if (rotation) {
            rSwipeObj.rotation.y += rotation * swipeInverter;
            rSwipeObj.userData.swipeRot = rSwipeObj.rotation.y;
        }

        offsetAngle = angle;

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
        consoleLog("RECENTERING");
        repositionWorld();
        setToolPositions();
        recenterTimer = 0;
    }
}

//  PLACEHOLDER CENTER BEAM =================================
const testGeo = new THREE.BoxGeometry( 0.02, 0.02, 0.02 );
const testMat = new THREE.MeshBasicMaterial( {
    color: Math.random() * 0xffffff,
    transparent: true,
    opacity: 0.8
} );
const testCube = new THREE.Mesh( testGeo, testMat );
testCube.geometry.computeBoundingSphere();

testCube.position.set( 0, 0, 0 );
// spawn.userData.grabbable = "true";
// testCube.layers.enable( 1 );

const testPillarGeo = new THREE.CylinderGeometry( 0.005, 0.005, 1.5, 4);
const testPillar = new THREE.Mesh( testPillarGeo, testMat );
scene.add( testCube );
scene.add( testPillar );
testPillar.position.set( 0, -0.75, 0 );
testMat.visible = false;
// =========================================================

function showDebug() {
    if (debugMode) {
        consoleLog("Debug Mode Enabled", 0x44bb44);
        floorAxis.visible = true;
        debugLogGroup.visible = true;
        handModels.left[ 0 ].visible = false;
        handModels.left[ 1 ].visible = true;
        handModels.right[ 0 ].visible = false;
        handModels.right[ 1 ].visible = true;
        testMat.visible = true;
    } else {
        consoleLog("Debug Mode Disabled", 0xbb4444);
        floorAxis.visible = false;
        testPillar.visible = false;
        testCube.visible = false;
        debugLogGroup.visible = false;
        handModels.left[ 1 ].visible = false;
        handModels.left[ 0 ].visible = true;
        handModels.right[ 1 ].visible = false;
        handModels.right[ 0 ].visible = true;
        testMat.visible = false;
    }
}

const debugLogGroup = new THREE.Group();
const debugLogLine1 = new Text();
const debugLogLine2 = new Text();
const debugLogLine3 = new Text();
const debugLogLine4 = new Text();
const debugLogLine5 = new Text();
const debugLogLine6 = new Text();
const debugLogLine7 = new Text();
const debugLogLine8 = new Text();
const debugLogLine9 = new Text();

const debugLogLines = [debugLogLine1,debugLogLine2,debugLogLine3,debugLogLine4,debugLogLine5,debugLogLine6,debugLogLine7,debugLogLine8,debugLogLine9];

function initconsoleLog() {
    scene.add(debugLogGroup);
    for (var i = debugLogLines.length - 1; i >= 0; i--) {
        debugLogLines[i].text = "";
        debugLogLines[i].color = 0xffffff;
        debugLogLines[i].fontSize = 0.02;
        debugLogLines[i].anchorX = 'right';
        debugLogLines[i].anchorY = 'bottom';
        debugLogGroup.add(debugLogLines[i]);
        debugLogLines[i].translateY( 0.03 * (i + 1) );
        debugLogLines[i].rotateY( Math.PI );
        debugLogLines[i].sync();
    }
    debugLogGroup.visible = false;
}


function consoleLog(argument, color = 0xffffff) {
    var argument = argument.toString();
    console.log(">> " + argument);

    for (var i = debugLogLines.length - 1; i >= 1; i--) {
        debugLogLines[i].text = debugLogLines[i-1].text;
        debugLogLines[i].color = debugLogLines[i-1].color;
    }

    debugLogLine1.text = argument;
    debugLogLine1.color = color;
}


function animateconsoleLog() {
    if (debugMode) {
        debugLogGroup.position.set( wrist1.position.x, wrist1.position.y, wrist1.position.z );
        var newRot = new THREE.Quaternion().setFromRotationMatrix(
            new THREE.Matrix4().lookAt( debugLogGroup.position, camera.position, _yforward ) 
        );
        debugLogGroup.quaternion.copy( newRot );
    }
}
























// Workspace loader ======================================================================
var uploadedWorkspace = false;
var quedWorkspace;

document.querySelector('#upload').addEventListener('input',function() {
    const file = this.files[0];

    let fr = new FileReader();

    fr.readAsText(file);

    fr.onload = () => {
        console.log(fr.result);
        quedWorkspace = JSON.parse(fr.result);
        uploadedWorkspace = true;
    }

    fr.onerror = () => {
        console.log(fr.error);
    }
});


function initWorkspace() {
    if (uploadedWorkspace) {
        loadWorkspace();
    } else {
        loadTextBlock(currentURL);
    }
}

function saveWorkspace() {

    workspace.traverse( function(child) {

        // clear the direct references for the lines to prevent circular json structure
        if (child.userData.startObjRef != undefined) {
            child.userData.startObjRef = undefined;
        }
        if (child.userData.endObjRef != undefined) {
            child.userData.endObjRef = undefined;
        }

    });

    const json_export = workspace.toJSON();
    const content = JSON.stringify(json_export);
    const file = new File([content], 'workspace-export-test.json', {
        type: 'text/plain'
    });

    console.log(content);
    download(file);

    consoleLog("=================== WORKSPACE FINISHED SAVING ===================");

}

var pendingRemove = [];

function loadWorkspace() {
    const loader = new THREE.ObjectLoader();

    const work = loader.parse( quedWorkspace );

    scene.add( work );

    workspace = work;

    workspace.name = "workspace";

    workspace.position.set( 0, 0, 0 );
    workspace.rotation.set( 0, 0, 0 );


    // FIRST TRAVERSAL THROUGH THE WORKSPACE ==========================================
    workspace.traverse( function(child) {
        // console.log(child.uuid);

        if (child.name == "workspace") {

            // lineArray = [];

            // for (var i = child.userData.lineArray.length - 1; i >= 0; i--) {
            //     lineArray.push( child.userData.lineArray[i].object );
            // }

            // console.log(lineArray);

        }

        if (child.userData.text != undefined) {

            const newText = new Text();
            scene.add( newText );
            child.parent.attach( newText );
            newText.position.set( child.position.x, child.position.y, child.position.z );
            newText.rotation.set( child.rotation.x, child.rotation.y, child.rotation.z );
            newText.text = child.userData.text;
            newText.fontSize = child.userData.fontSize;
            newText.color = child.userData.color;
            newText.anchorX = child.userData.anchorX;
            newText.anchorY = child.userData.anchorY;
            newText.curveRadius = child.userData.curveRadius;

            if (child.name != "") {
                newText.name = child.name;
            }

            for (i in child.userData) {
                
                // if (i == "lines" ) {
                //     // console.log(i);
                //     var theseLines = [];

                //     for (var j = child.userData.lines.length - 1; j >= 0; j--) {
                //         if (child.userData.lines[j].object.userData._firstpass == undefined) {

                //             var thisLine = child.userData.lines[j];
                //             thisLine.object.userData._firstpass = true;
                //             theseLines.push( thisLine )

                //             thisLine.object.position.set(0,0,0);

                //             // console.log(thisLine);
                //         } else {

                //             var thisLine = newText.userData.lines[j];
                //             // thisLine.object.userData._firstpass = undefined;
                //             theseLines.push( thisLine );

                //             console.log("-passed-");
                //         }
                //     }

                //     newText.userData[i] = theseLines;

                // }
                // else {
                    newText.userData[i] = child.userData[i];
                // }

            // we need to pass all the userdata, but that also overwrites the userdata
            // this is an issue with the lines, which are changed when we pass the first text (startObj)
            // that uses them, then reset when we pass the second connecting text (endObj)

            // first hit of a line, set a custom userdata
            // second hit of the line, don't change that line, and remove the custom userdata
                
            }

            

            if (child.userData.maxWidth != undefined) {
                newText.maxWidth = child.userData.maxWidth;
            }

            if (child.userData.layers != undefined) {
                newText.layers.enable( child.userData.layers );
            }

            if (child.parent.userData.textBlock != undefined && child.name != "header") {
                var textBlock = child.parent.userData.textBlock;
                var index = textBlock.indexOf(child);
                textBlock.splice(index, 1, newText);
                // textBlock.push(newText);
            }

            if (child.userData.lines != undefined) {
                var lines = [];
                for (var i = child.userData.lines.length - 1; i >= 0; i--) {
                    lines.push( child.userData.lines[i].object );
                }
                newText.userData.lines = lines;


                for (var i = lines.length - 1; i >= 0; i--) {
                    if (lines[i].userData.startObj == child.uuid) {
                        lines[i].userData.startObj = newText.uuid;
                        console.log("Set StartObj to: " + lines[i].userData.startObj);
                    }
                    else if (lines[i].userData.endObj == child.uuid) {
                        lines[i].userData.endObj = newText.uuid;
                        console.log("Set EndObj to: " + lines[i].userData.endObj) ;
                    }

                    if (animatedConnections.includes( lines[i], 0 ) == false) {
                        animatedConnections.push(lines[i]);
                        console.log("Pushed line to array: " + lines[i].uuid);
                    }
                    
                }

                console.log(lines);


            }

            console.log("***** " + animatedConnections.length);

            pendingRemove.push(child);
            newText.sync();
        }

        if (child.type == "Group" && child.name != "workspace") {

            if (child.userData.swipeRot != undefined) {
                child.rotation.set( 0, child.userData.swipeRot, 0 );
            }

            if (child.userData.textBlock != undefined) {
                // child.userData.textBlock = [];
            }

        }
 
    });

    // REMOVE PENDING ELEMENTS =========================================================
    for (var i = pendingRemove.length - 1; i >= 0; i--) {
        console.log("REMOVE: " + pendingRemove[i]);
        pendingRemove[i].parent.remove(pendingRemove[i]);
        pendingRemove.splice(i,1);
    }

    // SECOND TRAVERSAL THROUGH THE WORKSPACE ==========================================
    // workspace.traverse( function(child) {

        // Iterate through the loaded workspace a second time after it has fully loaded.
        // This time grab lines and things like that.

        // if (child.userData.text != undefined) {
        //     if (child.userData.lines != undefined) {
        //         var lines = [];
        //         for (var i = child.userData.lines.length - 1; i >= 0; i--) {
        //             lines.push( child.userData.lines[i].object );
        //         }
        //         newText.userData.lines = lines;

        //         for (var i = lines.length - 1; i >= 0; i--) {
        //             console.log(lines[i]);
        //             if (lines[i].userData.startObj == child.uuid) {
        //                 lines[i].userData.startObj = newText.uuid;
        //             }
        //             else if (lines[i].userData.endObj == child.uuid) {
        //                 lines[i].userData.endObj = newText.uuid;
        //             }
        //         }
        //     }


        // }



         // for (var i = lineArray.length - 1; i >= 0; i--) {
         //        lineArray[i].object.userData.startObj = workspace.getObjectByProperty('uuid', lineArray[i].object.userData.startObj.uuid);
         //        lineArray[i].object.userData.endObj = workspace.getObjectByProperty('uuid', lineArray[i].object.userData.endObj.uuid);
            
         //        console.log(lineArray[i].object.userData.startObj);
         //    }


    // });





}










































var currentURL = './3511095.3531271.html';

// change the url of the document to load
$('#urlin').change(function(){
    var url = $('#urlin').val();
    currentURL = url;
    console.log("Changed document to: " + url);
});



function changeURL() {
    
}












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
                initconsoleLog();
                initWorkspace();

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
                tryPointer();

                animateCitationLines();
                animateconsoleLog();
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