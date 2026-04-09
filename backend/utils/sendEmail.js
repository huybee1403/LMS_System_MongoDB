const nodemailer = require("nodemailer");

// 🔹 Tạo transporter chung
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 🔹 Gửi email đặt lại mật khẩu (đẹp & chuẩn)
const sendResetPasswordEmail = async (to, link) => {
    await transporter.sendMail({
        from: `"Trung Tâm Tiếng Anh (Simple English)" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🔐 Reset Your Password",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background: #fafafa;">
            <h2 style="text-align: center; color: #333;">🔐 Reset Your Password</h2>

            <p style="font-size: 15px; color: #555;">
                Bạn vừa gửi yêu cầu đặt lại mật khẩu cho tài khoản của mình tại 
                <strong>Simple English</strong>.
            </p>

            <p style="font-size: 15px; color: #555;">
                Nhấn vào nút bên dưới để đặt lại mật khẩu:
            </p>

            <div style="text-align: center; margin: 25px 0;">
                <a href="${link}"
                   style="padding: 12px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; font-size: 16px;">
                   🔁 Reset Password
                </a>
            </div>

            <p style="font-size: 14px; color: #555;">
                Nếu nút không mở được, hãy copy liên kết bên dưới và dán vào trình duyệt:
            </p>

            <div style="padding: 10px; background: #fff; border: 1px solid #ddd; border-radius: 6px; word-break: break-all; font-size: 13px;">
                ${link}
            </div>

            <p style="font-size: 13px; color: #777; margin-top: 25px;">
                * Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            </p>

            <p style="font-size: 13px; color: #777; text-align: center; margin-top: 20px;">
                © ${new Date().getFullYear()} Simple English. All rights reserved.
            </p>
        </div>
        `,
    });
};

// 🔹 Gửi email mã xác nhận buổi dạy (đẹp & chuyên nghiệp)
const sendTeachingCodeEmail = async (to, code) => {
    await transporter.sendMail({
        from: `"Trung Tâm Tiếng Anh (Simple English)" <${process.env.EMAIL_USER}>`,
        to,
        subject: "🔑 Mã Xác Nhận Buổi Dạy",
        html: `
        <div style="
            font-family: Arial, sans-serif;
            max-width: 500px;
            margin: auto;
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 12px;
            background: #fafafa;
        ">
            <h2 style="text-align:center; color:#333; margin-bottom:20px;">
                🔑 Mã Xác Nhận Buổi Dạy
            </h2>

            <p style="font-size:15px; color:#555;">
                Xin chào! Đây là mã xác nhận buổi dạy của bạn:
            </p>

            <div style="
                text-align:center;
                margin: 22px 0;
                padding: 14px 10px;
                background:#ffffff;
                border:1px solid #ddd;
                border-radius:10px;
            ">
                <span style="font-size:36px; font-weight:bold; color:#007bff; letter-spacing:3px;">
                    ${code}
                </span>
            </div>

            <p style="font-size:14px; color:#555;">
                ⚠️ <strong>Lưu ý:</strong> Không chia sẻ mã này cho bất kỳ ai để đảm bảo an toàn cho buổi dạy.
            </p>

            <hr style="margin:25px 0; border:none; border-top:1px solid #ddd;" />

            <p style="font-size:12px; color:#777; text-align:center;">
                Hệ thống quản lý lớp học – Trung Tâm Tiếng Anh Simple English
            </p>
        </div>
        `,
    });
};

module.exports = {
    sendResetPasswordEmail,
    sendTeachingCodeEmail,
};
