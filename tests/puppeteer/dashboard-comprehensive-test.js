const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const VIEWPORT_DESKTOP = { width: 1920, height: 1080 };
const VIEWPORT_TABLET = { width: 768, height: 1024 };
const VIEWPORT_MOBILE = { width: 375, height: 667 };

// Expected metrics based on requirements
const EXPECTED_METRICS = {
  hero: {
    users: '801K+',
    gtv: '$70M+',
    ltvCac: '35.3x',
    cac: '$0.28',
    peakMau: '219K',
    tickets: '1.3M',  // Corrected value from data.ts
    churn: '20.8%'
  },
  financial: {
    yearLabel: '2025 YTD',
    totalEstimate: '$5.1M',
    yoyGrowth: '+67%'
  }
};

// Test results storage
let testResults = {
  timestamp: new Date().toISOString(),
  url: BASE_URL,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Helper function to log test results
function logTest(category, testName, status, details = null, screenshot = null) {
  const result = {
    category,
    testName,
    status, // 'passed', 'failed', 'warning'
    details,
    screenshot,
    timestamp: new Date().toISOString()
  };

  testResults.tests.push(result);
  testResults.summary.total++;
  testResults.summary[status]++;

  const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
  console.log(`${icon} [${category}] ${testName}: ${status.toUpperCase()}${details ? ` - ${details}` : ''}`);
}

// Helper function to take screenshots
async function takeScreenshot(page, name) {
  const screenshotDir = path.join(__dirname, 'screenshots');
  await fs.mkdir(screenshotDir, { recursive: true });
  const filename = `${name}_${Date.now()}.png`;
  const filepath = path.join(screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filename;
}

// Test 1: Visual Testing - Check all sections render correctly
async function testVisualRendering(page) {
  console.log('\n🎨 Starting Visual Testing...\n');

  try {
    // Check if main container exists
    const mainContainer = await page.$('main');
    if (mainContainer) {
      logTest('Visual', 'Main container renders', 'passed');
    } else {
      logTest('Visual', 'Main container renders', 'failed', 'Main container not found');
    }

    // Check navigation sidebar (it's a div with fixed positioning)
    const sidebar = await page.$('div[class*="fixed"][class*="left-0"][class*="top-0"]');
    if (sidebar) {
      logTest('Visual', 'Navigation sidebar visible', 'passed');
    } else {
      logTest('Visual', 'Navigation sidebar visible', 'failed', 'Sidebar not found');
    }

    // Check all major sections
    const sections = [
      { id: '#hero', name: 'Hero Section' },
      { id: '#financial', name: 'Financial Performance' },
      { id: '#engagement', name: 'Engagement Highlights' },
      { id: '#growth', name: 'Growth Metrics' },
      { id: '#retention', name: 'Retention Analysis' },
      { id: '#market', name: 'Market Opportunity' }
    ];

    for (const section of sections) {
      const element = await page.$(section.id);
      if (element) {
        const isVisible = await element.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.height > 0 && rect.width > 0;
        });

        if (isVisible) {
          logTest('Visual', `${section.name} renders correctly`, 'passed');
        } else {
          logTest('Visual', `${section.name} renders correctly`, 'failed', 'Section has no dimensions');
        }
      } else {
        logTest('Visual', `${section.name} renders correctly`, 'failed', 'Section not found');
      }
    }

    // Check for layout issues
    const overlappingElements = await page.evaluate(() => {
      const sections = document.querySelectorAll('[id]');
      const overlaps = [];

      for (let i = 0; i < sections.length; i++) {
        for (let j = i + 1; j < sections.length; j++) {
          const rect1 = sections[i].getBoundingClientRect();
          const rect2 = sections[j].getBoundingClientRect();

          if (rect1.left < rect2.right &&
              rect1.right > rect2.left &&
              rect1.top < rect2.bottom &&
              rect1.bottom > rect2.top) {
            overlaps.push({
              element1: sections[i].id,
              element2: sections[j].id
            });
          }
        }
      }
      return overlaps;
    });

    if (overlappingElements.length === 0) {
      logTest('Visual', 'No overlapping sections detected', 'passed');
    } else {
      logTest('Visual', 'No overlapping sections detected', 'failed',
        `Found ${overlappingElements.length} overlapping elements`);
    }

    // Take full page screenshot
    const screenshot = await takeScreenshot(page, 'visual_full_page');
    logTest('Visual', 'Full page screenshot captured', 'passed', null, screenshot);

  } catch (error) {
    logTest('Visual', 'Visual testing', 'failed', error.message);
  }
}

// Test 2: Data Accuracy - Verify all metrics display correctly
async function testDataAccuracy(page) {
  console.log('\n📊 Starting Data Accuracy Testing...\n');

  try {
    // Test Hero Section Metrics
    const heroMetrics = [
      { selector: 'text*=801K+', metric: 'Users count', expected: '801K+' },
      { selector: 'text*=$70M+', metric: 'GTV', expected: '$70M+' },
      { selector: 'text*=35.3x', metric: 'LTV:CAC ratio', expected: '35.3x' },
      { selector: 'text*=$0.28', metric: 'CAC', expected: '$0.28' },
      { selector: 'text*=219K', metric: 'Peak MAU', expected: '219K' },
      { selector: 'text*=1.3M', metric: 'Tickets sold', expected: '1.3M' },
      { selector: 'text*=20.8%', metric: 'Churn rate', expected: '20.8%' }
    ];

    for (const metric of heroMetrics) {
      const element = await page.$(`::-p-text(${metric.expected})`);
      if (element) {
        logTest('Data Accuracy', `Hero - ${metric.metric}`, 'passed', `Found: ${metric.expected}`);
      } else {
        logTest('Data Accuracy', `Hero - ${metric.metric}`, 'failed',
          `Expected "${metric.expected}" not found`);
      }
    }

    // Test Financial Performance Section
    // Check for "2025 YTD" label
    const ytdLabel = await page.$(`::-p-text(2025 YTD)`);
    if (ytdLabel) {
      logTest('Data Accuracy', 'Financial - 2025 YTD label', 'passed');
    } else {
      logTest('Data Accuracy', 'Financial - 2025 YTD label', 'failed',
        'Expected "2025 YTD" label not found');
    }

    // Check for $5.1M total (not $5.2M)
    const totalEstimate = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => el.textContent?.includes('$5.1M'));
    });

    if (totalEstimate) {
      logTest('Data Accuracy', 'Financial - Total 2025 estimate', 'passed', 'Shows $5.1M');
    } else {
      logTest('Data Accuracy', 'Financial - Total 2025 estimate', 'failed',
        'Expected $5.1M not found');
    }

    // Check that $5.2M is NOT present
    const oldEstimate = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => el.textContent?.includes('$5.2M'));
    });

    if (!oldEstimate) {
      logTest('Data Accuracy', 'Financial - Old estimate removed', 'passed',
        '$5.2M correctly removed');
    } else {
      logTest('Data Accuracy', 'Financial - Old estimate removed', 'failed',
        'Old value $5.2M still present');
    }

    // Check YoY growth
    const yoyGrowth = await page.$(`::-p-text(+67%)`);
    if (yoyGrowth) {
      logTest('Data Accuracy', 'YoY Growth - Overall +67%', 'passed');
    } else {
      logTest('Data Accuracy', 'YoY Growth - Overall +67%', 'failed',
        'Expected +67% growth not found');
    }

    // Check for monthly YoY breakdown
    const monthlyGrowth = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const hasMonthly = elements.some(el => {
        const text = el.textContent || '';
        return text.includes('Jan') || text.includes('Feb') || text.includes('Mar');
      });
      return hasMonthly;
    });

    if (monthlyGrowth) {
      logTest('Data Accuracy', 'YoY Growth - Monthly breakdown present', 'passed');
    } else {
      logTest('Data Accuracy', 'YoY Growth - Monthly breakdown present', 'warning',
        'Monthly breakdown might be missing');
    }

  } catch (error) {
    logTest('Data Accuracy', 'Data accuracy testing', 'failed', error.message);
  }
}

// Test 3: Navigation - Test sidebar navigation
async function testNavigation(page) {
  console.log('\n🧭 Starting Navigation Testing...\n');

  try {
    // Get all navigation links (they are buttons not anchors in this implementation)
    const navLinks = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('nav button'));
      return buttons.map(button => ({
        text: button.textContent?.trim(),
        isButton: true
      }));
    });

    if (navLinks.length > 0) {
      logTest('Navigation', 'Navigation links found', 'passed',
        `Found ${navLinks.length} navigation links`);
    } else {
      logTest('Navigation', 'Navigation links found', 'failed', 'No navigation links found');
    }

    // Test smooth scrolling to each section (matching actual navigation labels)
    const sections = [
      { href: '#hero', name: 'Overview' },
      { href: '#financial', name: 'Financial' },
      { href: '#engagement', name: 'Engagement' },
      { href: '#growth', name: 'Growth' },
      { href: '#retention', name: 'Retention' },
      { href: '#market', name: 'Market' }
    ];

    for (const section of sections) {
      try {
        // Find and click the navigation button for this section
        const button = await page.evaluateHandle((sectionName) => {
          const buttons = Array.from(document.querySelectorAll('nav button'));
          return buttons.find(btn => btn.textContent?.toLowerCase().includes(sectionName.toLowerCase()));
        }, section.name);

        if (button && button.asElement()) {
          await button.click();
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for scroll animation

          // Check if section is in viewport
          const inViewport = await page.evaluate((sectionId) => {
            const element = document.querySelector(sectionId);
            if (!element) return false;

            const rect = element.getBoundingClientRect();
            return rect.top >= 0 && rect.top <= window.innerHeight;
          }, section.href);

          if (inViewport) {
            logTest('Navigation', `Scroll to ${section.name} section`, 'passed');
          } else {
            logTest('Navigation', `Scroll to ${section.name} section`, 'failed',
              'Section not in viewport after click');
          }
        } else {
          logTest('Navigation', `Scroll to ${section.name} section`, 'failed',
            'Navigation button not found');
        }
      } catch (error) {
        logTest('Navigation', `Scroll to ${section.name} section`, 'failed', error.message);
      }
    }

    // Test navigation sidebar toggle on mobile
    await page.setViewport(VIEWPORT_MOBILE);
    const mobileMenuToggle = await page.$('[aria-label*="menu"], [class*="menu-toggle"]');

    if (mobileMenuToggle) {
      logTest('Navigation', 'Mobile menu toggle present', 'passed');
    } else {
      logTest('Navigation', 'Mobile menu toggle present', 'warning',
        'Mobile menu toggle might be missing');
    }

    // Reset to desktop viewport
    await page.setViewport(VIEWPORT_DESKTOP);

  } catch (error) {
    logTest('Navigation', 'Navigation testing', 'failed', error.message);
  }
}

// Test 4: Responsive Design
async function testResponsiveDesign(page) {
  console.log('\n📱 Starting Responsive Design Testing...\n');

  const viewports = [
    { name: 'Desktop', ...VIEWPORT_DESKTOP },
    { name: 'Tablet', ...VIEWPORT_TABLET },
    { name: 'Mobile', ...VIEWPORT_MOBILE }
  ];

  for (const viewport of viewports) {
    try {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for layout adjustment

      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (!hasHorizontalScroll) {
        logTest('Responsive', `${viewport.name} - No horizontal scroll`, 'passed');
      } else {
        logTest('Responsive', `${viewport.name} - No horizontal scroll`, 'failed',
          'Horizontal scroll detected');
      }

      // Check if content is visible
      const contentVisible = await page.evaluate(() => {
        const mainContent = document.querySelector('main');
        if (!mainContent) return false;
        const rect = mainContent.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (contentVisible) {
        logTest('Responsive', `${viewport.name} - Content visible`, 'passed');
      } else {
        logTest('Responsive', `${viewport.name} - Content visible`, 'failed');
      }

      // Check text readability
      const textSizes = await page.evaluate(() => {
        const texts = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6'));
        return texts.map(el => {
          const style = window.getComputedStyle(el);
          return {
            tag: el.tagName,
            fontSize: parseInt(style.fontSize),
            isReadable: parseInt(style.fontSize) >= 12
          };
        });
      });

      const unreadableTexts = textSizes.filter(t => !t.isReadable);
      if (unreadableTexts.length === 0) {
        logTest('Responsive', `${viewport.name} - Text readability`, 'passed');
      } else {
        logTest('Responsive', `${viewport.name} - Text readability`, 'warning',
          `${unreadableTexts.length} elements with font size < 12px`);
      }

      // Take screenshot for each viewport
      const screenshot = await takeScreenshot(page, `responsive_${viewport.name.toLowerCase()}`);
      logTest('Responsive', `${viewport.name} screenshot captured`, 'passed', null, screenshot);

    } catch (error) {
      logTest('Responsive', `${viewport.name} testing`, 'failed', error.message);
    }
  }

  // Reset to desktop viewport
  await page.setViewport(VIEWPORT_DESKTOP);
}

// Test 5: Chart Rendering
async function testChartRendering(page) {
  console.log('\n📈 Starting Chart Rendering Testing...\n');

  try {
    // Check for SVG charts (Recharts uses SVG)
    const svgCharts = await page.$$('svg[class*="recharts"], .recharts-wrapper svg');

    if (svgCharts.length > 0) {
      logTest('Charts', 'Chart elements found', 'passed',
        `Found ${svgCharts.length} chart elements`);
    } else {
      logTest('Charts', 'Chart elements found', 'failed', 'No chart elements found');
    }

    // Check each chart for proper rendering
    for (let i = 0; i < svgCharts.length; i++) {
      const chartInfo = await svgCharts[i].evaluate((svg) => {
        const rect = svg.getBoundingClientRect();
        const hasContent = svg.querySelectorAll('path, rect, circle, line').length > 0;
        const hasLabels = svg.querySelectorAll('text').length > 0;

        return {
          width: rect.width,
          height: rect.height,
          hasContent,
          hasLabels,
          isVisible: rect.width > 0 && rect.height > 0
        };
      });

      if (chartInfo.isVisible && chartInfo.hasContent) {
        logTest('Charts', `Chart ${i + 1} renders correctly`, 'passed',
          `Dimensions: ${chartInfo.width}x${chartInfo.height}`);
      } else {
        logTest('Charts', `Chart ${i + 1} renders correctly`, 'failed',
          'Chart is not visible or has no content');
      }

      if (chartInfo.hasLabels) {
        logTest('Charts', `Chart ${i + 1} has labels`, 'passed');
      } else {
        logTest('Charts', `Chart ${i + 1} has labels`, 'warning', 'No labels found');
      }
    }

    // Check for specific chart types
    const chartTypes = [
      { selector: '[class*="bar-chart"], [class*="BarChart"]', name: 'Bar Chart' },
      { selector: '[class*="line-chart"], [class*="LineChart"]', name: 'Line Chart' },
      { selector: '[class*="pie-chart"], [class*="PieChart"]', name: 'Pie Chart' }
    ];

    for (const chartType of chartTypes) {
      const elements = await page.$$(chartType.selector);
      if (elements.length > 0) {
        logTest('Charts', `${chartType.name} present`, 'passed',
          `Found ${elements.length} ${chartType.name}(s)`);
      }
    }

    // Verify no "Use of Funds" pie chart (as it was removed)
    const useOfFunds = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => el.textContent?.toLowerCase().includes('use of funds'));
    });

    if (!useOfFunds) {
      logTest('Charts', 'Use of Funds chart removed', 'passed',
        'Correctly removed as per requirements');
    } else {
      logTest('Charts', 'Use of Funds chart removed', 'failed',
        'Use of Funds chart still present');
    }

  } catch (error) {
    logTest('Charts', 'Chart rendering testing', 'failed', error.message);
  }
}

// Test 6: Typography Consistency
async function testTypography(page) {
  console.log('\n🔤 Starting Typography Testing...\n');

  try {
    // Check for JetBrains Mono font
    const fontFamilies = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const fonts = new Set();

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontFamily = style.fontFamily;
        if (fontFamily) {
          fonts.add(fontFamily);
        }
      });

      return Array.from(fonts);
    });

    const hasJetBrainsMono = fontFamilies.some(font =>
      font.toLowerCase().includes('jetbrains') || font.toLowerCase().includes('mono')
    );

    if (hasJetBrainsMono) {
      logTest('Typography', 'JetBrains Mono font applied', 'passed',
        'Found monospace font in use');
    } else {
      logTest('Typography', 'JetBrains Mono font applied', 'warning',
        'JetBrains Mono might not be applied consistently');
    }

    // Check heading hierarchy
    const headingHierarchy = await page.evaluate(() => {
      const h1Count = document.querySelectorAll('h1').length;
      const h2Count = document.querySelectorAll('h2').length;
      const h3Count = document.querySelectorAll('h3').length;

      return { h1Count, h2Count, h3Count };
    });

    if (headingHierarchy.h1Count >= 1) {
      logTest('Typography', 'Heading hierarchy', 'passed',
        `H1: ${headingHierarchy.h1Count}, H2: ${headingHierarchy.h2Count}, H3: ${headingHierarchy.h3Count}`);
    } else {
      logTest('Typography', 'Heading hierarchy', 'warning',
        'No H1 elements found');
    }

    // Check text contrast
    const contrastIssues = await page.evaluate(() => {
      const issues = [];
      const texts = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span'));

      texts.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;

        // Simple check for very light text on light background
        if (color && color.includes('255') && bgColor && bgColor.includes('255')) {
          issues.push({
            element: el.tagName,
            color,
            bgColor
          });
        }
      });

      return issues;
    });

    if (contrastIssues.length === 0) {
      logTest('Typography', 'Text contrast', 'passed', 'No obvious contrast issues');
    } else {
      logTest('Typography', 'Text contrast', 'warning',
        `${contrastIssues.length} potential contrast issues`);
    }

    // Check font sizes consistency
    const fontSizes = await page.evaluate(() => {
      const sizes = new Map();
      const elements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6'));

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontSize = style.fontSize;
        const tag = el.tagName.toLowerCase();

        if (!sizes.has(tag)) {
          sizes.set(tag, new Set());
        }
        sizes.get(tag)?.add(fontSize);
      });

      const result = {};
      sizes.forEach((sizeSet, tag) => {
        result[tag] = Array.from(sizeSet);
      });

      return result;
    });

    let inconsistentSizes = false;
    Object.entries(fontSizes).forEach(([tag, sizes]) => {
      if (sizes.length > 2) {
        inconsistentSizes = true;
      }
    });

    if (!inconsistentSizes) {
      logTest('Typography', 'Font size consistency', 'passed');
    } else {
      logTest('Typography', 'Font size consistency', 'warning',
        'Multiple font sizes detected for same element types');
    }

  } catch (error) {
    logTest('Typography', 'Typography testing', 'failed', error.message);
  }
}

// Test 7: Section Positioning (verify changes mentioned in requirements)
async function testSectionPositioning(page) {
  console.log('\n📍 Starting Section Positioning Testing...\n');

  try {
    // Check that Executive Overview section was removed
    const executiveOverview = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('executive overview');
      });
    });

    if (!executiveOverview) {
      logTest('Section Positioning', 'Executive Overview removed', 'passed');
    } else {
      logTest('Section Positioning', 'Executive Overview removed', 'failed',
        'Executive Overview still present');
    }

    // Check Customer Economics table position (should be after Monthly Revenue Comparison)
    const sections = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('h2, h3, [class*="title"]'));
      return elements.map(el => el.textContent?.trim()).filter(Boolean);
    });

    const monthlyIndex = sections.findIndex(s =>
      s.toLowerCase().includes('monthly') && s.toLowerCase().includes('revenue')
    );
    const customerIndex = sections.findIndex(s =>
      s.toLowerCase().includes('customer') && s.toLowerCase().includes('economic')
    );

    if (monthlyIndex > -1 && customerIndex > -1 && customerIndex > monthlyIndex) {
      logTest('Section Positioning', 'Customer Economics after Monthly Revenue', 'passed');
    } else if (customerIndex === -1) {
      logTest('Section Positioning', 'Customer Economics after Monthly Revenue', 'warning',
        'Customer Economics section not found');
    } else {
      logTest('Section Positioning', 'Customer Economics after Monthly Revenue', 'failed',
        'Incorrect positioning');
    }

    // Check Growth Trajectory alongside Growth Projections
    const growthTrajectory = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => {
        const text = el.textContent || '';
        return text.includes('Growth Trajectory');
      });
    });

    const growthProjections = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => {
        const text = el.textContent || '';
        return text.includes('Growth Projection');
      });
    });

    if (growthTrajectory && growthProjections) {
      logTest('Section Positioning', 'Growth sections present', 'passed',
        'Both Growth Trajectory and Projections found');
    } else {
      logTest('Section Positioning', 'Growth sections present', 'warning',
        'One or both growth sections might be missing');
    }

  } catch (error) {
    logTest('Section Positioning', 'Section positioning testing', 'failed', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting BOMBO Dashboard Comprehensive Testing Suite');
  console.log('=' .repeat(60));
  console.log(`URL: ${BASE_URL}`);
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(60));

  let browser;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport(VIEWPORT_DESKTOP);

    // Navigate to dashboard
    console.log('\n⏳ Loading dashboard...');
    const response = await page.goto(BASE_URL, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    if (response && response.ok()) {
      logTest('Setup', 'Dashboard loaded successfully', 'passed',
        `Status: ${response.status()}`);
    } else {
      logTest('Setup', 'Dashboard loaded successfully', 'failed',
        `Status: ${response?.status() || 'Unknown'}`);
    }

    // Wait for initial render
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Run all test suites
    await testVisualRendering(page);
    await testDataAccuracy(page);
    await testNavigation(page);
    await testResponsiveDesign(page);
    await testChartRendering(page);
    await testTypography(page);
    await testSectionPositioning(page);

    // Generate summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);

    const passRate = ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1);
    console.log(`\n📈 Pass Rate: ${passRate}%`);

    // Save results to file
    const resultsDir = path.join(__dirname, 'results');
    await fs.mkdir(resultsDir, { recursive: true });
    const resultsFile = path.join(resultsDir, `test-results-${Date.now()}.json`);
    await fs.writeFile(resultsFile, JSON.stringify(testResults, null, 2));
    console.log(`\n💾 Results saved to: ${resultsFile}`);

    // Generate HTML report
    const htmlReport = generateHTMLReport();
    const htmlFile = path.join(resultsDir, `test-report-${Date.now()}.html`);
    await fs.writeFile(htmlFile, htmlReport);
    console.log(`📄 HTML report saved to: ${htmlFile}`);

  } catch (error) {
    console.error('❌ Fatal error during testing:', error);
    logTest('Setup', 'Test execution', 'failed', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return testResults;
}

// Generate HTML report
function generateHTMLReport() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BOMBO Dashboard Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'JetBrains Mono', monospace;
      background: #0a0a0a;
      color: #e0e0e0;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      color: #10b981;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #10b981;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      background: #1a1a1a;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #333;
    }
    .summary-card h3 {
      font-size: 0.9rem;
      color: #888;
      margin-bottom: 0.5rem;
    }
    .summary-card .value {
      font-size: 2rem;
      font-weight: bold;
    }
    .passed { color: #10b981; }
    .failed { color: #ef4444; }
    .warning { color: #f59e0b; }
    .tests-section {
      margin-top: 2rem;
    }
    .category {
      margin-bottom: 2rem;
      background: #1a1a1a;
      border-radius: 8px;
      padding: 1.5rem;
      border: 1px solid #333;
    }
    .category h2 {
      color: #10b981;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
    .test-item {
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background: #0a0a0a;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .test-name { flex: 1; }
    .test-status {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: bold;
    }
    .status-passed { background: #10b98120; color: #10b981; }
    .status-failed { background: #ef444420; color: #ef4444; }
    .status-warning { background: #f59e0b20; color: #f59e0b; }
    .test-details {
      font-size: 0.85rem;
      color: #888;
      margin-top: 0.25rem;
    }
    .timestamp {
      text-align: center;
      color: #666;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 BOMBO Dashboard Test Report</h1>

    <div class="summary">
      <div class="summary-card">
        <h3>Total Tests</h3>
        <div class="value">${testResults.summary.total}</div>
      </div>
      <div class="summary-card">
        <h3>Passed</h3>
        <div class="value passed">${testResults.summary.passed}</div>
      </div>
      <div class="summary-card">
        <h3>Failed</h3>
        <div class="value failed">${testResults.summary.failed}</div>
      </div>
      <div class="summary-card">
        <h3>Warnings</h3>
        <div class="value warning">${testResults.summary.warnings}</div>
      </div>
      <div class="summary-card">
        <h3>Pass Rate</h3>
        <div class="value">${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%</div>
      </div>
    </div>

    <div class="tests-section">
      ${generateTestCategories()}
    </div>

    <div class="timestamp">
      Generated: ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

function generateTestCategories() {
  const categories = {};

  testResults.tests.forEach(test => {
    if (!categories[test.category]) {
      categories[test.category] = [];
    }
    categories[test.category].push(test);
  });

  let html = '';

  Object.entries(categories).forEach(([category, tests]) => {
    html += `
      <div class="category">
        <h2>${category}</h2>
        ${tests.map(test => `
          <div class="test-item">
            <div>
              <div class="test-name">${test.testName}</div>
              ${test.details ? `<div class="test-details">${test.details}</div>` : ''}
            </div>
            <span class="test-status status-${test.status}">${test.status.toUpperCase()}</span>
          </div>
        `).join('')}
      </div>
    `;
  });

  return html;
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().then(results => {
    const exitCode = results.summary.failed > 0 ? 1 : 0;
    process.exit(exitCode);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };