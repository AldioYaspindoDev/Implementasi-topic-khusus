import redisClient from '../config/redis.js';

// Middleware: cek cache sebelum ke controller
export const cacheMiddleware = (keyPrefix) => {
    return async (req, res, next) => {
        try {
            const cacheKey = req.params.id 
                ? `${keyPrefix}:${req.params.id}` 
                : `${keyPrefix}:all`;

            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                console.log(`Cache HIT: ${cacheKey}`);
                return res.status(200).json(JSON.parse(cachedData));
            }

            console.log(`Cache MISS: ${cacheKey}`);
            next(); // Lanjut ke controller jika cache kosong
        } catch (error) {
            console.error('Redis cache error:', error);
            next(); // Jika Redis error, lanjut ke controller (graceful fallback)
        }
    };
};

// Helper: simpan data ke cache
export const setCache = async (key, data, ttl) => {
    try {
        const expiry = ttl || parseInt(process.env.CACHE_TTL) || 3600;
        await redisClient.setEx(key, expiry, JSON.stringify(data));
    } catch (error) {
        console.error('Redis set cache error:', error);
    }
};

// Helper: hapus cache (untuk invalidation)
export const deleteCache = async (keyPattern) => {
    try {
        const keys = await redisClient.keys(keyPattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`Cache INVALIDATED: ${keyPattern}`);
        }
    } catch (error) {
        console.error('Redis delete cache error:', error);
    }
};
