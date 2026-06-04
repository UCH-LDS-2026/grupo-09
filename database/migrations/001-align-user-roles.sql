USE softwareestres;

ALTER TABLE users
  MODIFY role ENUM('admin', 'architect', 'viewer') NOT NULL DEFAULT 'architect';
