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
import './WordTableRow.css'; // Import CSS file

// Helper function to format date
const formatDate = (date) => {
  if (date instanceof Date && !isNaN(date)) {
    return date.toLocaleDateString();
  }
  return 'N/A'; // Return a default value if date is invalid
};

// Helper function to clean example text
const cleanExampleText = (text) => {
  if (!text) return 'N/A';
  // Remove unwanted characters such as semicolons and trim excess whitespace
  return text.replace(/;/g, '').trim();
};

export default function WordTableRow({
  selected,
  QueryURL,
  Word,
  PartOfSpeech,
  Level,
  Definition,
  PhoneticUK,
  PhoneticUS,
  AudioUK,
  AudioUS,
  Example,
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

        <TableCell>{QueryURL}</TableCell>
        <TableCell>{Word}</TableCell>
        <TableCell>{PartOfSpeech || 'N/A'}</TableCell>
        <TableCell>{Level || 'N/A'}</TableCell>
        <TableCell className="definition-cell">{Definition}</TableCell>
        <TableCell>{PhoneticUK || 'N/A'}</TableCell>
        <TableCell>{PhoneticUS || 'N/A'}</TableCell>
        <TableCell>{AudioUK || 'N/A'}</TableCell>
        <TableCell>{AudioUS || 'N/A'}</TableCell>
        <TableCell className="example-cell">
          <div dangerouslySetInnerHTML={{ __html: cleanExampleText(Example) }} />
        </TableCell>
        <TableCell>{formatDate(new Date(CreatedAt))}</TableCell>
        <TableCell>{formatDate(new Date(UpdatedAt))}</TableCell>

        <TableCell align="center">
          <Label color={Status === 1 ? 'success' : 'error'}>
            {Status === 1 ? 'Active' : 'Inactive'}
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

WordTableRow.propTypes = {
  QueryURL: PropTypes.string,
  Word: PropTypes.string.isRequired,
  PartOfSpeech: PropTypes.string,
  Level: PropTypes.string,
  Definition: PropTypes.string.isRequired,
  PhoneticUK: PropTypes.string,
  PhoneticUS: PropTypes.string,
  AudioUK: PropTypes.string,
  AudioUS: PropTypes.string,
  Example: PropTypes.string,
  CreatedAt: PropTypes.string.isRequired,
  UpdatedAt: PropTypes.string.isRequired,
  Status: PropTypes.number.isRequired,
  selected: PropTypes.bool.isRequired,
  handleClick: PropTypes.func.isRequired,
};
