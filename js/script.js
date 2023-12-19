import * as Three from "./Three.js/Three.js";
import {GLTFLoader} from "./Three.js/addons/loaders/GLTFLoader.js";

const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight,
    0.01, 100
);
const loader = new GLTFLoader();

loader.load(
    'common/skeld/scene.gltf',
    function ( gltf ) {
        gltf.scene.position.x = -4.6825;
        gltf.scene.position.z = 3.75;
        scene.add( gltf.scene );
    },
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function () {
        console.log( 'An error happened' );
    }
);

// loader.load(
//     'common/character/scene.gltf',
//     function ( gltf ) {
//         scene.add( gltf.scene );
//     },
//     function ( xhr ) {
//         console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
//     },
//     function ( error ) {
//         console.log( 'An error happened' );
//     }
// );

const light = new Three.AmbientLight( 0xffffff );
scene.add( light );

const canvas = document.getElementById("canvas");
const renderer = new Three.WebGLRenderer({canvas: canvas});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
scene.background = new Three.Color(0x000000);

camera.position.y = 0.1

let userNum = 0
let angle = userNum/12 * Math.PI;
const distance = 0.3;
camera.position.x = Math.sin(angle) * distance;
camera.position.z = Math.cos(angle) * distance;
camera.rotation.y = angle;

let mousePos = { x: 0, y: 0 };

window.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement) {
        mousePos.x += event.movementX;
        mousePos.y += event.movementY;
    }
});

canvas.addEventListener("mousedown", async function () {
    await canvas.requestFullscreen();
    await canvas.requestPointerLock();
})

let up = false;
let down = false;
let left = false;
let right = false;
let finalUp = false;
let finalDown = false;
let finalLeft = false;
let finalRight = false;

document.addEventListener("keydown", function (event) {
    if (event.code === "ArrowUp" || event.code === "KeyW") {
        up = true;
    }
    if (event.code === "ArrowDown" || event.code === "KeyS") {
        down = true;
    }
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
        left = true;
    }
    if (event.code === "ArrowRight" || event.code === "KeyD") {
        right = true;
    }

    validateDirection()
})

document.addEventListener("keyup", function (event) {
    if (event.code === "ArrowUp" || event.code === "KeyW") {
        up = false;
    }
    if (event.code === "ArrowDown" || event.code === "KeyS") {
        down = false;
    }
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
        left = false;
    }
    if (event.code === "ArrowRight" || event.code === "KeyD") {
        right = false;
    }

    validateDirection()
})

function validateDirection() {
    finalUp = up && !down;
    finalDown = !up && down;
    finalLeft = left && !right;
    finalRight = !left && right;
}

function calcDirection() {
    const diagonal = Math.sin(Math.PI/4);
    let direction = {x: 0, y: 0};
    if (finalUp && finalRight) {
        direction = {x: diagonal, y: diagonal};
    } else if (finalUp && finalLeft) {
        direction = {x: -diagonal, y: diagonal};
    } else if (finalUp) {
        direction = {x: 0, y: 1};
    } else if (finalDown && finalRight) {
        direction = {x: diagonal, y: -diagonal};
    } else if (finalDown && finalLeft) {
        direction = {x: -diagonal, y: -diagonal};
    } else if (finalDown) {
        direction = {x: 0, y: -1};
    } else if (finalRight) {
        direction = {x: 1, y: 0};
    } else if (finalLeft) {
        direction = {x: -1, y: 0};
    }

    return {
        x: direction.x * Math.cos(camera.rotation.y) - direction.y * Math.sin(camera.rotation.y),
        y: direction.x * Math.sin(camera.rotation.y) + direction.y * Math.cos(camera.rotation.y),
    }
}
camera.rotation.reorder('YXZ');

const sensibility = 0.004;
const speed = 0.01;

function animate() {
    camera.rotation.y += -mousePos.x * sensibility;
    camera.rotation.x += -mousePos.y * sensibility;

    if (camera.rotation.x < -Math.PI/2) {
        camera.rotation.x = -Math.PI/2
    }
    if (camera.rotation.x > Math.PI/2) {
        camera.rotation.x = Math.PI/2
    }

    let direction = calcDirection();
    camera.position.x += direction.x * speed;
    camera.position.z += -direction.y * speed;

    mousePos = { x: 0, y: 0 };
    camera.setViewOffset(window.innerWidth, window.innerHeight, 0, 0, window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}
animate();