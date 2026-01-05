import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Search,
  Eye,
  Upload,
  Plus,
  Loader2,
  ThumbsUp,
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

export default function Payments() {
  const { payments, loading, confirmPayment, rejectPayment, addPayment, uploadProof, markAsReceived } = usePayments();
  const { students } = useStudents();
  const { feeStructures } = useFeeStructures();
  const { classes } = useClasses();
  const { role } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<typeof payments[0] | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Add payment form
  const [formData, setFormData] = useState<PaymentInsert>({
    student_id: '',
    amount: 0,
    payment_method: 'mpesa',
    reference_number: '',
    notes: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);

  const isAdmin = role === 'admin';
  const isStaff = role === 'staff';
  const canManagePayments = isAdmin || isStaff;

  // Get fee for selected student
  const selectedStudent = students.find(s => s.id === formData.student_id);
  const selectedClass = selectedStudent ? classes.find(c => c.id === selectedStudent.class_id) : null;
  const applicableFee = selectedClass ? feeStructures.find(f => 
    f.level === selectedClass.level && 
    f.curriculum === selectedClass.curriculum &&
    f.academic_year === selectedClass.academic_year
  ) : null;

  // Calculate student balances
  const studentBalances = useMemo(() => {
    const balances: Record<string, { totalFee: number; totalPaid: number; balance: number }> = {};
    
    students.forEach(student => {
      const studentClass = classes.find(c => c.id === student.class_id);
      const fee = studentClass ? feeStructures.find(f => 
        f.level === studentClass.level && 
        f.curriculum === studentClass.curriculum
      ) : null;
      
      const totalFee = fee ? Number(fee.total_fee) : 0;
      const studentPayments = payments.filter(p => p.student_id === student.id && p.status === 'confirmed');
      const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      
      balances[student.id] = {
        totalFee,
        totalPaid,
        balance: totalFee - totalPaid
      };
    });
    
    return balances;
  }, [students, classes, feeStructures, payments]);

  // Dashboard stats
  const totalExpectedFees = Object.values(studentBalances).reduce((sum, b) => sum + b.totalFee, 0);
  const totalCollected = Object.values(studentBalances).reduce((sum, b) => sum + b.totalPaid, 0);
  const totalOutstanding = Object.values(studentBalances).reduce((sum, b) => sum + Math.max(0, b.balance), 0);

  const filteredPayments = payments.filter(payment =>
    payment.students?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.students?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.students?.admission_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const receivedPayments = payments.filter(p => p.status === 'received');
  const confirmedPayments = payments.filter(p => p.status === 'confirmed');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard.`,
    });
  };

  const handleMarkReceived = async (paymentId: string) => {
    await markAsReceived(paymentId);
  };

  const handleConfirm = async (paymentId: string) => {
    if (!canManagePayments) {
      toast({
        title: 'Access Denied',
        description: 'Only staff and admins can confirm payments.',
        variant: 'destructive',
      });
      return;
    }
    await confirmPayment(paymentId);
  };

  const handleReject = async () => {
    if (!rejectId) return;
    await rejectPayment(rejectId, rejectReason);
    setRejectId(null);
    setRejectReason('');
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
      setIsAddDialogOpen(false);
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
        return <Badge className="bg-success/10 text-success border-success/20"><ShieldCheck className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'received':
        return <Badge className="bg-primary/10 text-primary border-primary/20"><ThumbsUp className="h-3 w-3 mr-1" />Received</Badge>;
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

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-8 w-8 text-primary" />
              Payments
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage fee payments and confirmations
            </p>
          </div>
          <Button size="sm" className="gradient-primary" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Submit Payment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expected</p>
                  <p className="text-2xl font-bold">KES {totalExpectedFees.toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-2xl font-bold text-success">KES {totalCollected.toLocaleString()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold text-destructive">KES {totalOutstanding.toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold">{pendingPayments.length + receivedPayments.length}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="records">
          <TabsList>
            <TabsTrigger value="records">Payment Records</TabsTrigger>
            <TabsTrigger value="balances">Student Balances</TabsTrigger>
            <TabsTrigger value="instructions">Payment Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Records</CardTitle>
                    <CardDescription>{filteredPayments.length} payments found</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search payments..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPayments.length === 0 ? (
                  <div className="py-12 text-center">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
                    <p className="text-muted-foreground">Payments will appear here once submitted.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map((payment) => (
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
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedPayment(payment)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {/* Staff and Admin can confirm payments */}
                                {canManagePayments && (payment.status === 'pending' || payment.status === 'received') && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-success" 
                                      onClick={() => handleConfirm(payment.id)}
                                      title="Confirm Payment"
                                    >
                                      <ShieldCheck className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-destructive" 
                                      onClick={() => setRejectId(payment.id)}
                                      title="Reject Payment"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Fee Balances</CardTitle>
                <CardDescription>View total fees, paid amounts, and outstanding balances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead className="text-right">Total Fees</TableHead>
                        <TableHead className="text-right">Amount Paid</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const balance = studentBalances[student.id] || { totalFee: 0, totalPaid: 0, balance: 0 };
                        const studentClass = classes.find(c => c.id === student.class_id);
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{student.first_name} {student.last_name}</p>
                                <p className="text-xs text-muted-foreground">{student.admission_number}</p>
                              </div>
                            </TableCell>
                            <TableCell>{studentClass?.name || 'Unassigned'}</TableCell>
                            <TableCell className="text-right">KES {balance.totalFee.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-success">KES {balance.totalPaid.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-bold">
                              <span className={balance.balance > 0 ? 'text-destructive' : 'text-success'}>
                                KES {balance.balance.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              {balance.balance <= 0 ? (
                                <Badge className="bg-success/10 text-success border-success/20">Paid</Badge>
                              ) : balance.totalPaid > 0 ? (
                                <Badge className="bg-warning/10 text-warning border-warning/20">Partial</Badge>
                              ) : (
                                <Badge className="bg-destructive/10 text-destructive border-destructive/20">Unpaid</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-success" />
                    M-PESA Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Paybill Number</p>
                      <p className="font-mono font-bold text-lg">{paymentInstructions.mpesa.paybill}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(paymentInstructions.mpesa.paybill, 'Paybill')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {paymentInstructions.mpesa.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Bank Transfer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Bank</p>
                        <p className="font-medium">{paymentInstructions.bank.bankName}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Account Name</p>
                        <p className="font-medium">{paymentInstructions.bank.accountName}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Account Number</p>
                        <p className="font-mono font-bold">{paymentInstructions.bank.accountNumber}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(paymentInstructions.bank.accountNumber, 'Account Number')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Payment Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Submit Payment</DialogTitle>
              <DialogDescription>Submit a new payment with proof.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 pr-4">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select value={formData.student_id} onValueChange={v => setFormData(prev => ({ ...prev, student_id: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.first_name} {s.last_name} ({s.admission_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Auto-fill fee info */}
                {applicableFee && (
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <p className="text-sm font-medium">Fee Information</p>
                    <p className="text-xs text-muted-foreground">
                      Class: {selectedClass?.name} • Total Fee: KES {Number(applicableFee.total_fee).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Balance: KES {(studentBalances[formData.student_id]?.balance || 0).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Amount (KES)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={formData.amount || ''} 
                    onChange={e => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={v => setFormData(prev => ({ ...prev, payment_method: v }))}>
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
                <div className="space-y-2">
                  <Label>Reference Number</Label>
                  <Input 
                    placeholder="Transaction ID" 
                    value={formData.reference_number || ''} 
                    onChange={e => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Proof (Image)</Label>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setProofFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    placeholder="Additional notes..." 
                    value={formData.notes || ''} 
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button className="gradient-primary" onClick={handleAddPayment} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Submit Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Payment Dialog */}
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Student</p>
                    <p className="font-medium">{selectedPayment.students?.first_name} {selectedPayment.students?.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">KES {Number(selectedPayment.amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <p className="font-medium">{selectedPayment.reference_number || '-'}</p>
                  </div>
                </div>
                {selectedPayment.proof_image_url && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Payment Proof</p>
                    <img src={selectedPayment.proof_image_url} alt="Payment proof" className="max-w-full rounded-lg border" />
                  </div>
                )}
                {selectedPayment.rejection_reason && (
                  <div>
                    <p className="text-sm text-muted-foreground">Rejection Reason</p>
                    <p className="text-destructive">{selectedPayment.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Confirmation */}
        <AlertDialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Payment</AlertDialogTitle>
              <AlertDialogDescription>
                Please provide a reason for rejecting this payment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea 
              placeholder="Reason for rejection..." 
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Reject
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
