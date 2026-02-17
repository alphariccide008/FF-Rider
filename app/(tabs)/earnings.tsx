import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useDeliveryStore } from '../../stores/deliveryStore';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

type Period = 'today' | 'week' | 'month';

export default function EarningsScreen() {
  const { stats, isLoading } = useDeliveryStore();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for demonstration - in real app, fetch from API
  const earningsData = {
    today: {
      total: stats?.totalEarnings || 0,
      deliveries: stats?.completedToday || 0,
      avgPerDelivery: stats?.completedToday ? (stats.totalEarnings || 0) / stats.completedToday : 0,
    },
    week: {
      total: (stats?.totalEarnings || 0) * 5,
      deliveries: (stats?.completedToday || 0) * 5,
      avgPerDelivery: stats?.completedToday ? (stats.totalEarnings || 0) / stats.completedToday : 0,
    },
    month: {
      total: (stats?.totalEarnings || 0) * 22,
      deliveries: (stats?.completedToday || 0) * 22,
      avgPerDelivery: stats?.completedToday ? (stats.totalEarnings || 0) / stats.completedToday : 0,
    },
  };

  const currentData = earningsData[selectedPeriod];

  // Mock recent earnings for list
  const recentEarnings = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      date: new Date(),
      amount: 1500,
      deliveryFee: 500,
      tip: 0,
      status: 'paid',
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      date: new Date(Date.now() - 86400000),
      amount: 2000,
      deliveryFee: 500,
      tip: 200,
      status: 'paid',
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      date: new Date(Date.now() - 172800000),
      amount: 1500,
      deliveryFee: 500,
      tip: 0,
      status: 'pending',
    },
  ];

  async function handleRefresh() {
    setIsRefreshing(true);
    // TODO: Fetch latest earnings data
    setTimeout(() => setIsRefreshing(false), 1000);
  }

  function renderPeriodButton(period: Period, label: string) {
    const isSelected = selectedPeriod === period;
    return (
      <TouchableOpacity
        onPress={() => setSelectedPeriod(period)}
        className={`flex-1 py-2 px-4 rounded-full ${
          isSelected ? 'bg-primary' : 'bg-surface border border-border'
        }`}
      >
        <Text
          className={`text-center font-semibold text-sm ${
            isSelected ? 'text-white' : 'text-textSecondary'
          }`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading earnings..." />;
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header with gradient */}
      <View className="bg-primary px-4 pt-12 pb-6">
        <Text className="text-white text-2xl font-bold mb-2">Earnings</Text>
        <Text className="text-white/80 text-sm">Track your income and payouts</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#1B9B8E" />
        }
      >
        {/* Period Selector */}
        <View className="flex-row gap-2 mb-4">
          {renderPeriodButton('today', 'Today')}
          {renderPeriodButton('week', 'This Week')}
          {renderPeriodButton('month', 'This Month')}
        </View>

        {/* Total Earnings Card */}
        <Card className="mb-4 bg-gradient-to-br from-primary to-primaryDark">
          <View className="items-center py-6">
            <Text className="text-white/80 text-sm mb-2">Total Earnings</Text>
            <Text className="text-white text-4xl font-bold mb-4">
              {formatCurrency(currentData.total)}
            </Text>
            <View className="flex-row items-center gap-4">
              <View className="items-center">
                <Text className="text-white/60 text-xs">Deliveries</Text>
                <Text className="text-white font-semibold text-lg">{currentData.deliveries}</Text>
              </View>
              <View className="w-px h-8 bg-white/20" />
              <View className="items-center">
                <Text className="text-white/60 text-xs">Avg/Delivery</Text>
                <Text className="text-white font-semibold text-lg">
                  {formatCurrency(currentData.avgPerDelivery)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Earnings Breakdown */}
        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-success/10 items-center justify-center mr-2">
                <Ionicons name="wallet-outline" size={16} color="#10B981" />
              </View>
              <Text className="text-textSecondary text-xs">Available</Text>
            </View>
            <Text className="text-textPrimary text-xl font-bold">
              {formatCurrency(currentData.total * 0.8)}
            </Text>
          </Card>

          <Card className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-warning/10 items-center justify-center mr-2">
                <Ionicons name="time-outline" size={16} color="#F59E0B" />
              </View>
              <Text className="text-textSecondary text-xs">Pending</Text>
            </View>
            <Text className="text-textPrimary text-xl font-bold">
              {formatCurrency(currentData.total * 0.2)}
            </Text>
          </Card>
        </View>

        {/* Quick Stats */}
        <Card className="mb-4">
          <Text className="text-textPrimary font-bold mb-3">Performance</Text>
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons name="trending-up" size={20} color="#10B981" />
                <Text className="text-textSecondary text-sm ml-2">Completion Rate</Text>
              </View>
              <Text className="text-textPrimary font-bold">98%</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text className="text-textSecondary text-sm ml-2">Average Rating</Text>
              </View>
              <Text className="text-textPrimary font-bold">{stats?.rating || 4.8}</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons name="flash" size={20} color="#3B82F6" />
                <Text className="text-textSecondary text-sm ml-2">Avg Delivery Time</Text>
              </View>
              <Text className="text-textPrimary font-bold">25 min</Text>
            </View>
          </View>
        </Card>

        {/* Recent Earnings */}
        <View className="mb-6">
          <Text className="text-textPrimary text-lg font-bold mb-3">Recent Earnings</Text>

          {recentEarnings.length === 0 ? (
            <Card>
              <View className="items-center py-8">
                <Ionicons name="wallet-outline" size={48} color="#9CA3AF" />
                <Text className="text-textSecondary text-center mt-4">
                  No earnings yet
                </Text>
                <Text className="text-textMuted text-center text-sm mt-1">
                  Complete deliveries to start earning
                </Text>
              </View>
            </Card>
          ) : (
            recentEarnings.map((earning) => (
              <Card key={earning.id} className="mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-textPrimary font-semibold">
                      {earning.orderNumber}
                    </Text>
                    <Text className="text-textSecondary text-xs">
                      {formatDate(earning.date)} • {formatTime(earning.date)}
                    </Text>
                  </View>
                  <View
                    className={`px-2 py-1 rounded-full ${
                      earning.status === 'paid' ? 'bg-success/20' : 'bg-warning/20'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        earning.status === 'paid' ? 'text-success' : 'text-warning'
                      }`}
                    >
                      {earning.status === 'paid' ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-2 border-t border-border">
                  <View className="flex-row items-center gap-3">
                    <View>
                      <Text className="text-textMuted text-xs">Delivery Fee</Text>
                      <Text className="text-textSecondary text-sm font-medium">
                        {formatCurrency(earning.deliveryFee)}
                      </Text>
                    </View>
                    {earning.tip > 0 && (
                      <View>
                        <Text className="text-textMuted text-xs">Tip</Text>
                        <Text className="text-success text-sm font-medium">
                          +{formatCurrency(earning.tip)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-textPrimary text-lg font-bold">
                    {formatCurrency(earning.amount)}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Payout Info */}
        <Card className="mb-6 bg-info/10 border border-info/20">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className="text-textPrimary font-semibold mb-1">
                Payout Information
              </Text>
              <Text className="text-textSecondary text-sm">
                Earnings are paid out weekly on Fridays. Minimum payout amount is ₦5,000.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
