import { Stack } from "expo-router";
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from '../redux/store';
import { AudioProvider } from '../contexts/AudioContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AudioProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </AudioProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
