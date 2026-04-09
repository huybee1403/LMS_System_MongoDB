const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📌 đảm bảo folder tồn tại khi start server
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 📌 storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return cb(new Error("Không tìm thấy userId"), null);
            }

            const ext = path.extname(file.originalname);

            // 🔥 luôn dùng userId → overwrite file cũ
            const fileName = `${userId}${ext}`;

            // 🔥 xóa file cũ nếu tồn tại (khác extension)
            const files = fs.readdirSync(uploadDir);

            files.forEach((f) => {
                if (f.startsWith(userId)) {
                    const oldPath = path.join(uploadDir, f);
                    fs.unlinkSync(oldPath);
                }
            });

            cb(null, fileName);
        } catch (err) {
            cb(err, null);
        }
    },
});

// 📌 filter ảnh
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ cho phép upload ảnh!"), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter,
});

module.exports = upload;
