import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Typography,
  message,
  Popconfirm,
  Card,
  Upload,
  DatePicker,
  InputNumber,
  Alert
} from 'antd'
import {
  PlusOutlined,
  UploadOutlined,
  BarcodeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

export const Batches: React.FC = () => {
  const [data, setData] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [products, setProducts] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<any>(null)
  const [importResults, setImportResults] = useState<any>(null)
  const [csvText, setCsvText] = useState('')
  const [form] = Form.useForm()
  const [statusForm] = Form.useForm()
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchData()
    fetchOptions()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/batches?show_all=true')
      if (res.data?.data) {
        setData(res.data.data)
      }
    } catch (err) {
      message.error('Failed to load batches')
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const [mRes, pRes, bRes] = await Promise.allSettled([
        api.get('/manufacturers?show_all=true'),
        api.get('/products?show_all=true'),
        api.get('/branches?show_all=true')
      ])
      if (mRes.status === 'fulfilled') {
        const list = mRes.value.data?.data || mRes.value.data?.payload?.data || (Array.isArray(mRes.value.data) ? mRes.value.data : [])
        if (Array.isArray(list)) setManufacturers(list)
      }
      if (pRes.status === 'fulfilled') {
        const list = pRes.value.data?.data || pRes.value.data?.payload?.data || (Array.isArray(pRes.value.data) ? pRes.value.data : [])
        if (Array.isArray(list)) setProducts(list)
      }
      if (bRes.status === 'fulfilled') {
        const list = bRes.value.data?.data || bRes.value.data?.payload?.data || (Array.isArray(bRes.value.data) ? bRes.value.data : [])
        if (Array.isArray(list)) setBranches(list)
      }
    } catch (err) {
      // ignore
    }
  }

  const handleOpenAdd = () => {
    form.resetFields()
    form.setFieldsValue({ status: 'active', quantity: 5000 })
    fetchOptions()
    setModalOpen(true)
  }

  const handleOpenStatus = (record: any) => {
    setSelectedBatch(record)
    statusForm.setFieldsValue({ status: record.status })
    setStatusModalOpen(true)
  }

  const handleStatusSubmit = async (values: any) => {
    try {
      await api.patch(`/batches/${selectedBatch.id}/status`, values)
      message.success('Batch status updated')
      setStatusModalOpen(false)
      fetchData()
    } catch (err) {
      message.error('Failed to update status')
    }
  }

  const handleFormSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        mfg_date: values.mfg_date?.format('YYYY-MM-DD'),
        expiry_date: values.expiry_date?.format('YYYY-MM-DD')
      }
      await api.post('/batches', payload)
      message.success('Batch created successfully')
      setModalOpen(false)
      fetchData()
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleCsvImport = async () => {
    try {
      setLoading(true)
      const res = await api.post('/batches/import', { csv_content: csvText })
      if (res.data?.data) {
        setImportResults(res.data.data)
        message.success(`Import complete: ${res.data.data.successCount} added`)
        fetchData()
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Batch Number',
      dataIndex: 'batch_no',
      key: 'batch_no',
      render: (batch: string) => <Tag color="blue" style={{ fontSize: 13, fontWeight: 700 }}>{batch}</Tag>
    },
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      key: 'product'
    },
    {
      title: 'Manufacturer Unit',
      dataIndex: ['manufacturer', 'company_name'],
      key: 'manufacturer',
      render: (name: string, record: any) => `${name} (${record.manufacturer?.unit_code})`
    },
    {
      title: 'Mfg Date',
      dataIndex: 'mfg_date',
      key: 'mfg_date'
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date: string) => {
        const isExpired = new Date(date) < new Date()
        return <Text type={isExpired ? 'danger' : undefined}>{date} {isExpired ? '(Expired)' : ''}</Text>
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'active') return <Tag color="success">Active</Tag>
        if (status === 'recalled') return <Tag color="error">Recalled</Tag>
        return <Tag color="warning">Blocked</Tag>
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {hasPermission('batches', 'edit') && (
            <Button size="small" onClick={() => handleOpenStatus(record)}>
              Change Status
            </Button>
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
            <BarcodeOutlined style={{ marginRight: 8, color: '#059669' }} />
            Production Batches
          </Title>
          <Text type="secondary">Track batches, recall defective lots, and bulk import CSV production logs</Text>
        </div>
        <Space>
          {hasPermission('batches', 'create') && (
            <>
              <Button icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>
                Import CSV
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} style={{ backgroundColor: '#059669' }}>
                Create Batch
              </Button>
            </>
          )}
        </Space>
      </div>

      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />

      {/* Create Batch Modal */}
      <Modal
        title="Create Production Batch"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            label="Batch Number (e.g. KRL26101501)"
            name="batch_no"
            rules={[
              { required: true, message: 'Please enter batch number' },
              { min: 3, message: 'Must be at least 3 characters' }
            ]}
          >
            <Input placeholder="KRL26101501" style={{ textTransform: 'uppercase', fontWeight: 700 }} />
          </Form.Item>

          <Form.Item label="Manufacturing Partner Unit" name="manufacturer_id" rules={[{ required: true, message: 'Please select manufacturing partner' }]}>
            <Select
              placeholder="Select manufacturer"
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
              options={manufacturers.map((m: any) => ({
                label: `${m.company_name} (${m.unit_code})`,
                value: m.id
              }))}
            />
          </Form.Item>

          <Form.Item label="Product (SKU)" name="product_id" rules={[{ required: true, message: 'Please select product SKU' }]}>
            <Select
              placeholder="Select product"
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
              options={products.map((p: any) => ({
                label: `${p.name} (${p.sku || p.slug})`,
                value: p.id
              }))}
            />
          </Form.Item>

          <Form.Item label="Distribution Branch (Optional)" name="branch_id">
            <Select
              placeholder="Select branch"
              allowClear
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
              options={branches.map((b: any) => ({
                label: `${b.name} (${b.code})`,
                value: b.id
              }))}
            />
          </Form.Item>

          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item label="Mfg Date" name="mfg_date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Expiry Date" name="expiry_date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Form.Item label="Pack Quantity" name="quantity">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="5000" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        title={`Change Status for Batch ${selectedBatch?.batch_no}`}
        open={statusModalOpen}
        onCancel={() => setStatusModalOpen(false)}
        onOk={() => statusForm.submit()}
      >
        <Form form={statusForm} layout="vertical" onFinish={handleStatusSubmit}>
          <Form.Item label="Batch Status" name="status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="active">Active (Verified Genuine)</Select.Option>
              <Select.Option value="recalled">Recalled (Issues Warning to Customers)</Select.Option>
              <Select.Option value="blocked">Blocked (Suspicious Lot)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* CSV Bulk Import Modal */}
      <Modal
        title="Bulk Import Batches via CSV"
        open={importModalOpen}
        onCancel={() => {
          setImportModalOpen(false)
          setImportResults(null)
          setCsvText('')
        }}
        onOk={handleCsvImport}
        okText="Process Import"
      >
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
          Paste CSV rows formatted as: <br />
          <code>batch_no,product_slug,branch_code,mfg_date,expiry_date,quantity</code>
        </p>

        <Input.TextArea
          rows={6}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder={`batch_no,product_slug,branch_code,mfg_date,expiry_date,quantity\nKRL26101501,panipuri-classic,BLR,2026-10-15,2027-04-15,5000\nPUN26101502,panipuri-masala,PUN,2026-10-15,2027-04-15,3000`}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />

        {importResults && (
          <Alert
            style={{ marginTop: 14 }}
            message={`Import Summary: ${importResults.successCount} succeeded, ${importResults.failedCount} failed`}
            type={importResults.failedCount > 0 ? 'warning' : 'success'}
            description={
              importResults.errors?.length > 0 && (
                <ul style={{ paddingLeft: 18, marginTop: 6, fontSize: 12 }}>
                  {importResults.errors.slice(0, 5).map((e: any, idx: number) => (
                    <li key={idx}>Row {e.row}: {e.error} ({e.batch_no})</li>
                  ))}
                </ul>
              )
            }
          />
        )}
      </Modal>
    </Card>
  )
}
