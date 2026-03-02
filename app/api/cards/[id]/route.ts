import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// ─── 字段映射（与 /api/cards/route.ts 保持一致） ──────────
function toSupabaseRow(card: any): Record<string, any> {
    const row: Record<string, any> = {};
    const fieldMap: Record<string, string> = {
        id: 'id', user_id: 'user_id', type: 'type',
        images: 'images', title: 'title', description: 'description',
        tags: 'tags', model: 'model',
        patternType: 'framework_name', frameworkName: 'framework_name',
        code: 'code', layout: 'layout', example: 'example',
        words: 'words', sentence: 'sentence', explanation: 'explanation',
        prompt: 'prompt', color: 'color',
        source: 'source', sourceUrl: 'source_url', source_url: 'source_url',
        created_at: 'created_at', updated_at: 'updated_at',
    };
    for (const [k, v] of Object.entries(fieldMap)) {
        if (card[k] !== undefined) row[v] = card[k];
    }
    return row;
}

function toClientCard(row: any): any {
    const card: any = { ...row };
    if (row.framework_name !== undefined) { card.patternType = row.framework_name; delete card.framework_name; }
    if (row.source_url !== undefined) { card.sourceUrl = row.source_url; delete card.source_url; }
    return card;
}

interface RouteParams {
    params: {
        id: string;
    };
}

// GET - Fetch a single card by ID
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const supabase = createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: '未授权，请先登录' },
                { status: 401 }
            );
        }

        const { data: card, error } = await supabase
            .from('cards')
            .select('*')
            .eq('id', params.id)
            .eq('user_id', user.id) // Ensure user owns the card
            .single();

        if (error || !card) {
            return NextResponse.json(
                { error: '卡片未找到' },
                { status: 404 }
            );
        }

        return NextResponse.json({ card: toClientCard(card) });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || '获取卡片失败' },
            { status: 500 }
        );
    }
}

// PUT - Update a single card
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const supabase = createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: '未授权，请先登录' },
                { status: 401 }
            );
        }

        const updatedCard = await request.json();
        const dbRow = toSupabaseRow(updatedCard);

        const { data, error } = await supabase
            .from('cards')
            .update(dbRow)
            .eq('id', params.id)
            .eq('user_id', user.id) // Ensure user owns the card
            .select()
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: '卡片未找到或更新失败' },
                { status: 404 }
            );
        }

        return NextResponse.json({ card: toClientCard(data) });
    } catch (error: any) {
        console.error('Error updating card:', error);
        return NextResponse.json(
            { error: error.message || '更新卡片失败' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a single card
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const supabase = createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: '未授权，请先登录' },
                { status: 401 }
            );
        }

        const { data, error } = await supabase
            .from('cards')
            .delete()
            .eq('id', params.id)
            .eq('user_id', user.id) // Ensure user owns the card
            .select()
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: '卡片未找到或删除失败' },
                { status: 404 }
            );
        }

        return NextResponse.json({ card: toClientCard(data) });
    } catch (error: any) {
        console.error('Error deleting card:', error);
        return NextResponse.json(
            { error: error.message || '删除卡片失败' },
            { status: 500 }
        );
    }
}
