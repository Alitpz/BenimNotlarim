/* ==============================================
   YEREL DEPOLAMA İŞLEMLERİ
   Local Storage ile not verilerini yönetim
   Benim Notlarım - Kişisel Not Tutma Uygulaması
   ============================================== */

/**
 * Yerel depolama anahtarı
 * Bu anahtar ile notlar localStorage'da saklanır
 */
const NOTLAR_ANAHTARI = 'benimNotlarim_notlar';

/**
 * Uygulama ayarları anahtarı
 * Bu anahtar ile uygulama ayarları localStorage'da saklanır
 */
const AYARLAR_ANAHTARI = 'benimNotlarim_ayarlar';

/**
 * Yerel Depolama Yöneticisi
 * localStorage işlemlerini yöneten sınıf
 */
class YerelDepolamaYoneticisi {

    /**
     * Yapıcı fonksiyon
     * LocalStorage desteğini kontrol eder
     */
    constructor() {
        this.localStorageDestekli = this.localStorageDestekKontrolEt();

        if (!this.localStorageDestekli) {
            console.warn('⚠️ LocalStorage bu tarayıcıda desteklenmiyor. Veriler geçici olarak saklanacak.');
            this.geciciVeriler = {};
        }
    }

    /**
     * LocalStorage desteği kontrolü
     * @returns {boolean} LocalStorage destekleniyorsa true
     */
    localStorageDestekKontrolEt() {
        try {
            const testAnahtari = '__localStorage_test__';
            localStorage.setItem(testAnahtari, 'test');
            localStorage.removeItem(testAnahtari);
            return true;
        } catch (error) {
            console.error('LocalStorage desteği kontrolü başarısız:', error);
            return false;
        }
    }

    /**
     * Veri kaydetme işlemi
     * @param {string} anahtar - Kaydedilecek verinin anahtarı
     * @param {*} veri - Kaydedilecek veri
     * @returns {boolean} Kaydetme başarılıysa true
     */
    veriKaydet(anahtar, veri) {
        try {
            const jsonVeri = JSON.stringify(veri);

            if (this.localStorageDestekli) {
                localStorage.setItem(anahtar, jsonVeri);
                console.log(`✅ Veri kaydedildi: ${anahtar}`);
            } else {
                this.geciciVeriler[anahtar] = jsonVeri;
                console.log(`⚠️ Veri geçici olarak kaydedildi: ${anahtar}`);
            }

            return true;
        } catch (error) {
            console.error('❌ Veri kaydetme hatası:', error);
            return false;
        }
    }

    /**
     * Veri okuma işlemi
     * @param {string} anahtar - Okunacak verinin anahtarı
     * @param {*} varsayilanDeger - Veri bulunamazsa döndürülecek varsayılan değer
     * @returns {*} Okunan veri veya varsayılan değer
     */
    veriOku(anahtar, varsayilanDeger = null) {
        try {
            let jsonVeri;

            if (this.localStorageDestekli) {
                jsonVeri = localStorage.getItem(anahtar);
            } else {
                jsonVeri = this.geciciVeriler[anahtar];
            }

            if (jsonVeri === null || jsonVeri === undefined) {
                console.log(`📋 Veri bulunamadı, varsayılan değer döndürüldü: ${anahtar}`);
                return varsayilanDeger;
            }

            const veri = JSON.parse(jsonVeri);
            console.log(`📖 Veri okundu: ${anahtar}`);
            return veri;

        } catch (error) {
            console.error('❌ Veri okuma hatası:', error);
            return varsayilanDeger;
        }
    }

    /**
     * Veri silme işlemi
     * @param {string} anahtar - Silinecek verinin anahtarı
     * @returns {boolean} Silme başarılıysa true
     */
    veriSil(anahtar) {
        try {
            if (this.localStorageDestekli) {
                localStorage.removeItem(anahtar);
            } else {
                delete this.geciciVeriler[anahtar];
            }

            console.log(`🗑️ Veri silindi: ${anahtar}`);
            return true;
        } catch (error) {
            console.error('❌ Veri silme hatası:', error);
            return false;
        }
    }

    /**
     * Tüm verileri temizleme
     * @returns {boolean} Temizleme başarılıysa true
     */
    tumVerileriTemizle() {
        try {
            if (this.localStorageDestekli) {
                // Sadece uygulama ile ilgili anahtarları temizle
                localStorage.removeItem(NOTLAR_ANAHTARI);
                localStorage.removeItem(AYARLAR_ANAHTARI);
            } else {
                this.geciciVeriler = {};
            }

            console.log('🧹 Tüm uygulama verileri temizlendi');
            return true;
        } catch (error) {
            console.error('❌ Veri temizleme hatası:', error);
            return false;
        }
    }

    /**
     * Depolama boyutu hesaplama
     * @returns {number} Toplam depolama boyutu (byte)
     */
    depolamaBoyutuHesapla() {
        try {
            let toplamBoyut = 0;

            if (this.localStorageDestekli) {
                for (let anahtar in localStorage) {
                    if (localStorage.hasOwnProperty(anahtar)) {
                        toplamBoyut += localStorage[anahtar].length;
                    }
                }
            } else {
                for (let anahtar in this.geciciVeriler) {
                    toplamBoyut += this.geciciVeriler[anahtar].length;
                }
            }

            return toplamBoyut;
        } catch (error) {
            console.error('❌ Depolama boyutu hesaplama hatası:', error);
            return 0;
        }
    }

    /**
     * Depolama boyutunu okunabilir formata çevir
     * @returns {string} Okunabilir boyut bilgisi
     */
    depolamaBoyutuMetni() {
        const boyut = this.depolamaBoyutuHesapla();

        if (boyut < 1024) {
            return `${boyut} byte`;
        } else if (boyut < 1024 * 1024) {
            return `${(boyut / 1024).toFixed(2)} KB`;
        } else {
            return `${(boyut / (1024 * 1024)).toFixed(2)} MB`;
        }
    }
}

/**
 * Not İşlemleri - Yerel Depolama
 * Notlar için özel yerel depolama işlemleri
 */
class NotYerelDepolamaIslemleri {

    /**
     * Yapıcı fonksiyon
     */
    constructor() {
        this.depolamaYoneticisi = new YerelDepolamaYoneticisi();
    }

    /**
     * Tüm notları kaydet
     * @param {Array} notlar - Kaydedilecek notlar dizisi
     * @returns {boolean} Kaydetme başarılıysa true
     */
    notlariKaydet(notlar) {
        // Kaydetme zamanını ekle
        const veri = {
            notlar: notlar,
            sonKayit: new Date().toISOString(),
            versiyon: '1.0'
        };

        return this.depolamaYoneticisi.veriKaydet(NOTLAR_ANAHTARI, veri);
    }

    /**
     * Tüm notları oku
     * @returns {Array} Notlar dizisi
     */
    notlariOku() {
        const veri = this.depolamaYoneticisi.veriOku(NOTLAR_ANAHTARI, {
            notlar: [],
            sonKayit: new Date().toISOString(),
            versiyon: '1.0'
        });

        // Eski format desteği
        if (Array.isArray(veri)) {
            return veri;
        }

        return veri.notlar || [];
    }

    /**
     * Tek not kaydet
     * @param {Object} not - Kaydedilecek not objesi
     * @returns {boolean} Kaydetme başarılıysa true
     */
    tekNotKaydet(not) {
        const mevcutNotlar = this.notlariOku();

        // Mevcut notu bul ve güncelle, yoksa ekle
        const notIndex = mevcutNotlar.findIndex(n => n.id === not.id);

        if (notIndex !== -1) {
            mevcutNotlar[notIndex] = not;
            console.log(`📝 Not güncellendi: ${not.baslik}`);
        } else {
            mevcutNotlar.push(not);
            console.log(`➕ Yeni not eklendi: ${not.baslik}`);
        }

        return this.notlariKaydet(mevcutNotlar);
    }

    /**
     * Not sil
     * @param {string} notId - Silinecek notun ID'si
     * @returns {boolean} Silme başarılıysa true
     */
    notSil(notId) {
        const mevcutNotlar = this.notlariOku();
        const yeniNotlar = mevcutNotlar.filter(not => not.id !== notId);

        if (yeniNotlar.length < mevcutNotlar.length) {
            console.log(`🗑️ Not silindi: ${notId}`);
            return this.notlariKaydet(yeniNotlar);
        } else {
            console.warn(`⚠️ Silinecek not bulunamadı: ${notId}`);
            return false;
        }
    }

    /**
     * Son kayıt zamanını al
     * @returns {string} Son kayıt tarihi
     */
    sonKayitZamaniniAl() {
        const veri = this.depolamaYoneticisi.veriOku(NOTLAR_ANAHTARI, {
            sonKayit: new Date().toISOString()
        });

        return veri.sonKayit || new Date().toISOString();
    }

    /**
     * Not verilerini dışa aktar
     * @returns {Object} Dışa aktarılabilir veri objesi
     */
    verileriDisaAktar() {
        const notlar = this.notlariOku();
        const sonKayit = this.sonKayitZamaniniAl();

        return {
            uygulama: 'Benim Notlarım',
            versiyon: '1.0',
            aktarimTarihi: new Date().toISOString(),
            sonKayit: sonKayit,
            notSayisi: notlar.length,
            notlar: notlar
        };
    }

    /**
     * Dışa aktarılan verileri içe aktar
     * @param {Object} veri - İçe aktarılacak veri objesi
     * @returns {boolean} İçe aktarma başarılıysa true
     */
    verileriIceAktar(veri) {
        try {
            // Veri formatı kontrolü
            if (!veri.notlar || !Array.isArray(veri.notlar)) {
                console.error('❌ Geçersiz veri formatı');
                return false;
            }

            // Notları kaydet
            const basarili = this.notlariKaydet(veri.notlar);

            if (basarili) {
                console.log(`✅ ${veri.notlar.length} not başarıyla içe aktarıldı`);
            }

            return basarili;
        } catch (error) {
            console.error('❌ Veri içe aktarma hatası:', error);
            return false;
        }
    }
}

/**
 * Uygulama Ayarları - Yerel Depolama
 * Uygulama ayarları için yerel depolama işlemleri
 */
class AyarlarYerelDepolama {

    /**
     * Yapıcı fonksiyon
     */
    constructor() {
        this.depolamaYoneticisi = new YerelDepolamaYoneticisi();
    }

    /**
     * Varsayılan ayarları al
     * @returns {Object} Varsayılan ayarlar objesi
     */
    varsayilanAyarlar() {
        return {
            tema: 'acik',
            dil: 'tr',
            sayfalama: 10,
            otomatikKayit: true,
            bildirimler: true,
            siralamaTercihi: 'yeni-eski',
            varsayilanKategori: 'genel'
        };
    }

    /**
     * Ayarları kaydet
     * @param {Object} ayarlar - Kaydedilecek ayarlar objesi
     * @returns {boolean} Kaydetme başarılıysa true
     */
    ayarlariKaydet(ayarlar) {
        const veri = {
            ayarlar: ayarlar,
            sonGuncelleme: new Date().toISOString(),
            versiyon: '1.0'
        };

        return this.depolamaYoneticisi.veriKaydet(AYARLAR_ANAHTARI, veri);
    }

    /**
     * Ayarları oku
     * @returns {Object} Ayarlar objesi
     */
    ayarlariOku() {
        const veri = this.depolamaYoneticisi.veriOku(AYARLAR_ANAHTARI, {
            ayarlar: this.varsayilanAyarlar()
        });

        return veri.ayarlar || this.varsayilanAyarlar();
    }

    /**
     * Tek ayar güncelle
     * @param {string} ayarAdi - Güncellenecek ayarın adı
     * @param {*} deger - Yeni değer
     * @returns {boolean} Güncelleme başarılıysa true
     */
    ayarGuncelle(ayarAdi, deger) {
        const mevcutAyarlar = this.ayarlariOku();
        mevcutAyarlar[ayarAdi] = deger;

        return this.ayarlariKaydet(mevcutAyarlar);
    }

    /**
     * Ayarları sıfırla
     * @returns {boolean} Sıfırlama başarılıysa true
     */
    ayarlariSifirla() {
        return this.ayarlariKaydet(this.varsayilanAyarlar());
    }
}

// Global olarak kullanılacak nesneleri oluştur
const notYerelDepolama = new NotYerelDepolamaIslemleri();
const ayarlarYerelDepolama = new AyarlarYerelDepolama();

// Konsol bilgisi
console.log('📦 Yerel Depolama modülü yüklendi');
console.log('💾 Depolama boyutu:', notYerelDepolama.depolamaYoneticisi.depolamaBoyutuMetni()); 