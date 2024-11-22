import React, { useState, useEffect } from 'react';  
import { View, Text, StyleSheet, Image, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as logoutAction } from '../redux/authSlice';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import { showMessage } from 'react-native-flash-message'; // Đảm bảo bạn đã cài đặt thư viện này

const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch user data from AsyncStorage
  const fetchUserData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        setUserId(parsedUser.id);
        setUserDetails(parsedUser);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setLoading(false);
    }
  };

  useFocusEffect(() => {
    fetchUserData(); 
  });

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      if (userId) {
        await AsyncStorage.removeItem(`wordsArray_${userId}`);
        await AsyncStorage.removeItem(`wordsArray_userId_${userId}`);
      }

      setUserDetails({});
      await GoogleSignin.signOut();

      dispatch(logoutAction());
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getLevelName = (levelId) => {
    if (!levelId) return { name: 'Chưa xác định', color: '#808080', icon: 'leaf' };
    switch (levelId) {
      case 1:
        return { name: 'Mới bắt đầu', color: '#FF5733', icon: 'leaf' }; 
      case 2:
        return { name: 'Trung bình', color: '#FFC300', icon: 'font' }; 
      case 3:
        return { name: 'Khá', color: '#28A745', icon: 'tree' }; 
      case 4:
        return { name: 'Giỏi', color: '#007BFF', icon: 'apple-alt' }; 
      default:
        return { name: 'Chưa xác định', color: '#808080', icon: 'leaf' }; 
    }
  };

  if (loading) {
    return <View style={styles.loader}><Text>Loading...</Text></View>;
  }

  const handleNavigateToEditInfo = () => {
    navigation.navigate('EditInfo');
  };

  const handleNavigateToEditPass = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser.googleId) {
        
          showMessage({
            message: "Bạn đã đăng nhập bằng Google. Không thể thay đổi mật khẩu.",
            type: "info",
            icon: "info",
            duration: 5000,
            autoHide: true, 
            animationDuration: 500, 
          });
          return; 
        } else {
         
          navigation.navigate('EditPass');
        }
      }
    } catch (error) {
      console.error('Error checking user login method:', error);
    }
  };

  const handleNavigateToFeedback = () => {
    navigation.navigate('Feedback');
  };
  
  const levelDetails = getLevelName(userDetails.LevelId); 

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {userDetails.image ? (
              <Image source={{ uri: userDetails.image }} style={styles.userImage} />
            ) : (
              <Image source={require('../assets/images/EE.png')} style={styles.userImage} />
            )}
            <Text style={styles.userName}>
              {userDetails.Name || userDetails.name || 'Guest'} 
              <Text style={styles.iconItem}>
                {levelDetails.icon === 'leaf' && <FontAwesome5 name={levelDetails.icon} size={20} color={levelDetails.color} />}
                {levelDetails.icon === 'font' && <FontAwesome5 name={levelDetails.icon} size={20} color={levelDetails.color} />}
                {levelDetails.icon === 'tree' && <Entypo name={levelDetails.icon} size={20} color={levelDetails.color} />}
                {levelDetails.icon === 'apple-alt' && <FontAwesome5 name={levelDetails.icon} size={20} color={levelDetails.color} />}
              </Text>
            </Text>
            <Text style={[styles.userLevel, { color: levelDetails.color }]}>
              {'Cấp độ: ' + levelDetails.name}
            </Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionHeader}>Thông tin</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleNavigateToEditInfo}>
            <MaterialCommunityIcons name="account-edit" size={24} color="#666" />
            <Text style={styles.menuItemText}>Chỉnh sửa tài khoản</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleNavigateToEditPass}>
            <MaterialCommunityIcons name="lock-reset" size={24} color="#666" />
            <Text style={styles.menuItemText}>Đổi mật khẩu</Text>
          </TouchableOpacity>

          <Text style={styles.sectionHeader}>Hỗ trợ</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleNavigateToFeedback}>
            <MaterialCommunityIcons name="email-edit-outline" size={24} color="#666" />
            <Text style={styles.menuItemText}>Báo lỗi hoặc góp ý</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingVertical: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    width: '100%',
    textAlign: 'center',
  },
  userLevel: {
    fontSize: 20,
    opacity: 0.8,
    width: '100%',
    textAlign: 'center',
    marginTop: 5,
    color: '#000',
  },
  iconItem: {
    marginLeft: 8,
  },
  menuContainer: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
    width: '100%',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bottomPadding: {
    height: 60, // Adjust this value based on your navigation bar height
  }
});

export default Profile;
