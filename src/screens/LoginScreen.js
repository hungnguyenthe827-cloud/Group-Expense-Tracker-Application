import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

// Thêm { navigation } vào tham số của hàm
export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Expense Tracker</Text>
      <Button 
        title="Vào Dashboard thử nghiệm" 
        onPress={() => navigation.navigate('Dashboard')} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 20 }
});