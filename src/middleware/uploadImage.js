import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';

// upload gambar
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb)=> {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


export const upload = multer({storage: storage});