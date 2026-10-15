import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Select,
  Tag,
  Typography,
  message,
  Card,
  Row,
  Col,
  Statistic
} from 'antd'
import {
  LineChartOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined
} from '@ant-design/icons'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

export const ScanReports: React.FC = () => {
  const [data, setData] = useState([])
  const [summary, setSummary] = useState<any>(null)
  const [products, setProducts] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterFound, setFilterFound] = useState<any>(undefined)
  const [filterProduct, setFilterProduct] = useState<any>(undefined)
  const [filterMfg, setFilterMfg] = useState<any>(undefined)
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchScans()
    fetchSummary()
    fetchOptions()
  }, [filterFound, filterProduct, filterMfg])

  const fetchScans = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      if (filterFound !== undefined) filters.found = filterFound
      if (filterProduct) filters.product_id = filterProduct
      if (filterMfg) filters.manufacturer_id = filterMfg

      const searchParam = Object.keys(filters).length ? `&search=${encodeURIComponent(JSON.stringify(filters))}` : ''
      const res = await api.get(`/scans?show_all=true${searchParam}`)
      if (res.data?.data) {
        setData(res.data.data)
      }
    } catch (err) {
      message.error('Failed to load scan reports')
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const res = await api.get('/scans/summary')
      if (res.data?.data) {
        setSummary(res.data.data)
      }
    } catch (err) {
      // ignore
    }
  }

  const fetchOptions = async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        api.get('/products?show_all=true'),
        api.get('/manufacturers?show_all=true')
      ])
      if (pRes.data?.data) setProducts(pRes.data.data)
      if (mRes.data?.data) setManufacturers(mRes.data.data)
    } catch (err) {
      // ignore
    }
  }

  const handleExport = async () => {
    try {
      const filters: any = {}
      if (filterFound !== undefined) filters.found = filterFound
      if (filterProduct) filters.product_id = filterProduct
      if (filterMfg) filters.manufacturer_id = filterMfg

      const searchParam = Object.keys(filters).length ? `?search=${encodeURIComponent(JSON.stringify(filters))}` : ''
      const res = await api.get(`/scans/export${searchParam}`, { responseType: 'blob' })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `originscan-report-${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success('Report downloaded')
    } catch (err) {
      message.error('Export failed')
    }
  }

  const columns = [
    {
      title: 'Scanned Time',
      dataIndex: 'scanned_at',
      key: 'scanned_at',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (name: string) => name || 'N/A'
    },
    {
      title: 'Entered Code',
      dataIndex: 'entered_code',
      key: 'entered_code',
      render: (code: string) => <Tag color="blue">{code}</Tag>
    },
    {
      title: 'Matched Manufacturer',
      dataIndex: ['manufacturer', 'company_name'],
      key: 'manufacturer',
      render: (name: string, record: any) =>
        name ? `${name} (${record.manufacturer?.unit_code})` : <Text type="secondary">—</Text>
    },
    {
      title: 'Verification Result',
      dataIndex: 'found',
      key: 'found',
      render: (found: boolean) =>
        found ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Valid Origin
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Not Found
          </Tag>
        )
    },
    {
      title: 'IP & Location',
      key: 'location',
      render: (_: any, record: any) => (
        <div>
          <div>{record.city ? `${record.city}, ${record.state || ''}` : record.country || 'India'}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>IP: {record.ip_address || '—'}</div>
        </div>
      )
    }
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic title="Total Recorded Scans" value={summary?.totalScans || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Verified Valid Scans"
              value={summary?.validScans || 0}
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Unrecognized Attempts"
              value={summary?.invalidScans || 0}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <Title level={4} style={{ marginBottom: 2 }}>
              <LineChartOutlined style={{ marginRight: 8, color: '#059669' }} />
              Consumer Scan Reports & Audit Logs
            </Title>
            <Text type="secondary">Review customer scans, geographic locations, and filter invalid attempts</Text>
          </div>
          {hasPermission('scans', 'export') && (
            <Button icon={<DownloadOutlined />} onClick={handleExport} type="primary" style={{ backgroundColor: '#059669' }}>
              Export to CSV
            </Button>
          )}
        </div>

        {/* Filters bar */}
        <Space style={{ marginBottom: 16 }} wrap>
          <FilterOutlined style={{ color: '#94a3b8' }} />
          <Select
            placeholder="Filter by Result"
            allowClear
            style={{ width: 150 }}
            value={filterFound}
            onChange={(val) => setFilterFound(val)}
          >
            <Select.Option value={true}>Valid Scans Only</Select.Option>
            <Select.Option value={false}>Not Found Only</Select.Option>
          </Select>

          <Select
            placeholder="Filter by Product"
            allowClear
            style={{ width: 200 }}
            value={filterProduct}
            onChange={(val) => setFilterProduct(val)}
          >
            {products.map((p: any) => (
              <Select.Option key={p.id} value={p.id}>
                {p.name}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by Manufacturer"
            allowClear
            style={{ width: 220 }}
            value={filterMfg}
            onChange={(val) => setFilterMfg(val)}
          >
            {manufacturers.map((m: any) => (
              <Select.Option key={m.id} value={m.id}>
                {m.company_name} ({m.unit_code})
              </Select.Option>
            ))}
          </Select>
        </Space>

        <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />
      </Card>
    </Space>
  )
}
