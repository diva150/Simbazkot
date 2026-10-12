export type RoleBidang = "bidang1" | "bidang2" | "bidang3" | "bidang4" | "ketua" | "admin";
export type BidangType = "beranda" | "bidang1" | "bidang2" | "bidang3" | "bidang4" | "ketua" | "admin" | "profil";

export interface UserSession {
  username: string;
  password?: string;
  nama: string;
  role: RoleBidang;
  roleLabel: string;
  jabatan: string;
}

export type Bidang1Tab = "dashboard" | "muzakki" | "zakat" | "infak" | "dskl" | "laporan" | "pengaturan";
export type Bidang2Tab = "dashboard" | "mustahik" | "pendistribusian" | "pendayagunaan" | "pencairan" | "dokumentasi" | "laporan" | "pengaturan";
export type Bidang3Tab = "dashboard" | "rkat" | "bukukas" | "laporan" | "laporan_program" | "lpj" | "pengaturan";
export type Bidang4Tab = "dashboard" | "surat_masuk" | "surat_keluar" | "format_surat" | "arsip_surat" | "sop" | "pegawai" | "aset" | "pengaturan";
export type KetuaTab = "dashboard" | "disposisi" | "persetujuan_spk" | "laporan_semua";
export type AdminTab = "dashboard" | "manajemen_akun" | "editor_beranda" | "bidang_access";

// Program Bidang 2
export type KategoriPilarBidang2 = "pendistribusian" | "pendayagunaan";
export type SubProgramPendistribusian = "Pendidikan" | "Kesehatan" | "Dakwah dan Advokasi";
export type SubProgramPendayagunaan = "Ekonomi" | "Pendidikan Sebagian" | "Kesehatan";

export interface Instansi {
  id: string;
  nama: string;
  jenis: "OPD" | "BUMD" | "Instansi Vertikal" | "Organisasi";
  alamat: string;
  jumlahMuzakki: number;
}

// 10-level desil scale (BPS-style). Per klasifikasi规则 BAZNAS Kota Gorontalo:
//   - Desil 1–5  → Mustahik (penerima manfaat)
//   - Desil 6–10 → Muzakki (pemberi zakat / donatur)
export type DesilType =
  | "Desil 1"
  | "Desil 2"
  | "Desil 3"
  | "Desil 4"
  | "Desil 5"
  | "Desil 6"
  | "Desil 7"
  | "Desil 8"
  | "Desil 9"
  | "Desil 10";

export type UserType = "mustahik" | "muzakki";

export interface Muzakki {
  id: string;
  namaLengkap: string;
  nik: string;
  npwz: string; // Nomor Pokok Wajib Zakat
  noHp: string;
  alamat: string;
  instansiId: string;
  namaInstansi: string;
  status: "aktif" | "arsip";
  totalSetoran: number;
  desil?: DesilType; // Desil 1–5 = Mustahik; Desil 6–10 = Muzakki
  tipeMuzakki?: "individu" | "opd";
}

export interface SetoranZIS {
  id: string;
  buktiNo: string;
  muzakkiId: string;
  namaMuzakki: string;
  nik: string;
  npwz?: string;
  instansi: string;
  tipeMuzakki?: "individu" | "opd";
  kategoriUtama: "zakat" | "infak" | "dskl";
  jenis: "zakat_profesi" | "zakat_fitrah" | "zakat_maal" | "infaq_terikat" | "infaq_umum" | "sedekah" | "dskl_qurban" | "dskl_fidyah";
  jenisLabel: string;
  metode: "tunai" | "transfer";
  bank?: string;
  nominal: number;
  persen?: number;
  gajiDasar?: number;
  tanggal: string;
  keterangan?: string;
  petugasAmil: string;
  desil?: DesilType;
}

export interface Mustahik {
  id: string;
  namaLengkap: string;
  nik: string;
  kk?: string;
  desil: DesilType; // Desil 1–5 = Mustahik (penerima); Desil 6–10 = Muzakki (donor)
  asnaf: "Fakir" | "Miskin" | "Amil" | "Mualaf" | "Riqab" | "Gharimin" | "Fisabilillah" | "Ibnu Sabil";
  kategoriBesar: KategoriPilarBidang2; // "pendistribusian" atau "pendayagunaan"
  namaSubProgram: SubProgramPendistribusian | SubProgramPendayagunaan;
  alamat: string;
  kondisi: string;
  statusKelayakan: "aktif" | "lulus" | "ditinjau";
  totalBantuanDiterima: number;
  terakhirDibantu: string;
}

export interface PermohonanPencairan {
  id: string;
  nomorSPK: string;
  kategoriBesar: KategoriPilarBidang2;
  namaSubProgram: SubProgramPendistribusian | SubProgramPendayagunaan;
  namaProgram: string;
  nominal: number;
  pemohon: string;
  status: "diajukan" | "disetujui_ketua" | "dikonfirmasi_bidang2" | "ditolak";
  tanggal: string;
  jumlahMustahik: number;
  keterangan: string;
  approver?: string;
  catatanPenolakan?: string;
  tanggalDisetujuiKetua?: string;
  tanggalKonfirmasiBidang2?: string;
}

export interface ItemRKAT {
  id: string;
  kodeAkun: string;
  bidang: "Bidang I" | "Bidang II" | "Bidang III" | "Bidang IV";
  namaProgram: string;
  paguAnggaran: number;
  realisasi: number;
  tahun: number;
}

export interface Surat {
  id: string;
  jenis: "masuk" | "keluar";
  nomorSurat: string;
  asalSurat?: string;
  pengirimTujuan?: string;
  tujuanSurat?: string;
  perihal: string;
  tanggal: string;
  statusDisposisi: "belum_disposisi" | "sudah_disposisi" | "selesai";
  disposisiTujuan?: string;
  tujuanDisposisi?: string;
  instruksiDisposisi?: string;
  catatanDisposisi?: string;
  catatanArahan?: string;
  sifatDisposisi?: string;
  lampiran?: string;
  kategoriSurat?: string;
}

export interface TemplateSurat {
  id: string;
  kode: string;
  namaTemplate: string;
  kategori: "Tugas" | "Penyaluran" | "Undangan" | "Rekomendasi" | "Keterangan" | "BAST";
  nomorFormat: string;
  perihalDefault: string;
  tujuanDefault: string;
  isiPembuka: string;
  isiUtama: string;
  isiPenutup: string;
  penandatangan: string;
  jabatanPenandatangan: string;
  tanggalDibuat: string;
}

export interface Pegawai {
  id: string;
  nama: string;
  jabatan: string;
  bidang: string;
  status: "aktif" | "nonaktif";
  kontak: string;
}

export interface AsetKantor {
  id: string;
  namaAset: string;
  kodeAset: string;
  kondisi: "Baik" | "Perlu Servis" | "Rusak";
  lokasi: string;
  tanggalPerolehan: string;
  nilaiAset: number;
}

export interface StrukturStaf {
  bidangTugas: string;
  nama: string;
  fotoUrl?: string;
}

export interface StrukturWaka {
  id: string;
  nama: string;
  jabatan: string;
  bidang: string;
  fotoUrl?: string;
  stafList: StrukturStaf[];
}

export interface StrukturOrganisasiResmi {
  ketua: {
    nama: string;
    jabatan: string;
    fotoUrl?: string;
  };
  wakilKetuaList: StrukturWaka[];
}

export interface BerandaContent {
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  totalPenghimpunan: string;
  totalMustahik: string;
  tingkatPenyaluran: string;
  opiniAudit: string;
  visi: string;
  misiList: string[];
  bankSulutgo: string;
  bankMuamalat: string;
  bankBtn: string;
  alamat: string;
  telepon: string;
  email: string;
}
