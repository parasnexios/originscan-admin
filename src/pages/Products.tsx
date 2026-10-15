import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Tag,
  Typography,
  message,
  Popconfirm,
  Card,
  Avatar
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined, QrcodeOutlined } from '@ant-design/icons'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

export const Products: React.FC = () => {
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
      const res = await api.get('/products?show_all=true')
      if (res.data?.data) {
        setData(res.data.data)
      }
    } catch (err) {
      message.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingItem(null)
    form.resetFields()
    form.setFieldsValue({ is_active: true })
    setModalOpen(true)
  }

  const handleOpenEdit = (record: any) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`)
      message.success('Product deleted')
      fetchData()
    } catch (err) {
      message.error('Failed to delete product')
    }
  }

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await api.put(`/products/${editingItem.id}`, values)
        message.success('Product updated')
      } else {
        await api.post('/products', values)
        message.success('Product created')
      }
      setModalOpen(false)
      fetchData()
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (url: string) =>
        url ? (
          <Avatar shape="square" size={44} src={url} />
        ) : (
          <Avatar shape="square" size={44} icon={<AppstoreOutlined />} style={{ backgroundColor: '#059669' }} />
        )
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>
    },
    {
      title: 'Slug (URL parameter)',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => <Tag color="blue">/v/{slug}</Tag>
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku'
    },
    {
      title: 'Pack Size / Weight',
      dataIndex: 'net_weight',
      key: 'net_weight'
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
          {hasPermission('products', 'edit') && (
            <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          )}
          {hasPermission('products', 'delete') && (
            <Popconfirm title="Delete Product" onConfirm={() => handleDelete(record.id)}>
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
            <AppstoreOutlined style={{ marginRight: 8, color: '#059669' }} />
            Products & SKUs
          </Title>
          <Text type="secondary">Each product gets one permanent QR code printed on its pack label</Text>
        </div>
        {hasPermission('products', 'create') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} style={{ backgroundColor: '#059669' }}>
            Add Product
          </Button>
        )}
      </div>

      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title={editingItem ? 'Edit Product' : 'Add Product'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item label="Product Name" name="name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input placeholder="Panipuri Classic Pack (50 Pcs)" />
          </Form.Item>

          <Form.Item
            label="Product Slug (URL Identifier)"
            name="slug"
            help="Used in the QR link, e.g. /v/panipuri-classic"
          >
            <Input placeholder="panipuri-classic" />
          </Form.Item>

          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item label="SKU Code" name="sku">
              <Input placeholder="PP-CLS-050" />
            </Form.Item>
            <Form.Item label="Net Weight / Pack Size" name="net_weight">
              <Input placeholder="250g" />
            </Form.Item>
          </Space>

          <Form.Item label="Pack Image URL" name="image_url">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={2} placeholder="Product description" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
