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
  const [newName, setNewName] = useState('');  
  const { updateName, status, error } = useUpdateUserName();  

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
      setIsEditable(false); 
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
      <View style={styles.headerBackground}>
        <View style={styles.logoContainer}>
          {userDetails.image ? (
              <Image source={{ uri: userDetails.image }} style={styles.logo} />
            ) : (
              <Image source={require('../../assets/images/EE.png')} style={styles.logo} />
            )}
        </View>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <View style={[
            styles.inputWrapper,
            isEditable && styles.inputWrapperEditable
          ]}>
            <MaterialCommunityIcons 
              name="account" 
              size={20} 
              color={isEditable ? "#2196F3" : "#666"} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[
                styles.input,
                isEditable && styles.inputEditable
              ]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Nhập họ và tên"
              editable={isEditable}
            />
            <TouchableOpacity onPress={() => setIsEditable(!isEditable)}>
              <MaterialCommunityIcons 
                name={isEditable ? "check" : "pencil"} 
                size={20} 
                color="#2196F3" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="email" size={20} color="#666" style={styles.inputIcon} />
            <Text style={styles.inputText}>{userDetails.Email || userDetails.email || 'Guest'}</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Trình độ</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="school" size={20} color="#666" style={styles.inputIcon} />
            <Text style={styles.inputText}>{levelDetails.name}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={handleSave}
        disabled={!isEditable}
      >
        <Text style={styles.saveButtonText}>Lưu thông tin</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerBackground: {
    height: 120,
    backgroundColor: '#2196F3',
    width: '100%',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    position: 'absolute',
    bottom: -40,
    backgroundColor: '#fff',
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 45,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    borderRadius: 40,
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 70,
    paddingHorizontal: 24,
    position: 'relative',
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    color: '#4A5568',
    marginBottom: 8,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputWrapperEditable: {
    backgroundColor: '#fff',
    borderColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
    fontSize: 24,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#333',
    paddingVertical: 0,
  },
  inputEditable: {
    color: '#2196F3',
    fontWeight: '500',
  },
  inputText: {
    flex: 1,
    fontSize: 17,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 25,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditInfo;
