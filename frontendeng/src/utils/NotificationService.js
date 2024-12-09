import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform, PermissionsAndroid, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationRef } from '../navigation/NavigationRef';

class NotificationService {
  constructor() {
    this.configure();
    this.createDefaultChannels();
  }

  async requestUserPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  configure() {
    PushNotification.configure({
      onRegister: function(token) {
        console.log("TOKEN:", token);
      },

      onNotification: async function(notification) {
        console.log("NOTIFICATION:", notification);
        
        if (notification.action === "Xem" || notification.userInteraction) {
          try {
            const userJson = await AsyncStorage.getItem('user');
            const userId = userJson ? JSON.parse(userJson)?.Id : null;
            if (!userId) return;

            const feedbackId = notification.data?.feedbackId;
            if (feedbackId) {
              const storedKey = `AdFeedback_${userId}`;
              const stored = await AsyncStorage.getItem(storedKey);
              const feedbacks = stored ? JSON.parse(stored) : [];
              
              const updatedFeedbacks = feedbacks.map(feedback => 
                feedback.FeedbackId === feedbackId 
                  ? { ...feedback, viewed: 1 }
                  : feedback
              );

              await AsyncStorage.setItem(storedKey, JSON.stringify(updatedFeedbacks));

              if (AppState.currentState === 'active') {
                NavigationRef.current?.navigate('Feedback', {
                  selectedFeedbackId: feedbackId,
                  feedback: feedbacks.find(f => f.FeedbackId === feedbackId)
                });
              }
            }
          } catch (error) {
            console.error('Error handling notification action:', error);
          }
        }

        if (!notification.foreground) {
          notification.finish();
        }
      },

      onAction: function(notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
    });
  }

  createDefaultChannels() {
    PushNotification.createChannel(
      {
        channelId: "default-channel-id",
        channelName: "Default Channel",
        channelDescription: "Default channel for notifications",
        playSound: true,
        soundName: "default",
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }

  async showNotification(title, message, data = {}) {
    const hasPermission = await this.requestUserPermission();
    if (!hasPermission) {
      console.log('Không có quyền hiển thị thông báo');
      return;
    }

    PushNotification.localNotification({
      channelId: "default-channel-id",
      title: title,
      message: message,
      
      // Android specific properties
      largeIcon: "ic_launcher",
      smallIcon: "ic_notification",
      bigText: message,
      subText: "EasyEnglish",
      bigLargeIcon: "ic_launcher",
      color: "#007AFF",
      vibrate: true,
      vibration: 300,
      priority: "high",
      importance: "high",
      visibility: "public",
      allowWhileIdle: true,
      ignoreInForeground: false,
      
      // Chỉ hiển thị nút "Xem"
      actions: ["Xem"],
      
      // Quan trọng: Không tự động mở/đóng app
      invokeApp: false,
      autoCancel: true,
      
      // Data để xử lý khi click
      data: data,
      
      playSound: true,
      soundName: "default",
    });
  }

  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  cancelNotification(id) {
    PushNotification.cancelLocalNotification(id);
  }
}

const notificationService = new NotificationService();
export default notificationService;
