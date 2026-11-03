// Node 22+ e Chrome/Edge: teste real no navegador via Chrome DevTools Protocol.
import {spawn} from 'node:child_process';
import {mkdir,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
const base=process.argv[2]||'http://127.0.0.1:8000';
const chrome=process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile=path.join(os.tmpdir(),'forza-browser-'+Date.now());
const port=Number(process.env.FORZA_BROWSER_PORT)||19222;
const child=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,id=0,pending=new Map(),errors=[],created=false;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function send(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));setTimeout(()=>{if(pending.has(n)){pending.delete(n);reject(new Error('Timeout: '+method));}},method==='Runtime.evaluate'?120000:15000).unref();});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function wait(expression){for(let i=0;i<400;i++){try{if(await evaluate(expression))return;if(await evaluate("!!document.querySelector('#retry-page')"))break;}catch{}await pause(100);}throw new Error('Condição não satisfeita: '+expression+' '+JSON.stringify(await evaluate('({url:location.href,body:document.body?.innerText.slice(0,1500),html:document.documentElement.outerHTML.slice(-1200)})'))+' errors='+JSON.stringify(errors));}
async function navigate(page,selector){await send('Page.navigate',{url:base+'/frontend/'+page});await wait(`!!document.querySelector(${JSON.stringify(selector)})`);}
async function fill(selector,value){await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('Elemento ausente');e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);}
async function click(selector){await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);}
async function pointerClick(selector){const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('Link ausente');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});}
async function navClick(page,selector){const mobile=await evaluate('matchMedia("(max-width:767px)").matches');if(mobile){await pointerClick('#menu');await pause(250);}await pointerClick(`.sidebar nav a[href="${page}"]`);await wait(`location.pathname.endsWith(${JSON.stringify(page)}) && !!document.querySelector(${JSON.stringify(selector)}) && document.querySelector('#view')?.getAttribute('aria-busy')==='false'`);}
async function checkWidth(name){const widths=await evaluate('({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})');if(widths.scroll>widths.client+1)throw new Error(name+': overflow '+JSON.stringify(widths));}
async function screenshot(name){await pause(500);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile('artifacts/'+name+'.png',Buffer.from(r.data,'base64'));}
try{
 let pages;for(let i=0;i<100;i++){try{pages=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();break;}catch{await pause(100);}}
 if(!pages)throw new Error('Não foi possível iniciar o Chrome.');
 ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 ws.onmessage=e=>{const msg=JSON.parse(e.data);if(msg.id&&pending.has(msg.id)){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(new Error(JSON.stringify(msg.error))):p.resolve(msg.result);}else if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails.text+' '+JSON.stringify(msg.params.exceptionDetails.exception));};
 await send('Runtime.enable');await send('Page.enable');await mkdir('artifacts',{recursive:true});
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await navigate('index.html','.landing-hero');await checkWidth('landing desktop');await screenshot('landing-desktop');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await checkWidth('landing mobile');await screenshot('landing-mobile');
 await navigate('cadastro.html','#auth-form');
 await wait(`document.querySelector('#auth-form input[name=nome]')!==null`);await pause(300);
 await fill('[name=nome]','Pessoa navegador');await fill('[name=email]','forza-browser-'+Date.now()+'@example.test');await fill('[name=senha]','BrowserTeste!2026');await evaluate(`document.querySelector('#auth-form').requestSubmit()`);
 created=true;await wait(`!!document.querySelector('#profile')`);
 if(process.argv.includes('--design-review')) {
   console.log('Revisão visual: preparando registros na conta temporária.');
   await evaluate(`(async()=>{
     const {api}=await import('./assets/js/api.js');const {today}=await import('./assets/js/utils.js');
     await api('/auth/me');
     await api('/perfil','PUT',{nome:'Victor · conta de teste',idade:25,altura:178,peso:81.4,objetivo_id:2,nivel:'intermediario',dias_semana:4,minutos_treino:50,equipamentos:'Barra, halteres e banco',unidade_carga:'kg'});
     const exercises=await api('/exercicios');
     const names=['Supino reto','Remada com halteres','Desenvolvimento com halteres'];
     const selected=names.map((name,i)=>({exercicio_id:Number(exercises.find(e=>e.nome===name).id),series:3,repeticoes:i===0?10:12,carga:i===0?30:12,descanso:60}));
     const day=new Date(today()+'T12:00:00').getDay();
     const workout=await api('/treinos','POST',{nome:'Superiores · Força',dias:[day,(day+2)%7,(day+4)%7],exercicios:selected});
     const session=await api('/sessoes','POST',{treino_id:workout.id});
     const sessions=await api('/sessoes');const set=sessions.find(s=>Number(s.id)===Number(session.id)).series[0];
     await api('/sessoes/'+session.id+'/series/'+set.id,'PUT',{repeticoes:10,carga:30,concluida:1});await api('/sessoes/'+session.id+'/finalizar','POST',{});
     for(const [ago,peso] of [[60,83.1],[28,82.4],[21,82.1],[14,81.8],[7,81.7],[0,81.4]]){const dt=new Date(today()+'T12:00:00');dt.setDate(dt.getDate()-ago);await api('/pesos','POST',{data:dt.toLocaleDateString('en-CA'),peso});}
     await api('/refeicoes','POST',{nome:'Café da manhã',data:today(),alimentos:[{alimento_id:182,gramas:120},{alimento_id:469,gramas:80}]});
     await api('/refeicoes','POST',{nome:'Almoço',data:today(),alimentos:[{alimento_id:3,gramas:150},{alimento_id:561,gramas:100},{alimento_id:488,gramas:100}]});
   })()`);
   await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
   await navigate('dashboard.html','.dashboard-banner');await wait("document.querySelector('#view').getAttribute('aria-busy')==='false'");
   if(await evaluate("document.querySelectorAll('.dashboard-metric').length")!==4)throw new Error('Métricas ausentes');
   if(await evaluate("document.querySelectorAll('.exercise-line').length")!==3)throw new Error('Preview do treino ausente');
   if(await evaluate("document.querySelectorAll('.recommendation').length")!==3)throw new Error('Recomendações ausentes');
   if(await evaluate("document.querySelectorAll('.weight-point').length")!==5)throw new Error('Filtro inicial do gráfico incorreto');
   await click('[data-period="all"]');if(await evaluate("document.querySelectorAll('.weight-point').length")!==6)throw new Error('Filtro histórico falhou');await click('[data-period="30"]');
   async function captureFull(name){await pause(700);await evaluate('scrollTo(0,0)');const size=(await send('Page.getLayoutMetrics')).cssContentSize;const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:Math.ceil(size.width),height:Math.ceil(size.height),scale:1}});await writeFile('artifacts/'+name+'.png',Buffer.from(result.data,'base64'));}
   await captureFull('dashboard-redesign-desktop');
   for(const width of [320,390,768,1024,1280,1440,1920]){await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<768});await pause(150);await checkWidth('redesign '+width);const chartSizes=await evaluate("({view:document.querySelector('.weight-chart').viewBox.baseVal.width,box:document.querySelector('#dashboard-weight-chart').clientWidth})");if(Math.abs(chartSizes.view-chartSizes.box)>2)throw new Error('Gráfico não se adaptou à largura '+width);}
   await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await captureFull('dashboard-redesign-mobile');
   await navClick('treinos.html','#new-workout');await navClick('dashboard.html','.dashboard-banner');
   if(errors.length)throw new Error('Erros JavaScript: '+errors.join('\n'));
   console.log(JSON.stringify({status:'passed',fluxos:['dashboard com dados de conta temporária','quatro métricas','preview de três exercícios','três recomendações','filtro de peso 30 dias/histórico','sete larguras de 320 a 1920 px','navegação mobile','capturas desktop/mobile'],errosJavaScript:errors.length}));
 } else if(process.argv.includes('--without-profile')) {

   for(const [page,selector] of [['dashboard.html','.dashboard-banner'],['treinos.html','#new-workout'],['alimentacao.html','#new-meal'],['progresso.html','#weight-form'],['dicas.html','.tip-grid'],['perfil.html','#profile']]) {
     await navClick(page,selector);await checkWidth('sem perfil: '+page);
     if(page!=='perfil.html'&&!await evaluate("!!document.querySelector('.onboarding-notice')"))throw new Error('Aviso de perfil ausente');
   }
   await navClick('treinos.html','#new-workout');await click('#new-workout');await fill('#workout-form [name=nome]','Treino sem perfil completo');
   await evaluate("document.querySelector('#workout-form').requestSubmit()");await wait("document.querySelector('#workout-error')?.hidden===false");
   await click('[name=dia][value="2"]');await evaluate("document.querySelector('#workout-form').requestSubmit()");await wait("!!document.querySelector('[data-edit]')");
   await navigate('treinos.html','[data-edit]');
   if(!await evaluate("document.querySelector('#view').textContent.includes('Treino sem perfil completo')"))throw new Error('Treino não persistiu após recarregar');
   await evaluate(`(async()=>{const {api}=await import('./assets/js/api.js');const result=await Promise.all(['/treinos','/exercicios','/sessoes','/alimentos','/progresso','/dicas'].map(route=>api(route)));if(result.length!==6)throw new Error('Falha nas chamadas paralelas');})()`);
   if(errors.length)throw new Error('Erros JavaScript: '+errors.join('\n'));
   console.log(JSON.stringify({status:'passed',fluxos:['seis telas sem perfil completo','cliques reais no menu mobile','validação de dias','salvar treino sem perfil','persistência após recarregar','seis chamadas simultâneas ao Aiven'],errosJavaScript:errors.length}));
 } else {
 for(const [k,v] of Object.entries({idade:25,altura:175,peso:72,dias_semana:3,minutos_treino:45,equipamentos:'Halteres'}))await fill('#profile [name='+k+']',v);
 await evaluate(`document.querySelector('#profile').requestSubmit()`);await wait(`!!document.querySelector('.dashboard-banner')`);await checkWidth('dashboard mobile');await screenshot('dashboard-mobile');
 await click('#menu');if(!await evaluate(`document.querySelector('#menu').getAttribute('aria-expanded')==='true'`))throw new Error('Menu móvel falhou');await click('#menu');
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await checkWidth('dashboard desktop');await screenshot('dashboard-desktop');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await navClick('treinos.html','#new-workout');await click('#new-workout');await checkWidth('editor de treino mobile');await fill('#workout-form [name=nome]','Treino pelo navegador');await evaluate(`document.querySelector('#workout-form').requestSubmit()`);await wait(`document.querySelector('#workout-error')?.hidden===false`);await fill('#workout-form [name=nome]','Treino pelo navegador');await click('[name=dia][value="1"]');await evaluate(`document.querySelector('#workout-form').requestSubmit()`);await wait(`!!document.querySelector('[data-edit]')`);await click('a[href^="treino-detalhes.html?treino="]');await wait(`!!document.querySelector('#start-session')`);await click('#start-session');await wait(`!!document.querySelector('.session-set')`);await click('.session-set [type=checkbox]');await wait(`document.querySelector('#set-count').textContent.startsWith('1 /')`);
 // Confirmações explícitas em ambiente de teste automatizado.
 await evaluate('window.confirm=()=>true');await click('#finish-session');await wait(`document.querySelector('#view').textContent.includes('SESSÃO CONCLUÍDA')`);
 await navClick('alimentacao.html','#new-meal');await click('#new-meal');await checkWidth('editor de refeição mobile');await fill('#meal-form [name=nome]','Almoço navegador');await fill('#meal-form [name=gramas]',150);await evaluate(`document.querySelector('#meal-form').requestSubmit()`);await wait(`!!document.querySelector('[data-edit]')`);
 await navClick('progresso.html','#weight-form');await fill('#weight-form [name=peso]',72);await evaluate(`document.querySelector('#weight-form').requestSubmit()`);await wait(`!!document.querySelector('[data-delete^="pesos/"]')`);await checkWidth('progresso desktop');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await checkWidth('progresso mobile');await screenshot('progresso-mobile');
 await navClick('dicas.html','.tip-card');await checkWidth('dicas mobile');for(const width of [320,768,1024]){await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768});await navigate('dashboard.html','.dashboard-banner');await checkWidth('dashboard '+width);}
 await navClick('perfil.html','#profile');await navClick('treinos.html','#new-workout');if(errors.length)throw new Error('Erros JavaScript: '+errors.join('\n'));
 console.log(JSON.stringify({status:'passed',fluxos:['landing desktop/mobile','cadastro','onboarding','dashboard desktop/mobile','menu','criar treino','iniciar sessão','concluir série','finalizar treino','registrar refeição','registrar peso','progresso e dicas mobile'],errosJavaScript:errors.length}));
 }
}finally{
 if(created&&ws?.readyState===1){try{await evaluate(`(async()=>{const {api}=await import('./assets/js/api.js');await api('/auth/me');await api('/auth/conta','DELETE',{senha:'BrowserTeste!2026',confirmacao:'EXCLUIR'});})()`);}catch(e){console.error('Limpeza de conta falhou:',e.message);}}
 ws?.close();child.kill();await pause(300);if(path.dirname(path.resolve(profile))!==path.resolve(os.tmpdir())||!path.basename(profile).startsWith('forza-browser-'))throw new Error('Pasta temporária inválida');await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200}).catch(()=>{});
}
