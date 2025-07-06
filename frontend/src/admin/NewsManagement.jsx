import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Input, Tag, Form, Upload, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Search } = Input;
const { TextArea } = Input;

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentDeleteId, setCurrentDeleteId] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileList, setFileList] = useState([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Base URL for your Flask backend
  const API_BASE_URL = 'http://localhost:5000';

  // Get authentication headers
  const getAuthHeaders = () => ({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <img 
          src={image ? `${API_BASE_URL}${image}` : 'https://via.placeholder.com/50'} 
          alt="News" 
          style={{ width: 50, height: 50, objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (text) => <div style={{ maxWidth: 300 }}>{`${text.substring(0, 50)}...`}</div>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('LL'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => showDeleteConfirm(record.id)}
            loading={deleteLoading}
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchNews();
  }, [searchTerm]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/news`, {
        ...getAuthHeaders(),
        params: { search: searchTerm }
      });
      setNews(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Fetch news error:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (id) => {
    setCurrentDeleteId(id);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await axios.delete(`${API_BASE_URL}/api/admin/news/${currentDeleteId}`, getAuthHeaders());
      toast.success('News deleted successfully');
      await fetchNews();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete news');
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalVisible(false);
    }
  };

  const handleEdit = (record) => {
    setEditingNews(record);
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      category: record.category
    });
    
    if (record.image) {
      setFileList([{
        uid: '-1',
        name: 'current-image.png',
        status: 'done',
        url: `${API_BASE_URL}${record.image}`,
      }]);
    } else {
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      setFormSubmitting(true);
      const values = await form.validateFields();
      const formData = new FormData();
      
      // Append all form fields except image
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'image') {
          formData.append(key, value);
        }
      });

      // Handle image upload
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      } else if (editingNews?.image && fileList.length === 0) {
        // If editing and no new image selected, keep existing image
        formData.append('keepExistingImage', 'true');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingNews) {
        await axios.put(
          `${API_BASE_URL}/api/admin/news/${editingNews.id}`,
          formData,
          config
        );
        toast.success('News updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/api/admin/news`,
          formData,
          config
        );
        toast.success('News added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchNews();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.errorFields) {
        toast.error('Please fill all required fields correctly');
      } else {
        toast.error('Operation failed. Please try again.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <div className="admin-news-management" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>News Management</h2>
        <div>
          <Search
            placeholder="Search news"
            allowClear
            enterButton
            style={{ width: 300, marginRight: '10px' }}
            onSearch={(value) => setSearchTerm(value)}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingNews(null);
              form.resetFields();
              setFileList([]);
              setIsModalVisible(true);
            }}
          >
            Add News
          </Button>
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={news} 
        rowKey="id"
        loading={loading}
        scroll={{ x: true }}
        pagination={{ pageSize: 10 }}
      />

      {/* Edit/Add News Modal */}
      <Modal
        title={editingNews ? 'Edit News' : 'Add News'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={editingNews || {}}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="News title" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please input the content!' }]}
          >
            <TextArea rows={6} placeholder="News content" />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please input the category!' }]}
          >
            <Input placeholder="News category" />
          </Form.Item>
          
          <Form.Item
            label="Image"
            extra="Upload a news image (max 2MB)"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              maxCount={1}
              accept="image/*"
              onRemove={() => setFileList([])}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              style={{ marginRight: '10px' }}
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setFileList([]);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={formSubmitting}
            >
              {editingNews ? 'Update News' : 'Add News'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        confirmLoading={deleteLoading}
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this news item?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default NewsManagement;