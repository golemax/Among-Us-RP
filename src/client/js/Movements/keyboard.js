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
    const Color = Three.Color
    const ray = new Three.Raycaster()
    let cube1 = new Three.Mesh(
        new Three.BoxGeometry(0.01, 0.01, 0.01),
        new Three.MeshBasicMaterial({color: new Color( 0x0000ff )}))
        env.scene.add(cube1)
    let cube2 = new Three.Mesh(
        new Three.BoxGeometry(0.01, 0.01, 0.01),
        new Three.MeshBasicMaterial({color: new Color( 0xff0000 )}))
    env.scene.add(cube2)
    const topVector = new Three.Vector3(0, 1, 0)

    function intersect(pos, vector, object) {
        ray.set(pos, vector)
        let res = ray.intersectObject(object)
        return res.filter(v => v.distance > 0.01)
    }

    // debug
    // let stop = false
    // document.addEventListener("keyup", function (event) {
    //     const code = event.code
    //     if (code === "KeyJ") {
    //         stop = true
    //         console.log("Stopped")
    //     }
    // })

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

        const moveSpace = env.scene.getObjectByName("MoveSpace")
        let clips = intersect(camera.position, newPos.clone().sub(oldPos).normalize(), moveSpace)

        // debug
        // if (stop || stop === null) {
        //     if (stop === null) return
        //     console.log(camera.position)
        //     console.log(clips)
        //     stop = null
        // }

        // don't go to void & only on move
        if(clips.length > 0) {
            let oldInside = intersect(oldPos, oldPos.clone().add(topVector), moveSpace).length % 2 === 1

            if(oldInside && (oldPos.distanceTo(newPos) > oldPos.distanceTo(clips[0].point))) {
                // debug
                // console.log("touch wall")

                // get face
                const positionsBuffer = moveSpace.geometry.attributes.position
                const slidePlan = new Three.Plane().setFromCoplanarPoints(
                    new Three.Vector3(
                        positionsBuffer.getX(clips[0].face.a) + moveSpace.position.x,
                        positionsBuffer.getY(clips[0].face.a) + moveSpace.position.y,
                        positionsBuffer.getZ(clips[0].face.a) + moveSpace.position.z
                    ),
                    new Three.Vector3(
                        positionsBuffer.getX(clips[0].face.b) + moveSpace.position.x,
                        positionsBuffer.getY(clips[0].face.b) + moveSpace.position.y,
                        positionsBuffer.getZ(clips[0].face.b) + moveSpace.position.z
                    ),
                    new Three.Vector3(
                        positionsBuffer.getX(clips[0].face.c) + moveSpace.position.x,
                        positionsBuffer.getY(clips[0].face.c) + moveSpace.position.y,
                        positionsBuffer.getZ(clips[0].face.c) + moveSpace.position.z
                    )
                )

                // debug
                // const geometry = new Three.BufferGeometry();
                // const positions = [
                //         positionsBuffer.getX(clips[0].face.a) + moveSpace.position.x,
                //         positionsBuffer.getY(clips[0].face.a) + moveSpace.position.y,
                //         positionsBuffer.getZ(clips[0].face.a) + moveSpace.position.z,
                //
                //         positionsBuffer.getX(clips[0].face.b) + moveSpace.position.x,
                //         positionsBuffer.getY(clips[0].face.b) + moveSpace.position.y,
                //         positionsBuffer.getZ(clips[0].face.b) + moveSpace.position.z,
                //
                //         positionsBuffer.getX(clips[0].face.c) + moveSpace.position.x,
                //         positionsBuffer.getY(clips[0].face.c) + moveSpace.position.y,
                //         positionsBuffer.getZ(clips[0].face.c) + moveSpace.position.z
                // ];
                // geometry.setAttribute( 'position', new Three.Float32BufferAttribute( positions, 3 ) );
                // geometry.computeVertexNormals();
                // const object = new Three.Mesh( geometry,  new Three.MeshNormalMaterial({"side": Three.DoubleSide}));
                // env.scene.add(object);

                // get new pos & apply if correct
                newPos = slidePlan.projectPoint(newPos, new Three.Vector3())
                const leftDropDiff = slidePlan.normal.clone().normalize().multiplyScalar(0.01)
                const rightDropDiff = new Three.Vector3(-leftDropDiff.x, leftDropDiff.y, -leftDropDiff.z)
                const leftDrop = newPos.clone().add(leftDropDiff)
                const rightDrop = newPos.clone().add(rightDropDiff)
                if (intersect(leftDrop, leftDrop.clone().add(topVector), moveSpace).length % 2 === 1) {
                    camera.position.copy(leftDrop)
                } else if (intersect(rightDrop, rightDrop.clone().add(topVector), moveSpace).length % 2 === 1) {
                    camera.position.copy(rightDrop)
                }

                // debug
                // cube1.position.copy(leftDrop)
                // cube2.position.copy(rightDrop)

            } else {
                // debug
                // console.log(oldInside ? "inside" : "outside")
                if (!oldInside || intersect(newPos, newPos.clone().add(topVector), moveSpace).length % 2 === 1) {
                    camera.position.copy(newPos)
                }
            }
        }

        // debug
        // if (clips.length > 0) {
        //     cube.position.copy(clips[0].point)
        // } else {
        //     cube.position.copy(camera.position)
        // }
    })
}