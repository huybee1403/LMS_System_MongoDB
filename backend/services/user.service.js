const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

/* ================= GET ALL ================= */
exports.getAllUsers = async () => {
    return await User.find().select("-password");
};

/* ================= GET BY NAME ================= */
exports.getUsersByName = async (name) => {
    return await User.find({
        $or: [{ first_name: { $regex: name, $options: "i" } }, { last_name: { $regex: name, $options: "i" } }],
    }).select("-password");
};

/* ================= GET BY ROLE ================= */
exports.getUsersByRole = async (role) => {
    return await User.find({ user_type: role }).select("-password");
};

/* ================= UPDATE (ADMIN) ================= */
exports.updateUser = async (email, new_password, role) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    if (new_password) {
        user.password = await bcrypt.hash(new_password, 10);
    }

    if (role) {
        user.user_type = role;
    }

    await user.save();

    return user;
};

/* ================= UPDATE ACCOUNT ================= */
exports.updateUserAccount = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const { email, phone_number, date_of_birth, new_password, repassword, avatar } = data;

    // check password
    if (new_password && new_password !== repassword) {
        throw new Error("Mật khẩu nhập lại không khớp");
    }

    if (new_password) {
        user.password = await bcrypt.hash(new_password, 10);
    }

    // update fields
    if (email) user.email = email;
    if (phone_number) user.phone_number = phone_number;
    if (date_of_birth) user.date_of_birth = date_of_birth;
    if (avatar) user.avatar = avatar;

    // check complete profile
    user.is_complete_profile = Boolean(user.first_name && user.last_name && user.phone_number && user.address && user.date_of_birth);

    await user.save();

    return user;
};

/* ================= DELETE ================= */
exports.deleteUserById = async (id) => {
    return await User.findByIdAndDelete(id);
};
