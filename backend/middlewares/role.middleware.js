/* ================= ROLE MIDDLEWARE ================= */
exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).json({
                    message: "Unauthorized",
                });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    message: "Forbidden - Bạn không có quyền truy cập",
                });
            }

            next();
        } catch (err) {
            return res.status(500).json({
                message: "Role middleware error",
            });
        }
    };
};
