import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makeFace, EMOTIONS } from './face.js';
const P={hair:0xe67da9,hairLight:0xf093ba,hairDark:0xd66c9d,pink:0xe57da3,skin:0xf9dcd2,white:0xf7dce4,skirt:0x363440,sock:0x363540,shoe:0x60494a};
function material(color){return new THREE.MeshStandardMaterial({color,roughness:.93,flatShading:true})}
const mats=Object.fromEntries(Object.entries(P).map(([k,v])=>[k,material(v)]));
mats.skin.flatShading=false;
function mesh(geo,mat,parent,pos=[0,0,0]){const m=new THREE.Mesh(geo,typeof mat==='string'?mats[mat]:mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function box(parent,size,pos,mat,r=.025){return mesh(new RoundedBoxGeometry(...size,1,r),mat,parent,pos)}
function group(parent,pos=[0,0,0]){const g=new THREE.Group();g.position.set(...pos);parent.add(g);return g}
function strand(parent,points,z,mat='hair',depth=.09){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return mesh(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:1}),mat,parent,[0,0,z])}
function skirt(parent){const v=[],col=[],indices=[];const n=32;
  for(let ring=0;ring<2;ring++)for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=(ring?.48:.34)+(i%2?.018:-.018);v.push(Math.sin(a)*r,ring?.89:1.39,Math.cos(a)*r*.76);const c=new THREE.Color(i%2?0x42404c:0x34333e);col.push(c.r,c.g,c.b)}
  for(let i=0;i<n;i++){const j=(i+1)%n;indices.push(i,j,n+j,i,n+j,n+i)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide,flatShading:true}),parent);
}
function createGuitar(parent){
 const g=group(parent,[-.04,1.54,.31]);g.rotation.z=-1.0;
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
export function createCharacter(){
 const root=new THREE.Group();root.name='Hitori';const rig=group(root);const torso=group(rig);
 skirt(torso);
 const body=mesh(new THREE.CylinderGeometry(.315,.36,.77,8),mats.pink,torso,[0,1.73,0]);body.scale.z=.69;
 box(torso,[.57,.12,.43],[0,1.35,.015],'pink',.025);
 box(torso,[.022,.78,.016],[0,1.77,.247],'white',.003);
 box(torso,[.043,.095,.025],[0,2.07,.26],material(0xc6b7c4),.005);
 const collar=mesh(new THREE.CylinderGeometry(.195,.235,.14,8),mats.pink,torso,[0,2.16,0]);collar.scale.z=.88;
 box(torso,[.018,.14,.014],[0,2.16,.193],'white',.002);
 for(let side of [-1,1]){const pocket=box(torso,[.17,.009,.01],[side*.18,1.57,.25],mats.hairDark,.003);pocket.rotation.z=side*.23;}
 const arms=[];
 for(let side of [-1,1]){
   const pivot=group(torso,[side*.37,2.04,.015]);
   const upper=mesh(new THREE.CylinderGeometry(.145,.118,.38,6),mats.pink,pivot,[0,-.18,0]);upper.scale.z=.85;
   const stripe=box(pivot,[.035,.34,.015],[side*.105,-.17,.074],'white',.003);
   const elbow=group(pivot,[0,-.36,0]);
   const lower=mesh(new THREE.CylinderGeometry(.12,.13,.37,6),mats.pink,elbow,[0,-.16,0]);lower.scale.z=.85;
   box(elbow,[.035,.32,.015],[side*.097,-.155,.07],'white',.003);
   box(elbow,[.24,.075,.22],[0,-.335,0],'pink',.02);
   const hand=group(elbow,[0,-.435,.01]);box(hand,[.17,.17,.17],[0,0,0],'skin',.025);box(hand,[.06,.09,.09],[-side*.078,.01,.065],'skin',.014);
   arms.push({pivot,elbow,hand,side});
 }
 const legs=[];
 for(let side of [-1,1]){
   const pivot=group(rig,[side*.19,1.075,0]);box(pivot,[.205,.32,.22],[0,-.15,0],'skin',.02);
   const knee=group(pivot,[0,-.32,0]);box(knee,[.2,.62,.205],[0,-.285,0],'sock',.018);
   box(knee,[.255,.18,.4],[0,-.64,.084],'shoe',.04);box(knee,[.26,.045,.405],[0,-.713,.08],material(0x4b3c3f),.01);
   legs.push({pivot,knee,side});
 }
 const head=group(torso,[0,2.62,0]);
 box(head,[1.23,1.05,.83],[0,-.005,.035],'skin',.16);
 for(let side of [-1,1])box(head,[.15,.27,.2],[side*.63,-.13,.06],'skin',.04);
 const faceTextures={};for(let {id} of EMOTIONS)for(let b of [false,true]){const t=new THREE.CanvasTexture(makeFace(id,b));t.colorSpace=THREE.SRGBColorSpace;faceTextures[`${id}-${b}`]=t}
 const face=mesh(new THREE.PlaneGeometry(1.13,.98),new THREE.MeshBasicMaterial({map:faceTextures['normal-false'],transparent:true,depthWrite:false}),head,[0,-.015,.465]);face.castShadow=false;
 const capV=[],capI=[],capN=14;
 const rings=[[.08,.82],[.45,.72],[.70,.55],[.81,.36]];
 rings.forEach(([r,y],j)=>{for(let i=0;i<capN;i++){const a=i/capN*Math.PI*2;capV.push(Math.sin(a)*r,y,Math.cos(a)*r*.84)}});
 // Crown rings: narrow at the top, broad around the temples, open over the eyes.
 for(let i=0;i<capN;i++){const a=i/capN*Math.PI*2;capV.push(Math.sin(a)*.83,.10+Math.max(0,Math.cos(a))*.29,Math.cos(a)*.70)}
 for(let j=0;j<4;j++)for(let i=0;i<capN;i++){const a=j*capN+i,b=j*capN+(i+1)%capN,c=(j+1)*capN+i,d=(j+1)*capN+(i+1)%capN;capI.push(a,c,b,b,c,d)}
 const crownCenter=capV.length/3;capV.push(0,.835,0);for(let i=0;i<capN;i++)capI.push(i,(i+1)%capN,crownCenter);
 const capGeo=new THREE.BufferGeometry();capGeo.setAttribute('position',new THREE.Float32BufferAttribute(capV,3));capGeo.setIndex(capI);capGeo.computeVertexNormals();mesh(capGeo,mats.hair,head);
 const hairGroup=group(head);
 for(let i=0;i<11;i++){
  const a=1.12+i*(Math.PI*2-2.24)/10, r=.75;
  const lock=group(hairGroup,[Math.sin(a)*r,.13,Math.cos(a)*r*.85]);lock.rotation.y=a;
  const length=1.86+(.12*Math.sin(i*2.1));
  strand(lock,[[-.19,.1],[.19,.1],[.22,-length+.25],[.09,-length],[-.02,-length+.13],[-.17,-length+.03],[-.23,-length+.28]],-.05,i%3===0?'hairDark':i%3===1?'hairLight':'hair',.105);
 }
 strand(head,[[-.74,.38],[-.43,.62],[-.4,.32],[-.48,-.45],[-.48,-.92],[-.6,-1.16],[-.76,-.91]],.32,'hair',.14);
 strand(head,[[.48,.52],[.72,.36],[.77,-.98],[.61,-1.1],[.52,-.78],[.5,-.22]],.33,'hair',.14);
 strand(head,[[-.65,.52],[-.34,.71],[-.16,.67],[-.29,.14],[-.45,-.18],[-.48,.16]],.48,'hairLight',.12);
 strand(head,[[-.28,.67],[.13,.7],[.28,.48],[.16,.12],[-.05,-.15],[-.19,.13]],.58,'hair',.125);
 strand(head,[[.13,.69],[.47,.59],[.63,.35],[.49,-.19],[.35,.06],[.29,.35]],.5,'hairLight',.12);
 strand(head,[[-.17,.59],[-.13,.36],[-.1,.01],[-.04,-.13],[.03,.12]],.711,'hairDark',.008);
 const tail=group(head,[-.75,.24,.03]);tail.rotation.z=-.23;
 strand(tail,[[-.01,.06],[-.16,-.06],[-.36,-.5],[-.32,-.68],[-.12,-.4],[.07,-.16]],-.06,'hairLight',.13);
 box(head,[.22,.22,.23],[-.72,.25,.37],material(0x70a5d0),.017).rotation.z=-.08;
 box(head,[.21,.21,.23],[-.72,.015,.37],material(0xeccc75),.02).rotation.z=.04;
 head.traverse(o=>{if(o.isMesh)o.receiveShadow=false});
 const guitar=createGuitar(torso);
 const down=new THREE.Vector3(0,-1,0);
 function reach(arm,target,ease){
   const shoulder=arm.pivot.position.clone(),v=target.clone().sub(shoulder),d=Math.min(v.length(),.792),dir=v.normalize();
   const a=(.36**2-.435**2+d*d)/(2*d),h=Math.sqrt(Math.max(0,.36**2-a*a));
   const bend=new THREE.Vector3(arm.side*.9,-.1,-.3);bend.addScaledVector(dir,-bend.dot(dir)).normalize();
   const elbowPos=shoulder.clone().addScaledVector(dir,a).addScaledVector(bend,h);
   const upperQ=new THREE.Quaternion().setFromUnitVectors(down,elbowPos.clone().sub(shoulder).normalize());
   const lowerQ=new THREE.Quaternion().setFromUnitVectors(down,target.clone().sub(elbowPos).normalize());
   arm.pivot.quaternion.slerp(upperQ,ease);arm.elbow.quaternion.slerp(upperQ.clone().invert().multiply(lowerQ),ease);
 }

 let currentFace='';
 return {root,rig,torso,head,hairGroup,tail,arms,legs,guitar,
  setFace(emotion,blink){const key=`${emotion}-${blink}`;if(currentFace!==key){face.material.map=faceTextures[key];currentFace=key}},
  animate(t,dt,state){
   const moving=state.moving, g=state.gesture, emotion=state.emotion;
   const reduced=state.reducedMotion, wave=Math.sin(t*9), ease=1-Math.exp(-dt*11);
   const crouch=g==='crouch', shy=emotion==='shy', anxious=emotion==='anxious', sleepy=emotion==='sleepy', despair=emotion==='despair';
   const lerp=(obj,prop,value)=>obj[prop]=THREE.MathUtils.lerp(obj[prop],value,ease);
   lerp(rig.position,'y',crouch?-.35:moving?Math.abs(wave)*.025:!reduced?Math.sin(t*2)*.008:0);
   lerp(torso.rotation,'x',crouch?.28:despair?.12:sleepy?.08:0);
   lerp(torso.rotation,'z',anxious&&!reduced?Math.sin(t*27)*.018:moving?wave*.014:0);
   lerp(head.rotation,'x',crouch?.23:shy?.1:despair?.21:sleepy?.13+(!reduced?Math.sin(t*1.3)*.06:0):-.01);
   lerp(head.rotation,'z',g==='wave'?-.08:anxious&&!reduced?Math.sin(t*23)*.025:shy?.06:0);
   hairGroup.rotation.x=!reduced?(moving?wave*.02:Math.sin(t*1.5)*.006):0;tail.rotation.x=hairGroup.rotation.x*2;
   guitar.visible=g==='guitar';
   for(const a of arms){
    if(g==='guitar'&&!moving){
      const target=a.side===1?new THREE.Vector3(.50,1.88,.49):new THREE.Vector3(-.19+(!reduced?Math.sin(t*17)*.025:0),1.51+(!reduced?Math.sin(t*17)*.07:0),.52);
      reach(a,target,ease);a.hand.rotation.set(0,0,a.side*.3);continue;
    }
    let z=-a.side*.36, x=-.18, elbow=-.24;
    if(moving){x=wave*.28*a.side;z=-a.side*.1;elbow=-.12}
    else if(g==='fidget'||shy){z=-a.side*.4;x=-.23;elbow=-.5+(!reduced?Math.sin(t*6+a.side)*.04:0)}
    else if(g==='wave'&&a.side===-1){z=2.25+(!reduced?Math.sin(t*8)*.18:0);x=-.25;elbow=-.4}
    else if(crouch){z=-a.side*.38;x=-.8;elbow=-.55}
    else if(g==='guitar'){z=a.side===1?-.8:.55;x=-.7;elbow=a.side===1?-.6:-.7+(!reduced?Math.sin(t*17)*.15:0)}
    else if(anxious){z=-a.side*(.3+(!reduced?Math.sin(t*18)*.025:0));x=-.38;elbow=-.65}
    else if(emotion==='surprised'){z=a.side*.45;x=-.5;elbow=-1.1}
    lerp(a.pivot.rotation,'z',z);lerp(a.pivot.rotation,'x',x);lerp(a.elbow.rotation,'x',elbow);
    lerp(a.hand.rotation,'z',g==='fidget'&&!reduced?Math.sin(t*8)*.12*a.side:0);
   }
   for(const l of legs){lerp(l.pivot.rotation,'x',crouch?-1.1:moving?wave*.43*l.side:0);lerp(l.knee.rotation,'x',crouch?1.8:moving?Math.max(0,-wave*l.side)*.22:0);lerp(l.pivot.rotation,'z',crouch?l.side*.15:0)}
   const blink=!reduced&&!['anxious','surprised'].includes(emotion)&&t%4.7>4.53;
   this.setFace(emotion,blink);
  }
 };
}
