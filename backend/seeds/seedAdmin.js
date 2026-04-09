const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

const initDB = async () => {
    const admin = await User.findOne({
        email: "giahuy14022003@gmail.com",
    });

    if (!admin) {
        const hashedPassword = await bcrypt.hash("Huy142003", 10);

        await User.create({
            user_type: "admin",
            first_name: "Trần",
            last_name: "Gia Huy",
            email: "giahuy14022003@gmail.com",
            password: hashedPassword,
        });

        console.log("✅ Admin seeded");
    }
};

module.exports = initDB;
