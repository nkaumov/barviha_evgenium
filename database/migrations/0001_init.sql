CREATE TABLE IF NOT EXISTS houses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  village_name VARCHAR(255) NOT NULL,
  price BIGINT UNSIGNED NOT NULL,
  area_house INT UNSIGNED NOT NULL,
  distance_mkad INT UNSIGNED NOT NULL,
  floors TINYINT UNSIGNED NOT NULL,
  plot_area DECIMAL(8,2) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  short_description TEXT NULL,
  full_description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_houses_slug (slug),
  KEY idx_houses_active (is_active),
  KEY idx_houses_price (price),
  KEY idx_houses_distance (distance_mkad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inquiries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  house_id BIGINT UNSIGNED NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  telegram VARCHAR(120) NULL,
  whatsapp VARCHAR(40) NULL,
  message TEXT NULL,
  source_page VARCHAR(255) NULL,
  status ENUM('new','in_progress','closed','spam') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inquiries_status (status),
  KEY idx_inquiries_created (created_at),
  KEY idx_inquiries_house (house_id),
  CONSTRAINT fk_inquiries_house
    FOREIGN KEY (house_id) REFERENCES houses(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
