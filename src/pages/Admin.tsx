import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, BarChart3, Shield } from 'lucide-react';
import { UserList } from '@/components/admin/UserList';
import { ConversationList } from '@/components/admin/ConversationList';
import { AdminStats } from '@/components/admin/AdminStats';

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState('users');

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)' }}>
        <div className="w-8 h-8 border-4 border-[#DAA520] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/luat-anh-sang?action=register" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)' }}>
        <Shield className="w-16 h-16 text-[#DAA520] mb-4" />
        <h1 className="text-2xl font-bold text-[#8B6914] mb-2">Không có quyền truy cập</h1>
        <p className="text-[#8B7355]">Bạn cần quyền Admin để xem trang này.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DAA520 0%, #FFA500 100%)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#8B6914]">Admin Dashboard</h1>
          </div>
          <p className="text-[#8B7355]">Quản lý users và conversations của Angel AI</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#FFFACD]/50 border border-[#DAA520]/30">
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-2 data-[state=active]:bg-[#DAA520] data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger 
              value="conversations"
              className="flex items-center gap-2 data-[state=active]:bg-[#DAA520] data-[state=active]:text-white"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Conversations</span>
            </TabsTrigger>
            <TabsTrigger 
              value="stats"
              className="flex items-center gap-2 data-[state=active]:bg-[#DAA520] data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Thống kê</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserList />
          </TabsContent>

          <TabsContent value="conversations">
            <ConversationList />
          </TabsContent>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
