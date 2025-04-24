import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSignedUrl } from '@/lib/cloudinary';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: params.id },
    });

    if (!document) {
      console.error('Document not found:', params.id);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get file format from URL
    const format = document.url.split('.').pop() || 'pdf';

    // Generate or get cached signed URL
    const signedUrl = await getSignedUrl(document.cloudinaryPublicId, format);

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate document URL' },
      { status: 500 }
    );
  }
} 