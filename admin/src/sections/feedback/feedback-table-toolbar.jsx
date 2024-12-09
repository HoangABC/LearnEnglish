import PropTypes from 'prop-types';
import {
  Toolbar,
  Tooltip,
  IconButton,
  Typography,
  OutlinedInput,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import Iconify from '../../components/iconify';

export default function FeedbackTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  statusFilter,
  onStatusFilterChange,
}) {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        py: 2,
        display: 'flex',
        gap: 2,
        ...(numSelected > 0 && {
          bgcolor: (theme) => theme.palette.action.activatedOpacity,
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <>
          <OutlinedInput
            value={filterName}
            onChange={onFilterName}
            placeholder="Search feedback..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            sx={{
              width: 240,
              height: '40px',
              transition: (theme) =>
                theme.transitions.create(['width'], { duration: theme.transitions.duration.shorter }),
            }}
          />

          <FormControl 
            sx={{ 
              minWidth: 150,
            '& .MuiOutlinedInput-root': {
              height: '40px',
              backgroundColor: '#F9FAFB',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#F4F6F8',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
              },
            },
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              height: '40px !important',
              padding: '0 14px !important',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E0E3E7',
            },
            '& .MuiInputLabel-root': {
              transform: 'translate(14px, 11px)',
              '&.Mui-focused, &.MuiFormLabel-filled': {
                transform: 'translate(14px, -9px) scale(0.75)',
              },
            },
          }}
        >
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={onStatusFilterChange}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value={1}>Chưa phản hồi</MenuItem>
              <MenuItem value={2}>Đã phản hồi</MenuItem>
            </Select>
          </FormControl>
        </>
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

FeedbackTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  filterName: PropTypes.string.isRequired,
  onFilterName: PropTypes.func.isRequired,
  statusFilter: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onStatusFilterChange: PropTypes.func.isRequired,
};
