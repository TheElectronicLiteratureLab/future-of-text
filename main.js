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

// Create a center light and add it to the scene
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
const readerStartDistance = 2;

// Rotation order
camera.rotation.order = 'YXZ';
















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
    color: 0x7c7c7c,
    transparent: false,
    opacity: 0.75,
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

    toolSelectorCore.translateZ( -0.111 );
    toolSelectorCore.translateY( -0.113 );
    toolSelectorCore.translateX( -0.015 );

    toolSelectorCore.rotateX( -Math.PI / 2.9);

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

var toolSelectorSmoothSteps = 3;
var toolSelectorPrevRotations = [];
var toolSelectorPrevPositions = [];
var openHandles = [];
var toolSelectorGapSet = false;
var toolSelectorCoreWorld = new THREE.Vector3;

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

        // Animate in the selector core
        if (!tempSelectorTweenedIn && tempSelectorTweenedOut) {
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
            raycaster.layers.set( 3 );
            toolSelectorCast.getWorldQuaternion(tempSelectorQuat);
            var rayForward = new THREE.Vector3(0.0, 0.0, -1.0).applyQuaternion(tempSelectorQuat);
            raycaster.set(tempSelectorWorld, rayForward);
            var intersects = raycaster.intersectObjects(scene.children);
            var intersect = intersects[0];

            // If the dot has been reset last time, give it a default distance
            if (toolSelectorDot.position.z >= -0.01) {
                toolSelectorDot.position.z = -snapDistanceOneValue;
            }

            toolSelectorDot.visible = true;

            placeholderArrow(raycaster, 0.5, 0xffffff);

            // If the raycaster has found an eligible object
            if (intersect) {

                toolSelectorTimer = 0;

                let beamScale = tempSelectorWorld.distanceTo(intersect.point) * 1000;
                // toolSelectorBeam.visible = toolSelectorVisible;
                toolSelectorBeam.scale.z = beamScale;
                toolSelectorBeam.position.z = -(beamScale/2000);

                toolSelectorDot.position.z = -(beamScale/1000);

                let distScale = (beamScale / 2000) + 1;
                toolSelectorDot.scale.set( distScale, distScale, distScale );

                if (intersect.object.userData.type != "preview") {
                    intersect.object.fontSize = intersect.object.userData.fontSize * 1.1;
                    intersect.object.fontWeight = "bold";
                    textsToReset.push(intersect.object);
                }

                if (rSwipeObj == undefined) {
                    tryPointerOver(intersect);
                }

            } else {
                // No current intersection
                tryCloseHandles();
            }

            // Selection function - user has clamped their fingers together while pointing
            if (intersect && isTwoPinching && !tempSelectorActive) {
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

                tryPointerSelect(intersect);

            } else if (!isTwoPinching && tempSelectorActive) {
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


function tryCloseHandles() {
    if (openHandles.length > 0 && rSwipeObj == undefined) {
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


function tryPointerOver(intersect) {
    // console.log(intersect);
    // Show connection lines, if applicable
    if (intersect.object.userData.lines != undefined) {
        const lines = intersect.object.userData.lines;
        for (var i = lines.length - 1; i >= 0; i--) {
            lines[i].visible = true;
            linesToHide.push(lines[i]);
        }
    // For the library, update the preview text
    } else if (intersect.object.userData.type == "librarydoc") {
        var object = intersect.object;

        if (libraryTitle.text != object.userData.title) {
            libraryTitle.text = object.userData.title;
            libraryYear.text = object.userData.year;
            libraryAuthor.text = object.userData.author;
            libraryAbstract.text = object.userData.abstract;
        }
    // When pointing at a handle, tween it
    } else if (intersect.object.userData.type == "handle") {
        var handlebar = intersect.object.userData.handlebar;

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
    } else if (intersect.object.userData.type == "preview") {
        if (intersect.object.parent.userData.previewText != undefined && intersect.object.parent.userData.previewText.visible != false) {
            
            tryResetPreviews();

            disablePreviews(intersect.object.parent);

            // consoleLog("Preview text toggled off");
        }
    }
}


function tryPointerSelect(intersect) {
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
    } else if (intersect.object.userData.type == "popup-attach" || intersect.object.userData.type == "popup-return") {
        var thisfunction = intersect.object.userData.type.slice(6,99);

        var target = intersect.object.userData.target;
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
    } else if (intersect.object.userData.type == "handle") {
        tryResetPreviews();
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
                workspace.remove(line);
            }
        }
        
        workspace.remove(target.parent);
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
        target.userData.outlineWidth = target.outlineWidth;
        // target.outlineOpacity = 0.7;
        target.outlineColor = color;
        target.userData.outlineColor = target.outlineColor;
        // target.color = color;
        popupMenu(undefined);
    } else if (intersect.object.userData.type == "popup-unmark") {
        var target = intersect.object.userData.target;
        target.userData.hasMarkup = undefined;
        target.outlineWidth = 0;
        target.userData.outlineWidth = undefined;
        target.userData.outlineColor = undefined;
        popupMenu(undefined);
    } else if (intersect.object.userData.type == "librarydoc" && menuMode == 99) {
        var source = intersect.object.userData.source;
        loadTextBlock(source);
        toggleLibrary('close');
        menuMode = 0;
    } else if (intersect.object.userData.type == "popup-focus") {
        var target = intersect.object.userData.target;
        focusThis(target.parent);
        popupMenu(undefined);
    } else if (intersect.object.userData.type == "popup-unfocus") {
        var target = intersect.object.userData.target;
        unfocusThis(target.parent);
        popupMenu(undefined);
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

    // FOCUS popup button
            const popupFocus = new Text();
            scene.add(popupFocus);
            if (target.parent.userData.focusBG != undefined) {
            // UNFOCUS
            popupFocus.text = "Unfocus";
            popupFocus.userData.type = "popup-unfocus";
            } else {
            // FOCUS
            popupFocus.text = "Focus";
            popupFocus.userData.type = "popup-focus";
            }
            popupFocus.fontSize = 0.02;
            popupFocus.userData.fontSize = 0.02;
            popupFocus.color = 0xffffff;
            popupFocus.anchorX = 'left';
            popupFocus.anchorY = 'middle';
            newPopup.attach(popupFocus);
            popupFocus.position.x = -0.11;
            popupFocus.position.y = -0.10;
            popupFocus.layers.enable( 3 );
            popupFocus.userData.target = target;
            popupItems.push(popupFocus);

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
const snapDistanceFocus = [];
var snapDistanceOneValue = readerStartDistance;
var snapDistanceFocusValue = 2.00;

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
            // console.log(result);
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

function displayCitation(text, object) {
    var temporaryCitation;
    var temporaryCitationGroup;
    consoleLog(text.slice(0,48) + "...", 0xdddddd);

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
        // console.log("%%%%%%%%%%%% temporaryCitation event removed");
    });
    
    // Citation line
    createLine(object, temporaryCitation);

}


function createLine(object, target) {
    const lineGeo = new THREE.BoxGeometry( 0.001, 0.001, 1 );
    const lineMat = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    var temporaryCitationLine = new THREE.Mesh( lineGeo, lineMat );

    workspace.add(temporaryCitationLine);
    // lineArray.push(temporaryCitationLine);
    // workspace.userData.lineArray = lineArray;

    temporaryCitationLine.userData.startObj = object.uuid;
    temporaryCitationLine.userData.endObj = target.uuid;
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

    tempTextBlock.position.set( 0, 0.0, -snapDistanceOneValue - specialReaderOffset );

    tempTextBlock.text = tempTextString;
    tempTextBlock.fontSize = 0.02;
    tempTextBlock.color = 0x000000;
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
        tempText.color = 0x000000;
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

        tempText.addEventListener("synccomplete", function passHandle() {
            totalPostInstance++;
            if (totalPostInstance >= totalPreInstance && totalPreInstance > 0) {
                createHandleTimeout(tempText, true);
                var allTexts = this.parent.userData.textBlock;
                for (var i = allTexts.length - 1; i >= 0; i--) {
                    allTexts[i]._listeners = undefined;
                    allTexts[i].visible = false;
                }
                focusThisTimout(textGroup);
            }
        });

    }

    headText.text = head;
    headText.fontSize = 0.03;
    headText.color = 0x000000;
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

}






function changeDistance(object, value) {
    // Set the curve radius and position of the header
    if (object.userData.header != undefined) {
        var headText = object.userData.header;
        headText.curveRadius = value;
        headText.userData.curveRadius = value;
        console.log(headText);
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
    color: 0xeeeeee,
    side: THREE.DoubleSide
} );

var rememberedFocusRotation;
var focusTransScale;

function focusThis(object) {
    // remove any other focused objects
    for (var i = snapDistanceFocus.length - 1; i >= 0; i--) {
        unfocusThis(snapDistanceFocus[i]);
    }

    // remove from snapDistanceOne and add to snapDistanceFocus
    const index = snapDistanceOne.indexOf(object);
    snapDistanceOne.splice(index,1);
    snapDistanceFocus.push(object);

    // calculate width & height
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

    // change the scale so it is a bit smaller
    object.scale.set(0.3, 0.3, 0.4);

    // set the height to an easy reading distance
    object.position.y = camera.position.y;

    // tween scale
    focusTransScale = new TWEEN.Tween( object.scale )
        .to( {x: 0.4, y: 0.4, z: 0.4}, 300 )
        .easing( TWEEN.Easing.Quadratic.Out )
        .start()
    ;
}


function unfocusThis(object) {
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
    mesh.position.add(dir.clone().multiplyScalar(0.35));

    // Look at the camera
    var newRot = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt( mesh.position, camera.position, new THREE.Vector3( 0, -1, 0 ) ) 
    );

    mesh.quaternion.copy( newRot );
}






























function createHandleTimeout(object, useParentY = false, delay = 500) {
    setTimeout(() => {createHandle(object, useParentY)},delay);
}

function createHandle(object, useParentY = false) {
    var width = 0.10;

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
        color: 0x555555,
        transparent: false,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    var invisMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        visible: false
    });
    const boundingMesh = new THREE.Mesh( boundingGeo, invisMat );
    const childMesh = new THREE.Mesh( boundingGeo, boundingMat );

    workspace.add( boundingMesh );
    boundingMesh.add( childMesh );
    object.parent.attach( boundingMesh );
    boundingMesh.layers.enable( 3 );
    boundingMesh.userData.layers = 3;
    boundingMesh.userData.type = "handle";
    childMesh.userData.type = "handlebar";
    object.parent.userData.handle = boundingMesh;
    boundingMesh.userData.handlebar = childMesh;

    childMesh.scale.x = 0.1;
    childMesh.translateX( 0.045 );
    childMesh.translateZ( 0.001 );

    if ( useParentY ) {
        boundingMesh.position.set( object.position.x, object.parent.position.y - height/2 + 0.036, object.position.z );
    } else {
        boundingMesh.position.set( object.position.x, object.position.y - height/2 - 0.002, object.position.z );
    }
    
    boundingMesh.rotation.set( object.parent.rotation.x, 0, object.parent.rotation.z );
    boundingMesh.translateX( -0.06 );
}
















































// -------------------- HAND TRACKING ----------------------
let hand1, hand2;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let wrist1, wrist2, thumbTip1, thumbTip2, thumbDistal1, thumbDistal2, indexFingerTip1, indexFingerTip2,
indexDis1, indexDis2, middleFingerTip1, middleFingerTip2, middleDistal1, middleDistal2, ringFingerTip1, ringFingerTip2, 
pinkyFingerTip1, pinkyFingerTip2, indexKnuckle1, indexKnuckle2;

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

function init() {

    const controllerModelFactory = new XRControllerModelFactory();
    const handModelFactory = new XRHandModelFactory();

    // controllers
    controller1 = renderer.xr.getController( 0 );
    scene.add( controller1 );

    controller2 = renderer.xr.getController( 1 );
    scene.add( controller2 );

    // Hand 1 - 'left' or non-dominant hand (menu sphere)
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

    hand1.addEventListener( 'pinchstart', onPinchStartOne );
    hand1.addEventListener( 'pinchend', onPinchEndOne );
    
    
    // Hand 2 - 'right' or dominant hand (interactions)
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

        controller2enabled = true;
    });
}

var isOnePinching = false;
var isTwoPinching = false;

function onPinchStartOne( event ) {    
    isOnePinching = true;
}

function onPinchEndOne( event ) {
    isOnePinching = false;
}

function onPinchStartTwo( event ) {    
    isTwoPinching = true;
}

function onPinchEndTwo( event ) {
    isTwoPinching = false;
}

function placeholderArrow(raycaster, length = grabDistance, color = 0x33ff77, life = 50) {
    if (debugMode) {
        // Draw a placeholder arrow to visualize the raycast
        const arrowTest = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, length, color);
        scene.add(arrowTest);
        setTimeout(() => {scene.remove(arrowTest);}, life);
    }
}

function norm(value, min, max) {
    return (value - min) / (max - min);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}












































































var offsetPositionY;
var offsetAngle;
var wrist2NormalXVector = new THREE.Vector3();
var wrist2NormalZVector = new THREE.Vector3();
var wrist2Roll, wrist2Pitch;
var curObjDir = new THREE.Vector3();
var swipeRayLengthBase = 0.75;
var rSwipeObj = undefined;

var toolSelectorDotWorld = new THREE.Vector3();
var curObjDir = new THREE.Vector3();
var swipeInverter = 1;

function startSwipe(object) {
    consoleLog("==== drag started on " + object + " ====", 0x5500aa);
    rSwipeObj = object.parent;
}


function stopSwipe() {
    // consoleLog("==== drag stopped ====");
    rSwipeObj = undefined;
}

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
    let day = d.getDay();
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
            newText.text = child.userData.text;
            newText.fontSize = child.userData.fontSize;
            newText.color = child.userData.color;
            newText.anchorX = child.userData.anchorX;
            newText.anchorY = child.userData.anchorY;
            newText.curveRadius = child.userData.curveRadius;
            newText.visible = child.visible;

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
                // var textBlock = child.parent.userData.textBlock;
                // var index = textBlock.indexOf(child);
                // textBlock.splice(index, 1, newText);
                // splice doesn't work, because the index fails to find the indexOf
                child.parent.userData.textBlock.push(newText);
                // console.log(child.parent.userData.textBlock);
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
                console.log(child.parent.userData);
            }

            pendingRemove.push(child);
            newText.sync();
        }

        if (child.type == "Group" && child.name != "workspace") {

            if (child.userData.swipeRot != undefined) {
                child.rotation.set( 0, child.userData.swipeRot, 0 );
            }

            if (child.userData.textBlock != undefined) {
                // var tempTextBlock = child.userData.textBlock;
                child.userData.textBlock = [];
                // for (var i = tempTextBlock.length - 1; i >= 0; i--) {
                //     child.userData.textBlock.push(tempTextBlock[i].object);
                // }
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
 
    });

    // REMOVE PENDING ELEMENTS =========================================================
    for (var i = pendingRemove.length - 1; i >= 0; i--) {
        console.log("REMOVE: " + pendingRemove[i]);
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


            // if (child.name != "workspace") {
            //     disablePreviews(child);
            // }



        }

    });

}

















var libraryTitle, libraryAuthor, libraryYear, libraryAbstract;
const library = new THREE.Group();

function initLibrary(source) {

    sphereHelper.add(library);

    initRays(sphereHelper);
    
    fetch('./library-acm22.json')
    .then((response) => response.json())
    .then((json) => {
        for (var i = json.documents.length - 1; i >= 0; i--) {
        
        // Create:
        const myText = new Text();
        library.add(myText);
        myText.layers.enable( 3 );
        myText.userData.type = "librarydoc";

        // Set userdata from json
        myText.userData.title = json.documents[i].title;
        myText.userData.year = json.documents[i].year;
        myText.userData.source = json.documents[i].source;
        for (var j = 0; j <= json.documents[i].author.length - 1; j++) {
            if(j==0){ myText.userData.author = json.documents[i].author[j] }
            else{
                myText.userData.author = myText.userData.author.concat(", ", json.documents[i].author[j]);
            }
        }
        findAbstract(json.documents[i].source, myText);
        

        // Set properties to configure:
        myText.text = json.documents[i].title;
        myText.fontSize = 0.0002;
        myText.userData.fontSize = myText.fontSize;
        myText.color = 0xffffff;
        myText.anchorX = 'right';
        myText.anchorY = 'middle';

        myText.position.x = -0.0003;
        myText.position.y = (i / 2000 - json.documents.length / 4000 + 0.001);
        // myText.position.z = (Math.random()-0.5) * json.documents.length / 50000 - 0.02;
        myText.position.z = -0.02;
        myText.curveRadius = -myText.position.z;

        myText.sync();

        }


        // Library divider line
        const lineGeo = new THREE.BoxGeometry( 0.00002, 0.01, 0.00002 );
        const lineMat = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        var dividerLine = new THREE.Mesh( lineGeo, lineMat );
        library.add(dividerLine);
        dividerLine.position.set( 0, 0, -0.02);

        // Library preview title
        libraryTitle = new Text();
        library.add(libraryTitle);
        libraryTitle.text = "";
        libraryTitle.fontSize = 0.0004;
        libraryTitle.fontWeight = 'bold';
        libraryTitle.color = 0xffffff;
        libraryTitle.position.set(0.0003, 0.005, -0.0198);
        libraryTitle.curveRadius = -libraryTitle.position.z;
        libraryTitle.sync();

        // Library preview author(s)
        libraryAuthor = new Text();
        library.add(libraryAuthor);
        libraryAuthor.text = "";
        libraryAuthor.fontSize = 0.0003;
        libraryAuthor.color = 0xffffff;
        libraryAuthor.position.set(0.0003, 0.0045, -0.0199);
        libraryAuthor.curveRadius = -libraryTitle.position.z;
        libraryAuthor.sync();

        // Library preview year
        libraryYear = new Text();
        library.add(libraryYear);
        libraryYear.text = "";
        libraryYear.fontSize = 0.00015;
        libraryYear.color = 0xffffff;
        libraryYear.position.set(0.0003, 0.0052, -0.02);
        libraryYear.curveRadius = -libraryYear.position.z;
        libraryYear.sync();

        // Library preview abstract
        libraryAbstract = new Text();
        library.add(libraryAbstract);
        libraryAbstract.text = "";
        libraryAbstract.anchorY = 'top';
        libraryAbstract.maxWidth = 0.010;
        libraryAbstract.fontSize = 0.0002;
        libraryAbstract.color = 0xffffff;
        libraryAbstract.position.set(0.0003, 0.004, -0.02);
        libraryAbstract.curveRadius = -libraryAbstract.position.z;
        libraryAbstract.sync();

        library.visible = false;

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
    // if (menuMode == 99) {
    for (var i = allRays.length - 1; i >= 0; i--) {
        var ray = allRays[i];
        var speed = ray.userData.speed;

        ray.rotateZ(-speed);
    }
    // }
}

















function indicateLoaded() {
    // display a message on the main page that shows that the page is loaded
    $('#loaderping').css("animation-name", "loaderpinganim");
    $('#workspacenotification').css("animation-name", "notificationanim");
}



























var currentURL = './3511095.3531271.html';

// change the url of the document to load
$('#urlin').change(function(){
    var url = $('#urlin').val();
    currentURL = url;
    console.log("Changed document to: " + url);
});













var firstInit = false;
var secondInit = false;
var loadDelay = 1.0;
// let xrSession;

// Check if WebGL is available on this browser
if ( WebGL.isWebGLAvailable() ) {

    // Enable XR rendering for the WebGLRenderer
    renderer.xr.enabled = true;

    // Append the VRButton to the doc body
    document.body.appendChild( VRButton.createButton( renderer ) );

    // Load the libarary and build it
    initLibrary('./library-acm22.json');

    // navigator.xr.requestSession("immersive-vr").then( function(session) {
    //     xrSession = session;
    // });

    // ================================================ RENDER LOOP ===================================================== //
    renderer.setAnimationLoop( function () {
        timer.update();
        deltaTime = timer.getDelta();
        animateRays();

        if (renderer.xr.isPresenting && !firstInit && loadDelay > 0) {
            // When the VR mode is first launched
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

            } else if (firstInit && !secondInit && indexFingerTip2.position.distanceTo(wrist2.position) > 0.1 && indexFingerTip1.position.distanceTo(wrist1.position)){
                // This runs once after the hands have properly loaded
                secondInit = true;
                setToolPositions();
                repositionWorld();
                establishLibrary();
                // toggleLibrary('open');
            }

            if (firstInit && secondInit) { // This runs every frame after first initialization
                trySwipe();
                tryMenu();
                tryBtns();
                tryRecenter();
                tryPointer();

                animateCitationLines();
                animateconsoleLog();
                // animateRays();

                // consoleLog(camera.rotation.y);
            }

        };

        testAnim(testCube,0.5);
        // console.log(XRSession.inputSources);
        // console.log(xrSession.inputSources);

        renderer.render( scene, camera );
        TWEEN.update();
    } );
    // ================================================================================================================== //

    init();

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








// BUGS:
// Multiple lines from a single source do not properly save and load. The lines work when pointing at their end, but not the start.

// NOTES:
// popup menu to change snap distance
// larger selection zone for each button
// tags and sticky notes for document content
// pass info to llm (chatgpt or claude) and return
// word wrap for citation block
// Save files are way too large - find a way to trim troika text geometry
// redesign energy lines
// read entire document content
// slightly darker background everywhere
// change text of "upload Library" to "upload workspace"
// remove links from citation page?
// focused objects popups should focus as well
// multiple focused objects at once
// close popup menu by tapping anywhere
// library generates in a backward order?
// history feature


// WIP:


// COMPLETE THIS UPDATE:
// reduced max width on library abstract
// adjusted menu start position
// use the default 'select' function for pinching rather than a custom distance check - improves reliability
// loading workspace skips the library screen - opens directly into the workspace
// indicator when a workspace is done loading
// changed styling of the upload library button to make it clearer
// popup menu to move document into or out of 'focus'
// 'focus' snap view distance that can hold one active document
// loading documents from the library 'focus' them
// rotate library so it is always facing the user when it opens
// Orange energy lines in the library view - plan to redesign these in the future
// Favicon added to page
// save and load system for focused objects
