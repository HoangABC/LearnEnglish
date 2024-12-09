// utils.js

export function applyFilter({ inputData, comparator, filterName, statusFilter }) {
  if (!Array.isArray(inputData)) {
    return [];
  }

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (item) => 
        item.UserName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        item.FeedbackText.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (statusFilter !== '') {
    inputData = inputData.filter((item) => item.Status === statusFilter);
  }

  return inputData;
}

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => {
        if (orderBy === 'CreatedAt' || orderBy === 'ResponseDate') {
          // Xử lý đặc biệt cho các trường ngày tháng
          const dateA = new Date(a[orderBy] || 0);
          const dateB = new Date(b[orderBy] || 0);
          return dateB - dateA;
        }
        // Xử lý cho các trường khác
        if (b[orderBy] < a[orderBy]) return -1;
        if (b[orderBy] > a[orderBy]) return 1;
        return 0;
      }
    : (a, b) => {
        if (orderBy === 'CreatedAt' || orderBy === 'ResponseDate') {
          // Xử lý đặc biệt cho các trường ngày tháng
          const dateA = new Date(a[orderBy] || 0);
          const dateB = new Date(b[orderBy] || 0);
          return dateA - dateB;
        }
        // Xử lý cho các trường khác
        if (a[orderBy] < b[orderBy]) return -1;
        if (a[orderBy] > b[orderBy]) return 1;
        return 0;
      };
}

export function emptyRows(page, rowsPerPage, arrayLength) {
  return Math.max(0, (1 + page) * rowsPerPage - arrayLength);
}
