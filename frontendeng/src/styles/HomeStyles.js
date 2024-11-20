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
    top: 120,
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
    padding:'5%'
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

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay with dim background
  },
  modalContainer: {
    height: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  wordText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  languageToggle: {
    flexDirection: 'row',
  },
  languageButton: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  phoneticSection: {
    flexDirection: 'column',
    marginVertical: 10,
  },
  phoneticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  phoneticText: {
    fontSize: 16,
    marginRight: 5,
  },

  definitionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  definitionText: {
    fontSize: 16,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  fullVersionButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  fullVersionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: 'lightgray',
    padding: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  partOfSpeechContainer: {
    marginVertical: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray'
  },
  partOfSpeechType: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16
  },
  popularWordContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  backImage: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularWordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'transparent',
  },
  transparentBox: {
    width: 429.8, 
    height: 297, 
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    borderRadius: 10,
    borderWidth: 1, 
    borderColor: '#fff', 
    padding: 20, 
    marginRight: 20, 
    marginLeft:20,
    top: 19,
    flexDirection: 'column', 
    justifyContent: 'flex-start', 
    position: 'relative', 
  },
  wordContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between',  
    alignItems: 'center',  
    width: '100%',  
  },
  wordText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,  
  },

  detailButton:{
    backgroundColor: '#4CAF50',  
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  ButtonDetail:{
    color: 'white',
    textAlign:'center',
    justifyContent:'center',
    fontSize: 14,
    width:100
  },
  phoneticContainer: {
    flexDirection: 'column', 
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  phoneticText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'left',
  },
  definitionText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'left', 
    flex: 1, 
  },
  divider: {
    height: 1,
    backgroundColor: '#fff',
    width: '100%',
   
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10, 
  },
  saveCount: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center', 
    width:'20%'
  },
  saveButton: {
    height:'100%',
    padding:'1%',
    borderRadius: 5,
    borderWidth: 1,
    width: 'auto',
  },
  defaultButton: {
    backgroundColor: '#ffcc00', 
  },
  savedButton: {
    backgroundColor: '#4caf50', 
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  defaultText: {
    color: '#000',
  },
  savedText: {
    color: '#fff', 
  },
  
  flatListContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
  },
  phoneticItem: {
    flexDirection: 'row',  
  },
  phonetic: {
    fontSize: 20,
    color: '#eee',
    flexShrink: 1,
    width:'110%',
  },
  soundIcon: {
    marginHorizontal: 10,
  },
});

export default styles;
