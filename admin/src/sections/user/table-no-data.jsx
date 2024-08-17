import PropTypes from 'prop-types';
import { TableRow, TableCell } from '@mui/material';

export default function TableNoData({ isNotFound, query }) {
  return (
    isNotFound && (
      <TableRow>
        <TableCell align="center" colSpan={8} sx={{ py: 3 }}>
          No results found for "{query}"
        </TableCell>
      </TableRow>
    )
  );
}

TableNoData.propTypes = {
  isNotFound: PropTypes.bool.isRequired,
  query: PropTypes.string.isRequired,
};
