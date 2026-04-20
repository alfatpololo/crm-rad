import React, { useState, useEffect } from "react"
import data from "../../util/blog.json"
import BlogCard1 from "./BlogCard1"
import BlogCard2 from "./BlogCard2"
import Pagination from "./Pagination"

export default function BlogPost({ style, showItem, showPagination }) {
    const [currentPage, setCurrentPage] = useState(1);
    const limit = showItem;

    const [pagination, setPagination] = useState([]);
    const [limitPerPage, setLimitPerPage] = useState(limit);
    const totalPages = Math.ceil(data.length / limitPerPage);

    useEffect(() => {
        createPagination();
    }, [limitPerPage, data.length]);

    const createPagination = () => {
        const pageCount = Math.ceil(data.length / limitPerPage);
        const paginationArray = new Array(pageCount).fill().map((_, idx) => idx + 1);
        setPagination(paginationArray);
    };

    const startIndex = (currentPage - 1) * limitPerPage;
    const endIndex = startIndex + limitPerPage;
    const paginatedProducts = data.slice(startIndex, endIndex);

    const paginationStart = Math.floor((currentPage - 1) / 4) * 4;
    const paginationEnd = paginationStart + 4;
    const paginationGroup = pagination.slice(paginationStart, paginationEnd);

    const next = () => {
        setCurrentPage((page) => page + 1);
    };

    const prev = () => {
        setCurrentPage((page) => page - 1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleActive = (item) => {
        setCurrentPage(item);
    };

    return (
        <>
            {paginatedProducts.length === 0 && <h3>No Products Found</h3>}

            {paginatedProducts.map(item => (
                <React.Fragment key={item.id}>
                    {style !== 2 ? <BlogCard1 item={item} /> : <BlogCard2 item={item} />}
                </React.Fragment>
            ))}

            {showPagination && (
                <Pagination
                    getPaginationGroup={paginationGroup}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    next={next}
                    prev={prev}
                    handlePageChange={handlePageChange}
                    handleActive={handleActive}
                />
            )}
        </>
    );
}
