import PropTypes from 'prop-types';
import {
  Toolbar,
  Tooltip,
  IconButton,
  Typography,
  OutlinedInput,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import Iconify from '../../components/iconify';

export default function WordTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  tabValue,
  onTabChange
}) {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) => theme.palette.action.activatedOpacity,
        }),
      }}
    >
      {/* Select Dropdown for Tabs */}
      <FormControl sx={{ minWidth: 120, mr: 2 }}>
        <InputLabel id="tab-select-label">Select</InputLabel>
        <Select
          labelId="tab-select-label"
          value={tabValue}
          onChange={(event) => onTabChange(event, event.target.value)}
          displayEmpty
          inputProps={{ 'aria-label': 'Select' }}
        >
          <MenuItem value={0}>Word 1</MenuItem>
          <MenuItem value={1}>Wort 2</MenuItem>
        </Select>
      </FormControl>

      {/* Conditional rendering based on numSelected */}
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <OutlinedInput
          value={filterName}
          onChange={onFilterName}
          placeholder="Search word..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ width: 240, transition: (theme) => theme.transitions.create(['width'], { duration: theme.transitions.duration.shorter }) }}
        />
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <Iconify icon="eva:trash-2-fill" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

WordTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  filterName: PropTypes.string.isRequired,
  onFilterName: PropTypes.func.isRequired,
  tabValue: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
};
