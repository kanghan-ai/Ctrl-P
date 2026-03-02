import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { CardData } from '@/lib/mock-data';

// ─── 客户端 ↔ Supabase 字段映射 ───────────────────
// 客户端用 camelCase，Supabase 表用 snake_case

/** 客户端 CardData → Supabase 行（INSERT/UPDATE 前调用） */
function toSupabaseRow(card: any): Record<string, any> {
    const row: Record<string, any> = {};
    // 只保留 Supabase 表里存在的列
    const fieldMap: Record<string, string> = {
        id: 'id',
        user_id: 'user_id',
        type: 'type',
        // gallery
        images: 'images',
        title: 'title',
        description: 'description',
        tags: 'tags',
        model: 'model',
        // framework
        patternType: 'framework_name',
        frameworkName: 'framework_name', // 兼容旧字段名
        code: 'code',
        layout: 'layout',
        example: 'example',
        // principle
        words: 'words',
        sentence: 'sentence',
        explanation: 'explanation',
        prompt: 'prompt',
        color: 'color',
        // 通用
        source: 'source',
        sourceUrl: 'source_url',
        source_url: 'source_url', // 如果已经是 snake_case
        created_at: 'created_at',
        updated_at: 'updated_at',
    };
    for (const [clientKey, dbCol] of Object.entries(fieldMap)) {
        if (card[clientKey] !== undefined) {
            row[dbCol] = card[clientKey];
        }
    }
    return row;
}

/** Supabase 行 → 客户端 CardData（GET 返回前调用） */
function toClientCard(row: any): any {
    const card: any = { ...row };
    // framework_name → patternType
    if (row.framework_name !== undefined) {
        card.patternType = row.framework_name;
        delete card.framework_name;
    }
    // source_url → sourceUrl
    if (row.source_url !== undefined) {
        card.sourceUrl = row.source_url;
        delete card.source_url;
    }
    return card;
}



// GET - Fetch all cards for current user
export async function GET(request: Request) {
    try {
        // 使用服务器端客户端读取 cookies
        const supabase = createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('认证失败:', authError);
            return NextResponse.json(
                { error: '未授权，请先登录' },
                { status: 401 }
            );
        }

        console.log('✅ 用户已认证:', user.id);

        // Fetch cards from Supabase (RLS will automatically filter by user_id)
        const { data: cards, error } = await supabase
            .from('cards')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase query error:', error);
            throw error;
        }

        console.log(`📦 成功加载 ${cards?.length || 0} 张卡片`);
        // snake_case → camelCase 映射
        const clientCards = (cards || []).map(toClientCard);
        return NextResponse.json({ cards: clientCards });
    } catch (error: any) {
        console.error('Error fetching cards:', error);
        return NextResponse.json(
            { error: error.message || '获取数据失败' },
            { status: 500 }
        );
    }
}

// POST - Create a new card
export async function POST(request: Request) {
    try {
        const supabase = createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: '未授权，请先登录' },
                { status: 401 }
            );
        }

        const newCard: CardData = await request.json();

        // Validate required fields
        if (!newCard.id || !newCard.type) {
            return NextResponse.json(
                { error: '缺少必需字段: id 和 type' },
                { status: 400 }
            );
        }

        // camelCase → snake_case 映射，只传 Supabase 表里有的列
        const dbRow = toSupabaseRow({ ...newCard, user_id: user.id });

        // Insert into Supabase
        const { data, error } = await supabase
            .from('cards')
            .insert([dbRow])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            throw error;
        }

        return NextResponse.json({ card: data }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating card:', error);
        return NextResponse.json(
            { error: error.message || '创建卡片失败' },
            { status: 500 }
        );
    }
}

// PUT - Update all cards (for bulk operations like reordering)
export async function PUT(request: Request) {
    try {
        const supabase = createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: '未授权，请先登录' },
                { status: 401 }
            );
        }

        const { cards } = await request.json();

        if (!Array.isArray(cards)) {
            return NextResponse.json(
                { error: '卡片数据必须是数组' },
                { status: 400 }
            );
        }

        // For reordering, we'll update each card's updated_at
        // This is a simplified approach. In production, you might want a separate order field
        const updates = cards.map((card, index) =>
            supabase
                .from('cards')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', card.id)
                .eq('user_id', user.id) // Ensure user owns the card
        );

        await Promise.all(updates);

        return NextResponse.json({ cards });
    } catch (error: any) {
        console.error('Error updating cards:', error);
        return NextResponse.json(
            { error: error.message || '更新卡片失败' },
            { status: 500 }
        );
    }
}
