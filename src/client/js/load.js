export async function run () {
    const Three = await import("./Three.js/Three.js")
    const {GLTFLoader} = await import("./Three.js/addons/loaders/GLTFLoader.js")

    const camera = new Three.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight,
        0.01, 100
    );
    const loader = new GLTFLoader();

    const gltf = await loader.loadAsync(
        'common/skeld/skeld.glb',
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }
    );

    const scene = new Three.Scene()
    scene.add(gltf.scene)
    // scene.position.x = -4.6825;
    // scene.position.z = 3.75;

    new Three.TextureLoader().load(
        '../common/sky.jpg',
        function (texture) {
            texture.mapping = Three.EquirectangularReflectionMapping;
            texture.colorSpace = Three.SRGBColorSpace;
            scene.background = texture;
        });

    const light = new Three.AmbientLight(0xffffff);
    scene.add(light);

    const canvas = document.getElementById("canvas");
    const renderer = new Three.WebGLRenderer({canvas: canvas});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.y = 1;

    let userNum = 0;
    let angle = userNum / 12 * Math.PI * 2;
    const distance = 0.3;
    camera.position.x = Math.sin(angle) * distance;
    camera.position.z = Math.cos(angle) * distance;
    camera.rotation.y = angle;

    canvas.addEventListener("mousedown", async function () {
        try {
            await canvas.requestFullscreen();
            await canvas.requestPointerLock();
        } catch (_) {
        }
    })

    return {scene, camera, renderer}
}