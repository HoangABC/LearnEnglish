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
import Tooltip from '@mui/material/Tooltip'; // Added import
import { api } from '../../apis/api';
import Box from '@mui/material/Box';

// Helper function to format date
const formatDate = (date) => {
  if (date instanceof Date && !isNaN(date)) {
    return date.toLocaleDateString();
  }
  return 'N/A'; // Return a default value if date is invalid
};

export default function UserTableRow({
  selected,
  Id,
  Name,
  Username,
  Email,
  GoogleId,
  Password,
  CreatedAt,
  UpdatedAt,
  Status,
  handleClick,
  userType,
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = async () => {
    setOpen(null);
    try {
      // If user1 (active), set to inactive (0)
      // If user2 (inactive), set to active (1)
      const newStatus = userType === 'user1' ? 0 : 1;
      await api.updateUserStatus(Id, newStatus);
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const userInfo = (
    <Box sx={{ 
      p: 1,
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      fontSize: '14px',
      lineHeight: 1.8,
    }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        User Information
      </Typography>
      <div><strong>Name:</strong> {Name}</div>
      <div><strong>Username:</strong> {Username}</div>
      <div><strong>Email:</strong> {Email}</div>
      <div><strong>Status:</strong> {Status}</div>
      <div><strong>Created:</strong> {formatDate(new Date(CreatedAt))}</div>
    </Box>
  );

  return (
    <>
      <Tooltip 
        title={userInfo}
        placement="right"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'background.paper',
              color: 'text.primary',
              '& .MuiTooltip-arrow': {
                color: 'background.paper',
              },
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              maxWidth: 'none',
            }
          }
        }}
      >
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

          <TableCell>{Username || 'N/A'}</TableCell>

          <TableCell>{Email || 'N/A'}</TableCell>

          <TableCell>{GoogleId || 'N/A'}</TableCell>

          <TableCell>{Password || 'N/A'}</TableCell>

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
              onClose={() => setOpen(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {userType === 'user1' ? (
                <MenuItem onClick={handleCloseMenu}>Inactive</MenuItem>
              ) : (
                <MenuItem onClick={handleCloseMenu}>Active</MenuItem>
              )}
            </Popover>
          </TableCell>
        </TableRow>
      </Tooltip>
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
  userType: PropTypes.oneOf(['user1', 'user2']).isRequired,
  Id: PropTypes.number.isRequired,
};
