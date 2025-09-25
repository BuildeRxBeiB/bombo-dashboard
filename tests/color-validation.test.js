/**
 * Comprehensive Color Validation Test Suite
 *
 * This test suite validates that all components strictly adhere to the pure black/white/gray theme.
 * No colored CSS classes or hex codes should remain.
 */

const fs = require('fs');
const path = require('path');

// Patterns to detect colored elements
const COLORED_PATTERNS = {
  // CSS classes with colors
  cssClasses: [
    /text-(?:red|blue|green|yellow|orange|purple|pink|indigo|emerald|amber|teal|cyan|lime|violet|fuchsia|rose|sky|stone|neutral|zinc|slate)-\d+/g,
    /bg-(?:red|blue|green|yellow|orange|purple|pink|indigo|emerald|amber|teal|cyan|lime|violet|fuchsia|rose|sky|stone|neutral|zinc|slate)-\d+/g,
    /border-(?:red|blue|green|yellow|orange|purple|pink|indigo|emerald|amber|teal|cyan|lime|violet|fuchsia|rose|sky|stone|neutral|zinc|slate)-\d+/g,
    /from-(?:red|blue|green|yellow|orange|purple|pink|indigo|emerald|amber|teal|cyan|lime|violet|fuchsia|rose|sky|stone|neutral|zinc|slate)-\d+/g,
    /to-(?:red|blue|green|yellow|orange|purple|pink|indigo|emerald|amber|teal|cyan|lime|violet|fuchsia|rose|sky|stone|neutral|zinc|slate)-\d+/g,
    /via-(?:red|blue|green|yellow|orange|purple|pink|indigo|emerald|amber|teal|cyan|lime|violet|fuchsia|rose|sky|stone|neutral|zinc|slate)-\d+/g,
    /hover:(?:text|bg|border)-(?:red|blue|green|yellow|orange|purple|pink|indigo|emerald|amber|teal|cyan|lime|violet|fuchsia|rose|sky|stone|neutral|zinc|slate)-\d+/g,
    /focus:(?:text|bg|border)-(?:red|blue|green|yellow|orange|purple|pink|indigo|emerald|amber|teal|cyan|lime|violet|fuchsia|rose|sky|stone|neutral|zinc|slate)-\d+/g,
  ],

  // Hex color codes (excluding grayscale)
  hexCodes: [
    /#(?!000000|FFFFFF|[0-9A-Fa-f]{6}(?=.*[0-9A-Fa-f]{2})\1{2})[0-9A-Fa-f]{6}/g, // Non-grayscale hex codes
    /#(?:[0-9A-Fa-f]{3}){1,2}(?![0-9A-Fa-f])/g // All hex codes for manual review
  ],

  // RGB/RGBA with colors
  rgbCodes: [
    /rgb\(\s*(?!(\d+),\s*\1,\s*\1\s*\))\d+,\s*\d+,\s*\d+\s*\)/g, // Non-grayscale RGB
    /rgba\(\s*(?!(\d+),\s*\1,\s*\1,)\d+,\s*\d+,\s*\d+,\s*[\d.]+\s*\)/g // Non-grayscale RGBA
  ],

  // HSL/HSLA with colors (hue should be 0 for grayscale)
  hslCodes: [
    /hsl\(\s*(?!0\s*,)\d+,\s*\d+%,\s*\d+%\s*\)/g, // Non-grayscale HSL
    /hsla\(\s*(?!0\s*,)\d+,\s*\d+%,\s*\d+%,\s*[\d.]+\s*\)/g // Non-grayscale HSLA
  ]
};

// Allowed grayscale patterns
const ALLOWED_PATTERNS = {
  grayscaleClasses: [
    /text-(?:black|white|gray)-\d+/g,
    /bg-(?:black|white|gray)-\d+/g,
    /border-(?:black|white|gray)-\d+/g,
    /from-(?:black|white|gray)-\d+/g,
    /to-(?:black|white|gray)-\d+/g,
  ],
  grayscaleHex: [
    /#000000|#FFFFFF|#[0-9A-Fa-f]{2}\1{2}/g // True grayscale hex codes
  ]
};

class ColorValidationTester {
  constructor() {
    this.results = {
      violations: [],
      warnings: [],
      passed: [],
      summary: {
        totalFiles: 0,
        filesWithViolations: 0,
        totalViolations: 0,
        totalWarnings: 0
      }
    };
  }

  /**
   * Validate a single file for color violations
   */
  validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);
    const fileViolations = [];
    const fileWarnings = [];

    // Check for colored CSS classes
    COLORED_PATTERNS.cssClasses.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          fileViolations.push({
            type: 'CSS_CLASS',
            pattern: match,
            severity: 'HIGH',
            description: `Colored CSS class found: ${match}`,
            suggestion: `Replace with grayscale equivalent (text-gray-*, bg-gray-*, etc.)`
          });
        });
      }
    });

    // Check for hex color codes
    const hexMatches = content.match(COLORED_PATTERNS.hexCodes[1]);
    if (hexMatches) {
      hexMatches.forEach(hex => {
        // Check if it's a grayscale color
        const isGrayscale = this.isGrayscaleHex(hex);
        if (!isGrayscale) {
          fileViolations.push({
            type: 'HEX_COLOR',
            pattern: hex,
            severity: 'HIGH',
            description: `Colored hex code found: ${hex}`,
            suggestion: `Replace with grayscale hex code (#000000, #FFFFFF, or #AAAAAA)`
          });
        } else {
          fileWarnings.push({
            type: 'HEX_GRAYSCALE',
            pattern: hex,
            severity: 'LOW',
            description: `Grayscale hex code found: ${hex}`,
            suggestion: `Consider using Tailwind classes instead for consistency`
          });
        }
      });
    }

    // Check for RGB patterns
    const rgbMatches = content.match(COLORED_PATTERNS.rgbCodes[0]);
    if (rgbMatches) {
      rgbMatches.forEach(rgb => {
        fileViolations.push({
          type: 'RGB_COLOR',
          pattern: rgb,
          severity: 'HIGH',
          description: `Colored RGB found: ${rgb}`,
          suggestion: `Replace with grayscale RGB where all values are equal`
        });
      });
    }

    // Check for HSL patterns
    const hslMatches = content.match(COLORED_PATTERNS.hslCodes[0]);
    if (hslMatches) {
      hslMatches.forEach(hsl => {
        fileViolations.push({
          type: 'HSL_COLOR',
          pattern: hsl,
          severity: 'HIGH',
          description: `Colored HSL found: ${hsl}`,
          suggestion: `Replace with grayscale HSL (hue should be 0)`
        });
      });
    }

    // Add to results
    if (fileViolations.length > 0 || fileWarnings.length > 0) {
      this.results.violations.push({
        file: relativePath,
        violations: fileViolations,
        warnings: fileWarnings
      });
      this.results.summary.filesWithViolations++;
      this.results.summary.totalViolations += fileViolations.length;
      this.results.summary.totalWarnings += fileWarnings.length;
    } else {
      this.results.passed.push(relativePath);
    }

    this.results.summary.totalFiles++;
  }

  /**
   * Check if a hex color is grayscale
   */
  isGrayscaleHex(hex) {
    const clean = hex.replace('#', '').toLowerCase();

    // Known Tailwind gray colors (these are valid grayscale)
    const tailwindGrays = [
      '000000', 'ffffff', // Pure black/white
      '1f2937', '374151', '4b5563', '6b7280', '9ca3af', 'd1d5db', 'e5e7eb', 'f3f4f6', 'f9fafb', // gray-900 to gray-50
      '0f172a', '1e293b', '334155', '475569', '64748b', '94a3b8', 'cbd5e1', 'e2e8f0', 'f1f5f9', 'f8fafc', // slate colors
      '18181b', '27272a', '3f3f46', '52525b', '71717a', 'a1a1aa', 'd4d4d8', 'e4e4e7', 'f4f4f5', 'fafafa', // zinc colors
      '171717', '262626', '404040', '525252', '737373', 'a3a3a3', 'd4d4d4', 'e5e5e5', 'f5f5f5', 'fafafa', // neutral colors
    ];

    // Check if it's a known Tailwind gray
    if (tailwindGrays.includes(clean)) {
      return true;
    }

    // Check if it's a perfect grayscale (R=G=B)
    if (clean.length === 3) {
      return clean[0] === clean[1] && clean[1] === clean[2];
    } else if (clean.length === 6) {
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      return r === g && g === b;
    }

    return false;
  }

  /**
   * Validate all component files
   */
  validateComponents() {
    const componentPaths = [
      '/Users/beib/playground_beib/bombo_metrics/bombo-dashboard/components/sections/ExecutiveOverview.tsx',
      '/Users/beib/playground_beib/bombo_metrics/bombo-dashboard/components/sections/GrowthMetrics.tsx',
      '/Users/beib/playground_beib/bombo_metrics/bombo-dashboard/components/sections/RetentionAnalysis.tsx',
      '/Users/beib/playground_beib/bombo_metrics/bombo-dashboard/components/sections/FinancialPerformance.tsx',
      '/Users/beib/playground_beib/bombo_metrics/bombo-dashboard/components/sections/MarketOpportunity.tsx',
    ];

    componentPaths.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.validateFile(filePath);
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    });
  }

  /**
   * Generate detailed test report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      violations: this.results.violations,
      passed: this.results.passed,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  /**
   * Generate recommendations based on findings
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.results.summary.totalViolations > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Remove all colored CSS classes and hex codes',
        description: 'Replace with grayscale equivalents to achieve pure black/white theme'
      });
    }

    if (this.results.summary.totalWarnings > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Standardize color usage',
        description: 'Consider using Tailwind CSS classes instead of inline hex codes for consistency'
      });
    }

    if (this.results.summary.filesWithViolations === 0) {
      recommendations.push({
        priority: 'LOW',
        action: 'Maintain color discipline',
        description: 'All files pass color validation. Continue following pure black/white theme guidelines'
      });
    }

    return recommendations;
  }

  /**
   * Run the complete test suite
   */
  runTests() {
    console.log('🔍 Starting Color Validation Test Suite...\n');

    this.validateComponents();
    const report = this.generateReport();

    // Print summary
    console.log('📊 TEST SUMMARY:');
    console.log(`Total Files Tested: ${report.summary.totalFiles}`);
    console.log(`Files with Violations: ${report.summary.filesWithViolations}`);
    console.log(`Total Violations: ${report.summary.totalViolations}`);
    console.log(`Total Warnings: ${report.summary.totalWarnings}\n`);

    // Print violations
    if (report.violations.length > 0) {
      console.log('❌ COLOR VIOLATIONS FOUND:\n');
      report.violations.forEach(fileResult => {
        console.log(`📄 File: ${fileResult.file}`);

        if (fileResult.violations.length > 0) {
          console.log('  🚨 Violations:');
          fileResult.violations.forEach((violation, index) => {
            console.log(`    ${index + 1}. ${violation.description}`);
            console.log(`       Pattern: ${violation.pattern}`);
            console.log(`       Suggestion: ${violation.suggestion}\n`);
          });
        }

        if (fileResult.warnings.length > 0) {
          console.log('  ⚠️  Warnings:');
          fileResult.warnings.forEach((warning, index) => {
            console.log(`    ${index + 1}. ${warning.description}`);
            console.log(`       Pattern: ${warning.pattern}\n`);
          });
        }
      });
    }

    // Print passed files
    if (report.passed.length > 0) {
      console.log('✅ FILES PASSING COLOR VALIDATION:');
      report.passed.forEach(file => {
        console.log(`  ✓ ${file}`);
      });
      console.log('');
    }

    // Print recommendations
    if (report.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS:');
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. [${rec.priority}] ${rec.action}`);
        console.log(`     ${rec.description}\n`);
      });
    }

    // Save detailed report to file
    const reportPath = '/Users/beib/playground_beib/bombo_metrics/bombo-dashboard/tests/color-validation-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);

    return report;
  }
}

// Export for use in other tests
module.exports = ColorValidationTester;

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new ColorValidationTester();
  const results = tester.runTests();

  // Exit with error code if violations found
  process.exit(results.summary.totalViolations > 0 ? 1 : 0);
}