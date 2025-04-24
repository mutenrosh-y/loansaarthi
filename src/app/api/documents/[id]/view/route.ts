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

    // Log document details for debugging
    console.log('Document found:', {
      id: document.id,
      name: document.name,
      url: document.url,
    });

    // Get file format from URL
    const format = document.url.split('.').pop() || 'pdf';

    try {
      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.pdf
      const urlParts = document.url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL format');
      }
      
      // Get everything after 'upload/' and before the file extension
      const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
      const publicId = pathAfterUpload.split('.')[0]; // Remove file extension
      
      console.log('Extracted public_id:', publicId);
      
      // Generate or get cached signed URL
      const signedUrl = await getSignedUrl(publicId, format);
      return NextResponse.json({ url: signedUrl });
    } catch (error) {
      console.error('Error generating signed URL:', {
        documentId: document.id,
        url: document.url,
        format,
        error,
      });
      
      return NextResponse.json(
        { error: 'Failed to generate document URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in document view handler:', error);
    return NextResponse.json(
      { error: 'Failed to process document view request' },
      { status: 500 }
    );
  }
} 