import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { rand } from 'three/tsl';
//TODO
//godzilla???


//setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.y = 14;
camera.position.z = 10;


//renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);


//shadows
renderer.shadowMap.enabled = true;

const bulb = new THREE.PointLight(0xffddee, 1000);
const amb = new THREE.AmbientLight(0x4444ff, 0.2);

scene.add(bulb, amb);

bulb.position.set(10, 20, 0);
bulb.castShadow = true;
bulb.shadow.mapSize.width = 2000;  // Dis 512
bulb.shadow.mapSize.height = 2000; // Dis 512
bulb.shadow.camera.near = 0.5;
bulb.shadow.camera.far = 50;      // Dis 500

const gridSize = 16;
const loader = new THREE.TextureLoader();

const btextures = [
    loader.load("public/b1.jpg"),
    loader.load("public/b2.jpg"),
    loader.load("public/b3.jpg"),
    loader.load("public/b4.jpg"),
    loader.load("public/b5.avif"),
    loader.load("public/b6.jpg"),
    loader.load("public/b7.jpg"),
    loader.load("public/b8.jpg"),
    loader.load("public/b9.jpg"),
    loader.load("public/b10.jpg"),
    loader.load("public/b11.jpg"),
];

const grassColors = [
    0x789030,
    0x489030,
    0x679267,
    0x67927d,
    0x907830,
    0x78a12f,
    0x115c47,
    0x10493f,
    0x657800,
    0xdeeec8,
    0xe3fd98,
    0xd9f669,
    0xd4ee4b,
    0xbeea41,
    0xa9ce21
];

btextures.forEach(function(t) {
    t.mapping = THREE.CubeUVReflectionMapping;
    t.repeat.set(2, 10);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
});


//SKY
const skyGeometry = new THREE.SphereGeometry(gridSize * 1.5, 25, 25);
const skyTexture = loader.load("public/sky.jpg");
const skyMaterial = new THREE.MeshPhongMaterial({
    map: skyTexture,
    mapSize: 0.4
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
sky.material.side = THREE.BackSide;
scene.add(sky);


//atmosphere
scene.fog = new THREE.Fog( 0xaa88ff, 1, gridSize * 3 );


//helpers
const use_helpers = false;
const lightHelper = new THREE.PointLightHelper(bulb)
const axesHelper = new THREE.AxesHelper( 5 );
const gridHelper = new THREE.GridHelper(gridSize, gridSize);
if (use_helpers) scene.add(lightHelper, axesHelper);


//THE GROUND
const groundGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
const groundMaterial = new THREE.MeshLambertMaterial({
    color: 0x333333,
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y -= 0.001;
scene.add(ground);

ground.receiveShadow = true;


//THE GROUND BLOCK
const gbGeometry = new THREE.BoxGeometry(gridSize, 2, gridSize);
const gbMaterial = new THREE.MeshPhongMaterial({
    color: 0xc4c4c4,
    map: loader.load("public/gb.jpg"),
});
const gbMesh = new THREE.Mesh(gbGeometry, gbMaterial);
gbMesh.position.y = -1.01
scene.add(gbMesh);


//THE LANES
for (let i = -(gridSize / 2); i < (gridSize / 2) + 1; i++) {
    makeLanes(i);
}

function makeLanes(offset) {
    
    const laneStartOffset = 0.1;

    const y = 0.001;
    const lanesX = [];
    const lanesZ = [];

    //for x
    lanesX.push(new THREE.Vector3((gridSize / 2) - laneStartOffset, y, offset));
    lanesX.push(new THREE.Vector3(-(gridSize  / 2), y, offset));
    //for z
    lanesZ.push(new THREE.Vector3(offset, y, (gridSize / 2) - laneStartOffset ));
    lanesZ.push(new THREE.Vector3(offset, y, -(gridSize  / 2)));

    const lanesMaterial = new THREE.LineDashedMaterial(
        {
            color: 0xffffff,
            scale: 1,
            dashSize: 0.8,
            gapSize: 0.2,
            linewidth: 1110,
        }
    );

    const xlanesGeometry = new THREE.BufferGeometry().setFromPoints(lanesX);
    const zlanesGeometry = new THREE.BufferGeometry().setFromPoints(lanesZ);
    const xlane = new THREE.Line(xlanesGeometry, lanesMaterial);
    const zlane = new THREE.Line(zlanesGeometry, lanesMaterial);
    zlane.computeLineDistances();
    xlane.computeLineDistances();
    scene.add(xlane, zlane);
      
}

//THE CROSSWALKS
for (let i = -(gridSize / 2); i < (gridSize / 2); i++) {
    makeCrosswalks(i);
}

function makeCrosswalks(offset) {
    
    for (let i = 0.0; i < 0.1; i += 0.02) {
        crosses(offset, i, 0.1);
        crosses(-offset, -i, 0.1)
        crosses(offset, i, 0.8);
        crosses(-offset, -i, 0.8);
    }
}

function crosses(offset, i, soffset) {
    const StartOffset = soffset;

    const y = 0.001;

    const lanesX= [];
    const lanesZ = [];

    lanesX.push(new THREE.Vector3((gridSize / 2) - StartOffset, y, offset + i));
    lanesX.push(new THREE.Vector3(-(gridSize  / 2), y, offset + i));

    lanesZ.push(new THREE.Vector3(offset + i, y,(gridSize / 2) - StartOffset));
    lanesZ.push(new THREE.Vector3(offset + i, y, -(gridSize  / 2)));

    const lanesMaterial = new THREE.LineDashedMaterial(
        {
            color: 0xffffff,
            dashSize: 0.1,
            gapSize: 0.9,
        }
    );

    const xlanesGeometry = new THREE.BufferGeometry().setFromPoints(lanesX);
    const zlanesGeometry = new THREE.BufferGeometry().setFromPoints(lanesZ);
    const xlane = new THREE.Line(xlanesGeometry, lanesMaterial);
    const zlane = new THREE.Line(zlanesGeometry, lanesMaterial);
    zlane.computeLineDistances();
    xlane.computeLineDistances();
    scene.add(xlane, zlane);
}
 

//THE GRID
const randomBoolean = () => Math.random() >= 0.5;
const grid = [];

for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {

        let x = i + 0.5;
        let z = j + 0.5;

        grid[i][j] = randomBoolean();
        makeSidewalk(x, z);

        if (grid[i][j]) {
            makeB(x, z);
            makeB(x, z);
            makeB(x, z, "base");
        } else {
            makeGrass(x, z);
            if(randomBoolean()) {
                makeB(x, z, "base");
                makeB(x, z, "base");
            }
        }
    }
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = 1;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.4;
controls.enableDamping = true;
controls.dampingFactor = 0.7;
// controls.minDistance = 10.0;
controls.minDistance = 2.0;
// controls.maxDistance = gridSize
controls.maxDistance = 100;


function makeB(x, z, type) {
    
    let randx;
    let randy;
    let randz;
    let disp1;
    let disp2;

    switch(type) {
        case "base":
            randx = THREE.MathUtils.randFloat(0.4, 0.6);
            randy = THREE.MathUtils.randFloat(0.4, 0.8);
            randz = THREE.MathUtils.randFloat(0.4, 0.6);
            disp1 = THREE.MathUtils.randFloatSpread(0.2);
            disp2 = THREE.MathUtils.randFloatSpread(0.2);
            break;

        default:
            randx = THREE.MathUtils.randFloat(0.2, 0.6);
            randy = THREE.MathUtils.randFloat(1, 3);
            randz = THREE.MathUtils.randFloat(0.2, 0.6);
            disp1 = THREE.MathUtils.randFloatSpread(0.2);
            disp2 = THREE.MathUtils.randFloatSpread(0.2);
            break;
    }

    const geometry = new THREE.BoxGeometry(randx, randy, randz);
    const material = new THREE.MeshStandardMaterial({
            map: btextures[Math.floor(Math.random() * btextures.length)],
            metalness: 0.1,
            roughness: 0.1
        });

    const b = new THREE.Mesh(geometry, material);
    let y = randy / 2;

    b.position.set((x - gridSize / 2) + disp1, y, (z - gridSize / 2) + disp2);

    b.castShadow = true;
    b.receiveShadow = true;

    scene.add(b);
}

function makeGrass(x, z) {
    const geometry = new THREE.BoxGeometry(0.6, 0.06, 0.6);
    const material = new THREE.MeshStandardMaterial({
        color: grassColors[Math.floor(Math.random() * grassColors.length)],
        normalMap: loader.load("public/gn.jpg"),
        normalScale: new THREE.Vector2(1, 2),
        roughness: 1.0,

    });

    const grass = new THREE.Mesh(geometry, material);
    scene.add(grass);

    grass.position.set(x - gridSize / 2, 0, z - gridSize / 2);
    grass.receiveShadow = true;
}


function makeSidewalk(x, z) {
    const sgeometry = new THREE.BoxGeometry(0.8, 0.05, 0.8);
    const stex = loader.load("public/p.jpg");
    const smaterial = new THREE.MeshStandardMaterial({
        color: 0x8d8b90,
        map: stex,
        normalMap: loader.load("public/puv.jpg"),
        normalScale: new THREE.Vector2(1, 3)
    });

    stex.repeat.set(5, 5);
    stex.wrapS = THREE.RepeatWrapping;
    stex.wrapT = THREE.RepeatWrapping;

    const sidewalk = new THREE.Mesh(sgeometry, smaterial);
    sidewalk.position.set(x - gridSize / 2, 0, z - gridSize / 2);

    scene.add(sidewalk);
    sidewalk.receiveShadow = true;
}


//CARS
let cID = 0;
class Car {


    constructor() {
        this.lane = randLane();
        this.id = carID();

        this.dir = randDir();;
        this.go = null;

        let off = 0.05;
        const randHeight = THREE.MathUtils.randFloat(0.02, 0.08)
        const randSpeed = THREE.MathUtils.randFloat(0.01, 0.03);
        const carG = new THREE.BoxGeometry(0.04, randHeight, 0.08);
        const carM = new THREE.MeshLambertMaterial({
            color: new THREE.Color(Math.random() * 0xFFFFFF),
        });
        this.carMesh = new THREE.Mesh(carG, carM);
        scene.add(this.carMesh);

        switch(this.dir) {
            case 0:
                this.carMesh.position.set((gridSize / 2) - off - this.lane, (randHeight / 2) + 0.01, -gridSize / 2 + off);
                this.go = () => this.carMesh.position.z += randSpeed;
                break;
            case 1:
                this.carMesh.position.set(-(gridSize / 2) + off + this.lane, (randHeight / 2) + 0.01, gridSize / 2 - off);
                this.go = () => this.carMesh.position.z -= randSpeed;
                break;
            case 2:
                this.carMesh.position.set(-gridSize / 2 + off, (randHeight / 2) + 0.01,(gridSize / 2) + off - this.lane);
                this.carMesh.rotation.y += (Math.PI / 2);
                this.go = () => this.carMesh.position.x += randSpeed;
                break;
            case 3:
                this.carMesh.position.set(gridSize / 2 - off, (randHeight / 2) + 0.01,-(gridSize / 2) - off + this.lane);
                this.carMesh.rotation.y += (Math.PI / 2);
                this.go = () => this.carMesh.position.x -= randSpeed;
                break;
        }
        
    }
    clean() {
        if ((this.carMesh.position.z > (gridSize / 2)) ||
            (this.carMesh.position.x > (gridSize / 2)) ||
            (this.carMesh.position.z < -(gridSize / 2)) ||
            (this.carMesh.position.x < -(gridSize / 2))) {
            this.carMesh.position.y -= 0.02;
            if( this.carMesh.position.y < -(gridSize / 4)) {
                scene.remove(this.carMesh);
                let index = cars.findIndex(car => car.id === this.id);
                if (index !== -1)
                    cars.splice(index, 1)
            }


        }
    }
}
function carID() {
    cID++;
    return cID
}

function randLane() {
    return THREE.MathUtils.randInt(0, gridSize - 1);
}
function randDir() {
    return  THREE.MathUtils.randInt(0, 3);
}

let cars = [];
let angle = 0;

setInterval(function() {
    if (cars.length < gridSize * gridSize) {
        cars.push(new Car());
    }},
    100);

function animate() {
    angle += 0.003;
    bulb.position.x = Math.cos(angle) * gridSize/3;
    bulb.position.z = Math.sin(angle) * gridSize/3;
    
    for (let i = 0; i < cars.length; i++) {
        cars[i].go();
        cars[i].clean();
    }
    // console.log(cars)

    renderer.render(scene, camera);
    controls.update();
}
