import * as THREE from './vendor/three/three.module.js';
// Sparse depth streaks, rendered as one batch. All assets are local.
const canvas=document.createElement('canvas');canvas.id='speedField';canvas.setAttribute('aria-hidden','true');document.body.prepend(canvas);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const N=220, particles=Array.from({length:N},()=>spawn(true));
let width=1,height=1,renderer=null,scene,camera,geometry,material;
let context=null,raf=0,previous=0,paintAt=0,velocity=0,effort=0;
let target={running:false,speed:0,accel:0,effects:true,background:true};
const positions=new Float32Array(N*6),tints=new Float32Array(N*6),alphas=new Float32Array(N*2);
function spawn(initial=false){const angle=Math.random()*Math.PI*2,radius=12+Math.random()*46;return{x:Math.cos(angle)*radius,y:Math.sin(angle)*radius*.65,z:initial?8+Math.random()*125:130+Math.random()*18,tint:Math.random(),weight:.65+Math.random()*.35}}
try{
 const gl=canvas.getContext('webgl2',{alpha:true,antialias:false,powerPreference:'low-power'});
 if(gl){
  renderer=new THREE.WebGLRenderer({canvas,context:gl,alpha:true,antialias:false,powerPreference:'low-power'});
  renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(54,1,.1,180);camera.lookAt(0,0,-1);
  geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('aTint',new THREE.BufferAttribute(tints,3));geometry.setAttribute('aAlpha',new THREE.BufferAttribute(alphas,1).setUsage(THREE.DynamicDrawUsage));
  material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,uniforms:{uResolution:{value:new THREE.Vector2(1,1)}},vertexShader:`attribute vec3 aTint;attribute float aAlpha;varying vec3 vTint;varying float vAlpha;void main(){vTint=aTint;vAlpha=aAlpha;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`precision mediump float;uniform vec2 uResolution;varying vec3 vTint;varying float vAlpha;void main(){vec2 uv=gl_FragCoord.xy/uResolution;vec2 d=(uv-vec2(.5,.48))/vec2(.25,.34);float keep=smoothstep(.75,1.45,length(d));float edge=1.0-smoothstep(.88,1.03,abs(uv.x-.5)*2.0);gl_FragColor=vec4(vTint,vAlpha*keep*edge);}`});
  const lines=new THREE.LineSegments(geometry,material);lines.frustumCulled=false;scene.add(lines);
 }
}catch(error){console.info('流光背景使用兼容模式。')}
if(!renderer){const fresh=canvas.cloneNode();canvas.replaceWith(fresh);context=fresh.getContext('2d');window.speedFieldCanvas=fresh;}
const surface=renderer?canvas:window.speedFieldCanvas;
function resize(){width=innerWidth;height=innerHeight;if(renderer){renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();material.uniforms.uResolution.value.set(renderer.domElement.width,renderer.domElement.height)}else{surface.width=width;surface.height=height}}
resize();window.addEventListener('resize',resize);
function canRun(){return target.running&&target.effects&&target.background&&!reduced.matches&&!document.hidden}
function tick(now){
 raf=0;if(!canRun())return;raf=requestAnimationFrame(tick);if(now-paintAt<32)return;
 const dt=Math.min(.06,(now-(previous||now-33))/1000);previous=now;paintAt=now;
 const ratio=Math.min(1,target.speed/135);velocity+=(ratio-velocity)*(1-Math.exp(-dt/.65));effort+=(Math.max(0,target.accel)/4-effort)*(1-Math.exp(-dt/.3));
 const travel=3+velocity*48+Math.min(1,effort)*12;
 const trail=1.25+velocity*9+Math.min(1,effort)*2.8;
 const brightness=.48+velocity*.32+Math.min(1,effort)*.16;
 if(context)context.clearRect(0,0,width,height);
 for(let i=0;i<N;i++){
  let p=particles[i];p.z-=travel*dt;if(p.z<2){p=particles[i]=spawn()}
  const z1=p.z,z2=p.z+trail*p.weight;
  const depthFade=Math.min(1,(145-p.z)/25)*Math.min(1,p.z/13);
  const alpha=brightness*depthFade*p.weight;
  const tint=p.tint>.86?[.48,.85,1]:p.tint>.5?[.72,.68,1]:[.82,.91,1];
  if(renderer){
   positions.set([p.x,p.y,-z1,p.x,p.y,-z2],i*6);tints.set([...tint,...tint],i*6);alphas[i*2]=alpha;alphas[i*2+1]=alpha*.08;
  }else if(context){
   const focal=width*.66,x1=width*.5+p.x/z1*focal,y1=height*.5-p.y/z1*focal,x2=width*.5+p.x/z2*focal,y2=height*.5-p.y/z2*focal;
   const distance=Math.hypot((x1/width-.5)/.25,(y1/height-.52)/.34);const keep=Math.max(0,Math.min(1,(distance-.75)/.7));if(!keep)continue;
   const grad=context.createLinearGradient(x1,y1,x2,y2);const c=tint.map(v=>Math.round(v*255)).join(',');grad.addColorStop(0,`rgba(${c},${alpha*keep})`);grad.addColorStop(1,`rgba(${c},0)`);context.strokeStyle=grad;context.lineWidth=1.35;context.beginPath();context.moveTo(x1,y1);context.lineTo(x2,y2);context.stroke();
  }
 }
 if(renderer){geometry.attributes.position.needsUpdate=true;geometry.attributes.aTint.needsUpdate=true;geometry.attributes.aAlpha.needsUpdate=true;renderer.render(scene,camera)}
 surface.dataset.speed=String(Math.round(target.speed));surface.dataset.renderer=renderer?'three-webgl':'canvas-fallback';
}
function sync(){surface.style.opacity=canRun()?'1':'0';if(canRun()&&!raf){previous=0;raf=requestAnimationFrame(tick)}else if(!canRun()){cancelAnimationFrame(raf);raf=0;previous=0;velocity=0;effort=0}}
window.addEventListener('dashboard-telemetry',e=>{target=e.detail;sync()});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
surface.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;surface.style.opacity='0'});
surface.addEventListener('webglcontextrestored',()=>{resize();sync()});
