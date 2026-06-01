-- =============================================
-- Personal Budget Planner - MySQL Schema
-- =============================================
-- Run this manually OR let Hibernate auto-create via ddl-auto=update


USE budget_planner_db;

-- ── USERS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    first_name  VARCHAR(100)    NOT NULL,
    last_name   VARCHAR(100)    NOT NULL,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        VARCHAR(20)     NOT NULL DEFAULT 'USER',
    theme       VARCHAR(10)     NOT NULL DEFAULT 'LIGHT',
    created_at  DATETIME(6)     NOT NULL,
    updated_at  DATETIME(6),
    PRIMARY KEY (id),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── INCOMES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incomes (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    source      VARCHAR(255)    NOT NULL,
    amount      DECIMAL(15, 2)  NOT NULL,
    date        DATE            NOT NULL,
    recurring   TINYINT(1)      NOT NULL DEFAULT 0,
    frequency   VARCHAR(20),
    user_id     BIGINT          NOT NULL,
    created_at  DATETIME(6)     NOT NULL,
    updated_at  DATETIME(6),
    PRIMARY KEY (id),
    INDEX idx_incomes_user_id (user_id),
    INDEX idx_incomes_date    (date),
    CONSTRAINT fk_incomes_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── EXPENSES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    category    VARCHAR(50)     NOT NULL,
    description VARCHAR(500)    NOT NULL,
    amount      DECIMAL(15, 2)  NOT NULL,
    date        DATE            NOT NULL,
    recurring   TINYINT(1)      NOT NULL DEFAULT 0,
    frequency   VARCHAR(20),
    user_id     BIGINT          NOT NULL,
    created_at  DATETIME(6)     NOT NULL,
    updated_at  DATETIME(6),
    PRIMARY KEY (id),
    INDEX idx_expenses_user_id  (user_id),
    INDEX idx_expenses_date     (date),
    INDEX idx_expenses_category (category),
    CONSTRAINT fk_expenses_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── GOALS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    name            VARCHAR(255)    NOT NULL,
    target_amount   DECIMAL(15, 2)  NOT NULL,
    current_amount  DECIMAL(15, 2)  NOT NULL DEFAULT 0.00,
    deadline        DATE            NOT NULL,
    user_id         BIGINT          NOT NULL,
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6),
    PRIMARY KEY (id),
    INDEX idx_goals_user_id  (user_id),
    INDEX idx_goals_deadline (deadline),
    CONSTRAINT fk_goals_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
