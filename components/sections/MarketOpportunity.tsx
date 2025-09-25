"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { bomboData } from "@/lib/data";
import { Globe, MapPin, TrendingUp, Zap, Target, Rocket } from "lucide-react";

const COLORS = ['#ffffff', '#d1d5db', '#9ca3af', '#6b7280', '#374151', '#1f2937'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black p-3 rounded-lg border border-gray-800">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-300">
            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000000
              ? `$${(entry.value / 1000000).toFixed(1)}M`
              : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function MarketOpportunity() {
  // Market data - CORRECTED TAM VALUES
  const marketSizeData = [
    { region: "Argentina", current: 70000000, potential: 180000000, penetration: 80 }, // Max 180M
    { region: "Brazil", current: 0, potential: 800000000, penetration: 0 },
    { region: "Mexico", current: 0, potential: 400000000, penetration: 0 },
    { region: "Colombia", current: 0, potential: 200000000, penetration: 0 },
    { region: "Chile", current: 0, potential: 135000000, penetration: 0 }, // -10%
    { region: "Peru", current: 0, potential: 90000000, penetration: 0 } // -10%
  ];

  const tamData = [
    { category: "Electronic Music Tickets", value: 1080000000, percentage: 60 },
    { category: "Festival Packages", value: 360000000, percentage: 20 },
    { category: "VIP Experiences", value: 180000000, percentage: 10 },
    { category: "Merchandise & Add-ons", value: 90000000, percentage: 5 },
    { category: "Travel & Hospitality", value: 90000000, percentage: 5 }
  ];

  const expansionTimeline = [
    { quarter: "Q1 2025", milestone: "Brazil Launch", users: 1200000, revenue: 7600000 },
    { quarter: "Q2 2025", milestone: "Mexico Entry", users: 1500000, revenue: 12000000 },
    { quarter: "Q3 2025", milestone: "Colombia & Chile", users: 2000000, revenue: 18000000 },
    { quarter: "Q4 2025", milestone: "Regional Leader", users: 2500000, revenue: 25000000 },
    { quarter: "Q1 2026", milestone: "Peru & Uruguay", users: 3200000, revenue: 35000000 },
    { quarter: "Q2 2026", milestone: "Full Coverage", users: 4000000, revenue: 48000000 }
  ];

  const competitiveAdvantages = [
    { advantage: "Zero Fraud NFT Tech", impact: 95, industry: 20 },
    { advantage: "Organic Growth", impact: 100, industry: 15 },
    { advantage: "Unit Economics", impact: 90, industry: 30 },
    { advantage: "Market Position", impact: 80, industry: 25 },
    { advantage: "User Retention", impact: 85, industry: 25 }
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
            Market Opportunity
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            $1.8B+ addressable market in Latin America with proven playbook for expansion
          </p>
        </motion.div>

        {/* TAM Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <Globe className="w-8 h-8 text-gray-400 mb-4" />
            <p className="text-sm text-gray-400 mb-2">Total Addressable Market</p>
            <p className="text-3xl font-bold text-white mb-2">$1.8B</p>
            <p className="text-sm text-gray-500">Latin America Electronic Music</p>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <MapPin className="w-8 h-8 text-gray-400 mb-4" />
            <p className="text-sm text-gray-400 mb-2">Event Coverage</p>
            <p className="text-3xl font-bold text-white mb-2">80%</p>
            <p className="text-sm text-gray-500">of Argentina's Electronic Events</p>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <Rocket className="w-8 h-8 text-gray-400 mb-4" />
            <p className="text-sm text-gray-400 mb-2">Expansion Potential</p>
            <p className="text-3xl font-bold text-white mb-2">6 Countries</p>
            <p className="text-sm text-gray-500">Ready for immediate entry</p>
          </Card>
        </motion.div>

        {/* Regional Opportunity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Regional Market Opportunity</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={marketSizeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="region" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value/1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="current" fill="#ffffff" name="Current Revenue" stackId="a" />
                <Bar dataKey="potential" fill="#6b7280" name="Market Potential" stackId="b" opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>

            {/* Market Penetration Progress */}
            <div className="mt-6 space-y-4">
              {marketSizeData.map((market) => (
                <div key={market.region} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-400">{market.region}</div>
                  <div className="flex-1">
                    <Progress value={market.penetration} className="h-2" />
                  </div>
                  <div className="text-sm text-white font-semibold w-12 text-right">
                    {market.penetration}%
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-gray-800 text-gray-300 border-gray-700"
                  >
                    {market.penetration > 0 ? "Active" : "Ready"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* TAM Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gray-900/50 border-gray-800 p-6 h-full">
              <h3 className="text-xl font-bold text-white mb-6">Market Segments ($1.8B TAM)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tamData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage}%`}
                    outerRadius={100}
                    fill="#ffffff"
                    dataKey="value"
                  >
                    {tamData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${(value/1000000).toFixed(0)}M`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {tamData.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-sm text-gray-400">{item.category}</span>
                    </div>
                    <span className="text-sm text-white font-semibold">
                      ${(item.value/1000000).toFixed(0)}M
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Expansion Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gray-900/50 border-gray-800 p-6 h-full">
              <h3 className="text-xl font-bold text-white mb-6">Expansion Roadmap</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={expansionTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="quarter" stroke="#9ca3af" />
                  <YAxis yAxisId="left" stroke="#9ca3af" tickFormatter={(value) => `${(value/1000000).toFixed(0)}M`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" tickFormatter={(value) => `$${(value/1000000).toFixed(0)}M`} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="users" stroke="#9ca3af" strokeWidth={2} name="Users" dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ffffff" strokeWidth={2} name="Revenue" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">2026 Target Users</p>
                  <p className="text-2xl font-bold text-white">4M</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">2026 Target Revenue</p>
                  <p className="text-2xl font-bold text-white">$48M</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Competitive Advantages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Competitive Moat</h3>
            <div className="space-y-6">
              {competitiveAdvantages.map((item, index) => (
                <div key={item.advantage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{item.advantage}</span>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-gray-800 text-white border-gray-700">
                        BOMBO: {item.impact}%
                      </Badge>
                      <Badge className="bg-gray-600/10 text-gray-400 border-gray-600/30">
                        Industry: {item.industry}%
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-6 bg-gray-900 rounded-lg overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-white rounded-lg"
                      style={{ width: `${item.impact}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-gray-600/50 rounded-lg"
                      style={{ width: `${item.industry}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
              <div className="flex items-center mb-3">
                <Target className="w-5 h-5 text-gray-400 mr-2" />
                <p className="text-sm text-gray-400 font-semibold">Why BOMBO Will Win</p>
              </div>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-start">
                  <Zap className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Proven playbook: 80% of electronic music events in Argentina in just 3 years</span>
                </li>
                <li className="flex items-start">
                  <Zap className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Zero CAC model scales perfectly to new markets</span>
                </li>
                <li className="flex items-start">
                  <Zap className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>NFT technology eliminates fraud - unique differentiator</span>
                </li>
                <li className="flex items-start">
                  <Zap className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Strong network effects accelerate growth in new markets</span>
                </li>
              </ul>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}