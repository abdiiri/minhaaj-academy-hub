// User and Role Types
// Role type matching database enum
export type UserRole = 'admin' | 'staff' | 'parent';

// Database profile type
export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// Database user role type
export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

// Curriculum Types
export type Curriculum = 'CBE' | 'Edexcel' | 'Islamic';

export type CBELevel = 'Playgroup' | 'PP1' | 'PP2' | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' | 'Grade 5' | 'Grade 6' | 'Grade 7' | 'Grade 8' | 'Grade 9';
export type EdexcelLevel = 'Year 4' | 'Year 5' | 'Year 6' | 'Year 7' | 'Year 8';

// Student Types
export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  curriculum: Curriculum;
  classId: string;
  className?: string;
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated';
  photoUrl?: string;
}

// Staff Types
export interface Staff {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'teacher' | 'admin_staff' | 'support';
  subjects?: string[];
  assignedClasses?: string[];
  joinDate: string;
  status: 'active' | 'inactive';
  photoUrl?: string;
}

// Class Types
export interface SchoolClass {
  id: string;
  name: string;
  curriculum: Curriculum;
  level: string;
  section?: string;
  teacherId?: string;
  teacherName?: string;
  subjects: string[];
  studentCount: number;
  academicYear: string;
}

// Fee Types
export interface FeeStructure {
  id: string;
  classId: string;
  className: string;
  termFee: number;
  admissionFee?: number;
  uniformFee?: number;
  booksFee?: number;
  transportFee?: number;
  totalFee: number;
  academicYear: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'mpesa' | 'bank' | 'cash';
  transactionRef?: string;
  proofImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface StudentFeeBalance {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  totalFees: number;
  totalPaid: number;
  balance: number;
}

// Results Types
export interface Result {
  id: string;
  studentId: string;
  classId: string;
  subject: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  academicYear: string;
  marks: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
}

// Settings Types
export interface SchoolSettings {
  name: string;
  tagline: string;
  logoUrl: string;
  email: string;
  phones: string[];
  address: string;
  website: string;
  academicYear: string;
  currentTerm: 'Term 1' | 'Term 2' | 'Term 3';
}

// Dashboard Stats
export interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  feesCollected: number;
  pendingPayments: number;
  activeClasses: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: 'enrollment' | 'payment' | 'result' | 'staff';
  message: string;
  timestamp: string;
  icon?: string;
}
