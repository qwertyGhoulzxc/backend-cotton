import { PrismaService } from '@prisma/prisma.service';
import { stringify } from 'csv-stringify';
import * as fs from 'fs';

export async function exportCategoryLogsToCsv(
  prisma: PrismaService,
  categoryId: string,
  filePath: string
): Promise<boolean> {
  const BATCH_SIZE = 5000;
  let hasMore = true;
  let cursor: string | undefined;
  let totalCount = 0;
  const cutoffDate = new Date();

  return new Promise(async (resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    
    // 1. ИЗМЕНЕНИЕ: Заголовки колонок под стандарт v6
    const stringifier = stringify({
      header: true,
      columns: [
        { key: 'card_id', header: 'card_id' },
        { key: 'review_time', header: 'review_time' },
        { key: 'review_rating', header: 'review_rating' },
        { key: 'review_state', header: 'review_state' }
      ]
    });

    writeStream.on('error', (err) => reject(err));
    stringifier.on('error', (err) => reject(err));
    stringifier.pipe(writeStream);

    try {
      while (hasMore) {
        const logs = await prisma.fSRSCardLog.findMany({
          take: BATCH_SIZE,
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: cursor } : undefined,
          where: {
            review: { lte: cutoffDate }, 
            fsrsCard: {
              card: {
                deck: { deckCategoryId: categoryId }
              }
            }
          },
          orderBy: [
            { review: 'asc' }, 
            { id: 'asc' }
          ],
          select: {
            id: true,
            fsrsCardId: true,
            review: true,
            rating: true,
            state: true
          }
        });

        if (logs.length === 0) {
          hasMore = false;
        } else {
          for (const log of logs) {
            // 2. ИЗМЕНЕНИЕ: Маппинг данных и миллисекунды для времени
            stringifier.write({
              card_id: log.fsrsCardId,           // Соответствует card_id
              review_time: log.review.getTime(), // Миллисекунды
              review_rating: log.rating,         // Соответствует review_rating
              review_state: log.state            // Соответствует review_state
            });
          }

          totalCount += logs.length;
          cursor = logs[logs.length - 1].id;

          if (logs.length < BATCH_SIZE) {
            hasMore = false;
          }
          await new Promise(r => setImmediate(r));
        }
      }

      stringifier.end();
      writeStream.on('finish', () => {
        resolve(true); 
      });
    } catch (error) {
      stringifier.end();
      reject(error);
    }
  });
}