/**
 * Auftrag T1.6 — Vanilla-JS-Port der DCLogic aus GalabauLanding.dc.html.
 *
 * Verhalten 1:1: Header-Scroll-State (>4px), IO-Reveals mit 80ms-Stagger,
 * KPI-Count-up (1200ms, ease-out cubic), BA-Slider (Pointer-Drag, Clamp 4–96,
 * einmaliger Hinweis-Wobble 50→65→50 über 1400ms), FAQ-Akkordeon (eins offen),
 * Demo-Formular. prefers-reduced-motion schaltet alle Animationen ab.
 * Nur transform/opacity/clip-path — kein Layout-Thrash.
 */

export function galabauJs(opts: { submitZiel?: string | null } = {}): string {
  const hatSubmitZiel = Boolean(opts.submitZiel)
  return `
(function(){
'use strict';
document.documentElement.classList.add('js');
var reduziert=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header: transparent auf Hero, Glas ab Scroll > 4px */
var kopf=document.querySelector('[data-kopf]');
if(kopf){
  var aufScroll=function(){kopf.classList.toggle('is-scrolled',window.scrollY>4)};
  window.addEventListener('scroll',aufScroll,{passive:true});
  aufScroll();
}

/* Reveals: IO threshold .15, Geschwister-Stagger 80ms, einmalig */
var rvs=document.querySelectorAll('.rv');
if(reduziert||!('IntersectionObserver' in window)){
  rvs.forEach(function(el){el.classList.add('sichtbar')});
}else{
  var io=new IntersectionObserver(function(eintraege){
    eintraege.forEach(function(e){
      if(!e.isIntersecting)return;
      var el=e.target;
      var geschwister=Array.prototype.filter.call(el.parentElement.children,function(k){return k.classList.contains('rv')});
      var i=geschwister.indexOf(el);
      if(i>0)el.style.transitionDelay=(i*80)+'ms';
      el.classList.add('sichtbar');
      io.unobserve(el);
    });
  },{threshold:.15});
  rvs.forEach(function(el){io.observe(el)});
}

/* KPI-Count-up: IO threshold .4, 1200ms, ease 1-(1-k)^3 */
var kpis=document.querySelectorAll('[data-kpi]');
function zaehle(el){
  var ziel=parseFloat(el.getAttribute('data-kpi'));
  var dez=el.hasAttribute('data-dezimal');
  var start=null;
  function schritt(t){
    if(start===null)start=t;
    var k=Math.min(1,(t-start)/1200);
    var e=1-Math.pow(1-k,3);
    var wert=ziel*e;
    el.textContent=dez?wert.toFixed(1).replace('.',','):String(Math.round(wert));
    if(k<1)requestAnimationFrame(schritt);
  }
  el.textContent=dez?'0,0':'0';
  requestAnimationFrame(schritt);
}
if(kpis.length&&!reduziert&&'IntersectionObserver' in window){
  var kio=new IntersectionObserver(function(eintraege){
    eintraege.forEach(function(e){
      if(!e.isIntersecting)return;
      kio.unobserve(e.target);
      zaehle(e.target);
    });
  },{threshold:.4});
  kpis.forEach(function(k){kio.observe(k)});
}

/* BA-Slider: clip-path + Teiler/Griff, Drag (Pointer = Maus+Touch), Clamp 4–96 */
var ba=document.querySelector('[data-ba]');
if(ba){
  var vorher=ba.querySelector('[data-ba-vorher]');
  var teiler=ba.querySelector('[data-ba-teiler]');
  var griff=ba.querySelector('[data-ba-griff]');
  var pos=50,zieht=false;
  var male=function(){
    vorher.style.clipPath='inset(0 '+(100-pos)+'% 0 0)';
    teiler.style.left=pos+'%';
    griff.style.left=pos+'%';
  };
  var setzePos=function(x){
    var r=ba.getBoundingClientRect();
    pos=Math.max(4,Math.min(96,(x-r.left)/r.width*100));
    male();
  };
  male();
  ba.addEventListener('pointerdown',function(e){zieht=true;setzePos(e.clientX);e.preventDefault()});
  window.addEventListener('pointermove',function(e){if(zieht)setzePos(e.clientX)});
  window.addEventListener('pointerup',function(){zieht=false});
  /* Einmaliger Hinweis-Wobble: pos = 50 + 15·sin(k·π), 1400ms, bricht bei Drag ab */
  if(!reduziert&&'IntersectionObserver' in window){
    var einmal=false;
    var bio=new IntersectionObserver(function(eintraege){
      eintraege.forEach(function(e){
        if(!e.isIntersecting||einmal)return;
        einmal=true;
        bio.unobserve(ba);
        var start=null;
        var wobble=function(t){
          if(zieht)return;
          if(start===null)start=t;
          var k=Math.min(1,(t-start)/1400);
          pos=50+15*Math.sin(k*Math.PI);
          male();
          if(k<1)requestAnimationFrame(wobble);
        };
        requestAnimationFrame(wobble);
      });
    },{threshold:.5});
    bio.observe(ba);
  }
}

/* FAQ: ein Eintrag offen (erneuter Klick schließt) */
var faqItems=document.querySelectorAll('[data-faq]');
faqItems.forEach(function(item){
  var btn=item.querySelector('button');
  if(!btn)return;
  btn.addEventListener('click',function(){
    var warOffen=item.classList.contains('offen');
    faqItems.forEach(function(x){x.classList.remove('offen')});
    if(!warOffen)item.classList.add('offen');
  });
});

/* Video-Hero: reduced-motion pausiert das Video (Poster bleibt) */
var heroVideo=document.querySelector('.hero-bg video');
if(heroVideo&&reduziert){heroVideo.removeAttribute('autoplay');heroVideo.pause();}

/* Kontakt-Formular${hatSubmitZiel ? ' (POST an Submit-Ziel; Browser übernimmt)' : ': Demo-Modus ohne Persistenz'} */
var form=document.querySelector('[data-kontakt-form]');
${hatSubmitZiel ? '' : `if(form){
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var ok=form.querySelector('[data-form-erfolg]');
    if(ok)ok.style.display='block';
    form.querySelectorAll('input,textarea,button').forEach(function(el){el.disabled=true});
  });
}`}
})();
`.trim()
}
