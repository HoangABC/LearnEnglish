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
  InputLabel,
  Button
} from '@mui/material';
import Iconify from '../../components/iconify';
import { alpha } from '@mui/material/styles';

export default function WordTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  tabValue,
  onTabChange,
  onOpenAddModal
}) {
  return (
    <Toolbar
      sx={{
        pl: { sm: 3 },
        pr: { xs: 1, sm: 1 },
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        minHeight: 96,
        ...(numSelected > 0 && {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        }),
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px',
        flexWrap: 'wrap',
        flex: 1,
        padding: '16px 0'
      }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="tab-select-label">Select Status</InputLabel>
          <Select
            labelId="tab-select-label"
            value={tabValue}
            onChange={(event) => onTabChange(event, event.target.value)}
            sx={{ 
              height: '40px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(145, 158, 171, 0.32)'
              }
            }}
          >
            <MenuItem value={0}>Active Words</MenuItem>
            <MenuItem value={1}>Inactive Words</MenuItem>
          </Select>
        </FormControl>

        <OutlinedInput
          value={filterName}
          onChange={onFilterName}
          placeholder="Search word..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ 
            width: 280,
            height: '40px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(145, 158, 171, 0.32)'
            }
          }}
        />

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
      </div>
      <Button
        variant="contained"
        startIcon={<Iconify icon="eva:plus-fill" />}
        onClick={onOpenAddModal}
        sx={{
          position: { xs: 'static', sm: 'absolute' },
          right: { sm: 16 },
          top: { sm: '50%' },
          transform: { sm: 'translateY(-50%)' },
          alignSelf: { xs: 'flex-end', sm: 'auto' },
        }}
      >
        Add Word
      </Button>
    </Toolbar>
  );
}

WordTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  filterName: PropTypes.string.isRequired,
  onFilterName: PropTypes.func.isRequired,
  tabValue: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
  onOpenAddModal: PropTypes.func.isRequired,
};
