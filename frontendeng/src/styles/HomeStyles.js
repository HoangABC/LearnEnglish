import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  header2: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  languageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'blue',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dictionaryText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsText: {
    marginRight: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginTop: 16,
    borderColor:'black',
    borderWidth:1,
    borderRadius:50,
  },
  searchIcon: {
    padding:10,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 4,
    elevation: 10,  
    zIndex: 1000, 
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownContentContainer: {
    paddingVertical: 8,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  noResultsText: {
    padding: 12,
    textAlign: 'center',
  },
  fixedView: {
    position: 'absolute',
    top: 140,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    elevation: 2,  
    paddingVertical: 10,
    zIndex: 10, 
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    padding:'10%'
  },
  card: {
    width: 200,
    aspectRatio: 3 / 4,
    backgroundColor: '#007bff',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 8,
    justifyContent: 'space-between',
  },
  cardGreen: {
    backgroundColor: '#28a745',
  },
  cardText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardSubText: {
    fontSize: 14,
    color: 'white',
  },
  cardIcon: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff9800',
    borderRadius: 20,
    padding: 5,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  timerButton: {
    position: 'absolute',
    bottom: 60, // Adjust based on button position
    right: 16,
  },
  fireIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
  },
  timeOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  timeText: {
    fontSize: 18,
  },
});

export default styles;
