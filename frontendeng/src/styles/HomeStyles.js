import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    elevation: 2,
  },
  header2: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
    flexDirection: 'column',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  languageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'blue',
  },
  dictionaryText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  bellIcon: {
    marginLeft: 16,
  },
  settingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 15, 
    color: 'gray',
    marginRight: 8, 
    fontWeight: 'bold',
  },
  settingsIcon: {
    // Bạn có thể thêm style ở đây nếu cần
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 20,
    height: 40, 
  },
  searchIcon: {
    marginLeft: 8,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
  timerButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireIcon: {
    top: 10, 
    left: 10, 
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timeSelector: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  selectorLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionButton: {
    padding: 10,
    backgroundColor: 'lightgray',
    borderRadius: 5,
    margin: 5,
  },
  optionText: {
    fontSize: 16,
  },
});

export default styles;
