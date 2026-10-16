export const EMOTIONS = [
  {id:'normal', label:'기본', caption:'평소처럼'},
  {id:'anxious', label:'당황', caption:'아, 아… 어떡하지…'},
  {id:'shy', label:'부끄러움', caption:'그렇게 보면 부끄러워요…'},
  {id:'surprised', label:'놀람', caption:'에, 에에?!'},
  {id:'despair', label:'무기력', caption:'잠깐만… 쉬었다가…'},
  {id:'sleepy', label:'졸림', caption:'잠깐만… 쉬었다가…'},
];
const ellipse=(c,x,y,rx,ry,fill)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill()};
function line(c,points,color,width=7){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineWidth=width;c.lineCap='butt';c.lineJoin='miter';c.strokeStyle=color;c.stroke()}
// Supplied face sheet: navy/cyan eyes with upper lids inside the eye width.
// Narrow warm sclera at the sides; no projecting lashes, pupils or glints.
function openEye(c,x,languid,side){
  const top=languid?288:231,bottom=391,w=49,outer=60,h=bottom-top;
  c.save();c.translate(x,top);
  const left=side*-outer*.12,right=side*outer*.12;
  c.beginPath();c.moveTo(-outer,left);c.lineTo(outer,right);c.lineTo(outer-2,h*.76);
  c.lineTo(outer-10,h);c.lineTo(-outer+12,h);c.lineTo(-outer+2,h*.79);c.closePath();c.clip();
  c.fillStyle='#d8d3db';c.fillRect(-outer,-8,outer*2,h+8);
  c.save();
  c.beginPath();c.moveTo(-w,left);c.lineTo(w,right);c.lineTo(w-2,h*.76);
  c.lineTo(w-10,h);c.lineTo(-w+12,h);c.lineTo(-w+2,h*.79);c.closePath();c.clip();
  c.fillStyle='#344e68';c.fillRect(-w,-8,w*2,h+8);
  c.fillStyle='#548ea5';c.fillRect(-w,306-top,w*2,bottom-306);
  c.fillStyle='#79bec9';c.beginPath();c.moveTo(-30,358-top);c.lineTo(5,350-top);
  c.lineTo(32,363-top);c.lineTo(25,h);c.lineTo(-25,h);c.closePath();c.fill();
  c.restore();
  const lid=languid?24:22;
  c.fillStyle='#352f3b';c.beginPath();c.moveTo(-outer,left);c.lineTo(outer,right);c.lineTo(outer,right+lid);c.lineTo(-outer,left+lid);c.closePath();c.fill();
  c.restore();
}
function closedEye(c,x){
  c.beginPath();c.moveTo(x-49,307);c.bezierCurveTo(x-24,327,x+25,327,x+49,306);
  c.strokeStyle='#39323c';c.lineWidth=12;c.lineCap='butt';c.stroke();
}
export function drawFace(canvas,emotion='normal',blink=false){
  const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.save();c.scale(canvas.width/512,canvas.height/512);
  // A restrained fringe shadow fades above the cheeks; it is shared by all
  // emotions and does not change the supplied eye silhouettes or add lashes.
  const shade=c.createLinearGradient(0,155,0,378);
  shade.addColorStop(0,'rgba(59,66,94,.44)');shade.addColorStop(.45,'rgba(59,66,94,.34)');shade.addColorStop(.78,'rgba(59,66,94,.14)');shade.addColorStop(1,'rgba(59,66,94,0)');
  // Extend the same upper shadow through the newly deepened fringe openings.
  c.fillStyle=shade;c.fillRect(0,0,512,378);
  for(let i=0;i<2;i++){
    const x=i?390:122,side=i?1:-1;
    if(emotion==='shy'){
      line(c,[[x+side*49,275],[x-side*44,304],[x+side*47,334]],'#3c333c',14);
    }else if(blink||emotion==='sleepy')closedEye(c,x);
    else if(emotion==='anxious'){
      // Different UV axis scales require these radii to render circular eyes.
      ellipse(c,x,321,57,73,'#5c8ca6');ellipse(c,x,321,45,58,'#dce6eb');
    }else openEye(c,x,emotion==='despair',side);
    // Subtle brows sit mostly beneath the overlapping vertical fringe.
    c.save();c.translate(x,0);c.scale(side,1);c.beginPath();
    c.moveTo(-34,emotion==='anxious'?206:214);c.lineTo(34,224);
    c.strokeStyle='#c2a0a6';c.lineWidth=3;c.stroke();c.restore();
    if(emotion==='shy'){
      ellipse(c,x,376,55,19,'rgba(237,145,162,.20)');
      for(let j=0;j<4;j++)line(c,[[x-28+j*18,365],[x-35+j*18,382]],'rgba(219,132,150,.49)',2.5);
    }else if(emotion==='normal'||emotion==='sleepy')ellipse(c,x,404,35,8,'rgba(237,152,164,.10)');
  }
  c.fillStyle='#cf899b';
  if(emotion==='anxious'){
    c.beginPath();c.moveTo(218,435);
    c.bezierCurveTo(221,419,231,424,240,430);
    c.bezierCurveTo(250,437,254,414,264,424);
    c.bezierCurveTo(275,434,282,419,289,430);
    c.bezierCurveTo(296,441,297,454,289,461);
    c.bezierCurveTo(279,468,273,451,263,459);
    c.bezierCurveTo(252,468,245,452,234,460);
    c.bezierCurveTo(222,468,213,451,218,435);c.closePath();c.fill();
  }else if(emotion==='surprised'){
    c.beginPath();c.moveTo(232,439);c.quadraticCurveTo(256,422,278,438);
    c.lineTo(283,458);c.quadraticCurveTo(256,452,229,459);c.closePath();c.fill();
  }else if(emotion==='sleepy'){
    ellipse(c,256,448,9,10,'#bd8594');
  }else if(emotion==='shy'){
    c.beginPath();c.moveTo(239,448);c.quadraticCurveTo(257,441,275,448);
    c.strokeStyle='#bd919b';c.lineWidth=4;c.stroke();
  }else line(c,[[246,449],[266,449]],'#c1979f',3);
  c.restore();return canvas;
}
export function makeFace(emotion,blink=false){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;return drawFace(canvas,emotion,blink)}
