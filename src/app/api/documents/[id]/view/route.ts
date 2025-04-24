import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    try {
      // Generate a signed URL that expires in 1 hour
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      
      // Extract the public_id from the URL
      const urlParts = document.url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL format');
      }
      
      // Get everything after 'upload/' and before the file extension
      const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
      const publicId = pathAfterUpload.split('.')[0]; // Remove file extension
      
      console.log('Generating signed URL for:', {
        publicId,
        expiresAt,
      });

      // Generate a signed URL using Cloudinary's SDK
      const signedUrl = cloudinary.utils.private_download_url(
        publicId,
        'pdf',
        { expires_at: expiresAt }
      );

      console.log('Generated signed URL');
      return NextResponse.json({ url: signedUrl });
    } catch (error) {
      console.error('Error generating signed URL:', {
        documentId: document.id,
        url: document.url,
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