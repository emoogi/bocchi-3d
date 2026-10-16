import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createHairAccessory} from '../src/character.js';
import {createAhogePhysics} from '../src/ahoge-physics.js';
function accessory(){
 const parent=new THREE.Group(),g=createHairAccessory(parent);
 parent.position.set(.2,3,.1);parent.scale.set(.74,.82,.85);parent.rotation.z=.04;
 parent.updateMatrixWorld(true);return g;
}
function assertConnected(source){
 const clip=source.children[1];clip.geometry.computeBoundingBox();
 // The strand's root center must penetrate the solid core, beyond the bevel.
 const core=clip.geometry.boundingBox.clone().expandByScalar(-.027);
 const root=source.localToWorld(new THREE.Vector3(0,.06,.26));clip.worldToLocal(root);
 assert.ok(core.containsPoint(root),'분홍 가닥 뿌리가 파란 블록과 떨어져 있음');
}
test('아호게와 두 블록을 하나의 강체로 복제하고 원본 위치를 보존한다',()=>{
 const source=accessory(),physics=createAhogePhysics(new THREE.Scene()),originals=source.children.map(p=>p.getWorldPosition(new THREE.Vector3()));
 assertConnected(source);
 const drop=physics.spawn(source,new THREE.Vector3(-.1,.1,.2));drop.mesh.updateMatrixWorld(true);
 const initialRotation=drop.body.quaternion.clone();
 assert.equal(drop.body.shapes.length,3);assert.equal(drop.mesh.children[0].children.length,3);
 assertConnected(drop.mesh.children[0]);
 drop.mesh.children[0].children.forEach((p,i)=>assert.ok(p.getWorldPosition(new THREE.Vector3()).distanceTo(originals[i])<1e-6));
 for(let i=0;i<400;i++)physics.step(1/120);
 assert.ok(drop.body.position.y<.5);assert.ok(Math.abs(drop.body.quaternion.x*initialRotation.x+drop.body.quaternion.y*initialRotation.y+drop.body.quaternion.z*initialRotation.z+drop.body.quaternion.w*initialRotation.w)<.999);
 drop.mesh.updateMatrixWorld(true);assertConnected(drop.mesh.children[0]);
 source.children.forEach((p,i)=>assert.ok(p.getWorldPosition(new THREE.Vector3()).distanceTo(originals[i])<1e-8));
 physics.clear();assert.equal(physics.drops.length,0);assert.equal(physics.world.bodies.length,1);
});
test('연속 낙하 조각은 서로 충돌하고 바닥에서 안정적으로 멈춘다',()=>{
 const physics=createAhogePhysics(new THREE.Scene()),source=accessory();let pairs=0;
 const step=()=>{
  physics.step(1/120);
  pairs+=physics.world.contacts.filter(c=>c.bi.mass>0&&c.bj.mass>0).length;
 };
 for(let i=0;i<6;i++){physics.spawn(source,new THREE.Vector3(-.1,.1,.2));for(let j=0;j<40;j++)step()}
 for(let i=0;i<600;i++)step();
 assert.equal(physics.drops.length,6);assert.ok(pairs>0);
 let minGap=0;
 for(const c of physics.world.contacts){
  const gap=c.ni.dot(c.bj.position.vadd(c.rj).vsub(c.bi.position.vadd(c.ri)));
  minGap=Math.min(minGap,gap);
 }
 assert.ok(minGap>-.005,`접촉 허용 오차 초과: ${minGap}`);
 for(const {body} of physics.drops){assert.ok([body.position.x,body.position.y,body.position.z,body.quaternion.w].every(Number.isFinite));assert.ok(body.position.y<.8);assert.ok(body.velocity.length()<.4)}
 assert.equal(physics.landed,6);
});
