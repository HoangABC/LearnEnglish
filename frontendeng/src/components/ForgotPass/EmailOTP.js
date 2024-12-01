import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useForgotPass from '../../hooks/useForgotPass';
import FlashMessage, { showMessage } from 'react-native-flash-message';

const EmailOTP = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const email = route.params?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));
  const { handleVerifyToken, handleForgotPassword } = useForgotPass();

  const isOtpComplete = otp.every(digit => digit !== '');

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].current.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].current.focus();
    }
  };

  const handleSubmit = async () => {
    if (!isOtpComplete) return;

    const token = otp.join('');
    console.log('Email:', email);
    console.log('Token being sent:', token);

    const result = await handleVerifyToken(email, token);
    
    console.log('Verify result:', result);

    if (result.success) {
      navigation.navigate('ForgotPass', { email });
    } else {
      showMessage({
        message: "Lỗi",
        description: result.message || "Mã xác thực không đúng",
        type: "danger",
        duration: 3000,
      });
    }
  };

  const handleResend = async () => {
    const result = await handleForgotPassword(email);
    showMessage({
      message: result.success ? "Thành công" : "Lỗi",
      description: result.message,
      type: result.success ? "success" : "danger",
      duration: 3000,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Yêu cầu xác thực</Text>
        
        <Text style={styles.subtitle}>
          Vui lòng nhập mã mà chúng tôi đã gửi tới {email}.
        </Text>

        <View style={styles.otpContainer}>
          {[...Array(6)].map((_, index) => (
            <TextInput
              key={index}
              ref={inputRefs.current[index]}
              style={styles.otpInput}
              maxLength={1}
              keyboardType="numeric"
              value={otp[index]}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              placeholderTextColor="#D1D5DB"
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton,
            !isOtpComplete && styles.submitButtonDisabled
          ]}
          disabled={!isOtpComplete}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resendButton}
          onPress={handleResend}
        >
          <Text style={styles.resendButtonText}>GỬI LẠI</Text>
        </TouchableOpacity>
      </View>
      <FlashMessage position="top" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  otpInput: {
    width: 56,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  timerText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 32,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 24,
  },
  resendButton: {
    padding: 12,
  },
  resendButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EmailOTP;