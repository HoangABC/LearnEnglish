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

      setUserDetails({}); // Clear user data
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
  
  
  const levelDetails = getLevelName(userDetails.LevelId); 

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {userDetails.image ? (
            <Image source={{ uri: userDetails.image }} style={styles.userImage} />
          ) : (
            <Image source={require('../assets/images/EE.png')} style={styles.userImage} />
          )}
          <View style={styles.userTextInfo}>
            <View style={styles.userTextItem}>
            <Text style={styles.userName}>
              {userDetails.Name || userDetails.name || 'Guest'}
            </Text>
            <Text style={styles.iconItem}> 
                {levelDetails.icon === 'leaf' && <FontAwesome5 name={levelDetails.icon} size={20} color={levelDetails.color} />}
                {levelDetails.icon === 'font' && <FontAwesome5 name={levelDetails.icon} size={20} color={levelDetails.color} />}
                {levelDetails.icon === 'tree' && <Entypo name={levelDetails.icon} size={20} color={levelDetails.color} />}
                {levelDetails.icon === 'apple-alt' && <FontAwesome5 name={levelDetails.icon} size={20} color={levelDetails.color} />}
            </Text>
            </View>
            <View style={styles.levelContainer}>
              <Text style={[styles.userDetails, { color: levelDetails.color }]}>
              Cấp độ: {levelDetails.name}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <ScrollView style={styles.menuContainer}>
        <Text style={styles.contactHeader}>Thông tin</Text>
        <View style={styles.menuItem}>
          <MaterialCommunityIcons name="account-edit" size={24} />
          <Text style={styles.menuItemText} onPress={handleNavigateToEditInfo}>Chỉnh sửa tài khoản</Text>
        </View>
        <View style={styles.menuItem}>
          <TouchableOpacity style={styles.menuItemAction} onPress={handleNavigateToEditPass}>
            <MaterialCommunityIcons name="lock-reset"  size={24} />
            <Text style={styles.menuItemText}>Đổi mật khẩu</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.menuItem}>
          <TouchableOpacity style={styles.menuItemAction} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} />
            <Text style={styles.menuItemText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.contactHeader}>Hỗ trợ</Text>
        <View style={styles.contactItem}>
          <MaterialCommunityIcons name="email-edit-outline" size={24} />
          <Text style={styles.contactItemText}>Báo lỗi hoặc góp ý</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  userInfo: {
    alignItems: 'center',
    
  },
  userTextItem:{
    flexDirection:'row',
    width: '100%',
  },
  iconItem:{
    marginLeft:'1%'
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  userTextInfo: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    fontSize: 19,
    textAlign: 'center',
    width: '100%',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuContainer: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    width: '100%',
  },
  menuItemAction: {
    flexDirection: 'row',
  },
  contactHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    backgroundColor: '#DDDDDD',
    padding: 10,
    color: 'black',
  },
  contactItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Profile;
