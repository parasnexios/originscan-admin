import React, { useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, Tag } from 'antd'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  DashboardOutlined,
  ShopOutlined,
  BranchesOutlined,
  AppstoreOutlined,
  BarcodeOutlined,
  QrcodeOutlined,
  LineChartOutlined,
  SettingOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'

const { Header, Sider, Content } = Layout
const { Text } = Typography

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, hasPermission } = useAuth()

  const menuItems = [
    hasPermission('dashboard') && {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    hasPermission('manufacturers') && {
      key: '/manufacturers',
      icon: <ShopOutlined />,
      label: 'Manufacturers'
    },
    hasPermission('branches') && {
      key: '/branches',
      icon: <BranchesOutlined />,
      label: 'Branches'
    },
    hasPermission('products') && {
      key: '/products',
      icon: <AppstoreOutlined />,
      label: 'Products (SKUs)'
    },
    hasPermission('batches') && {
      key: '/batches',
      icon: <BarcodeOutlined />,
      label: 'Batches'
    },
    hasPermission('qr_codes') && {
      key: '/qr-codes',
      icon: <QrcodeOutlined />,
      label: 'QR Codes'
    },
    hasPermission('scans') && {
      key: '/scans',
      icon: <LineChartOutlined />,
      label: 'Scan Reports'
    },
    hasPermission('settings') && {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Display Settings'
    },
    hasPermission('users') && {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Users'
    },
    hasPermission('roles') && {
      key: '/roles',
      icon: <SafetyCertificateOutlined />,
      label: 'Roles & RBAC'
    },
    hasPermission('audit') && {
      key: '/audit',
      icon: <AuditOutlined />,
      label: 'Audit Trail'
    }
  ].filter(Boolean) as any[]

  const userDropdown = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Sign Out',
        danger: true,
        onClick: () => {
          logout()
          navigate('/login')
        }
      }
    ]
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        width={240}
        style={{
          borderRight: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800
            }}
          >
            OS
          </div>
          {!collapsed && (
            <div>
              <Text strong style={{ fontSize: 16, color: '#0f172a' }}>
                OriginScan
              </Text>
              <div style={{ fontSize: 11, color: '#64748b' }}>Admin Portal</div>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          <Space size="middle">
            {user?.is_super_admin ? (
              <Tag color="purple">Super Admin</Tag>
            ) : (
              <Tag color="cyan">Admin</Tag>
            )}

            <Dropdown menu={userDropdown} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#059669' }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Text strong>{user?.name || 'Administrator'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: '24px', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
