// Import three.js and modules
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { Text, getCaretAtPoint, getSelectionRects } from 'troika-three-text';
import { Timer } from 'three/addons/misc/Timer.js';
import TWEEN from '@tweenjs/tween.js';

// Palette ================================================================================
// Main environment background color
    const _colorBGmain = 0x7f7f7f;
// Library background and prism menu color
    const _colorBGmenu = 0x5c5c5c;
// Focus and document background color
    const _colorBGread = 0xeeeeee;
// Highlight point light color
    const _colorLIhigh = 0xffbd66;
// Main directional light color
    const _colorLImain = 0xffffff;
// Library text color
    const _colorTXlibr = 0xffffff;
// Main text color
    const _colorTXmain = 0x000000;
// Alt text color
    const _colorTXalts = 0xeeeeee;
    const _colorTXaltsrgb = {r: 238, g: 238, b: 238};
// Off or defocused text color
    const _colorTXoffs = 0xcccccc;
    const _colorTXoffsrgb = {r: 204, g: 204, b: 204};
// Popup menu text color
    const _colorTXpopu = 0xffffff;
// Bounding box color - for document bounds and UI
    const _colorBounds = 0x999999;
// Highlight for bounding box colors
    const _colorHBound = 0xaaaaaa;
// Document menu bar text color
    const _colorTXmbar = 0xeeeeee;
// Popup menu background color
    const _colorBGpopu = 0x999999;
// Debug log text color
    const _colorTXclog = 0xffffff;
// Text markup highlight colors
    const _colorHImark = [0x000000, 0x604600, 0x004700, 0x222B5C];
    // const _colorHImark = [0xE6DE54, 0x4FE362, 0x55BBE6, 0xE08DE5, 0xE6556F];
// Map text color
    const _colorTXmap = 0x000000;
// Map background color
    const _colorBGmap = 0xbbbbbb;
// Map highlight/selector color
    const _colorHImap = 0xffbd66;
// Selector/pointer color
    const _colorTools = 0xffbd66;
// Manna circuit color
    const _colorManna = 0xffbd66;
// Manna text color
    const _colorManaT = 0xffffff;
// Hand model color
    const _colorHands = 0x222222;
// Box menu border color
    const _colorBXmain = 0xffffff;


// Set up the scene and camera for three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// Set up the default workspace
var workspace = new THREE.Group();
scene.add(workspace);

// Set up the mapspace
var mapspace = new THREE.Group();
scene.add(mapspace);

// Create a timer to track delta time
const timer = new Timer();
var deltaTime;

// Create and add a light to the scene
const topLight = new THREE.DirectionalLight( _colorLIhigh, Math.PI * 0.15 );
scene.add( topLight );
topLight.position.x = 50;
topLight.position.z = 30;

// Create a center light and add it to the scene
const centerLight = new THREE.PointLight( _colorLImain, 1, Math.PI * 0.2 );
centerLight.distance = 100;
scene.add( centerLight );
centerLight.position.y = -0.25;

// Create a renderer element and add it to the HTML doc
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Setup renderer color space
var colorSpace = "linear";
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
// renderer.outputColorSpace = THREE.SRGBColorSpace;

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
scene.background = new THREE.Color ( _colorBGmain );

// Artificial background for webXR color issues
const sceneSphere = new THREE.SphereGeometry( 50, 8, 8 );
const sceneMat = new THREE.MeshBasicMaterial({
    color: _colorBGmain,
    side: THREE.DoubleSide
});
const sceneBG = new THREE.Mesh( sceneSphere, sceneMat );
scene.add( sceneBG );

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

const _zero = new THREE.Vector3( 0, 0, 0 );


var debugMode = false;
const readerStartDistance = 2.5;
const closeEnough = 0.1;

// Rotation order
camera.rotation.order = 'YXZ';

//  PLACEHOLDER CENTER BEAM =================================
const testGeo = new THREE.BoxGeometry( 0.02, 0.02, 0.02 );
const testMat = new THREE.MeshBasicMaterial( {
    color: Math.random() * 0xffffff,
    transparent: true,
    side: THREE.DoubleSide,
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

// font
const _fontserif = './Wittgenstein.ttf';
const _fontserifbold = './Wittgenstein-Bold.ttf';
const _fontserifblack = './Wittgenstein-Black.ttf';
const _fontserifitalic = './Wittgenstein-Italic.ttf';

// hands
var currentDominant;
var initialDominant;

// save system
var savedElement = [];





// ================================== MENU CONTENT =========================================

const normalNone = new THREE.TextureLoader().load( './normal-none.jpg' );

var normalMainBtn, sliderMainBtn, settingsBackBtn, slidersBackBtn;

var sliderNormalScale, sliderEmissive, sliderReaderDistanceMin;

var sliderNormalBg, sliderEmissiveBg, sliderReaderDistanceBg;

var debugBtn, debugText;

var exportBtn, exportText;

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

// =========================================================================================

const menuGroup = new THREE.Group();

var menuGeo = new THREE.CylinderGeometry( 0.1, 0.1, 0.6, 3, 1, false );
var menuMat = new THREE.MeshStandardMaterial({ 
    color: _colorBGmenu,
    transparent: false,
    opacity: 0.75,
    roughness: 0.32,
    metalness: 0.1,
    normalScale: new THREE.Vector2( 1, 1 ),
    emissive: _colorBGmenu,
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
var workspaceTransScale;

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

    scene.add(sphereHelperSolid);
    sphereHelperSolid.scale.set( 0.9, 0.9, 0.9 );
    sphereHelperSolid.position.set( wrist1.position.x, wrist1.position.y, wrist1.position.z );
    wrist1.attach(sphereHelperSolid);
}

function toggleLibrary(state) {
    if (state == 'open') {
        isMenuBusy = true;
        library.visible = true;

        // Tween the helper sphere
        sphereHelperTransScale = new TWEEN.Tween( sphereHelper.scale )
                .to( {x: 170, y: 170, z: 170}, sphereAnimLength )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .start()
        ;
        // Tween the workspace
        workspaceTransScale = new TWEEN.Tween( workspace.scale )
                .to( {x: 10, y: 10, z: 10}, sphereAnimLength )
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

        if (camera.rotation.y )
        sphereHelper.rotation.set(0,camera.rotation.y,0);
        


        menuMode = 99;

    } else if (state == 'close') {
        isMenuBusy = true;

        // Tween the helper sphere
        scene.attach(sphereHelper);
        sphereHelperTransScale = new TWEEN.Tween( sphereHelper.scale )
                .to( {x: 1, y: 1, z: 1}, sphereAnimLength )
                .easing( TWEEN.Easing.Circular.InOut )
                .start()
        ;
        // Tween the workspace
        workspaceTransScale = new TWEEN.Tween( workspace.scale )
                .to( {x: 1, y: 1, z: 1}, sphereAnimLength )
                .easing( TWEEN.Easing.Quadratic.InOut )
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
                    library.visible = false;
                })
        ;

        menuMode = 0;
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

            for (var i = allRays.length - 1; i >= 0; i--) { allRays[i].visible = true; }

        } else if (isMenuOpen && !isMenuActive && menuMode != 99) { // The menu is open: close it now
            consoleLog("MENU: Close");
            isMenuOpen = false;
            menuGroup.visibility = false;
            menuGroup.position.y = -999;
            subMenu(0);
        }
        else if (!isMenuActive && menuMode != 99) { // The menu is closed: open it now
            consoleLog("LIBRARY: OPEN");
            toggleLibrary('open');

            // Close the menu if it is o
            isMenuOpen = false;
            menuGroup.visibility = false;
            menuGroup.position.y = -999;
            menuMode = 99;

            for (var i = allRays.length - 1; i >= 0; i--) { allRays[i].visible = false; }

        }

        if (libraryTimer >= libraryTimerHold && menuMode != 99 && !justClosedLibrary) { // The button has been held down: open the library
            consoleLog("MENU: Open");
            isMenuOpen = true;
            startPos(menuGroup);
        }

        isMenuActive = true; // The menu is now active: don't trigger anything again until the gesture is changed
    } else if (indexFingerTip2.position.distanceTo(wrist1.position) > 0.05 && isMenuActive) {
        isMenuActive = false;
        libraryTimer = 0;
        justClosedLibrary = false;
    }
}


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

    // set the menu to its start rotation & scale the back buttons
    menu.rotation.x = Math.PI * 2;
    settingsBackBtn.scale.set(0,0,0);
    slidersBackBtn.scale.set(0,0,0);

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
                snapDistanceOneValue = newRange;
                for (var i = snapDistanceOne.length - 1; i >= 0; i--) {
                    var thisGroup = snapDistanceOne[i];
                    changeDistance(thisGroup, newRange);
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

















let toolSelector, toolSelectorCore, toolSelectorCast, toolSelectorTip, toolSelectorTip2, toolSelectorBeam, toolSelectorDot, toolSelectorDotFX, toolSelectorFloatingPoint;

const toolColorMat = new THREE.MeshBasicMaterial( {
    color: _colorTools,
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
        color: _colorTools,
        transparent: true,
        opacity: 1,
        depthWrite: true
    } );
    var fxMat = new THREE.MeshBasicMaterial( {
        color: _colorTools,
        transparent: true,
        opacity: 0.75,
        depthWrite: false
    } );

    toolSelector = new THREE.Group();
    toolSelectorCore = new THREE.Group();
    toolSelectorCast = new THREE.Group();
    toolSelectorTip = new THREE.Mesh( tipGeo, toolColorMat );
    toolSelectorTip2 = new THREE.Mesh( tipGeo, toolColorMat );
    toolSelectorBeam = new THREE.Mesh( beamGeo, toolColorMat );
    toolSelectorDot = new THREE.Mesh( dotGeo, colorMat );
    toolSelectorDotFX = new THREE.Mesh( dotGeo, fxMat );
    toolSelectorFloatingPoint = new THREE.Mesh( tipGeo, testMat);

    toolSelectorCore.attach( toolSelectorTip );
    toolSelectorCore.attach( toolSelectorTip2 );
    toolSelectorCast.attach( toolSelectorBeam );
    toolSelectorCast.attach( toolSelectorDot );
    toolSelectorDot.attach( toolSelectorDotFX );

    toolSelectorTip.rotateY( Math.PI / 4 );
    toolSelectorTip.rotateX( Math.PI / 4 );

    toolSelectorTip2.rotateY( Math.PI / 4 );
    toolSelectorTip2.rotateX( Math.PI / 4 );

    reorientPointer();

    toolSelector.attach( toolSelectorCore );
    scene.add( toolSelector );
    scene.add( toolSelectorCast );
    scene.add( toolSelectorFloatingPoint );

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

function reorientPointer() {
    toolSelectorCore.position.set( 0, 0, 0 );
    toolSelectorCore.rotation.set( 0, 0, 0 );

    if ( currentDominant == 'right' || currentDominant == undefined ) {
        toolSelectorCore.translateZ( -0.111 );
        toolSelectorCore.translateY( -0.113 );
        toolSelectorCore.translateX( -0.015 );
    } else {
        toolSelectorCore.translateZ( -0.111 );
        toolSelectorCore.translateY( -0.113 );
        toolSelectorCore.translateX( 0.015 );
    }

    toolSelectorCore.rotateX( -Math.PI / 2.9);
}

var toolSelectorSmoothSteps = 3;
var toolSelectorPrevRotations = [];
var toolSelectorPrevPositions = [];
var openHandles = [];
var toolSelectorGapSet = false;
var toolSelectorCoreWorld = new THREE.Vector3;

function setToolPositions(reset = false) {

    if ( reset ) {

        for (var i = toolSelectorSmoothSteps; i >= 0; i--) {
            
            // add the current wrist position & rotation to the end of the arrays
            toolSelectorPrevRotations.push([wrist2.quaternion.x, wrist2.quaternion.y, wrist2.quaternion.z, wrist2.quaternion.w]);
            toolSelectorPrevPositions.push([wrist2.position.x, wrist2.position.y, wrist2.position.z]);
            // remove the first elements of the arrays
            toolSelectorPrevRotations.shift();
            toolSelectorPrevPositions.shift();

        }

        // Move the tool
        toolSelector.position.set( wrist2.position.x, wrist2.position.y, wrist2.position.z );
        toolSelector.quaternion.set( wrist2.quaternion.x, wrist2.quaternion.y, wrist2.quaternion.z, wrist2.quaternion.w );

        // Set the cast group to the core location
        toolSelectorCore.getWorldPosition( toolSelectorCoreWorld );
        toolSelectorCast.position.set( toolSelectorCoreWorld.x, toolSelectorCoreWorld.y, toolSelectorCoreWorld.z );

    } else {

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

        // Set the cast group to the core location
        toolSelectorCore.getWorldPosition( toolSelectorCoreWorld );
        toolSelectorCast.position.set( toolSelectorCoreWorld.x, toolSelectorCoreWorld.y, toolSelectorCoreWorld.z );

        // Move the floating point (raycaster source) to the appropiate position
        if (!toolSelectorGapSet && toolSelectorActive) {
            toolSelectorFloatingPoint.position.set( wrist2.position.x, wrist2.position.y, wrist2.position.z );
            toolSelectorFloatingPoint.rotation.set( camera.rotation.x, camera.rotation.y, camera.rotation.z );
            toolSelectorFloatingPoint.translateZ( 0.55 );
            toolSelectorGapSet = true;
        }

        // Rotate the tool selector core to match the angle between the floating point and the tool tip
        if (toolSelectorActive) {

            var newRot = new THREE.Quaternion().setFromRotationMatrix(
                new THREE.Matrix4().lookAt( toolSelectorFloatingPoint.position, tempSelectorWorld, _ybackward ) 
            );
            toolSelectorCast.quaternion.copy( newRot );

        }

        // if distance between camera and pointer is outside of bounds, reset the floating point position
        if (toolSelectorActive) {
            let toolSelectorRayGap = toolSelectorFloatingPoint.position.distanceTo(tempSelectorWorld);
            if (toolSelectorRayGap < 0.3) {
                toolSelectorGapSet = false;
            }
        }
    }
    
}

function animateTools() {

    if (toolSelectorActive) { setToolPositions() }; 

    if (toolSelectorGapSet && !toolSelectorActive) {
        toolSelectorGapSet = false;
    }
    
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
var previewsToReset = [];
var toolSelectorActive = false;
var toolSelectorPointing = false;

var toolSelectorVisible = false; // Change this to show/hide the selector beam and tool
var toolSelectorTimer = 0; // Current amout of time not pointing at anything
var toolSelectorTimeout = 3; // How long until the line fades in
var toolSelectorFading = false;

var raycaster = new THREE.Raycaster();
raycaster.layers.set( 3 );

var toolSelectorBeamCustomRules = false;

function tryPointer() {
    let fingersMaxDist = 0.09;
    let fingersMinDist = 0.07;
    let fingersCurDist = thumbTip2.position.distanceTo(indexFingerTip2.position);
    let fingersNormalized = 1 - norm(fingersCurDist, fingersMinDist, fingersMaxDist);
    let fingersClamped = clamp(fingersNormalized, 0, 1);

    if ( pinkyFingerTip2.position.distanceTo(wrist2.position) < 0.13 
    && ringFingerTip2.position.distanceTo(wrist2.position) < 0.13
    && middleFingerTip2.position.distanceTo(wrist2.position) < 0.13 && !isMannaUsed
    ) {

        // Custom rules for the pointer
        if ( toolSelectorBeamCustomRules ) {
            toolSelectorTip.visible = true;
            toolSelectorTip.scale.set( 1,1,1 );
            toolSelectorTip2.visible = true;
            toolSelectorTip2.scale.set( 1,1,1 );
            toolSelectorBeam.visible = true;
        }

        // Clear the smooth step history
        setToolPositions(true);


        toolSelectorActive = true;
        toolSelectorTimer += deltaTime;

        // Animate in the selector core
        if (!tempSelectorTweenedIn && tempSelectorTweenedOut && !toolSelectorBeamCustomRules) {
            tempSelectorTweenedOut = false;

            toolSelectorTip.visible = toolSelectorVisible;
            toolSelectorTip2.visible = toolSelectorVisible;
            toolSelectorBeam.visible = toolSelectorVisible;

            toolSelectorBeam.scale.z = snapDistanceOneValue * 1000;
            toolSelectorBeam.position.z = -snapDistanceOneValue/2;

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
        if (toolSelectorTimer >= toolSelectorTimeout && !toolSelectorFading && toolColorMat.opacity < 1 && !toolSelectorBeamCustomRules) {
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
        } else if (toolSelectorTimer < toolSelectorTimeout && !toolSelectorFading && toolColorMat.opacity > 0 && !toolSelectorBeamCustomRules) {
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

                // if this is a serif font
                if ( thisText.font == _fontserifbold && thisText.userData.bold == undefined ) {
                    thisText.font = _fontserif;
                }

                // ...as long as they are not selected
                if ( selectedObjects.indexOf(thisText) == -1 ) {
                    thisText.fontWeight = "normal";
                    textsToReset.splice(i, 1);
                }
 
            }
        }

        // If there are any visible lines, hide them
        if (linesToHide.length > 0) {
            for (var i = linesToHide.length - 1; i >= 0; i--) {
                var thisLine = linesToHide[i];
                // console.log(thisLine);
                if (thisLine.name == "line") {
                    if (thisLine.userData.persistent == undefined) {
                        thisLine.visible = false;
                    }
                    linesToHide.splice(i, 1);
                }
            }
        }

        // Check if the fingers are doing the point gesture, then raycast
        if (fingersNormalized >= 1) {
            toolSelectorPointing = true;
            toolSelectorCast.getWorldQuaternion(tempSelectorQuat);
            var rayForward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(tempSelectorQuat);
            raycaster.set(tempSelectorWorld, rayForward);
            var intersects = raycaster.intersectObjects(scene.children);
            var intersect = intersects[0];

            if ( intersect != undefined && intersect.object.userData.type != "mapbg" ) {
                lastIntersect = intersect;
                lastIntersectBGtime = 0;
            } else {
                lastIntersectBGtime += deltaTime;
                if (lastIntersectBGtime > pinchThreshold) {
                    lastIntersect = intersect;
                    lastIntersectBGtime = 0;
                }
            }

            // If the dot has been reset last time, give it a default distance
            if (toolSelectorDot.position.z >= -0.01) {
                toolSelectorDot.position.z = -snapDistanceOneValue;
            }

            toolSelectorDot.visible = true;

            placeholderArrow(raycaster, 0.5, 0xffffff);

            // If the raycaster has found an eligible object
            if (intersect) {

                if (intersect.object != mapbg) {
                    toolSelectorTimer = 0;
                }
                
                let beamScale = tempSelectorWorld.distanceTo(intersect.point) * 1000;
                // toolSelectorBeam.visible = toolSelectorVisible;
                toolSelectorBeam.scale.z = beamScale;
                toolSelectorBeam.position.z = -(beamScale/2000);

                toolSelectorDot.position.z = -(beamScale/1000);

                let distScale = (beamScale / 2000) + 1;
                toolSelectorDot.scale.set( distScale, distScale, distScale );

                if (intersect.object.userData.type != "preview") {
                    if ( intersect.object.font == _fontserif || intersect.object.font == _fontserifbold ) {
                        // intersect.object.fontSize = intersect.object.userData.fontSize * 1.1;
                        intersect.object.font = _fontserifbold;
                        textsToReset.push(intersect.object);
                    } else {
                        intersect.object.fontSize = intersect.object.userData.fontSize * 1.1;
                        intersect.object.fontWeight = "bold";
                        textsToReset.push(intersect.object);
                    }
                }

                if (domswipeObj == undefined) {
                    tryPointerOver(intersect.object);
                }

            } else {
                // No current intersection
                tryCloseHandles();
            }

            // Selection function - user has clamped their fingers together while pointing
            if (intersect && isDomPinching && !tempSelectorActive) {
                tempSelectorActive = true;

                // Tween the selector dot for the selection 'click'
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

                tryPointerSelect(intersect.object);

            } else if (!isDomPinching && tempSelectorActive) {
                tempSelectorActive = false;
                stopSwipe();
            }

        } else {
            // toolSelectorBeam.scale.z = 0;
            // toolSelectorBeam.visible = false;
            // toolSelectorBeam.position.z = 0;
            toolSelectorDot.position.z = 0;
            toolSelectorDot.visible = false;
            toolSelectorPointing = false;
            stopSwipe();
        }

    } else {

        toolSelectorActive = false;
        toolSelectorPointing = false;
        stopSwipe();
        tryCloseHandles();

        // Animate out the selector core
        if (tempSelectorTweenedIn && !tempSelectorTweenedOut && !toolSelectorBeamCustomRules) {
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

        } else if ( toolSelectorBeamCustomRules ) {
            toolSelectorTip.visible = false;
            toolSelectorTip.scale.set( 0,0,0 );
            toolSelectorTip2.visible = false;
            toolSelectorTip2.scale.set( 0,0,0 );
            toolSelectorBeam.visible = false;
        }

    }

    animateTools();

}


function tryCloseHandles() {
    if (openHandles.length > 0 && domswipeObj == undefined) {
        for (var i = openHandles.length - 1; i >= 0; i--) {
            var tempHandlebarScale = new TWEEN.Tween( openHandles[i].scale )
            .to( {x: 0.1}, 300 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .start();
            var tempHandlebarPos = new TWEEN.Tween( openHandles[i].position )
            .to( {x: 0.045}, 300 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .start();

            openHandles[i].userData.fullOpen = false;
            openHandles.splice(i,1);
        }
    }

}


function tryResetPreviews() {
    if ( previewsToReset.length > 0 ){
        // console.log(previewsToReset);
        for (var i = previewsToReset.length - 1; i >= 0; i--) {
            previewsToReset[i].visible = true;
            previewsToReset[i].layers.enable( 3 );

            let thisTextBlock = previewsToReset[i].parent.userData.textBlock;
            for (var j = thisTextBlock.length - 1; j >= 0; j--) {
                thisTextBlock[j].visible = false;
                thisTextBlock[j].layers.disable( 3 );
            }

            previewsToReset.splice( i, 1 );
        }
        previewsToReset = [];
    }
}

function disablePreviews(group) {
    let previewText = group.userData.previewText;
    if (previewText != undefined) {
        previewText.visible = false;
        previewText.layers.disable( 3 );
        previewsToReset.push(previewText);
        let textBlock = group.userData.textBlock;
        for (var i = textBlock.length - 1; i >= 0; i--) {
            textBlock[i].visible = true;
            textBlock[i].layers.enable( 3 );
        }
    }
}


function tryPointerOver(object) {
    // console.log(object);
    // Show connection lines, if applicable
    if (object.userData.lines != undefined && object.userData.type != "menubarRef") {
        const lines = object.userData.lines;
        for (var i = lines.length - 1; i >= 0; i--) {
            lines[i].visible = true;
            linesToHide.push(lines[i]);
        }
    // Catch for any objects that do not have their type set, but can trigger the event
    } else if (object.userData.type == undefined) {

        // console.log("No over event for this object");

    // For the library, update the preview text
    } else if (object.userData.type == "librarydoc") {
        var object = object;

        if (libraryTitle.text != object.userData.title) {
            libraryTitle.text = object.userData.title;
            libraryYear.text = object.userData.year;
            libraryAuthor.text = object.userData.author;
            libraryAbstract.text = object.userData.abstract;
        }
    // When pointing at a handle, tween it
    } else if (object.userData.type == "handle") {
        var handlebar = object.userData.handlebar;

        if (handlebar != undefined && handlebar.userData.fullOpen != true) {
            handlebar.userData.fullOpen = true;

            if (handlebar != undefined) {
                // tween out to scale x = 0.1
                var tempHandlebarScale = new TWEEN.Tween( handlebar.scale )
                .to( {x: 1}, 300 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .start()
                .onComplete(() => {
                    openHandles.push(handlebar);
                });
                var tempHandlebarPos = new TWEEN.Tween( handlebar.position )
                .to( {x: 0}, 300 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .start();
            }
        }
    // When pointing at a preview text block, hide it and show the individual texts instead
    } else if (object.userData.type == "preview") {
        if (object.parent.userData.previewText != undefined && object.parent.userData.previewText.visible != false) {
            
            tryResetPreviews();

            disablePreviews(object.parent);

            // consoleLog("Preview text toggled off");
        }
    // When pointing at a close buton, tween it
    } else if (object.userData.type == "closeBtn") {
        var child = object.children[0];

        if ( child.userData.opening != true && child.scale.x < 1 ) {
            child.userData.opening = true;

            var tempClosebtnScale = new TWEEN.Tween( child.scale )
            .to( {x: 1, y: 1}, 250 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .start()
            .onComplete(() => {
                child.userData.opening = false;
                tryCloseButton(child);
            });
        }
    // When pointing at the box menu, animate it to visible
    } else if (object.userData.type.slice(0,8) == "boxMenu-") {

        if ( object.parent.parent == boxMenu || object.parent == boxMenu ) {
            tryHideBoxMenu( false );
        }

        if ( object.userData.type == "boxMenu-background" ) {

            if ( object.userData.typealt != undefined && object.userData.typealt == "flexbox" ) {
                // This is the background of a preview box, and one that can flex

                const target = object.parent.parent;
                const box = object.parent;

                if ( target.userData.minified == true ) {

                    const boxjson = box.userData.box;

                    var closeTxt = box.userData.closeTxt;
                    var barTxt = box.userData.barTxt;
                    var focusTxt = box.userData.focusTxt;
                    var bar = box.userData.bar;

                    var boxbot = boxjson.bot;
                    var boxleft = boxjson.left;
                    var boxright = boxjson.right;
                    var boxback = boxjson.back;
                    var boxistall = boxjson.tall;
                    var boxheight = boxjson.height;
                    var abstract = boxjson.abstract;
                    var details = boxjson.details;

                    // const newheight = 0.5;
                    const newheight = target.userData.totalHeight + 0.2;
                    const speed = 300;
                    const ease = TWEEN.Easing.Quadratic.InOut;

                    // boxleft.scale.y = newheight;
                    // boxright.scale.y = newheight;
                    // boxback.scale.y = newheight;
                    new TWEEN.Tween( boxleft.scale ).to( {y: newheight}, 300 ).easing( ease ).start();
                    new TWEEN.Tween( boxright.scale ).to( {y: newheight}, 300 ).easing( ease ).start();
                    new TWEEN.Tween( boxback.scale ).to( {y: newheight}, 300 ).easing( ease ).start();

                    // boxleft.position.y = -newheight/2;
                    // boxright.position.y = -newheight/2;
                    // boxback.position.y = -newheight/2;
                    new TWEEN.Tween( boxleft.position ).to( {y: -newheight/2}, 300 ).easing( ease ).start();
                    new TWEEN.Tween( boxright.position ).to( {y: -newheight/2}, 300 ).easing( ease ).start();
                    new TWEEN.Tween( boxback.position ).to( {y: -newheight/2}, 300 ).easing( ease ).start();

                    // boxbot.position.y = (-newheight) - 0.0;
                    new TWEEN.Tween( boxbot.position ).to( {y: -newheight}, 300 ).easing( ease ).start();

                    // closeTxt.position.y = -newheight + 0.2;
                    // barTxt.position.y = -newheight + 0.2;
                    // focusTxt.position.y = -newheight + 0.2;
                    // bar.position.y = -newheight + 0.30;
                    new TWEEN.Tween( closeTxt.position ).to( {y: -newheight + 0.18}, 300 ).easing( ease ).start();
                    new TWEEN.Tween( barTxt.position ).to( {y: -newheight + 0.2}, 300 ).easing( ease ).start();
                    new TWEEN.Tween( focusTxt.position ).to( {y: -newheight + 0.18}, 300 ).easing( ease ).start();
                    new TWEEN.Tween( bar.position ).to( {y: -newheight + 0.30}, 300 ).easing( ease ).start();

                    // abstract.scale.y = 1;
                    abstract.visible = true;
                    new TWEEN.Tween( abstract.scale ).to( {y: 1}, 300 ).easing( ease ).start();

                    // details.position.y = -newheight + 0.50;
                    // details.scale.y = 1;
                    details.visible = true;
                    new TWEEN.Tween( details.position ).to( {y: -newheight + 0.5}, 300 ).easing( ease ).start();
                    new TWEEN.Tween( details.scale ).to( {y: 1}, 300 ).easing( ease ).start();

                    target.userData.minified = false;

                    target.userData.minitimer = 0;

                    minifyCountdown(target);

                }

                target.userData.minitimer = 0;

            }

        }

    } else if (object.userData.type == "docoutline-bg") {
        const outlineGroup = object.parent;
        const outlineGroupBG = outlineGroup.userData.outbg;
        const outlineBar = outlineGroup.userData.outlineBar;

        if ( outlineGroup != undefined && outlineGroup.userData.isOut == false ) {

            for (var i = outlineGroup.children.length - 1; i >= 0; i--) {
                outlineGroup.children[i].visible = true;
            }

            new TWEEN.Tween( outlineGroup.rotation )
            .to( { y: outlineGroup.userData.rotationOut}, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( outlineGroup.scale )
            .to( { y: 1}, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( outlineGroupBG.rotation )
            .to( { y: -0.2 }, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( outlineGroupBG.scale )
            .to( { y: outlineBar.userData.scaleOut }, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( outlineBar.scale )
            .to( { y: outlineBar.userData.scaleOut }, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            outlineGroup.userData.isOut = true;

        }

    } else if (object.userData.type == "docbg") {
        const outlineGroup = object.parent.userData.outlineGroup;
        const outlineGroupBG = outlineGroup.userData.outbg;
        const outlineBar = outlineGroup.userData.outlineBar;
        const docGroup = object.parent;
        const clippingEnd = docGroup.userData.clippingEnd;
        const clippingStart = docGroup.userData.clippingStart;
        const height = clippingEnd.position.y - clippingStart.position.y;
        const refGroup = object.parent.userData.refGroup;
        var refGroupBG;
        var refBar;

        if ( refGroup != undefined ) {
            refGroupBG = refGroup.userData.refbg;
            refBar = refGroup.userData.refBar;
        }

        if ( outlineGroup != undefined && outlineGroup.userData.isOut == true ) {

            new TWEEN.Tween( outlineGroup.rotation )
            .to( { y: outlineGroup.userData.rotationIn}, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( outlineGroup.scale )
            .to( { y: 0.2}, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( outlineGroupBG.rotation )
            .to( { y: 0 }, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( outlineGroupBG.scale )
            .to( { y: -height * 4 }, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( outlineBar.scale )
            .to( { y: -height }, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start()
            .onComplete(() => {
                if ( outlineGroup.userData.isOut == false ) {

                    for (var i = outlineGroup.children.length - 1; i >= 0; i--) {
                        if ( outlineGroup.children[i].name != "bg" ) {
                            outlineGroup.children[i].visible = false;
                        }
                    }

                }
            });

            outlineGroup.userData.isOut = false;

        }

        if ( refGroup != undefined && refGroup.userData.isOut == true ) {

            new TWEEN.Tween( refGroup.rotation )
            .to( { y: refGroup.userData.rotationIn}, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( refGroup.scale )
            .to( { y: 0.2}, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( refGroupBG.rotation )
            .to( { y: 0 }, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( refGroupBG.scale )
            .to( { y: -height * 4 }, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( refBar.scale )
            .to( { y: -height }, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start()
            .onComplete(() => {
                if ( refGroup.userData.isOut == false ) {

                    for (var i = refGroup.children.length - 1; i >= 0; i--) {
                        if ( refGroup.children[i].name != "bg" ) {
                            refGroup.children[i].visible = false;
                        }
                    }

                }
            });

            refGroup.userData.isOut = false;

        }

    } else if (object.userData.type == "docref-bg") {
        const refGroup = object.parent;
        const refGroupBG = refGroup.userData.refbg;
        const refBar = refGroup.userData.refBar;

        if ( refGroup != undefined && refGroup.userData.isOut == false ) {

            for (var i = refGroup.children.length - 1; i >= 0; i--) {
                refGroup.children[i].visible = true;
            }

            new TWEEN.Tween( refGroup.rotation )
            .to( { y: refGroup.userData.rotationOut}, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( refGroup.scale )
            .to( { y: 1}, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( refGroupBG.rotation )
            .to( { y: 0.05 }, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( refGroupBG.scale )
            .to( { y: refBar.userData.scaleOut }, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            new TWEEN.Tween( refBar.scale )
            .to( { y: refBar.userData.scaleOut }, 300 )
            .easing( TWEEN.Easing.Quadratic.Out )
            .start();

            refGroup.userData.isOut = true;

        }

        // for (var i = refGroup.children.length - 1; i >= 0; i--) {
        //     if ( refGroup.children[i].name != 'bg' ) {
        //         refGroup.children[i].children[0].color = _colorTXalts;
        //     }
        // }

    } else if (object.userData.type == "refline") {

        const refGroup = object.parent.parent;

        for (var i = refGroup.children.length - 1; i >= 0; i--) {
            if ( refGroup.children[i].name != 'bg' && refGroup.children[i] != object.parent ) {
                // refGroup.children[i].children[0].color = _colorTXoffs;
                refGroup.children[i].children[0].fillOpacity = 0.5;
            } else if ( refGroup.children[i] == object.parent ) {
                // object.color = _colorTXalts;
                object.fillOpacity = 1;
            }
        }

        tryRefDim( refGroup );

    }
               
}


function tryPointerSelect(object) {
    consoleLog("Select: " + object.userData.type);
    if (object.userData.type == "citation") {
        popupMenu(object);
    // Catch for any objects that do not have their type set, but can trigger the event
    } else if (object.userData.type == undefined) {
        // console.log("No over event for this object");
    } else if (object.userData.type == "popup-find") {
        var target = object.userData.target;
        var tempTextResult = target.text.slice(1).split(']')[0];
        var tempSource = target.userData.source;
        var docGroup = target.parent.userData.docGroup;
        if (docGroup == undefined) {
            docGroup = target.userData.detachedParent;
        }
        console.log(docGroup);
        findCitation(tempSource, tempTextResult, target, docGroup);
        popupMenu(undefined);
        consoleLog("POPUP: Find " + tempTextResult, 0x555555);
    } else if (object.userData.type == "popup-close") {
        popupMenu(undefined);
        consoleLog("POPUP: Close", 0x555555);
    } else if (object.userData.type == "popup-detach" || object.userData.type == "popup-clone") {
        var thisfunction = object.userData.type.slice(6,99);

        var target = object.userData.target;

        var oldGroup = target.parent;

        const newPlaceholder = new THREE.Mesh( testGeo, testMat );
        oldGroup.attach( newPlaceholder );
        newPlaceholder.name = "placeholder";
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
        // newGroup.scale.set( 
        //     oldGroup.scale.x,
        //     oldGroup.scale.y,
        //     oldGroup.scale.z
        // );
        workspace.add(newGroup);

        const docGroup = oldGroup.userData.docGroup;
        if ( docGroup != undefined ) {
            docGroup.userData.references.push( newGroup );
        }

        if (thisfunction == "clone") {
            var newText = new Text();
            newText.text = target.text;
            newText.fontSize = target.fontSize;
            newText.userData.fontSize = target.fontSize;
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

            newText.scale.set( 
                target.scale.x,
                target.scale.y,
                target.scale.z
            );
                
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

            // Edit the preview text block
            const baseTxt = oldGroup.userData.previewText.text;
            var txtArray = baseTxt.split('\n');
            txtArray.splice(index,1);
            const newTxt = txtArray.join('\n');
            oldGroup.userData.previewText.text = newTxt;
        }

        var newArray = [];
        newArray.push(target);
        newGroup.userData.textBlock = newArray;
        snapDistanceOne.push(newGroup);
        popupMenu(undefined);

        if (thisfunction == "detach") {
            const missingPiece = target.userData.sequenceOrder;
            for (var i = oldGroup.userData.textBlock.length - 1; i >= 0; i--) {
                try {
                    // console.log(oldGroup.userData.textBlock[i].userData.sequenceOrder + " | " + missingPiece);
                    if (oldGroup.userData.textBlock[i].userData.sequenceOrder > missingPiece) {
                        var thisPiece = oldGroup.userData.textBlock[i];
                        // console.log(thisPiece);
                        var tempNewTween = new TWEEN.Tween( thisPiece.position )
                        .to( {x: thisPiece.position.x, y: thisPiece.position.y + 0.03, z: thisPiece.position.z }, 500 )
                        .easing( TWEEN.Easing.Quadratic.InOut )
                        .start()
                    }
                }
                catch {
                    console.log("ERROR");
                }
            }
            consoleLog("POPUP: Detach from location |" + (missingPiece + 1) + "|", 0x555555);
        } else if (thisfunction == "clone"){
            consoleLog("POPUP: Cloned", 0x555555);
        }
    } else if (object.userData.type == "popup-attach" || object.userData.type == "popup-return") {
        var thisfunction = object.userData.type.slice(6,99);

        var target = object.userData.target;
        var oldGroup = target.userData.detachedParent;
        var newGroup = target.parent;
        console.log(target);
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
            oldGroup.remove(target.userData.origin);
            target.userData.origin = null;

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

        const snapindex = snapDistanceOne.indexOf(newGroup);
        snapDistanceOne.splice(snapindex,1);
        newGroup.parent.remove(newGroup);
        popupMenu(undefined);

        if (thisfunction == "attach") {
            const missingPiece = target.userData.sequenceOrder;

            // Edit the preview text block
            const baseTxt = oldGroup.userData.previewText.text;
            var txtArray = baseTxt.split('\n');
            txtArray.splice(missingPiece,0,target.text);
            const newTxt = txtArray.join('\n');
            oldGroup.userData.previewText.text = newTxt;

            disablePreviews(oldGroup);

            for (var i = oldGroup.userData.textBlock.length - 1; i >= 0; i--) {
                try {
                    if (oldGroup.userData.textBlock[i].userData.sequenceOrder > missingPiece) {
                        var thisPiece = oldGroup.userData.textBlock[i];
                        var tempNewTween = new TWEEN.Tween( thisPiece.position )
                        .to( {x: thisPiece.position.x, y: thisPiece.position.y - 0.03, z: thisPiece.position.z }, 500 )
                        .easing( TWEEN.Easing.Quadratic.InOut )
                        .start()
                        .onComplete(() => {
                            oldGroup.remove(target.userData.origin);
                            target.userData.origin = null;

                            oldGroup.userData.textBlock.push(target);

                            tryResetPreviews();
                        });
                    }
                }
                catch {
                    console.log("ERROR");
                }
            }
            consoleLog("POPUP: Attach to location |" + (missingPiece + 1) + "|", 0x555555);
        } else if (thisfunction == "return") {
            consoleLog("POPUP: Returned", 0x555555);
        }
    } else if (object.userData.type == "handle") {
        tryResetPreviews();
        startSwipe(object);
        popupMenu(undefined);
    } else if (object.userData.type == "focusBG") {
        startSwipe(object); 
    } else if (object.userData.type == "reference") {
        popupMenu(object, "reference");
    } else if (object.userData.type == "popup-remove") {
        var target = object.userData.target;

        if (target.userData.lines != undefined) {
            const lines = target.userData.lines;
            for (var i = lines.length - 1; i >= 0; i--) {
                var line = lines[i];
                var index = animatedConnections.indexOf(line);
                animatedConnections.splice(index,1);
                workspace.remove(line);
            }
        }
        
        workspace.remove(target.parent);
        popupMenu(undefined);
        consoleLog("POPUP: Remove", 0x555555);
    } else if (object.userData.type == "popup-connections-show") {
        var target = object.userData.target;
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
    } else if (object.userData.type == "popup-connections-hide") {
        var target = object.userData.target;
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
    } else if (object.userData.type == "popup-mark") {
        var target = object.userData.target;
        popupMenu(target, "markup");
    } else if (object.userData.type == "popup-color") {
        var target = object.userData.target;
        var color = object.userData.color;
        target.outlineWidth = 0.01;
        target.userData.outlineWidth = target.outlineWidth;
        // target.outlineOpacity = 0.7;
        target.outlineColor = color;
        target.userData.outlineColor = target.outlineColor;
        // target.color = color;
        popupMenu(undefined);
    } else if (object.userData.type == "popup-unmark") {
        var target = object.userData.target;
        target.userData.hasMarkup = undefined;
        target.outlineWidth = 0;
        target.userData.outlineWidth = undefined;
        target.userData.outlineColor = undefined;
        popupMenu(undefined);
    } else if (object.userData.type == "librarydoc" && menuMode == 99) {
        var source = object.userData.source;
        const title = object.userData.title;
        const author = object.userData.author;
        // loadTextBlock(source);
        findDocumentContent(source,title,author);
        toggleLibrary('close');
        menuMode = 0;
    } else if (object.userData.type == "popup-focus") {
        var target = object.userData.target;
        focusThis(target.parent);
        popupMenu(undefined);
    } else if (object.userData.type == "popup-unfocus") {
        var target = object.userData.target;
        unfocusThis(target.parent);
        popupMenu(undefined);
    } else if (object.userData.type == "clipTop") {
        tryResetPreviews();
        startSwipe(object, "clipTop");
        popupMenu(undefined);
    } else if (object.userData.type == "clipBot") {
        tryResetPreviews();
        startSwipe(object, "clipBot");
        popupMenu(undefined);
    } else if (object.userData.type == "clipTopGrip") {
        tryResetPreviews();
        startSwipe(object, "clipTopGrip");
        popupMenu(undefined);
    } else if (object.userData.type == "clipBotGrip") {
        tryResetPreviews();
        startSwipe(object, "clipBotGrip");
        popupMenu(undefined);
    } else if (object.userData.type == "scrollNub") {
        tryResetPreviews();
        startSwipe(object, "scroll");
        popupMenu(undefined);
    } else if (object.userData.type == "scrollDown" || object.userData.type == "scrollUp") {
        const docGroup = object.parent;
        const totalHeight = docGroup.userData.totalHeight;
        const clippingStart = docGroup.userData.clippingStart;
        const clippingEnd = docGroup.userData.clippingEnd;

        var scrollValue = {scroll: docGroup.userData.scrollPercent};
        var scrollPercent;

        if (object.userData.type == "scrollDown") {
            scrollPercent = clamp(docGroup.userData.scrollPercent - (((clippingEnd.position.y - clippingStart.position.y) / totalHeight) / 2),0,1);
        } else if (object.userData.type == "scrollUp") {
            scrollPercent = clamp(docGroup.userData.scrollPercent + (((clippingEnd.position.y - clippingStart.position.y) / totalHeight) / 2),0,1);
        }

        docGroup.userData.scrollPercent = scrollPercent;

        const scrollTween = new TWEEN.Tween( scrollValue )
        .to( { scroll: scrollPercent }, 400 )
        .easing( TWEEN.Easing.Cubic.InOut )
        .start()
        .onUpdate(() => {
            consoleLog('Scrolling... ' + scrollValue.scroll);
            docGroup.userData.scrollPercent = scrollValue.scroll;
            scrollDocument(docGroup);
            reclipDocument(docGroup);
        });

        popupMenu(undefined);
    } else if (object.userData.type == "background") {
        const nearby = object.userData.nearby;
        for (var i = nearby.length - 1; i >= 0; i--) {
            nearby[i].getWorldPosition(tempWorldPos);
            toolSelectorDot.getWorldPosition(toolSelectorDotWorld);
            var howfar = toolSelectorDotWorld.distanceTo(tempWorldPos) / nearby[i].parent.scale.x;
            if (howfar <= closeEnough) {
                tryPointerSelect(nearby[i]);
                consoleLog(i);
                break;
            }
        }
        popupMenu(undefined);
    } else if (object.userData.type == "menubarTags") {
        consoleLog("Menubar: Tags");
        popupMenu(undefined);
    } else if (object.userData.type == "menubarRead") {
        // consoleLog("Menubar: Read");
        const docGroup = object.parent.parent.parent;
        // docGroup.userData.outlineGroup.visible = false;
        // docGroup.userData.outlineGroup.scale.set(0,0,0);
        docGroup.userData.txtGroup.visible = true;
        docGroup.userData.txtGroup.scale.set(1,1,1);
        popupMenu(undefined);
    } else if (object.userData.type == "menubarOutline") {
        // consoleLog("Menubar: Outline");
        const docGroup = object.parent.parent.parent;
        // docGroup.userData.outlineGroup.visible = true;
        // docGroup.userData.outlineGroup.scale.set(1,1,1);
        docGroup.userData.txtGroup.visible = false;
        docGroup.userData.txtGroup.scale.set(0,0,0);
        console.log(docGroup);

        // This shouldn't be necessary - remove once problem is fixed
        for (var i = docGroup.userData.outlineBlock.length - 1; i >= 0; i--) {
            console.log(docGroup.userData.outlineBlock[i].text);
            docGroup.userData.outlineBlock[i].sync();
        }

        popupMenu(undefined);
    } else if (object.userData.type == "menubarMap") {
        consoleLog("Menubar: Map");
        popupMenu(undefined);
    } else if (object.userData.type == "menubarRef") {
        consoleLog("Menubar: Ref");
        popupMenu(undefined);

        const docGroup = object.parent.parent.parent;

        if ( docGroup.userData.references == undefined ) {

            // first activation of references - generate them
            const src = docGroup.userData.src;
            docGroup.userData.references = [];
            loadTextBlock(src, docGroup, object);
            
        } else if ( docGroup.userData.references != undefined && docGroup.userData.referenceVisible != undefined
            && docGroup.userData.referenceVisible == false && docGroup.userData.references.length > 0 ) {

            // later activation of references - not visible - show them
            const references = docGroup.userData.references;
            for (var i = references.length - 1; i >= 0; i--) {
                references[i].position.y += 99;
                references[i].visible = true;
            }
            docGroup.userData.referenceVisible = true;

        } else if ( docGroup.userData.references != undefined && docGroup.userData.referenceVisible != undefined
            && docGroup.userData.referenceVisible == true && docGroup.userData.references.length > 0 ) {

            // later activation of references - currently visible - hide them
            const references = docGroup.userData.references;
            for (var i = references.length - 1; i >= 0; i--) {
                references[i].position.y -= 99;
                references[i].visible = false;
            }
            docGroup.userData.referenceVisible = false;

        }

    } else if (object.userData.type == "menubarFocus") {
        const docGroup = object.parent.parent.parent;
        if (docGroup.userData.isFocused != undefined) {
            // consoleLog("Menubar: Unfocus");
            unfocusThis(docGroup);
        } else {
            // consoleLog("Menubar: Focus");
            focusThis(docGroup);
        }
        popupMenu(undefined);
    } else if (object.userData.type == "menubarFold") {
        const docGroup = object.parent.parent.parent;
        
        const clippingStart = docGroup.userData.clippingStart;
        const clippingEnd = docGroup.userData.clippingEnd;
        const centerPoint = (clippingEnd.position.y - clippingStart.position.y)/2 + clippingStart.position.y;

        const outlineGroup = docGroup.userData.outlineGroup;
        const outlineBar = outlineGroup.userData.outlineBar;

        const referenceGroup = docGroup.userData.refGroup;
        var referenceBar;
        if ( referenceGroup != undefined ) {
            referenceBar = referenceGroup.userData.refBar;

            // tween the reference bar
            new TWEEN.Tween( referenceBar.scale )
                .to( {y: 0}, 400 )
                .easing( TWEEN.Easing.Back.In )
                .delay( 100 )
                .start();
        }

        // tween the outline bar
        new TWEEN.Tween( outlineBar.scale )
            .to( {y: 0}, 400 )
            .easing( TWEEN.Easing.Back.In )
            .delay( 100 )
            .start();

        // tween the images (if any)
        const images = docGroup.userData.genImages;
        if ( images != undefined ) {
            for (var i = images.length - 1; i >= 0; i--) {
                const image = images[i].userData.image;

                new TWEEN.Tween( image.scale )
                .to( {x: 0, y: 0}, 500 )
                .easing( TWEEN.Easing.Back.In )
                .start();

                try {

                    const lines = image.parent.userData.centerpoint.userData.lines;

                    if ( lines != undefined ) {
                        for (var j = lines.length - 1; j >= 0; j--) {
                            workspace.remove( lines[j] );
                        }
                    }

                } catch {}
            }
        }

        // tween the bottom clip bounds
        new TWEEN.Tween( clippingEnd.position )
            .to( {y: centerPoint}, 500 )
            .easing( TWEEN.Easing.Back.In )
            .start();

        // tween the top clip bounds
        new TWEEN.Tween( clippingStart.position )
            .to( {y: centerPoint}, 500 )
            .easing( TWEEN.Easing.Back.In )
            .start()
            .onUpdate(() => {
                scrollDocument(docGroup);
                reclipDocument(docGroup);
            })
            .onComplete(() => {
                try { 

                    removeSaved(docGroup);
                    docGroup.parent.remove(docGroup); 

                    if (!collapsing) {
                        const title = docGroup.userData.title;
                        for (var i = boxPreviews.length - 1; i >= 0; i--) {
                            if ( title == boxPreviews[i].userData.title ) {

                                const boxpreview = boxPreviews[i];
                                const height = boxpreview.userData.totalHeight;
                                const catalog = docGroup;

                                showBoxPreview( boxpreview, height, catalog, true, true );

                            }
                        } 
                    }
                } catch {};

                if (docGroup.userData.references != undefined) {
                    const allRefs = docGroup.userData.references;
                    for (var i = allRefs.length - 1; i >= 0; i--) {
                        var ref = allRefs[i];
                        var index = animatedConnections.indexOf(ref);
                        if ( index >= 0 ) {
                            animatedConnections.splice(index,1);
                        }
                        try {
                            ref.parent.remove(ref);
                        }
                        catch {
                            console.log("Reference removal failed at index " + i);
                        }
                    }
                }

            });

        popupMenu(undefined);
    } else if (object.userData.type.slice(0,11) == "docoutline-") {
        const docGroup = object.parent.parent;
        const textBlock = docGroup.userData.textBlock;
        const targetValue = object.userData.type.slice(11,13);
        const totalHeight = docGroup.userData.totalHeight
        var headers = [];
        var thisValue = 0;

        console.log(targetValue);

        // get all the texts but only check the headers (every other text after the first two)
        for (var i = 0; i <= textBlock.length - 1; i++) {
            if (i >= 2 && i % 2 == 0) {
                thisValue++;
                // from the headers, get the nth header where n is the number sliced off the end of 'docoutline-'
                if (thisValue == targetValue) {
                    // get the position of that nth header, calculate it against the total height to get scroll percent
                    const thisText = textBlock[i];
                    var scrollPercent;

                    if (i == 2) {
                        scrollPercent = 0;
                    } else {
                        const clippingStart = docGroup.userData.clippingStart.position.y;
                        const clippingEnd = docGroup.userData.clippingEnd.position.y;
                        const viewHeight = clippingEnd - clippingStart + 0.55;

                        scrollPercent = norm( thisText.position.y, textBlock[0].position.y - 0.1, -totalHeight - viewHeight + 0.1 );
                        scrollPercent = clamp(scrollPercent, 0, 1);
                    }

                    // scroll to that position before switching back to read view
                    docGroup.userData.scrollPercent = scrollPercent;
                    scrollDocument(docGroup);
                    reclipDocument(docGroup);

                    // docGroup.userData.outlineGroup.visible = false;
                    // docGroup.userData.outlineGroup.scale.set(0,0,0);
                    docGroup.userData.txtGroup.visible = true;
                    docGroup.userData.txtGroup.scale.set(1,1,1);

                    // briefly tween the header
                    const targetPos = thisText.position.y;
                    thisText.position.y = thisText.position.y + 0.05;

                    new TWEEN.Tween( thisText.position )
                        .to( {y: targetPos}, 1000 )
                        .easing( TWEEN.Easing.Elastic.Out )
                        .start()
                    ;
                    
                }

            }

        }

        popupMenu(undefined);
    } else if (object.userData.type == "closeBtn") {
        const docGroup = object.parent;
        const clippingStart = docGroup.userData.clippingStart;
        const clippingEnd = docGroup.userData.clippingEnd;
        const centerPoint = (clippingEnd.position.y - clippingStart.position.y)/2 + clippingStart.position.y;

        // tween the top clip bounds
        new TWEEN.Tween( clippingStart.position )
            .to( {y: centerPoint}, 1000 )
            .easing( TWEEN.Easing.Back.In )
            .start()
            .onUpdate(() => {
                scrollDocument(docGroup);
                reclipDocument(docGroup);
            })
            .onComplete(() => {
                docGroup.parent.remove(docGroup);
            });

        // tween the bottom clip bounds
        new TWEEN.Tween( clippingEnd.position )
            .to( {y: centerPoint}, 1000 )
            .easing( TWEEN.Easing.Back.In )
            .start();
    } else if (object.userData.type.slice(0,11) == "mapcontent-") {
        const group = object.parent;
        const targetValue = object.userData.type.slice(11,13);

        if ( selectedObjects.indexOf(object) == -1 ) {
            // console.log("-1");
            startSwipe(object);
        } else {
            // console.log("1");
            startSwipe(object.parent);
        }
    } else if (object.userData.type == "mapbg") {
        startMapSelector();
    } else if (object.userData.type == "menuBar") {
        tryResetPreviews();
        startSwipe(object.parent);
        popupMenu(undefined);
    } else if (object.userData.type == "triGrip") {
        const clippingEnd = object.parent.parent.userData.clippingEnd;
        startSwipe(clippingEnd, "clipBot");
        popupMenu(undefined);
    } else if (object.userData.type == "docbg") {
        const txtGroup = object.parent.userData.txtGroup;
        startSwipe(txtGroup,"docbg");
        popupMenu(undefined);
    } else if (object.userData.type.slice(0,8) == "boxMenu-") {
        var thisfunction = object.userData.type.slice(8,99);

        tryHideBoxMenu( false );

        if ( thisfunction == "background" ) {
            
            if ( object.userData.typealt != undefined && object.userData.typealt == "refpreview" ) {
                // This is the background of a reference box, and might support XAN lines
                
                if ( globalLIB.xanLines == true ) {
                    newXan( object.parent.parent );
                }

                startSwipe( object.parent );

            } else if ( object.parent.parent != boxMenu ) {
                startSwipe( object.parent );
            } else  if ( boxMenuHidden == undefined ) {
                startSwipe( object.parent );
            } else {
                startSwipe( object.parent.parent );
            }
        } else {

            for (var i = boxMenuItems.length - 1; i >= 0; i--) {
                boxMenuItems[i].userData.bold = undefined;
                boxMenuItems[i].font = _fontserif;
            }

            if ( thisfunction != activeBoxCatalog ) {
                // switch to the new catalog

                object.userData.bold = true;
                object.font = _fontserifbold;

                activeBoxCatalog = thisfunction;
                
                showBoxCatalog( thisfunction );
            } else {
                // no active catalog

                boxMenuDot.visible = false;
                activeBoxCatalog = undefined;

                showBoxCatalog( 'none' );
            }

        }
    popupMenu(undefined);
        
    } else if (object.userData.type == "catalogPaper") {
        startSwipe( object );
        popupMenu(undefined);
    } else if (object.userData.type.slice(0,11) == "boxpreview-") {
        const targetValue = object.userData.type.slice(11,99);

        if ( targetValue == "close" ) {


            const thisGroup = object.parent;

            new TWEEN.Tween( thisGroup.scale )
            .to( {y: 0}, 300 )
            .easing( TWEEN.Easing.Back.In )
            .start()
            .onComplete(() => {

                try {
                    removeSaved(thisGroup);
                    thisGroup.parent.remove(thisGroup);
                } catch {}

            });

            

        } else if ( targetValue == "focus" ) {

            var focsd = object.text;

            if (focsd == "FOCUS") {

                changeDistance(object.parent, snapDistanceFocusValue);
                object.parent.scale.set(0.3, 0.3, 0.4);
                object.parent.position.y = camera.position.y + 0.3;

                focusTransScale = new TWEEN.Tween( object.parent.scale )
                    .to( {x: 0.4, y: 0.4, z: 0.4}, 300 )
                    .easing( TWEEN.Easing.Quadratic.Out )
                    .start()
                ;

                const focusTxt = object.parent.userData.focusTxt;
                if (focusTxt != undefined) {
                    focusTxt.text = "UNFOCUS";
                    focusTxt.sync();
                }

            } else if (focsd == "UNFOCUS") {

                changeDistance(object.parent, snapDistanceMenuValue - 0.1);
                object.parent.scale.set(1.1, 1.1, 1.0);
                object.parent.position.y = camera.position.y + 0.3;

                focusTransScale = new TWEEN.Tween( object.parent.scale )
                    .to( {x: 1.0, y: 1.0, z: 1.0}, 300 )
                    .easing( TWEEN.Easing.Quadratic.Out )
                    .start()
                ;

                const focusTxt = object.parent.userData.focusTxt;
                if (focusTxt != undefined) {
                    focusTxt.text = "FOCUS";
                    focusTxt.sync();
                }

            }

        } else if ( targetValue == "expand" ) {

            const thisGroup = object.parent;

            if ( thisGroup.userData.type == "boxpreview" ) {

                const source = thisGroup.userData.source;
                const title = thisGroup.userData.title;
                const author = thisGroup.userData.author;
                findDocumentContent(source,title,author);

                new TWEEN.Tween( thisGroup.scale )
                .to( {y: 0}, 300 )
                .easing( TWEEN.Easing.Back.In )
                .start()
                .onComplete(() => {

                    try {
                        removeSaved(thisGroup);
                        thisGroup.parent.remove(thisGroup);
                    } catch {}

                });

            }

        }
        popupMenu(undefined);
    } else if ( object.userData.type == "refline" ) {

        startSwipe( object );
        popupMenu(undefined);

    } else if (object.userData.type.slice(0,12) == "boxcitation-") {
        const targetValue = object.userData.type.slice(12,99);

        if ( targetValue == "close" ) {

                const thisGroup = object.parent;

                new TWEEN.Tween( thisGroup.scale )
                .to( {y: 0}, 300 )
                .easing( TWEEN.Easing.Back.In )
                .start()
                .onComplete(() => {

                    try {
                        removeSaved(thisGroup);
                        thisGroup.parent.remove(thisGroup);
                        popupMenu(undefined);
                    } catch {}

                });


        } else if ( targetValue == "expand" ) {

            const thisGroup = object.parent;

            if ( thisGroup.userData.type == "boxpreview" ) {

                const source = thisGroup.userData.source;
                
                warnCitation( thisGroup, source );

            }
        }

    } else if ( object.userData.type == "warncitation-confirm") {


        const parentGroup = object.parent.userData.parent;
        const source = object.parent.userData.source;

        new TWEEN.Tween( parentGroup.scale )
            .to( {y: 0}, 300 )
            .easing( TWEEN.Easing.Back.In )
            .start()
            .onComplete(() => {

                try {
                    removeSaved(parentGroup);
                    scene.remove(parentGroup);
                    popupMenu(undefined);

                    // exit space and open source url in new tab
                    renderer.xr.getSession().end();
                    window.open( source, '_blank' );
                } catch {}

            });

    } else if ( object.userData.type == "image" ) {
            
        if ( globalLIB.xanLines == true && object.userData.persistent != true ) {
            // console.log( object.parent.userData.centerpoint );
            // console.log( object.parent.userData.docGroup.userData.centerpoint );
            // createLine( object.parent.userData.centerpoint, object.parent.userData.docGroup.userData.centerpoint, true );
            newXan( object.parent );
        }

        new TWEEN.Tween( object.scale )
            .to( { x: 1, y: 1 }, 300 )
            .easing( TWEEN.Easing.Circular.InOut )
            .start()
        ;

        new TWEEN.Tween( object.material )
            .to( { opacity: 1.0 }, 300 )
            .easing( TWEEN.Easing.Circular.InOut )
            .start()
        ;

        startSwipe( object );
    }
}

function tryQuickPointerSelect(object) {
    consoleLog("Quick Select: " + object.userData.type);
    if (object.userData.type == "mapcontent-title") {
        // const source = object.userData.source;
        // const title = object.userData.title;
        // const author = object.userData.author;
        // findDocumentContent(source,title,author);
    // Catch for any objects that do not have their type set, but can trigger the event
    } else if (object.userData.type == undefined) {
        // console.log("No over event for this object");
    } else if (object.userData.type == "catalogPaper") {
        // const boxpreview = object.userData.boxpreview;
        // const height = boxpreview.userData.totalHeight;
        // const catalog = object.parent.parent;
        // showBoxPreview( boxpreview, height, catalog );

        // const topLine = object.parent.parent.userData.topLine;
        // const botLine = object.parent.parent.userData.botLine;
        // const topPos = object.userData.topPos;
        // const botPos = object.userData.botPos;
        // const time = 300;

        // new TWEEN.Tween( topLine.position )
        //     .to( {y: topPos - 0.02}, time )
        //     .easing( TWEEN.Easing.Cubic.Out )
        //     .start();

        // new TWEEN.Tween( botLine.position )
        //     .to( {y: botPos}, time )
        //     .easing( TWEEN.Easing.Cubic.Out )
        //     .start();

    } else if ( object.userData.type == "boxMenu-background" ) {

        // const thisGroup = object.parent.parent;

        // if ( thisGroup.userData.type == "boxpreview" ) {

        //     const source = thisGroup.userData.source;
        //     const title = thisGroup.userData.title;
        //     const author = thisGroup.userData.author;
        //     findDocumentContent(source,title,author);

        //     new TWEEN.Tween( thisGroup.scale )
        //     .to( {y: 0}, 300 )
        //     .easing( TWEEN.Easing.Back.In )
        //     .start()
        //     .onComplete(() => {
        //         thisGroup.parent.remove(thisGroup);
        //     });

        // }

    } else if ( object.userData.type == "refline" ) {

        if ( object.userData.highlight == undefined ) {
            object.userData.highlight = 1;
        } else if ( object.userData.highlight == _colorHImark.length - 1 ) {
            object.userData.highlight = 0;
        } else {
            object.userData.highlight++;
        }

        object.outlineColor = _colorHImark[object.userData.highlight];
        // object.parent.parent.userData.highlight = object.userData.highlight;

        if ( object.userData.highlight == 0 ) {
            object.outlineWidth = 0;
        } else {
            object.outlineWidth = 0.01;
        }

    } else if ( object.userData.type == "image" ) {

        if ( object.userData.persistent != true ) {
            object.userData.persistent = true;
            new TWEEN.Tween( object.scale )
                .to( { x: 1, y: 1 }, 300 )
                .easing( TWEEN.Easing.Circular.InOut )
                .start()
            ;

            new TWEEN.Tween( object.material )
                .to( { opacity: 1.0 }, 300 )
                .easing( TWEEN.Easing.Circular.InOut )
                .start()
            ;

            newXan( object.parent );
        } else {
            object.userData.persistent = false;
            new TWEEN.Tween( object.scale )
                .to( { x: 0.2, y: 0.2 }, 300 )
                .easing( TWEEN.Easing.Circular.InOut )
                .start()
            ;

            new TWEEN.Tween( object.material )
                .to( { opacity: 0.4 }, 300 )
                .easing( TWEEN.Easing.Circular.InOut )
                .start()
            ;
        }
    }
}







var citationwarning;
var newPopup;
var tempWorldPos = new THREE.Vector3();
var tempWorldQuat = new THREE.Quaternion();

var popupMat = new THREE.MeshBasicMaterial({ 
    color: _colorBGpopu
});

var centerSource = new THREE.Vector3();

function popupMenu(target, variation = "citation") {



    if ( citationwarning != undefined ) {

        try {

            new TWEEN.Tween( citationwarning.scale )
                .to( {y: 0}, 300 )
                .easing( TWEEN.Easing.Back.In )
                .start()
                .onComplete(() => {
                    workspace.remove(citationwarning);
                    citationwarning = undefined;
                });

        } catch {}

    }







//     var popupItems = [];

//     if (newPopup != undefined) { newPopup.parent.remove(newPopup); newPopup = undefined; };
    
//     if (target != undefined) {

//         // popup background panel
//         const popupGeo = new THREE.PlaneGeometry(0.25, 0.4);
//         newPopup = new THREE.Mesh( popupGeo, popupMat );

//         // popup header text
//         const popupHead = new Text();
//         scene.add(popupHead);
//         popupHead.fontSize = 0.015;
//         popupHead.color = _colorTXpopu;
//         popupHead.anchorX = 'center';
//         if (target.text.length >= 30) {
//             popupHead.text = target.text.slice(0,28) + '...';
//         } else {
//             popupHead.text = target.text;
//         }
//         newPopup.attach(popupHead);
//         popupHead.position.y = 0.185;
//         popupItems.push(popupHead);

//         if (variation == "citation") {  //======================================================
//     // DETACH / REATTACH popup button
//             const popupDetach = new Text();
//             scene.add(popupDetach);
//             if (target.userData.detachedParent != undefined && !target.userData.isClone) {
//             // ATTACH
//                 popupDetach.text = "Reattach to Group";
//                 popupDetach.userData.type = "popup-attach";
//             } else if (target.userData.detachedParent == undefined) {
//             // DETACH
//                 popupDetach.text = "Detach from Group";
//                 popupDetach.userData.type = "popup-detach";
//             }
//             popupDetach.fontSize = 0.02;
//             popupDetach.userData.fontSize = 0.02;
//             popupDetach.color = _colorTXpopu;
//             popupDetach.anchorX = 'left';
//             popupDetach.anchorY = 'middle';
//             newPopup.attach(popupDetach);
//             popupDetach.position.x = -0.11;
//             popupDetach.position.y = 0.1;
//             popupDetach.layers.enable( 3 );
//             popupDetach.userData.target = target;
//             popupItems.push(popupDetach);

//     // CLONE / RETURN popup button
//             const popupClone = new Text();
//             scene.add(popupClone);
//             if (target.userData.detachedParent != undefined && target.userData.isClone) {
//             // RETURN
//                 popupClone.text = "Return to Group";
//                 popupClone.userData.type = "popup-return";
//             } else if (target.userData.detachedParent == undefined) {
//             // CLONE
//                 popupClone.text = "Clone from Group";
//                 popupClone.userData.type = "popup-clone";
//             }
//             popupClone.fontSize = 0.02;
//             popupClone.userData.fontSize = 0.02;
//             popupClone.color = _colorTXpopu;
//             popupClone.anchorX = 'left';
//             popupClone.anchorY = 'middle';
//             newPopup.attach(popupClone);
//             popupClone.position.x = -0.11;
//             popupClone.position.y = 0.05;
//             popupClone.layers.enable( 3 );
//             popupClone.userData.target = target;
//             popupItems.push(popupClone);

//     // FIND IN DOCUMENT popup button
//             const popupFind = new Text();
//             scene.add(popupFind);
//             popupFind.text = "Show in Document";
//             popupFind.fontSize = 0.02;
//             popupFind.userData.fontSize = 0.02;
//             popupFind.color = _colorTXpopu;
//             popupFind.anchorX = 'left';
//             popupFind.anchorY = 'middle';
//             newPopup.attach(popupFind);
//             popupFind.position.x = -0.11;
//             popupFind.position.y = 0.0;
//             popupFind.layers.enable( 3 );
//             popupFind.userData.type = "popup-find";
//             popupFind.userData.target = target;
//             popupItems.push(popupFind);

//     // MARK THIS TEXT popup button
//             const popupMark = new Text();
//             scene.add(popupMark);
//             if (target.userData.hasMarkup != undefined) {
//             // REMOVE COLOR
//             popupMark.text = "Unmark this Text";
//             popupMark.userData.type = "popup-unmark";
//             } else {
//             // ADD COLOR
//             popupMark.text = "Mark this Text";
//             popupMark.userData.type = "popup-mark";
//             }
//             popupMark.fontSize = 0.02;
//             popupMark.userData.fontSize = 0.02;
//             popupMark.color = _colorTXpopu;
//             popupMark.anchorX = 'left';
//             popupMark.anchorY = 'middle';
//             newPopup.attach(popupMark);
//             popupMark.position.x = -0.11;
//             popupMark.position.y = -0.05;
//             popupMark.layers.enable( 3 );
//             popupMark.userData.target = target;
//             popupItems.push(popupMark);

//     // FOCUS popup button
//             if ( target.userData.detachedParent == undefined ) {
//                 const popupFocus = new Text();
//                 scene.add(popupFocus);
//                 if (target.parent.userData.focusBG != undefined) {
//                 // UNFOCUS
//                 popupFocus.text = "Unfocus";
//                 popupFocus.userData.type = "popup-unfocus";
//                 } else {
//                 // FOCUS
//                 popupFocus.text = "Focus";
//                 popupFocus.userData.type = "popup-focus";
//                 }
//                 popupFocus.fontSize = 0.02;
//                 popupFocus.userData.fontSize = 0.02;
//                 popupFocus.color = _colorTXpopu;
//                 popupFocus.anchorX = 'left';
//                 popupFocus.anchorY = 'middle';
//                 newPopup.attach(popupFocus);
//                 popupFocus.position.x = -0.11;
//                 popupFocus.position.y = -0.10;
//                 popupFocus.layers.enable( 3 );
//                 popupFocus.userData.target = target;
//                 popupItems.push(popupFocus);
//             }

//         } else if (variation == "reference") { //======================================================
//     // REMOVE popup button
//             const popupRemove = new Text();
//             scene.add(popupRemove);
//             popupRemove.text = "Remove";
//             popupRemove.userData.type = "popup-remove";
//             popupRemove.fontSize = 0.02;
//             popupRemove.userData.fontSize = 0.02;
//             popupRemove.color = _colorTXpopu;
//             popupRemove.anchorX = 'left';
//             popupRemove.anchorY = 'middle';
//             newPopup.attach(popupRemove);
//             popupRemove.position.x = -0.11;
//             popupRemove.position.y = 0.1;
//             popupRemove.layers.enable( 3 );
//             popupRemove.userData.target = target;
//             popupItems.push(popupRemove);

//     // SHOW / HIDE CONNECTIONS popup button
//             const popupConnections = new Text();
//             scene.add(popupConnections);
//             if (target.userData.persistentLines != undefined) {
//             // HIDE
//                 popupConnections.text = "Hide Connections";
//                 popupConnections.userData.type = "popup-connections-hide";
//             } else {
//             // SHOW
//                 popupConnections.text = "Show Connections";
//                 popupConnections.userData.type = "popup-connections-show";
//             }
//             popupConnections.fontSize = 0.02;
//             popupConnections.userData.fontSize = 0.02;
//             popupConnections.color = _colorTXpopu;
//             popupConnections.anchorX = 'left';
//             popupConnections.anchorY = 'middle';
//             newPopup.attach(popupConnections);
//             popupConnections.position.x = -0.11;
//             popupConnections.position.y = 0.0;
//             popupConnections.layers.enable( 3 );
//             popupConnections.userData.target = target;
//             popupItems.push(popupConnections);

//         } else if (variation == "markup") { //======================================================

//     // COLOR / REMOVE HIGHLIGHTS popup buttons
//             for (var i = _colorHImark.length - 1; i >= 0; i--) {
//                 var popupColor = new Text();
//                 scene.add(popupColor);
//                 popupColor.text = "Highlight Text";
//                 popupColor.fontSize = 0.02;
//                 popupColor.userData.fontSize = 0.02;
//                 popupColor.anchorX = 'left';
//                 popupColor.anchorY = 'middle';
//                 newPopup.attach(popupColor);
//                 popupColor.position.x = -0.11;
//                 popupColor.layers.enable( 3 );
//                 popupColor.userData.target = target;
//                 popupColor.userData.color = _colorHImark[i];
//                 target.userData.hasMarkup = true;
//                 popupColor.userData.type = "popup-color";
//                 popupColor.color = _colorHImark[i];
//                 popupColor.position.y = 0.1 - (0.05 * i);

//                 popupItems.push(popupColor);
//             }
            
            

//         }

// // CLOSE popup button
//         const popupClose = new Text();
//         scene.add(popupClose);
//         popupClose.text = "Close";
//         popupClose.fontSize = 0.02;
//         popupClose.userData.fontSize = 0.02;
//         popupClose.color = _colorTXpopu;
//         popupClose.anchorX = 'left';
//         popupClose.anchorY = 'middle';
//         newPopup.attach(popupClose);
//         popupClose.position.x = -0.11;
//         popupClose.position.y = -0.173;
//         popupClose.layers.enable( 3 );
//         popupClose.userData.type = "popup-close";
//         popupItems.push(popupClose);

//         // display and position popup
//         toolSelectorDot.getWorldPosition(tempWorldPos);
//         newPopup.position.set( tempWorldPos.x, tempWorldPos.y, tempWorldPos.z );

//         centerSource.set( camera.position.x, tempWorldPos.y, camera.position.z );

//         var newRot = new THREE.Quaternion().setFromRotationMatrix(
//             new THREE.Matrix4().lookAt( centerSource, newPopup.position, _yforward ) 
//         );

//         newPopup.quaternion.copy( newRot );

//         // newPopup.rotation.set( target.parent.rotation.x, target.parent.rotation.y, target.parent.rotation.z );

//         for (var i = popupItems.length - 1; i >= 0; i--) {
//             popupItems[i].translateZ(0.001);
//             popupItems[i].sync();
//         }

//         newPopup.translateZ(0.1);
        
//         scene.add(newPopup);
//         newPopup.layers.enable( 3 );
//         // newPopup.userData.type = "popup-background";

//         popupHead.sync();

//         newPopup.scale.set( 0, 0, 0 );

//         var tempScale = camera.position.distanceTo(newPopup.position);

//         // tween the popup
//         new TWEEN.Tween( newPopup.scale )
//                 .to( {x: tempScale, y: tempScale, z: tempScale}, 300 )
//                 .easing( TWEEN.Easing.Quadratic.Out )
//                 .start()
//         ;
//     }
}


















const snapDistanceOne = [];
const snapDistanceFocus = [];
const snapDistanceMax = 10;
const snapDistanceMin = 0.5;
var snapDistanceOneValue = readerStartDistance;
var snapDistanceFocusValue = 2.00;
var snapDistanceMapValue = 4.00;
var snapDistanceMenuValue = snapDistanceMapValue - 0.01;

function loadTextBlock(url, docGroup = undefined, lineTarget = undefined) {

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
                displayHead = $(this).text();
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
            displayTextBlock( displayHead, displayText, url, docGroup, lineTarget )
        },
        error: function(xhr, status, error) {
            console.error('Error fetching HTML: ', error);
        }
    });
}

function findCitation(url, num, object, docGroup = undefined) {
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
                    displayCitation(result, object, docGroup);
                }
            });
        },
        error: function(xhr, status, error) {
            console.error('Error fetching HTML: ', error);
        }
    });
}

function findAbstract(url, object) {

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'html',
        success: function(data) {
            var $html = $(data);

            // Find the class 'abstract' and read the inner html
            var abstract = $html.find('.abstract');
            var result = abstract.text();
            console.log(result);
            object.userData.abstract = result;

        },
        error: function(xhr, status, error) {
            console.error('Error fetching HTML: ', error);
        }
    });

}

// findAbstract('../../_ref/htconference/2022/3511095.3531271.html');
// findAbstract('https://www.code.futuretextlab.info/_ref/htconference/2022/3511095.3531271.html');
// this fetch request fails even though it is on the same web server? Relative link works.


var animatedConnections = [];
// var lineArray = [];

function displayCitation(text, object, docGroup = undefined) {
    var temporaryCitation;
    var temporaryCitationGroup;
    consoleLog(text.slice(0,48) + "...", 0xdddddd);

    var distanceModifier = object.curveRadius;
    // console.log(distanceModifier);

    temporaryCitationGroup = new THREE.Group();
    temporaryCitation = new Text();
    temporaryCitation.text = text;
    // temporaryCitation.userData.text = text;
    // temporaryCitation.fontSize = 0.015;
    temporaryCitation.fontSize = 0.020;
    temporaryCitation.color = _colorTXalts;
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

    console.log(docGroup);
    if ( docGroup != undefined && docGroup.userData.docGroup == undefined) {
        docGroup.userData.references.push( temporaryCitationGroup );
    } else if ( docGroup.userData.docGroup != undefined ) {
        docGroup.userData.docGroup.userData.references.push( temporaryCitationGroup );
    }

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

    // Pass to check and wait for sync to complete
    temporaryCitation.userData.sync = 'createHandle';
    syncCheck.push(temporaryCitation);
    
    // Citation line
    const newLine = createLine(object, temporaryCitation);
    docGroup.userData.references.push( newLine );

}


function createLine(object, target, persistent = false) {
    const lineGeo = new THREE.BoxGeometry( 0.001, 0.001, 1 );
    const lineMat = new THREE.MeshBasicMaterial( { color: _colorBGread } );
    var temporaryCitationLine = new THREE.Mesh( lineGeo, lineMat );

    workspace.add(temporaryCitationLine);
    // lineArray.push(temporaryCitationLine);
    // workspace.userData.lineArray = lineArray;

    temporaryCitationLine.userData.startObj = object.uuid;
    temporaryCitationLine.userData.endObj = target.uuid;
    temporaryCitationLine.userData.startObjRef = object;
    temporaryCitationLine.userData.endObjRef = target;
    temporaryCitationLine.name = "line";

    if (object.userData.lines != undefined) {
        object.userData.lines.push( temporaryCitationLine );
    } else {
        var newArray = [];
        newArray.push( temporaryCitationLine );
        object.userData.lines = newArray;
    }

    if (target.userData.lines != undefined) {
        target.userData.lines.push( temporaryCitationLine );
    } else {
        var newArray = [];
        newArray.push( temporaryCitationLine );
        target.userData.lines = newArray;
    }

    if (!persistent) {
        temporaryCitationLine.visible = false;
    } else {
        temporaryCitationLine.userData.persistent = true;
        temporaryCitationLine.visible = true;
    }

    animatedConnections.push(temporaryCitationLine);

    return temporaryCitationLine;
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
                    consoleLog("start object found from uuid: " + thisLine.userData.startObjRef);
                }
            }
            if (thisLine.userData.endObjRef == undefined) {
                var newend = workspace.getObjectByProperty('uuid', thisLine.userData.endObj);
                if (newend != undefined) {
                    thisLine.userData.endObjRef = newend;
                    consoleLog("end object found from uuid: " + thisLine.userData.endObjRef);
                }
            }

            // if (thisLine.userData.startObjRef != undefined && thisLine.userData.endObjRef != undefined) {

                var startObj, endObj;

                if (thisLine.userData.startObjRef != undefined) {
                    startObj = thisLine.userData.startObjRef;
                } else {
                    startObj = camera;
                }

                if (thisLine.userData.endObjRef != undefined) {
                    endObj = thisLine.userData.endObjRef;
                } else {
                    endObj = camera;
                }

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

            // }

        }

    }

}

var tempSize = new THREE.Vector3();
let totalPreInstance = 0;
let totalPostInstance = 0;

function displayTextBlock(head, text, source, docGroup = undefined, lineTarget = undefined) {
    // Create:
    const textBlock = [];
    const headText = new Text();
    const textGroup = new THREE.Group();

    if (docGroup != undefined) {
        docGroup.userData.references.push( textGroup );
        docGroup.userData.referenceVisible = true;

        const newLine = createLine(lineTarget, headText, true);

        docGroup.userData.references.push( newLine );
        textGroup.userData.docGroup = docGroup;
    }

    textGroup.add(headText)
    workspace.add(textGroup);

    let textOffset = -0.03;
    let totalTextOffset = textOffset;

    totalPreInstance = 0;
    totalPostInstance = 0;

    // Generate the large block of text as a single Troika element
    let tempTextString = text[0];
    for (var i = 1; i <= text.length - 1; i++) {
        tempTextString = tempTextString.concat('\n', text[i]);
    }
    let tempTextBlock = new Text();
    textGroup.add(tempTextBlock);
    tempTextBlock.layers.enable( 3 );
    tempTextBlock.userData.layers = 3;
    tempTextBlock.userData.type = "preview";

    let specialReaderOffset = Math.random(0.001, -0.001);

    if (docGroup != undefined && docGroup.userData.specialReaderOffset != undefined) {
        specialReaderOffset = docGroup.userData.specialReaderOffset + 0.01;
    }

    tempTextBlock.position.set( 0, 0.0, -snapDistanceOneValue - specialReaderOffset );

    tempTextBlock.text = tempTextString;
    tempTextBlock.fontSize = 0.02;
    tempTextBlock.color = _colorTXalts;
    tempTextBlock.anchorX = 'left';
    tempTextBlock.anchorY = 'top';
    tempTextBlock.lineHeight = 1.5;
    tempTextBlock.curveRadius = snapDistanceOneValue + specialReaderOffset;

    tempTextBlock.userData.text = tempTextBlock.text;
    tempTextBlock.userData.fontSize = tempTextBlock.fontSize;
    tempTextBlock.userData.color = tempTextBlock.color;
    tempTextBlock.userData.anchorX = tempTextBlock.anchorX;
    tempTextBlock.userData.anchorY = tempTextBlock.anchorY;
    tempTextBlock.userData.curveRadius = tempTextBlock.curveRadius;
    tempTextBlock.userData.lineHeight = tempTextBlock.lineHeight;

    tempTextBlock.position.y = totalTextOffset;

    tempTextBlock.sync();


    // Generate each text line as individual Troika elements
    for (var i = 0; i <= text.length - 1; i++) {
        let tempText = new Text();
        textGroup.add(tempText);
        tempText.layers.enable( 3 );
        tempText.userData.layers = 3;

        tempText.position.set( 0, 0.0, - snapDistanceOneValue - specialReaderOffset );

        tempText.text = text[i];
        tempText.fontSize = 0.02;
        tempText.color = _colorTXalts;
        tempText.anchorX = 'left';
        tempText.anchorY = 'top';
        tempText.curveRadius = snapDistanceOneValue + specialReaderOffset;

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

        // Pass to check and wait for sync to complete
        tempText.userData.sync = 'textBlockBuilder';
        syncCheck.push(tempText);

    }

    headText.text = head;
    headText.fontSize = 0.03;
    headText.color = _colorTXalts;
    headText.anchorX = 'left';
    headText.anchorY = 'bottom';
    headText.curveRadius = snapDistanceOneValue + specialReaderOffset;
    headText.position.set( 0, 0.0, - snapDistanceOneValue - specialReaderOffset );

    headText.userData.text = headText.text;
    headText.userData.fontSize = headText.fontSize;
    headText.userData.color = headText.color;
    headText.userData.anchorX = headText.anchorX;
    headText.userData.anchorY = headText.anchorY;
    headText.userData.curveRadius = headText.curveRadius;
    headText.name = "header";

    headText.sync();
    textGroup.userData.header = headText;
    textGroup.userData.previewText = tempTextBlock;
    textGroup.userData.textBlock = textBlock;
    textGroup.userData.specialReaderOffset = specialReaderOffset;
    snapDistanceOne.push(textGroup);


    if ( docGroup == undefined ) {
        textGroup.rotation.y = camera.rotation.y;
    } else {
        textGroup.rotation.y = docGroup.rotation.y;
        textGroup.position.y = docGroup.position.y;
        textGroup.scale.y = 0;

        // new TWEEN.Tween( textGroup.rotation )
        //     .to( {y: textGroup.rotation.y - ( 2.0 / (snapDistanceOneValue + specialReaderOffset) ) }, 700 )
        //     .easing( TWEEN.Easing.Cubic.Out )
        //     .start();

        new TWEEN.Tween( textGroup.scale )
            .to( { y: 1 }, 700 )
            .easing( TWEEN.Easing.Cubic.Out )
            .start();

        const docBot = docGroup.userData.clippingEnd.getWorldPosition( tempWorldPos );

        // new TWEEN.Tween( textGroup.position )
        //     .to( {y: tempWorldPos.y - 0.15 }, 700 )
        //     .easing( TWEEN.Easing.Cubic.Out )
        //     .start();

        textGroup.position.y = tempWorldPos.y - 0.15;

    }
    

}







var destinationClippingStart = 0.5;
var destinationClippingEnd = -1.5;
var documentMargin = 0.1;
var documentMaxWidth = 1.25;
var startingScrollPercent = 0.0;


function findDocumentContent(url,title=" ",author=" ",restoration=undefined) {
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'html',
        success: function(data) {
            var $html = $(data);
            generateDocumentContent($html,title,author,url,restoration);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching HTML: ', error);
        }
    });
}



var allHeaders = [];
function generateDocumentContent(content,title,author,url,restoration=undefined) {
    allHeaders = [];
    var fullText = [];
    // var title = content.find('.title').first().text();
    // var authors = content.find('.authorGroup').first().text().replace(/( )+/g, ' ');
    var body = content.find('.body').first();
    var imgs = content.find('img');
    var baseText = body.text();

    var headers = body.find('header');
    headers.each(function() {
        allHeaders.push($(this).text());
    });

    for (var i = 0; i <= allHeaders.length - 1; i++) {
        var result = baseText.split(allHeaders[i]);
        fullText.push(result[0]);
        fullText.push(allHeaders[i]);
        baseText = result[1];
    }
    fullText.push(baseText);
    fullText.splice(0,1,author);
    fullText.splice(0,0,title);
    // console.log(fullText);

    let docGroup = new THREE.Group();
    let txtGroup = new THREE.Group();
    txtGroup.userData.type = "txtgroup";
    docGroup.userData.textBlock = [];
    docGroup.userData.txtGroup = txtGroup;
    docGroup.userData.type = "document";
    scene.add(docGroup);
    docGroup.add(txtGroup);

    docGroup.userData.src = url;
    docGroup.userData.title = title;

    let specialReaderOffset = Math.random(0.001, -0.001);
    docGroup.userData.specialReaderOffset = specialReaderOffset;

    const centerPoint = (destinationClippingEnd - destinationClippingStart)/2 + destinationClippingStart;

    if ( restoration == undefined ) {
        addLoader(docGroup, [documentMaxWidth/2, centerPoint, - snapDistanceOneValue - specialReaderOffset]);
    } else {
        addLoader(docGroup, [documentMaxWidth/2, centerPoint, - snapDistanceOneValue - specialReaderOffset], restoration.yRot );
    }

    for (var i = 0; i <= imgs.length - 1; i++) {

        let currentURL = window.location.href;
        let params = new URLSearchParams( location.search );
        let src = params.get( 'src' );
        let baseURL;

        if ( src != null ) {
            baseURL = currentURL.slice( 0, -src.length - 5 );
        } else {
            baseURL = currentURL;
        }

        let rootURL = url;
        let root = rootURL.slice( 0, rootURL.lastIndexOf("/") );

        let newURL;

        if ( root.slice( 0, 2 ) == "./" ) {
            newURL = baseURL + root.slice( 2 ) + "/" + imgs[i].src.slice( baseURL.length );
        } else {
            newURL = root + "/" + imgs[i].src.slice( baseURL.length );
        }

        if ( docGroup.userData.images == undefined ) {
            docGroup.userData.images = [];
            docGroup.userData.genImages = [];
        }

        var thisJSON = {};
        thisJSON.index = i;
        thisJSON.src = newURL;

        docGroup.userData.images.push( thisJSON );

        // console.log( docGroup.userData.images );
    }

    generateDocumentContentStep(docGroup, fullText, 0, undefined, restoration);

}



function generateDocumentContentStep(docGroup, fullText, i, lastText = undefined, restoration = undefined) {

    // console.log( fullText );

    const tempBox = new THREE.Box3().setFromObject(docGroup);
    tempBox.getSize(tempSize);
    var docTotalHeight = tempSize.y;
    docGroup.userData.totalHeight = docTotalHeight;

    // set the bounds for clipRect of the previous text
    if (lastText != undefined) {
        lastText.userData.bounds = [lastText.position.y, -docTotalHeight];
    }

    let specialReaderOffset = docGroup.userData.specialReaderOffset;
    let zdistance = snapDistanceOneValue + specialReaderOffset;
    const txtGroup = docGroup.userData.txtGroup;

    if ( restoration != undefined ) {
        zdistance = restoration.dist;
        docGroup.userData.specialReaderOffset = restoration.dist - snapDistanceOneValue;
    }

    if (fullText[i] != undefined) {

        let newText = new Text();
        txtGroup.add(newText);
        
        // newText.position.set( 0, 0.0, -snapDistanceOneValue - specialReaderOffset );
        newText.position.set(0, -docTotalHeight, 0);

        newText.text = fullText[i];

        if ( typeof fullText[i] == "string" && fullText[i].trim() == "null" ) {
            newText.text = " ";
        }

        newText.color = _colorTXmain;
        newText.anchorX = 'left';
        newText.anchorY = 'top';
        newText.maxWidth = documentMaxWidth;
        newText.textAlign = 'justify';
        newText.curveRadius = zdistance;
        newText.position.z = - zdistance;

        newText.userData.specialReaderOffset = docGroup.userData.specialReaderOffset;
        newText.userData.type = 'doccontent';
        newText.userData.text = newText.text;
        newText.userData.color = newText.color;
        newText.userData.anchorX = newText.anchorX;
        newText.userData.anchorY = newText.anchorY;
        newText.userData.maxWidth = newText.maxWidth;
        newText.userData.textAlign = newText.textAlign;
        newText.userData.curveRadius = newText.curveRadius;

        docGroup.userData.textBlock.push(newText);


        // find any citation in the text
        // console.log( i );
        var re = /\[\d/g;
        let match;
        
        var starts = [];
        var ends = [];

        var allTheseRefs = [];

        while ((match = re.exec( fullText[i] )) !== null) {
            var temp = fullText[i].slice( match.index );
            var breakpoint = temp.search( ']' );
            temp = temp.slice( 1, breakpoint );

            var commacheck = (temp.match(/,/g) || []).length;

            if ( commacheck == 0 ) {
                allTheseRefs.push( temp )
            } else {

                for (var j = commacheck; j >= 0; j--) {

                    if ( j > 0 ) {
                        var commabreak = temp.search( ',' );
                        var newtemp = temp.slice( 0, commabreak );
                        allTheseRefs.push( newtemp );
                        temp = temp.slice( commabreak + 2 );
                    } else {
                        allTheseRefs.push( temp );
                    }

                }

            }

        }

        // // check for any spaces (unnecessary?)
        // for (var j = allTheseRefs.length - 1; j >= 0; j--) {
        //     var space = allTheseRefs[j].search( ' ' );
        //     console.log(space);
        // }

        newText.userData.citations = allTheseRefs;

        // newText.outlineWidth = 1;
        // newText.outlineColor = 0xffffff * Math.random();

        if (i == 0 ) {
            newText.text = "\n".concat(newText.text);
            newText.fontSize = 0.05;
            newText.fontWeight = 'bold';
            newText.fontWeight = newText.fontWeight;
        } else if (i == 1 ) {
            newText.fontSize = 0.03;
        } else if (i % 2 > 0) {
            newText.fontSize = 0.025;

            var str = fullText[i];
            var whitespaceCheck = str.replace(/\s/g, '').length;
            // as long as this isn't a whitespace break, set the font
            if ( whitespaceCheck > 0 ) {
                newText.font = _fontserif;
            }


        } else {
            newText.fontSize = 0.035;
        }
        newText.userData.fontSize = newText.fontSize;

        let iteration = i + 1;

        if (iteration <= fullText.length) {
            // console.log(newText);
            newText.userData.sync = 'generateDocumentContent';
            newText.userData.syncDocGroup = docGroup;
            newText.userData.syncFullText = fullText;
            newText.userData.syncIteration = iteration;
            newText.userData.syncRestoration = restoration;
            syncCheck.push(newText);
        }

        newText.sync();
    } else {
        // We have generated the last text

        // Add top/bottom border lines for visualization
        const borderGeo = new THREE.CylinderGeometry(
            (zdistance),
            (zdistance),
            0.01, 32, 1, true, 0,
            (documentMaxWidth + documentMargin*2) / (zdistance)
            );

        const menubarGeo = new THREE.CylinderGeometry(
            (zdistance),
            (zdistance),
            0.08, 32, 1, true, 0,
            (documentMaxWidth + documentMargin*2) / (zdistance)
            );

        // const borderBox = new THREE.CylinderGeometry(
        //     (snapDistanceOneValue + docGroup.userData.specialReaderOffset),
        //     (snapDistanceOneValue + docGroup.userData.specialReaderOffset),
        //     0.03, 32, 1, true, (documentMaxWidth + 0.1) / (snapDistanceOneValue + docGroup.userData.specialReaderOffset)/4,
        //     (documentMaxWidth + 0.1) / (snapDistanceOneValue + docGroup.userData.specialReaderOffset)/2
        //     );
        const topBorder = new THREE.Mesh( borderGeo, invisMat );
        docGroup.add(topBorder);
        topBorder.scale.set(1,1,-1);
        topBorder.position.y = destinationClippingStart;
        // topBorder.layers.enable( 3 );
        // topBorder.userData.layers = 3;
        // topBorder.userData.type = "clipTop";
        const botBorder = new THREE.Mesh( borderGeo, invisMat );
        docGroup.add(botBorder);
        botBorder.scale.set(1,1,-1);
        botBorder.position.y = destinationClippingEnd;
        // botBorder.layers.enable( 3 );
        // botBorder.userData.layers = 3;
        // botBorder.userData.type = "clipBot";


        // Create the document menu bar
        const menuBar = new THREE.Mesh( menubarGeo, boundingMat );
        botBorder.add(menuBar);
        menuBar.position.y = - 0.04;
        menuBar.layers.enable( 3 );
        menuBar.rotation.y = - documentMargin / (zdistance);
        menuBar.userData.layers = 3;
        menuBar.userData.type = "menuBar";

        // Tags             Read / Outline / Map             Focus
        // change menubar "Read | Outline | References"

        // let iText = newMenuBarText( 'i', 0.02, menuBar, 'menubarTags', docGroup );
        // iText.layers.enable( 3 );
        // iText.userData.layers = 3;

        // let readText = newMenuBarText( 'Body', ( documentMaxWidth + documentMargin*2 )/2 - 0.03, menuBar, 'menubarRead', docGroup, 'right' );
        // readText.layers.enable( 3 );
        // readText.userData.layers = 3;
        // let leftDividerText = newMenuBarText( '|', (documentMaxWidth + 0.09)/2 - 0.08, menuBar, undefined, docGroup, 'left' );
        // let outlineText = newMenuBarText( 'Outline', (documentMaxWidth + 0.09)/2, menuBar, 'menubarOutline', docGroup, 'center' );
        // outlineText.layers.enable( 3 );
        // outlineText.userData.layers = 3;
        // let rightDividerText = newMenuBarText( '|', ( documentMaxWidth + documentMargin*2 )/2 + 0.00, menuBar, undefined, docGroup, 'center' );
        // let refText = newMenuBarText( 'REFERENCES', ( documentMaxWidth + documentMargin*2 )/2 + 0.00, menuBar, 'menubarRef', docGroup, 'center' );
        // refText.layers.enable( 3 );
        // refText.userData.layers = 3;

        let focusText = newMenuBarText( '  -     #', 0.02, menuBar, 'menubarFold', docGroup );
        focusText.clipRect = [0, -0.1, 0.05, 0.1];
        focusText.layers.enable( 3 );
        focusText.userData.layers = 3;
        toCollapse.push(focusText);
        // docGroup.userData.menubarFocus = focusText;

        // Add grip handles for the top and bottom
        // const topBox = new THREE.Mesh( borderBox, invisMat );
        // topBorder.add(topBox);
        // topBox.position.y = 0.015;
        // topBox.layers.enable( 3 );
        // topBox.userData.type = "clipTopGrip";
        // const botBox = new THREE.Mesh( borderBox, invisMat );
        // botBorder.add(botBox);
        // botBox.position.y = - 0.08 - 0.015;
        // botBox.layers.enable( 3 );
        // botBox.userData.layers = 3;
        // botBox.userData.type = "clipBotGrip";

        docGroup.userData.clippingStart = topBorder;
        docGroup.userData.clippingEnd = botBorder;
        docGroup.userData.menuBar = menuBar;

        // Create corner resize handle
        const triGripShape = new THREE.Shape();
        triGripShape.moveTo(0,0);
        triGripShape.lineTo(0.08,0.08);
        triGripShape.lineTo(0.08,0);
        const extrudeSettings = {
            depth: 0.001,
            bevelEnabled: false
        };
        const triGripGeo = new THREE.ExtrudeGeometry( triGripShape, extrudeSettings );
        const triGrip = new THREE.Mesh( triGripGeo, triGripMat );
        botBorder.add(triGrip);
        triGrip.rotation.y = (documentMaxWidth + 0.02) / (zdistance);
        triGrip.position.y = -0.08;
        triGrip.translateZ( (zdistance - 0.01) *1 );
        triGrip.layers.enable( 3 );
        triGrip.userData.layers = 3;
        triGrip.userData.type = "triGrip";
        

        // Create a scrollbar
        const scrollCir = new THREE.BoxGeometry(0.03,0.03,0.001);
        const scrollNub = new THREE.Mesh( scrollCir, scrollMat );
        const scrollBox = new THREE.BoxGeometry(0.005,1,0.005);
        const scrollBar = new THREE.Mesh( scrollBox, invisMat );

        const clippingStart = docGroup.userData.clippingStart.position.y;
        const clippingEnd = docGroup.userData.clippingEnd.position.y;

        docGroup.add(scrollBar);
        docGroup.add(scrollNub);
        docGroup.userData.scrollNub = scrollNub;
        docGroup.userData.scrollBar = scrollBar;
        scrollNub.layers.enable( 3 );
        scrollNub.userData.layers = 3;
        scrollNub.userData.type = "scrollNub";
        scrollBar.userData.type = "scrollBar";
        docGroup.userData.scrollPercent = startingScrollPercent;
       
        // scrollNub.rotation.y = (documentMaxWidth + 0.1 ) / -(zdistance);
        scrollNub.rotation.y = (- 0.1 ) / -(zdistance);
        scrollNub.position.y = (clippingEnd - clippingStart)/2 + clippingStart;
        scrollNub.translateZ( (zdistance) *-1 );

        // scrollBar.rotation.y = (documentMaxWidth + 0.1) / -(zdistance);
        scrollBar.rotation.y = (- 0.1) / -(zdistance);
        scrollBar.position.y = (clippingEnd - clippingStart)/2 + clippingStart;
        scrollBar.translateZ( (zdistance) *-1 );

        scrollNub.rotateZ( Math.PI/4 );

        // Create scroll buttons
        const scrollBtnGeo = new THREE.CircleGeometry( 0.03, 3 );
        const scrollUp = new THREE.Mesh( scrollBtnGeo, invisMat );
        const scrollDown = new THREE.Mesh( scrollBtnGeo, invisMat );
        docGroup.add(scrollUp);
        docGroup.add(scrollDown);

        scrollUp.rotation.y = (documentMaxWidth + 0.05) / -(zdistance);
        scrollUp.position.y = clippingStart - 0.07;
        scrollUp.rotation.z = Math.PI/2;
        scrollUp.translateZ( (zdistance) *-1 );
        docGroup.userData.scrollUp = scrollUp;
        scrollUp.layers.enable( 3 );
        scrollUp.userData.layers = 3;
        scrollUp.userData.type = "scrollUp";

        scrollDown.rotation.y = (documentMaxWidth + 0.05) / -(zdistance);
        scrollDown.position.y = clippingEnd + 0.07;
        scrollDown.rotation.z = -Math.PI/2;
        scrollDown.translateZ( (zdistance) *-1 );
        docGroup.userData.scrollDown = scrollDown;
        scrollDown.layers.enable( 3 );
        scrollDown.userData.layers = 3;
        scrollDown.userData.type = "scrollDown";

        // Create background
        const backgroundGeo = new THREE.CylinderGeometry(
            (zdistance + 0.001),
            (zdistance + 0.001),
            1, 32, 1, true, 0,
            (documentMaxWidth + documentMargin*2) / (zdistance)
            );

        const background = new THREE.Mesh( backgroundGeo, docBGmat );
        docGroup.add(background);
        background.scale.set(1,clippingEnd - clippingStart,-1);
        background.position.y = destinationClippingStart + (clippingEnd - clippingStart)/2;
        background.layers.enable( 3 );
        background.userData.layers = 3;
        background.rotation.y = documentMargin / (zdistance);
        docGroup.userData.background = background;
        background.userData.type = "docbg";
        background.userData.nearby = [scrollUp, scrollDown, scrollNub];


        // Create close button
        // var closeBtnMat = new THREE.MeshBasicMaterial( {
        //     color: _colorBounds,
        //     map: new THREE.TextureLoader().load(
        //         './icon-close.png'
        //     ),
        //     transparent: true
        // } );

        // const closeBtnGeo = new THREE.CircleGeometry( 0.06, 16 );
        // const closeBtnShell = new THREE.Mesh( closeBtnGeo, invisMat );
        // const closeBtn = new THREE.Mesh( closeBtnGeo, closeBtnMat );
        // closeBtnShell.add(closeBtn);
        // docGroup.add(closeBtnShell);

        // closeBtn.scale.set(0.25,0.25,0.25);

        // closeBtnShell.rotation.y = (documentMaxWidth + 0.15) / -(snapDistanceOneValue + docGroup.userData.specialReaderOffset);
        // closeBtnShell.position.y = clippingStart + 0.075;
        // closeBtnShell.rotation.z = Math.PI/2;
        // closeBtnShell.translateZ( (snapDistanceOneValue + docGroup.userData.specialReaderOffset) *-1 );
        // docGroup.userData.closeBtn = closeBtnShell;
        // closeBtnShell.layers.enable( 3 );
        // closeBtnShell.userData.layers = 3;
        // closeBtnShell.userData.type = "closeBtn";


        // Create the outline view from headers
        let outlineGroup = new THREE.Group();
        outlineGroup.userData.type = "outlinegroup";
        docGroup.userData.outlineGroup = outlineGroup;
        docGroup.userData.outlineBlock = [];
        docGroup.add(outlineGroup);
        let totalHeight = 0.020;

        var savedTitle = "";
        var singleHeader = false;

        for (var i = 0; i <= allHeaders.length - 1; i++) {

            let newText = new Text();
            outlineGroup.add(newText);
            
            newText.position.set(0, -totalHeight, 0);

            totalHeight += 0.05;

            if (i == 0 && !singleHeader) {
                var titleText = fullText[0];
                if (titleText.length > 40) {
                    newText.text = titleText.slice(0,37) + '...';
                } else {
                    newText.text = fullText[0];
                }

                savedTitle = newText.text;

                newText.fontSize = 0.035;
                newText.fontWeight = 'bold';
                newText.fontWeight = newText.fontWeight;
                newText.userData.type = 'docoutline-0';
            } else if ( i > 0 || singleHeader ){                
                var headerText;

                if ( !singleHeader ) {
                    headerText = allHeaders[i-1].replace(/[\n\r]/g, "").trimEnd();
                } else {
                    headerText = savedTitle;
                }

                if ( headerText.trim() == "null" ) {
                    headerText = savedTitle;
                }

                if (headerText.length > 70) {
                    newText.text = headerText.slice(0,67) + '...';
                } else {
                    newText.text = headerText;
                }
                newText.fontSize = 0.020;
                newText.layers.enable( 3 );
                newText.userData.layers = 3;

                if ( i <= 0 ) {
                    newText.userData.type = 'docoutline-' + 1;
                } else {
                    newText.userData.type = 'docoutline-' + i;
                }
            }

            newText.color = _colorTXalts;
            newText.anchorX = 'right';
            newText.anchorY = 'middle';
            
            // newText.maxWidth = 1.00;
            newText.textAlign = 'right';
            newText.curveRadius = zdistance;
            newText.position.z = -(zdistance) - 0.001;

            newText.userData.specialReaderOffset = specialReaderOffset;
            newText.userData.text = newText.text;
            newText.userData.color = newText.color;
            newText.userData.anchorX = newText.anchorX;
            newText.userData.anchorY = newText.anchorY;
            newText.userData.fontSize = newText.fontSize;
            // newText.userData.maxWidth = newText.maxWidth;
            newText.userData.textAlign = newText.textAlign;
            newText.userData.curveRadius = newText.curveRadius;

            // newText.userData.bounds = [newText.position.y - 0.0, newText.position.y - 0.04];

            docGroup.userData.outlineBlock.push( newText );

            newText.sync();

            // newText.outlineColor = 0xffffff * Math.random();
            // newText.outlineWidth = 1.5;

            if ( allHeaders.length == 1 && !singleHeader ) {
                singleHeader = true;
                i = -1;
                continue;
            }
            
        }

        const outlineBlock = docGroup.userData.outlineBlock;
        for (var i = outlineBlock.length - 1; i >= 0; i--) {
            outlineBlock[i].translateY( totalHeight/2 );
        }

        // outlineGroup.userData.rotationOut = -(documentMaxWidth + documentMargin + 0.07) / (zdistance);
        // outlineGroup.userData.rotationIn = -(documentMaxWidth + documentMargin - 0.8) / (zdistance);
        outlineGroup.userData.rotationOut = (documentMargin + 0.07) / (zdistance);
        outlineGroup.userData.rotationIn = -(0.8) / (zdistance);
        outlineGroup.rotation.y = outlineGroup.userData.rotationIn;
        outlineGroup.userData.isOut = false;

        // Create outline background
        const outlinebgGeo = new THREE.CylinderGeometry(
            (zdistance + 0.002),
            (zdistance + 0.002),
            1, 32, 1, true, Math.PI,
            (1.1) / (zdistance)
            );

        const outbg = new THREE.Mesh( outlinebgGeo, testMat );
        outlineGroup.add(outbg);

        if ( totalHeight < 0.4 ) {
            outbg.scale.y = -(destinationClippingEnd - destinationClippingStart) * 4;
            outbg.userData.scaleDefault = 0.4;
        } else {
            outbg.scale.y = -(destinationClippingEnd - destinationClippingStart) * 4;
            outbg.userData.scaleDefault = -(destinationClippingEnd - destinationClippingStart) * 4;
        }

        // outbg.layers.enable( 3 );
        outbg.userData.type = "docoutline-bg";
        outbg.name = "bg";
        outlineGroup.userData.outbg = outbg;


        // generate the center point
        const point = new THREE.Mesh( placeholderPointGeo, testMat );
        docGroup.add( point );
        
        point.scale.set( 0.1, 0.1, 0.1 );

        point.rotation.y = ( -(documentMaxWidth + documentMargin) / 2 ) / zdistance;
        point.position.y = (destinationClippingEnd - destinationClippingStart)/2 + destinationClippingStart;
        point.translateZ( - (zdistance + 0.04) );

        docGroup.userData.centerpoint = point;


        const outlineBarGeo = new THREE.CylinderGeometry(
            (zdistance + 0.002),
            (zdistance + 0.002),
            1, 1, 1, true, Math.PI, -0.001 );

        const outlineBar = new THREE.Mesh( outlineBarGeo, boxMat );
        docGroup.add(outlineBar);
        outlineBar.userData.scaleOut = totalHeight + 0.1;
        outlineBar.userData.scaleIn = -(destinationClippingEnd - destinationClippingStart);
        outlineBar.scale.y = 0;
        // outlineBar.rotation.y = -(documentMaxWidth + documentMargin + 0.05) / (zdistance);
        outlineBar.rotation.y = (documentMargin + 0.05) / (zdistance);

        outlineGroup.userData.outlineBar = outlineBar;

        // Hide the outline group
        outlineGroup.visible = true;
        outlineGroup.scale.y = 0.2;

        // Start generating the references
        if ( restoration == undefined ) {
            findReferences( docGroup );
        } else {
            findReferences( docGroup, restoration.highlights );
        }

        // Final organization and presentation of the document

        scrollDocument(docGroup);

        // createHandle(lastText, "document");

        reclipDocument(docGroup);

        workspace.add(docGroup);

        // docGroup.rotation.y = camera.rotation.y;

        // focusThis(docGroup);

        removeLoader(docGroup);

        if ( restoration != undefined ) {
            docGroup.position.y = restoration.yPos;
            docGroup.userData.scrollPercent = restoration.scroll;
            destinationClippingEnd = restoration.botPos;
        }

        // Animate document in
        const midpoint = (destinationClippingEnd - destinationClippingStart)/2 + destinationClippingStart;

        topBorder.position.y = midpoint + 0.1;
        botBorder.position.y = midpoint - 0.1;

        new TWEEN.Tween( topBorder.position )
            .to( {y: destinationClippingStart}, 1000 )
            .easing( TWEEN.Easing.Back.Out )
            .start()
            .onUpdate(() => {
                scrollDocument(docGroup);
                reclipDocument(docGroup);
            })

        new TWEEN.Tween( botBorder.position )
            .to( {y: destinationClippingEnd}, 1000 )
            .easing( TWEEN.Easing.Back.Out )
            .start();

        new TWEEN.Tween( outlineBar.scale )
            .to( {y: outlineBar.userData.scaleIn}, 1000 )
            .easing( TWEEN.Easing.Back.Out )
            .delay( 300 )
            .start()
            .onComplete(() => {
                outbg.layers.enable( 3 );
                // console.log(outbg);
            });

        if ( docGroup.userData.images != undefined ) {
            genImages( docGroup, restoration );
        }

        addSaved(docGroup);

    }
}



function reclipDocument(docGroup) {

    const textBlock = docGroup.userData.textBlock;
    var clippingStart = docGroup.userData.clippingStart.position.y;
    var clippingEnd = docGroup.userData.clippingEnd.position.y;
    const scrollBar = docGroup.userData.scrollBar;
    const scrollNub = docGroup.userData.scrollNub;
    const scrollPercent = docGroup.userData.scrollPercent;
    const totalHeight = docGroup.userData.totalHeight;
    const handle = docGroup.userData.handle;
    const scrollUp = docGroup.userData.scrollUp;
    const scrollDown = docGroup.userData.scrollDown;
    const background = docGroup.userData.background;
    const closeBtn = docGroup.userData.closeBtn;
    const outlineGroup = docGroup.userData.outlineGroup;
    const outlineBar = outlineGroup.userData.outlineBar;
    const centerpoint = docGroup.userData.centerpoint;
    var refGroup;
    var refBar;
    // const outlineBlock = docGroup.userData.outlineBlock;

    // scrollBar.position.set(documentMaxWidth + 0.1, (clippingEnd - clippingStart)/2 + clippingStart, 0);
    scrollBar.position.y = (clippingEnd - clippingStart)/2 + clippingStart;
    var scrollScale = clippingEnd - clippingStart;
    var scrollClamp = clamp(scrollScale, 0.5, 50);
    scrollBar.scale.y = scrollScale;
    // scrollNub.scale.set(scrollClamp,1,scrollClamp);

    if (handle != undefined) {
        handle.position.y = scrollBar.position.y;
        handle.scale.y = scrollScale;
    }

    var scrollPos = lerp( scrollPercent, clippingStart - 0.05, clippingEnd + 0.05 );
    scrollNub.position.y = scrollPos;

    scrollUp.position.y = clippingStart - 0.07;
    scrollDown.position.y = clippingEnd + 0.07;

    background.scale.y = clippingEnd - clippingStart;
    background.position.y = clippingStart + (clippingEnd - clippingStart)/2;

    // closeBtn.position.y = clippingStart + 0.075;

    outlineGroup.position.y = clippingStart + (clippingEnd - clippingStart)/2;
    outlineBar.position.y = outlineGroup.position.y;

    centerpoint.position.y = clippingStart + (clippingEnd - clippingStart)/2;

    if ( docGroup.userData.refGroup != undefined ) {

        refGroup = docGroup.userData.refGroup;

        if ( refGroup.userData.refBar != undefined ) {

            refBar = refGroup.userData.refBar;
            refGroup.position.y = clippingStart + (clippingEnd - clippingStart)/2;
            refBar.position.y = refGroup.position.y;

        }
        
    }

    const viewHeight = clippingEnd - clippingStart + 0.05;

    var simpleClippingEnd = clippingEnd - ((totalHeight + viewHeight) * 0) - clippingStart;
    var simpleClippingStart = 0;

    var calcdClippingEnd = clippingEnd - ((totalHeight + viewHeight) * scrollPercent) - clippingStart;
    var calcdClippingStart = - ((totalHeight + viewHeight) * scrollPercent);

    // reclipDocumentCalc(outlineBlock, simpleClippingStart, simpleClippingEnd, 0.025);
    reclipDocumentCalc(textBlock, calcdClippingStart, calcdClippingEnd);
    
}



function reclipDocumentCalc(textBlock, clippingStart, clippingEnd, ymod = 0) {
    for (var i = textBlock.length - 1; i >= 0; i--) {

        var thisText = textBlock[i];
        var bounds = thisText.userData.bounds;

        // var ymod = 1.025

        if ( clippingStart <= bounds[0] && bounds[1] <= clippingEnd) {
            // The clipping both starts and ends in this text
            thisText.clipRect = [0, clippingEnd-bounds[0], documentMaxWidth, clippingStart-bounds[0]];
            // thisText.outlineWidth = 0;

        } else if ( clippingStart <= bounds[0] + ymod && bounds[1] <= clippingStart ) {
            // The clipping starts in the middle of this text
            thisText.clipRect = [0, bounds[1]-bounds[0], documentMaxWidth, clippingStart-bounds[0]];
            // thisText.outlineWidth = 1;

        } else if ( clippingEnd <= bounds[0] + ymod && bounds[1] <= clippingEnd ) {
            // The clipping ends in the middle of this text
            thisText.clipRect = [0, clippingEnd-bounds[0], documentMaxWidth, 0 + ymod];
            // thisText.outlineWidth = 1;

        } else if ( clippingStart >= bounds[0] && bounds[1] >= clippingEnd ) {
            // The text is within both clipping bounds
            thisText.clipRect = [0, bounds[1]-bounds[0], documentMaxWidth, 0 + ymod];
            // thisText.outlineWidth = 0;

        } else {
            thisText.clipRect = [0, 0, documentMaxWidth, 0];
        }

    }
}



function scrollDocument(docGroup) {
    // const scrollNub = docGroup.userData.scrollNub;
    const scrollPercent = docGroup.userData.scrollPercent;
    // const textBlock = docGroup.userData.textBlock;
    const txtGroup = docGroup.userData.txtGroup;
    const clippingStart = docGroup.userData.clippingStart;
    const clippingEnd = docGroup.userData.clippingEnd;
    const totalHeight = docGroup.userData.totalHeight;
    const viewHeight = clippingEnd.position.y - clippingStart.position.y + 0.05;
    // console.log(totalHeight * scrollPercent);
    txtGroup.position.y = clippingStart.position.y + (totalHeight + viewHeight) * scrollPercent;

}

var toCollapse = [];
var collapsing = false;

function newMenuBarText(text, xpos, parent, type, docGroup, align = 'left') {
    const specialReaderOffset = docGroup.userData.specialReaderOffset;
    let newText = new Text();
    parent.add(newText);
    newText.text = text;
    newText.color = _colorTXmbar;
    newText.fontSize = 0.06;
    newText.anchorX = align;
    newText.anchorY = 'middle';
    newText.textAlign = 'left';
    newText.curveRadius = - snapDistanceOneValue - specialReaderOffset - 0.005;
    // tagText.position.z = snapDistanceOneValue + specialReaderOffset - 0.005;
    newText.position.y = 0.005;
    newText.rotation.y = -(xpos) / -(snapDistanceOneValue + specialReaderOffset);
    newText.translateZ( (snapDistanceOneValue + specialReaderOffset) *1 -0.005);

    newText.userData.specialReaderOffset = docGroup.userData.specialReaderOffset;
    newText.userData.type = type;
    newText.userData.text = newText.text;
    newText.userData.color = newText.color;
    newText.userData.anchorX = newText.anchorX;
    newText.userData.anchorY = newText.anchorY;
    newText.userData.fontSize = newText.fontSize;
    newText.userData.textAlign = newText.textAlign;
    newText.userData.curveRadius = newText.curveRadius;

    newText.sync();

    return newText;
}


var scrollMat = new THREE.MeshBasicMaterial({
    color: _colorBGmain,
    side: THREE.DoubleSide
});


function findReferences( docGroup, highlights = undefined ) {

    // get the html of the source paper
        // after returning... pass to generateReferences()

    var url;

    if ( docGroup.type == 'Group' ) {
        url = docGroup.userData.src;
    } else {
        url = docGroup;
    }

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'html',
        success: function(data) {
            generateReferences( docGroup, $(data), highlights );
        },
        error: function(xhr, status, error) {
            console.error('Error fetching HTML: ', error);
        }
    });


}


function generateReferences( docGroup, html, highlights = undefined ) {

    // set up the variables
    var displayHead, allrefs;
    var $html = html;

    // get the title
    var results = $html.find('.title');
    results.each(function() {
        displayHead = $(this).text();
    });

    // get the citations
    var allrefs = {};
    allrefs.refs = [];
    var citationMain = $html.find('.bibUl').first();
    var allCitations = citationMain.find('li');
    var citationNum = 0;

    allCitations.each(function() {
        citationNum++;
        var rawcitation = $(this).html();
        var txtcitation = $(this).text();
        var number = "[" + citationNum + "]";

        // =============== title ===============

        // slice off the url at the end
        const breakpoint = rawcitation.search('<a');
        var title = rawcitation.slice(0,breakpoint);

        // find the first year and slice it off
        var yearpoint = title.search(/\d{4}/);
        var potential = title.slice( yearpoint + 6 );

        // setup some variables for later
        const nums = [0,1,2,3,4,5,6,7,8,9];
        var potentials = [];
        var current = 0;

        // remove the html tags and recombine the content
        var pieces = $.parseHTML( potential );
        var recombined = '';
        for (var i = pieces.length - 1; i >= 0; i--) {
            recombined = $(pieces[i]).text() + recombined;
        }

        // if the result is now empty, roll back
        if ( recombined.length <= 1 ) {
            recombined = title;
        }

        // check for a residual tag
        var firstBracket = recombined.search('<');
        var lastBracket = recombined.search('>');
        if ( firstBracket != -1 && lastBracket != -1 ) {
            var firstHalf = recombined.slice(0,firstBracket);
            var secondHalf = recombined.slice(lastBracket+1);
            recombined = firstHalf + secondHalf;
        }

        // slice off any trailing periods
        if ( recombined.slice(recombined.length-2) == '. ' ) {
            recombined = recombined.slice( 0,recombined.length-2 );
        }

        // check for a remaining period and assume it would be a location reference
        var location = recombined.indexOf('. ');
        var stripped = '';
        if ( location != -1 ) {
            stripped = recombined.slice( 0, location );
        } else {
            stripped = recombined;
        }

        // check if the result was cut at the wrong place, like at a common abbreviation
        var abbscheck = stripped.slice( stripped.length -2 );
        const abbreviations = ['Mt','Mr'];
        for (var i = abbreviations.length - 1; i >= 0; i--) {
            if ( abbreviations[i] == abbscheck ) {
                stripped = recombined;
            }
        }

        // =============== authors ===============

        // find some numbers after a space, probably the year
        potentials = [];
        for (var i = nums.length - 1; i >= 0; i--) {
            const result = txtcitation.indexOf( ' ' + i);
            if ( result != -1 ) {
                potentials.push(txtcitation.slice(0, result));
            }
        }

        // checks the results and only keep the shortest one
        current = 0;
        for (var i = potentials.length - 1; i >= 0; i--) {
            if ( potentials[i].length < potentials[current].length ) {
                current = i;
            }
        }

        // slice off any trailing periods
        var authors = potentials[current];
        if ( authors.slice(authors.length-1) == '.' ) {
            authors = authors.slice( 0,authors.length-1 );
        }

        // check if the authors are invalid
        for (var i = nums.length - 1; i >= 0; i--) {
            if ( nums[i] == authors[1] ) {
                authors = '';
            }
        }

        // check if the authors end in a comma (probabaly part of a date) and remove it
        if ( authors.slice( authors.length-1 ) == ',' ) {
            authors = authors.slice( 0, authors.length-1 );
        }

        // check if we have a month at the end and remove it
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (var i = months.length - 1; i >= 0; i--) {
            if ( authors.slice( authors.length-months[i].length ) == months[i] ) {
                authors = authors.slice( 0, authors.length-months[i].length-2 );
            }
        }

        // =============== url ===============

        // get the url at the end
        const linkstart = rawcitation.indexOf( 'href="' );
        var link = rawcitation.slice( linkstart+6 );
        const linkend = link.indexOf( '"' );
        link = link.slice( 0, linkend );

        if ( link.slice( 0, 8 ) != "https://" ) {
            link = '';
        }

        // console.log( link );

        // =============== year ===============

        // find the first number following a period and space, probably the year
        var result = 0;
        for (var i = nums.length - 1; i >= 0; i--) {
            const startpoint = txtcitation.indexOf( '. ' + i);
            if ( startpoint != -1 ) {
                var temp = txtcitation.slice( startpoint + 2, startpoint + 6 );
                if ( Number.isInteger(Number(temp)) ) {
                    result = Number(temp);
                }
            }
        }

        // make sure the result is not empty
        var year;
        if ( result != 0 ) {
            year = result;
        }

        // =============== ======== ===============

        var newListItem = '';
        if ( authors.length > 0 ) {
            newListItem = number + ' ' + stripped + ' - ' + authors;
        } else {
            newListItem = number + ' ' + stripped;
        }

        var thisref = {};
        
        thisref.ref = newListItem;
        thisref.num = citationNum;
        thisref.title = stripped;
        thisref.author = authors;
        thisref.source = link;
        thisref.year = year;

        allrefs.refs.push(thisref);

        if ( citationNum == allCitations.length ) {
            generateReferencesStep( docGroup, allrefs, 0, highlights );
        }

    })

    // console.log( allrefs );

}


function generateReferencesStep( docGroup, refs, index, restoreHighlights = undefined ) {

    var totalHeight;
    var padding = 0.01;
    var refGroup;
    var zdistance = snapDistanceOneValue + docGroup.userData.specialReaderOffset;

    if ( index == 0 ) {

        refGroup = new THREE.Group();
        docGroup.userData.refGroup = refGroup;
        docGroup.add( refGroup );
        refGroup.userData.type = "refgroup";
        refGroup.userData.parentTitle = docGroup.userData.title;
        refGroup.userData.restoreHighlights = restoreHighlights;

        const allRefs = [];
        refGroup.userData.allRefs = allRefs;

    } else {

        refGroup = docGroup.userData.refGroup;
    }


    if ( index > 0 ) {

        const tempBox = new THREE.Box3().setFromObject( refGroup );
        tempBox.getSize( tempSize );
        totalHeight = tempSize.y;

    } else {

        totalHeight = 0;

    }


    if ( index > 0 && index < refs.refs.length ) {
        totalHeight += padding;
    }


    if ( index < refs.refs.length ) {

        var newText = new Text();
        const newTextGroup = new THREE.Group();

        newTextGroup.add( newText );
        refGroup.add( newTextGroup );
        refGroup.userData.allRefs.push( newTextGroup );

        // console.log(refs.refs[index]);
        // console.log(totalHeight);

        newText.text = refs.refs[index].ref;
        newText.color = _colorTXalts;
        newText.fontSize = 0.02;
        newText.anchorX = 'left';
        newText.anchorY = 'top';
        newText.maxWidth = 0.95;
        newText.textAlign = 'justify';
        newText.curveRadius = zdistance + 0.005;
        newText.position.z = - zdistance - 0.005;
        newTextGroup.position.y = - totalHeight;
        newTextGroup.rotation.y = 0;
        newTextGroup.userData.type = "reflineGroup";

        newTextGroup.userData.num = refs.refs[index].num;
        newTextGroup.userData.title = refs.refs[index].title;
        newTextGroup.userData.author = refs.refs[index].author;
        newTextGroup.userData.year = refs.refs[index].year;
        newTextGroup.userData.source = refs.refs[index].source;

        newText.userData.type = "refline";
        newText.userData.fontSize = 0.02;
        newText.layers.enable( 3 );

        newText.sync();
        newText.userData.syncDocGroup = docGroup;
        newText.userData.syncRefs = refs;
        newText.userData.syncIndex = index + 1;

        newText.userData.sync = 'refline';
        syncCheck.push(newText);

        newTextGroup.visible = false;

    } else if ( index == refs.refs.length ) {

        refGroup.rotation.y = -(documentMaxWidth + documentMargin + 0.08) / (zdistance);
        refGroup.position.y = (docGroup.userData.clippingStart.position.y + (docGroup.userData.clippingEnd.position.y - docGroup.userData.clippingStart.position.y) / 2 );

        // Create reference bar
        const refBarGeo = new THREE.CylinderGeometry(
            (zdistance + 0.002),
            (zdistance + 0.002),
            1, 1, 1, true, Math.PI, -0.001 );

        const refBar = new THREE.Mesh( refBarGeo, boxMat );
        docGroup.add(refBar);
        refBar.userData.scaleOut = totalHeight + 0.1;
        // refBar.userData.scaleIn = -(docGroup.userData.clippingEnd.position.y - docGroup.userData.clippingStart.position.y);
        refBar.scale.y = 0;
        refBar.rotation.y = -(documentMaxWidth + documentMargin + 0.05) / (zdistance);
        refBar.position.y = refGroup.position.y;

        refGroup.userData.refBar = refBar;

        // reposition the texts
        for (var i = refGroup.children.length - 1; i >= 0; i--) {
            refGroup.children[i].translateY( totalHeight/2 );
            refGroup.children[i].userData.magnetRotY = refGroup.children[i].rotation.y;
            refGroup.children[i].userData.magnetPosY = refGroup.children[i].position.y;
        }

        // Create reference background
        const refbgGeo = new THREE.CylinderGeometry(
            (zdistance + 0.006),
            (zdistance + 0.006),
            1, 32, 1, true, Math.PI,
            (-1.2) / (zdistance)
            );

        const refbg = new THREE.Mesh( refbgGeo, testMat );
        refGroup.add( refbg );

        refbg.scale.y = -(destinationClippingEnd - destinationClippingStart);
        refGroup.userData.rotationOut = -(documentMaxWidth + documentMargin + 0.07) / (zdistance);
        refGroup.userData.rotationIn = -(documentMaxWidth + documentMargin - 1.0) / (zdistance);
        refGroup.rotation.y = refGroup.userData.rotationIn;

        refbg.userData.type = "docref-bg";
        refbg.name = "bg";

        refGroup.userData.refbg = refbg;
        refGroup.userData.refBar = refBar;
        refGroup.userData.isOut = false;

        refGroup.scale.y = 0.2;
        refbg.scale.y = refbg.scale.y * 5;
        // refGroup.visible = false;


        // restore any highlights from before (if there are any)
        const highlights = refGroup.userData.restoreHighlights;
        if ( highlights != undefined ) {

            for (var i = refGroup.userData.allRefs.length - 1; i >= 0; i--) {
                const thisRef = refGroup.userData.allRefs[i];

                for (var j = highlights.length - 1; j >= 0; j--) {
                    const index = highlights[j].index;
                    const color = highlights[j].highlight;

                    if ( i == index ) {

                        console.log( color );

                        thisRef.children[0].outlineColor = _colorHImark[ color ];
                        thisRef.children[0].outlineWidth = 0.01;

                    }

                }

            }

        }


        // animate in the bar
        new TWEEN.Tween( refBar.scale )
            .to( {y: -(destinationClippingEnd - destinationClippingStart) }, 1000 )
            .easing( TWEEN.Easing.Back.Out )
            .start()
            .onComplete(() => {
                refbg.layers.enable( 3 );
            });
    
    }

}


const refsToDim = [];
const refDimMax = 0.5;
function tryRefDim( refGroup = undefined ) {
    
    if ( refGroup != undefined ) {

        const isRefd = refsToDim.indexOf( refGroup );

        if ( isRefd == -1 ) {
            refsToDim.push( refGroup );
            refGroup.userData.dimTimer = 0;
        } else{
            refGroup.userData.dimTimer = 0;
        }

    } else {

        for (var i = refsToDim.length - 1; i >= 0; i--) {

            if ( refsToDim[i].userData.dimTimer + deltaTime < refDimMax ) {

                refsToDim[i].userData.dimTimer = refsToDim[i].userData.dimTimer + deltaTime;

            } else {

                const thisRef = refsToDim[i];

                for (var j = thisRef.children.length - 1; j >= 0; j--) {
                    if ( thisRef.children[j].name != 'bg' ) {


                        new TWEEN.Tween( thisRef.children[j].children[0] )
                            .to( {fillOpacity: 1}, 400 )
                            .easing( TWEEN.Easing.Quadratic.InOut )
                            .start()
                        ;

                        // thisRef.children[j].children[0].color = _colorTXalts;
                    }
                }

                refsToDim.splice(i,1);

            }

        }

    }

}


function newXan( refGroup ) {

    const title = refGroup.userData.parentTitle;

    var parentGroup;

    for (var i = savedElement.length - 1; i >= 0; i--) {
        if ( savedElement[i].userData.type == "document" ) {

            const checkTitle = savedElement[i].userData.title;

            if ( checkTitle == title ) {

                parentGroup = savedElement[i];

                // console.log( refGroup.userData.centerpoint );
                // console.log( parentGroup.userData.centerpoint );

                // if (parentGroup.userData.centerpoint.userData.lines != undefined) {
                //     for (var i = parentGroup.userData.centerpoint.userData.lines.length - 1; i >= 0; i--) {
                //         parentGroup.userData.centerpoint.remove( parentGroup.userData.centerpoint.userData.lines[i] );
                //     }
                //     // parentGroup.userData.centerpoint.userData.lines = undefined;
                // }

                createLine( refGroup.userData.centerpoint, parentGroup.userData.centerpoint, true );
                break;

            }
        }
    }
}


function genImages( docGroup, restoration = undefined ) {

    var images = docGroup.userData.images;

    var runningWidth = 0.0;
    var runningImgs = [];

    for (var i = images.length - 1; i >= 0; i--) {

        var thisJSON = docGroup.userData.images[i];

        const index = i;
        var loaded = 0;

        var imgTexture = new THREE.TextureLoader().load(
            thisJSON.src,
            (texture) => {

                loaded++;

                const width = texture.image.width;
                const height = texture.image.height;
                const dividend = 1000;

                // var newReaderOffset = Math.random() * (0.2 - 0.1) + 0.1;
                var newReaderOffset = 0.1;
                var specialReaderOffset = docGroup.userData.specialReaderOffset;

                consoleLog( "Image Generated @ " + width + " x " + height, 0x1188ff );

                var newMat = new THREE.MeshBasicMaterial( {
                    map: texture,
                    transparent: true,
                    opacity: 0.4,
                    side: THREE.DoubleSide
                } );

                var newGeo = new THREE.PlaneGeometry(width/dividend, height/dividend);
                // var newGeo = new THREE.CylinderGeometry(
                //     snapDistanceOneValue + specialReaderOffset - newReaderOffset,
                //     snapDistanceOneValue + specialReaderOffset - newReaderOffset,
                //     height/dividend, 32, 1, true, 0,
                //     ( width/dividend ) / (snapDistanceOneValue + specialReaderOffset - newReaderOffset)
                // );

                var newMesh = new THREE.Mesh( newGeo, newMat );

                newMesh.scale.set( 0, 0, 1 );

                new TWEEN.Tween( newMesh.scale )
                    .to( {x: 0.2, y: 0.2}, 300 )
                    .easing( TWEEN.Easing.Quadratic.Out )
                    .start()
                    .delay( 300 );
                ;

                var newGroup = new THREE.Group();

                newGroup.add( newMesh );
                docGroup.add( newGroup );

                newMesh.position.z = snapDistanceOneValue + specialReaderOffset - newReaderOffset;
                newMesh.layers.enable( 3 );
                newMesh.userData.type = "image";

                // generate the center point
                const point = new THREE.Mesh( placeholderPointGeo, testMat );
                newGroup.add( point );
                
                point.scale.set( 0.1, 0.1, 0.1 );

                point.translateZ( (snapDistanceOneValue + specialReaderOffset - newReaderOffset + 0.04) );

                newGroup.userData.centerpoint = point;

                if ( loaded == 1 ) {
                    runningWidth -= (((width/dividend)*0.2)/2) + 0.2;
                }


                if ( restoration == undefined ) {
                    newGroup.position.set( 0, destinationClippingStart + ((height/dividend)*0.2*0.5), 0 );
                    // newGroup.rotation.y = runningWidth + Math.PI - ( ( width/dividend ) / (snapDistanceOneValue + specialReaderOffset - newReaderOffset) ) / 2;
                    newGroup.rotation.y = Math.PI - (( runningWidth )/( newMesh.position.z ));
                    newGroup.userData.baseRot = newGroup.rotation.y;
                } else {
                    newGroup.position.set( 0, restoration.images[index].yPos, 0 );
                    newGroup.rotation.y = restoration.images[index].yRot;
                }

                runningWidth -= ((width/dividend)*0.2) + 0.01;

                runningImgs.push( newGroup );
                docGroup.userData.genImages.push( newGroup );

                newGroup.userData.docGroup = docGroup;
                newGroup.userData.specialReaderOffset = specialReaderOffset - newReaderOffset;
                newGroup.userData.parentTitle = docGroup.userData.title;
                newGroup.userData.type = "imageGroup";
                newGroup.userData.image = newMesh;

                // center all images across the document
                if ( restoration == undefined ) {
                    for (var j = runningImgs.length - 1; j >= 0; j--) {
                        const specialReaderOffset = runningImgs[j].userData.specialReaderOffset;
                        runningImgs[j].rotation.y = runningImgs[j].userData.baseRot - ((documentMaxWidth/2) - (runningWidth/2)) / (runningImgs[j].userData.image.position.z);
                    }
                }

            }
        );

    }

}




























let syncCheck = [];
function trySync() {

    if (syncCheck.length > 0) {
        for (var i = syncCheck.length - 1; i >= 0; i--) {
            // console.log(syncCheck[i]._needsSync + ' | ' + syncCheck[i]._isSyncing);
            if (!syncCheck[i]._needsSync && !syncCheck[i]._isSyncing) {

                let funct = syncCheck[i].userData.sync;

                if (funct == 'generateDocumentContent') {
                    var docGroup = syncCheck[i].userData.syncDocGroup;
                    var fullText = syncCheck[i].userData.syncFullText;
                    var iteration = syncCheck[i].userData.syncIteration;
                    var restoration = syncCheck[i].userData.syncRestoration;
                    generateDocumentContentStep(docGroup, fullText, iteration, syncCheck[i], restoration);
                    syncCheck[i].userData.syncDocGroup = undefined;
                    syncCheck[i].userData.syncFullText = undefined;
                    syncCheck[i].userData.syncIteration = undefined;
                    syncCheck[i].userData.syncRestoration = undefined;

                } else if (funct == 'createHandle') {
                    createHandle(syncCheck[i]);

                } else if (funct == 'textBlockBuilder') {
                    totalPostInstance++;
                    if (totalPostInstance >= totalPreInstance && totalPreInstance > 0) {
                        createHandleTimeout(syncCheck[i], "useParentY", 700);
                        var allTexts = syncCheck[i].parent.userData.textBlock;
                        for (var i = allTexts.length - 1; i >= 0; i--) {
                            allTexts[i].visible = false;
                        }
                        // focusThisTimout(textGroup);
                    }

                } else if (funct == 'mapcontent') {
                    updateMapTextBounds(syncCheck[i]);
                    // setTimeout(() => {updateMapTextBounds(syncCheck[i])},500);
                    
                } else if (funct == 'catalogBuilder') {

                    var parent = syncCheck[i].userData.syncParent;
                    var elements = syncCheck[i].userData.syncElements;
                    var step = syncCheck[i].userData.syncStep;
                    syncCheck[i].userData.syncParent = undefined;
                    syncCheck[i].userData.syncElements = undefined;
                    syncCheck[i].userData.syncStep = undefined;
                    stepBoxCatalog( parent, elements, step, syncCheck[i] );

                } else if (funct == 'previewBuilder') {

                    var parent = syncCheck[i].userData.syncParent;
                    var author = syncCheck[i].userData.syncAuthor;
                    var year = syncCheck[i].userData.syncYear;
                    var source = syncCheck[i].userData.syncSource;
                    var type = syncCheck[i].userData.syncType;
                    var step = syncCheck[i].userData.syncStep;
                    syncCheck[i].userData.syncParent = undefined;
                    syncCheck[i].userData.syncAuthor = undefined;
                    syncCheck[i].userData.syncYear = undefined;
                    syncCheck[i].userData.syncSource = undefined;
                    syncCheck[i].userData.syncType = undefined;
                    syncCheck[i].userData.syncStep = undefined;
                    stepBoxPreview( parent, "", author, year, source, type, step );

                } else if (funct == 'refline') {

                    var docGroup = syncCheck[i].userData.syncDocGroup;
                    var refs = syncCheck[i].userData.syncRefs;
                    var index = syncCheck[i].userData.syncIndex;
                    syncCheck[i].userData.syncDocGroup = undefined;
                    syncCheck[i].userData.syncRefs = undefined;
                    syncCheck[i].userData.syncIndex = undefined;
                    generateReferencesStep( docGroup, refs, index );

                } else if (funct == 'citationBoxBuilder') {

                    var group = syncCheck[i].userData.syncGroup;
                    var author = syncCheck[i].userData.syncAuthor;
                    var year = syncCheck[i].userData.syncYear;
                    var source = syncCheck[i].userData.syncSource;
                    var step = syncCheck[i].userData.syncStep;
                    var zdistance = syncCheck[i].userData.syncZdistance;
                    syncCheck[i].userData.syncGroup = undefined;
                    syncCheck[i].userData.syncAuthor = undefined;
                    syncCheck[i].userData.syncYear = undefined;
                    syncCheck[i].userData.syncSource = undefined;
                    syncCheck[i].userData.syncStep = undefined;
                    syncCheck[i].userData.syncZdistance = undefined;
                    stepBoxCitation( group, "", author, year, source, step, zdistance );

                }

                syncCheck.splice(i,1);
            }
        }
    }
}


function changeDistance(object, value) {
    // Save the value as userData
    object.userData.viewDistance = value;

    // Set the curve radius and position of the textLine
    if (object.userData.textLine != undefined) {
        var lineText = object.userData.textLine;
        lineText.curveRadius = value;
        lineText.userData.curveRadius = value;
        lineText.position.set( lineText.position.x, lineText.position.y, -value );
    }

    // Set the curve radius and position of the header
    if (object.userData.header != undefined) {
        var headText = object.userData.header;
        headText.curveRadius = value;
        headText.userData.curveRadius = value;
        headText.position.set( headText.position.x, headText.position.y, -value );
    }
    // Set the curve radius and position of the preview text block
    if (object.userData.previewText != undefined) {
        var previewText = object.userData.previewText;
        previewText.curveRadius = value;
        previewText.userData.curveRadius = value;
        previewText.position.set( previewText.position.x, previewText.position.y, -value );
    }
    // Set the curve radius and position of all text block elements
    if (object.userData.textBlock != undefined) {
        var textBlock = object.userData.textBlock;
        for (var j = textBlock.length - 1; j >= 0; j--) {
            textBlock[j].curveRadius = value;
            textBlock[j].userData.curveRadius = value;
            textBlock[j].position.z = -value;
        }
    }
    // Set the position of the handle
    if (object.userData.handle != undefined) {
        var handle = object.userData.handle;
        handle.position.z = -value;
    }
    // Set the position of the focus background
    if (object.userData.focusBG != undefined) {
        var focusBG = object.userData.focusBG;
        focusBG.scale.set(value,1,-value);
    }
}


const focusBGmat = new THREE.MeshBasicMaterial( {
    color: _colorBounds,
    side: THREE.DoubleSide
} );

const docBGmat = new THREE.MeshBasicMaterial( {
    color: _colorBGread,
    side: THREE.DoubleSide
} );

var rememberedFocusRotation;
var focusTransScale;

function focusThis(object) {
    // remove any other focused objects
    for (var i = snapDistanceFocus.length - 1; i >= 0; i--) {
        unfocusThis(snapDistanceFocus[i]);
    }

    // change the focus text on a document
    const menubarFocus = object.userData.menubarFocus;
    if (menubarFocus != undefined) {
        menubarFocus.text = "Unfocus";
    }

    // set userdata for focused
    object.userData.isFocused = true;

    // remove from snapDistanceOne and add to snapDistanceFocus
    const index = snapDistanceOne.indexOf(object);
    snapDistanceOne.splice(index,1);
    snapDistanceFocus.push(object);

    // calculate width & height
    if (object.userData.type != "document" && object.userData.type != "boxpreview") {

        changeDistance(object, 1);

        rememberedFocusRotation = object.rotation.y;
        object.rotation.set(0,0,0);

        if (object.userData.previewText != undefined) {
            var previewText = object.userData.previewText;
            previewText.curveRadius = 0;
        }

        const tempTarget = object.userData.previewText;
        // tempTarget.fontWeight = "bold";
        const tempBox = new THREE.Box3().setFromObject(object);
        tempBox.getSize(tempSize);
        var height = tempSize.y + 0.1;
        var width = tempSize.x + 0.22;
        // tempTarget.fontWeight = "normal";
        console.log(width);

        // add a solid background
        const focusBGgeo = new THREE.CylinderGeometry( 1 + 0.01, 1 + 0.01, height, 32, 1, true, -0.12, width/2);
        const focusBG = new THREE.Mesh( focusBGgeo, focusBGmat );
        object.add(focusBG);
        focusBG.scale.set(1,1,-1);
        focusBG.translateY(-height/2 + 0.04 + 0.05);
        focusBG.layers.enable( 3 );
        focusBG.userData.type = "focusBG";

        // set userdata of focusBG
        object.userData.focusBG = focusBG;

        // reset the rotation back to what it was before calculations
        object.rotation.y = rememberedFocusRotation;

        // set the distance and curve radius to snapDistanceFocusValue
        changeDistance(object, snapDistanceFocusValue);
    } else {
    // else if (object.userData.type == "document") {
        changeDistance(object, snapDistanceFocusValue + object.userData.specialReaderOffset);
        // changeDocDistance(object, snapDistanceFocusValue + object.userData.specialReaderOffset);
    }

    // change the scale so it is a bit smaller
    object.scale.set(0.3, 0.3, 0.4);

    // set the height to an easy reading distance
    object.position.y = camera.position.y + 0.3;

    // tween scale
    focusTransScale = new TWEEN.Tween( object.scale )
        .to( {x: 0.4, y: 0.4, z: 0.4}, 300 )
        .easing( TWEEN.Easing.Quadratic.Out )
        .start()
    ;
}


function unfocusThis(object) {
    // unset userdata for focused
    object.userData.isFocused = undefined;

    // change the focus text on a document
    const menubarFocus = object.userData.menubarFocus;
    if (menubarFocus != undefined) {
        menubarFocus.text = "Focus";
    }

    // remove from snapDistanceFocus and add to snapDistanceOne
    const index = snapDistanceFocus.indexOf(object);
    snapDistanceFocus.splice(index,1);
    snapDistanceOne.push(object);

    // set the distance and curve radius to snapDistanceOneValue + userData.specialReaderOffset
    changeDistance(object, snapDistanceOneValue + object.userData.specialReaderOffset);

    // remove the solid background
    object.remove(object.userData.focusBG);

    // set userdata to say it is no longer focused
    object.userData.focusBG = undefined;

    // reset any changes to scale
    object.scale.set(1.1, 1.1, 1);
    
    // tween
    focusTransScale = new TWEEN.Tween( object.scale )
        .to( {x: 1, y: 1, z: 1}, 300 )
        .easing( TWEEN.Easing.Quadratic.Out )
        .start()
    ;
}


function focusThisTimout(object,delay = 500) {
    setTimeout(() => {focusThis(object)},delay);
}


function tryCloseButton(child) {
    setTimeout(() => {

        const maxDistance = 0.1;
        child.getWorldPosition(tempWorldPos);
        toolSelectorDot.getWorldPosition(toolSelectorDotWorld);

        if (toolSelectorDotWorld.distanceTo(tempWorldPos) <= maxDistance) {
            // the pointer is still too close, try again later
            tryCloseButton(child)
        } else {
            // the pointer is far enough away, tween down and don't try again
            var tempClosebtnScale = new TWEEN.Tween( child.scale )
            .to( {x: 0.25, y: 0.25}, 250 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .start()
        }

    },300);
}





















function startPos(mesh, look = false) {
    // Set position to the camera
    mesh.position.x = camera.position.x;
    mesh.position.y = camera.position.y - 0.3;
    mesh.position.z = camera.position.z;

    // Get the direction the camera is facing
    var pLocal = new THREE.Vector3( 0, 0, -1 );
    var pWorld = pLocal.applyMatrix4( camera.matrixWorld );
    var dir = pWorld.sub( camera.position ).normalize();

    // Move the mesh away from the camera in the direction it is facing
    mesh.position.add(dir.clone().multiplyScalar(0.35));

    // Look at the camera
    if (look) {
        var newRot = new THREE.Quaternion().setFromRotationMatrix(
            new THREE.Matrix4().lookAt( mesh.position, camera.position, new THREE.Vector3( 0, -1, 0 ) ) 
        );

        mesh.quaternion.copy( newRot );
    }

    
}


























const boundingMat = new THREE.MeshBasicMaterial({
        color: _colorBounds,
        transparent: false,
        opacity: 0.5,
        side: THREE.DoubleSide
});
const invisMat = new THREE.MeshBasicMaterial({
    color: _colorBounds,
    visible: false
});
const triGripMat = new THREE.MeshBasicMaterial({
        color: _colorHBound,
        side: THREE.DoubleSide
});

function createHandleTimeout(object, variant = undefined, delay = 500) {
    setTimeout(() => {createHandle(object, variant)},delay);
}

function createHandle(object, variant = undefined) {
    var width = 0.10;
    var clippingStart, clippingEnd;

    if (variant != "document") {
        const tempBox = new THREE.Box3().setFromObject(object.parent);
        tempBox.getSize(tempSize);
        var height = tempSize.y;
    } else if (variant == "document") {
        clippingStart = object.parent.parent.userData.clippingStart.position.y;
        clippingEnd = object.parent.parent.userData.clippingEnd.position.y;
        // var height = (-clippingEnd + clippingStart);
        var height = 1;
    }

    if (height <= 0.00001 ) {
        height = 0.027;
    }

    const boundingGeo = new THREE.PlaneGeometry( width, height );
    // const boundingWire = new THREE.EdgesGeometry( boundingGeo, 90 );
    // const boundingLine = new THREE.LineSegments( boundingWire );
    const boundingMesh = new THREE.Mesh( boundingGeo, invisMat );
    const childMesh = new THREE.Mesh( boundingGeo, boundingMat );

    if (variant != "document") {
        object.parent.add( boundingMesh );
        object.parent.userData.handle = boundingMesh;
    } else if (variant == "document") {
        object.parent.parent.add( boundingMesh );
        object.parent.parent.userData.handle = boundingMesh;
    }

    boundingMesh.add( childMesh );
    boundingMesh.layers.enable( 3 );
    boundingMesh.userData.layers = 3;
    boundingMesh.userData.type = "handle";
    childMesh.userData.type = "handlebar";
    boundingMesh.userData.handlebar = childMesh;
    

    childMesh.scale.x = 0.1;
    childMesh.translateX( 0.045 );
    childMesh.translateZ( 0.001 );

    if ( variant == "useParentY" ) {
        boundingMesh.position.set( object.position.x, 0.0 - height/2 + 0.036, object.position.z );
    } else if ( variant == "document" ) {
        boundingMesh.position.set( object.position.x, object.parent.parent.position.y + clippingStart + (clippingEnd - clippingStart)/2, object.position.z );
    } else {
        boundingMesh.position.set( object.position.x, object.position.y - height/2 - 0.002, object.position.z );
    }
    
    boundingMesh.rotation.set( object.parent.rotation.x, 0, object.parent.rotation.z );
    boundingMesh.translateX( -0.06 );
}
















































// -------------------- HAND TRACKING ----------------------
let hand1, hand2;
// let controller1, controller2;
// let controllerGrip1, controllerGrip2;
let wrist1, wrist2, thumbTip1, thumbTip2, thumbDistal1, thumbDistal2, indexFingerTip1, indexFingerTip2,
indexDis1, indexDis2, middleFingerTip1, middleFingerTip2, middleDistal1, middleDistal2, ringFingerTip1, ringFingerTip2, 
pinkyFingerTip1, pinkyFingerTip2, indexKnuckle1, indexKnuckle2, palm1, palm2;

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

const palmNormal = new THREE.Mesh( testGeo, testMat );
var palmNormalWorld = new THREE.Vector3();

var mainInit = false;

function init() {

    if (!mainInit && !controller1enabled && !controller2enabled) {
        mainInit = true;

        console.log("========INIT========");

        const controllerModelFactory = new XRControllerModelFactory();
        const handModelFactory = new XRHandModelFactory();

        // Hand 1 - 'left' or non-dominant hand (menu sphere)
        
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

        hand1.addEventListener( 'pinchstart', onPinchStartOne );
        hand1.addEventListener( 'pinchend', onPinchEndOne );
        
        
        // Hand 2 - 'right' or dominant hand (interactions)

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

        hand2.addEventListener( 'pinchstart', onPinchStartTwo );
        hand2.addEventListener( 'pinchend', onPinchEndTwo );

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
            palm1 = event.target.joints['middle-finger-phalanx-proximal'];

            // Setup palm normal
            wrist1.add( palmNormal );
            palmNormal.position.set(0,0,0);
            palmNormal.translateY( -0.1 );

            controller1enabled = true;

            hand1.userData.handedness = event.data.handedness;
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
            palm2 = event.target.joints['middle-finger-phalanx-proximal'];

            controller2enabled = true;

            hand2.userData.handedness = event.data.handedness;
        });

        setTimeout(() => {
            if (handModels.right[0].children.length == 0) {
                console.log("Hand models failed to load. Did you not give the page enough time to load before entering XR, or reload the page while in XR?");
            }
        }, 3000);


    }
}

const handMaterial = new THREE.MeshStandardMaterial( {
    color: _colorHands,
    metalness: 0.9,
    roughness: 0.5,
    transparent: false,
    opacity: 0.8
} );

function colorHands() {
    try {
        hand1.children[1].children[0].material = handMaterial;
        hand1.children[0].children[0].children[0].material = handMaterial;

        hand2.children[1].children[0].material = handMaterial;
        hand2.children[0].children[0].children[0].material = handMaterial;
    } catch {
        console.log("Error setting hand material.");
        setTimeout(() => { colorHands(); }, 200);
    }
}

var isNonPinching = false;
var isNonPinchConsumed = false;
var onePinchTime = 0.0;
var isDomPinching = false;
var isDomPinchConsumed = false;
var twoPinchTime = 0.0;

var lastIntersect;
var lastIntersectBGtime = 0.0;

const pinchThreshold = 0.25;

function onPinchStartOne( event ) {   
    if ( currentDominant == "left" && initialDominant == "right" ) {
        onPinchStart( true );
    } else if ( currentDominant == "right" && initialDominant == "right" ) {
        onPinchStart( false );
    } else if ( currentDominant == "left" && initialDominant == "left" ) {
        onPinchStart( false );
    } else if ( currentDominant == "right" && initialDominant == "left" ) {
        onPinchStart( true );
    }
}

function onPinchEndOne( event ) {
    if ( currentDominant == "left" && initialDominant == "right" ) {
        onPinchEnd( true );
    } else if ( currentDominant == "right" && initialDominant == "right" ) {
        onPinchEnd( false );
    } else if ( currentDominant == "left" && initialDominant == "left" ) {
        onPinchEnd( false );
    } else if ( currentDominant == "right" && initialDominant == "left" ) {
        onPinchEnd( true );
    }
}

function onPinchStartTwo( event ) {
    if ( currentDominant == "right" && initialDominant == "right" ) {
        onPinchStart( true );
    } else if ( currentDominant == "left" && initialDominant == "right" ) {
        onPinchStart( false );
    } else if ( currentDominant == "right" && initialDominant == "left" ) {
        onPinchStart( false );
    } else if ( currentDominant == "left" && initialDominant == "left" ) {
        onPinchStart( true );
    }
    
}

function onPinchEndTwo( event ) {
    if ( currentDominant == "right" && initialDominant == "right" ) {
        onPinchEnd( true );
    } else if ( currentDominant == "left" && initialDominant == "right" ) {
        onPinchEnd( false );
    } else if ( currentDominant == "right" && initialDominant == "left" ) {
        onPinchEnd( false );
    } else if ( currentDominant == "left" && initialDominant == "left" ) {
        onPinchEnd( true );
    }
}






function onPinchStart( dom = true ) {
    if ( dom ) {
        isDomPinching = true;
        isDomPinchConsumed = false;
        if (lastIntersect != undefined) {
            // scale mapbg to the selected object's current viewdistance

            toolSelectorDot.getWorldPosition(toolSelectorDotWorld);
            const endPoint = new THREE.Vector3(toolSelectorDotWorld.x,0,toolSelectorDotWorld.z);
            const distance = _zero.distanceTo(endPoint);
            mapbg.scale.set(distance,1,distance);
            
        }
    } else {
        isNonPinching = true;
        isNonPinchConsumed = false;
    }
}


function onPinchEnd( dom = true ) {
    if ( dom ) {
        isDomPinching = false;
        if (twoPinchTime <= pinchThreshold && lastIntersect != undefined) { tryQuickPointerSelect(lastIntersect.object); }
        twoPinchTime = 0;
        if (mapbg != undefined) {
            mapbg.scale.set(defaultMapScale,1,defaultMapScale);
        }
        raycaster.layers.set( 3 );
        lastIntersect = undefined;
    } else {
        isNonPinching = false;
    }
}





function placeholderArrow(raycaster, length = grabDistance, color = 0x33ff77, life = 50) {
    if (debugMode) {
        // Draw a placeholder arrow to visualize the raycast
        const arrowTest = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, length, color);
        scene.add(arrowTest);
        setTimeout(() => {
            scene.remove(arrowTest);
        }, life);
    }
}

const placeholderPointGeo = new THREE.BoxGeometry( 1, 1, 1 );
function placeholderPoint( vectorx, vectory, vectorz, size=0.01, life = 500 ) {
    if (debugMode) {
        const pointMesh = new THREE.Mesh( placeholderPointGeo, testMat );
        scene.add(pointMesh);
        pointMesh.scale.set(size,size,size);
        pointMesh.position.set(vectorx,vectory,vectorz);
        setTimeout(() => {
                scene.remove(pointMesh);
        }, life);
    }
}

function norm(value, min, max) {
    return (value - min) / (max - min);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function lerp(alpha, a, b) {
    return a + alpha * ( b - a );
}












































































var offsetPositionY;
var offsetAngle;
var wrist2NormalXVector = new THREE.Vector3();
var wrist2NormalZVector = new THREE.Vector3();
var wrist2Roll, wrist2Pitch;
var curObjDir = new THREE.Vector3();
var swipeRayLengthBase = 0.75;
var domswipeObj = undefined;
var domSwipeVar = 0;

var toolSelectorDotWorld = new THREE.Vector3();
var curObjDir = new THREE.Vector3();
var swipeInverter = 1;

function startSwipe(object, type = undefined) {
    consoleLog("==== drag started on " + object + " ====", 0x5500aa);
    domSwipeVar = type;
    if (type == undefined) {
        domswipeObj = object.parent;
    } else if (type == "clipTop" || type == "clipBot") {
        domswipeObj = object;
        domSwipeVar = "clip";
    } else if (type == "clipTopGrip" || type == "clipBotGrip") {
        domswipeObj = object.parent;
        domSwipeVar = "clip";
    } else if (type == "scroll") {
        domswipeObj = object;
    } else if (type == "docbg") {
        domswipeObj = object;
        velocityObjects = [];
        velocityObjects.push( object.parent );
    }

    raycaster.layers.set( 5 );

    toolSelectorDot.getWorldPosition(toolSelectorDotWorld);
    swipeOrigin.set(toolSelectorDotWorld.x,toolSelectorDotWorld.y,toolSelectorDotWorld.z);
}

const magnetTime = 300;
var swipeTime = 0;
const swipeThreshold = 0.5;
var swipeOrigin = new THREE.Vector3();

function stopSwipe() {
    
    if ( domswipeObj != undefined ) {
        consoleLog("==== drag stopped ====");
        if ( domswipeObj.userData.magnetRotY != undefined && domswipeObj.userData.magnetPosY != undefined ) {

            toolSelectorDot.getWorldPosition(toolSelectorDotWorld);
            var swipeDistance = swipeOrigin.distanceTo(toolSelectorDotWorld);
            console.log("Swipe Distance: " + swipeDistance);

            const boxpreview = domswipeObj.children[0].userData.boxpreview;
            if ( swipeTime > pinchThreshold && swipeDistance > swipeThreshold) {
                
                if ( boxpreview != undefined ) {
                    showBoxPreview( boxpreview, 0, domswipeObj, true );
                }


                if ( domswipeObj.userData.type == "reflineGroup" ) {

                    toolSelectorCast.getWorldQuaternion(tempSelectorQuat);
                    var rayForward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(tempSelectorQuat);
                    raycaster.set(tempSelectorWorld, rayForward);
                    var intersects = raycaster.intersectObjects(scene.children);

                    var triggertype = 'none';

                    for (var i = intersects.length - 1; i >= 0; i--) {

                        if ( intersects[i].object.userData != undefined && 
                            intersects[i].object.userData.type != undefined && 
                            intersects[i].object.userData.type == "docbg" ) {

                                triggertype = "docbg";
                        }
                    }

                    if ( triggertype == 'docbg' ) {

                        console.log( domswipeObj );

                        try {

                            // jump to citation
                            var num = domswipeObj.userData.num;
                            var docGroup = domswipeObj.parent.parent;
                            var textBlock = docGroup.userData.textBlock;
                            var textBlockToScrollTo = undefined;

                            console.log( textBlock );
                            
                            for (var i = textBlock.length - 1; i >= 0; i--) {
                                var element = textBlock[i];
                                var citations = element.userData.citations;
                                console.log( element );
                                console.log( citations );
                                if ( citations.length > 0 ) {
                                    for (var j = citations.length - 1; j >= 0; j--) {
                                        if ( citations[j] == num && textBlockToScrollTo == undefined ) {
                                            textBlockToScrollTo = textBlock[i];
                                        }
                                    }
                                }
                            }

                            if ( textBlockToScrollTo != undefined ) {
                                console.log( "Scroll to: " + textBlockToScrollTo );

                                const thisText = textBlockToScrollTo;
                                var scrollPercent;

                                    const clippingStart = docGroup.userData.clippingStart.position.y;
                                    const clippingEnd = docGroup.userData.clippingEnd.position.y;
                                    const viewHeight = clippingEnd - clippingStart + 0.55;
                                    const totalHeight = docGroup.userData.totalHeight;

                                    scrollPercent = norm( thisText.position.y, textBlock[0].position.y - 0.1, -totalHeight - viewHeight + 0.1 );
                                    scrollPercent = clamp( scrollPercent, 0, 1 );

                                // scroll to that position
                                docGroup.userData.scrollPercent = scrollPercent;
                                scrollDocument(docGroup);
                                reclipDocument(docGroup);

                                // briefly tween the text
                                const targetPos = thisText.position.y;
                                thisText.position.y = thisText.position.y + 0.05;

                                new TWEEN.Tween( thisText.position )
                                    .to( {y: targetPos}, 1000 )
                                    .easing( TWEEN.Easing.Elastic.Out )
                                    .start()
                                ;
                            }

                        } catch {}

                    } else {
                        // spawn reference preview box
                        const title = domswipeObj.userData.title;
                        const author = domswipeObj.userData.author;
                        const year = domswipeObj.userData.year;
                        const source = domswipeObj.userData.source;

                        toolSelectorDot.getWorldPosition(toolSelectorDotWorld);

                        const objOrigin = new THREE.Vector3( toolSelectorDotWorld.x, 0, toolSelectorDotWorld.z );
                        const zdistance = objOrigin.distanceTo( _zero );

                        const parentTitle = domswipeObj.parent.parent.userData.title;

                        initBoxCitation( domswipeObj, title, author, year, source, zdistance, parentTitle );

                    }

                }


                domswipeObj.position.y = domswipeObj.userData.magnetPosY;
                domswipeObj.rotation.y = domswipeObj.userData.magnetRotY;

            } else {

                new TWEEN.Tween( domswipeObj.position )
                    .to( {y: domswipeObj.userData.magnetPosY}, magnetTime )
                    .easing( TWEEN.Easing.Circular.Out )
                    .start()
                ;

                if ( domswipeObj.rotation.y <= -Math.PI || domswipeObj.rotation.y >= Math.PI ) {
                    // console.log("GREATER");
                    new TWEEN.Tween( domswipeObj )
                        .to( {rotation: {y: domswipeObj.userData.magnetRotY + (Math.PI * 2) }}, magnetTime )
                        .easing( TWEEN.Easing.Circular.Out )
                        .start()
                        .dynamic(true)
                        .onComplete( function ( object ) {
                            console.log(object);
                            object.rotation.y = object.userData.magnetRotY;
                        });
                    ;
                } else {
                    // console.log("LESSER");
                    new TWEEN.Tween( domswipeObj.rotation )
                        .to( {y: domswipeObj.userData.magnetRotY}, magnetTime )
                        .easing( TWEEN.Easing.Circular.Out )
                        .start()
                    ;
                }
            }
        } else if ( domswipeObj.userData.type == "boxpreview" || domswipeObj.userData.type == "imageGroup" ) {

            if ( domswipeObj.userData.centerpoint != undefined 
                && domswipeObj.userData.centerpoint.userData.lines != undefined
                && domswipeObj.userData.centerpoint.userData.lines.length > 0 ) {

                if ( domswipeObj.userData.image != undefined
                && domswipeObj.userData.image.userData.persistent == true ) {
                } else {

                    var centerpoint = domswipeObj.userData.centerpoint;

                    for (var i = centerpoint.userData.lines.length - 1; i >= 0; i--) {
                        workspace.remove( centerpoint.userData.lines[i] );
                    }

                    centerpoint.userData.lines = undefined;

                }
            }

            if ( domswipeObj.userData.type == "imageGroup" 
                && domswipeObj.userData.image != undefined
                && domswipeObj.userData.image.userData.persistent != true ) {

                new TWEEN.Tween( domswipeObj.userData.image.scale )
                    .to( { x: 0.2, y: 0.2 }, 300 )
                    .easing( TWEEN.Easing.Circular.InOut )
                    .start()
                ;

                new TWEEN.Tween( domswipeObj.userData.image.material )
                    .to( { opacity: 0.4 }, 300 )
                    .easing( TWEEN.Easing.Circular.InOut )
                    .start()
                ;

                // newXan( domswipeObj );

            }

        }

    }

    domswipeObj = undefined;
    swipeTime = 0;
    swipeDistance = 0;
}

var swipeClipLock = false;

function trySwipe() {
    if ( domswipeObj != undefined ) {
        swipeTime += deltaTime;

        // console.log( domswipeObj.rotation.y );

        if (domswipeObj.userData.swipeInverter != undefined) {
            swipeInverter = domswipeObj.userData.swipeInverter;
        }

        toolSelectorDot.getWorldPosition(toolSelectorDotWorld);

        // Vertical movement
        if (domSwipeVar == undefined || domSwipeVar == "clip" || domSwipeVar == "scroll" || domSwipeVar == "docbg") {
            if (!offsetPositionY) {
                offsetPositionY = toolSelectorDotWorld.y;
            }

            var movement = toolSelectorDotWorld.y - offsetPositionY;
            var scale = 1;

            if (domSwipeVar == "clip" || domSwipeVar == "scroll" || domSwipeVar == "docbg") {
                const docGroup = domswipeObj.parent;
                const clippingStart = docGroup.userData.clippingStart;
                const clippingEnd = docGroup.userData.clippingEnd;
                const scrollNub = docGroup.userData.scrollNub;
                const txtGroup = docGroup.userData.txtGroup;

                // consoleLog(clippingStart.position.y - clippingEnd.position.y + movement);

                if (domswipeObj == clippingStart && 
                    clippingStart.position.y - clippingEnd.position.y + movement < 0.3) {
                        domswipeObj.position.y = clippingEnd.position.y + 0.3;
                        movement = 0;
                } else if (domswipeObj == clippingEnd &&
                    clippingStart.position.y - clippingEnd.position.y - movement < 0.3) {
                        domswipeObj.position.y = clippingStart.position.y - 0.3;
                        movement = 0;
                } else if (domswipeObj == scrollNub &&
                    clippingStart.position.y - scrollNub.position.y - movement < 0.05) {
                        domswipeObj.position.y = clippingStart.position.y - 0.05;
                        movement = 0;
                } else if (domswipeObj == scrollNub &&
                    scrollNub.position.y - clippingEnd.position.y + movement < 0.05) {
                        domswipeObj.position.y = clippingEnd.position.y + 0.05;
                        movement = 0;
                }

                scale = domswipeObj.parent.scale.x;

                // update scroll percentage
                if (domswipeObj == scrollNub) {
                    var scrollPercent = norm( domswipeObj.position.y, clippingStart.position.y - 0.05, clippingEnd.position.y + 0.05 );
                    docGroup.userData.scrollPercent = scrollPercent;
                    scrollDocument(docGroup);
                    reclipDocument(docGroup);
                    // consoleLog(scrollPercent);
                } else if (domswipeObj == txtGroup ) {
                    var moveMod = 1;

                    if ( docGroup.userData.isFocused ) {
                        console.log("FOCUSED");
                        moveMod = 2.5;
                    }

                    const txtY = txtGroup.position.y + (movement * moveMod);
                    const totalHeight = docGroup.userData.totalHeight;
                    const viewHeight = clippingEnd.position.y - clippingStart.position.y + 0.55;

                    var scrollPercent = norm( txtY, clippingStart.position.y, totalHeight + viewHeight );
                    var result = clamp( scrollPercent, 0, 1 );
                    
                    docGroup.userData.scrollPercent = result;
                    docGroup.userData.scrollVelocity = movement * moveMod;

                    if ( result <= 0 || result >= 1 ) {
                        movement = 0;
                    }

                }

            }

            if (movement) {
                domswipeObj.position.y += movement / scale;
            }

            offsetPositionY = toolSelectorDotWorld.y;
            
        }

        // Horizontal movement
        if (domSwipeVar == undefined) {
            curObjDir.subVectors(toolSelectorDotWorld, domswipeObj.position).normalize();
            var angle = Math.atan2(curObjDir.x, curObjDir.z);

            if (!offsetAngle) {
                offsetAngle = angle;
            }

            var rotation = angle - offsetAngle;

            if (rotation) {
                domswipeObj.rotation.y += rotation * swipeInverter;
                domswipeObj.userData.swipeRot = domswipeObj.rotation.y;
            }

            offsetAngle = angle;
        }

        if (domSwipeVar == "clip" || domSwipeVar == "docbg") {
            scrollDocument(domswipeObj.parent);
            reclipDocument(domswipeObj.parent);
        }

    }
    else if (offsetPositionY || offsetAngle) {
        offsetPositionY = undefined;
        offsetAngle = undefined;
    }
}

function tryQuickGestures() {
    if ( isDomPinching ) {
        // quick pinch
        twoPinchTime += deltaTime;

        // quick pull/push -- CURRENTLY DISABLED: GESTURE IS TOO AWKWARD TO USE
        // if ( domswipeObj ) {
        //     const pushNum = 0.117;
        //     const pullNum = 0.050;

        //     // get distance
        //     toolSelectorCore.getWorldPosition( toolSelectorCoreWorld );
        //     var velocity = camera.position.distanceTo(toolSelectorCoreWorld) / deltaTime * 100;

        //     pushGestureDistArray.push( velocity );
        //     pushGestureDistArray.shift();

        //     var runningTotal = 0.0;

        //     // get average movement
        //     for (var i = pushGestureDistArray.length - 1; i >= 0; i--) {
        //         runningTotal += pushGestureDistArray[i];
        //     }

        //     runningTotal = runningTotal / pushGestureDistArray.length;

        //     consoleLog( runningTotal.toFixed(3) );

            
        //     // if the movement is fast enough over enough distance, trigger

        //     if ( runningTotal < pullNum ) {
        //         consoleLog("PULL");
        //     } else if ( runningTotal > pushNum ) {
        //         consoleLog("PUSH");
        //     }

        //     // move the object to it's proper location again
        //     pushGestureRef.position.set( toolSelectorCoreWorld.x, toolSelectorCoreWorld.y, toolSelectorCoreWorld.z );
        //     // pushGestureRef.rotation.set( camera.rotation.x, camera.rotation.y, camera.rotation.z );
        //     // pushGestureRef.translateZ( 0.05 );

        // }
    }
}

var offhandGrip = false;
var offhandGripStarted = false;
var offhandGripLastDist = 0.0;
var pushGestureRef = new THREE.Mesh( testGeo, testMat );
scene.add(pushGestureRef);

function tryOffGestures() {

    if ( pinkyFingerTip1.position.distanceTo(wrist1.position) < 0.13 
    && ringFingerTip1.position.distanceTo(wrist1.position) < 0.13
    && middleFingerTip1.position.distanceTo(wrist1.position) < 0.13
    && indexFingerTip1.position.distanceTo(wrist1.position) < 0.13
    && !isMannaActive && domswipeObj != undefined) {

        offhandGrip = true;
        toolSelectorCore.getWorldPosition( toolSelectorCoreWorld );

        // on start: point is set in space
        if ( !offhandGripStarted ) {
            pushGestureRef.position.set( wrist1.position.x, wrist1.position.y, wrist1.position.z );
            offhandGripStarted = true;
            offhandGripLastDist = 0.0;
        }

        var distanceRef = wrist1.position.distanceTo(pushGestureRef.position);

        var distCheckWri = camera.position.distanceTo(wrist1.position);
        var distCheckRef = camera.position.distanceTo(pushGestureRef.position);

        var velocity = offhandGripLastDist - distanceRef;

        if ( distCheckRef < distCheckWri ) {
            velocity = velocity * -1;
        }

        velocity = velocity.toFixed(3) * 10;

        offhandGripLastDist = distanceRef;

        // consoleLog( velocity, 0x5c2ef7 );

        var viewDistance = domswipeObj.userData.viewDistance;
        if ( viewDistance != undefined ) {
            var newView = clamp(parseFloat(viewDistance) + parseFloat(velocity), snapDistanceMin, snapDistanceMax);
            changeDistance( domswipeObj, newView );
            consoleLog( newView );
        } else {
            console.log("NO VIEW DISTANCE");
        }

    } else {
        offhandGrip = false;
        offhandGripStarted = false;
    }
}


function tryVelocity() {
    if ( velocityObjects.length > 0 && domswipeObj == undefined ) {
        for (var i = velocityObjects.length - 1; i >= 0; i--) {
            var scrollVelocity = parseFloat(velocityObjects[i].userData.scrollVelocity);
            scrollVelocity = scrollVelocity * 0.90;

                const docGroup = velocityObjects[i];
                const clippingStart = docGroup.userData.clippingStart;
                const clippingEnd = docGroup.userData.clippingEnd;
                const txtGroup = docGroup.userData.txtGroup;
                
                const txtY = txtGroup.position.y + scrollVelocity;
                const totalHeight = docGroup.userData.totalHeight;
                const viewHeight = clippingEnd.position.y - clippingStart.position.y + 0.55;

                var scrollPercent = norm( txtY, clippingStart.position.y, totalHeight + viewHeight );
                var result = clamp( scrollPercent, 0, 1 );
                
                docGroup.userData.scrollPercent = result;

                if ( result <= 0 || result >= 1 ) {
                    scrollVelocity = 0;
                }

                txtGroup.position.y += scrollVelocity;

            if ( scrollVelocity > -0.0001 && scrollVelocity < 0.0001 ) {
                velocityObjects[i].userData.scrollVelocity = 0;
                velocityObjects.splice(i,1);
            } else {
                velocityObjects[i].userData.scrollVelocity = scrollVelocity;
                scrollDocument(docGroup);
                reclipDocument(docGroup);
            }
        }
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
        debugLogLines[i].color = _colorTXclog;
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


function consoleLog(argument, color = _colorTXclog) {
    var argument = argument.toString();
    console.log(">> " + argument);

    for (var i = debugLogLines.length - 1; i >= 1; i--) {
        debugLogLines[i].text = debugLogLines[i-1].text;
        debugLogLines[i].color = debugLogLines[i-1].color;
    }

    debugLogLine1.text = argument;
    debugLogLine1.color = color;
}


function animateConsoleLog() {
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
        indicateLoaded();
    }

    fr.onerror = () => {
        console.log(fr.error);
    }
});


function initWorkspace() {
    if (uploadedWorkspace) {
        loadWorkspace();
    } else {
        // temporarily turned off
        // loadTextBlock(currentURL);
    }
}

function saveWorkspace() {

    tryResetPreviews();

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

    // filterWorkspace(json_export);

    var content = JSON.stringify(json_export);

    console.log(content);

    // ====== get the current timestamp =====
    const d = new Date();
    let year = d.getFullYear().toString().slice(2,4);
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let hour = d.getHours();
    let minute = d.getMinutes();
    // ======================================

    const file = new File([content], 'workspace-' + month + '.' + day + '.' + year + '-' + hour + '.' + minute + '.json', {
        type: 'text/plain'
    });

    download(file);

    consoleLog("=================== WORKSPACE FINISHED SAVING ===================");

}

function filterWorkspace(content) {
    // iterate through the json and remove the troika glyph bounds?
    // this would save file space, but an immediate solution on how to do this is not obvious to me
}

var pendingRemove = [];
var pendingLineCheck = [];
var pendingOriginUpdate = [];
var pendingDetachedParentSearch = [];
var pendingHandlebarBolt = [];
var pendingHeaderUpdate = [];
var pendingPreviewTextUpdate = [];

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

        if (child.userData.text != undefined) {

            const newText = new Text();
            scene.add( newText );
            child.parent.attach( newText );
            newText.position.set( child.position.x, child.position.y, child.position.z );
            newText.rotation.set( child.rotation.x, child.rotation.y, child.rotation.z );
            newText.scale.set( child.scale.x, child.scale.y, child.scale.z );
            newText.fontSize = child.userData.fontSize;
            newText.color = child.userData.color;
            newText.anchorX = child.userData.anchorX;
            newText.anchorY = child.userData.anchorY;
            newText.curveRadius = child.userData.curveRadius;
            newText.visible = child.visible;

            if (child.userData.text != undefined) {
                newText.text = child.userData.text;
            } else {
                newText.text = "undefined";
            }

            if (child.userData.textAlign != undefined) {
                newText.textAlign = child.textAlign;
            }

            // if (child.userData.clipRect != undefined) {
            //     newText.clipRect = child.userData.clipRect;
            // }

            if (child.userData.lineHeight != undefined) {
                newText.lineHeight = child.userData.lineHeight;
            }

            if (child.name != "") {
                newText.name = child.name;
            }

            for (i in child.userData) {
                newText.userData[i] = child.userData[i];
            }

            if (child.userData.hasMarkup != undefined) {
                newText.outlineWidth = child.userData.outlineWidth;
                newText.outlineColor = child.userData.outlineColor;
                console.log("MARKUP " + child.userData.outlineWidth + " | " + child.userData.outlineColor);
            }

            if (child.userData.maxWidth != undefined) {
                newText.maxWidth = child.userData.maxWidth;
            }

            if (child.userData.layers != undefined) {
                newText.layers.enable( child.userData.layers );
            }

            if (child.parent.userData.textBlock != undefined && child.userData.type == "citation") {
                child.parent.userData.textBlock.push(newText);
            } else if (child.parent.parent.userData.textBlock != undefined && child.userData.type == "doccontent") {
                child.parent.parent.userData.textBlock.push(newText);
            } 

            if (child.userData.type != undefined && child.userData.type.slice(0,11) == "docoutline-") {
                child.parent.parent.userData.outlineBlock.push(newText);
            }

            if (child.userData.lines != undefined) {
                newText.userData.olduuid = child.uuid;
                pendingLineCheck.push(newText);
            }

            if (child.userData.origin != undefined) {
                // console.log("ORIGIN: " + child.userData.origin.object.uuid);
                pendingOriginUpdate.push(newText);
            }

            if (child.userData.detachedParent != undefined) {
                // console.log("Detached Parent: " + child.userData.detachedParent.object.uuid);
                pendingDetachedParentSearch.push(newText);
            }

            if (child.userData.type == "preview") {
                child.parent.userData.previewText = newText;
                // console.log(child.parent);
                // pendingPreviewTextUpdate.push()
            }

            if (child.name == "header") {
                child.parent.userData.header = newText;
            }

            if (child.userData.type == "menubarFocus") {
                child.parent.parent.parent.userData.menubarFocus = newText;
                if (child.parent.parent.parent.userData.isFocused != undefined) {
                    newText.text = "Unfocus";
                }
            }

            pendingRemove.push(child);
            newText.sync();
        }

        if (child.type == "Group" && child.name != "workspace") {

            if (child.userData.swipeRot != undefined) {
                child.rotation.set( 0, child.userData.swipeRot, 0 );
            }

            if (child.userData.textBlock != undefined) {
                child.userData.textBlock = [];
            }

            if (child.userData.outlineBlock != undefined) {
                console.log(child.userData.outlineBlock);
                child.userData.outlineBlock = [];
            }

            if (child.userData.type == "txtgroup") {
                child.parent.userData.txtGroup = child;
            }

            if (child.userData.type == "outlinegroup") {
                child.rotation.set( 0, 0, 0 );
            }

        }

        if (child.userData.type == "handle") {
            child.parent.userData.handle = child;
        }

        if (child.userData.type == "handlebar") {
            child.parent.userData.handlebar = child;
        }

        if (child.userData.type == "focusBG") {
            child.parent.userData.focusBG = child;
        }

        if (child.userData.type == "clipTop") {
            child.parent.userData.clippingStart = child;
        }

        if (child.userData.type == "clipBot") {
            child.parent.userData.clippingEnd = child;
        }

        if (child.userData.type == "menuBar") {
            child.parent.parent.userData.menuBar = child;
        }

        if (child.userData.type == "scrollNub") {
            child.parent.userData.scrollNub = child;
        }

        if (child.userData.type == "scrollBar") {
            child.parent.userData.scrollBar = child;
        }

        if (child.userData.type == "scrollUp") {
            child.parent.userData.scrollUp = child;
        }

        if (child.userData.type == "scrollDown") {
            child.parent.userData.scrollDown = child;
        }

        if (child.userData.type == "background") {
            child.parent.userData.background = child;
            if (child.userData.nearby != undefined) {
                child.userData.nearby = [];
            }
        }

        if (child.userData.type == "outlinegroup") {
            child.parent.userData.outlineGroup = child;
        }

        if (child.userData.type == "closeBtn") {
            child.parent.userData.closeBtn = child;
        }


        

 
    });

    // REMOVE PENDING ELEMENTS =========================================================
    for (var i = pendingRemove.length - 1; i >= 0; i--) {
        // console.log("REMOVE: " + pendingRemove[i]);
        pendingRemove[i].parent.remove(pendingRemove[i]);
        pendingRemove.splice(i,1);
    }

    // SECOND TRAVERSAL THROUGH THE WORKSPACE ==========================================
    workspace.traverse( function(child) {
        // Iterate through the loaded workspace a second time after it has fully loaded.

        if (child.name == "line") {
            console.log(child);

            var findEndObj = child.userData.endObj;

            for (var i = pendingLineCheck.length - 1; i >= 0; i--) {
                for (var j = pendingLineCheck[i].userData.lines.length - 1; j >= 0; j--) {
                    
                    var thisOldUuid = pendingLineCheck[i].userData.olduuid;

                    if (thisOldUuid == child.userData.startObj) {
                        child.userData.startObj = pendingLineCheck[i].uuid;
                        console.log("Found startobj: " + thisOldUuid);

                        pendingLineCheck[i].userData.lines.splice( pendingLineCheck[i].userData.lines[j], 1, child );

                    }
                    if (thisOldUuid == child.userData.endObj) {
                        child.userData.endObj = pendingLineCheck[i].uuid;
                        console.log("Found endobj: " + thisOldUuid);

                        pendingLineCheck[i].userData.lines.splice( pendingLineCheck[i].userData.lines[j], 1, child );

                    }

                }
            }

            if (animatedConnections.includes( child, 0 ) == false) {
                animatedConnections.push(child);
                console.log("Pushed line to array: " + child.uuid);
            }

        }

        if (child.name == "placeholder") {
            // console.log("PLACEHOLDER: " + child.uuid);

            for (var i = pendingOriginUpdate.length - 1; i >= 0; i--) {

                try {
                    var targetuuid = pendingOriginUpdate[i].userData.origin.object.uuid;
                    // console.log("SEARCHING FOR... " + targetuuid);

                    if (child.uuid == targetuuid) {
                        console.log("Found Placeholder: " + child.uuid);
                        pendingOriginUpdate[i].userData.origin = child;
                    }
                }
                catch { }
            }

            child.material = testMat;

            if (child.parent.userData.textBlock != undefined) {
                var textBlock = child.parent.userData.textBlock;
                textBlock.push(child);
            }

        }

        if (child.type == "Group") {
            // detached parent search
            for (var i = pendingDetachedParentSearch.length - 1; i >= 0; i--) {

                try {
                    var targetuuid = pendingDetachedParentSearch[i].userData.detachedParent.object.uuid;
                    // console.log("SEARCHING FOR... " + targetuuid);

                    if (child.uuid == targetuuid) {
                        console.log("Found Detached Parent: " + child.uuid);
                        pendingDetachedParentSearch[i].userData.detachedParent = child;
                    }
                }
                catch { }
            }

            if (child.userData.type == "document") {
                reclipDocument(child);
            }

        }

    });

}

















var libraryTitle, libraryAuthor, libraryYear, libraryAbstract;
const library = new THREE.Group();
var globalLIB;
var globalSAVE = false;
var libFileName = '';

function initLibrary( source = undefined ) {

    var source = source;

    let params = new URLSearchParams( location.search );
    let src = params.get( 'src' );

    if ( src != null ) {
        source = src;
    }

    if ( source == undefined ) {
        source = './lib.json';
    }

    var endofpath = source.lastIndexOf( '/' );
    libFileName = source.slice( endofpath + 1, source.length - 5 );

    applyUrlParam( src );
    
    fetch(source)
    .then((response) => response.json())
    .then((json) => {
        globalLIB = json;

        if ( globalLIB.saveState != undefined && globalLIB.saveState != null) {
            console.log( globalLIB.saveState );
            globalSAVE = true;
        }

        // for (var i = json.documents.length - 1; i >= 0; i--) {
        
        // // Create:
        // const myText = new Text();
        // library.add(myText);
        // myText.layers.enable( 3 );
        // myText.userData.type = "librarydoc";

        // // Set userdata from json
        // myText.userData.title = json.documents[i].title;
        // myText.userData.year = json.documents[i].year;
        // myText.userData.source = json.documents[i].source;

        // for (var j = json.documents[i].author.length - 1; j >= 0; j--) {
        //     if(j==json.documents[i].author.length - 1){ myText.userData.author = json.documents[i].author[j] }
        //     else{
        //         myText.userData.author = myText.userData.author.concat(", ", json.documents[i].author[j]);
        //     }
        // }
        // findAbstract(json.documents[i].source, myText);
        

        // // Set properties to configure:
        // myText.text = json.documents[i].title;
        // myText.fontSize = 0.0002;
        // myText.userData.fontSize = myText.fontSize;
        // myText.color = _colorTXlibr;
        // myText.anchorX = 'right';
        // myText.anchorY = 'middle';

        // myText.position.x = -0.0003;
        // myText.position.y = (i / 2000 - json.documents.length / 4000 - 0.003);
        // // myText.position.z = (Math.random()-0.5) * json.documents.length / 50000 - 0.02;
        // myText.position.z = -0.02;
        // myText.curveRadius = -myText.position.z;

        // myText.sync();

        // }


        // // Library divider line
        // const lineGeo = new THREE.BoxGeometry( 0.00002, 0.01, 0.00002 );
        // const lineMat = new THREE.MeshBasicMaterial( { color: _colorTXlibr } );
        // var dividerLine = new THREE.Mesh( lineGeo, lineMat );
        // library.add(dividerLine);
        // dividerLine.position.set( 0, 0, -0.02);

        // // Library preview title
        // libraryTitle = new Text();
        // library.add(libraryTitle);
        // libraryTitle.text = "";
        // libraryTitle.fontSize = 0.0004;
        // libraryTitle.fontWeight = 'bold';
        // libraryTitle.color = _colorTXlibr;
        // libraryTitle.position.set(0.0003, 0.005, -0.0198);
        // libraryTitle.curveRadius = -libraryTitle.position.z;
        // libraryTitle.sync();

        // // Library preview author(s)
        // libraryAuthor = new Text();
        // library.add(libraryAuthor);
        // libraryAuthor.text = "";
        // libraryAuthor.fontSize = 0.0003;
        // libraryAuthor.color = _colorTXlibr;
        // libraryAuthor.position.set(0.0003, 0.0045, -0.0199);
        // libraryAuthor.curveRadius = -libraryTitle.position.z;
        // libraryAuthor.sync();

        // // Library preview year
        // libraryYear = new Text();
        // library.add(libraryYear);
        // libraryYear.text = "";
        // libraryYear.fontSize = 0.00015;
        // libraryYear.color = _colorTXlibr;
        // libraryYear.position.set(0.0003, 0.0052, -0.02);
        // libraryYear.curveRadius = -libraryYear.position.z;
        // libraryYear.sync();

        // // Library preview abstract
        // libraryAbstract = new Text();
        // library.add(libraryAbstract);
        // libraryAbstract.text = "";
        // libraryAbstract.anchorY = 'top';
        // libraryAbstract.maxWidth = 0.010;
        // libraryAbstract.fontSize = 0.0002;
        // libraryAbstract.color = _colorTXlibr;
        // libraryAbstract.position.set(0.0003, 0.004, -0.02);
        // libraryAbstract.curveRadius = -libraryAbstract.position.z;
        // libraryAbstract.sync();

        // library.visible = false;

    });

}


function establishLibrary() {
    if (uploadedWorkspace) {
        toggleLibrary('close');
        menuMode = 0;
    } else {
        toggleLibrary('open');
    }
}


var rayGeo = new THREE.PlaneGeometry(0.01, 0.01);
var rayMat = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load(
            './ray-1.png'
    ),
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
} );
var allRays = [];

function initRays(parent) {
    
    var rayCount = 7;

    for (var i = rayCount - 1; i >= 0; i--) {
        var ray = new THREE.Mesh( rayGeo, rayMat );
        parent.add(ray);
        // ray.quaternion.set(Math.random(),Math.random(),Math.random(),Math.random());
        ray.rotation.x = Math.random() * (3 + 3) - 3;
        ray.rotation.y = Math.random() * (3 + 3) - 3;
        ray.rotation.z = Math.random() * (3 + 3) - 3;
        // ray.position.set(Math.random(-0.0001, 0.0001),Math.random(-0.0001, 0.0001),Math.random(-0.0001, 0.0001));
        ray.position.x = Math.random() * (0.001 + 0.001) - 0.001;
        ray.position.y = Math.random() * (0.001 + 0.001) - 0.001;
        ray.position.z = Math.random() * (0.001 + 0.001) - 0.001;
        var newscale = Math.random() * (8 - 7) + 7;
        ray.scale.set(newscale,newscale,newscale);
        var speed = Math.random() * (0.01 - 0.001) + 0.001;
        ray.userData.speed = speed;

        allRays.push(ray);
    }

    

}


function animateRays() {
    if (menuMode != 99 || !firstInit) {
        for (var i = allRays.length - 1; i >= 0; i--) {
            var ray = allRays[i];
            var speed = ray.userData.speed;

            ray.rotateZ(-speed);
        }
    }
}


const loaderSize = 0.4;
var loaderGeo = new THREE.PlaneGeometry(loaderSize, loaderSize);
var loaderMat = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load(
            // './ray-2.png' <-- orange loading circle
            './ray-3.png'
    ),
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
} );
var allLoaders = [];


function addLoader(object, position = [0,0,0], rotation = undefined) {
    object.visible = false;
    const spinner = new THREE.Mesh(loaderGeo, loaderMat);
    scene.add(spinner);
    object.userData.loader = spinner;
    // spinner.position.set(object.position.x + position[0] - (loaderSize / 4), object.position.y + position[1], object.position.z + position[2]);
    
    if ( rotation == undefined ) {
        spinner.rotation.y = camera.rotation.y;
    } else {
        consoleLog("addloaderRot", 0xccf3dd);
        spinner.rotation.y = rotation;
    }

    spinner.translateZ( -3.0 );
    allLoaders.push(spinner);
}

function removeLoader(object) {
    object.visible = true;
    const spinner = object.userData.loader;
    object.userData.loader = undefined;
    object.rotation.y = spinner.rotation.y;
    scene.remove(spinner);
    const index = allLoaders.indexOf(spinner);
    allLoaders.splice(index,1);
}


function animateLoader() {
    if (allLoaders.length > 0) {
        for (var i = allLoaders.length - 1; i >= 0; i--) {
            allLoaders[i].rotateZ(-7 * deltaTime);
        }
    }
}



function indicateLoaded() {
    // display a message on the main page that shows that the page is loaded
    $('#loaderping').css("animation-name", "loaderpinganim");
    $('#workspacenotification').css("animation-name", "notificationanim");
}


function getOccurance(array,value) {
    var count = 0;
    array.forEach((val) => (val === value && count++));
    return count;
}













function tryInitMap() {
    if (globalLIB == undefined) {
        console.log("waiting to load map...");
        setTimeout(() => {tryInitMap();},200);
    } else {
        initMap();
    }
}

let mapbg;
var defaultMapScale = snapDistanceMenuValue + 0.2;
let selectableArray = [];
const hitTestPlane = new THREE.PlaneGeometry(1,1);
const mapSelectionGroup = new THREE.Group();
mapspace.add(mapSelectionGroup);

function initMap() {
    // const rndBoundsX = 1.5;
    // const rndBoundsY = 4;
    // var allTitles = [];
    // var allNames = [];
    // var allKeywords = [];
    
    // for (var i = globalLIB.documents.length - 1; i >= 0; i--) {
    //     // get all the titles of every document in the json library
    //     const title = globalLIB.documents[i].title;
    //         // allTitles.push(title);

    //     // get all the names from every document in the json library
    //     var names = globalLIB.documents[i].customData[0].names;
    //     for (var j = names.length - 1; j >= 0; j--) {

    //         // check against duplicates
    //         var num = getOccurance(allNames,names[j]);
    //         if (num == 0) {
    //             // allNames.push(names[j]);
    //         }
 
    //     }

    //     // get all keywords from every document in the json library
    //     var keywords = globalLIB.documents[i].customData[0].keywords;
    //     for (var j = keywords.length - 1; j >= 0; j--) {

    //         // check against duplicates
    //         var num = getOccurance(allKeywords,keywords[j]);
    //         if (num == 0) {
    //             // allKeywords.push(keywords[j]);
    //         }

    //     }

    // }

    // allTitles.reverse();

    // // generate troika text for every element listed above, tagging each with proper userData

    // // -------- Titles --------
    // for (var i = allTitles.length - 1; i >= 0; i--) {
    //     let newGroup = new THREE.Group;
    //     let newText = new Text();
        
    //     newText.position.y = Math.random() * rndBoundsY - (rndBoundsY/2);

    //     newText.text = allTitles[i];
    //     newText.color = _colorTXmap;
    //     newText.fontSize = 0.05;
    //     newText.userData.fontSize = newText.fontSize;
    //     newText.layers.enable( 3 );
    //     newText.anchorX = 'left';
    //     newText.anchorY = 'middle';
    //     newText.textAlign = 'left';
    //     newText.curveRadius = snapDistanceMapValue;
    //     newText.position.z = - snapDistanceMapValue;
    //     newText.userData.type = 'mapcontent-title';

    //     newGroup.userData.viewDistance = snapDistanceMapValue;
    //     newGroup.userData.textLine = newText;

    //     newText.userData.source = globalLIB.documents[i].source;
    //     newText.userData.title = globalLIB.documents[i].title;
    //     newText.userData.author = globalLIB.documents[i].author;

    //     newGroup.add(newText);
    //     selectableArray.push(newText);

    //     newGroup.rotation.y = Math.random() * rndBoundsX - (rndBoundsX/2);
    //     mapspace.add(newGroup);
    //     newText.sync();

    //     // Pass to check and wait for sync to complete
    //     newText.userData.sync = 'mapcontent';
    //     syncCheck.push(newText);
    // }

    // // -------- Names --------
    // for (var i = allNames.length - 1; i >= 0; i--) {
    //     let newGroup = new THREE.Group;
    //     let newText = new Text();
        
    //     newText.position.y = Math.random() * rndBoundsY - (rndBoundsY/2);

    //     newText.text = allNames[i];
    //     newText.color = _colorTXmap;
    //     newText.fontSize = 0.05;
    //     newText.userData.fontSize = newText.fontSize;
    //     newText.layers.enable( 3 );
    //     newText.anchorX = 'left';
    //     newText.anchorY = 'middle';
    //     newText.textAlign = 'left';
    //     newText.curveRadius = snapDistanceMapValue;
    //     newText.position.z = - snapDistanceMapValue;
    //     newText.userData.type = 'mapcontent-name';
    //     newGroup.userData.viewDistance = snapDistanceMapValue;

    //     newGroup.add(newText);
    //     selectableArray.push(newText);

    //     newGroup.rotation.y = Math.random() * rndBoundsX - (rndBoundsX/2);

    //     mapspace.add(newGroup);
    //     newText.sync();

    //     // Pass to check and wait for sync to complete
    //     newText.userData.sync = 'mapcontent';
    //     syncCheck.push(newText);
    // }

    // // -------- Keywords --------
    // for (var i = allKeywords.length - 1; i >= 0; i--) {
    //     let newGroup = new THREE.Group;
    //     let newText = new Text();
        
    //     newText.position.y = Math.random() * rndBoundsY - (rndBoundsY/2);

    //     newText.text = allKeywords[i];
    //     newText.color = _colorTXmap;
    //     newText.fontSize = 0.05;
    //     newText.userData.fontSize = newText.fontSize;
    //     newText.layers.enable( 3 );
    //     newText.anchorX = 'left';
    //     newText.anchorY = 'middle';
    //     newText.textAlign = 'left';
    //     newText.curveRadius = snapDistanceMapValue;
    //     newText.position.z = - snapDistanceMapValue;
    //     newText.userData.type = 'mapcontent-keyword';
    //     newGroup.userData.viewDistance = snapDistanceMapValue;

    //     newGroup.add(newText);
    //     selectableArray.push(newText);

    //     newGroup.rotation.y = Math.random() * rndBoundsX - (rndBoundsX/2);
        
    //     mapspace.add(newGroup);
    //     newText.sync();

    //     // Pass to check and wait for sync to complete
    //     newText.userData.sync = 'mapcontent';
    //     syncCheck.push(newText);
    // }
    
    
    // Create a background cylinder
    var mapbgmat = new THREE.MeshBasicMaterial( {
        color: _colorBGmain,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.5,
        visible: false,
        depthWrite: false,
        depthTest: true
    } );
    const mapbggeo = new THREE.CylinderGeometry(
            (1),
            (1),
            30, 32, 1, false);
    mapbg = new THREE.Mesh( mapbggeo, mapbgmat );
    mapbg.layers.enable( 3 );
    mapbg.layers.enable( 5 );
    mapbg.userData.type = 'mapbg';
    mapspace.add(mapbg);
    mapbg.scale.set(defaultMapScale,1,defaultMapScale);


}


let isMapSelecting = false;
let mapSelectingStart = new THREE.Vector3( 0.0, 0.0, 0.0 );
let mapSelectingEnd = new THREE.Vector3( 0.0, 0.0, 0.0 );
let mapSelectingMesh;
const mapSelectingMat = new THREE.MeshBasicMaterial( {
    color: _colorHImap,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
} );
var mapSelectingDir = new THREE.Vector3();
const mapSelectingOrigin = new THREE.Vector3(0,0,0);
var vertexWorld = new THREE.Vector3();
var mapSelectingRaycaster = new THREE.Raycaster();
mapSelectingRaycaster.layers.set( 4 );

var selectingAngleStart, selectingAngleEnd;
var selectedObjects = [];

function startMapSelector() {
    consoleLog("SELECTION BOX");
    isMapSelecting = true;
    toolSelectorDot.getWorldPosition(toolSelectorDotWorld);
    mapSelectingStart.x = toolSelectorDotWorld.x;
    mapSelectingStart.y = toolSelectorDotWorld.y;
    mapSelectingStart.z = toolSelectorDotWorld.z;
    mapSelectingEnd = toolSelectorDotWorld;
}


function tryMapSelector() {
    if (isDomPinching && isMapSelecting) {
        // while selecting, update the cylinder geometry by disposing of the current mesh

        updateMapSelectorGeo(mapSelectingStart, mapSelectingEnd);

    } else if (isMapSelecting) {
        // at end of selection, add all objects within the bounds to a selection array and color them
        updateMapSelectorGeo(mapSelectingStart, mapSelectingEnd, true);

        var angleStart = Math.atan2(mapSelectingStart.x, mapSelectingStart.z);

        const positionAttribute = mapSelectingMesh.geometry.getAttribute( 'position' );

        const vertex = new THREE.Vector3();

        const height = Math.abs( positionAttribute.array[1] * 2 );

        // deselect all objects
        if (selectedObjects.length > 0) {

            for (var i = selectedObjects.length - 1; i >= 0; i--) {
                selectedObjects[i].fontWeight = "normal";

                mapspace.attach(selectedObjects[i].parent);
            }

            selectedObjects = [];
        }

        for ( let i = 0; i < positionAttribute.count; i ++ ) {

            vertex.fromBufferAttribute( positionAttribute, i ); // read vertex
            mapSelectingMesh.localToWorld( vertex );

            if ( vertex.y > mapSelectingMesh.position.y ) { // this is the top of the bounding box

                mapSelectingRaycaster.set(vertex, _ybackward);
                mapSelectingRaycaster.far = height;
                var intersects = mapSelectingRaycaster.intersectObjects( mapspace.children );

                for (var j = intersects.length - 1; j >= 0; j--) {
                    const intersect = intersects[j];
                    const target = intersect.object.userData.target;

                    if ( selectedObjects.indexOf(target) == -1 ) {
                        selectedObjects.push(target);
                        consoleLog(target.text);
                    }
                    
                }
                
                placeholderArrow( mapSelectingRaycaster, height, _colorHImap, 200 );
                placeholderPoint( vertex.x, vertex.y, vertex.z, 0.02, 200 + (i*10));
            
            } else {
                // botVertices.push(vertex.clone());
                placeholderPoint( vertex.x, vertex.y, vertex.z, 0.05, 200 + (i*10));
            }

        }

        // select all objects
        if (selectedObjects.length > 0) {
            // console.log(selectedObjects);

            for (var i = selectedObjects.length - 1; i >= 0; i--) {
                selectedObjects[i].fontWeight = "bold";
                mapSelectionGroup.attach(selectedObjects[i].parent);
            }

        }

        mapSelectingMesh.parent.remove(mapSelectingMesh);
        mapSelectingMesh.geometry.dispose();
        mapSelectingMesh = undefined;
        isMapSelecting = false;

    }
}

function updateMapTextBounds(object) {
    const newBox = new THREE.Box3().setFromObject(object);

    const dimensions = new THREE.Vector3().subVectors( newBox.max, newBox.min );
    const boxGeo = new THREE.BoxGeometry( dimensions.x, dimensions.y, dimensions.z );

    const matrix = new THREE.Matrix4().setPosition( dimensions.addVectors( newBox.min, newBox.max ).multiplyScalar( 0.5 ));
    boxGeo.applyMatrix4( matrix );

    const mesh = new THREE.Mesh( boxGeo, testMat );
    mesh.userData.target = object;
    scene.add(mesh);
    object.parent.attach(mesh);

    mesh.layers.enable( 4 );
}

function updateMapSelectorGeo(start, end, readout = false) {
    // create a cylinder with the theta point centered on the start

    toolSelectorDot.getWorldPosition(toolSelectorDotWorld);
    mapSelectingEnd = toolSelectorDotWorld;

    selectingAngleStart = Math.atan2(start.x, start.z);
    selectingAngleEnd = Math.atan2(end.x, end.z);
    var thetaLength = selectingAngleEnd-selectingAngleStart;
    var thetaStart = 0;

    if (thetaLength > Math.PI) {
        thetaStart = thetaLength;
        thetaLength = Math.PI*2 - thetaLength;
    } else if (thetaLength < -Math.PI) {
        thetaStart = thetaLength;
        thetaLength = -Math.PI*2 - thetaLength;
    }

    var w,h;
    if (readout) {
        w = 64;
        h = 1;
    } else {
        w = 16
        h = 1;
    }

    const newGeo = new THREE.CylinderGeometry(
        (snapDistanceMapValue),
        (snapDistanceMapValue),
        (end.y-start.y), w, h, true, thetaStart,
        thetaLength
    );

    if (mapSelectingMesh == undefined) {
        mapSelectingMesh = new THREE.Mesh(newGeo, mapSelectingMat);
        mapspace.add(mapSelectingMesh);
    } else {
        mapSelectingMesh.geometry.dispose();
        mapSelectingMesh.geometry = newGeo;
    }
    
    mapSelectingMesh.position.y = start.y + (end.y-start.y)/2;
    mapSelectingMesh.rotation.y = selectingAngleStart;


}





















// FINGER MANNA MENU ========================================================================

// Dominant hand: Point/select
// Non-Dominant hand: Menu host

// Use hand axes to check if the palm is facing the camera
    // if point extended from palm is closer than wrist joint, activate the manna menu

// While the palm is facing, manna menu is active
    // Rings appear on each finger tip
    // Text lables appear alongside the rings and always face the camera (like the debug log)
    // A 'magic' point appears on the opposite hand's index finger tip

// The rings grow as the pointer gets closer - clamped by a min and max size

// If the pointer touches the ring, give a visual feedback (maybe a color pulse)
// Also reveal a circuit menu that branches out
// The magic point is now stuck to the circuit unless the opposite hand moves too far away

// Moving the finger moves the point along the circuit
    // Branching paths in the circuit are handled by picking the route closest to the finger

// At the end of the circuit paths are menu nodes
    // If the magic point makes it to the node, the menu item is triggered and the circuit closes

var isMannaActive = false;
var isMannaSet = false;
var isMannaUsed = false;
var mannaBases = [];
var mannaNodes = [];
var mannaDot = new THREE.Group();
var mannaDotPoint = new THREE.Group();
var mannaArray = [];
var mannaPointDest = mannaDotPoint;
var mannaPointLast = mannaPointDest;
var mannaBreak = false;

function initManna() {
    newMannaDot(indexFingerTip2);

/*0*/ const manna00000 = newMannaRing( palm1,
    /* connections */ [ 0,1,2,3,4,5 ],
    /* labels */      [ 1,2,3,4,5 ],
    /* offset */      [ 0.0, 0.00, 0.02 ],
    /* function */    'swaphands' );
    newMannaLabel(manna00000, "Swap Hands", true);

/*1*/ const manna10000 = newMannaRing( thumbTip1,
    /* connections */ [ 0,1,2,3,4,5,9 ],
    /* labels */      [ 0,2,3,4,5,9 ],
    /* offset */      [ 0.0, 0.0, 0.0 ] );
    newMannaLabel(manna10000, "Restore Space");

    /*2-2*/ const manna11000 = newMannaRing( manna10000,
        /* connections */ [ 0,1,2,3,4,5,9 ],
        /* labels */      [ 0,2,3,4,5,9 ],
        /* offset */      [ 0.015, 0.035, 0.0 ],
        /* function */    'restore' );
        newMannaLabel(manna11000, "Confirm?", true);
        newMannaLine(manna11000, 0.026, -24, [0.001,0,0], true);

/*2*/ const manna20000 = newMannaRing( indexFingerTip1,
    /* connections */ [ 0,1,2,3,4,5,6,7,8 ],
    /* labels */      [ 0,1,3,4,5,6,7,8 ],
    /* offset */      [ 0.0, 0.0, 0.0 ] );
    newMannaLabel(manna20000, "Pointer Beam");

    /*2-1*/ const manna21000 = newMannaRing( manna20000,
        /* connections */ [ 0,1,2,3,4,5,6 ],
        /* labels */      [ 0,1,3,4,5,6 ],
        /* offset */      [ -0.01, 0.05, 0.0 ],
        /* function */    'pointeron' );
        newMannaLabel(manna21000, "Always On", true);
        newMannaLine(manna21000, 0.039, 11, [-0.001,0,0]);

    /*2-2*/ const manna22000 = newMannaRing( manna20000,
        /* connections */ [ 0,1,2,3,4,5,7 ],
        /* labels */      [ 0,1,3,4,5,7 ],
        /* offset */      [ 0.015, 0.035, 0.0 ],
        /* function */    'pointersmart' );
        newMannaLabel(manna22000, "Smart Assist", true);
        newMannaLine(manna22000, 0.026, -24, [0.001,0,0]);

    /*2-3*/ const manna23000 = newMannaRing( manna20000,
        /* connections */ [ 0,1,2,3,4,5,8 ],
        /* labels */      [ 0,1,3,4,5,8 ],
        /* offset */      [ 0.04, 0.02, 0.0 ],
        /* function */    'pointeroff' );
        newMannaLabel(manna23000, "Always Off", true);
        newMannaLine(manna23000, 0.034, -63, [0.002,-0.002,0]);

/*3*/ const manna30000 = newMannaRing( middleFingerTip1,
    /* connections */ [ 0,1,2,3,4,5 ],
    /* labels */      [ 0,1,2,4,5 ],
    /* offset */      [ 0.0, 0.0, 0.0 ],
    /* function */    'savestate' );
    newMannaLabel(manna30000, "Save Workspace");

/*4*/ const manna40000 = newMannaRing( ringFingerTip1,
    /* connections */ [ 0,1,2,3,4,5 ],
    /* labels */      [ 0,1,2,3,5 ],
    /* offset */      [ 0.0, 0.0, 0.0 ],
    /* function */    'toggledebug' );
    newMannaLabel(manna40000, "Toggle Debug");

/*5*/ const manna50000 = newMannaRing( pinkyFingerTip1,
    /* connections */ [ 0,1,2,3,4,5 ],
    /* labels */      [ 0,1,2,3,4 ],
    /* offset */      [ 0.0, 0.0, 0.0 ],
    /* function */    'exit' );
    newMannaLabel(manna50000, "Exit Space");



    // newMannaLabel(manna11000, "Option A", true);
    //     newMannaLabel(manna11100, "Select One (A)", true);
    //     newMannaLabel(manna11200, "Select Two (A)", true);

    // newMannaLabel(manna12000, "Option B", true);
    //     newMannaLabel(manna12100, "Select One (B)", true);
    //     newMannaLabel(manna12200, "Select Two (B)", true);
    //     newMannaLabel(manna12300, "Select Three (B)", true);

    // newMannaLine(manna11000, 0.032, -28, [0.001,0,0]);
    // newMannaLine(manna12000, 0.032, -63, [0.002,-0.002,0]);
    // newMannaLine(manna11100, 0.040, -17, [0.021,0.04,0]);
    // newMannaLine(manna11200, 0.042, -80, [0.024,0.0385,0]);

    // newMannaLine(manna12100, 0.054, -27, [0.041,0.02,0]);
    // newMannaLine(manna12200, 0.052, -67, [0.044,0.0185,0]);
    // newMannaLine(manna12300, 0.050, -108,[0.043,0.016,0]);

    // newMannaLabel(manna51000, "Settings", true);
    // newMannaLine(manna51000, 0.028, -14, [0.001,0,0]);

    // Array of the base manna nodes
    mannaBases = [manna00000,manna10000,manna20000,manna30000,manna40000,manna50000];
    mannaNodes = mannaBases;

    // Array of all manna nodes, including inactive ones
    mannaArray = [manna00000,manna10000,manna20000,manna30000,manna40000,manna50000,manna21000,manna22000,manna23000,manna11000];

    // Hide all manna
    mannaDot.visible = false;
    for (var i = mannaArray.length - 1; i >= 0; i--) { mannaArray[i].visible = false; }

}

function killManna() {
    for (var i = mannaBases.length - 1; i >= 0; i--) {
        mannaBases[i].clear();
    }

    mannaDot.parent.remove(mannaDot);
    mannaDot = new THREE.Group();


    mannaBases = [];
    mannaNodes = [];
    mannaArray = [];
    mannaPointDest = mannaDotPoint;
    mannaPointLast = mannaPointDest;

    isMannaActive = false;
    isMannaSet = false;
    isMannaUsed = false;
    mannaBreak = false;
}

function newMannaRing(parent, nodes, labels = [], offset = [0,0,0], funct = 'none') {
    const ringGroup = new THREE.Group();
    const ring = new Text();
    ring.text = "o";
    ring.fontSize = 0.03;
    ring.anchorX = 'center';
    ring.anchorY = 'middle';
    ring.outlineWidth = 0.0;
    // ring.outlineBlur = 0.002;
    ring.outlineColor = _colorManaT;
    ring.color = _colorManna;

    ringGroup.add(ring);
    parent.add(ringGroup);
    ring.position.set(offset[0],offset[1],0);
    ring.rotation.set(0,0,0);
    ring.scale.y = 0.85;

    ringGroup.userData.mannaNodes = nodes;
    ringGroup.userData.labelNodes = labels;
    ringGroup.userData.zoffset = offset[2];

    ring.sync();
    // ringGroup.visible = false;

    if ( funct != 'none' ) {

        ringGroup.userData.function = funct;

        const dot = new Text();
        dot.text = ".";
        dot.fontSize = 0.05;
        dot.anchorX = 'center';
        dot.anchorY = 'middle';
        dot.color = _colorManaT;

        ringGroup.add(dot);
        dot.position.set(offset[0],offset[1],0);
        dot.rotation.set(0,0,0);
        dot.translateY(0.014);
        dot.translateZ(-0.002);

        dot.sync();

    }

    return ringGroup;
}   

function newMannaDot(parent) {
    const dot = new Text();
    dot.text = ".";
    dot.fontSize = 0.05;
    dot.anchorX = 'center';
    dot.anchorY = 'middle';
    dot.outlineWidth = 0.0;
    // dot.outlineBlur = 0.002;
    dot.outlineColor = _colorManaT;
    dot.color = _colorManna;

    mannaDot.add(dot);
    scene.add(mannaDot);
    parent.add(mannaDotPoint);

    dot.position.set(0,0,0);
    dot.rotation.set(0,0,0);
    dot.translateY(0.015);

    mannaDotPoint.position.set(0,0,0);
    mannaDotPoint.rotation.set(0,0,0);
    mannaDotPoint.translateZ(-0.01);

    dot.sync();
    mannaDot.visible = false;
}

function newMannaLabel(parent, label = "label", offsetObj = false, color = _colorManaT) {
    const newText = new Text();
    newText.text = label;
    newText.color = color;
    newText.fontSize = 0.01;
    newText.anchorY = 'bottom';

    var mod = 1;
    if (currentDominant == 'left') { 
        mod = -1;
        newText.anchorX = 'right';
    } else {
        newText.anchorX = 'left';
    }


    if (offsetObj == false) {
        newText.position.set(0.005 * mod,0.005,0);
    } else {
        const offset = parent.children[0];
        newText.position.x = offset.position.x + (0.005 * mod);
        newText.position.y = offset.position.y + 0.005;
        newText.position.z = offset.position.z + 0.000;
    }
    
    parent.add(newText);
    parent.userData.mannaLabel = newText;
    newText.sync();
}

var debugMannaLine;

$( '#debugBtn' ).on( 'click', function() {
    const length = $( '#length' ).val();
    const rotation = $( '#rotation' ).val();
    const offsetx = $( '#offsetx' ).val();
    const offsety = $( '#offsety' ).val();

    debugMannaLine.position.set(parseFloat(offsetx),parseFloat(offsety),0);

    debugMannaLine.scale.z = length;

    debugMannaLine.rotation.y = Math.PI/180 * rotation;

    debugMannaLine.translateZ((-length/2) - 0.003);

});

function newMannaLine(object, length = 0.045, rotation = -28, offset = [0,0,0], mannaDebug = false) {
    const lineGeo = new THREE.BoxGeometry( 0.003, 0.003, 1 );
    const lineMat = new THREE.MeshBasicMaterial( { color: _colorManna } );
    const thisLine = new THREE.Mesh( lineGeo, lineMat );

    object.add(thisLine);

    thisLine.position.set(offset[0],offset[1],offset[2]);

    thisLine.scale.z = length;

    thisLine.rotation.x = Math.PI/2;
    thisLine.rotation.y = Math.PI/180 * rotation;

    thisLine.translateZ((-length/2) - 0.003);

    thisLine.visible = true;

    if(mannaDebug){
        debugMannaLine = thisLine;
        $( '#length' ).val(length);
        $( '#rotation' ).val(rotation);
        $( '#offsetx' ).val(offset[0]);
        $( '#offsety' ).val(offset[1]);
    }
}

function tryManna() {
    palmNormal.getWorldPosition(palmNormalWorld);
    const d1 = camera.position.distanceTo(palmNormalWorld);
    const d2 = camera.position.distanceTo(wrist1.position);

    if ( d1 < d2 ) {
        isMannaActive = true;
    } else {
        isMannaActive = false;
    }


    if ( isMannaActive && !mannaBreak) {
        // The manna menu is active, run functions

        // Finger pinched - trigger a function
        if ( isDomPinching && !isDomPinchConsumed) {
            isDomPinchConsumed = true;
            const funct = mannaPointDest.parent.userData.function;
            if ( funct != undefined ) { triggerManna(funct); mannaBreak = true; }
        }

        // set rotations of the rings
        for (var i = mannaBases.length - 1; i >= 0; i--) {
            var zoffset = 0;
            if ( mannaBases[i].userData.zoffset != undefined ) { zoffset = mannaBases[i].userData.zoffset; }

            mannaBases[i].lookAt(camera.position);
            mannaBases[i].position.set(0,0,0);
            mannaBases[i].translateZ(0.02 + zoffset);
        }

        mannaDot.lookAt(camera.position);

        if ( !isMannaSet ) {
            // The manna menu has just been opened
            isMannaSet = true;
            lastIntersect = undefined;

            // Make the components visible
            for (var i = mannaBases.length - 1; i >= 0; i--) {
                mannaBases[i].visible = true;
            }

            mannaDot.visible = true;

        }

        // Calculate the closest manna node
        mannaPointDest = mannaDotPoint;
        var mannaDistance = 0.08;

        for (var i = mannaNodes.length - 1; i >= 0; i--) {
            var thisNode = mannaNodes[i].children[0];
            thisNode.getWorldPosition(tempWorldPos);
            var thisDistance = tempWorldPos.distanceTo(indexFingerTip2.position);
            if ( thisDistance < mannaDistance ) {
                mannaDistance = thisDistance;
                mannaPointDest = thisNode;
            }
        }

        // Manna point is moved to the current destination point
        mannaPointDest.getWorldPosition(tempWorldPos);
        mannaDot.position.set(tempWorldPos.x,tempWorldPos.y,tempWorldPos.z);
        mannaDot.translateY(-0.001);

        // Check if the current node has changed
        if (mannaPointLast != mannaPointDest) {
            consoleLog("CHANGED MANNA", 0xff3333);
            mannaPointLast = mannaPointDest;

            for (var i = mannaArray.length - 1; i >= 0; i--) {
                mannaArray[i].visible = false;
                const label = mannaArray[i].userData.mannaLabel;
                if ( label != undefined ) { label.visible = false; }
            }

            // Push the active nodes into the mannaNodes array
            var newNodes = mannaPointDest.parent.userData.mannaNodes;
            // console.log(mannaPointDest.parent);
            if (newNodes != undefined) {
                isMannaUsed = true;
                mannaNodes = [];
                for (var i = newNodes.length - 1; i >= 0; i--) {
                    mannaNodes.push(mannaArray[newNodes[i]]);
                    mannaArray[newNodes[i]].visible = true;
                }
                const mannaLabels = mannaPointDest.parent.userData.labelNodes;
                for (var i = mannaLabels.length - 1; i >= 0; i--) {
                    const label = mannaArray[mannaLabels[i]].userData.mannaLabel;
                    if ( label != undefined ) { label.visible = true; }
                }
            } else {
                isMannaUsed = false;
                mannaNodes = mannaBases;
                for (var i = mannaNodes.length - 1; i >= 0; i--) {
                    mannaNodes[i].visible = true;
                    const label = mannaNodes[i].userData.mannaLabel;
                    if ( label != undefined ) { label.visible = true; }
                }
            }

        }


    } else {
        // The manna menu is no longer active

        if ( isMannaSet ) {
            // The manna menu has just been closed
            isMannaSet = false;
            mannaBreak = false;

            // Make the components hidden
            for (var i = mannaBases.length - 1; i >= 0; i--) {
                mannaBases[i].visible = false;
            }

            mannaDot.visible = false;

            // Reset the selected nodes
            mannaNodes = mannaBases;
            mannaPointDest = mannaDotPoint;

        }
    }
}

const mannaFlashGeo = new THREE.SphereGeometry( 0.005 );
const mannaFlashMat = new THREE.MeshBasicMaterial( {
    color: _colorTools,
    transparent: true,
    opacity: 0.85,
    depthWrite: false
} );
const mannaFlash = new THREE.Mesh( mannaFlashGeo, mannaFlashMat );

function triggerManna(funct) {
    consoleLog(funct, 0x55aaff);

    mannaDot.add( mannaFlash );
    mannaFlash.position.set( 0, 0, 0 );
    scene.attach( mannaFlash );

    new TWEEN.Tween( mannaFlash.scale )
    .to( {x: 5, y: 5, z: 5}, 250 )
    .easing( TWEEN.Easing.Quadratic.Out )
    .start()
    .onUpdate(function() {
        mannaFlash.material.opacity = 5 - mannaFlash.scale.x;
    })
    .onComplete(() => {
        mannaFlash.scale.set( 1, 1, 1 );
        mannaFlash.material.opacity = 1;
        scene.remove( mannaFlash );
    });




    if ( funct == "swaphands" ) {
        swapHands();
    } else if ( funct == "exit" ) {
        renderer.xr.getSession().end();
    } else if ( funct == "pointeron" ) {
        toolSelectorBeamCustomRules = true;

        toolSelectorTip.visible = true;
        toolSelectorTip.scale.set( 1,1,1 );
        toolSelectorTip2.visible = true;
        toolSelectorTip2.scale.set( 1,1,1 );
        toolSelectorBeam.visible = true;

        const toolSelectorFadeInTween = new TWEEN.Tween( toolColorMat )
            .to( { opacity: 1 }, 500 )
            .easing( TWEEN.Easing.Linear.None )
            .start()

    } else if ( funct == "pointersmart" ) {
        toolSelectorBeamCustomRules = false;

    } else if ( funct == "pointeroff" ) {
        toolSelectorBeamCustomRules = true;

        const toolSelectorFadeInTween = new TWEEN.Tween( toolColorMat )
            .to( { opacity: 0 }, 500 )
            .easing( TWEEN.Easing.Linear.None )
            .start()
            .onComplete(() => {
                toolSelectorTip.visible = false;
                toolSelectorTip.scale.set( 0,0,0 );
                toolSelectorTip2.visible = false;
                toolSelectorTip2.scale.set( 0,0,0 );
                toolSelectorBeam.visible = false;
        });

    } else if ( funct == "toggledebug" ) {

        if (debugMode) {
            debugMode = false;
        } else {
            debugMode = true;
        }
        showDebug();

    } else if ( funct == "togglecolorspace" ) {

        if ( colorSpace == "linear" ) {
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            colorSpace = "srgb";
        } else if ( colorSpace == "srgb" ) {
            renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
            colorSpace = "linear";
        }

        renderer.xr.getSession().end();

    } else if ( funct == "reset" ) {
        collapsing = true;
        for (var i = toCollapse.length - 1; i >= 0; i--) {
            tryPointerSelect(toCollapse[i]);
        }

        toCollapse = [];
        showBoxCatalog('none');

        for (var i = boxMenuItems.length - 1; i >= 0; i--) {
                boxMenuItems[i].userData.bold = undefined;
                boxMenuItems[i].font = _fontserif;
            }

        setTimeout(() => {
            collapsing = false;
        }, 1000);

    } else if ( funct == "savestate" ) {
        saveState();

    } else if ( funct == "restore" ) {
        triggerManna('reset');

        setTimeout(() => {
            loadState();
        }, 500);
        
    }

}


function swapHands() {
    // hand 2 = dominant
    // hand 1 = non-dominant
    var dummyHand = hand1;
    hand1 = hand2;
    hand2 = dummyHand;

    var dummyJoint = wrist1;
    wrist1 = wrist2;
    wrist2 = dummyJoint;

    dummyJoint = thumbTip1;
    thumbTip1 = thumbTip2;
    thumbTip2 = dummyJoint;

    dummyJoint = thumbDistal1;
    thumbDistal1 = thumbDistal2;
    thumbDistal2 = dummyJoint;

    dummyJoint = indexFingerTip1;
    indexFingerTip1 = indexFingerTip2;
    indexFingerTip2 = dummyJoint;

    dummyJoint = indexDis1;
    indexDis1 = indexDis2;
    indexDis2 = dummyJoint;

    dummyJoint = middleFingerTip1;
    middleFingerTip1 = middleFingerTip2;
    middleFingerTip2 = dummyJoint;

    dummyJoint = middleDistal1;
    middleDistal1 = middleDistal2;
    middleDistal2 = dummyJoint;

    dummyJoint = ringFingerTip1;
    ringFingerTip1 = ringFingerTip2;
    ringFingerTip2 = dummyJoint;

    dummyJoint = pinkyFingerTip1;
    pinkyFingerTip1 = pinkyFingerTip2;
    pinkyFingerTip2 = dummyJoint;

    dummyJoint = indexKnuckle1;
    indexKnuckle1 = indexKnuckle2;
    indexKnuckle2 = dummyJoint;

    dummyJoint = palm1;
    palm1 = palm2;
    palm2 = dummyJoint;

    currentDominant = hand2.userData.handedness;

    killManna();
    initManna();

    wrist1.add( palmNormal );
    isDomPinching = false;

    reorientPointer();

    wrist1.attach(sphereHelperSolid);
    sphereHelperSolid.position.set(0,0,0);

    if (menuMode != 99) {
        wrist1.attach(sphereHelper);
        sphereHelper.position.set(0,0,0);
    }
    
    
}
















// ====================================================================================================
// ============================================= BOX MENU =============================================
// ====================================================================================================

const boxMat = new THREE.MeshBasicMaterial({
        color: _colorBXmain,
        side: THREE.DoubleSide
});

const boxMenu = new THREE.Group();
var boxMenuHidden = undefined;
const boxCatalogs = [];
const boxPreviews = [];
const boxMenuItems = [];
const boxMenuDot = new THREE.Mesh( sphereGeo, boxMat );

function initBoxMenu(argument) {        // The start menu box for selecting categories to sort documents
    
    scene.add( boxMenu );

    boxMenu.add( boxMenuDot );
    boxMenuDot.visible = false;

    const boxOutline = genBox( boxMenu, 0.8, 1.85, snapDistanceMenuValue + 0.1 );
    boxOutline.position.y = 0.3;

    var headerTxt = globalLIB.library;
    if (headerTxt.length > 20) {
        headerTxt = headerTxt.slice(0,20);
    }
    var prePadder = "                                                                      ";

    const header = new Text();
    header.text = headerTxt;
    header.fontSize = 0.05;
    header.curveRadius = snapDistanceMenuValue + 0.1;
    header.color = _colorBXmain;
    header.maxWidth = 0.8;
    header.anchorY = "bottom";
    header.anchorX = "center";
    header.textAlign = 'center';
    header.font = _fontserifbold;
    boxMenu.add(header);
    header.rotation.y =  0.4 / -(snapDistanceMenuValue + 0.1);
    header.translateZ( -snapDistanceMenuValue - 0.1 );
    header.sync();

    const headbar = genBar( boxMenu, 0.5, 0.8, snapDistanceMenuValue + 0.1 );
    headbar.position.y = -0.05;

    const allPapers = new Text();
    allPapers.text = "              All Papers";
    allPapers.fontSize = 0.05;
    allPapers.userData.fontSize = 0.05;
    allPapers.curveRadius = snapDistanceMenuValue + 0.1;
    allPapers.color = _colorBXmain;
    allPapers.textAlign = 'left';
    allPapers.font = _fontserif;
    boxMenu.add( allPapers );
    allPapers.position.z = -snapDistanceMenuValue - 0.1;
    allPapers.sync();
    allPapers.position.y = -0.25;
    allPapers.userData.type = 'boxMenu-all';
    allPapers.layers.enable( 3 );
    boxMenuItems.push(allPapers);

    const longPapers = new Text();
    longPapers.text = "              Long Papers";
    longPapers.fontSize = 0.05;
    longPapers.userData.fontSize = 0.05;
    longPapers.curveRadius = snapDistanceMenuValue + 0.1;
    longPapers.color = _colorBXmain;
    longPapers.textAlign = 'left';
    longPapers.font = _fontserif;
    boxMenu.add( longPapers );
    longPapers.position.z = -snapDistanceMenuValue - 0.1;
    longPapers.sync();
    longPapers.position.y = -0.35;
    longPapers.userData.type = 'boxMenu-long';
    longPapers.layers.enable( 3 );
    boxMenuItems.push(longPapers);

    const shortPapers = new Text();
    shortPapers.text = "              Short Papers";
    shortPapers.fontSize = 0.05;
    shortPapers.userData.fontSize = 0.05;
    shortPapers.curveRadius = snapDistanceMenuValue + 0.1;
    shortPapers.color = _colorBXmain;
    shortPapers.textAlign = 'left';
    shortPapers.font = _fontserif;
    boxMenu.add( shortPapers );
    shortPapers.position.z = -snapDistanceMenuValue - 0.1;
    shortPapers.sync();
    shortPapers.position.y = -0.45;
    shortPapers.userData.type = 'boxMenu-short';
    shortPapers.layers.enable( 3 );
    boxMenuItems.push(shortPapers);

    const posters = new Text();
    posters.text = "              Posters";
    posters.fontSize = 0.05;
    posters.userData.fontSize = 0.05;
    posters.curveRadius = snapDistanceMenuValue + 0.1;
    posters.color = _colorBXmain;
    posters.textAlign = 'left';
    posters.font = _fontserif;
    boxMenu.add( posters );
    posters.position.z = -snapDistanceMenuValue - 0.1;
    posters.sync();
    posters.position.y = -0.55;
    posters.userData.type = 'boxMenu-poster';
    posters.layers.enable( 3 );
    boxMenuItems.push(posters);

    const workshops = new Text();
    workshops.text = "              Workshops";
    workshops.fontSize = 0.05;
    workshops.userData.fontSize = 0.05;
    workshops.curveRadius = snapDistanceMenuValue + 0.1;
    workshops.color = _colorBXmain;
    workshops.textAlign = 'left';
    workshops.font = _fontserif;
    boxMenu.add( workshops );
    workshops.position.z = -snapDistanceMenuValue - 0.1;
    workshops.sync();
    workshops.position.y = -0.65;
    workshops.userData.type = 'boxMenu-workshop';
    workshops.layers.enable( 3 );
    boxMenuItems.push(workshops);

    const byAuthor = new Text();
    byAuthor.text = "              By Author";
    byAuthor.fontSize = 0.05;
    byAuthor.userData.fontSize = 0.05;
    byAuthor.curveRadius = snapDistanceMenuValue + 0.1;
    byAuthor.color = _colorBXmain;
    byAuthor.textAlign = 'left';
    byAuthor.font = _fontserif;
    boxMenu.add( byAuthor );
    byAuthor.position.z = -snapDistanceMenuValue - 0.1;
    byAuthor.sync();
    byAuthor.position.y = -0.85;
    byAuthor.userData.type = 'boxMenu-author';
    byAuthor.layers.enable( 3 );
    boxMenuItems.push(byAuthor);

    const byInstitution = new Text();
    byInstitution.text = "              By Institution";
    byInstitution.fontSize = 0.05;
    byInstitution.userData.fontSize = 0.05;
    byInstitution.curveRadius = snapDistanceMenuValue + 0.1;
    byInstitution.color = _colorBXmain;
    byInstitution.textAlign = 'left';
    byInstitution.font = _fontserif;
    boxMenu.add( byInstitution );
    byInstitution.position.z = -snapDistanceMenuValue - 0.1;
    byInstitution.sync();
    byInstitution.position.y = -0.95;
    byInstitution.userData.type = 'boxMenu-institution';
    byInstitution.layers.enable( 3 );
    boxMenuItems.push(byInstitution);

    const botbar = genBar( boxMenu, 0.5, 0.8, snapDistanceMenuValue + 0.1 );
    botbar.position.y = -1.25;

    var yearTxt = globalLIB.year;
    var preSmallPadder = "                                                                                                                                   ";

    const year = new Text();
    year.text = preSmallPadder.concat(yearTxt);
    year.fontSize = 0.03;
    year.curveRadius = snapDistanceMenuValue + 0.1;
    year.color = _colorBXmain;
    year.maxWidth = 0.8;
    year.anchorY = "bottom";
    year.textAlign = 'center';
    year.font = _fontserifbold;
    boxMenu.add(year);
    year.position.z = -snapDistanceMenuValue - 0.1;
    year.position.y = -1.35;
    year.sync();


    for (var i = globalLIB.documents.length - 1; i >= 0; i--) {

        const title = globalLIB.documents[i].title;
        const source = globalLIB.documents[i].source;
        const year = globalLIB.documents[i].year;
        const type = globalLIB.documents[i].type;

        var author = "";
        for (var j = globalLIB.documents[i].author.length - 1; j >= 0; j--) {
            author = author.concat( globalLIB.documents[i].author[j] );
            if ( j > 1 ) {
                author = author.concat( ", " );
            } else if ( j > 0 ) {
                author = author.concat( " and " );
            }
        }
        initBoxPreview( title, author, year, source, type );
    }

    startBoxMenu();
    addLoader(boxMenu, [0, 0, 0], boxMenu.rotation.y );

    initBoxCatalog('all');
    initBoxCatalog('long');
    initBoxCatalog('short');
    initBoxCatalog('poster');
    initBoxCatalog('workshop');
    initBoxCatalog('author');
    // initBoxCatalog('institution'); <-- leave non-functional for now
}


function startBoxMenu() {
    boxMenu.rotation.y = Math.PI + camera.rotation.y;
    boxMenu.rotateY( Math.PI );
    boxMenu.position.y = 99;
}

function checkBoxMenu() {

    if ( !boxMenuPremiered ) {
        var catalogProgress = "Loading catalog... " + (catalogGenerationMax - catalogGeneration) + "/" + catalogGenerationMax;
        consoleLog( catalogProgress, 0xccffff );
    }

    if ( catalogGeneration == 0 && !boxMenuPremiered ) {
        removeLoader( boxMenu );
        boxMenu.position.y = camera.position.y;
        boxMenuPremiered = true;

        if ( globalSAVE ) { loadState() };
    }

}

var catalogGeneration = 0;
var catalogGenerationMax = 0;
var boxMenuPremiered = false;

function initBoxCatalog(argument) {     // The large box that lists all documents in the current category
    const boxCatalog = new THREE.Group();

    const elements = [];

    if ( argument == 'all' ) {

        var header = "#" + globalLIB.library;
        elements.push( header );

        // build the bib for every paper in the library
        for (var i = 0; i <= globalLIB.documents.length - 1; i++) {
            
            var element = globalLIB.documents[i].title;
            element = element.concat(" -- ");

            var author = "";
            for (var j = globalLIB.documents[i].author.length - 1; j >= 0; j--) {
                author = author.concat( globalLIB.documents[i].author[j] );
                if ( j > 1 ) {
                    author = author.concat( ", " );
                } else if ( j > 0 ) {
                    author = author.concat( " and " );
                }
            }

            element = element.concat( author );

            elements.push( element );
        }

    } else if ( argument == 'long' || argument == 'short' || argument == 'poster' || argument == 'workshop' ) {
        
        var header = "#" + globalLIB.library + " - " + argument[0].toUpperCase() + argument.slice(1) + " Papers";
        elements.push( header );

        // build the bib for all 'long' papers in the library
        for (var i = 0; i <= globalLIB.documents.length - 1; i++) {
            if ( globalLIB.documents[i].type == argument ) {

                var element = globalLIB.documents[i].title;
                element = element.concat(" -- ");

                var author = "";
                for (var j = globalLIB.documents[i].author.length - 1; j >= 0; j--) {
                    author = author.concat( globalLIB.documents[i].author[j] );
                    if ( j > 1 ) {
                        author = author.concat( ", " );
                    } else if ( j > 0 ) {
                        author = author.concat( " and " );
                    }
                }
            
            element = element.concat( author );

            elements.push( element );

            }

        }

    } else if ( argument == 'author' ) {

        const allAuthors = [];

        // get all the authors from every document in the json library
        for (var i = globalLIB.documents.length - 1; i >= 0; i--) {
            var authors = globalLIB.documents[i].author;
            for (var j = authors.length - 1; j >= 0; j--) {

                // check against duplicates
                var num = getOccurance(allAuthors,authors[j]);
                if (num == 0) {
                    allAuthors.push(authors[j]);
                }
     
            }
        }

        allAuthors.sort().reverse();

        for (var i = allAuthors.length - 1; i >= 0; i--) {

            elements.push( "#".concat(allAuthors[i]) );

            for (var j = globalLIB.documents.length - 1; j >= 0; j--) {
                
                for (var k = globalLIB.documents[j].author.length - 1; k >= 0; k--) {

                    if ( allAuthors[i] == globalLIB.documents[j].author[k] ) {

                        var element = globalLIB.documents[j].title;
                        element = element.concat(" -- ");

                        var author = "";
                        for (var l = globalLIB.documents[j].author.length - 1; l >= 0; l--) {
                            author = author.concat( globalLIB.documents[j].author[l] );
                            if ( l > 1 ) {
                                author = author.concat( ", " );
                            } else if ( l > 0 ) {
                                author = author.concat( " and " );
                            }
                        }
                    
                        element = element.concat( author );

                        elements.push( element );

                    }
                    
                }

            }

        }

    }

    scene.add(boxCatalog);

    boxCatalog.visible = false;
    boxCatalog.position.y = 99;

    catalogGeneration++;
    catalogGenerationMax++;

    stepBoxCatalog( boxCatalog, elements );

    boxCatalog.userData.catalog = argument;

    boxCatalogs.push( boxCatalog );
}


function stepBoxCatalog( parent, elements, step=0, lastText = undefined ) {

    var element = elements[step];
    // console.log(element);

    const tempBox = new THREE.Box3().setFromObject(parent);
    tempBox.getSize(tempSize);
    var totalHeight = tempSize.y;
    if ( lastText != undefined ) {
        lastText.userData.botPos = -totalHeight;
    }

    var padding = 0.02;
    var margin = 0.1;

    if (step == 0) { padding = 0; }

    if ( step + 1 <= elements.length ) {

        const newText = new Text();
        newText.text = element;
        newText.fontSize = 0.035;
        newText.userData.fontSize = 0.035;
        newText.curveRadius = snapDistanceMenuValue;
        newText.color = _colorBXmain;
        newText.textAlign = 'left';
        newText.font = _fontserif;
        parent.add( newText );
        newText.position.z = -snapDistanceMenuValue;
        newText.maxWidth = 2;

        // special styles for headers
        if ( element.slice(0,1) == '#' ) {
            var newelement = element.slice(1);
            newText.text = newelement;
            newText.font = _fontserifblack;
            newText.fontSize = 0.038;
            newText.userData.fontSize = 0.038;
            newText.position.y = -totalHeight - (padding * 1.5);
        } else {
            const newGroup = new THREE.Group();
            parent.add( newGroup );
            newText.position.y = -totalHeight - padding;
            newText.userData.type = 'catalogPaper';
            newGroup.attach( newText );
            newGroup.userData.magnetRotY = newGroup.rotation.y;
            newGroup.userData.magnetPosY = newGroup.position.y;

            newText.userData.topPos = -totalHeight;
            newText.userData.botPos = 0;

            var title = element.split(' -- ')[0];
            for (var i = boxPreviews.length - 1; i >= 0; i--) {
                if ( title == boxPreviews[i].userData.title ) {

                    newText.userData.boxpreview = boxPreviews[i];

                }
            }
            newText.layers.enable( 3 );
        }

        newText.sync();
    
        // Pass to check and wait for sync to complete
        newText.userData.sync = 'catalogBuilder';
        newText.userData.syncParent = parent;
        newText.userData.syncElements = elements;
        newText.userData.syncStep = step+1;
        syncCheck.push(newText);
    } else {
        const box = genBox( parent, 2 + (margin * 2), totalHeight + (margin * 2) );

        box.rotation.y = margin / snapDistanceMenuValue;
        box.position.y = margin;

        parent.userData.totalHeight = totalHeight;
        parent.userData.margin = margin;

        const topLine = genCurve( parent, 2 + (margin * 2), 0.0025 );
        const botLine = genCurve( parent, 2 + (margin * 2), 0.0025 );

        topLine.position.y = 0.1;
        topLine.rotateY( 0.1 / snapDistanceMenuValue );
        botLine.position.y = -totalHeight - 0.1;
        botLine.rotateY( 0.1 / snapDistanceMenuValue );

        parent.userData.topLine = topLine;
        parent.userData.botLine = botLine;

        catalogGeneration--;

    }

}

var activeBoxCatalog = undefined;

function showBoxCatalog(argument) {     // Toggle the chosen box to display
    // consoleLog( argument );

    showBoxPreview();

    lockBoxMenu();

    for (var i = boxCatalogs.length - 1; i >= 0; i--) {
        if ( boxCatalogs[i].userData.catalog == argument ) {

            var totalHeight = boxCatalogs[i].userData.totalHeight;
            var margin = boxCatalogs[i].userData.margin;

            const topLine = boxCatalogs[i].userData.topLine;
            const botLine = boxCatalogs[i].userData.botLine;
            if ( topLine != undefined && botLine != undefined ) {
                topLine.position.y = 0 + 0.1;
                botLine.position.y = -totalHeight - 0.1;
            }

            boxMenuDot.visible = true;
            boxMenuDot.position.set( 0, 0, 0 );
            boxMenuDot.position.y = boxMenuItems[i].position.y - 0.035;

            boxMenuDot.rotation.y = - 0.1 / (snapDistanceMenuValue + 0.1);

            boxMenuDot.translateZ( - snapDistanceMenuValue - 0.1 );

            boxMenuDot.scale.set( 0, 0, 0 );

            new TWEEN.Tween( boxMenuDot.scale )
                .to( {x: 0.2, y: 0.2, z: 0.2}, 300 )
                .easing( TWEEN.Easing.Quadratic.Out )
                .start()
            ;


            try {
                boxCatalogs[i].visible = true;

                boxCatalogs[i].position.y = boxMenu.position.y + (totalHeight/2) - (1.85/2) + 0.3;

                if (currentDominant == 'right') {
                    boxCatalogs[i].rotation.y = boxMenu.rotation.y + ((2 + margin) / snapDistanceMenuValue);
                } else {
                    boxCatalogs[i].rotation.y = boxMenu.rotation.y - ((0.78 + margin) / snapDistanceMenuValue);
                }

                lockBoxMenu( boxCatalogs[i] );
            } 
            catch {
                console.log("Error while displaying the catalog - it might still be loading, so wait a short while and try again.");
            }

        } else {

            boxCatalogs[i].visible = false;
            boxCatalogs[i].position.y = 99;
        }
    }

    
}


function lockBoxMenu( catalog = undefined ) {
    // if ( boxMenuRotTween != undefined ) {
    //     boxMenuRotTween.pause();
    // }

    if ( catalog != undefined ) {
        // attach to catalog
        catalog.attach( boxMenu );
        boxMenuHidden = false;

    } else {
        // detach from catalogs
        boxMenuHidden = undefined;
        scene.attach(boxMenu);
    }
}


var hideBoxMenuTimer = 0;
const boxMenuTimerCap = 3.0;
var boxMenuRotTween = new TWEEN.Tween( boxMenu.rotation );

function tryHideBoxMenu( hide = true ) {

    if ( hide && boxMenuHidden == false ) { hideBoxMenuTimer += deltaTime; }

    // console.log( hideBoxMenuTimer );
    
    if ( hide && boxMenuHidden == false && hideBoxMenuTimer >= boxMenuTimerCap ) {

        var rotvalue;

        if ( currentDominant == 'right' ) {

            rotvalue = - 1.45 / (snapDistanceMenuValue + 0.1);

        } else if ( currentDominant == 'left' ) {

            rotvalue = 0.2 / (snapDistanceMenuValue + 0.1);

        }

        boxMenuRotTween.pause();

        boxMenuRotTween = new TWEEN.Tween( boxMenu.rotation )
            .to( {y: rotvalue}, 600 )
            .easing( TWEEN.Easing.Cubic.InOut )
            .start()
        ;

        boxMenuHidden = true;
        hideBoxMenuTimer = 0;

    } else if ( !hide && boxMenuHidden == true ) {

        hideBoxMenuTimer = 0;
        boxMenuHidden = false;
        var rotvalue;

        if ( currentDominant == 'right' ) {

            rotvalue = - 2.15 / (snapDistanceMenuValue + 0.1);

        } else if ( currentDominant == 'left' ) {

            rotvalue = 0.9 / (snapDistanceMenuValue + 0.1);

        }

        boxMenuRotTween.pause();

        boxMenuRotTween = new TWEEN.Tween( boxMenu.rotation )
            .to( {y: rotvalue}, 600 )
            .easing( TWEEN.Easing.Cubic.InOut )
            .start()
        ;

    } else if ( !hide ) {

        hideBoxMenuTimer = 0;

    }
}

function showBoxPreview( target, height, catalog, freeform=false, collapsed=false, restoration=undefined ) {     // Toggle the chosen preview box to display
    
    toolSelectorDot.getWorldPosition(toolSelectorDotWorld);

    // hide the other previews
    if (!freeform) {
        for (var i = boxPreviews.length - 1; i >= 0; i--) {
            boxPreviews[i].position.y = 99;
            boxPreviews[i].visible = false;
        }

        if ( target != undefined ) {

            target.visible = true;
            target.position.y = toolSelectorDotWorld.y + (height/2);

            if (currentDominant == 'right') {
                target.rotation.y = catalog.rotation.y - ( 2 / (snapDistanceMenuValue - 0.1) );
            } else {
                target.rotation.y = catalog.rotation.y - ( 2 / (snapDistanceMenuValue - 0.1) );
            }

        }

    } else {
        // clone the preview
        const newClone = target.clone();
        workspace.add(newClone);

        // edit the preview to contain the menu items
        var totalHeight = newClone.userData.totalHeight;

        for (var i = newClone.children.length - 1; i >= 0; i--) {
            if ( newClone.children[i].type == "Group" ) {
                newClone.remove(newClone.children[i]);
            }
        }

        const maxwidth = 1.6;
        const margin = 0.2;
        const distance = snapDistanceMenuValue + 0.1;

        const bar = genCurve( newClone, 1.2, 0.0025, snapDistanceMenuValue - 0.15 );
        bar.rotation.y = ((maxwidth/2) + 0.6) / (snapDistanceMenuValue - 0.1);
        bar.position.y = -totalHeight - 0.1;


        const closeTxt = new Text();
        newClone.add(closeTxt);
        closeTxt.color = _colorBXmain;
        closeTxt.curveRadius = snapDistanceMenuValue - 0.1;
        closeTxt.fontSize = 0.060;
        closeTxt.text = "         -";
        closeTxt.anchorX = "right";
        closeTxt.anchorY = "middle";
        closeTxt.sync();

        toCollapse.push(closeTxt);

        closeTxt.position.y = -totalHeight - 0.22;
        closeTxt.rotation.y = (((maxwidth+0.1)/2) - 0.03) / -distance;
        closeTxt.translateZ( -snapDistanceMenuValue + 0.1 );

        closeTxt.layers.enable( 3 );
        closeTxt.userData.fontSize = closeTxt.fontSize;
        closeTxt.userData.type = "boxpreview-close";

        const barTxt = new Text();
        newClone.add(barTxt);
        barTxt.color = _colorBXmain;
        barTxt.curveRadius = snapDistanceMenuValue - 0.1;
        barTxt.fontSize = 0.030;
        barTxt.text = "|";
        barTxt.anchorX = "center";
        barTxt.sync();

        barTxt.position.y = -totalHeight - 0.2;
        barTxt.rotation.y = ((maxwidth+0.1)/2) / -distance;
        barTxt.translateZ( -snapDistanceMenuValue + 0.1 );

        const focusTxt = new Text();
        newClone.add(focusTxt);
        focusTxt.color = _colorBXmain;
        focusTxt.curveRadius = snapDistanceMenuValue - 0.1;
        focusTxt.fontSize = 0.060;
        focusTxt.text = "+         #";
        focusTxt.clipRect = [0, -0.1, 0.17, 0.1];
        focusTxt.anchorX = "left";
        focusTxt.anchorY = "middle";
        focusTxt.sync();

        focusTxt.position.y = -totalHeight - 0.22;
        focusTxt.rotation.y = (((maxwidth+0.1)/2) + 0.03) / -distance;
        focusTxt.translateZ( -snapDistanceMenuValue + 0.1 );

        focusTxt.layers.enable( 3 );
        focusTxt.userData.fontSize = focusTxt.fontSize;
        // focusTxt.userData.type = "boxpreview-focus";
        focusTxt.userData.type = "boxpreview-expand";

        newClone.userData.focusTxt = focusTxt;

        totalHeight = totalHeight + 0.2;

        const box = genBox( newClone, maxwidth + margin, totalHeight + margin, snapDistanceMenuValue - 0.1, -1, 0.0025, ["flexbox"] );
        box.position.y = margin/2;
        box.rotation.y = (margin/2)/distance;

        newClone.userData.totalHeight = totalHeight;
        // console.log(box);



        // shrink the box - disabled so it starts full sized

        for (var i = newClone.children.length - 1; i >= 0; i--) {
            if (newClone.children[i].name == "abstract") {
                box.userData.box.abstract = newClone.children[i];
            } else if (newClone.children[i].name == "details") {
                box.userData.box.details = newClone.children[i];
            }
        }

        box.userData.closeTxt = closeTxt;
        box.userData.barTxt = barTxt;
        box.userData.focusTxt = focusTxt;
        box.userData.bar = bar;

        // var boxjson = box.userData.box;
        // var boxbot = boxjson.bot;
        // var boxleft = boxjson.left;
        // var boxright = boxjson.right;
        // var boxback = boxjson.back;
        // var boxistall = boxjson.tall;
        // var boxheight = boxjson.height;
        // var abstract = boxjson.abstract;
        // var details = boxjson.details;

        // const newheight = newClone.userData.miniheight + 0.3;

        // boxleft.scale.y = newheight;
        // boxright.scale.y = newheight;
        // boxback.scale.y = newheight;

        // boxleft.position.y = -newheight/2;
        // boxright.position.y = -newheight/2;
        // boxback.position.y = -newheight/2;

        // boxbot.position.y = (-newheight) - 0.0;

        // closeTxt.position.y = -newheight + 0.2;
        // barTxt.position.y = -newheight + 0.2;
        // focusTxt.position.y = -newheight + 0.2;
        // bar.position.y = -newheight + 0.25;

        // abstract.scale.y = 0.0;
        // abstract.visible = false;

        // details.position.y = -newheight + 0.3;
        // details.scale.y = 0.0;
        // details.visible = false;

        newClone.userData.minified = false;

        newClone.userData.minitimer = 0;

        minifyCountdown(newClone);




        // position the new preview
        newClone.visible = true;

        if (!collapsed) {
            newClone.position.y = toolSelectorDotWorld.y;
        } else if (restoration == undefined) {
            newClone.position.y = catalog.position.y;
        }

        if (restoration == undefined) {

            catalog.getWorldQuaternion( tempWorldQuat );
            newClone.rotation.setFromQuaternion( tempWorldQuat );

        } else {

            newClone.rotation.y = restoration.yRot;
            newClone.position.y = restoration.yPos;

        }

        addSaved(newClone);

        newClone.scale.y = 0;

        // tween in the new preview
        new TWEEN.Tween( newClone.scale )
            .to( {y: 1}, 300 )
            .easing( TWEEN.Easing.Circular.Out )
            .start()
        ;

    }


}


function initBoxPreview(title, author, year, source, type) {     // The preview box that displays document abstract and info
    // console.log(title);

    const newGroup = new THREE.Group();
    workspace.add( newGroup );
    newGroup.userData.title = title;
    boxPreviews.push( newGroup );

    newGroup.position.y = Math.random() * 8 - 4;
    newGroup.rotation.y = Math.random() * Math.PI - Math.PI/2;
    stepBoxPreview( newGroup, title, author, year, source, type );

    newGroup.position.y = 99;
    newGroup.visible = false;
    newGroup.userData.type = "boxpreview";
    newGroup.userData.source = source;
    newGroup.userData.title = title;
    newGroup.userData.author = author;
}


function stepBoxPreview(parent, title, author, year, source, type, step = 0) {
    const maxwidth = 1.6;
    const distance = -snapDistanceMenuValue + 0.1
    const newText = new Text();
    var totalHeight = 0;

    if ( step > 0 ) {
        const tempBox = new THREE.Box3().setFromObject(parent);
        tempBox.getSize(tempSize);
        totalHeight = tempSize.y;
    }

    parent.add(newText);
    newText.color = _colorBXmain;
    newText.maxWidth = maxwidth;
    newText.position.set(0, -totalHeight, distance);
    newText.curveRadius = -newText.position.z;
    newText.fontSize = 0.035;
    newText.font = _fontserif;

    if ( step == 0 ) {
        // Title
        newText.text = title;
        newText.fontSize = 0.038;
        newText.font = _fontserifblack;
    } else if ( step == 1 ) {
        // author
        newText.text = author;
        newText.font = _fontserifitalic;
    } else if ( step == 2 ) {
        // get abstract
        parent.userData.miniheight = totalHeight;

        $.ajax({
            url: source,
            type: 'GET',
            dataType: 'html',
            success: function(data) {
                var $html = $(data);

                // Find the class 'abstract' and read the inner html
                var abstract = $html.find('.abstract');
                var result = abstract.text();
                console.log(result);

                if ( result != "" ) {
                    newText.text = "\n".concat(result);
                    newText.sync();
                    newText.name = "abstract";
                    newText.userData.sync = "previewBuilder";
                    newText.userData.syncParent = parent;
                    newText.userData.syncAuthor = author;
                    newText.userData.syncYear = year;
                    newText.userData.syncSource = source;
                    newText.userData.syncType = type;
                    newText.userData.syncStep = step + 1;
                    syncCheck.push( newText );
                } else {
                    stepBoxPreview( parent, title, author, year, source, type, 3 );
                }
                
            },
            error: function(xhr, status, error) {
                console.error('Error fetching HTML: ', error);
            }
        });
        
    } else if ( step == 3 ) {
        // date and paper type
        var prePadder = "\n";
        newText.text = prePadder.concat(year + ", " + type[0].toUpperCase() + type.slice(1) + " Paper");
        newText.anchorX = 'center';
        newText.fontSize = 0.03;
        newText.position.z = 0;
        newText.rotation.y = (((maxwidth)/2) + 0.01 )/distance;
        newText.translateZ( distance );
        newText.name = "details";
    } else if ( step == 4 ) {
        // generate box
        const margin = 0.2;
        const box = genBox( parent, maxwidth + margin, totalHeight + margin, -distance );
        box.position.y = margin/2;
        box.rotation.y = -(margin/2)/distance;

        parent.userData.totalHeight = totalHeight;
    }

    newText.sync();

    if ( step < 4  && step != 2) {
        newText.userData.sync = "previewBuilder";
        newText.userData.syncParent = parent;
        newText.userData.syncAuthor = author;
        newText.userData.syncYear = year;
        newText.userData.syncSource = source;
        newText.userData.syncType = type;
        newText.userData.syncStep = step + 1;
        syncCheck.push( newText );
    }

}







function initBoxCitation( swipeObj, title, author, year, source, zdistance, parentTitle, restoration = undefined ) {     // The preview box that displays the citation info
    // console.log( title, author, year, source );

    const newGroup = new THREE.Group();
    workspace.add( newGroup );

    if ( restoration == undefined ) {
        swipeObj.children[0].getWorldPosition(tempWorldPos);
        newGroup.position.y = tempWorldPos.y;
        newGroup.rotation.y = swipeObj.rotation.y + swipeObj.parent.parent.rotation.y - ( 1.6 / zdistance );
    } else {
        newGroup.position.y = restoration.yPos;
        newGroup.rotation.y = restoration.yRot;
    }

    newGroup.visible = false;

    newGroup.userData.type = "boxpreview";
    newGroup.userData.typealt = "refpreview";
    newGroup.userData.source = source;
    newGroup.userData.title = title;
    newGroup.userData.author = author;
    newGroup.userData.year = year;
    newGroup.userData.zdistance = zdistance;
    newGroup.userData.parentTitle = parentTitle;

    stepBoxCitation( newGroup, title, author, year, source, 0, zdistance );
}


function stepBoxCitation( parent, title, author, year, source, step = 0, zdistance = snapDistanceOneValue ) {
    // citation preview boxes have the reference title, author, 'further info' (the year, maybe?)
    // bar at the bottom with "   -   |   +   " to [close] and [open link externally]

    const maxwidth = 1.6;
    const distance = -zdistance + 0.01
    const newText = new Text();
    var totalHeight = 0;

    if ( step > 0 ) {
        const tempBox = new THREE.Box3().setFromObject(parent);
        tempBox.getSize(tempSize);
        totalHeight = tempSize.y;
    }

    parent.add(newText);
    newText.color = _colorBXmain;
    newText.maxWidth = maxwidth;
    newText.position.set(0, -totalHeight, distance);
    newText.curveRadius = -distance;
    newText.fontSize = 0.035;
    newText.font = _fontserif;

    if ( step == 0 ) {
        // Title
        newText.text = title;
        newText.fontSize = 0.038;
        newText.font = _fontserifblack;
    } else if ( step == 1 ) {
        // author
        newText.text = author;
        newText.font = _fontserifitalic;
    } else if ( step == 2 ) {
        // year
        var prePadder = "\n";
        newText.text = prePadder.concat(year);
        newText.anchorX = 'center';
        newText.fontSize = 0.03;
        newText.position.z = 0;
        newText.rotation.y = ( (maxwidth)/2 )/distance;
        newText.translateZ( distance );
        newText.name = "details";
    } else if ( step == 3 ) {
        // bar and buttons
        const bar = genCurve( parent, 1.2, 0.0025, -distance );
        bar.rotation.y = ( -(maxwidth/2) - 0.6) / distance;
        bar.position.y = -totalHeight - 0.05;


        const closeTxt = new Text();
        parent.add(closeTxt);
        closeTxt.color = _colorBXmain;
        closeTxt.curveRadius = -distance;
        closeTxt.fontSize = 0.060;
        closeTxt.text = "         -";
        closeTxt.anchorX = "right";
        closeTxt.anchorY = "middle";
        closeTxt.sync();

        toCollapse.push(closeTxt);

        closeTxt.position.y = -totalHeight - 0.12;
        closeTxt.rotation.y = (((maxwidth)/2) - 0.03) / distance;
        closeTxt.translateZ( distance );

        closeTxt.layers.enable( 3 );
        closeTxt.userData.fontSize = closeTxt.fontSize;
        closeTxt.userData.type = "boxcitation-close";

        const barTxt = new Text();
        parent.add(barTxt);
        barTxt.color = _colorBXmain;
        barTxt.curveRadius = -distance;
        barTxt.fontSize = 0.030;
        barTxt.text = "|";
        barTxt.anchorX = "center";
        barTxt.sync();

        barTxt.position.y = -totalHeight - 0.1;
        barTxt.rotation.y = ((maxwidth)/2) / distance;
        barTxt.translateZ( distance );

        const focusTxt = new Text();
        parent.add(focusTxt);
        focusTxt.color = _colorBXmain;
        focusTxt.curveRadius = -distance;
        focusTxt.fontSize = 0.060;
        focusTxt.text = "+         #";
        focusTxt.clipRect = [0, -0.1, 0.17, 0.1];
        focusTxt.anchorX = "left";
        focusTxt.anchorY = "middle";
        focusTxt.sync();

        focusTxt.position.y = -totalHeight - 0.12;
        focusTxt.rotation.y = (((maxwidth)/2) + 0.03) / distance;
        focusTxt.translateZ( distance );

        focusTxt.layers.enable( 3 );
        focusTxt.userData.fontSize = focusTxt.fontSize;

        // console.log( parent.userData.source );

        if ( parent.userData.source.length < 4 ) {
            focusTxt.fillOpacity = 0.3;
        } else {
            focusTxt.userData.type = "boxcitation-expand";
        }

        parent.userData.focusTxt = focusTxt;

    } else if ( step == 4 ) {
        // generate box
        const margin = 0.2;
        const box = genBox( parent, maxwidth + margin, totalHeight + margin, -distance, -1, 0.0025, ['refpreview'] );
        box.position.y = margin/2;
        box.rotation.y = -(margin/2)/distance;

        parent.userData.maxWidth = maxwidth;
        parent.userData.totalHeight = totalHeight;
        parent.userData.distance = distance;

        // generate the center point
        const point = new THREE.Mesh( placeholderPointGeo, testMat );
        parent.add( point );
        
        point.scale.set( 0.1, 0.1, 0.1 );

        point.rotation.y = box.rotation.y + ( ( (maxwidth + margin ) / distance ) / 2 );
        point.position.y = box.position.y - ( ( totalHeight + margin ) / 2 );
        point.translateZ( distance + 0.04 );

        parent.userData.centerpoint = point;

        // tween in the citation
        parent.visible = true;

        addSaved(parent);

        parent.scale.y = 0;

        new TWEEN.Tween( parent.scale )
            .to( {y: 1}, 300 )
            .easing( TWEEN.Easing.Circular.Out )
            .start()
        ;

    }

    newText.sync();

    if ( step < 4 ) {
        newText.userData.sync = "citationBoxBuilder";
        newText.userData.syncGroup = parent;
        newText.userData.syncAuthor = author;
        newText.userData.syncYear = year;
        newText.userData.syncSource = source;
        newText.userData.syncStep = step + 1;
        newText.userData.syncZdistance = zdistance;
        syncCheck.push( newText );
    }
}


function warnCitation( parent, source ) {
        // popup warning when opening external link
        // tapping anywhere else triggers closePopup() and cancels the warning
        // tapping "confirm" closes the XR experience and opens the link in a new tab
            // "This document is not in your library"
            //       "and will open externally."
            // 
            //          ____________________
            // 
            //                confirm

    if ( citationwarning != undefined ) {
        workspace.remove( citationwarning );
        citationwarning = undefined;
    }

    const maxwidth = 0.8;
    const distance = parent.userData.distance + 0.003;
    const newText = new Text();
    const newGroup = new THREE.Group();

    workspace.add( newGroup );
    newGroup.add( newText );
    newGroup.userData.parent = parent;
    newGroup.userData.source = source;

    newGroup.rotation.y = parent.rotation.y + ( ( ( parent.userData.maxWidth/2 ) - 0.4 ) / (distance-0.003) );
    newGroup.position.y = parent.position.y - parent.userData.totalHeight - 0.1;

    newText.text = "This document is not in your library\nand will open externally."
    newText.color = _colorBXmain;
    newText.maxWidth = maxwidth;
    newText.curveRadius = -distance;
    newText.fontSize = 0.035;
    newText.font = _fontserif;
    newText.anchorX = 'center';
    newText.textAlign = 'center';
    newText.fontSize = 0.03;
    newText.position.z = 0;
    newText.rotation.y = ( (maxwidth)/2 )/distance;
    newText.translateZ( distance );
    newText.name = "details";


    const bar = genCurve( newGroup, 0.6, 0.0025, -distance );
    bar.rotation.y = ( -(maxwidth/2) - 0.3) / distance;
    bar.position.y = - 0.12;


    const confirm = new Text();
    newGroup.add(confirm);
    confirm.color = _colorBXmain;
    confirm.curveRadius = -distance;
    confirm.fontSize = 0.030;
    confirm.text = "confirm";
    confirm.anchorX = "center";
    confirm.layers.enable( 3 );
    confirm.userData.fontSize = confirm.fontSize;
    confirm.userData.type = "warncitation-confirm";
    confirm.sync();

    confirm.position.y = - 0.15;
    confirm.rotation.y = ((maxwidth)/2) / distance;
    confirm.translateZ( distance );

    const margin = 0.1;
    const box = genBox( newGroup, maxwidth + margin, 0.2 + margin, -distance );
    box.position.y = margin/2;
    box.rotation.y = -(margin/2)/distance;

    newGroup.scale.y = 0;

    citationwarning = newGroup;

    // tween in the warning
    new TWEEN.Tween( newGroup.scale )
        .to( {y: 1}, 300 )
        .easing( TWEEN.Easing.Circular.Out )
        .start()
    ;

}







function genCurve( parent, width, weight = 0.0025, distance = snapDistanceMenuValue, mod = -1, ) {

    const horizontalGeo = new THREE.CylinderGeometry(
        distance,
        distance,
        weight, 32, 1, true, 0,
        (width + weight) / distance
    );

    const line = new THREE.Mesh( horizontalGeo, boxMat );

    parent.add( line );

    line.rotation.y = (mod * width) / distance;

    line.rotateY(Math.PI);

    return line;

}


function genBox( parent, width, height, distance = snapDistanceMenuValue, mod = -1, weight = 0.0025, customData = [] ) {

    const newGroup = new THREE.Group();

    const horizontalGeo = new THREE.CylinderGeometry(
        distance,
        distance,
        weight, 32, 1, true, 0,
        (width + weight) / distance
        );

    const verticalGeo = new THREE.CylinderGeometry(
        distance,
        distance,
        1, 1, 1, true, 0,
        weight / distance
        );

    const fullGeo = new THREE.CylinderGeometry(
        distance + 0.001,
        distance + 0.001,
        1, 32, 1, true, 0,
        (width + weight) / distance
        );

    const top = new THREE.Mesh( horizontalGeo, boxMat );
    const bot = new THREE.Mesh( horizontalGeo, boxMat );
    const left = new THREE.Mesh( verticalGeo, boxMat );
    const right = new THREE.Mesh( verticalGeo, boxMat );
    const back = new THREE.Mesh( fullGeo, sceneMat );

    left.scale.y = height;
    right.scale.y = height;
    back.scale.y = height + (weight*2);

    newGroup.add( top );
    newGroup.add( bot );
    newGroup.add( left );
    newGroup.add( right );
    newGroup.add( back );
    parent.add( newGroup );

    top.position.y = 0;
    top.rotation.y = (mod * width) / distance;
    bot.position.y = -height;
    bot.rotation.y = (mod * width) / distance;
    left.rotation.y = (mod * width) / distance;
    left.position.y = -height/2;
    right.position.y = -height/2;
    back.position.y = (-height)/2;
    back.rotation.y = (mod * width) / distance;

    top.rotateY(Math.PI);
    bot.rotateY(Math.PI);
    left.rotateY(Math.PI);
    right.rotateY(Math.PI);
    back.rotateY(Math.PI);

    back.layers.enable( 3 );
    back.userData.type = "boxMenu-background";

    if ( customData.length > 0 ) {
        back.userData.typealt = customData[0];

        var boxjson = {};
        boxjson.top = top;
        boxjson.bot = bot;
        boxjson.left = left;
        boxjson.right = right;
        boxjson.back = back;
        boxjson.tall = true;
        boxjson.height = height;

        newGroup.userData.box = boxjson;
        parent.userData.box = newGroup;
    }

    return newGroup;
}


function genBar( parent, width, maxWidth = width, distance = snapDistanceMenuValue, mod = -1, weight = 0.0025 ) {
    const horizontalGeo = new THREE.CylinderGeometry(
        distance,
        distance,
        weight, 32, 1, true, 0,
        (width + weight) / distance
    );

    const bar = new THREE.Mesh( horizontalGeo, boxMat );

    parent.add( bar );
    bar.rotation.y = (mod * width) / distance;
    bar.rotateY( ( (mod*maxWidth/2) + (width/2) ) / distance );
    bar.rotateY(Math.PI);

    return bar;
}


function minifyCountdown( target ) {

    const threshold = 3;

    if ( target.userData.minitimer != undefined && target.userData.minitimer < threshold ) {

        if ( target.userData.miniheight + 0.3 < target.userData.totalHeight ) {

            if ( !isDomPinching ) {
                target.userData.minitimer += 1;
            }

            setTimeout(() => {
                minifyCountdown( target );
                consoleLog( "minify countdown: " + target.userData.minitimer );
            }, 1000);

        }

    } else if ( target.userData.minitimer != undefined && target.userData.minitimer >= threshold ) {

        const box = target.userData.box;

        if ( target.userData.minified == false ) {

            const boxjson = box.userData.box;

            var closeTxt = box.userData.closeTxt;
            var barTxt = box.userData.barTxt;
            var focusTxt = box.userData.focusTxt;
            var bar = box.userData.bar;

            var boxbot = boxjson.bot;
            var boxleft = boxjson.left;
            var boxright = boxjson.right;
            var boxback = boxjson.back;
            var boxistall = boxjson.tall;
            var boxheight = boxjson.height;
            var abstract = boxjson.abstract;
            var details = boxjson.details;

            // const newheight = 0.5;
            const newheight = target.userData.miniheight + 0.3;
            const speed = 300;
            const ease = TWEEN.Easing.Quadratic.InOut

            // boxleft.scale.y = newheight;
            // boxright.scale.y = newheight;
            // boxback.scale.y = newheight;
            new TWEEN.Tween( boxleft.scale ).to( {y: newheight}, 300 ).easing( ease ).start();
            new TWEEN.Tween( boxright.scale ).to( {y: newheight}, 300 ).easing( ease ).start();
            new TWEEN.Tween( boxback.scale ).to( {y: newheight}, 300 ).easing( ease ).start();

            // boxleft.position.y = -newheight/2;
            // boxright.position.y = -newheight/2;
            // boxback.position.y = -newheight/2;
            new TWEEN.Tween( boxleft.position ).to( {y: -newheight/2}, 300 ).easing( ease ).start();
            new TWEEN.Tween( boxright.position ).to( {y: -newheight/2}, 300 ).easing( ease ).start();
            new TWEEN.Tween( boxback.position ).to( {y: -newheight/2}, 300 ).easing( ease ).start();

            // boxbot.position.y = -newheight;
            new TWEEN.Tween( boxbot.position ).to( {y: -newheight}, 300 ).easing( ease ).start();

            // closeTxt.position.y = -newheight + 0.2;
            // barTxt.position.y = -newheight + 0.2;
            // focusTxt.position.y = -newheight + 0.2;
            // bar.position.y = -newheight + 0.25;
            new TWEEN.Tween( closeTxt.position ).to( {y: -newheight + 0.18}, 300 ).easing( ease ).start();
            new TWEEN.Tween( barTxt.position ).to( {y: -newheight + 0.2}, 300 ).easing( ease ).start();
            new TWEEN.Tween( focusTxt.position ).to( {y: -newheight + 0.18}, 300 ).easing( ease ).start();
            new TWEEN.Tween( bar.position ).to( {y: -newheight + 0.25}, 300 ).easing( ease ).start();

            // abstract.scale.y = 0;
            // abstract.visible = false;
            new TWEEN.Tween( abstract.scale ).to( {y: 0}, 300 ).easing( ease ).start().onComplete(() => { abstract.visible = false; });

            // details.position.y = -newheight + 0.3;
            // details.scale.y = 0;
            // details.visible = false;
            new TWEEN.Tween( details.position ).to( {y: -newheight + 0.3}, 300 ).easing( ease ).start();
            new TWEEN.Tween( details.scale ).to( {y: 0}, 300 ).easing( ease ).start().onComplete(() => { details.visible = false; });


            target.userData.minified = true;
            
        }
    }
}













// REWORKED SAVE SYSTEM ========================================================================


// global array that has a list of all elements that should be saved
// each of those elements has a name for what type of element it is ( "document", "preview", etc )

// when saving...
    // write a json file
    // include the current catalog
    // every element (in the global array) is listed and includes...
        // what type of element it is
        // information to find the necessary data in the catalog
        // y position of the element
        // y rotation of the element
        // z depth of the element

// when loading...
    // read the file and see if it has save data
    // for each type of element, generate at the correct location
        // if necessary, set further save information like scroll percentage


function addSaved(object) {
    savedElement.push(object);
}


function removeSaved(object) {
    const index = savedElement.indexOf(object);
    if ( index >= 0 ) {
        savedElement.splice(index,1);
    }
}


function saveState() {

    consoleLog( "SAVE STATE", 0xffccff );

    console.log( savedElement );

    // clear the savedState from before
    globalLIB.saveState = [];

    // iterate through all elements that need to be saved
    for (var i = savedElement.length - 1; i >= 0; i--) {
        // try {

            // console.log( savedElement );
            // console.log( i );
            // console.log( savedElement[i] );

            var newJSON = {};

            newJSON.type = savedElement[i].userData.type;
            newJSON.yPos = savedElement[i].position.y;
            newJSON.yRot = savedElement[i].rotation.y;
            
            for (var j = globalLIB.documents.length - 1; j >= 0; j--) {
                if ( globalLIB.documents[j].source == savedElement[i].userData.src ) {

                    newJSON.docindex = j;

                } else if ( globalLIB.documents[j].source == savedElement[i].userData.source ) {

                    newJSON.docindex = j;

                }
            }

            if ( savedElement[i].userData.type == "document" ) {

                newJSON.dist = savedElement[i].userData.specialReaderOffset + snapDistanceOneValue;

                newJSON.scroll = savedElement[i].userData.scrollPercent;

                newJSON.botPos = savedElement[i].userData.clippingEnd.position.y;

                if ( savedElement[i].userData.refGroup != undefined ) {

                    const allRefs = savedElement[i].userData.refGroup.userData.allRefs;
                    var refHighlights = [];

                    for (var j = allRefs.length - 1; j >= 0; j--) {
                        if ( allRefs[j].children[0].userData.highlight != undefined ) {
                            var thisJSON = {};
                            thisJSON.index = i;
                            thisJSON.highlight = allRefs[j].children[0].userData.highlight;
                            refHighlights.push( thisJSON );
                        }
                    }

                    newJSON.highlights = refHighlights;

                }

                if ( savedElement[i].userData.genImages != undefined ) {

                    const images = savedElement[i].userData.genImages;
                    var refImages = [];

                    for (var j = 0; j <= images.length - 1; j++) {
                        var thisJSON = {};
                        thisJSON.index = j;
                        thisJSON.yPos = images[j].position.y;
                        thisJSON.yRot = images[j].rotation.y;
                        refImages.push( thisJSON );
                    }

                    newJSON.images = refImages;
                }

            } else if ( savedElement[i].userData.type == "boxpreview" && savedElement[i].userData.typealt == "refpreview" ) {

                newJSON.type = savedElement[i].userData.typealt;
                newJSON.title = savedElement[i].userData.title;
                newJSON.author = savedElement[i].userData.author;
                newJSON.year = savedElement[i].userData.year;
                newJSON.source = savedElement[i].userData.source;
                newJSON.zdistance = savedElement[i].userData.zdistance;
                newJSON.parentTitle = savedElement[i].userData.parentTitle;

            }

            globalLIB.saveState.push( newJSON );

            console.log( newJSON );

        // } catch { } 
    }

    // save the box menu

    var menuJSON = {};

    menuJSON.type = "boxmenu";
    menuJSON.yPos = boxMenu.position.y + boxMenu.parent.position.y;
    menuJSON.yRot = boxMenu.rotation.y + boxMenu.parent.rotation.y;
    menuJSON.active = activeBoxCatalog;

    globalLIB.saveState.push( menuJSON );

    // ====== get the current timestamp ======
    const d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
        if (month.toString().length < 2) { month = '0'.concat(month.toString()) };
    let day = d.getDate();
        if (day.toString().length < 2) { day = '0'.concat(day.toString()) };
    let hour = d.getHours();
    let minute = d.getMinutes();
    let date = year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + '00.000Z';
    // =======================================

    globalLIB.savedOn = date;

    var content = JSON.stringify( globalLIB );

    const file = new File( [content], libFileName + '_' + month + '.' + day + '.' + year + '-' + hour + '.' + minute + '.json', {
        type: 'text/plain'
    });

    download(file);

    console.log(globalLIB);

}



function loadState() {

    consoleLog( "LOAD STATE", 0xffccff );

    savedElement = [];

    for (var i = globalLIB.saveState.length - 1; i >= 0; i--) {

        const type = globalLIB.saveState[i].type;

        if ( type == "document" ) {

            restoreDocument( 
                globalLIB.saveState[i].docindex,
                globalLIB.saveState[i].yPos,
                globalLIB.saveState[i].yRot,
                globalLIB.saveState[i].dist,
                globalLIB.saveState[i].scroll,
                globalLIB.saveState[i].botPos,
                globalLIB.saveState[i].highlights,
                globalLIB.saveState[i].images
            );

        } else if ( type == "boxpreview" ) {

            restorePreview(
                globalLIB.saveState[i].docindex,
                globalLIB.saveState[i].yPos,
                globalLIB.saveState[i].yRot
            );

        } else if ( type == "boxmenu" ) {

            restoreMenu(
                globalLIB.saveState[i].active,
                globalLIB.saveState[i].yPos,
                globalLIB.saveState[i].yRot
            );

        } else if ( type == "refpreview" ) {

            restoreReference(
                globalLIB.saveState[i].yPos, 
                globalLIB.saveState[i].yRot, 
                globalLIB.saveState[i].title, 
                globalLIB.saveState[i].author, 
                globalLIB.saveState[i].year, 
                globalLIB.saveState[i].source, 
                globalLIB.saveState[i].zdistance, 
                globalLIB.saveState[i].parentTitle
            );

        }

    }

    // setTimeout(() => {
    //     console.log( savedElement );
    // }, 2000);

}


function restoreDocument( docindex, yPos, yRot, dist, scroll, botPos, highlights, images ) {

    var restoration = { "yPos":yPos, "yRot":yRot, "dist":dist, "scroll":scroll, "botPos":botPos, "highlights":highlights, "images":images };

    findDocumentContent(
        globalLIB.documents[docindex].source,
        globalLIB.documents[docindex].title,
        globalLIB.documents[docindex].author,
        restoration );

    consoleLog( "Restored Document: " + globalLIB.documents[docindex].title );
}


function restorePreview( docindex, yPos, yRot ) {

    var restoration = { "yPos":yPos, "yRot":yRot }

    const title = globalLIB.documents[docindex].title;
    for (var i = boxPreviews.length - 1; i >= 0; i--) {
        if ( title == boxPreviews[i].userData.title ) {

            const boxpreview = boxPreviews[i];
            const height = boxpreview.userData.totalHeight;

            showBoxPreview( boxpreview, height, undefined, true, false, restoration );

        }
    } 

    consoleLog( "Restored Preview: " + globalLIB.documents[docindex].title );
}


function restoreMenu( active, yPos, yRot ) {

    if ( active == undefined ) {
        boxMenuDot.visible = false;
        boxMenuDot.scale.set( 0, 0, 0 );
    }

    activeBoxCatalog = active;
    
    boxMenu.position.y = yPos;
    boxMenu.rotation.y = yRot;

    showBoxCatalog( active );

    consoleLog( "Restored Menu: " + active );

}


function restoreReference( yPos, yRot, title, author, year, source, zdistance, parentTitle ) {

    var restoration = { "yPos":yPos, "yRot":yRot }

    initBoxCitation( undefined, title, author, year, source, zdistance, parentTitle, restoration )

    consoleLog( "Restored Reference: " + title );

}


$( '#acm22' ).on( 'click', function() {
    addUrlParam( 'library-acm22' );
});

$( '#acm22-save' ).on( 'click', function() {
    addUrlParam( 'library-acm22_demo' );
});

$( '#acm24' ).on( 'click', function() {
    addUrlParam( 'library-acm24' );
});

$( '#acm24-save' ).on( 'click', function() {
    addUrlParam( 'library-acm24_demo' );
});

$( '#ftlv5' ).on( 'click', function() {
    addUrlParam( 'library-ftvol5' );
});

$( '#ftlv5-save' ).on( 'click', function() {
    addUrlParam( 'library-ftvol5_demo' );
});


function addUrlParam( param = 'lib' ) {
    let currentURL = window.location.href;
    let params = new URLSearchParams( location.search );
    let src = params.get( 'src' );
    let newURL;

    if ( src != null ) {
        newURL = currentURL.slice( 0, -src.length - 5 ) + "?src=" + param + ".json";
    } else {
        newURL = currentURL + "?src=" + param + ".json";
    }

    window.location.href = newURL;
}

 
function applyUrlParam( src ) {

    if ( src == "library-acm22.json" ) {
        $( '#acm22' ).addClass( 'libactive' );

    } else if ( src == "library-acm22_demo.json" ) {
        $( '#acm22-save' ).addClass( 'libactive' );

    } else if ( src == "library-acm24.json" ) {
        $( '#acm24' ).addClass( 'libactive' );

    } else if ( src == "library-acm24_demo.json" ) {
        $( '#acm24-save' ).addClass( 'libactive' );

    } else if ( src == "library-ftvol5.json" ) {
        $( '#ftlv5' ).addClass( 'libactive' );

    } else if ( src == "library-ftvol5_demo.json" ) {
        $( '#ftlv5-save' ).addClass( 'libactive' );
    }

    // console.log( src );

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

    // Load the libarary and build it
    // initLibrary('./library-acm22.json');
    // initLibrary('./library-acm24.json');
    // initLibrary('./library-acm24-save.json');
    initLibrary();

    initRays(sphereHelper);

    // navigator.xr.requestSession("immersive-vr").then( function(session) {
    //     xrSession = session;
    // });

    // ================================================ RENDER LOOP ===================================================== //
    renderer.setAnimationLoop( function () {
        timer.update();
        deltaTime = timer.getDelta();
        animateRays();
        animateLoader();
        trySync();

        if (renderer.xr.isPresenting && !firstInit && loadDelay > 0) {
            // When the VR mode is first launched
            init();
            browserSphereTransitionSetup();
        }

        // ===== ONLY RUN AFTER CONTROLLERS ARE INITIALIZED ===== //
        if (controller1enabled && controller2enabled) {
            if (loadDelay > 0) { loadDelay -= deltaTime };

            if (!firstInit && loadDelay <= 0) { // This runs once after the user is inside VR
                firstInit = true;
                initMenu();
                initTools();
                initconsoleLog();
                initWorkspace();
                initManna();

            } else if (firstInit && !secondInit && indexFingerTip2.position.distanceTo(wrist2.position) > 0.1 && indexFingerTip1.position.distanceTo(wrist1.position)){
                // This runs once after the hands have properly loaded
                secondInit = true;
                setToolPositions();
                repositionWorld();
                // establishLibrary();
                tryInitMap();
                toggleLibrary('close');
                initBoxMenu();

                colorHands();

                if ( $('#checkdebug').is(":checked") ) {
                    setTimeout(() => {
                        debugMode = true;
                        showDebug();
                    }, 2000);
                }
                
                currentDominant = hand2.userData.handedness;
                initialDominant = hand2.userData.handedness;
            }

            if (firstInit && secondInit) { // This runs every frame after first initialization
                trySwipe();
                // tryMenu();
                tryBtns();
                tryRecenter();
                tryPointer();
                // tryMapSelector();
                tryManna();
                // tryQuickGestures();
                // tryOffGestures();
                checkBoxMenu();

                tryVelocity();
                tryHideBoxMenu();
                tryRefDim();

                animateCitationLines();
                animateConsoleLog();
                
            }

        };

        testAnim(testCube,0.5);
        // console.log(XRSession.inputSources);
        // console.log(xrSession.inputSources);

        renderer.render( scene, camera );
        TWEEN.update();
    } );
    // ================================================================================================================== //

} else {

    // const warning = WebGL.getWebGLErrorMessage();
    // document.getElementById( 'container' ).appendChild( warning );

}

// Animate an object for testing
function testAnim(object,n=0.2) {
    object.rotation.x -= n * deltaTime;
    object.rotation.y -= n * deltaTime;
}

// Move some stuff around for the test layout
camera.position.z = 1;


// loadTextBlock('./_ref/htconference/2022/3511095.3531270.html');
// findDocumentContent('./_ref/fot24/Dene Grigar Spatial Computing for Use with Physical Artifacts Held in Museum and Library Repositories.html','Spacial Computing for Use with Physical Artifacts held in Museum and Library Repositories','Dene Grigar');
// sphereHelper.visible=false;
// findReferences('./_ref/htconference/2024/ht24-35.html');


// BUGS:
// swap hands sometimes disables pointer until mana menu is viewed again
// opening the menu catlog before things are done loading causes the menu to vanish
// when the headset loses hand tracking while menu selecting, the manna dot can get stuck on the wrong hand

// NOTES:
// pass info to llm (chatgpt or claude) and return?
// tags and sticky notes for document content?
// history feature?
// voice commands?
// dominant wrist slider to change snap distances?
// catalog loader for each category instead of global?

// WIP:

// COMPLETE THIS UPDATE:
// floating image generation for documents
    // drag to move them
    // quick tap to keep in focus, or unfocus
    // save and load with documents

