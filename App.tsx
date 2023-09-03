/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useRef, useState } from 'react';
import Home from './screens/Home';
import { RegisterEvent } from './screens/RegisterEvent';
import { List } from './screens/List';
import { Detail } from './screens/Detail';
import { Login } from './screens/Login';
import UserContext from './contexts/context';
import { StartEvent } from './screens/StartEvent';
import Join from './screens/Join';

function App(): JSX.Element {
  const Stack = createStackNavigator();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState("")

  const onLogin = (isLogin: Boolean, userId: string) => {
    console.log("In onLogin")
    console.log(`userId: ${userId}`)
    setIsLoggedIn(true)
    setUserId(userId)
  }

  // ログイン画面                                                                                     
  if (!isLoggedIn) {
    return (
      <Login onLogin={onLogin}/>
    )
  }

  return (
  <UserContext.Provider value={{ userId, setUserId }}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen
        name="Home"
        component={Home}
        options={{title: 'ホーム'}}/>
        <Stack.Screen
        name="RegisterEvent"
        component={RegisterEvent}
        options={{title: '登録'}}/>
        <Stack.Screen
        name="List"
        component={List}
        options={{title: '一覧'}}/>
        <Stack.Screen
        name="Detail"
        component={Detail}
        options={{title: '詳細'}}/>
        <Stack.Screen
        name="StartEvent"
        component={StartEvent}
        options={{title: '開始'}}/>
        <Stack.Screen
        name="Join"
        component={Join}
        options={{title: '参加'}}/>
      </Stack.Navigator>
    </NavigationContainer>
  </UserContext.Provider>
  );
}

export default App;
