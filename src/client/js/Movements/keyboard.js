export async function run (env) {

    const directionalCrossDef = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",

        KeyW: "up",
        KeyS: "down",
        KeyA: "left",
        KeyD: "right"
    }

    let inputs = structuredClone(directionalCrossDef)
    Object.keys(inputs).forEach(key => inputs[key] = false);

    let direction = {
        up: false,
        down: false,
        left: false,
        right: false,
    }

    document.addEventListener("keydown", function (event) {
        const code = event.code
        if (inputs[code] !== undefined) {
            inputs[code] = true;
            direction[directionalCrossDef[code]] = true;
        }
    })

    document.addEventListener("keyup", function (event) {
        const code = event.code
        const chosenDirection = directionalCrossDef[code]
        if(chosenDirection !== undefined) {
            inputs[code] = false;
            direction[chosenDirection] = Object.keys(inputs)
                .filter(inputKey => directionalCrossDef[inputKey] === chosenDirection)
                .reduce((last, key) => last || inputs[key], false)
        }
    })

    function calcDirection(camera) {
        const diagonal = Math.sin(Math.PI / 4);
        let newLoc = {x: 0, y: 0};

        if (direction.up && direction.right) {
            newLoc = {x: diagonal, y: diagonal};
        } else if (direction.up && direction.left) {
            newLoc = {x: -diagonal, y: diagonal};
        } else if (direction.up) {
            newLoc = {x: 0, y: 1};
        } else if (direction.down && direction.right) {
            newLoc = {x: diagonal, y: -diagonal};
        } else if (direction.down && direction.left) {
            newLoc = {x: -diagonal, y: -diagonal};
        } else if (direction.down) {
            newLoc = {x: 0, y: -1};
        } else if (direction.right) {
            newLoc = {x: 1, y: 0};
        } else if (direction.left) {
            newLoc = {x: -1, y: 0};
        }

        return {
            x: newLoc.x * Math.cos(camera.rotation.y) - newLoc.y * Math.sin(camera.rotation.y),
            y: newLoc.x * Math.sin(camera.rotation.y) + newLoc.y * Math.cos(camera.rotation.y),
        }
    }

    let oldTime = Date.now()

    const Three = await import("../Three.js/Three.js")
    const ray = new Three.Raycaster()
    let cube = new Three.Mesh(new Three.BoxGeometry(0.1, 0.1, 0.1), new Three.MeshBasicMaterial())
    env.scene.add(cube)

    let lastFaceIntersect = null

    let stop = false

    document.addEventListener("keyup", function (event) {
        const code = event.code
        if (code === "KeyJ") {
            stop = true
            console.log("Stopped")
        }
    })

    env.onUpdate.push(env => {
        const camera = env.camera
        const speed = 10 / 1000;

        const nowTime = Date.now()
        const diff = nowTime - oldTime
        oldTime = nowTime

        let direction = calcDirection(camera);

        const oldPos = camera.position
        let newPos = oldPos.clone()
        newPos.x += direction.x * speed * diff;
        newPos.z += -direction.y * speed * diff;

        ray.set(camera.position, newPos.clone().sub(oldPos).normalize())
        const moveSpace = env.scene.getObjectByName("MoveSpace")
        let clips = ray.intersectObject(moveSpace)

        if (stop || stop === null) {
            if (stop === null) return
            console.log(camera.position)
            console.log(clips)
            stop = null
        }

        if(clips.length > 0) {
            if(clips.length % 2 === 1 &&
                (camera.position.distanceTo(newPos) > camera.position.distanceTo(clips[0].point))) {
                console.log("touch wall")
            } else {
                console.log(clips.length % 2 === 1 ? "inside" : "outside")
                camera.position.copy(newPos)
                lastFaceIntersect = null
            }
        } else if(JSON.stringify(newPos) !== JSON.stringify(oldPos) ) {
            console.log("no bound")
        }

        // debug
        if (clips.length > 0) {
            cube.position.copy(clips[0].point)
        } else {
            cube.position.copy(camera.position)
        }
    })
}