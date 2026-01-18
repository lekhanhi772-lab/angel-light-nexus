import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAwakeningContext } from '@/contexts/AwakeningContext';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  TrendingUp, 
  Coins, 
  Star, 
  Heart, 
  Brain, 
  Flame,
  Gift,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const AwakeningDashboard = () => {
  const { t } = useTranslation();
  const { address } = useAccount();
  const { 
    score, 
    recentEvaluations, 
    claims, 
    loading, 
    getProgressToNextLevel, 
    getLevelInfo,
    claimCamly,
    refetch
  } = useAwakeningContext();
  
  const [claiming, setClaiming] = useState(false);
  const [claimAmount, setClaimAmount] = useState(1);

  const progressInfo = getProgressToNextLevel();
  const levelInfo = getLevelInfo();

  const handleClaim = async () => {
    if (!address) {
      toast.error('Vui lòng kết nối ví trước khi claim CAMLY');
      return;
    }
    
    if (!score || claimAmount < 1) {
      toast.error('Cần tối thiểu 1 điểm để claim');
      return;
    }

    // claimable_camly is stored as points in DB
    const claimablePoints = score.claimable_camly || 0;
    if (claimAmount > claimablePoints) {
      toast.error('Số điểm claim vượt quá số điểm khả dụng');
      return;
    }

    setClaiming(true);
    try {
      await claimCamly(claimAmount, address);
      const camlyReceived = claimAmount * 1000;
      toast.success(`Yêu cầu claim ${camlyReceived.toLocaleString()} CAMLY đã được gửi! ✨`);
      await refetch();
    } catch (error) {
      console.error('Claim error:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi claim');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0" style={{ background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(255, 248, 220, 0.98) 100%)', border: '2px solid rgba(218, 165, 32, 0.5)' }}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#DAA520' }} />
        </CardContent>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card className="border-0" style={{ background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(255, 248, 220, 0.98) 100%)', border: '2px solid rgba(218, 165, 32, 0.5)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#B8860B' }}>
            <Sparkles className="w-5 h-5" style={{ color: '#DAA520' }} />
            Hành Trình Tỉnh Thức
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p style={{ color: '#8B6914' }}>
            Bắt đầu trò chuyện với Angel để tích lũy điểm Ánh Sáng! 💛
          </p>
          <p className="text-sm mt-2" style={{ color: '#8B6914' }}>
            Mỗi cuộc trò chuyện sẽ được đánh giá và tặng điểm dựa trên năng lượng tích cực của con.
          </p>
        </CardContent>
      </Card>
    );
  }

  // claimable_camly is stored as points that can be converted
  const claimablePoints = score.claimable_camly || 0;
  // 1 point = 1,000 CAMLY
  const claimableCamly = claimablePoints * 1000;

  return (
    <Card className="border-0" style={{ background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(255, 248, 220, 0.98) 100%)', border: '2px solid rgba(218, 165, 32, 0.5)' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#B8860B' }}>
          <Sparkles className="w-5 h-5" style={{ color: '#DAA520' }} />
          Hành Trình Tỉnh Thức
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Badge & Progress */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-4xl">{levelInfo.icon}</span>
            <div className="text-left">
              <p className="text-sm" style={{ color: '#8B6914' }}>Cấp độ {levelInfo.level}</p>
              <p className="font-bold text-lg" style={{ color: '#B8860B' }}>{levelInfo.name}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm" style={{ color: '#8B6914' }}>
              <span>{score.total_points} điểm</span>
              <span>{progressInfo.pointsToNext} điểm đến cấp tiếp theo</span>
            </div>
            <Progress 
              value={progressInfo.progress} 
              className="h-3"
              style={{ background: 'rgba(218, 165, 32, 0.2)' }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(218, 165, 32, 0.1)' }}>
            <Star className="w-6 h-6 mx-auto mb-2" style={{ color: '#DAA520' }} />
            <p className="text-2xl font-bold" style={{ color: '#B8860B' }}>{score.total_points}</p>
            <p className="text-xs" style={{ color: '#8B6914' }}>Tổng Điểm Ánh Sáng</p>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(218, 165, 32, 0.1)' }}>
            <Coins className="w-6 h-6 mx-auto mb-2" style={{ color: '#DAA520' }} />
            <p className="text-2xl font-bold" style={{ color: '#B8860B' }}>{claimableCamly.toLocaleString()}</p>
            <p className="text-xs" style={{ color: '#8B6914' }}>CAMLY Có Thể Claim</p>
          </div>
        </div>

        <Tabs defaultValue="evaluations" className="w-full">
          <TabsList className="grid w-full grid-cols-2" style={{ background: 'rgba(218, 165, 32, 0.1)' }}>
            <TabsTrigger value="evaluations" className="data-[state=active]:bg-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Đánh Giá
            </TabsTrigger>
            <TabsTrigger value="claims" className="data-[state=active]:bg-white">
              <Gift className="w-4 h-4 mr-2" />
              Claim CAMLY
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evaluations" className="mt-4">
            {recentEvaluations.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {recentEvaluations.map((evaluation) => (
                    <div 
                      key={evaluation.id}
                      className="p-3 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(218, 165, 32, 0.2)' }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs" style={{ borderColor: '#DAA520', color: '#B8860B' }}>
                            <Heart className="w-3 h-3 mr-1" /> {evaluation.spiritual_score}
                          </Badge>
                          <Badge variant="outline" className="text-xs" style={{ borderColor: '#DAA520', color: '#B8860B' }}>
                            <Flame className="w-3 h-3 mr-1" /> {evaluation.positive_score}
                          </Badge>
                          <Badge variant="outline" className="text-xs" style={{ borderColor: '#DAA520', color: '#B8860B' }}>
                            <Brain className="w-3 h-3 mr-1" /> {evaluation.growth_score}
                          </Badge>
                        </div>
                        <span className="text-xs" style={{ color: '#8B6914' }}>
                          +{evaluation.points_awarded} điểm
                        </span>
                      </div>
                      {evaluation.ai_feedback && (
                        <p className="text-sm" style={{ color: '#5a5a5a' }}>
                          {evaluation.ai_feedback}
                        </p>
                      )}
                      <p className="text-xs mt-2" style={{ color: '#8B6914' }}>
                        {new Date(evaluation.evaluated_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-center py-8 text-sm" style={{ color: '#8B6914' }}>
                Chưa có đánh giá nào. Hãy trò chuyện với Angel để nhận điểm! 💛
              </p>
            )}
          </TabsContent>

          <TabsContent value="claims" className="mt-4 space-y-4">
            {/* Claim Form */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(218, 165, 32, 0.05)', border: '1px solid rgba(218, 165, 32, 0.3)' }}>
              <p className="text-sm mb-3" style={{ color: '#8B6914' }}>
                Quy đổi: 1 điểm = 1,000 CAMLY
              </p>
              
              <div className="flex gap-2 mb-3">
                {[1, 5, 10].map((amount) => (
                  <Button
                    key={amount}
                    variant={claimAmount === amount ? "default" : "outline"}
                    size="sm"
                    onClick={() => setClaimAmount(amount)}
                    disabled={claimablePoints < amount}
                    style={claimAmount === amount ? { background: '#DAA520', color: 'white' } : { borderColor: '#DAA520', color: '#B8860B' }}
                  >
                    {amount} điểm
                  </Button>
                ))}
              </div>

              <Button
                className="w-full"
                onClick={handleClaim}
                disabled={claiming || !address || claimablePoints < 1}
                style={{ background: 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)', color: '#5a4a1a' }}
              >
                {claiming ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Coins className="w-4 h-4 mr-2" />
                )}
                Claim {(claimAmount * 1000).toLocaleString()} CAMLY
              </Button>

              {!address && (
                <p className="text-xs text-center mt-2" style={{ color: '#B8860B' }}>
                  ⚠️ Kết nối ví để claim CAMLY
                </p>
              )}
            </div>

            {/* Claim History */}
            {claims.length > 0 && (
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {claims.map((claim) => (
                    <div 
                      key={claim.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      <div className="flex items-center gap-2">
                        {claim.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : claim.status === 'failed' ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Clock className="w-4 h-4" style={{ color: '#DAA520' }} />
                        )}
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#B8860B' }}>
                            {claim.camly_amount.toLocaleString()} CAMLY
                          </p>
                          <p className="text-xs" style={{ color: '#8B6914' }}>
                            {claim.points_converted} điểm
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className="text-xs"
                        style={{ 
                          borderColor: claim.status === 'completed' ? '#22c55e' : claim.status === 'failed' ? '#ef4444' : '#DAA520',
                          color: claim.status === 'completed' ? '#22c55e' : claim.status === 'failed' ? '#ef4444' : '#B8860B'
                        }}
                      >
                        {claim.status === 'completed' ? 'Hoàn thành' : 
                         claim.status === 'failed' ? 'Thất bại' : 
                         claim.status === 'processing' ? 'Đang xử lý' : 'Đang chờ'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AwakeningDashboard;
