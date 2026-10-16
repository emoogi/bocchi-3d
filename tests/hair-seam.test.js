import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {backHair,hairCrown,joinHairNormals,anchoredHairMotion} from '../src/model-geometry.js';

test('걷기와 대시의 양방향 흔들림에서 뒷머리 뿌리는 두피에 고정된다',()=>{
 const head=new THREE.Group(),curtain=new THREE.Group(),material=new THREE.MeshStandardMaterial();
 head.add(curtain);curtain.scale.y=1.25/1.12;curtain.position.y=.19+(-.125-.19)/1.12;
 const crown=hairCrown(head,material),back=backHair(curtain,material);joinHairNormals(crown,back);
 const p=back.geometry.attributes.position,base=p.array.slice(),root=[],point=new THREE.Vector3();
 for(let i=0;i<p.count;i++)if(Math.abs(p.getY(i)*1.25-.125-.19)<1e-6)root.push(i);
 const bend=anchoredHairMotion(curtain);assert.ok(root.length>16);
 for(let frame=0;frame<180;frame++){
  bend(Math.sin(frame*(frame<90?11:17)/60)*.02);head.updateMatrixWorld(true);
  for(const i of root){
   const original=new THREE.Vector3().fromArray(base,i*3).applyMatrix4(curtain.matrixWorld);
   point.fromBufferAttribute(p,i).applyMatrix4(curtain.matrixWorld);
   assert.ok(point.distanceTo(original)<1e-7);
  }
  assert.ok(p.array.every(Number.isFinite));
 }
 assert.ok(p.array.some((v,i)=>Math.abs(v-base[i])>.01));
 bend(0);assert.deepEqual(p.array,base);
});
