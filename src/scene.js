import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createCharacter } from './character.js';
import { createAhogePhysics } from './ahoge-physics.js';
import { inputVector, stepPosition, turnToward, WALK_SPEED, DASH_SPEED, WALK_RADIUS } from './movement.js';
export function createScene(container,state){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e2e0e5');scene.fog=new THREE.Fog('#e2e0e5',12,27);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.02;
 renderer.domElement.setAttribute('aria-hidden','true');container.appendChild(renderer.domElement);
 const camera=new THREE.OrthographicCamera(-3,3,2.3,-2.3,.1,60);camera.position.set(2.3-frameOffset(),3.15,8);
 const orbit=new OrbitControls(camera,renderer.domElement);orbit.target.set(-frameOffset(),1.68,0);orbit.enableDamping=true;orbit.dampingFactor=.085;orbit.enablePan=false;orbit.minZoom=.7;orbit.maxZoom=2.1;orbit.minPolarAngle=.55;orbit.maxPolarAngle=Math.PI/2-.035;orbit.rotateSpeed=.65;orbit.zoomSpeed=.65;
 const ambient=new THREE.HemisphereLight(0xffffff,0xb6a9b7,2.2);scene.add(ambient);
 const light=new THREE.DirectionalLight(0xfff4ef,1.9);light.position.set(-3.5,7,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-6;light.shadow.camera.right=6;light.shadow.camera.top=7;light.shadow.camera.bottom=-6;light.shadow.normalBias=.025;light.shadow.bias=-.0002;light.shadow.radius=8;light.shadow.blurSamples=12;scene.add(light);
 const fill=new THREE.DirectionalLight(0xe5edff,.8);fill.position.set(4,3,-3);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:0xd6d3db,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.receiveShadow=true;scene.add(floor);
 const grid=new THREE.GridHelper(70,70,0xc4c0cb,0xd0cbd5);grid.position.y=-.021;grid.material.transparent=true;grid.material.opacity=.55;scene.add(grid);
 const rug=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,.012,64),new THREE.MeshStandardMaterial({color:0xe7b9cc,roughness:1}));rug.position.y=-.011;rug.receiveShadow=true;scene.add(rug);
 const amp=new THREE.Group();amp.position.set(-1.3,.36,-.85);amp.rotation.y=.12;
 const obstacles=[{x:amp.position.x,z:amp.position.z,halfX:.78,halfZ:.60}];
 const dark=new THREE.MeshStandardMaterial({color:0x3e3c42,roughness:.8});
 const ampBody=new THREE.Mesh(new RoundedBoxGeometry(.84,.76,.42,1,.035),dark);ampBody.castShadow=true;ampBody.receiveShadow=true;amp.add(ampBody);
 const grille=new THREE.Mesh(new THREE.PlaneGeometry(.72,.52),new THREE.MeshStandardMaterial({color:0x66616a,roughness:1}));grille.position.set(0,-.06,.218);amp.add(grille);
 const gold=new THREE.MeshStandardMaterial({color:0xb8a17b,roughness:.75});const bar=new THREE.Mesh(new THREE.BoxGeometry(.72,.022,.012),gold);bar.position.set(0,.24,.22);amp.add(bar);
 for(let i=0;i<4;i++){const knob=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.018,8),gold);knob.rotation.x=Math.PI/2;knob.position.set(-.25+i*.075,.29,.225);amp.add(knob)}
 const handle=new THREE.Mesh(new THREE.TorusGeometry(.12,.016,5,16,Math.PI),dark);handle.position.y=.38;amp.add(handle);scene.add(amp);
 const character=createCharacter();scene.add(character.root);
 const forward=new THREE.Vector3();let raf,t=0,last=performance.now(),disposed=false,attrTime=0,lookTarget=null;
 function frameOffset(){return container.clientWidth>700?.25:0}
 function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;const half=2.48;camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
 const ro=new ResizeObserver(resize);ro.observe(container);resize();
 // Clone the ahoge and both clips as one rigid accessory; keep the original attached.
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),dropPhysics=createAhogePhysics(scene,amp);
 let press=null,dropCount=0;
 function hitAhoge(e){
  const rect=renderer.domElement.getBoundingClientRect();
  pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(pointer,camera);character.root.updateMatrixWorld(true);
  const hit=raycaster.intersectObject(character.root,true)[0];
  if(!hit)return false;
  for(let node=hit.object;node;node=node.parent)if(node===character.tail)return true;
  return false;
 }
 const onPointerDown=e=>{if(!e.isPrimary){press=null;return}if(e.button===0)press={id:e.pointerId,x:e.clientX,y:e.clientY,hit:hitAhoge(e),dragged:false}};
 const onPointerUp=e=>{
  const start=press;press=null;
  if(!start||start.dragged||start.id!==e.pointerId||!start.hit||Math.hypot(e.clientX-start.x,e.clientY-start.y)>7||!hitAhoge(e))return;
  const velocity=new THREE.Vector3(-.45,.4,.25).applyQuaternion(character.root.quaternion);
  const drop=dropPhysics.spawn(character.tail,velocity,state.reducedMotion);dropCount++;
  container.dataset.ahogeParts=String(drop.body.shapes.length);
  container.dataset.ahogeDrops=String(dropCount);
 };
 const onPointerCancel=()=>{press=null};
 const onPointerMove=e=>{if(press){if(Math.hypot(e.clientX-press.x,e.clientY-press.y)>7)press.dragged=true}else renderer.domElement.style.cursor=hitAhoge(e)?'pointer':'grab'};
 renderer.domElement.addEventListener('pointerdown',onPointerDown);
 renderer.domElement.addEventListener('pointerup',onPointerUp);
 renderer.domElement.addEventListener('pointercancel',onPointerCancel);
 renderer.domElement.addEventListener('pointermove',onPointerMove);
 function updateDrops(dt){
  dropPhysics.step(dt);
  container.dataset.ahogeActive=String(dropPhysics.drops.length);
  container.dataset.ahogeLanded=String(dropPhysics.landed);
 }
 function clearDrops(){dropPhysics.clear();dropCount=0;container.dataset.ahogeDrops='0';press=null}
 function resetCamera(){const {x,z}=character.root.position;camera.position.set(x+2.3-frameOffset(),3.15,z+8);orbit.target.set(x-frameOffset(),1.68,z);camera.zoom=1;camera.updateProjectionMatrix();orbit.update()}
 function resetPosition(){clearDrops();lookTarget=null;character.root.position.set(0,0,0);character.root.rotation.set(0,0,0);resetCamera()}
 function animate(now){if(disposed)return;raf=requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;t+=dt;const input=inputVector(state.directions),moving=Boolean(input.x||input.y);state.moving=moving;
  if(moving){lookTarget=null;if(state.gesture)state.onGestureCancel();camera.getWorldDirection(forward);forward.y=0;forward.normalize();const next=stepPosition(character.root.position,input,forward,dt,state.dashing?DASH_SPEED:WALK_SPEED,WALK_RADIUS,obstacles);const dx=next.x-character.root.position.x,dz=next.z-character.root.position.z;character.root.position.x=next.x;character.root.position.z=next.z;
   if(Math.hypot(dx,dz)>.00001)character.root.rotation.y=turnToward(character.root.rotation.y,Math.atan2(dx,dz),dt);
  }
  if(!moving&&lookTarget!==null)character.root.rotation.y=turnToward(character.root.rotation.y,lookTarget,dt);
  const follow=1-Math.exp(-dt*5),fx=(character.root.position.x-frameOffset()-orbit.target.x)*follow,fz=(character.root.position.z-orbit.target.z)*follow;
  orbit.target.x+=fx;orbit.target.z+=fz;camera.position.x+=fx;camera.position.z+=fz;
  character.animate(t,dt,state);updateDrops(dt);orbit.update();renderer.render(scene,camera);
  if(now-attrTime>100){container.dataset.positionX=character.root.position.x.toFixed(3);container.dataset.positionZ=character.root.position.z.toFixed(3);container.dataset.moving=String(moving);container.dataset.dashing=String(moving&&state.dashing);container.dataset.emotion=state.emotion;container.dataset.gesture=state.gesture||'none';attrTime=now}
 }
 const onContextLost=e=>{e.preventDefault();state.clearInput();document.querySelector('#error').hidden=false};renderer.domElement.addEventListener('webglcontextlost',onContextLost);
 raf=requestAnimationFrame(animate);
 return {resetCamera,resetPosition,faceCamera(){lookTarget=Math.atan2(camera.position.x-character.root.position.x,camera.position.z-character.root.position.z)},dispose(){disposed=true;cancelAnimationFrame(raf);ro.disconnect();orbit.dispose();clearDrops();renderer.domElement.removeEventListener('pointerdown',onPointerDown);renderer.domElement.removeEventListener('pointerup',onPointerUp);renderer.domElement.removeEventListener('pointercancel',onPointerCancel);renderer.domElement.removeEventListener('pointermove',onPointerMove);scene.traverse(o=>{o.geometry?.dispose();const list=Array.isArray(o.material)?o.material:[o.material];for(const m of list)if(m){m.map?.dispose();m.dispose()}});renderer.dispose();renderer.domElement.remove()}};
}
