import { test, expect, Page } from '@playwright/test';

// Test block
test.use({ viewport: { width: 1920, height: 1080 } }); // Set the screen size for this test

test('get started link', async ({ page }) => {
  await page.goto('http://localhost:4200/live-monitor');

  // Call the function to verify if all required elements are visible
  await checkPageElements(page);

  // Additional actions or assertions can be added below
});


// Define the function to check if all required data is visible on the page
async function checkPageElements(page: Page) {
  // Check for the page title
  await expect(page).toHaveTitle(/Web GIS/);

  // Check for the visibility of the specific elements
  await page.waitForSelector('text=ระบบเฝ้าระวังชายแดนแบบบูรณาการ', { state: 'visible' });
  await page.waitForSelector('img[alt="Map Editor"]', { state: 'visible' });
  await page.waitForSelector('text=Live Monitoring', { state: 'visible' });
  await page.waitForSelector('text=Drone Patrol', { state: 'visible' });
  await page.waitForSelector('text=Summary', { state: 'visible' });
  await page.waitForSelector('div:nth-child(5) > .navbar-nav > li > .nav-link', { state: 'visible' });

  // Check for sensor information heading
  await page.waitForSelector('text=ข้อมูลเซนเซอร์', { state: 'visible' });

  // Check for the sidebar links
  await page.waitForSelector('#sidebar a', { state: 'visible' });

  // Check for other elements if necessary
  await page.waitForSelector('text=ทั้งหมด Alarm Infoวันที่ประเภทระบบรายละเอียด2024-06-01 10:14:', { state: 'visible' });
  // await page.waitForSelector('text=Trigger Summary', { state: 'visible' });

  const mapElement = await page.locator('#map'); // Replace '#map' with the correct selector for the map container

  // Perform a double-click on the map three times
  for (let i = 0; i < 3; i++) {
    await mapElement.dblclick(); // Simulate double-click
    await page.waitForTimeout(1000); // Optional: wait 1 second between each double-click
  }

  console.log('All required elements are visible on the page.');
}
