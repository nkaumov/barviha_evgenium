CREATE TABLE IF NOT EXISTS articles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  excerpt TEXT NULL,
  content LONGTEXT NULL,
  image_path VARCHAR(500) NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  published_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_articles_slug (slug),
  KEY idx_articles_published (is_published, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS galleries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  cover_image_path VARCHAR(500) NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_galleries_slug (slug),
  KEY idx_galleries_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gallery_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  gallery_id BIGINT UNSIGNED NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  caption VARCHAR(255) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_gallery_images_gallery_sort (gallery_id, sort_order),
  CONSTRAINT fk_gallery_images_gallery
    FOREIGN KEY (gallery_id) REFERENCES galleries(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE inquiries
  ADD COLUMN messenger_profile_url VARCHAR(500) NULL AFTER phone;

ALTER TABLE inquiries
  ADD COLUMN requested_object_id BIGINT UNSIGNED NULL AFTER house_id;

ALTER TABLE inquiries
  ADD KEY idx_inquiries_requested_object (requested_object_id);

ALTER TABLE inquiries
  ADD CONSTRAINT fk_inquiries_requested_object
  FOREIGN KEY (requested_object_id) REFERENCES houses(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

INSERT INTO articles (title, slug, excerpt, content, image_path, is_published, published_at)
VALUES
  (
    'Тестовая статья о жизни в Барвихе',
    'test-article-life-in-barviha',
    'Демо-материал: структура и внешний вид карточки статьи.',
    'Это тестовый контент статьи. Здесь можно хранить длинный текст, структурированный по разделам.',
    '/media/images/houses/ex2.png',
    1,
    NOW()
  )
ON DUPLICATE KEY UPDATE
  excerpt = VALUES(excerpt),
  content = VALUES(content),
  image_path = VALUES(image_path),
  is_published = VALUES(is_published),
  published_at = VALUES(published_at);

INSERT INTO galleries (title, slug, description, cover_image_path, is_published)
VALUES
  (
    'Жизнь в Барвихе',
    'life-in-barviha',
    'Тестовая галерея для витрины проекта.',
    '/media/images/houses/ex1.png',
    1
  )
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  cover_image_path = VALUES(cover_image_path),
  is_published = VALUES(is_published);

INSERT INTO gallery_images (gallery_id, image_path, caption, sort_order)
SELECT g.id, gi.image_path, gi.caption, gi.sort_order
FROM galleries g
JOIN (
  SELECT '/media/images/houses/ex1.png' AS image_path, 'Панорамный фасад резиденции' AS caption, 1 AS sort_order
  UNION ALL SELECT '/media/images/houses/ex2.png', 'Интерьер с открытой кухней', 2
  UNION ALL SELECT '/media/images/houses/ex3.jpg', 'Вечерний свет и архитектура', 3
  UNION ALL SELECT '/media/images/houses/ex4.jpg', 'Лаунж-зона у бассейна', 4
  UNION ALL SELECT '/media/images/houses/ex5.jpg', 'Участок и приватный двор', 5
) gi
WHERE g.slug = 'life-in-barviha'
  AND NOT EXISTS (
    SELECT 1
    FROM gallery_images x
    WHERE x.gallery_id = g.id AND x.image_path = gi.image_path
  );
