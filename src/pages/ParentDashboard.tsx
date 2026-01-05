import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePayments, PaymentInsert } from '@/hooks/usePayments';
import { useStudents } from '@/hooks/useStudents';
import { useFeeStructures } from '@/hooks/useFeeStructures';
import { useClasses } from '@/hooks/useClasses';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Copy,
  Smartphone,
  Building2,
  Upload,
  Plus,
  Loader2,
  GraduationCap,
  User,
  Phone,
  Mail,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';

const paymentInstructions = {
  mpesa: {
    paybill: '522522',
    accountNumber: 'MINHAAJ',
    instructions: [
      'Go to M-PESA on your phone',
      'Select Lipa na M-PESA',
      'Select Pay Bill',
      'Enter Business Number: 522522',
      'Enter Account Number: MINHAAJ + Admission Number',
      'Enter Amount',
      'Enter your M-PESA PIN and confirm',
    ],
  },
  bank: {
    bankName: 'KCB Bank',
    accountName: 'Minhaaj Academy',
    accountNumber: '1234567890',
    branch: 'Parklands Branch',
  },
};

export default function ParentDashboard() {
  const { payments, loading: paymentsLoading, addPayment, uploadProof } = usePayments();
  const { students, loading: studentsLoading } = useStudents();
  const { feeStructures } = useFeeStructures();
  const { classes } = useClasses();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<PaymentInsert>({
    student_id: '',
    amount: 0,
    payment_method: 'mpesa',
    reference_number: '',
    notes: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);

  const loading = paymentsLoading || studentsLoading;

  // Get students linked to this parent by matching email
  const myStudents = useMemo(() => {
    if (!profile?.email) return [];
    return students.filter(s => s.parent_email?.toLowerCase() === profile.email?.toLowerCase());
  }, [students, profile]);

  // Calculate balances for my students
  const studentBalances = useMemo(() => {
    const balances: Record<string, { 
      student: typeof myStudents[0];
      className: string;
      totalFee: number; 
      totalPaid: number; 
      balance: number;
    }> = {};
    
    myStudents.forEach(student => {
      const studentClass = classes.find(c => c.id === student.class_id);
      const fee = studentClass ? feeStructures.find(f => 
        f.level === studentClass.level && 
        f.curriculum === studentClass.curriculum
      ) : null;
      
      const totalFee = fee ? Number(fee.total_fee) : 0;
      const studentPayments = payments.filter(p => p.student_id === student.id && p.status === 'confirmed');
      const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      
      balances[student.id] = {
        student,
        className: studentClass?.name || 'Unassigned',
        totalFee,
        totalPaid,
        balance: totalFee - totalPaid
      };
    });
    
    return balances;
  }, [myStudents, classes, feeStructures, payments]);

  // Get payments for my students
  const myPayments = useMemo(() => {
    const studentIds = myStudents.map(s => s.id);
    return payments.filter(p => studentIds.includes(p.student_id));
  }, [payments, myStudents]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard.`,
    });
  };

  const handleAddPayment = async () => {
    if (!formData.student_id || !formData.amount) return;
    
    let proofUrl: string | undefined;
    if (proofFile) {
      setUploading(true);
      const url = await uploadProof(proofFile, formData.student_id);
      if (url) proofUrl = url;
      setUploading(false);
    }

    const result = await addPayment({
      ...formData,
      proof_image_url: proofUrl,
    });

    if (result) {
      setIsPaymentDialogOpen(false);
      setFormData({
        student_id: '',
        amount: 0,
        payment_method: 'mpesa',
        reference_number: '',
        notes: '',
      });
      setProofFile(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success/10 text-success border-success/20"><ShieldCheck className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'received':
        return <Badge className="bg-primary/10 text-primary border-primary/20"><CheckCircle className="h-3 w-3 mr-1" />Received</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-warning/10 text-warning border-warning/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const totalBalance = Object.values(studentBalances).reduce((sum, b) => sum + Math.max(0, b.balance), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome, {profile?.name || 'Parent'}
            </h1>
            <p className="text-muted-foreground mt-1">
              View your children's information and manage payments
            </p>
          </div>
          <Button className="gradient-primary" onClick={() => setIsPaymentDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Submit Payment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Children</p>
                  <p className="text-2xl font-bold">{myStudents.length}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance Due</p>
                  <p className="text-2xl font-bold text-destructive">KES {totalBalance.toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                  <p className="text-2xl font-bold">{myPayments.filter(p => p.status === 'pending').length}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Children */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              My Children
            </CardTitle>
            <CardDescription>View your children's enrollment and fee information</CardDescription>
          </CardHeader>
          <CardContent>
            {myStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students linked to your account.</p>
                <p className="text-sm">Please contact the school to link your children.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myStudents.map(student => {
                  const balance = studentBalances[student.id];
                  return (
                    <Card key={student.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{student.first_name} {student.last_name}</h3>
                            <p className="text-sm text-muted-foreground">{student.admission_number}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {balance?.className}
                              </Badge>
                              <Badge variant="outline" className="bg-primary/5">
                                {student.curriculum}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Fees:</span>
                            <span className="font-medium">KES {balance?.totalFee.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Paid:</span>
                            <span className="font-medium text-success">KES {balance?.totalPaid.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Balance:</span>
                            <span className={`font-bold ${balance?.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                              KES {balance?.balance.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Methods
            </CardTitle>
            <CardDescription>Use any of these methods to pay school fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* M-PESA */}
              <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-success" />
                  <h3 className="font-semibold">M-PESA</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Paybill Number</p>
                      <p className="font-mono font-bold text-lg">{paymentInstructions.mpesa.paybill}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(paymentInstructions.mpesa.paybill, 'Paybill number')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Number</p>
                      <p className="font-mono font-bold">{paymentInstructions.mpesa.accountNumber} + Admission No.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(paymentInstructions.mpesa.accountNumber, 'Account prefix')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {paymentInstructions.mpesa.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Bank Transfer */}
              <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Bank Transfer</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground">Bank Name</p>
                    <p className="font-semibold">{paymentInstructions.bank.bankName}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground">Account Name</p>
                    <p className="font-semibold">{paymentInstructions.bank.accountName}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Number</p>
                      <p className="font-mono font-bold">{paymentInstructions.bank.accountNumber}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(paymentInstructions.bank.accountNumber, 'Account number')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground">Branch</p>
                    <p className="font-semibold">{paymentInstructions.bank.branch}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Track your payment submissions and status</CardDescription>
          </CardHeader>
          <CardContent>
            {myPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payments submitted yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.students?.first_name} {payment.students?.last_name}</p>
                          <p className="text-xs text-muted-foreground">{payment.students?.admission_number}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">KES {Number(payment.amount).toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{payment.payment_method}</TableCell>
                      <TableCell>{payment.reference_number || '-'}</TableCell>
                      <TableCell>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Submit Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Payment</DialogTitle>
              <DialogDescription>
                Submit a fee payment with proof of transaction
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Student</Label>
                <Select 
                  value={formData.student_id} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, student_id: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {myStudents.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} ({s.admission_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (KES)</Label>
                <Input 
                  type="number" 
                  value={formData.amount || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  placeholder="Enter amount paid"
                />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select 
                  value={formData.payment_method} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, payment_method: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-PESA</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reference/Transaction Number</Label>
                <Input 
                  value={formData.reference_number || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                  placeholder="e.g. MPESA confirmation code"
                />
              </div>
              <div>
                <Label>Upload Proof (Screenshot/Receipt)</Label>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
                {proofFile && (
                  <p className="text-xs text-muted-foreground mt-1">{proofFile.name}</p>
                )}
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea 
                  value={formData.notes || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 gradient-primary" 
                  onClick={handleAddPayment}
                  disabled={!formData.student_id || !formData.amount || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
