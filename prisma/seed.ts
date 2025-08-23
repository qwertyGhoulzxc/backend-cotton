import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const colorList = [
  'red',
  'blue',
  'emerald',
  'yellow',
  'purple',
  'pink',
  'cyan',
  'stone',
];

const iconList = [
  'bot',
  'food',
  'music',
  'ghost',
  'movies',
  'design',
  'art',
  'code',
  'award',
  'mail',
  'math',
  'activity',
  'video',
  'nature',
  'mind',
  'travel',
  'car',
  'bookOpen',
];

function getRandomIcon() {
  return iconList[Math.floor(Math.random() * iconList.length)];
}

function htmlToPlainText(html: string) {
  if (!html) return '';

  let text = html;

  // Normalize list items and line breaks
  text = text.replace(/<li>/gi, '\n- ');
  text = text.replace(/<\/li>/gi, '');
  text = text.replace(/<br\s*\/?\s*>/gi, '\n');
  text = text.replace(/<p[^>]*>/gi, '');
  text = text.replace(/<\/p>/gi, '\n');
  text = text.replace(/<blockquote[^>]*>/gi, '\n');
  text = text.replace(/<\/blockquote>/gi, '\n');

  // Remove remaining tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode basic HTML entities
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  for (const [entity, char] of Object.entries(entities)) {
    text = text.replace(new RegExp(entity, 'g'), char);
  }

  // Collapse excessive whitespace/newlines
  text = text.replace(/[\r\t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/ +/g, ' ');

  return text.trim();
}

// FSRS random data
function createChaoticFSRSCardData() {
  const now = new Date();
  const randomState = Math.floor(Math.random() * 4);
  const randomDifficulty = 0.1 + Math.random() * 0.8;
  const randomStability = Math.random() * 10;
  const randomReps = Math.floor(Math.random() * 20);
  const randomLapses = Math.floor(Math.random() * 5);

  let dueDate = now;
  let scheduledDays = 0;
  let elapsedDays = 0;
  let learningSteps = 0;

  switch (randomState) {
    case 0:
      break;
    case 1:
      dueDate = new Date(now.getTime() + Math.random() * 24 * 60 * 60 * 1000);
      scheduledDays = Math.floor(Math.random() * 2);
      learningSteps = Math.floor(Math.random() * 3) + 1;
      break;
    case 2:
      const daysAhead = Math.floor(randomStability * (1 + Math.random()));
      dueDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
      scheduledDays = daysAhead;
      elapsedDays = Math.floor(Math.random() * 30);
      break;
    case 3:
      dueDate = new Date(
        now.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000,
      );
      scheduledDays = Math.floor(Math.random() * 2);
      elapsedDays = Math.floor(Math.random() * 60);
      learningSteps = Math.floor(Math.random() * 2) + 1;
      break;
  }

  return {
    due: dueDate,
    stability: randomStability,
    difficulty: randomDifficulty,
    elapsed_days: elapsedDays,
    scheduled_days: scheduledDays,
    learning_steps: learningSteps,
    reps: randomReps,
    lapses: randomLapses,
    state: randomState,
    last_review:
      randomState > 0
        ? new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        : null,
  };
}

function createChaoticFSRSCardLogs(fsrsCardData: any) {
  const logs = [];
  const now = new Date();
  const numLogs = Math.floor(Math.random() * 10) + 1;

  for (let i = 0; i < numLogs; i++) {
    const reviewDate = new Date(
      now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    );
    const rating = Math.floor(Math.random() * 4) + 1;
    const state = Math.floor(Math.random() * 4);
    const logStability = Math.max(
      0,
      fsrsCardData.stability + (rating - 2) * 0.5,
    );
    const logDifficulty = Math.max(
      0.1,
      Math.min(0.9, fsrsCardData.difficulty + (rating - 2) * 0.1),
    );

    logs.push({
      review: reviewDate,
      rating,
      state,
      due: new Date(
        reviewDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000,
      ),
      stability: logStability,
      difficulty: logDifficulty,
      elapsed_days: Math.floor(Math.random() * 30),
      last_elapsed_days: Math.floor(Math.random() * 30),
      scheduled_days: Math.floor(Math.random() * 10),
      learning_steps: state === 1 ? Math.floor(Math.random() * 3) + 1 : 0,
    });
  }
  return logs;
}

function mdQuestionAnswer(question: string, answer: string) {
  return {
    question: `<p>${question}</p>`,
    answer: `<p>${answer}</p>`,
    plainQuestion: htmlToPlainText(question),
    plainAnswer: htmlToPlainText(answer),
  };
}

async function main() {
  await prisma.user.deleteMany();
  await prisma.deckCategory.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: hashedPassword,
      name: 'John Doe',
      isActivated: true,
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
      isActivated: true,
    },
  });

  const user1Categories = await Promise.all(
    ['Programming', 'Mathematics', 'Physics', 'Design', 'History'].map((name) =>
      prisma.deckCategory.create({
        data: {
          name,
          color: colorList[Math.floor(Math.random() * colorList.length)],
          icon: getRandomIcon(),
          userId: user1.id,
          fsrsWeights: { create: { w: Array(17).fill(1) } },
        },
      }),
    ),
  );

  const user2Categories = await Promise.all(
    ['Biology', 'Art', 'Travel', 'Literature', 'Music'].map((name) =>
      prisma.deckCategory.create({
        data: {
          name,
          color: colorList[Math.floor(Math.random() * colorList.length)],
          icon: getRandomIcon(),
          userId: user2.id,
          fsrsWeights: { create: { w: Array(17).fill(1) } },
        },
      }),
    ),
  );

  function makeCardContent(topic: string, idx: number) {
    return [
      mdQuestionAnswer(
        `Explain <strong>${topic}</strong> concept ${idx}`,
        `Here is the detailed answer with <em>italic</em>, <strong>bold</strong>, <code>code()</code>, and formula <span data-latex="mc^2" data-evaluate="no" data-display="yes" data-type="inlineMath">$$mc^2$$</span>.`,
      ),
      mdQuestionAnswer(
        `Show code for ${topic} ${idx}`,
        `<pre><code class="language-javascript">function test(){ return '${topic}'; }</code></pre>`,
      ),
      mdQuestionAnswer(
        `List facts about ${topic} ${idx}`,
        `<ul><li>Fact 1</li><li>Fact 2</li></ul>`,
      ),
      mdQuestionAnswer(
        `Quote about ${topic}`,
        `<blockquote>"Knowledge about ${topic} is power."</blockquote>`,
      ),
    ];
  }

  async function createDecks(
    userId: string,
    categories: any[],
    firstDeck7: boolean,
  ) {
    for (let i = 0; i < 10; i++) {
      const category = categories[i % categories.length];
      const numCards = firstDeck7 && i === 0 ? 7 : 3;
      const cards = makeCardContent(category.name, i).slice(0, numCards);

      await prisma.deck.create({
        data: {
          name: `${category.name} Deck ${i + 1}`,
          description: `A deck about ${category.name}`,
          userId,
          deckCategoryId: category.id,
          cardCount: numCards,
          deckSession: {
            create: {
              mastery: Math.floor(Math.random() * 100),
              totalTime: Math.floor(Math.random() * 10000),
            },
          },
          cards: {
            create: cards.map((c) => {
              const fsrs = createChaoticFSRSCardData();
              return {
                question: c.question,
                answer: c.answer,
                plainQuestion: c.plainQuestion,
                plainAnswer: c.plainAnswer,
                fsrsCard: {
                  create: {
                    ...fsrs,
                    logs: { create: createChaoticFSRSCardLogs(fsrs) },
                  },
                },
              };
            }),
          },
        },
      });
    }
  }

  await createDecks(user1.id, user1Categories, true);
  await createDecks(user2.id, user2Categories, false);
}

main().finally(() => prisma.$disconnect());
