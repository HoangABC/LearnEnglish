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
    bottom:'5%'
  },
  cardContainer: {
    flexDirection: 'row',
    padding:'5%',
    
  },
  card: {
    width: 200,
    aspectRatio: 3 / 4,
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 8,
    justifyContent: 'space-between',
  },
  cardBlue: {
    backgroundColor: '#007bff',
  },
  cardGreen: {
    backgroundColor: '#28a745',
  },
  cardPurple: {
    backgroundColor: '#6f42c1',
  },
  cardOrange: {
    backgroundColor: '#fd7e14',
  },
  cardTeal: {
    backgroundColor: '#20c997',
  },
  cardPink: {
    backgroundColor: '#e83e8c',
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
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 5,
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
    width: '100%',
    alignItems: 'center',
    bottom:'5%'
  },
  backImage: {
    width: '100%',
    height: 400,
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
    height: 320, 
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    borderRadius: 10,
    borderWidth: 1, 
    borderColor: '#fff', 
    padding: 20, 
    marginRight: 20, 
    marginLeft:20,
    top: 2,
    flexDirection: 'column', 
    justifyContent: 'space-between', 
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
  },
  saveCount: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center', 
    width:'20%'
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 2,
  },
  
  defaultButton: {
    backgroundColor: '#FFC107',
  },
  
  savedButton: {
    backgroundColor: '#4CAF50',
  },
  
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  definitionScrollView: {
    maxHeight: 100,
    marginVertical: 5,
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: 'red',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  feedbackList: {
    marginVertical: 10,
  },
  feedbackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  feedbackContent: {
    flex: 1,
    marginRight: 10,
  },
  feedbackTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  feedbackSender: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  feedbackMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    color: '#ff6b6b',
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginLeft: 10,
    width: 150,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  deleteAllButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
  },
  deleteAllText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 15,
    alignSelf: 'center',
    minWidth: 120,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    paddingVertical: 20,
  },
  viewedFeedbackItem: {
    backgroundColor: '#f8f9fa',
  },
  viewedText: {
    color: '#999',
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  offlineText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  disabledCard: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  disabledImage: {
    opacity: 0.5,
  },
  offlineCardText: {
    color: 'red',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  }
});

export default styles;
