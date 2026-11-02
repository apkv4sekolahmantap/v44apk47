# PANDUAN INSTALASI - Apk Sekolah Mantap v4.0
Backend = Google Apps Script (REST API). Frontend = GitHub Pages (HTTPS, sehingga kamera scan QR & presensi wajah bisa dipakai).
Nama aplikasi berubah dari "Administrasi GTK SDN 047 Tarakan" menjadi **Apk Sekolah Mantap**. Nama folder `sdn047-tarakan`, nama database Sheets, dan folder Drive **sengaja tidak diubah** agar data lama tetap terpakai.

## A. UPGRADE DARI v3.5 (data lama tetap aman)
1. Buka proyek Apps Script lama -> ganti seluruh isi `Kode.gs` dengan `Kode.gs` v4.0 (file ini).
2. Pilih fungsi `setupAppEnvironment` -> **Run** (cukup sekali; aman diulang). Proses membuat +/- 50 sheet baru dan menambah kolom baru (mis. Status & tanggal lahir pada Siswa), bisa 1-2 menit. Pastikan log bertuliskan "Setup selesai". Nama aplikasi di Pengaturan otomatis menjadi "Apk Sekolah Mantap".
3. **Deploy -> Manage deployments -> pensil -> New version -> Deploy** (URL /exec tetap sama).
4. Frontend: ekstrak ZIP, salin `js/config.js` lama Anda (berisi URL /exec) menimpa `js/config.js` di folder baru, lalu:
```
git add .
git commit -m "v4.0 Apk Sekolah Mantap"
git push
```
5. Buka situs, tekan Ctrl+Shift+R. Kartu login harus menampilkan **Versi 4.0**.

## B. INSTALASI BARU
1. https://script.google.com -> Proyek baru -> isi `Code.gs` dengan `Kode.gs` (ganti nama file menjadi **Kode**).
2. Jalankan `setupAppEnvironment` (izinkan Drive, Sheets, Gmail, Docs).
3. Deploy -> New deployment -> Web app: Execute as **Me**, Who has access **Anyone** -> salin URL /exec.
4. Isi `js/config.js` (ganti `PASTE_URL_EXEC_DI_SINI`), push ke repository GitHub **Public**, aktifkan Pages (Settings -> Pages -> branch main / root, Enforce HTTPS). Langkah git sama seperti panduan v3.5 (`git init`, `git add .`, `git commit`, `git remote add origin ...`, `git push -u origin main`, password = Personal Access Token).
5. Akun admin awal: username `ujangilham`. **Segera ganti password** di menu Pengaturan.

Setiap mengubah `Kode.gs`: Deploy -> Manage deployments -> New version.

## C. MENU DAN FITUR BARU (dikelompokkan di sidebar, ada kotak cari menu)
| Kelompok | Isi |
|---|---|
| Profil Sekolah | Visi & Misi (Admin dapat mengubah), Struktur Organisasi (bagan pohon otomatis dari kolom Atasan) |
| Data Master | Guru, Kelas, Siswa (kini ada Status Aktif/Mutasi/Lulus/Keluar), Mata Pelajaran, Tahun Ajaran |
| Akademik | Jadwal Pelajaran (tampilan grid per kelas), Kehadiran Siswa, Scan QR, Laporan Kehadiran, Presensi Wajah, Daftar Wajah, Kartu QR Massal, **Nilai Siswa (Kurikulum Merdeka)**, Kaldik (kalender bulanan), Jurnal, Perkembangan, Hafalan |
| Eskul & Kokurikuler | Ekstrakurikuler, Kehadiran Ekstrakurikuler, Kokurikuler (8 Dimensi Profil Lulusan), Kehadiran Kokurikuler (ada **Isi Massal**) |
| Guru Pintar | Generator RPP/Modul Ajar, Modul Ajar Tersimpan, Bank Soal (+ cetak lembar soal), Kuis Interaktif, Ice Breaking, Kartu Guru (QR), Arsip Dokumen |
| Kesiswaan | Pendaftaran Siswa Baru (tombol "Jadikan siswa"), Perizinan Siswa, Bimbingan Konseling, Tata Tertib, Catatan Pelanggaran, Buku Mutasi, Buku Kelulusan, Buku Prestasi, Kartu Pelajar (QR presensi) |
| Sarana & Prasarana | Inventaris Barang, Peminjaman Sarpras, Denah Sekolah & Ruang |
| Perpustakaan | Dashboard, Manajemen Buku, Anggota, Peminjaman & Pengembalian |
| Keuangan | Pembayaran Siswa (kuitansi), Tabungan, Pendapatan, Pengeluaran, Neraca, Honorarium GTK (slip), PIP |
| Unit Kesehatan Sekolah | Rekam Medis, Riwayat Kunjungan (obat otomatis mengurangi stok), Stok Obat |
| Koperasi Sekolah | Manajemen Stok, Penjualan (stok & saldo E-Money otomatis), E-Money, Laporan Keuangan |
| Jadwal Piket | Piket Guru, Piket Siswa |
| Manajemen Rapat | Jadwal, Notulen, Presensi (isi massal dari Data Guru), Follow Up |
| Organisasi Kelas | OSIS, Organisasi Kelas |
| Game Edukatif | Matematika Cepat, Teka-Teki Sains, Kuis Sejarah, Rantai Kata, Tebak Kata, Ular Tangga Edukatif, Susunan Balok Pintar, Teka-Teki Cari Kata, Kuis Al-Quran |
| Alat Pembelajaran | Spin Wheel, Pengacak Siswa, Pasangan Random, Alat Peraga 3D, Kalkulator Konversi, Papan Tulis, Mind Mapping, Peta Interaktif, Virtual Lab |
| Administrasi & Sistem | Surat Menyurat, Pengumuman, Backup & Hapus Data, Arsip Rekap & Sertifikat, Pengguna, Pengaturan |

### Persentase kehadiran
Persentase **Hadir, Sakit, Izin, Alpa** tampil di: Dashboard (hari ini + akumulasi tahun ajaran), halaman Kehadiran Siswa (tanggal terpilih + akumulasi), dan Laporan Kehadiran (per filter, plus kolom % per siswa di tabel/Excel/Word/PDF).

### Nilai Kurikulum Merdeka
Input per siswa & mata pelajaran: sampai 4 Sumatif Lingkup Materi, Sumatif Akhir Semester/Tahun, serta Tujuan Pembelajaran tercapai / perlu penguatan. Nilai formatif tidak masuk nilai rapor. **Nilai Akhir** = rata-rata (rerata sumatif lingkup materi, sumatif akhir); **deskripsi capaian** disusun otomatis. KKTP per mapel diisi di Data Mata Pelajaran (bawaan di Pengaturan, 75). Tombol **Cetak Rapor** tersedia.
Rumus ini adalah pilihan bawaan; bila sekolah memakai bobot lain, ubah fungsi `hitungNilai` di Kode.gs.

## D. HAK AKSES RINGKAS
- Orang Tua / Murid hanya melihat data anaknya (nilai, pembayaran, tabungan, E-Money, pelanggaran, prestasi, rekam medis, kunjungan UKS, perizinan). Orang tua dapat **mengajukan izin**; Guru Kelas/Admin yang menyetujui. Izin Sakit/Izin yang disetujui otomatis tercatat di Kehadiran Siswa (hari sekolah sesuai Pengaturan: 5 atau 6 hari).
- Guru Kelas hanya melihat siswa/kelasnya; guru lain hanya melihat data yang mereka buat (jurnal, modul ajar, nilai).
- Keuangan, koperasi, honorarium: Admin, Tenaga Administrasi, Kepala Sekolah (lihat). Backup & Hapus Data: **Admin saja**.
- Peran baru yang dipakai: Tenaga Administrasi (keuangan/PPDB/surat) dan Tenaga Perpustakaan (perpustakaan). Buat akun di menu Pengguna.

## E. CATATAN PENTING
1. **Setelah mengganti Kode.gs wajib** menjalankan ulang `setupAppEnvironment` dan Deploy New version. Jika muncul pesan "Sheet ... belum ada", itu tandanya langkah ini terlewat.
2. **Hapus Data** selalu membuat salinan backup otomatis dulu (folder `Backup` di Drive). Untuk memulihkan, buka salinan dan salin sheet yang dibutuhkan.
3. **Generator Modul Ajar** menyusun draf berbasis templat (bukan AI). Guru perlu membaca dan menyesuaikannya.
4. Game, papan tulis, mind map, dan alat bantu lain berjalan di peramban. Alat Peraga 3D dan Peta Interaktif memerlukan internet (memuat pustaka three.js dan Leaflet/OpenStreetMap).
5. Data kesehatan, keuangan, dan bimbingan konseling bersifat sensitif: batasi akun Admin, dan gunakan password kuat.
6. Rantai Kata menerima kata apa pun yang diketik pemain (tidak ada pemeriksaan kamus lengkap); guru berperan sebagai juri.
7. Batas aman Google Sheets: bila data sangat besar (puluhan ribu baris per sheet), pertimbangkan arsip per tahun ajaran memakai Backup + Hapus Data.

## F. MASALAH UMUM
| Gejala | Solusi |
|---|---|
| "GAS_URL belum diisi" | Isi `js/config.js`, commit, push |
| "Sheet ... belum ada" | Jalankan ulang `setupAppEnvironment`, lalu Deploy New version |
| Menu baru tidak muncul | Deploy **New version**, lalu Ctrl+Shift+R |
| Perubahan frontend tidak terlihat | Ctrl+Shift+R (atau tunggu 1-2 menit setelah push) |
| Kamera ditolak | Ikon gembok di address bar -> Izinkan kamera -> muat ulang |
| 404 di GitHub Pages | `index.html` harus di root repo; push dari folder `sdn047-tarakan` |
