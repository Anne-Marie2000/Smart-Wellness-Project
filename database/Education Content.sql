-- Education Content

-- 6 plain-language guides for employees and 6 for managers about menopause, midlife health and workplace support. 
-- General information only - not medical advice. Sources are named inside each guide.

-- BEFORE running: start the backend (Main.java) once. That adds the
-- "audience" column to the resources table.

-- Run ONCE in MySQL Workbench (lightning bolt, nothing selected).


USE wellness;

-- Every resource needs a "created_by" user. This uses the first Smart Wellness Administrator, or the first user if there isn't one.
SET @author = COALESCE(
    (SELECT id FROM users WHERE role = 'smart_wellness_admin' ORDER BY id LIMIT 1),
    (SELECT id FROM users ORDER BY id LIMIT 1));

INSERT INTO resources (title, category, body, company_id, created_by, audience) VALUES

-- Employees
('What are perimenopause and menopause?', 'Menopause Basics',
 'Menopause is the point when you have not had a period for 12 months in a row. In Canada it usually happens around age 51. Perimenopause is the time leading up to it, when hormone levels change. It often starts in your 40s and can last several years. Everyone''s experience is different: some people notice few changes, others have symptoms that affect sleep, mood and work. Learn more: menopauseandu.ca (Society of Obstetricians and Gynaecologists of Canada).',
 NULL, @author, 'employee'),

('Common symptoms and how they can show up at work', 'Menopause Basics',
 'Common symptoms include hot flashes, night sweats, poor sleep, trouble concentrating or remembering things ("brain fog"), mood changes or anxiety, joint aches, headaches, and irregular or heavier periods. At work this can look like feeling tired, finding warm rooms uncomfortable, or losing your train of thought in meetings. These symptoms are common and real, and there are ways to manage them.',
 NULL, @author, 'employee'),

('Talking to your health care provider', 'Getting Support',
 'If symptoms are affecting your life, talk to a family doctor, nurse practitioner or pharmacist. It helps to track your symptoms for a few weeks first (what happens, when, and how much it affects you). Ask about all your options, which can include lifestyle changes, hormone therapy and non-hormonal treatments. Only a health care provider can tell you what is right for you. Learn more: menopauseandu.ca.',
 NULL, @author, 'employee'),

('Practical tips for the workday', 'Daily Wellness',
 'Dress in layers you can take off. Keep cold water and a small fan nearby. Take short breaks to move or step outside. Write down tasks and notes to help with focus. Many people find caffeine, alcohol and spicy food can trigger hot flashes, so notice what affects you. A regular sleep routine can also help with energy during the day.',
 NULL, @author, 'employee'),

('Asking for workplace accommodations', 'Workplace Support',
 'You can ask for changes that help you do your job, such as flexible hours, remote days, temperature control or extra breaks. You do not have to share your diagnosis or medical details - you can describe what you need and why it helps. In Canada, employers have a duty to accommodate health-related needs up to the point of undue hardship. Start with your manager or HR, and see the Accommodations & Benefits page for what your workplace offers.',
 NULL, @author, 'employee'),

('Looking after your mental health in midlife', 'Mental Health',
 'Midlife can bring stress from work, family and health changes all at once, and hormone changes can affect mood. Your Employee Assistance Program (EAP) offers free, confidential counselling. If you are in crisis or thinking about suicide, call or text 9-8-8 (Suicide Crisis Helpline) any time in Canada.',
 NULL, @author, 'employee'),

-- Managers
('Why menopause matters at work', 'Leadership',
 'Many people go through perimenopause and menopause during their peak working years. Without support, some reduce their hours, turn down promotions or leave their jobs. Small, low-cost changes and an open culture help keep experienced people on your team. Learn more: menopausefoundationcanada.ca (Menopause Foundation of Canada).',
 NULL, @author, 'manager'),

('How to have a supportive conversation', 'Leadership',
 'Find a private place and enough time. Let the employee lead and listen without judging. Do not guess at a diagnosis or ask for medical details. Ask what would help them do their best work, agree on next steps together, and set a time to check in again. Keep what they tell you confidential.',
 NULL, @author, 'manager'),

('Simple accommodations that make a difference', 'Workplace Support',
 'Common accommodations include flexible start times, remote days, a desk fan or a cooler workspace, lighter uniforms, easy access to washrooms and cold water, extra short breaks, and moving important meetings to a time of day that works better. Most cost little or nothing. Work with HR to put changes in place and review them over time.',
 NULL, @author, 'manager'),

('Privacy and confidentiality', 'Workplace Support',
 'Health information belongs to the employee. Only share it with people who need to know, and only with the employee''s permission. Record the accommodation that was agreed, not medical details. Team members do not need to know why someone has a flexible schedule.',
 NULL, @author, 'manager'),

('Your duty to accommodate (Canada)', 'Workplace Support',
 'Canadian human rights laws require employers to accommodate employees'' health-related needs up to the point of undue hardship. Menopause symptoms can be part of this. If an employee asks for help, take the request seriously, involve HR, and look for a solution together. Your HR team can explain the rules for your province or territory.',
 NULL, @author, 'manager'),

('Building a menopause-friendly team culture', 'Leadership',
 'Talk about menopause the same way you would any other health topic. Do not allow jokes about it. Share the Education Materials and the Accommodations & Benefits page with your team, remind people about the Employee Assistance Program, and keep an eye on workloads. When people feel safe to speak up, problems are solved earlier.',
 NULL, @author, 'manager');

SELECT 'Education content added' AS result;
