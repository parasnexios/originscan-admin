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
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

export const Users: React.FC = () => {
  const [data, setData] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [form] = Form.useForm()
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users?show_all=true')
      if (res.data?.data) {
        setData(res.data.data)
      }
    } catch (err) {
      message.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles?show_all=true')
      if (res.data?.data) {
        setRoles(res.data.data)
      }
    } catch (err) {
      // ignore
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
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role_id: record.role_id,
      is_active: record.is_active
    })
    setModalOpen(true)
  }

  const handleStatusToggle = async (checked: boolean, record: any) => {
    try {
      await api.patch(`/users/${record.user_id}/status`, { is_active: checked })
      message.success('User status updated')
      fetchUsers()
    } catch (err) {
      message.error('Failed to update status')
    }
  }

  const handleDelete = async (userId: number) => {
    try {
      await api.delete(`/users/${userId}`)
      message.success('User deleted')
      fetchUsers()
    } catch (err) {
      message.error('Failed to delete user')
    }
  }

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await api.put(`/users/${editingItem.user_id}`, values)
        message.success('User updated')
      } else {
        await api.post('/users', values)
        message.success('User created')
      }
      setModalOpen(false)
      fetchUsers()
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Operation failed')
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div>
          <Text strong>{name}</Text>
          {record.is_super_admin && <Tag color="purple" style={{ marginLeft: 8 }}>Super Admin</Tag>}
        </div>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Assigned Role',
      dataIndex: ['Role', 'name'],
      key: 'role',
      render: (roleName: string, record: any) => (
        <Tag color="blue">{roleName || record.role || 'ADMIN'}</Tag>
      )
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      render: (date: string) => (date ? new Date(date).toLocaleString() : 'Never')
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean, record: any) => (
        <Switch
          checked={active}
          disabled={!hasPermission('users', 'edit') || record.is_super_admin}
          onChange={(val) => handleStatusToggle(val, record)}
          checkedChildren="Active"
          unCheckedChildren="Disabled"
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {hasPermission('users', 'edit') && (
            <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          )}
          {hasPermission('users', 'delete') && !record.is_super_admin && (
            <Popconfirm title="Delete User" onConfirm={() => handleDelete(record.user_id)}>
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
            <UserOutlined style={{ marginRight: 8, color: '#059669' }} />
            System User Management
          </Title>
          <Text type="secondary">Manage user accounts, assign roles, and revoke platform access</Text>
        </div>
        {hasPermission('users', 'create') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} style={{ backgroundColor: '#059669' }}>
            Add User
          </Button>
        )}
      </div>

      <Table dataSource={data} columns={columns} rowKey="user_id" loading={loading} />

      <Modal
        title={editingItem ? 'Edit User' : 'Create User'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item label="Email Address" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="john@example.com" />
          </Form.Item>

          {!editingItem && (
            <Form.Item label="Initial Password" name="password" rules={[{ required: true }]}>
              <Input.Password placeholder="Password@123" />
            </Form.Item>
          )}

          <Form.Item label="Assigned Role" name="role_id" rules={[{ required: true }]}>
            <Select placeholder="Choose access role">
              {roles.map((r: any) => (
                <Select.Option key={r.id} value={r.id}>
                  {r.name} {r.is_system ? '(System Default)' : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
