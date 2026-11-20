CREATE FUNCTION touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
CREATE TABLE evaluations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE CHECK(length(trim(code))>0),
 account text NOT NULL CHECK(length(trim(account))>0), name text NOT NULL CHECK(length(trim(name))>0),
 engineer text NOT NULL CHECK(length(trim(engineer))>0), due_date date NOT NULL,
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','technical-win','technical-loss','paused')),
 purpose text NOT NULL DEFAULT '', reviewed_on date, retention_review date,
 value_amount numeric(14,2), currency text,
 CHECK((value_amount IS NULL AND currency IS NULL) OR (value_amount IS NOT NULL AND value_amount>=0 AND currency IS NOT NULL AND currency ~ '^[A-Z]{3}$')),
 source_id text UNIQUE, source_stage text, source_row jsonb, source_hash text,
 decision_note text, decision_by text, decision_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX evaluation_code_folded ON evaluations(lower(code));
CREATE TABLE criteria (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), evaluation_id uuid NOT NULL REFERENCES evaluations(id),
 name text NOT NULL CHECK(length(trim(name))>0), mandatory boolean NOT NULL DEFAULT true,
 expected text NOT NULL CHECK(length(trim(expected))>0), status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','passed','failed')),
 evidence text NOT NULL DEFAULT '', reviewer text, reviewed_on date,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(evaluation_id,name), CHECK(status='pending' OR (length(trim(evidence))>0 AND reviewer IS NOT NULL AND length(trim(reviewer))>0 AND reviewed_on IS NOT NULL))
);
CREATE TABLE gaps (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), evaluation_id uuid NOT NULL REFERENCES evaluations(id),
 feature text NOT NULL CHECK(length(trim(feature))>0), owner text NOT NULL CHECK(length(trim(owner))>0),
 due_date date NOT NULL, blocking boolean NOT NULL DEFAULT true,
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),
 evidence text NOT NULL DEFAULT '', resolution text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(status='open' OR (resolution IS NOT NULL AND length(trim(resolution))>0))
);
CREATE TABLE activities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), evaluation_id uuid NOT NULL REFERENCES evaluations(id),
 engineer text NOT NULL, occurred_on date NOT NULL, minutes integer NOT NULL CHECK(minutes>0 AND minutes<=1440),
 kind text NOT NULL CHECK(kind IN ('discovery','demo','poc','review','handover')),
 note text NOT NULL CHECK(length(trim(note))>0), actor text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE imports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source text NOT NULL, exported_at timestamptz NOT NULL,
 digest text NOT NULL, original_csv text NOT NULL, mapping jsonb NOT NULL, row_count integer NOT NULL,
 actor text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), evaluation_id uuid REFERENCES evaluations(id),
 action text NOT NULL, actor text NOT NULL, detail jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
DO $$ DECLARE n text; BEGIN FOREACH n IN ARRAY ARRAY['evaluations','criteria','gaps','activities','imports','audit'] LOOP
 EXECUTE format('CREATE TRIGGER touch_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION touch_updated_at()',n,n);
 EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',n);
 EXECUTE format('REVOKE ALL ON %I FROM public',n);
END LOOP; END $$;
CREATE VIEW scorecards AS
SELECT e.id,e.code,e.account,e.name,e.engineer,e.status,e.due_date,e.reviewed_on,
 (SELECT count(*) FROM criteria c WHERE c.evaluation_id=e.id) AS criteria_count,
 (SELECT count(*) FROM criteria c WHERE c.evaluation_id=e.id AND c.mandatory) AS required_count,
 (SELECT count(*) FROM criteria c WHERE c.evaluation_id=e.id AND c.mandatory AND c.status<>'passed') AS required_unproven,
 (SELECT count(*) FROM gaps g WHERE g.evaluation_id=e.id AND g.blocking AND g.status='open') AS blockers,
 (SELECT coalesce(sum(a.minutes),0) FROM activities a WHERE a.evaluation_id=e.id) AS effort_minutes
FROM evaluations e;
CREATE VIEW attention AS SELECT code,account,engineer,due_date,required_unproven,blockers,
 CASE WHEN due_date<current_date THEN 'overdue' WHEN reviewed_on IS NULL OR reviewed_on<current_date-14 THEN 'review stale' ELSE 'evidence missing' END AS reason
FROM scorecards WHERE status='active' AND (due_date<current_date OR reviewed_on IS NULL OR reviewed_on<current_date-14 OR required_unproven>0 OR blockers>0 OR required_count=0);
CREATE VIEW proof_plan AS SELECT e.code,c.name AS criterion,c.mandatory,c.expected,c.status,c.reviewer,c.reviewed_on,c.evidence
FROM criteria c JOIN evaluations e ON e.id=c.evaluation_id;
CREATE VIEW product_gaps AS SELECT g.id,e.code,g.feature,g.owner,g.due_date,g.blocking,g.status,g.evidence,g.resolution FROM gaps g JOIN evaluations e ON e.id=g.evaluation_id;
CREATE VIEW effort_review AS SELECT engineer,kind,sum(minutes) AS minutes,count(*) AS entries FROM activities
WHERE occurred_on BETWEEN current_date-6 AND current_date GROUP BY engineer,kind;
CREATE VIEW compliance AS
SELECT code,'NZ-IPP1' AS rule,'Record a purpose for personal information' AS finding FROM evaluations WHERE trim(purpose)=''
UNION ALL SELECT code,'NZ-IPP8','Review accuracy before use' FROM evaluations WHERE reviewed_on IS NULL OR reviewed_on<current_date-14
UNION ALL SELECT code,'NZ-IPP9','Review the continued need to retain these records' FROM evaluations WHERE retention_review IS NULL OR retention_review<=current_date
UNION ALL SELECT e.code,'EVIDENCE-1','Technical win lacks required proof or has open blockers' FROM evaluations e JOIN scorecards s ON e.id=s.id WHERE e.status='technical-win' AND(s.required_count=0 OR s.required_unproven>0 OR s.blockers>0);
CREATE VIEW source_freshness AS SELECT source,max(exported_at) AS last_export,count(*) AS batches FROM imports GROUP BY source;

CREATE VIEW revenue_review AS
SELECT e.currency,count(*) AS evaluations,sum(e.value_amount) AS pipeline_amount,
 sum(CASE WHEN s.required_unproven>0 OR s.blockers>0 OR s.required_count=0 THEN e.value_amount ELSE 0 END) AS unproven_amount,
 count(*) FILTER(WHERE e.value_amount IS NULL) AS unknown_values
FROM evaluations e JOIN scorecards s ON s.id=e.id WHERE e.status='active' GROUP BY e.currency;
CREATE VIEW win_review AS
SELECT engineer,count(*) FILTER(WHERE status='technical-win') AS technical_wins,
 count(*) FILTER(WHERE status='technical-loss') AS technical_losses,
 count(*) FILTER(WHERE status='active') AS active_evaluations,
 count(*) FILTER(WHERE status='paused') AS paused_evaluations
FROM evaluations GROUP BY engineer;
