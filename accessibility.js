/* תפריט נגישות מקומי; ללא שרת, התחברות או מעקב. */
(() => {
  const KEY='merhav-accessibility-v1';
  const defaults={scale:100,contrast:false,links:false,readable:false,motion:false};
  const widget=document.createElement('div');
  widget.className='a11y-widget';
  widget.innerHTML=[
    '<button class="a11y-trigger" type="button" id="a11y-trigger" aria-label="פתיחת אפשרויות נגישות" aria-expanded="false" aria-controls="a11y-panel" title="נגישות">',
    '<svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="18" cy="22" r="11"/><path d="M5 12h26M18 13v9l-6 11M18 22l8 11"/></svg></button>',
    '<section class="a11y-panel" id="a11y-panel" role="dialog" aria-labelledby="a11y-title" aria-modal="false" hidden>',
    '<div class="a11y-panel-head"><strong id="a11y-title">אפשרויות נגישות</strong><button type="button" class="a11y-close" id="a11y-close" aria-label="סגירת אפשרויות נגישות">×</button></div>',
    '<div class="a11y-panel-body"><fieldset class="a11y-text-size"><legend>גודל הטקסט</legend>',
    '<div class="a11y-text-row"><button type="button" id="a11y-smaller" aria-label="הקטנת טקסט">א−</button><output id="a11y-scale" aria-live="polite">100%</output><button type="button" id="a11y-larger" aria-label="הגדלת טקסט">א+</button></div></fieldset>',
    '<div class="a11y-options"><button type="button" data-a11y="contrast" aria-pressed="false">ניגודיות גבוהה</button>',
    '<button type="button" data-a11y="links" aria-pressed="false">הדגשת קישורים</button>',
    '<button type="button" data-a11y="readable" aria-pressed="false">גופן קריא</button>',
    '<button type="button" data-a11y="motion" aria-pressed="false">הפחתת אנימציות</button></div>',
    '<button type="button" class="a11y-reset" id="a11y-reset">איפוס הגדרות</button>',
    '<p class="a11y-note">אפשר להשתמש באתר גם עם מקלדת. עזרי התצוגה כאן אינם מחליפים הגדרות נגישות בדפדפן או במערכת ההפעלה.</p></div></section>'
  ].join('');
  document.body.appendChild(widget);
  const trigger=widget.querySelector('#a11y-trigger');
  const panel=widget.querySelector('#a11y-panel');
  const close=widget.querySelector('#a11y-close');
  const scaleText=widget.querySelector('#a11y-scale');
  const optionButtons=[...widget.querySelectorAll('[data-a11y]')];
  const textSelector='main h1,main h2,main h3,main h4,main p,main li,main a,main small,main summary,main .eyebrow,main .platform-name,main .platform-sub,main .hero__trial,main .hero__meta,main .step__no,header a,header b,header small,footer a,footer b,footer strong,footer div';
  const textNodes=[...document.querySelectorAll(textSelector)];
  const baseSizes=new Map(textNodes.map(el=>[el,el.style.fontSize]));
  const load=()=>{try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{return {...defaults};}};
  let state=load();
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
  function setOpen(value,focus=true){
    panel.hidden=!value;
    trigger.setAttribute('aria-expanded',String(value));
    trigger.setAttribute('aria-label',value?'סגירת אפשרויות נגישות':'פתיחת אפשרויות נגישות');
    if(focus)(value?close:trigger).focus();
  }
  function updateTextSize(){
    textNodes.forEach(el=>{el.style.fontSize=baseSizes.get(el)||'';});
    if(state.scale!==100)textNodes.forEach(el=>{
      const initial=parseFloat(getComputedStyle(el).fontSize);
      if(Number.isFinite(initial))el.style.fontSize=(Math.round(initial*state.scale)/100).toFixed(2)+'px';
    });
    scaleText.textContent=state.scale+'%';
    widget.querySelector('#a11y-smaller').disabled=state.scale<=90;
    widget.querySelector('#a11y-larger').disabled=state.scale>=150;
  }
  function apply(){
    state.scale=Math.min(150,Math.max(90,Math.round(Number(state.scale)||100)/10*10));
    for(const [key,klass] of Object.entries({contrast:'a11y-contrast',links:'a11y-highlight-links',readable:'a11y-readable-font',motion:'a11y-reduced-motion'}))
      document.documentElement.classList.toggle(klass,Boolean(state[key]));
    optionButtons.forEach(btn=>btn.setAttribute('aria-pressed',String(Boolean(state[btn.dataset.a11y]))));
    updateTextSize(); save();
  }
  trigger.addEventListener('click',()=>setOpen(panel.hidden));
  close.addEventListener('click',()=>setOpen(false));
  widget.querySelector('#a11y-larger').addEventListener('click',()=>{state.scale+=10;apply();});
  widget.querySelector('#a11y-smaller').addEventListener('click',()=>{state.scale-=10;apply();});
  optionButtons.forEach(btn=>btn.addEventListener('click',()=>{state[btn.dataset.a11y]=!state[btn.dataset.a11y];apply();}));
  widget.querySelector('#a11y-reset').addEventListener('click',()=>{state={...defaults};apply();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)setOpen(false);});
  document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!widget.contains(e.target))setOpen(false,false);});
  const footer=document.querySelector('.footer-links');
  if(footer){
    const button=document.createElement('button');
    button.type='button';button.className='footer-accessibility';button.textContent='אפשרויות נגישות';
    button.addEventListener('click',()=>setOpen(true));
    footer.appendChild(button);
  }
  let pending=false;
  window.addEventListener('resize',()=>{
    if(pending)return;pending=true;
    requestAnimationFrame(()=>{pending=false;if(state.scale!==100)updateTextSize();});
  },{passive:true});
  apply();
})();