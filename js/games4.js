// ============================================================
// GAME TAMBAHAN: Belajar Membaca, Belajar Menghitung, Mengenal Rumus Matematika, Belajar Coding
// ============================================================
const bicara=t=>{try{const u=new SpeechSynthesisUtterance(String(t));u.lang='id-ID';u.rate=.8;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}};
const g4Stars=n=>'⭐'.repeat(n)+'☆'.repeat(Math.max(0,3-n));

// ── Belajar Membaca ──
const KATA=[['bola',['bo','la'],'⚽'],['buku',['bu','ku'],'📘'],['kuda',['ku','da'],'🐴'],['mata',['ma','ta'],'👁️'],['sapi',['sa','pi'],'🐄'],['ayam',['a','yam'],'🐔'],['ikan',['i','kan'],'🐟'],['apel',['a','pel'],'🍎'],['bebek',['be','bek'],'🦆'],['roti',['ro','ti'],'🍞'],['susu',['su','su'],'🥛'],['topi',['to','pi'],'🎩'],['bunga',['bu','nga'],'🌸'],['pisang',['pi','sang'],'🍌'],['jeruk',['je','ruk'],'🍊'],['gajah',['ga','jah'],'🐘'],['rumah',['ru','mah'],'🏠'],['mobil',['mo','bil'],'🚗'],['sepatu',['se','pa','tu'],'👟'],['payung',['pa','yung'],'☂️'],['bintang',['bin','tang'],'⭐'],['bulan',['bu','lan'],'🌙'],['matahari',['ma','ta','ha','ri'],'☀️'],['pensil',['pen','sil'],'✏️'],['kucing',['ku','cing'],'🐱'],['kelinci',['ke','lin','ci'],'🐰'],['ular',['u','lar'],'🐍'],['semut',['se','mut'],'🐜'],['tas',['tas'],'🎒']];
const KALIMAT=[['Ibu memasak nasi di ...',['dapur','sekolah','kebun'],0],['Ayah pergi bekerja naik ...',['mobil','bulan','roti'],0],['Kakak membaca ... di perpustakaan.',['buku','sepatu','payung'],0],['Kucing suka makan ...',['ikan','batu','buku'],0],['Kita memakai ... saat hujan turun.',['payung','topi','bola'],0],['Matahari terbit di waktu ...',['pagi','malam','sore'],0],['Adik minum ... sebelum tidur.',['susu','pensil','tas'],0],['Burung terbang di ...',['langit','laut','dapur'],0],['Kami belajar di ...',['sekolah','pasar','sungai'],0],['Bunga itu berwarna ... dan harum.',['merah','pintu','jauh'],0]];
GM.g_baca=el=>{
  const menu=()=>{el.innerHTML=gStart(el,'📖','Belajar Membaca','Ketuk 🔊 untuk mendengar. Pilih permainan:',`<div class="d-grid gap-2" style="max-width:420px;margin:auto">
    <button class="btn btn-lg btn-outline-primary" data-m="suku">🔤 Dengar & pilih suku kata</button><button class="btn btn-lg btn-outline-success" data-m="gambar">🖼️ Tebak kata dari gambar</button><button class="btn btn-lg btn-outline-warning" data-m="susun">🧩 Susun suku kata</button><button class="btn btn-lg btn-outline-danger" data-m="kalimat">📝 Lengkapi kalimat</button></div>`);
    el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>main(b.dataset.m))};
  const main=mode=>{
    let n=0,sk=0;const T=8;
    const next=()=>{ if(n>=T)return fin(); n++;
      const w=KATA[gRnd(0,KATA.length-1)],head=`<div class="d-flex justify-content-between mb-2"><button class="btn btn-sm btn-light" id="rM">← Menu</button><span>Soal ${n}/${T} · ⭐ ${sk}</span></div>`;
      const pilih=(label,opts,benar,suara)=>{el.innerHTML=head+`<div class="text-center">${label}<div class="d-flex flex-wrap gap-2 justify-content-center mt-3" id="rO">${gShuf(opts).map(o=>`<button class="btn btn-lg btn-outline-secondary px-4" style="font-size:1.6rem;min-width:100px" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div id="rF" class="mt-3" style="min-height:34px"></div></div>`;
        $('rM').onclick=menu;if(suara)bicara(suara);const sp=$('rSp');if(sp)sp.onclick=()=>bicara(suara||w[0]);
        el.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const ok=b.dataset.o===benar;el.querySelectorAll('[data-o]').forEach(x=>{x.disabled=true;if(x.dataset.o===benar)x.classList.replace('btn-outline-secondary','btn-success')});if(ok){sk++;b.classList.replace('btn-outline-secondary','btn-success');$('rF').innerHTML='<span class="text-success fw-bold fs-5">✔ Hebat!</span>';bicara('Hebat')}else{b.classList.replace('btn-outline-secondary','btn-danger');$('rF').innerHTML='<span class="text-danger fw-bold">Yang benar: '+esc(benar)+'</span>'}setTimeout(next,1300)})};
      const spk=`<button class="btn btn-lg btn-primary rounded-circle" id="rSp" style="width:70px;height:70px">🔊</button>`;
      if(mode==='suku'){const sy=w[1][gRnd(0,w[1].length-1)],all=[...new Set(KATA.flatMap(k=>k[1]).filter(x=>x!==sy))];pilih(`<div class="text-secondary mb-2">Dengarkan, lalu pilih suku kata yang benar</div>${spk}`,gShuf(all).slice(0,2).concat([sy]),sy,sy)}
      else if(mode==='gambar'){const ot=gShuf(KATA.filter(k=>k[0]!==w[0])).slice(0,2).map(k=>k[0]);pilih(`<div style="font-size:5rem">${w[2]}</div><div class="text-secondary">Kata apakah ini?</div>${spk}`,ot.concat([w[0]]),w[0],w[0])}
      else if(mode==='kalimat'){const k=KALIMAT[gRnd(0,KALIMAT.length-1)];pilih(`<div class="fs-4 fw-bold">${esc(k[0])}</div>${spk}`,k[1],k[1][k[2]],k[0].replace('...',k[1][k[2]]))}
      else{ // susun
        const sy=w[1].length>1?w[1]:['ba','ca'],parts=gShuf(sy.map((s,i)=>({s:s,i:i})));let got=[];
        const draw=()=>{el.innerHTML=head+`<div class="text-center"><div style="font-size:5rem">${w[2]}</div><div class="text-secondary mb-2">Susun suku kata menjadi kata</div><div class="d-flex gap-2 justify-content-center mb-3" style="min-height:64px">${sy.map((_,i)=>`<div class="border border-2 rounded-3 px-3 py-2 fs-3 fw-bold" style="min-width:70px;background:#EDE9FE">${got[i]?esc(got[i].s):'&nbsp;'}</div>`).join('')}</div><div class="d-flex gap-2 justify-content-center flex-wrap">${parts.map(p=>`<button class="btn btn-lg btn-outline-primary" style="font-size:1.6rem" data-p="${p.i}" ${got.some(g=>g.i===p.i)?'disabled':''}>${esc(p.s)}</button>`).join('')}</div><div class="mt-3"><button class="btn btn-sm btn-light" id="rU">⌫ Ulang</button> <button class="btn btn-sm btn-primary" id="rSp">🔊</button></div><div id="rF" class="mt-2" style="min-height:30px"></div></div>`;
          $('rM').onclick=menu;$('rSp').onclick=()=>bicara(w[0]);$('rU').onclick=()=>{got=[];draw()};
          el.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{got.push(parts.find(p=>p.i===+b.dataset.p));if(got.length<sy.length)return draw();const ok=got.every((g,i)=>g.i===i);draw();if(ok){sk++;$('rF').innerHTML='<span class="text-success fw-bold fs-5">✔ '+esc(w[0])+'</span>';bicara(w[0])}else{$('rF').innerHTML='<span class="text-danger fw-bold">Belum tepat. Coba lagi!</span>';got=[];setTimeout(draw,900);return}el.querySelectorAll('button').forEach(x=>x.disabled=true);setTimeout(next,1300)})};
        draw()}
    };
    const fin=()=>{const st=sk>=T?3:sk>=T*0.6?2:sk>=T*0.3?1:0;el.innerHTML=`<div class="text-center py-3"><div class="fs-1">${st>=2?'🏆':'💪'}</div><h2 class="h4 fw-extra">Skor ${sk} / ${T}</h2><div class="fs-3">${g4Stars(st)}</div><div class="mt-3"><button class="btn btn-pri" id="rA">Main Lagi</button> <button class="btn btn-light" id="rM">Menu</button></div></div>`;$('rA').onclick=()=>main(mode);$('rM').onclick=menu;bicara(sk>=T*0.6?'Hebat sekali':'Ayo coba lagi')};
    next();
  };
  menu();
};

// ── Belajar Menghitung ──
const HIT_E=['🍎','🍌','⭐','🐟','🚗','🎈','🌸','🐥','⚽','🍪'];
GM.g_hitung=el=>{
  let maks=10;
  const menu=()=>{el.innerHTML=gStart(el,'🔢','Belajar Menghitung','Pilih tingkat dan permainan:',`<div class="mb-3"><div class="btn-group" id="hR">${[10,20,50].map(m=>`<button class="btn ${m===maks?'btn-pri':'btn-outline-primary'}" data-r="${m}">1–${m}</button>`).join('')}</div></div>
    <div class="d-grid gap-2" style="max-width:420px;margin:auto"><button class="btn btn-lg btn-outline-primary" data-m="hitung">🍎 Hitung gambar</button><button class="btn btn-lg btn-outline-success" data-m="tambah">➕ Tambah & kurang bergambar</button><button class="btn btn-lg btn-outline-warning" data-m="banding">⚖️ Mana lebih banyak?</button><button class="btn btn-lg btn-outline-danger" data-m="urut">🔤 Lengkapi urutan bilangan</button></div>`);
    el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{maks=+b.dataset.r;menu()});el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>main(b.dataset.m))};
  const main=mode=>{
    let n=0,sk=0;const T=8,m=Math.min(maks,mode==='hitung'||mode==='banding'?Math.min(maks,20):maks);
    const next=()=>{if(n>=T)return fin();n++;
      const head=`<div class="d-flex justify-content-between mb-2"><button class="btn btn-sm btn-light" id="hM">← Menu</button><span>Soal ${n}/${T} · ⭐ ${sk}</span></div>`,em=HIT_E[gRnd(0,HIT_E.length-1)];
      const grp=(k,e)=>`<span style="font-size:${k>12?'1.6':'2.2'}rem;line-height:1.3">${Array(k).fill(e).join(' ')}</span>`;
      const pilih=(body,ans,fn)=>{let o=new Set([ans]);let g=0;while(o.size<4&&g++<80){const x=ans+gRnd(-3,3)||gRnd(1,m);if(x>=0&&x<=Math.max(m,ans+3))o.add(x)}
        el.innerHTML=head+`<div class="text-center">${body}<div class="d-flex gap-2 justify-content-center flex-wrap mt-3">${gShuf([...o]).map(x=>`<button class="btn btn-lg btn-outline-secondary px-4" style="font-size:1.8rem;min-width:84px" data-o="${x}">${x}</button>`).join('')}</div><div id="hF" class="mt-3" style="min-height:32px"></div></div>`;$('hM').onclick=menu;
        el.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const ok=+b.dataset.o===ans;el.querySelectorAll('[data-o]').forEach(x=>{x.disabled=true;if(+x.dataset.o===ans)x.classList.replace('btn-outline-secondary','btn-success')});if(ok)sk++;else b.classList.replace('btn-outline-secondary','btn-danger');$('hF').innerHTML=ok?'<span class="text-success fw-bold fs-5">✔ Benar!</span>':'<span class="text-danger fw-bold">Jawabannya '+ans+'</span>';if(fn)fn(ok);bicara(ok?'Benar':'Jawabannya '+ans);setTimeout(next,1300)})};
      if(mode==='hitung'){const k=gRnd(1,m);pilih(`<div class="text-secondary mb-2">Ada berapa gambar?</div><div class="p-3 rounded-3" style="background:#F5F3FF">${grp(k,em)}</div>`,k)}
      else if(mode==='tambah'){const a=gRnd(1,Math.max(2,Math.floor(m/2))),b=gRnd(1,Math.max(1,Math.min(a,m-a))),plus=Math.random()<.6||a-b<0;
        if(m>20){const x=gRnd(2,m-5),y=gRnd(1,m-x);pilih(`<div class="display-5 fw-extra">${plus?x+' + '+y:Math.max(x,y)+' − '+Math.min(x,y)} = ?</div>`,plus?x+y:Math.abs(x-y))}
        else pilih(`<div class="p-3 rounded-3" style="background:#F5F3FF">${grp(a,em)}<div class="display-6 my-1">${plus?'➕':'➖'}</div>${grp(b,em)}</div><div class="text-secondary mt-2">${a} ${plus?'+':'−'} ${b} = ?</div>`,plus?a+b:a-b)}
      else if(mode==='banding'){const a=gRnd(1,m),b=gRnd(1,m);if(a===b)return n--,next();el.innerHTML=head+`<div class="text-center"><div class="text-secondary mb-2">Ketuk kelompok yang <b>lebih banyak</b></div><div class="row g-3"><div class="col-6"><button class="btn w-100 p-3 border-2 btn-outline-secondary" data-b="a">${grp(a,em)}</button></div><div class="col-6"><button class="btn w-100 p-3 border-2 btn-outline-secondary" data-b="b">${grp(b,HIT_E[(HIT_E.indexOf(em)+3)%HIT_E.length])}</button></div></div><div id="hF" class="mt-3" style="min-height:32px"></div></div>`;$('hM').onclick=menu;
        el.querySelectorAll('[data-b]').forEach(bt=>bt.onclick=()=>{const ok=(bt.dataset.b==='a')===(a>b);el.querySelectorAll('[data-b]').forEach(x=>x.disabled=true);bt.classList.replace('btn-outline-secondary',ok?'btn-success':'btn-danger');if(ok)sk++;$('hF').innerHTML=ok?'<span class="text-success fw-bold fs-5">✔ Benar! ('+a+' dan '+b+')</span>':'<span class="text-danger fw-bold">Yang lebih banyak: '+(a>b?'kiri':'kanan')+' ('+a+' dan '+b+')</span>';setTimeout(next,1500)})}
      else{const st=gRnd(1,Math.max(1,m-4)),k=gRnd(1,4),seq=[st,st+1,st+2,st+3,st+4];pilih(`<div class="text-secondary mb-2">Bilangan berapa yang hilang?</div><div class="display-6 fw-extra">${seq.map((x,i)=>i===k?'<span style="border-bottom:4px solid #7C3AED;padding:0 14px">?</span>':x).join(' , ')}</div>`,seq[k])}
    };
    const fin=()=>{const st=sk>=T?3:sk>=T*0.6?2:sk>=T*0.3?1:0;el.innerHTML=`<div class="text-center py-3"><div class="fs-1">${st>=2?'🏆':'💪'}</div><h2 class="h4 fw-extra">Skor ${sk} / ${T}</h2><div class="fs-3">${g4Stars(st)}</div><div class="mt-3"><button class="btn btn-pri" id="hA">Main Lagi</button> <button class="btn btn-light" id="hM">Menu</button></div></div>`;$('hA').onclick=()=>main(mode);$('hM').onclick=menu};
    next();
  };
  menu();
};

// ── Mengenal Rumus Matematika ──
const sv=(b)=>`<svg viewBox="0 0 120 80" width="120" height="80" style="max-width:100%">${b}</svg>`;
const RUMUS=[
 {n:'Luas Persegi',f:'L = s × s',ex:'s = 6 cm → L = 36 cm²',g:sv('<rect x="30" y="8" width="64" height="64" fill="#C4B5FD" stroke="#6D28D9" stroke-width="3"/><text x="62" y="46" text-anchor="middle" font-size="13">s</text>')},
 {n:'Keliling Persegi',f:'K = 4 × s',ex:'s = 6 cm → K = 24 cm',g:sv('<rect x="30" y="8" width="64" height="64" fill="none" stroke="#6D28D9" stroke-width="5"/>')},
 {n:'Luas Persegi Panjang',f:'L = p × l',ex:'p = 8, l = 5 → L = 40',g:sv('<rect x="14" y="16" width="92" height="48" fill="#A7F3D0" stroke="#047857" stroke-width="3"/><text x="60" y="44" text-anchor="middle" font-size="13">p × l</text>')},
 {n:'Keliling Persegi Panjang',f:'K = 2 × (p + l)',ex:'p = 8, l = 5 → K = 26',g:sv('<rect x="14" y="16" width="92" height="48" fill="none" stroke="#047857" stroke-width="5"/>')},
 {n:'Luas Segitiga',f:'L = ½ × a × t',ex:'a = 10, t = 6 → L = 30',g:sv('<polygon points="60,8 20,70 100,70" fill="#FDE68A" stroke="#B45309" stroke-width="3"/><line x1="60" y1="8" x2="60" y2="70" stroke="#B45309" stroke-dasharray="4"/>')},
 {n:'Luas Jajar Genjang',f:'L = a × t',ex:'a = 9, t = 4 → L = 36',g:sv('<polygon points="30,70 10,20 90,20 110,70" fill="#FBCFE8" stroke="#BE185D" stroke-width="3"/>')},
 {n:'Luas Trapesium',f:'L = ½ × (a + b) × t',ex:'a = 4, b = 8, t = 5 → L = 30',g:sv('<polygon points="30,20 90,20 110,70 10,70" fill="#BAE6FD" stroke="#0369A1" stroke-width="3"/>')},
 {n:'Luas Lingkaran',f:'L = π × r × r',ex:'r = 7 → L = 22/7 × 7 × 7 = 154',g:sv('<circle cx="60" cy="40" r="32" fill="#FECACA" stroke="#B91C1C" stroke-width="3"/><line x1="60" y1="40" x2="92" y2="40" stroke="#B91C1C" stroke-width="3"/><text x="76" y="36" font-size="12">r</text>')},
 {n:'Keliling Lingkaran',f:'K = 2 × π × r',ex:'r = 7 → K = 2 × 22/7 × 7 = 44',g:sv('<circle cx="60" cy="40" r="32" fill="none" stroke="#B91C1C" stroke-width="5"/>')},
 {n:'Volume Kubus',f:'V = s × s × s',ex:'s = 4 → V = 64',g:sv('<polygon points="20,30 70,30 70,75 20,75" fill="#DDD6FE" stroke="#5B21B6" stroke-width="2"/><polygon points="20,30 40,10 90,10 70,30" fill="#C4B5FD" stroke="#5B21B6" stroke-width="2"/><polygon points="70,30 90,10 90,55 70,75" fill="#A78BFA" stroke="#5B21B6" stroke-width="2"/>')},
 {n:'Volume Balok',f:'V = p × l × t',ex:'p = 6, l = 4, t = 3 → V = 72',g:sv('<polygon points="10,34 80,34 80,74 10,74" fill="#D9F99D" stroke="#3F6212" stroke-width="2"/><polygon points="10,34 30,14 100,14 80,34" fill="#BEF264" stroke="#3F6212" stroke-width="2"/><polygon points="80,34 100,14 100,54 80,74" fill="#A3E635" stroke="#3F6212" stroke-width="2"/>')},
 {n:'Volume Tabung',f:'V = π × r × r × t',ex:'r = 7, t = 10 → V = 1.540',g:sv('<ellipse cx="60" cy="18" rx="30" ry="10" fill="#FDBA74" stroke="#C2410C" stroke-width="2"/><rect x="30" y="18" width="60" height="44" fill="#FED7AA" stroke="#C2410C" stroke-width="2"/><ellipse cx="60" cy="62" rx="30" ry="10" fill="#FDBA74" stroke="#C2410C" stroke-width="2"/>')},
 {n:'Kecepatan',f:'v = s ÷ t',ex:'s = 120 km, t = 2 jam → v = 60 km/jam',g:sv('<text x="60" y="52" text-anchor="middle" font-size="30">🚗</text>')},
 {n:'Rata-rata',f:'Rata-rata = jumlah data ÷ banyak data',ex:'6, 8, 10 → 24 ÷ 3 = 8',g:sv('<text x="60" y="52" text-anchor="middle" font-size="26">Σ ÷ n</text>')},
 {n:'Teorema Pythagoras',f:'c² = a² + b²',ex:'a = 3, b = 4 → c = 5',g:sv('<polygon points="20,70 100,70 20,20" fill="#E9D5FF" stroke="#7E22CE" stroke-width="3"/><text x="58" y="82" font-size="11">a</text><text x="8" y="48" font-size="11">b</text><text x="66" y="40" font-size="11">c</text>')}
];
function rumusSoal(){
  const r=gRnd(0,14),near=x=>{const s=new Set([x]);let g=0;while(s.size<4&&g++<80){const d=gRnd(1,Math.max(3,Math.round(x*.25)))*(Math.random()<.5?-1:1);if(x+d>0)s.add(x+d)}return [...s]};
  let q,a,e;
  const R=[()=>{const s=gRnd(2,12);q='Luas persegi dengan sisi '+s+' cm = ... cm²';a=s*s;e='L = s × s'},()=>{const s=gRnd(2,15);q='Keliling persegi dengan sisi '+s+' cm = ... cm';a=4*s;e='K = 4 × s'},
   ()=>{const p=gRnd(3,15),l=gRnd(2,9);q='Luas persegi panjang p = '+p+' cm, l = '+l+' cm = ... cm²';a=p*l;e='L = p × l'},()=>{const p=gRnd(3,15),l=gRnd(2,9);q='Keliling persegi panjang p = '+p+' cm, l = '+l+' cm = ... cm';a=2*(p+l);e='K = 2 × (p + l)'},
   ()=>{const t=gRnd(2,10)*2,b=gRnd(3,12);q='Luas segitiga alas '+b+' cm, tinggi '+t+' cm = ... cm²';a=b*t/2;e='L = ½ × a × t'},()=>{const b=gRnd(3,12),t=gRnd(2,9);q='Luas jajar genjang alas '+b+' cm, tinggi '+t+' cm = ... cm²';a=b*t;e='L = a × t'},
   ()=>{const x=gRnd(2,8),y=gRnd(3,10),t=gRnd(2,5)*2;q='Luas trapesium sisi sejajar '+x+' dan '+y+' cm, tinggi '+t+' cm = ... cm²';a=(x+y)*t/2;e='L = ½ × (a + b) × t'},()=>{const rr=[7,14,21][gRnd(0,2)];q='Luas lingkaran r = '+rr+' cm (π = 22/7) = ... cm²';a=22*rr*rr/7;e='L = π × r × r'},
   ()=>{const rr=[7,14,21][gRnd(0,2)];q='Keliling lingkaran r = '+rr+' cm (π = 22/7) = ... cm';a=2*22*rr/7;e='K = 2 × π × r'},()=>{const s=gRnd(2,9);q='Volume kubus rusuk '+s+' cm = ... cm³';a=s*s*s;e='V = s × s × s'},
   ()=>{const p=gRnd(3,10),l=gRnd(2,8),t=gRnd(2,7);q='Volume balok '+p+' × '+l+' × '+t+' cm = ... cm³';a=p*l*t;e='V = p × l × t'},()=>{const rr=[7,14][gRnd(0,1)],t=gRnd(2,10);q='Volume tabung r = '+rr+' cm, t = '+t+' cm (π = 22/7) = ... cm³';a=22*rr*rr*t/7;e='V = π × r × r × t'},
   ()=>{const w=gRnd(2,6),v=gRnd(4,15)*5;q='Mobil bergerak '+(v*w)+' km dalam '+w+' jam. Kecepatannya = ... km/jam';a=v;e='v = s ÷ t'},()=>{const n=gRnd(3,5),b=gRnd(5,9);const arr=Array.from({length:n},()=>b+gRnd(-2,2)*1);const sm=arr.reduce((x,y)=>x+y,0);q='Rata-rata dari '+arr.join(', ')+' (dibulatkan) = ...';a=Math.round(sm/n);e='Rata-rata = jumlah ÷ banyak data'},
   ()=>{const T=[[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15]][gRnd(0,4)];q='Segitiga siku-siku dengan sisi tegak '+T[0]+' dan '+T[1]+'. Sisi miringnya = ...';a=T[2];e='c² = a² + b²'}];
  R[r]();return{q:q,o:near(a).map(String),a:0,c:String(a),e:e};
}
GM.g_rumus=el=>{
  const tab=t=>{el.innerHTML=`<ul class="nav nav-pills mb-3"><li class="nav-item"><button class="nav-link ${t==='k'?'active':''}" onclick="GM._rumusTab('k')">📇 Kartu Rumus</button></li><li class="nav-item"><button class="nav-link ${t==='l'?'active':''}" onclick="GM._rumusTab('l')">🎯 Latihan</button></li></ul><div id="rBody"></div>`;
    if(t==='k')$('rBody').innerHTML=`<div class="row g-3">${RUMUS.map(r=>`<div class="col-sm-6 col-lg-4"><div class="card-x p-3 h-100 text-center"><div>${r.g}</div><div class="fw-bold mt-1">${esc(r.n)}</div><div class="fs-5 fw-extra my-1" style="color:var(--pri)">${esc(r.f)}</div><div class="small text-secondary">Contoh: ${esc(r.ex)}</div></div></div>`).join('')}</div>`;
    else{const items=Array.from({length:30},()=>{const x=rumusSoal();const c=x.c,o=gShuf(x.o);return{q:x.q,o:o,a:o.indexOf(c),e:x.e}});quizRun($('rBody'),'Latihan Rumus','🎯',items,{desc:'Hitung dengan rumus yang tepat.',n:10})}};
  GM._rumusTab=tab;tab('k');
};

// ── Belajar Coding (robot labirin) ──
const CODE_LV=[
 {t:'Maju terus!',g:['S...G'],h:'Gunakan blok Maju beberapa kali.'},
 {t:'Belok kanan',g:['S...','###.','...G'],h:'Maju, belok kanan, maju lagi, lalu belok kiri.'},
 {t:'Dua tikungan',g:['S.#.','#.#.','#..G'],h:'Belok kanan ke bawah, lalu belok kiri.'},
 {t:'Ulangi biar singkat',g:['S........G'],h:'Pakai blok Ulangi: ulangi 3× lalu 3× 3 langkah.'},
 {t:'Tangga',g:['S.....','.#.#..','.#.#.G','.....#'],h:'Cari jalan; kamu boleh memakai Ulangi.'},
 {t:'Zig-zag',g:['S#...','.#.#.','.#.#.','...#G'],h:'Turun, maju, naik, maju… pakai Ulangi 2×.'},
 {t:'Kebun bintang',g:['S..#...','.#.#.#.','.#...#G','.#####.','.......'],h:'Hati-hati dinding. Rencanakan dulu urutannya.'},
 {t:'Tantangan akhir',g:['S.#....','#.#.##.','#.#..#.','#.##.#.','#....#G'],h:'Gabungkan Maju, Belok, dan Ulangi.'}
];
function codeSolvable(lv){ // BFS ruang keadaan (posisi,arah) dengan perintah F/L/R
  const g=lv.g,H=g.length,W=g[0].length;let sr=0,sc=0;g.forEach((r,i)=>{const j=r.indexOf('S');if(j>=0){sr=i;sc=j}});
  const seen=new Set([sr+','+sc+',0']),q=[[sr,sc,0,0]],DR=[0,1,0,-1],DC=[1,0,-1,0];
  while(q.length){const [r,c,d,n]=q.shift();if(g[r][c]==='G')return n;
    [[r,c,(d+1)%4],[r,c,(d+3)%4],[r+DR[d],c+DC[d],d]].forEach(s=>{const[nr,nc,nd]=s;if(nr<0||nc<0||nr>=H||nc>=W||g[nr][nc]==='#')return;const k=nr+','+nc+','+nd;if(!seen.has(k)){seen.add(k);q.push([nr,nc,nd,n+1])}})}
  return -1;
}
GM.g_coding=el=>{
  let lv=0;try{lv=Math.min(CODE_LV.length-1,+localStorage.getItem('code_lv')||0)}catch(e){}
  const menu=()=>{el.innerHTML=gStart(el,'🤖','Belajar Coding','Susun perintah agar robot sampai ke bendera 🏁. Pilih level:',`<div class="d-flex flex-wrap gap-2 justify-content-center" style="max-width:520px;margin:auto">${CODE_LV.map((l,i)=>`<button class="btn btn-lg ${i<=lv?'btn-outline-primary':'btn-outline-secondary'}" ${i>lv?'disabled':''} data-l="${i}" style="min-width:64px">${i+1}${i<lv?' ✔':''}</button>`).join('')}</div>`);
    el.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>play(+b.dataset.l))};
  const DIR=['➡️','⬇️','⬅️','⬆️'],DR=[0,1,0,-1],DC=[1,0,-1,0];
  const play=i=>{
    const L=CODE_LV[i],H=L.g.length,W=L.g[0].length;let sr=0,sc=0;L.g.forEach((r,y)=>{const x=r.indexOf('S');if(x>=0){sr=y;sc=x}});
    let prog=[],cur=[prog],run=false,pos={r:sr,c:sc,d:0};
    const nodeHtml=(a,d)=>a.map(n=>n.t==='R'?`<div class="cd-rep" style="margin-left:${d*8}px">🔁 Ulangi ${n.n}×<div>${nodeHtml(n.b,d+1)||'<i class="text-secondary small">(kosong — tambah perintah)</i>'}</div></div>`:`<span class="cd-cmd">${{F:'⬆ Maju',L:'↶ Kiri',R:'↷ Kanan'}[n.t]}</span>`).join('');
    const board=()=>`<div class="cd-board" style="grid-template-columns:repeat(${W},1fr);max-width:${Math.min(60*W,420)}px">${L.g.map((r,y)=>[...r].map((ch,x)=>`<div class="cd-c ${ch==='#'?'wall':''}">${pos.r===y&&pos.c===x?'<span class="cd-bot">🤖</span><small class="cd-dir">'+DIR[pos.d]+'</small>':ch==='G'?'🏁':ch==='#'?'🧱':''}</div>`).join('')).join('')}</div>`;
    const draw=(msg,ok)=>{el.innerHTML=`<div class="d-flex justify-content-between mb-2"><button class="btn btn-sm btn-light" id="cM">← Level</button><b>Level ${i+1}: ${esc(L.t)}</b><span></span></div><div class="row g-3"><div class="col-md-6 text-center">${board()}<div class="small text-secondary mt-2">💡 ${esc(L.h)}</div></div>
      <div class="col-md-6"><div class="cd-prog" id="cP">${nodeHtml(prog,0)||'<span class="text-secondary">Program kosong. Tekan tombol perintah di bawah.</span>'}</div>
      <div class="d-flex flex-wrap gap-2 my-2"><button class="btn btn-primary" data-k="F" ${run?'disabled':''}>⬆ Maju</button><button class="btn btn-primary" data-k="L" ${run?'disabled':''}>↶ Belok Kiri</button><button class="btn btn-primary" data-k="R" ${run?'disabled':''}>↷ Belok Kanan</button></div>
      <div class="d-flex flex-wrap gap-2 mb-2"><select id="cN" class="form-select w-auto">${[2,3,4,5,6,8,9].map(n=>`<option>${n}</option>`).join('')}</select><button class="btn btn-outline-warning" id="cRep" ${run?'disabled':''}>🔁 Ulangi</button><button class="btn btn-outline-secondary" id="cEnd" ${cur.length>1&&!run?'':'disabled'}>✔ Tutup ulangan</button><button class="btn btn-outline-danger" id="cDel" ${run?'disabled':''}>⌫ Hapus</button><button class="btn btn-outline-secondary" id="cRst" ${run?'disabled':''}>🗑 Kosongkan</button></div>
      <button class="btn btn-success btn-lg w-100" id="cRun" ${run||!prog.length?'disabled':''}>▶ Jalankan</button>${msg?`<div class="alert alert-${ok?'success':'warning'} mt-2 mb-0">${msg}${ok&&i<CODE_LV.length-1?'<div class="mt-2"><button class="btn btn-pri btn-sm" id="cNx">Level berikutnya →</button></div>':''}</div>`:''}</div></div>`;
      $('cM').onclick=menu;if($('cNx'))$('cNx').onclick=()=>play(i+1);
      el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{cur[cur.length-1].push({t:b.dataset.k});draw()});
      $('cRep').onclick=()=>{const n={t:'R',n:+$('cN').value,b:[]};cur[cur.length-1].push(n);cur.push(n.b);draw()};
      $('cEnd').onclick=()=>{if(cur.length>1)cur.pop();draw()};
      $('cDel').onclick=()=>{const a=cur[cur.length-1];if(a.length)a.pop();else if(cur.length>1){cur.pop();cur[cur.length-1].pop()}draw()};
      $('cRst').onclick=()=>{prog=[];cur=[prog];draw()};
      $('cRun').onclick=jalan};
    const flat=(a,out)=>{a.forEach(n=>{if(n.t==='R'){for(let k=0;k<n.n&&out.length<400;k++)flat(n.b,out)}else out.push(n.t)});return out};
    const jalan=async()=>{
      const cmds=flat(prog,[]);run=true;pos={r:sr,c:sc,d:0};draw();let ok=true,why='';
      for(const c of cmds){await new Promise(r=>setTimeout(r,380));
        if(c==='L')pos.d=(pos.d+3)%4;else if(c==='R')pos.d=(pos.d+1)%4;else{const nr=pos.r+DR[pos.d],nc=pos.c+DC[pos.d];if(nr<0||nc<0||nr>=H||nc>=W||L.g[nr][nc]==='#'){ok=false;why='Robot menabrak dinding! 💥';break}pos.r=nr;pos.c=nc}
        const bd=el.querySelector('.cd-board');if(!bd)return;bd.outerHTML=board();if(L.g[pos.r][pos.c]==='G')break}
      run=false;const goal=ok&&L.g[pos.r][pos.c]==='G';
      if(goal){try{if(i>=lv){lv=Math.min(CODE_LV.length-1,i+1);localStorage.setItem('code_lv',lv)}}catch(e){}draw('🎉 Hebat! Robot sampai ke bendera dengan '+cmds.length+' langkah.'+(i===CODE_LV.length-1?' Kamu menamatkan semua level! 🏆':''),true)}
      else{pos={r:sr,c:sc,d:0};draw(ok?'Robot belum sampai bendera. Perbaiki programmu lalu coba lagi!':why)}
    };
    draw();
  };
  menu();
};
