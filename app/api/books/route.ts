import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const book = await prisma.book.create({
      data: {
        title: body.title,
        author: body.author,
        coverImage: body.coverImage,
        modelUsed: body.modelUsed,
        isConfirmed: true,
      },
    })
    return NextResponse.json(book)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save book' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: { isConfirmed: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(books)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}