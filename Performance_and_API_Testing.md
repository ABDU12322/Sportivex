# Sportivex Testing Guide: Performance & Automated UI/API Testing

This document provides a comprehensive guide on how to understand, configure, and execute the automated end-to-end (E2E) UI/API tests using Cypress and the performance load tests using Apache JMeter.

---

## 1. Automated UI & API E2E Testing (Cypress)

We use Cypress to perform end-to-end testing. Cypress not only tests the user interface but also implicitly tests the API layers through user actions (and explicit network interceptions).

### Covered Scenarios
Our test suite (`frontend/cypress/e2e/`) currently covers three primary flows:

1. **Auth & Slots (`auth-slots.cy.js`)**
   - **Flow**: New user registration → email verification → first login → view available slots.
   - **Purpose**: Verifies that the authentication API and routing layers work correctly alongside the UI state.
2. **Admin QR & Attendance (`attendance-qr.cy.js`)**
   - **Flow**: Admin creates time slot → student scans QR → attendance record visible in dashboard.
   - **Purpose**: Tests role-based API access and mocks the `/api/qr/scan` POST request to ensure the frontend processes QR payloads correctly.
3. **Workout Tracking (`workout.cy.js`)**
   - **Flow**: User starts workout → adds 3 exercises → completes session → calorie summary displayed.
   - **Purpose**: Validates dynamic form additions and complex data calculations (calories) upon session completion.

### Prerequisites
- Node.js installed.
- Ensure the **frontend** development server is running on `http://localhost:5173`.
- Ensure the **backend** server is running on `http://localhost:3000`.

### How to Run Cypress Tests

Open a terminal, navigate to the `frontend` directory, and run one of the following commands:

**Option A: Interactive Mode (Recommended for Debugging)**
This opens the Cypress Test Runner UI, allowing you to visually see the tests execute step-by-step.
```bash
cd frontend
npm run cy:open
```
*Once the window opens, select "E2E Testing" and click on any of the `.cy.js` files to run them.*

**Option B: Headless Mode (For CI/CD Pipelines)**
Executes all tests silently in the terminal without a UI and provides a pass/fail summary.
```bash
cd frontend
npm run cy:run
```

---

## 2. Performance Testing (JMeter)

We use Apache JMeter to validate system resilience under load and ensure latency requirements are met.

### Covered Scenarios
Our performance test plan (`performance_test.jmx` located in the root directory) focuses on the QR code scanning bottleneck:
- **Scenario**: 100 Concurrent Users submitting QR scan requests simultaneously.
- **Endpoint**: `POST /api/qr/scan`
- **Target Metric**: The **p95 (95th percentile) response time** must be strictly **< 500ms**.

### Prerequisites
- [Java Development Kit (JDK)](https://adoptium.net/) installed.
- [Apache JMeter](https://jmeter.apache.org/download_jmeter.cgi) downloaded and extracted.
- Ensure the **backend** server is running locally on `http://localhost:3000` or pointed to your deployed staging environment.

### How to Run JMeter Tests

**Option A: GUI Mode (For Analyzing and Tweaking)**
1. Open your terminal and start JMeter by running the `jmeter` executable from its `bin` folder (e.g., `jmeter.bat` on Windows or `./jmeter` on Mac/Linux).
2. Once the GUI opens, go to **File** > **Open** and select the `performance_test.jmx` file from the root of the Sportivex project.
3. Click the **Green Play Button** at the top toolbar to start the test.
4. Click on the **Summary Report** listener in the left pane to view live statistics including Latency, Throughput, and p95 metrics.

**Option B: CLI / Non-GUI Mode (Recommended for actual load testing)**
GUI mode consumes significant RAM and can skew results. For accurate metrics, run JMeter via the command line:
```bash
# Navigate to the JMeter bin folder, then run:
jmeter -n -t /path/to/Sportivex/performance_test.jmx -l /path/to/Sportivex/results.jtl
```
* `-n`: Non-GUI mode.*
* `-t`: Path to your `.jmx` test plan.*
* `-l`: Path where you want to output the `.jtl` results file.*

Once completed, you can generate an HTML dashboard from the `.jtl` file:
```bash
jmeter -g /path/to/Sportivex/results.jtl -o /path/to/Sportivex/HTML_Report
```
Open the generated `index.html` file in your browser to view detailed performance graphs.
