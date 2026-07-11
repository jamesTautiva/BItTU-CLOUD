import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/layouts/Layout'
import Login from '../features/auth/pages/Login'
import RequireAuth from '../features/auth/components/RequireAuth'
import Users from '../features/users/pages/Users'
import Artists from '../features/artists/pages/Artists'
import Albums from '../features/albums/pages/Albums'
import Songs from '../features/songs/pages/Songs'
import Playlists from '../features/playlists/pages/Playlists'
import Profile from '../features/profile/pages/Profile'
import SettingsPage from '../features/config/SettingsPage'
import TicketsPage from '../features/tickets/TicketsPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import NotificationsPage from '../features/notifications/pages/NotificationsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'artists',
        element: <Artists />
      },
      {
        path: 'albums',
        element: <Albums />
      },
      {
        path: 'songs',
        element: <Songs />
      },
      {
        path: 'playlists',
        element: <Playlists />
      },
      {
        path: 'tickets',
        element: <TicketsPage />
      },
      {
        path: 'users',
        element: <Users />
      },
      {
        path: 'finance',
        element: <div className="p-8"><h1 className="text-2xl font-bold">Finanzas</h1></div>
      },
      {
        path: 'notifications',
        element: <NotificationsPage />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
    ]
  },
  { path: '/login', element: <Login /> },
  { path: '*', element: <Navigate to="/" replace /> }
])

export default router
