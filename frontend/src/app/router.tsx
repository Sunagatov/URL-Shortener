import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/app/layout/MainLayout';
import RouteFallback from '@/app/layout/RouteFallback';
import { routes } from '@/app/routes';
import { GuestOnlyRoute } from '@/features/auth/routes/GuestOnlyRoute';
import { ProtectedRoute } from '@/features/auth/routes/ProtectedRoute';

const SignInPage = lazy(() => import('@/features/auth/routes/SignInPage'));
const SignUpPage = lazy(() => import('@/features/auth/routes/SignUpPage'));
const DashboardPage = lazy(() => import('@/features/account/routes/DashboardPage'));
const UserAccountPage = lazy(() => import('@/features/account/routes/UserAccountPage'));
const SecurityPage = lazy(() => import('@/features/account/routes/SecurityPage'));
const UrlShortenerPage = lazy(() => import('@/features/urls/routes/UrlShortenerPage'));
const UserUrlMappingsPage = lazy(() => import('@/features/urls/routes/UserUrlMappingsPage'));
const UrlMappingDetailsPage = lazy(() => import('@/features/urls/routes/UrlMappingDetailsPage'));

const AppRouter = () => {
  return (
    <Router>
      <MainLayout>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path={routes.home} element={<UrlShortenerPage />} />
            <Route
              path={routes.signIn}
              element={(
                <GuestOnlyRoute>
                  <SignInPage />
                </GuestOnlyRoute>
              )}
            />
            <Route
              path={routes.signUp}
              element={(
                <GuestOnlyRoute>
                  <SignUpPage />
                </GuestOnlyRoute>
              )}
            />
            <Route
              path={routes.account}
              element={(
                <ProtectedRoute>
                  <Navigate to={routes.dashboard} replace />
                </ProtectedRoute>
              )}
            />
            <Route
              path={routes.dashboard}
              element={(
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path={routes.profile}
              element={(
                <ProtectedRoute>
                  <UserAccountPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path={routes.security}
              element={(
                <ProtectedRoute>
                  <SecurityPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path={routes.urlMappings}
              element={(
                <ProtectedRoute>
                  <UserUrlMappingsPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path={routes.urlDetails(':urlHash')}
              element={(
                <ProtectedRoute>
                  <UrlMappingDetailsPage />
                </ProtectedRoute>
              )}
            />
            <Route path="*" element={<Navigate to={routes.home} replace />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;
