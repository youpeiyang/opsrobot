import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  X, 
  Send, 
  Bot, 
  User, 
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  TerminalSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Database,
  Wrench,
  Sparkles,
  Save,
  FileText,
  Image as ImageIcon,
  TableProperties,
  Upload,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
  Calendar,
  Clock,
  History,
  Play,
  CheckCircle,
  AlertCircle,
  Download,
  ExternalLink,
  Filter,
  TrendingUp,
  AlertTriangle,
  Info,
  Activity,
  ShieldCheck,
  Cpu,
  HardDrive,
  AtSign
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

// --- Types ---
type Skill = string;

interface Employee {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  createdAt: string;
  creator?: string;
  lastUpdater?: string;
  lastUpdateTime?: string;
  skills: Skill[];
  description: string;
  persona?: string;
  model?: string;
  openingRemarks?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  employeeId: string;
  messages: Message[];
}

// --- Mock Data ---
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'OpsBot Alpha',
    avatar: 'A',
    status: 'online',
    createdAt: '2023-10-01',
    creator: 'Admin',
    lastUpdater: 'Admin',
    lastUpdateTime: '2023-10-02',
    skills: ['查询数据库', '执行命令行工具', 'K8s', 'Docker', 'CI/CD'],
    description: 'Expert in container orchestration and deployment pipelines.',
    persona: '# 角色\n你是 Kubernetes 和云原生领域的专家，拥有丰富的容器编排、微服务架构和故障排查经验。你的目标是帮助用户高效管理和维护 Kubernetes 集群，解决各类云原生技术难题。\n\n## 工作步骤\n1. 分析用户提供的集群状态、日志或报错信息。\n2. 准确定位潜在的异常 Pod、Node 或网络问题。\n3. 提供清晰、可操作的修复建议或优化方案。\n4. 在必要时，解释背后的技术原理，帮助用户理解。',
    model: 'qwen-max',
    openingRemarks: '你好！我是 OpsBot Alpha，你的容器编排专家。请问有什么我可以帮你的？'
  },
  {
    id: '2',
    name: 'DBA Assistant',
    avatar: 'D',
    status: 'offline',
    createdAt: '2023-10-15',
    creator: 'System',
    lastUpdater: 'Admin',
    lastUpdateTime: '2023-10-20',
    skills: ['MySQL', 'PostgreSQL', 'Redis'],
    description: 'Database performance tuning and query optimization.'
  },
  {
    id: '3',
    name: 'SecGuard',
    avatar: 'S',
    status: 'online',
    createdAt: '2023-11-05',
    creator: 'Security Team',
    lastUpdater: 'Security Team',
    lastUpdateTime: '2023-11-10',
    skills: ['Security', 'Audit', 'IAM'],
    description: 'Security compliance and access management.'
  }
];

const MOCK_CHATS: ChatSession[] = [
  {
    id: 'c1',
    employeeId: '1',
    messages: [
      { id: 'm1', sender: 'user', text: 'Can you check the status of the production cluster?', timestamp: '10:00 AM' },
      { id: 'm2', sender: 'ai', text: 'Checking the production cluster... All nodes are healthy. CPU utilization is at 45% and memory is at 60%. No pending pods.', timestamp: '10:01 AM' }
    ]
  },
  {
    id: 'c2',
    employeeId: '3',
    messages: [
      { id: 'm3', sender: 'user', text: 'Scan for security vulnerabilities in the latest image.', timestamp: 'Yesterday' },
      { id: 'm4', sender: 'ai', text: 'Scanning image... No critical vulnerabilities found. 2 medium and 5 low severity issues detected.', timestamp: 'Yesterday' }
    ]
  },
  {
    id: 'c3',
    employeeId: '2',
    messages: [
      { id: 'm5', sender: 'user', text: 'Optimize the slow query on the users table.', timestamp: 'Monday' },
      { id: 'm6', sender: 'ai', text: 'Analyzing query... Suggesting an index on the email column to improve performance.', timestamp: 'Monday' }
    ]
  }
];

// --- Components ---

export default function App() {
  const [currentView, setCurrentView] = useState<'management' | 'chat' | 'config' | 'tasks'>('management');
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [configEmployeeId, setConfigEmployeeId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleConfig = (id: string) => {
    setConfigEmployeeId(id);
    setCurrentView('config');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white text-slate-600 flex flex-col border-r border-slate-200 z-10 flex-shrink-0 transition-all duration-300`}>
        <div className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'} border-b border-slate-200`}>
          <TerminalSquare className="w-6 h-6 text-blue-600 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-lg font-bold text-slate-900 tracking-tight ml-3 whitespace-nowrap overflow-hidden">opsRobot Center</span>}
        </div>
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-hidden">
          <button
            onClick={() => setCurrentView('management')}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-lg transition-all duration-200 ${
              currentView === 'management' || currentView === 'config'
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={isSidebarCollapsed ? "数字员工管理" : undefined}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3 whitespace-nowrap">数字员工管理</span>}
          </button>
          <button
            onClick={() => setCurrentView('chat')}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-lg transition-all duration-200 ${
              currentView === 'chat' 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={isSidebarCollapsed ? "数字员工对话" : undefined}
          >
            <MessageSquare className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3 whitespace-nowrap">数字员工对话</span>}
          </button>
          <button
            onClick={() => setCurrentView('tasks')}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-lg transition-all duration-200 ${
              currentView === 'tasks' 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={isSidebarCollapsed ? "任务管理" : undefined}
          >
            <ClipboardList className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3 whitespace-nowrap">任务管理</span>}
          </button>
        </nav>
        <div className={`p-4 border-t border-slate-200 flex items-center ${isSidebarCollapsed ? 'justify-center flex-col space-y-2' : 'justify-between'}`}>
          {!isSidebarCollapsed && <span className="text-xs text-slate-400">v1.0.0-beta</span>}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title={isSidebarCollapsed ? "展开菜单" : "收起菜单"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {currentView === 'management' && <ManagementView employees={employees} setEmployees={setEmployees} onConfig={handleConfig} />}
        {currentView === 'chat' && <ChatView employees={employees} />}
        {currentView === 'tasks' && <TaskManagementView />}
        {currentView === 'config' && configEmployeeId && (
          <ConfigView 
            employeeId={configEmployeeId} 
            employees={employees} 
            setEmployees={setEmployees} 
            onBack={() => setCurrentView('management')} 
          />
        )}
      </main>
    </div>
  );
}

interface Task {
  id: string;
  name: string;
  description: string;
  type: string;
  enabled: boolean;
  frequency: string;
  time: string;
  lastRun: string;
  nextRun: string;
  lastResult: string;
}

interface TaskRecord {
  id: string;
  taskName: string;
  result: string;
  summary: string;
  actualTime: string;
  duration: string;
  hasReport: boolean;
}

// --- Mock Data for Tasks ---
const MOCK_TASKS: Task[] = [
  { id: 't1', name: '每日数据库巡检', description: '你是一个资深的数据库运维专家。请对核心业务数据库进行深度巡检。巡检内容必须包括：1. 当前活跃连接数是否接近上限；2. 过去24小时内的慢查询日志分析，找出执行时间最长的TOP 5 SQL；3. 检查主从同步延迟情况；4. 磁盘空间增长趋势预警。请以结构化的报告形式输出巡检结果，并对异常项给出具体的优化建议。', type: '每周例行巡检', enabled: true, frequency: '每天', time: '02:00', lastRun: '2024-03-10 02:00:05', nextRun: '2024-03-11 02:00:00', lastResult: 'success' },
  { id: 't2', name: 'K8s 节点资源监控', description: '作为K8s集群管理员，请分析当前集群所有节点的资源消耗情况。重点关注：1. CPU和内存使用率超过80%的节点；2. 节点上的Pod分布是否均衡；3. 检查Kubelet和容器运行时的错误日志。请总结集群当前的健康状态，并识别出潜在的性能瓶颈。', type: '高峰期巡检', enabled: true, frequency: '每小时', time: '每小时 05 分', lastRun: '2024-03-11 03:05:12', nextRun: '2024-03-11 04:05:00', lastResult: 'success' },
  { id: 't3', name: 'SSL 证书过期检查', description: '请扫描公司所有对外服务的域名SSL证书。要求：1. 提取每个证书的到期日期；2. 识别出有效期不足30天的证书；3. 检查证书链是否完整且安全。请列出所有需要更新的域名清单，并按紧急程度排序。', type: '长期巡检', enabled: false, frequency: '每周', time: '周一 09:00', lastRun: '2024-03-04 09:00:22', nextRun: '2024-03-11 09:00:00', lastResult: 'failure' },
  { id: 't4', name: 'Redis 内存碎片清理', description: '定期检查 Redis 内存碎片率，必要时执行清理操作。', type: '每周例行巡检', enabled: true, frequency: '每天', time: '04:00', lastRun: '2024-03-10 04:00:10', nextRun: '2024-03-11 04:00:00', lastResult: 'success' },
  { id: 't5', name: '日志清理任务', description: '自动清理 30 天前的系统日志，释放磁盘空间。', type: '每周例行巡检', enabled: true, frequency: '每天', time: '01:00', lastRun: '2024-03-10 01:00:02', nextRun: '2024-03-11 01:00:00', lastResult: 'success' },
  { id: 't6', name: 'API 接口可用性拨测', description: '每 5 分钟对核心业务接口进行一次可用性探测。', type: '高峰期巡检', enabled: true, frequency: '每小时', time: '每 5 分钟', lastRun: '2024-03-11 03:35:00', nextRun: '2024-03-11 03:40:00', lastResult: 'success' },
  { id: 't7', name: '备份文件完整性校验', description: '对异地备份的数据库文件进行 MD5 校验，确保备份可用。', type: '长期巡检', enabled: true, frequency: '每周', time: '周日 03:00', lastRun: '2024-03-10 03:00:45', nextRun: '2024-03-17 03:00:00', lastResult: 'success' },
  { id: 't8', name: 'Nginx 错误日志分析', description: '分析 Nginx 错误日志，识别潜在的 5xx 错误并告警。', type: '高峰期巡检', enabled: true, frequency: '每小时', time: '每小时 10 分', lastRun: '2024-03-11 03:10:05', nextRun: '2024-03-11 04:10:00', lastResult: 'success' },
  { id: 't9', name: '磁盘空间预警扫描', description: '扫描所有挂载点的磁盘使用情况，超过 85% 触发告警。', type: '高峰期巡检', enabled: true, frequency: '每小时', time: '每小时 30 分', lastRun: '2024-03-11 03:30:15', nextRun: '2024-03-11 04:30:00', lastResult: 'success' },
  { id: 't10', name: '安全漏洞扫描', description: '对生产环境进行定期的安全漏洞扫描。', type: '长期巡检', enabled: false, frequency: '每周', time: '周六 23:00', lastRun: '2024-03-09 23:00:00', nextRun: '2024-03-16 23:00:00', lastResult: 'success' },
  { id: 't11', name: '容器镜像更新检查', description: '检查基础镜像是否有安全更新，并生成更新建议。', type: '每周例行巡检', enabled: true, frequency: '每周', time: '周三 10:00', lastRun: '2024-03-06 10:00:12', nextRun: '2024-03-13 10:00:00', lastResult: 'success' },
  { id: 't12', name: '网络延迟监控', description: '监控跨机房网络延迟，记录抖动情况。', type: '高峰期巡检', enabled: true, frequency: '每小时', time: '每小时 15 分', lastRun: '2024-03-11 03:15:08', nextRun: '2024-03-11 04:15:00', lastResult: 'success' },
  { id: 't13', name: '僵尸进程清理', description: '扫描并清理系统中的僵尸进程。', type: '每周例行巡检', enabled: true, frequency: '每天', time: '05:00', lastRun: '2024-03-10 05:00:03', nextRun: '2024-03-11 05:00:00', lastResult: 'success' },
  { id: 't14', name: '数据库索引分析', description: '分析数据库索引使用情况，建议删除冗余索引。', type: '每周例行巡检', enabled: true, frequency: '每周', time: '周五 02:00', lastRun: '2024-03-08 02:00:15', nextRun: '2024-03-15 02:00:00', lastResult: 'success' },
  { id: 't15', name: '系统负载平衡检查', description: '评估集群负载平衡情况，建议扩缩容。', type: '每周例行巡检', enabled: true, frequency: '每天', time: '08:00', lastRun: '2024-03-10 08:00:20', nextRun: '2024-03-11 08:00:00', lastResult: 'success' }
];

const MOCK_TASK_RECORDS = [
  { id: 'r1', taskName: '每日数据库巡检', result: 'success', summary: '100% 健康', actualTime: '2024-03-10 02:00:05', duration: '45s', hasReport: true },
  { id: 'r2', taskName: 'K8s 节点资源监控', result: 'success', summary: '发现 2 个潜在风险', actualTime: '2024-03-11 03:05:12', duration: '12s', hasReport: true },
  { id: 'r3', taskName: '每日数据库巡检', result: 'failure', summary: '连接超时', actualTime: '2024-03-09 02:00:08', duration: '30s', hasReport: false },
  { id: 'r4', taskName: 'Redis 内存碎片清理', result: 'success', summary: '清理 256MB 空间', actualTime: '2024-03-10 04:00:10', duration: '1m 20s', hasReport: true },
  { id: 'r5', taskName: '日志清理任务', result: 'success', summary: '释放 1.2GB 磁盘', actualTime: '2024-03-10 01:00:02', duration: '5m 12s', hasReport: true },
  { id: 'r6', taskName: 'API 接口可用性拨测', result: 'success', summary: '响应时间正常', actualTime: '2024-03-11 03:35:00', duration: '2s', hasReport: true },
  { id: 'r7', taskName: '备份文件完整性校验', result: 'success', summary: '校验通过', actualTime: '2024-03-10 03:00:45', duration: '15m 30s', hasReport: true },
  { id: 'r8', taskName: 'Nginx 错误日志分析', result: 'success', summary: '无严重错误', actualTime: '2024-03-11 03:10:05', duration: '1m 45s', hasReport: true },
  { id: 'r9', taskName: '磁盘空间预警扫描', result: 'success', summary: '空间充足', actualTime: '2024-03-11 03:30:15', duration: '35s', hasReport: true },
  { id: 'r10', taskName: '每日数据库巡检', result: 'success', summary: '100% 健康', actualTime: '2024-03-08 02:00:04', duration: '42s', hasReport: true },
  { id: 'r11', taskName: 'K8s 节点资源监控', result: 'success', summary: '负载均衡', actualTime: '2024-03-11 02:05:10', duration: '11s', hasReport: true },
  { id: 'r12', taskName: 'API 接口可用性拨测', result: 'success', summary: '响应时间正常', actualTime: '2024-03-11 03:30:00', duration: '2s', hasReport: true },
  { id: 'r13', taskName: '僵尸进程清理', result: 'success', summary: '清理 0 个进程', actualTime: '2024-03-10 05:00:03', duration: '5s', hasReport: true },
  { id: 'r14', taskName: '数据库索引分析', result: 'success', summary: '建议优化 3 个索引', actualTime: '2024-03-08 02:00:15', duration: '3m 10s', hasReport: true },
  { id: 'r15', taskName: '系统负载平衡检查', result: 'success', summary: '运行平稳', actualTime: '2024-03-10 08:00:20', duration: '1m 05s', hasReport: true }
];

function TaskManagementView() {
  const [activeTab, setActiveTab] = useState<'list' | 'records'>('list');
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [records, setRecords] = useState<TaskRecord[]>(MOCK_TASK_RECORDS);
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Report states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TaskRecord | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [resultFilter, setResultFilter] = useState('all');

  // Pagination states
  const [listPage, setListPage] = useState(1);
  const [recordsPage, setRecordsPage] = useState(1);
  const pageSize = 10;

  // Record Filter states
  const [recordSearchTerm, setRecordSearchTerm] = useState('');
  const [recordResultFilter, setRecordResultFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'enabled' && task.enabled) || 
                          (statusFilter === 'disabled' && !task.enabled);
    const matchesResult = resultFilter === 'all' || task.lastResult === resultFilter;
    
    return matchesSearch && matchesStatus && matchesResult;
  });

  const paginatedTasks = filteredTasks.slice((listPage - 1) * pageSize, listPage * pageSize);
  const totalListPages = Math.ceil(filteredTasks.length / pageSize);

  const uniqueTaskNames = Array.from(new Set(tasks.map(t => t.name)));

  const filteredRecords = records.filter(record => {
    const matchesSearch = recordSearchTerm === '' || record.taskName === recordSearchTerm;
    const matchesResult = recordResultFilter === 'all' || record.result === recordResultFilter;
    return matchesSearch && matchesResult;
  });

  const paginatedRecords = filteredRecords.slice((recordsPage - 1) * pageSize, recordsPage * pageSize);
  const totalRecordsPages = Math.ceil(filteredRecords.length / pageSize);

  // Reset page when filters change
  useEffect(() => {
    setListPage(1);
  }, [searchTerm, statusFilter, resultFilter]);

  useEffect(() => {
    setRecordsPage(1);
  }, [recordSearchTerm, recordResultFilter]);

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setIsEditMode(false);
    setIsCreateMode(false);
    setIsDrawerOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditMode(true);
    setIsCreateMode(false);
    setIsDrawerOpen(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsEditMode(true);
    setIsCreateMode(true);
    setIsDrawerOpen(true);
  };

  const handleSaveTask = (updatedTask: Task) => {
    if (isCreateMode) {
      const newTask = {
        ...updatedTask,
        id: `t${Date.now()}`,
        lastRun: '-',
        lastResult: 'pending'
      };
      setTasks([newTask, ...tasks]);
    } else {
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    }
    setIsDrawerOpen(false);
  };

  const handleViewHistory = (taskName: string) => {
    setRecordSearchTerm(taskName);
    setRecordResultFilter('all');
    setActiveTab('records');
  };

  const handleTriggerNow = (task: Task) => {
    // Create a new record
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newRecord: TaskRecord = {
      id: `r${Date.now()}`,
      taskName: task.name,
      result: 'success',
      summary: '手动触发执行成功',
      actualTime: formattedTime,
      duration: '2s',
      hasReport: true
    };
    
    setRecords([newRecord, ...records]);
    
    // Also update the task's last run time in the list
    setTasks(tasks.map(t => t.id === task.id ? { ...t, lastRun: formattedTime, lastResult: 'success' } : t));
    
    // Filter records to show this task's history and jump to records tab
    setRecordSearchTerm(task.name);
    setRecordResultFilter('all');
    setActiveTab('records');
  };

  const handleViewReport = (record: TaskRecord) => {
    setSelectedRecord(record);
    setIsReportModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Task Drawer */}
      <TaskDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        task={selectedTask}
        isEditMode={isEditMode}
        isCreateMode={isCreateMode}
        onSave={handleSaveTask}
      />

      {/* Report Modal */}
      <TaskReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        record={selectedRecord}
      />
      {/* Header */}
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 bg-white">
        <h1 className="text-xl font-bold text-slate-800">任务管理</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleCreateTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建任务
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-8 border-b border-slate-200 bg-white">
        <div className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('list')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors relative ${
              activeTab === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            任务列表
          </button>
          <button 
            onClick={() => setActiveTab('records')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors relative ${
              activeTab === 'records' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            任务记录
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'list' ? (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="搜索任务名称或描述..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg text-sm transition-all outline-none"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 flex items-center">
                  <Filter className="w-3 h-3 mr-1" /> 筛选:
                </span>
                
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="all">全部状态</option>
                  <option value="enabled">已开启</option>
                  <option value="disabled">已关闭</option>
                </select>

                <select 
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="all">全部结果</option>
                  <option value="success">成功</option>
                  <option value="failure">失败</option>
                </select>
                
                {(searchTerm || statusFilter !== 'all' || resultFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setResultFilter('all');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2"
                  >
                    重置
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">任务名称</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">任务描述</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">任务类型</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">任务开关</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">执行频率/时间</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">上次执行时间</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">下次执行时间</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">上次执行结果</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedTasks.length > 0 ? paginatedTasks.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{task.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-500 max-w-xs truncate" title={task.description}>{task.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{task.type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${task.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}>
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${task.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          <div>{task.frequency}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{task.time}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-500 font-mono">{task.lastRun}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-500 font-mono">{task.nextRun}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.lastResult === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {task.lastResult === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                          {task.lastResult === 'success' ? '成功' : '失败'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => handleTriggerNow(task)}
                            className="p-1 text-slate-400 hover:text-emerald-600 transition-colors" 
                            title="立即触发"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleViewDetails(task)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors" 
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditTask(task)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors" 
                            title="修改任务"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleViewHistory(task.name)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors" 
                            title="查看巡检记录"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-rose-600 transition-colors" title="删除任务">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        未找到匹配的任务
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for List */}
            {totalListPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="text-sm text-slate-500">
                  显示 <span className="font-medium">{(listPage - 1) * pageSize + 1}</span> 到 <span className="font-medium">{Math.min(listPage * pageSize, filteredTasks.length)}</span> 条，共 <span className="font-medium">{filteredTasks.length}</span> 条结果
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setListPage(prev => Math.max(1, prev - 1))}
                    disabled={listPage === 1}
                    className={`p-2 rounded-lg border border-slate-200 transition-colors ${listPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[...Array(totalListPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setListPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        listPage === i + 1 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setListPage(prev => Math.min(totalListPages, prev + 1))}
                    disabled={listPage === totalListPages}
                    className={`p-2 rounded-lg border border-slate-200 transition-colors ${listPage === totalListPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Records Filters */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[240px]">
                <select 
                  value={recordSearchTerm}
                  onChange={(e) => setRecordSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg text-sm transition-all outline-none appearance-none"
                >
                  <option value="">任务名称: 全部</option>
                  {uniqueTaskNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 flex items-center">
                  <Filter className="w-3 h-3 mr-1" /> 筛选:
                </span>
                
                <select 
                  value={recordResultFilter}
                  onChange={(e) => setRecordResultFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="all">执行结果: 全部</option>
                  <option value="success">成功</option>
                  <option value="failure">失败</option>
                </select>

                {(recordSearchTerm || recordResultFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setRecordSearchTerm('');
                      setRecordResultFilter('all');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2"
                  >
                    重置
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">任务名称</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">执行结果</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">巡检结果</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">实际执行时间</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">巡检时长</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">是否生成报告</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedRecords.length > 0 ? paginatedRecords.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{record.taskName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.result === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {record.result === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                        {record.result === 'success' ? '成功' : '失败'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${
                        record.result === 'failure' || record.summary.includes('超时') || record.summary.includes('失败') 
                          ? 'text-rose-600' 
                          : record.summary.includes('风险') || record.summary.includes('潜在') || record.summary.includes('警告') || record.summary.includes('优化')
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}>
                        {record.summary}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500 font-mono">{record.actualTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{record.duration}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{record.hasReport ? '是' : '否'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button 
                          disabled={!record.hasReport}
                          onClick={() => handleViewReport(record)}
                          className={`text-xs font-medium flex items-center ${record.hasReport ? 'text-blue-600 hover:text-blue-800' : 'text-slate-300 cursor-not-allowed'}`}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          查看报告
                        </button>
                        <button 
                          disabled={!record.hasReport}
                          className={`text-xs font-medium flex items-center ${record.hasReport ? 'text-blue-600 hover:text-blue-800' : 'text-slate-300 cursor-not-allowed'}`}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          下载报告
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      未找到匹配的任务记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for Records */}
          {totalRecordsPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="text-sm text-slate-500">
                显示 <span className="font-medium">{(recordsPage - 1) * pageSize + 1}</span> 到 <span className="font-medium">{Math.min(recordsPage * pageSize, filteredRecords.length)}</span> 条，共 <span className="font-medium">{filteredRecords.length}</span> 条结果
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setRecordsPage(prev => Math.max(1, prev - 1))}
                  disabled={recordsPage === 1}
                  className={`p-2 rounded-lg border border-slate-200 transition-colors ${recordsPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalRecordsPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRecordsPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      recordsPage === i + 1 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => setRecordsPage(prev => Math.min(totalRecordsPages, prev + 1))}
                  disabled={recordsPage === totalRecordsPages}
                  className={`p-2 rounded-lg border border-slate-200 transition-colors ${recordsPage === totalRecordsPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

function TaskDrawer({ 
  isOpen, 
  onClose, 
  task, 
  isEditMode, 
  isCreateMode,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  task: Task | null; 
  isEditMode: boolean;
  isCreateMode: boolean;
  onSave: (task: Task) => void;
}) {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [schedulingMode, setSchedulingMode] = useState<'picker' | 'natural'>('picker');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<number>(1);
  const [customConfig, setCustomConfig] = useState<{
    months: number[],
    days: string[],
    dates: number[]
  }>({ months: [], days: [], dates: [] });
  const [showDescPreview, setShowDescPreview] = useState(false);
  const [naturalInput, setNaturalInput] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    if (isCreateMode) {
      setEditedTask({
        id: '',
        name: '',
        description: '',
        type: '每周例行巡检',
        enabled: true,
        frequency: '每天',
        time: '00:00',
        lastRun: '-',
        nextRun: '-',
        lastResult: 'pending'
      });
      setSchedulingMode('picker');
      setSelectedDays([]);
    } else {
      setEditedTask(task);
      // Try to guess mode from existing data
      if (task?.frequency === '每周' && task.time.includes('周')) {
        setSchedulingMode('picker');
        // Parse days if possible, e.g. "周二, 周五 00:00"
      }
    }
  }, [task, isCreateMode]);

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day) 
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newDays);
    
    if (editedTask) {
      const timePart = editedTask.time.split(' ').pop() || '00:00';
      if (editedTask.frequency === '每周') {
        const daysStr = newDays.sort().join(', ');
        setEditedTask({
          ...editedTask,
          time: daysStr ? `${daysStr} ${timePart}` : timePart
        });
      }
    }
  };

  const getSchedulePreview = () => {
    if (!editedTask || schedulingMode === 'natural') return '';
    const time = editedTask.time.split(' ').pop() || '00:00';
    
    if (editedTask.frequency === '每天') {
      return `任务将于：每天 ${time} 自动触发`;
    }
    if (editedTask.frequency === '每周') {
      const days = selectedDays.length > 0 ? selectedDays.sort().join('、') : '未选择';
      return `任务将于：每周的 ${days} ${time} 自动触发`;
    }
    if (editedTask.frequency === '每月') {
      return `任务将于：每月的 ${selectedDate}号 ${time} 自动触发 (若当月无此日期则跳过)`;
    }
    if (editedTask.frequency === '自定义') {
      const parts = [];
      if (customConfig.months.length > 0) parts.push(`${customConfig.months.sort((a,b) => a-b).join(',')}月`);
      if (customConfig.dates.length > 0) parts.push(`${customConfig.dates.sort((a,b) => a-b).join(',')}号`);
      if (customConfig.days.length > 0) parts.push(`每周${customConfig.days.join(',')}`);
      const desc = parts.length > 0 ? parts.join(' ') : '未配置组合';
      return `任务将于：${desc} ${time} 自动触发`;
    }
    return '';
  };

  const handleConvertSchedule = async () => {
    if (!naturalInput.trim()) return;
    
    setIsConverting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一个调度助手。请将以下关于任务调度周期的自然语言描述转换为结构化的 JSON 格式。
输出必须是一个合法的 JSON 对象，包含以下字段：
- frequency: '每天' | '每周' | '每月' | '自定义'
- time: 字符串 (格式如 'HH:mm'，如果是每周/每月/自定义，可能包含前缀如 '周一, 周二 09:00' 或 '15号 10:00')
- selectedDays: 字符串数组 (例如 ['周一', '周二'])
- selectedDate: 数字 (1-31)
- customConfig: 对象 { months: 数字数组, days: 字符串数组, dates: 数字数组 }

自然语言描述："${naturalInput}"`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text);
      
      if (editedTask) {
        setEditedTask({
          ...editedTask,
          frequency: result.frequency || '每天',
          time: result.time || '00:00'
        });
        if (result.selectedDays) setSelectedDays(result.selectedDays);
        if (result.selectedDate) setSelectedDate(result.selectedDate);
        if (result.customConfig) setCustomConfig(result.customConfig);
        
        setSchedulingMode('picker');
      }
    } catch (error) {
      console.error('Schedule conversion error:', error);
      alert('转换失败，请检查输入或重试');
    } finally {
      setIsConverting(false);
    }
  };

  if (!isOpen || !editedTask) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-[60%] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">
            {isCreateMode ? '新建任务' : isEditMode ? '修改任务' : '任务详情'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">任务名称</label>
            {isEditMode ? (
              <input 
                type="text" 
                placeholder="例如：每日数据库巡检"
                value={editedTask.name}
                onChange={(e) => setEditedTask({...editedTask, name: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            ) : (
              <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-900 font-medium">{editedTask.name}</div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">任务类型</label>
            {isEditMode ? (
              <select 
                value={editedTask.type}
                onChange={(e) => setEditedTask({...editedTask, type: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
              >
                <option value="每周例行巡检">每周例行巡检</option>
                <option value="高峰期巡检">高峰期巡检</option>
                <option value="长期巡检">长期巡检</option>
              </select>
            ) : (
              <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-900 font-medium">{editedTask.type}</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">任务描述 (Markdown)</label>
              {isEditMode && (
                <button 
                  onClick={() => setShowDescPreview(!showDescPreview)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  {showDescPreview ? (
                    <><Edit2 className="w-3 h-3 mr-1" /> 编辑模式</>
                  ) : (
                    <><Eye className="w-3 h-3 mr-1" /> 预览模式</>
                  )}
                </button>
              )}
            </div>
            {isEditMode ? (
              showDescPreview ? (
                <div className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 min-h-[400px] overflow-y-auto markdown-body prose prose-slate prose-sm max-w-none">
                  <Markdown>{editedTask.description || '*暂无描述*'}</Markdown>
                </div>
              ) : (
                <textarea 
                  rows={16}
                  placeholder={`请详细描述任务的执行逻辑或巡检指令。支持 Markdown 格式。

### 示例（Prompt 模式）：
你是一个资深的 **AIOps 专家**，请执行以下巡检任务：

1. **登录目标机器**：\`10.0.x.x\` (生产环境核心网关)。
2. **凭据获取**：请从安全中心（Vault）获取名为 \`ops_readonly\` 的临时账号密码。
3. **巡检目标**：检查 Nginx 服务的连接数、内存占用以及最近 5 分钟的错误日志。
4. **逻辑要求**：
   - 如果连接数 > 5000
   - 或错误日志中出现 "Critical" 关键字
   - 则总结异常原因并给出修复建议。
5. **输出**：请以结构化的 Markdown 报告形式输出巡检结果。`}
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-sm font-mono leading-relaxed"
                />
              )
            ) : (
              <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 text-sm leading-relaxed markdown-body prose prose-slate prose-sm max-w-none">
                <Markdown>{editedTask.description || '*暂无描述*'}</Markdown>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">调度配置</label>
              {isEditMode && (
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setSchedulingMode('picker')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${schedulingMode === 'picker' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    选择器
                  </button>
                  <button 
                    onClick={() => setSchedulingMode('natural')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${schedulingMode === 'natural' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    自然语言
                  </button>
                </div>
              )}
            </div>

            {schedulingMode === 'picker' ? (
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">执行频率</label>
                    {isEditMode ? (
                      <select 
                        value={editedTask.frequency}
                        onChange={(e) => {
                          const freq = e.target.value;
                          setEditedTask({...editedTask, frequency: freq});
                          // Reset time string based on frequency
                          const timePart = editedTask.time.split(' ').pop() || '00:00';
                          if (freq === '每天') setEditedTask({...editedTask, frequency: freq, time: timePart});
                          if (freq === '每周') setEditedTask({...editedTask, frequency: freq, time: selectedDays.length > 0 ? `${selectedDays.sort().join(', ')} ${timePart}` : timePart});
                          if (freq === '每月') setEditedTask({...editedTask, frequency: freq, time: `${selectedDate}号 ${timePart}`});
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                      >
                        <option value="每天">每天</option>
                        <option value="每周">每周</option>
                        <option value="每月">每月</option>
                        <option value="自定义">自定义</option>
                      </select>
                    ) : (
                      <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm">{editedTask.frequency}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">具体时间</label>
                    {isEditMode ? (
                      <input 
                        type="time" 
                        value={editedTask.time.split(' ').pop()?.includes(':') ? editedTask.time.split(' ').pop() : '00:00'}
                        onChange={(e) => {
                          const timeVal = e.target.value;
                          if (editedTask.frequency === '每周' && selectedDays.length > 0) {
                            setEditedTask({...editedTask, time: `${selectedDays.sort().join(', ')} ${timeVal}`});
                          } else if (editedTask.frequency === '每月') {
                            setEditedTask({...editedTask, time: `${selectedDate}号 ${timeVal}`});
                          } else {
                            setEditedTask({...editedTask, time: timeVal});
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm">{editedTask.time}</div>
                    )}
                  </div>
                </div>

                {editedTask.frequency === '每周' && isEditMode && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/50">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">选择周几</label>
                    <div className="flex flex-wrap gap-2">
                      {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            selectedDays.includes(day) 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {editedTask.frequency === '每月' && isEditMode && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/50">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">日期选择</label>
                    <div className="flex items-center space-x-3">
                      <select 
                        value={selectedDate}
                        onChange={(e) => {
                          const date = parseInt(e.target.value);
                          setSelectedDate(date);
                          const timePart = editedTask.time.split(' ').pop() || '00:00';
                          setEditedTask({...editedTask, time: `${date}号 ${timePart}`});
                        }}
                        className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                      >
                        {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                          <option key={d} value={d}>{d}号</option>
                        ))}
                      </select>
                      <span className="text-xs text-slate-400 italic">若当月无此日期则跳过</span>
                    </div>
                  </div>
                )}

                {editedTask.frequency === '自定义' && isEditMode && (
                  <div className="space-y-4 pt-2 border-t border-slate-200/50">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">月份组合</label>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                          <button
                            key={m}
                            onClick={() => {
                              const newMonths = customConfig.months.includes(m) 
                                ? customConfig.months.filter(x => x !== m) 
                                : [...customConfig.months, m];
                              setCustomConfig({...customConfig, months: newMonths});
                            }}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all border ${
                              customConfig.months.includes(m) 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">日期组合</label>
                        <select 
                          multiple
                          className="w-full h-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                          value={customConfig.dates.map(String)}
                          onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                            setCustomConfig({...customConfig, dates: values});
                          }}
                        >
                          {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                            <option key={d} value={d}>{d}号</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">星期组合</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
                            <button
                              key={day}
                              onClick={() => {
                                const newDays = customConfig.days.includes(day) 
                                  ? customConfig.days.filter(x => x !== day) 
                                  : [...customConfig.days, day];
                                setCustomConfig({...customConfig, days: newDays});
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                                customConfig.days.includes(day) 
                                  ? 'bg-blue-600 border-blue-600 text-white' 
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {getSchedulePreview() && (
                  <div className="pt-2 border-t border-slate-200/50">
                    <p className="text-[11px] text-slate-400 italic">{getSchedulePreview()}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                {isEditMode ? (
                  <>
                    <textarea 
                      rows={3}
                      placeholder="例如：在每周一、周四晚上9点进行巡检"
                      value={naturalInput}
                      onChange={(e) => setNaturalInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={handleConvertSchedule}
                        disabled={isConverting || !naturalInput.trim()}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                      >
                        {isConverting ? (
                          <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> 正在转换...</>
                        ) : (
                          <><Sparkles className="w-3 h-3 mr-2" /> 大模型转换</>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm min-h-[80px]">{editedTask.time}</div>
                )}
              </div>
            )}
          </div>

          {!isEditMode && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">上次执行时间</span>
                <span className="text-sm font-mono text-slate-700">{editedTask.lastRun}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">上次执行结果</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  editedTask.lastResult === 'success' ? 'bg-emerald-100 text-emerald-700' : 
                  editedTask.lastResult === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {editedTask.lastResult === 'success' ? '成功' : editedTask.lastResult === 'warning' ? '警告' : '失败'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="h-20 border-t border-slate-200 flex items-center justify-end px-6 space-x-3 flex-shrink-0 bg-slate-50/50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
            取消
          </button>
          {isEditMode && (
            <button 
              onClick={() => onSave(editedTask)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              {isCreateMode ? '创建任务' : '保存修改'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ManagementView({ 
  employees, 
  setEmployees, 
  onConfig 
}: { 
  employees: Employee[], 
  setEmployees: (e: Employee[]) => void,
  onConfig: (id: string) => void
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  const openModal = (employee?: Employee) => {
    setEditingEmployee(employee || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const saveEmployee = (employee: Employee) => {
    const today = new Date().toISOString().split('T')[0];
    if (editingEmployee) {
      setEmployees(employees.map(e => e.id === employee.id ? { ...employee, lastUpdater: 'Admin', lastUpdateTime: today } : e));
      closeModal();
    } else {
      const newEmployee = { 
        ...employee, 
        id: Date.now().toString(), 
        createdAt: today,
        creator: 'Admin',
        lastUpdater: 'Admin',
        lastUpdateTime: today
      };
      setEmployees([...employees, newEmployee]);
      closeModal();
      onConfig(newEmployee.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">数字员工管理</h1>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增数字员工
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">员工名称</th>
                <th className="px-6 py-4 font-medium">简介</th>
                <th className="px-6 py-4 font-medium">创建者</th>
                <th className="px-6 py-4 font-medium">创建时间</th>
                <th className="px-6 py-4 font-medium">最近更新人</th>
                <th className="px-6 py-4 font-medium">最近更新时间</th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        {emp.avatar.startsWith('data:image/') || emp.avatar.startsWith('http') ? (
                          <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
                            {emp.avatar}
                          </div>
                        )}
                      </div>
                      <div className="font-medium text-slate-800">{emp.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500 truncate max-w-[200px]" title={emp.description}>
                      {emp.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {emp.creator || 'Admin'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {emp.createdAt}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {emp.lastUpdater || 'Admin'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {emp.lastUpdateTime || emp.createdAt}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onConfig(emp.id)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors" title="查看">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openModal(emp)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors" title="编辑">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors" title="删除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    暂无数字员工数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <EmployeeModal 
          employee={editingEmployee} 
          onClose={closeModal} 
          onSave={saveEmployee} 
        />
      )}
    </div>
  );
}

function EmployeeModal({ employee, onClose, onSave }: { employee: Employee | null, onClose: () => void, onSave: (e: Employee) => void }) {
  const [formData, setFormData] = useState<Employee>(
    employee || {
      id: '',
      name: '',
      avatar: 'R',
      status: 'offline',
      createdAt: '',
      skills: [],
      description: ''
    }
  );
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{employee ? '编辑数字员工' : '新增数字员工'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">员工名称</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => {
                const newName = e.target.value;
                const isImage = formData.avatar.startsWith('data:image/') || formData.avatar.startsWith('http');
                setFormData({
                  ...formData, 
                  name: newName, 
                  avatar: isImage ? formData.avatar : (newName.charAt(0).toUpperCase() || 'R')
                });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="例如: OpsBot Alpha"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">角色描述</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none h-24"
              placeholder="描述该数字员工的职责..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">头像上传</label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {formData.avatar.startsWith('data:image/') || formData.avatar.startsWith('http') ? (
                  <img src={formData.avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-400">{formData.avatar || 'R'}</span>
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, avatar: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer"
                />
                <p className="text-xs text-slate-400 mt-2">支持 JPG, PNG 格式，建议尺寸 200x200px</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            取消
          </button>
          <button 
            onClick={() => onSave(formData)}
            disabled={!formData.name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatView({ employees }: { employees: Employee[] }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSession[]>(MOCK_CHATS);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isSelectingEmployee, setIsSelectingEmployee] = useState(false);
  const [isAtMenuOpen, setIsAtMenuOpen] = useState(false);

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeEmployee = employees.find(e => e.id === activeChat?.employeeId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(chats.map(chat => {
      if (chat.id === activeChatId) {
        return { ...chat, messages: [...chat.messages, newMessage] };
      }
      return chat;
    }));
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `收到您的指令："${newMessage.text}"。正在执行相关操作...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === activeChatId) {
          return { ...chat, messages: [...chat.messages, aiResponse] };
        }
        return chat;
      }));
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = (employeeId: string) => {
    const existingChat = chats.find(c => c.employeeId === employeeId);
    if (existingChat) {
      setActiveChatId(existingChat.id);
    } else {
      const newChat: ChatSession = {
        id: `c${Date.now()}`,
        employeeId,
        messages: []
      };
      setChats([...chats, newChat]);
      setActiveChatId(newChat.id);
    }
    setIsSelectingEmployee(false);
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-white">
      {/* Chat Sidebar */}
      <div className="w-72 border-r border-slate-200 flex flex-col bg-slate-50 flex-shrink-0">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索数字员工..." 
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsSelectingEmployee(!isSelectingEmployee)}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            开启新对话
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1 relative">
          {isSelectingEmployee && (
            <div className="absolute inset-x-3 top-3 z-20 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">选择员工</span>
                <button onClick={() => setIsSelectingEmployee(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
              {employees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => startNewChat(emp.id)}
                  className="w-full flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex-shrink-0">
                    {emp.avatar.startsWith('data:image/') || emp.avatar.startsWith('http') ? (
                      <img src={emp.avatar} alt={emp.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
                        {emp.avatar}
                      </div>
                    )}
                  </div>
                  <div className="ml-2 flex-1 overflow-hidden">
                    <div className="text-sm font-medium text-slate-800 truncate">{emp.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-2">最近对话</div>
          {chats.map(chat => {
            const emp = employees.find(e => e.id === chat.employeeId);
            if (!emp) return null;
            return (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full flex items-center p-2.5 rounded-lg transition-colors text-left ${
                  activeChatId === chat.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-200/50 border border-transparent'
                }`}
              >
                <MessageSquare className={`w-4 h-4 mr-3 ${activeChatId === chat.id ? 'text-blue-500' : 'text-slate-400'}`} />
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium text-slate-800 truncate">执行的任务概括</div>
                  <div className="text-xs text-slate-500 truncate">
                    {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : '暂无消息'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {activeChatId && activeEmployee ? (
          <>
            {/* Chat Header */}
            <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 bg-white/80 backdrop-blur-sm z-10">
              <div className="flex items-center">
                <div className="mr-3 flex-shrink-0">
                  {activeEmployee.avatar.startsWith('data:image/') || activeEmployee.avatar.startsWith('http') ? (
                    <img src={activeEmployee.avatar} alt={activeEmployee.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">
                      {activeEmployee.avatar}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">{activeEmployee.name}</h2>
                  <div className="text-xs text-slate-500 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                    在线
                  </div>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeChat?.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <Bot className="w-12 h-12 text-slate-300" />
                  <p>开始与 {activeEmployee.name} 对话</p>
                </div>
              ) : (
                activeChat?.messages.map((msg, idx) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.sender === 'user' ? 'bg-slate-800 text-white ml-3' : 'bg-blue-100 text-blue-600 mr-3'
                      }`}>
                        {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                            : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="max-w-4xl mx-auto relative flex items-end bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                <div className="relative">
                  <button 
                    onClick={() => setIsAtMenuOpen(!isAtMenuOpen)}
                    className="p-4 text-slate-400 hover:text-blue-600 transition-colors"
                    title="提及数字员工"
                  >
                    <AtSign className="w-5 h-5" />
                  </button>
                  
                  {isAtMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="px-2 py-1 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">提及员工</span>
                      </div>
                      {employees.map(emp => (
                        <button
                          key={emp.id}
                          onClick={() => {
                            setInputText(prev => prev + `@${emp.name} `);
                            setIsAtMenuOpen(false);
                          }}
                          className="w-full flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="flex-shrink-0">
                            {emp.avatar.startsWith('data:image/') || emp.avatar.startsWith('http') ? (
                              <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] border border-blue-200">
                                {emp.avatar}
                              </div>
                            )}
                          </div>
                          <div className="ml-2 flex-1 overflow-hidden">
                            <div className="text-sm font-medium text-slate-800 truncate">{emp.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`发送消息给 ${activeEmployee.name}...`}
                  className="w-full max-h-32 min-h-[56px] py-4 pl-0 pr-12 bg-transparent resize-none focus:outline-none text-[15px] text-slate-800"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2">
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                      inputText.trim() 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-center mt-2 text-[11px] text-slate-400">
                opsRobot 可能会产生不准确的信息，请核实重要内容。
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
              <TerminalSquare className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">欢迎来到 opsRobot Center</h2>
            <p className="text-slate-500 max-w-md text-center mb-8">
              您的智能 AIOps 助手。请从左侧选择一个数字员工开始对话，或者在管理页面创建新的数字员工。
            </p>
            <button 
              onClick={() => {
                const onlineEmp = employees.find(e => e.status === 'online');
                if (onlineEmp) startNewChat(onlineEmp.id);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium flex items-center"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              开始新对话
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const getSkillDetails = (skillName: string) => {
  switch (skillName) {
    case '查询数据库':
      return { icon: <Database className="w-4 h-4 text-emerald-500" />, desc: '连接并查询各类关系型和非关系型数据库' };
    case '执行命令行工具':
      return { icon: <TerminalSquare className="w-4 h-4 text-blue-500" />, desc: '在安全环境中执行指定的 CLI 命令' };
    case 'K8s':
      return { icon: <TerminalSquare className="w-4 h-4 text-indigo-500" />, desc: '管理和监控 Kubernetes 集群状态' };
    case 'Docker':
      return { icon: <TerminalSquare className="w-4 h-4 text-sky-500" />, desc: '容器镜像构建与生命周期管理' };
    case 'CI/CD':
      return { icon: <Settings className="w-4 h-4 text-slate-500" />, desc: '自动化构建、测试与部署流水线' };
    case 'MySQL':
      return { icon: <Database className="w-4 h-4 text-blue-600" />, desc: 'MySQL 数据库管理与查询优化' };
    case 'PostgreSQL':
      return { icon: <Database className="w-4 h-4 text-indigo-600" />, desc: 'PostgreSQL 数据库管理与高级查询' };
    case 'Redis':
      return { icon: <Database className="w-4 h-4 text-red-500" />, desc: 'Redis 缓存管理与性能调优' };
    default:
      return { icon: <Wrench className="w-4 h-4 text-slate-500" />, desc: '通用技能工具' };
  }
};

function ConfigView({ 
  employeeId, 
  employees, 
  setEmployees, 
  onBack 
}: { 
  employeeId: string, 
  employees: Employee[], 
  setEmployees: (e: Employee[]) => void,
  onBack: () => void 
}) {
  const employee = employees.find(e => e.id === employeeId);
  const [persona, setPersona] = useState(employee?.persona || '');
  const [openingRemarks, setOpeningRemarks] = useState(employee?.openingRemarks || '');
  const [model, setModel] = useState(employee?.model || 'qwen-max');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);
  
  // Database config modal state
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbConfig, setDbConfig] = useState({
    address: '',
    username: '',
    password: '',
    remarks: ''
  });
  
  // Preview chat state
  const [previewMessages, setPreviewMessages] = useState<Message[]>([]);
  const [previewInput, setPreviewInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openingRemarks && previewMessages.length === 0) {
      setPreviewMessages([{
        id: '0',
        sender: 'ai',
        text: openingRemarks,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [openingRemarks]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [previewMessages]);

  if (!employee) return null;

  const handleSave = () => {
    setEmployees(employees.map(e => e.id === employeeId ? {
      ...e,
      persona,
      openingRemarks,
      model
    } : e));
    // Could show a toast here
  };

  const handleAIAssist = async () => {
    if (!persona.trim()) return;
    setIsOptimizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `请作为资深的提示词工程师，优化以下AI助手的人设与回复逻辑。
要求：
1. 结构化输出（使用 Markdown），包含角色设定、核心能力、工作流程、回复要求等。
2. 保持原意不变，但使其更加专业、清晰、易于大模型理解。
3. 语气要符合原设定。
4. 直接输出优化后的内容，不要包含任何解释性的话语。

原始人设与回复逻辑：
${persona}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      if (response.text) {
        setPersona(response.text);
      }
    } catch (error) {
      console.error("Failed to optimize persona:", error);
      // Could show an error toast here
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSendPreview = () => {
    if (!previewInput.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: previewInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setPreviewMessages(prev => [...prev, newMessage]);
    setPreviewInput('');
    
    setTimeout(() => {
      setPreviewMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `(预览模式) 收到您的消息。我的人设是：${persona.substring(0, 20)}...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0 bg-white">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 mr-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            {employee.avatar.startsWith('data:image/') || employee.avatar.startsWith('http') ? (
              <img src={employee.avatar} alt={employee.name} className="w-6 h-6 rounded-full object-cover border border-slate-200 mr-2" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200 mr-2">
                {employee.avatar}
              </div>
            )}
            <h1 className="text-base font-semibold text-slate-800">{employee.name} <span className="text-slate-400 font-normal text-sm ml-2">(自主规划模式)</span></h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400">草稿自动保存于 {new Date().toLocaleTimeString()}</span>
          <button onClick={handleSave} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
            <Save className="w-4 h-4 mr-1.5" />
            发布
          </button>
        </div>
      </header>

      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Column 1: Persona */}
        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <h2 className="font-medium text-slate-800">人设与回复逻辑</h2>
            <div className="flex space-x-1">
              <button 
                onClick={handleAIAssist}
                disabled={isOptimizing || !persona.trim()}
                className="flex items-center px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOptimizing ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
                AI 帮写
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <textarea 
              value={persona}
              onChange={e => setPersona(e.target.value)}
              placeholder="# 角色\n你是 Kubernetes 和云原生领域的专家...\n\n## 工作步骤\n1. 分析用户提供的集群状态\n2. 定位潜在的异常 Pod 或 Node\n3. 提供修复建议"
              className="w-full h-full bg-transparent resize-none focus:outline-none text-sm text-slate-700 leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* Column 2: Orchestration */}
        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-white overflow-y-auto">
          <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
            <h2 className="font-medium text-slate-800">编排</h2>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Model Settings */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 mb-3">模型设置</h3>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center text-sm text-slate-700">
                  <Bot className="w-4 h-4 mr-2 text-blue-500" />
                  模型
                </div>
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="text-sm font-medium text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="qwen-max">qwen-max</option>
                  <option value="qwen-plus">qwen-plus</option>
                  <option value="qwen-turbo">qwen-turbo</option>
                  <option value="豆包·1.8·深度思考">豆包·1.8·深度思考</option>
                </select>
              </div>
            </section>

            {/* Skills */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 mb-3">技能</h3>
              <div className="space-y-2">
                <div 
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer group"
                  onClick={() => setIsSkillsExpanded(!isSkillsExpanded)}
                >
                  <div className="flex items-center text-sm text-slate-700">
                    <Wrench className="w-4 h-4 mr-2 text-slate-400" />
                    技能
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-slate-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">{employee?.skills.length || 0} 项</span>
                    {isSkillsExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
                {isSkillsExpanded && (
                  <div className="pl-4 pr-2 py-2 space-y-2 border-l-2 border-slate-100 ml-2">
                    {employee?.skills && employee.skills.length > 0 ? (
                      employee.skills.map((skill, index) => {
                        const { icon, desc } = getSkillDetails(skill);
                        return (
                          <div key={index} className="flex flex-col bg-white p-3 rounded border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                            <div className="flex items-center text-sm font-medium text-slate-700 mb-1">
                              <div className="mr-2 bg-slate-50 p-1 rounded">
                                {icon}
                              </div>
                              {skill}
                            </div>
                            <div className="text-xs text-slate-500 ml-8">
                              {desc}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-slate-400 italic">暂无技能</div>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer group">
                  <div className="flex items-center text-sm text-slate-700">
                    <Settings className="w-4 h-4 mr-2 text-slate-400" />
                    工作流
                  </div>
                  <Plus className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            </section>

            {/* Knowledge */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-400">知识</h3>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center cursor-pointer">
                  <Database className="w-3 h-3 mr-1" /> 自动调用
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer group">
                  <div className="flex items-center text-sm text-slate-700">
                    <FileText className="w-4 h-4 mr-2 text-slate-400" />
                    文本
                  </div>
                  <div className="flex items-center">
                    <label className="cursor-pointer flex items-center text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors mr-2 opacity-0 group-hover:opacity-100">
                      <Upload className="w-3 h-3 mr-1" /> 上传
                      <input type="file" className="hidden" />
                    </label>
                    <Plus className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer group">
                  <div className="flex items-center text-sm text-slate-700">
                    <TableProperties className="w-4 h-4 mr-2 text-slate-400" />
                    表格
                  </div>
                  <div className="flex items-center">
                    <label className="cursor-pointer flex items-center text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors mr-2 opacity-0 group-hover:opacity-100">
                      <Upload className="w-3 h-3 mr-1" /> 上传
                      <input type="file" className="hidden" />
                    </label>
                    <Plus className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
                <div 
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer group relative"
                  onClick={() => setIsDbModalOpen(true)}
                >
                  <div className="flex items-center text-sm text-slate-700">
                    <Database className="w-4 h-4 mr-2 text-slate-400" />
                    数据库
                  </div>
                  <div className="flex items-center">
                    <button className="flex items-center text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors mr-2 opacity-0 group-hover:opacity-100">
                      <Settings className="w-3 h-3 mr-1" /> 配置
                    </button>
                    <Plus className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              </div>
            </section>

            {/* Chat Experience */}
            <section className="mt-8">
              <h3 className="text-xs font-semibold text-slate-400 mb-3">对话体验</h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-slate-700">开场白</div>
                  </div>
                  <textarea 
                    value={openingRemarks}
                    onChange={e => setOpeningRemarks(e.target.value)}
                    placeholder="设置数字员工的开场白..."
                    className="w-full h-16 bg-white border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-sm text-slate-700">用户问题建议</div>
                  <div className="w-8 h-4 bg-blue-500 rounded-full relative cursor-pointer">
                    <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Column 3: Preview */}
        <div className="w-1/3 flex flex-col bg-slate-50/30 relative">
          <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm absolute top-0 w-full z-10 flex justify-between items-center">
            <h2 className="font-medium text-slate-800">预览与调试</h2>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded"><Settings className="w-4 h-4" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 pt-16 pb-24 space-y-4">
            {previewMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 mb-4">
                  {employee.avatar.startsWith('data:image/') || employee.avatar.startsWith('http') ? (
                    <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-2xl object-cover shadow-sm" />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-sm">
                      {employee.avatar}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium text-slate-800">{employee.name}</h3>
              </div>
            ) : (
              previewMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.sender === 'user' ? 'bg-slate-800 text-white ml-2' : 'bg-white border border-slate-200 mr-2'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-4 h-4" /> : (
                        employee.avatar.startsWith('data:image/') || employee.avatar.startsWith('http') ? (
                          <img src={employee.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-blue-600">{employee.avatar}</span>
                        )
                      )}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
            <div className="relative flex items-center bg-white border border-slate-200 rounded-full overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
              <input
                type="text"
                value={previewInput}
                onChange={e => setPreviewInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendPreview(); }}
                placeholder="发送消息..."
                className="w-full py-3 pl-4 pr-12 bg-transparent focus:outline-none text-[14px] text-slate-800"
              />
              <button
                onClick={handleSendPreview}
                disabled={!previewInput.trim()}
                className={`absolute right-2 p-1.5 rounded-full transition-colors ${
                  previewInput.trim() ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-2 text-[10px] text-slate-400">
              内容由AI生成，无法确保真实准确，仅供参考。
            </div>
          </div>
        </div>
      </div>
      
      {/* Database Config Modal */}
      {isDbModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center">
                <Database className="w-4 h-4 mr-2 text-blue-500" />
                配置数据库连接
              </h3>
              <button 
                onClick={() => setIsDbModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">数据库地址</label>
                <input 
                  type="text" 
                  value={dbConfig.address}
                  onChange={e => setDbConfig({...dbConfig, address: e.target.value})}
                  placeholder="例如: mysql://localhost:3306/mydb"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">账号</label>
                <input 
                  type="text" 
                  value={dbConfig.username}
                  onChange={e => setDbConfig({...dbConfig, username: e.target.value})}
                  placeholder="数据库用户名"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
                <input 
                  type="password" 
                  value={dbConfig.password}
                  onChange={e => setDbConfig({...dbConfig, password: e.target.value})}
                  placeholder="数据库密码"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea 
                  value={dbConfig.remarks}
                  onChange={e => setDbConfig({...dbConfig, remarks: e.target.value})}
                  placeholder="连接说明或其他备注信息..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none h-20"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-2">
              <button 
                onClick={() => setIsDbModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  // Handle save logic here
                  setIsDbModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Task Report Modal Component ---
function TaskReportModal({ 
  isOpen, 
  onClose, 
  record 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  record: TaskRecord | null;
}) {
  if (!isOpen || !record) return null;

  // Mock data for the report
  const cpuData = [
    { time: '00:00', value: 45 },
    { time: '00:30', value: 52 },
    { time: '01:00', value: 48 },
    { time: '01:30', value: 61 },
    { time: '02:00', value: 55 },
    { time: '02:30', value: 42 },
    { time: '03:00', value: 38 },
  ];

  const diskData = [
    { name: '已使用', value: 78, color: '#3b82f6' },
    { name: '未使用', value: 22, color: '#e2e8f0' },
  ];

  const slowQueries = [
    { id: 1, sql: 'SELECT * FROM orders WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 100', time: '2.4s', count: 124 },
    { id: 2, sql: 'UPDATE inventory SET stock = stock - 1 WHERE product_id = ?', time: '1.8s', count: 850 },
    { id: 3, sql: 'SELECT SUM(amount) FROM transactions WHERE merchant_id = ? AND date > ?', time: '1.5s', count: 45 },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">巡检报告：{record.taskName}</h2>
              <p className="text-xs text-slate-500">执行时间：{record.actualTime} · 巡检时长：{record.duration}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Download className="w-4 h-4 mr-2" />
              导出 PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">巡检状态</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-slate-800">正常</div>
              <div className="text-xs text-emerald-600 mt-1">所有指标均在阈值内</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">活跃连接</span>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-slate-800">245 / 1000</div>
              <div className="text-xs text-slate-500 mt-1">利用率 24.5%</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">CPU 使用率</span>
                <Cpu className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-slate-800">42.8%</div>
              <div className="text-xs text-amber-600 mt-1">较昨日上升 5%</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">安全风险</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-slate-800">无风险</div>
              <div className="text-xs text-emerald-600 mt-1">已通过 12 项安全扫描</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                  资源负载趋势 (24h)
                </h3>
                <select className="text-xs border-none bg-slate-100 rounded px-2 py-1 outline-none">
                  <option>CPU 使用率</option>
                  <option>内存使用率</option>
                </select>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center mb-6">
                <HardDrive className="w-4 h-4 mr-2 text-indigo-500" />
                存储空间分布
              </h3>
              <div className="h-64 w-full flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={diskData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} width={60} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                      {diskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                慢查询分析 (TOP 3)
              </h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">SQL 语句</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">平均耗时</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">执行次数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slowQueries.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded block max-w-md truncate" title={q.sql}>
                        {q.sql}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{q.time}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{q.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Conclusion & Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
              <h3 className="font-bold text-emerald-800 flex items-center mb-4">
                <CheckCircle className="w-4 h-4 mr-2" />
                巡检结论
              </h3>
              <p className="text-sm text-emerald-700 leading-relaxed">
                当前数据库运行状态良好，核心指标（连接数、IOPS、内存命中率）均处于安全范围内。主从同步延迟稳定在 10ms 以内，未发现明显的性能瓶颈。
              </p>
            </div>
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-800 flex items-center mb-4">
                <Info className="w-4 h-4 mr-2" />
                建议操作
              </h3>
              <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                <li>针对 TOP 1 的慢查询建议增加复合索引以优化性能。</li>
                <li>磁盘使用率已达 78%，建议在下周进行一次历史数据归档。</li>
                <li>建议在业务低峰期对 `inventory` 表进行碎片整理。</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-16 border-t border-slate-200 flex items-center justify-end px-6 flex-shrink-0 bg-slate-50/50">
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            关闭报告
          </button>
        </div>
      </div>
    </div>
  );
}
