/* ==============================================
   NOT YÖNETİM İŞLEMLERİ
   Notların oluşturulması, düzenlenmesi, silinmesi ve yönetimi
   Benim Notlarım - Kişisel Not Tutma Uygulaması
   ============================================== */

/**
 * Not Yöneticisi Sınıfı
 * Tüm not işlemlerini yöneten ana sınıf
 */
class NotYoneticisi {

    /**
     * Yapıcı fonksiyon
     */
    constructor() {
        this.notlar = [];
        this.filtrelenenmisNotlar = [];
        this.aktifFiltreler = {
            aramaTerimi: '',
            kategori: 'hepsi',
            siralamaTercihi: 'yeni-eski'
        };

        // Notları yükle
        this.notlariYukle();

        console.log('📋 Not Yöneticisi başlatıldı');
    }

    /**
     * Benzersiz ID oluştur
     * @returns {string} Benzersiz ID
     */
    benzersizIdOlustur() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Yeni not objesi oluştur
     * @param {string} baslik - Not başlığı
     * @param {string} icerik - Not içeriği
     * @param {string} kategori - Not kategorisi
     * @returns {Object} Not objesi
     */
    yeniNotObjesiOlustur(baslik, icerik, kategori = 'genel') {
        const simdi = new Date();

        return {
            id: this.benzersizIdOlustur(),
            baslik: baslik.trim(),
            icerik: icerik.trim(),
            kategori: kategori,
            olusturmaTarihi: simdi.toISOString(),
            guncellenmeTarihi: simdi.toISOString(),
            durum: 'aktif'
        };
    }

    /**
     * Not ekle
     * @param {string} baslik - Not başlığı
     * @param {string} icerik - Not içeriği
     * @param {string} kategori - Not kategorisi
     * @returns {boolean} Ekleme başarılıysa true
     */
    notEkle(baslik, icerik, kategori = 'genel') {
        // Giriş kontrolü
        if (!baslik || !icerik) {
            console.error('❌ Not başlığı ve içeriği boş olamaz');
            return false;
        }

        // Aynı başlıkta not kontrolü
        if (this.ayniBasliktaNotVarMi(baslik)) {
            console.warn('⚠️ Aynı başlıkta bir not zaten mevcut');
            return false;
        }

        // Yeni not oluştur
        const yeniNot = this.yeniNotObjesiOlustur(baslik, icerik, kategori);

        // Notlar dizisine ekle
        this.notlar.push(yeniNot);

        // Yerel depolamaya kaydet
        const kayitBasarili = notYerelDepolama.tekNotKaydet(yeniNot);

        if (kayitBasarili) {
            console.log(`✅ Not eklendi: ${baslik}`);
            this.notlariFiltrele(); // Filtrelenmiş listeyi güncelle
            return true;
        } else {
            // Başarısızlık durumunda diziden kaldır
            this.notlar.pop();
            console.error('❌ Not kaydedilemedi');
            return false;
        }
    }

    /**
     * Not güncelle
     * @param {string} notId - Güncellenecek notun ID'si
     * @param {string} baslik - Yeni başlık
     * @param {string} icerik - Yeni içerik
     * @param {string} kategori - Yeni kategori
     * @returns {boolean} Güncelleme başarılıysa true
     */
    notGuncelle(notId, baslik, icerik, kategori) {
        // Not bul
        const not = this.notlar.find(n => n.id === notId);

        if (!not) {
            console.error('❌ Güncellenecek not bulunamadı');
            return false;
        }

        // Giriş kontrolü
        if (!baslik || !icerik) {
            console.error('❌ Not başlığı ve içeriği boş olamaz');
            return false;
        }

        // Aynı başlıkta başka not kontrolü (kendi hariç)
        if (this.ayniBasliktaNotVarMi(baslik, notId)) {
            console.warn('⚠️ Aynı başlıkta başka bir not zaten mevcut');
            return false;
        }

        // Notu güncelle
        not.baslik = baslik.trim();
        not.icerik = icerik.trim();
        not.kategori = kategori;
        not.guncellenmeTarihi = new Date().toISOString();

        // Yerel depolamaya kaydet
        const kayitBasarili = notYerelDepolama.tekNotKaydet(not);

        if (kayitBasarili) {
            console.log(`✅ Not güncellendi: ${baslik}`);
            this.notlariFiltrele(); // Filtrelenmiş listeyi güncelle
            return true;
        } else {
            console.error('❌ Not güncellenemedi');
            return false;
        }
    }

    /**
     * Not sil
     * @param {string} notId - Silinecek notun ID'si
     * @returns {boolean} Silme başarılıysa true
     */
    notSil(notId) {
        // Not bul
        const notIndex = this.notlar.findIndex(n => n.id === notId);

        if (notIndex === -1) {
            console.error('❌ Silinecek not bulunamadı');
            return false;
        }

        const not = this.notlar[notIndex];

        // Yerel depolamadan sil
        const silmeBasarili = notYerelDepolama.notSil(notId);

        if (silmeBasarili) {
            // Diziden kaldır
            this.notlar.splice(notIndex, 1);
            console.log(`🗑️ Not silindi: ${not.baslik}`);
            this.notlariFiltrele(); // Filtrelenmiş listeyi güncelle
            return true;
        } else {
            console.error('❌ Not silinemedi');
            return false;
        }
    }

    /**
     * Not al
     * @param {string} notId - Alınacak notun ID'si
     * @returns {Object|null} Not objesi veya null
     */
    notAl(notId) {
        return this.notlar.find(n => n.id === notId) || null;
    }

    /**
     * Tüm notları al
     * @returns {Array} Notlar dizisi
     */
    tumNotlariAl() {
        return [...this.notlar];
    }

    /**
     * Filtrelenmiş notları al
     * @returns {Array} Filtrelenmiş notlar dizisi
     */
    filtrelenenmisNotlariAl() {
        return [...this.filtrelenenmisNotlar];
    }

    /**
     * Aynı başlıkta not var mı kontrolü
     * @param {string} baslik - Kontrol edilecek başlık
     * @param {string} haricNotId - Hariç tutulacak not ID'si
     * @returns {boolean} Aynı başlıkta not varsa true
     */
    ayniBasliktaNotVarMi(baslik, haricNotId = null) {
        return this.notlar.some(not =>
            not.baslik.toLowerCase() === baslik.toLowerCase() &&
            not.id !== haricNotId
        );
    }

    /**
     * Notları yerel depolamadan yükle
     */
    notlariYukle() {
        try {
            this.notlar = notYerelDepolama.notlariOku();
            this.notlariFiltrele();
            console.log(`📋 ${this.notlar.length} not yüklendi`);
        } catch (error) {
            console.error('❌ Notlar yüklenemedi:', error);
            this.notlar = [];
            this.filtrelenenmisNotlar = [];
        }
    }

    /**
     * Notları filtrele ve sırala
     */
    notlariFiltrele() {
        let filtrelenenmisNotlar = [...this.notlar];

        // Arama terimi filtresi
        if (this.aktifFiltreler.aramaTerimi) {
            const aramaTerimi = this.aktifFiltreler.aramaTerimi.toLowerCase();
            filtrelenenmisNotlar = filtrelenenmisNotlar.filter(not =>
                not.baslik.toLowerCase().includes(aramaTerimi) ||
                not.icerik.toLowerCase().includes(aramaTerimi)
            );
        }

        // Kategori filtresi
        if (this.aktifFiltreler.kategori && this.aktifFiltreler.kategori !== 'hepsi') {
            filtrelenenmisNotlar = filtrelenenmisNotlar.filter(not =>
                not.kategori === this.aktifFiltreler.kategori
            );
        }

        // Sıralama
        this.notlariSirala(filtrelenenmisNotlar);

        this.filtrelenenmisNotlar = filtrelenenmisNotlar;
    }

    /**
     * Notları sırala
     * @param {Array} notlar - Sıralanacak notlar dizisi
     */
    notlariSirala(notlar) {
        switch (this.aktifFiltreler.siralamaTercihi) {
            case 'yeni-eski':
                notlar.sort((a, b) => new Date(b.olusturmaTarihi) - new Date(a.olusturmaTarihi));
                break;
            case 'eski-yeni':
                notlar.sort((a, b) => new Date(a.olusturmaTarihi) - new Date(b.olusturmaTarihi));
                break;
            case 'baslik-a-z':
                notlar.sort((a, b) => a.baslik.localeCompare(b.baslik, 'tr'));
                break;
            case 'baslik-z-a':
                notlar.sort((a, b) => b.baslik.localeCompare(a.baslik, 'tr'));
                break;
            default:
                notlar.sort((a, b) => new Date(b.olusturmaTarihi) - new Date(a.olusturmaTarihi));
        }
    }

    /**
     * Arama terimi ayarla
     * @param {string} aramaTerimi - Arama terimi
     */
    aramaTerminiAyarla(aramaTerimi) {
        this.aktifFiltreler.aramaTerimi = aramaTerimi;
        this.notlariFiltrele();
    }

    /**
     * Kategori filtresini ayarla
     * @param {string} kategori - Kategori
     */
    kategoriFiltresiniAyarla(kategori) {
        this.aktifFiltreler.kategori = kategori;
        this.notlariFiltrele();
    }

    /**
     * Sıralama tercihini ayarla
     * @param {string} siralamaTercihi - Sıralama tercihi
     */
    siralamaTerminiAyarla(siralamaTercihi) {
        this.aktifFiltreler.siralamaTercihi = siralamaTercihi;
        this.notlariFiltrele();
    }

    /**
     * Tüm filtreleri sıfırla
     */
    filtreleriSifirla() {
        this.aktifFiltreler = {
            aramaTerimi: '',
            kategori: 'hepsi',
            siralamaTercihi: 'yeni-eski'
        };
        this.notlariFiltrele();
    }

    /**
     * Kategori listesini al
     * @returns {Array} Kategori listesi
     */
    kategoriListesiniAl() {
        const kategoriler = [...new Set(this.notlar.map(not => not.kategori))];
        return kategoriler.sort();
    }

    /**
     * Kategori istatistiklerini al
     * @returns {Object} Kategori istatistikleri
     */
    kategoriIstatistikleriniAl() {
        const istatistikler = {};

        this.notlar.forEach(not => {
            if (istatistikler[not.kategori]) {
                istatistikler[not.kategori]++;
            } else {
                istatistikler[not.kategori] = 1;
            }
        });

        return istatistikler;
    }

    /**
     * Not sayısını al
     * @returns {number} Toplam not sayısı
     */
    notSayisiniAl() {
        return this.notlar.length;
    }

    /**
     * Filtrelenmiş not sayısını al
     * @returns {number} Filtrelenmiş not sayısı
     */
    filtrelenenmisNotSayisiniAl() {
        return this.filtrelenenmisNotlar.length;
    }

    /**
     * Tüm notları sil
     * @returns {boolean} Silme başarılıysa true
     */
    tumNotlariSil() {
        // Onay kontrolü
        if (!confirm('Tüm notları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            return false;
        }

        // Yerel depolamadan sil
        const silmeBasarili = notYerelDepolama.depolamaYoneticisi.tumVerileriTemizle();

        if (silmeBasarili) {
            this.notlar = [];
            this.filtrelenenmisNotlar = [];
            console.log('🧹 Tüm notlar silindi');
            return true;
        } else {
            console.error('❌ Notlar silinemedi');
            return false;
        }
    }

    /**
     * Notları dışa aktar
     * @param {string} format - Dışa aktarım formatı (json, txt)
     * @returns {string} Dışa aktarılabilir veri
     */
    notlariDisaAktar(format = 'json') {
        try {
            const veri = notYerelDepolama.verileriDisaAktar();

            if (format === 'json') {
                return JSON.stringify(veri, null, 2);
            } else if (format === 'txt') {
                let metinVeri = `Benim Notlarım - Dışa Aktarım\n`;
                metinVeri += `Tarih: ${new Date().toLocaleString('tr-TR')}\n`;
                metinVeri += `Toplam Not Sayısı: ${veri.notSayisi}\n\n`;
                metinVeri += `${'-'.repeat(50)}\n\n`;

                veri.notlar.forEach((not, index) => {
                    metinVeri += `${index + 1}. ${not.baslik}\n`;
                    metinVeri += `Kategori: ${not.kategori}\n`;
                    metinVeri += `Tarih: ${new Date(not.olusturmaTarihi).toLocaleString('tr-TR')}\n`;
                    metinVeri += `İçerik:\n${not.icerik}\n\n`;
                    metinVeri += `${'-'.repeat(30)}\n\n`;
                });

                return metinVeri;
            }

            return JSON.stringify(veri, null, 2);
        } catch (error) {
            console.error('❌ Notlar dışa aktarılamadı:', error);
            return null;
        }
    }

    /**
     * Notları içe aktar
     * @param {string} veriMetni - İçe aktarılacak veri
     * @returns {boolean} İçe aktarma başarılıysa true
     */
    notlariIceAktar(veriMetni) {
        try {
            const veri = JSON.parse(veriMetni);

            // Veri formatı kontrolü
            if (!veri.notlar || !Array.isArray(veri.notlar)) {
                console.error('❌ Geçersiz veri formatı');
                return false;
            }

            // Onay kontrolü
            if (!confirm(`${veri.notlar.length} not içe aktarılacak. Mevcut notlar korunacak. Devam etmek istiyor musunuz?`)) {
                return false;
            }

            // Notları içe aktar
            const basarili = notYerelDepolama.verileriIceAktar(veri);

            if (basarili) {
                this.notlariYukle(); // Notları yeniden yükle
                console.log('✅ Notlar başarıyla içe aktarıldı');
                return true;
            } else {
                console.error('❌ Notlar içe aktarılamadı');
                return false;
            }
        } catch (error) {
            console.error('❌ Notlar içe aktarılamadı:', error);
            return false;
        }
    }
}

/**
 * Tarih Yardımcı Fonksiyonları
 */
class TarihYardimcilari {

    /**
     * Tarihi okunabilir formata çevir
     * @param {string} tarihString - ISO tarih string'i
     * @returns {string} Okunabilir tarih
     */
    static tarihiOkunabilirYap(tarihString) {
        const tarih = new Date(tarihString);
        return tarih.toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Göreceli tarih al (örn: 2 saat önce)
     * @param {string} tarihString - ISO tarih string'i
     * @returns {string} Göreceli tarih
     */
    static goreceliTarihAl(tarihString) {
        const tarih = new Date(tarihString);
        const simdi = new Date();
        const farkMilisaniye = simdi - tarih;

        const dakika = Math.floor(farkMilisaniye / 60000);
        const saat = Math.floor(dakika / 60);
        const gun = Math.floor(saat / 24);
        const hafta = Math.floor(gun / 7);
        const ay = Math.floor(gun / 30);
        const yil = Math.floor(gun / 365);

        if (yil > 0) return `${yil} yıl önce`;
        if (ay > 0) return `${ay} ay önce`;
        if (hafta > 0) return `${hafta} hafta önce`;
        if (gun > 0) return `${gun} gün önce`;
        if (saat > 0) return `${saat} saat önce`;
        if (dakika > 0) return `${dakika} dakika önce`;

        return 'Az önce';
    }

    /**
     * Kısa tarih formatı
     * @param {string} tarihString - ISO tarih string'i
     * @returns {string} Kısa tarih formatı
     */
    static kisaTarihFormati(tarihString) {
        const tarih = new Date(tarihString);
        return tarih.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

/**
 * Metin Yardımcı Fonksiyonları
 */
class MetinYardimcilari {

    /**
     * Metni kırp
     * @param {string} metin - Kırpılacak metin
     * @param {number} maksimumUzunluk - Maksimum uzunluk
     * @returns {string} Kırpılmış metin
     */
    static metniKirp(metin, maksimumUzunluk = 100) {
        if (metin.length <= maksimumUzunluk) {
            return metin;
        }

        return metin.substring(0, maksimumUzunluk - 3) + '...';
    }

    /**
     * HTML etiketlerini temizle
     * @param {string} metin - Temizlenecek metin
     * @returns {string} Temizlenmiş metin
     */
    static htmlEtiketleriniTemizle(metin) {
        return metin.replace(/<[^>]*>/g, '');
    }

    /**
     * Metni vurgula
     * @param {string} metin - Vurgulanacak metin
     * @param {string} aramaTerimi - Vurgulanacak terim
     * @returns {string} Vurgulanmış metin
     */
    static metniVurgula(metin, aramaTerimi) {
        if (!aramaTerimi) return metin;

        const regex = new RegExp(`(${aramaTerimi})`, 'gi');
        return metin.replace(regex, '<mark>$1</mark>');
    }
}

// Global not yöneticisi oluştur
const notYoneticisi = new NotYoneticisi();

// Konsol bilgisi
console.log('📋 Not Yönetimi modülü yüklendi');
console.log('📊 Toplam not sayısı:', notYoneticisi.notSayisiniAl()); 