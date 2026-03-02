import { createBrowserClient } from '@supabase/ssr';

// 创建浏览器端 Supabase 客户端
// 使用 @supabase/ssr 包确保 session 正确保存到 cookies
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
