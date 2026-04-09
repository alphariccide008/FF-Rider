import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
      setSuccessMessage('Trip started! Opening navigation...');
      setShowSuccess(true);

      // Auto-open Google Maps with directions
      handleNavigate();

      setTimeout(() => {
        setShowSuccess(false);
        router.push({
          pathname: '/(modals)/track-order',
          params: { orderId: order.id },
        });
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
    const { latitude, longitude, street, city, state } = order.deliveryAddress;

    if (!latitude || !longitude) {
      // No coordinates — fall back to address text search
      const addressQuery = encodeURIComponent(`${street}, ${city}, ${state}`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`);
      return;
    }

    // Native deeplinks open the Google Maps app with turn-by-turn directions
    const nativeUrl = Platform.select({
      ios: `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`,
      android: `google.navigation:q=${latitude},${longitude}&mode=d`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`,
    })!;

    const webFallback = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

    Linking.canOpenURL(nativeUrl).then((supported) => {
      Linking.openURL(supported ? nativeUrl : webFallback);
    });
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
              title="Picked"
              onPress={handleStartTrip}
              loading={isLoading}
              icon={<Ionicons name="checkmark-done-circle" size={20} color="#ffffff" />}
            />
            <Button
              title="Open Map"
              variant="outline"
              onPress={handleNavigate}
              icon={<Ionicons name="map" size={20} color="#1B9B8E" />}
            />
          </View>
        );

      case 'en_route':
        return (
          <View className="space-y-3">
            {/* Status indicator */}
            <View className="flex-row items-center justify-center bg-info/10 rounded-xl py-2 px-4">
              <Ionicons name="bicycle" size={18} color="#3B82F6" />
              <Text className="text-info font-semibold ml-2">En Route to Customer</Text>
            </View>
            <Button
              title="Mark as Arrived"
              onPress={handleMarkArrived}
              loading={isLoading}
              icon={<Ionicons name="location" size={20} color="#ffffff" />}
            />
            <Button
              title="Open Map"
              variant="outline"
              onPress={handleNavigate}
              icon={<Ionicons name="map" size={20} color="#1B9B8E" />}
            />
          </View>
        );

      case 'arrived':
        return (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="mt-3">
              <Input
                label="Confirmation Code"
                placeholder="Enter code from customer"
                value={confirmationCode}
                onChangeText={setConfirmationCode}
                keyboardType="default"
                autoCapitalize="characters"
                maxLength={10}
              />
            </View>
            <View className="mt-3">
              <Button
                title="Complete Delivery"
                onPress={handleCompleteDelivery}
                loading={isLoading}
                disabled={!confirmationCode.trim()}
                icon={<Ionicons name="checkmark-circle" size={20} color="#ffffff" />}
              />
            </View>
            <View className="mt-4 mb-10">
              <Button
                title="Open Map"
                variant="outline"
                onPress={handleNavigate}
                icon={<Ionicons name="map" size={20} color="#1B9B8E" />}
              />
            </View>
          </KeyboardAvoidingView>
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
        <Card className="mb-4 px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-textPrimary font-bold text-lg">Customer Info</Text>
            <TouchableOpacity
              onPress={handleCallCustomer}
              className="flex-row items-center bg-primary/10 px-3 py-2 rounded-full"
            >
              <Ionicons name="call" size={16} color="#1B9B8E" />
              <Text className="text-primary font-semibold text-sm ml-1">Call</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar + Name */}
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
              <Text className="text-primary font-bold text-lg">
                {order.customerName?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary font-bold text-base">
                {order.customerName ?? 'Unknown Customer'}
              </Text>
              <Text className="text-textSecondary text-xs">Customer</Text>
            </View>
          </View>

          {/* Details */}
          <View className="border-t border-border pt-3">
            <View className="flex-row items-center mb-3">
              <Ionicons name="call-outline" size={16} color="#6B7280" />
              <Text className="text-textSecondary ml-2 text-sm">
                {order.customerPhone ? formatPhoneNumber(order.customerPhone) : 'N/A'}
              </Text>
            </View>

            <View className="flex-row items-start mb-3">
              <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginTop: 2 }} />
              <View className="ml-2 flex-1">
                <Text className="text-textSecondary text-sm font-medium">
                  {order.deliveryAddress?.street ?? '—'}
                </Text>
                <Text className="text-textSecondary text-sm mt-0.5">
                  {order.deliveryAddress?.city ?? ''}{order.deliveryAddress?.city && order.deliveryAddress?.state ? ', ' : ''}{order.deliveryAddress?.state ?? ''}
                </Text>
              </View>
            </View>

            {order.deliveryAddress?.description ? (
              <View className="flex-row items-start mb-1">
                <Ionicons name="information-circle-outline" size={16} color="#6B7280" style={{ marginTop: 2 }} />
                <Text className="text-textSecondary text-sm ml-2 italic flex-1">
                  "{order.deliveryAddress.description}"
                </Text>
              </View>
            ) : null}
          </View>
        </Card>


        {/* Order Details Card */}
        <Card className="mb-4 px-4 py-4">
          <Text className="text-textPrimary font-bold text-lg mb-3">
            Order Details
          </Text>

          <View>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="water" size={18} color="#6B7280" />
                <Text className="text-textSecondary ml-2">Fuel Quantity</Text>
              </View>
              <Text className="text-textPrimary font-semibold">
                {formatFuelQuantity(order.fuelQuantity)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="flash" size={18} color="#6B7280" />
                <Text className="text-textSecondary ml-2">Delivery Mode</Text>
              </View>
              <Text className="text-textPrimary font-semibold capitalize">
                {order.deliveryMode}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="cash" size={18} color="#6B7280" />
                <Text className="text-textSecondary ml-2">Total Amount</Text>
              </View>
              <Text className="text-textPrimary font-semibold">
                {formatCurrency(order.totalAmount)}
              </Text>
            </View>

            {order.estimatedArrival ? (
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center">
                  <Ionicons name="time" size={18} color="#6B7280" />
                  <Text className="text-textSecondary ml-2">Est. Arrival</Text>
                </View>
                <Text className="text-textPrimary font-semibold">
                  {formatTime(order.estimatedArrival)}
                </Text>
              </View>
            ) : null}
          </View>
        </Card>

        {/* Timeline Card */}
        {(order.startedAt || order.arrivedAt || order.completedAt) && (
          <Card className="mb-4 px-4 py-4">
            <Text className="text-textPrimary font-bold text-lg mb-3">
              Timeline
            </Text>

            <View>
              {order.startedAt ? (
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-full bg-info/20 items-center justify-center mr-3">
                    <Ionicons name="play" size={14} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-textPrimary font-medium text-sm">Trip Started</Text>
                    <Text className="text-textSecondary text-xs">{formatTime(order.startedAt)}</Text>
                  </View>
                </View>
              ) : null}

              {order.arrivedAt ? (
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-full bg-warning/20 items-center justify-center mr-3">
                    <Ionicons name="location" size={14} color="#F59E0B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-textPrimary font-medium text-sm">Arrived</Text>
                    <Text className="text-textSecondary text-xs">{formatTime(order.arrivedAt)}</Text>
                  </View>
                </View>
              ) : null}

              {order.completedAt ? (
                <View className="flex-row items-center mb-1">
                  <View className="w-8 h-8 rounded-full bg-success/20 items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={14} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-textPrimary font-medium text-sm">Completed</Text>
                    <Text className="text-textSecondary text-xs">{formatTime(order.completedAt)}</Text>
                  </View>
                </View>
              ) : null}
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
