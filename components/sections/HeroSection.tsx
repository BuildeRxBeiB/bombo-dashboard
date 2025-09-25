"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Users, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bomboData, formatCurrency, formatNumber } from "@/lib/data";

const AnimatedCounter = ({ value, suffix = "", prefix = "", duration = 2 }: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export function HeroSection() {
  const keyMetrics = [
    {
      label: "Total Users",
      value: bomboData.metrics.totalUsers,
      format: "number",
      icon: Users,
      gradient: "from-gray-700 to-gray-600"
    },
    {
      label: "Gross Transaction Value",
      value: bomboData.metrics.totalGTV,
      format: "currency",
      icon: DollarSign,
      gradient: "from-gray-700 to-gray-600"
    },
    {
      label: "LTV:CAC Ratio",
      value: bomboData.metrics.ltvCacRatio,
      format: "ratio",
      icon: TrendingUp,
      gradient: "from-gray-700 to-gray-600"
    }
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-[length:50px_50px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 px-4">
            Bombo's Key Metrics Dashboard
          </h1>
        </motion.div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {keyMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <div className="relative group">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gray-800/20 blur-xl group-hover:bg-gray-700/30 transition-all" />

                {/* Card */}
                <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-gray-700 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <metric.icon className="w-8 h-8 text-gray-400" />
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>

                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                    {metric.format === "currency" ? (
                      formatCurrency(metric.value) + "+"
                    ) : metric.format === "ratio" ? (
                      `${metric.value}x`
                    ) : (
                      formatNumber(metric.value) + "+"
                    )}
                  </div>

                  <p className="text-gray-400 text-sm uppercase tracking-wider">
                    {metric.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats - Prominent Card Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
            <div className="flex flex-col items-center">
              <DollarSign className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-3xl font-bold text-white mb-1">${bomboData.metrics.cac}</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">CAC</p>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-3xl font-bold text-white mb-1">{formatNumber(bomboData.metrics.peakMAU)}</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Peak MAU</p>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-3xl font-bold text-white mb-1">{formatNumber(bomboData.metrics.ticketsSold)}</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Tickets Sold</p>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
            <div className="flex flex-col items-center">
              <TrendingUp className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-3xl font-bold text-white mb-1">20.8%</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">90-Day Churn</p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
}