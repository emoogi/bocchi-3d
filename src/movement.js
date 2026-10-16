export const KEY_DIRECTIONS={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
export const WALK_SPEED=1.85,DASH_SPEED=3.7;
export const WALK_RADIUS=12;
export function inputVector(directions){let x=Number(directions.has('right'))-Number(directions.has('left'));let y=Number(directions.has('up'))-Number(directions.has('down'));const n=Math.hypot(x,y);return n?{x:x/n,y:y/n}:{x:0,y:0}}
export function stepPosition(position,input,forward,dt,speed=WALK_SPEED,radius=WALK_RADIUS,obstacles=[]){
 const dx=(forward.z*-input.x+forward.x*input.y)*speed*Math.min(dt,.05);
 const dz=(forward.x*input.x+forward.z*input.y)*speed*Math.min(dt,.05);
 let x=position.x+dx,z=position.z+dz;const length=Math.hypot(x,z);
 if(length>radius){x=x/length*radius;z=z/length*radius}
 for(const o of obstacles){
  const dx=x-o.x,dz=z-o.z,px=o.halfX-Math.abs(dx),pz=o.halfZ-Math.abs(dz);
  if(px>0&&pz>0){if(px<pz)x=o.x+(dx<0?-o.halfX:o.halfX);else z=o.z+(dz<0?-o.halfZ:o.halfZ)}
 }
 return {x,z};
}
export function turnToward(current,target,dt){const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));return current+delta*(1-Math.exp(-dt*12))}
