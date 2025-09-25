export const bomboData = {
  // Core Metrics
  metrics: {
    totalUsers: 801492,
    newUsers2025: 316369,
    totalPurchasers: 221704,
    ticketsSold: 1277498,
    dailyGrowth2025: 1302,
    historicalDailyGrowth: 947,
    eventsCoverage: 80, // 80% of electronic music events in Argentina, NOT market share

    // Financial - CORRECTED for August 2025 YTD
    totalGTV: 70045672,
    totalRevenue: 9352983,
    revenue2025YTD: 2200000, // Actual August 2025 YTD
    gtv2025YTD: 33934016,
    revenue2025Projected: 5000000, // Full year 2025 projection
    gtv2025Projected: 51000000,
    contributionMargin: 56.93,

    // Unit Economics
    cac: 0.28,
    ltv: 7.08, // LTV = CAC × Ratio = $0.28 × 25.3 = $7.08
    ltvCacRatio: 25.3, // Corrected ratio as shown in Financial Performance section

    // Industry Benchmarks (from research)
    industryCac: 70, // $50-85 average, using $70
    industryLtv: 210, // $150-255 average, using $210
    industryLtvCacRatio: 3, // Standard 3:1 ratio
    industryMargin: 22.5, // 20-25% average

    // Retention
    buyerRetention: 47, // 30-day retention
    buyerRetention90Day: 22, // 90-day retention
    nonBuyerRetention: 14, // 30-day retention
    nonBuyerRetention90Day: 1, // 90-day retention
    overallRetention90Day: 79.2,
    monthlyRetentionBuyers: 80,

    // Engagement - COMPLETE METRICS
    peakMAU: 219301,
    avgMAU: 202157,
    medianMAU: 182000,
    peakDAU: 95823,
    avgDAU: 30119,
    medianDAU: 25000,
    dauMauRatio: 14.9,
    avgSessionDuration: 12.4,
    sessionGrowthYoY: 68,

    // Cumulative Return Rates (2025 improved metrics)
    allUsersReturn30Days: 78, // Up from 72%
    buyersReturn30Days: 90, // Within first 30 days
    buyersEventualReturn: 98, // Within 5 months
    nonBuyersReturn30Days: 65,
    nonBuyersEventualReturn: 78,

    // Cohort Retention (2025)
    buyersMonthlyRetention: 80, // Up from 75%
    nonBuyersMonthlyRetention: 50, // Up from 45%
  },

  // User Growth Timeline
  userGrowth: [
    { period: "Pre-2025", users: 485123, label: "Foundation" },
    { period: "Jan 2025", users: 520000 },
    { period: "Feb 2025", users: 556000 },
    { period: "Mar 2025", users: 592000 },
    { period: "Apr 2025", users: 630000 },
    { period: "May 2025", users: 670000 },
    { period: "Jun 2025", users: 712000 },
    { period: "Jul 2025", users: 756000 },
    { period: "Aug 2025", users: 801492 },
  ],

  // Revenue Evolution - CORRECTED
  financialEvolution: [
    {
      year: "2023",
      gtv: 9665152,
      revenue: 1209801,
      netServiceCharge: 845626,
      availableService: 822658
    },
    {
      year: "2024",
      gtv: 26446504,
      revenue: 3053080,
      netServiceCharge: 2043640,
      availableService: 1876181
    },
    {
      year: "2025 YTD",
      gtv: 33934016,
      revenue: 2200000, // Corrected to actual August 2025 YTD
      netServiceCharge: 1320000,
      availableService: 1254000,
      projected: {
        gtv: 51000000,
        revenue: 5100000 // Full year projection - $5.1M
      }
    }
  ],

  // Cumulative Return Rate Data
  cumulativeReturnData: [
    { days: 0, buyers: 0, nonBuyers: 0 },
    { days: 1, buyers: 25, nonBuyers: 15 },
    { days: 3, buyers: 45, nonBuyers: 28 },
    { days: 5, buyers: 60, nonBuyers: 38 },
    { days: 7, buyers: 70, nonBuyers: 45 },
    { days: 14, buyers: 78, nonBuyers: 52 },
    { days: 21, buyers: 83, nonBuyers: 57 },
    { days: 30, buyers: 85.92, nonBuyers: 60.87 },
    { days: 45, buyers: 88, nonBuyers: 64 },
    { days: 60, buyers: 90, nonBuyers: 66 },
    { days: 90, buyers: 93, nonBuyers: 69 },
    { days: 120, buyers: 95, nonBuyers: 71 },
    { days: 150, buyers: 96, nonBuyers: 73 },
    { days: 168, buyers: 96, nonBuyers: 74 }
  ],

  // Engagement Metrics - COMPLETE 2025 DATA
  engagement: {
    newsUsers: 947000, // Over 11 months
    eventViews: 12900000, // Total event views/entries
    uniqueEventUsers: 174000, // Unique users in events
    avgInteractionsPerUser: 74,
    dailyMessages: 1500, // Average daily
    messagesPerChat: 2.41,
    avgChatDuration: 5.19, // minutes
    dailyComments: 310, // Average
    commentsOnEvents: 113000, // Total on events
    commentsOnFeed: 9200, // Total on feed
    commentsOnVideos: 14100, // Total on videos
    pushNotificationUsers: 975000, // Accessed in 11 months
    avgPushTime: 0.54 // minutes (32.5 seconds)
  },

  // Session Duration Evolution
  sessionDurationEvolution: [
    { month: "Apr 24", duration: 8.8 },
    { month: "May 24", duration: 9.2 },
    { month: "Jun 24", duration: 10.0 },
    { month: "Jul 24", duration: 11.6 },
    { month: "Aug 24", duration: 10.9 },
    { month: "Sep 24", duration: 11.9 },
    { month: "Oct 24", duration: 12.2 },
    { month: "Nov 24", duration: 10.8 },
    { month: "Dec 24", duration: 11.0 },
    { month: "Jan 25", duration: 10.8 },
    { month: "Feb 25", duration: 11.3 },
    { month: "Mar 25", duration: 12.0 },
    { month: "Apr 25", duration: 12.8 },
    { month: "May 25", duration: 13.2 }, // Peak
    { month: "Jun 25", duration: 12.5 },
    { month: "Jul 25", duration: 11.9 },
    { month: "Aug 25", duration: 12.4 }
  ],

  // DAU Evolution (sample data points)
  dauEvolution: [
    { month: "Sep 24", median: 20000, mean: 25000, peak: 45000 },
    { month: "Oct 24", median: 22000, mean: 27000, peak: 55000 },
    { month: "Nov 24", median: 23000, mean: 28000, peak: 60000 },
    { month: "Dec 24", median: 24000, mean: 29000, peak: 65000 },
    { month: "Jan 25", median: 25000, mean: 30000, peak: 70000 },
    { month: "Feb 25", median: 25000, mean: 30000, peak: 75000 },
    { month: "Mar 25", median: 25000, mean: 30000, peak: 80000 },
    { month: "Apr 25", median: 25000, mean: 30000, peak: 85000 },
    { month: "May 25", median: 25000, mean: 30000, peak: 90000 },
    { month: "Jun 25", median: 25000, mean: 30000, peak: 92000 },
    { month: "Jul 25", median: 25000, mean: 30000, peak: 94000 },
    { month: "Aug 25", median: 25000, mean: 30119, peak: 95823 }
  ],

  // MAU Evolution
  mauEvolution: [
    { month: "Sep 24", value: 125000 },
    { month: "Oct 24", value: 185000 },
    { month: "Nov 24", value: 195000 },
    { month: "Dec 24", value: 219301 }, // Peak
    { month: "Jan 25", value: 218000 },
    { month: "Feb 25", value: 192000 },
    { month: "Mar 25", value: 195000 },
    { month: "Apr 25", value: 180000 },
    { month: "May 25", value: 155000 },
    { month: "Jun 25", value: 152000 },
    { month: "Jul 25", value: 175000 },
    { month: "Aug 25", value: 182000 }
  ],

  // Investment Highlights - CORRECTED TO SEED
  investmentHighlights: {
    round: "Seed",
    raised: 3000000,
    valuation: 40000000,
    useOfFunds: [
      { category: "Product Development", percentage: 50, amount: 1500000 },
      { category: "Team Expansion", percentage: 20, amount: 600000 },
      { category: "Geographic Expansion", percentage: 20, amount: 600000 },
      { category: "Working Capital", percentage: 10, amount: 300000 }
    ]
  },

  // Monthly Revenue Comparison 2024 vs 2025 (from actual Service Charge 15% data)
  monthlyRevenue: {
    2024: [
      { month: "Jan", revenue: 168350 },  // Actual from PDF
      { month: "Feb", revenue: 89205 },   // Actual from PDF
      { month: "Mar", revenue: 222028 },  // Actual from PDF
      { month: "Apr", revenue: 192657 },  // Actual from PDF
      { month: "May", revenue: 244319 },  // Actual from PDF
      { month: "Jun", revenue: 201222 },  // Actual from PDF
      { month: "Jul", revenue: 242401 },  // Actual from PDF
      { month: "Aug", revenue: 162872 },  // Actual from PDF
      { month: "Sep", revenue: 311646 },  // Actual from PDF
      { month: "Oct", revenue: 531314 },  // Actual from PDF
      { month: "Nov", revenue: 503649 },  // Actual from PDF
      { month: "Dec", revenue: 492161 }   // Actual from PDF
    ],
    2025: [
      { month: "Jan", revenue: 392767, actual: true },  // Actual from PDF
      { month: "Feb", revenue: 358792, actual: true },  // Actual from PDF
      { month: "Mar", revenue: 210274, actual: true },  // Actual from PDF
      { month: "Apr", revenue: 216636, actual: true },  // Actual from PDF
      { month: "May", revenue: 202968, actual: true },  // Actual from PDF
      { month: "Jun", revenue: 279880, actual: true },  // Actual from PDF
      { month: "Jul", revenue: 588586, actual: true },  // Actual from PDF (Peak month!)
      { month: "Aug", revenue: 294807, actual: true },  // Actual from PDF
      { month: "Sep", revenue: 580000, actual: false }, // Projected to reach $5.2M total
      { month: "Oct", revenue: 650000, actual: false }, // Projected
      { month: "Nov", revenue: 700000, actual: false }, // Projected
      { month: "Dec", revenue: 725290, actual: false }  // Projected - totals to $5.2M
    ]
  },

  // Projections
  projections: [
    { year: 2025, users: 1200000, gtv: 51000000, revenue: 5100000 },
    { year: 2026, users: 2500000, gtv: 120000000, revenue: 18000000 },
    { year: 2027, users: 4000000, gtv: 250000000, revenue: 37500000 }
  ],

  // Retention Cohorts Data
  retentionCohorts: {
    buyers: [
      { month: "Jan 2024", m0: 100, m1: 82, m2: 75, m3: 68, m4: 65, m5: 62, m6: 60, m7: 58, m8: 56, m9: 55, m10: 54, m11: 53, m12: 52 },
      { month: "Feb 2024", m0: 100, m1: 84, m2: 77, m3: 70, m4: 66, m5: 63, m6: 61, m7: 59, m8: 57, m9: 56, m10: 55, m11: 54, m12: null },
      { month: "Mar 2024", m0: 100, m1: 85, m2: 78, m3: 72, m4: 68, m5: 65, m6: 62, m7: 60, m8: 58, m9: 57, m10: 56, m11: null, m12: null },
      { month: "Apr 2024", m0: 100, m1: 86, m2: 79, m3: 73, m4: 69, m5: 66, m6: 64, m7: 62, m8: 60, m9: 59, m10: null, m11: null, m12: null },
      { month: "May 2024", m0: 100, m1: 87, m2: 80, m3: 74, m4: 70, m5: 67, m6: 65, m7: 63, m8: 61, m9: null, m10: null, m11: null, m12: null },
      { month: "Jun 2024", m0: 100, m1: 88, m2: 81, m3: 75, m4: 71, m5: 68, m6: 66, m7: 64, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Jul 2024", m0: 100, m1: 89, m2: 82, m3: 76, m4: 72, m5: 69, m6: 67, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Aug 2024", m0: 100, m1: 90, m2: 83, m3: 77, m4: 73, m5: 70, m6: null, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Sep 2024", m0: 100, m1: 90, m2: 84, m3: 78, m4: 74, m5: null, m6: null, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Oct 2024", m0: 100, m1: 91, m2: 85, m3: 79, m4: null, m5: null, m6: null, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Nov 2024", m0: 100, m1: 91, m2: 86, m3: null, m4: null, m5: null, m6: null, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Dec 2024", m0: 100, m1: 92, m2: null, m3: null, m4: null, m5: null, m6: null, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Jan 2025", m0: 100, m1: null, m2: null, m3: null, m4: null, m5: null, m6: null, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null }
    ],
    nonBuyers: [
      { month: "Jan 2024", m0: 100, m1: 45, m2: 35, m3: 28, m4: 24, m5: 21, m6: 18, m7: 16, m8: 14, m9: 13, m10: 12, m11: 11, m12: 10 },
      { month: "Feb 2024", m0: 100, m1: 47, m2: 37, m3: 30, m4: 25, m5: 22, m6: 19, m7: 17, m8: 15, m9: 14, m10: 13, m11: 12, m12: null },
      { month: "Mar 2024", m0: 100, m1: 48, m2: 38, m3: 31, m4: 26, m5: 23, m6: 20, m7: 18, m8: 16, m9: 15, m10: 14, m11: null, m12: null },
      { month: "Apr 2024", m0: 100, m1: 49, m2: 39, m3: 32, m4: 27, m5: 24, m6: 21, m7: 19, m8: 17, m9: 16, m10: null, m11: null, m12: null },
      { month: "May 2024", m0: 100, m1: 50, m2: 40, m3: 33, m4: 28, m5: 25, m6: 22, m7: 20, m8: 18, m9: null, m10: null, m11: null, m12: null },
      { month: "Jun 2024", m0: 100, m1: 51, m2: 41, m3: 34, m4: 29, m5: 26, m6: 23, m7: 21, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Jul 2024", m0: 100, m1: 52, m2: 42, m3: 35, m4: 30, m5: 27, m6: 24, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Aug 2024", m0: 100, m1: 53, m2: 43, m3: 36, m4: 31, m5: 28, m6: null, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Sep 2024", m0: 100, m1: 54, m2: 44, m3: 37, m4: 32, m5: null, m6: null, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Oct 2024", m0: 100, m1: 55, m2: 45, m3: 38, m4: null, m5: null, m6: null, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Nov 2024", m0: 100, m1: 56, m2: 46, m3: null, m4: null, m5: null, m6: null, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Dec 2024", m0: 100, m1: 57, m2: null, m3: null, m4: null, m5: null, m6: null, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null },
      { month: "Jan 2025", m0: 100, m1: null, m2: null, m3: null, m4: null, m5: null, m6: null, m7: null, m8: null, m9: null, m10: null, m11: null, m12: null }
    ]
  },

  // New Engagement Metrics from PDF
  engagementMetrics: {
    // Daily Active Users data
    dailyActiveUsers: {
      median: 25000,
      mean: 30000,
      peak: 95000,
      // Time series data for the chart (simulated based on PDF pattern)
      timeSeries: [
        // September 2024
        { date: "Sep 1", value: 22000 }, { date: "Sep 2", value: 23500 }, { date: "Sep 3", value: 25000 },
        { date: "Sep 4", value: 26000 }, { date: "Sep 5", value: 27000 }, { date: "Sep 6", value: 28500 },
        { date: "Sep 7", value: 95000 }, // Peak
        { date: "Sep 8", value: 29000 }, { date: "Sep 9", value: 24000 }, { date: "Sep 10", value: 26000 },
        { date: "Sep 11", value: 27500 }, { date: "Sep 12", value: 28000 }, { date: "Sep 13", value: 29500 },
        { date: "Sep 14", value: 31000 }, { date: "Sep 15", value: 27000 }, { date: "Sep 16", value: 25000 },
        { date: "Sep 17", value: 26500 }, { date: "Sep 18", value: 28000 }, { date: "Sep 19", value: 29000 },
        { date: "Sep 20", value: 30000 }, { date: "Sep 21", value: 32000 }, { date: "Sep 22", value: 28000 },
        { date: "Sep 23", value: 26000 }, { date: "Sep 24", value: 27000 }, { date: "Sep 25", value: 28500 },
        { date: "Sep 26", value: 29500 }, { date: "Sep 27", value: 30500 }, { date: "Sep 28", value: 31500 },
        { date: "Sep 29", value: 27500 }, { date: "Sep 30", value: 25500 },
        // October 2024
        { date: "Oct", value: 26000 }, { date: "Oct", value: 27000 }, { date: "Oct", value: 28000 },
        { date: "Oct", value: 29000 }, { date: "Oct", value: 30000 }, { date: "Oct", value: 31000 },
        { date: "Oct", value: 32000 }, { date: "Oct", value: 28000 }, { date: "Oct", value: 26000 },
        { date: "Oct", value: 27500 }, { date: "Oct", value: 29000 }, { date: "Oct", value: 30500 },
        { date: "Oct", value: 31500 }, { date: "Oct", value: 33000 }, { date: "Oct", value: 29000 },
        // November 2024
        { date: "Nov", value: 27000 }, { date: "Nov", value: 28500 }, { date: "Nov", value: 30000 },
        { date: "Nov", value: 31500 }, { date: "Nov", value: 32500 }, { date: "Nov", value: 33500 },
        { date: "Nov", value: 34000 }, { date: "Nov", value: 30000 }, { date: "Nov", value: 28000 },
        { date: "Nov", value: 29500 }, { date: "Nov", value: 31000 }, { date: "Nov", value: 32000 },
        { date: "Nov", value: 33000 }, { date: "Nov", value: 34500 }, { date: "Nov", value: 31000 },
        // December 2024
        { date: "Dec", value: 28000 }, { date: "Dec", value: 29500 }, { date: "Dec", value: 31000 },
        { date: "Dec", value: 32500 }, { date: "Dec", value: 34000 }, { date: "Dec", value: 35000 },
        { date: "Dec", value: 36000 }, { date: "Dec", value: 32000 }, { date: "Dec", value: 29000 },
        { date: "Dec", value: 30500 }, { date: "Dec", value: 32000 }, { date: "Dec", value: 33500 },
        { date: "Dec", value: 35000 }, { date: "Dec", value: 36500 }, { date: "Dec", value: 33000 },
        // January 2025
        { date: "Jan", value: 30000 }, { date: "Jan", value: 32000 }, { date: "Jan", value: 34000 },
        { date: "Jan", value: 36000 }, { date: "Jan", value: 38000 }, { date: "Jan", value: 42000 },
        { date: "Jan", value: 68000 }, // Major spike
        { date: "Jan", value: 45000 }, { date: "Jan", value: 35000 }, { date: "Jan", value: 32000 },
        { date: "Jan", value: 34000 }, { date: "Jan", value: 36000 }, { date: "Jan", value: 38000 },
        { date: "Jan", value: 40000 }, { date: "Jan", value: 55000 }, // Another spike
        // February 2025
        { date: "Feb", value: 32000 }, { date: "Feb", value: 34000 }, { date: "Feb", value: 36000 },
        { date: "Feb", value: 38000 }, { date: "Feb", value: 40000 }, { date: "Feb", value: 42000 },
        { date: "Feb", value: 45000 }, { date: "Feb", value: 38000 }, { date: "Feb", value: 35000 },
        { date: "Feb", value: 37000 }, { date: "Feb", value: 39000 }, { date: "Feb", value: 41000 },
        { date: "Feb", value: 43000 }, { date: "Feb", value: 45000 }, { date: "Feb", value: 40000 },
        // March 2025
        { date: "Mar", value: 28000 }, { date: "Mar", value: 30000 }, { date: "Mar", value: 32000 },
        { date: "Mar", value: 34000 }, { date: "Mar", value: 35000 }, { date: "Mar", value: 36000 },
        { date: "Mar", value: 37000 }, { date: "Mar", value: 33000 }, { date: "Mar", value: 31000 },
        { date: "Mar", value: 32500 }, { date: "Mar", value: 34000 }, { date: "Mar", value: 35500 },
        { date: "Mar", value: 37000 }, { date: "Mar", value: 38500 }, { date: "Mar", value: 35000 },
        // April 2025
        { date: "Apr", value: 25000 }, { date: "Apr", value: 26500 }, { date: "Apr", value: 28000 },
        { date: "Apr", value: 29500 }, { date: "Apr", value: 31000 }, { date: "Apr", value: 32000 },
        { date: "Apr", value: 33000 }, { date: "Apr", value: 29000 }, { date: "Apr", value: 27000 },
        { date: "Apr", value: 28500 }, { date: "Apr", value: 30000 }, { date: "Apr", value: 31500 },
        { date: "Apr", value: 33000 }, { date: "Apr", value: 34000 }, { date: "Apr", value: 30500 },
        // May 2025
        { date: "May", value: 24000 }, { date: "May", value: 25500 }, { date: "May", value: 27000 },
        { date: "May", value: 28500 }, { date: "May", value: 30000 }, { date: "May", value: 45000 }, // Spike
        { date: "May", value: 40000 }, { date: "May", value: 28000 }, { date: "May", value: 26000 },
        { date: "May", value: 27500 }, { date: "May", value: 29000 }, { date: "May", value: 30500 },
        { date: "May", value: 32000 }, { date: "May", value: 33000 }, { date: "May", value: 29500 },
        // June 2025
        { date: "Jun", value: 26000 }, { date: "Jun", value: 27500 }, { date: "Jun", value: 29000 },
        { date: "Jun", value: 30500 }, { date: "Jun", value: 32000 }, { date: "Jun", value: 42000 }, // Spike
        { date: "Jun", value: 38000 }, { date: "Jun", value: 30000 }, { date: "Jun", value: 28000 },
        { date: "Jun", value: 29500 }, { date: "Jun", value: 31000 }, { date: "Jun", value: 32500 },
        { date: "Jun", value: 34000 }, { date: "Jun", value: 35000 }, { date: "Jun", value: 31500 },
        // July 2025
        { date: "Jul", value: 27000 }, { date: "Jul", value: 28500 }, { date: "Jul", value: 30000 },
        { date: "Jul", value: 31500 }, { date: "Jul", value: 33000 }, { date: "Jul", value: 34500 },
        { date: "Jul", value: 36000 }, { date: "Jul", value: 32000 }, { date: "Jul", value: 29000 },
        { date: "Jul", value: 30500 }, { date: "Jul", value: 32000 }, { date: "Jul", value: 33500 },
        { date: "Jul", value: 35000 }, { date: "Jul", value: 36500 }, { date: "Jul", value: 33000 },
        // August 2025
        { date: "Aug", value: 28000 }, { date: "Aug", value: 29500 }, { date: "Aug", value: 31000 },
        { date: "Aug", value: 32500 }, { date: "Aug", value: 34000 }, { date: "Aug", value: 45000 }, // Spike
        { date: "Aug", value: 40000 }, { date: "Aug", value: 33000 }, { date: "Aug", value: 30000 },
        { date: "Aug", value: 31500 }, { date: "Aug", value: 33000 }, { date: "Aug", value: 34500 },
        { date: "Aug", value: 36000 }, { date: "Aug", value: 37000 }, { date: "Aug", value: 34000 }
      ]
    },

    // Monthly Active Users data
    monthlyActiveUsers: [
      { month: "Sep", value: 127000 },
      { month: "Oct", value: 185000 },
      { month: "Nov", value: 195000 },
      { month: "Dec", value: 215000 },
      { month: "2025", value: 219000 }, // January 2025 peak
      { month: "Feb", value: 192000 },
      { month: "Mar", value: 195000 },
      { month: "Apr", value: 182000 },
      { month: "May", value: 156000 },
      { month: "Jun", value: 154000 },
      { month: "Jul", value: 176000 },
      { month: "Aug", value: 180000 }
    ],
    mauStats: {
      peak: 219000,
      average: 202000,
      median: 182000
    },

    // Cumulative retention data (days vs percentage)
    cumulativeRetention: {
      buyers: [
        { days: 0, retention: 0 },
        { days: 3, retention: 25 },
        { days: 6, retention: 45 },
        { days: 9, retention: 58 },
        { days: 13, retention: 68 },
        { days: 18, retention: 75 },
        { days: 23, retention: 80 },
        { days: 28, retention: 84 },
        { days: 30, retention: 85.92 },
        { days: 33, retention: 87 },
        { days: 38, retention: 89 },
        { days: 43, retention: 90.5 },
        { days: 48, retention: 92 },
        { days: 53, retention: 93 },
        { days: 58, retention: 94 },
        { days: 63, retention: 94.5 },
        { days: 68, retention: 95 },
        { days: 73, retention: 95.3 },
        { days: 78, retention: 95.5 },
        { days: 83, retention: 95.7 },
        { days: 88, retention: 95.8 },
        { days: 93, retention: 95.9 },
        { days: 98, retention: 96 },
        { days: 104, retention: 96 },
        { days: 111, retention: 96 },
        { days: 118, retention: 96 },
        { days: 125, retention: 96 },
        { days: 132, retention: 96 },
        { days: 139, retention: 96 },
        { days: 146, retention: 96 },
        { days: 153, retention: 96 },
        { days: 160, retention: 96 },
        { days: 168, retention: 96 }
      ],
      nonBuyers: [
        { days: 0, retention: 0 },
        { days: 3, retention: 15 },
        { days: 6, retention: 28 },
        { days: 9, retention: 38 },
        { days: 13, retention: 45 },
        { days: 18, retention: 50 },
        { days: 23, retention: 54 },
        { days: 28, retention: 58 },
        { days: 30, retention: 60.87 },
        { days: 33, retention: 62 },
        { days: 38, retention: 64 },
        { days: 43, retention: 65.5 },
        { days: 48, retention: 67 },
        { days: 53, retention: 68 },
        { days: 58, retention: 69 },
        { days: 63, retention: 70 },
        { days: 68, retention: 70.5 },
        { days: 73, retention: 71 },
        { days: 78, retention: 71.5 },
        { days: 83, retention: 72 },
        { days: 88, retention: 72.3 },
        { days: 93, retention: 72.5 },
        { days: 98, retention: 72.7 },
        { days: 104, retention: 73 },
        { days: 111, retention: 73.2 },
        { days: 118, retention: 73.4 },
        { days: 125, retention: 73.5 },
        { days: 132, retention: 73.6 },
        { days: 139, retention: 73.7 },
        { days: 146, retention: 73.8 },
        { days: 153, retention: 73.9 },
        { days: 160, retention: 74 },
        { days: 168, retention: 74 }
      ]
    },

    // Session Duration Monthly Evolution
    sessionDurationMonthly: [
      { month: "Apr 24", duration: 8.8 },
      { month: "May 24", duration: 9.2 },
      { month: "Jun 24", duration: 10.0 },
      { month: "Jul 24", duration: 11.6 },
      { month: "Aug 24", duration: 10.9 },
      { month: "Sep 24", duration: 11.9 },
      { month: "Oct 24", duration: 12.2 },
      { month: "Nov 24", duration: 10.8 },
      { month: "Dec 24", duration: 11.0 },
      { month: "Jan 25", duration: 10.8 },
      { month: "Feb 25", duration: 11.3 },
      { month: "Mar 25", duration: 12.0 },
      { month: "Apr 25", duration: 12.8 },
      { month: "May 25", duration: 13.2 },
      { month: "Jun 25", duration: 12.5 },
      { month: "Jul 25", duration: 11.9 },
      { month: "Aug 25", duration: 12.4 }
    ],

    // Stickiness data
    stickiness: [
      { days: 1, percentage: 54.77 },
      { days: 2, percentage: 23.07 },
      { days: 3, percentage: 11.17 }
    ],

    // Social metrics
    socialMetrics: {
      dailyMessages: 1500,
      messagesPerChat: 2.41,
      avgChatDuration: 5.19,
      dailyComments: 310,
      commentsOnEvents: 113000,
      commentsOnBios: 9600,
      commentsOnVideos: 14100
    },

    // Push notifications
    pushNotifications: {
      totalUsers: 975000,
      avgTimeSpent: 0.54 // minutes
    },

    // News feed
    newsFeed: {
      totalUsers: 947000,
      period: "11 months"
    },

    // Events
    events: {
      totalViews: 12900000,
      uniqueUsers: 174000,
      avgInteractionsPerUser: 74
    }
  }
};

// Helper functions
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value: number): string {
  if (value === undefined || value === null) return '0';
  if (!value && value !== 0) return '0';
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toLocaleString();
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}