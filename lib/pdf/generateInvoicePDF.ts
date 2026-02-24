import puppeteer from 'puppeteer-core'
import type { Browser } from 'puppeteer-core'

interface GeneratePDFOptions {
  paymentId: string
  baseUrl: string
}

export async function generateInvoicePDF({ paymentId, baseUrl }: GeneratePDFOptions): Promise<Buffer> {
  let browser: Browser | null = null

  try {
    // Determine if we're in production (Vercel)
    const isProduction = process.env.NODE_ENV === 'production' && process.env.VERCEL

    if (isProduction) {
      // Use @sparticuz/chromium-min for Vercel
      const chromium = await import('@sparticuz/chromium-min')

      // Get executable path using external link
      const executablePath = await chromium.default.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
      )

      browser = await puppeteer.launch({
        args: [
          ...chromium.default.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
        defaultViewport: {
          width: 1280,
          height: 720,
        },
        executablePath,
        headless: true,
      })
    } else {
      // Use local Chromium for development
      const puppeteerFull = await import('puppeteer')
      browser = await puppeteerFull.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }

    const page = await browser.newPage()

    // Navigate to the print page with absolute URL
    const url = `${baseUrl}/invoice/${paymentId}/print`

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready')

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    })

    return Buffer.from(pdfBuffer)
  } catch (error) {
    throw new Error('Failed to generate PDF')
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
