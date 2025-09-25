"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { bomboData, formatCurrency } from "@/lib/data";
import {
  Trophy, Shield, Rocket, Target, Star, CheckCircle2,
  TrendingUp, Users, DollarSign, Zap, ArrowRight
} from "lucide-react";

export function InvestmentHighlights() {
  const highlights = [
    {
      icon: Trophy,
      title: "Market Leader",
      description: "80% market share in Argentina's $250M electronic music market",
      metric: "80%",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30"
    },
    {
      icon: Rocket,
      title: "Explosive Growth",
      description: "From $0 to $70M GTV in 36 months with zero paid marketing",
      metric: "$70M+",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30"
    },
    {
      icon: Shield,
      title: "Zero Fraud",
      description: "NFT technology eliminates 100% of ticket fraud",
      metric: "100%",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30"
    },
    {
      icon: Target,
      title: "Unit Economics",
      description: "25.3x LTV:CAC ratio with $0 customer acquisition cost",
      metric: "25.3x",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30"
    }
  ];

  const investmentTerms = {
    round: "Series A",
    amount: "$15,000,000",
    preMoneyValuation: "$40,000,000",
    postMoneyValuation: "$55,000,000",
    minimumInvestment: "$500,000",
    leadInvestor: "Open",
    existingInvestors: ["Y Combinator", "Founders", "Angels"],
    boardSeats: "2 of 5"
  };

  const milestones = [
    { achieved: true, milestone: "Product-Market Fit", description: "801K users, 80% market share" },
    { achieved: true, milestone: "Profitability Path", description: "56.93% contribution margin" },
    { achieved: true, milestone: "Organic Growth", description: "1,302 daily new users without ads" },
    { achieved: true, milestone: "Retention Excellence", description: "47% 30-day buyer retention" },
    { achieved: false, milestone: "Brazil Launch", description: "Q1 2025 - $800M market" },
    { achieved: false, milestone: "Regional Expansion", description: "6 countries by 2026" },
    { achieved: false, milestone: "$100M Revenue", description: "2027 target with 30% EBITDA" }
  ];

  const keyRisks = [
    { risk: "Competition", mitigation: "80% market share, network effects, exclusive venues" },
    { risk: "Regulation", mitigation: "Compliant operations, strong government relations" },
    { risk: "Technology", mitigation: "Proven NFT platform, world-class tech team" },
    { risk: "Market", mitigation: "Recession-resistant entertainment sector" }
  ];

  const exitComps = [
    { company: "StubHub", multiple: "4.0x", revenue: "$1.3B", valuation: "$4.0B" },
    { company: "Vivid Seats", multiple: "3.5x", revenue: "$600M", valuation: "$2.1B" },
    { company: "SeatGeek", multiple: "4.5x", revenue: "$400M", valuation: "$1.8B" },
    { company: "Viagogo", multiple: "5.0x", revenue: "$800M", valuation: "$4.0B" }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-1 mb-4">
            Series A - $15M Round
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Investment Opportunity
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join us in building Latin America's dominant entertainment technology platform
          </p>
        </motion.div>

        {/* Key Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`relative overflow-hidden bg-slate-800/50 border ${highlight.borderColor} p-6 hover:scale-105 transition-transform`}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${highlight.bgColor} blur-3xl opacity-20`} />
                <div className="relative">
                  <highlight.icon className={`w-8 h-8 ${highlight.color} mb-4`} />
                  <p className="text-3xl font-bold text-white mb-2">{highlight.metric}</p>
                  <h3 className="text-lg font-semibold text-white mb-2">{highlight.title}</h3>
                  <p className="text-sm text-gray-400">{highlight.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Investment Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700 p-8">
            <div className="flex items-center mb-6">
              <DollarSign className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-2xl font-bold text-white">Investment Terms</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Round</p>
                <p className="text-xl font-bold text-white">{investmentTerms.round}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Amount Raising</p>
                <p className="text-xl font-bold text-green-500">{investmentTerms.amount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Pre-Money Valuation</p>
                <p className="text-xl font-bold text-white">{investmentTerms.preMoneyValuation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Post-Money</p>
                <p className="text-xl font-bold text-white">{investmentTerms.postMoneyValuation}</p>
              </div>
            </div>

            <Separator className="my-6 bg-slate-700" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-2">Minimum Investment</p>
                <p className="text-lg font-semibold text-white">{investmentTerms.minimumInvestment}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Lead Investor</p>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                  {investmentTerms.leadInvestor}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Board Seats</p>
                <p className="text-lg font-semibold text-white">{investmentTerms.boardSeats}</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-emerald-900/20 rounded-lg border border-emerald-500/30">
              <p className="text-sm text-emerald-400 font-semibold mb-2">Why This Valuation?</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 1.75x revenue multiple vs 3-5x for comparable companies</li>
                <li>• $70M+ GTV achieved with only $220K invested</li>
                <li>• Clear path to $100M revenue by 2027</li>
                <li>• Dominant market position with proven expansion playbook</li>
              </ul>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-slate-800/50 border-slate-700 p-6 h-full">
              <h3 className="text-xl font-bold text-white mb-6">Key Milestones</h3>
              <div className="space-y-4">
                {milestones.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {item.achieved ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${item.achieved ? 'text-white' : 'text-gray-400'}`}>
                        {item.milestone}
                      </p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Exit Comps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-slate-800/50 border-slate-700 p-6 h-full">
              <h3 className="text-xl font-bold text-white mb-6">Exit Comparables</h3>
              <div className="space-y-4">
                {exitComps.map((comp) => (
                  <div key={comp.company} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-white">{comp.company}</p>
                      <p className="text-sm text-gray-400">Revenue: {comp.revenue}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 mb-1">
                        {comp.multiple} Revenue
                      </Badge>
                      <p className="text-sm text-gray-400">{comp.valuation}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <p className="text-sm text-purple-400 font-semibold">BOMBO Projection</p>
                <p className="text-2xl font-bold text-white mt-1">$400M - $500M</p>
                <p className="text-sm text-gray-400">Exit valuation at 4x revenue multiple</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Risk Mitigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Risk Analysis & Mitigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keyRisks.map((item) => (
                <div key={item.risk} className="p-4 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-amber-500 mr-2" />
                    <p className="font-semibold text-white">{item.risk}</p>
                  </div>
                  <p className="text-sm text-gray-400">{item.mitigation}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 p-8">
            <div className="text-center">
              <Star className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Why Invest in BOMBO?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-white font-semibold">142% Expected IRR</p>
                  <p className="text-sm text-gray-400">Based on conservative projections</p>
                </div>
                <div>
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-white font-semibold">&lt;2 Year Payback</p>
                  <p className="text-sm text-gray-400">Fastest in the industry</p>
                </div>
                <div>
                  <Rocket className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-white font-semibold">10-15x Return</p>
                  <p className="text-sm text-gray-400">Expected at exit</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
                >
                  Schedule Investor Call
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-gray-400">
                  Contact: investors@wearebombo.com
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}