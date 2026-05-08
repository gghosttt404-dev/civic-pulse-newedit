
-- USERS
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE,
  name text, phone text, email text,
  state text, district text, pincode text,
  age integer, gender text, caste_category text,
  education_level text, education_stream text,
  occupation text, employer_type text,
  monthly_income integer, household_size integer,
  bpl_status boolean DEFAULT false,
  ration_card_type text, land_holding_acres float,
  bank_account_type text,
  preferred_language text DEFAULT 'en',
  profile_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- PROJECTS
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, state text, district text, block text,
  lat float, lng float,
  sanctioned_amount numeric, release_date date, claimed_completion_date date,
  executing_agency text, project_type text,
  ghost_score integer, progress_score integer, severity text,
  construction_detected boolean,
  gemini_analysis text, evidence_points jsonb DEFAULT '[]'::jsonb,
  satellite_image_url text, citizen_reports jsonb DEFAULT '[]'::jsonb,
  rti_status text DEFAULT 'NONE',
  status text DEFAULT 'ACTIVE',
  created_at timestamptz DEFAULT now()
);

-- RTIS
CREATE TABLE public.rtis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  rti_type text, pio_name text, pio_address text, department text,
  subject_line text, body_english text, body_hindi text,
  annexure jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'DRAFTED',
  tracking_number text,
  generated_at timestamptz DEFAULT now(),
  filed_at timestamptz, response_due date
);

-- SCHEMES
CREATE TABLE public.schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, ministry text, scheme_type text, state_specific text,
  category text, benefit_description text, benefit_value text,
  eligibility_summary text,
  min_age integer, max_age integer,
  eligible_genders text DEFAULT 'ALL',
  eligible_castes text DEFAULT 'ALL',
  min_income_limit integer, requires_bpl boolean DEFAULT false,
  education_required text, occupation_required text,
  application_url text, portal_name text,
  deadline date, is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- SCHEME MATCHES
CREATE TABLE public.scheme_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  scheme_id uuid REFERENCES public.schemes(id) ON DELETE CASCADE,
  eligibility_score float,
  application_status text DEFAULT 'NOT_APPLIED',
  prefilled_data jsonb, documents_required jsonb DEFAULT '[]'::jsonb,
  matched_at timestamptz DEFAULT now(), applied_at timestamptz
);

-- COMMUNITY PROPOSALS
CREATE TABLE public.community_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  recovered_amount_est numeric,
  proposed_use jsonb DEFAULT '[]'::jsonb,
  district text, state text, submitted_to text,
  status text DEFAULT 'DRAFT',
  success_story boolean DEFAULT false,
  success_description text,
  created_at timestamptz DEFAULT now()
);

-- CITIZEN REPORTS
CREATE TABLE public.citizen_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  submitted_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  photo_url text, note text,
  lat float, lng float,
  verified boolean DEFAULT false, ai_analysis text,
  created_at timestamptz DEFAULT now()
);

-- NAGRIKBOT CONVERSATIONS
CREATE TABLE public.nagrikbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  messages jsonb DEFAULT '[]'::jsonb,
  module_context text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rtis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nagrikbot_conversations ENABLE ROW LEVEL SECURITY;

-- Public read tables
CREATE POLICY "public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "public read schemes" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "public read proposals" ON public.community_proposals FOR SELECT USING (true);
CREATE POLICY "public read citizen reports" ON public.citizen_reports FOR SELECT USING (true);
CREATE POLICY "public insert citizen reports" ON public.citizen_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert proposals" ON public.community_proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "public update projects" ON public.projects FOR UPDATE USING (true);

-- User-scoped (using auth_id)
CREATE POLICY "users self read" ON public.users FOR SELECT USING (auth_id = auth.uid() OR auth_id IS NULL);
CREATE POLICY "users self insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "users self update" ON public.users FOR UPDATE USING (auth_id = auth.uid() OR auth_id IS NULL);

CREATE POLICY "rtis read all" ON public.rtis FOR SELECT USING (true);
CREATE POLICY "rtis insert" ON public.rtis FOR INSERT WITH CHECK (true);
CREATE POLICY "rtis update" ON public.rtis FOR UPDATE USING (true);

CREATE POLICY "matches read" ON public.scheme_matches FOR SELECT USING (true);
CREATE POLICY "matches insert" ON public.scheme_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "matches update" ON public.scheme_matches FOR UPDATE USING (true);

CREATE POLICY "convos read" ON public.nagrikbot_conversations FOR SELECT USING (true);
CREATE POLICY "convos insert" ON public.nagrikbot_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "convos update" ON public.nagrikbot_conversations FOR UPDATE USING (true);

-- ============= SEED PROJECTS (15) =============
INSERT INTO public.projects (name, state, district, block, lat, lng, sanctioned_amount, release_date, claimed_completion_date, executing_agency, project_type, ghost_score, progress_score, severity, construction_detected, gemini_analysis, evidence_points, satellite_image_url) VALUES
('PMGSY Road Phulwari-Khairi', 'Bihar', 'Patna', 'Phulwari', 25.5941, 85.1376, 245.5, '2022-03-15', '2023-06-30', 'Bihar Rural Works Dept', 'ROAD', 92, 8, 'CRITICAL', false, 'Satellite imagery shows the same dirt track present in 2021 baseline imagery. No bituminous surfacing detected. Vegetation patterns consistent with abandoned land.', '["No road surface visible in 2024 imagery","Same dirt path present in 2021 baseline","Zero construction equipment detected across 18 months","Local panchayat records show no completion certificate","Payment released in full per Treasury Bihar"]'::jsonb, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'),
('Anganwadi Centre Khunti-12', 'Jharkhand', 'Khunti', 'Murhu', 23.0743, 85.2799, 18.0, '2021-08-10', '2022-12-15', 'Jharkhand WCD', 'ANGANWADI', 88, 12, 'CRITICAL', false, 'Site location coordinates show empty plot. No structure visible. Adjacent village shows 14 functional anganwadis but no construction at this GPS.', '["Empty plot at GPS coordinates","No foundation work detected","Allocated funds fully utilised per records","Block officer unreachable for verification"]'::jsonb, 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800'),
('Primary School Building Yavatmal', 'Maharashtra', 'Yavatmal', 'Wani', 20.0539, 78.9395, 65.0, '2020-11-20', '2022-04-30', 'MH Education Dept', 'SCHOOL', 76, 25, 'HIGH', true, 'Partial single-story structure visible. Roof incomplete. No painting or finishing. Claimed completion was 2022 but progress stalled.', '["Only 25% structure visible vs claimed 100%","No roof on 60% of building","Construction halted per imagery from Q3 2022","Children still studying under tree per local reports"]'::jsonb, 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800'),
('Community Health Centre Barmer', 'Rajasthan', 'Barmer', 'Sheo', 26.2389, 71.4181, 320.0, '2021-05-12', '2023-03-15', 'NHM Rajasthan', 'HEALTH', 84, 15, 'CRITICAL', false, 'Boundary wall partially constructed. No main building. Sand has covered foundation lines. Likely abandoned post-foundation.', '["Only boundary wall + foundation visible","No main building structure","Sand covering work area indicates abandonment","CHC officially listed as operational on NHM portal"]'::jsonb, 'https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?w=800'),
('Bridge over Ken River', 'Madhya Pradesh', 'Panna', 'Ajaygarh', 24.7197, 80.1937, 1250.0, '2019-02-08', '2021-12-31', 'MPRRDA', 'BRIDGE', 95, 5, 'CRITICAL', false, 'No bridge structure detected. Pillars from 2019 visible but no deck. River crossing still done by ferry per news reports.', '["Zero deck construction in 5 years","Only 4 of 12 planned pillars built","Ferry service still operating at this location","₹12.5 crore released in tranches","No contractor blacklisting despite delay"]'::jsonb, 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800'),
('PMGSY Road Etawah-Jaitpura', 'Uttar Pradesh', 'Etawah', 'Bharthana', 26.7854, 79.0150, 180.0, '2022-07-22', '2024-01-30', 'UPRRDA', 'ROAD', 70, 35, 'HIGH', true, 'Partial WBM layer visible. Bitumen layer missing on 65% of stretch. Drainage incomplete.', '["Bitumen layer absent on majority","Side drains not constructed","Last 800m connects nowhere","Quality below IRC specs per visual"]'::jsonb, 'https://images.unsplash.com/photo-1578307039773-7c0d09e89f15?w=800'),
('Anganwadi Sitamarhi-7', 'Bihar', 'Sitamarhi', 'Pupri', 26.5945, 85.4839, 22.0, '2023-01-10', '2024-03-30', 'Bihar ICDS', 'ANGANWADI', 45, 60, 'MEDIUM', true, 'Building exists but appears unused. Walls plastered, no paint. No anganwadi signage visible.', '["Structure complete but unused","No signage or branding","Door appears locked in all imagery","No children/staff visible"]'::jsonb, 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800'),
('Shahpur Drinking Water Pipeline', 'Karnataka', 'Yadgir', 'Shahpur', 16.6921, 76.8447, 425.0, '2020-09-01', '2022-06-30', 'KUWSDB', 'OTHER', 78, 22, 'HIGH', false, 'Trenching visible but pipes not laid in 70% of the route. Overhead tank built but empty.', '["Pipeline trenches dug but no pipes","Overhead tank dry per villager reports","Connections only in panchayat office","Project marked complete on portal"]'::jsonb, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800'),
('Govt High School Hapur', 'Uttar Pradesh', 'Hapur', 'Garhmukteshwar', 28.7850, 78.0950, 95.0, '2021-04-15', '2022-10-30', 'UP Basic Edu', 'SCHOOL', 38, 70, 'MEDIUM', true, 'Building functional. Some additional rooms claimed but only foundation visible.', '["Main building complete and operational","Claimed 4 additional classrooms missing","Toilet block reduced in size from sanctioned"]'::jsonb, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800'),
('Rural Road Bandipora-Nadihal', 'Maharashtra', 'Nashik', 'Igatpuri', 19.7008, 73.5604, 155.0, '2022-02-18', '2023-08-30', 'MRRDA', 'ROAD', 25, 85, 'LOW', true, 'Road appears largely complete. Bitumen layer present. Minor work remaining on shoulders.', '["95% bitumen complete","Drainage in place","Shoulder work pending in last 200m"]'::jsonb, 'https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=800'),
('Rural Hospital Chitradurga', 'Karnataka', 'Chitradurga', 'Holalkere', 14.0511, 76.1744, 580.0, '2019-06-25', '2021-09-30', 'NHM Karnataka', 'HEALTH', 82, 18, 'CRITICAL', false, 'Building shell visible but no medical equipment, no signage. Village reports it is non-functional.', '["Building shell only","No equipment installation","No staff posted","Hospital marked operational in HMIS"]'::jsonb, 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800'),
('PMGSY Road Surguja-1', 'Madhya Pradesh', 'Sidhi', 'Kusmi', 24.3940, 81.8821, 210.0, '2021-12-01', '2023-05-30', 'MPRRDA', 'ROAD', 65, 40, 'HIGH', true, 'Road exists but quality is poor. Multiple potholes within months of supposed completion. Width below specification.', '["Width is 3m vs specified 3.75m","Surface failing within months","No quality control test records","Contractor not blacklisted"]'::jsonb, 'https://images.unsplash.com/photo-1517999349371-c43520457b23?w=800'),
('Govt Primary School Alwar', 'Rajasthan', 'Alwar', 'Behror', 27.8851, 76.2825, 72.0, '2022-08-30', '2023-12-15', 'Raj Edu Dept', 'SCHOOL', 30, 80, 'LOW', true, 'School functional. Most facilities present. Boundary wall complete.', '["Building functional","Minor facilities pending","Reported running smoothly"]'::jsonb, 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'),
('Bridge over Kosi tributary', 'Bihar', 'Madhepura', 'Singheshwar', 25.9230, 86.7912, 890.0, '2020-04-12', '2022-08-30', 'BRPNNL', 'BRIDGE', 89, 11, 'CRITICAL', false, 'Two pillars built. No deck. River crossing remains by boat. Locals report contractor disappeared.', '["Only 2 of 8 pillars","No deck started","Boat crossings continue","Contractor untraceable per RTI"]'::jsonb, 'https://images.unsplash.com/photo-1502786129293-79981df4e689?w=800'),
('Anganwadi Centre Latehar', 'Jharkhand', 'Latehar', 'Manika', 23.7444, 84.5031, 19.5, '2022-11-08', '2023-09-30', 'JH WCD', 'ANGANWADI', 58, 50, 'MEDIUM', true, 'Half-completed structure. Walls up but no roof. Construction stalled for 8 months.', '["Walls complete, roof missing","Stalled for 8 months","Funds 70% utilised","No revised timeline"]'::jsonb, 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800');

-- ============= SEED SCHEMES (20) =============
INSERT INTO public.schemes (name, ministry, scheme_type, state_specific, category, benefit_description, benefit_value, eligibility_summary, min_age, max_age, eligible_genders, eligible_castes, min_income_limit, requires_bpl, education_required, occupation_required, application_url, portal_name) VALUES
('PM-KISAN', 'Ministry of Agriculture', 'CENTRAL', NULL, 'AGRICULTURE', 'Direct income support to landholding farmer families', '₹6,000/year', 'Landholding farmer families with cultivable land', 18, 100, 'ALL', 'ALL', NULL, false, NULL, 'FARMER', 'https://pmkisan.gov.in', 'PM-KISAN Portal'),
('PM Awas Yojana - Gramin', 'Ministry of Rural Development', 'CENTRAL', NULL, 'HOUSING', 'Financial assistance for construction of pucca house in rural areas', '₹1.20 lakh (plain) / ₹1.30 lakh (hilly)', 'Houseless and households with kutcha houses, BPL preferred', 18, 100, 'ALL', 'ALL', 300000, true, NULL, NULL, 'https://pmayg.nic.in', 'PMAY-G Portal'),
('Sukanya Samriddhi Yojana', 'Ministry of Finance', 'CENTRAL', NULL, 'WOMEN', 'Small deposit savings scheme for girl child', 'Up to ₹1.5L/year @ 8.2% interest', 'Girl child below 10 years; account by parent/guardian', 0, 10, 'FEMALE', 'ALL', NULL, false, NULL, NULL, 'https://www.indiapost.gov.in', 'India Post'),
('Ayushman Bharat - PMJAY', 'Ministry of Health', 'CENTRAL', NULL, 'HEALTH', 'Health cover for secondary and tertiary hospitalisation', 'Up to ₹5 lakh/family/year', 'SECC 2011 deprivation criteria; bottom 40% population', 0, 100, 'ALL', 'ALL', NULL, true, NULL, NULL, 'https://pmjay.gov.in', 'PMJAY'),
('PM Mudra Yojana', 'Ministry of Finance', 'CENTRAL', NULL, 'STARTUP', 'Collateral-free loans for micro enterprises', 'Up to ₹10 lakh', 'Non-farm income-generating activities; non-corporate small businesses', 18, 100, 'ALL', 'ALL', NULL, false, NULL, 'SELF', 'https://www.mudra.org.in', 'MUDRA Portal'),
('National Scholarship - Post Matric SC', 'Ministry of Social Justice', 'CENTRAL', NULL, 'EDUCATION', 'Scholarship for SC students pursuing post-matric studies', '₹230 to ₹1,200/month + fees', 'SC students; family income below ₹2.5 lakh', 16, 35, 'ALL', 'SC_ST', 250000, false, 'CLASS_10', NULL, 'https://scholarships.gov.in', 'NSP'),
('Beti Bachao Beti Padhao', 'Ministry of WCD', 'CENTRAL', NULL, 'WOMEN', 'Improving sex ratio and education of girl child', 'Awareness + scholarships', 'Girl children and families', 0, 18, 'FEMALE', 'ALL', NULL, false, NULL, NULL, 'https://wcd.nic.in', 'WCD'),
('PM Vishwakarma Yojana', 'Ministry of MSME', 'CENTRAL', NULL, 'SKILL', 'Recognition and support for traditional artisans', '₹15,000 toolkit + ₹3 lakh loan', 'Artisans/craftspeople from 18 trades', 18, 100, 'ALL', 'ALL', NULL, false, NULL, 'SELF', 'https://pmvishwakarma.gov.in', 'PM Vishwakarma'),
('PMKVY 4.0', 'Ministry of Skill Development', 'CENTRAL', NULL, 'SKILL', 'Short-term skill training and certification', 'Free training + ₹8,000 placement bonus', 'Indian youth, school/college dropouts welcome', 15, 45, 'ALL', 'ALL', NULL, false, NULL, NULL, 'https://www.pmkvyofficial.org', 'PMKVY'),
('Atal Pension Yojana', 'Ministry of Finance', 'CENTRAL', NULL, 'SENIOR', 'Pension scheme for unorganised sector workers', '₹1,000 to ₹5,000/month after 60', 'Indian citizens, non-income-tax payers', 18, 40, 'ALL', 'ALL', NULL, false, NULL, NULL, 'https://npscra.nsdl.co.in', 'APY'),
('Ladli Behna Yojana', 'MP Govt', 'STATE', 'Madhya Pradesh', 'WOMEN', 'Monthly financial assistance to women', '₹1,250/month', 'Married/divorced/widowed women aged 21-60 in MP', 21, 60, 'FEMALE', 'ALL', 250000, false, NULL, NULL, 'https://cmladlibahna.mp.gov.in', 'MP Ladli Behna'),
('Mukhyamantri Kanya Utthan Yojana', 'Bihar Govt', 'STATE', 'Bihar', 'EDUCATION', 'Financial aid for girls from birth to graduation', '₹54,100 cumulative', 'Girls in Bihar', 0, 25, 'FEMALE', 'ALL', NULL, false, NULL, NULL, 'https://medhasoft.bih.nic.in', 'Bihar e-Kalyan'),
('Mahatma Gandhi NREGA', 'Ministry of Rural Development', 'CENTRAL', NULL, 'RURAL', '100 days guaranteed wage employment in rural areas', '₹220-₹350/day x 100 days', 'Adult members of rural households willing to do manual work', 18, 100, 'ALL', 'ALL', NULL, false, NULL, NULL, 'https://nrega.nic.in', 'MGNREGA'),
('Pradhan Mantri Ujjwala Yojana', 'Ministry of Petroleum', 'CENTRAL', NULL, 'WOMEN', 'LPG connections to women from BPL households', 'Free LPG connection', 'Adult women from BPL households without LPG', 18, 100, 'FEMALE', 'ALL', NULL, true, NULL, NULL, 'https://pmuy.gov.in', 'PMUY'),
('Stand-Up India', 'Ministry of Finance', 'CENTRAL', NULL, 'STARTUP', 'Bank loans for SC/ST and women entrepreneurs', '₹10 lakh to ₹1 crore', 'SC/ST or women entrepreneurs setting up greenfield enterprise', 18, 100, 'ALL', 'SC_ST', NULL, false, NULL, 'SELF', 'https://standupmitra.in', 'Stand-Up India'),
('Deendayal Antyodaya - NRLM', 'Ministry of Rural Development', 'CENTRAL', NULL, 'WOMEN', 'Self-help group support and microcredit', 'Up to ₹3 lakh interest-free loans', 'Rural women in SHGs', 18, 100, 'FEMALE', 'ALL', NULL, false, NULL, NULL, 'https://aajeevika.gov.in', 'DAY-NRLM'),
('Indira Gandhi National Old Age Pension', 'Ministry of Rural Development', 'CENTRAL', NULL, 'SENIOR', 'Monthly pension for BPL elderly', '₹200-₹500/month', 'BPL persons aged 60+', 60, 100, 'ALL', 'ALL', NULL, true, NULL, NULL, 'https://nsap.nic.in', 'NSAP'),
('National Means cum Merit Scholarship', 'Ministry of Education', 'CENTRAL', NULL, 'EDUCATION', 'Scholarship for class 9-12 meritorious students from low-income families', '₹12,000/year', 'Class 9 students with parental income below ₹3.5 lakh', 13, 18, 'ALL', 'ALL', 350000, false, 'CLASS_8', NULL, 'https://scholarships.gov.in', 'NSP'),
('Rashtriya Vayoshri Yojana', 'Ministry of Social Justice', 'CENTRAL', NULL, 'SENIOR', 'Free aids and assistive devices for senior citizens', 'Walking sticks, hearing aids, dentures, spectacles', 'BPL senior citizens 60+ with age-related disabilities', 60, 100, 'ALL', 'ALL', NULL, true, NULL, NULL, 'https://alimco.in', 'ALIMCO'),
('PM Matsya Sampada Yojana', 'Ministry of Fisheries', 'CENTRAL', NULL, 'AGRICULTURE', 'Support for fish farmers and fisheries infrastructure', 'Up to 60% subsidy', 'Fish farmers, fishers, fish vendors', 18, 100, 'ALL', 'ALL', NULL, false, NULL, NULL, 'https://pmmsy.dof.gov.in', 'PMMSY');

-- ============= SEED RTIS (3) =============
INSERT INTO public.rtis (project_id, rti_type, pio_name, pio_address, department, subject_line, body_english, status)
SELECT id, 'GHOST', 'The PIO', 'Office of the District Magistrate, ' || district, executing_agency,
'Information regarding ' || name,
'Under Section 6(1) of the RTI Act, 2005, I request the following information regarding the project "' || name || '" sanctioned for ₹' || sanctioned_amount || ' lakhs in ' || district || ', ' || state || ': 1) Date-wise expenditure statement. 2) Name of contractor and tender documents. 3) Site inspection reports for last 12 months. 4) Geo-tagged completion photos. 5) Third-party quality audit reports.', 'DRAFTED'
FROM public.projects WHERE ghost_score > 80 LIMIT 3;

-- ============= SEED COMMUNITY PROPOSALS (2) =============
INSERT INTO public.community_proposals (project_id, recovered_amount_est, proposed_use, district, state, status)
SELECT id, sanctioned_amount,
'[{"title":"Build 5 functional anganwadi centres","description":"Replace ghost projects with operational early childhood centres","estimated_cost":100},{"title":"Repair 8km existing village road","description":"Fix the road citizens actually use","estimated_cost":80},{"title":"Equip CHC with diagnostic machines","description":"X-ray and ultrasound for nearest functional CHC","estimated_cost":60}]'::jsonb,
district, state, 'SUBMITTED'
FROM public.projects WHERE ghost_score > 85 LIMIT 2;
