import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../stores/authStore';
import { useDeliveryStore } from '../../stores/deliveryStore';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { stats, assignedOrders, fetchDashboard, isLoading, isRefreshing, refreshOrders } =
    useDeliveryStore();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      await fetchDashboard();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }

  if (isLoading && (!assignedOrders || assignedOrders.length === 0)) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <ScrollView
      className="flex-1 mt-10 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshOrders}
          tintColor="#1B9B8E"
        />
      }
    >
      <View className="px-4 pt-12 pb-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-textSecondary text-sm">Welcome back,</Text>
            <Text className="text-textPrimary text-2xl font-bold">
              {user?.fullName || 'Rider'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/bike-readiness')}
            className="w-12 h-12 rounded-full bg-primary items-center justify-center"
          >
            <Ionicons name="shield-checkmark" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <Card className="flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                <Ionicons name="checkmark-circle" size={20} color="#1B9B8E" />
              </View>
              <Text className="text-3xl font-bold text-textPrimary">
                {stats?.completedToday || 0}
              </Text>
            </View>
            <Text className="text-textSecondary text-sm">Today's Deliveries</Text>
          </Card>

          <Card className="flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 rounded-full bg-success/10 items-center justify-center">
                <Ionicons name="wallet" size={20} color="#10B981" />
              </View>
              <Text className="text-3xl font-bold text-textPrimary">
                ₦{stats?.totalEarnings?.toLocaleString() || '0'}
              </Text>
            </View>
            <Text className="text-textSecondary text-sm">Total Earnings</Text>
          </Card>

          <Card className="flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 rounded-full bg-warning/10 items-center justify-center">
                <Ionicons name="bicycle" size={20} color="#F59E0B" />
              </View>
              <Text className="text-3xl font-bold text-textPrimary">
                {assignedOrders?.length || 0}
              </Text>
            </View>
            <Text className="text-textSecondary text-sm">Active Orders</Text>
          </Card>

          <Card className="flex-1 min-w-[45%]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-10 h-10 rounded-full bg-info/10 items-center justify-center">
                <Ionicons name="star" size={20} color="#3B82F6" />
              </View>
              <Text className="text-3xl font-bold text-textPrimary">
                {stats?.rating?.toFixed(1) || '0.0'}
              </Text>
            </View>
            <Text className="text-textSecondary text-sm">Rating</Text>
          </Card>
        </View>

        {/* Assigned Orders Section */}
        <View className="mb-6">
          <Text className="text-textPrimary text-lg font-bold mb-3">
            Assigned Orders
          </Text>

          {!assignedOrders || assignedOrders.length === 0 ? (
            <Card>
              <View className="items-center py-8">
                <Ionicons name="bicycle-outline" size={48} color="#9CA3AF" />
                <Text className="text-textSecondary text-center mt-4">
                  No assigned orders yet
                </Text>
                <Text className="text-textMuted text-center text-sm mt-1">
                  New orders will appear here
                </Text>
              </View>
            </Card>
          ) : (
            assignedOrders?.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() =>
                  router.push({
                    pathname: '/(modals)/delivery-details',
                    params: { orderId: order.id },
                  })
                }
                activeOpacity={0.7}
              >
                <Card className="mb-3">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-textPrimary font-semibold">
                      Order #{order.orderNumber}
                    </Text>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: '#3B82F6' }}
                    >
                      <Text className="text-white text-xs font-medium">
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <Ionicons name="person-outline" size={16} color="#6B7280" />
                      <Text className="text-textSecondary text-sm ml-2">
                        {order.customerName}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons name="location-outline" size={16} color="#6B7280" />
                      <Text className="text-textSecondary text-sm ml-2" numberOfLines={1}>
                        {order.deliveryAddress?.street ?? 'Address unavailable'}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons name="water-outline" size={16} color="#6B7280" />
                      <Text className="text-textSecondary text-sm ml-2">
                        {order.fuelQuantity}L Fuel
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-end pt-3 border-t border-border mt-3">
                    <Text className="text-primary text-sm font-semibold mr-1">
                      View Details
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#1B9B8E" />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
