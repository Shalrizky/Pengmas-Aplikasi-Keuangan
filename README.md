# Tangguh Berkibar - Aplikasi Keuangan
Aplikasi ini merupakan sebuah solusi yang dirancang dengan sederhana namun efektif untuk membantu UMKM dalam mengelola keuangan mereka. Fokus utamanya adalah memberikan kemudahan bagi para pengguna dalam memantau dan menganalisis kinerja keuangan bisnis mereka setiap bulan.

Salah satu keunggulan utama dari aplikasi ini adalah kemampuannya untuk menyajikan informasi yang relevan dengan mudah, khususnya melalui modul Laba Rugi dan Laba Bersih. Modul ini memberikan gambaran yang jelas tentang performa keuangan UMKM dalam suatu periode waktu tertentu, sehingga memungkinkan pemilik bisnis untuk mengambil keputusan yang tepat.

Selain itu, aplikasi ini juga dilengkapi dengan fitur riwayat transaksi harian yang sederhana namun informatif. Fitur ini memungkinkan pengguna untuk mencatat dengan teratur semua arus kas yang masuk dan keluar setiap hari, sehingga memudahkan mereka dalam melacak dan mengelola keuangan bisnis mereka.

Meskipun sederhana, aplikasi ini memiliki potensi besar untuk membantu UMKM dalam mengelola keuangan mereka dengan lebih efisien. Dengan menyediakan alat yang mudah digunakan dan informasi yang relevan, aplikasi ini dapat membantu UMKM untuk mengembangkan bisnis mereka dengan lebih baik.


## Perhatian 
#### Terdapat 2 baranches yang tertera pada aplikasi yaitu:
1.   ```dev-for-lokal```  Merupakan file development untuk keperluan pengembangan program.
2.  ```main``` Merupakan file Deploy atau file aplikasi yang sudah FIX dan dapat di hosting/diinstal.
#### Catatan
 - Jika anda ingin menginstall/mendeploy aplikasi pastikan anda **menggunakan file yang berada pada baranches  ```main```**
 - Silahkan download file pada main untuk mendapatkan file fix jika ingin mendeploy apk
 - Jika igin merubah/mencoba pada versi lokal maka bisa download file yang tertera pada baranch  ```dev-for-lokal```

## Panduan Instalasi
**Sebelum Anda memulai proses instalasi aplikasi Tangguh Berkibar, pastikan Anda telah melakukan beberapa persiapan yang penting:** <br>

  - **! Pada saat proses instalasi aplikasi diharapkan anda sudah mendownload firebase CLI <br>**
  - **! Jika anda belum mendownload firebase CLI anda bisa mendownload dengan mengetikan command ```npm install -g firebase-tools``` <br>**
  - **! Harap diingat bahwa untuk menginstall firebase CLI maka anda harus menggunakan npm seperti yang tertera diatas, Jika belum memiliki NPM, Anda perlu mengunduh 		Node.js. ```Harap unduh terlebih dahulu melalui link berikut:``` [Node.js Download](https://nodejs.org/en/download)**

### 1.Firebase Setup:
 - Buat akun Firebase.
 - Buat proyek dengan nama "Aplikasi Tangguh Berkibar".
 - Setel proyek sebagai proyek web dengan nama "Tangguh Berkibar" (Pada tahap ini jangan mencentang pilihan hosting).
 - Aktifkan Google provider di Authentication -> Sign-in method (pada bagian email isi dengan email saat ini/email user, dan ubah nama proyek menjadi "Tangguh Berkibar").
 - Atur template password reset pada Authentication -> Templates -> Password Reset.
   ### pada bagian password reset isi seperti berikut:
   - Sender name: Tangguh Berkibar.
   - From: tangguh_berkibar.
   - Subject: Link Reset your password for %APP_NAME%.
   -  Message: 
   	 ```html
     	<p>Halo,</p>
			<p>Kami menerima permintaan reset password pada akun %EMAIL%. harap klik tombol ini untuk merubah password pada aplikasi Tangguh Baerkibar anda.</p>
			<p>
  			<a href='%LINK%' style='display: inline-block; padding: 10px 50px; color: white; background-color: #0B806D; text-decoration: none; border-radius: 5px;'>Reset 
     		Password</a>
			</p>
			<p>Perhatian: Link akan kadaluwarsa dalam 3 menit</p>
			<p>Jika anda tidak meninta permintaan reset password ini, harap diabaikan.</p>
			<p>Terimakasih,</p>
			<p>%APP_NAME% team</p>
     ```
	 - Action URL: ``` https://nama_websites/loginRegister/resetPassword.html ```

### 2.Database Setup:
 - Buka Realtime Database dan buat database baru.
 - Pilih server USA dan setel mode ke "Start in Lock Mode".
 - Impor file "tangguh-berkibar-rtdb.json" yang sudah tertera pada folder ke dalam database.

### 3.Firebase Rules:
 - Buka menu Realtime Database -> Rules dan terapkan aturan berikut:
``` json
{
  "rules": {
    ".read":  true,
    ".write": true,
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "email": {
          ".validate": "newData.isString() && newData.val().matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/)"
        },
        "displayName": {
          ".validate": "newData.isString() && newData.val().length > 0"
        },
        "password": {
          ".validate": "newData.isString() && newData.val().length >= 64"
        },
        "namaUsaha": {
          ".validate": "newData.isString() && newData.val().length > 0"
        },
      }
    }
  }
}
```

### 4.Hosting:
 - Buka menu Hosting dan ikuti langkah-langkah untuk menginisialisasi dan merilis proyek Anda.
 - Setelah mengikuti langkah hosting pada firebase maka masuk ke direktori file pada CMD (pastikan run as administrator) pada tahap ini arahkan ke folder 
   yang baru saja anda download untuk di hosting.
 - Kemudian login dengan mengetikan commad ``` firebase login ```
 - Ketika login sudah berhasil ketikan command ```firebase init``` untuk memulai insiasi aplikasi.

### 5.Langkah-Langkah Deploy:
 akan muncul beberapa pertanyaan konfirmasi, pada pertanyaan pertama tekan y untuk segera proses inisialisasi. 
 kemudian terdapat beberapa pilihan yang harus di sertakan seperti berikut:
 -  Pilih Hosting: Configure files for Firebase Hosting and …… (keterangan: untuk menggerakkan pilihan gunakan panah atas/bawah, tekan space bar untuk memilih, dan tekan 				enter untuk memproses). ![image](https://github.com/Shalrizky/Pengmas-Aplikasi-Keuangan/assets/144994306/34e69db0-69c7-4243-a4a8-d9d9155bffb0)
 -  Selanjutnya menentukan project mana yang akan digunakan sebagai hosting aplikasi web kita, untuk itu pilih use an exixting project (memilih project yang sudah ada pada 			firebase).  <br> ![image](https://github.com/Shalrizky/Pengmas-Aplikasi-Keuangan/assets/144994306/53c2309a-582b-47da-8a46-6419c8c75445)
 -  Selanjutnya pilih pada daftar project yang ditampilkan untuk tahap ini pilih projek firebase yang sudah dikonfikurasi sebagai contoh tadi adalah "Tangguh Berkibar" <br>
 		![image](https://github.com/Shalrizky/Pengmas-Aplikasi-Keuangan/assets/144994306/72c4f2ae-1b0a-4fa3-84dc-a4222aff4cab)
 - Selanjutnya untuk setting folder public dan file index, ikuti pilihan di bawah ini: (public -> no -> no -> no) <br>
   	![image](https://github.com/Shalrizky/Pengmas-Aplikasi-Keuangan/assets/144994306/0a9469ee-2b0c-4bdc-bd45-6bd6b826d7fb)

### 6.Deploy & Update Aplikasi
 - setelah semua dilakukan maka buka firebase, Salin konfigurasi Firebase (SDK setup) dari Firebase Console dan pastekan ke dalam file init.js pada direktori file yang telah  dihosting. (harap copy pada bagian yang di block oleh gambar) <br>
 <img width="768" alt="image" src="https://github.com/Shalrizky/Pengmas-Aplikasi-Keuangan/assets/144994306/34b1f274-f586-4ebd-92c9-84ddc4fcb68e">

 - Setelah SDK firebase sudah di pastekan pada file init maka kembali ke command prompt dan ketikan command ```firebase deploy```.

### 7.Cek Website:
 - Buka aplikasi web yang sudah di-deploy dengan mengunjungi domain yang telah disediakan oleh Firebase Hosting.
 - Cara melihat domain dapat dilakukan pada halaman hosting -> link domain dan klik link domain yang sudah tertera. <br>
 		![image](https://github.com/Shalrizky/Pengmas-Aplikasi-Keuangan/assets/144994306/3bf4f8ec-9fa2-4a76-8073-ea4d0b6e618d)

### Proses instalasi selesai dan telah berhasil menginstal dan mendeploy aplikasi Tangguh Berkibar! Silakan kunjungi website untuk melihat hasilnya.

### Catatan
 - Pastikan nama folder proyek sesuai dengan apa yang anda ingin deploy dan insialisasi.
 - Pastikan Autehtikasi sudah sesuai seperti pada panduan isntalasi dan pada bagian reset password pastikan sudah sesuai dengan nama website yang anda deploy.
 - Pastikan rules firebase pada Realtime dataabase sudah sesuai dan terpublish.
 - Harap diingat bahwa sebelum deploy aplikasi maka init harus diganti menggunakan firebase SDK yang tertea pada projek yang baru saja anda bikin seperti pada panduan.
 - Jika ada eror harap diperhatikan dan membaca eror tersebut.



 

 
