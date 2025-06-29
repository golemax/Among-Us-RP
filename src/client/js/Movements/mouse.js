export async function run (env) {
    let mousePos = {x: 0, y: 0};

    window.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement) {
            mousePos.x += event.movementX;
            mousePos.y += event.movementY;
        }
    })

    env.onUpdate.push(env => {
        const camera = env.camera
        const sensibility = 0.004;

        camera.rotation.y += -mousePos.x * sensibility;
        camera.rotation.x += -mousePos.y * sensibility;
        camera.rotation.z = 0
        mousePos = { x: 0, y: 0 };

        if (camera.rotation.x < -Math.PI/2) {
            camera.rotation.x = -Math.PI/2
        }
        if (camera.rotation.x > Math.PI/2) {
            camera.rotation.x = Math.PI/2
        }
    })
}