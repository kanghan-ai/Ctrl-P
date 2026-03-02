-- ============================================
-- Supabase 数据库表创建脚本
-- 项目: CTRL+P - AI Prompt Manager
-- ============================================

-- 1. 创建 cards 表
CREATE TABLE IF NOT EXISTS public.cards (
  -- 主键和用户关联
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('gallery', 'framework', 'principle')),
  
  -- Gallery 类型字段
  images TEXT[],
  title TEXT,
  description TEXT,
  tags TEXT[],
  model TEXT,
  
  -- Framework 类型字段
  framework_name TEXT,
  code TEXT,
  layout TEXT CHECK (layout IN ('vertical', 'horizontal')),
  example TEXT,
  
  -- Principle 类型字段
  words TEXT,
  sentence TEXT,
  explanation TEXT,
  prompt TEXT,
  color TEXT CHECK (color IN ('yellow', 'cyan', 'magenta')),
  
  -- 通用字段
  source TEXT,
  source_url TEXT,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 启用 Row Level Security (RLS)
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- 3. 创建 RLS 策略：用户只能访问自己的数据

-- 读取策略
CREATE POLICY "users_read_own_cards" 
  ON public.cards FOR SELECT 
  USING (auth.uid() = user_id);

-- 创建策略
CREATE POLICY "users_insert_own_cards" 
  ON public.cards FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 更新策略
CREATE POLICY "users_update_own_cards" 
  ON public.cards FOR UPDATE 
  USING (auth.uid() = user_id);

-- 删除策略
CREATE POLICY "users_delete_own_cards" 
  ON public.cards FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON public.cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_type ON public.cards(type);

-- 5. 自动更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 创建触发器
CREATE TRIGGER update_cards_updated_at 
  BEFORE UPDATE ON public.cards
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 完成！
-- ============================================

-- 验证表创建
-- SELECT * FROM public.cards LIMIT 1;

-- 查看 RLS 策略
-- SELECT * FROM pg_policies WHERE tablename = 'cards';
