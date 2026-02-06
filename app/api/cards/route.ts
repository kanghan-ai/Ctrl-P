import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { CardData } from '@/lib/mock-data';

const DATA_FILE = path.join(process.cwd(), 'data', 'cards.json');

// Helper to read cards from file
async function readCards() {
    try {
        const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
        const data = JSON.parse(fileContent);
        return data.cards || [];
    } catch (error) {
        console.error('Error reading cards:', error);
        return [];
    }
}

// Helper to write cards to file
async function writeCards(cards: CardData[]) {
    try {
        const data = {
            cards,
            lastModified: new Date().toISOString()
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing cards:', error);
        throw error;
    }
}

// GET - Fetch all cards
export async function GET() {
    try {
        const cards = await readCards();
        return NextResponse.json({ cards });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch cards' },
            { status: 500 }
        );
    }
}

// POST - Create a new card
export async function POST(request: Request) {
    try {
        const newCard: CardData = await request.json();

        // Validate required fields
        if (!newCard.id || !newCard.type) {
            return NextResponse.json(
                { error: 'Missing required fields: id and type' },
                { status: 400 }
            );
        }

        const cards = await readCards();

        // Check if card with same ID already exists
        const existingIndex = cards.findIndex((c: CardData) => c.id === newCard.id);
        if (existingIndex !== -1) {
            return NextResponse.json(
                { error: 'Card with this ID already exists' },
                { status: 409 }
            );
        }

        cards.push(newCard);
        await writeCards(cards);

        return NextResponse.json({ card: newCard }, { status: 201 });
    } catch (error) {
        console.error('Error creating card:', error);
        return NextResponse.json(
            { error: 'Failed to create card' },
            { status: 500 }
        );
    }
}

// PUT - Update all cards (for bulk operations like reordering)
export async function PUT(request: Request) {
    try {
        const { cards } = await request.json();

        if (!Array.isArray(cards)) {
            return NextResponse.json(
                { error: 'Cards must be an array' },
                { status: 400 }
            );
        }

        await writeCards(cards);

        return NextResponse.json({ cards });
    } catch (error) {
        console.error('Error updating cards:', error);
        return NextResponse.json(
            { error: 'Failed to update cards' },
            { status: 500 }
        );
    }
}
