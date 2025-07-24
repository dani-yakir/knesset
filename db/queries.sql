-- Knesset

CREATE TABLE knessets (
    id INT PRIMARY KEY,
    name TEXT NOT NULL,
    start TIMESTAMP NOT NULL,
    end TIMESTAMP  -- optional field, allows NULL by default
);
