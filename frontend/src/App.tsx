import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import UrlShortener from './components/UrlShortener';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import UserAccount from './components/UserAccount';
import UserUrlMappings from './components/UserUrlMappings';
import UrlMappingDetails from './components/UrlMappingDetails';
import Security from './components/Security';
import Dashboard from './components/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestOnlyRoute } from './components/GuestOnlyRoute';
import { ROUTES } from './constants';

const App = () => {
    return (
        <Router>
            <MainLayout>
                <Routes>
                    <Route path={ROUTES.HOME} element={<UrlShortener />} />
                    <Route
                        path={ROUTES.SIGNIN}
                        element={
                            <GuestOnlyRoute>
                                <SignIn />
                            </GuestOnlyRoute>
                        }
                    />
                    <Route
                        path={ROUTES.SIGNUP}
                        element={
                            <GuestOnlyRoute>
                                <SignUp />
                            </GuestOnlyRoute>
                        }
                    />
                    <Route
                        path="/account"
                        element={
                            <ProtectedRoute>
                                <Navigate to={ROUTES.DASHBOARD} replace />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.DASHBOARD}
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.PROFILE}
                        element={
                            <ProtectedRoute>
                                <UserAccount />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.SECURITY}
                        element={
                            <ProtectedRoute>
                                <Security />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.URL_MAPPINGS}
                        element={
                            <ProtectedRoute>
                                <UserUrlMappings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/account/url-mappings/:urlHash"
                        element={
                            <ProtectedRoute>
                                <UrlMappingDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
                </Routes>
            </MainLayout>
        </Router>
    );
};

export default App;
