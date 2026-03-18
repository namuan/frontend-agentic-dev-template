# Demo app verification

**Status**: completed
**Created**: 2026-03-18
**Owner**: agent

## Summary

A demo app is scaffolded and tests are in place. Verification was blocked by
network-restricted dependency installation and MSW compatibility issues. All
issues have been resolved and tests pass.

## Changes Made

1. **Fixed MSW compatibility**: Downgraded from MSW 2.x to MSW 1.x for better
   Jest compatibility. Updated handlers and test files to use MSW 1.x API
   (`rest`, `res`, `ctx` instead of `http`, `HttpResponse`).

2. **Fixed Jest configuration**:
   - Added `setupGlobals.js` for TextEncoder/TextDecoder polyfills
   - Simplified jest.config.cjs for MSW 1.x compatibility
   - Unit tests now use direct API mocking instead of MSW server

3. **Fixed useToast.ts**: Renamed from `.ts` to `.tsx` since it contains JSX

4. **Added MSW Service Worker**: Created `public/mockServiceWorker.js` for
   browser mocking in E2E tests

5. **Updated test files**:
   - `useAuth.test.tsx` - Uses direct API mocking
   - `useSettings.test.tsx` - Uses direct API mocking
   - `useDashboardData.test.tsx` - Uses direct API mocking
   - `useToast.test.tsx` - Fixed error test assertion

## Test Results

- **Unit tests**: 12 passed, 12 total (4 test suites)
- **E2E tests**: 1 passed (1 test)

## Blocker Resolution

- `npm install` now works with network access enabled
- MSW 2.x ESM compatibility issues resolved by using MSW 1.x
- Service Worker properly initialized for browser mocking

## Notes

- MSW 2.x has complex ESM dependencies that don't work well with Jest 29's
  default module resolution. MSW 1.x was chosen for simplicity.
- Unit tests use direct API mocking for reliability; E2E tests use MSW for
  full integration testing.
