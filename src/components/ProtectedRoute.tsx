import React from 'react'
import { Navigate } from 'react-router-dom'
import { Spin, Result, Button } from 'antd'
import { useAuth } from '../context/AuthContext'

interface Props {
  children: React.ReactNode
  module?: string
  action?: 'view' | 'create' | 'edit' | 'delete' | 'export'
}

export const ProtectedRoute: React.FC<Props> = ({ children, module, action = 'view' }) => {
  const { user, loading, hasPermission } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (module && !hasPermission(module, action)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you do not have permission to access this module."
        extra={
          <Button type="primary" onClick={() => (window.location.href = '/')}>
            Back to Dashboard
          </Button>
        }
      />
    )
  }

  return <>{children}</>
}
