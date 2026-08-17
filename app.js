
const storeKey = 'equilibre-oceane-v1';

const initial = {
  startDate: new Date().toISOString(),
  meals: [],
  workouts: [],
  weights: [{date:new Date().toISOString(), value:55}],
  supplements: {},
  wellbeing: {}
};

let data = JSON.parse(localStorage.getItem(storeKey) || 'null') || initial;
const save = () => { localStorage.setItem(storeKey, JSON.stringify(data)); render(); };

const todayKey = () => new Date().toISOString().slice(0,10);
const startOfWeek = d => {
  const x = new Date(d); const day = (x.getDay()+6)%7;
  x.setHours(0,0,0,0); x.setDate(x.getDate()-day); return x;
};
const isThisWeek = iso => new Date(iso) >= startOfWeek(new Date());

function render(){
  const now = new Date();
  document.getElementById('dateLabel').textContent = now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  const days = Math.max(0, Math.floor((now-new Date(data.startDate))/(1000*60*60*24)));
  document.getElementById('weekNumber').textContent = Math.min(4, Math.floor(days/7)+1);

  const weekWorkouts = data.workouts.filter(w=>isThisWeek(w.date));
  const todayMeals = data.meals.filter(m=>m.date.slice(0,10)===todayKey());
  const supp = data.supplements[todayKey()] || {};
  const suppCount = ['creatine','magnesium','isolate'].filter(k=>supp[k]).length;

  document.getElementById('workoutCount').textContent = `${weekWorkouts.length}/2`;
  document.getElementById('mealCount').textContent = todayMeals.length;
  document.getElementById('routineCount').textContent = `${suppCount}/3`;

  const score = Math.min(100, Math.round((Math.min(weekWorkouts.length,2)/2)*55 + Math.min(todayMeals.length,3)/3*25 + suppCount/3*20));
  document.getElementById('weekScore').textContent = `${score}%`;
  document.getElementById('weekRing').style.background = `conic-gradient(var(--accent) ${score*3.6}deg, var(--soft) ${score*3.6}deg)`;

  document.getElementById('mealList').innerHTML = todayMeals.length ? todayMeals.slice().reverse().map(m=>`
    <div class="meal-item">
      <div class="meal-top"><strong>${m.type}</strong><small>${new Date(m.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</small></div>
      <p>${escapeHtml(m.text)}</p>
      <div class="tags">
        ${m.protein?'<span class="tag">Protéines ✓</span>':''}
        ${m.veg?'<span class="tag">Végétaux ✓</span>':''}
        ${m.carb?'<span class="tag">Féculents ✓</span>':''}
        <span class="tag">Satiété ${m.satiety}/5</span>
      </div>
    </div>`).join('') : '<div class="empty">Aucun repas noté aujourd’hui. Tu peux commencer quand tu veux.</div>';

  document.getElementById('sportHeadline').textContent =
    weekWorkouts.length===0 ? '0 séance cette semaine' : `${weekWorkouts.length} séance${weekWorkouts.length>1?'s':''} cette semaine`;
  document.getElementById('sportBadge').textContent =
    weekWorkouts.length>=2 ? 'Objectif atteint ✨' : weekWorkouts.length===1 ? 'Encore 1' : 'À commencer';
  document.getElementById('sportProgress').style.width = `${Math.min(100,weekWorkouts.length/2*100)}%`;
  document.getElementById('workoutList').innerHTML = weekWorkouts.slice(-3).reverse().map(w=>`
    <div class="history-item"><span>${w.type}<br><small>${w.duration} min · ${w.feeling}</small></span><span>✓</span></div>`).join('');

  document.querySelectorAll('.check-card').forEach(btn=>{
    const key=btn.dataset.supp; const done=!!supp[key];
    btn.classList.toggle('done',done); btn.querySelector('b').textContent=done?'✓':'○';
  });

  const weights = data.weights.slice(-8);
  document.getElementById('latestWeight').textContent = weights.length ? `${weights.at(-1).value.toFixed(1)} kg` : '—';
  if(weights.length>=2){
    const diff=weights.at(-1).value-weights[0].value;
    document.getElementById('weightTrend').textContent = `${diff>0?'+':''}${diff.toFixed(1)} kg`;
  } else document.getElementById('weightTrend').textContent='—';

  const activeDays = new Set([
    ...data.meals.map(x=>x.date.slice(0,10)),
    ...data.workouts.map(x=>x.date.slice(0,10)),
    ...Object.keys(data.supplements).filter(k=>Object.values(data.supplements[k]).some(Boolean))
  ]);
  document.getElementById('consistency').textContent = `${Math.min(100, Math.round(activeDays.size/Math.max(1,days+1)*100))}%`;

  drawChart(weights);

  const wb = data.wellbeing[todayKey()];
  if(wb){
    ['energy','mood','sleep'].forEach(k=>{
      document.getElementById(k).value=wb[k];
      document.getElementById(k+'Val').textContent=wb[k]+'/5';
    });
  }
}

function drawChart(weights){
  const c=document.getElementById('weightChart'), ctx=c.getContext('2d');
  const w=c.width,h=c.height; ctx.clearRect(0,0,w,h);
  ctx.strokeStyle='#ded7cd'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(20,h-28); ctx.lineTo(w-20,h-28); ctx.stroke();
  if(weights.length<2) return;
  const vals=weights.map(x=>x.value), min=Math.min(...vals)-.5, max=Math.max(...vals)+.5;
  const pts=vals.map((v,i)=>({x:30+i*(w-60)/(vals.length-1),y:20+(max-v)*(h-60)/(max-min)}));
  ctx.strokeStyle='#776f61'; ctx.lineWidth=5; ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.stroke();
  ctx.fillStyle='#25231f'; pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill()});
}

const escapeHtml=s=>s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

['energy','mood','sleep'].forEach(k=>{
  document.getElementById(k).addEventListener('input',e=>document.getElementById(k+'Val').textContent=e.target.value+'/5');
});
document.getElementById('saveWellbeing').onclick=()=>{
  data.wellbeing[todayKey()] = {
    energy:+document.getElementById('energy').value,
    mood:+document.getElementById('mood').value,
    sleep:+document.getElementById('sleep').value
  }; save();
};

const mealDialog=document.getElementById('mealDialog');
document.getElementById('openMeal').onclick=()=>mealDialog.showModal();
document.getElementById('saveMeal').onclick=()=>{
  const text=document.getElementById('mealText').value.trim();
  if(!text) return;
  data.meals.push({
    date:new Date().toISOString(),
    type:document.getElementById('mealType').value,
    text,
    protein:document.getElementById('mealProtein').checked,
    veg:document.getElementById('mealVeg').checked,
    carb:document.getElementById('mealCarb').checked,
    satiety:+document.getElementById('satiety').value
  });
  document.getElementById('mealText').value='';
  ['mealProtein','mealVeg','mealCarb'].forEach(id=>document.getElementById(id).checked=false);
  mealDialog.close(); save();
};

const workoutDialog=document.getElementById('workoutDialog');
document.getElementById('openWorkout').onclick=()=>workoutDialog.showModal();
document.getElementById('saveWorkout').onclick=()=>{
  data.workouts.push({
    date:new Date().toISOString(),
    type:document.getElementById('workoutType').value,
    duration:+document.getElementById('workoutDuration').value,
    feeling:document.getElementById('workoutFeeling').value
  });
  workoutDialog.close(); save();
};

document.querySelectorAll('.check-card').forEach(btn=>btn.onclick=()=>{
  const k=todayKey(); data.supplements[k]=data.supplements[k]||{};
  data.supplements[k][btn.dataset.supp]=!data.supplements[k][btn.dataset.supp]; save();
});

const weightDialog=document.getElementById('weightDialog');
document.getElementById('openWeight').onclick=()=>weightDialog.showModal();
document.getElementById('saveWeight').onclick=()=>{
  const value=+document.getElementById('weightInput').value;
  if(!value) return;
  data.weights.push({date:new Date().toISOString(),value});
  weightDialog.close(); save();
};

document.querySelectorAll('[data-coach]').forEach(btn=>btn.onclick=()=>{
  const type=btn.dataset.coach;
  const week=data.workouts.filter(w=>isThisWeek(w.date)).length;
  const meals=data.meals.filter(m=>m.date.slice(0,10)===todayKey()).length;
  const msg=document.getElementById('coachMessage');
  if(type==='motivation'){
    msg.textContent = week>=2
      ? "Ton minimum est déjà fait cette semaine. Si tu bouges aujourd’hui, fais-le parce que ça te ferait du bien — pas pour compenser."
      : "Pas besoin d’une séance parfaite : 25 à 35 minutes suffisent. Ton seul objectif est de commencer.";
  }
  if(type==='food'){
    msg.textContent = meals===0
      ? "Si tu as faim, mange. Construis simplement quelque chose avec une source de protéines, un féculent ou du pain, et des végétaux si tu en as."
      : "La faim n’est pas un échec. Regarde quand tu as mangé pour la dernière fois et choisis une vraie collation ou un repas qui te rassasie.";
  }
  if(type==='week'){
    msg.textContent = week>=2
      ? `Tu as déjà fait ${week} séances cette semaine : objectif atteint. La suite est du bonus.`
      : `Tu as fait ${week} séance${week>1?'s':''}. Ton objectif est 2 : ${2-week} reste${2-week>1?'nt':''}, sans chercher à rattraper quoi que ce soit.`;
  }
});

document.getElementById('resetBtn').onclick=()=>{
  if(confirm("Réinitialiser toutes les données de cette version ?")){
    data=JSON.parse(JSON.stringify(initial)); data.startDate=new Date().toISOString(); save();
  }
};

render();
