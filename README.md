# Tangguh Berkibar - Aplikasi Keuangan #
Panduan Instalasi
Sebelum Anda memulai proses instalasi aplikasi Tangguh Berkibar, pastikan Anda telah melakukan beberapa persiapan yang penting:

Firebase Setup:

Buat akun Firebase.
Buat proyek dengan nama "Aplikasi Tangguh Berkibar".
Setel proyek sebagai proyek web dengan nama "Tangguh Berkibar".
Aktifkan Google provider di Authentication -> Sign-in method.
Atur template password reset pada Authentication -> Templates -> Password Reset.
Database Setup:

Buka Realtime Database dan buat database baru.
Pilih server USA dan setel mode ke "Start in Lock Mode".
Impor file "tangguh-berkibar-rtdb.json" ke dalam database.
Firebase Rules:

Buka menu Realtime Database -> Rules dan terapkan aturan berikut:
