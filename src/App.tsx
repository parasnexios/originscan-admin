import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './components/Layout/AdminLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Manufacturers } from './pages/Manufacturers'
import { Branches } from './pages/Branches'
import { Products } from './pages/Products'
import { Batches } from './pages/Batches'
import { QRCodes } from './pages/QRCodes'
import { DisplaySettings } from './pages/DisplaySettings'
import { ScanReports } from './pages/ScanReports'
import { Users } from './pages/Users'
import { Roles } from './pages/Roles'
import { AuditLogs } from './pages/AuditLogs'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="manufacturers"
              element={
                <ProtectedRoute module="manufacturers">
                  <Manufacturers />
                </ProtectedRoute>
              }
            />
            <Route
              path="branches"
              element={
                <ProtectedRoute module="branches">
                  <Branches />
                </ProtectedRoute>
              }
            />
            <Route
              path="products"
              element={
                <ProtectedRoute module="products">
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="batches"
              element={
                <ProtectedRoute module="batches">
                  <Batches />
                </ProtectedRoute>
              }
            />
            <Route
              path="qr-codes"
              element={
                <ProtectedRoute module="qr_codes">
                  <QRCodes />
                </ProtectedRoute>
              }
            />
            <Route
              path="scans"
              element={
                <ProtectedRoute module="scans">
                  <ScanReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute module="settings">
                  <DisplaySettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute module="users">
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="roles"
              element={
                <ProtectedRoute module="roles">
                  <Roles />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit"
              element={
                <ProtectedRoute module="audit">
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
