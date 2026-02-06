import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'cards.json');

interface RouteParams {
    params: {
        id: string;
    };
}

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
async function writeCards(cards: any[]) {
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

// GET - Fetch a single card by ID
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const cards = await readCards();
        const card = cards.find((c: any) => c.id === params.id);

        if (!card) {
            return NextResponse.json(
                { error: 'Card not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ card });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch card' },
            { status: 500 }
        );
    }
}

// PUT - Update a single card
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const updatedCard = await request.json();
        const cards = await readCards();

        const cardIndex = cards.findIndex((c: any) => c.id === params.id);

        if (cardIndex === -1) {
            return NextResponse.json(
                { error: 'Card not found' },
                { status: 404 }
            );
        }

        // Preserve the ID and type
        cards[cardIndex] = {
            ...updatedCard,
            id: params.id,
            type: cards[cardIndex].type
        };

        await writeCards(cards);

        return NextResponse.json({ card: cards[cardIndex] });
    } catch (error) {
        console.error('Error updating card:', error);
        return NextResponse.json(
            { error: 'Failed to update card' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a single card
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const cards = await readCards();
        const cardIndex = cards.findIndex((c: any) => c.id === params.id);

        if (cardIndex === -1) {
            return NextResponse.json(
                { error: 'Card not found' },
                { status: 404 }
            );
        }

        const deletedCard = cards.splice(cardIndex, 1)[0];
        await writeCards(cards);

        return NextResponse.json({ card: deletedCard });
    } catch (error) {
        console.error('Error deleting card:', error);
        return NextResponse.json(
            { error: 'Failed to delete card' },
            { status: 500 }
        );
    }
}
