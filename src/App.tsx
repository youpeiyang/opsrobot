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
  PanelLeftOpen
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

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
  }
];

// --- Components ---

export default function App() {
  const [currentView, setCurrentView] = useState<'management' | 'chat' | 'config'>('management');
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
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-[#0B1120] text-slate-300 flex flex-col shadow-xl z-10 flex-shrink-0 transition-all duration-300`}>
        <div className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'} border-b border-slate-800/50`}>
          <TerminalSquare className="w-6 h-6 text-blue-500 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-lg font-semibold text-white tracking-wide ml-3 whitespace-nowrap overflow-hidden">opsRobot Center</span>}
        </div>
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-hidden">
          <button
            onClick={() => setCurrentView('management')}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-lg transition-all duration-200 ${
              currentView === 'management' || currentView === 'config'
                ? 'bg-blue-600/10 text-blue-400 font-medium' 
                : 'hover:bg-slate-800/50 hover:text-white'
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
                ? 'bg-blue-600/10 text-blue-400 font-medium' 
                : 'hover:bg-slate-800/50 hover:text-white'
            }`}
            title={isSidebarCollapsed ? "数字员工对话" : undefined}
          >
            <MessageSquare className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3 whitespace-nowrap">数字员工对话</span>}
          </button>
        </nav>
        <div className={`p-4 border-t border-slate-800/50 flex items-center ${isSidebarCollapsed ? 'justify-center flex-col space-y-2' : 'justify-between'}`}>
          {!isSidebarCollapsed && <span className="text-xs text-slate-500">v1.0.0-beta</span>}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
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
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-white">
      {/* Chat Sidebar */}
      <div className="w-72 border-r border-slate-200 flex flex-col bg-slate-50 flex-shrink-0">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索数字员工..." 
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-2">在线员工</div>
          {employees.filter(e => e.status === 'online').map(emp => (
            <button
              key={emp.id}
              onClick={() => startNewChat(emp.id)}
              className={`w-full flex items-center p-2.5 rounded-lg transition-colors text-left ${
                activeChat?.employeeId === emp.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-200/50 border border-transparent'
              }`}
            >
              <div className="relative flex-shrink-0">
                {emp.avatar.startsWith('data:image/') || emp.avatar.startsWith('http') ? (
                  <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">
                    {emp.avatar}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="text-sm font-medium text-slate-800 truncate">{emp.name}</div>
                <div className="text-xs text-slate-500 truncate">点击开始对话</div>
              </div>
            </button>
          ))}
          
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-6">最近对话</div>
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
                  <div className="text-sm font-medium text-slate-800 truncate">与 {emp.name} 的对话</div>
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
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`发送消息给 ${activeEmployee.name}...`}
                  className="w-full max-h-32 min-h-[56px] py-4 pl-4 pr-12 bg-transparent resize-none focus:outline-none text-[15px] text-slate-800"
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
