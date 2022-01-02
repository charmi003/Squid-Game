const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//-----CUBE
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

//---GLOBAL VARIABLES
const startPositon=3;
const endPosition=-startPositon;
const TIME_LIMIT=10;
let GAME_STATUS='LOADING'
let IS_DOLL_BACKWARD=true;
let timer;

const createCube=(size,positionX,rotationY,color=0xfbc851)=>{
    const geometry = new THREE.BoxGeometry(size.w,size.h,size.d);
    const material = new THREE.MeshBasicMaterial( { color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x=positionX;
    cube.rotation.y=rotationY;
    scene.add( cube );
    return cube;
}

camera.position.z = 5;  //how far the camera is from the scene...lesser the value, more close the camera is and hence large size


//any change ..you need to call renderer.render(scene,camera)
//soln --> animate fn..requestAnimationFrame(animate)..animate fn is being called again and again..
//hence the renderer.render
//so any change, reflected auomatically


// function animate() {
// 	requestAnimationFrame( animate );
//     cube.rotation.x += 0.02; //0.02 --> speed ..if you increase the number--> more speed
//     cube.rotation.y += 0.02;
//     cube.rotation.z +=0.02;
// 	renderer.render( scene, camera );
// }
// animate();

//we need light in order to view the 3D model
const light = new THREE.AmbientLight( 0xffffff ); // soft white light //code 0x404040 --> equivalent to '#404040'in css
scene.add( light );

//setting the background color
//second argument --> opacity
renderer.setClearColor( 0xb7c3f3, 1);

// Instantiate a loader
const loader = new THREE.GLTFLoader();

const delay=(ms)=>{
    return new Promise( resolve => setTimeout(resolve,ms) );
}


class Doll{

    constructor(){

        loader.load("../models/scene.gltf", (gltf)=>{
            scene.add( gltf.scene );
            gltf.scene.scale.set(0.4,0.4,0.4);
            gltf.scene.position.set(0,-1.3,0);
            this.doll=gltf.scene;
        })
    }

    lookBackward(){
        // this.doll.rotation.y=-3.15;
        gsap.to(this.doll.rotation, { y:-3.15, duration:.45 })
        setTimeout(()=> IS_DOLL_BACKWARD=true ,150)
    }

    lookForward(){
        // this.doll.rotation.y=0;
        gsap.to(this.doll.rotation, { y:0, duration:.45 })
        setTimeout(()=> IS_DOLL_BACKWARD=false ,450)

    }

    async start(){
        this.lookBackward();
        await delay( (Math.random()*1000) + 750);
        this.lookForward();
        await delay( (Math.random()*750) + 750);
        this.start();
    }
}


const createTrack=()=>{
    createCube({ w:0.2, h:1.5, d:1},startPositon,-3.5); //rhs cube
    createCube({ w:0.2, h:1.5, d:1},endPosition,3.5); //lhs cube
    createCube({ w:startPositon*2+0.2, h:1.5, d:1},0,0,0xe5a716).position.z=-1; //in between widest cube
}


class Player{
    constructor(){
        const geometry = new THREE.SphereGeometry( .3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z=1;
        sphere.position.x=startPositon;
        scene.add( sphere );

        this.player=sphere;
        this.playerInfo={
            positionX:startPositon,
            velocity:0
        }
    }

    run(){
        this.playerInfo.velocity=.03;
    }

    stop(){
        // this.playerInfo.velocity=0;
        gsap.to( this.playerInfo,{ velocity:0, duration:.1 } )
    }

    update(){
        this.check();
        this.playerInfo.positionX-=this.playerInfo.velocity;
        this.player.position.x=this.playerInfo.positionX;
    }

    check(){
        if(!IS_DOLL_BACKWARD && this.playerInfo.velocity>0)
        {
            GAME_STATUS='FINISH'
            $('.text').text('YOU LOST :(')
        }

        if(this.playerInfo.positionX < endPosition+.1)
        {
            GAME_STATUS='FINISH'
            $('.text').text('YOU WON :)')
        }
    }

}

let player=new Player();

createTrack()

let doll=new Doll();


async function init(){
    await delay(1000);
    let textEle=$('.text');
    textEle.text('Starting in 3...')
    await delay(1000);
    textEle.text('Starting in 2...')
    await delay(1000);
    textEle.text('Starting in 1...')
    await delay(1000);
    textEle.text('Gooo!!!')
    startGame();
}

init();


const startGame=()=>{
    GAME_STATUS='START';

    // let progressBar = createCube({w:5, h:.1, d:1},0,0);
    // progressBar.position.y=3.35;
    // gsap.to(progressBar.scale, {x:0,duration: TIME_LIMIT})
    timer=setInterval(()=>{
        let value=$('progress').val();
        value-=(100/TIME_LIMIT);
        $('progress').val(value);
    },1000)

    doll.start();

    //to keep track of time
    setTimeout(()=>{
        if(GAME_STATUS!=='FINISH'){
            GAME_STATUS='FINISH';
            $('.text').text('TIME OUT!!')
        }
    },TIME_LIMIT*1000)
}



function animate() {
    if(GAME_STATUS==='FINISH')
    {
        clearInterval(timer);
        return;
    }
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
    player.update();
}
animate();


//responsive 
$( window ).resize(function(){
    camera.aspect= window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
})


$(document).keydown(function(e){
    if (GAME_STATUS!=='LOADING' && e.key == 'ArrowLeft') { 
       player.run();
    }
});

$(document).keyup(function(e){
    if (GAME_STATUS!=='LOADING' && e.key == 'ArrowLeft') { 
       player.stop();
    }
});






