/* Lion's Roar ringside fight.
   The 3D fight the Find Us map zooms into. The map (index.html) loads this file on demand, together with
   three.js r147, GLTFLoader and SkeletonUtils, and drives the camera: this file only draws what the map's
   camera sees once it is close to the arena, and fades in over the map as the camera arrives.
   Fighters: a rigged, textured fighter model (both corners dressed from it) with motion-captured Mixamo kicks, knees, teep, clinch
   and knockouts carried onto its skeleton; the referee is a separate MakeHuman body. */
(function(){
window.LRRing={mount:function(box,o){
var K=o.K||3.2,AX=o.AX,AY=o.AY,L=o.L||function(en){return en;},calm=false;
var ES={'JAB':'JAB','CROSS':'RECTO','HOOK':'GANCHO','ELBOW':'CODO','TEEP':'TEEP','LEG KICK':'PATADA BAJA','BODY KICK':'PATADA AL CUERPO','SWITCH KICK':'PATADA CAMBIADA',
  'KNEE':'RODILLA','HEAD KICK':'PATADA ALTA','CLINCH':'CLINCH','BLOCKED':'BLOQUEADO','CHECKED':'CHEQUEADO','SLIPPED':'ESQUIVADO','FIGHT!':'¡PELEA!','K.O.':'K.O.'};
function tr(t){return L(t,ES[t]||t);}
var renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});if(!renderer.getContext())throw 0;}catch(e){return null;}
THREE.ColorManagement.legacyMode=false;
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;

// ---------- the layer over the map: canvas, scoreboard, call-outs
if(!document.getElementById('rs-style')){var st=document.createElement('style');st.id='rs-style';st.textContent=
 '.rs{position:absolute;inset:0;z-index:0;pointer-events:none;opacity:0}'+
 '.rs canvas{position:absolute;inset:0;width:100%;height:100%;display:block}'+
 '.map.street .rs{display:none}'+
 '.rs-hud{position:absolute;left:12px;right:12px;top:62px;display:grid;grid-template-columns:1fr auto 1fr;align-items:start;gap:10px;font-family:var(--cond,"Barlow Condensed","Arial Narrow",sans-serif);opacity:0;transition:opacity .3s}'+
 '.rs-hud.on{opacity:1}'+
 '.rs-side b{display:block;font-weight:700;font-size:13px;letter-spacing:.14em;margin-top:4px;text-shadow:0 1px 4px #000}'+
 '.rs-a b{color:var(--yellow,#FFCC00)}.rs-b{text-align:right}.rs-b b{color:#ff9a8a}'+
 '.rs-bar{height:6px;background:rgba(20,15,12,.8);border:1px solid #4a3c2c;transform:skewX(-18deg);overflow:hidden}.rs-b .rs-bar{transform:skewX(18deg)}'+
 '.rs-bar i{display:block;height:100%;width:100%;transition:width .35s}.rs-a .rs-bar i{background:var(--yellow,#FFCC00)}.rs-b .rs-bar i{background:#d8302c;margin-left:auto}'+
 '.rs-side em{display:block;font-style:normal;font-weight:700;font-size:13px;letter-spacing:.12em;margin-top:3px;min-height:1.2em;color:var(--cream,#F3EBDD);opacity:0;transition:opacity .15s;text-shadow:0 1px 4px #000}'+
 '.rs-side em.on{opacity:1}.rs-side em.def{color:#a8c6ff}'+
 '.rs-clock{text-align:center;min-width:44px;color:var(--cream,#F3EBDD)}'+
 '.rs-clock b{display:block;font-family:var(--head,Anton,Impact,sans-serif);font-weight:400;font-size:18px;line-height:1;border:1.5px solid var(--yellow,#FFCC00);padding:4px 7px 3px;background:rgba(8,6,5,.72);font-variant-numeric:tabular-nums}'+
 '.rs-clock small{display:block;font-weight:700;font-size:10px;letter-spacing:.16em;margin-top:3px;text-shadow:0 1px 4px #000}'+
 '.rs-call{position:absolute;left:0;right:0;top:42%;text-align:center;font:400 clamp(36px,9vw,84px)/1 var(--head,Anton,Impact,sans-serif);letter-spacing:.02em;color:var(--cream,#F3EBDD);text-shadow:0 3px 0 #000,0 0 26px rgba(255,160,40,.4);opacity:0;transform:scale(1.35);transition:opacity .25s,transform .35s}'+
 '.rs-call.on{opacity:1;transform:scale(1)}.rs-call.ko{color:var(--yellow,#FFCC00)}'+
 '.rs-fade{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .45s}'+
 '@media (prefers-reduced-motion:reduce){.rs-call,.rs-side em,.rs-bar i,.rs-hud{transition:none}}';document.head.appendChild(st);}
var wrap=document.createElement('div');wrap.className='rs';wrap.setAttribute('aria-hidden','true');
wrap.innerHTML='<div class="rs-hud"><div class="rs-side rs-a"><div class="rs-bar"><i></i></div><b class="rs-na"></b><em></em></div><div class="rs-clock"><b>60</b><small></small></div>'+
  '<div class="rs-side rs-b"><div class="rs-bar"><i></i></div><b class="rs-nb"></b><em></em></div></div><div class="rs-call"></div><div class="rs-fade"></div>';
wrap.insertBefore(renderer.domElement,wrap.firstChild);
var anchor=o.canvas&&o.canvas.nextSibling;box.insertBefore(wrap,anchor||null);
var q=function(s){return wrap.querySelector(s);},els={hud:q('.rs-hud'),hpA:q('.rs-a i'),hpB:q('.rs-b i'),mvA:q('.rs-a em'),mvB:q('.rs-b em'),na:q('.rs-na'),nb:q('.rs-nb'),clk:q('.rs-clock b'),round:q('.rs-clock small'),call:q('.rs-call'),fade:q('.rs-fade')};

var scene=new THREE.Scene();scene.background=new THREE.Color('#0a0604');scene.fog=new THREE.Fog('#140b06',14,36);
var camera=new THREE.PerspectiveCamera(34,1,.1,140);

// ---------- textures drawn on canvases
function tex(w,h,fn){var c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);var t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
var F900="400 {s}px Anton,Impact,sans-serif";function f9(s){return F900.replace('{s}',s);}
function f7(s){return "700 "+s+"px 'Barlow Condensed','Arial Narrow',sans-serif";}
// the gym's crowned gold lion (the site's img/lion-still.webp, 400x400, art spans x 45-358, y 0-385); set before the textures are drawn
var LION=null,LION_TONE=.4,LION_GOLD=.5;
// paint it centred on (cx,cy), h tall; sx squeezes it across for faces whose texture is stretched; tone darkens it like ink on canvas.
// The arena's warm lights push its gold toward orange, so the art is first pulled a little toward yellow gold (LION_GOLD).
function lionArt(g,cx,cy,h,sx,tone){var s=h/385,W=Math.max(1,Math.round(400*s*sx)),H=Math.max(1,Math.round(400*s)),c=document.createElement('canvas');c.width=W;c.height=H;
  var x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(LION,0,0,W,H);
  if(LION_GOLD)try{var d=x.getImageData(0,0,W,H),p=d.data,i,r;for(i=0;i<p.length;i+=4){r=p[i];p[i]=r*(1-.2*LION_GOLD);p[i+1]+=(r-p[i+1])*LION_GOLD;}x.putImageData(d,0,0);}catch(e){}
  if(tone){x.globalCompositeOperation='source-atop';x.fillStyle='rgba(14,16,24,'+tone+')';x.fillRect(0,0,W,H);}
  g.drawImage(c,cx-201.5*s*sx,cy-192.5*s);}
// a roaring lion head in gold: a flame mane, a heavy brow, and an open mouth with fangs
function lionHead(g,cx,cy,r,gold,dark){g.save();g.translate(cx,cy);g.lineJoin='round';
  var n=28,i,a;g.fillStyle=gold;
  for(i=0;i<n;i++){a=i/n*Math.PI*2-Math.PI/2;var sw=.22,len=.9+(i%3?.04:.12),c0=Math.cos(a-sw),s0=Math.sin(a-sw),c1=Math.cos(a+sw),s1=Math.sin(a+sw),ca=Math.cos(a+.18),sa=Math.sin(a+.18);
    g.beginPath();g.moveTo(c0*r*.55,s0*r*.55);g.quadraticCurveTo(Math.cos(a-.1)*r*.95,Math.sin(a-.1)*r*.95,ca*r*len,sa*r*len);g.quadraticCurveTo(Math.cos(a+.3)*r*.8,Math.sin(a+.3)*r*.8,c1*r*.55,s1*r*.55);g.closePath();g.fill();}
  g.beginPath();g.arc(0,0,r*.74,0,6.283);g.fill();
  g.strokeStyle=dark;g.lineWidth=r*.035;for(i=0;i<n;i++){a=i/n*Math.PI*2-Math.PI/2+.12;g.beginPath();g.moveTo(Math.cos(a)*r*.6,Math.sin(a)*r*.6);g.quadraticCurveTo(Math.cos(a+.12)*r*.78,Math.sin(a+.12)*r*.78,Math.cos(a+.2)*r*.9,Math.sin(a+.2)*r*.9);g.stroke();}
  // face
  g.fillStyle=dark;g.beginPath();g.moveTo(-r*.44,-r*.3);g.quadraticCurveTo(0,-r*.56,r*.44,-r*.3);g.quadraticCurveTo(r*.5,r*.18,r*.2,r*.56);g.quadraticCurveTo(0,r*.66,-r*.2,r*.56);g.quadraticCurveTo(-r*.5,r*.18,-r*.44,-r*.3);g.fill();
  g.fillStyle=gold;g.beginPath();g.moveTo(-r*.38,-r*.27);g.quadraticCurveTo(0,-r*.48,r*.38,-r*.27);g.quadraticCurveTo(r*.43,r*.15,r*.17,r*.5);g.quadraticCurveTo(0,r*.58,-r*.17,r*.5);g.quadraticCurveTo(-r*.43,r*.15,-r*.38,-r*.27);g.fill();
  g.fillStyle=dark;
  [-1,1].forEach(function(s){g.beginPath();g.moveTo(s*r*.3,-r*.12);g.lineTo(s*r*.07,-r*.04);g.lineTo(s*r*.12,r*.02);g.lineTo(s*r*.28,-r*.02);g.closePath();g.fill(); // angry eyes
    g.beginPath();g.moveTo(s*r*.36,-r*.22);g.lineTo(s*r*.05,-r*.1);g.lineTo(s*r*.06,-r*.16);g.closePath();g.fill();}); // brow
  g.beginPath();g.moveTo(-r*.11,r*.1);g.lineTo(r*.11,r*.1);g.lineTo(r*.05,r*.2);g.lineTo(-r*.05,r*.2);g.closePath();g.fill(); // nose
  g.beginPath();g.moveTo(0,r*.2);g.lineTo(0,r*.26);g.moveTo(-r*.05,r*.1);g.lineTo(-r*.02,-r*.05);g.moveTo(r*.05,r*.1);g.lineTo(r*.02,-r*.05);g.lineWidth=r*.03;g.stroke();
  g.beginPath();g.ellipse(0,r*.37,r*.17,r*.12,0,0,6.283);g.fill(); // open mouth
  g.fillStyle=gold;[-1,1].forEach(function(s){g.beginPath();g.moveTo(s*r*.12,r*.28);g.lineTo(s*r*.07,r*.28);g.lineTo(s*r*.095,r*.37);g.closePath();g.fill();g.beginPath();g.moveTo(s*r*.11,r*.47);g.lineTo(s*r*.06,r*.47);g.lineTo(s*r*.085,r*.4);g.closePath();g.fill();});
  g.restore();}
function wear(g,w,h,n,a){for(var i=0;i<n;i++){g.fillStyle='rgba(255,240,220,'+(Math.random()*a)+')';g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*26,1+Math.random()*2);}
  for(i=0;i<n/3;i++){g.fillStyle='rgba(0,0,0,'+(Math.random()*a*2)+')';g.beginPath();g.arc(Math.random()*w,Math.random()*h,3+Math.random()*28,0,6.283);g.fill();}}
function canvasTop(){return tex(1024,1024,function(g,w,h){var gr=g.createRadialGradient(512,512,60,512,512,720);gr.addColorStop(0,'#1c2230');gr.addColorStop(1,'#10141d');g.fillStyle=gr;g.fillRect(0,0,w,h);
  wear(g,w,h,1400,.03);
  g.strokeStyle='#8f6a22';g.lineWidth=16;g.beginPath();g.arc(512,512,296,0,6.283);g.stroke();g.lineWidth=5;g.beginPath();g.arc(512,512,262,0,6.283);g.stroke();
  if(LION){var gl=g.createRadialGradient(512,500,40,512,500,250);gl.addColorStop(0,'rgba(255,184,64,.16)');gl.addColorStop(1,'rgba(255,184,64,0)');g.fillStyle=gl;g.beginPath();g.arc(512,512,258,0,6.283);g.fill();
    lionArt(g,512,506,440,1,LION_TONE);}
  else{g.globalAlpha=.85;lionHead(g,512,504,205,'#8f6a22','#171c28');g.globalAlpha=1;}
  wear(g,w,h,500,.035);});}
function apron(){return tex(1024,160,function(g,w,h){g.fillStyle='#121726';g.fillRect(0,0,w,h);wear(g,w,h,300,.03);g.fillStyle='#c9962a';g.fillRect(0,0,w,5);
  g.textAlign='center';g.font=f9(88);g.fillStyle='#d9d2c4';g.fillText('LIONS ROAR',w/2,96);
  g.fillStyle='#c9962a';g.fillRect(w/2-230,118,120,3);g.fillRect(w/2+110,118,120,3);g.font=f7(30);g.fillText('M U A Y   T H A I',w/2,128);
  // the apron texture is stretched about 2x across its face, so the crowned lion is drawn squeezed to come out true
  if(LION){lionArt(g,120,82,128,.51,.12);lionArt(g,w-120,82,128,.51,.12);}
  else{lionHead(g,120,80,58,'#c9962a','#121726');lionHead(g,w-120,80,58,'#c9962a','#121726');}});}
function banner(maroon){return tex(256,640,function(g,w,h){g.fillStyle=maroon?'#2e1012':'#141a2c';g.fillRect(0,0,w,h);wear(g,w,h,160,.04);g.strokeStyle='#b8872a';g.lineWidth=6;g.strokeRect(14,14,w-28,h-60);
  g.fillStyle='#c9962a';g.font=f7(30);g.textAlign='center';g.fillText('LIONS ROAR',w/2,70);lionHead(g,w/2,270,92,'#d4a232',maroon?'#2e1012':'#141a2c');
  g.font=f9(38);g.fillText('MUAY',w/2,440);g.fillText('THAI',w/2,480);
  g.fillStyle=maroon?'#2e1012':'#141a2c';g.clearRect(0,h-46,w,46);g.beginPath();g.moveTo(0,h-46);g.lineTo(w/2,h-6);g.lineTo(w,h-46);g.closePath();g.fill();});}
function pad(col,txt,dark){return tex(128,512,function(g,w,h){g.fillStyle=col;g.fillRect(0,0,w,h);var sh=g.createLinearGradient(0,0,w,0);sh.addColorStop(0,'rgba(0,0,0,.28)');sh.addColorStop(.5,'rgba(255,255,255,.08)');sh.addColorStop(1,'rgba(0,0,0,.28)');g.fillStyle=sh;g.fillRect(0,0,w,h);
  g.save();g.translate(w/2+10,h/2);g.rotate(-Math.PI/2);g.fillStyle=dark;g.font=f9(44);g.textAlign='center';g.fillText(txt,0,0);g.restore();wear(g,w,h,60,.05);});}

// ---------- the arena, sized to the ring on the map: 5 m ring, stands all round, cut away on the camera's side
var CAN=.4375,HALF=2.5,SECT=18,sectors=[],ringSides=[],ringPosts=[];
function std(c,r){return new THREE.MeshStandardMaterial({color:c,roughness:r===undefined?.8:r});}
function sectorOf(x,z){var a=Math.atan2(z,x);if(a<0)a+=Math.PI*2;return Math.min(SECT-1,Math.floor(a/(Math.PI*2)*SECT));}
function build(){
  var i,k,t;for(i=0;i<SECT;i++)sectors.push({g:new THREE.Group(),mid:(i+.5)/SECT*Math.PI*2});sectors.forEach(function(s){scene.add(s.g);});
  var floor=new THREE.Mesh(new THREE.CircleGeometry(40,48),std('#0f0a07',1));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  var ap=apron(),apM=new THREE.MeshStandardMaterial({map:ap,roughness:.9}),top=new THREE.MeshStandardMaterial({map:canvasTop(),roughness:.95});
  var plat=new THREE.Mesh(new THREE.BoxGeometry(HALF*2+.5,CAN,HALF*2+.5),[apM,apM,top,std('#0c0c10'),apM,apM]);plat.position.y=CAN/2;plat.receiveShadow=true;scene.add(plat);
  var corners=[[1,-1,'#b3141c','LIONS ROAR','#e0b44a'],[1,1,'#1d3ea8','LIONS ROAR','#e0b44a'],[-1,1,'#e6e1d6','LIONS ROAR','#1b1b22'],[-1,-1,'#e6e1d6','LIONS ROAR','#1b1b22']];
  corners.forEach(function(c){var pt=pad(c[2],c[3],c[4]),pm=new THREE.MeshStandardMaterial({map:pt,roughness:.55}),cap=std('#16141a',.5);
    var post=new THREE.Mesh(new THREE.BoxGeometry(.34,1.55,.34),[pm,pm,cap,cap,pm,pm]);post.position.set(c[0]*HALF,CAN+.775,c[1]*HALF);post.castShadow=true;scene.add(post);ringPosts.push({o:post,n:new THREE.Vector2(c[0],c[1]).normalize()});});
  var ropeC=['#b3141c','#e9e4d8','#1b2a5a','#b3141c'],ropeY=[1.42,1.07,.72,.37],ropeM=ropeC.map(function(c){return std(c,.45);}),tieM=std('#10131c',.7);
  for(i=0;i<4;i++){var a=corners[i],b=corners[(i+1)%4],side=new THREE.Group();scene.add(side);ringSides.push({o:side,n:new THREE.Vector2(a[0]+b[0],a[1]+b[1]).normalize()});
    for(var r=0;r<4;r++){var A=new THREE.Vector3(a[0]*HALF,CAN+ropeY[r],a[1]*HALF),B=new THREE.Vector3(b[0]*HALF,CAN+ropeY[r],b[1]*HALF),len=A.distanceTo(B);
      var rope=new THREE.Mesh(new THREE.CylinderGeometry(.032,.032,len,8),ropeM[r]);rope.position.copy(A).add(B).multiplyScalar(.5);rope.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize());rope.castShadow=true;side.add(rope);}
    [.33,.67].forEach(function(u){var tie=new THREE.Mesh(new THREE.BoxGeometry(.05,1.08,.05),tieM);tie.position.set((a[0]+(b[0]-a[0])*u)*HALF,CAN+.9,(a[1]+(b[1]-a[1])*u)*HALF);side.add(tie);});}
  // stands: one stepped slice per sector, so the slices between the camera and the ring can be hidden
  var T=13,R0=6.2,prof=[new THREE.Vector2(R0,0)];for(t=0;t<T;t++){prof.push(new THREE.Vector2(R0+t*.8,(t+1)*.5));prof.push(new THREE.Vector2(R0+(t+1)*.8,(t+1)*.5));}
  var tierM=new THREE.MeshStandardMaterial({color:'#140e0a',roughness:1,side:THREE.DoubleSide});
  sectors.forEach(function(s,i){var a0=i/SECT*Math.PI*2,a1=(i+1)/SECT*Math.PI*2;s.g.add(new THREE.Mesh(new THREE.LatheGeometry(prof,4,Math.PI/2-a1,a1-a0),tierM));});
  var seats=[],arms=[],m=new THREE.Matrix4(),col=new THREE.Color(),qq=new THREE.Quaternion(),e=new THREE.Euler();
  for(t=0;t<T;t++){var R=R0+.35+t*.8,n=Math.floor(2*Math.PI*R/.46);for(k=0;k<n;k++){if(Math.random()<.08)continue;var an=k/n*Math.PI*2+Math.random()*.03;seats.push([Math.cos(an)*R,t*.5+.5,Math.sin(an)*R]);}}
  var bodyG=new THREE.CylinderGeometry(.16,.21,.6,7),headG=new THREE.SphereGeometry(.11,10,8),armG=new THREE.CylinderGeometry(.04,.045,.55,5),bodyM=new THREE.MeshLambertMaterial(),headM=new THREE.MeshLambertMaterial(),armM=new THREE.MeshLambertMaterial({color:'#2a1b12'});
  var shirts=['#241a14','#2e2119','#1a1719','#3b2518','#1d1c22','#4a2a1a','#141312','#5a2018','#1c2536','#3a3530'],hair=['#1a110b','#241710','#2e1d12','#120c08','#3a2819'];
  var per=sectors.map(function(){return {s:[],a:[]};});
  seats.forEach(function(s){var p=per[sectorOf(s[0],s[2])];p.s.push(s);if(Math.random()<.11){var ang=Math.atan2(s[2],s[0]);e.set((Math.random()-.5)*.5,-ang,(Math.random()<.5?1:-1)*(.15+Math.random()*.35));qq.setFromEuler(e);
    p.a.push(new THREE.Matrix4().compose(new THREE.Vector3(s[0]*.98,s[1]+.8,s[2]*.98),qq,new THREE.Vector3(1,1,1)));}});
  per.forEach(function(p,si){if(!p.s.length)return;var bodies=new THREE.InstancedMesh(bodyG,bodyM,p.s.length),heads=new THREE.InstancedMesh(headG,headM,p.s.length);
    p.s.forEach(function(s,i){var h=.92+Math.random()*.16,lean=(Math.random()-.5)*.2;m.makeRotationZ(lean).setPosition(s[0],s[1]+.3*h,s[2]);m.scale(new THREE.Vector3(1,h,1));bodies.setMatrixAt(i,m);
      col.set(shirts[(Math.random()*shirts.length)|0]).multiplyScalar(.55+Math.random()*.5);bodies.setColorAt(i,col);
      m.makeTranslation(s[0]+Math.sin(-lean)*.05,s[1]+.6*h+.12,s[2]);heads.setMatrixAt(i,m);col.set(hair[(Math.random()*hair.length)|0]).multiplyScalar(.7+Math.random()*.6);heads.setColorAt(i,col);});
    sectors[si].g.add(bodies);sectors[si].g.add(heads);
    if(p.a.length){var am=new THREE.InstancedMesh(armG,armM,p.a.length);p.a.forEach(function(mm,i){am.setMatrixAt(i,mm);});sectors[si].g.add(am);}});
  var fl=new THREE.BufferGeometry(),NF=60,fp=new Float32Array(NF*3);fl.setAttribute('position',new THREE.BufferAttribute(fp,3));
  var flashes=new THREE.Points(fl,new THREE.PointsMaterial({color:'#fff1d6',size:.1,sizeAttenuation:true,transparent:true,opacity:.95,fog:false}));scene.add(flashes);
  function reflash(){for(var i=0;i<NF;i++){var s=seats[(Math.random()*seats.length)|0];if(!sectors[sectorOf(s[0],s[2])].g.visible){fp[i*3+1]=-9;continue;}fp[i*3]=s[0];fp[i*3+1]=s[1]+1;fp[i*3+2]=s[2];}fl.attributes.position.needsUpdate=true;}reflash();
  var glowT=tex(64,64,function(g){var gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,230,180,1)');gr.addColorStop(.3,'rgba(255,170,80,.55)');gr.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});
  for(i=0;i<46;i++){var sa=Math.random()*Math.PI*2,sr=8+Math.random()*9.5,sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.35+Math.random()*.4}));
    sp.position.set(Math.cos(sa)*sr,(sr-R0)/.8*.5+.9+Math.random()*.4,Math.sin(sa)*sr);sp.scale.setScalar(.5+Math.random()*.9);sectors[sectorOf(sp.position.x,sp.position.z)].g.add(sp);}
  var bn0=banner(false),bn1=banner(true);for(i=0;i<14;i++){var ang=i/14*Math.PI*2+.2,rad=13.5+(i%3)*1.2,hy=8.6+(i%2)*.9,bn=new THREE.Mesh(new THREE.PlaneGeometry(1.6,4),new THREE.MeshStandardMaterial({map:i%4===1?bn1:bn0,roughness:.9,side:THREE.DoubleSide}));
    bn.position.set(Math.cos(ang)*rad,hy,Math.sin(ang)*rad);bn.lookAt(0,hy,0);sectors[sectorOf(bn.position.x,bn.position.z)].g.add(bn);}
  var truss=std('#141217',.5),TY=7.6,TS=4;
  [[0,-TS,TS*2+.3,.2,.2],[0,TS,TS*2+.3,.2,.2],[-TS,0,.2,.2,TS*2],[TS,0,.2,.2,TS*2],[0,0,TS*2,.12,.12],[0,0,.12,.12,TS*2]].forEach(function(b){var bar=new THREE.Mesh(new THREE.BoxGeometry(b[2],b[3],b[4]),truss);bar.position.set(b[0],TY,b[1]);scene.add(bar);});
  var lampM=new THREE.MeshBasicMaterial({color:'#ffe7b8'}),lampB=std('#0d0c10',.4),beamM=new THREE.MeshBasicMaterial({color:'#ffb45e',transparent:true,opacity:.04,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  for(i=0;i<16;i++){var sd=i>>2,u=((i&3)+.5)/4*2-1,lx=sd===0?u*TS:sd===1?TS:sd===2?-u*TS:-TS,lz=sd===0?-TS:sd===1?u*TS:sd===2?TS:-u*TS;
    var body=new THREE.Mesh(new THREE.CylinderGeometry(.2,.24,.36,12),lampB);body.position.set(lx,TY-.3,lz);scene.add(body);
    var lens=new THREE.Mesh(new THREE.CircleGeometry(.17,16),lampM);lens.position.set(lx,TY-.49,lz);lens.rotation.x=Math.PI/2;scene.add(lens);
    var gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.9,fog:false}));gl.position.set(lx,TY-.55,lz);gl.scale.setScalar(1.3);scene.add(gl);
    if(i%2===0){var beam=new THREE.Mesh(new THREE.CylinderGeometry(.18,1.5,TY-CAN-.5,20,1,true),beamM);beam.position.set(lx*.62,(TY-.5+CAN)/2,lz*.62);beam.lookAt(lx*.25,-50,lz*.25);beam.rotateX(-Math.PI/2);scene.add(beam);}}
  scene.add(new THREE.HemisphereLight('#ffc98f','#120903',.24));
  var key=new THREE.SpotLight('#fff0da',1.6,0,.5,.55,1);key.position.set(.4,10,.6);key.target.position.set(0,CAN,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0004;key.shadow.radius=4;scene.add(key);scene.add(key.target);
  [[-6,8,-5,'#ffa458',.8],[6,7.5,5,'#ffb46a',.75],[5,7,-6,'#ff8f45',.6],[-5,7,6,'#ffb060',.55]].forEach(function(l){var s=new THREE.SpotLight(l[3],l[4],0,.32,.9,1);s.position.set(l[0],l[1],l[2]);s.target.position.set(0,CAN+1,0);scene.add(s);scene.add(s.target);});
  [[0,4.5,0,1.1,22],[9,5,0,.7,12],[-9,5,0,.7,12],[0,5,9,.7,12],[0,5,-9,.7,12]].forEach(function(p){var pl=new THREE.PointLight('#ff9a4a',p[3],p[4],1.4);pl.position.set(p[0],p[1],p[2]);scene.add(pl);});
  return reflash;}
// hide the slices of stands between the camera and the ring, as the map does, so nothing blocks the fight
function cutStands(){var cx=camera.position.x,cz=camera.position.z,hd=Math.hypot(cx,cz),ca=Math.atan2(cz,cx);
  sectors.forEach(function(s){var d=Math.abs(Math.atan2(Math.sin(s.mid-ca),Math.cos(s.mid-ca)));s.g.visible=!(hd>4.2&&d<1.3);});
  // low ringside shots lose the ropes and posts on the camera's side, as on the map
  var low=camera.position.y<3.2&&hd>HALF+.2,dx=cx/(hd||1),dz=cz/(hd||1);ringSides.concat(ringPosts).forEach(function(e){e.o.visible=!(low&&e.n.x*dx+e.n.y*dz>.28);});}

// ---------- fighters: one rigged body dressed per corner (the purchased textured fighter: see texMaterial below; older untextured rigs are painted per vertex)
var LOOKS={a:{skin:'#c68656',shorts:'#131315',trim:'#e0b030',gear:'#c01820',glove:'#c8171f',head:'#1b120c',emblem:'gold'},
           b:{skin:'#8d5436',shorts:'#131317',trim:'#ecebe6',gear:'#1f47bd',glove:'#1f47bd',head:'#0d0907',emblem:'white'},
           r:{skin:'#b78057',shirt:'#141416',pants:'#121215',head:'#2a2a2a',gloves:'#0c0c0e'}};
var GET=['getX','getY','getZ','getW'];
function domBone(si,sw,i){var best=0,bw=-1;for(var k=0;k<4;k++){var w=sw[GET[k]](i);if(w>bw){bw=w;best=si[GET[k]](i);}}return best;}
function bindHead(sk,i){return new THREE.Vector3().setFromMatrixPosition(sk.boneInverses[i].clone().invert());}
// the MakeHuman body: painted from masks baked into the model (hair, brows, lips, nipples, eyes, crease shading, the body under the shorts)
function isMH(root){var y=false;root.traverse(function(o){if(o.isSkinnedMesh&&o.geometry.attributes._zone)y=true;});return y;}
function dressMH(o,look){var g=o.geometry=o.geometry.clone(),pos=g.attributes.position,si=g.attributes.skinIndex,sw=g.attributes.skinWeight,sk=o.skeleton,bones=sk.bones,n=pos.count,
    cols=new Float32Array(n*3),c=new THREE.Color(),t=new THREE.Color(),mk=g.attributes._mask,zn=g.attributes._zone,ref=!!look.shirt;
  if(o.morphTargetInfluences&&o.morphTargetInfluences.length)o.morphTargetInfluences[0]=ref?1:0; // fighters: the sculpted build; the referee keeps his own
  if(!zn){ // the shorts: satin, with a contrasting waistband and hem (the referee wears trousers instead)
    if(ref){o.visible=false;return;}
    for(var i=0;i<n;i++){c.set(look.shorts);t.set(look.trim);c.lerp(t,Math.max(mk.getX(i),mk.getY(i)));cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;}
    g.setAttribute('color',new THREE.BufferAttribute(cols,3));o.material=shortsMaterial(look.shorts,look.trim);return;}
  var idx={};bones.forEach(function(b,k){idx[b.name.replace('DEF-','').replace(/\./g,'')]=k;});
  var ua={},arm={};['L','R'].forEach(function(s){var a=bindHead(sk,idx['upper_arm'+s]),e=bindHead(sk,idx['forearm'+s]);ua[s]=a;arm[s]=e.clone().sub(a);});
  var neckY=bindHead(sk,idx.neck).y,skin=new THREE.Color(look.skin),dark=skin.clone().multiplyScalar(.62),lip=skin.clone().lerp(new THREE.Color('#7a2e2a'),.35).multiplyScalar(.82),v=new THREE.Vector3();
  var mats=new Float32Array(n); // fighters: 0 skin, 1 knit shin guards, 2 hair, 3 under the gloves, 4 under the shorts, 5 eyes
  for(i=0;i<n;i++){var nm=bones[domBone(si,sw,i)].name,y=pos.getY(i),eye=zn.getX(i),mt=0;
    c.copy(skin);
    if(ref){ // referee: black short-sleeved shirt, black trousers and shoes, black gloves
      v.fromBufferAttribute(pos,i);var sd=nm.slice(-1),up=/upper_arm/.test(nm)?v.clone().sub(ua[sd]).dot(arm[sd])/arm[sd].lengthSq():-1;
      if(/hand/.test(nm))c.set(look.gloves);
      else if(/foot|toe/.test(nm))c.set('#0b0b0d');
      else if(/hips|thigh|shin/.test(nm))c.set(look.pants);
      else if(/spine|shoulder/.test(nm)||(/neck/.test(nm)&&y<neckY+.015)||(/upper_arm/.test(nm)&&up<.55))c.set(look.shirt);}
    else{
      if(/hand/.test(nm)){c.set(look.glove);mt=3;}
      else if(/shin/.test(nm)&&y>.1&&y<.5){c.set(look.gear);mt=1;}
      else if(/foot|toe/.test(nm)&&y>.05){c.set(look.gear);mt=1;}
      var us=zn.getY(i);if(us>0){t.set(look.trim);c.lerp(t,Math.min(1,us*2));if(us>.5){t.set(look.shorts);c.lerp(t,(us-.5)*2);}if(us>.3)mt=4;}
      if(mk.getX(i)>.5)mt=2;if(eye>0)mt=5;}
    mats[i]=mt;
    t.set(look.head);c.lerp(t,mk.getX(i)*.96);            // short hair
    c.lerp(t,mk.getY(i)*.8);                               // brows
    var cloth=ref&&c.getHex()!==skin.getHex()&&mk.getX(i)<.01;
    c.lerp(lip,mk.getZ(i)*.7);if(!cloth)c.lerp(dark,mk.getW(i)*.55); // lips, nipples (not through the referee's shirt)
    if(eye>0)c.set(eye>.75?'#1d130d':'#d8d0c3');
    c.multiplyScalar(ref?1-(cloth?.12:.42)*zn.getW(i):1-.52*zn.getZ(i)); // creases and the hollows between muscle groups (referee: as before)
    cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;}
  g.setAttribute('color',new THREE.BufferAttribute(cols,3));
  if(ref){o.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:0});return;}
  g.setAttribute('lrMat',new THREE.BufferAttribute(mats,1));o.material=skinMaterial();}
// ---------- premium fighter materials (fighters only; the arena and referee keep their look)
// shared GLSL: value noise, a bump that works from any height function (no textures, no UVs), and a fade that drops detail finer than a pixel
var LR_GLSL=[
 'varying vec3 vB;varying vec3 vBN;',
 'float lrH(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}',
 'float lrN(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);',
 ' return mix(mix(mix(lrH(i),lrH(i+vec3(1,0,0)),f.x),mix(lrH(i+vec3(0,1,0)),lrH(i+vec3(1,1,0)),f.x),f.y),',
 '  mix(mix(lrH(i+vec3(0,0,1)),lrH(i+vec3(1,0,1)),f.x),mix(lrH(i+vec3(0,1,1)),lrH(i+vec3(1,1,1)),f.x),f.y),f.z);}',
 'float lrFade(float fq){return 1.0-smoothstep(.25,.8,length(fwidth(vB))*fq);}',
 'vec3 lrBump(vec3 sp,vec3 sn,float h,float fd){vec3 sx=dFdx(sp),sy=dFdy(sp),r1=cross(sy,sn),r2=cross(sn,sx);float det=dot(sx,r1)*fd;',
 ' vec2 d=vec2(dFdx(h),dFdy(h));vec3 g=sign(det)*(d.x*r1+d.y*r2);return normalize(abs(det)*sn-g);}',
 // cool rim on the shoulders, arms and back, a soft fill toward the camera for faces and torsos
 'vec3 lrRimFill(vec3 N,vec3 alb,float rimK,float fillK){vec3 V=normalize(vViewPosition);float nv=clamp(dot(N,V),0.0,1.0);',
 ' float rim=pow(1.0-nv,3.5)*(.4+.6*clamp(N.y+.35,0.0,1.0));float front=smoothstep(-.25,.55,normalize(vBN).z);',
 ' return vec3(.76,.83,1.0)*rim*rimK+alb*vec3(1.0,.9,.8)*pow(nv,1.5)*fillK*front;}'].join('\n');
function lrInject(m,key,vert,frag){var prev=m.onBeforeCompile;
  m.onBeforeCompile=function(sh){sh.vertexShader=vert.attr+'\nvarying vec3 vB;varying vec3 vBN;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvB=position;vBN=normal;'+(vert.body||''));
    var f=sh.fragmentShader.replace('void main() {',LR_GLSL+'\n'+(frag.pars||'')+'\nvoid main() {');
    ['color','roughness','normal','lights','output'].forEach(function(k){if(frag[k]){var tag={color:'#include <color_fragment>',roughness:'#include <roughnessmap_fragment>',normal:'#include <normal_fragment_maps>',lights:'#include <lights_physical_fragment>',output:'#include <output_fragment>'}[k];
      f=k==='output'?f.replace(tag,frag[k]+'\n'+tag):f.replace(tag,tag+'\n'+frag[k]);}});
    sh.fragmentShader=f;if(frag.uniforms)for(var u in frag.uniforms)sh.uniforms[u]=frag.uniforms[u];};
  m.customProgramCacheKey=function(){return key;};return m;}
// skin (with knit shin guards and short hair on the same mesh, told apart by a per-vertex material id): fine pores and soft unevenness,
// slight colour variation, a light sweat sheen in patches, soft subsurface warmth, the rim and the fill
function skinMaterial(){var m=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.56,metalness:0,clearcoat:.2,clearcoatRoughness:.4});
  return lrInject(m,'lr-skin',{attr:'attribute float lrMat;varying float vMat;',body:'vMat=lrMat;'},{
   pars:'varying float vMat;',
   color:'float isSkin=1.0-step(.5,vMat),isKnit=step(.5,vMat)*(1.0-step(1.5,vMat)),isHair=step(1.5,vMat)*(1.0-step(2.5,vMat));'+
         'diffuseColor.rgb*=1.0+(lrN(vB*22.0)-.5)*.1*isSkin+(lrN(vB*230.0)-.5)*.14*isKnit*lrFade(230.0);',
   roughness:'roughnessFactor=isSkin*mix(.5,.64,lrN(vB*38.0))+isKnit*.86+isHair*.72+(1.0-isSkin-isKnit-isHair)*roughnessFactor;',
   normal:'{float h=isSkin*((lrN(vB*260.0)-.5)*.0003*lrFade(260.0)+(lrN(vB*70.0+3.1)-.5)*.0007*lrFade(70.0))'+
          '+isKnit*(sin(vB.y*1500.0+lrN(vB*160.0)*2.5)*.00035*lrFade(240.0)+(lrN(vB*320.0)-.5)*.0004*lrFade(320.0))'+
          '+isHair*(lrN(vB*vec3(900.0,260.0,900.0))-.5)*.0009*lrFade(600.0);normal=lrBump(-vViewPosition,normal,h,faceDirection);}',
   lights:'#ifdef USE_CLEARCOAT\nmaterial.clearcoat*=isSkin*(.3+.7*smoothstep(.42,.72,lrN(vB*8.0+2.0)));\n#endif',
   output:'{float lum=dot(outgoingLight,vec3(.299,.587,.114));vec3 alb=diffuseColor.rgb;'+
          'outgoingLight+=alb*vec3(.5,.16,.07)*.55*isSkin*smoothstep(.0,.2,lum)*(1.0-smoothstep(.2,.8,lum));'+
          'outgoingLight+=lrRimFill(normalize(normal),alb,.3,.3);}'});}
// satin Muay Thai shorts: sheen, folds that deepen toward the hem, a ribbed elastic waistband and stitching in the trim colour
function shortsMaterial(shorts,trim){var sc=new THREE.Color(shorts),m=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.46,metalness:0,side:THREE.DoubleSide,
    sheen:1,sheenRoughness:.38,sheenColor:sc.clone().lerp(new THREE.Color('#fff4e6'),.14)}),tr={value:new THREE.Color(trim)};
  return lrInject(m,'lr-shorts',{attr:'attribute vec4 _mask;varying vec4 vMask;',body:'vMask=_mask;'},{
   pars:'varying vec4 vMask;uniform vec3 uTrim;',uniforms:{uTrim:tr},
   color:'float th=atan(vB.z,vB.x-sign(vB.x)*.1),down=clamp((1.035-vB.y)/.335,0.0,1.0);'+
         'float st=smoothstep(.0,.025,vMask.x)*(1.0-smoothstep(.025,.06,vMask.x))+smoothstep(.0,.03,vMask.y)*(1.0-smoothstep(.03,.08,vMask.y));'+
         'float dash=smoothstep(.35,.45,fract(th*22.0+vB.y*3.0))*(1.0-smoothstep(.85,.95,fract(th*22.0+vB.y*3.0)));diffuseColor.rgb=mix(diffuseColor.rgb,uTrim,st*dash*.55);',
   normal:'{float h=sin(th*6.0+lrN(vB*10.0)*4.0)*.0055*down*down+(lrN(vB*28.0)-.5)*.0012+sin(vB.y*760.0)*.0005*vMask.x*lrFade(250.0)-st*dash*.0004;'+
          'normal=lrBump(-vViewPosition,normal,h,faceDirection);}',
   output:'outgoingLight+=lrRimFill(normalize(normal),diffuseColor.rgb,.22,.12);'});}
// leather gloves: grain, a darker piping seam around the glove and along the thumb, glossy but not plastic
function leatherMaterial(col){var m=new THREE.MeshPhysicalMaterial({color:col,roughness:.44,metalness:0,clearcoat:.55,clearcoatRoughness:.24});
  return lrInject(m,'lr-leather',{attr:'attribute float seam;varying float vSeam;',body:'vSeam=seam;'},{
   pars:'varying float vSeam;',
   color:'float sm=smoothstep(.55,1.0,vSeam);diffuseColor.rgb*=1.0-.38*sm+(lrN(vB*420.0)-.5)*.06*lrFade(420.0);',
   roughness:'roughnessFactor=mix(roughnessFactor,.62,sm);',
   normal:'{float h=(lrN(vB*420.0)-.5)*.00022*lrFade(420.0)+(lrN(vB*90.0)-.5)*.0005-sm*.0009;normal=lrBump(-vViewPosition,normal,h,faceDirection);}',
   output:'outgoingLight+=lrRimFill(normalize(normal),diffuseColor.rgb,.3,.12);'});}
function dress(root,look){root.traverse(function(o){if(!o.isSkinnedMesh)return;o.castShadow=true;o.frustumCulled=false;
  if(o.material&&o.material.map){dressTex(o,look);return;}
  if(o.geometry.attributes._zone||o.geometry.attributes._mask){dressMH(o,look);return;}
  var g=o.geometry=o.geometry.clone(),pos=g.attributes.position,si=g.attributes.skinIndex,sw=g.attributes.skinWeight,bones=o.skeleton.bones,cols=new Float32Array(pos.count*3),c=new THREE.Color();
  for(var i=0;i<pos.count;i++){var best=0,bw=-1;for(var k=0;k<4;k++){var w=sw[GET[k]](i);if(w>bw){bw=w;best=si[GET[k]](i);}}
    var nm=bones[best].name,hgt=pos.getY(i),col;
    if(look.shirt){ // referee: black short-sleeve shirt, black trousers, black gloves
      if(/hand|f_|thumb/.test(nm))col=look.gloves;
      else if(/head|neck/.test(nm))col=/head/.test(nm)&&hgt>1.72?look.head:look.skin;
      else if(/thigh|shin|foot|toe|hips/.test(nm))col=/foot|toe/.test(nm)?'#0b0b0d':look.pants;
      else if(/forearm/.test(nm))col=look.skin;
      else col=look.shirt;}
    else{
      col=look.skin;
      if(/hand|f_|thumb/.test(nm))col=look.glove;
      else if(/hips/.test(nm)||(/thigh/.test(nm)&&hgt>.54))col=(hgt>.94&&hgt<1.01)?look.trim:(hgt<.585&&/thigh/.test(nm))?look.trim:look.shorts;
      else if(/shin/.test(nm)&&hgt>.1&&hgt<.52)col=look.gear;
      else if(/foot/.test(nm)&&hgt>.045)col=look.gear;
      else if(/head/.test(nm)&&hgt>1.72)col=look.head;}
    c.set(col);cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;}
  g.setAttribute('color',new THREE.BufferAttribute(cols,3));
  o.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:look.shirt?.8:.46,metalness:0});});}
// the purchased fighter's Unreal-style bones answer to the same names as the other rigs
var UE_BONES={pelvis:'hips',spine_01:'spine.001',spine_02:'spine.002',spine_03:'spine.003',neck_01:'neck'};
['l','r'].forEach(function(s){var S=s.toUpperCase();UE_BONES['clavicle_'+s]='shoulder.'+S;UE_BONES['upperarm_'+s]='upper_arm.'+S;UE_BONES['lowerarm_'+s]='forearm.'+S;UE_BONES['hand_'+s]='hand.'+S;
  UE_BONES['thigh_'+s]='thigh.'+S;UE_BONES['calf_'+s]='shin.'+S;UE_BONES['foot_'+s]='foot.'+S;UE_BONES['ball_'+s]='toe.'+S;});
function boneMap(root){var m={};root.traverse(function(o){if(!o.isBone)return;var k=o.name.replace('DEF-','');m[k]=o;m[k.replace(/([a-z_])([LR])$/,'$1.$2').replace(/spine(\d+)/,'spine.$1')]=o;if(UE_BONES[o.name])m[UE_BONES[o.name]]=o;});return m;}
function isUE(root){var y=false;root.traverse(function(o){if(o.isBone&&o.name==='pelvis')y=true;});return y;}
// on the MakeHuman body the hand bone rests unrotated, so the glove is laid along the hand itself (wrist to knuckles, found from the mesh)
function handAxis(root,side){var dir=null;root.traverse(function(o){if(dir||!o.isSkinnedMesh||!o.geometry.attributes._zone)return;
  var g=o.geometry,pos=g.attributes.position,si=g.attributes.skinIndex,sw=g.attributes.skinWeight,sk=o.skeleton,k=-1;
  sk.bones.forEach(function(b,i){if(b.name.replace(/\./g,'')==='DEF-hand'+side)k=i;});if(k<0)return;
  var h=bindHead(sk,k),c=new THREE.Vector3(),m=0,v=new THREE.Vector3();
  for(var i=0;i<pos.count;i++)if(domBone(si,sw,i)===k){c.add(v.fromBufferAttribute(pos,i));m++;}
  if(m)dir=c.multiplyScalar(1/m).sub(h);});return dir;}
// a boxing glove in its own frame (y along the fingers, x toward the thumb): a padded fist that narrows into the wrist, a tucked thumb,
// a cuff with a strap; 'seam' marks the piping around the glove's outline and along the thumb
function gloveGeo(){var parts=[],R=.074;
  function add(geo,fn,seamFn){var p=geo.attributes.position,v=new THREE.Vector3(),sm=new Float32Array(p.count);
    for(var i=0;i<p.count;i++){v.fromBufferAttribute(p,i);fn(v);p.setXYZ(i,v.x,v.y,v.z);sm[i]=seamFn?seamFn(v):0;}
    geo.setAttribute('seam',new THREE.BufferAttribute(sm,1));geo.deleteAttribute('uv');geo.computeVertexNormals();parts.push(geo);}
  add(new THREE.SphereGeometry(1,48,32),function(v){var y=v.y;v.y*=1.3;var w=1-.26*THREE.MathUtils.smoothstep(-y,.15,1.0);v.x*=w*1.02;v.z*=w*.97;
      if(v.z>0)v.z*=1.06;v.multiplyScalar(R);},function(v){return 1-THREE.MathUtils.smoothstep(Math.abs(v.z)/R,.0,.06);});
  add(new THREE.CapsuleGeometry(.3,.62,8,20),function(v){v.applyAxisAngle(new THREE.Vector3(0,0,1),-.2);v.x+=.8;v.y+=.02;v.z+=.2;v.multiplyScalar(R);},
      function(v){return 1-THREE.MathUtils.smoothstep(Math.abs(v.x/R-.62),.0,.05);});
  add(new THREE.CylinderGeometry(.74,.8,1.4,40,1,true),function(v){v.y-=1.62;v.multiplyScalar(R);},function(v){var d=Math.abs(v.y/R+.93);return 1-THREE.MathUtils.smoothstep(d,.0,.05);});
  add(new THREE.CylinderGeometry(.83,.83,.5,40,1,true),function(v){v.y-=1.7;v.multiplyScalar(R);},function(v){var d=Math.min(Math.abs(v.y/R+1.45),Math.abs(v.y/R+1.95));return 1-THREE.MathUtils.smoothstep(d,.0,.04);});
  return parts;}
var GLOVE_GEO=null;
// on the purchased fighter: the front of the knuckles over the index and middle fingers, in each hand bone's own frame (measured on the model)
var UE_KNUCKLE={L:[16.07,2.44,-.18],R:[-15.94,-2.06,.32]};
function gloves(bn,col,root){var out={};
  if(bn.middle_01_l){['L','R'].forEach(function(s){var m=new THREE.Object3D();m.position.fromArray(UE_KNUCKLE[s]);bn['hand.'+s].add(m);out[s]=m;});return out;}
  ['hand.L','hand.R'].forEach(function(n){var h=bn[n];if(!h)return;var s=new THREE.Vector3();h.getWorldScale(s);
  var G=h.userData&&h.userData.glove;
  if(G){if(!GLOVE_GEO)GLOVE_GEO=gloveGeo();var mat=leatherMaterial(col),grp=new THREE.Group(),body=null;
    GLOVE_GEO.forEach(function(geo,k){var ms=new THREE.Mesh(geo,mat);ms.castShadow=true;grp.add(ms);if(!k)body=ms;});
    var Y=new THREE.Vector3().fromArray(G.axis),X=new THREE.Vector3().fromArray(G.thumb),Z=new THREE.Vector3().crossVectors(X,Y).normalize();X.crossVectors(Y,Z);
    grp.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,Z));grp.position.copy(Y).multiplyScalar(G.len*.92);h.add(grp);
    out[n.slice(-1)]=body;return;}
  var ax=root?handAxis(root,n.slice(-1)):null;
  var gl=new THREE.Mesh(new THREE.SphereGeometry(.078,24,18),new THREE.MeshStandardMaterial({color:col,roughness:.32}));gl.castShadow=true;h.add(gl);
  var cuff=new THREE.Mesh(new THREE.CylinderGeometry(.05,.054,.08,18),new THREE.MeshStandardMaterial({color:col,roughness:.4}));h.add(cuff);
  if(ax){var d=ax.clone().normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d);
    gl.quaternion.copy(q);gl.scale.set(1,1.22,1.05);gl.position.copy(d).multiplyScalar(ax.length()*.95);
    cuff.quaternion.copy(q);cuff.position.copy(d).multiplyScalar(-.015);}
  else{gl.scale.set(1/s.x,1.25/s.y,1.05/s.z);gl.position.set(0,.075/s.y,.012/s.z);cuff.scale.set(1/s.x,1/s.y,1/s.z);cuff.position.set(0,-.01/s.y,0);}
  out[n.slice(-1)]=gl;});return out;}
// small printed emblems: the gym lion on the shorts and on the referee's back
var DECALS={};
function decalTex(kind){if(DECALS[kind])return DECALS[kind];return DECALS[kind]=tex(256,256,function(g,w,h){
  if(kind==='white'){g.fillStyle='#ecebe6';g.textAlign='center';g.font=f9(64);g.fillText('MUAY',128,112);g.fillText('THAI',128,176);}
  else lionHead(g,128,128,104,kind==='ref'?'#d4a232':'#e0b030',kind==='ref'?'#141416':'#131315');});}
function decal(root,bn,key,kind,w,h,x,y,z,back){var b=bn[key];if(!b)return;root.updateMatrixWorld(true);
  var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:decalTex(kind),transparent:true,roughness:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));
  m.position.set(x,y,z);if(back)m.rotation.y=Math.PI;root.add(m);m.updateMatrixWorld(true);b.attach(m);}
// ---------- the purchased fighter (Realistic MMA Fighter): photographed skin and hair, compression shorts, ankle supports, MMA gloves.
// One texture set serves both corners: each fighter's colours are laid on in the shader, from masks read off the texture itself
// (the skin tone, the glove leather, the ankle supports, the shorts' side panels), plus the gym emblem printed on the left thigh.
// On top: the same fine skin detail, sweat sheen, subsurface warmth, cool rim and soft fill as the fighters had before.
var TEX_SKIN=new THREE.Color('rgb(213,139,111)'); // the texture's own median skin tone
// where the emblem sits in the shorts texture: centre, and texture offsets -> body offsets (right, up) in metres, from the model
var EMB={uv:[.37722,.37024],A:[[-1.0292,-.0352],[.0096,1.123]],size:{gold:[.11,.11],white:[.14,.105]}};
var EMBT={};
function embTex(kind){if(EMBT[kind])return EMBT[kind];return EMBT[kind]=tex(256,256,function(g,w,h){
  if(kind==='white'){g.fillStyle='#f2f0ea';g.textAlign='center';g.font=f9(78);g.fillText('MUAY',128,116);g.fillText('THAI',128,196);}
  else if(LION)lionArt(g,128,128,236,1,0);
  else lionHead(g,128,128,112,'#e0b030','#131315');});}
function texMaterial(part,map,look){
  var id={Skin:0,Legs:1,Hands:2,Shorts:3}[part];if(id===undefined)id=0;
  var tint=new THREE.Color(look.skin);tint.r/=TEX_SKIN.r;tint.g/=TEX_SKIN.g;tint.b/=TEX_SKIN.b;
  var U={uTint:{value:tint},uGlove:{value:new THREE.Color(look.glove)},uGear:{value:new THREE.Color(look.gear)},uTrim:{value:new THREE.Color(look.trim)}};
  if(id===3){var sz=EMB.size[look.emblem]||EMB.size.gold,A=EMB.A,w=sz[0],h=sz[1],u0=EMB.uv[0],v0=EMB.uv[1];
    U.uEmb={value:embTex(look.emblem)};U.uEmbM={value:new THREE.Matrix3().set(A[0][0]/w,A[0][1]/w,.5-(A[0][0]*u0+A[0][1]*v0)/w, A[1][0]/h,A[1][1]/h,.5-(A[1][0]*u0+A[1][1]*v0)/h, 0,0,1)};}
  var m=new THREE.MeshPhysicalMaterial({map:map,roughness:.58,metalness:0,clearcoat:id===3?0:.16,clearcoatRoughness:.4});
  if(id===3){m.sheen=1;m.sheenRoughness=.5;m.sheenColor=new THREE.Color('#3c3c44');} // compression fabric: a soft sheen at grazing angles
  m.name=part;m.defines.LR_PART=id;
  return lrInject(m,'lr-tex-'+id,{attr:'',body:'vB*=.0097;'},{
   pars:'uniform vec3 uTint,uGlove,uGear,uTrim;'+(id===3?'uniform sampler2D uEmb;uniform mat3 uEmbM;':''),uniforms:U,
   color:['vec3 c0=diffuseColor.rgb,sq=sqrt(max(c0,vec3(0.0)));',
     'float mx=max(sq.r,max(sq.g,sq.b)),mn=min(sq.r,min(sq.g,sq.b)),sat=(mx-mn)/(mx+1e-4),lum=dot(sq,vec3(.299,.587,.114)),lin=dot(c0,vec3(.2126,.7152,.0722));',
     'float neutral=1.0-smoothstep(.14,.24,sat),isSkin=1.0,gear=0.0,glove=0.0,panel=0.0;',
     '#if LR_PART==1',  // the ankle supports are the dark neutral part of the legs; their pale edge stays
     ' gear=neutral*(1.0-smoothstep(.26,.34,lum));isSkin=1.0-gear;',
     '#elif LR_PART==2', // dark neutral leather is the glove
     ' isSkin=smoothstep(.2,.3,sat)*smoothstep(.24,.36,lum);glove=(1.0-isSkin)*(1.0-smoothstep(.45,.6,lum));isSkin=1.0-glove;',
     '#elif LR_PART==3', // the shorts: black, with mid-grey side panels that take the corner's trim colour
     ' panel=neutral*smoothstep(.2,.27,lum)*(1.0-smoothstep(.55,.65,lum));isSkin=0.0;',
     '#endif',
     'float eyeW=0.0;',
     '#if LR_PART==0',
     ' eyeW=smoothstep(.58,.75,lum)*(1.0-smoothstep(.1,.18,sat));', // the whites of the eyes keep their colour
     '#endif',
     'vec3 c=mix(c0,c0*uTint,isSkin*(1.0-eyeW));',
     'c=mix(c,uGear*clamp(lin/.0118,.25,3.0),gear);c=mix(c,uGlove*clamp(pow(lin/.0212,.6),.3,1.45),glove);c=mix(c,uTrim*clamp(lin/.078,.3,1.5),panel);',
     '#if LR_PART==3',
     ' vec2 e=(uEmbM*vec3(vUv,1.0)).xy;if(e.x>0.0&&e.x<1.0&&e.y>0.0&&e.y<1.0){vec4 em=texture2D(uEmb,e);c=mix(c,em.rgb,em.a);panel=max(panel,em.a);}',
     '#endif',
     'diffuseColor.rgb=c;'].join('\n'),
   roughness:'roughnessFactor=isSkin*mix(.5,.65,lrN(vB*38.0))+glove*.5+gear*.82+panel*.5+(1.0-isSkin-glove-gear-panel)*.62;',
   normal:'{float h=isSkin*((lrN(vB*260.0)-.5)*.00022*lrFade(260.0)+(lrN(vB*70.0+3.1)-.5)*.0005*lrFade(70.0))+glove*(lrN(vB*420.0)-.5)*.00022*lrFade(420.0)'+
          '+gear*sin(vB.y*1500.0+lrN(vB*160.0)*2.5)*.0003*lrFade(240.0)'+(id===3?'+(lrN(vB*vec3(700.0,1400.0,700.0))-.5)*.00016*lrFade(900.0)':'')+';normal=lrBump(-vViewPosition,normal,h,faceDirection);}',
   lights:'#ifdef USE_CLEARCOAT\nmaterial.clearcoat*=isSkin*(.25+.75*smoothstep(.45,.75,lrN(vB*8.0+2.0)))+glove*.4;\n#endif',
   output:'{float l2=dot(outgoingLight,vec3(.299,.587,.114));vec3 alb=diffuseColor.rgb;'+
          'outgoingLight+=alb*vec3(.5,.16,.07)*.35*isSkin*smoothstep(.0,.2,l2)*(1.0-smoothstep(.2,.8,l2));'+
          'outgoingLight+=lrRimFill(normalize(normal),alb,.3,.26*isSkin+.12*(1.0-isSkin));}'});}
function dressTex(o,look){var mats=Array.isArray(o.material)?o.material:[o.material];
  var out=mats.map(function(mt){return texMaterial(mt.name,mt.map,look);});o.material=Array.isArray(o.material)?out:out[0];}

var clips={},F=[],REFR=null,U=new THREE.Vector3(0,1,0);
function V3(x,y,z){return new THREE.Vector3(x||0,y||0,z||0);}
function cb(){var v=V3();for(var i=0;i<arguments.length;i+=2)v.addScaledVector(arguments[i],arguments[i+1]);return v.normalize();}
function wp(b){return b.getWorldPosition(V3());}
function dirTo(from,to){return to.clone().sub(from).normalize();}
var KO_CLIPS={mx_ko:1,mx_ko2:1};
function makeFighter(src,look,ph){ // src: the fighter's part of the model file
  var root=new THREE.Group();root.add(THREE.SkeletonUtils.clone(src));var mh=isMH(root),ue=isUE(root);dress(root,look);scene.add(root);root.position.set(0,CAN,0);root.updateMatrixWorld(true);
  var f={root:root,mh:mh,kind:ue?'ue':mh?'mh':'mx',bn:boneMap(root),mixer:new THREE.AnimationMixer(root),act:{},fx:[],saved:[],o:0,v:0,lunge:0,turn:0,drop:0,hp:100,look:look,fwd:V3(1,0,0),ph:ph,dead:false};
  f.glv=gloves(f.bn,look.glove,root);f.gOff=ue?0:.085; // the purchased fighter's knuckle markers sit on the glove's surface already
  if(!ue)decal(root,f.bn,'hips',look.emblem,look.emblem==='white'?.15:.12,.12,0,mh?.95:.83,mh?.137:.128,false); // (his emblem is printed on his shorts)
  Object.keys(clips).forEach(function(k){if(!/^Ref_/.test(k))f.act[k]=f.mixer.clipAction(clips[k]);});
  // when a move ends, drift back into the bouncing guard; knockouts stay down
  f.mixer.addEventListener('finished',function(e){if(e.action!==f.cur||KO_CLIPS[e.action.getClip().name])return;toGuard(f,.3);});
  return f;}
function toGuard(f,fade){var g=f.act.mx_idle;if(f.cur===g)return;g.reset();g.setLoop(THREE.LoopRepeat,Infinity);g.setEffectiveTimeScale(1);g.setEffectiveWeight(1);g.play();
  g.time=(f.ph*1.3)%g.getClip().duration;if(f.cur)f.cur.crossFadeTo(g,fade||.25,false);f.cur=g;}
function play(f,name,fade,ts){var a=f.act[name];a.reset();a.setLoop(THREE.LoopOnce);a.clampWhenFinished=true;a.setEffectiveTimeScale(ts||1);a.setEffectiveWeight(1);a.play();if(f.cur&&f.cur!==a)f.cur.crossFadeTo(a,fade||.12,false);f.cur=a;}

// ---------- limb aiming, layered on top of the captured motion
var _a=V3(),_b=V3(),_q=new THREE.Quaternion(),_qp=new THREE.Quaternion(),_qw=new THREE.Quaternion(),_I=new THREE.Quaternion(),SAVE=null;
function aim(bone,child,dir,w){if(!bone||!child||w<=.001)return;if(SAVE&&!bone.userData.sv){bone.userData.sv=1;SAVE.push([bone,bone.quaternion.clone()]);}
  bone.updateWorldMatrix(true,true);bone.getWorldPosition(_a);child.getWorldPosition(_b);
  _b.sub(_a).normalize();_q.setFromUnitVectors(_b,dir);var d=_I.clone().slerp(_q,Math.min(1,w));bone.getWorldQuaternion(_qw);bone.parent.getWorldQuaternion(_qp);_qw.premultiply(d);bone.quaternion.copy(_qp.invert().multiply(_qw));}
function restore(f){f.saved.forEach(function(s){s[0].quaternion.copy(s[1]);s[0].userData.sv=0;});f.saved=[];}
function sm(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
function env(p,a,b){return sm(p/a)*(1-sm((p-b)/(1-b)));}
function sides(f){f.root.updateMatrixWorld(true);var R=V3().crossVectors(f.fwd,U).normalize(),rp=f.root.position,pl=wp(f.bn['foot.L']).sub(rp),pr=wp(f.bn['foot.R']).sub(rp),leadL=pl.dot(f.fwd)>pr.dot(f.fwd);
  var lp=leadL?pl:pr,sl=Math.sign(lp.dot(R))||1;
  return {lead:leadL?'L':'R',rear:leadL?'R':'L',Slead:R.clone().multiplyScalar(sl),Srear:R.clone().multiplyScalar(-sl)};}

// where a strike lands on the opponent, and which part of the attacker touches it
// per body: [up, forward] from the head joint to the face, from the upper spine joint to the chest, from the lower spine joint to the upper abs.
// The MakeHuman head joint sits higher in the skull and its hips higher; the purchased fighter's head joint sits low at the back of the skull
// and his spine joints higher (measured on each model: the same points on the body, a little under the skin)
// (the purchased fighter's body targets are placed along his spine, between its lower and upper joints, so they stay on the chest when he bends)
var TGT={mx:{head:[.03,.1],chest:[-.08,.14],belly:[.04,.13]},mh:{head:[-.025,.1],chest:[-.08,.14],belly:[.1,.13]},ue:{head:[.022,.1],chest:[.27,.09],belly:[-.08,.1],along:1}};
function target(D,kind,Fa){var bn=D.bn,o=TGT[D.kind]||TGT.mx;
  if(kind==='head')return wp(bn['head']).addScaledVector(U,o.head[0]).addScaledVector(Fa,-o.head[1]);
  if(o.along&&(kind==='chest'||kind==='belly'))return wp(bn['spine.001']).lerp(wp(bn['spine.003']),o[kind][0]).addScaledVector(Fa,-o[kind][1]);
  if(kind==='chest')return wp(bn['spine.003']).addScaledVector(U,o.chest[0]).addScaledVector(Fa,-o.chest[1]);
  if(kind==='belly')return wp(bn['spine.001']).addScaledVector(U,o.belly[0]).addScaledVector(Fa,-o.belly[1]);
  var s=sides(D),L=s.lead;return wp(bn['thigh.'+L]).lerp(wp(bn['shin.'+L]),.5).addScaledVector(Fa,-.08);}
function effector(A,kind,fx){var bn=A.bn,Fa=A.fwd;
  if(kind==='glove')return (A.glv[fx.hand]||A.glv.L).getWorldPosition(V3()).addScaledVector(Fa,A.gOff);
  if(kind==='shin')return wp(bn['shin.'+fx.leg]).lerp(wp(bn['foot.'+fx.leg]),.6).addScaledVector(Fa,.05);
  if(kind==='foot')return wp(bn['toe.'+fx.leg]||bn['foot.'+fx.leg]).addScaledVector(Fa,.03);
  if(kind==='knee')return wp(bn['shin.'+fx.leg]).addScaledVector(Fa,.06).addScaledVector(U,.02);
  if(kind==='elbow')return wp(bn['forearm.'+fx.hand]).addScaledVector(Fa,.05);
  return wp(bn['hand.'+fx.hand]);}

function startFx(f,type,now,dur,o){var fx={type:type,t0:now,dur:dur};for(var k in o)fx[k]=o[k];f.fx.push(fx);return fx;}
function cw(now,tImp){return sm((now-(tImp-.2))/.17)*(1-sm((now-(tImp+.1))/.22));} // how strongly contact is enforced around the moment of impact
function overlay(f,now){SAVE=f.saved;var Fw=f.fwd,R=V3().crossVectors(Fw,U).normalize(),bn=f.bn;f.lunge=0;f.turn=0;f.drop=0;f.root.updateMatrixWorld(true);
  for(var i=f.fx.length-1;i>=0;i--){var fx=f.fx[i],p=(now-fx.t0)/fx.dur;if(p<0)continue;
    if(fx.type==='clinch'){if(now>fx.t1){f.fx.splice(i,1);continue;}}else if(p>=1&&fx.type!=='win'){f.fx.splice(i,1);continue;}
    var T=fx.D?target(fx.D,fx.tgt,Fw):null,L=fx.leg,H=fx.hand,S=fx.S;
    if(fx.type==='punch'){var wc=env(p,.28,.5);f.lunge+=fx.step*wc;
      // steer the arm so the striking knuckles (not just the wrist) travel toward the target
      if(T&&H&&fx.contact){var gk=f.glv[H]||bn['hand.'+H],shp0=wp(bn['upper_arm.'+H]),w2=cw(now,fx.tImp)*.85;aim(bn['upper_arm.'+H],gk,dirTo(shp0,T),w2);aim(bn['forearm.'+H],gk,dirTo(wp(bn['forearm.'+H]),T),w2);}}
    else if(fx.type==='clip'){ // a captured kick, knee or teep: steer the striking leg onto the target around the moment of impact
      var wa=cw(now,fx.tImp)*fx.assist;f.drop+=fx.sink*wa;
      if(T&&wa>.001){var hip=wp(bn['thigh.'+L]);
        if(fx.eff==='knee'){aim(bn['thigh.'+L],bn['shin.'+L],dirTo(hip,T),wa);}
        else{var dl=dirTo(hip,T);aim(bn['thigh.'+L],bn['shin.'+L],dl,wa);var kn=wp(bn['shin.'+L]);aim(bn['shin.'+L],bn['foot.'+L],dirTo(kn,T).lerp(dl,.5).normalize(),wa);}}}
    else if(fx.type==='hook'){var wh=env(p,.3,.56),sw=sm((p-.12)/.3);f.turn+=fx.turnSign*(-.25+.75*sw)*wh;f.lunge+=.06*wh;
      aim(bn['upper_arm.'+H],bn['forearm.'+H],cb(S,.7,Fw,.45,U,.08),wh);
      var el=wp(bn['forearm.'+H]);aim(bn['forearm.'+H],f.glv[H]||bn['hand.'+H],T?dirTo(el,T).lerp(cb(Fw,1,S,-.2),.25).normalize():Fw,wh);
      aim(bn['spine.002'],bn['spine.003'],cb(U,1,Fw,.12,S,-.1),wh);}
    else if(fx.type==='elbow'){var we=env(p,.32,.56),up=sm((p-.1)/.25);f.turn+=fx.turnSign*.7*we;f.lunge+=.1*we;
      var shp=wp(bn['upper_arm.'+H]);aim(bn['upper_arm.'+H],bn['forearm.'+H],T?dirTo(shp,T).addScaledVector(U,.15).addScaledVector(S,.35*(1-up)).normalize():Fw,we);
      aim(bn['forearm.'+H],bn['hand.'+H],cb(Fw,-.55,U,.25,S,-.85),we);aim(bn['spine.001'],bn['spine.003'],cb(U,1,Fw,.22),we*.7);}
    else if(fx.type==='clinch'){var wl=sm((now-fx.t0)/.35)*(1-sm((now-fx.t1+.35)/.35))*(fx.lead?.75:1),O=fx.O;
      if(!fx.lead){aim(bn['spine.001'],bn['spine.003'],cb(U,1,Fw,.3),wl);aim(bn['neck'],bn['head'],cb(U,1,Fw,.25),wl*.5);}
      ['L','R'].forEach(function(s){var sg=s==='L'?1:-1,Sd=R.clone().multiplyScalar(-sg),os=s==='L'?'R':'L',
        tg=fx.lead?wp(O.bn['neck']).addScaledVector(Fw,.06).addScaledVector(Sd,.06):wp(O.bn['upper_arm.'+os]).lerp(wp(O.bn['forearm.'+os]),.4);
        var shc=wp(bn['upper_arm.'+s]);aim(bn['upper_arm.'+s],bn['forearm.'+s],dirTo(shc,tg).addScaledVector(Sd,-.25).normalize(),wl);aim(bn['forearm.'+s],bn['hand.'+s],dirTo(wp(bn['forearm.'+s]),tg),wl);});}
    else if(fx.type==='cover'){var wv=env(p,.14,.5);f.lunge-=.05*wv;
      ['L','R'].forEach(function(s){var sg=s==='L'?1:-1;aim(bn['upper_arm.'+s],bn['forearm.'+s],cb(Fw,.75,U,-.05,R,-.28*sg),wv);aim(bn['forearm.'+s],bn['hand.'+s],cb(U,1,Fw,.3,R,.18*sg),wv);});
      aim(bn['spine.001'],bn['spine.003'],cb(U,1,Fw,.1*wv),1);}
    else if(fx.type==='check'){var wq=env(p,.16,.5);aim(bn['thigh.'+L],bn['shin.'+L],cb(Fw,.55,U,.6,S,.55),wq);aim(bn['shin.'+L],bn['foot.'+L],cb(U,-1,Fw,.15,S,.25),wq);
      aim(bn['spine.001'],bn['spine.003'],cb(U,1,Fw,-.08,S,-.15),wq);}
    else if(fx.type==='slip'){var ws=env(p,.22,.45);aim(bn['spine.001'],bn['spine.003'],cb(U,1,R,.42*fx.dir,Fw,-.12),ws);aim(bn['neck'],bn['head'],cb(U,1,R,.3*fx.dir),ws*.6);f.lunge-=.05*ws;}
    else if(fx.type==='buckle'){var wb=env(p,.12,.35);aim(bn['thigh.'+L],bn['shin.'+L],cb(U,-1,Fw,.45,S,.2),wb*.8);aim(bn['shin.'+L],bn['foot.'+L],cb(U,-1,Fw,-.35),wb*.8);f.drop+=.07*wb;
      aim(bn['spine.001'],bn['spine.003'],cb(U,1,S,.3,Fw,.15),wb);}
    else if(fx.type==='win'){var ww=sm((now-fx.t0)/.6),pump=Math.max(0,Math.sin((now-fx.t0)*7))*.25;
      ['L','R'].forEach(function(s){var sg=s==='L'?1:-1;aim(bn['upper_arm.'+s],bn['forearm.'+s],cb(U,1,R,-.45*sg,Fw,-.1),ww);aim(bn['forearm.'+s],bn['hand.'+s],cb(U,1,R,-.15*sg,Fw,-pump),ww);});
      aim(bn['spine.001'],bn['spine.003'],cb(U,1,Fw,-.18),ww);aim(bn['neck'],bn['head'],cb(U,1,Fw,-.35),ww);}}
  SAVE=null;}

// ---------- Muay Thai moves. Kicks, knees, the teep, the clinch and the knockouts are motion-captured (Mixamo); punches come from the first set.
var MOVES={
  jab:{name:'JAB',range:.97,clip:'Punch_Jab',ts:1.3,imp:.3,react:'Hit_Head',dmg:5,push:1.6,step:.12,tgt:'head',eff:'glove'},
  cross:{name:'CROSS',range:.99,clip:'Punch_Cross',ts:1.25,imp:.4,react:'Hit_Head',dmg:8,push:2.1,step:.16,tgt:'head',eff:'glove'},
  hook:{name:'HOOK',range:.88,fx:'hook',dur:.62,imp:.46,react:'Hit_Head',dmg:8,push:1.5,tgt:'head',eff:'glove',side:'lead'},
  elbow:{name:'ELBOW',range:.64,fx:'elbow',dur:.6,imp:.46,react:'Hit_Head',dmg:11,push:1.9,tgt:'head',eff:'elbow',side:'rear'},
  teep:{name:'TEEP',range:1.26,clip:'mx_teep',ts:1.15,imp:.43,react:'Hit_Chest',dmg:6,push:4.2,tgt:'belly',eff:'foot',leg:'R',assist:.45,kick:1},
  low:{name:'LEG KICK',range:.92,clip:'mx_kick',ts:1.2,imp:.57,react:null,dmg:7,push:.9,tgt:'thigh',eff:'shin',leg:'R',assist:.85,sink:.05,kick:1},
  kick:{name:'BODY KICK',range:.8,clip:'mx_kick',ts:1.15,imp:.57,react:'Hit_Chest',dmg:11,push:2.8,tgt:'chest',eff:'shin',leg:'R',assist:.5,kick:1},
  switch:{name:'SWITCH KICK',range:.74,clip:'mx_switch',ts:1.2,imp:.75,react:'Hit_Chest',dmg:10,push:2.6,tgt:'chest',eff:'shin',leg:'L',assist:.4,kick:1},
  knee:{name:'KNEE',range:.6,clip:'mx_knee',ts:1.15,imp:.52,react:'Hit_Chest',dmg:8,push:1.4,tgt:'belly',eff:'knee',leg:'L',assist:.35},
  head:{name:'HEAD KICK',range:1.0,clip:'mx_head',ts:1.1,imp:.55,react:'Hit_Head',dmg:14,push:3.2,tgt:'head',eff:'shin',leg:'R',assist:.65,kick:1},
  cknee:{name:'KNEE',react:'Hit_Chest',dmg:7,push:.8,tgt:'chest',eff:'knee',leg:'R'}};
function rlen(m){var M=MOVES[m];return M.clip?clips[M.clip].duration/M.ts:M.dur;}
function rimp(m){var M=MOVES[m];return M.clip?M.imp/M.ts:M.imp*M.dur;}
function rng(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646;};}
var COMBOS=[['jab','cross','low'],['teep'],['jab','kick'],['cross','hook','kick'],['elbow'],['jab','elbow'],['clinch'],['low'],['jab','cross','knee'],['teep','kick'],['switch'],['jab','switch'],['hook','low'],['jab','jab','cross'],['knee']];
function buildRound(seed,finish){var r=rng(seed),t=2.1,ev=[],last=-1,usedClinch=false;
  while(t<15.5){var att=last<0?(r()<.5?0:1):(r()<.72?1-last:last);last=att;var c=COMBOS[(r()*COMBOS.length)|0];
    if(c[0]==='clinch'){if(usedClinch)continue;usedClinch=true;ev.push({t:t,a:att,m:'clinch'});t+=clips.mx_clinch.duration+.4;continue;}
    c.forEach(function(m,k){var h=r(),out=h<(att?.5:.64)?'hit':((m==='jab'||m==='cross'||m==='hook')&&h>.82)?'slip':'block';ev.push({t:t,a:att,m:m,out:out});
      var nx=c[k+1];t+=rlen(m)*(k<c.length-1?(MOVES[m].kick||MOVES[nx].kick?.72:.62):1);});
    t+=.5+r()*.7;}
  // the finish: jab, cross, then a head kick that drops him backwards, or a body kick that folds him to the canvas
  var fin=finish?['jab','cross','kick']:['jab','cross','head'];
  fin.forEach(function(m,k){ev.push({t:t,a:0,m:m,out:'hit',fin:k===2});t+=rlen(m)*(k<2?.62:1);});
  return {ev:ev,end:t+6.8};}
var ROUND=0,RD=null,LOOP=20,PAIR={c:V3(),th:0,dist:1.55,want:1.55,clinch:0,range:1.3,rangeUntil:-1};
var winAt=-1,clockT=0,idx=0,pend=[],CONTACTS=[],call=els.call,callT=0,hitstop=0,slowmo=0,shake=0,shakeOff=V3();
function say(t,ko){call.textContent=t;call.className=ko?'on ko':'on';clearTimeout(callT);callT=setTimeout(function(){call.className='';},ko?3200:900);}
function bars(){els.hpA.style.width=Math.max(0,F[0].hp)+'%';els.hpB.style.width=Math.max(0,F[1].hp)+'%';}
var mvT=[0,0];function label(i,t,def){var el=i?els.mvB:els.mvA;el.textContent=t;el.className=def?'on def':'on';clearTimeout(mvT[i]);mvT[i]=setTimeout(function(){el.className='';},850);}

var FLASHES=[],flashTex=null;
function flashAt(pos,col,size){if(!flashTex)flashTex=tex(128,128,function(g){var gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,230,160,.9)');gr.addColorStop(1,'rgba(255,140,40,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);});
  var s=FLASHES.find(function(x){return x.life<=0;});if(!s){s={sp:new THREE.Sprite(new THREE.SpriteMaterial({map:flashTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false}))};scene.add(s.sp);FLASHES.push(s);}
  s.sp.material.color.set(col);s.sp.position.copy(pos);s.life=1;s.size=size;s.sp.visible=true;}
function tickFlashes(rdt){FLASHES.forEach(function(s){if(s.life<=0)return;s.life-=rdt/.2;var k=1-Math.max(0,s.life);s.sp.scale.setScalar(s.size*(.35+k));s.sp.material.opacity=Math.max(0,s.life);if(s.life<=0)s.sp.visible=false;});}

function strike(e){var A=F[e.a],D=F[1-e.a];
  if(e.m==='clinch'){ // collar tie and knees to the body, straight from the capture
    var dur=clips.mx_clinch.duration,t1=clockT+dur-.25;PAIR.clinch=t1;label(e.a,tr('CLINCH'));play(A,'mx_clinch',.25,1);
    startFx(A,'clinch',clockT,99,{t1:t1,O:D,lead:true});startFx(D,'clinch',clockT,99,{t1:t1,O:A,lead:false});
    [.55,1.4,2.15].forEach(function(dt,k){var out=k===1?'block':'hit',M=MOVES.cknee,fx={leg:'R'};
      pend.push({t:clockT+dt-.001,go:function(){label(e.a,tr('KNEE'));}});
      CONTACTS.push({A:A,D:D,fx:fx,eff:'knee',tgt:'chest',tImp:clockT+dt,pierce:out==='block'?-.1:.01,m:'cknee'});
      pend.push({t:clockT+dt,e:{a:e.a,m:'cknee',out:out},A:A,D:D,M:M});});return;}
  doMove(A,D,e);}
function doMove(A,D,e){var M=MOVES[e.m],imp=rimp(e.m);PAIR.range=M.range;PAIR.rangeUntil=clockT+imp+.2;var s=sides(A),fx,side=M.side==='lead'?s.lead:s.rear,S=M.side==='lead'?s.Slead:s.Srear;
  var tsg=V3().crossVectors(U,S).dot(A.fwd)>0?1:-1;label(e.a,tr(M.name));
  if(M.clip&&M.leg){play(A,M.clip,.16,M.ts);fx=startFx(A,'clip',clockT,rlen(e.m),{D:D,tgt:M.tgt,leg:M.leg,eff:M.eff,tImp:clockT+imp,assist:M.assist,sink:M.sink||0});}
  else if(M.clip){play(A,M.clip,.1,M.ts);fx=startFx(A,'punch',clockT,rlen(e.m),{step:M.step,D:D,tgt:M.tgt,tImp:clockT+imp,contact:e.out==='hit'});}
  else fx=startFx(A,M.fx,clockT,M.dur,{D:D,tgt:M.tgt,leg:side,hand:side,S:S,turnSign:tsg,tImp:clockT+imp});
  // clean strikes are driven onto the target; blocked ones land on the guard, just short of the body
  if(e.out==='hit'||e.out==='block')CONTACTS.push({A:A,D:D,fx:fx,eff:M.eff,tgt:M.tgt,tImp:clockT+imp,pierce:e.out==='block'?-.13:(e.m==='teep'||e.fin?.04:.015),m:e.m,out:e.out});
  var d0=Math.max(0,imp-.22),ds=sides(D);
  if(e.out==='block')startFx(D,(e.m==='low'||(M.kick&&M.tgt!=='head'))?'check':'cover',clockT+d0,.6,{leg:ds.lead,S:ds.Slead});
  else if(e.out==='slip')startFx(D,'slip',clockT+d0,.55,{dir:Math.random()<.5?1:-1});
  pend.push({t:clockT+imp,e:e,A:A,D:D,M:M});}
function land(p){if(p.go){p.go();return;}var e=p.e,D=p.D,M=p.M,A=p.A,di=F.indexOf(D);D.root.updateMatrixWorld(true);var at=target(D,M.tgt,A.fwd);
  if(e.out==='hit'){D.hp-=e.fin?100:M.dmg;D.v+=M.push;if(!D.fx.some(function(x){return x.type==='clinch';}))D.fx=D.fx.filter(function(x){return x.type==='win';});
    if(e.fin){D.dead=true;D.fx=[];play(D,e.m==='head'?'mx_ko':'mx_ko2',.06,1);flashAt(at,'#ffffff',1.6);shake=.14;slowmo=1.3;say('K.O.',true);winAt=clockT+1.3;koCbs.forEach(function(cb){try{cb();}catch(x){}});}
    else{if(M.react)play(D,M.react,.06,1.1);if(e.m==='low'){var ds=sides(D);startFx(D,'buckle',clockT,.55,{leg:ds.lead,S:ds.Slead});}
      flashAt(at,'#ffd28a',M.kick||e.m==='knee'||e.m==='cknee'?1.1:.8);shake=Math.max(shake,M.kick?.07:.045);hitstop=M.kick?.09:.06;}}
  else if(e.out==='block'){D.v+=M.push*.4;flashAt(at,'#b9d4ff',.55);shake=Math.max(shake,.02);hitstop=.035;label(di,tr((e.m==='low'||(M.kick&&M.tgt!=='head'))?'CHECKED':'BLOCKED'),true);}
  else if(e.out==='slip')label(di,tr('SLIPPED'),true);
  bars();}
// contact pass: slide the attacker (and a little of the defender) so the striking surface meets the target at impact
function contacts(now){for(var i=CONTACTS.length-1;i>=0;i--){var c=CONTACTS[i];if(now>c.tImp+.35){CONTACTS.splice(i,1);continue;}var w=cw(now,c.tImp);if(w<=0)continue;
  var A=c.A,D=c.D;A.root.updateMatrixWorld(true);D.root.updateMatrixWorld(true);
  if(c.eff==='glove'&&!c.fx.hand){var gl=A.glv.L.getWorldPosition(V3()).dot(A.fwd),gr=A.glv.R.getWorldPosition(V3()).dot(A.fwd);c.fx.hand=gl>gr?'L':'R';}
  var gap=target(D,c.tgt,A.fwd).sub(effector(A,c.eff,c.fx)).dot(A.fwd)+c.pierce,sh=Math.max(-.5,Math.min(.6,gap))*w;
  A.root.position.addScaledVector(A.fwd,sh*.8);D.root.position.addScaledVector(A.fwd,-sh*.2);
  }}
function resetRound(){ROUND++;RD=buildRound(1990+ROUND*7919,ROUND%2===0);LOOP=RD.end;CONTACTS=[];pend=[];PAIR.clinch=0;PAIR.rangeUntil=-1;
  F.forEach(function(f){f.hp=100;f.fx=[];f.o=0;f.v=0;f.dead=false;f.cur=null;f.mixer.stopAllAction();toGuard(f);});
  els.round.textContent=L('ROUND ','ASALTO ')+((ROUND-1)%3+1);bars();say(L('ROUND ','ASALTO ')+((ROUND-1)%3+1));setTimeout(function(){say(tr('FIGHT!'));},950);}

function place(dt,now){
  var inClinch=PAIR.clinch>now,active=pend.length>0||F.some(function(f){return f.fx.some(function(x){return x.type!=='win';});});
  var closing=now<PAIR.rangeUntil&&!inClinch;PAIR.want=F[1].dead?1.4:inClinch?.6:closing?PAIR.range:active?1.25:1.45+.12*Math.sin(now*.9);
  PAIR.dist+=(PAIR.want-PAIR.dist)*Math.min(1,dt*(inClinch?4:closing?5.5:2.2));
  if(!F[1].dead){var az=Math.atan2(camera.position.z-PAIR.c.z,camera.position.x-PAIR.c.x)+Math.PI/2+.45*Math.sin(now*.33),dth=Math.atan2(Math.sin(az-PAIR.th),Math.cos(az-PAIR.th));PAIR.th+=dth*Math.min(1,dt*.9);
    PAIR.c.x+=(Math.sin(now*.21)*.5-PAIR.c.x)*dt*.6;PAIR.c.z+=(Math.sin(now*.29+1)*.4-PAIR.c.z)*dt*.6;}
  var ax=V3(Math.cos(PAIR.th),0,Math.sin(PAIR.th));
  F.forEach(function(f,i){var s=i?1:-1;f.fwd.copy(ax).multiplyScalar(-s);
    f.v+=(-55*f.o-10*f.v)*dt;f.o+=f.v*dt;if(f.dead)f.o=Math.min(f.o,.5);
    var off=f.lunge-f.o;
    f.root.position.set(PAIR.c.x+ax.x*s*PAIR.dist/2+f.fwd.x*off,CAN-f.drop,PAIR.c.z+ax.z*s*PAIR.dist/2+f.fwd.z*off);
    f.root.rotation.y=Math.atan2(f.fwd.x,f.fwd.z)+f.turn;});
  if(REFR){var perp=V3(-ax.z,0,ax.x);if(perp.dot(V3(camera.position.x-PAIR.c.x,0,camera.position.z-PAIR.c.z))>0)perp.negate();perp.addScaledVector(ax,.6).normalize();
    var want=PAIR.c.clone().addScaledVector(perp,1.5).addScaledVector(ax,.9);want.y=CAN;want.x=Math.max(-HALF+.45,Math.min(HALF-.45,want.x));want.z=Math.max(-HALF+.45,Math.min(HALF-.45,want.z));REFR.root.position.lerp(want,Math.min(1,dt*.8));
    var to=PAIR.c.clone().sub(REFR.root.position);REFR.root.rotation.y=Math.atan2(to.x,to.z);}}


// ---------- what the map calls
var api={ready:false,alpha:0,shown:0},koCbs=[],lastNow=0,lastVis=0,lastCam=null,reflashFn=null;
function names(){els.na.textContent="LION'S ROAR";els.nb.textContent=L('CHALLENGER','RETADOR');}
function startRound(){clockT=0;idx=0;winAt=-1;pend=[];resetRound();}
// the map's camera (metres on the map, x east, y north, z up) becomes this scene's camera (ring at the origin, y up)
function syncCam(m){camera.position.set((m.C[0]-AX)/K,m.C[2]/K,-(m.C[1]-AY)/K);camera.up.set(m.u[0],m.u[2],-m.u[1]);
  camera.lookAt(camera.position.x+m.f[0],camera.position.y+m.f[2],camera.position.z-m.f[1]);
  camera.fov=2*Math.atan(m.H/2/m.F)*180/Math.PI;camera.aspect=m.W/m.H;camera.setViewOffset(m.W,m.H,0,-.04*m.H,m.W,m.H);camera.updateProjectionMatrix();}
api.resize=function(W,H,dpr){renderer.setPixelRatio(Math.min(dpr||1,1.75));renderer.setSize(W,H,false);};
api.onKO=function(cb){koCbs.push(cb);};
// where the fighters are, in map metres, so the map's fight camera can follow and frame them like before
api.fcam=function(){if(!api.ready||!lastCam)return null;var rx=lastCam.r[0],ry=lastCam.r[1],mn=1e9,mx=-1e9,pmn=null,pmx=null;
  F.forEach(function(f){f.root.updateMatrixWorld(true);['head','hand.L','hand.R','foot.L','foot.R','hips'].forEach(function(n){var w=wp(f.bn[n]),x=AX+w.x*K,y=AY-w.z*K,d=x*rx+y*ry;if(d<mn){mn=d;pmn=[x,y];}if(d>mx){mx=d;pmx=[x,y];}});});
  return pmn?{x:(pmn[0]+pmx[0])/2,y:(pmn[1]+pmx[1])/2,ext:mx-mn}:null;};
// called by the map every frame it draws: m is its camera, want is how far the camera has come into the arena (0 to 1)
api.update=function(now,m,want){var rdt=lastNow?Math.min(.05,(now-lastNow)/1000):0;lastNow=now;lastCam=m;
  if(!api.ready){wrap.style.opacity=0;return;}
  api.shown+=(want-api.shown)*Math.min(1,rdt*6);if(Math.abs(want-api.shown)<.004)api.shown=want;api.alpha=api.shown;wrap.style.opacity=api.shown.toFixed(3);
  if(api.shown<=.002){els.hud.classList.remove('on');return;}
  if(!lastVis||now-lastVis>4000){names();startRound();}lastVis=now; // a fresh round each time the camera comes back ringside
  step(rdt);syncCam(m);cutStands();
  shake*=.86;shakeOff.set((Math.random()-.5)*shake,(Math.random()-.5)*shake,(Math.random()-.5)*shake);camera.position.add(shakeOff);
  renderer.render(scene,camera);els.hud.classList.toggle('on',api.shown>.6);};
var fl=0;
function step(rdt){
  var ts=hitstop>0?.1:slowmo>0?.3:1;hitstop-=rdt;if(slowmo>0)slowmo-=rdt;var dt=rdt*ts;
  clockT+=dt;if(clockT>=LOOP)startRound();
  while(idx<RD.ev.length&&clockT>=RD.ev[idx].t){strike(RD.ev[idx]);idx++;}
  for(var i=pend.length-1;i>=0;i--)if(clockT>=pend[i].t){var pp=pend[i];pend.splice(i,1);land(pp);}
  if(winAt>0&&clockT>=winAt){startFx(F[0],'win',clockT,99);winAt=-1;}
  els.fade.style.opacity=clockT>LOOP-.55?1:0;
  els.clk.textContent=Math.max(0,Math.ceil(60-clockT*60/LOOP));
  F.forEach(function(f){restore(f);f.mixer.update(dt);});
  place(dt,clockT);F.forEach(function(f){overlay(f,clockT);});contacts(clockT);
  REFR.mixer.update(dt*.8);tickFlashes(rdt);
  if((fl+=rdt)>.35){fl=0;reflashFn();}}
function init(gltf){
  gltf.animations.forEach(function(c){clips[c.name]=c;});
  reflashFn=build();
  // the model file holds the fighter (both corners are dressed from it) and the referee, each under its own name
  var fsrc=gltf.scene.getObjectByName('Fighter')||gltf.scene,rsrc=gltf.scene.getObjectByName('Referee')||fsrc;
  F.push(makeFighter(fsrc,LOOKS.a,0));F.push(makeFighter(fsrc,LOOKS.b,1.7));
  var r=THREE.SkeletonUtils.clone(rsrc);dress(r,LOOKS.r);scene.add(r);var rmh=isMH(r);decal(r,boneMap(r),'spine.003','ref',rmh?.2:.24,rmh?.2:.24,0,1.3,rmh?-.086:-.152,true);r.position.set(1.2,CAN,-1.6);REFR={root:r,mixer:new THREE.AnimationMixer(r)};REFR.mixer.clipAction(clips.Ref_Idle||clips.Idle_Loop).play();
  names();api.ready=true;}
var fontsOk=document.fonts&&document.fonts.load?Promise.all([document.fonts.load("400 40px Anton"),document.fonts.load("700 40px 'Barlow Condensed'")]).catch(function(){}):Promise.resolve();
// the crowned lion for the ring canvas and apron: the same art as the site's hero and footer (usually already cached). Without it the ring keeps its drawn lion.
var lionOk=new Promise(function(res){var im=new Image();im.onload=function(){res(im.naturalWidth?im:null);};im.onerror=function(){res(null);};setTimeout(function(){res(null);},6000);im.src=o.lion||'img/lion-still.webp';})
  .then(function(im){LION=im;});
fetch(o.glb).then(function(r){if(!r.ok)throw new Error('glb '+r.status);return r.arrayBuffer();}).then(function(buf){return Promise.all([fontsOk,lionOk]).then(function(){return buf;});})
  .then(function(buf){new THREE.GLTFLoader().parse(buf,'',function(g){try{init(g);}catch(e){if(o.onfail)o.onfail(e);}},function(e){if(o.onfail)o.onfail(e);});})
  .catch(function(e){if(o.onfail)o.onfail(e);});
return api;
}};
})();
