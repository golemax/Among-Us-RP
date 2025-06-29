export async function run (env) {
    import("./mouse.js").then(f => f.run(env))
    import("./keyboard.js").then(f => f.run(env))
}