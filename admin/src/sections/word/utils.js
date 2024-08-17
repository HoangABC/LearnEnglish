// utils.js

export function applyFilter({ inputData, comparator, filterName }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  if (filterName) {
    return stabilizedThis
      .map((el) => el[0])
      .filter((item) => item.Word.toLowerCase().includes(filterName.toLowerCase()));
  }

  return stabilizedThis.map((el) => el[0]);
}

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export function emptyRows(page, rowsPerPage, totalRows) {
  return page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalRows) : 0;
}
