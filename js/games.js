// ============================================================
// GAME EDUKATIF — berjalan penuh di peramban (tanpa server)
// ============================================================
const GM={};
const gShuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const gRnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const gBest=(k,v)=>{try{const o=+localStorage.getItem('best_'+k)||0;if(v!==undefined&&v>o){localStorage.setItem('best_'+k,v);return v}return o}catch(e){return 0}};
function renderGame(id){
  const f=GM[id];if(!f)throw new Error('Game belum tersedia.');
  $('app-container').innerHTML='<div class="card-x p-3 p-md-4"><div id="gbody"></div></div>';
  f($('gbody'));
}
const gStart=(el,ic,judul,desc,extra)=>`<div class="text-center py-3"><div class="fs-1">${ic}</div><h2 class="h4 fw-extra">${judul}</h2><p class="text-secondary mb-3">${desc}</p>${extra||''}</div>`;

// ── Mesin kuis pilihan ganda (dipakai Teka-Teki Sains, Kuis Sejarah, Kuis Al-Quran, Kuis Interaktif) ──
function quizRun(el,judul,ic,items,opt){
  opt=opt||{};const total=Math.min(opt.n||10,items.length);
  const menu=()=>{el.innerHTML=gStart(el,ic,judul,(opt.desc||'Jawab pertanyaan dengan benar.')+' ('+items.length+' soal tersedia)',
    `<div class="d-flex gap-2 justify-content-center align-items-center flex-wrap"><label class="small">Jumlah soal</label><select id="qN" class="form-select w-auto">${[5,10,15,20].filter(n=>n<=items.length||n===5).map(n=>`<option ${n===total?'selected':''}>${n}</option>`).join('')}</select><button class="btn btn-pri" onclick="window.__q.go()"><i class="bi bi-play-fill"></i> Mulai</button></div>${gBest('quiz_'+judul)?'<div class="small text-secondary mt-3">Skor terbaik: '+gBest('quiz_'+judul)+'%</div>':''}`)};
  const Q={go(){
    const n=Math.min(+($('qN')||{}).value||total,items.length),qs=gShuf(items).slice(0,n);let i=0,sc=0,done=false;
    const show=()=>{
      const q=qs[i],ans=q.o[q.a],ops=gShuf(q.o);done=false;
      el.innerHTML=`<div class="d-flex justify-content-between small text-secondary mb-2"><span>Soal ${i+1} / ${n}</span><span>Skor: <b>${sc}</b></span></div><div class="progress mb-3" style="height:8px"><div class="progress-bar" style="width:${i*100/n}%;background:var(--pri)"></div></div>
      <h3 class="h5 mb-3">${esc(q.q)}</h3><div class="d-grid gap-2" id="qOps">${ops.map((o,k)=>`<button class="btn btn-outline-secondary text-start py-3" data-k="${k}">${'ABCD'[k]}. ${esc(o)}</button>`).join('')}</div><div id="qFb" class="mt-3"></div>`;
      el.querySelectorAll('#qOps button').forEach(b=>b.onclick=()=>{
        if(done)return;done=true;const ok=ops[+b.dataset.k]===ans;if(ok)sc++;
        el.querySelectorAll('#qOps button').forEach(x=>{const c=ops[+x.dataset.k]===ans;x.classList.remove('btn-outline-secondary');x.classList.add(c?'btn-success':(x===b?'btn-danger':'btn-outline-secondary'));x.disabled=true});
        $('qFb').innerHTML=`<div class="alert alert-${ok?'success':'warning'} mb-2">${ok?'<b>Benar!</b>':'<b>Belum tepat.</b> Jawaban: '+esc(ans)}${q.e?'<div class="small mt-1">'+esc(q.e)+'</div>':''}</div><button class="btn btn-pri" id="qNext">${i+1<n?'Lanjut':'Lihat Hasil'}</button>`;
        $('qNext').onclick=()=>{i++;i<n?show():fin()};
      });
    };
    const fin=()=>{const p=Math.round(sc*100/n);gBest('quiz_'+judul,p);
      el.innerHTML=`<div class="text-center py-3"><div class="fs-1">${p>=80?'🏆':p>=50?'👍':'💪'}</div><h2 class="h4 fw-extra">Skor ${sc} / ${n} (${p}%)</h2><p class="text-secondary">${p>=80?'Luar biasa!':p>=50?'Bagus, terus berlatih!':'Ayo coba lagi, pasti bisa!'}</p><button class="btn btn-pri" onclick="window.__q.go()">Main Lagi</button> <button class="btn btn-light" onclick="window.__q.menu()">Menu</button></div>`};
    show();
  },menu:menu};
  window.__q=Q;menu();
}

// ── Data soal ──
const SAINS=[
 {q:'Aku dikenal sebagai planet merah. Siapakah aku?',o:['Venus','Mars','Jupiter','Merkurius'],a:1,e:'Permukaan Mars kaya besi oksida sehingga tampak kemerahan.'},
 {q:'Proses tumbuhan membuat makanan dengan bantuan cahaya matahari disebut ...',o:['Respirasi','Fotosintesis','Transpirasi','Fermentasi'],a:1,e:'Fotosintesis menghasilkan glukosa dan oksigen.'},
 {q:'Gas yang kita hirup untuk bernapas adalah ...',o:['Oksigen','Nitrogen','Karbon dioksida','Hidrogen'],a:0},
 {q:'Zat hijau pada daun disebut ...',o:['Klorofil','Stomata','Xilem','Getah'],a:0},
 {q:'Benda langit yang mengelilingi Bumi adalah ...',o:['Matahari','Bulan','Bintang','Komet'],a:1},
 {q:'Alat untuk mengukur suhu adalah ...',o:['Barometer','Termometer','Higrometer','Anemometer'],a:1},
 {q:'Organ yang memompa darah ke seluruh tubuh adalah ...',o:['Paru-paru','Hati','Jantung','Ginjal'],a:2},
 {q:'Gaya yang menarik benda ke pusat Bumi disebut ...',o:['Gaya magnet','Gaya gesek','Gaya gravitasi','Gaya pegas'],a:2},
 {q:'Planet terbesar di tata surya adalah ...',o:['Saturnus','Bumi','Neptunus','Jupiter'],a:3},
 {q:'Perubahan wujud air menjadi uap disebut ...',o:['Mengembun','Membeku','Menguap','Mencair'],a:2},
 {q:'Sumber energi utama bagi Bumi adalah ...',o:['Bulan','Angin','Matahari','Batu bara'],a:2},
 {q:'Bagian tumbuhan yang menyerap air dari dalam tanah adalah ...',o:['Daun','Akar','Batang','Bunga'],a:1},
 {q:'Jumlah tulang manusia dewasa kira-kira ...',o:['106','206','306','406'],a:1},
 {q:'Hewan pemakan tumbuhan disebut ...',o:['Karnivora','Omnivora','Herbivora','Insektivora'],a:2},
 {q:'Alat optik untuk melihat benda yang sangat kecil adalah ...',o:['Teleskop','Periskop','Mikroskop','Kamera'],a:2},
 {q:'Air mendidih pada suhu ... °C (tekanan normal).',o:['50','80','100','120'],a:2},
 {q:'Perubahan wujud gas menjadi cair disebut ...',o:['Menguap','Mengembun','Menyublim','Mencair'],a:1},
 {q:'Pada metamorfosis sempurna, ulat berubah menjadi kepompong lalu menjadi ...',o:['Belalang','Kupu-kupu','Jangkrik','Kecoa'],a:1},
 {q:'Lapisan Bumi paling luar tempat kita tinggal disebut ...',o:['Mantel','Inti luar','Kerak bumi','Inti dalam'],a:2},
 {q:'Pelangi terjadi karena cahaya matahari mengalami ...',o:['Pemantulan saja','Pembiasan dan penguraian oleh tetes air','Penyerapan oleh awan','Peleburan'],a:1}
];
const SEJARAH=[
 {q:'Proklamasi Kemerdekaan Indonesia dibacakan pada tanggal ...',o:['17 Agustus 1945','28 Oktober 1928','10 November 1945','1 Juni 1945'],a:0},
 {q:'Presiden pertama Republik Indonesia adalah ...',o:['Soeharto','Soekarno','B.J. Habibie','Moh. Hatta'],a:1},
 {q:'Sumpah Pemuda diikrarkan pada tanggal ...',o:['20 Mei 1908','28 Oktober 1928','17 Agustus 1945','2 Mei 1889'],a:1},
 {q:'Kerajaan Hindu-Buddha yang berpusat di Sumatra Selatan pada abad ke-7 adalah ...',o:['Majapahit','Mataram Kuno','Sriwijaya','Kutai'],a:2},
 {q:'Candi Borobudur dibangun pada masa wangsa ...',o:['Syailendra','Sanjaya','Singasari','Kediri'],a:0},
 {q:'Mahapatih Majapahit yang terkenal dengan Sumpah Palapa adalah ...',o:['Gajah Mada','Mpu Prapanca','Raden Wijaya','Hayam Wuruk'],a:0},
 {q:'Perang Diponegoro (Perang Jawa) terjadi pada tahun ...',o:['1825-1830','1873-1904','1945-1949','1908-1912'],a:0},
 {q:'Pertempuran 10 November 1945 terjadi di kota ...',o:['Bandung','Semarang','Surabaya','Medan'],a:2,e:'Tanggal itu diperingati sebagai Hari Pahlawan.'},
 {q:'Teks Proklamasi diketik oleh ...',o:['Fatmawati','Sayuti Melik','Ahmad Soebardjo','Sukarni'],a:1},
 {q:'Bendera Pusaka Sang Saka Merah Putih dijahit oleh ...',o:['Cut Nyak Dien','R.A. Kartini','Fatmawati','Dewi Sartika'],a:2},
 {q:'Konferensi Asia Afrika 1955 diselenggarakan di ...',o:['Jakarta','Bandung','Yogyakarta','Surabaya'],a:1},
 {q:'Organisasi Budi Utomo berdiri pada tahun ...',o:['1908','1928','1945','1912'],a:0,e:'Kelahirannya diperingati sebagai Hari Kebangkitan Nasional (20 Mei).'},
 {q:'Pahlawan wanita dari Aceh yang gigih melawan Belanda adalah ...',o:['Martha Christina Tiahahu','Cut Nyak Dien','R.A. Kartini','Dewi Sartika'],a:1},
 {q:'Kapitan Pattimura berasal dari daerah ...',o:['Maluku','Sulawesi Selatan','Aceh','Jawa Barat'],a:0},
 {q:'Sultan Hasanuddin dijuluki "Ayam Jantan dari Timur" dan berasal dari kerajaan ...',o:['Gowa','Ternate','Banten','Demak'],a:0},
 {q:'Hari lahir Pancasila diperingati setiap tanggal ...',o:['1 Juni','17 Agustus','28 Oktober','2 Mei'],a:0},
 {q:'Kongsi dagang Belanda VOC didirikan pada tahun ...',o:['1500','1602','1700','1800'],a:1},
 {q:'Raja Mataram yang menyerang VOC di Batavia pada abad ke-17 adalah ...',o:['Sultan Agung','Sultan Ageng Tirtayasa','Sultan Iskandar Muda','Pangeran Antasari'],a:0},
 {q:'Bapak Pendidikan Nasional yang mendirikan Taman Siswa adalah ...',o:['Ki Hajar Dewantara','Dewi Sartika','K.H. Ahmad Dahlan','Moh. Hatta'],a:0,e:'Hari Pendidikan Nasional diperingati tiap 2 Mei.'},
 {q:'Belanda mengakui kedaulatan Indonesia melalui Konferensi Meja Bundar pada ...',o:['27 Desember 1949','17 Agustus 1945','5 Juli 1959','1 Maret 1949'],a:0}
];
const QURAN=[
 {q:'Jumlah surah dalam Al-Quran adalah ...',o:['100','114','120','30'],a:1},
 {q:'Surah pertama dalam Al-Quran adalah ...',o:['Al-Baqarah','Al-Fatihah','An-Nas','Al-Ikhlas'],a:1},
 {q:'Surah terpanjang dalam Al-Quran adalah ...',o:['Al-Baqarah','Ali Imran','An-Nisa','Al-Maidah'],a:0},
 {q:'Surah terakhir dalam Al-Quran adalah ...',o:['Al-Falaq','An-Nas','Al-Ikhlas','Al-Kautsar'],a:1},
 {q:'Al-Quran terbagi menjadi ... juz.',o:['20','25','30','40'],a:2},
 {q:'Surah Al-Fatihah terdiri dari ... ayat.',o:['5','6','7','8'],a:2},
 {q:'Surah Al-Ikhlas terdiri dari ... ayat.',o:['3','4','5','6'],a:1},
 {q:'Surah terpendek dalam Al-Quran adalah ...',o:['Al-Kautsar','Al-Asr','An-Nasr','Al-Ikhlas'],a:0,e:'Al-Kautsar terdiri dari 3 ayat.'},
 {q:'Wahyu pertama yang diterima Nabi Muhammad SAW adalah surah ...',o:['Al-Alaq ayat 1-5','Al-Fatihah','Al-Muddatsir','Yasin'],a:0,e:'Diterima di Gua Hira.'},
 {q:'Malaikat penyampai wahyu kepada para nabi adalah ...',o:['Mikail','Israfil','Jibril','Izrail'],a:2},
 {q:'Kitab Taurat diturunkan kepada Nabi ...',o:['Isa','Musa','Daud','Ibrahim'],a:1},
 {q:'Kitab Zabur diturunkan kepada Nabi ...',o:['Daud','Musa','Isa','Sulaiman'],a:0},
 {q:'Kitab Injil diturunkan kepada Nabi ...',o:['Isa','Musa','Yusuf','Nuh'],a:0},
 {q:'Jumlah rukun Islam ada ...',o:['4','5','6','7'],a:1},
 {q:'Jumlah rukun iman ada ...',o:['5','6','7','8'],a:1},
 {q:'Ayat Kursi terdapat dalam surah Al-Baqarah ayat ...',o:['155','255','286','100'],a:1},
 {q:'Nabi yang pernah berada di dalam perut ikan besar adalah ...',o:['Nabi Yunus','Nabi Nuh','Nabi Ayub','Nabi Yusuf'],a:0},
 {q:'Nabi yang diperintahkan Allah membuat bahtera besar adalah ...',o:['Nabi Nuh','Nabi Musa','Nabi Ibrahim','Nabi Hud'],a:0},
 {q:'Surah Al-Fil mengisahkan tentang ...',o:['Pasukan bergajah','Kaum Tsamud','Banjir besar','Nabi Yusuf'],a:0},
 {q:'Bulan diwajibkannya puasa bagi umat Islam adalah bulan ...',o:['Rajab','Syaban','Ramadan','Muharram'],a:2},
 {q:'Salat Subuh terdiri dari ... rakaat.',o:['2','3','4','5'],a:0},
 {q:'Nabi Muhammad SAW dan para sahabat berhijrah dari Makkah ke ...',o:['Madinah','Thaif','Habasyah','Yaman'],a:0}
];
GM.g_sains=el=>quizRun(el,'Teka-Teki Sains','🔬',SAINS,{desc:'Uji pengetahuan sainsmu.'});
GM.g_sejarah=el=>quizRun(el,'Kuis Sejarah','🏛️',SEJARAH,{desc:'Seberapa kenal kamu dengan sejarah Indonesia?'});
GM.g_quran=el=>quizRun(el,'Kuis Al-Quran','📖',QURAN,{desc:'Pengetahuan dasar tentang Al-Quran dan keislaman.'});

// ── Matematika Cepat ──
GM.g_matcep=el=>{
  const menu=()=>{el.innerHTML=gStart(el,'➗','Matematika Cepat','Jawab sebanyak mungkin soal dalam 60 detik. Ketik jawaban lalu tekan Enter.',
   `<div class="d-flex gap-2 justify-content-center flex-wrap"><select id="mOp" class="form-select w-auto"><option value="+">Penjumlahan</option><option value="-">Pengurangan</option><option value="*">Perkalian</option><option value="/">Pembagian</option><option value="?">Campuran</option></select><select id="mLv" class="form-select w-auto"><option value="0">Mudah</option><option value="1">Sedang</option><option value="2">Sulit</option></select><button class="btn btn-pri" id="mGo"><i class="bi bi-play-fill"></i> Mulai</button></div><div class="small text-secondary mt-3" id="mBest"></div>`);
    $('mGo').onclick=()=>play($('mOp').value,+$('mLv').value)};
  const gen=(op,lv)=>{
    if(op==='?')op=['+','-','*','/'][gRnd(0,3)];
    const A=[20,100,1000][lv],MA=[5,12,25][lv],MB=[5,12,12][lv];let a,b,r;
    if(op==='+'){a=gRnd(1,A);b=gRnd(1,A);r=a+b}
    else if(op==='-'){a=gRnd(1,A);b=gRnd(1,A);if(b>a)[a,b]=[b,a];r=a-b}
    else if(op==='*'){a=gRnd(2,MA);b=gRnd(2,MB);r=a*b}
    else{b=gRnd(2,MB);r=gRnd(1,MA);a=b*r}
    return{t:a+' '+({'+':'+','-':'−','*':'×','/':'÷'}[op])+' '+b+' = ?',r:r};
  };
  const play=(op,lv)=>{
    let t=60,sc=0,ben=0,sal=0,q=gen(op,lv),iv;
    el.innerHTML=`<div class="d-flex justify-content-between mb-3"><span class="pill bg-body-secondary">⏱ <b id="mT">60</b> dtk</span><span class="pill bg-body-secondary">Benar <b id="mS">0</b></span></div><div class="text-center py-3"><div class="display-4 fw-extra" id="mQ"></div><input id="mA" type="number" inputmode="numeric" class="form-control form-control-lg text-center mx-auto mt-3" style="max-width:220px" autocomplete="off"><div id="mF" class="mt-2" style="min-height:28px"></div></div>`;
    const set=()=>{$('mQ').textContent=q.t;$('mA').value='';$('mA').focus()};set();
    S.cleanup=()=>clearInterval(iv);
    iv=setInterval(()=>{t--;$('mT').textContent=t;if(t<=0){clearInterval(iv);fin()}},1000);
    $('mA').onkeydown=e=>{if(e.key!=='Enter'||$('mA').value==='')return;
      if(+$('mA').value===q.r){ben++;$('mS').textContent=ben;$('mF').innerHTML='<span class="text-success fw-bold">✔ Benar!</span>'}else{sal++;$('mF').innerHTML='<span class="text-danger fw-bold">✘ '+q.r+'</span>'}
      q=gen(op,lv);set()};
    const fin=()=>{const b=gBest('mat_'+op+lv,ben);el.innerHTML=`<div class="text-center py-3"><div class="fs-1">⏰</div><h2 class="h4 fw-extra">Waktu habis!</h2><p class="mb-1">Benar: <b>${ben}</b> · Salah: <b>${sal}</b></p><p class="text-secondary">Rekor terbaik: ${b}</p><button class="btn btn-pri" id="mAg">Main Lagi</button></div>`;$('mAg').onclick=menu};
  };
  menu();
};

// ── Tebak Kata (gantung kata) ──
const TEBAK={Hewan:['kucing','gajah','harimau','kelinci','burung','kuda','jerapah','bebek','kambing','buaya'],Buah:['mangga','pisang','jeruk','semangka','durian','rambutan','manggis','nanas','anggur','apel'],
 'Benda Sekolah':['pensil','penghapus','penggaris','buku','spidol','rautan','kursi','papan','tas','kapur'],Kota:['tarakan','jakarta','surabaya','makassar','bandung','medan','samarinda','semarang','pontianak','denpasar'],
 Profesi:['dokter','guru','petani','nelayan','polisi','pilot','koki','perawat','arsitek','pedagang']};
GM.g_tebak=el=>{
  let skor=0;
  const next=cat=>{
    const kk=cat||Object.keys(TEBAK)[gRnd(0,4)],w=TEBAK[kk][gRnd(0,TEBAK[kk].length-1)].toUpperCase();let ben=new Set(),salah=0;
    const draw=()=>{
      const sel=[...w].map(c=>ben.has(c)?c:'_').join(' '),menang=[...w].every(c=>ben.has(c)),kalah=salah>=6;
      el.innerHTML=`<div class="d-flex justify-content-between small mb-2"><span class="pill bg-body-secondary">Kategori: ${esc(kk)}</span><span>Skor: <b>${skor}</b></span></div><div class="text-center"><div class="fs-3 mb-2">${'❤️'.repeat(6-salah)}${'🖤'.repeat(salah)}</div><div class="display-5 fw-extra mb-3" style="letter-spacing:.2em">${kalah?[...w].join(' '):sel}</div>
       ${menang?'<div class="alert alert-success">🎉 Hebat! Kata: '+w+'</div>':kalah?'<div class="alert alert-danger">Kesempatan habis. Katanya: <b>'+w+'</b></div>':''}
       ${menang||kalah?'<button class="btn btn-pri" id="tNx">Kata Berikutnya</button>':'<div class="d-flex flex-wrap gap-1 justify-content-center" style="max-width:520px;margin:auto">'+[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(c=>`<button class="btn btn-sm ${ben.has(c)?(w.includes(c)?'btn-success':'btn-danger'):'btn-outline-secondary'}" style="width:40px" ${ben.has(c)?'disabled':''} data-c="${c}">${c}</button>`).join('')+'</div>'}</div>`;
      if(menang||kalah){if(menang)skor+=10;$('tNx').onclick=()=>next(cat)}
      el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const c=b.dataset.c;ben.add(c);if(!w.includes(c))salah++;draw()});
    };draw();
  };
  el.innerHTML=gStart(el,'🔤','Tebak Kata','Tebak kata dengan memilih huruf. Kamu punya 6 nyawa.',`<div class="d-flex flex-wrap gap-2 justify-content-center">${Object.keys(TEBAK).map(k=>`<button class="btn btn-outline-primary" data-k="${esc(k)}">${esc(k)}</button>`).join('')}<button class="btn btn-pri" data-k="">Acak</button></div>`);
  el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>next(b.dataset.k));
};

// ── Rantai Kata ──
const KAMUS=('apel anggur ayam air atap angin awan arus akar alat asam api anak adik angka abu agama ahli '+
 'nasi nanas nama naga nyamuk nenek nelayan nada nilai nyala nusa nasib nyanyi '+
 'gajah garam gunung gigi guru gelas gula gudang gelang gerbang gambar gading gurun gitar '+
 'kuda kucing kancil kelapa kapal kereta kertas kursi kebun kampung kota kakak kamar kelas kuning kerbau kodok kunci kain kaki kulit kayu kopi kelinci kambing kebaya kepala '+
 'ibu ikan itik indah istana ide ingat ilmu izin ikat insan '+
 'ular udara usaha uang ulat unta udang ungu upaya umbi ulang undang '+
 'rumah rambut roti rusa rajin raja rotan rasa rembulan rebung ranting rumput rindu rapi '+
 'tahu tikus tas tangan telur tebu tanah tiga tinggi tikar tali topi tembok tamu tulis tongkat tenang '+
 'langit laut lampu lemari layang layar lembu lalat lantai lidah lele lutut lari lapang '+
 'meja mata mangga monyet motor mobil malam mulut manis madu mentimun merah mawar mimpi musim mutiara '+
 'sapi sekolah sepatu singa semut sungai susu surat sabun sayur sawah sapu senang suara siput sendok sehat '+
 'harimau hujan hutan hidung hewan hijau harum hadiah hari hormat '+
 'pagi pisang pensil papan payung pasar pulau pohon petani padi pelangi pantai panas pintu pena pasir '+
 'bunga buku bola baju batu burung bebek biru bulan buah belut bumi bintang bantal bapak batik berani '+
 'dua duri dadu dapur domba dahan dinding dingin dokter dunia daun dada '+
 'jam jalan jeruk jagung jari jendela jambu jujur jaring jembatan jauh '+
 'cacing cicak cabai cermin cuaca cinta cangkir cahaya emas elang enam ekor embun ember '+
 'obat ombak orang olahraga otak ojek warna waktu wajah warung wortel zebra fajar foto').split(' ');
GM.g_rantai=el=>{
  const used=new Set(),hist=[];let skor=0;
  const last=()=>hist.length?hist[hist.length-1].w.slice(-1):'';
  const draw=(msg,k)=>{
    el.innerHTML=`<div class="d-flex justify-content-between mb-2"><h2 class="h5 m-0">🔗 Rantai Kata</h2><span class="pill bg-body-secondary">Skor <b>${skor}</b></span></div>
    <p class="text-secondary small">Sebutkan kata yang diawali huruf terakhir kata sebelumnya. Kata tidak boleh diulang. ${last()?'<b>Giliranmu: kata berawalan "'+last().toUpperCase()+'"</b>':'Mulai dengan kata apa saja.'}</p>
    <div class="chain mb-3">${hist.map(h=>`<span class="chip-w ${h.c?'cpu':'me'}">${esc(h.w)}</span>`).join('<i class="bi bi-arrow-right text-secondary"></i>')||'<span class="text-secondary">Belum ada kata.</span>'}</div>
    ${msg?`<div class="alert alert-${k||'warning'} py-2">${msg}</div>`:''}
    <form id="rF" class="d-flex gap-2"><input id="rI" class="form-control" placeholder="Ketik kata..." autocomplete="off" autocapitalize="none"><button class="btn btn-pri">Kirim</button><button type="button" class="btn btn-outline-danger" id="rX">Menyerah</button></form>`;
    $('rI').focus();
    $('rX').onclick=()=>{el.innerHTML=`<div class="text-center py-3"><div class="fs-1">🏁</div><h2 class="h4 fw-extra">Permainan selesai</h2><p>Rantai ${hist.length} kata · Skor ${skor}</p><button class="btn btn-pri" onclick="GM.g_rantai($('gbody'))">Main Lagi</button></div>`;gBest('rantai',skor)};
    $('rF').onsubmit=e=>{e.preventDefault();
      const w=$('rI').value.trim().toLowerCase();
      if(!/^[a-z]{2,}$/.test(w))return draw('Gunakan huruf a-z saja, minimal 2 huruf.');
      if(last()&&w[0]!==last())return draw('Kata harus diawali huruf "'+last().toUpperCase()+'".');
      if(used.has(w))return draw('Kata "'+esc(w)+'" sudah dipakai.');
      used.add(w);hist.push({w:w,c:false});skor+=w.length;
      const cand=KAMUS.filter(x=>x[0]===w.slice(-1)&&!used.has(x));
      if(!cand.length){skor+=20;return draw('🎉 Komputer kehabisan kata! Kamu menang (+20).','success')}
      const c=cand[gRnd(0,cand.length-1)];used.add(c);hist.push({w:c,c:true});draw('Komputer: <b>'+c+'</b>','info');
    };
  };
  draw();
};

// ── Ular Tangga Edukatif ──
const ULAR={16:6,47:26,49:11,56:53,62:19,64:60,87:24,93:73,95:75,98:78},TANGGA={1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};
GM.g_ular=el=>{
  const WR=['#7C3AED','#10B981','#F59E0B','#EF4444'];
  el.innerHTML=gStart(el,'🎲','Ular Tangga Edukatif','Jawab pertanyaan dengan benar untuk boleh melempar dadu. Sampai kotak 100 lebih dulu = menang!',
   `<div class="d-flex gap-2 justify-content-center align-items-center"><label>Pemain</label><select id="uN" class="form-select w-auto"><option>2</option><option>3</option><option>4</option></select><button class="btn btn-pri" id="uGo">Mulai</button></div>`);
  $('uGo').onclick=()=>{
    const n=+$('uN').value,P=Array.from({length:n},(_,i)=>({n:'Pemain '+(i+1),p:0,c:WR[i]}));let t=0,qs=gShuf(SAINS.concat(SEJARAH)),qi=0,log='Pemain 1 mulai.';
    const cell=k=>{ // kotak 1..100 dengan jalur zig-zag
      return k;};
    const board=()=>{
      let h='';
      for(let r=9;r>=0;r--){const row=[];for(let c=0;c<10;c++){const k=r*10+(r%2===0?c+1:10-c);row.push(k)}
        h+=row.map(k=>{const tk=P.filter(p=>p.p===k).map(p=>`<span class="tok" style="background:${p.c}"></span>`).join('');
          const mk=ULAR[k]?'<small class="mk">🐍'+ULAR[k]+'</small>':TANGGA[k]?'<small class="mk">🪜'+TANGGA[k]+'</small>':'';
          return `<div class="ut ${ULAR[k]?'ul':TANGGA[k]?'tg':''}"><b>${k}</b>${mk}<div class="toks">${tk}</div></div>`}).join('')}
      return '<div class="uboard">'+h+'</div>';
    };
    const turn=()=>{
      const p=P[t];if(qi>=qs.length){qs=gShuf(qs);qi=0}const q=qs[qi++],ops=gShuf(q.o),ans=q.o[q.a];
      el.innerHTML=`<div class="row g-3"><div class="col-lg-7">${board()}</div><div class="col-lg-5"><div class="card-x p-3"><div class="mb-2"><span class="tok" style="background:${p.c}"></span> <b>Giliran ${esc(p.n)}</b> (kotak ${p.p||'start'})</div><div class="small text-secondary mb-2">${log}</div>
       <h3 class="h6">${esc(q.q)}</h3><div class="d-grid gap-2" id="uO">${ops.map((o,i)=>`<button class="btn btn-outline-secondary text-start" data-i="${i}">${'ABCD'[i]}. ${esc(o)}</button>`).join('')}</div><div id="uF" class="mt-3"></div></div></div></div>`;
      el.querySelectorAll('#uO button').forEach(b=>b.onclick=()=>{
        const ok=ops[+b.dataset.i]===ans;el.querySelectorAll('#uO button').forEach(x=>x.disabled=true);
        if(!ok){log=p.n+' salah menjawab (jawaban: '+ans+'). Giliran dilewati.';t=(t+1)%n;$('uF').innerHTML='<div class="alert alert-warning py-2">Belum tepat. Jawaban: '+esc(ans)+'</div><button class="btn btn-pri" id="uNx">Lanjut</button>';$('uNx').onclick=turn;return}
        const d=gRnd(1,6);let np=p.p+d,note='';
        if(np>100){np=p.p;note=' (butuh angka pas, tetap di '+p.p+')'}
        else if(ULAR[np]){note=' 🐍 turun ke '+ULAR[np];np=ULAR[np]}else if(TANGGA[np]){note=' 🪜 naik ke '+TANGGA[np];np=TANGGA[np]}
        p.p=np;log=p.n+' benar! Dadu '+d+note+'.';
        if(np===100){el.innerHTML=`<div class="text-center py-4"><div class="fs-1">🏆</div><h2 class="h4 fw-extra">${esc(p.n)} menang!</h2><button class="btn btn-pri" onclick="GM.g_ular($('gbody'))">Main Lagi</button></div>`;return}
        t=(t+1)%n;$('uF').innerHTML='<div class="alert alert-success py-2">Benar! 🎲 Dadu: <b>'+d+'</b>'+note+'</div><button class="btn btn-pri" id="uNx">Lanjut</button>';$('uNx').onclick=turn;
      });
    };
    turn();
  };
};

// ── Susunan Balok Pintar (block puzzle 8x8) ──
const BLOK=[[[0,0]],[[0,0],[0,1]],[[0,0],[1,0]],[[0,0],[0,1],[0,2]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[0,2],[0,3]],[[0,0],[1,0],[2,0],[3,0]],[[0,0],[0,1],[0,2],[0,3],[0,4]],[[0,0],[1,0],[2,0],[3,0],[4,0]],
 [[0,0],[0,1],[1,0],[1,1]],[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],[[0,0],[1,0],[1,1]],[[0,0],[0,1],[1,0]],[[0,0],[0,1],[1,1]],[[0,1],[1,0],[1,1]],
 [[0,0],[1,0],[2,0],[2,1],[2,2]],[[0,0],[0,1],[0,2],[1,0],[2,0]],[[0,2],[1,2],[2,0],[2,1],[2,2]],[[0,0],[0,1],[0,2],[1,2],[2,2]],[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]]];
const BLOK_C=['#7C3AED','#10B981','#F59E0B','#06B6D4','#EF4444','#EC4899'];
GM.g_balok=el=>{
  const N=8;let g=Array.from({length:N},()=>Array(N).fill(0)),skor=0,pcs=[],sel=-1,over=false;
  const baru=()=>{pcs=[0,1,2].map(()=>({s:BLOK[gRnd(0,BLOK.length-1)],c:BLOK_C[gRnd(0,BLOK_C.length-1)],used:false}))};
  const muat=(s,r,c)=>s.every(([a,b])=>r+a<N&&c+b<N&&!g[r+a][c+b]);
  const bisa=s=>{for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(muat(s,r,c))return true;return false};
  const mini=p=>{const h=Math.max(...p.s.map(x=>x[0]))+1,w=Math.max(...p.s.map(x=>x[1]))+1;let t='<div style="display:grid;grid-template-columns:repeat('+w+',16px);gap:2px">';
    for(let r=0;r<h;r++)for(let c=0;c<w;c++)t+='<span style="width:16px;height:16px;border-radius:3px;background:'+(p.s.some(x=>x[0]===r&&x[1]===c)?p.c:'transparent')+'"></span>';return t+'</div>'};
  const draw=msg=>{
    el.innerHTML=`<div class="d-flex justify-content-between align-items-center mb-2"><h2 class="h5 m-0">🧱 Susunan Balok Pintar</h2><span>Skor <b>${skor}</b> · Terbaik <b>${gBest('balok')}</b></span></div>
    <p class="text-secondary small mb-2">Pilih balok di bawah, lalu ketuk kotak papan sebagai sudut kiri-atas penempatan. Baris/kolom penuh akan hilang.</p>
    <div class="bboard">${g.map((row,r)=>row.map((v,c)=>`<button class="bc" data-r="${r}" data-c="${c}" style="${v?'background:'+v:''}" aria-label="Kotak ${r+1},${c+1}"></button>`).join('')).join('')}</div>
    <div class="d-flex gap-3 justify-content-center mt-3 flex-wrap">${pcs.map((p,i)=>`<button class="btn bp ${sel===i?'on':''}" data-p="${i}" ${p.used?'disabled style="opacity:.25"':''}>${mini(p)}</button>`).join('')}</div>
    ${msg?'<div class="text-center mt-2 small text-danger">'+msg+'</div>':''}${over?'<div class="alert alert-danger mt-3 text-center">Tidak ada balok yang muat. Permainan selesai! <button class="btn btn-sm btn-pri ms-2" id="bAg">Main Lagi</button></div>':''}`;
    el.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{sel=+b.dataset.p;draw()});
    if(over){$('bAg').onclick=()=>GM.g_balok($('gbody'));return}
    el.querySelectorAll('.bc').forEach(b=>b.onclick=()=>{
      if(sel<0)return draw('Pilih balok dulu.');const p=pcs[sel],r=+b.dataset.r,c=+b.dataset.c;
      if(!muat(p.s,r,c))return draw('Balok tidak muat di sini.');
      p.s.forEach(([a,d])=>g[r+a][c+d]=p.c);skor+=p.s.length;p.used=true;sel=-1;
      const pr=[],pk=[];for(let i=0;i<N;i++){if(g[i].every(x=>x))pr.push(i);if(g.every(rw=>rw[i]))pk.push(i)}
      pr.forEach(i=>{for(let j=0;j<N;j++)g[i][j]=0});pk.forEach(j=>{for(let i=0;i<N;i++)g[i][j]=0});
      const ln=pr.length+pk.length;if(ln)skor+=ln*ln*10;
      if(pcs.every(x=>x.used))baru();
      if(!pcs.filter(x=>!x.used).some(x=>bisa(x.s))){over=true;gBest('balok',skor)}
      draw();
    });
  };
  baru();draw();
};

// ── Teka-Teki Cari Kata ──
const CARI={Hewan:['KUCING','GAJAH','KELINCI','BURUNG','KUDA','BEBEK','KAMBING','SAPI'],Sekolah:['PENSIL','BUKU','MEJA','KURSI','GURU','SISWA','PAPAN','KELAS'],Buah:['MANGGA','PISANG','JERUK','APEL','ANGGUR','NANAS','DURIAN','SALAK'],Alam:['GUNUNG','SUNGAI','HUTAN','LAUT','PANTAI','LANGIT','BULAN','HUJAN']};
GM.g_cari=el=>{
  const mulai=tema=>{
    const N=12;let ws=gShuf(CARI[tema]).slice(0,7);const g=Array.from({length:N},()=>Array(N).fill('')),pos={},D=[[0,1],[1,0],[1,1]];
    ws.forEach(w=>{for(let k=0;k<200;k++){const d=D[gRnd(0,2)],r=gRnd(0,N-1),c=gRnd(0,N-1),er=r+d[0]*(w.length-1),ec=c+d[1]*(w.length-1);
      if(er>=N||ec>=N)continue;let ok=true;for(let i=0;i<w.length;i++){const ch=g[r+d[0]*i][c+d[1]*i];if(ch&&ch!==w[i]){ok=false;break}}
      if(!ok)continue;for(let i=0;i<w.length;i++)g[r+d[0]*i][c+d[1]*i]=w[i];pos[w]={r:r,c:c,d:d};break}});
    ws=ws.filter(w=>pos[w]);
    for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(!g[r][c])g[r][c]='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[gRnd(0,25)];
    const ketemu=new Set(),mark=new Set();let st=null,t0=Date.now();
    const draw=()=>{
      el.innerHTML=`<div class="d-flex justify-content-between mb-2"><h2 class="h5 m-0">🔎 Cari Kata: ${esc(tema)}</h2><span>Ditemukan <b>${ketemu.size}</b>/${ws.length}</span></div>
      <p class="small text-secondary">Ketuk huruf awal, lalu huruf akhir kata (mendatar, menurun, atau miring ke kanan-bawah).</p>
      <div class="row g-3"><div class="col-md-8"><div class="wgrid" style="grid-template-columns:repeat(${N},1fr)">${g.map((row,r)=>row.map((ch,c)=>`<button class="wc ${mark.has(r+','+c)?'ok':''} ${st&&st[0]===r&&st[1]===c?'sel':''}" data-r="${r}" data-c="${c}">${ch}</button>`).join('')).join('')}</div></div>
      <div class="col-md-4"><div class="card-x p-3">${ws.map(w=>`<div class="${ketemu.has(w)?'text-decoration-line-through text-success':''} fw-semibold">${w}</div>`).join('')}</div></div></div>
      ${ketemu.size===ws.length?`<div class="alert alert-success mt-3">🎉 Semua kata ditemukan dalam ${Math.round((Date.now()-t0)/1000)} detik! <button class="btn btn-sm btn-pri ms-2" onclick="GM.g_cari($('gbody'))">Main Lagi</button></div>`:''}`;
      el.querySelectorAll('.wc').forEach(b=>b.onclick=()=>{
        const r=+b.dataset.r,c=+b.dataset.c;if(!st){st=[r,c];return draw()}
        const dr=Math.sign(r-st[0]),dc=Math.sign(c-st[1]),len=Math.max(Math.abs(r-st[0]),Math.abs(c-st[1]))+1;
        const lurus=(r-st[0]===0||c-st[1]===0||Math.abs(r-st[0])===Math.abs(c-st[1]));
        if(lurus){let s='',cells=[];for(let i=0;i<len;i++){s+=g[st[0]+dr*i][st[1]+dc*i];cells.push((st[0]+dr*i)+','+(st[1]+dc*i))}
          const rev=[...s].reverse().join(''),w=ws.find(x=>x===s||x===rev);
          if(w&&!ketemu.has(w)){ketemu.add(w);cells.forEach(x=>mark.add(x))}}
        st=null;draw();
      });
    };draw();
  };
  el.innerHTML=gStart(el,'🔎','Teka-Teki Cari Kata','Temukan semua kata tersembunyi di dalam kotak huruf.',`<div class="d-flex flex-wrap gap-2 justify-content-center">${Object.keys(CARI).map(k=>`<button class="btn btn-outline-primary" data-k="${k}">${k}</button>`).join('')}</div>`);
  el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>mulai(b.dataset.k));
};
