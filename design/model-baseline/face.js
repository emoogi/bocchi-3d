export const EMOTIONS = [
  {id:'normal', label:'기본', caption:'평소처럼'},
  {id:'anxious', label:'당황', caption:'아, 아… 어떡하지…'},
  {id:'shy', label:'부끄러움', caption:'그렇게 보면 부끄러워요…'},
  {id:'surprised', label:'놀람', caption:'에, 에에?!'},
  {id:'despair', label:'절망', caption:'구석으로 사라지고 싶어…'},
  {id:'sleepy', label:'졸음', caption:'잠깐만… 쉬었다가…'},
];
const ellipse=(c,x,y,rx,ry,fill)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill()};
function line(c,points,color='#594758',width=7){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;c.stroke()}
export function drawFace(canvas,emotion='normal',blink=false,portrait=false){
  const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.save();c.scale(canvas.width/512,canvas.height/512);
  if(portrait){
    c.fillStyle='#ec91b5';c.beginPath();c.moveTo(45,474);c.lineTo(60,160);c.lineTo(128,55);c.lineTo(272,27);c.lineTo(410,79);c.lineTo(470,183);c.lineTo(473,480);c.lineTo(403,454);c.lineTo(407,294);c.lineTo(106,298);c.lineTo(114,476);c.closePath();c.fill();
    c.fillStyle='#f9dcd2';c.fillRect(103,157,310,269);
    c.fillStyle='#e58aab';c.fillRect(158,419,200,93);c.fillStyle='#f3c5d6';c.fillRect(249,419,10,93);
    c.translate(86,120);c.scale(.67,.67);
  }
  if(emotion==='despair'||emotion==='anxious'){
    const g=c.createLinearGradient(0,70,0,350);g.addColorStop(0,emotion==='despair'?'rgba(83,104,150,.58)':'rgba(104,134,171,.36)');g.addColorStop(1,'rgba(104,134,171,0)');c.fillStyle=g;c.fillRect(0,60,512,340);
  }
  const closed=blink||emotion==='shy'||emotion==='sleepy';
  for(let i=0;i<2;i++){
    const x=i?370:142;
    if(closed){
      if(emotion==='shy'&&!blink){line(c,[[x-43,228],[x+40,244],[x-43,256]],'#54465a',8)}
      else{c.beginPath();c.moveTo(x-43,235);c.quadraticCurveTo(x,260,x+43,235);c.strokeStyle='#534351';c.lineWidth=9;c.lineCap='round';c.stroke()}
    }else if(emotion==='anxious'||emotion==='surprised'){
      ellipse(c,x,240,39,58,'#544b68');ellipse(c,x,240,32,50,emotion==='anxious'?'#d1ddeb':'#edf0f8');ellipse(c,x,243,18,32,'#c5d5e5');
    }else{
      const top=emotion==='despair'?239:174, height=emotion==='despair'?62:133;
      c.save();c.beginPath();c.roundRect(x-43,top,86,height,[4,4,23,23]);c.clip();c.fillStyle='#3b526c';c.fillRect(x-43,top,86,height);c.fillStyle='#548da2';c.fillRect(x-43,top+height*.48,86,height*.53);c.fillStyle='#7abfc6';c.fillRect(x-23,top+height*.73,47,height*.3);c.fillStyle='#add9da';c.fillRect(x+13,top+height*.77,15,21);c.restore();
      line(c,[[x-47,top],[x+46,top-2]],'#403a4b',11);
    }
    const tilt=emotion==='anxious'||emotion==='surprised'?-20:emotion==='despair'?-7:8;
    line(c,[[x-36,137+(i?tilt:0)],[x+37,137+(i?0:tilt)]],'#aa7789',5);
    if(emotion==='shy'){
      ellipse(c,x,331,59,23,'rgba(235,117,144,.33)');
      for(let j=0;j<3;j++)line(c,[[x-24+j*22,321],[x-30+j*22,337]],'#dd809c',4);
    }else if(emotion==='normal'){ellipse(c,x-3,329,41,11,'rgba(237,152,164,.16)')}
  }
  if(emotion==='surprised'){ellipse(c,256,370,23,26,'#b77581');ellipse(c,256,380,14,10,'#df9b9e')}
  else if(emotion==='anxious'){line(c,[[229,374],[241,367],[255,375],[267,367],[280,372]],'#b4828d',4)}
  else if(emotion==='shy'){c.beginPath();c.moveTo(236,367);c.quadraticCurveTo(256,381,277,367);c.strokeStyle='#be8c99';c.lineWidth=4;c.stroke()}
  else if(emotion==='sleepy'){ellipse(c,259,370,10,6,'#c08c96')}
  else line(c,[[240,372],[273,372]],'#bd909b',3);
  if(emotion==='anxious'){c.fillStyle='#88b8d5';c.beginPath();c.moveTo(468,153);c.quadraticCurveTo(438,205,465,213);c.quadraticCurveTo(493,211,468,153);c.fill()}
  if(portrait){
    c.restore();c.save();c.scale(canvas.width/512,canvas.height/512);
    c.fillStyle='#ed95b6';c.beginPath();c.moveTo(91,192);c.lineTo(102,125);c.lineTo(178,88);c.lineTo(280,92);c.lineTo(415,153);c.lineTo(425,256);c.lineTo(368,230);c.lineTo(344,165);c.lineTo(314,277);c.lineTo(273,239);c.lineTo(252,144);c.lineTo(223,243);c.lineTo(187,208);c.lineTo(168,157);c.lineTo(132,292);c.lineTo(91,279);c.closePath();c.fill();
    c.fillStyle='#dd7ea6';c.beginPath();c.moveTo(82,183);c.lineTo(117,180);c.lineTo(127,455);c.lineTo(105,487);c.lineTo(80,438);c.closePath();c.fill();
    c.fillStyle='#73a8ca';c.fillRect(63,177,47,48);c.fillStyle='#e9cc79';c.fillRect(67,228,45,45);
  }
  c.restore();return canvas;
}
export function makeFace(emotion,blink=false){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;return drawFace(canvas,emotion,blink)}
