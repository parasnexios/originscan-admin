import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Typography, Alert, Space, Spin } from 'antd'
import {
  ScanOutlined,
  ShopOutlined,
  AppstoreOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AlertOutlined
} from '@ant-design/icons'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import api from '../api'

const { Title, Text } = Typography

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await api.get('/dashboard/stats')
      if (res.data?.data) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  const recentColumns = [
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (text: string) => text || 'General Product'
    },
    {
      title: 'Entered Code',
      dataIndex: 'entered_code',
      key: 'entered_code',
      render: (code: string) => <Tag color="blue">{code}</Tag>
    },
    {
      title: 'Manufacturer',
      dataIndex: ['manufacturer', 'company_name'],
      key: 'manufacturer',
      render: (mfg: string, record: any) =>
        mfg ? `${mfg} (${record.manufacturer?.unit_code})` : <Text type="secondary">N/A</Text>
    },
    {
      title: 'Status',
      dataIndex: 'found',
      key: 'found',
      render: (found: boolean) =>
        found ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Valid
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Not Found
          </Tag>
        )
    },
    {
      title: 'Scanned At',
      dataIndex: 'scanned_at',
      key: 'scanned_at',
      render: (date: string) => new Date(date).toLocaleString()
    }
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={3} style={{ marginBottom: 4 }}>
          Executive Verification Dashboard
        </Title>
        <Text type="secondary">Real-time scan logs, anti-counterfeit analytics, and production units</Text>
      </div>

      {stats?.suspiciousScans?.length > 0 && (
        <Alert
          message="Potential Code Guessing or Counterfeit Activity Detected"
          description={`${stats.invalidScans} unrecognized code lookup attempts have been logged. Monitor suspicious scan records below.`}
          type="warning"
          showIcon
          icon={<AlertOutlined />}
          closable
        />
      )}

      {/* KPI Metric Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            <Statistic
              title="Total Scans"
              value={stats?.totalScans || 0}
              prefix={<ScanOutlined style={{ color: '#059669', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            <Statistic
              title="Scans Today"
              value={stats?.scansToday || 0}
              valueStyle={{ color: '#059669' }}
              prefix={<ScanOutlined style={{ marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            <Statistic
              title="Active Manufacturers"
              value={stats?.totalManufacturers || 0}
              prefix={<ShopOutlined style={{ color: '#3b82f6', marginRight: 8 }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            <Statistic
              title="Active Batches"
              value={stats?.activeBatches || 0}
              prefix={<BarcodeOutlined style={{ color: '#8b5cf6', marginRight: 8 }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart Section */}
      <Card
        title="7-Day Scan Frequency & Verification Trends"
        bordered={false}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}
      >
        <div style={{ height: 280, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.scanTrends || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInvalid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip />
              <Area type="monotone" dataKey="valid" stroke="#059669" fillOpacity={1} fill="url(#colorValid)" name="Valid Scans" />
              <Area type="monotone" dataKey="invalid" stroke="#ef4444" fillOpacity={1} fill="url(#colorInvalid)" name="Invalid Scans" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Scans Table */}
      <Card
        title="Recent Customer Verification Scans"
        bordered={false}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 12 }}
      >
        <Table
          dataSource={stats?.recentScans || []}
          columns={recentColumns}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </Space>
  )
}
