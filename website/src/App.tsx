import { useState, useEffect } from 'react';
import { Button, Card, Layout, Typography, List, Tag, Space, Popconfirm, theme } from 'antd';
import { 
  BugOutlined, 
  CloudDownloadOutlined, 
  WarningOutlined, 
  DashboardOutlined, 
  UserOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import './App.css';
import GMonitor, { BasicType } from '../../sdk/dist/index';

const { Content } = Layout;
const { Text } = Typography;
const { useToken } = theme;

const GM = new GMonitor();

function App() {
  const { token } = useToken();
  const [logs, setLogs] = useState<Partial<BasicType>[]>([]);
  const [gm, setGM] = useState<GMonitor | null>(null);

  // 触发操作函数改造示例
  const triggerError = () => {
    throw new Error('模拟JS执行异常');
  };

  const triggerPromise = () => {
    new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error('模拟Promise异常'));
      }, 0);
    });
  }

  const triggerLoadSuccess = () => {
    axios.get('http://jsonplaceholder.typicode.com/todos/1').then(data => console.log(data))
  };

  const triggerLoadFail = () => {
    axios.get('http://jsonplaceholder.typicode.com/todos1').then(data => console.log(data))
  };

  const clear = () => {
    localStorage.removeItem('g-monitor-error');
    setLogs([]);
  };

  // 自动滚动到底部
  useEffect(() => {
    setGM(GM);
    const terminal = document.getElementById('terminal');
    if (terminal) {
      terminal.scrollTop = terminal.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (gm) {
      const interval = setInterval(() => {
        const logsStr = localStorage.getItem('g-monitor-error')
        if (logsStr) {
          const logsArr: BasicType[] = JSON.parse(logsStr);
          if(logsArr.length > logs.length) {
            setLogs(logsArr);
          }
        }
      }, 500); // Check for new logs every 500ms

      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [gm, logs]);

  return (
    <Layout className="app" style={{ minHeight: '100vh', background: token.colorBgContainer }}>
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Card 
          title="监控测试控制台"
          variant="outlined"
          styles={{header: { background: token.colorPrimary, border: 'none' }}}
          style={{ boxShadow: token.boxShadow }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* 操作按钮组 */}
            <Space wrap>
              <Button 
                type="primary" 
                icon={<BugOutlined />}
                danger
                onClick={triggerError}
              >
                触发错误
              </Button>
              <Button 
                variant='solid'
                icon={<BugOutlined />}
                color='orange'
                onClick={triggerPromise}
              >
                触发Promise
              </Button>
              <Button
                type="primary"
                icon={<CloudDownloadOutlined />}
                onClick={triggerLoadSuccess}
              >
                触发接口成功
              </Button>
              <Button
                type="primary"
                icon={<CloudDownloadOutlined />}
                onClick={triggerLoadFail}
              >
                触发接口失败
              </Button>
              <Button
                type="dashed"
                icon={<WarningOutlined />}
                onClick={() => {}}
              >
                白屏测试
              </Button>
              <Button
                variant='solid'
                color='purple'
                icon={<DashboardOutlined />}
                onClick={() => {}}
              >
                性能记录
              </Button>
              <Button
                variant='solid'
                color='pink'
                icon={<UserOutlined />}
                onClick={() => {}}
              >
                用户行为
              </Button>
            </Space>
            {/* 日志输出面板 */}
            <Card
              title={
                <Space>
                  <Text strong>监控日志</Text>
                  <Tag color="processing">实时更新</Tag>
                </Space>
              }
              extra={
                <Popconfirm
                  title="确定要清空日志吗？"
                  onConfirm={clear}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button icon={<DeleteOutlined />}>清空日志</Button>
                </Popconfirm>
              }
              style={{ marginTop: 16 }}
            >
              <div id="terminal" style={{ height: '400px', overflowY: 'auto' }}>
                <List
                  dataSource={logs}
                  renderItem={(item: any) => (
                    <List.Item
                      style={{ 
                        padding: '8px 16px',
                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                        background: token.colorFillTertiary
                      }}
                    >
                      <Space>
                        <Tag color={
                          item.type === 'js-error' ? 'red' :
                          item.type === 'promise-error' ? 'orange' :
                          item.type === 'xhr' ? 'green' : 'blue'
                        }>
                          {item.timestamp || item.duration}
                        </Tag>
                        <Text style={{ color: token.colorText }}>{item.message || item.status + item.statusText}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}

export default App;