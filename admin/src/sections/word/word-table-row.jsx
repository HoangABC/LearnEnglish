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
import './WordTableRow.css';

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

// Add this helper function at the top with other helpers
const getLevelLabel = (levelId) => {
  const numericLevelId = Number(levelId);
  
  const levels = {
    1: 'A1',
    2: 'A2',
    3: 'B1',
    4: 'B2',
    5: 'B2+',
    6: 'C1',
    7: 'D'
  };
  
  if (!numericLevelId && numericLevelId !== 0) {
    return 'N/A';
  }
  
  return levels[numericLevelId] || 'N/A';
};

export default function WordTableRow({
  selected,
  QueryURL,
  Word,
  PartOfSpeech,
  LevelWordId, 
  Definition,
  DefinitionVI,
  PhoneticUK,
  PhoneticUS,
  AudioUK,
  AudioUS,
  Example,
  ExampleVI,
  CreatedAt,
  UpdatedAt,
  Status,
  handleClick,
  tabValue,
  id,
  onStatusUpdate,
  onEdit,
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleStatusChange = async (newStatus) => {
    await onStatusUpdate(id, newStatus);
    handleCloseMenu();
  };

  const handleEdit = () => {
    onEdit({
      Id: id,
      Word,
      PartOfSpeech,
      LevelWordId,
      Definition,
      DefinitionVI,
      PhoneticUK,
      PhoneticUS,
      AudioUK,
      AudioUS,
      Example,
      ExampleVI,
      QueryURL,
      Status,
    });
    handleCloseMenu();
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell>{QueryURL || 'N/A'}</TableCell>
        <TableCell>{Word || 'N/A'}</TableCell>
        <TableCell>{PartOfSpeech || 'N/A'}</TableCell>
        <TableCell>
          {console.log('LevelWordId:', LevelWordId)}
          {getLevelLabel(LevelWordId)}
        </TableCell>
        <TableCell className="definition-cell">{Definition || 'N/A'}</TableCell>
        <TableCell className="definition-cell">{DefinitionVI || 'N/A'}</TableCell>
        <TableCell>{PhoneticUK || 'N/A'}</TableCell>
        <TableCell>{PhoneticUS || 'N/A'}</TableCell>
        <TableCell>{AudioUK || 'N/A'}</TableCell>
        <TableCell>{AudioUS || 'N/A'}</TableCell>
        <TableCell className="example-cell">
          <div dangerouslySetInnerHTML={{ __html: cleanExampleText(Example) || 'N/A' }} />
        </TableCell>
        <TableCell className="example-cell">
          <div dangerouslySetInnerHTML={{ __html: cleanExampleText(ExampleVI) || 'N/A' }} />
        </TableCell>
        <TableCell>{formatDate(new Date(CreatedAt))}</TableCell>
        <TableCell>{formatDate(new Date(UpdatedAt))}</TableCell>

        <TableCell align="center">
        <Label color={(Status === 1 || Status === 'Active') ? 'success' : 'error'}>
          {(Status === 1 || Status === 'Active') ? 'Active' : 'Inactive'}
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
            {tabValue === 0 ? (
              <MenuItem onClick={() => handleStatusChange(0)}>Inactive</MenuItem>
            ) : (
              <>
                <MenuItem onClick={() => handleStatusChange(1)}>Active</MenuItem>
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
              </>
            )}
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
  LevelWordId: PropTypes.number,
  Definition: PropTypes.string.isRequired,
  DefinitionVI: PropTypes.string,
  PhoneticUK: PropTypes.string,
  PhoneticUS: PropTypes.string,
  AudioUK: PropTypes.string,
  AudioUS: PropTypes.string,
  Example: PropTypes.string,
  ExampleVI: PropTypes.string,
  CreatedAt: PropTypes.string.isRequired,
  UpdatedAt: PropTypes.string.isRequired,
  Status: PropTypes.number.isRequired,
  selected: PropTypes.bool.isRequired,
  handleClick: PropTypes.func.isRequired,
  tabValue: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  onStatusUpdate: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};
