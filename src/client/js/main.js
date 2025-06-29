(async () => {
    const env = {}
    env.scene = null
    env.camera = null
    env.renderer = null
    env.onUpdate = [];

    ({
        scene: (env.scene),
        camera: (env.camera),
        renderer: (env.renderer)
    } = (await (await import("./load.js")).run()))

    Object.freeze(env)

    await (await import("./Movements/main.js")).run(env)

    await (await import("./render.js")).run(env)
})()