# Pengmas-Aplikasi-Keuangan

## Panduan Instalasi Aplikasi Tangguh Berkibar
Sebelum Anda memulai proses instalasi aplikasi Tangguh Berkibar, pastikan Anda telah melakukan beberapa langkah persiapan yang penting:

1. Firebase Setup:
Pastikan Anda sudah membuat akun Firebase dan telah membuat proyek dengan nama "Aplikasi Tangguh Berkibar". Setel proyek tersebut sebagai proyek web dengan nama "Tangguh Berkibar".
Aktifkan Google provider di bagian Authentication -> Sign-in method.
Atur template password reset pada Authentication -> Templates -> Password Reset.
2. Database Setup:
Buka Realtime Database dan buat database baru. Pilih server USA dan setel mode ke "Start in Lock Mode".
Impor file "tangguh-berkibar-rtdb.json" ke dalam database.
3. Firebase Rules:
Buka menu Realtime Database -> Rules dan terapkan aturan berikut:
json

{
  "rules": {
    ".read": true,
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
        }
      }
    }
  }
}
4. Hosting:
Buka menu Hosting, lalu ikuti langkah-langkah untuk menginisialisasi dan merilis proyek Anda.
Gunakan nama domain yang telah Anda set pada proyek Firebase.
5. Firebase CLI:
Pastikan Anda telah menginstal Firebase CLI. Jika belum, instal dengan perintah npm install -g firebase-tools.
Buka terminal/cmd, arahkan ke direktori proyek, dan ketik firebase login untuk login.
Inisialisasikan proyek dengan firebase init dan pilih Hosting, atur direktori publik menjadi "public".
6. Update Firebase Configuration:
Salin konfigurasi Firebase (SDK setup) dari Firebase Console dan pastekan ke dalam file init.js pada direktori yang telah dihosting.
7. Deploy Aplikasi:
Jalankan perintah firebase deploy untuk melakukan deploy aplikasi.
8. Cek Website:
Buka aplikasi web yang sudah di-deploy dengan mengunjungi domain yang telah disediakan oleh Firebase Hosting.
Selamat, Anda telah berhasil menginstal dan mendeploy aplikasi Tangguh Berkibar! Silakan kunjungi website untuk melihat hasilnya.

Catatan:

Pastikan Anda mengganti nama folder proyek sesuai kebutuhan (contoh: "apkTangguhBerkibar_Version_1.1.0").
Pastikan selalu melakukan uji coba pada setiap langkah dan memperhatikan pesan kesalahan jika ada.
Harap disesuaikan dengan kebutuhan spesifik proyek Anda.
User
SAYA MEMBUAT DI  GITHUB SESUAIKAN ENGANTULISAN GITHUB DONG MENGGUNAKAN CODE
ChatGPT
Panduan Instalasi Aplikasi Tangguh Berkibar
Sebelum Anda memulai proses instalasi aplikasi Tangguh Berkibar, pastikan Anda telah melakukan beberapa langkah persiapan yang penting:

1. Firebase Setup:
Pastikan Anda sudah membuat akun Firebase dan telah membuat proyek dengan nama "Aplikasi Tangguh Berkibar". Setel proyek tersebut sebagai proyek web dengan nama "Tangguh Berkibar".
Aktifkan Google provider di bagian Authentication -> Sign-in method.
Atur template password reset pada Authentication -> Templates -> Password Reset.
2. Database Setup:
Buka Realtime Database dan buat database baru. Pilih server USA dan setel mode ke "Start in Lock Mode".
Impor file "tangguh-berkibar-rtdb.json" ke dalam database.
3. Firebase Rules:
Buka menu Realtime Database -> Rules dan terapkan aturan berikut:
json
Copy code
{
  "rules": {
    ".read": true,
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
        }
      }
    }
  }
}
4. Hosting:
Buka menu Hosting, lalu ikuti langkah-langkah untuk menginisialisasi dan merilis proyek Anda.
Gunakan nama domain yang telah Anda set pada proyek Firebase.
5. Firebase CLI:
Pastikan Anda telah menginstal Firebase CLI. Jika belum, instal dengan perintah npm install -g firebase-tools.
Buka terminal/cmd, arahkan ke direktori proyek, dan ketik firebase login untuk login.
Inisialisasikan proyek dengan firebase init dan pilih Hosting, atur direktori publik menjadi "public".
6. Update Firebase Configuration:
Salin konfigurasi Firebase (SDK setup) dari Firebase Console dan pastekan ke dalam file init.js pada direktori yang telah dihosting.
7. Deploy Aplikasi:
Jalankan perintah firebase deploy untuk melakukan deploy aplikasi.
8. Cek Website:
Buka aplikasi web yang sudah di-deploy dengan mengunjungi domain yang telah disediakan oleh Firebase Hosting.
Selamat, Anda telah berhasil menginstal dan mendeploy aplikasi Tangguh Berkibar! Silakan kunjungi website untuk melihat hasilnya.

Catatan:

Pastikan Anda mengganti nama folder proyek sesuai kebutuhan (contoh: "apkTangguhBerkibar_Version_1.1.0").
Pastikan selalu melakukan uji coba pada setiap langkah dan memperhatikan pesan kesalahan jika ada.
Harap disesuaikan dengan kebutuhan spesifik proyek Anda.
bash

# Contoh perintah untuk deploy menggunakan Firebase CLI
firebase deploy
