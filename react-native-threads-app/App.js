/**
 * @format
 * @flow strict-local
 */

import React from 'react';
import {StyleSheet, View, StatusBar} from 'react-native';
import CheckList from './src/checklist';

const App: () => React$Node = () => {
  return (
    <View style={styles.container}>
      <StatusBar />
      <CheckList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    flexDirection: 'column', // main axis
    justifyContent: 'center', // main axis
    alignItems: 'center', // cross axis
    backgroundColor: '#FEFEFE',
  },
});

export default App;
