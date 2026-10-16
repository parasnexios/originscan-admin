import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  Typography,
  message,
  Popconfirm,
  Card
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, BranchesOutlined } from '@ant-design/icons'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

export const Branches: React.FC = () => {
  const [data, setData] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [form] = Form.useForm()
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchData()
    fetchManufacturers()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/branches?show_all=true')
      if (res.data?.data) {
        setData(res.data.data)
      }
    } catch (err) {
      message.error('Failed to load branches')
    } finally {
      setLoading(false)
    }
  }

  const fetchManufacturers = async () => {
    try {
      const res = await api.get('/manufacturers?show_all=true')
      const list = res.data?.data || res.data?.payload?.data || (Array.isArray(res.data) ? res.data : [])
      if (Array.isArray(list)) {
        setManufacturers(list)
      }
    } catch (err) {
      // ignore
    }
  }

  const handleOpenAdd = () => {
    setEditingItem(null)
    form.resetFields()
    form.setFieldsValue({ is_active: true })
    fetchManufacturers()
    setModalOpen(true)
  }

  const handleOpenEdit = (record: any) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    fetchManufacturers()
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/branches/${id}`)
      message.success('Branch deleted')
      fetchData()
    } catch (err) {
      message.error('Failed to delete branch')
    }
  }

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await api.put(`/branches/${editingItem.id}`, values)
        message.success('Branch updated')
      } else {
        await api.post('/branches', values)
        message.success('Branch created')
      }
      setModalOpen(false)
      fetchData()
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const columns = [
    {
      title: 'Branch Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="cyan">{code}</Tag>
    },
    {
      title: 'Branch Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>
    },
    {
      title: 'Linked Manufacturer',
      dataIndex: ['manufacturer', 'company_name'],
      key: 'manufacturer',
      render: (name: string) => name || <Text type="secondary">Direct Hub</Text>
    },
    {
      title: 'City & State',
      key: 'location',
      render: (_: any, record: any) => `${record.city || ''}, ${record.state || ''}`
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
          {hasPermission('branches', 'edit') && (
            <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          )}
          {hasPermission('branches', 'delete') && (
            <Popconfirm title="Delete Branch" onConfirm={() => handleDelete(record.id)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
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
            <BranchesOutlined style={{ marginRight: 8, color: '#059669' }} />
            Branch & Distribution Hubs
          </Title>
          <Text type="secondary">Manage regional branch locations linked to batch distributions</Text>
        </div>
        {hasPermission('branches', 'create') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} style={{ backgroundColor: '#059669' }}>
            Add Branch
          </Button>
        )}
      </div>

      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title={editingItem ? 'Edit Branch' : 'Add Branch'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item label="Branch Code" name="code" rules={[{ required: true, message: 'Please enter code' }]}>
            <Input placeholder="BLR" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Form.Item label="Branch Name" name="name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input placeholder="Bengaluru Central Depot" />
          </Form.Item>

          <Form.Item label="Associated Manufacturer (Optional)" name="manufacturer_id">
            <Select
              placeholder="Select manufacturing partner"
              allowClear
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
              options={manufacturers.map((m: any) => ({
                label: `${m.company_name} (${m.unit_code})`,
                value: m.id
              }))}
            />
          </Form.Item>

          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item label="City" name="city">
              <Input placeholder="Bengaluru" />
            </Form.Item>
            <Form.Item label="State" name="state">
              <Input placeholder="Karnataka" />
            </Form.Item>
          </Space>

          <Form.Item label="Address" name="address">
            <Input.TextArea rows={2} placeholder="Hub address" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
