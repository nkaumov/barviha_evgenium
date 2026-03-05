CREATE TABLE IF NOT EXISTS villages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  short_description TEXT NULL,
  image_path VARCHAR(500) NULL,
  distance_mkad INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_villages_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO villages (name, slug, short_description, image_path, distance_mkad)
VALUES
  ('Барвиха Luxury Village', 'barviha-luxury-village', 'Премиальный поселок с закрытой территорией и развитой инфраструктурой.', '/media/images/villages/village-1.png', 9),
  ('Раздоры', 'razdory', 'Современная локация рядом с природной зоной и выездом в Москву.', '/media/images/villages/village-2.png', 12),
  ('Жуковка', 'zhukovka', 'Клубный формат резиденций и статусное соседство.', '/media/images/villages/village-3.jpg', 14),
  ('Усово', 'usovo', 'Тихая приватная локация с быстрым доступом к ключевым магистралям.', '/media/images/villages/village-4.jpg', 15),
  ('Подушкино', 'podushkino', 'Поселок рядом с лесом и инфраструктурой Рублевского направления.', '/media/images/villages/village-5.jpg', 11)
ON DUPLICATE KEY UPDATE
  short_description = VALUES(short_description),
  image_path = VALUES(image_path),
  distance_mkad = VALUES(distance_mkad);

ALTER TABLE houses
  ADD COLUMN village_id BIGINT UNSIGNED NULL AFTER slug;

UPDATE houses h
JOIN villages v ON v.name = h.village_name
SET h.village_id = v.id
WHERE h.village_id IS NULL;

UPDATE houses
SET village_id = 1
WHERE village_id IS NULL;

UPDATE houses
SET image_path = CONCAT('/media/images/houses/', SUBSTRING_INDEX(image_path, '/', -1))
WHERE image_path NOT LIKE '/media/images/houses/%';

ALTER TABLE houses
  ADD INDEX idx_houses_village_id (village_id);

ALTER TABLE houses
  ADD CONSTRAINT fk_houses_village
  FOREIGN KEY (village_id) REFERENCES villages(id)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE houses
  DROP COLUMN village_name;

INSERT INTO houses (
  title,
  slug,
  village_id,
  price,
  area_house,
  distance_mkad,
  floors,
  plot_area,
  image_path,
  short_description,
  full_description,
  is_active
)
VALUES
  ('Дом в сосновом парке', 'dom-v-sosnovom-parke', 1, 295000000, 560, 9, 2, 17.00, '/media/images/houses/ex1.png', 'Дом рядом с парковой зоной.', 'Современный дом с приватным участком и просторной гостиной.', 1),
  ('Резиденция с террасой', 'rezidenciya-s-terrasoy', 1, 410000000, 740, 8, 3, 21.00, '/media/images/houses/ex2.png', 'Резиденция с панорамной террасой.', 'Полноценный семейный формат с кабинетом, SPA и зоной барбекю.', 1),
  ('Дом с бассейном', 'dom-s-basseynom', 1, 365000000, 680, 10, 2, 19.50, '/media/images/houses/ex3.jpg', 'Дом с отдельным блоком бассейна.', 'Продуманная планировка с мастер-спальней и гостевым блоком.', 1),
  ('Коттедж у леса', 'kottedzh-u-lesa', 1, 280000000, 520, 11, 2, 15.80, '/media/images/houses/ex4.jpg', 'Коттедж в тихой зеленой зоне.', 'Компактный премиальный формат для постоянного проживания.', 1),
  ('Резиденция в приватной зоне', 'rezidenciya-v-privatnoy-zone', 1, 460000000, 820, 9, 3, 24.00, '/media/images/houses/ex5.jpg', 'Резиденция с высокой приватностью.', 'Большой дом с авторским интерьером и ландшафтным двором.', 1),

  ('Дом на центральной аллее', 'dom-na-centralnoy-allee', 2, 230000000, 470, 12, 2, 14.50, '/media/images/houses/ex1.png', 'Удобный дом на центральной линии поселка.', 'Сбалансированный вариант для семьи с детьми.', 1),
  ('Вилла с гостевым домом', 'villa-s-gostevym-domom', 2, 340000000, 620, 13, 2, 20.00, '/media/images/houses/ex2.png', 'Вилла с дополнительным гостевым блоком.', 'Комфортная резиденция для большой семьи.', 1),
  ('Коттедж с каминным залом', 'kottedzh-s-kaminnym-zalom', 2, 260000000, 510, 12, 2, 16.20, '/media/images/houses/ex3.jpg', 'Классический коттедж с каминным залом.', 'Теплая архитектура и приватный участок.', 1),
  ('Дом с видом на парк', 'dom-s-vidom-na-park', 2, 300000000, 590, 11, 2, 18.70, '/media/images/houses/ex4.jpg', 'Объект рядом с прогулочной зоной.', 'Светлые интерьеры и высокий уровень готовности.', 1),
  ('Таун-вилла премиум', 'taun-villa-premium', 2, 210000000, 430, 14, 2, 12.90, '/media/images/houses/ex5.jpg', 'Компактный премиум-формат.', 'Рациональная планировка и современный фасад.', 1),

  ('Особняк у воды', 'osobnyak-u-vody', 3, 520000000, 900, 14, 3, 26.00, '/media/images/houses/ex1.png', 'Крупный объект у природного водоема.', 'Высокий класс отделки и инженерии.', 1),
  ('Дом с приватным садом', 'dom-s-privatnym-sadom', 3, 355000000, 640, 15, 2, 19.00, '/media/images/houses/ex2.png', 'Дом с ландшафтным садом.', 'Удобный выезд и закрытая территория.', 1),
  ('Резиденция с лифтом', 'rezidenciya-s-liftom', 3, 480000000, 810, 14, 3, 23.00, '/media/images/houses/ex3.jpg', 'Трехэтажная резиденция с лифтом.', 'Подходит для долгосрочного проживания большой семьи.', 1),
  ('Коттедж с SPA-зоной', 'kottedzh-s-spa-zonoy', 3, 390000000, 700, 13, 2, 20.40, '/media/images/houses/ex4.jpg', 'Собственная SPA-зона и сауна.', 'Премиальный лот в тихом квартале.', 1),
  ('Дом под ключ', 'dom-pod-klyuch-zhukovka', 3, 330000000, 610, 15, 2, 17.30, '/media/images/houses/ex5.jpg', 'Готовый дом с отделкой.', 'Минимум доработок для заселения.', 1),

  ('Дом в клубном квартале', 'dom-v-klubnom-kvartale', 4, 285000000, 550, 15, 2, 16.80, '/media/images/houses/ex1.png', 'Дом в спокойной клубной части поселка.', 'Оптимальный баланс цены и качества.', 1),
  ('Вилла с панорамным остеклением', 'villa-s-panoramnym-ostekleniem', 4, 405000000, 760, 16, 3, 22.10, '/media/images/houses/ex2.png', 'Вилла с большим объемом остекления.', 'Современная архитектура и функциональный план.', 1),
  ('Резиденция с кинотеатром', 'rezidenciya-s-kinoteatrom', 4, 470000000, 840, 15, 3, 24.60, '/media/images/houses/ex3.jpg', 'Дом с домашним кинотеатром.', 'Полный набор премиальных зон для отдыха.', 1),
  ('Дом с гаражом на 3 авто', 'dom-s-garazhom-na-3-avto', 4, 360000000, 690, 16, 2, 19.80, '/media/images/houses/ex4.jpg', 'Вместительный гараж и технический блок.', 'Практичный дом для постоянного проживания.', 1),
  ('Коттедж семейного формата', 'kottedzh-semeynogo-formata', 4, 250000000, 500, 17, 2, 15.20, '/media/images/houses/ex5.jpg', 'Семейный формат в тихом окружении.', 'Удобная планировка и просторная кухня-гостиная.', 1),

  ('Дом у соснового бора', 'dom-u-sosnovogo-bora', 5, 275000000, 530, 11, 2, 16.10, '/media/images/houses/ex1.png', 'Дом рядом с сосновым бором.', 'Комфортный дом в экологичной локации.', 1),
  ('Резиденция с кабинетом', 'rezidenciya-s-kabinetom', 5, 345000000, 650, 12, 2, 18.90, '/media/images/houses/ex2.png', 'Просторная резиденция с рабочей зоной.', 'Подходит для семьи и удаленной работы.', 1),
  ('Дом с зимним садом', 'dom-s-zimnim-sadom', 5, 315000000, 600, 12, 2, 17.50, '/media/images/houses/ex3.jpg', 'Дом с зимним садом и террасой.', 'Светлые пространства и приватный участок.', 1),
  ('Коттедж в Подушкино', 'kottedzh-v-podushkino', 5, 240000000, 460, 11, 2, 14.00, '/media/images/houses/ex4.jpg', 'Классический коттедж в Подушкино.', 'Готовый вариант для быстрого въезда.', 1),
  ('Современный дом у парка', 'sovremennyy-dom-u-parka', 5, 325000000, 620, 10, 2, 18.20, '/media/images/houses/ex5.jpg', 'Современный дом рядом с парковой зоной.', 'Грамотная планировка и качественные материалы.', 1)
ON DUPLICATE KEY UPDATE
  village_id = VALUES(village_id),
  price = VALUES(price),
  area_house = VALUES(area_house),
  distance_mkad = VALUES(distance_mkad),
  floors = VALUES(floors),
  plot_area = VALUES(plot_area),
  image_path = VALUES(image_path),
  short_description = VALUES(short_description),
  full_description = VALUES(full_description),
  is_active = VALUES(is_active);
