import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Input, DatePicker } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { Search } = Input;

const WeatherData = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Temperature (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      sorter: (a, b) => a.temperature - b.temperature,
    },
    {
      title: 'Humidity (%)',
      dataIndex: 'humidity',
      key: 'humidity',
    },
    {
      title: 'Precipitation (mm)',
      dataIndex: 'precipitation',
      key: 'precipitation',
    },
    {
      title: 'Wind Speed (km/h)',
      dataIndex: 'windSpeed',
      key: 'windSpeed',
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
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchWeatherData();
  }, [searchTerm, dateRange]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      let url = '/api/weather-data';
      const params = {};
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      const response = await axios.get(url, { params });
      setWeatherData(response.data);
    } catch (error) {
      message.error('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/weather-data/${id}`);
      message.success('Weather record deleted successfully');
      fetchWeatherData();
    } catch (error) {
      message.error('Failed to delete weather record');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await axios.put(`/api/weather-data/${editingRecord.id}`, values);
        message.success('Weather record updated successfully');
      } else {
        await axios.post('/api/weather-data', values);
        message.success('Weather record added successfully');
      }
      setIsModalVisible(false);
      fetchWeatherData();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  return (
    <div className="admin-weather-data">
      <div className="admin-header">
        <h2>Weather Data Management</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingRecord(null);
            setIsModalVisible(true);
          }}
        >
          Add New Record
        </Button>
      </div>

      <div className="admin-filters">
        <Search
          placeholder="Search weather data"
          allowClear
          enterButton
          style={{ width: 300, marginRight: 16 }}
          onSearch={(value) => setSearchTerm(value)}
        />
        <RangePicker 
          onChange={(dates) => setDateRange(dates)} 
          style={{ marginRight: 16 }}
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={weatherData} 
        rowKey="id"
        loading={loading}
        scroll={{ x: true }}
      />

      <Modal
        title={editingRecord ? 'Edit Weather Record' : 'Add New Weather Record'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {/* Form would go here - implement with Formik or Antd Form */}
        <p>Form implementation would go here</p>
      </Modal>
    </div>
  );
};

export default WeatherData;