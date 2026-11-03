-- Smart ID Codes  (for testing Create Employee / Leader Account)

-- A Smart ID code links a new account to its company and role.
-- These are unused codes for "Test Co", so you can try signing up.
-- Each code can only be used ONCE.
-- Run ONCE in MySQL Workbench, after TestData.sql.

USE wellness;

SET @company = (SELECT id FROM companies WHERE company_name = 'Test Co' LIMIT 1);

INSERT INTO smart_ids (code, company_id, intended_role) VALUES
  ('SW-EMPLOYEE1', @company, 'employee'),
  ('SW-EMPLOYEE2', @company, 'employee'),
  ('SW-EMPLOYEE3', @company, 'employee'),
  ('SW-LEADER1',   @company, 'leader'),
  ('SW-LEADER2',   @company, 'leader');

SELECT 'Smart ID codes added' AS result;
