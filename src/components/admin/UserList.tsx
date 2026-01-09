import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Mail, Wallet, Calendar, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
  created_at: string;
  has_light_spreader_badge: boolean | null;
  referral_count: number | null;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
}

export const UserList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: userRoles } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const getRoleForUser = (userId: string): 'admin' | 'user' => {
    const role = userRoles?.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  const filteredProfiles = profiles?.filter(profile => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.display_name?.toLowerCase().includes(searchLower) ||
      profile.email?.toLowerCase().includes(searchLower) ||
      profile.wallet_address?.toLowerCase().includes(searchLower)
    );
  });

  if (profilesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#DAA520] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
        <Input
          placeholder="Tìm kiếm theo tên, email hoặc wallet..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/80 border-[#DAA520]/30 focus:border-[#DAA520]"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-[#8B7355]">
        <span>Tổng: <strong className="text-[#8B6914]">{profiles?.length || 0}</strong> users</span>
        {searchTerm && (
          <span>Đang hiển thị: <strong className="text-[#8B6914]">{filteredProfiles?.length || 0}</strong></span>
        )}
      </div>

      {/* User Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfiles?.map((profile) => {
          const role = getRoleForUser(profile.user_id);
          
          return (
            <Card key={profile.id} className="bg-white/80 border-[#DAA520]/20 hover:border-[#DAA520]/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || 'User'}
                      className="w-12 h-12 rounded-full border-2 border-[#DAA520]"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: 'linear-gradient(135deg, #DAA520 0%, #FFA500 100%)' }}
                    >
                      {(profile.display_name || profile.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base text-[#8B6914] truncate flex items-center gap-2">
                      {profile.display_name || 'Chưa có tên'}
                      {role === 'admin' && (
                        <Badge variant="outline" className="border-[#DAA520] text-[#DAA520] text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </CardTitle>
                    {profile.has_light_spreader_badge && (
                      <Badge className="bg-[#FFFACD] text-[#8B6914] text-xs mt-1">
                        ✨ Light Spreader
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[#8B7355]">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{profile.email || 'Chưa có email'}</span>
                </div>
                {profile.wallet_address && (
                  <div className="flex items-center gap-2 text-[#8B7355]">
                    <Wallet className="w-4 h-4" />
                    <span className="truncate font-mono text-xs">{profile.wallet_address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[#8B7355]">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(profile.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                </div>
                {(profile.referral_count ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-[#8B7355]">
                    <User className="w-4 h-4" />
                    <span>Đã giới thiệu: {profile.referral_count} người</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProfiles?.length === 0 && (
        <div className="text-center py-12 text-[#8B7355]">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Không tìm thấy user nào</p>
        </div>
      )}
    </div>
  );
};
