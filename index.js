// Muat variabel dari file .env ke process.env (tidak menimpa env yang sudah diset Kubernetes)
require('dotenv').config()

// Impor framework Express untuk membuat HTTP server
const express = require("express");
// Buat instance aplikasi Express
const app = express();

// Impor body-parser untuk membaca body request
const bp = require("body-parser");
// Parse body request yang berformat JSON
app.use(bp.json());

// Impor amqplib, library klien AMQP untuk berkomunikasi dengan RabbitMQ
const amqp = require("amqplib");
// Ambil URL RabbitMQ dari environment variable AMQP_URL
const amqpServer = process.env.AMQP_URL;
// Variabel global untuk menyimpan channel dan koneksi RabbitMQ
var channel, connection;

// Mulai koneksi ke RabbitMQ saat aplikasi dijalankan
connectToQueue();

// Fungsi untuk terhubung ke RabbitMQ dan menyiapkan queue "order"
async function connectToQueue() {
    // Bungkus dengan try agar kegagalan koneksi bisa ditangani
    try {
        // Buka koneksi ke server RabbitMQ
        connection = await amqp.connect(amqpServer);
        // Buat channel di atas koneksi tersebut
        channel = await connection.createChannel();
        // Nama queue yang dipakai bersama dengan shipping service
        const queue = "order";
        // Pastikan queue "order" ada (dibuat jika belum ada)
        await channel.assertQueue(queue);
        // Tampilkan pesan bahwa koneksi berhasil
        console.log("Connected to the queue!")
    } catch (ex) {
        // Tampilkan error jika RabbitMQ belum siap
        console.error(`Gagal terhubung ke RabbitMQ: ${ex.message}. Mencoba lagi dalam 5 detik...`);
        // Coba hubungkan ulang setelah 5 detik
        setTimeout(connectToQueue, 5000);
    }
}

// Endpoint POST /order untuk menerima data order dalam format JSON
app.post("/order", (req, res) => {
    // Tolak request jika koneksi ke RabbitMQ belum siap
    if (!channel) {
        // Kirim status 503 (Service Unavailable) beserta pesan
        return res.status(503).send({ message: "RabbitMQ belum terhubung, coba lagi sebentar." });
    }
    // Ambil objek order dari body request
    const { order } = req.body;
    // Kirim order ke queue RabbitMQ
    createOrder(order);
    // Kembalikan data order sebagai response
    res.send(order);
});

// Fungsi untuk mengirim data order ke queue RabbitMQ
const createOrder = async order => {
    // Nama queue tujuan
    const queue = "order";
    // Kirim order ke queue dalam bentuk Buffer berisi string JSON
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(order)));
    // Tampilkan pesan bahwa order berhasil dikirim
    console.log("Order succesfully created!")
    // Saat menerima sinyal SIGINT (Ctrl + C), tutup koneksi dengan rapi
    process.once('SIGINT', async () => {
        // Tampilkan pesan bahwa koneksi akan ditutup
        console.log('got sigint, closing connection');
        // Tutup channel RabbitMQ
        await channel.close();
        // Tutup koneksi RabbitMQ
        await connection.close();
        // Hentikan proses Node.js
        process.exit(0);
    });
};

// Jalankan HTTP server pada port dari environment variable PORT
app.listen(process.env.PORT, () => {
    // Tampilkan port yang digunakan server
    console.log(`Server running at ${process.env.PORT}`);
});
