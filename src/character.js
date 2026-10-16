import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makeFace, EMOTIONS } from './face.js';
import { hairLock, hairCrown, tailoredMesh, pleatedSkirt, faceGeometry, backHair, joinHairNormals, anchoredHairMotion, faceSurfaceGeometry, loafer } from './model-geometry.js';
const P={hair:0xff9ac0,hairLight:0xffabc8,hairDark:0xed8ab1,pink:0xf8a4c0,skin:0xffded0,white:0xf7e5ec,skirt:0x393743,sock:0x32333e,shoe:0x5b4140};
function material(color){return new THREE.MeshStandardMaterial({color,roughness:.92,flatShading:true})}
const mats=Object.fromEntries(Object.entries(P).map(([k,v])=>[k,material(v)]));
const faceSkin=new THREE.MeshBasicMaterial({color:0xf3d4d0,vertexColors:true,toneMapped:false});
const earSkin=new THREE.MeshBasicMaterial({color:0xb297a6,toneMapped:false});
// A modest head enlargement gives about 3.8 heads without changing the limb rig.
export const BODY={height:3.86,hip:1.72,knee:.92,ankle:.13,shoulder:2.64,head:3.19,upperArm:.58,lowerArm:.64};
const HEAD_ENLARGEMENT=1.12;
function mesh(geo,mat,parent,pos=[0,0,0]){const m=new THREE.Mesh(geo,typeof mat==='string'?mats[mat]:mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function box(parent,size,pos,mat,r=.025){return mesh(new RoundedBoxGeometry(...size,1,r),mat,parent,pos)}
function group(parent,pos=[0,0,0]){const g=new THREE.Group();g.position.set(...pos);parent.add(g);return g}
function stroke(parent,points,radius,mat){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
 return mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*5),radius,6,false),mat,parent);
}
function oval(parent,size,pos,mat){const m=mesh(new THREE.SphereGeometry(1,10,7),mat,parent,pos);m.material=m.material.clone();m.material.flatShading=false;m.scale.set(...size);return m}
function createGuitar(parent){
 const g=group(parent,[-.04,2.10,.30]);g.rotation.z=-1.0;g.scale.setScalar(.9);
 const shape=new THREE.Shape();shape.moveTo(0,.08);shape.bezierCurveTo(-.18,.34,-.35,.24,-.31,.03);shape.bezierCurveTo(-.55,-.12,-.48,-.51,-.18,-.55);shape.bezierCurveTo(.15,-.62,.43,-.35,.26,-.1);shape.bezierCurveTo(.17,.04,.18,.24,.08,.22);shape.lineTo(.07,.09);shape.closePath();
 const dark=material(0x272831),gold=material(0xc8a56e);mesh(new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1,curveSegments:14}),dark,g);
 box(g,[.12,.9,.07],[.005,.56,.05],material(0x483a3c),.008);box(g,[.15,.25,.08],[.008,1.09,.05],dark,.018);box(g,[.18,.06,.025],[-.015,-.3,.155],gold,.003);
 for(let y of [-.15,.025])box(g,[.15,.065,.022],[.005,y,.16],material(0xb2aaa3),.005);
 for(let i=0;i<6;i++)box(g,[.003,1.43,.004],[-.039+i*.017,.37,.178],material(0xb4b2ad),.001);
 for(let i=0;i<11;i++)box(g,[.122,.007,.005],[.004,.19+i*.074,.093],material(0xb8ad99),.001);
 for(let i=0;i<3;i++)for(let s of [-1,1])box(g,[.05,.034,.05],[s*.103,1.02+i*.072,.05],gold,.006);
 for(let p of [[.13,-.3],[.19,-.23],[.1,-.4]]){const k=mesh(new THREE.CylinderGeometry(.027,.027,.023,8),gold,g,[p[0],p[1],.16]);k.rotation.x=Math.PI/2}
 const strap=box(g,[.035,1.3,.02],[-.24,.27,-.025],material(0x55494c),.002);strap.rotation.z=-.25;
 g.visible=false;return g;
}
export function createHairAccessory(parent){
 const tail=group(parent,[-.72,.24,.08]);
 // Seat the strand root inside the blue clip instead of behind the two blocks.
 hairLock(tail,[[0,.06,.26,.16,.13],[-.17,-.09,.26,.17,.13],[-.26,-.30,.30,.115,.08],[-.30,-.46,.36,.008,.008]],mats.hairLight,-.25);
 box(tail,[.205,.205,.18],[-.025,0,.32],material(0x568fc4),.027).rotation.z=-.035;
 box(tail,[.20,.20,.18],[-.034,-.195,.33],material(0xe4b855),.027).rotation.z=.045;
 tail.name='Ahoge with hair clips';return tail;
}
export function createCharacter(){
 const root=new THREE.Group();root.name='Hitori';const rig=group(root);const torso=group(rig);
 const skirt=pleatedSkirt(torso,mats.skirt);skirt.scale.set(.78,.78,.80);skirt.position.y=.65;
 tailoredMesh(torso,[[2.89,.095,.09],[2.66,.12,.105]],mats.skin);
 tailoredMesh(torso,[[2.75,.17,.13],[2.67,.28,.17],[2.54,.345,.195],[2.36,.345,.205],[2.14,.31,.21],[1.94,.325,.215],[1.78,.35,.22],[1.71,.345,.21]],mats.pink);
 tailoredMesh(torso,[[1.78,.349,.221],[1.72,.348,.216],[1.69,.337,.205]],mats.hairDark);
 tailoredMesh(torso,[[2.81,.13,.105],[2.77,.15,.12],[2.71,.18,.14]],mats.pink);
 stroke(torso,[[0,2.81,.108],[0,2.70,.155],[0,2.53,.20],[0,2.30,.212],[0,1.96,.222],[0,1.71,.22]],.007,'white');
 box(torso,[.025,.048,.013],[0,2.72,.151],material(0xd9bccb),.006);
 for(let side of [-1,1]){
   stroke(torso,[[side*.13,2.03,.219],[side*.19,1.99,.221],[side*.27,1.96,.211]],.004,mats.hairDark);
 }
 const arms=[];
 for(let side of [-1,1]){
   const pivot=group(torso,[side*.33,BODY.shoulder,.01]);
   oval(pivot,[.125,.14,.125],[0,-.045,0],mats.pink);
   tailoredMesh(pivot,[[.02,.105,.115],[-.08,.13,.13],[-.25,.135,.133],[-.45,.124,.125],[-.585,.115,.115]],mats.pink);
   for(const [offset,radius] of [[.069,.008],[.035,.005]])stroke(pivot,[[side*offset,0,.116],[side*offset,-.20,.129],[side*offset,-.40,.124],[side*offset,-.58,.110]],radius,'white');
   const elbow=group(pivot,[0,-BODY.upperArm,0]);
   oval(elbow,[.132,.127,.132],[0,0,0],mats.pink);
   tailoredMesh(elbow,[[.025,.114,.115],[-.11,.13,.12],[-.28,.123,.115],[-.45,.105,.10],[-.555,.088,.088]],mats.pink);
   for(const [offset,radius] of [[.063,.008],[.032,.005]])stroke(elbow,[[side*offset,.015,.112],[side*offset,-.16,.117],[side*offset,-.35,.105],[side*offset,-.53,.088]],radius,'white');
   tailoredMesh(elbow,[[-.505,.102,.099],[-.56,.09,.09]],mats.hairDark);
   stroke(elbow,[[-.075,-.50,.066],[0,-.51,.10],[.075,-.50,.066]],.003,mats.pink);
   const hand=group(elbow,[0,-BODY.lowerArm,.032]);hand.scale.set(.75,.85,.8);
   oval(hand,[.10,.115,.075],[0,0,0],'skin').castShadow=false;
   const thumb=oval(hand,[.038,.064,.044],[-side*.081,.027,.051],'skin');thumb.rotation.z=-side*.45;
   for(let k=0;k<3;k++)stroke(hand,[[.04-k*.036,.038,.067],[.044-k*.036,.008,.077]],.0017,material(0xe2b9af));
   arms.push({pivot,elbow,hand,side});
 }
 const legs=[];
 for(let side of [-1,1]){
   const pivot=group(rig,[side*.175,BODY.hip,0]);
   tailoredMesh(pivot,[[0,.15,.14],[-.20,.155,.145],[-.42,.145,.135],[-.65,.123,.116],[-.80,.11,.105]],mats.skin,12,1);
   const knee=group(pivot,[0,BODY.knee-BODY.hip,0]);
   oval(knee,[.112,.115,.109],[0,0,0],mats.sock);
   tailoredMesh(knee,[[.04,.114,.11],[0,.114,.11],[-.22,.121,.117],[-.42,.108,.106],[-.64,.088,.089],[-.78,.081,.084]],mats.sock,12,1);
   tailoredMesh(knee,[[.041,.115,.111],[.008,.117,.113]],material(0x3d3b46),12,1);
   const foot=group(knee,[0,BODY.ankle-BODY.knee,.10]);foot.rotation.y=-side*.075;foot.scale.set(.85,1,.9);
   loafer(foot,mats.shoe,material(0x443433));
   stroke(foot,[[-.115,.045,.105],[-.08,.07,.155],[0,.076,.18],[.08,.07,.155],[.115,.045,.105]],.004,material(0x765351));
   stroke(foot,[[-.105,.075,.015],[0,.118,.035],[.105,.075,.015]],.015,material(0x513a3a));
   legs.push({pivot,knee,foot,side});
 }
 const head=group(torso,[0,BODY.head,0]);
 head.scale.set(.66,.735,.76).multiplyScalar(HEAD_ENLARGEMENT);
 mesh(faceGeometry(),faceSkin,head);
 for(let side of [-1,1])oval(head,[.085,.14,.095],[side*.60,-.10,-.04],earSkin);
 const faceTextures={};for(let {id} of EMOTIONS)for(let b of [false,true]){const t=new THREE.CanvasTexture(makeFace(id,b));t.colorSpace=THREE.SRGBColorSpace;faceTextures[`${id}-${b}`]=t}
 const face=mesh(faceSurfaceGeometry(),new THREE.MeshBasicMaterial({map:faceTextures['normal-false'],transparent:true,depthWrite:false,toneMapped:false}),head);face.castShadow=false;
 const crown=hairCrown(head,mats.hair);
 const hairGroup=group(head);
 hairGroup.scale.y=1.25;hairGroup.position.y=-.125;
 const longHair=backHair(hairGroup,mats.hair);joinHairNormals(crown,longHair);
 // Long edge strands follow the curtain behind the ears. Keep the short
 // split temple locks in front of them, with a clear depth separation.
 for(const side of [-1,1]){
   hairLock(hairGroup,[[side*.71,-.48,-.19,.008,.008],[side*.73,-.83,-.18,.12,.018],[side*.78,-1.35,-.10,.14,.018],[side*.78,-1.67,-.09,.12,.018],[side*.755,-1.94,-.08,.007,.008]],mats.hair,side*1.26);
   hairLock(hairGroup,[[side*.77,-1.23,-.12,.09,.02],[side*.79,-1.55,-.09,.09,.02],[side*.765,-1.83,-.08,.006,.008]],mats.hair,side*1.26);
 }
 // Keep the long ends near the skirt after enlarging the head, with the shared
 // crown root fixed in place. Width remains enlarged for a gentle A silhouette.
 hairGroup.scale.y/=HEAD_ENLARGEMENT;
 hairGroup.position.y=.19+(-.125-.19)/HEAD_ENLARGEMENT;
 const swayHair=anchoredHairMotion(hairGroup);
 const tail=createHairAccessory(head);
 head.traverse(o=>{if(o.isMesh)o.receiveShadow=false});
 const guitar=createGuitar(torso);
 // Rotate the upper body around the pelvis rather than around the floor.
 torso.position.y=BODY.hip;for(const child of torso.children)child.position.y-=BODY.hip;
 const down=new THREE.Vector3(0,-1,0);
 const up=new THREE.Vector3(0,1,0),shoeYaw=new THREE.Quaternion(),solePosition=new THREE.Vector3();
 function reach(arm,target,ease){
   const shoulder=arm.pivot.position.clone(),v=target.clone().sub(shoulder),d=Math.min(v.length(),BODY.upperArm+BODY.lowerArm-.007),dir=v.normalize();
   const a=(BODY.upperArm**2-BODY.lowerArm**2+d*d)/(2*d),h=Math.sqrt(Math.max(0,BODY.upperArm**2-a*a));
   // Fretting elbow hangs below the neck; the picking elbow stays forward.
   const bend=new THREE.Vector3(arm.side*.9,arm.side===1?-2:-.1,.9);bend.addScaledVector(dir,-bend.dot(dir)).normalize();
   const elbowPos=shoulder.clone().addScaledVector(dir,a).addScaledVector(bend,h);
   const upperQ=new THREE.Quaternion().setFromUnitVectors(down,elbowPos.clone().sub(shoulder).normalize());
   const lowerQ=new THREE.Quaternion().setFromUnitVectors(down,target.clone().sub(elbowPos).normalize());
   arm.pivot.quaternion.slerp(upperQ,ease);arm.elbow.quaternion.slerp(upperQ.clone().invert().multiply(lowerQ),ease);
 }

 let currentFace='',walkPhase=0;
 return {root,rig,torso,head,hairGroup,tail,arms,legs,guitar,
  setFace(emotion,blink){const key=`${emotion}-${blink}`;if(currentFace!==key){face.material.map=faceTextures[key];currentFace=key}},
  animate(t,dt,state){
   const moving=state.moving, g=state.gesture, emotion=state.emotion;
   walkPhase+=dt*(state.dashing?17:11);
   const reduced=state.reducedMotion, wave=Math.sin(walkPhase), ease=1-Math.exp(-dt*11);
   const crouch=g==='crouch', shy=emotion==='shy', anxious=emotion==='anxious', sleepy=emotion==='sleepy', despair=emotion==='despair';
   const lerp=(obj,prop,value)=>obj[prop]=THREE.MathUtils.lerp(obj[prop],value,ease);
   lerp(torso.rotation,'x',crouch?.12:despair?.12:sleepy?.08:0);
   lerp(torso.rotation,'z',anxious&&!reduced?Math.sin(t*27)*.018:moving?wave*.014:0);
   lerp(head.rotation,'x',crouch?.12:shy?.07:despair?.11:sleepy?.09+(!reduced?Math.sin(t*1.3)*.04:0):-.01);
   lerp(head.rotation,'z',g==='wave'?-.08:anxious&&!reduced?Math.sin(t*23)*.025:shy?.04:sleepy?.10:0);
   const hairSway=!reduced?(moving?wave*.02:Math.sin(t*1.5)*.006):0;
   swayHair(hairSway);tail.rotation.x=hairSway*2;
   guitar.visible=g==='guitar';
   for(const a of arms){
    lerp(a.pivot.position,'x',a.side*(moving?.37:.33));lerp(a.pivot.position,'y',BODY.shoulder-BODY.hip+(crouch?.035:0));
    lerp(a.hand.position,'z',g==='guitar'?0:.032);
    if(g==='guitar'&&!moving){
      guitar.updateMatrix();
      const pick=!reduced?Math.sin(t*17)*.035:0;
      const target=(a.side===1?new THREE.Vector3(.075,.64,.26):new THREE.Vector3(.005+pick,-.15,.26)).applyMatrix4(guitar.matrix);
      reach(a,target,ease);
      // Keep the palm parallel to the guitar front, with its entire depth
      // outside the strings. The target is measured on the actual instrument.
      const armQ=a.pivot.quaternion.clone().multiply(a.elbow.quaternion);
      a.hand.quaternion.copy(armQ.invert().multiply(guitar.quaternion)).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),a.side===1?-Math.PI/2:-.3));
      continue;
    }
    let z=-a.side*.20, x=-.20, elbow=-.24;
    if(moving){x=wave*.23*a.side;z=a.side*.18;elbow=-.12}
    else if(g==='fidget'||shy){z=-a.side*.20;x=-.24;elbow=-.35+(!reduced?Math.sin(t*6+a.side)*.04:0)}
    else if(g==='wave'&&a.side===-1){z=-2.15+(!reduced?Math.sin(t*8)*.16:0);x=-.35;elbow=-.8}
    else if(crouch){z=-a.side*.22;x=-.25;elbow=-.46}
    else if(g==='guitar'){z=a.side===1?-.8:.55;x=-.7;elbow=a.side===1?-.6:-.7+(!reduced?Math.sin(t*17)*.15:0)}
    else if(anxious){z=-a.side*(.22+(!reduced?Math.sin(t*18)*.02:0));x=-.38;elbow=-.65}
    else if(emotion==='surprised'){z=a.side*.45;x=-.5;elbow=-1.1}
    lerp(a.pivot.rotation,'z',z);lerp(a.pivot.rotation,'x',x);lerp(a.pivot.rotation,'y',0);lerp(a.elbow.rotation,'x',elbow);lerp(a.elbow.rotation,'y',0);lerp(a.elbow.rotation,'z',0);lerp(a.hand.rotation,'x',0);lerp(a.hand.rotation,'y',0);
    lerp(a.hand.rotation,'z',g==='fidget'&&!reduced?Math.sin(t*8)*.12*a.side:-a.side*.18);
   }
   for(const l of legs){
    lerp(l.pivot.rotation,'x',crouch?-.10:moving?wave*.43*l.side:0);
    lerp(l.knee.rotation,'x',crouch?.18:moving?Math.max(0,-wave*l.side)*.22:0);
    lerp(l.pivot.rotation,'z',0);
    l.foot.quaternion.copy(l.pivot.quaternion).multiply(l.knee.quaternion).invert().multiply(shoeYaw.setFromAxisAngle(up,-l.side*.075));
   }
   // Plant the lowest sole through the complete pose transition. Fixed squat
   // offsets stop working when thigh and shin lengths change.
   rig.position.y=0;root.updateMatrixWorld(true);
   const lowestSole=Math.min(...legs.map(l=>l.foot.getWorldPosition(solePosition).y-.123));
   rig.position.y=.007-lowestSole;
   if(g==='guitar'){
    root.updateMatrixWorld(true);
    guitar.visible=arms.every(a=>guitar.worldToLocal(a.hand.getWorldPosition(new THREE.Vector3())).z>.248);
   }
   const blink=!reduced&&!['anxious','surprised'].includes(emotion)&&t%4.7>4.53;
   this.setFace(emotion,blink);
  }
 };
}
