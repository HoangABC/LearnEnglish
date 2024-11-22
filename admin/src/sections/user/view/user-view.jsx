import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { api } from '../../../apis/api';
import Scrollbar from '../../../components/scrollbar';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import UserTableToolbar from '../user-table-toolbar';
import TableEmptyRows from '../table-empty-rows';
import TableNoData from '../table-no-data';
import { emptyRows, applyFilter, getComparator } from '../utils';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export default function UserPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('Name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [users1, setUsers1] = useState([]);
  const [users2, setUsers2] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response1 = await api.getUsersByStatus1();
        const response2 = await api.getUsersByStatus0();
        setUsers1(response1.data);
        setUsers2(response2.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.Name);
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
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
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const users = tabValue === 0 ? users1 : users2;

  const filteredUsers = applyFilter({ inputData: users, comparator: getComparator(order, orderBy), filterName });

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <Container>
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            px: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
          }}
        >
          <Tab value={0} label="User Active" />
          <Tab value={1} label="User Banned" />
        </Tabs>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
          tabValue={tabValue}
          onTabChange={handleTabChange}
        />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                headLabel={[
                  { id: 'Name', label: 'Name' },
                  { id: 'Username', label: 'Username' },
                  { id: 'Email', label: 'Email' },
                  { id: 'GoogleId', label: 'Google ID' },
                  { id: 'Password', label: 'Password' },
                  { id: 'CreatedAt', label: 'Created At' },
                  { id: 'UpdatedAt', label: 'Updated At' },
                  { id: 'Status', label: 'Status' },
                ]}
                rowCount={users.length}
                numSelected={selected.length}
                onRequestSort={handleRequestSort}
                onSelectAllClick={handleSelectAllClick}
              />
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell align="center" colSpan={8}>
                      <Typography variant="h6">Loading...</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { Id, Name, Username, Email, GoogleId, Password, CreatedAt, UpdatedAt, Status } = row;
                      const isItemSelected = selected.indexOf(Name) !== -1;

                      return (
                        <UserTableRow
                          key={Id}
                          Id={Id}
                          Name={Name}
                          Username={Username}
                          Email={Email}
                          GoogleId={GoogleId}
                          Password={Password}
                          CreatedAt={CreatedAt}
                          UpdatedAt={UpdatedAt}
                          Status={Status === 1 ? 'Active' : 'Banned'}
                          selected={isItemSelected}
                          handleClick={(event) => handleClick(event, Name)}
                          userType={tabValue === 0 ? 'user1' : 'user2'}
                        />
                      );
                    })
                )}
                <TableEmptyRows height={53} emptyRows={emptyRows(page, rowsPerPage, users.length)} />
                <TableNoData query={filterName} isNotFound={isNotFound} />
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
