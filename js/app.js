/* ==============================================
   ANA UYGULAMA DOSYASI
   DOM işlemleri ve kullanıcı etkileşimlerini yönetir
   Benim Notlarım - Kişisel Not Tutma Uygulaması
   ============================================== */

/**
 * Uygulama Yöneticisi Sınıfı
 * Ana uygulama mantığını ve DOM işlemlerini yönetir
 */
class UygulamaYoneticisi {

    /**
     * Yapıcı fonksiyon
     */
    constructor() {
        this.domElementleri = {};
        this.duzenlemeModu = false;
        this.duzenlenecekNotId = null;

        // DOM yüklendiğinde başlat
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.uygulamayiBaslat());
        } else {
            this.uygulamayiBaslat();
        }
    }

    /**
     * Uygulamayı başlat
     */
    uygulamayiBaslat() {
        console.log('🚀 Uygulama başlatılıyor...');

        // DOM elementlerini al
        this.domElementleriniAl();

        // Olay dinleyicilerini ekle
        this.olayDinleyicileriniEkle();

        // Notları görüntüle
        this.notlariGoruntule();

        // Son güncelleme zamanını göster
        this.sonGuncellemeZamaniniGoster();

        console.log('✅ Uygulama başarıyla başlatıldı');
    }

    /**
     * DOM elementlerini al
     */
    domElementleriniAl() {
        this.domElementleri = {
            // Form elemanları
            notFormu: document.getElementById('notFormu'),
            notBasligi: document.getElementById('notBasligi'),
            notKategorisi: document.getElementById('notKategorisi'),
            notIcerigi: document.getElementById('notIcerigi'),

            // Arama elemanları
            aramaGirisi: document.getElementById('aramaGirisi'),
            aramaButonu: document.getElementById('aramaButonu'),
            kategoriFiltresi: document.getElementById('kategoriFiltresi'),
            tarihSiralamasi: document.getElementById('tarihSiralamasi'),

            // Not görüntüleme elemanları
            notlarListesi: document.getElementById('notlarListesi'),
            notSayisi: document.getElementById('notSayisi'),
            bosDurum: document.getElementById('bosDurum'),

            // Diğer elemanlar
            sonGuncelleme: document.getElementById('sonGuncelleme')
        };

        // DOM elementlerinin varlığını kontrol et
        this.domElementleriniKontrolEt();
    }

    /**
     * DOM elementlerinin varlığını kontrol et
     */
    domElementleriniKontrolEt() {
        const eksikElementler = [];

        for (const [isim, element] of Object.entries(this.domElementleri)) {
            if (!element) {
                eksikElementler.push(isim);
            }
        }

        if (eksikElementler.length > 0) {
            console.error('❌ Eksik DOM elementleri:', eksikElementler);
        }
    }

    /**
     * Olay dinleyicilerini ekle
     */
    olayDinleyicileriniEkle() {
        // Form gönderimi
        this.domElementleri.notFormu?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.notFormunuIsle();
        });

        // Arama
        this.domElementleri.aramaGirisi?.addEventListener('input', (e) => {
            this.aramaYap(e.target.value);
        });

        this.domElementleri.aramaButonu?.addEventListener('click', () => {
            this.aramaYap(this.domElementleri.aramaGirisi.value);
        });

        // Enter tuşu ile arama
        this.domElementleri.aramaGirisi?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.aramaYap(e.target.value);
            }
        });

        // Kategori filtresi
        this.domElementleri.kategoriFiltresi?.addEventListener('change', (e) => {
            this.kategoriFiltresiniUygula(e.target.value);
        });

        // Tarih sıralaması
        this.domElementleri.tarihSiralamasi?.addEventListener('change', (e) => {
            this.tarihSiralamasiniUygula(e.target.value);
        });

        // Klavye kısayolları
        document.addEventListener('keydown', (e) => {
            this.klavyeKisayollariniIsle(e);
        });

        console.log('🎯 Olay dinleyicileri eklendi');
    }

    /**
     * Not formunu işle
     */
    notFormunuIsle() {
        const baslik = this.domElementleri.notBasligi?.value.trim();
        const kategori = this.domElementleri.notKategorisi?.value;
        const icerik = this.domElementleri.notIcerigi?.value.trim();

        // Giriş kontrolü
        if (!baslik || !icerik) {
            this.hataMesajiGoster('Not başlığı ve içeriği boş olamaz!');
            return;
        }

        let basarili = false;

        if (this.duzenlemeModu) {
            // Not güncelleme
            basarili = notYoneticisi.notGuncelle(this.duzenlenecekNotId, baslik, icerik, kategori);

            if (basarili) {
                this.basariMesajiGoster('Not başarıyla güncellendi!');
                this.duzenlemeMoundanCik();
            } else {
                this.hataMesajiGoster('Not güncellenemedi!');
            }
        } else {
            // Yeni not ekleme
            basarili = notYoneticisi.notEkle(baslik, icerik, kategori);

            if (basarili) {
                this.basariMesajiGoster('Not başarıyla eklendi!');
                this.formuTemizle();
            } else {
                this.hataMesajiGoster('Not eklenemedi!');
            }
        }

        if (basarili) {
            this.notlariGoruntule();
            this.sonGuncellemeZamaniniGoster();
        }
    }

    /**
     * Notları görüntüle
     */
    notlariGoruntule() {
        const notlar = notYoneticisi.filtrelenenmisNotlariAl();

        if (!this.domElementleri.notlarListesi) {
            console.error('❌ Not listesi elemanı bulunamadı');
            return;
        }

        // Not sayısını güncelle
        this.notSayisiniGuncelle(notlar.length);

        // Notlar listesini temizle
        this.domElementleri.notlarListesi.innerHTML = '';

        if (notlar.length === 0) {
            this.bosDurumuGoster();
            return;
        }

        // Boş durumu gizle
        this.bosDurumuGizle();

        // Her notu görüntüle
        notlar.forEach((not, index) => {
            const notKarti = this.notKartiOlustur(not, index);
            this.domElementleri.notlarListesi.appendChild(notKarti);
        });

        console.log(`📋 ${notlar.length} not görüntülendi`);
    }

    /**
     * Not kartı oluştur
     * @param {Object} not - Not objesi
     * @param {number} index - Not indeksi
     * @returns {HTMLElement} Not kartı elemanı
     */
    notKartiOlustur(not, index) {
        const notKarti = document.createElement('div');
        notKarti.className = 'not-kartı belirme-animasyonu';
        notKarti.dataset.notId = not.id;

        // Kategori rengi
        const kategoriSinifi = `kategori-${not.kategori}`;

        // Not kartı HTML içeriği
        notKarti.innerHTML = `
            <div class="not-basligi">
                <h3>${this.htmlGuvenligi(not.baslik)}</h3>
                <span class="not-kategorisi ${kategoriSinifi}">${this.kategoriAdiniAl(not.kategori)}</span>
            </div>
            <div class="not-icerigi">
                ${this.htmlGuvenligi(MetinYardimcilari.metniKirp(not.icerik, 150))}
            </div>
            <div class="not-tarihi">
                📅 ${TarihYardimcilari.goreceliTarihAl(not.olusturmaTarihi)}
                ${not.guncellenmeTarihi !== not.olusturmaTarihi ? `<br/>✏️ ${TarihYardimcilari.goreceliTarihAl(not.guncellenmeTarihi)}` : ''}
            </div>
            <div class="not-eylemleri">
                <button class="buton basari-buton" onclick="uygulamaYoneticisi.notuDuzenlemeModunaAl('${not.id}')">
                    <i class="fas fa-edit"></i>
                    Düzenle
                </button>
                <button class="buton tehlikeli-buton" onclick="uygulamaYoneticisi.notuSil('${not.id}')">
                    <i class="fas fa-trash"></i>
                    Sil
                </button>
            </div>
        `;

        return notKarti;
    }

    /**
     * HTML güvenliği için özel karakterleri escape et
     * @param {string} metin - Güvenli hale getirilecek metin
     * @returns {string} Güvenli metin
     */
    htmlGuvenligi(metin) {
        const temp = document.createElement('div');
        temp.textContent = metin;
        return temp.innerHTML;
    }

    /**
     * Kategori adını al
     * @param {string} kategori - Kategori kodu
     * @returns {string} Kategori adı
     */
    kategoriAdiniAl(kategori) {
        const kategoriAdlari = {
            'genel': 'Genel',
            'is': 'İş',
            'kisisel': 'Kişisel',
            'egitim': 'Eğitim',
            'proje': 'Proje'
        };

        return kategoriAdlari[kategori] || kategori;
    }

    /**
     * Notu düzenleme moduna al
     * @param {string} notId - Düzenlenecek notun ID'si
     */
    notuDuzenlemeModunaAl(notId) {
        const not = notYoneticisi.notAl(notId);

        if (!not) {
            this.hataMesajiGoster('Düzenlenecek not bulunamadı!');
            return;
        }

        // Form alanlarını doldur
        this.domElementleri.notBasligi.value = not.baslik;
        this.domElementleri.notKategorisi.value = not.kategori;
        this.domElementleri.notIcerigi.value = not.icerik;

        // Düzenleme moduna geç
        this.duzenlemeModu = true;
        this.duzenlenecekNotId = notId;

        // Form butonlarını güncelle
        this.formButonlariniGuncelle();

        // Formu görünür yap ve odaklan
        this.domElementleri.notBasligi.focus();
        this.domElementleri.notBasligi.scrollIntoView({ behavior: 'smooth' });

        this.bilgiMesajiGoster('Not düzenleme modunda. Değişikliklerinizi yapın ve kaydedin.');
    }

    /**
     * Düzenleme modundan çık
     */
    duzenlemeMoundanCik() {
        this.duzenlemeModu = false;
        this.duzenlenecekNotId = null;
        this.formButonlariniGuncelle();
        this.formuTemizle();
    }

    /**
     * Form butonlarını güncelle
     */
    formButonlariniGuncelle() {
        const kaydetButonu = this.domElementleri.notFormu.querySelector('.birincil-buton');
        const temizleButonu = this.domElementleri.notFormu.querySelector('.ikincil-buton');

        if (kaydetButonu) {
            if (this.duzenlemeModu) {
                kaydetButonu.innerHTML = '<i class="fas fa-save"></i> Notu Güncelle';
            } else {
                kaydetButonu.innerHTML = '<i class="fas fa-save"></i> Notu Kaydet';
            }
        }

        if (temizleButonu) {
            if (this.duzenlemeModu) {
                temizleButonu.innerHTML = '<i class="fas fa-times"></i> İptal Et';
                temizleButonu.onclick = () => this.duzenlemeMoundanCik();
            } else {
                temizleButonu.innerHTML = '<i class="fas fa-eraser"></i> Formu Temizle';
                temizleButonu.onclick = () => this.formuTemizle();
            }
        }
    }

    /**
     * Notu sil
     * @param {string} notId - Silinecek notun ID'si
     */
    notuSil(notId) {
        const not = notYoneticisi.notAl(notId);

        if (!not) {
            this.hataMesajiGoster('Silinecek not bulunamadı!');
            return;
        }

        // Onay al
        if (!confirm(`"${not.baslik}" adlı notu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
            return;
        }

        const basarili = notYoneticisi.notSil(notId);

        if (basarili) {
            this.basariMesajiGoster('Not başarıyla silindi!');
            this.notlariGoruntule();
            this.sonGuncellemeZamaniniGoster();

            // Eğer silinen not düzenlenmekteyse, düzenleme modundan çık
            if (this.duzenlemeModu && this.duzenlenecekNotId === notId) {
                this.duzenlemeMoundanCik();
            }
        } else {
            this.hataMesajiGoster('Not silinemedi!');
        }
    }

    /**
     * Formu temizle
     */
    formuTemizle() {
        this.domElementleri.notBasligi.value = '';
        this.domElementleri.notKategorisi.value = 'genel';
        this.domElementleri.notIcerigi.value = '';
    }

    /**
     * Arama yap
     * @param {string} aramaTerimi - Arama terimi
     */
    aramaYap(aramaTerimi) {
        notYoneticisi.aramaTerminiAyarla(aramaTerimi);
        this.notlariGoruntule();

        if (aramaTerimi.trim()) {
            this.bilgiMesajiGoster(`"${aramaTerimi}" için arama yapıldı.`);
        }
    }

    /**
     * Kategori filtresini uygula
     * @param {string} kategori - Kategori
     */
    kategoriFiltresiniUygula(kategori) {
        notYoneticisi.kategoriFiltresiniAyarla(kategori);
        this.notlariGoruntule();

        if (kategori !== 'hepsi') {
            this.bilgiMesajiGoster(`${this.kategoriAdiniAl(kategori)} kategorisi için filtrelendi.`);
        }
    }

    /**
     * Tarih sıralamasını uygula
     * @param {string} siralamaTercihi - Sıralama tercihi
     */
    tarihSiralamasiniUygula(siralamaTercihi) {
        notYoneticisi.siralamaTerminiAyarla(siralamaTercihi);
        this.notlariGoruntule();

        const siralamaAdlari = {
            'yeni-eski': 'Yeni → Eski',
            'eski-yeni': 'Eski → Yeni',
            'baslik-a-z': 'Başlık A → Z',
            'baslik-z-a': 'Başlık Z → A'
        };

        this.bilgiMesajiGoster(`${siralamaAdlari[siralamaTercihi]} sıralaması uygulandı.`);
    }

    /**
     * Not sayısını güncelle
     * @param {number} sayi - Not sayısı
     */
    notSayisiniGuncelle(sayi) {
        if (this.domElementleri.notSayisi) {
            this.domElementleri.notSayisi.textContent = `(${sayi})`;
        }
    }

    /**
     * Boş durumu göster
     */
    bosDurumuGoster() {
        if (this.domElementleri.bosDurum) {
            this.domElementleri.bosDurum.classList.remove('gizli');
        }
    }

    /**
     * Boş durumu gizle
     */
    bosDurumuGizle() {
        if (this.domElementleri.bosDurum) {
            this.domElementleri.bosDurum.classList.add('gizli');
        }
    }

    /**
     * Son güncelleme zamanını göster
     */
    sonGuncellemeZamaniniGoster() {
        if (this.domElementleri.sonGuncelleme) {
            const sonKayit = notYerelDepolama.sonKayitZamaniniAl();
            this.domElementleri.sonGuncelleme.textContent = TarihYardimcilari.goreceliTarihAl(sonKayit);
        }
    }

    /**
     * Klavye kısayollarını işle
     * @param {KeyboardEvent} e - Klavye olayı
     */
    klavyeKisayollariniIsle(e) {
        // Ctrl+N veya Cmd+N - Yeni not
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.domElementleri.notBasligi.focus();
        }

        // Ctrl+S veya Cmd+S - Kaydet
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.notFormunuIsle();
        }

        // Ctrl+F veya Cmd+F - Arama
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            this.domElementleri.aramaGirisi.focus();
        }

        // Escape - Düzenleme modundan çık
        if (e.key === 'Escape' && this.duzenlemeModu) {
            this.duzenlemeMoundanCik();
        }
    }

    /**
     * Başarı mesajı göster
     * @param {string} mesaj - Gösterilecek mesaj
     */
    basariMesajiGoster(mesaj) {
        this.toastMesajiGoster(mesaj, 'basari');
    }

    /**
     * Hata mesajı göster
     * @param {string} mesaj - Gösterilecek mesaj
     */
    hataMesajiGoster(mesaj) {
        this.toastMesajiGoster(mesaj, 'hata');
    }

    /**
     * Bilgi mesajı göster
     * @param {string} mesaj - Gösterilecek mesaj
     */
    bilgiMesajiGoster(mesaj) {
        this.toastMesajiGoster(mesaj, 'bilgi');
    }

    /**
     * Toast mesajı göster
     * @param {string} mesaj - Gösterilecek mesaj
     * @param {string} tip - Mesaj tipi (basari, hata, bilgi)
     */
    toastMesajiGoster(mesaj, tip = 'bilgi') {
        // Mevcut toast mesajlarını temizle
        this.toastMesajlariniTemizle();

        // Toast konteynerı oluştur
        const toastKonteyneri = document.createElement('div');
        toastKonteyneri.className = 'toast-konteyneri';
        toastKonteyneri.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 300px;
        `;

        // Toast elemanı oluştur
        const toast = document.createElement('div');
        toast.className = `toast toast-${tip}`;

        // Tip ikonları
        const ikonlar = {
            'basari': 'fas fa-check-circle',
            'hata': 'fas fa-exclamation-circle',
            'bilgi': 'fas fa-info-circle'
        };

        // Tip renkleri
        const renkler = {
            'basari': '#28a745',
            'hata': '#dc3545',
            'bilgi': '#007bff'
        };

        toast.style.cssText = `
            background-color: ${renkler[tip]};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            animation: toastBelirme 0.3s ease-out;
        `;

        toast.innerHTML = `
            <i class="${ikonlar[tip]}"></i>
            <span>${mesaj}</span>
        `;

        // Toast animasyonu
        const style = document.createElement('style');
        style.textContent = `
            @keyframes toastBelirme {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);

        // Toast'i sayfaya ekle
        toastKonteyneri.appendChild(toast);
        document.body.appendChild(toastKonteyneri);

        // 3 saniye sonra kaldır
        setTimeout(() => {
            toastKonteyneri.remove();
        }, 3000);
    }

    /**
     * Toast mesajlarını temizle
     */
    toastMesajlariniTemizle() {
        const mevcutToastlar = document.querySelectorAll('.toast-konteyneri');
        mevcutToastlar.forEach(toast => toast.remove());
    }

    /**
     * Verileri dışa aktar
     * @param {string} format - Dışa aktarım formatı
     */
    verileriDisaAktar(format = 'json') {
        try {
            const veri = notYoneticisi.notlariDisaAktar(format);

            if (!veri) {
                this.hataMesajiGoster('Veriler dışa aktarılamadı!');
                return;
            }

            // Dosya indirme
            const dosyaAdi = `benim-notlarim-${new Date().toISOString().split('T')[0]}.${format}`;
            const blob = new Blob([veri], { type: format === 'json' ? 'application/json' : 'text/plain' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = dosyaAdi;
            a.click();

            URL.revokeObjectURL(url);

            this.basariMesajiGoster('Veriler başarıyla dışa aktarıldı!');
        } catch (error) {
            console.error('Dışa aktarım hatası:', error);
            this.hataMesajiGoster('Dışa aktarım sırasında bir hata oluştu!');
        }
    }
}

// Global uygulama yöneticisi oluştur
const uygulamaYoneticisi = new UygulamaYoneticisi();

// Konsol bilgisi
console.log('🎯 Ana Uygulama modülü yüklendi');

// Geliştirici araçları için global fonksiyonlar
window.uygulamaYoneticisi = uygulamaYoneticisi;
window.notYoneticisi = notYoneticisi;
window.notYerelDepolama = notYerelDepolama;

// Uygulama bilgileri
console.log(`
🎉 Benim Notlarım Uygulaması Hazır!

📋 Kullanılabilir Özellikler:
- Not ekleme, düzenleme ve silme
- Kategori bazlı filtreleme
- Metin bazlı arama
- Tarih sıralaması
- Yerel depolama
- Keyboard shortcuts (Ctrl+N, Ctrl+S, Ctrl+F)

🛠️ Geliştirici Araçları:
- uygulamaYoneticisi: Ana uygulama yöneticisi
- notYoneticisi: Not yönetimi
- notYerelDepolama: Yerel depolama işlemleri

💡 Keyboard Shortcuts:
- Ctrl/Cmd + N: Yeni not
- Ctrl/Cmd + S: Kaydet
- Ctrl/Cmd + F: Arama
- Escape: Düzenleme modundan çık
`); 