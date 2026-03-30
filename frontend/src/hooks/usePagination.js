import { useState, useEffect, useMemo } from "react";

const usePagination = (fullData = [], filteredData = [], defaultItemsPerPage = 7) => {
    const dataToUse = filteredData.length > 0 ? filteredData : fullData;

    const [itemsPerPage] = useState(defaultItemsPerPage); // giữ cố định mặc định 7
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const total = Math.ceil(dataToUse.length / itemsPerPage);
        setTotalPages(total);
        setCurrentPage(total > 0 ? 1 : 0); // Chỉ set 1 nếu có dữ liệu, không thì 0
    }, [dataToUse, itemsPerPage]);

    const currentItems = useMemo(() => {
        if (currentPage === 0) return []; // Không có dữ liệu
        const start = (currentPage - 1) * itemsPerPage;
        return dataToUse.slice(start, start + itemsPerPage);
    }, [dataToUse, currentPage, itemsPerPage]);

    const handlePageChange = (direction) => {
        if (direction === "prev" && currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        } else if (direction === "next" && currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    return {
        currentPage,
        totalPages,
        currentItems,
        itemsPerPage,
        handlePageChange,
    };
};

export default usePagination;
