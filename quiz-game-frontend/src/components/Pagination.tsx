import React from 'react';
import { PaginationInfo } from '../types/game.types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  loading?: boolean;
}

export function Pagination({
  pagination,
  onPageChange,
  onLimitChange,
  loading = false
}: PaginationProps) {
  const { currentPage, totalPages, totalItems, itemsPerPage, hasNext, hasPrev } = pagination;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Всегда показываем первую страницу
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Показываем страницы вокруг текущей
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Всегда показываем последнюю страницу
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(event.target.value);
    if (onLimitChange && newLimit !== itemsPerPage) {
      onLimitChange(newLimit);
    }
  };

  if (totalPages <= 1) {
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Показано {totalItems} из {totalItems} игр
        </div>
        {onLimitChange && (
          <div className="pagination-limit">
            <label htmlFor="limit-select">На странице:</label>
            <select
              id="limit-select"
              value={itemsPerPage}
              onChange={handleLimitChange}
              disabled={loading}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Показано {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} из {totalItems} игр
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn pagination-btn-prev"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={!hasPrev || loading}
          aria-label="Предыдущая страница"
        >
          ←
        </button>

        <div className="pagination-pages">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {typeof page === 'number' ? (
                <button
                  className={`pagination-btn pagination-btn-page ${
                    page === currentPage ? 'active' : ''
                  }`}
                  onClick={() => handlePageClick(page)}
                  disabled={loading}
                  aria-label={`Страница ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ) : (
                <span className="pagination-ellipsis">{page}</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          className="pagination-btn pagination-btn-next"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={!hasNext || loading}
          aria-label="Следующая страница"
        >
          →
        </button>
      </div>

      {onLimitChange && (
        <div className="pagination-limit">
          <label htmlFor="limit-select">На странице:</label>
          <select
            id="limit-select"
            value={itemsPerPage}
            onChange={handleLimitChange}
            disabled={loading}
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      )}
    </div>
  );
}
