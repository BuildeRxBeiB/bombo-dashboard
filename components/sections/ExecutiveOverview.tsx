"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bomboData, formatCurrency, formatPercentage } from "@/lib/data";
import { TrendingUp, DollarSign, Users, Trophy, Shield, Zap } from "lucide-react";

export function ExecutiveOverview() {
  const advantages = [
    {
      title: "World-Class Unit Economics",
      metric: `${bomboData.metrics.ltvCacRatio}x`,
      comparison: "Industry: 3x",
      icon: TrendingUp,
      color: "text-white",
      bgColor: "bg-gray-900",
      borderColor: "border-gray-700"
    },
    {
      title: "Zero-Cost Acquisition",
      metric: `$${bomboData.metrics.cac}`,
      comparison: "Industry: $50+",
      icon: DollarSign,
      color: "text-white",
      bgColor: "bg-gray-900",
      borderColor: "border-gray-700"
    },
    {
      title: "Superior Retention",
      metric: `${bomboData.metrics.buyerRetention}%`,
      comparison: "Industry: 25%",
      icon: Users,
      color: "text-white",
      bgColor: "bg-gray-900",
      borderColor: "border-gray-700"
    },
    {
      title: "Event Coverage",
      metric: `${bomboData.metrics.eventsCoverage}%`,
      comparison: "of Electronic Music Events in Argentina",
      icon: Trophy,
      color: "text-white",
      bgColor: "bg-gray-900",
      borderColor: "border-gray-700"
    }
  ];

  const keyPoints = [
    "NFT ticketing eliminates 100% of fraud",
    "1,302 new users daily without paid marketing",
    "All major venues exclusively on platform",
    "$220K bootstrap to $70M+ GTV",
    "56.93% contribution margin",
    "Ready for regional expansion"
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
            Executive Overview
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            BOMBO has achieved what most venture-backed startups fail to accomplish:
            explosive organic growth with exceptional unit economics
          </p>
        </motion.div>

        {/* Competitive Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {advantages.map((advantage, index) => (
            <motion.div
              key={advantage.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`relative overflow-hidden bg-gray-900/50 border ${advantage.borderColor} hover:border-gray-600 transition-all p-6`}>
                {/* Removed gradient background */}

                <div className="relative">
                  <div className={`inline-flex p-3 rounded-lg ${advantage.bgColor} mb-4`}>
                    <advantage.icon className={`w-6 h-6 ${advantage.color}`} />
                  </div>

                  <h3 className="text-gray-500 text-sm mb-2">{advantage.title}</h3>
                  <p className="text-2xl font-bold text-white mb-2">
                    {advantage.metric}
                  </p>
                  <p className="text-xs text-gray-500">{advantage.comparison}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* The BOMBO Advantage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card className="bg-gray-900/50 border-gray-800 p-8">
            <div className="flex items-center mb-6">
              <Shield className="w-8 h-8 text-gray-400 mr-3" />
              <h3 className="text-xl font-bold text-white">The BOMBO Advantage</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {keyPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center"
                >
                  <Zap className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">{point}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

      </div>
    </section>
  );
}