DO $$
DECLARE a uuid; b uuid; c uuid;
BEGIN
 IF EXISTS(SELECT 1 FROM evaluations) THEN RETURN; END IF;
 INSERT INTO evaluations(code,account,name,engineer,due_date,purpose,reviewed_on,retention_review) VALUES
 ('DEMO-101','Harbour Software','Warehouse connector evaluation','Alex Morgan',current_date-3,'Evaluate connector requirements',current_date-21,current_date+90) RETURNING id INTO a;
 INSERT INTO evaluations(code,account,name,engineer,due_date,purpose,reviewed_on,retention_review) VALUES
 ('DEMO-102','Harbour Systems','Identity rollout evaluation','Jamie Chen',current_date+8,'',NULL,current_date-1) RETURNING id INTO b;
 INSERT INTO evaluations(code,account,name,engineer,due_date,purpose,reviewed_on,retention_review) VALUES
 ('DEMO-103','Kauri Analytics','Reporting proof of concept','Alex Morgan',current_date+4,'Test agreed reporting requirements',current_date,current_date+60) RETURNING id INTO c;
 UPDATE evaluations SET value_amount=80000,currency='NZD' WHERE id=a;
 UPDATE evaluations SET value_amount=65000,currency='AUD' WHERE id=b;
 UPDATE evaluations SET value_amount=45000,currency='NZD' WHERE id=c;
 INSERT INTO criteria(evaluation_id,name,expected,status,evidence,reviewer,reviewed_on) VALUES
 (a,'Incremental refresh','Refresh the agreed synthetic dataset within 20 minutes','passed','Synthetic test run DEMO-R1: 12 minutes','Alex Morgan',current_date-2),
 (a,'Recovery after outage','Resume without duplicate records','failed','Synthetic test run DEMO-R2: duplicates observed','Alex Morgan',current_date-1),
 (b,'Single sign-on','Validate the agreed identity test accounts','pending','',NULL,NULL),
 (c,'Filtered report','Match all ten agreed synthetic totals','passed','Synthetic comparison DEMO-R3: ten totals matched','Jamie Chen',current_date);
 INSERT INTO gaps(evaluation_id,feature,owner,due_date,evidence) VALUES
 (a,'Replay deduplication','Product lead',current_date-1,'Synthetic reproduction DEMO-R2'),
 (b,'Tenant role mapping','Identity lead',current_date+3,'Discovery note DEMO-D1');
 INSERT INTO activities(evaluation_id,engineer,occurred_on,minutes,kind,note,actor) VALUES
 (a,'Alex Morgan',current_date-2,120,'poc','Ran synthetic refresh and recovery checks','Demo seed'),
 (a,'Alex Morgan',current_date-1,60,'review','Reviewed duplicate records with product','Demo seed'),
 (b,'Jamie Chen',current_date,90,'discovery','Agreed identity acceptance criteria','Demo seed'),
 (c,'Alex Morgan',current_date-1,75,'demo','Walked through synthetic totals','Demo seed');
 INSERT INTO audit(evaluation_id,action,actor,detail) SELECT id,'seed','Demo seed','{"synthetic":true}'::jsonb FROM evaluations;
END $$;
