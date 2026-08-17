
const KEY='equilibre-v2a';
const D={startDate:new Date().toISOString(),meals:[],workouts:[],weights:[{date:new Date().toISOString(),value:55}],measurements:[],wellbeing:{},supplements:{},progressPhotos:[]};
let data=JSON.parse(localStorage.getItem(KEY)||'null')||D;
const $=id=>document.getElementById(id), today=()=>new Date().toISOString().slice(0,10), save=()=>{localStorage.setItem(KEY,JSON.stringify(data));render()};
const weekStart=()=>{const d=new Date(),n=(d.getDay()+6)%7;d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d};
const thisWeek=iso=>new Date(iso)>=weekStart();
const esc=s=>(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

const titles={today:'Aujourd’hui',food:'Alimentation',coach:'Coach',sport:'Sport',progress:'Progression'};
function go(name){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===name));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));$('pageTitle').textContent=titles[name];window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>go(b.dataset.tab));
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));

function coachState(w,m,wb){
 if(w>=2)return['Objectif sportif atteint ✨','Tout ce que tu fais en plus est du bonus. Pas besoin de compenser quoi que ce soit.'];
 if(m===0)return['Commence petit.','Une seule action utile aujourd’hui suffit : noter un repas, marcher un peu ou planifier ta prochaine séance.'];
 if(wb&&wb.energy<=2)return['Ton énergie est basse aujourd’hui.','Une séance courte ou du repos peut être plus cohérent qu’un gros effort forcé.'];
 return['Tu construis ta routine.','Le plus important n’est pas d’être parfaite aujourd’hui, mais de pouvoir recommencer demain.'];
}
function recipes(meals){
 const p=meals.some(m=>m.protein),v=meals.some(m=>m.veg),c=meals.some(m=>m.carb),a=[];
 if(!p)a.push(['Omelette feta & salade','Rapide · 10 min','Une vraie source de protéines, simple et rapide.']);
 if(!v)a.push(['Poulet, légumes rôtis & semoule','Équilibré · 25 min','Beaucoup de légumes, des protéines et un féculent modulable selon ta faim.']);
 if(!c)a.push(['Saumon, pommes de terre & haricots verts','Complet · 30 min','Une option rassasiante et équilibrée.']);
 a.push(['Pâtes courgettes, poulet & parmesan','Réconfortant · 20 min','Crémeux, simple et facile à adapter.'],['Bowl riz, avocat, œuf & crudités','Frais · 15 min','Pratique et modulable.'],['Wrap poulet & légumes','Express · 12 min','Rapide, léger et rassasiant.']);
 return a.slice(0,3);
}
function drawWeight(ws){
 const c=$('weightChart'),x=c.getContext('2d'),w=c.width,h=c.height;x.clearRect(0,0,w,h);x.strokeStyle='#ded7cd';x.lineWidth=2;x.beginPath();x.moveTo(24,h-30);x.lineTo(w-24,h-30);x.stroke();
 if(ws.length<2)return;const vals=ws.map(o=>o.value),min=Math.min(...vals)-.5,max=Math.max(...vals)+.5,pts=vals.map((v,i)=>({x:35+i*(w-70)/(vals.length-1),y:22+(max-v)*(h-70)/(max-min)}));
 x.strokeStyle='#786e60';x.lineWidth=5;x.lineCap='round';x.lineJoin='round';x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));x.stroke();x.fillStyle='#24211d';pts.forEach(p=>{x.beginPath();x.arc(p.x,p.y,5,0,Math.PI*2);x.fill()})
}
function render(){
 const now=new Date(),days=Math.max(0,Math.floor((now-new Date(data.startDate))/86400000)),ww=data.workouts.filter(w=>thisWeek(w.date)),tm=data.meals.filter(m=>m.date.slice(0,10)===today()),supp=data.supplements[today()]||{},routine=['creatine','magnesium'].filter(k=>supp[k]).length,wb=data.wellbeing[today()];
 $('dateLabel').textContent=now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});$('weekNumber').textContent=Math.min(4,Math.floor(days/7)+1);
 const pct=Math.min(100,Math.round((Math.min(ww.length,2)/2)*70+Math.min(tm.length,3)/3*20+routine/2*10));
 $('weeklyWorkoutText').textContent=`${ww.length}/2`;$('weekPercent').textContent=`${pct}%`;$('weekRing').style.background=`conic-gradient(var(--accent) ${pct*3.6}deg,var(--soft) ${pct*3.6}deg)`;
 $('todayMeals').textContent=tm.length;$('todayRoutine').textContent=`${routine}/2`;$('todayMood').textContent=wb?`${wb.mood}/5`:'—';
 if(wb)['energy','mood','sleep'].forEach(k=>{$(k).value=wb[k];$(k+'Val').textContent=`${wb[k]}/5`});
 document.querySelectorAll('.routine').forEach(b=>{const d=!!supp[b.dataset.supp];b.classList.toggle('done',d);b.querySelector('i').textContent=d?'✓':'○'});
 $('proteinMeals').textContent=tm.filter(m=>m.protein).length;$('vegMeals').textContent=tm.filter(m=>m.veg).length;$('carbMeals').textContent=tm.filter(m=>m.carb).length;$('foodCountLabel').textContent=`${tm.length} repas`;
 $('mealList').innerHTML=tm.length?tm.slice().reverse().map(m=>`<div class="mealItem"><div class="mealTop"><b>${m.type}</b><small>${new Date(m.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</small></div>${m.photo?`<img class="mealPhoto" src="${m.photo}">`:''}<p>${esc(m.text)}</p><div class="tags">${m.protein?'<span class="tag">Protéines</span>':''}${m.veg?'<span class="tag">Végétaux</span>':''}${m.carb?'<span class="tag">Féculents</span>':''}<span class="tag">Satiété ${m.satiety}/5</span></div></div>`).join(''):'<div class="empty">Aucun repas noté aujourd’hui.</div>';
 $('recipeIdeas').innerHTML=recipes(tm).map(r=>`<div class="recipe"><b>${r[0]}</b><small>${r[1]}</small><p>${r[2]}</p></div>`).join('');
 $('sportWeekTitle').textContent=`${ww.length}/2 séances`;$('sportStatusBadge').textContent=ww.length>=2?'Objectif atteint ✨':ww.length===1?'Encore 1':'À commencer';$('sportProgress').style.width=`${Math.min(100,ww.length/2*100)}%`;
 $('workoutList').innerHTML=data.workouts.length?data.workouts.slice().reverse().slice(0,8).map(w=>`<div class="mealItem"><b>${w.type}</b><p>${new Date(w.date).toLocaleDateString('fr-FR')} · ${w.duration} min · ${w.feeling}</p></div>`).join(''):'<div class="empty">Aucune séance enregistrée.</div>';
 const ws=data.weights.slice(-10);$('latestWeight').textContent=ws.length?`${ws.at(-1).value.toFixed(1)} kg`:'—';$('totalWorkouts').textContent=data.workouts.length;
 const active=new Set([...data.meals.map(x=>x.date.slice(0,10)),...data.workouts.map(x=>x.date.slice(0,10)),...Object.keys(data.supplements)]);$('consistency').textContent=`${Math.min(100,Math.round(active.size/Math.max(1,days+1)*100))}%`;drawWeight(ws);
 const lm=data.measurements.at(-1);$('latestWaist').textContent=lm?.waist?`${lm.waist} cm`:'—';$('latestHips').textContent=lm?.hips?`${lm.hips} cm`:'—';$('latestThigh').textContent=lm?.thigh?`${lm.thigh} cm`:'—';
 $('progressPhotos').innerHTML=(data.progressPhotos||[]).slice(-6).reverse().map(p=>`<img src="${p.data}">`).join('');$('sinceText').textContent=days<3?'Tes progrès apparaîtront ici avec le temps.':`${days+1} jours de suivi · ${data.workouts.length} séance${data.workouts.length>1?'s':''} · ${data.meals.length} repas notés.`;
 const cs=coachState(ww.length,tm.length,wb);$('coachPreviewTitle').textContent=cs[0];$('coachPreviewText').textContent=cs[1];$('coachMainTitle').textContent=cs[0];$('coachMainText').textContent=cs[1];
}
['energy','mood','sleep'].forEach(k=>$(k).oninput=e=>$(k+'Val').textContent=`${e.target.value}/5`);
$('saveWellbeing').onclick=()=>{data.wellbeing[today()]={energy:+$('energy').value,mood:+$('mood').value,sleep:+$('sleep').value};save()};
document.querySelectorAll('.routine').forEach(b=>b.onclick=()=>{data.supplements[today()]=data.supplements[today()]||{};data.supplements[today()][b.dataset.supp]=!data.supplements[today()][b.dataset.supp];save()});
const fileData=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
['quickMeal','addMealText','addMealPhoto'].forEach(id=>$(id).onclick=()=>$('mealDialog').showModal());
$('saveMeal').onclick=async()=>{const f=$('mealPhotoInput').files[0],text=$('mealText').value.trim();if(!f&&!text)return;data.meals.push({date:new Date().toISOString(),type:$('mealType').value,text,photo:f?await fileData(f):null,protein:$('mealProtein').checked,veg:$('mealVeg').checked,carb:$('mealCarb').checked,satiety:+$('satiety').value});$('mealText').value='';$('mealPhotoInput').value='';$('mealProtein').checked=$('mealVeg').checked=$('mealCarb').checked=false;$('mealDialog').close();save()};
$('quickWorkout').onclick=$('openCustomWorkout').onclick=()=>$('workoutDialog').showModal();document.querySelectorAll('.addProgram').forEach(b=>b.onclick=()=>{data.workouts.push({date:new Date().toISOString(),type:b.dataset.program,duration:40,feeling:'Bien'});save()});$('saveWorkout').onclick=()=>{data.workouts.push({date:new Date().toISOString(),type:$('workoutType').value,duration:+$('workoutDuration').value,feeling:$('workoutFeeling').value});$('workoutDialog').close();save()};
$('openWeight').onclick=()=>$('weightDialog').showModal();$('saveWeight').onclick=()=>{const v=+$('weightInput').value;if(v){data.weights.push({date:new Date().toISOString(),value:v});$('weightDialog').close();save()}};
$('openMeasure').onclick=()=>$('measureDialog').showModal();$('saveMeasure').onclick=()=>{data.measurements.push({date:new Date().toISOString(),waist:+$('waistInput').value||null,hips:+$('hipsInput').value||null,thigh:+$('thighInput').value||null});$('measureDialog').close();save()};
$('addProgressPhoto').onclick=()=>$('progressPhotoInput').click();$('progressPhotoInput').onchange=async()=>{const f=$('progressPhotoInput').files[0];if(!f)return;data.progressPhotos.push({date:new Date().toISOString(),data:await fileData(f)});$('progressPhotoInput').value='';save()};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());

function reply(t){
 t=t.toLowerCase();const w=data.workouts.filter(x=>thisWeek(x.date)).length,m=data.meals.filter(x=>x.date.slice(0,10)===today()).length;
 if(t.includes('motivation')||t.includes('zéro')||t.includes('zero'))return w>=2?'Ton objectif est déjà atteint cette semaine. Bouge seulement si ça te fait du bien.':'Fais une version courte : 25 à 30 minutes. Ton seul objectif est de commencer.';
 if(t.includes('faim'))return 'Si tu as faim, mange. Cherche une source de protéines + un féculent ou du pain + un fruit ou des légumes selon ton envie.';
 if(t.includes('resto'))return 'Au restaurant, choisis ce qui te fait envie et cherche juste une vraie source de protéines avec un accompagnement rassasiant. Pas besoin de compenser.';
 if(t.includes('30'))return 'En 30 min : 5 min d’échauffement, presse, tirage vertical, hip thrust, chest press, puis gainage.';
 if(t.includes('semaine'))return `Tu as ${w} séance${w>1?'s':''} cette semaine sur 2, et ${m} repas noté${m>1?'s':''} aujourd’hui.`;
 if(t.includes('sucré')||t.includes('sucre'))return 'Une envie de sucré n’est pas un problème à corriger. Si tu as faim, prends une vraie collation ; sinon tu peux aussi simplement manger quelque chose de sucré.';
 return 'Je peux déjà t’aider sur la motivation, la faim, une séance courte, le restaurant ou faire le point sur ta semaine. Le vrai coach IA arrive ensuite.';
}
function push(role,text){const d=document.createElement('div');d.className=`bubble ${role}`;d.textContent=text;$('chatMessages').appendChild(d);$('chatMessages').scrollTop=$('chatMessages').scrollHeight}
document.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>{push('user',b.textContent);push('assistant',reply(b.textContent))});$('sendCoach').onclick=()=>{const t=$('coachInput').value.trim();if(!t)return;push('user',t);push('assistant',reply(t));$('coachInput').value=''};$('coachInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('sendCoach').click()}};
$('refreshIdeas').onclick=render;
render();
