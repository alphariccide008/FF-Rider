import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useDeliveryStore } from '../../stores/deliveryStore';
import { formatFuelQuantity, formatTime } from '../../utils/formatters';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { OrderStatus, Order } from '../../types/order';

export default function DeliveriesScreen() {
  const router = useRouter();
  const { assignedOrders, fetchAssignedOrders, refreshOrders, isLoading, isRefreshing } =
    useDeliveryStore();

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      await fetchAssignedOrders();
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }

  function handleOrderPress(orderId: string) {
    router.push({
      pathname: '/(modals)/delivery-details',
      params: { orderId },
    });
  }

  function getStatusIcon(status: OrderStatus) {
    switch (status) {
      case 'rider_assigned':
        return 'time-outline';
      case 'en_route':
        return 'bicycle';
      case 'arrived':
        return 'location';
      case 'completed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'ellipse-outline';
    }
  }

  function getActionText(status: OrderStatus) {
    switch (status) {
      case 'rider_assigned':
        return 'Start Trip';
      case 'en_route':
        return 'Mark Arrived';
      case 'arrived':
        return 'Complete';
      case 'completed':
        return 'View Details';
      default:
        return 'View';
    }
  }

  function renderOrderCard(order: Order) {
    return (
      <TouchableOpacity
        key={order.id}
        onPress={() => handleOrderPress(order.id)}
        activeOpacity={0.7}
      >
        <Card className="mb-3">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Ionicons
                  name={getStatusIcon(order.status as OrderStatus)}
                  size={20}
                  color="#1B9B8E"
                />
              </View>
              <View className="flex-1">
                <Text className="text-textPrimary font-bold text-base">
                  #{order.orderNumber}
                </Text>
                <Text className="text-textSecondary text-xs">
                  {formatTime(order.createdAt)}
                </Text>
              </View>
            </View>
            <Badge
              label={ORDER_STATUS_LABELS[order.status as OrderStatus]}
              status={order.status as OrderStatus}
              size="sm"
            />
          </View>

          {/* Customer Info */}
          <View className="mb-3 space-y-2">
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text className="text-textPrimary text-sm ml-2 font-medium">
                {order.customerName}
              </Text>
            </View>

            <View className="flex-row items-start">
              <Ionicons name="location-outline" size={16} color="#6B7280" className="mt-0.5" />
              <Text className="text-textSecondary text-sm ml-2 flex-1" numberOfLines={2}>
                {order.deliveryAddress.street}, {order.deliveryAddress.city}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="water-outline" size={16} color="#6B7280" />
                <Text className="text-textSecondary text-sm ml-2">
                  {formatFuelQuantity(order.fuelQuantity)}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="flash-outline" size={16} color="#6B7280" />
                <Text className="text-textSecondary text-sm ml-1 capitalize">
                  {order.deliveryMode}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <View className="flex-row items-center justify-between pt-3 border-t border-border">
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={16} color="#1B9B8E" />
              <Text className="text-primary text-sm ml-1 font-medium">
                Call Customer
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text className="text-primary text-sm font-semibold mr-1">
                {getActionText(order.status as OrderStatus)}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#1B9B8E" />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  if (isLoading && (!assignedOrders || assignedOrders.length === 0)) {
    return <LoadingSpinner fullScreen message="Loading deliveries..." />;
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary px-4 pt-12 pb-6">
        <Text className="text-white text-2xl font-bold">Deliveries</Text>
        <Text className="text-white/80 text-sm mt-1">
          {assignedOrders?.length || 0} active {(assignedOrders?.length || 0) === 1 ? 'delivery' : 'deliveries'}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshOrders}
            tintColor="#1B9B8E"
          />
        }
      >
        {!assignedOrders || assignedOrders.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Ionicons name="bicycle-outline" size={48} color="#1B9B8E" />
            </View>
            <Text className="text-textPrimary text-lg font-semibold mb-2">
              No Active Deliveries
            </Text>
            <Text className="text-textSecondary text-center text-sm px-8">
              You don't have any assigned deliveries at the moment. New orders will appear here.
            </Text>
          </View>
        ) : (
          <View className="pb-6">
            {/* Filter tabs - can be expanded later */}
            <View className="flex-row mb-4 gap-2">
              <View className="px-4 py-2 bg-primary rounded-full">
                <Text className="text-white font-semibold text-sm">All</Text>
              </View>
              <View className="px-4 py-2 bg-surface rounded-full border border-border">
                <Text className="text-textSecondary font-medium text-sm">Active</Text>
              </View>
              <View className="px-4 py-2 bg-surface rounded-full border border-border">
                <Text className="text-textSecondary font-medium text-sm">Completed</Text>
              </View>
            </View>

            {/* Orders List */}
            {assignedOrders?.map((order) => renderOrderCard(order))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
