import PropTypes from 'prop-types';
import { TableRow, TableCell } from '@mui/material';

export default function TableEmptyRows({ height, emptyRows }) {
  return (
    emptyRows > 0 && (
      <TableRow
        style={{
          height: height * emptyRows,
        }}
      >
        <TableCell colSpan={8} />
      </TableRow>
    )
  );
}

TableEmptyRows.propTypes = {
  height: PropTypes.number.isRequired,
  emptyRows: PropTypes.number.isRequired,
};