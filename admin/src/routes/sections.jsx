import { lazy, Suspense, useEffect } from 'react';  
import { Outlet, Navigate, useRoutes, useNavigate } from 'react-router-dom';
import useAuth from '../routes/hooks/useAuth';
import DashboardLayout from '../layouts/dashboard';
import WordPage from '../pages/word';

export const IndexPage = lazy(() => import('../pages/app'));
export const BlogPage = lazy(() => import('../pages/blog'));
export const UserPage = lazy(() => import('../pages/user'));
export const LoginPage = lazy(() => import('../pages/login'));
export const ProductsPage = lazy(() => import('../pages/products'));
export const FeedbackPage = lazy(() => import('../pages/feedback'));
export const Page404 = lazy(() => import('../pages/page-not-found'));
export const AuthenticateView = lazy(() => import('../pages/authenticate'));
 

export default function Router() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const userSession = sessionStorage.getItem('user');
    if (userSession && window.location.pathname === '/login') {
      navigate('/');
    }
  }, [navigate]);

  const routes = useRoutes([
    {
      path: 'verify/*',
      element: <Suspense fallback={<div>Loading...</div>}>
        <AuthenticateView />
      </Suspense>,
    },
    {
      path: '*',
      children: [
        {
          path: 'login',
          element: !isAuthenticated ? <LoginPage /> : <Navigate to="/" />,
        },
        {
          element: (isAuthenticated || sessionStorage.getItem('user')) ? (
            <DashboardLayout>
              <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
              </Suspense>
            </DashboardLayout>
          ) : (
            <Navigate to="/login" />
          ),
          children: [
            { element: <IndexPage />, index: true },
            { path: 'user', element: <UserPage /> },
            { path: 'word', element: <WordPage /> },
            { path: 'feedback', element: <FeedbackPage /> },
            { path: 'products', element: <ProductsPage /> },
            { path: 'blog', element: <BlogPage /> },
          ],
        },
      ],
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
