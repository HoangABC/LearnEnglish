import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import Label from '../../components/label';
import Iconify from '../../components/iconify';
import './FeedbackTableRow.css';

// Helper function to format date
const formatDate = (date) => {
  if (date) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate)) {
      return parsedDate.toLocaleDateString();
    }
  }
  return 'N/A';
};

export default function FeedbackTableRow({
  selected,
  Id,
  UserName,
  FeedbackText,
  CreatedAt,
  Status,
  AdminResponse,
  AdminName,
  ResponseDate,
  handleClick,
  handleRowClick,
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  return (
    <TableRow 
      hover 
      tabIndex={-1} 
      role="checkbox" 
      selected={selected}
      onClick={() => handleRowClick({
        Id,
        UserName,
        FeedbackText,
        CreatedAt,
        Status,
        AdminResponse,
        AdminName,
        ResponseDate,
      })}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell padding="checkbox" onClick={(e) => {
        e.stopPropagation();
        handleClick(e, Id);
      }}>
        <Checkbox checked={selected} />
      </TableCell>

      <TableCell sx={{ 
        maxWidth: 200, 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {UserName || 'N/A'}
      </TableCell>
      <TableCell sx={{ 
        maxWidth: 300,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {FeedbackText || 'No feedback provided'}
      </TableCell>
      <TableCell>{formatDate(CreatedAt)}</TableCell>
      <TableCell align="center">
        <Label color={(Status === 1) ? 'warning' : 'success'}>
          {(Status === 1) ? 'Chưa phản hồi' : 'Đã phản hồi'}
        </Label>
      </TableCell>
      <TableCell sx={{ 
        maxWidth: 200,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {AdminResponse || 'No response'}
      </TableCell>
      <TableCell>{AdminName || 'N/A'}</TableCell>
      <TableCell>{formatDate(ResponseDate)}</TableCell>
      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
        <IconButton onClick={handleOpenMenu}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem onClick={handleCloseMenu}>Edit</MenuItem>
        <MenuItem onClick={handleCloseMenu} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Popover>
    </TableRow>
  );
}


FeedbackTableRow.propTypes = {
  Id: PropTypes.number.isRequired,
  UserName: PropTypes.string.isRequired,
  FeedbackText: PropTypes.string.isRequired,
  CreatedAt: PropTypes.string.isRequired,
  Status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  AdminResponse: PropTypes.string,
  AdminName: PropTypes.string,
  ResponseDate: PropTypes.string,
  selected: PropTypes.bool.isRequired,
  handleClick: PropTypes.func.isRequired,
  handleRowClick: PropTypes.func.isRequired,
};
