-- Smart ID Codes

-- Every person has their own Smart ID. They need it to SIGN IN,
-- together with their email and password.
--
-- Part 1 gives each test account from TestData.sql its Smart ID.
-- Part 2 adds unused codes for "Test Co", so you can try the
-- Create Employee / Create Leader Account pages (each code works ONCE).
-- Part 3 gives a Smart ID to any other account that doesn't have one yet.
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
--   Create Employee Account page:   SW-EMPLOYEE1, SW-EMPLOYEE2, SW-EMPLOYEE3
--   Create Leader Account page:     SW-LEADER1,   SW-LEADER2
--   Company Name:                   Test Co
INSERT IGNORE INTO smart_ids (code, company_id, intended_role) VALUES
  ('SW-EMPLOYEE1', @company, 'employee'),
  ('SW-EMPLOYEE2', @company, 'employee'),
  ('SW-EMPLOYEE3', @company, 'employee'),
  ('SW-LEADER1',   @company, 'leader'),
  ('SW-LEADER2',   @company, 'leader');

-- Part 3: any other account that still has no Smart ID gets one now
-- The code is "SW-USER" + the person's id, e.g. SW-USER12.
-- Smart Wellness staff don't belong to a company, so they don't need one.
INSERT IGNORE INTO smart_ids (code, company_id, intended_role, is_redeemed, redeemed_by_user_id)
SELECT CONCAT('SW-USER', users.id), users.company_id, users.role, 1, users.id
FROM users
LEFT JOIN smart_ids ON smart_ids.redeemed_by_user_id = users.id
WHERE smart_ids.id IS NULL
  AND users.company_id IS NOT NULL;

SELECT 'Smart ID codes added' AS result;

-- Everyone's Smart ID, so you know what to type on the Sign In page
SELECT users.email, users.role, smart_ids.code AS smart_id
FROM users
LEFT JOIN smart_ids ON smart_ids.redeemed_by_user_id = users.id
ORDER BY users.id;
