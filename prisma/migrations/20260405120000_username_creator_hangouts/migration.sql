ALTER TABLE "users" ADD COLUMN "username" TEXT;

WITH prepared_usernames AS (
    SELECT
        "id",
        LOWER(
            REGEXP_REPLACE(
                COALESCE(
                    NULLIF(SPLIT_PART("email", '@', 1), ''),
                    NULLIF(REGEXP_REPLACE("name", '[^a-zA-Z0-9_]+', '_', 'g'), ''),
                    'user'
                ),
                '[^a-zA-Z0-9_]+',
                '_',
                'g'
            )
        ) AS "base_username"
    FROM "users"
),
ranked_usernames AS (
    SELECT
        "id",
        CASE
            WHEN ROW_NUMBER() OVER (PARTITION BY "base_username" ORDER BY "id") = 1
                THEN "base_username"
            ELSE CONCAT("base_username", ROW_NUMBER() OVER (PARTITION BY "base_username" ORDER BY "id") - 1)
        END AS "username"
    FROM prepared_usernames
)
UPDATE "users"
SET "username" = ranked_usernames."username"
FROM ranked_usernames
WHERE "users"."id" = ranked_usernames."id";

ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
DROP INDEX "users_email_key";
ALTER TABLE "users" DROP COLUMN "email";
ALTER TABLE "users" DROP COLUMN "name";

ALTER TABLE "hangouts" ADD COLUMN "creator_user_id" TEXT;

WITH creator_members AS (
    SELECT DISTINCT ON ("hangout_id")
        "hangout_id",
        "user_id"
    FROM "hangout_members"
    ORDER BY "hangout_id", "joined_at" ASC, "id" ASC
)
UPDATE "hangouts"
SET "creator_user_id" = creator_members."user_id"
FROM creator_members
WHERE "hangouts"."id" = creator_members."hangout_id";

ALTER TABLE "hangouts" ALTER COLUMN "creator_user_id" SET NOT NULL;
CREATE INDEX "hangouts_creator_user_id_idx" ON "hangouts"("creator_user_id");
ALTER TABLE "hangouts"
    ADD CONSTRAINT "hangouts_creator_user_id_fkey"
    FOREIGN KEY ("creator_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
