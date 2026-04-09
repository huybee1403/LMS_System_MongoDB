const ExcelJS = require("exceljs");

exports.exportTeacherSalariesToExcel = async (salaries, month, year, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Teacher Salaries");

    worksheet.columns = [
        { header: "STT", key: "index", width: 5 },
        { header: "Tên giáo viên", key: "teacherName", width: 35 },
        { header: "Lớp học", key: "className", width: 30 },
        { header: "Số buổi thường", key: "normalSessions", width: 15 },
        { header: "Số buổi bù", key: "makeupSessions", width: 15 },
        { header: "Số buổi thay thế", key: "substituteSessions", width: 18 },
        { header: "Lương 1 buổi (VNĐ)", key: "salaryPerSession", width: 20 },
        { header: "Hệ số buổi bù", key: "makeupCoefficient", width: 15 },
        { header: "Hệ số buổi thay thế", key: "substituteCoefficient", width: 18 },
        { header: "Tổng lương (VNĐ)", key: "totalSalary", width: 22 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E90FF" } };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
    });

    let rowIndex = 0;
    let totalAllTeachers = 0;

    salaries.forEach((teacher) => {
        teacher.classes.forEach((cls) => {
            rowIndex += 1;
            const totalSalary = cls.total_salary;
            totalAllTeachers += totalSalary;

            const row = worksheet.addRow({
                index: rowIndex,
                teacherName: teacher.teacher_name,
                className: cls.class_name,
                normalSessions: cls.total_sessions,
                makeupSessions: cls.total_makeup_sessions,
                substituteSessions: cls.total_substitute_sessions,
                salaryPerSession: cls.salary_per_session,
                makeupCoefficient: cls.makeup_coefficient,
                substituteCoefficient: cls.substitute_coefficient,
                totalSalary,
            });

            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
                if ([1, 4, 5, 6].includes(colNumber)) cell.alignment = { horizontal: "center" };
                if ([7, 10].includes(colNumber)) {
                    cell.alignment = { horizontal: "right" };
                    cell.numFmt = '#,##0 "VNĐ"';
                }
            });

            if (totalSalary > 10000000) {
                row.getCell("totalSalary").fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFFFFACD" },
                };
            }
        });

        rowIndex += 1;
        const totalRow = worksheet.addRow({
            teacherName: `${teacher.teacher_name} - Tổng cộng`,
            totalSalary: teacher.total_salary,
        });
        totalRow.getCell("teacherName").font = { bold: true };
        totalRow.getCell("totalSalary").font = { bold: true };
        totalRow.getCell("totalSalary").numFmt = '#,##0 "VNĐ"';
        totalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
            if (colNumber === 10) cell.alignment = { horizontal: "right" };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E90FF" } };
        });
    });

    rowIndex += 1;
    const allTotalRow = worksheet.addRow({
        teacherName: "TỔNG CỘNG TẤT CẢ GIÁO VIÊN",
        totalSalary: totalAllTeachers,
    });
    allTotalRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E90FF" } };
        cell.alignment = { horizontal: colNumber === 10 ? "right" : "center" };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
        if (colNumber === 10) cell.numFmt = '#,##0 "VNĐ"';
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Teacher_Salaries_${month}_${year}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
};
