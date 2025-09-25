"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { bomboData, formatNumber } from "@/lib/data";
import { Users, TrendingUp, Activity, Zap } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black p-3 rounded-lg border border-gray-800">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-300">
            {entry.name}: {formatNumber(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function GrowthMetrics() {
  // User growth data
  const userGrowthData = bomboData.userGrowth.map(item => ({
    ...item,
    newUsers: item.users - (bomboData.userGrowth[bomboData.userGrowth.indexOf(item) - 1]?.users || 0)
  }));

  // Key growth metrics
  const growthStats = [
    {
      label: "Total Users",
      value: bomboData.metrics.totalUsers,
      trend: "+65% YoY",
      icon: Users,
      suffix: ""
    },
    {
      label: "Daily Growth Rate",
      value: bomboData.metrics.dailyGrowth2025,
      trend: "+37% vs 2024",
      icon: TrendingUp,
      suffix: " users/day"
    },
    {
      label: "Total Purchasers",
      value: bomboData.metrics.totalPurchasers,
      trend: "28% conversion",
      icon: Activity,
      suffix: ""
    },
    {
      label: "Tickets Sold",
      value: bomboData.metrics.ticketsSold,
      trend: "+180% YoY",
      icon: Zap,
      suffix: ""
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Growth Metrics
          </h2>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto mb-8">
            The most compelling proof of product-market fit:
            <span className="text-white font-bold"> zero paid marketing</span> yet
            <span className="text-white font-bold"> 1,302 new users daily</span>
          </p>

          {/* Growth Story */}
          <div className="max-w-6xl mx-auto p-6 bg-gray-900/30 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-6">The Zero-CAC Growth Story</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  Pure Organic Growth
                </h4>
                <p className="text-gray-300 mb-3">
                  <span className="text-white font-bold">$0.28 CAC</span> vs industry average of
                  <span className="text-gray-500"> $70+</span> - we achieve 250x better customer acquisition cost.
                </p>
                <p className="text-gray-400 text-sm">
                  Every user comes through word-of-mouth, social sharing, or organic discovery.
                  No paid ads, no influencer marketing, no acquisition campaigns.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <Activity className="w-4 h-4 text-gray-400 mr-2" />
                  Network Effects in Action
                </h4>
                <div className="mb-3 p-2 bg-gray-800/50 rounded border border-gray-700">
                  <p className="text-xs text-gray-400 font-semibold">
                    IMPORTANT: We have NOT implemented News Feed Home Section and recommendation algorithm YET
                  </p>
                </div>
                <p className="text-gray-300 mb-3">
                  Our user-driven social features create viral loops without algorithmic manipulation.
                  <span className="text-white font-bold"> 1,500 daily messages</span> prove authentic engagement.
                </p>
                <p className="text-gray-400 text-sm">
                  When friends attend events together through BOMBO, they become advocates.
                  Trust breeds trust - the NFT security creates unmatched reliability.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                  Scalable Growth Model
                </h4>
                <p className="text-gray-300 mb-3">
                  This growth model scales perfectly to new markets.
                  <span className="text-white font-bold"> 80% of electronic events</span> in Argentina proves the playbook works.
                </p>
                <p className="text-gray-400 text-sm">
                  Zero CAC means every dollar of revenue expansion drops directly to the bottom line.
                  The growth machine pays for itself.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Growth Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {growthStats.map((stat, index) => (
            <Card key={stat.label} className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-6 h-6 text-gray-400" />
                <Badge className="bg-gray-800 text-gray-300 border-gray-700 text-xs">
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}{stat.suffix}
              </p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </Card>
          ))}
        </motion.div>

        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-6">User Acquisition Timeline</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="period" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => formatNumber(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#ffffff"
                  fillOpacity={1}
                  fill="url(#userGradient)"
                  strokeWidth={2}
                  name="Total Users"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-xl font-bold text-white">{formatNumber(bomboData.metrics.totalUsers)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">2025 New Users</p>
                <p className="text-xl font-bold text-white">{formatNumber(bomboData.metrics.newUsers2025)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Growth Rate</p>
                <p className="text-xl font-bold text-white">+65% YoY</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Platform Usage Metrics - Simplified */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High-Volume Metrics */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Platform Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { metric: "News Users", value: bomboData.engagement.newsUsers },
                  { metric: "Event Views", value: bomboData.engagement.eventViews },
                  { metric: "Event Users", value: bomboData.engagement.uniqueEventUsers },
                  { metric: "Push Users", value: bomboData.engagement.pushNotificationUsers }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="metric" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => formatNumber(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#ffffff"
                    radius={[8, 8, 0, 0]}
                    style={{ filter: 'none' }}
                  />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-4">
                All metrics measured over 11-month period (Sep 2024 - Aug 2025)
              </p>
            </Card>
          </motion.div>

          {/* Social Engagement Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Daily Social Engagement</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { metric: "Messages", value: bomboData.engagement.dailyMessages },
                  { metric: "Comments", value: bomboData.engagement.dailyComments },
                  { metric: "Avg per User", value: bomboData.engagement.avgInteractionsPerUser },
                  { metric: "Chat Duration (min)", value: bomboData.engagement.avgChatDuration }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="metric" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#9ca3af"
                    radius={[8, 8, 0, 0]}
                    style={{ filter: 'none' }}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Messages per Chat</p>
                  <p className="text-lg font-bold text-white">{bomboData.engagement.messagesPerChat}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Interactions per User</p>
                  <p className="text-lg font-bold text-white">{bomboData.engagement.avgInteractionsPerUser}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}