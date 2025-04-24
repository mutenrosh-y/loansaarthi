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

// Log Cloudinary configuration (without sensitive data)
console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'missing',
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export async function POST(request: Request) {
  try {
    console.log('Document upload request received');
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error('Unauthorized access attempt to upload document');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', session.user.id);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customerId = formData.get('customerId') as string;
    const loanId = formData.get('loanId') as string;
    const documentType = formData.get('documentType') as string;

    console.log('Form data received:', {
      fileName: file?.name,
      fileSize: file?.size,
      customerId,
      loanId: loanId || 'none',
      documentType,
    });

    if (!file || !customerId || !documentType) {
      console.error('Missing required fields:', { file: !!file, customerId, documentType });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error('File size exceeds limit:', file.size);
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
      console.error('Invalid file type:', fileExtension);
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPEG, and PNG files are allowed' },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      console.error('Customer not found:', customerId);
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    console.log('Customer found:', customer.name);

    // If loanId is provided, check if loan exists
    if (loanId) {
      const loan = await prisma.loan.findUnique({
        where: { id: loanId },
      });

      if (!loan) {
        console.error('Loan not found:', loanId);
        return NextResponse.json(
          { error: 'Loan not found' },
          { status: 404 }
        );
      }
      console.log('Loan found:', loan.id);
    }

    try {
      console.log('Converting file to buffer');
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      console.log('File converted to buffer, size:', buffer.length);

      console.log('Uploading to Cloudinary');
      // Upload to Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `loansaarthi/${customerId}`,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Cloudinary upload successful:', result);
              resolve(result);
            }
          }
        );

        // Write buffer to upload stream
        const stream = require('stream');
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);
        bufferStream.pipe(uploadStream);
      });

      console.log('Creating document record in database');
      // Create document record in database
      const document = await prisma.document.create({
        data: {
          name: file.name,
          type: documentType,
          url: (uploadResponse as any).secure_url,
          cloudinaryPublicId: (uploadResponse as any).public_id,
          customerId,
          loanId: loanId || null,
          uploadedBy: session.user.id,
          status: 'PENDING',
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          loan: {
            select: {
              id: true,
              type: true,
              status: true,
            },
          },
        },
      });

      console.log('Document created successfully:', document.id);
      return NextResponse.json({ document });
    } catch (error) {
      console.error('Error in document upload process:', error);
      return NextResponse.json(
        { error: 'Failed to process document upload', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in document upload handler:', error);
    return NextResponse.json(
      { error: 'Failed to process document upload', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 