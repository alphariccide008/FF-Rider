import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../stores/authStore';
import { useDeliveryStore } from '../../stores/deliveryStore';
import { uploadProfilePhoto } from '../../services/api/auth.api';
import { formatPhoneNumber } from '../../utils/formatters';
import { APP_VERSION } from '../../utils/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const { bikeReadiness } = useDeliveryStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Determine if rider is online based on bike readiness
  const isOnline = bikeReadiness === 'ready';
  const statusText = isOnline ? 'ONLINE' : 'OFFLINE';
  const statusColor = isOnline ? '#10B981' : '#EF4444';
  const statusBgColor = isOnline ? 'bg-success/20' : 'bg-error/20';

  const handleChangePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const localUri = result.assets[0].uri;
      setIsUploadingPhoto(true);
      try {
        const serverUrl = await uploadProfilePhoto(localUri);
        if (user) {
          setUser({ ...user, profilePhoto: serverUrl });
        }
        Alert.alert('Success', 'Profile photo updated!');
      } catch (err: any) {
        Alert.alert('Upload Failed', err.message || 'Could not upload photo. Please try again.');
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
            router.replace('/(auth)/login');
          } catch (error) {
            console.error('Logout failed:', error);
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 pt-12 pb-6">
        {/* Header */}
        <Text className="text-textPrimary text-2xl font-bold mb-6">Profile</Text>

        {/* User Info Card */}
        <Card className="mb-6">
          <View className="items-center py-4">
            {/* Avatar with upload */}
            <View className="mb-4">
              <Pressable onPress={handleChangePhoto} disabled={isUploadingPhoto}>
                <View>
                  {user?.profilePhoto ? (
                    <Image
                      source={{ uri: user.profilePhoto }}
                      style={{ width: 80, height: 80, borderRadius: 40 }}
                    />
                  ) : (
                    <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center">
                      <Text className="text-4xl">👤</Text>
                    </View>
                  )}
                  {/* Upload overlay */}
                  {isUploadingPhoto ? (
                    <View
                      style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.45)',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <ActivityIndicator color="#FFF" size="small" />
                    </View>
                  ) : (
                    <View
                      style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 26, height: 26, borderRadius: 13,
                        backgroundColor: '#1B9B8E',
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 2, borderColor: '#FFF',
                      }}
                    >
                      <Ionicons name="camera" size={13} color="#FFF" />
                    </View>
                  )}
                </View>
              </Pressable>
              <Pressable onPress={handleChangePhoto} disabled={isUploadingPhoto} className="mt-1.5">
                <Text style={{ color: '#1B9B8E', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                  {isUploadingPhoto ? 'Uploading…' : 'Change Photo'}
                </Text>
              </Pressable>
            </View>

            {!user?.profilePhoto && (
              <View
                style={{
                  backgroundColor: '#FEF3C7',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="alert-circle" size={13} color="#D97706" />
                <Text style={{ color: '#D97706', fontSize: 11, fontWeight: '600' }}>
                  Please add a profile photo
                </Text>
              </View>
            )}

            <Text className="text-textPrimary text-xl font-bold mb-1">
              {user?.fullName || 'Rider'}
            </Text>
            <Text className="text-textSecondary text-sm mb-1">
              {user?.phoneNumber ? formatPhoneNumber(user.phoneNumber) : ''}
            </Text>
            {user?.email && (
              <Text className="text-textSecondary text-sm">{user.email}</Text>
            )}
          </View>
        </Card>

        {/* Rider Status Card */}
        <Card className="mb-6">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
              <Ionicons name="bicycle" size={24} color="#1B9B8E" />
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary font-semibold">Rider Status</Text>
              <Text className="text-textSecondary text-sm">
                Flexyfuel Delivery Partner
              </Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${statusBgColor}`}>
              <View className="flex-row items-center">
                <View
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: statusColor }}
                />
                <Text className="text-xs font-bold" style={{ color: statusColor }}>
                  {statusText}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Bike Readiness Warning (if offline) */}
        {!isOnline && (
          <Card className="mb-6 bg-error/10 border border-error">
            <View className="flex-row items-start">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <View className="ml-3 flex-1">
                <Text className="text-error font-semibold mb-1">
                  You're Currently Offline
                </Text>
                <Text className="text-error text-sm mb-3">
                  Update your bike status to start receiving orders
                </Text>
                <Button
                  title="Update Bike Status"
                  onPress={() => router.push('/(modals)/bike-readiness')}
                  variant="outline"
                  className="border-error"
                />
              </View>
            </View>
          </Card>
        )}

        {/* Menu Items */}
        <View className="mb-6 space-y-2">
          <TouchableOpacity>
            <Card className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-background items-center justify-center mr-3">
                  <Ionicons name="person-outline" size={20} color="#6B7280" />
                </View>
                <Text className="text-textPrimary font-medium">Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Card>
          </TouchableOpacity>

          <TouchableOpacity>
            <Card className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-background items-center justify-center mr-3">
                  <Ionicons name="notifications-outline" size={20} color="#6B7280" />
                </View>
                <Text className="text-textPrimary font-medium">Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(modals)/bike-readiness')}>
            <Card className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-background items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" />
                </View>
                <Text className="text-textPrimary font-medium">Bike Safety Check</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Card>
          </TouchableOpacity>

          <TouchableOpacity>
            <Card className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-background items-center justify-center mr-3">
                  <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
                </View>
                <Text className="text-textPrimary font-medium">Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Card>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          variant="outline"
          onPress={handleLogout}
          loading={isLoggingOut}
          icon={<Ionicons name="log-out-outline" size={20} color="#1B9B8E" />}
          className="mb-6"
        />

        {/* App Version */}
        <Text className="text-textMuted text-center text-xs">
          Version {APP_VERSION}
        </Text>
      </View>
    </ScrollView>
  );
}
