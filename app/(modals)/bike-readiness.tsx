import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SuccessModal } from '../../components/modals/SuccessModal';
import { ErrorModal } from '../../components/modals/ErrorModal';
import { useDeliveryStore } from '../../stores/deliveryStore';
import { BikeReadiness } from '../../types/user';

// Problems to show when "Not Ready" is selected
const PROBLEM_ITEMS = [
  { id: 'battery_low', label: 'Battery low', icon: 'battery-dead' },
  { id: 'brakes_bad', label: 'Brakes are not working properly', icon: 'hand-left' },
  { id: 'lights_bad', label: 'Lights are non-functional', icon: 'bulb-outline' },
  { id: 'tires_bad', label: 'Tires are in bad shape', icon: 'disc' },
  { id: 'no_helmet', label: "Don't have safety helmet", icon: 'shield-outline' },
  { id: 'bad_helmet', label: 'Bad safety helmet', icon: 'shield-half-outline' },
];

export default function BikeReadinessScreen() {
  const router = useRouter();
  const { updateBikeReadiness, isLoading, bikeReadiness } = useDeliveryStore();

  const [selectedStatus, setSelectedStatus] = useState<BikeReadiness | null>(
    bikeReadiness || null
  );
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function handleToggleProblem(problemId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelectedProblems((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId]
    );
  }

  function handleSelectStatus(status: BikeReadiness) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedStatus(status);
    // Clear problems when switching status
    if (status === 'ready') {
      setSelectedProblems([]);
    }
  }

  async function handleSubmit() {
    if (!selectedStatus) {
      setErrorMessage('Please select bike readiness status');
      setShowError(true);
      return;
    }

    // If "Not Ready", must select at least one problem
    if (selectedStatus === 'not_ready' && selectedProblems.length === 0) {
      setErrorMessage('Please select at least one issue with your bike');
      setShowError(true);
      return;
    }

    if (selectedStatus === 'ready') {
      // No problems needed, just save as ready
      await submitReadiness();
      return;
    }

    if (selectedStatus === 'not_ready') {
      Alert.alert(
        'Set Status to Offline',
        `You have selected ${selectedProblems.length} issue(s). Your status will be set to OFFLINE and you won't receive new orders until you're ready.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            style: 'destructive',
            onPress: submitReadiness,
          },
        ]
      );
      return;
    }

    await submitReadiness();
  }

  async function submitReadiness() {
    try {
      // Send bike readiness with problems (if not ready) or empty array (if ready)
      await updateBikeReadiness(selectedStatus!, selectedProblems);
      setShowSuccess(true);

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update bike status');
      setShowError(true);
    }
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header - Fixed */}
      <View className="bg-primary px-4 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Bike Safety Check</Text>
          <View className="w-10" />
        </View>

        <Text className="text-white/80 text-sm">
          Complete your daily safety check before starting deliveries
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Bike Readiness Status */}
        <Text className="text-textPrimary font-bold text-lg mb-3">
          Bike Status
        </Text>

        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={() => handleSelectStatus('ready')}
            activeOpacity={0.7}
            className="flex-1"
          >
            <Card
              className={`items-center py-6 ${
                selectedStatus === 'ready'
                  ? 'border-2 border-success bg-success/5'
                  : ''
              }`}
            >
              <View
                className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${
                  selectedStatus === 'ready' ? 'bg-success' : 'bg-success/20'
                }`}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={32}
                  color={selectedStatus === 'ready' ? '#ffffff' : '#10B981'}
                />
              </View>
              <Text
                className={`font-bold text-lg ${
                  selectedStatus === 'ready' ? 'text-success' : 'text-textPrimary'
                }`}
              >
                Ready
              </Text>
              <Text className="text-textSecondary text-xs text-center mt-1">
                Bike is safe for deliveries
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSelectStatus('not_ready')}
            activeOpacity={0.7}
            className="flex-1"
          >
            <Card
              className={`items-center py-6 ${
                selectedStatus === 'not_ready'
                  ? 'border-2 border-error bg-error/5'
                  : ''
              }`}
            >
              <View
                className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${
                  selectedStatus === 'not_ready' ? 'bg-error' : 'bg-error/20'
                }`}
              >
                <Ionicons
                  name="close-circle"
                  size={32}
                  color={selectedStatus === 'not_ready' ? '#ffffff' : '#EF4444'}
                />
              </View>
              <Text
                className={`font-bold text-lg ${
                  selectedStatus === 'not_ready' ? 'text-error' : 'text-textPrimary'
                }`}
              >
                Not Ready
              </Text>
              <Text className="text-textSecondary text-xs text-center mt-1">
                Bike needs maintenance
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Problems Checklist - Only show when "Not Ready" is selected */}
        {selectedStatus === 'not_ready' && (
          <>
            {/* Problems Card - No internal scroll, flows naturally */}
            <Card className="mb-4">
              <Text className="text-textPrimary font-bold text-lg mb-2">
                What's the problem?
              </Text>
              <Text className="text-textSecondary text-sm mb-3">
                Select all issues with your bike
              </Text>

              {/* Problems List - No ScrollView, just flows */}
              <View>
                {PROBLEM_ITEMS.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleToggleProblem(item.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      className={`flex-row items-center py-3 ${
                        index < PROBLEM_ITEMS.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <View
                        className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 ${
                          selectedProblems.includes(item.id)
                            ? 'bg-error border-error'
                            : 'border-border'
                        }`}
                      >
                        {selectedProblems.includes(item.id) && (
                          <Ionicons name="close" size={16} color="#ffffff" />
                        )}
                      </View>

                      <View className="w-8 h-8 rounded-full bg-error/10 items-center justify-center mr-3">
                        <Ionicons name={item.icon as any} size={18} color="#EF4444" />
                      </View>

                      <Text className="text-textPrimary flex-1">{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Warning Box - Separate from problems area */}
            <View className="bg-error/10 border border-error rounded-2xl p-4 mb-4">
              <View className="flex-row items-start">
                <Ionicons name="warning" size={20} color="#EF4444" />
                <View className="ml-2 flex-1">
                  <Text className="text-error font-semibold text-base mb-1">
                    Required Selection
                  </Text>
                  <Text className="text-error text-sm">
                    You must select at least one issue. Your status will be set to OFFLINE
                    and you won't receive orders until you're ready.
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Info Box for Ready status */}
        {selectedStatus === 'ready' && (
          <View className="bg-success/10 border border-success rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="text-success text-sm ml-2 flex-1">
                Your bike is ready! You'll be set to ONLINE and can receive new orders.
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button - At bottom of scrollable content */}
        <View className="pt-6">
          <Button
            title={selectedStatus === 'ready' ? 'Go Online' : 'Save & Go Offline'}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!selectedStatus}
            size="lg"
            variant={selectedStatus === 'not_ready' ? 'outline' : 'primary'}
            className={
              selectedStatus === 'not_ready'
                ? 'border-2 border-error bg-error/10'
                : ''
            }
            icon={
              selectedStatus === 'not_ready' ? (
                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              ) : (
                <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
              )
            }
          />
        </View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        message="Bike status updated successfully!"
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
