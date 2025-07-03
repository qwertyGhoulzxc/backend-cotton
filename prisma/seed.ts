import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // 1. CLEANUP
  await prisma.user.deleteMany();
  await prisma.deckCategory.deleteMany();
  console.log('Cleaned up existing data.');

  // 2. CREATE USERS
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
  console.log(`Created users: ${user1.email}, ${user2.email}`);

  // 3. CREATE CATEGORIES FOR USER 1
  const user1CategoryNames = [
    'Programming',
    'Design',
    'Language',
    'Education',
    'Science',
    'History',
  ];

  const user1Categories = [];
  for (const name of user1CategoryNames) {
    const category = await prisma.deckCategory.create({
      data: {
        name,
        user: {
          connect: { id: user1.id },
        },
      },
    });
    user1Categories.push(category);
  }
  const user1CategoryMap = new Map(user1Categories.map((c) => [c.name, c.id]));

  // CREATE CATEGORIES FOR USER 2
  const user2CategoryNames = [
    'Science',
    'History',
    'Literature',
    'Mathematics',
    'Programming',
    'Design',
  ];

  const user2Categories = [];
  for (const name of user2CategoryNames) {
    const category = await prisma.deckCategory.create({
      data: {
        name,
        user: {
          connect: { id: user2.id },
        },
      },
    });
    user2Categories.push(category);
  }
  const user2CategoryMap = new Map(user2Categories.map((c) => [c.name, c.id]));

  console.log('Created categories for both users.');

  // 4. DECK DATA FOR USER 1
  const user1DecksData = [
    {
      name: 'JavaScript Basics',
      description: 'Core concepts of JavaScript',
      categoryName: 'Programming',
      session: { mastery: 85, totalTime: 7200 },
      cards: [
        {
          question: 'What is a variable?',
          answer: 'A container for storing data.',
        },
        {
          question: 'Difference between let, const, and var?',
          answer: 'Scope and re-assignability.',
        },
        {
          question: 'What is a function?',
          answer: 'A reusable block of code.',
        },
      ],
    },
    {
      name: 'React Hooks',
      description: 'Understanding React hooks',
      categoryName: 'Programming',
      session: { mastery: 92, totalTime: 3600 },
      cards: [
        {
          question: 'What is useState?',
          answer: 'A hook to add state to functional components.',
        },
        { question: 'What is useEffect?', answer: 'A hook for side effects.' },
      ],
    },
    {
      name: 'TypeScript Fundamentals',
      description: 'Type safety and interfaces',
      categoryName: 'Programming',
      session: { mastery: 78, totalTime: 1800 },
      cards: [
        {
          question: 'What is an interface?',
          answer: 'A contract for the shape of an object.',
        },
        {
          question: 'What is a generic?',
          answer: 'Reusable components that work with a variety of types.',
        },
      ],
    },
    {
      name: 'CSS Grid & Flexbox',
      description: 'Modern CSS layout techniques',
      categoryName: 'Design',
      session: { mastery: 65, totalTime: 2700 },
      cards: [
        {
          question: 'What is Flexbox for?',
          answer: 'One-dimensional layouts (rows or columns).',
        },
        {
          question: 'What is Grid for?',
          answer: 'Two-dimensional layouts (rows and columns).',
        },
      ],
    },
    {
      name: 'Web Design Principles',
      description: 'Fundamental principles of good web design',
      categoryName: 'Design',
      session: { mastery: 58, totalTime: 900 },
      cards: [
        {
          question: 'What is visual hierarchy?',
          answer: 'Arrangement of elements to imply importance.',
        },
        {
          question: 'What is white space?',
          answer: 'The empty space between elements.',
        },
      ],
    },
    {
      name: 'Spanish Vocabulary',
      description: 'Essential Spanish words',
      categoryName: 'Language',
      session: { mastery: 45, totalTime: 1200 },
      cards: [
        { question: 'Hello', answer: 'Hola' },
        { question: 'Goodbye', answer: 'Adiós' },
        { question: 'Thank you', answer: 'Gracias' },
      ],
    },
    {
      name: 'French Basics',
      description: 'Basic French phrases and vocabulary',
      categoryName: 'Language',
      session: { mastery: 32, totalTime: 800 },
      cards: [
        { question: 'Hello', answer: 'Bonjour' },
        { question: 'Goodbye', answer: 'Au revoir' },
        { question: 'Thank you', answer: 'Merci' },
      ],
    },
    {
      name: 'Math Formulas',
      description: 'Essential algebra and calculus formulas',
      categoryName: 'Education',
      session: { mastery: 88, totalTime: 5000 },
      cards: [
        {
          question: 'Quadratic formula?',
          answer: 'x = [-b ± sqrt(b²-4ac)]/2a',
        },
        { question: 'Pythagorean theorem?', answer: 'a² + b² = c²' },
      ],
    },
    {
      name: 'Physics Concepts',
      description: 'Fundamental concepts in physics',
      categoryName: 'Education',
      session: { mastery: 75, totalTime: 4500 },
      cards: [
        { question: "Newton's Second Law?", answer: 'F = ma' },
        { question: "Einstein's mass-energy equivalence?", answer: 'E = mc²' },
      ],
    },
    {
      name: 'Chemistry Basics',
      description: 'Basic chemistry concepts and elements',
      categoryName: 'Science',
      session: { mastery: 68, totalTime: 3200 },
      cards: [
        { question: 'What is the chemical symbol for gold?', answer: 'Au' },
        { question: 'What is the chemical symbol for water?', answer: 'H₂O' },
      ],
    },
    {
      name: 'Biology Fundamentals',
      description: 'Basic biology concepts',
      categoryName: 'Science',
      session: { mastery: 72, totalTime: 2800 },
      cards: [
        {
          question: 'What is the powerhouse of the cell?',
          answer: 'Mitochondria',
        },
        {
          question: 'What is DNA?',
          answer: 'Deoxyribonucleic acid - genetic material',
        },
      ],
    },
    {
      name: 'Ancient Civilizations',
      description: 'History of ancient civilizations',
      categoryName: 'History',
      session: { mastery: 55, totalTime: 1500 },
      cards: [
        {
          question: 'Which civilization built the pyramids?',
          answer: 'Ancient Egyptians',
        },
        {
          question: 'Which empire was ruled by Julius Caesar?',
          answer: 'Roman Empire',
        },
      ],
    },
    {
      name: 'World Wars',
      description: 'Key events of World War I and II',
      categoryName: 'History',
      session: { mastery: 48, totalTime: 2200 },
      cards: [
        { question: 'When did World War I start?', answer: '1914' },
        { question: 'When did World War II end?', answer: '1945' },
      ],
    },
  ];

  // DECK DATA FOR USER 2
  const user2DecksData = [
    {
      name: 'Physics Fundamentals',
      description: 'Basic physics concepts and formulas',
      categoryName: 'Science',
      session: { mastery: 78, totalTime: 5400 },
      cards: [
        { question: "Newton's Second Law?", answer: 'F = ma' },
        { question: "Einstein's mass-energy equivalence?", answer: 'E = mc²' },
        {
          question: 'What is gravity?',
          answer: 'A force that attracts objects toward each other.',
        },
      ],
    },
    {
      name: 'Chemistry Elements',
      description: 'Periodic table and chemical elements',
      categoryName: 'Science',
      session: { mastery: 65, totalTime: 3800 },
      cards: [
        { question: 'What is the atomic number of hydrogen?', answer: '1' },
        { question: 'What is the chemical symbol for oxygen?', answer: 'O' },
        {
          question: 'What is the most abundant element in the universe?',
          answer: 'Hydrogen',
        },
      ],
    },
    {
      name: 'World History',
      description: 'Key events in world history',
      categoryName: 'History',
      session: { mastery: 62, totalTime: 3600 },
      cards: [
        { question: 'When did World War II end?', answer: '1945' },
        {
          question: 'Who was the first President of the United States?',
          answer: 'George Washington',
        },
        {
          question: 'What year did Columbus discover America?',
          answer: '1492',
        },
      ],
    },
    {
      name: 'Ancient Rome',
      description: 'History of the Roman Empire',
      categoryName: 'History',
      session: { mastery: 58, totalTime: 2400 },
      cards: [
        { question: 'Who was the first Roman Emperor?', answer: 'Augustus' },
        { question: 'What year did the Roman Empire fall?', answer: '476 AD' },
        {
          question: 'What was the capital of the Roman Empire?',
          answer: 'Rome',
        },
      ],
    },
    {
      name: 'Shakespeare Quotes',
      description: 'Famous quotes from Shakespeare plays',
      categoryName: 'Literature',
      session: { mastery: 88, totalTime: 1800 },
      cards: [
        {
          question: '"To be or not to be" is from which play?',
          answer: 'Hamlet',
        },
        {
          question: '"Romeo, Romeo, wherefore art thou Romeo?" is from?',
          answer: 'Romeo and Juliet',
        },
        {
          question: '"All the world\'s a stage" is from?',
          answer: 'As You Like It',
        },
      ],
    },
    {
      name: 'Classic Novels',
      description: 'Famous novels and their authors',
      categoryName: 'Literature',
      session: { mastery: 75, totalTime: 2100 },
      cards: [
        { question: 'Who wrote "Pride and Prejudice"?', answer: 'Jane Austen' },
        { question: 'Who wrote "1984"?', answer: 'George Orwell' },
        {
          question: 'Who wrote "The Great Gatsby"?',
          answer: 'F. Scott Fitzgerald',
        },
      ],
    },
    {
      name: 'Calculus Basics',
      description: 'Fundamental calculus concepts',
      categoryName: 'Mathematics',
      session: { mastery: 71, totalTime: 4200 },
      cards: [
        {
          question: 'What is a derivative?',
          answer: 'The rate of change of a function.',
        },
        { question: 'What is an integral?', answer: 'The area under a curve.' },
        {
          question: 'What is the power rule for derivatives?',
          answer: 'd/dx(x^n) = nx^(n-1)',
        },
      ],
    },
    {
      name: 'Linear Algebra',
      description: 'Matrices and vectors',
      categoryName: 'Mathematics',
      session: { mastery: 68, totalTime: 3500 },
      cards: [
        {
          question: 'What is a matrix?',
          answer: 'A rectangular array of numbers.',
        },
        {
          question: 'What is a determinant?',
          answer: 'A scalar value that can be computed from a square matrix.',
        },
        {
          question: 'What is a vector?',
          answer: 'A quantity with both magnitude and direction.',
        },
      ],
    },
    {
      name: 'Python Programming',
      description: 'Python programming fundamentals',
      categoryName: 'Programming',
      session: { mastery: 82, totalTime: 4800 },
      cards: [
        {
          question: 'What is a list in Python?',
          answer: 'An ordered collection of items.',
        },
        {
          question: 'What is a dictionary in Python?',
          answer: 'A collection of key-value pairs.',
        },
        { question: 'What is the Python equivalent of null?', answer: 'None' },
      ],
    },
    {
      name: 'Data Structures',
      description: 'Common data structures and algorithms',
      categoryName: 'Programming',
      session: { mastery: 79, totalTime: 5200 },
      cards: [
        {
          question: 'What is a stack?',
          answer: 'A LIFO (Last In, First Out) data structure.',
        },
        {
          question: 'What is a queue?',
          answer: 'A FIFO (First In, First Out) data structure.',
        },
        {
          question: 'What is a binary tree?',
          answer: 'A tree data structure with at most two children per node.',
        },
      ],
    },
    {
      name: 'UI/UX Design',
      description: 'User interface and user experience design principles',
      categoryName: 'Design',
      session: { mastery: 73, totalTime: 3100 },
      cards: [
        {
          question: 'What is UX design?',
          answer: 'User Experience design focuses on user satisfaction.',
        },
        {
          question: 'What is UI design?',
          answer: 'User Interface design focuses on visual elements.',
        },
        {
          question: 'What is wireframing?',
          answer: 'Creating a basic layout of a design.',
        },
      ],
    },
    {
      name: 'Color Theory',
      description: 'Principles of color in design',
      categoryName: 'Design',
      session: { mastery: 66, totalTime: 1800 },
      cards: [
        {
          question: 'What are primary colors?',
          answer: 'Red, blue, and yellow.',
        },
        {
          question: 'What is complementary color?',
          answer: 'Colors opposite on the color wheel.',
        },
        { question: 'What is RGB?', answer: 'Red, Green, Blue color model.' },
      ],
    },
  ];

  // 5. CREATE DECKS FOR USER 1
  for (const deckData of user1DecksData) {
    const categoryId = user1CategoryMap.get(deckData.categoryName);
    if (!categoryId) {
      console.warn(
        `Category "${deckData.categoryName}" not found for user 1. Skipping deck "${deckData.name}".`,
      );
      continue;
    }

    await prisma.deck.create({
      data: {
        name: deckData.name,
        description: deckData.description,
        user: {
          connect: { id: user1.id },
        },
        deckCategory: {
          connect: { id: categoryId },
        },
        cardCount: deckData.cards.length,
        cards: {
          create: deckData.cards,
        },
        deckSession: {
          create: deckData.session,
        },
      },
    });
  }

  // CREATE DECKS FOR USER 2
  for (const deckData of user2DecksData) {
    const categoryId = user2CategoryMap.get(deckData.categoryName);
    if (!categoryId) {
      console.warn(
        `Category "${deckData.categoryName}" not found for user 2. Skipping deck "${deckData.name}".`,
      );
      continue;
    }

    await prisma.deck.create({
      data: {
        name: deckData.name,
        description: deckData.description,
        user: {
          connect: { id: user2.id },
        },
        deckCategory: {
          connect: { id: categoryId },
        },
        cardCount: deckData.cards.length,
        cards: {
          create: deckData.cards,
        },
        deckSession: {
          create: deckData.session,
        },
      },
    });
  }

  console.log('Created decks with cards and sessions for both users.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seeding finished.');
  });
