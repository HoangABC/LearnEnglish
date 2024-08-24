// src/PushNotificationConfig.js
import PushNotification from 'react-native-push-notification';

// Cấu hình thông báo
export const configureNotifications = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
    },
    popInitialNotification: true,
    requestPermissions: true,
  });
};

// Tạo kênh thông báo
PushNotification.createChannel(
  {
    channelId: "default-channel-id",
    channelName: "Default Channel",
    channelDescription: "A default channel for notifications",
    soundName: "default",
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`CreateChannel returned '${created}'`)
);

// Gửi thông báo
export const sendNotification = (title, message) => {
  PushNotification.localNotification({
    channelId: "default-channel-id",
    title: title,
    message: message,
  });
};
