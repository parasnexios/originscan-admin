import React, { useState, useEffect } from 'react'
import { Table, Tag, Typography, message, Card } from 'antd'
import { AuditOutlined } from '@ant-design/icons'
import api from '../api'

const { Title, Text } = Typography

export const AuditLogs: React.FC = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const res = await api.get('/audit?show_all=true')
      if (res.data?.data) {
        setData(res.data.data)
      }
    } catch (err) {
      message.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'User',
      dataIndex: ['user', 'name'],
      key: 'user',
      render: (name: string, record: any) => name || `User #${record.user_id || 'System'}`
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      render: (mod: string) => <Tag color="blue">{mod.toUpperCase()}</Tag>
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => {
        let color = 'cyan'
        if (action === 'create') color = 'green'
        if (action === 'delete') color = 'red'
        if (action === 'edit' || action === 'update') color = 'orange'
        return <Tag color={color}>{action.toUpperCase()}</Tag>
      }
    },
    {
      title: 'Entity ID',
      dataIndex: 'entity_id',
      key: 'entity_id',
      render: (id: string) => id || '—'
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address'
    }
  ]

  return (
    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ marginBottom: 2 }}>
          <AuditOutlined style={{ marginRight: 8, color: '#059669' }} />
          System Audit Trail
        </Title>
        <Text type="secondary">
          Immutable logging of every administrative modification, batch status change, and security action
        </Text>
      </div>

      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />
    </Card>
  )
}
