import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Necesario para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aseguramos que la carpeta uploads exista en la raíz del proyecto
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === "cv") {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Formato no válido. El CV debe ser PDF.'), false);
    } else if (file.fieldname === "fotoPerfil") {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Formato no válido. Debe ser una imagen.'), false);
    } else {
        cb(null, false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: fileFilter
});

export default upload;