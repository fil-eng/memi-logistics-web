import styles from "./Pagination.module.css";

const Pagination = ({
  currentPage = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  loading = false,
  disableNext = false,
}) => {
  const handlePrev = () => {
    if (loading || currentPage <= 0) return;
    onPageChange?.(currentPage - 1);
  };

  const handleNext = () => {
    if (loading || disableNext) return;
    onPageChange?.(currentPage + 1);
  };

  const handleSizeChange = (event) => {
    const newSize = Number(event.target.value) || 20;
    onPageSizeChange?.(newSize);
  };

  return (
    <div className={styles.pagination}>
      <div className={styles.pageControls}>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={handlePrev}
          disabled={loading || currentPage === 0}
        >
          Prev
        </button>
        <span className={styles.pageInfo}>Page {currentPage + 1}</span>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={handleNext}
          disabled={loading || disableNext}
        >
          Next
        </button>
      </div>

      <div className={styles.pageSizeControls}>
        <label className={styles.pageSizeLabel} htmlFor="shipment-page-size">
          Page size:
        </label>
        <select
          id="shipment-page-size"
          value={pageSize}
          onChange={handleSizeChange}
          className={styles.pageSizeSelect}
          disabled={loading}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;
