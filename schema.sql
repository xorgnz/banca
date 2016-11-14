CREATE TABLE account
(
    account_id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    account_name TEXT,
    account_description TEXT
);

CREATE TABLE entry
(
    entry_id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    entry_account_id INTEGER REFERENCES account (account_id),
    entry_amount NUMERIC,
    entry_date_year INTEGER,
    entry_date_month INTEGER,
    entry_date_day INTEGER,
    entry_note TEXT,
    entry_tag TEXT,
    entry_what TEXT,
    entry_where TEXT
);

CREATE TABLE period
(
    period_date_year INTEGER,
    period_date_month INTEGER,
    period_account_id INTEGER REFERENCES account (account_id),
    period_amount NUMERIC
);
