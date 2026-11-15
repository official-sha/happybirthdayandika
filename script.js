(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};

/* ---------- intro ---------- */
document.body.classList.add("lock");
document.querySelectorAll(".i").forEach(function(e){e.style.setProperty("--d",e.getAttribute("data-d"))});

/* ---------- ambient ocean sound (synthesized, no audio file) ---------- */
var ac,gain,soundOn=false,snd=$("snd"),sndT=$("sndT");
function setSnd(v){soundOn=v;snd.classList.toggle("on",v);sndT.textContent=v?"ON":"OFF"}
function startSound(){
  try{
    if(!ac){
      ac=new (window.AudioContext||window.webkitAudioContext)();
      var n=ac.sampleRate*6,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0),last=0;
      for(var i=0;i<n;i++){var w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.5}
      var s=ac.createBufferSource();s.buffer=b;s.loop=true;
      var lp=ac.createBiquadFilter();lp.type="lowpass";lp.frequency.value=560;
      var lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=.09;lg.gain.value=.14;
      var lfo2=ac.createOscillator(),lg2=ac.createGain();lfo2.frequency.value=.23;lg2.gain.value=140;
      gain=ac.createGain();gain.gain.value=0;
      lfo.connect(lg);lg.connect(gain.gain);lfo2.connect(lg2);lg2.connect(lp.frequency);
      s.connect(lp);lp.connect(gain);gain.connect(ac.destination);s.start();lfo.start();lfo2.start();
    }
    ac.resume();gain.gain.cancelScheduledValues(ac.currentTime);
    gain.gain.linearRampToValueAtTime(.16,ac.currentTime+2.5);setSnd(true);musicIn();
  }catch(e){}
  musicIn();
}
var bgm=$("bgm"),fade;
function ramp(to,done){clearInterval(fade);fade=setInterval(function(){var v=bgm.volume,d=to-v;if(Math.abs(d)<.03){bgm.volume=to;clearInterval(fade);done&&done()}else bgm.volume=clamp(v+Math.sign(d)*.025,0,1)},60)}
function musicIn(){try{bgm.volume=bgm.paused?0:bgm.volume;var p=bgm.play();if(p&&p.catch)p.catch(function(){});setSnd(true);ramp(.75)}catch(e){}}
function stopSound(){try{gain.gain.linearRampToValueAtTime(0,ac.currentTime+1.2)}catch(e){}ramp(0,function(){bgm.pause()});setSnd(false)}
snd.addEventListener("click",function(){soundOn?stopSound():startSound()});
document.addEventListener("visibilitychange",function(){if(!soundOn)return;if(document.hidden){bgm.pause();ac&&ac.suspend()}else{bgm.play().catch(function(){});ac&&ac.resume()}});

$("go").addEventListener("click",function(){
  $("intro").classList.add("off");document.body.classList.remove("lock");document.body.classList.add("go");
  window.scrollTo(0,0);startSound();
  try{navigator.vibrate&&navigator.vibrate(30)}catch(e){}
});

/* ---------- reveal, count-up ---------- */
var io=new IntersectionObserver(function(es){es.forEach(function(e){
  if(!e.isIntersecting)return;
  e.target.classList.add("on");io.unobserve(e.target);
  if(e.target.classList.contains("num"))countUp();
})},{threshold:.18,rootMargin:"0px 0px -6% 0px"});
document.querySelectorAll(".rv").forEach(function(e){io.observe(e)});
document.querySelectorAll(".log p").forEach(function(p,i){p.style.transitionDelay=(i%2?.12:0)+"s"});
function countUp(){
  var el=$("n21");if(reduce){el.textContent="21";return}
  var t0=performance.now();(function f(t){var k=clamp((t-t0)/1800,0,1);el.textContent=Math.round(21*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0);
}
$("n21").textContent="0";

/* ---------- scroll: progress, HUD, parallax, dawn ---------- */
var ship=$("ship"),prog=$("prog"),hdg=$("hdg"),kn=$("kn"),fin=$("final"),sy=0,px=0,tx=0;
function onScroll(){
  var m=document.documentElement.scrollHeight-innerHeight,p=m>0?scrollY/m:0;sy=scrollY;
  prog.style.width=p*100+"%";
  hdg.textContent=("00"+Math.round(p*360)).slice(-3);
  kn.textContent=("0"+Math.round(8+Math.sin(p*9)*4+p*6)).slice(-2);
  var r=fin.getBoundingClientRect();fin.style.setProperty("--p",clamp(1-r.top/innerHeight*.9,0,1).toFixed(3));
}
addEventListener("scroll",onScroll,{passive:true});onScroll();
addEventListener("pointermove",function(e){tx=(e.clientX/innerWidth-.5)*2},{passive:true});
if(window.DeviceOrientationEvent&&"ontouchstart" in window){addEventListener("deviceorientation",function(e){if(e.gamma!=null)tx=clamp(e.gamma/25,-1,1)},{passive:true})}

/* ---------- ocean canvases ---------- */
var c=$("c"),f=$("f"),x=c.getContext("2d"),y=f.getContext("2d"),W,H,stars=[],plank=[],shoot=null,T=0,mob=innerWidth<760;
function size(){
  var r=Math.min(devicePixelRatio||1,2);W=c.clientWidth;H=c.clientHeight;mob=W<760;
  [c,f].forEach(function(k){k.width=W*r;k.height=H*r});x.setTransform(r,0,0,r,0,0);y.setTransform(r,0,0,r,0,0);
  stars=[];var ns=mob?90:150;for(var i=0;i<ns;i++)stars.push({x:Math.random()*W,y:Math.random()*H*.62,s:Math.random()*1.5+.3,p:Math.random()*6,d:Math.random()});
  plank=[];var np=mob?26:50;for(i=0;i<np;i++)plank.push({x:Math.random()*W,y:H*.7+Math.random()*H*.3,s:Math.random()*1.6+.5,p:Math.random()*6,v:Math.random()*.25+.05});
}
addEventListener("resize",size);size();
var LAY=[["#0f3d56","#071f31",0,5,.011,.9],["#0c3248","#061b2a",.13,8,.014,1.3],["#08263a","#04141f",.28,12,.017,1.7],["#051b2b","#020b13",.45,16,.02,2.2]];
function wave(g,l,i,my){
  var by=H*.64+(H*.36)*l[2];g.beginPath();g.moveTo(0,H);
  for(var X=0;X<=W;X+=8)g.lineTo(X,by+Math.sin(X*l[4]+T*l[5]*1.6+i)*l[3]+Math.sin(X*l[4]*2.3-T*l[5])*l[3]*.4);
  g.lineTo(W,H);g.closePath();
  var gg=g.createLinearGradient(0,by,0,H);gg.addColorStop(0,l[0]);gg.addColorStop(1,l[1]);g.fillStyle=gg;g.fill();return by;
}
function frame(){
  T+=reduce?0:.012;
  var mx=W*(mob?.74:.78)-tx*14,my=H*.19,hz=H*.64,rad=mob?30:36;
  x.clearRect(0,0,W,H);y.clearRect(0,0,W,H);
  var sk=x.createLinearGradient(0,0,0,hz);sk.addColorStop(0,"#010710");sk.addColorStop(.7,"#071a2c");sk.addColorStop(1,"#134560");x.fillStyle=sk;x.fillRect(0,0,W,hz+4);
  stars.forEach(function(s){x.globalAlpha=.3+.7*Math.abs(Math.sin(T*.8+s.p));x.fillStyle="#f6efd9";x.fillRect(s.x-tx*s.d*10,s.y-sy*.05*s.d,s.s,s.s)});x.globalAlpha=1;
  if(!shoot&&!reduce&&Math.random()<.004)shoot={x:Math.random()*W*.7,y:Math.random()*H*.25,l:0};
  if(shoot){shoot.l+=.04;var a=1-shoot.l;if(a<=0)shoot=null;else{x.strokeStyle="rgba(255,244,215,"+a+")";x.lineWidth=1.4;x.beginPath();x.moveTo(shoot.x+shoot.l*240,shoot.y+shoot.l*90);x.lineTo(shoot.x+shoot.l*240-70,shoot.y+shoot.l*90-26);x.stroke()}}
  var gl=x.createRadialGradient(mx,my,0,mx,my,rad*5);gl.addColorStop(0,"rgba(240,228,190,.5)");gl.addColorStop(1,"rgba(240,228,190,0)");x.fillStyle=gl;x.fillRect(mx-rad*5,my-rad*5,rad*10,rad*10);
  x.fillStyle="#f1e5bf";x.beginPath();x.arc(mx,my,rad,0,7);x.fill();
  x.fillStyle="rgba(150,135,100,.35)";[[-9,-6,6],[8,5,8],[-4,12,4]].forEach(function(k){x.beginPath();x.arc(mx+k[0]*rad/36,my+k[1]*rad/36,k[2]*rad/36,0,7);x.fill()});
  /* haze at horizon */
  var hg=x.createLinearGradient(0,hz-40,0,hz+10);hg.addColorStop(0,"rgba(120,180,200,0)");hg.addColorStop(1,"rgba(120,180,200,.22)");x.fillStyle=hg;x.fillRect(0,hz-40,W,50);
  for(var i=0;i<4;i++){
    var g=i<2?x:y,by=wave(g,LAY[i],i);
    if(i<3){ /* moon reflection streaks */
      g.strokeStyle="#f1e5bf";g.lineWidth=1;var rows=i===0?12:i===1?10:8;
      for(var k=0;k<rows;k++){var yy=by+6+k*((H-by)/(rows*1.7)),ww=(rows-k)*(mob?1.7:2.2)*(1+i*.3),off=Math.sin(T*2+k*1.3+i)*14;
        g.globalAlpha=(.55-k/(rows*2))*(.42-i*.1);g.beginPath();g.moveTo(mx-ww+off,yy);g.lineTo(mx+ww+off,yy);g.stroke()}
      g.globalAlpha=1;
    }
  }
  /* plankton glow */
  plank.forEach(function(p){p.x+=p.v;if(p.x>W)p.x=0;var a=.15+.5*Math.abs(Math.sin(T*1.5+p.p));
    y.globalAlpha=a;y.fillStyle="#7fe6e0";y.shadowColor="#5fd9d0";y.shadowBlur=8;y.beginPath();y.arc(p.x,p.y+Math.sin(T+p.p)*3,p.s,0,7);y.fill()});
  y.shadowBlur=0;y.globalAlpha=1;
  /* ship motion: parallax + scroll */
  var s=clamp(sy,0,innerHeight);px+=(tx-px)*.05;
  ship.style.transform="translateX(calc(-50% + "+(px*-10)+"px)) translateY("+s*.2+"px) scale("+(1+s/innerHeight*.14)+")";
  if(sy<innerHeight*1.2)requestAnimationFrame(frame);else idle=true;
}
var idle=false;
addEventListener("scroll",function(){if(idle&&sy<innerHeight*1.2){idle=false;requestAnimationFrame(frame)}},{passive:true});
frame();

/* ---------- celebration fireworks ---------- */
var fx=$("fx"),g2=fx.getContext("2d"),parts=[],run=false;
function fs(){var r=Math.min(devicePixelRatio||1,2);fx.width=innerWidth*r;fx.height=innerHeight*r;g2.setTransform(r,0,0,r,0,0)}
addEventListener("resize",fs);fs();
function burst(cx,cy){
  var cols=["#f6dfa0","#dcbf82","#ffffff","#f0a85c","#8fd8e6"],n=mob?46:70;
  for(var i=0;i<n;i++){var a=Math.PI*2*i/n+Math.random()*.2,v=2+Math.random()*3.6;
    parts.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:cols[i%cols.length],s:1.2+Math.random()*1.6})}
  if(!run){run=true;requestAnimationFrame(fxl)}
}
function fxl(){
  g2.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(function(p){p.x+=p.vx;p.y+=p.vy;p.vx*=.985;p.vy=p.vy*.985+.04;p.l-=.011;
    if(p.l<=0)return false;g2.globalAlpha=p.l;g2.fillStyle=p.c;g2.shadowColor=p.c;g2.shadowBlur=10;g2.beginPath();g2.arc(p.x,p.y,p.s,0,7);g2.fill();return true});
  g2.globalAlpha=1;g2.shadowBlur=0;
  if(parts.length)requestAnimationFrame(fxl);else{run=false;g2.clearRect(0,0,innerWidth,innerHeight)}
}
$("cel").addEventListener("click",function(){
  if(reduce){burst(innerWidth/2,innerHeight/2);return}
  for(var i=0;i<7;i++)(function(i){setTimeout(function(){burst(innerWidth*(.15+Math.random()*.7),innerHeight*(.18+Math.random()*.4))},i*380)})(i);
  try{navigator.vibrate&&navigator.vibrate([40,60,40])}catch(e){}
});
fin.addEventListener("pointerdown",function(e){if(e.target.id!=="cel")burst(e.clientX,e.clientY)});
})();
