import * as THREE from 'three';

export function addMesh(parent, geometry, material, pos = [0, 0, 0]) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...pos); m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
}
function geometry(vertices, indices, uvs) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  if (uvs) g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  if (indices) g.setIndex(indices);
  g.computeVertexNormals(); return g;
}
function joinRings(indices, count, rows, close = true) {
  for (let j = 0; j < rows - 1; j++) for (let i = 0; i < (close ? count : count - 1); i++) {
    const a = j * count + i, b = j * count + (i + 1) % count, c = a + count, d = b + count;
    indices.push(a, c, b, b, c, d);
  }
}
// Keep broad planar changes without giving every triangle a separate hard light.
function softFacets(g, amount=.32) {
  const out=g.toNonIndexed(),smooth=out.getAttribute('normal').array.slice();
  out.computeVertexNormals();const normals=out.getAttribute('normal');
  for(let i=0;i<normals.count;i++){
    const n=new THREE.Vector3().fromArray(smooth,i*3).lerp(new THREE.Vector3().fromBufferAttribute(normals,i),amount).normalize();
    normals.setXYZ(i,n.x,n.y,n.z);
  }
  g.dispose();return out;
}
const CROWN_SEGMENTS=24;
const CROWN_RINGS=[[.805,.16,.17],[.76,.35,.345],[.66,.555,.52],[.48,.71,.64],[.19,.775,.70]];
function crownPoint(row,i){
  const [y,rx,rz]=CROWN_RINGS[row],a=i/CROWN_SEGMENTS*Math.PI*2;
  // Uneven meridian lengths break the stacked horizontal bands of a UV sphere.
  const stagger=[.004,.022,.041,.045,0][row]*(Math.sin(3*a+.7)+.35*Math.sin(5*a));
  const frontBacking=[0,0,0,.09,.09][row]*Math.max(0,Math.cos(a));
  return [Math.sin(a)*rx*.97,y+stagger,Math.cos(a)*rz-.035-frontBacking];
}
// Round tailoring sections retain a gently flattened front without square corners.
export function tailoredMesh(parent, rings, material, segments = 12, roundness = .82) {
  const v = [], ids = [];
  const power = a => Math.sign(a) * Math.abs(a) ** roundness;
  for (const [y, rx, rz, cx = 0, cz = 0] of rings) for (let i = 0; i < segments; i++) {
    const a = i / segments * Math.PI * 2;
    v.push(cx + power(Math.sin(a)) * rx, y, cz + power(Math.cos(a)) * rz);
  }
  joinRings(ids, segments, rings.length);
  for (const row of [0, rings.length - 1]) {
    const first = v.length / 3;
    for (let i = 0; i < segments; i++) v.push(...v.slice((row * segments + i) * 3, (row * segments + i) * 3 + 3));
    for (let i = 1; i < segments - 1; i++) {
      if (row === 0) ids.push(first, first + i, first + i + 1);
      else ids.push(first, first + i + 1, first + i);
    }
  }
  const m=material.clone();m.flatShading=false;
  return addMesh(parent, softFacets(geometry(v, ids),.55), m);
}
// Curved locks follow a swept silhouette, with broad roots and asymmetric pointed ends.
export function hairLock(parent, nodes, material, angle = 0) {
  const path = new THREE.CatmullRomCurve3(nodes.map(n => new THREE.Vector3(...n.slice(0, 3))), false, 'centripetal');
  const steps = nodes.length - 1, sides = 6, v = [], ids = [];
  const ca = Math.cos(angle), sa = Math.sin(angle);
  for (let j = 0; j <= steps; j++) {
    const t = j / steps, p = path.getPoint(t), q = t * (nodes.length - 1);
    const a = Math.min(nodes.length - 2, Math.floor(q)), f = q - a;
    const w = THREE.MathUtils.lerp(nodes[a][3], nodes[a + 1][3], f);
    const d = THREE.MathUtils.lerp(nodes[a][4], nodes[a + 1][4], f);
    for (let i = 0; i < sides; i++) {
      const theta = i / sides * Math.PI * 2;
      const u = Math.sin(theta) * w * .5, z = Math.cos(theta) * d * .5;
      v.push(p.x + u * ca + z * sa, p.y, p.z - u * sa + z * ca);
    }
  }
  joinRings(ids, sides, steps + 1);
  for (let i = 1; i < sides - 1; i++) {
    ids.push(0, i, i + 1); const k = steps * sides; ids.push(k, k + i + 1, k + i);
  }
  return addMesh(parent, geometry(v, ids), material);
}
export function hairCrown(parent, material) {
  const n=CROWN_SEGMENTS,v=[],ids=[],rings=CROWN_RINGS;
  for(let j=0;j<rings.length;j++)for(let i=0;i<n;i++)v.push(...crownPoint(j,i));
  // The fringe itself closes the front of the scalp. Do not stack a second
  // rounded shell underneath its visible panels: it creates a helmet ledge.
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){
    const a0=(i+.5)/n*Math.PI*2,frontAngle=Math.atan2(Math.sin(a0),Math.cos(a0));
    if(j>=2&&Math.abs(frontAngle)<.97)continue;
    const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;ids.push(a,c,b,b,c,d);
  }
  const top=v.length/3;v.push(0,.813,-.035);for(let i=0;i<n;i++)ids.push(i,(i+1)%n,top);
  const crownMaterial=material.clone();crownMaterial.flatShading=false;
  const crown=addMesh(parent,softFacets(geometry(v,ids),.36),crownMaterial);crown.name='Hair crown';
  const locks=[
    [-11,-7,-.54,-.32,.43,.94],[-7,-4,-.42,-.03,.56,1.025],
    [-4,-2,-.195,-.08,.60,.93],[-2,3,.025,-.165,.615,.985],
    [3,6,.26,.005,.575,1.04],[6,9,.47,-.03,.51,.95],[9,12,.59,-.32,.38,1.02],
  ];
  // Model the roots as one continuous sheet. Separate lock meshes begin only
  // below this shared surface, so their V cuts cannot open through the crown.
  // These limits coincide with the crown cells removed above. Keeping the
  // yoke inside that opening avoids coplanar overlap and self-shadow seams.
  const rootMin=-Math.PI/3,rootMax=Math.PI/3;
  const rootAngles=[rootMin,rootMax];
  for(let k=-n;k<=n;k++){
    const a=k/n*Math.PI*2;
    if(a>rootMin&&a<rootMax)rootAngles.push(a);
  }
  for(const lock of locks)for(const k of [lock[0],lock[1]]){
    const a=k/64*Math.PI*2;if(a>rootMin&&a<rootMax)rootAngles.push(a);
  }
  rootAngles.sort((a,b)=>a-b);
  const uniqueAngles=rootAngles.filter((a,i)=>!i||Math.abs(a-rootAngles[i-1])>1e-6);
  const rootV=[],rootI=[];
  for(const row of [0,1,2])for(const angle of uniqueAngles){
    const q=(angle/(Math.PI*2)*n+n)%n,ia=Math.floor(q),f=q-ia;
    let x,y,z;
    const edgeIndex=Math.abs(angle-rootMin)<1e-6?n-4:Math.abs(angle-rootMax)<1e-6?4:null;
    if(row>0&&edgeIndex!==null){
      [x,y,z]=crownPoint(row+2,edgeIndex);
    }else if(row===0){
      x=THREE.MathUtils.lerp(v[(2*n+ia)*3],v[(2*n+(ia+1)%n)*3],f);
      y=THREE.MathUtils.lerp(v[(2*n+ia)*3+1],v[(2*n+(ia+1)%n)*3+1],f);
      z=THREE.MathUtils.lerp(v[(2*n+ia)*3+2],v[(2*n+(ia+1)%n)*3+2],f);
    }else if(row===1){
      x=Math.sin(angle)*.665;y=.42+.025*Math.cos(angle*3);
      z=Math.max(Math.cos(angle)*.64-.035,faceDepth(x,y)+.04);
    }else{
      x=Math.sin(angle)*.72;y=.30+.04*Math.cos(angle*3)+.01*Math.sin(angle*7);
      z=Math.max(Math.cos(angle)*.66-.035,faceDepth(x,y)+.04);
    }
    rootV.push(x,y,z);
  }
  joinRings(rootI,uniqueAngles.length,3,false);
  const rootMaterial=material.clone();rootMaterial.side=THREE.DoubleSide;rootMaterial.flatShading=false;
  const roots=addMesh(parent,softFacets(geometry(rootV,rootI),.52),rootMaterial);roots.name='Continuous fringe roots';
  for(const [from,to,tipX,tipY,tipZ,tint] of locks){
    const start=from/64*Math.PI*2,end=to/64*Math.PI*2;
    const angles=[start,(start+end)/2,end];
    for(let k=-n;k<=n;k++){
      const a=k/n*Math.PI*2;
      if(a>start+.0001&&a<end-.0001)angles.push(a);
    }
    angles.sort((a,b)=>a-b);
    const cols=angles.length,grid=[],sv=[],si=[];
    // The first row is shared with the root sheet; separation starts below it.
    for(const row of [0,1,2]){
      grid.push([]);
      for(let c=0;c<cols;c++){
        const angle=angles[c];
        let x,y,z;
        if(row===0){
          x=Math.sin(angle)*.72;y=.30+.04*Math.cos(angle*3)+.01*Math.sin(angle*7);
          z=Math.max(Math.cos(angle)*.66-.035,faceDepth(x,y)+.04);
        }else if(row===1){
          const a=THREE.MathUtils.lerp(angle,(start+end)/2,.30);
          x=Math.sin(a)*.72;y=.07+.04*Math.cos(a*3);
          z=Math.max(Math.cos(a)*.66-.035,faceDepth(x,y)+.04);
        }else{x=tipX;y=tipY;z=Math.max(tipZ,faceDepth(x,y)+.035)}
        grid.at(-1).push(sv.length/3);sv.push(x,y,z);
      }
    }
    for(let j=0;j<grid.length-1;j++)for(let c=0;c<cols-1;c++){
      const a=grid[j][c],b=grid[j][c+1],d=grid[j+1][c+1],e=grid[j+1][c];si.push(a,e,b);if(j<grid.length-2)si.push(b,e,d);
    }
    const frontCount=si.length;
    for(const col of [0,cols-1])for(let row=1;row<grid.length-1;row++){
      const a=grid[row][col],b=grid[row+1][col],aa=sv.length/3;
      sv.push(sv[a*3],sv[a*3+1],sv[a*3+2]-.018,sv[b*3],sv[b*3+1],sv[b*3+2]-.018);
      if(col===0)si.push(a,aa,b,b,aa,aa+1);else si.push(a,b,aa,b,aa+1,aa);
    }
    const m=material.clone();m.side=THREE.DoubleSide;m.color.multiplyScalar(tint);m.flatShading=false;
    const edge=m.clone();edge.color.multiplyScalar(.82);
    const blade=softFacets(geometry(sv,si),.65);blade.addGroup(0,frontCount,0);blade.addGroup(frontCount,si.length-frontCount,1);
    addMesh(parent,blade,[m,edge]);
  }
  // Thin side locks sit outside the cheek and behind the fringe. Keep the
  // depth nearly straight instead of wrapping a convex shell over the face.
  const templeMat=material.clone();templeMat.flatShading=false;templeMat.side=THREE.DoubleSide;templeMat.color.multiplyScalar(1.025);
  const cutMat=templeMat.clone();cutMat.color.multiplyScalar(.82);
  for(const side of [-1,1]){
    const v=[],seams=[],cols=5,rows=[
      [.43,.55,.64,.23,.15],[.19,.59,.715,.34,.12],
      [-.12,.61,.73,.335,.10],[-.36,.62,.735,.32,.09],
    ];
    for(const [y,frontX,backX,frontZ,backZ] of rows)for(let col=0;col<cols;col++){
      const t=col/(cols-1);
      v.push(side*(THREE.MathUtils.lerp(frontX,backX,t)+.008*Math.sin(t*Math.PI)),y,THREE.MathUtils.lerp(frontZ,backZ,t));
    }
    const ends=[-.71,-.93,-.69,-.86,-.72];
    for(let col=0;col<cols;col++){
      const t=col/(cols-1),tip=col%2===1;
      v.push(side*(THREE.MathUtils.lerp(.62,.72,t)+(tip?-.006:.006)),ends[col],THREE.MathUtils.lerp(.30,.075,t));
    }
    joinRings(seams,cols,rows.length+1,false);
    const frontCount=seams.length,last=rows.length*cols,inner=v.length/3;
    // A narrow dark return gives each real V cut depth against the back hair.
    for(let col=0;col<cols;col++){const k=(last+col)*3;v.push(v[k]-side*.014,v[k+1]+.008,v[k+2]-.012)}
    for(let col=0;col<cols-1;col++){const a=last+col,b=a+1,c=inner+col,d=c+1;seams.push(a,c,b,b,c,d)}
    const g=softFacets(geometry(v,seams),.28);g.clearGroups();g.addGroup(0,frontCount,0);g.addGroup(frontCount,seams.length-frontCount,1);
    const panel=addMesh(parent,g,[templeMat,cutMat]);panel.name='Recessed split temple hair';
  }
  return crown;
}
export function backHair(parent, material) {
  const n=16,v=[],ids=[];
  const split=[-1.79,-1.98,-1.86,-2.02,-1.91,-1.82,-1.97,-1.87,-1.81];
  const tips=[-2.43,-2.57,-2.49,-2.61,-2.52,-2.44,-2.56,-2.40];
  // Preserve the crown seam and rear depth, but sweep the curtain's leading
  // edges behind the ears. This changes its coverage, not the hair group's size.
  const rows=[[.19,.775,.70,60],[.10,.754,.718,70],[-.04,.728,.733,86],[-.20,.715,.73,96],[-.65,.735,.67,100],[-1.24,.78,.61,96],[-1.68,.82,.57,92]];
  // The root uses the same crown vertices. Each long panel ends in its own
  // asymmetric point, with deep V splits instead of a repeated sawtooth hem.
  for(let j=0;j<=rows.length;j++)for(let i=0;i<=n;i++){
    const odd=i%2===1;
    let p;
    if(j===0)p=crownPoint(CROWN_RINGS.length-1,i+4);
    else{
      const isTip=j===rows.length;
      const start=THREE.MathUtils.degToRad(isTip?92:rows[j][3]);
      const a=start+i/n*(Math.PI*2-2*start);
      const y=isTip?(odd?tips[(i-1)/2]:split[i/2]):rows[j][0]+(j>3?.012*Math.sin(i*1.7+j):0);
      const rx=isTip?(odd?.77:.82):rows[j][1],rz=isTip?(odd?.52:.55):rows[j][2];
      const ridge=odd&&j>3?.009:0,lean=isTip&&odd?.026*Math.sin(i*2.2):0;
      p=[Math.sin(a+lean)*(rx+ridge)*.97,y,Math.cos(a+lean)*(rz+ridge)-.035];
    }
    v.push(p[0],(p[1]+.125)/1.25,p[2]);
  }
  joinRings(ids,n+1,rows.length+1,false);
  const frontCount=ids.length,inner=v.length/3,last=rows.length*(n+1);
  for(let i=0;i<=n;i++){const k=(last+i)*3;v.push(v[k]*.965,v[k+1]+.012,(v[k+2]+.035)*.955-.035)}
  for(let i=0;i<n;i++){const a=last+i,b=a+1,c=inner+i,d=c+1;ids.push(a,c,b,b,c,d)}
  const m=material.clone();m.side=THREE.DoubleSide;m.flatShading=false;
  const edge=m.clone();edge.color.multiplyScalar(.9);
  const g=softFacets(geometry(v,ids),.16);g.clearGroups();g.addGroup(0,frontCount,0);g.addGroup(frontCount,ids.length-frontCount,1);
  const result=addMesh(parent,g,[m,edge]);result.name='Split long hair';return result;
}
export function joinHairNormals(crown,back){
  const boundary=new Map();
  for(const [m,isBack] of [[crown,false],[back,true]]){
    const p=m.geometry.getAttribute('position'),n=m.geometry.getAttribute('normal');
    for(let i=0;i<p.count;i++){
      const y=isBack?p.getY(i)*1.25-.125:p.getY(i);
      if(Math.abs(y-.19)>.0001)continue;
      const key=[p.getX(i),p.getZ(i)].map(v=>v.toFixed(4)).join(',');
      if(!boundary.has(key))boundary.set(key,[]);
      boundary.get(key).push({n,i,isBack,v:new THREE.Vector3(n.getX(i),n.getY(i)/(isBack?1.25:1),n.getZ(i)).normalize()});
    }
  }
  for(const list of boundary.values()){
    if(!list.some(x=>x.isBack)||!list.some(x=>!x.isBack))continue;
    const avg=list.reduce((sum,x)=>sum.add(x.v),new THREE.Vector3()).normalize();
    for(const {n,i,isBack} of list){const a=avg.clone();a.y*=isBack?1.25:1;a.normalize();n.setXYZ(i,a.x,a.y,a.z)}
  }
}
// Bend the hanging lengths while keeping every scalp attachment vertex fixed.
// Rotating the whole curtain separates its open top boundary from the crown.
export function anchoredHairMotion(parent){
  const anchorY=(.19+.125)/1.25,meshes=[];
  parent.traverse(o=>{
    if(!o.isMesh)return;
    const p=o.geometry.getAttribute('position'),n=o.geometry.getAttribute('normal');
    meshes.push({p,n,positions:p.array.slice(),normals:n.array.slice()});
    o.geometry.computeBoundingSphere();o.geometry.boundingSphere.radius+=.08;
  });
  return angle=>{
    for(const {p,n,positions,normals} of meshes){
      for(let i=0;i<p.count;i++){
        const k=i*3,y=positions[k+1],z=positions[k+2];
        const a=angle*THREE.MathUtils.smoothstep(anchorY-y,0,.75),ca=Math.cos(a),sa=Math.sin(a);
        p.setXYZ(i,positions[k],anchorY+(y-anchorY)*ca-z*sa,(y-anchorY)*sa+z*ca);
        n.setXYZ(i,normals[k],normals[k+1]*ca-normals[k+2]*sa,normals[k+1]*sa+normals[k+2]*ca);
      }
      p.needsUpdate=true;n.needsUpdate=true;
    }
  };
}
export function pleatedSkirt(parent, material) {
  const n=60,v=[],ids=[];
  for(let row=0;row<4;row++)for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2,pleat=[0,.018,.035,.035,.005][i%5],r=[.36,.42,.51,.55][row]+pleat*(row?1:.25);
    v.push(Math.sin(a)*r,[1.40,1.28,1.02,.86][row],Math.cos(a)*r*[.65,.67,.73,.75][row]);
  }
  joinRings(ids,n,4);const m=material.clone();m.side=THREE.DoubleSide;m.flatShading=true;
  return addMesh(parent,geometry(v,ids),m);
}
export function faceDepth(x,y){
  // Recess only the outer temples hidden under the side hair. The eye area
  // and broad lower cheek retain their existing depth and frontal outline.
  const temple=.17*THREE.MathUtils.smoothstep(Math.abs(x),.49,.64)*THREE.MathUtils.smoothstep(y,-.32,-.04);
  return .485-.10*(x/.64)**2-.045*((y+.01)/.51)**2+.04*Math.exp(-(((y+.08)/.32)**2))-.035*THREE.MathUtils.smoothstep(-y,.24,.425)-.18*THREE.MathUtils.smoothstep(y,.12,.28)-temple;
}
export function faceGeometry() {
  const n=40,rows=9,v=[],ids=[];
  // Broad lower cheeks and a shallow chin match the short reference face.
  for(let j=0;j<rows;j++){
    const scale=.02+.98*j/(rows-1);
    for(let i=0;i<n;i++){
      const a=i/n*Math.PI*2,y=Math.sin(a)*.45+.025;
      const lower=THREE.MathUtils.smoothstep(-y,.08,.425),cs=Math.cos(a);
      const width=.65*(1-.05*lower),power=1-.28*lower;
      const x=Math.sign(cs)*Math.abs(cs)**power*width*scale,sy=(y-.025)*scale+.025;
      v.push(x,sy,faceDepth(x,sy));
    }
  }
  joinRings(ids,n,rows);
  const center=v.length/3;v.push(0,.025,faceDepth(0,.025));for(let i=0;i<n;i++)ids.push(center,i,(i+1)%n);
  const back=v.length/3;
  for(let i=0;i<n;i++){const k=((rows-1)*n+i)*3;v.push(v[k]*.91,v[k+1]*.95,-.25)}
  for(let i=0;i<n;i++){const a=(rows-1)*n+i,b=(rows-1)*n+(i+1)%n,c=back+i,d=back+(i+1)%n;ids.push(a,c,b,b,c,d)}
  // Shade the skin itself: the facial decal does not cover the temple or
  // side walls, which otherwise shine through narrow gaps between locks.
  const g=geometry(v,ids),positions=g.getAttribute('position'),colors=[];
  const shade=new THREE.Color('#9b849c'),white=new THREE.Color('#ffffff');
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
    const forehead=.55*THREE.MathUtils.smoothstep(y,.03,.13);
    const side=THREE.MathUtils.smoothstep(Math.abs(x),.48,.61)*THREE.MathUtils.smoothstep(y,-.34,-.12);
    const rear=1-THREE.MathUtils.smoothstep(z,-.22,.18);
    const color=white.clone().lerp(shade,Math.max(forehead,side,rear));
    colors.push(color.r,color.g,color.b);
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return g;
}
export function faceSurfaceGeometry() {
  const nx=32,ny=24,v=[],uv=[],ids=[];
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
    const x=(i/nx-.5)*1.18,y=(.5-j/ny)*.91-.005;
    v.push(x,y,faceDepth(x,y)+.006);uv.push(i/nx,1-j/ny);
  }
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;ids.push(a,c,b,b,c,d)}
  return geometry(v,ids,uv);
}
export function loafer(parent,material,soleMaterial){
  const n=16,v=[],ids=[];
  for(let j=0;j<5;j++)for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2,front=Math.cos(a),rx=[.131,.145,.143,.116,.075][j],rz=[.219,.239,.232,.175,.105][j];
    const y=[-.112,-.076,-.025,.062,.125][j]+(j===3?-.027*Math.max(0,front):0);
    v.push(Math.sin(a)*rx,y,front*rz+(j>2?-.045:0));
  }
  joinRings(ids,n,5);const cap=v.length/3;v.push(0,.138,-.05);for(let i=0;i<n;i++)ids.push(4*n+i,cap,4*n+(i+1)%n);
  const upper=addMesh(parent,geometry(v,ids.reverse()),material);
  tailoredMesh(parent,[[-.087,.145,.24],[-.123,.143,.238]],soleMaterial,16,.86);
  return upper;
}
