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
  Checkbox
} from 'antd'
import {
  SafetyCertificateOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined
} from '@ant-design/icons'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

export const Roles: React.FC = () => {
  const [roles, setRoles] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [matrixModalOpen, setMatrixModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [permMatrix, setPermMatrix] = useState<Record<number, any>>({})
  const [form] = Form.useForm()
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchRoles()
    fetchModules()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const res = await api.get('/roles?show_all=true')
      if (res.data?.data) {
        setRoles(res.data.data)
      }
    } catch (err) {
      message.error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  const fetchModules = async () => {
    try {
      const res = await api.get('/roles/modules')
      if (res.data?.data) {
        setModules(res.data.data)
      }
    } catch (err) {
      // ignore
    }
  }

  const handleOpenAdd = () => {
    form.resetFields()
    setModalOpen(true)
  }

  const handleOpenMatrix = (role: any) => {
    setSelectedRole(role)
    const map: Record<number, any> = {}
    if (role.permissions) {
      role.permissions.forEach((p: any) => {
        map[p.module_id] = {
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
          can_export: p.can_export
        }
      })
    }
    setPermMatrix(map)
    setMatrixModalOpen(true)
  }

  const handlePermChange = (moduleId: number, action: string, checked: boolean) => {
    setPermMatrix((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || {}),
        [action]: checked
      }
    }))
  }

  const handleSaveMatrix = async () => {
    try {
      const permissions = Object.entries(permMatrix).map(([moduleId, p]) => ({
        module_id: Number(moduleId),
        ...p
      }))
      await api.put(`/roles/${selectedRole.id}/permissions`, { permissions })
      message.success('Permission matrix updated successfully')
      setMatrixModalOpen(false)
      fetchRoles()
    } catch (err) {
      message.error('Failed to update permission matrix')
    }
  }

  const handleCreateRole = async (values: any) => {
    try {
      await api.post('/roles', values)
      message.success('Role created successfully')
      setModalOpen(false)
      fetchRoles()
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Creation failed')
    }
  }

  const handleDeleteRole = async (id: number) => {
    try {
      await api.delete(`/roles/${id}`)
      message.success('Role deleted')
      fetchRoles()
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <Text strong>{name}</Text>
          {record.is_system && <Tag color="default">System Protected</Tag>}
        </Space>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Assigned Permissions',
      key: 'perms',
      render: (_: any, record: any) => (
        <Button
          icon={<SettingOutlined />}
          size="small"
          onClick={() => handleOpenMatrix(record)}
        >
          Permissions Matrix ({record.permissions?.length || 0} modules)
        </Button>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {!record.is_system && hasPermission('roles', 'delete') && (
            <Popconfirm title="Delete Role" onConfirm={() => handleDeleteRole(record.id)}>
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
            <SafetyCertificateOutlined style={{ marginRight: 8, color: '#059669' }} />
            Roles & Module-Wise RBAC
          </Title>
          <Text type="secondary">
            Configure fine-grained module access: View, Create, Edit, Delete, and Export permissions
          </Text>
        </div>
        {hasPermission('roles', 'create') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} style={{ backgroundColor: '#059669' }}>
            Add Custom Role
          </Button>
        )}
      </div>

      <Table dataSource={roles} columns={columns} rowKey="id" loading={loading} />

      {/* Add Role Modal */}
      <Modal title="Create New Role" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleCreateRole}>
          <Form.Item label="Role Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="OPERATIONS_HEAD" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Responsible for managing regional batch distribution" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Permissions Matrix Modal */}
      <Modal
        title={`Permission Matrix for ${selectedRole?.name}`}
        open={matrixModalOpen}
        onCancel={() => setMatrixModalOpen(false)}
        onOk={handleSaveMatrix}
        width={700}
        okText="Save Permissions"
      >
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Tick the specific actions allowed for users assigned to the <strong>{selectedRole?.name}</strong> role.
        </p>

        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Module</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>View</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Create</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Edit</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Delete</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Export</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m: any) => {
                const perms = permMatrix[m.id] || {}
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{m.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Checkbox
                        checked={!!perms.can_view}
                        onChange={(e) => handlePermChange(m.id, 'can_view', e.target.checked)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Checkbox
                        checked={!!perms.can_create}
                        onChange={(e) => handlePermChange(m.id, 'can_create', e.target.checked)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Checkbox
                        checked={!!perms.can_edit}
                        onChange={(e) => handlePermChange(m.id, 'can_edit', e.target.checked)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Checkbox
                        checked={!!perms.can_delete}
                        onChange={(e) => handlePermChange(m.id, 'can_delete', e.target.checked)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Checkbox
                        checked={!!perms.can_export}
                        onChange={(e) => handlePermChange(m.id, 'can_export', e.target.checked)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Modal>
    </Card>
  )
}
