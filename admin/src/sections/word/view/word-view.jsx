import React, { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import Iconify from '../../../components/iconify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 

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
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newWord, setNewWord] = useState({
    word: '',
    partOfSpeech: '',
    levelWordId: '',
    definition: '',
    definitionVI: '',
    phoneticUK: '',
    phoneticUS: '',
    audioUK: '',
    audioUS: '',
    audioUKFile: null,
    audioUSFile: null,
    example: '',
    exampleVI: '',
    queryURL: '',
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [levelFilter, setLevelFilter] = useState('');

  const filteredWords = React.useMemo(() => {
    console.log('Current words:', words);
    console.log('Current tabValue:', tabValue);
    
    const filtered = applyFilter({
      inputData: words,
      comparator: getComparator(order, orderBy),
      filterName,
    });
  
    const levelFiltered = levelFilter ? filtered.filter(word => word.LevelWordId === Number(levelFilter)) : filtered;
  
    const statusFiltered = levelFiltered.filter(word => {
      const wordStatus = Number(word.Status);
      return tabValue === 0 ? wordStatus === 1 : wordStatus === 0;
    });
  
    console.log('After status filter:', statusFiltered);
    return statusFiltered;
  }, [words, order, orderBy, filterName, tabValue, levelFilter]);
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

        console.log('API Response:', response);

        const wordsData = Array.isArray(response.data) ? response.data : [];
        console.log('Processed words data:', wordsData);
        
        setWords(wordsData);
        setPage(0);
      } catch (error) {
        console.error('Failed to fetch words:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [tabValue]);

  useEffect(() => {
    const maxPage = Math.ceil(filteredWords.length / rowsPerPage) - 1;
    if (page > maxPage && maxPage >= 0) {
      setPage(maxPage);
    }
  }, [filteredWords.length, rowsPerPage, page]);

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

  const handleTabChange = async (event, newValue) => {
    console.log('Tab changing from', tabValue, 'to', newValue);
    setTabValue(newValue);
    setLoading(true);
    setWords([]);
    
    try {
      const response = newValue === 0 
        ? await api.getWordsStatus1() 
        : await api.getWordsStatus0();
      
      console.log('Tab change - API Response:', response);
      console.log('New tab value:', newValue);
      console.log('Fetched words data:', response.data);
      
      const wordsData = Array.isArray(response.data) ? response.data : [];
      setWords(wordsData);
      setPage(0);
    } catch (error) {
      console.error('Failed to fetch words:', error);
      setSnackbarMessage('Failed to fetch words. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setNewWord({
      word: '',
      partOfSpeech: '',
      levelWordId: '',
      definition: '',
      definitionVI: '',
      phoneticUK: '',
      phoneticUS: '',
      audioUK: '',
      audioUS: '',
      audioUKFile: null,
      audioUSFile: null,
      example: '',
      exampleVI: '',
      queryURL: '',
    });
  };

  const handleAddWord = async () => {
    try {
      const formData = new FormData();
      
      const audioUKUrl = (newWord.audioUKFile ? URL.createObjectURL(newWord.audioUKFile) : newWord.audioUK || '').replace(/^,/, '');
      const audioUSUrl = (newWord.audioUSFile ? URL.createObjectURL(newWord.audioUSFile) : newWord.audioUS || '').replace(/^,/, '');
      
      Object.keys(newWord).forEach(key => {
        if (key !== 'audioUKFile' && key !== 'audioUSFile') {
          formData.append(key, newWord[key]);
        }
      });
      
      formData.append('audioUK', audioUKUrl);
      formData.append('audioUS', audioUSUrl);
      
      if (newWord.audioUKFile) {
        formData.append('audioUKFile', newWord.audioUKFile);
      }
      if (newWord.audioUSFile) {
        formData.append('audioUSFile', newWord.audioUSFile);
      }

      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await api.addWord(formData);
      
      setSnackbarMessage('Word added successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      if (tabValue === 0) {
        const response = await api.getWordsStatus1();
        setWords(response.data);
      } else {
        const response = await api.getWordsStatus0();
        setWords(response.data);
      }
      handleCloseAddModal();
    } catch (error) {
      console.error('Failed to add word:', error);
      setSnackbarMessage('Failed to add word. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const modules = {
    toolbar: [
      [{ 'list': 'bullet' }], 
      [{ 'list': 'ordered' }], 
      ['bold', 'italic'],
      ['clean'],
    ],
    clipboard: {
      matchVisual: false  // Thêm dòng này để tắt cảnh báo
    }
  };

  const formats = [
    'list',
    'bullet',
    'bold',
    'italic',
  ];

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      console.log('Starting status update. Current tab:', tabValue);
      await api.updateWordStatus(id, newStatus);
      setLoading(true);
      setWords([]);
      
      let response;
      if (tabValue === 0) {
        response = await api.getWordsStatus1();
      } else {
        response = await api.getWordsStatus0();
      }
      
      console.log('After status update - API Response:', response);
      console.log('Current tab value:', tabValue);
      console.log('Fetched words data:', response.data);
      
      const wordsData = Array.isArray(response.data) ? response.data : [];
      setWords(wordsData);
      setSnackbarMessage('Status updated successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setPage(0);
    } catch (error) {
      console.error('Failed to update word status:', error);
      setSnackbarMessage('Failed to update status. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (wordData) => {
    setEditingWord({
      ...wordData,
      levelWordId: Number(wordData.LevelWordId),
      word: wordData.Word,
      partOfSpeech: wordData.PartOfSpeech,
      definition: wordData.Definition,
      definitionVI: wordData.DefinitionVI,
      phoneticUK: wordData.PhoneticUK,
      phoneticUS: wordData.PhoneticUS,
      audioUK: wordData.AudioUK,
      audioUS: wordData.AudioUS,
      example: wordData.Example,
      exampleVI: wordData.ExampleVI,
      queryURL: wordData.QueryURL,
    });
    setOpenEditModal(true);
  };

  const handleEditorChange = (content, field) => {
    setEditingWord((prev) => ({
      ...prev,
      [field]: content,
    }));
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingWord(null);
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      
      Object.keys(editingWord).forEach(key => {
        if (key !== 'audioUKFile' && key !== 'audioUSFile') {
          formData.append(key, editingWord[key]);
        }
      });
      
      if (editingWord.audioUKFile) {
        formData.append('audioUKFile', editingWord.audioUKFile);
      }
      if (editingWord.audioUSFile) {
        formData.append('audioUSFile', editingWord.audioUSFile);
      }

      await api.editWord(editingWord.Id, formData);
      
      setSnackbarMessage('Word updated successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      // Refresh the word list
      const response = tabValue === 0 
        ? await api.getWordsStatus1() 
        : await api.getWordsStatus0();
      setWords(response.data);
      
      handleCloseEditModal();
    } catch (error) {
      console.error('Failed to update word:', error);
      setSnackbarMessage('Failed to update word. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Container>
      <Card>
        <WordTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
          tabValue={tabValue}
          onTabChange={handleTabChange}
          onOpenAddModal={handleOpenAddModal}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
        />

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
                    { id: 'DefinitionVI', label: 'Definition (VI)' },
                    { id: 'PhoneticUK', label: 'Phonetic UK' },
                    { id: 'PhoneticUS', label: 'Phonetic US' },
                    { id: 'AudioUK', label: 'Audio UK' },
                    { id: 'AudioUS', label: 'Audio US' },
                    { id: 'Example', label: 'Example' },
                    { id: 'ExampleVI', label: 'Example (VI)' },
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
                      <TableCell align="center" colSpan={15}>
                        <Typography variant="h6">Loading...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredWords.length > 0 ? (
                    filteredWords
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <WordTableRow
                          key={row.Id}
                          {...row}
                          selected={selected.indexOf(row.Word) !== -1}
                          handleClick={(event) => handleClick(event, row.Word)}
                          tabValue={tabValue}
                          id={row.Id}
                          onStatusUpdate={handleStatusUpdate}
                          onEdit={handleEdit}
                        />
                      ))
                  ) : (
                    <TableRow>
                      <TableCell align="center" colSpan={15} sx={{ py: 3 }}>
                        <Typography variant="body1">
                          No results found for "{filterName}"
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  <TableEmptyRows
                    height={53}
                    emptyRows={emptyRows(page, rowsPerPage, filteredWords.length)}
                  />
                  <TableNoData 
                    query={filterName} 
                    isNotFound={!filteredWords.length && !!filterName}
                  />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredWords.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>

        <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth="md" fullWidth>
          <DialogTitle>Add New Word</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Word"
              margin="normal"
              value={newWord.word}
              onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Part of Speech</InputLabel>
              <Select
                value={newWord.partOfSpeech}
                onChange={(e) => setNewWord({ ...newWord, partOfSpeech: e.target.value })}
              >
                <MenuItem value="noun">Noun</MenuItem>
                <MenuItem value="verb">Verb</MenuItem>
                <MenuItem value="adjective">Adjective</MenuItem>
                <MenuItem value="adverb">Adverb</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Level</InputLabel>
              <Select
                value={newWord.levelWordId}
                onChange={(e) => setNewWord({ ...newWord, levelWordId: e.target.value })}
              >
                <MenuItem value={1}>A1</MenuItem>
                <MenuItem value={2}>A2</MenuItem>
                <MenuItem value={3}>B1</MenuItem>
                <MenuItem value={4}>B2</MenuItem>
                <MenuItem value={5}>B2+</MenuItem>
                <MenuItem value={6}>C1</MenuItem>
                <MenuItem value={7}>D</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Definition"
              margin="normal"
              multiline
              rows={3}
              value={newWord.definition}
              onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
            />
            <TextField
              fullWidth
              label="Definition (Vietnamese)"
              margin="normal"
              multiline
              rows={3}
              value={newWord.definitionVI}
              onChange={(e) => setNewWord({ ...newWord, definitionVI: e.target.value })}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Example</Typography>
              <ReactQuill
                theme="snow"
                value={newWord.example}
                onChange={(content) => setNewWord({ ...newWord, example: content })}
                modules={modules}
                formats={formats}
                style={{ height: '200px', marginBottom: '50px' }}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Example (Vietnamese)</Typography>
              <ReactQuill
                theme="snow"
                value={newWord.exampleVI}
                onChange={(content) => setNewWord({ ...newWord, exampleVI: content })}
                modules={modules}
                formats={formats}
                style={{ height: '200px', marginBottom: '50px' }}
              />
            </Box>
            <TextField
              fullWidth
              label="Phonetic UK"
              margin="normal"
              value={newWord.phoneticUK}
              onChange={(e) => setNewWord({ ...newWord, phoneticUK: e.target.value })}
            />
            <TextField
              fullWidth
              label="Phonetic US"
              margin="normal"
              value={newWord.phoneticUS}
              onChange={(e) => setNewWord({ ...newWord, phoneticUS: e.target.value })}
            />
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Audio UK URL"
                margin="normal"
                value={newWord.audioUK || ''}
                onChange={(e) => setNewWord({ ...newWord, audioUK: e.target.value })}
                sx={{
                  '& .MuiInputBase-input': {
                    height: 'auto',
                    overflow: 'visible',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                    padding: '8px 14px'
                  },
                  '& .MuiOutlinedInput-root': {
                    alignItems: 'flex-start'
                  },
                  '& .MuiInputLabel-root': {
                    position: 'relative',
                    transform: 'none',
                    marginBottom: '4px'
                  }
                }}
              />
              <input
                accept="audio/*"
                style={{ display: 'none' }}
                id="audio-uk-file"
                type="file"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      const response = await api.uploadAudio(file);
                      const audioUrl = response.data.url;
                      
                      setNewWord({ 
                        ...newWord, 
                        audioUKFile: file,
                        audioUK: audioUrl 
                      });

                      setSnackbarMessage('Audio file uploaded successfully');
                      setSnackbarSeverity('success');
                      setOpenSnackbar(true);
                    } catch (error) {
                      console.error('Failed to upload audio file:', error);
                      setSnackbarMessage('Failed to upload audio file. Please try again.');
                      setSnackbarSeverity('error');
                      setOpenSnackbar(true);
                    }
                  }
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <label htmlFor="audio-uk-file" style={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                  >
                    Upload Audio UK
                  </Button>
                </label>
                {(newWord.audioUK || newWord.audioUKFile) && (
                  <IconButton 
                    color="error" 
                    onClick={() => setNewWord({ 
                      ...newWord, 
                      audioUK: '', 
                      audioUKFile: null 
                    })}
                  >
                    <Iconify icon="eva:close-fill" />
                  </IconButton>
                )}
              </Box>
              {(newWord.audioUK || newWord.audioUKFile) && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">UK Audio Preview:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <audio controls style={{ flex: 1 }}>
                      <source src={newWord.audioUK} />
                      Your browser does not support the audio element.
                    </audio>
                    <IconButton 
                      color="error" 
                      onClick={() => setNewWord({ 
                        ...newWord, 
                        audioUK: '', 
                        audioUKFile: null 
                      })}
                    >
                      <Iconify icon="eva:close-fill" />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Audio US URL"
                margin="normal"
                value={newWord.audioUS || ''}
                onChange={(e) => setNewWord({ ...newWord, audioUS: e.target.value })}
                sx={{
                  '& .MuiInputBase-input': {
                    height: 'auto',
                    overflow: 'visible',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                    padding: '8px 14px'
                  },
                  '& .MuiOutlinedInput-root': {
                    alignItems: 'flex-start'
                  },
                  '& .MuiInputLabel-root': {
                    position: 'relative',
                    transform: 'none',
                    marginBottom: '4px'
                  }
                }}
              />
              <input
                accept="audio/*"
                style={{ display: 'none' }}
                id="audio-us-file"
                type="file"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      const response = await api.uploadAudio(file);
                      const audioUrl = response.data.url;
                      
                      setNewWord({ 
                        ...newWord, 
                        audioUSFile: file,
                        audioUS: audioUrl
                      });

                      setSnackbarMessage('Audio file uploaded successfully');
                      setSnackbarSeverity('success');
                      setOpenSnackbar(true);
                    } catch (error) {
                      console.error('Failed to upload audio file:', error);
                      setSnackbarMessage('Failed to upload audio file. Please try again.');
                      setSnackbarSeverity('error');
                      setOpenSnackbar(true);
                    }
                  }
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <label htmlFor="audio-us-file" style={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                  >
                    Upload Audio US
                  </Button>
                </label>
                {(newWord.audioUS || newWord.audioUSFile) && (
                  <IconButton 
                    color="error" 
                    onClick={() => setNewWord({ 
                      ...newWord, 
                      audioUS: '', 
                      audioUSFile: null 
                    })}
                  >
                    <Iconify icon="eva:close-fill" />
                  </IconButton>
                )}
              </Box>
              {(newWord.audioUS || newWord.audioUSFile) && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">US Audio Preview:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <audio controls style={{ flex: 1 }}>
                      <source src={newWord.audioUS} />
                      Your browser does not support the audio element.
                    </audio>
                    <IconButton 
                      color="error" 
                      onClick={() => setNewWord({ 
                        ...newWord, 
                        audioUS: '', 
                        audioUSFile: null 
                      })}
                    >
                      <Iconify icon="eva:close-fill" />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddModal}>Cancel</Button>
            <Button onClick={handleAddWord} variant="contained">Add</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="md" fullWidth>
          <DialogTitle>Edit Word</DialogTitle>
          <DialogContent>
            {editingWord && (
              <>
                <TextField
                  fullWidth
                  label="Word"
                  margin="normal"
                  value={editingWord.word}
                  onChange={(e) => setEditingWord({ ...editingWord, word: e.target.value })}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Part of Speech</InputLabel>
                  <Select
                    value={editingWord.partOfSpeech}
                    onChange={(e) => setEditingWord({ ...editingWord, partOfSpeech: e.target.value })}
                  >
                    <MenuItem value="noun">Noun</MenuItem>
                    <MenuItem value="verb">Verb</MenuItem>
                    <MenuItem value="adjective">Adjective</MenuItem>
                    <MenuItem value="adverb">Adverb</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={editingWord.levelWordId}
                    onChange={(e) => setEditingWord({ ...editingWord, levelWordId: e.target.value })}
                  >
                    <MenuItem value={1}>A1</MenuItem>
                    <MenuItem value={2}>A2</MenuItem>
                    <MenuItem value={3}>B1</MenuItem>
                    <MenuItem value={4}>B2</MenuItem>
                    <MenuItem value={5}>B2+</MenuItem>
                    <MenuItem value={6}>C1</MenuItem>
                    <MenuItem value={7}>D</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Definition"
                  margin="normal"
                  multiline
                  rows={3}
                  value={editingWord.definition}
                  onChange={(e) => setEditingWord({ ...editingWord, definition: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Definition (Vietnamese)"
                  margin="normal"
                  multiline
                  rows={3}
                  value={editingWord.definitionVI}
                  onChange={(e) => setEditingWord({ ...editingWord, definitionVI: e.target.value })}
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Example</Typography>
                  <ReactQuill
                    theme="snow"
                    value={editingWord.example}
                    onChange={(content) => handleEditorChange(content, 'example')}
                    modules={modules}
                    formats={formats}
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Example (Vietnamese)</Typography>
                  <ReactQuill
                    theme="snow"
                    value={editingWord.exampleVI}
                    onChange={(content) => handleEditorChange(content, 'exampleVI')}
                    modules={modules}
                    formats={formats}
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Phonetic UK"
                  margin="normal"
                  value={editingWord.phoneticUK}
                  onChange={(e) => setEditingWord({ ...editingWord, phoneticUK: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Phonetic US"
                  margin="normal"
                  value={editingWord.phoneticUS}
                  onChange={(e) => setEditingWord({ ...editingWord, phoneticUS: e.target.value })}
                />
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Audio UK URL"
                    margin="normal"
                    value={editingWord.audioUK || ''}
                    onChange={(e) => setEditingWord({ ...editingWord, audioUK: e.target.value })}
                    sx={{
                      '& .MuiInputBase-input': {
                        height: 'auto',
                        overflow: 'visible',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                        padding: '8px 14px'
                      },
                      '& .MuiOutlinedInput-root': {
                        alignItems: 'flex-start'
                      },
                      '& .MuiInputLabel-root': {
                        position: 'relative',
                        transform: 'none',
                        marginBottom: '4px'
                      }
                    }}
                  />
                  <input
                    accept="audio/*"
                    style={{ display: 'none' }}
                    id="audio-uk-file"
                    type="file"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        try {
                          const response = await api.uploadAudio(file);
                          const audioPath = response.data.url; 
                          
                          setEditingWord({ 
                            ...editingWord, 
                            audioUKFile: file,
                            audioUK: audioPath 
                          });

                          setSnackbarMessage('Audio file uploaded successfully');
                          setSnackbarSeverity('success');
                          setOpenSnackbar(true);
                        } catch (error) {
                          console.error('Failed to upload audio file:', error);
                          setSnackbarMessage('Failed to upload audio file. Please try again.');
                          setSnackbarSeverity('error');
                          setOpenSnackbar(true);
                        }
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <label htmlFor="audio-uk-file" style={{ flex: 1 }}>
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                      >
                        Upload Audio UK
                      </Button>
                    </label>
                    {(editingWord.audioUK || editingWord.audioUKFile) && (
                      <IconButton 
                        color="error" 
                        onClick={() => setEditingWord({ 
                          ...editingWord, 
                          audioUK: '', 
                          audioUKFile: null 
                        })}
                      >
                        <Iconify icon="eva:close-fill" />
                      </IconButton>
                    )}
                  </Box>
                  {(editingWord.audioUK || editingWord.audioUKFile) && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2">UK Audio Preview:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <audio controls style={{ flex: 1 }}>
                          <source src={editingWord.audioUK} />
                          Your browser does not support the audio element.
                        </audio>
                        <IconButton 
                          color="error" 
                          onClick={() => setEditingWord({ 
                            ...editingWord, 
                            audioUK: '', 
                            audioUKFile: null 
                          })}
                        >
                          <Iconify icon="eva:close-fill" />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Audio US URL"
                    margin="normal"
                    value={editingWord.audioUS || ''}
                    onChange={(e) => setEditingWord({ ...editingWord, audioUS: e.target.value })}
                    sx={{
                      '& .MuiInputBase-input': {
                        height: 'auto',
                        overflow: 'visible',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                        padding: '8px 14px'
                      },
                      '& .MuiOutlinedInput-root': {
                        alignItems: 'flex-start'
                      },
                      '& .MuiInputLabel-root': {
                        position: 'relative',
                        transform: 'none',
                        marginBottom: '4px'
                      }
                    }}
                  />
                  <input
                    accept="audio/*"
                    style={{ display: 'none' }}
                    id="audio-us-file"
                    type="file"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        try {
                          const response = await api.uploadAudio(file);
                          const audioPath = response.data.url;
                          
                          setEditingWord({ 
                            ...editingWord, 
                            audioUSFile: file,
                            audioUS: audioPath
                          });

                          setSnackbarMessage('Audio file uploaded successfully');
                          setSnackbarSeverity('success');
                          setOpenSnackbar(true);
                        } catch (error) {
                          console.error('Failed to upload audio file:', error);
                          setSnackbarMessage('Failed to upload audio file. Please try again.');
                          setSnackbarSeverity('error');
                          setOpenSnackbar(true);
                        }
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <label htmlFor="audio-us-file" style={{ flex: 1 }}>
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                      >
                        Upload Audio US
                      </Button>
                    </label>
                    {(editingWord.audioUS || editingWord.audioUSFile) && (
                      <IconButton 
                        color="error" 
                        onClick={() => setEditingWord({ 
                          ...editingWord, 
                          audioUS: '', 
                          audioUSFile: null 
                        })}
                      >
                        <Iconify icon="eva:close-fill" />
                      </IconButton>
                    )}
                  </Box>
                  {(editingWord.audioUS || editingWord.audioUSFile) && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2">US Audio Preview:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <audio controls style={{ flex: 1 }}>
                          <source src={editingWord.audioUS} />
                          Your browser does not support the audio element.
                        </audio>
                        <IconButton 
                          color="error" 
                          onClick={() => setEditingWord({ 
                            ...editingWord, 
                            audioUS: '', 
                            audioUSFile: null 
                          })}
                        >
                          <Iconify icon="eva:close-fill" />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal}>Cancel</Button>
            <Button onClick={handleSaveEdit} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Card>
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
