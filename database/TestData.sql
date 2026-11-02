
-- Test Data 
-- A test company with an account for every role, some benefits, and
-- wellness events that people have joined.
--
-- BEFORE running: start the backend (Main.java) once. That adds the new
-- tables and columns this file uses.

-- Run ONCE in MySQL Workbench (lightning bolt, nothing selected).

USE wellness;

-- ---------- Test company ----------
INSERT INTO companies (company_name, industry, company_size, employee_count, contact_name,
                       job_title, work_email, phone_number)
VALUES ('Test Co', 'Technology', '1-50', 9, 'Alex Admin',
        'HR Manager', 'admin@testco.ca', '403-555-0100');

-- remember the new company's id so we can use it below
SET @company = LAST_INSERT_ID();

-- ----------  Test accounts ----------
-- This is the scrambled (hashed) version of the password Wellness2026!
-- The backend never stores the real password.
SET @password = '$2a$10$J5JN.hRV6434wbCdT3UNWO8Qpu2U8OcFIF6UPn/afBW.cAfoFK7p2';

INSERT INTO users (email, password_hash, full_name, role, company_id) VALUES
  ('swadmin@smartwellness.ca', @password, 'Sam Wellness',   'smart_wellness_admin', NULL),
  ('admin@testco.ca',          @password, 'Alex Admin',     'company_admin',     @company),
  ('exec@testco.ca',           @password, 'Erin Executive', 'executive_sponsor', @company),
  ('leader@testco.ca',         @password, 'Lee Leader',     'leader',            @company),
  ('employee1@testco.ca',      @password, 'Emma Employee',  'employee',          @company),
  ('employee2@testco.ca',      @password, 'Priya Patel',    'employee',          @company),
  ('employee3@testco.ca',      @password, 'Maria Lopez',    'employee',          @company),
  ('employee4@testco.ca',      @password, 'Grace Kim',      'employee',          @company),
  ('employee5@testco.ca',      @password, 'Nadia Okafor',   'employee',          @company),
  ('employee6@testco.ca',      @password, 'Joan Tremblay',  'employee',          @company);

SET @admin = (SELECT id FROM users WHERE email = 'swadmin@smartwellness.ca');

-- ---------- Benefits for Test Co ----------
INSERT INTO benefits (company_id, title, category, description, how_to_access) VALUES
  (@company, 'Flexible start and end times', 'Work arrangements', 'Shift your hours to manage symptoms such as poor sleep or tiredness.', 'Talk to your manager or HR.'),
  (@company, 'Remote work days', 'Work arrangements', 'Up to two remote days per week for roles that can be done from home.', 'Agree on the days with your manager.'),
  (@company, 'Employee assistance program', 'Mental health', 'Free, confidential counselling for you and your family.', 'Call the number in your benefits booklet.'),
  (@company, 'Paid personal health days', 'Time off', 'Paid days off for health appointments or recovery.', 'Request through HR.'),
  (@company, 'Desk fan or cooler work area', 'Accommodations', 'A fan, or a seat away from heat, on request.', 'Ask your manager.');

-- ----------  Wellness events  ----------
INSERT INTO wellness_events (company_id, title, description, event_date, created_by) VALUES
  (@company, 'Menopause at Work Lunch & Learn', 'Boardroom A. An introduction for all staff.', NOW() - INTERVAL 4 MONTH, @admin),
  (@company, 'Sleep Better Workshop',           'Online (Teams). Practical tips for better sleep.', NOW() - INTERVAL 3 MONTH, @admin),
  (@company, 'Morning Yoga',                    'Wellness Room. Gentle stretching for all levels.', NOW() - INTERVAL 2 MONTH, @admin),
  (@company, 'Stress Management Workshop',      'Conference Room. Tools for busy weeks.', NOW() - INTERVAL 1 MONTH, @admin),
  (@company, 'Managers: Supporting Your Team',  'Boardroom A. For leaders and managers.', NOW() + INTERVAL 7 DAY, @admin),
  (@company, 'Walking Club',                    'Front entrance. A 30-minute walk outside.', NOW() + INTERVAL 14 DAY, @admin);

-- ----------  Who joined the past events ----------
INSERT INTO engagement (user_id, event_id)
SELECT users.id, wellness_events.id
FROM users, wellness_events
WHERE wellness_events.company_id = @company
  AND ((wellness_events.title = 'Sleep Better Workshop' AND users.email IN ('employee1@testco.ca', 'employee2@testco.ca', 'leader@testco.ca'))
    OR (wellness_events.title = 'Morning Yoga'          AND users.email IN ('employee3@testco.ca', 'employee4@testco.ca', 'employee5@testco.ca')));

SELECT 'Test data added' AS result;
