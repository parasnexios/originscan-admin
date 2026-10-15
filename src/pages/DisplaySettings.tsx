import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Switch,
  Input,
  Button,
  Typography,
  message,
  Row,
  Col,
  Divider
} from 'antd'
import { SettingOutlined, SaveOutlined, MobileOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

export const DisplaySettings: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [previewValues, setPreviewValues] = useState<any>({
    show_company_name: true,
    show_address: true,
    show_fssai: true,
    show_contact: true,
    show_product_name: true,
    show_mfg_date: true,
    show_expiry_date: true,
    show_branch: true,
    not_found_message: 'Code not found. Please check the batch number or contact support.',
    support_contact: '+91 98765 43210'
  })
  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await api.get('/settings/display')
      if (res.data?.data) {
        form.setFieldsValue(res.data.data)
        setPreviewValues(res.data.data)
      }
    } catch (err) {
      message.error('Failed to load display settings')
    } finally {
      setLoading(false)
    }
  }

  const handleValuesChange = (_: any, allValues: any) => {
    setPreviewValues(allValues)
  }

  const handleSave = async (values: any) => {
    try {
      setLoading(true)
      await api.put('/settings/display', values)
      message.success('Display settings updated successfully')
      fetchSettings()
    } catch (err) {
      message.error('Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ marginBottom: 2 }}>
          <SettingOutlined style={{ marginRight: 8, color: '#059669' }} />
          Consumer Verification Display Settings
        </Title>
        <Text type="secondary">
          Control what information is visible to customers when they scan the QR code and verify their pack.
        </Text>
      </div>

      <Row gutter={[32, 24]}>
        {/* Form controls */}
        <Col xs={24} lg={14}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            onValuesChange={handleValuesChange}
            initialValues={previewValues}
          >
            <Title level={5}>Manufacturer Details Visibility</Title>
            <Form.Item name="show_company_name" valuePropName="checked">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Show Manufacturing Unit Name</Text>
                <Switch />
              </div>
            </Form.Item>

            <Form.Item name="show_address" valuePropName="checked">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Show Physical Address (City, State, Pincode)</Text>
                <Switch />
              </div>
            </Form.Item>

            <Form.Item name="show_fssai" valuePropName="checked">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Show Unit FSSAI License Number</Text>
                <Switch />
              </div>
            </Form.Item>

            <Form.Item name="show_contact" valuePropName="checked">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Show Unit Support Contact Phone</Text>
                <Switch />
              </div>
            </Form.Item>

            <Divider />

            <Title level={5}>Batch & Product Level Details</Title>
            <Form.Item name="show_product_name" valuePropName="checked">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Show Product Name & Pack Size</Text>
                <Switch />
              </div>
            </Form.Item>

            <Form.Item name="show_mfg_date" valuePropName="checked">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Show Manufacturing Date</Text>
                <Switch />
              </div>
            </Form.Item>

            <Form.Item name="show_expiry_date" valuePropName="checked">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Show Expiry Date</Text>
                <Switch />
              </div>
            </Form.Item>

            <Divider />

            <Title level={5}>Custom Customer Messages</Title>
            <Form.Item label="Not Found Explanation Message" name="not_found_message">
              <Input.TextArea rows={2} />
            </Form.Item>

            <Form.Item label="Support Helpline / Email" name="support_contact">
              <Input placeholder="+91 98765 43210" />
            </Form.Item>

            {hasPermission('settings', 'edit') && (
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                style={{ backgroundColor: '#059669', height: 42, padding: '0 24px' }}
              >
                Save Display Switches
              </Button>
            )}
          </Form>
        </Col>

        {/* Live Mobile Screen Preview */}
        <Col xs={24} lg={10}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <Text strong style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
              <MobileOutlined /> Live Mobile Result Preview
            </Text>
          </div>

          <div
            style={{
              maxWidth: 320,
              margin: '0 auto',
              background: '#0d1f2d',
              border: '8px solid #1e293b',
              borderRadius: 36,
              padding: '24px 16px',
              color: '#fff',
              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              minHeight: 440
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(5, 150, 105, 0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <SafetyCertificateOutlined style={{ fontSize: 20, color: '#10b981' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>Verified Genuine</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Origin Authenticated</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, fontSize: 11, marginBottom: 10 }}>
              {previewValues?.show_company_name && (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ color: '#94a3b8', fontSize: 9 }}>MANUFACTURED BY</span>
                  <div style={{ fontWeight: 700, color: '#f8fafc' }}>Kerala Processing Unit Pvt Ltd</div>
                </div>
              )}

              {previewValues?.show_fssai && (
                <div style={{ color: '#34d399', fontWeight: 600, fontSize: 10, marginBottom: 6 }}>
                  FSSAI Lic: 11325010000358
                </div>
              )}

              {previewValues?.show_address && (
                <div style={{ color: '#cbd5e1', fontSize: 10, marginBottom: 6 }}>
                  Plot 12, Cochin SEZ, Kakkanad, Kochi, Kerala - 682037
                </div>
              )}

              {previewValues?.show_contact && (
                <div style={{ color: '#94a3b8', fontSize: 10 }}>
                  Contact: {previewValues?.support_contact || '+91 484 2410111'}
                </div>
              )}
            </div>

            {(previewValues?.show_mfg_date || previewValues?.show_expiry_date) && (
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '8px 12px', fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
                {previewValues?.show_mfg_date && (
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: 8 }}>MFG DATE</span>
                    <div>2026-10-15</div>
                  </div>
                )}
                {previewValues?.show_expiry_date && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#94a3b8', fontSize: 8 }}>EXPIRY</span>
                    <div style={{ color: '#34d399' }}>2027-04-15</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  )
}
