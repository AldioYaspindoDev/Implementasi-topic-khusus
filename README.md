# 🚀 Implementasi Redis pada Express.js

Proyek ini mendemonstrasikan cara mengimplementasikan **Redis** sebagai caching layer pada aplikasi **Express.js** dengan **MongoDB**.

## 📋 Tech Stack

- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose** — Database utama
- **Redis** — Caching layer
- **Multer** — Upload gambar
- **JWT** + **bcryptjs** — Autentikasi

## 🏗️ Arsitektur

```
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

**Alur Kerja:**
1. Client mengirim request ke server
2. Server mengecek **Redis** terlebih dahulu
3. **Cache HIT** → Data langsung dikembalikan dari Redis (sangat cepat)
4. **Cache MISS** → Data diambil dari MongoDB, disimpan ke Redis, lalu dikembalikan
5. Saat data berubah (create/update/delete) → Cache di-invalidate otomatis

## 📁 Struktur Proyek

```
Server/
├── .env                          # Environment variables
├── .gitignore
├── package.json
└── src/
    ├── server.js                 # Entry point
    ├── app.js                    # Express app setup
    ├── config/
    │   ├── database.js           # Koneksi MongoDB
    │   └── redis.js              # Koneksi Redis
    ├── Controllers/
    │   └── admin.controller.js   # CRUD + cache logic
    ├── Model/
    │   └── admin.model.js        # Mongoose schema
    ├── Routes/
    │   └── admin.route.js        # Route + cache middleware
    └── middleware/
        ├── redisCache.js         # Redis cache middleware
        └── uploadImage.js        # Multer upload
```

## ⚙️ Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/AldioYaspindoDev/Impelentasi-Redis-pada-express.git
cd Impelentasi-Redis-pada-express
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` di root folder:

```env
PORT=3000
MONGO=mongodb://localhost:27017/belajar1
REDIS_URL=redis://default:PASSWORD@your-redis-host:PORT
CACHE_TTL=3600
```

| Variable | Deskripsi |
|----------|-----------|
| `PORT` | Port server (default: 3000) |
| `MONGO` | URL koneksi MongoDB |
| `REDIS_URL` | URL koneksi Redis (lokal atau cloud) |
| `CACHE_TTL` | Durasi cache dalam detik (3600 = 1 jam) |

### 4. Jalankan Server

```bash
npm run dev
```

Console akan menampilkan:
```
database connected and running
Redis connected and running
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

## 🧠 Cara Kerja Redis Cache

### Cache Middleware (`redisCache.js`)

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

### Cache Invalidation

Setiap kali data berubah (create, update, delete), cache akan otomatis dihapus:

```javascript
await deleteCache('admin:*'); // Hapus semua cache admin
```

Ini memastikan data yang ditampilkan selalu **up-to-date**.

## 🧪 Testing

### Menggunakan Postman / Thunder Client

1. **GET** `/admin` — Panggil 2 kali:
   - Pertama: Console menampilkan `Cache MISS: admin:all`
   - Kedua: Console menampilkan `Cache HIT: admin:all`

2. **POST** `/admin/create` — Buat admin baru:
   - Console menampilkan `Cache INVALIDATED: admin:*`
   - GET berikutnya akan `Cache MISS` (data fresh dari DB)

### Menggunakan Redis CLI

```bash
redis-cli
KEYS *           # Lihat semua cache keys
GET admin:all    # Lihat isi cache
FLUSHALL         # Hapus semua cache
```

## 🌐 Redis Cloud

Proyek ini mendukung **Redis Cloud**. Cukup ubah `REDIS_URL` di `.env`:

```env
REDIS_URL=redis://default:YOUR_PASSWORD@your-host.redislabs.com:PORT
```

Dapatkan Redis Cloud gratis di [redis.io/cloud](https://redis.io/cloud/).

## 📝 Lisensi

ISC
