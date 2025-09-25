"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { bomboData, formatCurrency } from "@/lib/data";
import { TrendingUp, DollarSign, PieChartIcon, Target } from "lucide-react";

const COLORS = ['#ffffff', '#d1d5db', '#9ca3af', '#6b7280'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black p-3 rounded-lg border border-gray-800">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-300">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function FinancialPerformance() {
  // Financial evolution data with 2025 estimates
  const revenueData = bomboData.financialEvolution.map(item => ({
    year: item.year,
    gtv: item.gtv,
    revenue: item.revenue,
    gtvEstimated: item.year === "2025 YTD" ? bomboData.metrics.gtv2025Projected : null,
    revenueEstimated: item.year === "2025 YTD" ? bomboData.metrics.revenue2025Projected : null,
    margin: item.revenue / item.gtv * 100
  }));

  // Unit economics comparison
  const unitEconomics = [
    { metric: "CAC", bombo: bomboData.metrics.cac, industry: bomboData.metrics.industryCac, unit: "$" },
    { metric: "LTV", bombo: bomboData.metrics.ltv, industry: bomboData.metrics.industryLtv, unit: "$" },
    { metric: "LTV:CAC", bombo: bomboData.metrics.ltvCacRatio, industry: bomboData.metrics.industryLtvCacRatio, unit: "x" },
    { metric: "Margin", bombo: bomboData.metrics.contributionMargin, industry: bomboData.metrics.industryMargin, unit: "%" }
  ];

  // Use of funds data for pie chart
  const useOfFundsData = bomboData.investmentHighlights.useOfFunds;

  // Projection data - separate scales for better visibility
  const projectionData = bomboData.projections.map(item => ({
    year: item.year,
    users: item.users / 1000000, // Convert to millions for left axis
    gtv: item.gtv / 1000000, // Convert to millions for right axis
    revenue: item.revenue / 1000000 // Convert to millions for left axis
  }));

  // Separate chart data for better scaling
  const userRevenueData = bomboData.projections.map(item => ({
    year: item.year,
    users: item.users / 1000000,
    revenue: item.revenue / 1000000
  }));

  const gtvData = bomboData.projections.map(item => ({
    year: item.year,
    gtv: item.gtv / 1000000
  }));

  // Monthly revenue comparison data
  const monthlyComparisonData = bomboData.monthlyRevenue[2024].map((item, index) => ({
    month: item.month,
    revenue2024: item.revenue,
    revenue2025: bomboData.monthlyRevenue[2025][index].revenue,
    isEstimated: !bomboData.monthlyRevenue[2025][index].actual
  }));

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
            Financial Metrics
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            World-class unit economics with sustainable growth and profitability
          </p>
        </motion.div>

        {/* Financial Performance Tables */}
        <div className="grid grid-cols-1 gap-8 mb-12">
          {/* Main Financial Performance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Financial Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-2 text-gray-400 font-semibold">Metric</th>
                      <th className="text-right py-3 px-2 text-gray-400 font-semibold">2023</th>
                      <th className="text-right py-3 px-2 text-gray-400 font-semibold">2024</th>
                      <th className="text-right py-3 px-2 text-gray-400 font-semibold">2025 YTD</th>
                      <th className="text-right py-3 px-2 text-gray-400 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-3 px-2 text-gray-300">Gross Transaction Value (GTV)</td>
                      <td className="text-right py-3 px-2 text-white font-mono">$9,665,152</td>
                      <td className="text-right py-3 px-2 text-white font-mono">$26,446,504</td>
                      <td className="text-right py-3 px-2 text-white font-mono">$33,934,016</td>
                      <td className="text-right py-3 px-2 text-white font-bold font-mono">$70,045,672</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-3 px-2 text-gray-300">Revenue</td>
                      <td className="text-right py-3 px-2 text-white font-mono">$1,209,801</td>
                      <td className="text-right py-3 px-2 text-white font-mono">$3,053,080</td>
                      <td className="text-right py-3 px-2 text-white font-mono">$5,090,102</td>
                      <td className="text-right py-3 px-2 text-white font-bold font-mono">$9,352,983</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-3 px-2 text-gray-300">Net Service Charge</td>
                      <td className="text-right py-3 px-2 text-white font-mono">$845,626</td>
                      <td className="text-right py-3 px-2 text-white font-mono">$2,043,640</td>
                      <td className="text-right py-3 px-2 text-white font-mono">$3,054,061</td>
                      <td className="text-right py-3 px-2 text-white font-bold font-mono">$5,943,327</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-gray-300">Available Service Charge</td>
                      <td className="text-right py-3 px-2 text-white font-mono">$822,658</td>
                      <td className="text-right py-3 px-2 text-white font-mono">$1,876,181</td>
                      <td className="text-right py-3 px-2 text-white font-mono">$2,898,000</td>
                      <td className="text-right py-3 px-2 text-white font-bold font-mono">$5,596,839</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Contribution Margin & COGS */}
              <div className="mt-6 grid grid-cols-2 gap-4 p-4 bg-black/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Contribution Margin</p>
                  <p className="text-2xl font-bold text-white">56.93%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">COGS</p>
                  <p className="text-2xl font-bold text-white">43.07%</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Financial Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <DollarSign className="w-8 h-8 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-2">Total Revenue (All-Time)</p>
            <p className="text-3xl font-bold text-white mb-2">
              {formatCurrency(bomboData.metrics.totalRevenue)}
            </p>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-400">Since launch</span>
            </div>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <DollarSign className="w-8 h-8 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-2">Total GTV</p>
            <p className="text-3xl font-bold text-white mb-2">
              {formatCurrency(bomboData.metrics.totalGTV)}
            </p>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-400">since launch</span>
            </div>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <PieChartIcon className="w-8 h-8 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-2">2025 YTD (Aug)</p>
            <p className="text-3xl font-bold text-white mb-2">
              {formatCurrency(bomboData.metrics.revenue2025YTD)}
            </p>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-400">Projected: {formatCurrency(bomboData.metrics.revenue2025Projected)}</span>
            </div>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <Target className="w-8 h-8 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-2">Contribution Margin</p>
            <p className="text-3xl font-bold text-white mb-2">
              {bomboData.metrics.contributionMargin}%
            </p>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-400">Industry: {bomboData.metrics.industryMargin}%</span>
            </div>
          </Card>
        </motion.div>

        {/* GTV and Revenue Evolution Charts - Split for better visibility */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* GTV Evolution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gray-900/50 border-gray-800 p-4 sm:p-6 h-full">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">GTV Evolution (2023-2025)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="year" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value/1000000).toFixed(0)}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="gtv"
                      fill="#9ca3af"
                      name="GTV (Actual)"
                      radius={[8, 8, 0, 0]}
                      style={{ filter: 'none' }}
                      onMouseEnter={(e) => {
                        if (e && e.target && e.target instanceof Element) {
                          const element = e.target as HTMLElement;
                          element.style.filter = 'none';
                          element.style.opacity = '1';
                        }
                      }}
                    />
                    <Bar
                      dataKey="gtvEstimated"
                      fill="#6b7280"
                      name="GTV (Estimated)"
                      radius={[8, 8, 0, 0]}
                      style={{ filter: 'none' }}
                      onMouseEnter={(e) => {
                        if (e && e.target && e.target instanceof Element) {
                          const element = e.target as HTMLElement;
                          element.style.filter = 'none';
                          element.style.opacity = '1';
                        }
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400 metric-card-label responsive-metric-text">2025 Projected:</p>
                <p className="text-xl font-bold text-white metric-emphasis responsive-metric-text">{formatCurrency(bomboData.metrics.gtv2025Projected)}</p>
              </div>
            </Card>
          </motion.div>

          {/* Revenue Evolution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gray-900/50 border-gray-800 p-4 sm:p-6 h-full">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Revenue Evolution (2023-2025)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="year" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="revenue"
                      fill="#ffffff"
                      name="Revenue (Actual)"
                      radius={[8, 8, 0, 0]}
                      style={{ filter: 'none' }}
                      onMouseEnter={(e) => {
                        if (e && e.target && e.target instanceof Element) {
                          const element = e.target as HTMLElement;
                          element.style.filter = 'none';
                          element.style.opacity = '1';
                        }
                      }}
                    />
                    <Bar
                      dataKey="revenueEstimated"
                      fill="#d1d5db"
                      name="Revenue (Estimated)"
                      radius={[8, 8, 0, 0]}
                      style={{ filter: 'none' }}
                      onMouseEnter={(e) => {
                        if (e && e.target && e.target instanceof Element) {
                          const element = e.target as HTMLElement;
                          element.style.filter = 'none';
                          element.style.opacity = '1';
                        }
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400 metric-card-label responsive-metric-text">2025 Projected:</p>
                <p className="text-xl font-bold text-white metric-emphasis responsive-metric-text">{formatCurrency(bomboData.metrics.revenue2025Projected)}</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* 2024 vs 2025 Monthly Revenue Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="bg-gray-900/50 border-gray-800 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Monthly Revenue Comparison: 2024 vs 2025</h3>

            {/* YoY Growth Highlight */}
            <div className="bg-black/50 border border-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">Year-over-Year Growth (Jan-Aug)</h4>
                <div className="flex items-center bg-gray-900 rounded-full px-3 py-1">
                  <TrendingUp className="w-4 h-4 text-white mr-2" />
                  <span className="text-xl font-bold text-white">+67%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Jan</p>
                  <p className="font-bold text-white">+133%</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Feb</p>
                  <p className="font-bold text-white">+302%</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Mar</p>
                  <p className="font-bold text-gray-400">-5%</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Apr</p>
                  <p className="font-bold text-white">+12%</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">May</p>
                  <p className="font-bold text-gray-400">-17%</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Jun</p>
                  <p className="font-bold text-white">+39%</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Jul</p>
                  <p className="font-bold text-white">+143%</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Aug</p>
                  <p className="font-bold text-white">+81%</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">6 out of 8 months</span> showed positive growth, with
                  <span className="font-semibold text-white"> 3 months exceeding 100%</span> growth (Feb, Jan, Jul)
                </p>
              </div>
            </div>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      `$${(value/1000).toFixed(1)}K`,
                      name.includes('2024') ? '2024 Actual' : name
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue2024"
                    fill="#6b7280"
                    name="2024 Actual"
                    radius={[4, 4, 0, 0]}
                    style={{ filter: 'none' }}
                    onMouseEnter={(e) => {
                      if (e && e.target && e.target instanceof Element) {
                        const element = e.target as HTMLElement;
                        element.style.filter = 'none';
                        element.style.opacity = '1';
                      }
                    }}
                  />
                  <Bar
                    dataKey="revenue2025"
                    fill="#ffffff"
                    name="2025"
                    radius={[4, 4, 0, 0]}
                    style={{ filter: 'none' }}
                    onMouseEnter={(e) => {
                      if (e && e.target && e.target instanceof Element) {
                        const element = e.target as HTMLElement;
                        element.style.filter = 'none';
                        element.style.opacity = '1';
                      }
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-600 rounded mr-2" />
                  <span className="text-gray-400">2024 Actual</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-white rounded mr-2" />
                  <span className="text-gray-400">2025 Actual (Jan-Aug)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-white/50 rounded mr-2" />
                  <span className="text-gray-400">2025 Estimated (Sep-Dec)</span>
                </div>
              </div>
              <div className="text-gray-400">
                Total 2025 Est: <span className="text-white font-bold">$5.1M</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Customer Economics Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Customer Economics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-2 text-gray-400 font-semibold">Metric</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-3 px-2 text-gray-300">Total Purchases</td>
                    <td className="text-right py-3 px-2 text-white font-bold font-mono">221,704</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-3 px-2 text-gray-300">Average GMV per User (All Users)</td>
                    <td className="text-right py-3 px-2 text-white font-bold font-mono">$87</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-3 px-2 text-gray-300">Average GMV (Per Purchaser)</td>
                    <td className="text-right py-3 px-2 text-white font-bold font-mono">$316</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-3 px-2 text-gray-300">Gross ARPU (Per Purchaser)</td>
                    <td className="text-right py-3 px-2 text-white font-bold font-mono">$42.19</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-3 px-2 text-gray-300">Average Tickets Per Purchaser</td>
                    <td className="text-right py-3 px-2 text-white font-bold font-mono">5.76</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 text-gray-300">Average Revenue Per Ticket</td>
                    <td className="text-right py-3 px-2 text-white font-bold font-mono">$7.32</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* LTV & CAC Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-6">LTV & CAC Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-2 text-gray-400 font-semibold">Metric</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-3 px-2 text-gray-300">Lifetime Value (LTV)</td>
                    <td className="text-right py-3 px-2 text-white font-bold font-mono">$6.98</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-3 px-2 text-gray-300">Marketing Team + Costs 2023</td>
                    <td className="text-right py-3 px-2 text-white font-mono">$60,600</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-3 px-2 text-gray-300">Marketing Team + Costs 2024</td>
                    <td className="text-right py-3 px-2 text-white font-mono">$100,000</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-3 px-2 text-gray-300">Marketing Team + Costs 2025 YTD</td>
                    <td className="text-right py-3 px-2 text-white font-mono">$60,908</td>
                  </tr>
                  <tr className="border-b border-gray-800/50 bg-gray-800/20">
                    <td className="py-3 px-2 text-gray-300 font-semibold">Total CAC</td>
                    <td className="text-right py-3 px-2 text-white font-bold font-mono">$220,908</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-3 px-2 text-gray-300">CAC Per User</td>
                    <td className="text-right py-3 px-2 text-white font-bold font-mono">$0.28</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 text-gray-300 font-semibold">LTV:CAC Ratio</td>
                    <td className="text-right py-3 px-2 text-white text-xl font-bold font-mono">25.3x</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Growth Projections and Trajectory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Growth Trajectory Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gray-900/50 border-gray-800 p-4 sm:p-6 h-full">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Growth Trajectory</h3>
              <div className="relative">
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-600" />
                <div className="space-y-6">
                  {[
                    { year: "2023", milestone: "Launch", metric: "$9.7M GTV", description: "Founded with $60K investment" },
                    { year: "2024", milestone: "Growth", metric: "$26.4M GTV", description: "485K users, market leader position" },
                    { year: "2025 YTD", milestone: "Dominance", metric: "$33.9M GTV", description: "801K users, 80% event coverage" },
                    { year: "2025E", milestone: "Projection", metric: "$51M GTV", description: "1.2M users expected" }
                  ].map((item, index) => (
                    <div key={item.year} className="flex items-center">
                      <div className="relative z-10 w-3 h-3 bg-white rounded-full ml-3" />
                      <div className="ml-6 flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-xs font-semibold text-gray-400 mr-3">{item.year}</span>
                          <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700 text-xs">
                            {item.milestone}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-white">{item.metric}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Growth Projections Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gray-900/50 border-gray-800 p-4 sm:p-6 h-full">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Growth Projections</h3>

              {/* Combined visualization with proper scaling */}
              <div className="space-y-6">
                {/* Users & Revenue Chart */}
                <div>
                  <h4 className="text-sm text-gray-400 mb-3">Users & Revenue Growth</h4>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="year" stroke="#9ca3af" />
                        <YAxis yAxisId="left" stroke="#9ca3af" tickFormatter={(value) => `${value.toFixed(1)}M`} />
                        <YAxis yAxisId="right" orientation="right" stroke="#ffffff" tickFormatter={(value) => `$${value.toFixed(0)}M`} />
                        <Tooltip formatter={(value, name) => [
                          name.includes('Users') ? `${value.toFixed(1)}M` : `$${value.toFixed(1)}M`,
                          name
                        ]} />
                        <Line yAxisId="left" type="monotone" dataKey="users" stroke="#9ca3af" strokeWidth={2} name="Users (M)" dot={{ r: 4 }} />
                        <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ffffff" strokeWidth={3} name="Revenue ($M)" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* GTV Chart */}
                <div>
                  <h4 className="text-sm text-gray-400 mb-3">GTV Growth</h4>
                  <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={gtvData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="year" stroke="#9ca3af" />
                        <YAxis stroke="#6b7280" tickFormatter={(value) => `$${value.toFixed(0)}M`} />
                        <Tooltip formatter={(value) => [`$${value.toFixed(0)}M`, 'GTV']} />
                        <Line type="monotone" dataKey="gtv" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 5" name="GTV ($M)" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Expected IRR</p>
                  <p className="text-2xl font-bold text-white metric-emphasis responsive-metric-text">142%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Payback Period</p>
                  <p className="text-2xl font-bold text-white metric-emphasis responsive-metric-text">&lt; 2 years</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}