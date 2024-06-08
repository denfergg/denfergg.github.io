// Get the container element
const container = document.getElementById("globeCanvas");

// Setup scene
const scene = new THREE.Scene();

// Setup renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Setup camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 6;

// Setup lights
const light1 = new THREE.PointLight(0x5a54ff, 0.75);
light1.position.set(-150, 150, -50);

const light2 = new THREE.PointLight(0x4158f6, 0.75);
light2.position.set(-400, 200, 150);

const light3 = new THREE.PointLight(0x803bff, 0.7);
light3.position.set(100, 250, -100);

scene.add(light1, light2, light3);

// Setup atmosphere shader
const atmosphereShader = {
  atmosphere: {
    uniforms: {},
    vertexShader: [
      "varying vec3 vNormal;",
      "void main() {",
      "vNormal = normalize( normalMatrix * normal );",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
      "}",
    ].join("\n"),
    fragmentShader: [
      "varying vec3 vNormal;",
      "void main() {",
      "float intensity = pow( 0.99 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 6.0 );",
      "gl_FragColor = vec4( .28, .48, 1.0, 1.0 ) * intensity;",
      "}",
    ].join("\n"),
  },
};

const atmosphereGeometry = new THREE.SphereGeometry(2, 64, 64);

const atmosphereMaterial = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.clone(atmosphereShader.atmosphere.uniforms),
  vertexShader: atmosphereShader.atmosphere.vertexShader,
  fragmentShader: atmosphereShader.atmosphere.fragmentShader,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true,
});

const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
atmosphere.scale.set(1.05, 1.05, 1.05);
scene.add(atmosphere);

// Setup globe
const sphereGeometry = new THREE.SphereGeometry(2, 64, 64);
const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Setup map overlay
const loader = new THREE.TextureLoader();
const overlayMaterial = new THREE.MeshBasicMaterial({
  map: loader.load("https://i.imgur.com/JLFp6Ws.png"),
  transparent: true,
});

const overlaySphereGeometry = new THREE.SphereGeometry(2.003, 64, 64);
const overlaySphere = new THREE.Mesh(overlaySphereGeometry, overlayMaterial);
sphere.add(overlaySphere);

// Set up bezier curves
const numPoints = 100;
const curvePoints = [
  new THREE.Vector3(0, 1.5, 1.3),
  new THREE.Vector3(0.6, 0.6, 3.2),
  new THREE.Vector3(1.5, -1, 0.8),
];

const curve = new THREE.QuadraticBezierCurve3(...curvePoints);

const tubeGeometry = new THREE.TubeGeometry(curve, numPoints, 0.01, 20, false);
const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xd965fa });

const tubes = [];
for (let i = 0; i < 8; i++) {
  const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
  tube.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  );
  sphere.add(tube);
  tubes.push(tube);
}

// Set up spires
const cylinderGeometry = new THREE.CylinderGeometry(0.01, 0.01, 4.25, 32);
const cylinderMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ddff,
  transparent: true,
  opacity: 0.5,
});

for (let i = 0; i < 8; i++) {
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  sphere.add(cylinder);
}

// Detect click-drag rotation
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

container.addEventListener("mousedown", (e) => {
  isDragging = true;
});

container.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const deltaMove = {
      x: e.offsetX - previousMousePosition.x,
      y: e.offsetY - previousMousePosition.y,
    };
    sphere.rotation.y += deltaMove.x * 0.005;
    sphere.rotation.x += deltaMove.y * 0.005;
  }

  previousMousePosition = { x: e.offsetX, y: e.offsetY };
});

container.addEventListener("mouseup", () => {
  isDragging = false;
});

container.addEventListener("mouseleave", () => {
  isDragging = false;
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  if (!isDragging) {
    sphere.rotation.y += 0.0005;
  }
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
