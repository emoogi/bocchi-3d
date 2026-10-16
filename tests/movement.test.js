import test from 'node:test';
import assert from 'node:assert/strict';
import {inputVector,stepPosition,turnToward} from '../src/movement.js';
test('대각선 속도가 직선과 같고 반대 키가 상쇄된다',()=>{const v=inputVector(new Set(['up','right']));assert.ok(Math.abs(Math.hypot(v.x,v.y)-1)<1e-8);assert.deepEqual(inputVector(new Set(['up','down'])),{x:0,y:0})});
test('카메라가 돌아가도 W는 화면 위쪽으로 이동한다',()=>{let p=stepPosition({x:0,z:0},{x:0,y:1},{x:0,z:-1},.016);assert.ok(p.z<0&&p.x===0);p=stepPosition({x:0,z:0},{x:0,y:1},{x:1,z:0},.016);assert.ok(p.x>0&&p.z===0)});
test('움직임 없음, 영역 경계, 프레임 정지 후 과도한 이동 방지',()=>{assert.deepEqual(stepPosition({x:1,z:1},{x:0,y:0},{x:0,z:-1},.016),{x:1,z:1});const p=stepPosition({x:2.64,z:0},{x:1,y:0},{x:0,z:-1},10,1.85,2.65);assert.ok(Math.hypot(p.x,p.z)<=2.65+1e-8);assert.ok(p.x-2.64<.07)});
test('회전은 경계를 넘어 짧은 방향으로 이어진다',()=>{assert.ok(turnToward(Math.PI-.01,-Math.PI+.01,.016)>Math.PI-.01)});
test('대시는 걷기의 두 배이며 대각선도 같은 속도다',async()=>{
 const {WALK_SPEED,DASH_SPEED}=await import('../src/movement.js');
 const origin={x:0,z:0},forward={x:0,z:-1},up=inputVector(new Set(['up'])),diag=inputVector(new Set(['up','right']));
 const walk=stepPosition(origin,up,forward,.05,WALK_SPEED),dash=stepPosition(origin,up,forward,.05,DASH_SPEED),diagonal=stepPosition(origin,diag,forward,.05,DASH_SPEED);
 assert.ok(WALK_SPEED>1.2);assert.ok(Math.abs(dash.z/walk.z-2)<1e-8);
 assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.z)-Math.abs(dash.z))<1e-8);
});
test('가까이 옮긴 앰프를 걷기와 대시로 통과하지 않는다',async()=>{
 const {WALK_SPEED,DASH_SPEED}=await import('../src/movement.js');
 const obstacle={x:-1.3,z:-.85,halfX:.78,halfZ:.60};
 for(const speed of [WALK_SPEED,DASH_SPEED]){
  let p={x:0,z:-.85};
  for(let i=0;i<120;i++){
   p=stepPosition(p,{x:-1,y:0},{x:0,z:-1},1/60,speed,2.65,[obstacle]);
   assert.ok(Math.abs(p.x-obstacle.x)>=obstacle.halfX-1e-8||Math.abs(p.z-obstacle.z)>=obstacle.halfZ-1e-8);
   assert.ok(Math.hypot(p.x,p.z)<=2.65+1e-8);
  }
 }
});

test('확장된 공간에서 기존 경계를 넘어 걷고 새 경계에서 멈춘다',()=>{
 let p={x:0,z:0};
 for(let i=0;i<900;i++)p=stepPosition(p,{x:1,y:0},{x:0,z:-1},1/60);
 assert.ok(p.x>2.65);assert.ok(Math.abs(p.x-12)<1e-8);assert.equal(p.z,0);
});
