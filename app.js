
const STABLE_KEY='equilibre-stable';
const OLD_KEYS=['equilibre-v2b-local','equilibre-v2a','equilibre-oceane-v1'];
const DEFAULT={startDate:new Date().toISOString(),meals:[],workouts:[],weights:[{date:new Date().toISOString(),value:55}],measurements:[],wellbeing:{},supplements:{},progressPhotos:[],hydration:{}};

function loadData(){
  const stable=localStorage.getItem(STABLE_KEY);
  if(stable) return JSON.parse(stable);
  for(const k of OLD_KEYS){
    const old=localStorage.getItem(k);
    if(old){
      const parsed=JSON.parse(old);
      localStorage.setItem(STABLE_KEY,JSON.stringify(parsed));
      return parsed;
    }
  }
  return structuredClone(DEFAULT);
}
let recipeOffset=0;
let recipeCategory=null;
let data=loadData();
function normalizeData(raw){
  const d=raw&&typeof raw==='object'?raw:{};
  d.startDate=d.startDate||new Date().toISOString();
  d.meals=Array.isArray(d.meals)?d.meals:[];
  d.workouts=Array.isArray(d.workouts)?d.workouts:[];
  d.weights=Array.isArray(d.weights)&&d.weights.length?d.weights:[{date:new Date().toISOString(),value:55}];
  d.measurements=Array.isArray(d.measurements)?d.measurements:[];
  d.progressPhotos=Array.isArray(d.progressPhotos)?d.progressPhotos:[];
  d.wellbeing=d.wellbeing&&typeof d.wellbeing==='object'?d.wellbeing:{};
  d.supplements=d.supplements&&typeof d.supplements==='object'?d.supplements:{};
  d.hydration=d.hydration&&typeof d.hydration==='object'?d.hydration:{};
  return d;
}
data=normalizeData(data);
localStorage.setItem(STABLE_KEY,JSON.stringify(data));
const $=id=>document.getElementById(id);
const today=()=>new Date().toISOString().slice(0,10);
const save=()=>{localStorage.setItem(STABLE_KEY,JSON.stringify(data));render()};
const weekStart=()=>{const d=new Date(),n=(d.getDay()+6)%7;d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d};
const thisWeek=iso=>new Date(iso)>=weekStart();
const esc=s=>(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const round=x=>Math.round((x||0)*10)/10;

const FOOD=[
{name:'œuf',aliases:['oeuf','œuf','oeufs','œufs'],unit:'piece',piece:60,kcal:143,p:12.6,c:0.7,f:9.5,fi:0},
{name:'blanc d’œuf',aliases:["blanc d'oeuf",'blanc d’œuf'],unit:'piece',piece:33,kcal:52,p:10.9,c:0.7,f:0.2,fi:0},
{name:'pain complet',aliases:['pain complet','tartine complete','tartine complète'],kcal:247,p:9,c:41,f:4.2,fi:7},
{name:'pain',aliases:['pain','tartine'],kcal:265,p:8.5,c:49,f:3.2,fi:2.7},
{name:'beurre',aliases:['beurre'],kcal:717,p:0.9,c:0.1,f:81.1,fi:0},
{name:'kiwi',aliases:['kiwi'],unit:'piece',piece:75,kcal:61,p:1.1,c:14.7,f:0.5,fi:3},
{name:'banane',aliases:['banane'],unit:'piece',piece:120,kcal:89,p:1.1,c:22.8,f:0.3,fi:2.6},
{name:'pomme',aliases:['pomme'],unit:'piece',piece:150,kcal:52,p:0.3,c:13.8,f:0.2,fi:2.4},
{name:'orange',aliases:['orange'],unit:'piece',piece:160,kcal:47,p:0.9,c:11.8,f:0.1,fi:2.4},
{name:'fraise',aliases:['fraise','fraises'],kcal:32,p:0.7,c:7.7,f:0.3,fi:2},
{name:'ananas',aliases:['ananas'],kcal:50,p:0.5,c:13.1,f:0.1,fi:1.4},
{name:'poulet',aliases:['poulet','blanc de poulet','escalope de poulet'],kcal:165,p:31,c:0,f:3.6,fi:0},
{name:'dinde',aliases:['dinde','escalope de dinde'],kcal:135,p:29,c:0,f:1.6,fi:0},
{name:'jambon',aliases:['jambon'],unit:'piece',piece:40,kcal:145,p:21,c:1.5,f:6,fi:0},
{name:'saumon',aliases:['saumon'],kcal:208,p:20,c:0,f:13,fi:0},
{name:'thon',aliases:['thon'],kcal:132,p:29,c:0,f:1.3,fi:0},
{name:'steak haché 5%',aliases:['steak hache 5','steak haché 5','steak hache','steak haché'],kcal:137,p:21,c:0,f:5,fi:0},
{name:'tofu',aliases:['tofu'],kcal:144,p:17,c:2.8,f:8.7,fi:2.3},
{name:'skyr',aliases:['skyr'],unit:'piece',piece:140,kcal:63,p:11,c:4,f:0.2,fi:0},
{name:'fromage blanc',aliases:['fromage blanc'],kcal:74,p:8,c:4.5,f:2.5,fi:0},
{name:'yaourt grec',aliases:['yaourt grec'],unit:'piece',piece:150,kcal:97,p:9,c:3.9,f:5,fi:0},
{name:'isolate',aliases:['isolate','whey isolate','whey'],unit:'piece',piece:30,kcal:370,p:85,c:4,f:2,fi:0},
{name:'riz cuit',aliases:['riz cuit','riz'],kcal:130,p:2.7,c:28.2,f:0.3,fi:0.4},
{name:'pâtes cuites',aliases:['pates cuites','pâtes cuites','pates','pâtes'],kcal:158,p:5.8,c:30.9,f:0.9,fi:1.8},
{name:'semoule cuite',aliases:['semoule','couscous'],kcal:112,p:3.8,c:23.2,f:0.2,fi:1.4},
{name:'quinoa cuit',aliases:['quinoa'],kcal:120,p:4.4,c:21.3,f:1.9,fi:2.8},
{name:'pomme de terre',aliases:['pomme de terre','pommes de terre','patate'],kcal:87,p:1.9,c:20.1,f:0.1,fi:1.8},
{name:'flocons d’avoine',aliases:["flocons d'avoine",'flocons d’avoine','avoine'],kcal:379,p:13.2,c:67.7,f:6.5,fi:10.1},
{name:'lentilles cuites',aliases:['lentilles','lentilles cuites'],kcal:116,p:9,c:20.1,f:0.4,fi:7.9},
{name:'pois chiches cuits',aliases:['pois chiches','pois chiche'],kcal:164,p:8.9,c:27.4,f:2.6,fi:7.6},
{name:'haricots rouges',aliases:['haricots rouges'],kcal:127,p:8.7,c:22.8,f:0.5,fi:6.4},
{name:'courgette',aliases:['courgette','courgettes'],kcal:17,p:1.2,c:3.1,f:0.3,fi:1},
{name:'tomate',aliases:['tomate','tomates'],unit:'piece',piece:120,kcal:18,p:0.9,c:3.9,f:0.2,fi:1.2},
{name:'poivron',aliases:['poivron','poivrons'],unit:'piece',piece:140,kcal:31,p:1,c:6,f:0.3,fi:2.1},
{name:'brocoli',aliases:['brocoli','brocolis'],kcal:35,p:2.4,c:7.2,f:0.4,fi:3.3},
{name:'haricot vert',aliases:['haricot vert','haricots verts'],kcal:35,p:1.9,c:7.9,f:0.3,fi:3.2},
{name:'carotte',aliases:['carotte','carottes'],unit:'piece',piece:80,kcal:41,p:0.9,c:9.6,f:0.2,fi:2.8},
{name:'salade',aliases:['salade','iceberg','salade iceberg'],kcal:14,p:0.9,c:3,f:0.1,fi:1.2},
{name:'avocat',aliases:['avocat'],unit:'piece',piece:150,kcal:160,p:2,c:8.5,f:14.7,fi:6.7},
{name:'huile olive',aliases:["huile d'olive",'huile olive','huile d’olive'],kcal:884,p:0,c:0,f:100,fi:0},
{name:'parmesan',aliases:['parmesan'],kcal:431,p:38,c:4.1,f:29,fi:0},
{name:'feta',aliases:['feta'],kcal:264,p:14.2,c:4.1,f:21.3,fi:0},
{name:'amandes',aliases:['amandes','amande'],kcal:579,p:21.2,c:21.6,f:49.9,fi:12.5},
{name:'noix',aliases:['noix'],kcal:654,p:15.2,c:13.7,f:65.2,fi:6.7},
{name:'chocolat noir',aliases:['chocolat noir','chocolat'],kcal:598,p:7.8,c:45.9,f:42.6,fi:10.9},
{name:'lait demi-écrémé',aliases:['lait','lait demi ecreme','lait demi-écrémé'],kcal:46,p:3.2,c:4.8,f:1.6,fi:0},
{name:'miel',aliases:['miel'],kcal:304,p:0.3,c:82.4,f:0,fi:0}
];
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/œ/g,'oe').replace(/[’']/g,"'")}
function qtyFor(segment,food){
 const s=norm(segment);let m=s.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|cl)\b/);
 if(m){let v=parseFloat(m[1].replace(',','.'));if(m[2]==='kg')v*=1000;if(m[2]==='cl')v*=10;return v}
 m=s.match(/\b(\d+(?:[.,]\d+)?)\b/);if(m&&food.unit==='piece')return parseFloat(m[1].replace(',','.'))*(food.piece||100);
 if(food.unit==='piece')return food.piece||100;
 const defs={'beurre':10,'huile olive':10,'parmesan':20,'feta':30,'amandes':25,'noix':25,'chocolat noir':20,'isolate':30,'pain':60,'pain complet':60,'skyr':140,'yaourt grec':150,'fromage blanc':150};
 return defs[food.name]||100;
}
function analyze(text){
 const parts=text.split(/[,;+\n]|\bet\b/gi).map(s=>s.trim()).filter(Boolean),found=[];
 for(const part of parts){const np=norm(part);let best=null;for(const f of FOOD){for(const a of f.aliases){if(np.includes(norm(a))&&(!best||a.length>best.alias.length))best={food:f,alias:a}}}if(best){const g=qtyFor(part,best.food),k=g/100,f=best.food;found.push({name:f.name,g:Math.round(g),kcal:f.kcal*k,p:f.p*k,c:f.c*k,fat:f.f*k,fi:f.fi*k})}}
 const total=found.reduce((a,x)=>({kcal:a.kcal+x.kcal,p:a.p+x.p,c:a.c+x.c,fat:a.fat+x.fat,fi:a.fi+x.fi}),{kcal:0,p:0,c:0,fat:0,fi:0});Object.keys(total).forEach(k=>total[k]=round(total[k]));return {found,total};
}
function dayTotals(meals){return meals.reduce((a,m)=>{const t=m.nutrition||{};a.kcal+=t.kcal||0;a.p+=t.p||0;a.c+=t.c||0;a.fat+=t.fat||0;a.fi+=t.fi||0;return a},{kcal:0,p:0,c:0,fat:0,fi:0})}

const RECIPE_BANK=[
{cat:'breakfast',title:'Porridge skyr, banane & cannelle',meta:'8 min · doux',desc:'Un petit-déjeuner rassasiant avec protéines et fibres.',ingredients:['40 g de flocons d’avoine','150 g de skyr','1/2 à 1 banane','Cannelle','Un peu de lait'],steps:['Cuire l’avoine avec le lait.','Ajouter le skyr hors du feu.','Déposer la banane et la cannelle.'],nutrition:'≈ 350–420 kcal · 22 g protéines'},
{cat:'breakfast',title:'Tartines œufs brouillés & avocat',meta:'10 min · salé',desc:'Pour un matin salé, simple et complet.',ingredients:['2 œufs','2 tranches de pain complet','1/3 avocat','Tomates','Sel, poivre'],steps:['Griller le pain.','Cuire les œufs brouillés.','Écraser l’avocat et assembler avec les tomates.'],nutrition:'≈ 400–480 kcal · 22 g protéines'},
{cat:'breakfast',title:'Bowl skyr, fruits rouges & granola',meta:'5 min · frais',desc:'Rapide, frais et facile à préparer.',ingredients:['170 g de skyr','100 g de fruits rouges','30 g de granola','1 c. à café de graines'],steps:['Verser le skyr.','Ajouter fruits, granola et graines.'],nutrition:'≈ 320–380 kcal · 20 g protéines'},
{cat:'breakfast',title:'Pancakes banane & avoine',meta:'12 min · gourmand',desc:'Une option gourmande sans devenir compliquée.',ingredients:['1 banane','1 œuf','40 g de flocons d’avoine','80 g de skyr','Cannelle'],steps:['Mixer banane, œuf et avoine.','Cuire de petits pancakes.','Servir avec le skyr.'],nutrition:'≈ 380 kcal · 20 g protéines'},
{cat:'breakfast',title:'Overnight oats pomme & amandes',meta:'5 min + repos',desc:'À préparer la veille pour un matin sans effort.',ingredients:['40 g d’avoine','120 ml de lait','100 g de skyr','1/2 pomme','10 g d’amandes'],steps:['Mélanger avoine, lait et skyr.','Réserver au frais.','Ajouter pomme et amandes le matin.'],nutrition:'≈ 360 kcal · 19 g protéines'},
{cat:'lunch',title:'Poulet, semoule & légumes rôtis',meta:'25 min · complet',desc:'Simple, rassasiant et facile à ajuster selon ta faim.',ingredients:['120–150 g de poulet','120 g de semoule cuite','250 g de légumes','1 c. à café d’huile','Épices, citron'],steps:['Cuire la semoule.','Faire revenir le poulet.','Rôtir les légumes.','Assembler.'],nutrition:'≈ 500–600 kcal · 40 g protéines'},
{cat:'lunch',title:'Bowl lentilles, feta & avocat',meta:'15 min · fibres',desc:'Une option fraîche et très rassasiante.',ingredients:['150 g de lentilles cuites','40 g de feta','Tomates et salade','1/2 avocat','Citron'],steps:['Rincer les lentilles.','Couper les légumes.','Assembler avec feta et avocat.'],nutrition:'≈ 450–550 kcal · 20 g protéines'},
{cat:'lunch',title:'Wrap poulet, crudités & sauce yaourt',meta:'15 min · pratique',desc:'Facile à emporter et très modulable.',ingredients:['1 grand wrap','120 g de poulet','Crudités','2 c. à soupe de yaourt','Citron, épices'],steps:['Cuire le poulet.','Mélanger la sauce.','Garnir le wrap et rouler.'],nutrition:'≈ 450–520 kcal · 35 g protéines'},
{cat:'lunch',title:'Salade pâtes, thon & tomates',meta:'15 min · frais',desc:'Une salade complète qui ne ressemble pas à un repas triste.',ingredients:['150 g de pâtes cuites','100 g de thon','Tomates','Concombre','Maïs','Vinaigrette légère'],steps:['Cuire puis refroidir les pâtes.','Ajouter tous les ingrédients.','Assaisonner.'],nutrition:'≈ 500 kcal · 32 g protéines'},
{cat:'lunch',title:'Bowl saumon, riz & concombre',meta:'20 min · frais',desc:'Un bowl façon poke très simple.',ingredients:['120 g de saumon','130 g de riz cuit','Concombre','Carotte','Sauce soja','Sésame'],steps:['Cuire le saumon.','Préparer les légumes.','Assembler avec le riz et assaisonner.'],nutrition:'≈ 550–620 kcal · 30 g protéines'},
{cat:'dinner',title:'Pâtes courgettes, poulet & parmesan',meta:'20 min · réconfortant',desc:'Crémeux, généreux et équilibré.',ingredients:['150 g de pâtes cuites','120 g de poulet','1 courgette','20 g de parmesan','1 c. à café d’huile'],steps:['Cuire les pâtes.','Poêler courgette et poulet.','Ajouter les pâtes.','Finir au parmesan.'],nutrition:'≈ 550–650 kcal · 40 g protéines'},
{cat:'dinner',title:'Saumon, riz & brocoli',meta:'25 min · complet',desc:'Une assiette simple et équilibrée.',ingredients:['120–140 g de saumon','130 g de riz cuit','200 g de brocoli','Citron','Herbes'],steps:['Cuire le saumon.','Réchauffer le riz.','Cuire le brocoli.','Ajouter citron et herbes.'],nutrition:'≈ 550–650 kcal · 30 g protéines'},
{cat:'dinner',title:'Omelette, pommes de terre & salade',meta:'15 min · rapide',desc:'Très simple quand tu ne veux pas cuisiner longtemps.',ingredients:['2 à 3 œufs','200 g de pommes de terre','Grande salade','Tomates','1 c. à café d’huile'],steps:['Cuire les pommes de terre.','Faire l’omelette.','Préparer la salade.','Servir ensemble.'],nutrition:'≈ 450–550 kcal · 25 g protéines'},
{cat:'dinner',title:'Curry pois chiches, épinards & riz',meta:'25 min · végétarien',desc:'Chaud, rassasiant et riche en fibres.',ingredients:['150 g de pois chiches','Épinards','100 ml de lait de coco léger','120 g de riz cuit','Curry'],steps:['Faire revenir les épices.','Ajouter pois chiches, épinards et coco.','Laisser mijoter et servir avec le riz.'],nutrition:'≈ 500–580 kcal · 18 g protéines'},
{cat:'dinner',title:'Tacos de poulet maison',meta:'20 min · gourmand',desc:'Un dîner plaisir qui reste facile à équilibrer.',ingredients:['2 petites tortillas','120 g de poulet','Poivrons','Salade','Yaourt citronné','Épices'],steps:['Cuire poulet et poivrons.','Préparer la sauce.','Garnir les tortillas.'],nutrition:'≈ 480–550 kcal · 35 g protéines'},
{cat:'snack',title:'Skyr, banane & amandes',meta:'5 min · protéiné',desc:'Rapide et nourrissant quand la faim arrive.',ingredients:['150 g de skyr','1 banane','15 g d’amandes','Cannelle'],steps:['Verser le skyr.','Ajouter banane et amandes.'],nutrition:'≈ 280–330 kcal · 18 g protéines'},
{cat:'snack',title:'Pomme, beurre de cacahuète & skyr',meta:'3 min · croquant',desc:'Sucré, rassasiant et sans préparation.',ingredients:['1 pomme','100 g de skyr','10–15 g de beurre de cacahuète'],steps:['Couper la pomme.','Servir avec skyr et beurre de cacahuète.'],nutrition:'≈ 230–280 kcal · 13 g protéines'},
{cat:'snack',title:'Tartine fromage frais & jambon',meta:'5 min · salé',desc:'Une collation salée qui cale vraiment.',ingredients:['1 tranche de pain complet','30 g de fromage frais','1 tranche de jambon','Concombre ou tomate'],steps:['Tartiner le pain.','Ajouter jambon et crudités.'],nutrition:'≈ 220–260 kcal · 15 g protéines'},
{cat:'snack',title:'Smoothie fruits rouges & skyr',meta:'5 min · frais',desc:'Pratique quand tu as envie de quelque chose de frais.',ingredients:['150 g de fruits rouges','120 g de skyr','100 ml de lait','1/2 banane'],steps:['Mixer tous les ingrédients.','Boire bien frais.'],nutrition:'≈ 220–270 kcal · 15 g protéines'},
{cat:'snack',title:'Energy bowl cacao & banane',meta:'5 min · gourmand',desc:'Une petite option chocolatée avec une vraie satiété.',ingredients:['120 g de skyr','1/2 banane','1 c. à café de cacao','15 g d’avoine','10 g de noisettes'],steps:['Mélanger skyr et cacao.','Ajouter banane, avoine et noisettes.'],nutrition:'≈ 250–300 kcal · 16 g protéines'}
];

const QUOTES=[
'« La régularité vaut plus que les grands élans qui ne durent pas. »',
'« Un jour moyen peut quand même être une bonne journée. »',
'« Ton corps n’a pas besoin d’être puni pour changer ; il a besoin d’être accompagné. »',
'« Faire un peu aujourd’hui rend demain plus facile. »',
'« Le progrès discret reste du progrès. »',
'« La meilleure routine est celle que tu peux encore suivre dans une semaine compliquée. »',
'« Manger suffisamment et bouger régulièrement sont des alliés, pas des sanctions. »'
];

const titles={today:'Aujourd’hui',food:'Alimentation',sport:'Sport',progress:'Progression'};
function go(name){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===name));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));$('pageTitle').textContent=titles[name];window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>go(b.dataset.tab));document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));

function foodAdvice(t){
 const a=[];
 if(t.p<55)a.push(['Protéines à renforcer','Pour la suite, pense à une vraie source de protéines : poulet, œufs, poisson, skyr, tofu ou légumineuses.']);
 else if(t.p<75)a.push(['Protéines en bonne voie','Tu as déjà une bonne base. Un prochain repas avec une source de protéines complètera facilement la journée.']);
 else a.push(['Protéines : belle base','Tu as déjà atteint une quantité intéressante aujourd’hui. Pas besoin de forcer davantage.']);
 if(t.fi<15)a.push(['Fibres encore basses','Ajoute si possible légumes, fruits, légumineuses, avoine ou féculents complets au prochain repas.']);
 else if(t.fi<25)a.push(['Fibres en bonne voie','Encore un fruit, des légumes ou une portion de légumineuses peut faire la différence.']);
 else a.push(['Fibres : très bien','Ta journée contient déjà une belle quantité de fibres.']);
 if(t.kcal<900)a.push(['Journée encore légère','Les apports enregistrés sont encore assez légers. Ne cherche pas à “économiser” ton prochain repas si tu as faim.']);
 return a.slice(0,3);
}
function suggestedRecipeCategory(){
 const h=new Date().getHours();
 if(h<11)return 'breakfast';
 if(h<15)return 'lunch';
 if(h<18)return 'snack';
 return 'dinner';
}
function categoryLabel(cat){return {breakfast:'matin',lunch:'déjeuner',dinner:'dîner',snack:'collation'}[cat]||cat}
function selectRecipes(){
 const cat=recipeCategory||suggestedRecipeCategory();
 const pool=RECIPE_BANK.filter(r=>r.cat===cat);
 if(!pool.length)return [];
 const o=recipeOffset%pool.length;
 return pool.slice(o).concat(pool.slice(0,o)).slice(0,3);
}
function quoteFor(wb,tot,w){
 if(wb?.stress>=4)return '« Aujourd’hui, réduire la pression est aussi une forme de progrès. »';
 if(wb?.energy<=2)return '« Les jours de petite énergie méritent des objectifs plus doux, pas plus de culpabilité. »';
 if(wb?.hunger>=4&&tot.kcal<1200)return '« La faim est une information, pas un manque de volonté. »';
 if(w>=2)return '« Tu as fait ce qui était prévu. Le reste est du bonus. »';
 return QUOTES[new Date().getDate()%QUOTES.length];
}
function coachState(w,m,wb,t){
 if(wb?.stress>=4)return['Aujourd’hui, ton objectif peut être de faire moins — mais mieux.','Ton stress est élevé. Garde les décisions simples : un repas rassasiant, un peu d’air si ça te fait du bien, et aucune obligation de “rentabiliser” la journée.'];
 if(wb?.energy<=2&&wb?.soreness>=4)return['Ton corps te demande probablement une journée plus douce.','Énergie basse + fortes courbatures : marche tranquille, mobilité ou repos sont parfaitement cohérents aujourd’hui.'];
 if(wb?.hunger>=4&&t.kcal<1200)return['Ta faim mérite d’être écoutée.','Tes apports enregistrés semblent encore légers et ta faim physique est haute. Cherche un vrai repas ou une collation complète plutôt que d’essayer de tenir.'];
 if((wb?.craving||0)>=4&&(wb?.hunger||0)<=2)return['Tu as surtout envie de manger, sans grande faim physique.','Aucune interdiction : tu peux manger quelque chose si tu en as envie. Mais comme ta faim physique est basse, prends un instant pour choisir ce qui te ferait vraiment plaisir plutôt que de grignoter machinalement.'];
 if(w>=2)return['Objectif sportif atteint ✨','Tes deux séances de renforcement sont faites. Une marche ou une autre activité peut être agréable, mais tu n’as rien à rattraper.'];
 if(m===0)return['Commence petit.','Une seule action utile aujourd’hui suffit : noter un repas, marcher un peu ou planifier ta prochaine séance.'];
 if(t.p<50)return['Ta journée a surtout besoin de simplicité.','Pour le prochain repas, pense d’abord à une source de protéines et à quelque chose qui te rassasie vraiment.'];
 return['Tu construis ta routine.','Le plus important n’est pas d’être parfaite aujourd’hui, mais de pouvoir recommencer demain.'];
}
function drawWeight(ws){const c=$('weightChart'),x=c.getContext('2d'),w=c.width,h=c.height;x.clearRect(0,0,w,h);x.strokeStyle='#ded7cd';x.lineWidth=2;x.beginPath();x.moveTo(24,h-30);x.lineTo(w-24,h-30);x.stroke();if(ws.length<2)return;const vals=ws.map(o=>o.value),min=Math.min(...vals)-.5,max=Math.max(...vals)+.5,pts=vals.map((v,i)=>({x:35+i*(w-70)/(vals.length-1),y:22+(max-v)*(h-70)/(max-min)}));x.strokeStyle='#786e60';x.lineWidth=5;x.lineCap='round';x.lineJoin='round';x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));x.stroke();x.fillStyle='#24211d';pts.forEach(p=>{x.beginPath();x.arc(p.x,p.y,5,0,Math.PI*2);x.fill()})}

function render(){
 const now=new Date(),days=Math.max(0,Math.floor((now-new Date(data.startDate))/86400000)),weekActs=data.workouts.filter(w=>thisWeek(w.date)),strength=weekActs.filter(w=>/musculation|full body|renforcement/i.test(w.type)),tm=data.meals.filter(m=>m.date.slice(0,10)===today()),supp=data.supplements[today()]||{},routine=['creatine','magnesium'].filter(k=>supp[k]).length,wb=data.wellbeing[today()],tot=dayTotals(tm);
 $('dateLabel').textContent=now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});$('weekNumber').textContent=Math.min(4,Math.floor(days/7)+1);
 const pct=Math.min(100,Math.round((Math.min(strength.length,2)/2)*70+Math.min(tm.length,3)/3*20+routine/2*10));$('weeklyWorkoutText').textContent=`${strength.length}/2`;$('weekPercent').textContent=`${pct}%`;$('weekRing').style.background=`conic-gradient(var(--accent) ${pct*3.6}deg,var(--soft) ${pct*3.6}deg)`;$('todayMeals').textContent=tm.length;$('todayRoutine').textContent=`${routine}/2`;$('todayMood').textContent=wb?`${wb.mood}/5`:'—';
 const waterHalfUnits=(data.hydration[today()]||0),waterLiters=waterHalfUnits*0.445;
 $('waterLiters').textContent=waterLiters.toFixed(2).replace('.',',');
 $('waterCups').textContent=(waterHalfUnits/2).toLocaleString('fr-FR',{maximumFractionDigits:1});
 $('waterGaugeFill').style.width=`${Math.min(100,(waterLiters/1.78)*100)}%`;

 if(wb)['energy','mood','sleep','stress','hunger','craving','soreness'].forEach(k=>{if($(k)){ $(k).value=wb[k]??$(k).value;$(k+'Val').textContent=`${$(k).value}/5`}});
 document.querySelectorAll('.routine').forEach(b=>{const d=!!supp[b.dataset.supp];b.classList.toggle('done',d);b.querySelector('i').textContent=d?'✓':'○'});
 $('proteinVal').textContent=`${round(tot.p)} g`;$('fiberVal').textContent=`${round(tot.fi)} g`;$('carbVal').textContent=`${round(tot.c)} g`;$('fatVal').textContent=`${round(tot.fat)} g`;$('kcalVal').textContent=`${Math.round(tot.kcal)} kcal`;
 $('proteinBar').style.width=`${Math.min(100,tot.p/80*100)}%`;$('fiberBar').style.width=`${Math.min(100,tot.fi/30*100)}%`;$('carbBar').style.width=`${Math.min(100,tot.c/220*100)}%`;$('fatBar').style.width=`${Math.min(100,tot.fat/70*100)}%`;
 $('foodGuidance').innerHTML=foodAdvice(tot).map(x=>`<div class="guide"><b>${x[0]}</b>${x[1]}</div>`).join('');
 $('foodCountLabel').textContent=`${tm.length} repas`;$('mealList').innerHTML=tm.length?tm.slice().reverse().map(m=>`<div class="mealItem"><div class="mealTop"><b>${m.type}</b><small>${new Date(m.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</small></div>${m.photo?`<img class="mealPhoto" src="${m.photo}">`:''}<p>${esc(m.text)}</p>${m.nutrition?`<div class="mealMacros"><span><b>${Math.round(m.nutrition.kcal)}</b>kcal</span><span><b>${round(m.nutrition.p)}g</b>prot.</span><span><b>${round(m.nutrition.c)}g</b>gluc.</span><span><b>${round(m.nutrition.fat)}g</b>lip.</span><span><b>${round(m.nutrition.fi)}g</b>fibres</span></div>`:''}</div>`).join(''):'<div class="empty">Aucun repas noté aujourd’hui.</div>';
 const currentRecipeCat=recipeCategory||suggestedRecipeCategory(); $('recipeContext').textContent=`Suggestions pour ${categoryLabel(currentRecipeCat)} · appuie sur « Changer » pour d’autres idées.`; document.querySelectorAll('[data-recipe-cat]').forEach(b=>b.classList.toggle('active',b.dataset.recipeCat===currentRecipeCat)); const rs=selectRecipes();$('recipeIdeas').innerHTML=rs.map((r,i)=>`<div class="recipe"><div class="recipeHeader"><div><span class="recipeCategory">${categoryLabel(r.cat)}</span><b>${r.title}</b><small>${r.meta}</small><p>${r.desc}</p></div><button data-recipe="${i}">Recette</button></div><div class="recipeDetails" id="recipe-${i}"><h4>Ingrédients</h4><ul>${r.ingredients.map(x=>`<li>${x}</li>`).join('')}</ul><h4>Préparation</h4><ol>${r.steps.map(x=>`<li>${x}</li>`).join('')}</ol><div class="recipeNutrition"><span>${r.nutrition}</span></div></div></div>`).join('');
 document.querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>{const el=$('recipe-'+b.dataset.recipe);el.classList.toggle('open');b.textContent=el.classList.contains('open')?'Fermer':'Recette'});
 $('sportWeekTitle').textContent=`${strength.length}/2 séances`;$('sportStatusBadge').textContent=strength.length>=2?'Objectif atteint ✨':strength.length===1?'Encore 1':'À commencer';$('sportProgress').style.width=`${Math.min(100,strength.length/2*100)}%`;
 const minutes=weekActs.reduce((a,w)=>a+(+w.duration||0),0);$('movementSummary').textContent=`${minutes} min`;
 $('workoutList').innerHTML=weekActs.length?weekActs.slice().reverse().map(w=>`<div class="mealItem"><div class="mealTop"><b>${esc(w.type)}</b><small>${new Date(w.date).toLocaleDateString('fr-FR')}</small></div><p>${w.duration} min${w.distance?` · ${w.distance} km`:''}${w.pace?` · ${esc(w.pace)}`:''} · ${esc(w.feeling||'Bien')}</p>${w.note?`<p>${esc(w.note)}</p>`:''}</div>`).join(''):'<div class="empty">Aucune activité enregistrée cette semaine.</div>';
 const ws=data.weights.slice(-10);$('latestWeight').textContent=ws.length?`${ws.at(-1).value.toFixed(1)} kg`:'—';$('totalWorkouts').textContent=data.workouts.length;const active=new Set([...data.meals.map(x=>x.date.slice(0,10)),...data.workouts.map(x=>x.date.slice(0,10)),...Object.keys(data.supplements)]);$('consistency').textContent=`${Math.min(100,Math.round(active.size/Math.max(1,days+1)*100))}%`;drawWeight(ws);
 const lm=(data.measurements||[]).at(-1);$('latestWaist').textContent=lm?.waist?`${lm.waist} cm`:'—';$('latestHips').textContent=lm?.hips?`${lm.hips} cm`:'—';$('latestThigh').textContent=lm?.thigh?`${lm.thigh} cm`:'—';$('progressPhotos').innerHTML=(data.progressPhotos||[]).slice(-6).reverse().map(p=>`<img src="${p.data}">`).join('');$('sinceText').textContent=days<3?'Tes progrès apparaîtront ici avec le temps.':`${days+1} jours de suivi · ${data.workouts.length} activité${data.workouts.length>1?'s':''} · ${data.meals.length} repas notés.`;
 let cs=coachState(strength.length,tm.length,wb,tot),q=quoteFor(wb,tot,strength.length);
 if(new Date().getHours()>=15 && waterLiters<0.9){
   cs=['Petit rappel hydratation 💧','Tu as enregistré moins d’une Stanley aujourd’hui. Garde-la simplement près de toi pour la suite de la journée.'];
 }$('coachPreviewTitle').textContent=cs[0];$('coachPreviewText').textContent=cs[1];$('coachQuote').textContent=q;
}
['energy','mood','sleep','stress','hunger','craving','soreness'].forEach(k=>$(k).oninput=e=>$(k+'Val').textContent=`${e.target.value}/5`);
$('saveWellbeing').onclick=()=>{
 data.wellbeing[today()]={energy:+$('energy').value,mood:+$('mood').value,sleep:+$('sleep').value,stress:+$('stress').value,hunger:+$('hunger').value,craving:+$('craving').value,soreness:+$('soreness').value};
 localStorage.setItem(STABLE_KEY,JSON.stringify(data));render();
 const n=$('wellbeingSaved');n.classList.remove('hidden');setTimeout(()=>n.classList.add('hidden'),1800);
};
document.querySelectorAll('.routine').forEach(b=>b.onclick=()=>{data.supplements[today()]=data.supplements[today()]||{};data.supplements[today()][b.dataset.supp]=!data.supplements[today()][b.dataset.supp];save()});
$('addHalfWater').onclick=()=>{data.hydration[today()]=(data.hydration[today()]||0)+1;save()};
$('addFullWater').onclick=()=>{data.hydration[today()]=(data.hydration[today()]||0)+2;save()};
$('removeHalfWater').onclick=()=>{data.hydration[today()]=Math.max(0,(data.hydration[today()]||0)-1);save()};
const fileData=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
['quickMeal','addMealText','addMealPhoto'].forEach(id=>$(id).onclick=()=>$('mealDialog').showModal());
function showPreview(){const a=analyze($('mealText').value);$('analysisPreview').classList.remove('hidden');$('analysisPreview').innerHTML=a.found.length?`<b>Estimation du repas</b>${a.found.map(x=>`<div class="found"><span>${x.name} · ~${x.g} g</span><span>${Math.round(x.kcal)} kcal</span></div>`).join('')}<p><b>${Math.round(a.total.kcal)} kcal</b> · ${round(a.total.p)} g prot. · ${round(a.total.c)} g gluc. · ${round(a.total.fat)} g lip. · ${round(a.total.fi)} g fibres</p>`:`<p>Je n’ai reconnu aucun aliment. Essaie une formulation simple, par exemple “150 g de poulet, 120 g de riz, courgettes”.</p>`;return a}
$('previewMeal').onclick=showPreview;
$('saveMeal').onclick=async()=>{const f=$('mealPhotoInput').files[0],text=$('mealText').value.trim();if(!f&&!text)return;const a=analyze(text);data.meals.push({date:new Date().toISOString(),type:$('mealType').value,text,photo:f?await fileData(f):null,nutrition:a.total,foods:a.found,satiety:+$('satiety').value});localStorage.setItem(STABLE_KEY,JSON.stringify(data));$('mealText').value='';$('mealPhotoInput').value='';$('analysisPreview').classList.add('hidden');$('mealDialog').close();render();go('food')};

function openActivity(type){$('workoutType').value=type||'Autre';$('workoutDialog').showModal()}
$('quickWorkout').onclick=$('openCustomWorkout').onclick=()=>openActivity('Autre');
document.querySelectorAll('[data-activity]').forEach(b=>b.onclick=()=>openActivity(b.dataset.activity));
document.querySelectorAll('.addProgram').forEach(b=>b.onclick=()=>{data.workouts.push({date:new Date().toISOString(),type:b.dataset.program,duration:40,feeling:'Bien'});save()});
$('saveWorkout').onclick=()=>{data.workouts.push({date:new Date().toISOString(),type:$('workoutType').value,duration:+$('workoutDuration').value,distance:+$('workoutDistance').value||null,pace:$('workoutPace').value.trim(),feeling:$('workoutFeeling').value,note:$('workoutNote').value.trim()});$('workoutDialog').close();$('workoutDistance').value='';$('workoutPace').value='';$('workoutNote').value='';save()};
$('openWeight').onclick=()=>$('weightDialog').showModal();$('saveWeight').onclick=()=>{const v=+$('weightInput').value;if(v){data.weights.push({date:new Date().toISOString(),value:v});$('weightDialog').close();save()}};
$('openMeasure').onclick=()=>$('measureDialog').showModal();$('saveMeasure').onclick=()=>{data.measurements.push({date:new Date().toISOString(),waist:+$('waistInput').value||null,hips:+$('hipsInput').value||null,thigh:+$('thighInput').value||null});$('measureDialog').close();save()};
$('addProgressPhoto').onclick=()=>$('progressPhotoInput').click();$('progressPhotoInput').onchange=async()=>{const f=$('progressPhotoInput').files[0];if(!f)return;data.progressPhotos=data.progressPhotos||[];data.progressPhotos.push({date:new Date().toISOString(),data:await fileData(f)});$('progressPhotoInput').value='';save()};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());

$('refreshIdeas').onclick=()=>{recipeOffset+=3;render()};
document.querySelectorAll('[data-recipe-cat]').forEach(b=>b.onclick=()=>{recipeCategory=b.dataset.recipeCat;recipeOffset=0;render()});
render();
