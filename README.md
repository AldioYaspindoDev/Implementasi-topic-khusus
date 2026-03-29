# 🚀 Implementasi Redis dan RabbitMQ pada Express.js

Proyek ini mendemonstrasikan cara mengimplementasikan **Redis** sebagai *caching layer* dan **RabbitMQ** sebagai *message broker* untuk pengiriman email asinkron pada aplikasi **Express.js** dengan **MongoDB**.

## 📋 Tech Stack

- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose** — Database utama
- **Redis** — Caching layer
- **RabbitMQ** — Message Broker (Task Queue untuk Email)
- **Nodemailer** — Pengiriman Email
- **Multer** — Upload gambar
- **JWT** + **bcrypt/argon2** — Autentikasi

## 🏗️ Arsitektur

### 1. Arsitektur Redis Cache
```text
Client Request
      │
      ▼
  Express Server
      │
      ▼
  Redis Cache ──── Cache HIT? ──── Ya ──→ Response (⚡ cepat)
      │
     Tidak
      │
      ▼
   MongoDB ──→ Simpan ke Redis ──→ Response
```
**Alur Kerja Redis:**
1. Client mengirim request ke server.
2. Server mengecek **Redis** terlebih dahulu.
3. **Cache HIT** → Data langsung dikembalikan dari Redis (sangat cepat).
4. **Cache MISS** → Data diambil dari MongoDB, disimpan ke Redis, lalu dikembalikan.
5. Saat data berubah (create/update/delete) → Cache di-invalidate otomatis.

### 2. Arsitektur RabbitMQ (Email Sender)
```text
Client Request (Misal: Register/Notifikasi)
      │
      ▼
  Express Server (Producer)
      │
      ▼ Mengirim pesan ke Queue ('email_queue')
      │
  RabbitMQ Broker (Menyimpan antrean pesan)
      │
      ▼ Consumer mengambil pesan
      │
  Express Server (Consumer) ──→ Nodemailer ──→ 📧 Kirim Email ke User
```
**Alur Kerja RabbitMQ:**
1. Server (Producer) menerima request yang membutuhkan pengiriman email.
2. Server mengirimkan data email ke *queue* RabbitMQ (`email_queue`) dan langsung merespons client (tidak memblokir request).
3. Di *background*, Consumer mengambil data dari *queue*.
4. Consumer menggunakan Nodemailer untuk mengirimkan email.
5. Jika berhasil, pesan dihapus dari *queue* (ACK), jika gagal pesan dapat di-retry (NACK).

## 📁 Struktur Proyek

```text
Server/
├── .env                          # Environment variables
├── .gitignore
├── package.json
└── src/
    ├── server.js                 # Entry point
    ├── app.js                    # Express app setup
    ├── config/
    │   ├── database.js           # Koneksi MongoDB
    │   ├── redis.js              # Koneksi Redis
    │   ├── rabbitmq.js           # Koneksi RabbitMQ
    │   └── mailer.js             # Konfigurasi Nodemailer
    ├── Controllers/
    │   └── admin.controller.js   # CRUD + cache logic
    ├── Model/
    │   └── admin.model.js        # Mongoose schema
    ├── Routes/
    │   └── admin.route.js        # Route + cache middleware
    ├── services/
    │   ├── emailProducer.js      # RabbitMQ Producer untuk email
    │   └── emailConsumer.js      # RabbitMQ Consumer untuk email
    └── middleware/
        ├── redisCache.js         # Redis cache middleware
        └── uploadImage.js        # Multer upload
```

## ⚙️ Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/AldioYaspindoDev/Impelentasi-Redis-pada-express.git
cd Impelentasi-Redis-pada-express/Server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` di root folder aplikasi:

```env
PORT=3000
MONGO=mongodb://localhost:27017/belajar1
REDIS_URL=redis://default:PASSWORD@your-redis-host:PORT
CACHE_TTL=3600
JWT_KEY=your_secret_key

RABBITMQ_URL=amqp://localhost
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

| Variable | Deskripsi |
|----------|-----------|
| `PORT` | Port server (default: 3000) |
| `MONGO` | URL koneksi MongoDB |
| `REDIS_URL` | URL koneksi Redis (lokal atau cloud) |
| `CACHE_TTL` | Durasi cache dalam detik (3600 = 1 jam) |
| `RABBITMQ_URL` | URL koneksi RabbitMQ lokal atau cloud |
| `MAIL_*` | Konfigurasi SMTP Nodemailer |

### 4. Jalankan Server

```bash
npm run dev
```

Console akan menampilkan (kurang lebih):
```text
database connected and running
Redis connected and running
rabbitmq connected
email consumer started
application start and running on port 3000
```

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi | Cache |
|--------|----------|-----------|-------|
| `GET` | `/admin` | Ambil semua admin | ✅ Cached |
| `GET` | `/admin/:id` | Ambil admin by ID | ✅ Cached |
| `POST` | `/admin/create` | Buat admin baru | 🔄 Invalidate cache |
| `PUT` | `/admin/:id` | Update admin | 🔄 Invalidate cache |
| `DELETE` | `/admin/:id` | Hapus admin | 🔄 Invalidate cache |
| `POST` | `/admin/login` | Login admin | - |

## 🧠 Cara Kerja Fitur Utama

### 1. Redis Cache Middleware (`redisCache.js`)

```javascript
// Middleware mengecek cache sebelum request masuk ke controller
export const cacheMiddleware = (keyPrefix) => {
    return async (req, res, next) => {
        const cacheKey = req.params.id 
            ? `${keyPrefix}:${req.params.id}` 
            : `${keyPrefix}:all`;

        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            // Cache HIT - langsung return
            return res.status(200).json(JSON.parse(cachedData));
        }

        // Cache MISS - lanjut ke controller
        next();
    };
};
```
*Setiap kali data berubah (create, update, delete), cache akan otomatis dihapus dengan cara invalidation `deleteCache('admin:*')`.*

### 2. RabbitMQ Email Sender (`emailProducer.js` & `emailConsumer.js`)

**Producer** bertugas mengirim data email ke antrean saat ada *trigger* (misal register):
```javascript
export const publishedEmailJob = async (emailData) => {
    const channel = getChannel();
    await channel.assertQueue('email_queue', { durable: true });
    
    // Kirim pesan ke RabbitMQ Queue
    channel.sendToQueue('email_queue', Buffer.from(JSON.stringify(emailData)), { persistent: true });
};
```

**Consumer** berjalan di *background*, mengambil antrean pesan, dan mengirim email via SMTP:
```javascript
export const startEmailConsumer = async ()=> {
    const channel = getChannel();
    await channel.assertQueue('email_queue', { durable: true });
    
    // Proses setiap pesan secara berurutan
    channel.consume('email_queue', async (msg)=>{
        const emailData = JSON.parse(msg.content.toString());
        await transporter.sendMail({ ...emailData });
        
        channel.ack(msg); // Konfirmasi bahwa email sukses dikirim
    });
}
```
Ini memastikan proses user tidak terhambat sambil menunggu email dikirim oleh server SMTP.

## 🧪 Testing

### Menggunakan Postman / Thunder Client

1. **Test Cache:**
   - **GET** `/admin` — Panggil 2 kali:
     - Pertama: Console menampilkan `Cache MISS`
     - Kedua: Console menampilkan `Cache HIT` (Response sangat cepat)

2. **Test Invalidation:**
   - **POST** `/admin/create`, lalu lakukan **GET** `/admin` lagi — akan menghasilkan `Cache MISS` karena data baru telah masuk DB.

3. **Test RabbitMQ (Asinkron):**
   - Lakukan satu *action* yang memicu pengiriman email (jika diintegrasikan pada *register*).
   - Response Postman segera dikembalikan *tanpa menunggu instruksi email selesai*.
   - Console server akan menampilkan proses antrean email dan konfirmasi setelah berhasil dikirim di *background*.
