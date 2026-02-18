import { NextRequest, NextResponse } from 'next/server'
import { CrawlerService } from '@/features/crawler/crawler.service'

export const dynamic = 'force-dynamic'

/**
 * API route to trigger the crawler
 * Protected by CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    // Security Check
    if (
        authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
        key !== process.env.CRON_SECRET
    ) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const crawler = new CrawlerService()

    // We run it asynchronously to avoid Vercel timeout in some cases, 
    // though for MVP we might want to wait for response
    try {
        // Start crawl (non-blocking)
        crawler.runFullCrawl()

        return NextResponse.json({
            success: true,
            message: 'Crawl job started in background',
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
