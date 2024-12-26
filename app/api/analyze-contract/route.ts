// app/api/analyze-contract/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import MarkdownIt from 'markdown-it';
import puppeteer from 'puppeteer';

// Set the workerSrc to the correct path
pdfjsLib.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry');

/**
 * POST handler for /api/analyze-contract
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Received POST request to /api/analyze-contract');

    const body = await request.json();
    const { fileUrl } = body;

    if (!fileUrl) {
      console.error('Missing fileUrl in request body');
      return NextResponse.json({ error: 'Missing fileUrl' }, { status: 400 });
    }

    console.log('Received fileUrl:', fileUrl);

    // Process PDF: download and extract text
    const pdfText: string = await processPdf(fileUrl);

    // Generate the analysis using OpenAI API
    const markdownContent = await generateAnalysis(pdfText);
    console.log('Analysis result:', markdownContent);

    // Convert the Markdown content to a PDF
    const pdfBuffer = await convertMarkdownToPdf(markdownContent);
    console.log('PDF created');

    // Upload the PDF to Google Cloud Storage
    const pdfUrl = await uploadPdfToGCS(pdfBuffer);
    console.log('PDF uploaded to:', pdfUrl);

    // Return the URL of the uploaded PDF
    return NextResponse.json({ annotatedPdfUrl: pdfUrl }, { status: 200 });
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * Function to process the PDF: download and extract text
 */
async function processPdf(fileUrl: string): Promise<string> {
  try {
    console.log('Downloading PDF from:', fileUrl);

    // Download the PDF
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const pdfData = new Uint8Array(response.data);

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;

    console.log('Number of pages:', numPages);

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += strings.join(' ') + '\n';
    }

    console.log('Text extraction completed');
    return fullText;
  } catch (error: any) {
    console.error('Error processing PDF:', error.message);
    throw error;
  }
}

/**
 * Function to generate analysis using OpenAI API
 */
async function generateAnalysis(pdfText: string): Promise<string> {
  try {
    console.log('Generating analysis using OpenAI API');

    const accessToken = process.env.OPENAI_API_KEY;
    if (!accessToken) {
      throw new Error('OPENAI_API_KEY is not defined');
    }

    const chatGptUrl = 'https://api.openai.com/v1/chat/completions';
    const role = `
      Analyze the following contract and highlight any potentially unfair or misleading terms.
      Provide a report with short summary, quotes of the clauses in the contract and explanations for why they are harmful,
      suggest what can be done about them, and provide an email example to negotiate contract terms.
      Output only a Markdown file with the report; no additional explanations are needed.
    `;
    const prompt = `Contract Text:\n${pdfText}`;

    // Define the Axios request configuration
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
    };

    // Define the payload for the Axios request
    const payload = {
      model: 'gpt-3.5-turbo', // Specify the model you want to use
      messages: [
        {
          role: 'system',
          content: role,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
    };

    // Send the request to the OpenAI API and wait for the response
    const openaiResponse = await axios.post(chatGptUrl, payload, config);

    const markdownContent =
      openaiResponse.data.choices[0].message.content.trim();

    console.log('Analysis generation completed');
    return markdownContent;
  } catch (error: any) {
    console.error('Error generating analysis:', error.message);
    throw error;
  }
}

/**
 * Function to convert Markdown content to PDF using Puppeteer
 */
async function convertMarkdownToPdf(markdownContent: string): Promise<Buffer> {
  try {
    console.log('Converting Markdown to PDF');

    // Convert Markdown to HTML
    const md = new MarkdownIt();
    const htmlContent = md.render(markdownContent);

    // Define the logo URL
    const logoUrl = '/img/logo.svg'; // Replace with your actual logo URL

    // Add the logo to the HTML content
    const htmlWithLogo = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .logo { text-align: center; margin-bottom: 20px; }
            .content { margin: 0 15mm; }
          </style>
        </head>
        <body>
          <div class="logo">
            <img src="${logoUrl}" alt="Company Logo" width="200">
          </div>
          <div class="content">
            ${htmlContent}
          </div>
        </body>
      </html>
    `;

    // Generate PDF from HTML using Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(htmlWithLogo, { waitUntil: 'networkidle0' });

    // Generate the PDF from the page content
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    await browser.close();

    console.log('PDF conversion completed');
    
    // Convert Uint8Array to Buffer
    return Buffer.from(pdfBuffer);
  } catch (error: any) {
    console.error('Error converting Markdown to PDF:', error.message);
    throw error;
  }
}

/**
 * Function to upload the PDF to Google Cloud Storage
 */
async function uploadPdfToGCS(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log('Uploading PDF to Google Cloud Storage');

    // Initialize Google Cloud Storage client
    const storage = new Storage({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      },
    });

    const bucketName = process.env.GCS_BUCKET_NAME;

    if (!bucketName) {
      throw new Error('GCS_BUCKET_NAME is not defined');
    }

    const bucket = storage.bucket(bucketName);

    // Generate a unique filename
    const timestamp = Date.now();
    const fileName = `annotated_contracts/${timestamp}_annotated_contract.pdf`;

    // Create a file object in the bucket
    const blob = bucket.file(fileName);

    // Save the PDF to the bucket
    await blob.save(pdfBuffer, {
      resumable: false,
      contentType: 'application/pdf',
      metadata: {
        cacheControl: 'no-cache',
      },
    });

    // Generate a signed URL for the uploaded PDF
    const expiresAt = Date.now() + 60 * 60 * 1000; // URL valid for 1 hour
    const [signedUrl] = await blob.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: expiresAt,
    });

    console.log('PDF uploaded successfully');
    return signedUrl;
  } catch (error: any) {
    console.error('Error uploading PDF:', error.message);
    throw error;
  }
}