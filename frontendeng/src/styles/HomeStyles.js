import { StyleSheet, Dimensions } from 'react-native';

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
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    marginBottom: '5%',
    width: '100%',
    alignItems: 'center',
    marginTop:0
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
    width: Dimensions.get('window').width - 40,
    height: 'auto',
    minHeight: 320,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    borderRadius: 10,
    borderWidth: 1, 
    borderColor: '#fff', 
    padding: 20, 
    marginRight: 20, 
    marginLeft:20,
    top: 2,
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
    flex: 1,
  },
  definitionContentContainer: {
    padding: 10,
    flexGrow: 1,
  },
  definitionText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyNotificationContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noNotifications: {
    fontSize: 16,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 15,
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  notificationList: {
    maxHeight: 300,
    width: '100%',
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
  },
  notificationContent: {
    padding: 10,
  },
  feedbackText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  feedbackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  feedbackContent: {
    flex: 1,
    marginRight: 10,
  },
  
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    color: '#ff4444',
  },
  deleteAllButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  deleteAllText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  
  feedbackSender: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  feedbackMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  feedbackList: {
    width: '100%',
    maxHeight: '85%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },

  markAllReadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },

  markAllReadText: {
    color: 'white',
    fontSize: 12,
  },

  toggleButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  toggleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  },
  feedbackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  deleteIcon: {
    color: '#ff4444',
  },
  deleteAllButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  deleteAllText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
    fontStyle: 'italic',
  },
  feedbackList: {
    marginTop: 10,
    marginBottom: 10,
  },
  definitionContainer: {
    height: 100,
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default styles;
