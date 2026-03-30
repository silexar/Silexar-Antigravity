/**
 * @fileoverview Build Optimization Script
 * 
 * Advanced build optimization script for production deployment
 * with bundle analysis, performance metrics, and optimization recommendations.
 * 
 * @author SILEXAR AI Team
 * @version 2040.1.0
 * @optimization Production build optimization
 * @performance Bundle size and performance analysis
 */

const fs = require('fs').promises
const path = require('path')
const { execSync } = require('child_process')

// Optimization configuration
const OPTIMIZATION_CONFIG = {
  buildDir: '.next',
  outputDir: 'optimization-reports',
  thresholds: {
    bundleSize: 500 * 1024, // 500KB
    chunkSize: 250 * 1024, // 250KB
    imageSize: 100 * 1024, // 100KB
    totalSize: 2 * 1024 * 1024, // 2MB
  },
  compressionTypes: ['gzip', 'brotli'],
}

/**
 * Analyze bundle sizes
 */
async function analyzeBundleSizes() {
  console.log('📊 Analyzing bundle sizes...')
  
  const buildManifest = path.join(OPTIMIZATION_CONFIG.buildDir, 'build-manifest.json')
  
  try {
    const manifestData = await fs.readFile(buildManifest, 'utf8')
    const manifest = JSON.parse(manifestData)
    
    const analysis = {
      pages: {},
      chunks: {},
      totalSize: 0,
      issues: []
    }
    
    // Analyze pages
    for (const [page, files] of Object.entries(manifest.pages)) {
      let pageSize = 0
      
      for (const file of files) {
        const filePath = path.join(OPTIMIZATION_CONFIG.buildDir, 'static', file)
        
        try {
          const stats = await fs.stat(filePath)
          pageSize += stats.size
          
          if (stats.size > OPTIMIZATION_CONFIG.thresholds.chunkSize) {
            analysis.issues.push({
              type: 'large-chunk',
              file,
              size: stats.size,
              page
            })
          }
        } catch (error) {
          // File might not exist, skip
        }
      }
      
      analysis.pages[page] = {
        files,
        size: pageSize,
        sizeFormatted: formatBytes(pageSize)
      }
      
      analysis.totalSize += pageSize
      
      if (pageSize > OPTIMIZATION_CONFIG.thresholds.bundleSize) {
        analysis.issues.push({
          type: 'large-page',
          page,
          size: pageSize
        })
      }
    }
    
    console.log(`   Total bundle size: ${formatBytes(analysis.totalSize)}`)
    console.log(`   Pages analyzed: ${Object.keys(analysis.pages).length}`)
    console.log(`   Issues found: ${analysis.issues.length}`)
    
    return analysis
  } catch (error) {
    console.error('❌ Failed to analyze bundle sizes:', error.message)
    return null
  }
}

/**
 * Analyze static assets
 */
async function analyzeStaticAssets() {
  console.log('🖼️ Analyzing static assets...')
  
  const staticDir = path.join(OPTIMIZATION_CONFIG.buildDir, 'static')
  const analysis = {
    images: [],
    fonts: [],
    other: [],
    totalSize: 0,
    issues: []
  }
  
  try {
    await analyzeDirectory(staticDir, analysis)
    
    console.log(`   Images: ${analysis.images.length} (${formatBytes(analysis.images.reduce((sum, img) => sum + img.size, 0))})`)
    console.log(`   Fonts: ${analysis.fonts.length} (${formatBytes(analysis.fonts.reduce((sum, font) => sum + font.size, 0))})`)
    console.log(`   Other: ${analysis.other.length} (${formatBytes(analysis.other.reduce((sum, file) => sum + file.size, 0))})`)
    console.log(`   Total static size: ${formatBytes(analysis.totalSize)}`)
    
    return analysis
  } catch (error) {
    console.error('❌ Failed to analyze static assets:', error.message)
    return null
  }
}

/**
 * Recursively analyze directory
 */
async function analyzeDirectory(dir, analysis) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        await analyzeDirectory(fullPath, analysis)
      } else {
        const stats = await fs.stat(fullPath)
        const ext = path.extname(entry.name).toLowerCase()
        
        const fileInfo = {
          name: entry.name,
          path: fullPath,
          size: stats.size,
          ext
        }
        
        analysis.totalSize += stats.size
        
        // Categorize files
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'].includes(ext)) {
          analysis.images.push(fileInfo)
          
          if (stats.size > OPTIMIZATION_CONFIG.thresholds.imageSize) {
            analysis.issues.push({
              type: 'large-image',
              file: entry.name,
              size: stats.size
            })
          }
        } else if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) {
          analysis.fonts.push(fileInfo)
        } else {
          analysis.other.push(fileInfo)
        }
      }
    }
  } catch (error) {
    // Directory might not exist, skip
  }
}

/**
 * Generate compression analysis
 */
async function analyzeCompression() {
  console.log('🗜️ Analyzing compression...')
  
  const analysis = {
    gzip: {},
    brotli: {},
    recommendations: []
  }
  
  try {
    // Find JavaScript and CSS files
    const staticDir = path.join(OPTIMIZATION_CONFIG.buildDir, 'static')
    const files = await findFiles(staticDir, ['.js', '.css'])
    
    for (const file of files) {
      const originalSize = (await fs.stat(file)).size
      
      // Test gzip compression
      try {
        execSync(`gzip -c "${file}" > "${file}.gz"`, { stdio: 'ignore' })
        const gzipSize = (await fs.stat(`${file}.gz`)).size
        const gzipRatio = (1 - gzipSize / originalSize) * 100
        
        analysis.gzip[file] = {
          original: originalSize,
          compressed: gzipSize,
          ratio: gzipRatio
        }
        
        // Clean up
        await fs.unlink(`${file}.gz`)
      } catch (error) {
        // Gzip failed, skip
      }
      
      // Test brotli compression
      try {
        execSync(`brotli -c "${file}" > "${file}.br"`, { stdio: 'ignore' })
        const brotliSize = (await fs.stat(`${file}.br`)).size
        const brotliRatio = (1 - brotliSize / originalSize) * 100
        
        analysis.brotli[file] = {
          original: originalSize,
          compressed: brotliSize,
          ratio: brotliRatio
        }
        
        // Clean up
        await fs.unlink(`${file}.br`)
      } catch (error) {
        // Brotli failed, skip
      }
    }
    
    console.log(`   Files analyzed: ${files.length}`)
    console.log(`   Average gzip ratio: ${calculateAverageRatio(analysis.gzip).toFixed(1)}%`)
    console.log(`   Average brotli ratio: ${calculateAverageRatio(analysis.brotli).toFixed(1)}%`)
    
    return analysis
  } catch (error) {
    console.error('❌ Failed to analyze compression:', error.message)
    return null
  }
}

/**
 * Find files with specific extensions
 */
async function findFiles(dir, extensions) {
  const files = []
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        const subFiles = await findFiles(fullPath, extensions)
        files.push(...subFiles)
      } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Directory might not exist, skip
  }
  
  return files
}

/**
 * Calculate average compression ratio
 */
function calculateAverageRatio(compressionData) {
  const ratios = Object.values(compressionData).map(data => data.ratio)
  return ratios.length > 0 ? ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length : 0
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(bundleAnalysis, assetAnalysis, compressionAnalysis) {
  const recommendations = []
  
  // Bundle size recommendations
  if (bundleAnalysis) {
    for (const issue of bundleAnalysis.issues) {
      if (issue.type === 'large-page') {
        recommendations.push({
          type: 'bundle',
          priority: 'high',
          title: `Large page bundle: ${issue.page}`,
          description: `Page bundle is ${formatBytes(issue.size)}, consider code splitting`,
          action: 'Implement dynamic imports and lazy loading'
        })
      } else if (issue.type === 'large-chunk') {
        recommendations.push({
          type: 'bundle',
          priority: 'medium',
          title: `Large chunk: ${issue.file}`,
          description: `Chunk is ${formatBytes(issue.size)}, consider splitting`,
          action: 'Split large chunks using webpack optimization'
        })
      }
    }
  }
  
  // Asset recommendations
  if (assetAnalysis) {
    for (const issue of assetAnalysis.issues) {
      if (issue.type === 'large-image') {
        recommendations.push({
          type: 'asset',
          priority: 'medium',
          title: `Large image: ${issue.file}`,
          description: `Image is ${formatBytes(issue.size)}, consider optimization`,
          action: 'Optimize image using next/image or compress manually'
        })
      }
    }
  }
  
  // Compression recommendations
  if (compressionAnalysis) {
    const avgGzipRatio = calculateAverageRatio(compressionAnalysis.gzip)
    const avgBrotliRatio = calculateAverageRatio(compressionAnalysis.brotli)
    
    if (avgGzipRatio < 60) {
      recommendations.push({
        type: 'compression',
        priority: 'low',
        title: 'Low compression ratio',
        description: `Average gzip compression is ${avgGzipRatio.toFixed(1)}%`,
        action: 'Enable better compression in your web server'
      })
    }
    
    if (avgBrotliRatio > avgGzipRatio + 10) {
      recommendations.push({
        type: 'compression',
        priority: 'medium',
        title: 'Brotli compression advantage',
        description: `Brotli provides ${(avgBrotliRatio - avgGzipRatio).toFixed(1)}% better compression`,
        action: 'Enable Brotli compression in your web server'
      })
    }
  }
  
  return recommendations
}

/**
 * Generate optimization report
 */
async function generateReport(bundleAnalysis, assetAnalysis, compressionAnalysis) {
  const recommendations = generateRecommendations(bundleAnalysis, assetAnalysis, compressionAnalysis)
  
  const report = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    build: {
      bundle: bundleAnalysis,
      assets: assetAnalysis,
      compression: compressionAnalysis
    },
    recommendations,
    summary: {
      totalBundleSize: bundleAnalysis?.totalSize || 0,
      totalAssetSize: assetAnalysis?.totalSize || 0,
      totalIssues: (bundleAnalysis?.issues?.length || 0) + (assetAnalysis?.issues?.length || 0),
      recommendationCount: recommendations.length
    }
  }
  
  // Ensure output directory exists
  await fs.mkdir(OPTIMIZATION_CONFIG.outputDir, { recursive: true })
  
  // Save report
  const reportPath = path.join(OPTIMIZATION_CONFIG.outputDir, `optimization-report-${Date.now()}.json`)
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  
  console.log(`\n📄 Optimization report saved: ${reportPath}`)
  
  return report
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Main optimization analysis
 */
async function runOptimizationAnalysis() {
  console.log('🚀 Starting Build Optimization Analysis')
  console.log('=' * 50)
  
  try {
    // Run analyses
    const bundleAnalysis = await analyzeBundleSizes()
    const assetAnalysis = await analyzeStaticAssets()
    const compressionAnalysis = await analyzeCompression()
    
    // Generate report
    const report = await generateReport(bundleAnalysis, assetAnalysis, compressionAnalysis)
    
    // Display summary
    console.log('\n📊 Optimization Summary')
    console.log(`Total Bundle Size: ${formatBytes(report.summary.totalBundleSize)}`)
    console.log(`Total Asset Size: ${formatBytes(report.summary.totalAssetSize)}`)
    console.log(`Issues Found: ${report.summary.totalIssues}`)
    console.log(`Recommendations: ${report.summary.recommendationCount}`)
    
    // Display recommendations
    if (report.recommendations.length > 0) {
      console.log('\n💡 Optimization Recommendations:')
      report.recommendations.forEach((rec, index) => {
        console.log(`\n${index + 1}. ${rec.title} (${rec.priority} priority)`)
        console.log(`   ${rec.description}`)
        console.log(`   Action: ${rec.action}`)
      })
    }
    
    // Exit with appropriate code
    const hasHighPriorityIssues = report.recommendations.some(r => r.priority === 'high')
    process.exit(hasHighPriorityIssues ? 1 : 0)
    
  } catch (error) {
    console.error('❌ Optimization analysis failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  runOptimizationAnalysis()
}

module.exports = { 
  runOptimizationAnalysis,
  analyzeBundleSizes,
  analyzeStaticAssets,
  analyzeCompression
}