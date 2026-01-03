import { useState } from 'react';
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
import { usePayments, PaymentInsert } from '@/hooks/usePayments';
import { useStudents } from '@/hooks/useStudents';
import { useFeeStructures, FeeStructureInsert } from '@/hooks/useFeeStructures';
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
  Pencil,
  Trash2,
  DollarSign
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
  const { payments, loading, confirmPayment, rejectPayment, addPayment, uploadProof } = usePayments();
  const { students } = useStudents();
  const { feeStructures, loading: feesLoading, addFeeStructure, updateFeeStructure, deleteFeeStructure } = useFeeStructures();
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

  // Fee structure state
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<typeof feeStructures[0] | null>(null);
  const [deleteFeeId, setDeleteFeeId] = useState<string | null>(null);
  const [feeFormData, setFeeFormData] = useState<FeeStructureInsert>({
    level: '',
    curriculum: 'CBC',
    academic_year: '2025/2026',
    tuition_fee: 0,
    activity_fee: 0,
    transport_fee: 0,
    lunch_fee: 0,
  });

  const isAdmin = role === 'admin';
  const isStaff = role === 'staff';
  const canManagePayments = isAdmin || isStaff;

  const filteredPayments = payments.filter(payment =>
    payment.students?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.students?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.students?.admission_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const confirmedPayments = payments.filter(p => p.status === 'confirmed');
  const totalCollected = confirmedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard.`,
    });
  };

  const handleConfirm = async (paymentId: string) => {
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

  const handleAddOrUpdateFee = async () => {
    if (!feeFormData.level || !feeFormData.curriculum) return;
    
    if (editingFee) {
      await updateFeeStructure({ id: editingFee.id, ...feeFormData });
    } else {
      await addFeeStructure(feeFormData);
    }
    
    setIsFeeDialogOpen(false);
    setEditingFee(null);
    setFeeFormData({
      level: '',
      curriculum: 'CBC',
      academic_year: '2025/2026',
      tuition_fee: 0,
      activity_fee: 0,
      transport_fee: 0,
      lunch_fee: 0,
    });
  };

  const handleEditFee = (fee: typeof feeStructures[0]) => {
    setEditingFee(fee);
    setFeeFormData({
      level: fee.level,
      curriculum: fee.curriculum,
      academic_year: fee.academic_year,
      tuition_fee: fee.tuition_fee,
      activity_fee: fee.activity_fee,
      transport_fee: fee.transport_fee,
      lunch_fee: fee.lunch_fee,
    });
    setIsFeeDialogOpen(true);
  };

  const handleDeleteFee = async () => {
    if (!deleteFeeId) return;
    await deleteFeeStructure(deleteFeeId);
    setDeleteFeeId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-2xl font-bold">KES {totalCollected.toLocaleString()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold">{pendingPayments.length}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed Payments</p>
                  <p className="text-2xl font-bold">{confirmedPayments.length}</p>
                </div>
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="records">
          <TabsList>
            <TabsTrigger value="records">Payment Records</TabsTrigger>
            <TabsTrigger value="fees">Fee Structure</TabsTrigger>
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
                                {canManagePayments && payment.status === 'pending' && (
                                  <>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => handleConfirm(payment.id)}>
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setRejectId(payment.id)}>
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

          <TabsContent value="fees" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Fee Structure
                    </CardTitle>
                    <CardDescription>Tuition fees by class level and curriculum</CardDescription>
                  </div>
                  {isAdmin && (
                    <Button size="sm" className="gradient-primary" onClick={() => setIsFeeDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Fee Structure
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {feesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : feeStructures.length === 0 ? (
                  <div className="py-12 text-center">
                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No fee structures yet</h3>
                    <p className="text-muted-foreground">Add fee structures to display tuition information.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Level</TableHead>
                          <TableHead>Curriculum</TableHead>
                          <TableHead>Academic Year</TableHead>
                          <TableHead className="text-right">Tuition</TableHead>
                          <TableHead className="text-right">Activity</TableHead>
                          <TableHead className="text-right">Transport</TableHead>
                          <TableHead className="text-right">Lunch</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feeStructures.map((fee) => (
                          <TableRow key={fee.id}>
                            <TableCell className="font-medium">{fee.level}</TableCell>
                            <TableCell>{fee.curriculum}</TableCell>
                            <TableCell>{fee.academic_year}</TableCell>
                            <TableCell className="text-right">KES {Number(fee.tuition_fee).toLocaleString()}</TableCell>
                            <TableCell className="text-right">KES {Number(fee.activity_fee).toLocaleString()}</TableCell>
                            <TableCell className="text-right">KES {Number(fee.transport_fee).toLocaleString()}</TableCell>
                            <TableCell className="text-right">KES {Number(fee.lunch_fee).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-bold">KES {Number(fee.total_fee).toLocaleString()}</TableCell>
                            {isAdmin && (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditFee(fee)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteFeeId(fee.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Payment</DialogTitle>
              <DialogDescription>Submit a new payment with proof.</DialogDescription>
            </DialogHeader>
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
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button className="gradient-primary" onClick={handleAddPayment} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Submit Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Payment Dialog */}
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent>
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

        {/* Fee Structure Dialog */}
        <Dialog open={isFeeDialogOpen} onOpenChange={(open) => {
          setIsFeeDialogOpen(open);
          if (!open) {
            setEditingFee(null);
            setFeeFormData({
              level: '',
              curriculum: 'CBC',
              academic_year: '2025/2026',
              tuition_fee: 0,
              activity_fee: 0,
              transport_fee: 0,
              lunch_fee: 0,
            });
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFee ? 'Edit Fee Structure' : 'Add Fee Structure'}</DialogTitle>
              <DialogDescription>Set tuition fees for a class level.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Input 
                    placeholder="e.g. Grade 1" 
                    value={feeFormData.level} 
                    onChange={e => setFeeFormData(prev => ({ ...prev, level: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Curriculum</Label>
                  <Select value={feeFormData.curriculum} onValueChange={v => setFeeFormData(prev => ({ ...prev, curriculum: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBC">CBC</SelectItem>
                      <SelectItem value="8-4-4">8-4-4</SelectItem>
                      <SelectItem value="IGCSE">IGCSE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Input 
                  placeholder="2025/2026" 
                  value={feeFormData.academic_year} 
                  onChange={e => setFeeFormData(prev => ({ ...prev, academic_year: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tuition Fee (KES)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={feeFormData.tuition_fee || ''} 
                    onChange={e => setFeeFormData(prev => ({ ...prev, tuition_fee: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Activity Fee (KES)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={feeFormData.activity_fee || ''} 
                    onChange={e => setFeeFormData(prev => ({ ...prev, activity_fee: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transport Fee (KES)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={feeFormData.transport_fee || ''} 
                    onChange={e => setFeeFormData(prev => ({ ...prev, transport_fee: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lunch Fee (KES)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={feeFormData.lunch_fee || ''} 
                    onChange={e => setFeeFormData(prev => ({ ...prev, lunch_fee: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsFeeDialogOpen(false)}>Cancel</Button>
                <Button className="gradient-primary" onClick={handleAddOrUpdateFee}>
                  {editingFee ? 'Update' : 'Add'} Fee Structure
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Fee Confirmation */}
        <AlertDialog open={!!deleteFeeId} onOpenChange={() => setDeleteFeeId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Fee Structure</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this fee structure? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteFee} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
