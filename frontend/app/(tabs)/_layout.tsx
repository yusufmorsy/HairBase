import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import { TabNavigationState, ParamListBase } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";

const MaterialTopTabs = createMaterialTopTabNavigator();
const ExpoRouterMaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof MaterialTopTabs.Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(MaterialTopTabs.Navigator);

export default function TabLayout() {
  return (
    <ExpoRouterMaterialTopTabs
      screenOptions={{ tabBarStyle: { display: "none" }, lazy: false }}
    >
      <ExpoRouterMaterialTopTabs.Screen name="history" />
      <ExpoRouterMaterialTopTabs.Screen name="index" />
      <ExpoRouterMaterialTopTabs.Screen name="scan" />
    </ExpoRouterMaterialTopTabs>
  );
}
