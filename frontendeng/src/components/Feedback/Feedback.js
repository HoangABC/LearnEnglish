import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import useFeedback from '../../hooks/useFeedback'
import { showMessage } from 'react-native-flash-message';

const Feedback = () => {
  const [loading, setLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [userId, setUserId] = useState(null);
  const { handleCreateFeedback, getFeedbacks, feedbacks: feedbacksData } = useFeedback();
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const { Id } = JSON.parse(user); 
          setUserId(Id);
          await getFeedbacks(Id);
        } else {
          console.error('User not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (feedbacksData?.data) {
      setFeedbacks(feedbacksData.data);
    }
  }, [feedbacksData]);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) return;
    
    try {
      setLoading(true);
      const success = await handleCreateFeedback(userId, feedbackText);
      if (success) {
        setFeedbackText(''); 
        await getFeedbacks(userId); 
        showMessage({
          message: "Thành công",
          description: "Phản hồi của bạn đã được gửi",
          type: "success",
        });
      } else {
        showMessage({
          message: "Thất bại",
          description: "Không thể gửi phản hồi. Vui lòng thử lại",
          type: "danger",
        });
      }
    } catch (error) {
      showMessage({
        message: "Lỗi",
        description: "Đã xảy ra lỗi khi gửi phản hồi",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {

    const utcDate = new Date(dateString.replace('Z', ''));  
    

    const vnTime = utcDate.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false
    });
    
    return vnTime;
  };

  const renderFeedbackItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.feedbackItem}
      onPress={() => setSelectedFeedback(item)}
    >
      <View style={[
        styles.feedbackContent,
        item.AdminResponse && { 
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
          paddingBottom: 12
        }
      ]}>
        <Text style={styles.feedbackText}>{item.FeedbackText}</Text>
        <Text style={styles.feedbackDate}>
          Gửi lúc: {formatTime(item.FeedbackCreatedAt)}
        </Text>
      </View>

      {item.AdminResponse && (
        <View style={styles.adminResponseContent}>
          <Text style={styles.responseLabel}>Phản hồi:</Text>
          <Text style={styles.responseText}>{item.AdminResponse}</Text>
          <Text style={styles.responseDate}>
            Phản hồi lúc: {formatTime(item.ResponseCreatedAt)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  ), [setSelectedFeedback]);

  const FeedbackDetailModal = useCallback(() => (
    <Modal
      visible={selectedFeedback !== null}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedFeedback(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chi tiết phản hồi</Text>
          
          <View style={styles.feedbackSection}>
            <Text style={styles.modalLabel}>Nội dung phản hồi:</Text>
            <Text style={styles.modalFeedbackContent}>{selectedFeedback?.FeedbackText}</Text>
            <Text style={styles.timestamp}>
              Gửi lúc: {selectedFeedback && formatTime(selectedFeedback.FeedbackCreatedAt)}
            </Text>
          </View>
          
          {selectedFeedback?.AdminResponse && (
            <View style={styles.responseSection}>
              <Text style={styles.modalLabel}>Phản hồi từ admin:</Text>
              <Text style={styles.responseContent}>{selectedFeedback.AdminResponse}</Text>
              <Text style={styles.timestamp}>
                Phản hồi lúc: {formatTime(selectedFeedback.ResponseCreatedAt)}
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedFeedback(null)}
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ), [selectedFeedback, formatTime]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Gửi phản hồi</Text>
        <Text style={styles.headerSubtitle}>
          Chúng tôi rất mong nhận được ý kiến của bạn
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nội dung phản hồi:</Text>
            <TextInput
              style={styles.input}
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="Nhập phản hồi của bạn tại đây..."
              multiline
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {feedbackText.length}/500 ký tự
            </Text>
            <TouchableOpacity 
              style={[styles.submitButton, !feedbackText.trim() && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={!feedbackText.trim()}
            >
              <Text style={styles.buttonText}>Gửi phản hồi</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.previousFeedbackContainer}>
            <Text style={styles.sectionTitle}>Phản hồi trước đây</Text>
            <FlatList
              data={feedbacks}
              renderItem={renderFeedbackItem}
              keyExtractor={(item, index) => `${item.FeedbackId}_${index}`}
              style={styles.feedbackList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Chưa có phản hồi nào</Text>
              }
            />
          </View>
        </>
      )}
      <FeedbackDetailModal />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  feedbackList: {
    flex: 1,
  },
  feedbackItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  feedbackContent: {
    flex: 1,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  characterCount: {
    textAlign: 'right',
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  previousFeedbackContainer: {
    flex: 1,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  responseText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  feedbackSection: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  responseSection: {
    backgroundColor: '#e8f4ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  modalFeedbackContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  responseContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  feedbackContent: {
    flex: 1,
    marginBottom: 8,
  },
  adminResponseContent: {
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  responseDate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  }
})

export default Feedback;