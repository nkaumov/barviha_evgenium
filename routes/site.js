const express = require("express");
const locale = require("../config/locales/ru.json");
const { pool } = require("../config/db");

const router = express.Router();

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9а-яё-]/gi, "");

const repeatToLength = (items, targetLength, factory) => {
  const output = [...items];
  let index = 0;

  while (output.length < targetLength && output.length > 0) {
    const source = output[index % output.length];
    output.push(factory(source, output.length));
    index += 1;
  }

  return output.slice(0, targetLength);
};

const computeBounds = (houses) => {
  if (!houses.length) {
    return {
      priceMin: 0,
      priceMax: 1000000000,
      areaMin: 0,
      areaMax: 1000,
      plotMin: 0,
      plotMax: 100,
      distanceMin: 0,
      distanceMax: 50
    };
  }

  const prices = houses.map((item) => Number(item.price) || 0);
  const areas = houses.map((item) => Number(item.area) || 0);
  const plots = houses.map((item) => Number(item.plotArea) || 0);
  const distances = houses.map((item) => Number(item.distance) || 0);

  return {
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    areaMin: Math.min(...areas),
    areaMax: Math.max(...areas),
    plotMin: Math.min(...plots),
    plotMax: Math.max(...plots),
    distanceMin: Math.min(...distances),
    distanceMax: Math.max(...distances)
  };
};

const computeObjectBounds = (objects) => {
  if (!objects.length) {
    return {
      priceMin: 0,
      priceMax: 1000000000,
      areaMin: 0,
      areaMax: 1000,
      plotMin: 0,
      plotMax: 100,
      distanceMin: 0,
      distanceMax: 50
    };
  }

  const prices = objects.map((item) => Number(item.price) || 0);
  const areas = objects.map((item) => Number(item.area) || 0);
  const plots = objects.map((item) => Number(item.plotArea) || 0);
  const distances = objects.map((item) => Number(item.distance) || 0);

  return {
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    areaMin: Math.min(...areas),
    areaMax: Math.max(...areas),
    plotMin: Math.min(...plots),
    plotMax: Math.max(...plots),
    distanceMin: Math.min(...distances),
    distanceMax: Math.max(...distances)
  };
};

router.get("/", async (req, res) => {
  const fallbackHouses = locale.data.objects.map((item) => ({
    ...item,
    villageSlug: slugify(item.village)
  }));

  const fallbackVillages = locale.data.villages.map((item) => ({
    ...item,
    slug: slugify(item.name),
    image: `/media/images/villages/village-${Math.min(item.id, 5)}.${item.id <= 2 ? "png" : "jpg"}`,
    housesCount: fallbackHouses.filter((house) => house.village === item.name).length
  }));

  const lifeGallery =
    locale.data.lifeGallery ||
    [
      { image: "/media/images/houses/ex1.png", title: "Архитектура", subtitle: "Современные и классические резиденции." },
      { image: "/media/images/houses/ex2.png", title: "Приватность", subtitle: "Закрытые территории и камерный формат." },
      { image: "/media/images/houses/ex3.jpg", title: "Интерьеры", subtitle: "Просторные дома с премиальной отделкой." },
      { image: "/media/images/houses/ex4.jpg", title: "Природа", subtitle: "Лесные участки и прогулочные маршруты." },
      { image: "/media/images/houses/ex5.jpg", title: "Инфраструктура", subtitle: "Школы, сервис, спорт и гастрономия." }
    ];

  const lifeArticles =
    locale.data.lifeArticles ||
    [
      {
        title: "Почему Барвиха остается главным выбором премиум-сегмента",
        excerpt: "Собрали ключевые аргументы по локации, окружению и ликвидности объектов.",
        date: "Март 2026",
        image: "/media/images/houses/ex2.png",
        url: "/articles/test"
      },
      {
        title: "Как выбрать дом: чек-лист перед покупкой",
        excerpt: "От инженерии и планировок до юридической проверки и оценки участка.",
        date: "Февраль 2026",
        image: "/media/images/houses/ex3.jpg",
        url: "/articles/test"
      },
      {
        title: "Жизнь за городом: ритм, сервисы, безопасность",
        excerpt: "Практический обзор ежедневного сценария жизни в закрытых поселках.",
        date: "Январь 2026",
        image: "/media/images/houses/ex4.jpg",
        url: "/articles/test"
      }
    ];

  const testimonials =
    locale.data.testimonials ||
    [
      {
        name: "Ирина К.",
        role: "Собственник",
        quote: "Мы получили дом с продуманной инфраструктурой и действительно спокойной средой для семьи.",
        image: "/media/images/houses/ex1.png"
      },
      {
        name: "Александр М.",
        role: "Предприниматель",
        quote: "Важна была логистика и приватность. В Барвихе сошлись оба условия без компромиссов.",
        image: "/media/images/houses/ex5.jpg"
      },
      {
        name: "Екатерина Н.",
        role: "Инвестор",
        quote: "Объекты в этой зоне остаются ликвидными, а качество среды напрямую влияет на спрос.",
        image: "/media/images/houses/ex3.jpg"
      }
    ];

  const homeArticles = repeatToLength(
    lifeArticles.map((item) => ({ ...item, url: "/articles/test" })),
    6,
    (source, currentIndex) => ({
      ...source,
      title: `${source.title} (${currentIndex + 1})`,
      url: "/articles/test"
    })
  );

  const homeTestimonials = repeatToLength(testimonials, 6, (source, currentIndex) => ({
    ...source,
    name: `${source.name} ${currentIndex + 1}`
  }));

  try {
    const [villages] = await pool.query(
      `
      SELECT
        v.id,
        v.name,
        v.slug,
        COALESCE(v.image_path, '/media/images/villages/village-1.png') AS image,
        COUNT(h.id) AS housesCount
      FROM villages v
      LEFT JOIN houses h ON h.village_id = v.id AND h.is_active = 1
      GROUP BY v.id, v.name, v.slug, v.image_path
      ORDER BY v.name
    `
    );

    const [houses] = await pool.query(
      `
      SELECT
        h.id,
        h.title,
        h.price,
        h.area_house AS area,
        h.distance_mkad AS distance,
        h.plot_area AS plotArea,
        h.floors,
        h.image_path AS image,
        v.name AS village,
        v.slug AS villageSlug
      FROM houses h
      JOIN villages v ON v.id = h.village_id
      WHERE h.is_active = 1
      ORDER BY h.created_at DESC
    `
    );

    const housesData = houses.length ? houses : fallbackHouses;

    res.render("index", {
      pageTitleKey: "nav.home",
      heroImages: locale.data.heroImages,
      villagesCarousel: villages.length ? villages : fallbackVillages,
      pickerHouses: housesData,
      pickerBounds: computeBounds(housesData),
      lifeGallery,
      lifeArticles: homeArticles,
      testimonials: homeTestimonials
    });
  } catch {
    res.render("index", {
      pageTitleKey: "nav.home",
      heroImages: locale.data.heroImages,
      villagesCarousel: fallbackVillages,
      pickerHouses: fallbackHouses,
      pickerBounds: computeBounds(fallbackHouses),
      lifeGallery,
      lifeArticles: homeArticles,
      testimonials: homeTestimonials
    });
  }
});

router.get("/articles/:slug", (req, res) => {
  const article = {
    title: "Тестовая статья о жизни в Барвихе",
    subtitle: "Демо-страница для будущего контента блога.",
    date: "Март 2026",
    image: "/media/images/houses/ex2.png",
    authorName: "Редакция Barviha",
    authorRole: "Контент-отдел",
    text: [
      "Это тестовый шаблон статьи. Здесь будет основной контент: аналитика по поселкам, обзоры инфраструктуры и практические советы для выбора дома.",
      "Структура уже готова: заголовок, обложка, автор, дата публикации и несколько абзацев текста. Вы сможете заменить текст на финальный в любой момент.",
      "Также на этой странице можно будет добавить блоки: галерею, цитаты экспертов, таблицы параметров объектов и внутренние ссылки на каталоги."
    ]
  };

  res.render("article", {
    pageTitleKey: "home.lifeArticlesTitle",
    article
  });
});

router.get("/gallery/:slug", (req, res) => {
  const galleryItems = [
    { image: "/media/images/houses/ex1.png", title: "Панорамный фасад резиденции" },
    { image: "/media/images/houses/ex2.png", title: "Интерьер с открытой кухней" },
    { image: "/media/images/houses/ex3.jpg", title: "Вечерний свет и архитектура" },
    { image: "/media/images/houses/ex4.jpg", title: "Лаунж-зона у бассейна" },
    { image: "/media/images/houses/ex5.jpg", title: "Участок и приватный двор" },
    { image: "/media/images/houses/ex1.png", title: "Классическая входная группа" },
    { image: "/media/images/houses/ex2.png", title: "Терраса и приватная зона отдыха" },
    { image: "/media/images/houses/ex3.jpg", title: "Премиальная отделка в деталях" }
  ];

  res.render("gallery", {
    pageTitleKey: "home.lifeGalleryTitle",
    galleryTitle: "Тестовая галерея: Жизнь в Барвихе",
    gallerySubtitle: "Демо-страница для проверки сетки, полноэкранного просмотра и листания изображений.",
    galleryItems
  });
});

router.get("/villages", async (req, res) => {
  const fallbackVillages = locale.data.villages.map((village) => ({
    ...village,
    slug: slugify(village.name),
    image: "/media/images/villages/village-1.png",
    housesCount: 0
  }));

  try {
    const [rows] = await pool.query(
      `
      SELECT
        v.id,
        v.name,
        v.slug,
        v.short_description AS description,
        v.image_path AS image,
        COUNT(h.id) AS housesCount
      FROM villages v
      LEFT JOIN houses h ON h.village_id = v.id AND h.is_active = 1
      GROUP BY v.id, v.name, v.slug, v.short_description, v.image_path
      ORDER BY v.name
    `
    );

    res.render("villages", {
      pageTitleKey: "nav.villages",
      villages: rows.length ? rows : fallbackVillages
    });
  } catch {
    res.render("villages", {
      pageTitleKey: "nav.villages",
      villages: fallbackVillages
    });
  }
});

router.get("/villages/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const [villageRows] = await pool.query(
      `
      SELECT
        v.id,
        v.name,
        v.slug,
        v.short_description AS description,
        v.image_path AS image,
        v.distance_mkad AS distance,
        COUNT(h.id) AS housesCount
      FROM villages v
      LEFT JOIN houses h ON h.village_id = v.id AND h.is_active = 1
      WHERE v.slug = ?
      GROUP BY v.id, v.name, v.slug, v.short_description, v.image_path, v.distance_mkad
      LIMIT 1
    `,
      [slug]
    );

    const village = villageRows[0];

    if (!village) {
      return res.status(404).render("404", { pageTitleKey: "notFoundPage.title" });
    }

    const [houses] = await pool.query(
      `
      SELECT
        id,
        title,
        price,
        area_house AS area,
        image_path AS image
      FROM houses
      WHERE village_id = ? AND is_active = 1
      ORDER BY created_at DESC
    `,
      [village.id]
    );

    const gallery = [village.image, ...houses.map((item) => item.image)]
      .filter(Boolean)
      .filter((item, index, array) => array.indexOf(item) === index);

    const villageGalleryMain = gallery[0] || "/media/images/villages/village-1.png";
    const villageGalleryThumbs = gallery.slice(0, 5);

    return res.render("village-detail", {
      pageTitleKey: "nav.villages",
      village,
      houses,
      villageGalleryMain,
      villageGalleryThumbs
    });
  } catch {
    return res.status(404).render("404", { pageTitleKey: "notFoundPage.title" });
  }
});

router.get("/objects", async (req, res) => {
  const fallbackObjects = locale.data.objects.map((item) => ({
    ...item,
    villageSlug: slugify(item.village)
  }));

  try {
    const [rows] = await pool.query(
      `
      SELECT
        h.id,
        h.title,
        v.name AS village,
        v.slug AS villageSlug,
        h.price,
        h.area_house AS area,
        h.distance_mkad AS distance,
        h.floors,
        h.plot_area AS plotArea,
        h.image_path AS image,
        h.short_description AS description
      FROM houses h
      JOIN villages v ON v.id = h.village_id
      WHERE h.is_active = 1
      ORDER BY h.created_at DESC
    `
    );

    const objectsData = rows.length ? rows : fallbackObjects;
    const villages = Array.from(
      new Map(objectsData.map((item) => [item.villageSlug, { slug: item.villageSlug, name: item.village }])).values()
    );

    res.render("objects", {
      pageTitleKey: "objectsPage.title",
      objects: objectsData,
      objectsFilterBounds: computeObjectBounds(objectsData),
      objectsFilterVillages: villages
    });
  } catch {
    const villages = Array.from(
      new Map(fallbackObjects.map((item) => [item.villageSlug, { slug: item.villageSlug, name: item.village }])).values()
    );

    res.render("objects", {
      pageTitleKey: "objectsPage.title",
      objects: fallbackObjects,
      objectsFilterBounds: computeObjectBounds(fallbackObjects),
      objectsFilterVillages: villages
    });
  }
});

router.get("/objects/:id", async (req, res) => {
  const objectId = Number(req.params.id);
  const fallbackObject = locale.data.objects.find((item) => item.id === objectId);

  try {
    const [rows] = await pool.query(
      `
      SELECT
        h.id,
        h.title,
        v.name AS village,
        v.slug AS villageSlug,
        h.village_id AS villageId,
        h.price,
        h.area_house AS area,
        h.distance_mkad AS distance,
        h.floors,
        h.plot_area AS plotArea,
        h.image_path AS image,
        COALESCE(h.full_description, h.short_description) AS description
      FROM houses h
      JOIN villages v ON v.id = h.village_id
      WHERE h.id = ? AND h.is_active = 1
      LIMIT 1
    `,
      [objectId]
    );

    const objectItem = rows[0] || fallbackObject;

    if (!objectItem) {
      return res.status(404).render("404", { pageTitleKey: "notFoundPage.title" });
    }

    let objectGalleryThumbs = [objectItem.image].filter(Boolean);

    if (objectItem.villageId) {
      const [galleryRows] = await pool.query(
        `
        SELECT image_path AS image
        FROM houses
        WHERE village_id = ? AND is_active = 1
        ORDER BY created_at DESC
        LIMIT 8
      `,
        [objectItem.villageId]
      );

      objectGalleryThumbs = [objectItem.image, ...galleryRows.map((item) => item.image)]
        .filter(Boolean)
        .filter((item, index, array) => array.indexOf(item) === index)
        .slice(0, 6);
    }

    if (!objectGalleryThumbs.length) {
      objectGalleryThumbs = ["/media/images/houses/ex1.png"];
    }

    const objectGalleryMain = objectGalleryThumbs[0];

    return res.render("object-detail", {
      pageTitleKey: "objectsPage.title",
      object: objectItem,
      objectGalleryMain,
      objectGalleryThumbs
    });
  } catch {
    if (!fallbackObject) {
      return res.status(404).render("404", { pageTitleKey: "notFoundPage.title" });
    }

    const objectGalleryThumbs = [fallbackObject.image, ...(locale.data.heroImages || [])]
      .filter(Boolean)
      .filter((item, index, array) => array.indexOf(item) === index)
      .slice(0, 6);

    const objectGalleryMain = objectGalleryThumbs[0] || "/media/images/houses/ex1.png";

    return res.render("object-detail", {
      pageTitleKey: "objectsPage.title",
      object: fallbackObject,
      objectGalleryMain,
      objectGalleryThumbs
    });
  }
});

router.get("/contacts", (req, res) => {
  res.render("contacts", {
    pageTitleKey: "nav.contacts"
  });
});

module.exports = router;
