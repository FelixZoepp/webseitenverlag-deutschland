/**
 * Flagship-Engine: JS-Generator (~3 KB vanilla IIFE, Muster aus den Flagships).
 * Bausteine: Nav-Scroll, IO-Reveals, Counter (mit Startwert), Signature-Scroll,
 * BA-Slider, Ablauf-Stepper (Auto-Advance), Hero-Highlight-Delay.
 */

import type { AblaufInhalt } from './types'
import { esc } from './html'

const ICON_STROKE = '1.8'

export function flagshipJs(opts: { ablauf?: AblaufInhalt; hatBaSlider: boolean; iconPfade?: Record<string, string> }): string {
  const teile: string[] = []

  teile.push(`var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav */
  var nav=document.getElementById('nav');
  addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>24)},{passive:true});

  /* Reveals + Counter-Start */
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        e.target.querySelectorAll('[data-count]').forEach(count);
        io.unobserve(e.target);
      }
    });
  },{threshold:.18});
  document.querySelectorAll('.rv,.zgrid').forEach(function(el){io.observe(el)});

  function count(el){
    if(el.dataset.done)return; el.dataset.done=1;
    var end=+el.dataset.count, start=+el.textContent||0, t0=null, dur=1400;
    if(reduced){el.textContent=end;return}
    requestAnimationFrame(function step(t){
      if(!t0)t0=t; var p=Math.min((t-t0)/dur,1);
      el.textContent=Math.round(start+(end-start)*(1-Math.pow(1-p,3)));
      if(p<1)requestAnimationFrame(step);
    });
  }

  /* Signature-Scroll */
  var sig=document.getElementById('sig'),
      sigLay=document.getElementById('sigLayer'),
      sigKante=document.getElementById('sigKante');
  if(!reduced && sig){
    function sweep(){
      var r=sig.getBoundingClientRect();
      var total=r.height-innerHeight;
      var p=Math.min(Math.max(-r.top/total,0),1);
      var pct=(p*100).toFixed(2);
      sigLay.style.clipPath='inset(0 '+(100-pct)+'% 0 0)';
      sigKante.style.width=pct+'%';
    }
    addEventListener('scroll',sweep,{passive:true});
    addEventListener('resize',sweep); sweep();
  }`)

  if (opts.hatBaSlider) {
    teile.push(`
  /* Vorher/Nachher-Slider */
  document.querySelectorAll('[data-ba]').forEach(function(ba){
    var after=ba.querySelector('.after'),handle=ba.querySelector('.handle'),drag=false;
    function setP(x){
      var r=ba.getBoundingClientRect();
      var p=Math.min(Math.max((x-r.left)/r.width,0),1)*100;
      after.style.clipPath='inset(0 0 0 '+p+'%)';
      handle.style.left=p+'%';
    }
    ba.addEventListener('pointerdown',function(e){drag=true;ba.setPointerCapture(e.pointerId);setP(e.clientX)});
    ba.addEventListener('pointermove',function(e){if(drag)setP(e.clientX)});
    ba.addEventListener('pointerup',function(){drag=false});
  });`)
  }

  if (opts.ablauf && opts.iconPfade) {
    const pdata = opts.ablauf.schritte.map((s) => ({
      t: esc(s.titel),
      x: esc(s.text),
      b: esc(s.badge),
      i: opts.iconPfade![s.icon] || '',
    }))
    teile.push(`
  /* Ablauf-Stepper */
  var pdata=${JSON.stringify(pdata)};
  var pcard=document.getElementById('prozCard'),pline=document.getElementById('prozLine'),
      psteps=[].slice.call(document.querySelectorAll('.pstep')),pauto=null,pi=0;
  function pshow(i){
    pi=i; var d=pdata[i];
    pcard.classList.remove('swap'); void pcard.offsetWidth;
    pcard.innerHTML='<div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${ICON_STROKE}">'+d.i+'</svg></div><h3>'+d.t+'</h3><p>'+d.x+'</p><span class="t">'+d.b+'</span>';
    pcard.classList.add('swap');
    psteps.forEach(function(b,j){b.classList.toggle('active',j===i);b.classList.toggle('done',j<i)});
    pline.style.width=(i/(pdata.length-1)*100)+'%';
  }
  psteps.forEach(function(b){b.addEventListener('click',function(){clearInterval(pauto);pshow(+b.dataset.step)})});
  if(!reduced){
    var pio=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          pauto=setInterval(function(){pshow((pi+1)%pdata.length)},4200);
          pio.disconnect();
        }
      });
    },{threshold:.4});
    pio.observe(document.getElementById('ablauf'));
  }`)
  }

  teile.push(`
  /* Highlight-Wipes im Hero sofort */
  document.querySelectorAll('.hero .hl, .vhero .hl').forEach(function(h){setTimeout(function(){h.classList.add('on')},300)});

  /* Video-Hero */
  var hv=document.getElementById('heroVideo');
  var vplay=document.querySelector('.vplay');
  if(reduced&&hv){hv.pause();hv.removeAttribute('autoplay');if(vplay)vplay.classList.add('hidden')}

  /* Play-Button: hide after autoplay starts, click to play */
  if(hv&&vplay&&!reduced){
    hv.addEventListener('playing',function(){vplay.classList.add('hidden')});
    vplay.addEventListener('click',function(){hv.play()});
    /* If autoplay blocked by browser, keep button visible */
    var pp=hv.play();if(pp&&pp.catch)pp.catch(function(){vplay.classList.remove('hidden')});
  }

  /* Scroll-Scrub: tie video progress to scroll position */
  if(!reduced&&hv&&hv.closest('.scrub')){
    hv.pause();
    function scrubV(){
      var hero=hv.closest('.vhero');
      var r=hero.getBoundingClientRect();
      var total=r.height-innerHeight;
      if(total<=0)return;
      var p=Math.min(Math.max(-r.top/total,0),1);
      if(hv.duration)hv.currentTime=p*hv.duration;
    }
    addEventListener('scroll',scrubV,{passive:true});
    hv.addEventListener('loadedmetadata',scrubV);
  }`)


  return `(function(){\n  ${teile.join('\n')}\n})();`
}

/** Wizard-JS der Funnel-Seite: Schritt-Navigation, Validierung, Submit */
export function funnelJs(opts: { submitZiel: string | null; formType: 'anfrage' | 'reservierung' }): string {
  const ziel = opts.submitZiel ? JSON.stringify(opts.submitZiel) : 'null'
  return `(function(){
  var schritte=[].slice.call(document.querySelectorAll('.fschritt')),
      balken=document.getElementById('fbalken'),
      daten={},aktiv=0;

  function zeige(i){
    aktiv=i;
    schritte.forEach(function(s,j){s.classList.toggle('aktiv',j===i)});
    balken.style.width=((i+1)/schritte.length*100)+'%';
    window.scrollTo({top:0,behavior:'smooth'});
  }

  document.querySelectorAll('.opt').forEach(function(o){
    o.addEventListener('click',function(){
      var gruppe=o.closest('.optionen');
      gruppe.querySelectorAll('.opt').forEach(function(x){x.classList.remove('gewaehlt')});
      o.classList.add('gewaehlt');
      var inp=o.querySelector('input'); if(inp)inp.checked=true;
    });
  });

  function sammle(schritt){
    schritt.querySelectorAll('input,select,textarea').forEach(function(f){
      if(!f.name)return;
      if(f.type==='radio'){ if(f.checked)daten[f.name]=f.value; }
      else if(f.type==='checkbox'){ daten[f.name]=f.checked; }
      else daten[f.name]=f.value.trim();
    });
  }

  function pruefe(schritt){
    var ok=true;
    var fehler=schritt.querySelector('.fehler');
    schritt.querySelectorAll('[data-pflicht]').forEach(function(f){
      var leer;
      if(f.type==='radio'){
        leer=!schritt.querySelector('input[name="'+f.name+'"]:checked');
      }else if(f.type==='checkbox'){ leer=!f.checked; }
      else{ leer=!f.value.trim(); }
      if(f.type==='email'&&f.value&&f.value.indexOf('@')<0)leer=true;
      if(leer){ok=false}
    });
    if(fehler)fehler.classList.toggle('zeigen',!ok);
    return ok;
  }

  document.querySelectorAll('[data-weiter]').forEach(function(b){
    b.addEventListener('click',function(){
      var schritt=schritte[aktiv];
      if(!pruefe(schritt))return;
      sammle(schritt);
      zeige(aktiv+1);
    });
  });
  document.querySelectorAll('[data-zurueck]').forEach(function(b){
    b.addEventListener('click',function(){zeige(Math.max(aktiv-1,0))});
  });

  var senden=document.getElementById('fsenden');
  if(senden)senden.addEventListener('click',function(){
    var schritt=schritte[aktiv];
    if(!pruefe(schritt))return;
    sammle(schritt);
    senden.disabled=true;
    var ziel=${ziel};
    var kontakt={name:daten.name||'',email:daten.email||'',phone:daten.telefon||'',message:daten.nachricht||''};
    var quali={};
    Object.keys(daten).forEach(function(k){
      if(['name','email','telefon','nachricht','dsgvo'].indexOf(k)<0)quali[k]=daten[k];
    });
    function fertig(){zeige(schritte.length-1)}
    if(!ziel){setTimeout(fertig,400);return}
    fetch(ziel,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        name:kontakt.name,email:kontakt.email,phone:kontakt.phone,message:kontakt.message,
        form_type:'${opts.formType}',qualifizierung:quali
      })
    }).then(fertig).catch(function(){senden.disabled=false;
      var f=schritte[aktiv].querySelector('.fehler');
      if(f){f.textContent='Senden fehlgeschlagen – bitte erneut versuchen oder anrufen.';f.classList.add('zeigen')}
    });
  });

  zeige(0);
})();`
}
