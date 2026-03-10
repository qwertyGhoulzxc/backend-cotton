import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { hashSync } from 'bcrypt';
import { Cache } from 'cache-manager';

@Injectable()
export class DemoDataService {
  private readonly logger = new Logger(DemoDataService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async resetDemoUser() {
    this.logger.log('Starting demo user setup...');
    const email = 'test@lateowl.app';
    const username = 'demo_user';

    // 1. Delete existing demo user if exists
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      await this.prisma.user.delete({ where: { id: existing.id } });
      this.logger.log('Deleted existing demo user.');

      // Clear cache to prevent stale UUID lookups during login
      await this.cacheManager.del(existing.id);
      await this.cacheManager.del(email);
      await this.cacheManager.del(username);
    }

    // 2. Create User & Profile
    const user = await this.prisma.user.create({
      data: {
        email,
        username: 'demo_user',
        password: hashSync('TestPassword123!', 10),
        isActivated: true,
        profile: {
          create: {
            firstName: 'LateOwl',
            lastName: 'Demo',
          },
        },
      },
    });

    // 3. Create Default Category
    const category = await this.prisma.deckCategory.create({
      data: {
        name: 'Demo Decks',
        userId: user.id,
        icon: 'sparkles',
        color: 'indigo',
        fsrsWeights: {
          create: {},
        },
      },
    });

    // 4. Create Decks
    const decksData = [
      {
        name: 'JavaScript Basics',
        description: 'Core concepts of modern JavaScript.',
        cards: [
          {
            q: 'What is a closure?',
            a: 'A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment).',
          },
          {
            q: 'What does `Promise.all()` do?',
            a: 'It takes an iterable of promises and returns a single Promise that resolves when all of the promises resolve, or rejects with the reason of the first promise that rejects.',
          },
          {
            q: 'Difference between `==` and `===`?',
            a: '`==` performs type coercion before comparison, while `===` does not (strict equality).',
          },
          {
            q: 'What is the Event Loop?',
            a: 'A mechanism that allows Node.js/browser to perform non-blocking I/O operations by offloading operations to the system kernel whenever possible.',
          },
          {
            q: 'Explain `this` keyword.',
            a: '`this` refers to the object that is executing the current function. It depends on how the function is called.',
          },
          {
            q: 'What is hoisting?',
            a: "JavaScript's default behavior of moving declarations to the top of the current scope before code execution.",
          },
          {
            q: 'How do you create a simple Promise?',
            a: 'Use the `new Promise` constructor which takes a resolver function.<br/><br/><pre><code class="language-javascript">const myPromise = new Promise((resolve, reject) => {\n  setTimeout(() => {\n    resolve("Success!");\n  }, 1000);\n});</code></pre>',
          },
          {
            q: 'Show an example of array destructuring.',
            a: 'It allows extracting multiple values from data stored in objects or arrays.<br/><br/><pre><code class="language-javascript">const rgb = [255, 200, 0];\nconst [red, green, blue] = rgb;\nconsole.log(red); // 255</code></pre>',
          },
          {
            q: 'Write a basic async function that fetches data.',
            a: 'Use the `async/await` syntax.<br/><br/><pre><code class="language-javascript">async function getUser() {\n  try {\n    const response = await fetch("/api/user");\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Fetch failed", error);\n  }\n}</code></pre>',
          },
        ],
      },
      {
        name: 'English C1 Vocabulary',
        description: 'Advanced English words for professional proficiency.',
        cards: [
          {
            q: 'Obfuscate (verb)',
            a: 'To make something less clear and harder to understand, especially intentionally.',
          },
          {
            q: 'Ubiquitous (adjective)',
            a: 'Present, appearing, or found everywhere.',
          },
          { q: 'Ephemeral (adjective)', a: 'Lasting for a very short time.' },
          {
            q: 'Sycophant (noun)',
            a: 'A person who acts obsequiously toward someone important in order to gain advantage.',
          },
          { q: 'Mitigate (verb)', a: 'Make less severe, serious, or painful.' },
          {
            q: 'Paradigm (noun)',
            a: 'A typical example or pattern of something; a model.',
          },
        ],
      },
      {
        name: 'Math Concepts',
        description: 'Essential formulas and mathematical theorems.',
        cards: [
          {
            q: 'Pythagorean Theorem',
            a: '<span data-type="inlineMath" data-latex="a^2 + b^2 = c^2">a^2 + b^2 = c^2</span><br/><br/>Applies to right-angled triangles.',
          },
          {
            q: 'Quadratic Formula',
            a: '<span data-type="inlineMath" data-latex="x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}">x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}</span>',
          },
          {
            q: "Euler's Identity",
            a: '<span data-type="inlineMath" data-latex="e^{i\\pi} + 1 = 0">e^{i\\pi} + 1 = 0</span>',
          },
          {
            q: 'Derivative of x^n (Power Rule)',
            a: '<span data-type="inlineMath" data-latex="nx^{n-1}">nx^{n-1}</span>',
          },
          {
            q: 'Area of a Circle',
            a: '<span data-type="inlineMath" data-latex="A = \\pi r^2">A = \\pi r^2</span>',
          },
        ],
      },
    ];

    for (const [index, deckInfo] of decksData.entries()) {
      const deck = await this.prisma.deck.create({
        data: {
          name: deckInfo.name,
          description: deckInfo.description,
          userId: user.id,
          deckCategoryId: category.id,
          cardCount: deckInfo.cards.length,
          deckSession: {
            create: {
              mastery: 25 + index * 20, // Fake mastery 25%, 45%, 65%
              totalTime: 1200 + index * 500,
              masteredCardsCount: Math.floor(deckInfo.cards.length / 2),
            },
          },
        },
      });

      // Insert Cards
      for (const cardData of deckInfo.cards) {
        const qHtml = `<p>${cardData.q}</p>`;
        const aHtml = `<p>${cardData.a}</p>`;
        const plainQ = cardData.q;
        const plainA = cardData.a.replace(/<[^>]*>?/gm, ''); // rough strip HTML

        const card = await this.prisma.card.create({
          data: {
            question: qHtml,
            answer: aHtml,
            plainQuestion: plainQ,
            plainAnswer: plainA,
            deckId: deck.id,
          },
        });

        // Generate fake FSRS data
        const r = Math.random();
        const difficulty = 5 - r * 3;
        const stability = 1 + r * 10;
        const due = new Date();
        due.setDate(due.getDate() + (r > 0.5 ? 1 : -1) * Math.floor(r * 5)); // past or future

        const elapsed_days = 2 + Math.floor(r * 5);
        const scheduled_days = Math.floor(stability);

        await this.prisma.fSRSCard.create({
          data: {
            cardId: card.id,
            due,
            stability,
            difficulty,
            elapsed_days,
            scheduled_days,
            reps: 1 + Math.floor(r * 3),
            lapses: r > 0.8 ? 1 : 0,
            state: r > 0.3 ? 2 : 1, // 2 = review, 1 = learning
            learning_steps: 0,
            last_review: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * elapsed_days,
            ),
          },
        });
      }
    }

    this.logger.log(
      'Demo user successfully recreated and populated with fake data.',
    );
  }
}
