import './style.css';
import { createScene } from './scene.js';
import { EMOTIONS } from './face.js';
import conceptUI from '../design/interface-concept.png';
import normalOutline from '../design/emotion-normal-outline.png';
import { KEY_DIRECTIONS } from './movement.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state={emotion:'normal',gesture:null,directions:new Set(),moving:false,dashing:false,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
const keyboard=new Set(),pointers=new Map(),taps=new Map(),dashKeys=new Set(),dashPointers=new Set();
let scene,gestureTimer;
function updateDirections(){
 state.directions=new Set([...[...keyboard].map(code=>KEY_DIRECTIONS[code]),...pointers.values(),...taps.keys()]);
 state.dashing=dashKeys.size>0||dashPointers.size>0;
 $$('[data-move]').forEach(b=>b.classList.toggle('is-down',state.directions.has(b.dataset.move)));
 $('#dash').setAttribute('aria-pressed',String(state.dashing));
}
function clearInput(){keyboard.clear();pointers.clear();dashKeys.clear();dashPointers.clear();for(const timer of taps.values())clearTimeout(timer);taps.clear();updateDirections()}
state.clearInput=clearInput;
function setEmotion(id){if(!EMOTIONS.some(e=>e.id===id))return;state.emotion=id;scene?.faceCamera();$$('[data-emotion]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.emotion===id)))}
function setGesture(id){clearTimeout(gestureTimer);state.gesture=id;$$('[data-gesture]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.gesture===id)));if(id==='wave')gestureTimer=setTimeout(()=>setGesture(null),3200)}
state.onGestureCancel=()=>setGesture(null);
function toggleGesture(id){clearInput();scene?.faceCamera();setGesture(state.gesture===id?null:id)}
for(const [index,info] of EMOTIONS.entries()){
 const b=document.createElement('button');b.dataset.emotion=info.id;b.setAttribute('aria-pressed',String(index===0));b.title=`${info.label} (${index+1})`;
 const icon=document.createElement('span');icon.className='emotion-icon';icon.setAttribute('aria-hidden','true');icon.style.setProperty('--icon-x',index%2?1345:1150);icon.style.setProperty('--icon-y',[314,405,497][Math.floor(index/2)]);
 const img=document.createElement('img');img.src=conceptUI;img.alt='';img.draggable=false;icon.append(img);
 if(info.id==='normal'){img.className='selected-art';const outline=document.createElement('img');outline.className='normal-art';outline.src=normalOutline;outline.alt='';outline.draggable=false;icon.append(outline)}
 b.append(icon,document.createTextNode(info.label));b.addEventListener('click',()=>setEmotion(info.id));$('.emotion-grid').append(b);
}
$$('[data-gesture]').forEach(b=>b.addEventListener('click',()=>toggleGesture(b.dataset.gesture)));
$$('[data-move]').forEach(b=>{
 b.addEventListener('contextmenu',e=>e.preventDefault());
 b.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();b.setPointerCapture(e.pointerId);pointers.set(e.pointerId,b.dataset.move);updateDirections()});
 const release=e=>{pointers.delete(e.pointerId);updateDirections()};
 b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
 b.addEventListener('click',e=>{if(e.detail===0){const dir=b.dataset.move;clearTimeout(taps.get(dir));taps.set(dir,setTimeout(()=>{taps.delete(dir);updateDirections()},180));updateDirections()}});
});
const dash=$('#dash');
dash.addEventListener('contextmenu',e=>e.preventDefault());
dash.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();dash.setPointerCapture(e.pointerId);dashPointers.add(e.pointerId);updateDirections()});
const releaseDash=e=>{dashPointers.delete(e.pointerId);updateDirections()};
for(const event of ['pointerup','pointercancel','lostpointercapture'])dash.addEventListener(event,releaseDash);
window.addEventListener('keydown',e=>{
 if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest('textarea,select,[contenteditable=true],input:not([type=checkbox])'))return;
 if(e.code==='ShiftLeft'||e.code==='ShiftRight'){e.preventDefault();dashKeys.add(e.code);updateDirections();return}
 const direction=KEY_DIRECTIONS[e.code];if(direction){e.preventDefault();keyboard.add(e.code);updateDirections();return}
 if(e.repeat)return;
 const digit=Number(e.code.replace('Digit',''));if(e.code.startsWith('Digit')&&digit>=1&&digit<=6){e.preventDefault();setEmotion(EMOTIONS[digit-1].id)}
 const gesture={KeyZ:'fidget',KeyX:'wave',KeyC:'crouch',KeyV:'guitar'}[e.code];if(gesture){e.preventDefault();toggleGesture(gesture)}
 if(e.code==='KeyR'){e.preventDefault();scene?.resetCamera()}
 if(e.code==='Escape'){clearInput();setGesture(null)}
});
window.addEventListener('keyup',e=>{keyboard.delete(e.code);dashKeys.delete(e.code);updateDirections()});
window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInput()});
$('#show-keys').addEventListener('change',e=>{document.body.classList.toggle('keys-hidden',!e.target.checked);clearInput()});
$('#slop-ui').addEventListener('change',e=>document.body.classList.toggle('slop-ui',e.target.checked));
$('#camera-reset').addEventListener('click',()=>scene?.resetCamera());
$('#reset').addEventListener('click',()=>{clearInput();setEmotion('normal');setGesture(null);scene?.resetPosition()});
$('#retry').addEventListener('click',()=>location.reload());
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>state.reducedMotion=e.matches);
setEmotion('normal');
try{scene=createScene($('#viewport'),state);$('#loading').hidden=true}catch(error){console.error('3D 초기화 실패',error);$('#loading').hidden=true;$('#error').hidden=false}
if(import.meta.hot)import.meta.hot.dispose(()=>{scene?.dispose();clearInput();clearTimeout(gestureTimer)});
