import { Link, Tabs } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/context/AuthContext';

function ProfileButton() {
  const { user } = useAuth();
  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href="/profile" asChild>
      <Pressable style={{ marginRight: 16 }}>
        {({ pressed }) =>
          user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={{
                width: 34, height: 34, borderRadius: 17,
                borderWidth: 2, borderColor: '#FF385C',
                opacity: pressed ? 0.7 : 1,
              }}
            />
          ) : (
            <View
              style={{
                width: 34, height: 34, borderRadius: 17,
                backgroundColor: '#FF385C',
                alignItems: 'center', justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
              }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{initials}</Text>
            </View>
          )
        }
      </Pressable>
    </Link>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF385C',
        tabBarInactiveTintColor: '#64748B',
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: colorScheme === 'dark' ? '#0F172A' : '#FFFFFF',
          borderTopColor: colorScheme === 'dark' ? '#1E293B' : '#E2E8F0',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#0F172A' : '#FFFFFF',
          borderBottomColor: colorScheme === 'dark' ? '#1E293B' : '#E2E8F0',
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          color: colorScheme === 'dark' ? '#FFFFFF' : '#0F172A',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Roommate Matches',
          tabBarLabel: 'Discover',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>👥</Text>
          ),
          headerRight: () => <ProfileButton />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Roomie Hub',
          tabBarLabel: 'Living Hub',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>🧹</Text>
          ),
          headerRight: () => <ProfileButton />,
        }}
      />
    </Tabs>
  );
}
