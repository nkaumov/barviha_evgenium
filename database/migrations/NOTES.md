<!-- Here you need to record the history of all migrations performed using codex. -->
- 2026-03-05: Added migration runner `database/migrate.js`.
- 2026-03-05: Added `0001_init.sql` with tables `houses`, `inquiries`.
- 2026-03-05: Added `0002_example_next_file.sql` with initial houses seed.
- 2026-03-05: Added `0003_add_villages_and_link_houses.sql` (villages table, relation houses->villages, expanded seed to 30 houses).
- 2026-03-05: Added `0004_add_content_tables_and_extend_inquiries.sql` (tables `articles`, `galleries`, `gallery_images`; extended `inquiries` with messenger profile URL and requested object link).
