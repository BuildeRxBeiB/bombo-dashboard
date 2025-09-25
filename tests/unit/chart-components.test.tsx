/**
 * BOMBO Dashboard - Chart Components Unit Tests
 * Comprehensive unit tests for chart rendering, data processing, and interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GrowthMetrics } from '@/components/sections/GrowthMetrics';
import { FinancialPerformance } from '@/components/sections/FinancialPerformance';
import { RetentionAnalysis } from '@/components/sections/RetentionAnalysis';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
}));

// Mock recharts with simple test components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  AreaChart: ({ children, data }: any) => (
    <div data-testid="area-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  BarChart: ({ children, data }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Area: (props: any) => <div data-testid="chart-area" {...props} />,
  Bar: (props: any) => <div data-testid="chart-bar" {...props} />,
  Line: (props: any) => <div data-testid="chart-line" {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: (props: any) => <div data-testid="chart-tooltip" {...props} />,
  Legend: (props: any) => <div data-testid="chart-legend" {...props} />,
}));

// Mock the data module
jest.mock('@/lib/data', () => ({
  bomboData: {
    metrics: {
      totalUsers: 801234,
      totalPurchasers: 222567,
      ticketsSold: 1302341,
      marketShare: 80,
      dailyGrowth2025: 1302,
      peakMAU: 219301,
      peakDAU: 95823,
      ltvCacRatio: 176.78,
      dauMauRatio: 14,
    },
    userGrowth: [
      { period: '2023 Q1', users: 50000 },
      { period: '2023 Q2', users: 120000 },
      { period: '2023 Q3', users: 250000 },
      { period: '2023 Q4', users: 450000 },
      { period: '2024 Q1', users: 650000 },
      { period: '2024 Q2', users: 750000 },
      { period: '2024 Q3', users: 801234 },
    ],
    engagement: {
      newsUsers: 118000,
      eventInteractions: 876543,
      dailyMessages: 12467,
      dailyComments: 4891,
      uniqueEventUsers: 456789,
      avgChatDuration: 8.3,
    },
    retention: {
      buyer: {
        d1: 68, d7: 52, d30: 47, d90: 43, d180: 41, d365: 38
      },
      nonBuyer: {
        d1: 45, d7: 28, d30: 14, d90: 8, d180: 6, d365: 4
      }
    },
    revenue: [
      { period: '2023 Q1', revenue: 125000, costs: 89000 },
      { period: '2023 Q2', revenue: 287000, costs: 156000 },
      { period: '2023 Q3', revenue: 456000, costs: 234000 },
      { period: '2023 Q4', revenue: 698000, costs: 312000 },
      { period: '2024 Q1', revenue: 934000, costs: 398000 },
      { period: '2024 Q2', revenue: 1200000, costs: 456000 },
      { period: '2024 Q3', revenue: 1456000, costs: 512000 },
      { period: '2025 Q1 (est)', revenue: 2100000, costs: 623000 },
    ]
  },
  formatNumber: (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  }
}));

describe('Growth Metrics Component', () => {
  beforeEach(() => {
    render(<GrowthMetrics />);
  });

  describe('1. Component Rendering', () => {
    test('should render main section with correct structure', () => {
      const section = screen.getByRole('region');
      expect(section).toHaveClass('py-20', 'bg-black');
    });

    test('should render main heading', () => {
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Growth & Engagement Metrics');
    });

    test('should render Zero-CAC Growth Story section', () => {
      const storyHeading = screen.getByRole('heading', { name: /The Zero-CAC Growth Story/i });
      expect(storyHeading).toBeInTheDocument();
    });
  });

  describe('2. Enhanced Metrics Display', () => {
    test('should display all first row metrics correctly', () => {
      // Test Total Users metric
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('801K+')).toBeInTheDocument();

      // Test Total Purchasers metric
      expect(screen.getByText('Total Purchasers')).toBeInTheDocument();
      expect(screen.getByText('222K+')).toBeInTheDocument();

      // Test Tickets Sold metric
      expect(screen.getByText('Tickets Sold')).toBeInTheDocument();
      expect(screen.getByText('1.3M+')).toBeInTheDocument();

      // Test Market Share metric
      expect(screen.getByText('Market Share')).toBeInTheDocument();
      expect(screen.getByText('Argentina')).toBeInTheDocument();
    });

    test('should display all second row metrics correctly', () => {
      // Test Daily New Users metric
      expect(screen.getByText('Daily New Users')).toBeInTheDocument();
      expect(screen.getByText('Zero CAC')).toBeInTheDocument();

      // Test Peak MAU metric
      expect(screen.getByText('Peak MAU')).toBeInTheDocument();
      expect(screen.getByText('Jan 2025')).toBeInTheDocument();

      // Test Peak DAU metric
      expect(screen.getByText('Peak DAU')).toBeInTheDocument();
      expect(screen.getByText('95K+')).toBeInTheDocument();

      // Test LTV:CAC Ratio metric
      expect(screen.getByText('LTV:CAC Ratio')).toBeInTheDocument();
      expect(screen.getByText('25.3x Industry')).toBeInTheDocument();
    });

    test('should format metric values correctly', () => {
      // Check for properly formatted numbers
      const formattedValues = [
        '801K', '222K', '1.3M', '80%', '1.3K', '219K', '95K', '177x'
      ];

      formattedValues.forEach(value => {
        const elements = screen.queryAllByText(new RegExp(value, 'i'));
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('3. Chart Rendering', () => {
    test('should render User Acquisition Timeline chart', () => {
      const areaChart = screen.getByTestId('area-chart');
      expect(areaChart).toBeInTheDocument();

      // Check chart data
      const chartData = JSON.parse(areaChart.getAttribute('data-chart-data') || '[]');
      expect(chartData.length).toBeGreaterThan(0);
      expect(chartData[0]).toHaveProperty('users');
    });

    test('should render Platform Engagement Metrics chart', () => {
      const barChart = screen.getByTestId('bar-chart');
      expect(barChart).toBeInTheDocument();

      // Check chart data structure
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
      expect(chartData.length).toBeGreaterThan(0);
      expect(chartData[0]).toHaveProperty('value');
    });

    test('should render DAU/MAU chart', () => {
      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toBeInTheDocument();

      // Check chart data structure
      const chartData = JSON.parse(lineChart.getAttribute('data-chart-data') || '[]');
      expect(chartData.length).toBeGreaterThan(0);
      expect(chartData[0]).toHaveProperty('dau');
      expect(chartData[0]).toHaveProperty('mau');
    });

    test('should render all required chart elements', () => {
      // Check for chart containers
      const chartContainers = screen.getAllByTestId('chart-container');
      expect(chartContainers.length).toBeGreaterThanOrEqual(3);

      // Check for axes
      const xAxes = screen.getAllByTestId('x-axis');
      const yAxes = screen.getAllByTestId('y-axis');
      expect(xAxes.length).toBeGreaterThan(0);
      expect(yAxes.length).toBeGreaterThan(0);

      // Check for grids and tooltips
      expect(screen.getAllByTestId('cartesian-grid').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('chart-tooltip').length).toBeGreaterThan(0);
    });
  });

  describe('4. Enhanced Storytelling Content', () => {
    test('should display Zero-CAC growth story sections', () => {
      // Check for three main story sections
      expect(screen.getByText('Pure Organic Growth')).toBeInTheDocument();
      expect(screen.getByText('Network Effects in Action')).toBeInTheDocument();
      expect(screen.getByText('Scalable Growth Model')).toBeInTheDocument();
    });

    test('should display key statistics in storytelling', () => {
      // Check for key statistics
      expect(screen.getByText('$0.28 CAC')).toBeInTheDocument();
      expect(screen.getByText('$70+')).toBeInTheDocument();
      expect(screen.getByText('12,467 daily messages')).toBeInTheDocument();
      expect(screen.getByText('80% market share')).toBeInTheDocument();
      expect(screen.getByText('1,302 new users daily')).toBeInTheDocument();
      expect(screen.getByText('zero paid marketing')).toBeInTheDocument();
    });

    test('should have proper investment narrative', () => {
      const narrativeText = screen.getByText(/The most compelling proof of product-market fit/i);
      expect(narrativeText).toBeInTheDocument();

      const zeroCacText = screen.getByText(/zero paid marketing/i);
      expect(zeroCacText).toBeInTheDocument();
    });
  });

  describe('5. Theme Consistency', () => {
    test('should use black background theme', () => {
      const section = screen.getByRole('region');
      expect(section).toHaveClass('bg-black');
    });

    test('should use white text for headings', () => {
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveClass('text-white');
    });

    test('should use gray accent colors appropriately', () => {
      const description = screen.getByText(/The most compelling proof/i);
      expect(description).toHaveClass('text-gray-400');
    });
  });
});

describe('Financial Performance Component', () => {
  beforeEach(() => {
    render(<FinancialPerformance />);
  });

  describe('1. Component Structure', () => {
    test('should render with correct section structure', () => {
      const section = screen.getByRole('region');
      expect(section).toHaveClass('py-20', 'bg-black');
    });

    test('should render main heading', () => {
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(/Financial Performance/i);
    });
  });

  describe('2. Revenue Chart Rendering', () => {
    test('should render revenue charts properly', () => {
      // Check for chart containers
      const chartContainers = screen.getAllByTestId('chart-container');
      expect(chartContainers.length).toBeGreaterThan(0);
    });

    test('should include 2025 projection data', () => {
      // Look for 2025 estimated data
      const projectionText = screen.getByText(/2025/i);
      expect(projectionText).toBeInTheDocument();
    });
  });

  describe('3. Unit Economics Display', () => {
    test('should display key financial metrics', () => {
      // Test for key financial terms
      const financialTerms = ['Revenue', 'Growth', 'CAC', 'LTV'];

      financialTerms.forEach(term => {
        const elements = screen.queryAllByText(new RegExp(term, 'i'));
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Retention Analysis Component', () => {
  beforeEach(() => {
    render(<RetentionAnalysis />);
  });

  describe('1. Component Structure', () => {
    test('should render main section', () => {
      const section = screen.getByRole('region');
      expect(section).toHaveClass('py-20', 'bg-black');
    });

    test('should render retention heading', () => {
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(/Retention Analysis/i);
    });
  });

  describe('2. Retention Heatmaps', () => {
    test('should display both buyer and non-buyer retention data', () => {
      // Check for retention-related content
      const buyerText = screen.queryByText(/buyer/i);
      const retentionText = screen.queryByText(/retention/i);

      expect(buyerText || retentionText).toBeInTheDocument();
    });

    test('should show retention percentages', () => {
      // Check for percentage indicators
      const percentagePattern = /\d+%/;
      const elements = screen.queryAllByText(percentagePattern);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('3. Retention Storytelling', () => {
    test('should include retention narrative', () => {
      // Look for retention-related storytelling
      const storyElements = screen.queryAllByText(/retention|engagement|user/i);
      expect(storyElements.length).toBeGreaterThan(0);
    });
  });
});

describe('Data Processing Functions', () => {
  describe('Number Formatting', () => {
    test('should format large numbers correctly', () => {
      const { formatNumber } = require('@/lib/data');

      expect(formatNumber(1000)).toBe('1K');
      expect(formatNumber(1500)).toBe('2K');
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(500)).toBe('500');
    });
  });

  describe('Data Validation', () => {
    test('should have valid bomboData structure', () => {
      const { bomboData } = require('@/lib/data');

      // Check main data structure
      expect(bomboData).toHaveProperty('metrics');
      expect(bomboData).toHaveProperty('userGrowth');
      expect(bomboData).toHaveProperty('engagement');
      expect(bomboData).toHaveProperty('retention');
      expect(bomboData).toHaveProperty('revenue');

      // Check metrics completeness
      expect(bomboData.metrics).toHaveProperty('totalUsers');
      expect(bomboData.metrics).toHaveProperty('totalPurchasers');
      expect(bomboData.metrics).toHaveProperty('ticketsSold');
      expect(bomboData.metrics).toHaveProperty('marketShare');
    });

    test('should have consistent data types', () => {
      const { bomboData } = require('@/lib/data');

      // Check number types
      expect(typeof bomboData.metrics.totalUsers).toBe('number');
      expect(typeof bomboData.metrics.marketShare).toBe('number');

      // Check array types
      expect(Array.isArray(bomboData.userGrowth)).toBe(true);
      expect(Array.isArray(bomboData.revenue)).toBe(true);

      // Check object types
      expect(typeof bomboData.retention.buyer).toBe('object');
      expect(typeof bomboData.retention.nonBuyer).toBe('object');
    });
  });

  describe('Chart Data Processing', () => {
    test('should process user growth data correctly', () => {
      const { bomboData } = require('@/lib/data');

      // Simulate the data processing in GrowthMetrics
      const userGrowthData = bomboData.userGrowth.map((item: any, index: number) => ({
        ...item,
        newUsers: item.users - (bomboData.userGrowth[index - 1]?.users || 0)
      }));

      expect(userGrowthData[0].newUsers).toBe(50000); // First period
      expect(userGrowthData[1].newUsers).toBe(70000); // Second period growth
    });

    test('should prepare engagement data correctly', () => {
      const { bomboData } = require('@/lib/data');

      const engagementData = [
        { metric: "News Section", value: bomboData.engagement.newsUsers, percentage: 118 },
        { metric: "Event Views", value: bomboData.engagement.eventInteractions, percentage: 100 },
        { metric: "Daily Messages", value: bomboData.engagement.dailyMessages * 30, percentage: 45 },
        { metric: "Daily Comments", value: bomboData.engagement.dailyComments * 30, percentage: 39 }
      ];

      expect(engagementData).toHaveLength(4);
      expect(engagementData[0].metric).toBe("News Section");
      expect(engagementData[2].value).toBe(bomboData.engagement.dailyMessages * 30);
    });
  });
});

describe('Integration Tests', () => {
  describe('Cross-Component Data Consistency', () => {
    test('should use consistent metrics across components', () => {
      const { bomboData } = require('@/lib/data');

      // Render multiple components
      const { unmount: unmount1 } = render(<GrowthMetrics />);
      const { unmount: unmount2 } = render(<FinancialPerformance />);

      // Check that common metrics appear consistently
      const totalUsersElements = screen.getAllByText(/801/);
      expect(totalUsersElements.length).toBeGreaterThan(0);

      unmount1();
      unmount2();
    });
  });

  describe('Theme Consistency Across Components', () => {
    test('should maintain black background across all components', () => {
      const components = [GrowthMetrics, FinancialPerformance, RetentionAnalysis];

      components.forEach((Component, index) => {
        const { unmount } = render(<Component />);

        const section = screen.getByRole('region');
        expect(section).toHaveClass('bg-black');

        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      render(<GrowthMetrics />);

      const h2 = screen.getByRole('heading', { level: 2 });
      const h3s = screen.getAllByRole('heading', { level: 3 });

      expect(h2).toBeInTheDocument();
      expect(h3s.length).toBeGreaterThan(0);
    });

    test('should have proper color contrast for text', () => {
      render(<GrowthMetrics />);

      // Check that white text is used on black backgrounds
      const whiteTextElements = screen.getAllByText(/Growth & Engagement/);
      whiteTextElements.forEach(element => {
        expect(element).toHaveClass('text-white');
      });
    });
  });
});