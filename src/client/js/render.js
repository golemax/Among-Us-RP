function animate(env) {
    const camera = env.camera
    const scene = env.scene
    const renderer = env.renderer

    camera.rotation.reorder('YXZ');

    env.onUpdate.forEach(f => f(env))

    camera.setViewOffset(window.innerWidth, window.innerHeight, 0, 0, window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.render( scene, camera );
    requestAnimationFrame( () => animate(env) );
}

export async function run (env) { animate(env)}