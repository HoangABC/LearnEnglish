import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import Label from '../../components/label';
import Iconify from '../../components/iconify';

// Helper function to format date
const formatDate = (date) => {
  if (date instanceof Date && !isNaN(date)) {
    return date.toLocaleDateString();
  }
  return 'N/A'; // Return a default value if date is invalid
};

export default function UserTableRow({
  selected,
  Name,
  Username,
  Email,
  GoogleId,
  Password,
  CreatedAt,
  UpdatedAt,
  Status,
  handleClick,
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" noWrap>
              {Name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{Username}</TableCell>

        <TableCell>{Email}</TableCell>

        <TableCell>{GoogleId || 'N/A'}</TableCell>

        <TableCell>{Password}</TableCell>

        <TableCell>{formatDate(new Date(CreatedAt))}</TableCell>

        <TableCell>{formatDate(new Date(UpdatedAt))}</TableCell>

        <TableCell align="center">
          <Label color={Status === 'Active' ? 'success' : 'error'}>
            {Status}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
          <Popover
            open={Boolean(open)}
            anchorEl={open}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleCloseMenu}>Edit</MenuItem>
            <MenuItem onClick={handleCloseMenu}>Delete</MenuItem>
          </Popover>
        </TableCell>
      </TableRow>
    </>
  );
}

UserTableRow.propTypes = {
  Name: PropTypes.string.isRequired,
  Username: PropTypes.string.isRequired,
  Email: PropTypes.string.isRequired,
  GoogleId: PropTypes.string, // Không bắt buộc
  Password: PropTypes.string.isRequired,
  CreatedAt: PropTypes.string.isRequired,
  UpdatedAt: PropTypes.string.isRequired,
  Status: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  handleClick: PropTypes.func.isRequired,
};
