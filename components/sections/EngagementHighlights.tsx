"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { bomboData, formatNumber } from "@/lib/data";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black p-3 rounded-lg border border-gray-800">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-300">
            {entry.name}: {typeof entry.value === 'number'
              ? entry.value.toLocaleString()
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function EngagementHighlights() {
  const { engagementMetrics } = bomboData;

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        {/* Bombo Metrics Overview Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Bombo Metrics Overview</h2>

          <div className="mb-6">
            <p className="text-lg text-white font-semibold mb-4">Active Users = 1 log in a day</p>
            <Card className="bg-gray-900/30 border-gray-800 p-6">
              <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-gray-300">Disclaimer:</strong> All metrics presented reflect organic user behavior and user acquisition without paid advertising within Bombo. It's important to note that Bombo's growth and retention are reinforced by our organic social media strategy, where we consistently redirect our social media presence and content creation efforts to drive users into the app ecosystem through community engagement.
              </p>
            </Card>
          </div>
        </motion.div>

        {/* Highlights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Highlights</h3>
          <Card className="bg-gray-900/30 border-gray-800 p-8">
            <p className="text-gray-300 leading-relaxed mb-6">
              This metrics update reveals exceptional performance in 2025, where Bombo not only sustained but substantially exceeded previous benchmarks. We've achieved peak milestones of <span className="text-white font-bold">90k+ DAU</span> and <span className="text-white font-bold">219k+ MAU</span>, representing significant growth acceleration. The August 2024 to August 2025 analysis shows retention metrics have strengthened, with <span className="text-white font-bold">60%</span> of users returning month-over-month and maintaining this pattern for four-plus months. These improvements demonstrate that our product enhancements and community features are delivering increasing value to users.
            </p>

            <div className="border-t border-gray-700 pt-6 mb-6">
              <p className="text-gray-300 mb-4">When segmenting between buyers and non-buyers, retention in 2025 shows remarkable improvement:</p>
              <ul className="space-y-2 ml-6">
                <li className="text-gray-300">• <span className="text-white font-semibold">Buyers:</span> 80% retention the following month (up from 75%)</li>
                <li className="text-gray-300">• <span className="text-white font-semibold">Non-buyers:</span> 50% retention the following month (up from 45%)</li>
              </ul>
            </div>

            <div className="border-t border-gray-700 pt-6 mb-6">
              <p className="text-gray-300 mb-4">But cohort analysis only tells part of the story. Another critical metric is cumulative return rate - how many users return at least once after their first use:</p>
              <p className="text-white font-bold text-lg mb-4">78% of all users return at least once within the first 30 days (up from 72%)</p>
              <p className="text-gray-300 mb-4">Breaking this down by segment reveals even stronger performance:</p>
              <ul className="space-y-2 ml-6">
                <li className="text-gray-300">• <span className="text-white font-semibold">Buyers:</span> 98% return within 5 months, and 90% do so within the first 30 days</li>
                <li className="text-gray-300">• <span className="text-white font-semibold">Non-buyers:</span> 78% return, and 65% come back within the first 30 days</li>
              </ul>
            </div>

            <p className="text-gray-400 text-sm">
              This cumulative retention metric differs from monthly cohort analysis as it measures whether users return at least once since registration, rather than specific monthly intervals. The improvement in these metrics during 2025 confirms that our product enhancements and community features are delivering increasing value to all user segments, even those who haven't yet made a purchase.
            </p>
          </Card>
        </motion.div>

        {/* User Interaction Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-8">User Interaction</h3>

          {/* Daily Active Users */}
          <div className="mb-12">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h4 className="text-xl font-bold text-white mb-2">Daily Active Users</h4>
              <p className="text-sm text-gray-400 mb-6">September 2024 - August 2025</p>

              {/* DAU Time Series Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementMetrics.dailyActiveUsers.timeSeries} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      tick={{ fontSize: 10 }}
                      interval={20}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                      domain={[0, 100000]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#9ca3af"
                      strokeWidth={1}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">25k</p>
                  <p className="text-gray-400">Median DAU</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">30k</p>
                  <p className="text-gray-400">Mean DAU</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">95k</p>
                  <p className="text-gray-400">Peak DAU</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Monthly Active Users */}
          <div className="mb-12">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h4 className="text-xl font-bold text-white mb-6">Monthly Active Users</h4>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementMetrics.monthlyActiveUsers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis
                      stroke="#9ca3af"
                      tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">219k</p>
                  <p className="text-gray-400">Peak MAU</p>
                  <p className="text-xs text-gray-500">January 2025</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">202k</p>
                  <p className="text-gray-400">Average MAU</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">182k</p>
                  <p className="text-gray-400">Median MAU</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* User Retention per Cohort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-6">User retention per cohort - Buyers vs Non-Buyers (Users)</h3>

          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart on left */}
              <div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="days"
                        stroke="#9ca3af"
                        domain={[0, 168]}
                        ticks={[0, 30, 60, 90, 120, 150, 168]}
                        label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        label={{ value: 'Cumulative %', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        data={engagementMetrics.cumulativeRetention.buyers}
                        type="monotone"
                        dataKey="retention"
                        stroke="#ffffff"
                        strokeWidth={2}
                        name="Buyer"
                        dot={false}
                      />
                      <Line
                        data={engagementMetrics.cumulativeRetention.nonBuyers}
                        type="monotone"
                        dataKey="retention"
                        stroke="#6b7280"
                        strokeWidth={2}
                        name="User"
                        dot={false}
                      />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                  <div className="bg-gray-800/50 px-3 py-1.5 rounded">
                    <span className="text-gray-400">buyer_retention: </span>
                    <span className="text-white font-mono">85.92</span>
                  </div>
                  <div className="bg-gray-800/50 px-3 py-1.5 rounded">
                    <span className="text-gray-400">user_retention: </span>
                    <span className="text-white font-mono">60.87</span>
                  </div>
                </div>
              </div>

              {/* Text content on right */}
              <div className="flex flex-col justify-center">
                <p className="text-gray-300 mb-4">We distinguish between two segments:</p>
                <div className="space-y-4">
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <p className="text-white font-semibold text-lg mb-2">Buyers</p>
                    <p className="text-3xl font-bold text-white mb-1">96%</p>
                    <p className="text-gray-400">eventually return</p>
                    <p className="text-sm text-gray-500 mt-2">85.92% re-engage within first 30 days</p>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <p className="text-white font-semibold text-lg mb-2">Non-buyers</p>
                    <p className="text-3xl font-bold text-white mb-1">74%</p>
                    <p className="text-gray-400">eventually return</p>
                    <p className="text-sm text-gray-500 mt-2">60.87% re-engage within first 30 days</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-4">
                  This highlights that transactional (buyers) users are far more likely to come back quickly, reinforcing the importance of driving ticket conversions.
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mt-6 text-center border-t border-gray-700 pt-4">
              Buyers are users who have purchased at least one ticket while non-buyers are users who have never purchased a ticket.
            </p>
          </Card>
        </motion.div>

        {/* Average Session Duration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-2">Average Session Duration</h3>
          <p className="text-gray-400 mb-6">How Long Users Stay for News, Tickets & Community</p>

          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h4 className="text-lg font-bold text-white mb-6">Monthly Evolution: April 2024 - August 2025</h4>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementMetrics.sessionDurationMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    domain={[8, 14]}
                    tickFormatter={(value) => `${value}`}
                    label={{ value: 'Duration (minutes)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="duration"
                    stroke="#9ca3af"
                    fill="#9ca3af"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              <div className="text-center bg-gray-800/50 p-4 rounded">
                <p className="text-2xl font-bold text-white">8.8m</p>
                <p className="text-gray-400 text-sm">Apr 2024</p>
              </div>
              <div className="text-center bg-gray-800/50 p-4 rounded">
                <p className="text-2xl font-bold text-white">13.2m</p>
                <p className="text-gray-400 text-sm">Peak</p>
              </div>
              <div className="text-center bg-gray-800/50 p-4 rounded">
                <p className="text-2xl font-bold text-white">12.4m</p>
                <p className="text-gray-400 text-sm">Aug 2025</p>
              </div>
              <div className="text-center bg-gray-800/50 p-4 rounded">
                <p className="text-2xl font-bold text-white">+68%</p>
                <p className="text-gray-400 text-sm">Growth</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Frequency of Visits: Stickiness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Frequency of Visits: Stickiness</h3>

          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <p className="text-gray-300 mb-6">
              We track how often users return in a typical week, typically from 1 to 7 visits. This highlights <span className="font-semibold text-white">habit formation</span>: the more frequently users open Bombo, the deeper their engagement and the higher their likelihood to convert into loyal buyers. Stickiness is a leading indicator of <span className="font-semibold text-white">long-term retention and monetization potential</span>.
            </p>

            <div className="border-2 border-gray-600/50 rounded-lg p-6">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementMetrics.stickiness}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="days"
                      stroke="#9ca3af"
                      label={{ value: 'Days Active', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      domain={[0, 60]}
                      tickFormatter={(value) => `${value}%`}
                      label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="percentage" fill="#9ca3af">
                      {engagementMetrics.stickiness.map((entry, index) => (
                        <Bar key={`cell-${index}`} fill="#9ca3af" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Add percentage labels on bars */}
              <div className="flex justify-around mt-4">
                {engagementMetrics.stickiness.map((item) => (
                  <div key={item.days} className="text-center">
                    <p className="text-white font-bold">{item.percentage}%</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Content Creation & Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Content Creation & Social Media</h3>

          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <p className="text-gray-300 mb-8">
              These content-driven metrics reflect early traction in social features. Engagement levels are expected to scale further as additional social functionalities are introduced (e.g., feed, tagging, notifications). Current adoption has been achieved without recommendation algorithms or aggressive engagement mechanics.
            </p>

            <div className="space-y-8">
              {/* Pictures & Comments */}
              <div>
                <h4 className="text-lg font-bold text-white mb-6">Pictures & Comments</h4>
                <p className="text-gray-400 mb-6">
                  Metrics presented here capture organic behavior without paid promotion, gamification, or viral loops. This validates strong user interest in creating and interacting with content authentically.
                </p>

                {/* Messages */}
                <div className="bg-gray-800/30 rounded-lg p-6 mb-6">
                  <h5 className="text-white font-semibold mb-4">Amount of messages sent through chat</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-900/50 p-4 rounded">
                      <p className="text-2xl font-bold text-white">1.5k</p>
                      <p className="text-gray-400">daily messages in whole [avg]</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded">
                      <p className="text-2xl font-bold text-white">2.41</p>
                      <p className="text-gray-400">messages per chat</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded">
                      <p className="text-2xl font-bold text-white">5.19</p>
                      <p className="text-gray-400">minutes average time</p>
                    </div>
                  </div>
                </div>

                {/* Comments Distribution */}
                <div className="bg-gray-800/30 rounded-lg p-6">
                  <h5 className="text-white font-semibold mb-4">Amount of comments (January to today)</h5>
                  <p className="text-gray-400 mb-4">Average: 310 comments per day</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart on left - narrower */}
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { category: 'Events', value: 113000 },
                          { category: 'Bios', value: 9600 },
                          { category: 'Videos', value: 14100 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="category" stroke="#9ca3af" />
                          <YAxis
                            stroke="#9ca3af"
                            tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" fill="#9ca3af" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Stats on right */}
                    <div className="flex flex-col justify-center space-y-3">
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-3xl font-bold text-white">113k</p>
                        <p className="text-sm text-gray-400">Comments on events</p>
                        <p className="text-xs text-gray-500 mt-1">82.5% of total</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-3xl font-bold text-white">9.6k</p>
                        <p className="text-sm text-gray-400">Comments on bios</p>
                        <p className="text-xs text-gray-500 mt-1">7.0% of total</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-3xl font-bold text-white">14.1k</p>
                        <p className="text-sm text-gray-400">Comments on videos</p>
                        <p className="text-xs text-gray-500 mt-1">10.3% of total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* News Feed & Push Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* News Feed */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h4 className="text-lg font-bold text-white mb-4">Access to News Feed</h4>
              <div className="bg-gray-800/30 rounded-lg p-6">
                <p className="text-3xl font-bold text-white mb-2">947K</p>
                <p className="text-gray-300">Total users entered News Section</p>
                <p className="text-sm text-gray-500 mt-2">Over the last 11 months</p>
              </div>
            </Card>

            {/* Push Notifications */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h4 className="text-lg font-bold text-white mb-4">Push Notifications</h4>
              <p className="text-sm text-gray-400 mb-4">
                Push notification engagement is a leading indicator of re-engagement potential. The current baseline is achieved with a lightweight notification strategy.
              </p>
              <div className="space-y-4">
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <p className="text-2xl font-bold text-white">975k</p>
                  <p className="text-gray-300">people accessed notifications</p>
                  <p className="text-xs text-gray-500">Sept 2024 - Aug 2025</p>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <p className="text-2xl font-bold text-white">0.54 minutes</p>
                  <p className="text-gray-300">Average time spent</p>
                  <p className="text-xs text-gray-500">(32.5 seconds)</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Evolution of Access to Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h4 className="text-xl font-bold text-white mb-6">Evolution of access to events</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/30 rounded-lg p-6 text-center">
                <p className="text-3xl font-bold text-white">12.9M</p>
                <p className="text-gray-300">total event views/entries</p>
                <p className="text-sm text-gray-500">in 11 months</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-6 text-center">
                <p className="text-3xl font-bold text-white">174k</p>
                <p className="text-gray-300">unique users</p>
                <p className="text-sm text-gray-500">Activity was registered from 174k unique users within the events section</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-6 text-center">
                <p className="text-3xl font-bold text-white">74</p>
                <p className="text-gray-300">interactions per user</p>
                <p className="text-sm text-gray-500">showing high engagement</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Growth Drivers & Context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Future Product Roadmap</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">•</span>
                <span className="text-gray-300">News feed implementation scheduled for Q1 2026, which will fundamentally transform user engagement patterns on the platform.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 mt-1">•</span>
                <span className="text-gray-300">Expected <span className="text-white font-bold">50x+ increase in user interactions</span> within the first 6 months post-implementation, based on industry benchmarks and user behavior analysis.</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}