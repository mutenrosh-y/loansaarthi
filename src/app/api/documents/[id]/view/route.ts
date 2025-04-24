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
      // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
      const urlParts = document.url.split('/');
      console.log('URL parts:', urlParts);
      
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      console.log('Upload index:', uploadIndex);
      
      if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL format');
      }
      
      // Get the path after 'upload/' which includes the version and public_id
      const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
      console.log('Path after upload:', pathAfterUpload);
      
      // Remove the version number and file extension to get the public_id
      const publicId = pathAfterUpload.split('/').slice(1).join('/').split('.')[0];
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