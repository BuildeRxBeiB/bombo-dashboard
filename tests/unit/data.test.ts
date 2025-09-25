import { bomboData, formatCurrency, formatNumber } from '@/lib/data';

/**
 * Unit Tests for Data Accuracy
 * Validates all critical metrics match requirements
 */
describe('BOMBO Data Accuracy Tests', () => {
  describe('Core Metrics Validation', () => {
    test('Total users should be 801,492', () => {
      expect(bomboData.metrics.totalUsers).toBe(801492);
    });

    test('Total GTV should be over $70M', () => {
      expect(bomboData.metrics.totalGTV).toBeGreaterThanOrEqual(70000000);
      expect(bomboData.metrics.totalGTV).toBe(70045672);
    });

    test('LTV:CAC ratio should be 25.3x', () => {
      expect(bomboData.metrics.ltvCacRatio).toBe(25.3);
    });

    test('Daily growth should be 1,302 users/day', () => {
      expect(bomboData.metrics.dailyGrowth2025).toBe(1302);
    });

    test('CAC should be $0.28', () => {
      expect(bomboData.metrics.cac).toBe(0.28);
    });

    test('LTV should be $6.98', () => {
      expect(bomboData.metrics.ltv).toBe(6.98);
    });

    test('Buyer retention should be 98%', () => {
      expect(bomboData.metrics.buyerRetention).toBe(98);
    });

    test('Market share should be 80%', () => {
      expect(bomboData.metrics.marketShare).toBe(80);
    });
  });

  describe('2025 YTD Data Validation', () => {
    test('2025 YTD revenue should be $5,090,102', () => {
      expect(bomboData.metrics.revenue2025YTD).toBe(5090102);
    });

    test('2025 YTD GTV should be $33,934,016', () => {
      expect(bomboData.metrics.gtv2025YTD).toBe(33934016);
    });

    test('2025 new users should be 316,369', () => {
      expect(bomboData.metrics.newUsers2025).toBe(316369);
    });

    test('Financial evolution should have 2025 YTD marked', () => {
      const ytd2025 = bomboData.financialEvolution.find(f => f.year === '2025 YTD');
      expect(ytd2025).toBeDefined();
      expect(ytd2025?.gtv).toBe(33934016);
      expect(ytd2025?.revenue).toBe(5090102);
    });
  });

  describe('User Growth Timeline Validation', () => {
    test('User growth should end at 801,492 in Aug 2025', () => {
      const lastPeriod = bomboData.userGrowth[bomboData.userGrowth.length - 1];
      expect(lastPeriod.period).toBe('Aug 2025');
      expect(lastPeriod.users).toBe(801492);
    });

    test('User growth should show consistent month-over-month increase', () => {
      for (let i = 1; i < bomboData.userGrowth.length; i++) {
        const current = bomboData.userGrowth[i];
        const previous = bomboData.userGrowth[i - 1];
        expect(current.users).toBeGreaterThan(previous.users);
      }
    });

    test('Pre-2024 foundation users should be 485,123', () => {
      const foundation = bomboData.userGrowth.find(g => g.period === 'Pre-2024');
      expect(foundation?.users).toBe(485123);
    });
  });

  describe('Financial Performance Validation', () => {
    test('Total revenue should be $9,352,983', () => {
      expect(bomboData.metrics.totalRevenue).toBe(9352983);
    });

    test('Contribution margin should be 56.93%', () => {
      expect(bomboData.metrics.contributionMargin).toBe(56.93);
    });

    test('Financial evolution should show year-over-year growth', () => {
      const years = bomboData.financialEvolution;
      for (let i = 1; i < years.length; i++) {
        expect(years[i].gtv).toBeGreaterThan(years[i - 1].gtv);
        expect(years[i].revenue).toBeGreaterThan(years[i - 1].revenue);
      }
    });

    test('2025 projected GTV should be $51M', () => {
      const ytd2025 = bomboData.financialEvolution.find(f => f.year === '2025 YTD');
      expect(ytd2025?.projected?.gtv).toBe(51000000);
    });

    test('2025 projected revenue should be $7.6M', () => {
      const ytd2025 = bomboData.financialEvolution.find(f => f.year === '2025 YTD');
      expect(ytd2025?.projected?.revenue).toBe(7600000);
    });
  });

  describe('Retention Metrics Validation', () => {
    test('Overall 90-day retention should be 79.2%', () => {
      expect(bomboData.metrics.overallRetention90Day).toBe(79.2);
    });

    test('Monthly retention for buyers should be 80%', () => {
      expect(bomboData.metrics.monthlyRetentionBuyers).toBe(80);
    });

    test('Buyer cohorts should show higher retention than non-buyer cohorts', () => {
      const buyerCohorts = bomboData.retentionCohorts.buyers;
      const nonBuyerCohorts = bomboData.retentionCohorts.nonBuyers;

      for (let i = 0; i < buyerCohorts.length; i++) {
        expect(buyerCohorts[i].m1).toBeGreaterThan(nonBuyerCohorts[i].m1);
        expect(buyerCohorts[i].m3).toBeGreaterThan(nonBuyerCohorts[i].m3);
        expect(buyerCohorts[i].m6).toBeGreaterThan(nonBuyerCohorts[i].m6);
      }
    });

    test('Retention cohorts should have proper structure', () => {
      const buyerCohorts = bomboData.retentionCohorts.buyers;
      buyerCohorts.forEach(cohort => {
        expect(cohort).toHaveProperty('month');
        expect(cohort).toHaveProperty('m0');
        expect(cohort.m0).toBe(100); // All cohorts start at 100%
        expect(cohort).toHaveProperty('m1');
        expect(cohort).toHaveProperty('m2');
        expect(cohort).toHaveProperty('m3');
        expect(cohort).toHaveProperty('m4');
        expect(cohort).toHaveProperty('m5');
        expect(cohort).toHaveProperty('m6');
      });
    });
  });

  describe('Engagement Metrics Validation', () => {
    test('Peak MAU should be 219,301', () => {
      expect(bomboData.metrics.peakMAU).toBe(219301);
    });

    test('Peak DAU should be 95,823', () => {
      expect(bomboData.metrics.peakDAU).toBe(95823);
    });

    test('Average session duration should be 12.4 minutes', () => {
      expect(bomboData.metrics.avgSessionDuration).toBe(12.4);
    });

    test('Session growth YoY should be 68%', () => {
      expect(bomboData.metrics.sessionGrowthYoY).toBe(68);
    });

    test('DAU/MAU ratio should be reasonable', () => {
      const dauMauRatio = bomboData.metrics.peakDAU / bomboData.metrics.peakMAU;
      expect(dauMauRatio).toBeGreaterThan(0.3); // Healthy engagement
      expect(dauMauRatio).toBeLessThan(0.6); // Realistic upper bound
    });
  });

  describe('Sales Metrics Validation', () => {
    test('Total purchasers should be 221,704', () => {
      expect(bomboData.metrics.totalPurchasers).toBe(221704);
    });

    test('Tickets sold should be 1,277,498', () => {
      expect(bomboData.metrics.ticketsSold).toBe(1277498);
    });

    test('Average tickets per purchaser should be reasonable', () => {
      const avgTickets = bomboData.metrics.ticketsSold / bomboData.metrics.totalPurchasers;
      expect(avgTickets).toBeGreaterThan(5);
      expect(avgTickets).toBeLessThan(6);
    });

    test('Purchaser conversion rate should be reasonable', () => {
      const conversionRate = (bomboData.metrics.totalPurchasers / bomboData.metrics.totalUsers) * 100;
      expect(conversionRate).toBeGreaterThan(25); // At least 25%
      expect(conversionRate).toBeLessThan(30); // Less than 30%
    });
  });

  describe('Utility Functions Validation', () => {
    test('formatCurrency should format numbers correctly', () => {
      expect(formatCurrency(1000000)).toMatch(/\$1.*M|\$1,000,000/);
      expect(formatCurrency(70045672)).toMatch(/\$70.*M|\$70,045,672/);
      expect(formatCurrency(0.28)).toMatch(/\$0\.28/);
    });

    test('formatNumber should format numbers correctly', () => {
      expect(formatNumber(801492)).toMatch(/801.*492|801,492|801.5K/);
      expect(formatNumber(1302)).toMatch(/1.*302|1,302|1.3K/);
      expect(formatNumber(25.3)).toMatch(/25\.3/);
    });
  });

  describe('Data Consistency Checks', () => {
    test('LTV/CAC ratio should match calculated value', () => {
      const calculatedRatio = bomboData.metrics.ltv / bomboData.metrics.cac;
      expect(Math.abs(calculatedRatio - bomboData.metrics.ltvCacRatio)).toBeLessThan(1);
    });

    test('Total revenue should be sum of all years', () => {
      const sumRevenue = bomboData.financialEvolution.reduce((sum, year) => sum + year.revenue, 0);
      expect(sumRevenue).toBe(bomboData.metrics.totalRevenue);
    });

    test('User growth should be monotonically increasing', () => {
      const growthValues = bomboData.userGrowth.map(g => g.users);
      for (let i = 1; i < growthValues.length; i++) {
        expect(growthValues[i]).toBeGreaterThanOrEqual(growthValues[i - 1]);
      }
    });

    test('2025 new users calculation should be correct', () => {
      const startOf2025 = bomboData.userGrowth.find(g => g.period === 'Pre-2024')?.users || 0;
      const endOf2025 = bomboData.userGrowth.find(g => g.period === 'Aug 2025')?.users || 0;
      const calculated2025NewUsers = endOf2025 - startOf2025;
      expect(calculated2025NewUsers).toBeCloseTo(bomboData.metrics.newUsers2025, -4); // Allow some difference
    });
  });

  describe('Market Opportunity Validation', () => {
    test('Market data should be properly structured', () => {
      expect(bomboData.market).toBeDefined();
      expect(bomboData.market.tam).toBeDefined();
      expect(bomboData.market.sam).toBeDefined();
      expect(bomboData.market.som).toBeDefined();
    });

    test('TAM should be $128B', () => {
      expect(bomboData.market.tam.value).toBe(128000000000);
    });

    test('SAM should be $26.5B', () => {
      expect(bomboData.market.sam.value).toBe(26500000000);
    });

    test('SOM should be $1B', () => {
      expect(bomboData.market.som.value).toBe(1000000000);
    });

    test('Market penetration timeline should be defined', () => {
      expect(bomboData.market.penetration).toBeDefined();
      expect(Array.isArray(bomboData.market.penetration)).toBeTruthy();
      expect(bomboData.market.penetration.length).toBeGreaterThan(0);
    });
  });
});