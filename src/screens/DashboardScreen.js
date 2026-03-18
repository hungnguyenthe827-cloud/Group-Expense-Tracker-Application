import { View, Text } from 'react-native';

export default function DashboardScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Bảng điều khiển</Text>
      <Text>Danh sách các nhóm của bạn sẽ hiện ở đây.</Text>
    </View>
  );
}