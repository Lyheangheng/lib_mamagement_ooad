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
  const b1 = await runQuery(
    `INSERT INTO books (isbn, title, author, publisher, publication_year, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
    ['978-0134494166', 'Clean Architecture', 'Robert C. Martin', 'Prentice Hall', 2017, 3]
  );
  const bc1_1 = await runQuery(`INSERT INTO book_copies (copy_id, book_id, status) VALUES (?, ?, ?)`, ['BC-1001-01', b1.lastID, 'AVAILABLE']);
  const bc1_2 = await runQuery(`INSERT INTO book_copies (copy_id, book_id, status) VALUES (?, ?, ?)`, ['BC-1001-02', b1.lastID, 'BORROWED']);
  await runQuery(`INSERT INTO book_copies (copy_id, book_id, status) VALUES (?, ?, ?)`, ['BC-1001-03', b1.lastID, 'AVAILABLE']);

  const b2 = await runQuery(
    `INSERT INTO books (isbn, title, author, publisher, publication_year, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
    ['978-0262033848', 'Introduction to Algorithms', 'Thomas H. Cormen', 'MIT Press', 2009, 2]
  );
  const bc2_1 = await runQuery(`INSERT INTO book_copies (copy_id, book_id, status) VALUES (?, ?, ?)`, ['BC-1002-01', b2.lastID, 'BORROWED']);
  await runQuery(`INSERT INTO book_copies (copy_id, book_id, status) VALUES (?, ?, ?)`, ['BC-1002-02', b2.lastID, 'AVAILABLE']);

  const b3 = await runQuery(
    `INSERT INTO books (isbn, title, author, publisher, publication_year, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
    ['978-0201633610', 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma et al.', 'Addison-Wesley', 1994, 2]
  );
  await runQuery(`INSERT INTO book_copies (copy_id, book_id, status) VALUES (?, ?, ?)`, ['BC-1003-01', b3.lastID, 'AVAILABLE']);
  await runQuery(`INSERT INTO book_copies (copy_id, book_id, status) VALUES (?, ?, ?)`, ['BC-1003-02', b3.lastID, 'LOST']);

  const b4 = await runQuery(
    `INSERT INTO books (isbn, title, author, publisher, publication_year, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
    ['978-0133970777', 'Database System Concepts', 'Abraham Silberschatz', 'McGraw-Hill', 2019, 1]
  );
  const bc4_1 = await runQuery(`INSERT INTO book_copies (copy_id, book_id, status) VALUES (?, ?, ?)`, ['BC-1004-01', b4.lastID, 'BORROWED']);

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
