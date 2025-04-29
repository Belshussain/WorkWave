require('dotenv').config();
const db = require('./db');

async function setupSchema() {
  const sql = `
    -- Drop existing tables (in correct order due to FK constraints)
    DROP TABLE IF EXISTS service_requests;
    DROP TABLE IF EXISTS users;

    -- Create users table
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      is_admin TINYINT DEFAULT 0
    );

    -- Create service_requests table
    CREATE TABLE service_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      service_type VARCHAR(255) NOT NULL,
      service_image VARCHAR(255) DEFAULT NULL,
      location VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Insert users
    INSERT INTO users (first_name, last_name, email, password, is_admin) VALUES
      ('John', 'Doe', 'johndoe@example.com', '$2b$10$PTjnFXx4e0ZjODePnrvyperH/xYZzgivGmjo7teH77mZI5AlU68Gu', 0),
      ('John', 'Doe', 'john.doe@example.com', '$2b$10$6E7RAkJEuwPpzayr4jb/w.fyEuYHHrU3e5mJj58rISIwBUXRJ3ylq', 0),
      ('Zubair', 'Hussain', 'zubairhussain599@gmail.com', '$2b$10$qyX/vzZH65cpMklpimqGYOdbXY2h9dP5u/tfQgw9CWcNDDTTGYhXi', 0),
      ('Thabo', 'Mfo', 'mfo@gmail.com', '$2b$10$pqfH73OA7ToWZI99P5YWVeMMb3g0yqgJMZXY0mz5/zufawRJJR1Ju', 0),
      ('Shan', 'de Bruin', 'shandredebruin@gmail.com', '$2b$10$/N1g2cqGxZthexSlLp5lRu5mAt2ysZT/4QpNe0dvkzaWMqAYDNXdS', 0),
      ('john', 'john', 'john@gmail.com', '$2b$10$daVfSzPjjlb9GjSHLth/zO3wqQihU7EsgFUX3rjNW00jjW2.N3oJu', 0),
      ('Zubair', 'Hussain', 'zubairhussain@example.com', '$2a$12$XpTCMBpWjaM1woc1i/otuOb1dxI952V2Yi9GYQWZyfyAsgrtW6qOu', 1),
      ('Thabo', 'Mofokeng', 'Thabo@example.com', '$2a$12$XpTCMBpWjaM1woc1i/otuOb1dxI952V2Yi9GYQWZyfyAsgrtW6qOu', 1),
      ('bailey', 'Hussain', 'baileyhussain1102@gmail.com', '$2b$10$t3in3aEqLZ4k.yK4Y9lWBe8V4IZ3O1g5Wd5wWS8G11ac41bB2HfUm', 0),
      ('Mat', 'Brown', 'Brown@gmail.com', '$2b$10$iWJcb01gnEGwtdVPmSlgZOk8wGJ4ayMSqgWNiWinacdGO8/qzjjfe', 0),
      ('Annie', 'Hunter', 'Hunter@gmail.com', '$2b$10$E1uPO4XpbLTWwkosxyUr3OhxlXnfPzEsG8Hdh.KAP2lJPgFDov0XG', 0),
      ('Alex', 'Green', 'alex@gmail.com', '$2b$10$ktEybddax1lV6POyVmHfIelvcTSTVQHc6EhnEpLmD7pgExepjN5n6', 0),
      ('Jason', 'Todd', 'tod@gmail.com', '$2b$10$JP6PHOsaTrosX9HuT/GBOeGoUD2/qg3slqFLt8kf/LFCfFtw3OlpG', 0);

    -- Insert service requests
    INSERT INTO service_requests (user_id, service_type, service_image, location, description, status) VALUES
      (15, 'Online tutoring', '/uploads/online-tutoring.jpg', 'Johannesburg', 'Tutor maths and physics', 'approved'),
      (15, 'Portrait paintings', '/uploads/1742310960593.jpg', 'Durban', 'all sizes paintings', 'approved'),
      (16, 'Outdoor fitness', '/uploads/1742311191474.jpg', 'Cape Town', 'Help ladies get into shape for summer', 'approved'),
      (1, 'Electricians', '/uploads/1742311545669.jpg', 'Johannesburg', 'General electrical repairs', 'approved'),
      (5, 'Locally made food service', '/uploads/1742393778144.jpg', 'Durban', 'All types of dishes.', 'pending'),
      (18, 'Outdoor fitness', '/uploads/1745783224825.jpg', 'Johannesburg', 'Will help you reach any fitness goals in a fun way!', 'approved');
  `;

  try {
    await db.query(sql);
    console.log('Tables created and data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating schema and inserting data:', err.message);
    process.exit(1);
  }
}

setupSchema();
