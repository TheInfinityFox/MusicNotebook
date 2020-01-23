import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import ProjectScreen from '../screens/ProjectScreen';
import DemoScreen from '../screens/DemoScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ExpoScreen from '../screens/ExpoScreen';
import SnackScreen from '../screens/SnackScreen';
import StageScreen from '../screens/StageScreen';

import I1Screen from '../screens/I1Screen';

const ProjectStack = createStackNavigator({
  Home: ProjectScreen,
});

ProjectStack.navigationOptions = {
  tabBarLabel: 'Projects',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-home`
          : 'md-home'
      }
    />
  ),
};

const DemoStack = createStackNavigator({
  Home: DemoScreen,
});

DemoStack.navigationOptions = {
  tabBarLabel: 'Demo',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const LinksStack = createStackNavigator({
  Links: LinksScreen,
});

LinksStack.navigationOptions = {
  tabBarLabel: 'Links',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'}
    />
  ),
};

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
});

SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};

const ExpoStack = createStackNavigator({
  Expo: ExpoScreen,
});

ExpoStack.navigationOptions = {
  tabBarLabel: 'Expo',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};

const SnackStack = createStackNavigator({
  Snack: SnackScreen,
});

SnackStack.navigationOptions = {
  tabBarLabel: 'Snack',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};

const StageStack = createStackNavigator({
  Stage: StageScreen,
});

StageStack.navigationOptions = {
  tabBarLabel: 'Stage',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};

const I1Stack = createStackNavigator({
  I1: I1Screen,
});

I1Stack.navigationOptions = {
  tabBarLabel: 'I1',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};

export default createBottomTabNavigator({
  StageStack,
  ExpoStack,
  ProjectStack,
  DemoStack,
  LinksStack,
  // SettingsStack,
  SnackStack,
  I1Stack
});
