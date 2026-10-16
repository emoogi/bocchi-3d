import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createCharacter } from './character.js';
import { inputVector, stepPosition, turnToward } from './movement.js';
export function createScene(container,state,onMovement){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#f1f0f2');scene.fog=new THREE.Fog('#f1f0f2',12,27);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
 renderer.domElement.setAttribute('aria-hidden','true');container.appendChild(renderer.domElement);
 const camera=new THREE.OrthographicCamera(-3,3,2.3,-2.3,.1,60);camera.position.set(.6,3.1,8);
 const orbit=new OrbitControls(camera,renderer.domElement);orbit.target.set(0,1.65,0);orbit.enableDamping=true;orbit.dampingFactor=.085;orbit.enablePan=false;orbit.minZoom=.7;orbit.maxZoom=2.1;orbit.minPolarAngle=.55;orbit.maxPolarAngle=Math.PI/2-.035;orbit.rotateSpeed=.65;orbit.zoomSpeed=.65;
 const ambient=new THREE.HemisphereLight(0xffffff,0xb6a9b7,2.2);scene.add(ambient);
 const light=new THREE.DirectionalLight(0xfff4ef,1.9);light.position.set(-3.5,7,5);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-6;light.shadow.camera.right=6;light.shadow.camera.top=7;light.shadow.camera.bottom=-6;light.shadow.normalBias=.025;light.shadow.bias=-.0002;light.shadow.radius=5;light.shadow.blurSamples=8;scene.add(light);
 const fill=new THREE.DirectionalLight(0xe5edff,.8);fill.position.set(4,3,-3);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:0xf1f0f2,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.receiveShadow=true;scene.add(floor);
 const grid=new THREE.GridHelper(70,70,0xdad6df,0xe4e0e7);grid.position.y=-.021;grid.material.transparent=true;grid.material.opacity=.42;scene.add(grid);
 const rug=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,.012,64),new THREE.MeshStandardMaterial({color:0xe7b9cc,roughness:1}));rug.position.y=-.011;rug.receiveShadow=true;scene.add(rug);
 const amp=new THREE.Group();amp.position.set(-2.2,.36,-1.3);amp.rotation.y=.12;
 const dark=new THREE.MeshStandardMaterial({color:0x3e3c42,roughness:.8});
 const ampBody=new THREE.Mesh(new RoundedBoxGeometry(.84,.76,.42,1,.035),dark);ampBody.castShadow=true;ampBody.receiveShadow=true;amp.add(ampBody);
 const grille=new THREE.Mesh(new THREE.PlaneGeometry(.72,.52),new THREE.MeshStandardMaterial({color:0x66616a,roughness:1}));grille.position.set(0,-.06,.218);amp.add(grille);
 const gold=new THREE.MeshStandardMaterial({color:0xb8a17b,roughness:.75});const bar=new THREE.Mesh(new THREE.BoxGeometry(.72,.022,.012),gold);bar.position.set(0,.24,.22);amp.add(bar);
 for(let i=0;i<4;i++){const knob=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.018,8),gold);knob.rotation.x=Math.PI/2;knob.position.set(-.25+i*.075,.29,.225);amp.add(knob)}
 const handle=new THREE.Mesh(new THREE.TorusGeometry(.12,.016,5,16,Math.PI),dark);handle.position.y=.38;amp.add(handle);scene.add(amp);
 const character=createCharacter();scene.add(character.root);
 const forward=new THREE.Vector3();let raf,t=0,last=performance.now(),lastMoving=false,disposed=false,attrTime=0;
 function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;const half=2.23;camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
 const ro=new ResizeObserver(resize);ro.observe(container);resize();
 function resetCamera(){const {x,z}=character.root.position;camera.position.set(x+.6,3.1,z+8);orbit.target.set(x,1.65,z);camera.zoom=1;camera.updateProjectionMatrix();orbit.update()}
 function resetPosition(){character.root.position.set(0,0,0);character.root.rotation.set(0,0,0);resetCamera()}
 function animate(now){if(disposed)return;raf=requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;t+=dt;const input=inputVector(state.directions),moving=Boolean(input.x||input.y);state.moving=moving;
  if(moving){if(state.gesture)state.onGestureCancel();camera.getWorldDirection(forward);forward.y=0;forward.normalize();const next=stepPosition(character.root.position,input,forward,dt);const dx=next.x-character.root.position.x,dz=next.z-character.root.position.z;character.root.position.x=next.x;character.root.position.z=next.z;
   if(Math.hypot(dx,dz)>.00001)character.root.rotation.y=turnToward(character.root.rotation.y,Math.atan2(dx,dz),dt);
  }
  if(moving!==lastMoving){lastMoving=moving;onMovement(moving)}
  const follow=1-Math.exp(-dt*5),fx=(character.root.position.x-orbit.target.x)*follow,fz=(character.root.position.z-orbit.target.z)*follow;
  orbit.target.x+=fx;orbit.target.z+=fz;camera.position.x+=fx;camera.position.z+=fz;
  character.animate(t,dt,state);orbit.update();renderer.render(scene,camera);
  if(now-attrTime>100){container.dataset.positionX=character.root.position.x.toFixed(3);container.dataset.positionZ=character.root.position.z.toFixed(3);container.dataset.moving=String(moving);container.dataset.emotion=state.emotion;container.dataset.gesture=state.gesture||'none';attrTime=now}
 }
 const onContextLost=e=>{e.preventDefault();state.clearInput();document.querySelector('#error').hidden=false};renderer.domElement.addEventListener('webglcontextlost',onContextLost);
 raf=requestAnimationFrame(animate);
 return {resetCamera,resetPosition,dispose(){disposed=true;cancelAnimationFrame(raf);ro.disconnect();orbit.dispose();scene.traverse(o=>{o.geometry?.dispose();const list=Array.isArray(o.material)?o.material:[o.material];for(const m of list)if(m){m.map?.dispose();m.dispose()}});renderer.dispose();renderer.domElement.remove()}};
}
