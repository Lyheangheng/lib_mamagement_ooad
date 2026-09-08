import { db, initSchema, runQuery } from './db.js';

export const seedDatabase = async () => {
  console.log('[Seed] Initializing database schema...');
  await initSchema();

  console.log('[Seed] Clearing existing data...');
  await runQuery('PRAGMA foreign_keys = OFF');
  await runQuery('DELETE FROM fine_payments');
  await runQuery('DELETE FROM fines');
  await runQuery('DELETE FROM borrowings');
  await runQuery('DELETE FROM book_copies');
  await runQuery('DELETE FROM books');
  await runQuery('DELETE FROM librarians');
  await runQuery('DELETE FROM members');
  await runQuery('DELETE FROM users');
  await runQuery('DELETE FROM accounts');
  await runQuery('PRAGMA foreign_keys = ON');

  console.log('[Seed] Populating Accounts & Users...');
  const acc1 = await runQuery(
    `INSERT INTO accounts (username, password_hash, role) VALUES (?, ?, ?)`,
    ['librarian_anan', 'pbkdf2_hash_placeholder_123', 'LIBRARIAN']
  );
  const user1 = await runQuery(
    `INSERT INTO users (account_id, name, email, phone) VALUES (?, ?, ?, ?)`,
    [acc1.lastID, 'Anan Wongsuwan', 'anan.w@libdemo.edu', '081-234-5678']
  );
  const lib1 = await runQuery(
    `INSERT INTO librarians (user_id, employee_id) VALUES (?, ?)`,
    [user1.lastID, 'EMP-9001']
  );

  const acc2 = await runQuery(
    `INSERT INTO accounts (username, password_hash, role) VALUES (?, ?, ?)`,
    ['somchai_j', 'pbkdf2_hash_placeholder_456', 'MEMBER']
  );
  const user2 = await runQuery(
    `INSERT INTO users (account_id, name, email, phone) VALUES (?, ?, ?, ?)`,
    [acc2.lastID, 'Somchai Jaidee', 'somchai.j@student.edu', '089-876-5432']
  );
  const member1 = await runQuery(
    `INSERT INTO members (user_id, student_id, faculty, major, status) VALUES (?, ?, ?, ?, ?)`,
    [user2.lastID, '6712732101', 'Engineering', 'Computer Engineering', 'ACTIVE']
  );

  const acc3 = await runQuery(
    `INSERT INTO accounts (username, password_hash, role) VALUES (?, ?, ?)`,
    ['somsri_s', 'pbkdf2_hash_placeholder_789', 'MEMBER']
  );
  const user3 = await runQuery(
    `INSERT INTO users (account_id, name, email, phone) VALUES (?, ?, ?, ?)`,
    [acc3.lastID, 'Somsri Sookjai', 'somsri.s@student.edu', '082-111-2233']
  );
  const member2 = await runQuery(
    `INSERT INTO members (user_id, student_id, faculty, major, status) VALUES (?, ?, ?, ?, ?)`,
    [user3.lastID, '6712732102', 'Science', 'Information Technology', 'ACTIVE']
  );

  console.log('[Seed] Populating Books & BookCopies...');
  
  const sampleBooks = [
    {
      isbn: '978-0134494166',
      title: 'Clean Architecture: A Craftsman\'s Guide to Software Structure and Design',
      author: 'Robert C. Martin',
      publisher: 'Prentice Hall',
      publicationYear: 2017,
      quantity: 3,
      coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80',
      description: 'Practical software architecture rules and principles for building maintainable, decoupled systems.',
      copies: [
        { copyId: 'BC-1001-01', status: 'AVAILABLE' },
        { copyId: 'BC-1001-02', status: 'BORROWED' },
        { copyId: 'BC-1001-03', status: 'AVAILABLE' },
      ],
    },
    {
      isbn: '978-0262033848',
      title: 'Introduction to Algorithms (4th Edition)',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
      publisher: 'MIT Press',
      publicationYear: 2022,
      quantity: 3,
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
      description: 'The authoritative comprehensive textbook covering computer algorithm design, analysis, dynamic programming, and graph algorithms.',
      copies: [
        { copyId: 'BC-1002-01', status: 'BORROWED' },
        { copyId: 'BC-1002-02', status: 'AVAILABLE' },
        { copyId: 'BC-1002-03', status: 'AVAILABLE' },
      ],
    },
    {
      isbn: '978-0201633610',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      publisher: 'Addison-Wesley',
      publicationYear: 1994,
      quantity: 2,
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
      description: 'The classic Gang of Four reference cataloging 23 fundamental object-oriented design patterns.',
      copies: [
        { copyId: 'BC-1003-01', status: 'AVAILABLE' },
        { copyId: 'BC-1003-02', status: 'LOST' },
      ],
    },
    {
      isbn: '978-0133970777',
      title: 'Database System Concepts (7th Edition)',
      author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
      publisher: 'McGraw-Hill',
      publicationYear: 2019,
      quantity: 2,
      coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80',
      description: 'Comprehensive introduction to relational databases, SQL syntax, transactions, indexing, and distributed databases.',
      copies: [
        { copyId: 'BC-1004-01', status: 'BORROWED' },
        { copyId: 'BC-1004-02', status: 'AVAILABLE' },
      ],
    },
    {
      isbn: '978-0132350884',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      publisher: 'Prentice Hall',
      publicationYear: 2008,
      quantity: 3,
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
      description: 'Best practices for writing readable, refactored, unit-tested, and clean software code.',
      copies: [
        { copyId: 'BC-1005-01', status: 'AVAILABLE' },
        { copyId: 'BC-1005-02', status: 'AVAILABLE' },
        { copyId: 'BC-1005-03', status: 'AVAILABLE' },
      ],
    },
    {
      isbn: '978-0134685991',
      title: 'Effective Java (3rd Edition)',
      author: 'Joshua Bloch',
      publisher: 'Addison-Wesley',
      publicationYear: 2018,
      quantity: 2,
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
      description: 'Essential programming guidelines and best practices for the Java programming language.',
      copies: [
        { copyId: 'BC-1006-01', status: 'AVAILABLE' },
        { copyId: 'BC-1006-02', status: 'AVAILABLE' },
      ],
    },
    {
      isbn: '978-0596007126',
      title: 'Head First Design Patterns',
      author: 'Eric Freeman, Elisabeth Robson',
      publisher: 'O\'Reilly Media',
      publicationYear: 2004,
      quantity: 2,
      coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80',
      description: 'Visually rich, brain-friendly guide to object-oriented computer programming design principles.',
      copies: [
        { copyId: 'BC-1007-01', status: 'AVAILABLE' },
        { copyId: 'BC-1007-02', status: 'AVAILABLE' },
      ],
    },
    {
      isbn: '978-0321127426',
      title: 'Domain-Driven Design: Tackling Complexity in Software',
      author: 'Eric Evans',
      publisher: 'Addison-Wesley',
      publicationYear: 2003,
      quantity: 2,
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80',
      description: 'Systematic guide to modeling complex software domains, bounded contexts, aggregates, and domain events.',
      copies: [
        { copyId: 'BC-1008-01', status: 'AVAILABLE' },
        { copyId: 'BC-1008-02', status: 'AVAILABLE' },
      ],
    },
    {
      isbn: '978-1491950357',
      title: 'Building Microservices: Designing Fine-Grained Systems',
      author: 'Sam Newman',
      publisher: 'O\'Reilly Media',
      publicationYear: 2021,
      quantity: 2,
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
      description: 'Architectural concepts for breaking monolithic web applications into resilient microservices.',
      copies: [
        { copyId: 'BC-1009-01', status: 'AVAILABLE' },
        { copyId: 'BC-1009-02', status: 'AVAILABLE' },
      ],
    },
    {
      isbn: '978-0135957059',
      title: 'The Pragmatic Programmer: Your Journey to Mastery',
      author: 'David Thomas, Andrew Hunt',
      publisher: 'Addison-Wesley',
      publicationYear: 2019,
      quantity: 2,
      coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80',
      description: 'Timeless career insights, coding tips, and engineering principles for professional software developers.',
      copies: [
        { copyId: 'BC-1010-01', status: 'AVAILABLE' },
        { copyId: 'BC-1010-02', status: 'AVAILABLE' },
      ],
    },
    {
      isbn: '978-1449331818',
      title: 'Learning React: Modern Patterns for Developing React Apps',
      author: 'Alex Banks, Eve Porcello',
      publisher: 'O\'Reilly Media',
      publicationYear: 2020,
      quantity: 2,
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80',
      description: 'Comprehensive guide to functional React, hooks, state management, and modern component architecture.',
      copies: [
        { copyId: 'BC-1011-01', status: 'AVAILABLE' },
        { copyId: 'BC-1011-02', status: 'AVAILABLE' },
      ],
    },
    {
      isbn: '978-0596517748',
      title: 'JavaScript: The Good Parts',
      author: 'Douglas Crockford',
      publisher: 'O\'Reilly Media',
      publicationYear: 2008,
      quantity: 2,
      coverImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&q=80',
      description: 'Classic exploration of JavaScript language features, object prototypes, functions, and closures.',
      copies: [
        { copyId: 'BC-1012-01', status: 'AVAILABLE' },
        { copyId: 'BC-1012-02', status: 'AVAILABLE' },
      ],
    },
  ];

  let bc1_1: any, bc1_2: any, bc2_1: any, bc4_1: any;

  for (let i = 0; i < sampleBooks.length; i++) {
    const sb = sampleBooks[i];
    const bRes = await runQuery(
      `INSERT INTO books (isbn, title, author, publisher, publication_year, quantity, cover_image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sb.isbn, sb.title, sb.author, sb.publisher, sb.publicationYear, sb.quantity, sb.coverImage, sb.description]
    );

    for (let cIdx = 0; cIdx < sb.copies.length; cIdx++) {
      const copyData = sb.copies[cIdx];
      const cRes = await runQuery(
        `INSERT INTO book_copies (copy_id, book_id, status) VALUES (?, ?, ?)`,
        [copyData.copyId, bRes.lastID, copyData.status]
      );
      if (i === 0 && cIdx === 0) bc1_1 = cRes;
      if (i === 0 && cIdx === 1) bc1_2 = cRes;
      if (i === 1 && cIdx === 0) bc2_1 = cRes;
      if (i === 3 && cIdx === 0) bc4_1 = cRes;
    }
  }

  console.log('[Seed] Populating Borrowings, Fines & FinePayments...');
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

  await runQuery(
    `INSERT INTO borrowings (borrowing_id, member_id, book_copy_id, borrow_date, due_date, return_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['BRW-2026-001', member1.lastID, bc1_1.lastID, daysAgo(20), daysAgo(13), daysAgo(15), 'RETURNED']
  );

  await runQuery(
    `INSERT INTO borrowings (borrowing_id, member_id, book_copy_id, borrow_date, due_date, return_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['BRW-2026-002', member1.lastID, bc1_2.lastID, daysAgo(3), daysAgo(-4), null, 'ACTIVE']
  );

  const brw3 = await runQuery(
    `INSERT INTO borrowings (borrowing_id, member_id, book_copy_id, borrow_date, due_date, return_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['BRW-2026-003', member2.lastID, bc2_1.lastID, daysAgo(11), daysAgo(4), null, 'OVERDUE']
  );
  await runQuery(
    `INSERT INTO fines (fine_id, borrowing_id, member_id, overdue_days, amount, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['FINE-2026-001', brw3.lastID, member2.lastID, 4, 40.0, 'UNPAID']
  );

  const brw4 = await runQuery(
    `INSERT INTO borrowings (borrowing_id, member_id, book_copy_id, borrow_date, due_date, return_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['BRW-2026-004', member2.lastID, bc4_1.lastID, daysAgo(30), daysAgo(23), daysAgo(20), 'RETURNED']
  );
  const fine2 = await runQuery(
    `INSERT INTO fines (fine_id, borrowing_id, member_id, overdue_days, amount, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['FINE-2026-002', brw4.lastID, member2.lastID, 3, 30.0, 'PAID']
  );
  await runQuery(
    `INSERT INTO fine_payments (payment_id, fine_id, payment_date, amount, librarian_id)
     VALUES (?, ?, ?, ?, ?)`,
    ['PAY-2026-001', fine2.lastID, daysAgo(20), 30.0, lib1.lastID]
  );

  console.log('[Seed] Database seeding completed successfully.');
};

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Script finished.');
      db.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error] Failed to seed database:', err);
      db.close();
      process.exit(1);
    });
}
