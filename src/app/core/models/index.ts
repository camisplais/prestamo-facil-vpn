// --- Product -----------------------------------------------------------------
export interface Product {
  id: number;
  name: string;
  quantity: number;
  fortnights: number;
  deposit: number;
  interest: number;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export type ProductForm = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

// --- Address -----------------------------------------------------------------
export interface Address {
  id?: number;
  street: string;
  exterior_number: string;
  interior_number?: string;
  neighborhood: string;
  postal_code: string;
  city: string;
  state: string;
  country?: string;
  references?: string;
}

// --- Subsidiary ---------------------------------------------------------------
export interface Subsidiary {
  id: number;
  name: string;
  phone?: string;
  address_id?: number;
  address?: Address;
  created_at?: string;
}

export interface SubsidiaryForm {
  name: string;
  phone?: string;
  address: Address;
}

// --- PersonData ---------------------------------------------------------------
export interface PersonData {
  id?: number;
  name: string;
  first_last_name: string;
  second_last_name?: string;
  gender?: 'M' | 'F' | 'O';
  birth_date?: string;
  curp?: string;
  rfc?: string;
  ine?: string;
  personal_phone_number?: string;
  phone_number?: string;
  neighborhood?: string;
  postal_code?: string;
  street?: string;
  house_number?: string;
}

// --- Employee (Coordinador / Verificador) ------------------------------------
export interface Employee {
  id: number;
  code?: string;
  email: string;
  status: boolean;
  subsidiary_id?: number;
  subsidiary?: string;
  created_at?: string;
  person_data?: PersonData;
}

export interface EmployeeForm {
  email: string;
  password?: string;
  password_confirmation?: string;
  subsidiary_id: number;
  manager_id?: number;
  person_data: PersonData;
}

// --- Auth --------------------------------------------------------------------
export interface LoginPayload {
  email: string;
  password: string;
  recaptcha_token: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  status: boolean;
  subsidiary_id?: number;
  roles?: string[];
}

// --- Gerente / Solicitudes ----------------------------------------------------
export interface UserSummary {
  id: number;
  name: string;
  email: string;
}

export interface DistributorCategory {
  id: number;
  name: string;
  percentage: string | number;
}

export interface DistributorUser {
  id: number;
  name: string;
  email: string;
  code?: string;
  status: boolean;
}

export interface DistributorCredit {
  current_credit: string | number;
  available_credit: string | number;
  credit_limit: string | number;
}

export interface DistributorRecord {
  id: number;
  points: number;
  current_credit: string | number;
  available_credit: string | number;
  status: boolean;
  creditBureauHit?: boolean | null;
  reference_number?: string | null;
  category?: DistributorCategory | null;
  personData?: PersonData | null;
  pre_application_id?: number;
}

export interface Distributor {
  id: number;
  points: number;
  status: boolean;
  creditBureauHit?: boolean | null;
  referenceNumber?: string | null;
  preApplicationId?: number | null;
  category?: DistributorCategory | null;
  credit?: DistributorCredit | null;
  user?: DistributorUser | null;
  personData?: PersonData | null;
  created_at?: string;
  updated_at?: string;
}

export interface DistributorForm {
  email?: string;
  password?: string;
  password_confirmation?: string;
  pre_application_id?: number;
  category_id?: number;
  credit_bureau_hit?: boolean | null;
  credit_limit: number;
  person_data?: PersonData;
}

export interface DistributorAccountForm {
  email: string;
  password: string;
  password_confirmation: string;
  credit_limit: number;
}

export interface IncentivePointValue {
  id: number;
  subsidiary_id: number;
  value: number;
  created_at?: string;
  updated_at?: string;
}

export interface IncentivePointDivisor {
  id: number;
  subsidiary_id: number;
  value: number;
  created_at?: string;
  updated_at?: string;
}

export interface PreApplicationVehicle {
  id: number;
  brand?: string | null;
  model?: string | null;
  plate?: string | null;
  type?: string | null;
  serial_number?: string | null;
}

export interface PreApplicationFamilyMember {
  id: number;
  relationship: string;
  personalData?: PersonData | null;
}

export interface PreApplicationAffiliation {
  id: number;
  credit_limit: string | number;
  externalSubsidiary?: Subsidiary | { id: number; name: string } | null;
}

export interface GerenteSolicitud {
  id: number;
  status: 'pending' | 'verified' | 'approved' | 'rejected' | string;
  coordinates?: string | null;
  proof_of_address?: string | null;
  credit_bureau?: string | null;
  credit_bureau_hit?: boolean | null;
  credit_bureau_checked_at?: string | null;
  house_picture?: string[] | null;
  notes?: string | null;
  manager_id?: number | null;
  manager_decided_at?: string | null;
  manager_notes?: string | null;
  subsidiary_id?: number | null;
  verifier_id?: number | null;
  verified_at?: string | null;
  person_data_id?: number | null;
  created_at?: string;
  updated_at?: string;
  personData?: PersonData | null;
  coordinator?: UserSummary | null;
  verifier?: UserSummary | null;
  manager?: UserSummary | null;
  creditBureauChecker?: UserSummary | null;
  vehicles?: PreApplicationVehicle[];
  familyMembers?: PreApplicationFamilyMember[];
  affiliations?: PreApplicationAffiliation[];
  distributor?: DistributorRecord | null;
}

export interface GerenteDecisionPayload {
  decision: 'approved' | 'rejected';
  comentario?: string;
}

// --- Gerente / Reclamos -------------------------------------------------------
export interface ReclamoDistributor {
  id: number;
  points: number;
  current_credit: string | number;
  available_credit: string | number;
  reference_number?: string | null;
  status: boolean;
  category?: DistributorCategory | null;
  personData?: PersonData | null;
}

export interface Reclamo {
  id: number;
  type: 'money_claim' | 'credit_increase' | 'redeem_points';
  status: 'pending' | 'approved' | 'rejected' | 'closed';
  comments?: string | null;
  decision_notes?: string | null;
  decided_at?: string | null;
  amount_approved?: number | null;
  reference_number?: string | null;
  attachments?: string[] | null;
  manager_id?: number | null;
  cashier_id?: number | null;
  distributor_id?: number;
  created_at?: string;
  updated_at?: string;
  distributor?: ReclamoDistributor | null;
  cashier?: UserSummary | null;
}

export interface ReclamoDecisionPayload {
  decision: 'approved' | 'rejected';
  decision_notes?: string;
  amount_approved?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// --- API generic response -----------------------------------------------------
export interface ApiList<T> {
  data: T[];
}

export interface ApiItem<T> {
  data: T;
  message?: string;
}

// ─── Reclamo (módulo coordinador) ─────────────────────────────────────────────
// Los reclamos del coordinador vienen de la tabla `applications`.
// La distribuidora los crea ahí con type = change_clients | overdue_customer
// y coordinador_id asignado. El coordinador solo aprueba o rechaza.
 
export type CoordinadorReclamoType = 'change_clients' | 'overdue_customer';
// Status de applications: pending → aprobado/rechazado por coordinador
export type CoordinadorReclamoStatus = 'pending' | 'approved' | 'rejected' | 'closed';
// Para compatibilidad de vistas: resolvemos como approved/rejected directamente en status
export type CoordinadorReclamoResolution = 'approved' | 'rejected' | null;
 
export interface CoordinadorReclamoPersonData {
  name: string;
  first_last_name: string;
  second_last_name?: string;
}
 
export interface CoordinadorReclamoFinalCustomer {
  id: number;
  person_data?: CoordinadorReclamoPersonData;
}
 
export interface CoordinadorReclamoDistributor {
  id: number;
  reference_number?: string;
  person_data?: CoordinadorReclamoPersonData;
}
 
// Application tal como la devuelve el backend al coordinador
// El nombre del cliente viene como campos planos del JOIN (no como relación anidada)
// para no tener que modificar el modelo Application que usa la distribuidora.
export interface CoordinadorReclamo {
  id: number;
  distributor_id: number;
  type: CoordinadorReclamoType;
  customer_id?: number | null;
  coordinador_id?: number | null;
  comments?: string | null;
  status: CoordinadorReclamoStatus;
  decision_notes?: string | null;
  decided_at?: string | null;
  created_at?: string;
  updated_at?: string;
 
  // Campos planos del JOIN final_customers → person_data
  customer_name?: string | null;
  customer_first_last_name?: string | null;
  customer_second_last_name?: string | null;
 
  // Relación distributor (sí viene via with())
  distributor?: CoordinadorReclamoDistributor;
}
 
export interface CoordinadorReclamoStats {
  total: number;
  pending: number;
  closed: number;           // aprobados + rechazados
  change_clients: number;
  overdue_customer: number;
}
 
export interface CoordinadorReclamoStorePayload {
  type: CoordinadorReclamoType;
  comments: string;
  client_id: number;
  target_distributor_id?: number | null;
}
 
export interface CoordinadorReclamoResolvePayload {
  resolution: 'approved' | 'rejected';
  coordinator_note?: string;
  target_distributor_id?: number | null; // requerido cuando resolution=approved y type=change_clients
}

export interface CoordinadorDistribuidora {
  id: number;
  name: string;
}

// --- ExpirationDate ----------------------------------------------------------
export interface ExpirationDate {
  id: number;
  cutoff_day_1: number;
  cutoff_day_2: number;
  status: 'active' | 'disabled';
  loans_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExpirationDateForm {
  cutoff_day_1: number;
  cutoff_day_2: number;
}

// --- Reconciliation ----------------------------------------------------------
export interface Reconciliation {
  id: number;
  distributor_id: number;
  uploaded_by: number;
  total_biweekly: number;
  previous_debt: number;
  previous_over_payment: number;
  total_expected: number;
  amount_paid: number;
  difference: number;
  over_payment: number;
  debt: number;
  penalty: number;
  period_start: string;
  period_end: string;
  payment_date: string;
  status: 'pending' | 'early' | 'on_time' | 'late';
  created_at?: string;
  updated_at?: string;
  distributor?: ReclamoDistributor | null;
  uploadedBy?: UserSummary | null;
}

export interface ManualReconciliationPayload {
  amount_paid: number;
  payment_date: string;
}


export interface FinalCustomer {
  id?: number;
  person_data_id?: PersonData;
  curp?: string;
  national_id?: string;
  national_id_image?: string;
  proof_of_address?: string;
  distributor_id?: number;
  last_id?: number;
  status?: string;
  
}

// --- My Payments (Distribuidora) ---------------------------------------------
export interface MyPaymentsSummary {
  total_biweekly: number;
  current_debt: number;
  current_over_payment: number;
  next_payment_date: string;
  next_expected: number;
}

export interface MyPaymentsPagination {
  data: Reconciliation[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface MyPaymentsResponse {
  summary: MyPaymentsSummary;
  history: MyPaymentsPagination;
}