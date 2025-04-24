import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs/promises';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customerId = formData.get('customerId') as string;
    const loanId = formData.get('loanId') as string;
    const documentType = formData.get('documentType') as string;

    if (!file || !customerId || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
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
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // If loanId is provided, check if loan exists
    if (loanId) {
      const loan = await prisma.loan.findUnique({
        where: { id: loanId },
      });

      if (!loan) {
        return NextResponse.json(
          { error: 'Loan not found' },
          { status: 404 }
        );
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', customerId);
    await createDirIfNotExists(uploadDir);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filePath = join(uploadDir, filename);

    try {
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json(
        { error: 'Failed to save file' },
        { status: 500 }
      );
    }

    try {
      // Create document record in database
      const document = await prisma.document.create({
        data: {
          name: file.name,
          type: documentType,
          url: `/uploads/${customerId}/${filename}`,
          customerId,
          loanId: loanId || null,
          uploadedBy: session.user.id,
        },
      });

      return NextResponse.json({ document });
    } catch (error) {
      // If database operation fails, clean up the uploaded file
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('Error cleaning up file after failed database operation:', unlinkError);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in document upload:', error);
    return NextResponse.json(
      { error: 'Failed to process document upload' },
      { status: 500 }
    );
  }
}

async function createDirIfNotExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
} 