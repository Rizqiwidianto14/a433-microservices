// Muat variabel dari file .env ke process.env (tidak menimpa env yang sudah diset Kubernetes)
require('dotenv').config()

// Impor framework Express untuk membuat HTTP server
const express = require("express");
// Buat instance aplikasi Express
const app = express();

// Impor body-parser (disediakan starter project, tidak dipakai karena service ini tidak menerima body request)
const bp = require("body-parser");

// Impor amqplib, library klien AMQP untuk berkomunikasi dengan RabbitMQ
const amqp = require("amqplib");
// Ambil URL RabbitMQ dari environment variable AMQP_URL
const amqpServer = process.env.AMQP_URL;
// Variabel global untuk menyimpan channel dan koneksi RabbitMQ
var channel, connection;

// Mulai koneksi ke RabbitMQ saat aplikasi dijalankan
connectToQueue();

// Fungsi untuk terhubung ke RabbitMQ dan mengonsumsi pesan dari queue "order"
async function connectToQueue() {
    // Bungkus dengan try agar kegagalan koneksi bisa ditangani
    try {
        // Buka koneksi ke server RabbitMQ
        connection = await amqp.connect(amqpServer);
        // Buat channel di atas koneksi tersebut
        channel = await connection.createChannel();
        // Pastikan queue "order" ada (dibuat jika belum ada)
        await channel.assertQueue("order");
        // Tampilkan pesan bahwa koneksi berhasil
        console.log("Connected to the queue!");
        // Dengarkan setiap pesan baru yang masuk ke queue "order"
        channel.consume("order", data => {
            // Cetak isi order yang diterima
            console.log(`Order received: ${Buffer.from(data.content)}`);
            // Cetak keterangan bahwa order akan segera dikirim
            console.log("** Will be shipped soon! **\n")
            // Beri tahu RabbitMQ bahwa pesan sudah diproses agar dihapus dari queue
            channel.ack(data);
        });
    } catch (ex) {
        // Tampilkan error jika RabbitMQ belum siap
        console.error(`Gagal terhubung ke RabbitMQ: ${ex.message}. Mencoba lagi dalam 5 detik...`);
        // Coba hubungkan ulang setelah 5 detik
        setTimeout(connectToQueue, 5000);
    }
}

// Jalankan HTTP server pada port dari environment variable PORT
app.listen(process.env.PORT, () => {
    // Tampilkan port yang digunakan server
    console.log(`Server running at ${process.env.PORT}`);
});
