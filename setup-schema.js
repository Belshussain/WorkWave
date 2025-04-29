require('dotenv').config();
const db = require('./db');

async function setupSchema() {
  const dropTablesSQL = `
    DROP TABLE IF EXISTS \`service_requests\`;
  `;
  const createUsersTableSQL = `
    CREATE TABLE \`users\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`first_name\` VARCHAR(255) NOT NULL,
      \`last_name\` VARCHAR(255) NOT NULL,
      \`email\` VARCHAR(255) NOT NULL UNIQUE,
      \`password\` VARCHAR(255) NOT NULL,
      \`is_admin\` TINYINT DEFAULT 0
    );
  `;
  const createServiceRequestsTableSQL = `
    CREATE TABLE \`service_requests\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`user_id\` INT NOT NULL,
      \`service_type\` VARCHAR(255) NOT NULL,
      \`service_image\` VARCHAR(255),
      \`location\` VARCHAR(255) NOT NULL,
      \`description\` VARCHAR(255) NOT NULL,
      \`status\` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    );
  `;

  try {
    await db.query(dropTablesSQL); // Drop the table first
    await db.query(createUsersTableSQL); // Create the users table
    await db.query(createServiceRequestsTableSQL); // Create the service_requests table
    console.log('Tables created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating tables:', err.message);
    process.exit(1);
  }
}

setupSchema();
