import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUpdateUserName from '../../hooks/useUpdateUserName';  
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';

const EditInfo = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(false);  
  const [newName, setNewName] = useState('');  // State to store the updated name
  const { updateName, status, error } = useUpdateUserName();  // Use the custom hook

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          setUserDetails(parsedUser);
          setNewName(parsedUser.Name || parsedUser.name); 
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setLoading(false); 
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (status === 'succeeded') {
      setIsEditable(false);  // Disable editing after a successful update
    }
  }, [status]);

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

  const handleSave = async () => {
    if (newName && newName !== userDetails.Name) {
      if (userDetails.Id) {
        try {
          await updateName(newName);
        } catch (error) {
          console.error('Error updating name:', error);
        }
      } else {
        console.log('Không có userId trong userDetails');
      }
    }
  };

  const levelDetails = userDetails.LevelId ? getLevelName(userDetails.LevelId) : { name: 'Unknown' };

  if (loading) {
    return (
      <View style={styles.loader}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {userDetails.avatarUrl ? (
            <Image source={{ uri: userDetails.avatarUrl }} style={styles.userImage} />
          ) : (
            <Image source={require('../../assets/images/EE.png')} style={styles.userImage} />
          )}
        </View>
      </View>
      <ScrollView style={styles.menuContainer}>
        <Text style={styles.contactHeader}>Họ và tên</Text>
        <View style={styles.ItemEdit}>
          <View style={[styles.menuItem, { backgroundColor: isEditable ? '#fff' : '#d0d3d4' }, { flex: 10 }]}>
            <MaterialCommunityIcons name="account-edit" size={29} />
            <TextInput
              style={styles.menuItemText}
              editable={isEditable}
              value={newName}  
              onChangeText={setNewName}  
            />
          </View>
          <TouchableOpacity
            style={{ position: 'absolute', right: 10, top: '45%', transform: [{ translateY: -15 }] }}
            onPress={() => setIsEditable(!isEditable)} 
          >
            <FontAwesome name="edit" size={29} />
          </TouchableOpacity>
        </View>
        <Text style={styles.contactHeader}>Email</Text>
        <View style={styles.menuItem}>
          <MaterialCommunityIcons name="email-outline" size={29} />
          <Text style={styles.menuItemText}>{userDetails.Email || userDetails.email || 'Guest'}</Text>
        </View>
        <Text style={styles.contactHeader}>Trình độ</Text>
        <View style={styles.menuItem}>
          <Entypo name="gauge" size={29} />
          <Text style={styles.menuItemText}>{levelDetails.name}</Text>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu thông tin</Text>
      </TouchableOpacity>
      {status === 'loading' && <Text>Đang cập nhật...</Text>}
      {status === 'failed' && <Text style={{ color: 'red' }}>{error}</Text>}
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
  userImage: {
    width: 200,
    height: 200,
    borderRadius: 50,
  },
  menuContainer: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,        
    borderBottomColor: '#ddd',   
    borderRadius: 10,             
    backgroundColor: '#f9f9f9',  
    marginBottom: 10,            
    borderWidth: 1,               
    borderColor: 'black',    
  },
  menuItemText: {
    fontSize: 20,
    marginLeft: 10,
    flex: 1, 
    color: 'black',
  },
  contactHeader: {
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 10,
    backgroundColor: '#DDDDDD',
    padding: 10,
    color: 'black',
  },
  saveButton: {
    backgroundColor: '#007BFF', 
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditInfo;
