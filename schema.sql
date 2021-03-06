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
    entry_date INTEGER,
    entry_bank_note TEXT,
    entry_note TEXT,
    entry_tag TEXT,
    entry_what TEXT,
    entry_where TEXT
);


CREATE TABLE budget
(
    budget_id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    budget_code TEXT,
    budget_type INTEGER,
    budget_amount NUMERIC
);


CREATE TABLE budget_assignment
(
    ba_id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    ba_entry_id INTEGER REFERENCES entry (tr_id),
    ba_budget_id INTEGER REFERENCES budget (budget_id),
    ba_amount NUMERIC
);


CREATE TABLE period
(
    period_id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    period_name TEXT,
    period_date_start INTEGER,
    period_date_end INTEGER
);


CREATE TABLE accounting
(
    accounting_id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    accounting_period_id INTEGER REFERENCES period (period_id),
    accounting_account_id INTEGER REFERENCES account (account_id),
    accounting_amount_start NUMERIC,
    accounting_amount_end NUMERIC
);
