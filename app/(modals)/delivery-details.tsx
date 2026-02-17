import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { SuccessModal } from '../../components/modals/SuccessModal';
import { ErrorModal } from '../../components/modals/ErrorModal';
import { useDeliveryStore } from '../../stores/deliveryStore';
import { formatCurrency, formatTime, formatPhoneNumber, formatFuelQuantity } from '../../utils/formatters';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { OrderStatus } from '../../types/order';

export default function DeliveryDetailsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { assignedOrders, startDelivery, markArrived, completeDelivery, isLoading } = useDeliveryStore();

  const [confirmationCode, setConfirmationCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Find the order
  const order = assignedOrders?.find((o) => o.id === orderId);

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-4">
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text className="text-textPrimary text-lg font-semibold mt-4">
          Order Not Found
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          className="mt-6"
        />
      </View>
    );
  }

  async function handleStartTrip() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await startDelivery(order.id);
      setSuccessMessage('Trip started! Navigate to customer location.');
      setShowSuccess(true);

      // Optionally open navigation
      setTimeout(() => {
        handleNavigate();
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to start trip');
      setShowError(true);
    }
  }

  async function handleMarkArrived() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Confirm Arrival',
      'Have you arrived at the customer location?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, I arrived',
          onPress: async () => {
            try {
              await markArrived(order.id);
              setSuccessMessage('Marked as arrived! Get the confirmation code from customer.');
              setShowSuccess(true);
            } catch (error: any) {
              setErrorMessage(error.message || 'Failed to mark as arrived');
              setShowError(true);
            }
          },
        },
      ]
    );
  }

  async function handleCompleteDelivery() {
    if (!confirmationCode.trim() || confirmationCode.length < 4) {
      setErrorMessage('Please enter a valid confirmation code');
      setShowError(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await completeDelivery(order.id, confirmationCode);
      setSuccessMessage('Delivery completed successfully! 🎉');
      setShowSuccess(true);

      // Go back after success
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Invalid confirmation code');
      setShowError(true);
      setConfirmationCode('');
    }
  }

  function handleNavigate() {
    const { latitude, longitude } = order.deliveryAddress;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  }

  function handleCallCustomer() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${order.customerPhone}`);
  }

  function renderActionButtons() {
    switch (order.status) {
      case 'rider_assigned':
        return (
          <View className="space-y-3">
            <Button
              title="Start Trip"
              onPress={handleStartTrip}
              loading={isLoading}
              icon={<Ionicons name="play-circle" size={20} color="#ffffff" />}
            />
            <Button
              title="Navigate to Customer"
              variant="outline"
              onPress={handleNavigate}
              icon={<Ionicons name="navigate" size={20} color="#1B9B8E" />}
            />
          </View>
        );

      case 'en_route':
        return (
          <View className="space-y-3">
            <Button
              title="Mark as Arrived"
              onPress={handleMarkArrived}
              loading={isLoading}
              icon={<Ionicons name="location" size={20} color="#ffffff" />}
            />
            <Button
              title="Navigate to Customer"
              variant="outline"
              onPress={handleNavigate}
              icon={<Ionicons name="navigate" size={20} color="#1B9B8E" />}
            />
          </View>
        );

      case 'arrived':
        return (
          <View className="space-y-3">
            <Input
              label="Confirmation Code"
              placeholder="Enter code from customer"
              value={confirmationCode}
              onChangeText={setConfirmationCode}
              keyboardType="default"
              autoCapitalize="characters"
              maxLength={10}
            />
            <Button
              title="Complete Delivery"
              onPress={handleCompleteDelivery}
              loading={isLoading}
              disabled={!confirmationCode.trim()}
              icon={<Ionicons name="checkmark-circle" size={20} color="#ffffff" />}
            />
          </View>
        );

      case 'completed':
        return (
          <View className="bg-success/10 rounded-2xl p-4 items-center">
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text className="text-success font-semibold text-lg mt-2">
              Delivery Completed!
            </Text>
            <Text className="text-textSecondary text-sm text-center mt-1">
              Great job! This delivery has been marked as complete.
            </Text>
          </View>
        );

      default:
        return null;
    }
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary px-4 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Delivery Details</Text>
          <View className="w-10" />
        </View>

        {/* Order Number & Status */}
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-2xl font-bold">
            #{order.orderNumber}
          </Text>
          <Badge
            label={ORDER_STATUS_LABELS[order.status as OrderStatus]}
            status={order.status as OrderStatus}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Customer Info Card */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-textPrimary font-bold text-lg">Customer</Text>
            <TouchableOpacity
              onPress={handleCallCustomer}
              className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
            >
              <Ionicons name="call" size={20} color="#1B9B8E" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons name="person" size={18} color="#6B7280" />
            <Text className="text-textPrimary ml-2 font-medium">
              {order.customerName}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="call-outline" size={18} color="#6B7280" />
            <Text className="text-textSecondary ml-2">
              {formatPhoneNumber(order.customerPhone)}
            </Text>
          </View>
        </Card>

        {/* Delivery Address Card */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-textPrimary font-bold text-lg">
              Delivery Address
            </Text>
            <TouchableOpacity
              onPress={handleNavigate}
              className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
            >
              <Ionicons name="navigate" size={20} color="#1B9B8E" />
            </TouchableOpacity>
          </View>

          <View className="flex-row">
            <Ionicons name="location" size={18} color="#6B7280" className="mt-1" />
            <View className="flex-1 ml-2">
              <Text className="text-textPrimary font-medium">
                {order.deliveryAddress.street}
              </Text>
              <Text className="text-textSecondary text-sm mt-1">
                {order.deliveryAddress.city}, {order.deliveryAddress.state}
              </Text>
              {order.deliveryAddress.description && (
                <Text className="text-textMuted text-sm mt-2 italic">
                  "{order.deliveryAddress.description}"
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Order Details Card */}
        <Card className="mb-4">
          <Text className="text-textPrimary font-bold text-lg mb-3">
            Order Details
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="water" size={18} color="#6B7280" />
                <Text className="text-textSecondary ml-2">Fuel Quantity</Text>
              </View>
              <Text className="text-textPrimary font-semibold">
                {formatFuelQuantity(order.fuelQuantity)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="flash" size={18} color="#6B7280" />
                <Text className="text-textSecondary ml-2">Delivery Mode</Text>
              </View>
              <Text className="text-textPrimary font-semibold capitalize">
                {order.deliveryMode}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="cash" size={18} color="#6B7280" />
                <Text className="text-textSecondary ml-2">Total Amount</Text>
              </View>
              <Text className="text-textPrimary font-semibold">
                {formatCurrency(order.totalAmount)}
              </Text>
            </View>

            {order.estimatedArrival && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="time" size={18} color="#6B7280" />
                  <Text className="text-textSecondary ml-2">Est. Arrival</Text>
                </View>
                <Text className="text-textPrimary font-semibold">
                  {formatTime(order.estimatedArrival)}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Timeline Card */}
        {(order.startedAt || order.arrivedAt || order.completedAt) && (
          <Card className="mb-4">
            <Text className="text-textPrimary font-bold text-lg mb-3">
              Timeline
            </Text>

            <View className="space-y-3">
              {order.startedAt && (
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-info/20 items-center justify-center mr-3">
                    <Ionicons name="play" size={14} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-textPrimary font-medium text-sm">
                      Trip Started
                    </Text>
                    <Text className="text-textSecondary text-xs">
                      {formatTime(order.startedAt)}
                    </Text>
                  </View>
                </View>
              )}

              {order.arrivedAt && (
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-warning/20 items-center justify-center mr-3">
                    <Ionicons name="location" size={14} color="#F59E0B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-textPrimary font-medium text-sm">
                      Arrived
                    </Text>
                    <Text className="text-textSecondary text-xs">
                      {formatTime(order.arrivedAt)}
                    </Text>
                  </View>
                </View>
              )}

              {order.completedAt && (
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-success/20 items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={14} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-textPrimary font-medium text-sm">
                      Completed
                    </Text>
                    <Text className="text-textSecondary text-xs">
                      {formatTime(order.completedAt)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View className="mb-6">{renderActionButtons()}</View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showError}
        message={errorMessage}
        onClose={() => setShowError(false)}
      />
    </View>
  );
}
