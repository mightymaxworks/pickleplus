/**
 * Simplified Bounce Test Runner
 * This version doesn't require external dependencies like Playwright
 * It generates a sample bug report to demonstrate the reporting functionality
 */

import { bugReportGenerator } from './reporting/bug-report-generator';
import { bounceFindings, bounceTestRuns, bounceEvidence } from '../shared/schema/bounce';
import { db } from '../server/db';
import { eq } from 'drizzle-orm';

// Mock data for demonstration
const mockFindings = [
  {
    id: 1,
    title: "Community page loads with incorrect layout on mobile",
    description: "When viewing the community page on mobile devices, the layout breaks and elements overlap.",
    severity: "MODERATE",
    area: "Community",
    affectedUrl: "/communities",
    browserInfo: JSON.stringify({
      name: "Chrome Mobile",
      device: "iPhone 12",
      screenSize: "390x844"
    }),
    status: "OPEN"
  },
  {
    id: 2,
    title: "Profile image upload fails with 404 error",
    description: "When attempting to upload a profile image, the request fails with a 404 error.",
    severity: "HIGH",
    area: "Profile",
    affectedUrl: "/profile/edit",
    browserInfo: JSON.stringify({
      name: "Chrome",
      device: "Desktop",
      screenSize: "1920x1080"
    }),
    status: "OPEN"
  },
  {
    id: 3,
    title: "Login button not visible on Safari",
    description: "The login button is not visible when using Safari browser.",
    severity: "CRITICAL",
    area: "Authentication",
    affectedUrl: "/auth",
    browserInfo: JSON.stringify({
      name: "Safari",
      device: "Desktop",
      screenSize: "1440x900"
    }),
    status: "OPEN"
  }
];

const mockEvidence = [
  {
    id: 1,
    findingId: 1,
    type: "screenshot",
    content: "community-page-mobile-bug.png",
    metadata: JSON.stringify({
      timestamp: new Date().toISOString()
    })
  },
  {
    id: 2,
    findingId: 2,
    type: "network",
    content: "POST /api/profile/image 404 Not Found",
    metadata: JSON.stringify({
      timestamp: new Date().toISOString(),
      requestHeaders: {
        "Content-Type": "multipart/form-data"
      }
    })
  },
  {
    id: 3,
    findingId: 3,
    type: "dom",
    content: "<button class='login-button' style='display: none'>Login</button>",
    metadata: JSON.stringify({
      timestamp: new Date().toISOString()
    })
  }
];

async function runSimpleDemo() {
  console.log("🚀 Starting Bounce simplified demo...");

  try {
    // Create a test run
    console.log("📝 Creating test run record...");
    const [testRun] = await db.insert(bounceTestRuns)
      .values({
        name: "Demo Test Run",
        description: "A demonstration of Bounce bug reporting",
        status: "COMPLETED",
        startedAt: new Date(Date.now() - 60000), // 1 minute ago
        completedAt: new Date(),
        targetUrl: "Chrome, Safari",
        coverage: 80
      })
      .returning();

    console.log(`✅ Created test run with ID: ${testRun.id}`);

    // Insert mock findings
    console.log("🔍 Inserting demo findings...");
    for (const finding of mockFindings) {
      const [insertedFinding] = await db.insert(bounceFindings)
        .values({
          testRunId: testRun.id,
          title: finding.title,
          description: finding.description,
          severity: finding.severity,
          area: finding.area,
          affectedUrl: finding.affectedUrl,
          browserInfo: finding.browserInfo,
          status: finding.status,
          createdAt: new Date()
        })
        .returning();

      // Find the corresponding evidence
      const evidence = mockEvidence.find(e => e.findingId === finding.id);
      if (evidence) {
        await db.insert(bounceEvidence)
          .values({
            findingId: insertedFinding.id,
            type: evidence.type,
            content: evidence.content,
            metadata: evidence.metadata,
            createdAt: new Date()
          });
      }
    }

    console.log("✅ Demo data inserted successfully!");

    // Generate a bug report
    console.log("📊 Generating bug report...");
    const report = await bugReportGenerator.generateBugReport(
      testRun.id,
      { 
        includeEvidence: true,
        includeSolutionPrompts: true,
        sortBySeverity: true,
        groupByArea: true
      }
    );

    // Save report to file
    const reportPath = bugReportGenerator.saveReportToFile(
      report,
      './reports/bounce_demo_report.md'
    );

    console.log(`✅ Bug report generated and saved to: ${reportPath}`);
    console.log("Done! 🎉");

  } catch (error) {
    console.error("❌ Error running demo:", (error as Error).message);
    console.error((error as Error).stack);
  }
}

// Run the demo
runSimpleDemo();