import React from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import useForgotPass from '../../hooks/useForgotPass';
import { useNavigation } from '@react-navigation/native';

const EmailSend = () => {
  const navigation = useNavigation();
  const { 
    email, 
    setEmail, 
    handleForgotPassword, 
    status 
  } = useForgotPass();

  const onSubmit = async () => {
    if (!email) {
      showMessage({
        message: "Lỗi",
        description: "Email là bắt buộc",
        type: "danger",
        duration: 3000,
      });
      return;
    }

    try {
      const result = await handleForgotPassword(email);
      console.log('Result:', result);
      
      if (result.success) {
        showMessage({
          message: "Gửi mã thành công!",
          description: "Vui lòng kiểm tra email của bạn để nhận mã xác nhận.",
          type: "success",
          duration: 3000,
          icon: "success",
        });
        navigation.navigate('EmailOTP', { email });
      } else {
        showMessage({
          message: "Gửi mã thất bại!",
          description: result.message || "Email không tồn tại trong hệ thống.",
          type: "danger",
          duration: 3000,
          icon: "danger",
        });
      }
    } catch (error) {
      console.error('Error in onSubmit:', error);
      showMessage({
        message: "Lỗi hệ thống!",
        description: "Không thể gửi mã xác nhận. Vui lòng thử lại sau.",
        type: "danger",
        duration: 3000,
        icon: "danger",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Quên mật khẩu?</Text>
        <Text style={styles.subtitle}>
          Vui lòng nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
        </Text>
        <View style={styles.loginCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email của bạn"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
        <TouchableOpacity 
          style={styles.button} 
          onPress={onSubmit} 
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Gửi yêu cầu</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </ScrollView>
      <FlashMessage position="top" />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 30,
    resizeMode: 'contain',
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 54,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  
  backButton: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
    width: '100%',
    textAlign: 'center',
  },
});

export default EmailSend;
