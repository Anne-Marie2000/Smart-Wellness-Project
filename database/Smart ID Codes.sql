-- Smart ID Codes

-- Every person has their own Smart ID. They need it to SIGN IN,
-- together with their email and password.
--
-- Part 1 gives each test account from TestData.sql its Smart ID.
-- Part 2 adds unused codes for "Test Co", so you can try the
-- Create Employee / Create Leader Account pages (each code works ONCE).
--
-- Run in MySQL Workbench after TestData.sql.
-- INSERT IGNORE skips codes that are already there, so it is safe to run again.

USE wellness;

SET @company = (SELECT id FROM companies WHERE company_name = 'Test Co' LIMIT 1);

-- Part 1: Smart IDs for the test accounts (already "used" by that person)
INSERT IGNORE INTO smart_ids (code, company_id, intended_role, is_redeemed, redeemed_by_user_id)
SELECT 'SW-ADMIN01', company_id, role, 1, id FROM users WHERE email = 'admin@testco.ca';

INSERT IGNORE INTO smart_ids (code, company_id, intended_role, is_redeemed, redeemed_by_user_id)
SELECT 'SW-EXEC01', company_id, role, 1, id FROM users WHERE email = 'exec@testco.ca';

INSERT IGNORE INTO smart_ids (code, company_id, intended_role, is_redeemed, redeemed_by_user_id)
SELECT 'SW-LEAD01', company_id, role, 1, id FROM users WHERE email = 'leader@testco.ca';

INSERT IGNORE INTO smart_ids (code, company_id, intended_role, is_redeemed, redeemed_by_user_id)
SELECT 'SW-EMP01', company_id, role, 1, id FROM users WHERE email = 'employee1@testco.ca';

INSERT IGNORE INTO smart_ids (code, company_id, intended_role, is_redeemed, redeemed_by_user_id)
SELECT 'SW-EMP02', company_id, role, 1, id FROM users WHERE email = 'employee2@testco.ca';

INSERT IGNORE INTO smart_ids (code, company_id, intended_role, is_redeemed, redeemed_by_user_id)
SELECT 'SW-EMP03', company_id, role, 1, id FROM users WHERE email = 'employee3@testco.ca';

INSERT IGNORE INTO smart_ids (code, company_id, intended_role, is_redeemed, redeemed_by_user_id)
SELECT 'SW-EMP04', company_id, role, 1, id FROM users WHERE email = 'employee4@testco.ca';

INSERT IGNORE INTO smart_ids (code, company_id, intended_role, is_redeemed, redeemed_by_user_id)
SELECT 'SW-EMP05', company_id, role, 1, id FROM users WHERE email = 'employee5@testco.ca';

INSERT IGNORE INTO smart_ids (code, company_id, intended_role, is_redeemed, redeemed_by_user_id)
SELECT 'SW-EMP06', company_id, role, 1, id FROM users WHERE email = 'employee6@testco.ca';

-- Part 2: unused codes for trying the Create Account pages

INSERT IGNORE INTO smart_ids (code, company_id, intended_role) VALUES
  ('SW-EMPLOYEE1', @company, 'employee'),
  ('SW-EMPLOYEE2', @company, 'employee'),
  ('SW-EMPLOYEE3', @company, 'employee'),
  ('SW-LEADER1',   @company, 'leader'),
  ('SW-LEADER2',   @company, 'leader');

SELECT 'Smart ID codes added' AS result;
