import React, { useState } from 'react'
import { Card, Form, Input, Button, Typography, Alert, Space } from 'antd'
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const { Title, Text } = Typography

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values: any) => {
    try {
      setLoading(true)
      setErrorMsg('')
      const res = await api.post('/auth/login', {
        email: values.email,
        password: values.password
      })

      const loginPayload = res.data?.data || res.data?.payload?.data
      if (loginPayload) {
        const { token, user, permissions } = loginPayload
        login(token, user, permissions)
        navigate('/')
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #09121a 0%, #0d1f2d 50%, #081622 100%)',
        padding: 16
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          background: '#ffffff',
          border: 'none'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 26,
              marginBottom: 12,
              boxShadow: '0 8px 20px rgba(5, 150, 105, 0.3)'
            }}
          >
            <SafetyCertificateOutlined />
          </div>
          <Title level={3} style={{ marginBottom: 4, color: '#0f172a' }}>
            OriginScan Admin
          </Title>
          <Text type="secondary">Sign in to manage verification & tracking</Text>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} initialValues={{ email: 'admin@originscan.com' }}>
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Enter a valid email address' }
            ]}
          >
            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} size="large" placeholder="admin@originscan.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} size="large" placeholder="••••••••" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{
                backgroundColor: '#059669',
                borderColor: '#059669',
                height: 48,
                fontWeight: 600,
                borderRadius: 10
              }}
            >
              Sign In to Dashboard
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Default login: <strong>admin@originscan.com</strong> / <strong>Admin@1234</strong>
          </Text>
        </div>
      </Card>
    </div>
  )
}
