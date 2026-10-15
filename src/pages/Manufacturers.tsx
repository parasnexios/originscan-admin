import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
  Typography,
  message,
  Popconfirm,
  Card
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

export const Manufacturers: React.FC = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [form] = Form.useForm()
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/manufacturers?show_all=true')
      if (res.data?.data) {
        setData(res.data.data)
      }
    } catch (err) {
      message.error('Failed to load manufacturers')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingItem(null)
    form.resetFields()
    form.setFieldsValue({ is_active: true, country: 'India' })
    setModalOpen(true)
  }

  const handleOpenEdit = (record: any) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleStatusToggle = async (checked: boolean, record: any) => {
    try {
      await api.patch(`/manufacturers/${record.id}/status`, { is_active: checked })
      message.success('Status updated')
      fetchData()
    } catch (err) {
      message.error('Failed to update status')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/manufacturers/${id}`)
      message.success('Manufacturer deleted')
      fetchData()
    } catch (err) {
      message.error('Failed to delete manufacturer')
    }
  }

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await api.put(`/manufacturers/${editingItem.id}`, values)
        message.success('Manufacturer updated')
      } else {
        await api.post('/manufacturers', values)
        message.success('Manufacturer created')
      }
      setModalOpen(false)
      fetchData()
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const columns = [
    {
      title: 'Unit Code',
      dataIndex: 'unit_code',
      key: 'unit_code',
      render: (code: string) => (
        <Tag color="geekblue" style={{ fontSize: 13, fontWeight: 700 }}>
          {code}
        </Tag>
      )
    },
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      key: 'company_name',
      render: (name: string) => <Text strong>{name}</Text>
    },
    {
      title: 'FSSAI License',
      dataIndex: 'fssai_license',
      key: 'fssai_license'
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
      render: (active: boolean, record: any) => (
        <Switch
          checked={active}
          disabled={!hasPermission('manufacturers', 'edit')}
          onChange={(val) => handleStatusToggle(val, record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {hasPermission('manufacturers', 'edit') && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          )}
          {hasPermission('manufacturers', 'delete') && (
            <Popconfirm
              title="Delete Manufacturer"
              description="Are you sure you want to delete this manufacturer?"
              onConfirm={() => handleDelete(record.id)}
            >
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
            <ShopOutlined style={{ marginRight: 8, color: '#059669' }} />
            Manufacturing Units (6 Units)
          </Title>
          <Text type="secondary">
            Manage production partners. The 3-character unit code matches the first 3 letters of batch numbers.
          </Text>
        </div>
        {hasPermission('manufacturers', 'create') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} style={{ backgroundColor: '#059669' }}>
            Add Manufacturer
          </Button>
        )}
      </div>

      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title={editingItem ? 'Edit Manufacturing Unit' : 'Add Manufacturing Unit'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            label="Unit Code (3 Letters, e.g. KRL, PUN)"
            name="unit_code"
            rules={[
              { required: true, message: 'Please enter 3-character unit code' },
              { len: 3, message: 'Unit code must be exactly 3 characters' }
            ]}
          >
            <Input placeholder="KRL" maxLength={3} style={{ textTransform: 'uppercase', fontWeight: 700 }} />
          </Form.Item>

          <Form.Item
            label="Company Name"
            name="company_name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="Kerala Processing Unit Pvt Ltd" />
          </Form.Item>

          <Form.Item
            label="FSSAI License Number"
            name="fssai_license"
            rules={[{ required: true, message: 'Please enter FSSAI license' }]}
          >
            <Input placeholder="11325010000358" />
          </Form.Item>

          <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Please enter address' }]}>
            <Input.TextArea rows={2} placeholder="Plot 12, Cochin SEZ, Kakkanad" />
          </Form.Item>

          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item label="City" name="city">
              <Input placeholder="Kochi" />
            </Form.Item>
            <Form.Item label="State" name="state">
              <Input placeholder="Kerala" />
            </Form.Item>
            <Form.Item label="Pincode" name="pincode">
              <Input placeholder="682037" />
            </Form.Item>
          </Space>

          <Form.Item label="Contact Phone" name="contact_phone">
            <Input placeholder="+91 484 2410111" />
          </Form.Item>

          <Form.Item label="Contact Email" name="contact_email">
            <Input placeholder="quality@example.com" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
