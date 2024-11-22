import { useEffect, useState, useCallback } from 'react';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Scrollbar from '../../../components/scrollbar';
import FeedbackTableRow from '../feedback-table-row';
import FeedbackTableHead from '../feedback-table-head';
import FeedbackTableToolbar from '../feedback-table-toolbar';
import TableEmptyRows from '../table-empty-rows';
import TableNoData from '../table-no-data';
import { emptyRows, applyFilter, getComparator } from '../utils';
import useFeedback from '../../../routes/hooks/useFeedback';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function FeedbackPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('CreatedAt');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tabValue, setTabValue] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { 
    feedbacks: feedbacksData, 
    loading, 
    handleGetAllFeedbacks,
    handleRespondToFeedback
  } = useFeedback();

  useEffect(() => {
    handleGetAllFeedbacks();
  }, [handleGetAllFeedbacks]);

  useEffect(() => {
    if (feedbacksData && feedbacksData.data) {
      const uniqueFeedbacks = feedbacksData.data.reduce((acc, current) => {
        const x = acc.find(item => item.Id === current.Id);
        if (!x) {
          return acc.concat([current]);
        }
        return acc;
      }, []);

      console.log('Setting unique feedbacks:', {
        data: uniqueFeedbacks,
        length: uniqueFeedbacks.length
      });
      setFeedbacks(uniqueFeedbacks);
    }
  }, [feedbacksData]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = feedbacks.map((n) => n.Id);
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  };

  const handleClick = useCallback((event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  }, [selected]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
    setPage(0);
  };

  const filteredFeedbacks = applyFilter({
    inputData: feedbacks || [],
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const isNotFound = !filteredFeedbacks.length && !!filterName;

  const handleRowClick = useCallback((feedback) => {
    setSelectedFeedback(feedback);
    setAdminResponse(feedback.AdminResponse || '');
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFeedback(null);
    setAdminResponse('');
  };

  const handleSubmitResponse = async () => {
    try {
      if (!selectedFeedback?.Id) {
        throw new Error('Invalid feedback ID');
      }
      
      await handleRespondToFeedback(selectedFeedback.Id, adminResponse);
      await handleGetAllFeedbacks(); // Refresh the data after response
      handleCloseDialog();
      setSnackbarMessage('Phản hồi đã được gửi thành công');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error submitting response:', error);
      setSnackbarMessage('Có lỗi xảy ra khi gửi phản hồi');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Container>
      <Card sx={{ height: 'auto' }}>
        <FeedbackTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
          tabValue={tabValue}
          onTabChange={(e, newValue) => setTabValue(newValue)}
        />

        {tabValue === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Scrollbar>
              <TableContainer 
                sx={{ 
                  minWidth: 800,
                  '& .MuiTable-root': {
                    tableLayout: 'fixed'
                  },
                  '& .MuiTableCell-root': {
                    py: 2,
                    px: 2
                  },
                }}
              >
                <Table>
                  <FeedbackTableHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={[
                      { id: 'Id', label: 'ID' },
                      { id: 'UserName', label: 'User Name' },
                      { id: 'FeedbackText', label: 'Feedback Text' },
                      { id: 'CreatedAt', label: 'Created At' },
                      { id: 'Status', label: 'Status' },
                      { id: 'AdminResponse', label: 'Admin Response' },
                      { id: 'AdminName', label: 'Admin Name' },
                      { id: 'ResponseDate', label: 'Response Date' },
                      { id: 'actions', label: '' },
                    ]}
                    rowCount={feedbacks.length}
                    numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllClick={handleSelectAllClick}
                    sx={{
                      '& .MuiTableCell-head': {
                        bgcolor: 'background.neutral',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                      }
                    }}
                  />
                  <TableBody
                    sx={{
                      '& .MuiTableRow-root': {
                        '&:nth-of-type(odd)': {
                          backgroundColor: (theme) => theme.palette.action.hover,
                        },
                      },
                    }}
                  >
                    {loading ? (
                      <TableRow>
                        <TableCell align="center" colSpan={12}>
                          <Typography variant="h6">Loading...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (!feedbacks || !feedbacks.length) ? (
                      <TableRow>
                        <TableCell align="center" colSpan={12}>
                          <Typography variant="h6">No feedback data available</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFeedbacks
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => {
                          const isItemSelected = selected.indexOf(row.Id) !== -1;

                          return (
                            <FeedbackTableRow
                              key={row.Id}
                              {...row}
                              selected={isItemSelected}
                              handleClick={handleClick}
                              handleRowClick={handleRowClick}
                            />
                          );
                        })
                    )}
                    <TableEmptyRows height={53} emptyRows={emptyRows(page, rowsPerPage, feedbacks.length)} />
                    {isNotFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
            <TablePagination
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                marginTop: 'auto'
              }}
              page={page}
              component="div"
              count={filteredFeedbacks.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        )}
      </Card>
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết phản hồi</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Người dùng:</strong> {selectedFeedback?.UserName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Nội dung phản hồi:</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedFeedback?.FeedbackText}
                </Typography>
              </Grid>
              <Grid item xs={12}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Ngày tạo:</strong> {selectedFeedback?.CreatedAt ? new Date(selectedFeedback.CreatedAt).toLocaleDateString() : ''}
                </Typography>
              </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Trạng thái:</strong> {selectedFeedback?.Status === 1 ? 'Chưa phản hồi' : 'Đã phản hồi'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phản hồi của Admin"
                  multiline
                  rows={4}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleSubmitResponse} 
            variant="contained" 
            color="primary"
            disabled={!adminResponse.trim()}
          >
            Gửi phản hồi
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
