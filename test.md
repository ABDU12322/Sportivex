# Complete Testing Guide

This guide details all testing approaches implemented in the Sportivex project, including Unit Tests, Integration Tests, API/System E2E Tests, and Performance Testing. It also explains the CI/CD automated setup via GitHub Actions.

---

## 1. Backend Unit Testing (Vitest)

Unit tests focus on isolated utility functions and business logic such as calculating gym calories or validating overlapping time slots.

**Tools Used:** Vitest, V8 Coverage

**Location:** `backend/tests/unit/`

### How to Run:
```bash
cd backend
npm run test:unit
```

### With Watch Mode:
To re-run automatically when files change:
```bash
npm run test:unit:watch
```

*(Note: Coverage report is generated automatically at `backend/coverage/` after running unit tests).*

---

## 2. Backend Integration Testing (Supertest + Vitest)

Integration tests verify that the REST API endpoints connect with the routing layers and return the correct HTTP structures/status codes.

**Tools Used:** Supertest, Vitest

**Location:** `backend/tests/integration/`

### How to Run:
```bash
cd backend
npm run test:integration
```

---

## 3. Automated UI / System E2E Testing (Cypress)

We use Cypress to perform end-to-end testing of critical user flows. It implicitly tests API connectivity, mock interceptions, and dynamic DOM rendering.

**Tools Used:** Cypress

**Location:** `frontend/cypress/e2e/`

### Covered Scenarios:
1. **Auth & Slots:** Registration → Verification → Login → Slot Viewer.
2. **Admin QR & Attendance:** Admin creating a slot → Mocked QR Scanner → Student viewing attendance.
3. **Workout Tracking:** User logging 3 exercises → Completed Session → UI showing calorie metrics.

### How to Run:
Ensure both your local backend server (`npm run start` on port 3000) and frontend server (`npm run dev` on port 5173) are running.

**Interactive UI Mode:**
```bash
cd frontend
npm run cy:open
```

**Headless CLI Mode:**
```bash
cd frontend
npm run cy:run
```

---

## 4. Performance & Load Testing (JMeter)

Apache JMeter is used to simulate high concurrency directly against backend endpoints (specifically testing bottleneck operations like scanning a QR code).

**Tools Used:** Apache JMeter

**Location:** `performance_test.jmx` in the project root.

### The Scenario:
- **Load:** 100 concurrent requests
- **Target:** 95th Percentile Response Time < 500ms for `/api/qr/scan`

### How to Run:

**Via CLI (Recommended for accurate metrics):**
Ensure your backend is running.
```bash
# Generate the JTL results
jmeter -n -t performance_test.jmx -l results.jtl

# Optional: Generate an HTML report dashboard
jmeter -g results.jtl -o Performance_Report_Dashboard
```

**Via GUI (For Debugging):**
1. Open JMeter application.
2. Go to **File > Open** and load `performance_test.jmx`.
3. Click the Green "Start" play button.

---

## 5. Automated CI Testing Pipeline (GitHub Actions)

We have configured a continuous integration workflow to run unit tests, integration tests, and build checks automatically whenever a developer pushes to the repository.

**Location:** `.github/workflows/test.yml`

**What it does:**
- Triggers on `push` and `pull_request` to the repository.
- Sets up two concurrent runner jobs:
  - **backend-tests**: Installs dependencies and runs `npm run test:unit` and `npm run test:integration`.
  - **frontend-tests**: Installs dependencies and verifies the build via `npm run build`.

**Configuration:** If the backend requires valid Supabase environment variables during the pipeline, you can define them securely in your GitHub repository's **Secrets** (`SUPABASE_URL` and `SUPABASE_ANON_KEY`).
