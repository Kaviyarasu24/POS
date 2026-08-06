import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';

export default function ProductsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Products Catalogue screen is under construction.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#434655',
    fontWeight: '500',
  },
});
