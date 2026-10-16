import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  Tag,
  Typography,
  message,
  Card
} from 'antd'
import {
  QrcodeOutlined,
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { QRCodeSVG } from 'qrcode.react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

export const QRCodes: React.FC = () => {
  const [data, setData] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [previewQr, setPreviewQr] = useState<any>(null)
  const [form] = Form.useForm()
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchData()
    fetchProducts()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/qr?show_all=true')
      if (res.data?.data) {
        setData(res.data.data)
      }
    } catch (err) {
      message.error('Failed to load QR codes')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?show_all=true')
      const list = res.data?.data || res.data?.payload?.data || (Array.isArray(res.data) ? res.data : [])
      if (Array.isArray(list)) {
        setProducts(list)
      }
    } catch (err) {
      // ignore
    }
  }

  const handleGenerate = async (values: any) => {
    try {
      await api.post('/qr/generate', values)
      message.success('QR Code generated successfully')
      setModalOpen(false)
      fetchData()
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Generation failed')
    }
  }

  const downloadFile = async (id: number, format: 'png' | 'svg') => {
    try {
      const res = await api.get(`/qr/${id}/download?format=${format}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `originscan-qr-${id}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      message.error('Download failed')
    }
  }

  const columns = [
    {
      title: 'Product (SKU)',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (name: string, record: any) => (
        <div>
          <Text strong>{name}</Text>
          <div style={{ fontSize: 11, color: '#64748b' }}>SKU: {record.product?.sku || 'N/A'}</div>
        </div>
      )
    },
    {
      title: 'Target Verification URL',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
          {url}
        </a>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (active ? <Tag color="success">Active</Tag> : <Tag color="default">Inactive</Tag>)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => setPreviewQr(record)}>
            Preview
          </Button>
          {hasPermission('qr_codes', 'export') && (
            <>
              <Button
                icon={<DownloadOutlined />}
                size="small"
                onClick={() => downloadFile(record.id, 'png')}
              >
                PNG
              </Button>
              <Button
                icon={<DownloadOutlined />}
                size="small"
                onClick={() => downloadFile(record.id, 'svg')}
              >
                SVG (Print)
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ marginBottom: 2 }}>
            <QrcodeOutlined style={{ marginRight: 8, color: '#059669' }} />
            Master Product QR Codes
          </Title>
          <Text type="secondary">
            Generate high-resolution PNG and vector SVG QR codes for printing directly on package labels.
          </Text>
        </div>
        {hasPermission('qr_codes', 'create') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields()
              fetchProducts()
              setModalOpen(true)
            }}
            style={{ backgroundColor: '#059669' }}
          >
            Generate QR Code
          </Button>
        )}
      </div>

      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />

      {/* Generate Modal */}
      <Modal
        title="Generate Product QR Code"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleGenerate}>
          <Form.Item label="Select Product" name="product_id" rules={[{ required: true, message: 'Please select a product SKU' }]}>
            <Select
              placeholder="Choose product SKU"
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
              options={products.map((p: any) => ({
                label: `${p.name} (${p.slug})`,
                value: p.id
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={`QR Code Preview — ${previewQr?.product?.name || 'Product'}`}
        open={!!previewQr}
        onCancel={() => setPreviewQr(null)}
        footer={[
          <Button key="close" onClick={() => setPreviewQr(null)}>
            Close
          </Button>,
          hasPermission('qr_codes', 'export') && (
            <Button
              key="png"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => downloadFile(previewQr.id, 'png')}
              style={{ backgroundColor: '#059669' }}
            >
              Download PNG
            </Button>
          )
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {previewQr && (
            <div style={{ display: 'inline-block', padding: 16, background: '#fff', borderRadius: 12, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
              <QRCodeSVG value={previewQr.url} size={220} level="M" />
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Target: {previewQr?.url}
            </Text>
          </div>
        </div>
      </Modal>
    </Card>
  )
}
