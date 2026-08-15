import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

/**
 * Robust Google Drive Public Folder parser.
 * Reads public Google Drive folder HTML & embedded views, finds all embedded file IDs and metadata.
 */
app.get('/api/drive/folder/:folderId', async (req: Request, res: Response): Promise<void> => {
  const { folderId } = req.params;
  if (!folderId || typeof folderId !== 'string') {
    res.status(400).json({ error: 'Folder ID is required' });
    return;
  }

  try {
    const urlsToTry = [
      `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#grid`,
      `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#list`,
      `https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}`,
    ];

    const fileIdSet = new Set<string>();
    const fileList: Array<{
      id: string;
      title: string;
      proxyUrl: string;
      thumbnailUrl: string;
      directUrl: string;
    }> = [];

    for (const driveUrl of urlsToTry) {
      try {
        const response = await fetch(driveUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });

        if (!response.ok) continue;
        const html = await response.text();

        // 1. Match standard file view URLs in embeddedfolderview / standard folder HTML
        const fileUrlMatches = html.matchAll(/\/file\/d\/([a-zA-Z0-9_-]{25,50})/g);
        for (const match of fileUrlMatches) {
          const id = match[1];
          if (id && id !== folderId && !fileIdSet.has(id)) {
            fileIdSet.add(id);
            fileList.push({
              id,
              title: `Pangilatan Larawan ${fileList.length + 1}`,
              proxyUrl: `/api/drive/image/${id}`,
              thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1200`,
              directUrl: `https://lh3.googleusercontent.com/d/${id}=s1200`,
            });
          }
        }

        // 2. Match embedded thumbnail IDs
        const thumbMatches = html.matchAll(/thumbnail\?id=([a-zA-Z0-9_-]{25,50})/g);
        for (const match of thumbMatches) {
          const id = match[1];
          if (id && id !== folderId && !fileIdSet.has(id)) {
            fileIdSet.add(id);
            fileList.push({
              id,
              title: `Pangilatan Larawan ${fileList.length + 1}`,
              proxyUrl: `/api/drive/image/${id}`,
              thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1200`,
              directUrl: `https://lh3.googleusercontent.com/d/${id}=s1200`,
            });
          }
        }

        // 3. Match data-id attributes or JSON arrays like ["1abc...", ["filename.jpg"...]]
        const jsonIdMatches = html.matchAll(/\["([a-zA-Z0-9_-]{28,45})",\s*\["([^"]+)"/g);
        for (const match of jsonIdMatches) {
          const id = match[1];
          const name = match[2];
          if (id && id !== folderId && !fileIdSet.has(id)) {
            fileIdSet.add(id);
            fileList.push({
              id,
              title: name || `Pangilatan Larawan ${fileList.length + 1}`,
              proxyUrl: `/api/drive/image/${id}`,
              thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1200`,
              directUrl: `https://lh3.googleusercontent.com/d/${id}=s1200`,
            });
          }
        }

        // If we found files from this url, break early
        if (fileList.length > 0) {
          break;
        }
      } catch (err) {
        continue;
      }
    }

    res.json({
      folderId,
      count: fileList.length,
      files: fileList,
    });
  } catch (error: any) {
    console.error('Error fetching Google Drive folder:', error);
    res.status(500).json({
      error: error?.message || 'Failed to fetch Google Drive folder',
      folderId,
    });
  }
});

/**
 * Reliable Google Drive Image Proxy Service.
 * Fetches the image through multiple upstream Google CDN endpoints with fallback,
 * caching headers, and binary streaming to bypass CORS and frame restrictions.
 */
app.get('/api/drive/image/:fileId', async (req: Request, res: Response): Promise<void> => {
  const { fileId } = req.params;
  const size = req.query.size ? String(req.query.size) : '1200';

  if (!fileId || typeof fileId !== 'string') {
    res.status(400).send('File ID required');
    return;
  }

  // List of Google endpoints to try in order
  const upstreamUrls = [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`,
    `https://lh3.googleusercontent.com/d/${fileId}=s${size}`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=view&authuser=0`,
    `https://docs.google.com/uc?export=view&id=${fileId}`,
  ];

  let imageBuffer: ArrayBuffer | null = null;
  let contentType = 'image/jpeg';

  for (const url of upstreamUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (response.ok) {
        const ct = response.headers.get('content-type') || '';
        // Verify it is actually an image and not an HTML error or login page
        if (ct.startsWith('image/')) {
          contentType = ct;
          imageBuffer = await response.arrayBuffer();
          break;
        }
      }
    } catch (e) {
      // Try next endpoint
      continue;
    }
  }

  if (imageBuffer) {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(imageBuffer));
  } else {
    // If upstream Google Drive rejects the direct download or is private, redirect to thumbnail fallback
    res.redirect(`https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`);
  }
});

/**
 * Generic Image Proxy Service for remote image URLs
 */
app.get('/api/drive/proxy', async (req: Request, res: Response): Promise<void> => {
  const targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    res.status(400).send('URL required');
    return;
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).send('Failed to proxy image');
      return;
    }

    const ct = upstream.headers.get('content-type') || 'image/jpeg';
    const buffer = await upstream.arrayBuffer();

    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buffer));
  } catch (error: any) {
    res.status(500).send(error?.message || 'Proxy error');
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Universe Server running on http://localhost:${PORT}`);
  });
}

startServer();
