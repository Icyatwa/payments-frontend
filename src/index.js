import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import RootLayout from './layouts/root-layout';
import DashboardLayout from './layouts/dashboard-layout';
import SignInPage from './routes/sign-in';
import SignUpPage from './routes/sign-up';

import Home from './Home';

import PhotoUploadForm from './PhotoUploadForm'
import PhotoList from './PhotoList';
import EarningsPage from './EarningsPage'

import Spaces from './design/spaces';
import Pricing from './design/pricing';
import Availability from './design/availability';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },

      { path: "/sign-in", element: <SignInPage /> },
      { path: "/sign-up", element: <SignUpPage /> },

      { path: "/spaces", element: <Spaces /> },
      { path: "/pricing", element: <Pricing /> },
      { path: "/availability", element: <Availability /> },

      {
        element: <DashboardLayout />,
        children: [
          { path: "/photo", element: <PhotoUploadForm /> },
          { path: "/list", element: <PhotoList /> },
          { path: "/wallet", element: <EarningsPage /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);