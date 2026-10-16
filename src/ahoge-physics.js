import * as THREE from 'three';
import {World,Body,Box,Plane,Vec3,Quaternion,Material,ContactMaterial} from 'cannon-es';

export function createAhogePhysics(scene,amplifier){
 const world=new World({gravity:new Vec3(0,-9.82,0),allowSleep:true});
 world.solver.iterations=20;
 const material=new Material('hair accessory');
 world.addContactMaterial(new ContactMaterial(material,material,{friction:.65,restitution:.12,contactEquationStiffness:1e7,contactEquationRelaxation:4}));
 const ground=new Body({mass:0,material,shape:new Plane()});ground.position.y=-.004;ground.quaternion.setFromEuler(-Math.PI/2,0,0);world.addBody(ground);
 if(amplifier){
  const solid=new Body({mass:0,material,shape:new Box(new Vec3(.42,.38,.21))});
  solid.position.copy(amplifier.position);solid.quaternion.copy(amplifier.quaternion);world.addBody(solid);
 }
 const drops=[],bounds=new THREE.Box3(),center=new THREE.Vector3(),size=new THREE.Vector3();
 const inverse=new THREE.Matrix4(),relative=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),scale=new THREE.Vector3();
 function remove(drop){scene.remove(drop.mesh);world.removeBody(drop.body)}
 function spawn(source,velocity,reducedMotion=false){
  source.updateWorldMatrix(true,true);
  const copy=source.clone(true),mesh=new THREE.Group();mesh.name='Fallen ahoge with clips';
  source.matrixWorld.decompose(copy.position,q,copy.scale);
  bounds.setFromObject(source).getCenter(center);mesh.position.copy(center);mesh.quaternion.copy(q);
  copy.position.sub(center).applyQuaternion(q.clone().invert());copy.quaternion.identity();mesh.add(copy);scene.add(mesh);mesh.updateMatrixWorld(true);
  const body=new Body({mass:.12,material,linearDamping:.25,angularDamping:.55,sleepSpeedLimit:.08,sleepTimeLimit:.6});
  body.position.copy(mesh.position);body.quaternion.copy(mesh.quaternion);
  inverse.copy(mesh.matrixWorld).invert();
  // Each visible component has its own oriented collider, joined as one body.
  copy.traverse(part=>{
   if(!part.isMesh)return;
   part.geometry.computeBoundingBox();part.geometry.boundingBox.getSize(size);
   relative.multiplyMatrices(inverse,part.matrixWorld);relative.decompose(p,q,scale);
   part.geometry.boundingBox.getCenter(center).applyMatrix4(relative);
   const half=new Vec3(Math.max(.006,Math.abs(size.x*scale.x)/2),Math.max(.006,Math.abs(size.y*scale.y)/2),Math.max(.006,Math.abs(size.z*scale.z)/2));
   body.addShape(new Box(half),new Vec3(center.x,center.y,center.z),new Quaternion(q.x,q.y,q.z,q.w));
  });
  body.velocity.copy(velocity);body.angularVelocity.set(reducedMotion?.6:2.1,reducedMotion?.2:.7,reducedMotion?-.3:-1.4);
  world.addBody(body);const drop={mesh,body};drops.push(drop);
  return drop;
 }
 function step(dt){
  world.step(1/120,Math.min(dt,.05),6);
  for(const drop of drops){
   drop.mesh.position.copy(drop.body.position);drop.mesh.quaternion.copy(drop.body.quaternion);
  }
 }
 function clear(){for(const drop of drops)remove(drop);drops.length=0}
 return {spawn,step,clear,drops,world,get landed(){return drops.filter(d=>d.body.position.y<.5&&d.body.velocity.length()<.4).length}};
}
