"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bomboData } from "@/lib/data";
import { Users, UserCheck, Repeat, TrendingUp, MessageSquare } from "lucide-react";

// Retention cohort data - use from data model
const buyerCohorts = bomboData.retentionCohorts?.buyers || [];
const nonBuyerCohorts = bomboData.retentionCohorts?.nonBuyers || [];

// Color scale for heatmap - pure black/white theme
const getHeatmapColor = (value: number) => {
  if (value >= 80) return "bg-white text-black";
  if (value >= 60) return "bg-gray-300 text-black";
  if (value >= 40) return "bg-gray-400 text-black";
  if (value >= 30) return "bg-gray-500 text-white";
  if (value >= 20) return "bg-gray-600 text-white";
  if (value >= 10) return "bg-gray-700 text-white";
  if (value >= 5) return "bg-gray-800 text-white";
  if (value >= 2) return "bg-gray-900 text-white";
  return "bg-black text-gray-600";
};

const RetentionHeatmap = ({ data, title }: { data: any[], title: string }) => {
  const months = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'];

  return (
    <div>
      <h4 className="text-lg font-semibold text-white mb-4">{title}</h4>
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[600px] md:min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-14 gap-0.5 md:gap-1 mb-2">
            <div className="text-xs text-gray-400 px-1 md:px-2">Cohort</div>
            {months.map(month => (
              <div key={month} className="text-xs text-gray-400 text-center">{month}</div>
            ))}
          </div>

          {/* Heatmap */}
          {data.map((cohort) => (
            <div key={cohort.month} className="grid grid-cols-14 gap-0.5 md:gap-1 mb-1">
              <div className="text-[10px] md:text-xs text-gray-300 px-1 md:px-2 py-1 md:py-2 bg-gray-900 rounded">{cohort.month}</div>
              {months.map((month, index) => {
                const key = `m${index}`;
                const value = cohort[key];
                if (value === undefined) {
                  return <div key={month} className="bg-gray-900/50 rounded" />;
                }
                return (
                  <div
                    key={month}
                    className={`${getHeatmapColor(value)} text-[10px] md:text-xs font-semibold rounded flex items-center justify-center py-1 md:py-2 relative group cursor-pointer transition-all hover:scale-105`}
                  >
                    <span className="hidden sm:inline">{value}%</span>
                    <span className="sm:hidden">{value}</span>
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-black text-white text-xs px-2 py-1 rounded border border-gray-800">
                        {cohort.month} → {month}: {value}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 flex-wrap">
        <span className="text-xs text-gray-400">Retention %:</span>
        {[
          { label: "80%+", color: "bg-white" },
          { label: "40-79%", color: "bg-gray-300" },
          { label: "20-39%", color: "bg-gray-500" },
          { label: "5-19%", color: "bg-gray-700" },
          { label: "<5%", color: "bg-gray-900" }
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-3 h-3 ${item.color} rounded`} />
            <span className="text-xs text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function RetentionAnalysis() {
  const retentionStats = [
    {
      label: "Buyer Retention",
      value30: bomboData.metrics.buyerRetention,
      value90: 22,
      icon: UserCheck,
      trend: "3.7x industry avg",
      color: "text-gray-400"
    },
    {
      label: "Non-Buyer Retention",
      value30: bomboData.metrics.nonBuyerRetention,
      value90: 1,
      icon: Users,
      trend: "Typical pattern",
      color: "text-gray-400"
    },
    {
      label: "Repeat Purchase Rate",
      value30: 78,
      value90: 65,
      icon: Repeat,
      trend: "+250% vs industry",
      color: "text-gray-400"
    },
    {
      label: "Activation Rate",
      value30: 68,
      value90: 45,
      icon: TrendingUp,
      trend: "Best in class",
      color: "text-gray-400"
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
            Retention Analysis
          </h2>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto mb-6">
            BOMBO's retention metrics reveal our strongest competitive advantage:
            buyers stay active at 3.7x the industry rate, proving exceptional product-market fit
          </p>

          {/* Key Retention Story */}
          <div className="max-w-5xl mx-auto p-6 bg-gray-900/30 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">The Retention Story That Defines Our Success</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <p className="text-gray-300 mb-3">
                  <span className="text-white font-semibold">47% buyer retention</span> at 30 days vs.
                  <span className="text-gray-500"> 14% non-buyer retention</span> - this gap is the heart of our business model.
                </p>
                <p className="text-gray-300">
                  Once users experience the trust and community of NFT-secured ticketing,
                  they become loyal advocates who drive organic growth through word-of-mouth.
                </p>
              </div>
              <div>
                <p className="text-gray-300 mb-3">
                  Industry average for ticketing platforms is <span className="text-gray-500">12-15% retention</span>.
                  Our <span className="text-white font-semibold">47% buyer retention</span> represents a <span className="text-white">3.7x advantage</span>.
                </p>
                <p className="text-gray-300">
                  This isn't just a metric - it's proof that we've solved the fundamental trust problem
                  that plagued electronic music ticketing in Latin America.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Retention Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          {retentionStats.map((stat, index) => (
            <Card key={stat.label} className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <Badge className="bg-gray-800 text-gray-300 border-gray-700 text-xs">
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
              <div className="space-y-2">
                <div>
                  <span className="text-2xl font-bold text-white">{stat.value30}%</span>
                  <span className="text-xs text-gray-500 ml-2">30-day</span>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-300">{stat.value90}%</span>
                  <span className="text-xs text-gray-500 ml-2">90-day</span>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Cohort Retention Heatmaps - Both Visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Buyer Cohorts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
              <Card className="bg-gray-900/50 border-gray-800 p-6">
                <RetentionHeatmap
                  data={buyerCohorts}
                  title="Buyer Retention Cohorts (Sep 2024 - Aug 2025)"
                />
                <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <p className="text-sm text-white font-semibold mb-2">Key Insights:</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 47-52% of buyers remain active after 30 days (industry avg: 12-15%)</li>
                    <li>• 22-28% retention at 12 months demonstrates strong long-term engagement</li>
                    <li>• Consistent retention across all cohorts indicates product-market fit</li>
                    <li>• Minimal seasonal variation shows year-round appeal</li>
                  </ul>
                </div>
              </Card>
          </motion.div>

          {/* Non-Buyer Cohorts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
              <Card className="bg-gray-900/50 border-gray-800 p-6">
                <RetentionHeatmap
                  data={nonBuyerCohorts}
                  title="Non-Buyer Retention Cohorts (Sep 2024 - Aug 2025)"
                />
                <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <p className="text-sm text-white font-semibold mb-2">Key Insights:</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 12-17% retention at 30 days aligns with industry benchmarks</li>
                    <li>• Clear opportunity to convert browsers to buyers</li>
                    <li>• Engagement drops significantly after first month</li>
                    <li>• Focus on activation strategies can improve conversion</li>
                  </ul>
                </div>
              </Card>
          </motion.div>
        </div>

        {/* Social Engagement Clarification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 mb-8"
        >
          <Card className="bg-gray-900/50 border-gray-800 p-8">
            <h3 className="text-xl font-bold text-white mb-6">Understanding Our Social Engagement Model</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-white font-semibold mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 text-gray-400 mr-2" />
                  What We DON'T Have: News Feed
                </h4>
                <p className="text-gray-300 mb-4">
                  Unlike social media platforms, BOMBO deliberately <span className="text-white font-semibold">does NOT have a news feed</span>.
                  We don't create addictive scrolling experiences or algorithmic content streams.
                </p>
                <p className="text-gray-400 text-sm">
                  This is intentional - we focus on meaningful interactions around actual events,
                  not manufactured social media engagement.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4 flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-2" />
                  What We DO Have: User-Driven Social Features
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Daily Messages (P2P)</span>
                    <span className="text-white font-semibold">{bomboData.engagement.dailyMessages.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Daily Comments (Events)</span>
                    <span className="text-white font-semibold">{bomboData.engagement.dailyComments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Avg Chat Duration</span>
                    <span className="text-white font-semibold">{bomboData.engagement.avgChatDuration} min</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-4">
                  All social interactions are <span className="text-white">user-initiated</span> around real events.
                  People use these features by choice, creating authentic community bonds.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Retention Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="bg-gray-900/50 border-gray-800 p-8">
            <h3 className="text-xl font-bold text-white mb-6">Why BOMBO's Retention is Exceptional</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-white font-semibold">Authentic Community</h4>
                </div>
                <p className="text-sm text-gray-400">
                  User-driven social features (no algorithmic feeds) create genuine connections around shared musical experiences
                </p>
              </div>

              <div>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                    <UserCheck className="w-5 h-5 text-gray-400" />
                  </div>
                  <h4 className="text-white font-semibold">Zero Fraud Trust</h4>
                </div>
                <p className="text-sm text-gray-400">
                  NFT ticketing eliminates 100% of fraud, creating unprecedented trust that translates to loyalty
                </p>
              </div>

              <div>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                    <Repeat className="w-5 h-5 text-gray-400" />
                  </div>
                  <h4 className="text-white font-semibold">Premium Experience</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Exclusive events and curated content create value that keeps users coming back
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}