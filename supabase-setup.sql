-- ==================================================
-- Supabase 数据库设置脚本
-- Identity Test Results Table
-- ==================================================
-- 
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制粘贴下面的 SQL 语句
-- 4. 点击 Run 执行
-- ==================================================

-- 创建测验结果表
CREATE TABLE IF NOT EXISTS identity_test_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 测验结果
  result_type VARCHAR(1) NOT NULL,    -- 主类型 (R/I/A/S/E/C)
  secondary_type VARCHAR(1),          -- 副类型
  scores JSONB NOT NULL,               -- 所有类型分数 {"R": 10, "I": 5, ...}
  
  -- 答案详情
  answers JSONB NOT NULL,              -- 每题答案 [ [0,2], [1], ... ]
  
  -- 用户信息（可选）
  email VARCHAR(255),                  -- 邮箱
  name VARCHAR(255),                   -- 姓名
  phone VARCHAR(50),                   -- 电话
  
  -- 元数据
  user_agent TEXT,                     -- 浏览器信息
  referrer TEXT                        -- 来源页面
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_identity_test_results_created_at 
  ON identity_test_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_identity_test_results_result_type 
  ON identity_test_results(result_type);

CREATE INDEX IF NOT EXISTS idx_identity_test_results_email 
  ON identity_test_results(email) 
  WHERE email IS NOT NULL;

-- 设置 Row Level Security (RLS)
ALTER TABLE identity_test_results ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户插入数据（公开写入）
DROP POLICY IF EXISTS "Allow anonymous inserts" ON identity_test_results;
CREATE POLICY "Allow anonymous inserts"
ON identity_test_results
FOR INSERT
TO anon
WITH CHECK (true);

-- 允许认证用户读取数据
DROP POLICY IF EXISTS "Allow authenticated reads" ON identity_test_results;
CREATE POLICY "Allow authenticated reads"
ON identity_test_results
FOR SELECT
TO authenticated
USING (true);

-- 如果需要完全公开读取（可选），取消下面的注释
-- DROP POLICY IF EXISTS "Allow public reads" ON identity_test_results;
-- CREATE POLICY "Allow public reads"
-- ON identity_test_results
-- FOR SELECT
-- TO anon
-- USING (true);

-- ==================================================
-- 有用的查询示例
-- ==================================================

-- 查看最近的结果
-- SELECT * FROM identity_test_results ORDER BY created_at DESC LIMIT 10;

-- 统计各类型分布
-- SELECT result_type, COUNT(*) as count 
-- FROM identity_test_results 
-- GROUP BY result_type 
-- ORDER BY count DESC;

-- 统计有填写联系方式的记录数
-- SELECT COUNT(*) FROM identity_test_results WHERE email IS NOT NULL OR phone IS NOT NULL;

-- 导出数据为 CSV
-- 在 Supabase Dashboard > Table Editor > 点击 Export 按钮即可

