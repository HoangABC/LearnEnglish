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
import WordTableRow from '../word-table-row';
import WordTableHead from '../word-table-head';
import WordTableToolbar from '../word-table-toolbar';
import TableEmptyRows from '../table-empty-rows';
import TableNoData from '../table-no-data';
import { emptyRows, applyFilter, getComparator } from '../utils';

export default function WordPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('Word');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      try {
        let response;
        if (tabValue === 0) {
          response = await api.getWordsStatus1();
        } else {
          response = await api.getWordsStatus0();
        }
        setWords(response.data);
      } catch (error) {
        console.error('Failed to fetch words:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [tabValue]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = words.map((n) => n.Word);
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  };

  const handleClick = (event, word) => {
    const selectedIndex = selected.indexOf(word);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, word);
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
  };

  const filteredWords = applyFilter({ inputData: words, comparator: getComparator(order, orderBy), filterName });
  const isNotFound = !filteredWords.length && !!filterName;

  return (
    <Container>
      <Card>
        <WordTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
          tabValue={tabValue}
          onTabChange={handleTabChange}
        />

        {tabValue === 0 && (
          <div>
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <WordTableHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={[
                      { id: 'QueryURL', label: 'Query URL' },
                      { id: 'Word', label: 'Word' },
                      { id: 'PartOfSpeech', label: 'Part Of Speech' },
                      { id: 'Level', label: 'Level' },
                      { id: 'Definition', label: 'Definition' },
                      { id: 'PhoneticUK', label: 'Phonetic UK' },
                      { id: 'PhoneticUS', label: 'Phonetic US' },
                      { id: 'AudioUK', label: 'Audio UK' },
                      { id: 'AudioUS', label: 'Audio US' },
                      { id: 'Example', label: 'Example' },
                      { id: 'CreatedAt', label: 'Created At' },
                      { id: 'UpdatedAt', label: 'Updated At' },
                      { id: 'Status', label: 'Status' },
                    ]}
                    rowCount={words.length}
                    numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell align="center" colSpan={12}>
                          <Typography variant="h6">Loading...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWords
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => {
                          const { Id, QueryURL, Word, PartOfSpeech, Level, Definition, PhoneticUK, PhoneticUS, AudioUK, AudioUS, Example, CreatedAt, UpdatedAt, Status } = row;
                          const isItemSelected = selected.indexOf(Word) !== -1;

                          return (
                            <WordTableRow
                              key={Id}
                              QueryURL={QueryURL}
                              Word={Word}
                              PartOfSpeech={PartOfSpeech}
                              Level={Level}
                              Definition={Definition}
                              PhoneticUK={PhoneticUK}
                              PhoneticUS={PhoneticUS}
                              AudioUK={AudioUK}
                              AudioUS={AudioUS}
                              Example={Example}
                              CreatedAt={CreatedAt}
                              UpdatedAt={UpdatedAt}
                              Status={Status === 1 ? 'Active' : 'Inactive'}
                              selected={isItemSelected}
                              handleClick={(event) => handleClick(event, Word)}
                            />
                          );
                        })
                    )}
                    <TableEmptyRows height={53} emptyRows={emptyRows(page, rowsPerPage, words.length)} />
                    <TableNoData query={filterName} isNotFound={isNotFound} />
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={words.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        )}

        {tabValue === 1 && (
          <div>
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <WordTableHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={[
                      { id: 'QueryURL', label: 'Query URL' },
                      { id: 'Word', label: 'Word' },
                      { id: 'PartOfSpeech', label: 'Part Of Speech' },
                      { id: 'Level', label: 'Level' },
                      { id: 'Definition', label: 'Definition' },
                      { id: 'PhoneticUK', label: 'Phonetic UK' },
                      { id: 'PhoneticUS', label: 'Phonetic US' },
                      { id: 'AudioUK', label: 'Audio UK' },
                      { id: 'AudioUS', label: 'Audio US' },
                      { id: 'Example', label: 'Example' },
                      { id: 'CreatedAt', label: 'Created At' },
                      { id: 'UpdatedAt', label: 'Updated At' },
                      { id: 'Status', label: 'Status' },
                    ]}
                    rowCount={words.length}
                    numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell align="center" colSpan={12}>
                          <Typography variant="h6">Loading...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWords
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => {
                          const { Id, QueryURL, Word, PartOfSpeech, Level, Definition, PhoneticUK, PhoneticUS, AudioUK, AudioUS, Example, CreatedAt, UpdatedAt, Status } = row;
                          const isItemSelected = selected.indexOf(Word) !== -1;

                          return (
                            <WordTableRow
                              key={Id}
                              QueryURL={QueryURL}
                              Word={Word}
                              PartOfSpeech={PartOfSpeech}
                              Level={Level}
                              Definition={Definition}
                              PhoneticUK={PhoneticUK}
                              PhoneticUS={PhoneticUS}
                              AudioUK={AudioUK}
                              AudioUS={AudioUS}
                              Example={Example}
                              CreatedAt={CreatedAt}
                              UpdatedAt={UpdatedAt}
                              Status={Status === 1 ? 'Active' : 'Inactive'}
                              selected={isItemSelected}
                              handleClick={(event) => handleClick(event, Word)}
                            />
                          );
                        })
                    )}
                    <TableEmptyRows height={53} emptyRows={emptyRows(page, rowsPerPage, words.length)} />
                    <TableNoData query={filterName} isNotFound={isNotFound} />
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={words.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        )}
      </Card>
    </Container>
  );
}
