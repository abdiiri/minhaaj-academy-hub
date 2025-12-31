import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { mockPayments, mockFeeStructure } from '@/data/mockData';
import { Payment, FeeStructure } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Copy,
  Smartphone,
  Building2,
  Search,
  Eye,
  Upload
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
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { toast } = useToast();

  const filteredPayments = payments.filter(payment =>
    payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const approvedPayments = payments.filter(p => p.status === 'approved');
  const totalCollected = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard.`,
    });
  };

  const handleApprove = (paymentId: string) => {
    setPayments(payments.map(p => 
      p.id === paymentId 
        ? { ...p, status: 'approved', approvedAt: new Date().toISOString(), approvedBy: 'Admin' }
        : p
    ));
    toast({
      title: 'Payment Approved',
      description: 'The payment has been approved and balance updated.',
    });
  };

  const handleReject = (paymentId: string) => {
    setPayments(payments.map(p => 
      p.id === paymentId ? { ...p, status: 'rejected' } : p
    ));
    toast({
      title: 'Payment Rejected',
      description: 'The payment has been rejected.',
      variant: 'destructive',
    });
  };

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
              Manage fee payments and view payment records
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-2xl font-bold text-success">
                    KES {totalCollected.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-success/10 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold text-warning">
                    {pendingPayments.length}
                  </p>
                </div>
                <div className="p-3 bg-warning/10 rounded-xl">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved Payments</p>
                  <p className="text-2xl font-bold text-foreground">
                    {approvedPayments.length}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Payment Records</TabsTrigger>
            <TabsTrigger value="fees">Fee Structure</TabsTrigger>
            <TabsTrigger value="instructions">Payment Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            {/* Search */}
            <Card>
              <CardContent className="py-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by student name or admission number..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Records</CardTitle>
                <CardDescription>
                  {filteredPayments.length} payment records found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payment.studentName}</p>
                              <p className="text-xs text-muted-foreground">{payment.admissionNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>{payment.className}</TableCell>
                          <TableCell className="font-medium">
                            KES {payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {format(new Date(payment.paymentDate), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {payment.paymentMethod === 'mpesa' && <Smartphone className="h-3 w-3 mr-1" />}
                              {payment.paymentMethod === 'bank' && <Building2 className="h-3 w-3 mr-1" />}
                              {payment.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              payment.status === 'approved' ? 'bg-success/10 text-success border-success/20' :
                              payment.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-destructive/10 text-destructive border-destructive/20'
                            }>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {payment.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-success hover:text-success"
                                    onClick={() => handleApprove(payment.id)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleReject(payment.id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Fee Structure 2025/2026</CardTitle>
                <CardDescription>
                  Fee breakdown by class level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class Level</TableHead>
                        <TableHead>Term Fee</TableHead>
                        <TableHead>Admission</TableHead>
                        <TableHead>Uniform</TableHead>
                        <TableHead>Books</TableHead>
                        <TableHead className="font-bold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockFeeStructure.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">{fee.className}</TableCell>
                          <TableCell>KES {fee.termFee?.toLocaleString()}</TableCell>
                          <TableCell>KES {fee.admissionFee?.toLocaleString() || '-'}</TableCell>
                          <TableCell>KES {fee.uniformFee?.toLocaleString() || '-'}</TableCell>
                          <TableCell>KES {fee.booksFee?.toLocaleString() || '-'}</TableCell>
                          <TableCell className="font-bold text-primary">
                            KES {fee.totalFee.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* M-PESA */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-success" />
                    M-PESA Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Paybill Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg">{paymentInstructions.mpesa.paybill}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(paymentInstructions.mpesa.paybill, 'Paybill number')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Account Format</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{paymentInstructions.mpesa.accountNumber} + Adm No.</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(paymentInstructions.mpesa.accountNumber, 'Account prefix')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {paymentInstructions.mpesa.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Transfer */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-secondary" />
                    Bank Transfer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bank Name</span>
                      <span className="font-medium">{paymentInstructions.bank.bankName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Account Name</span>
                      <span className="font-medium">{paymentInstructions.bank.accountName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{paymentInstructions.bank.accountNumber}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(paymentInstructions.bank.accountNumber, 'Account number')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Branch</span>
                      <span className="font-medium">{paymentInstructions.bank.branch}</span>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-dashed rounded-lg text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Upload Payment Proof</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a screenshot of your payment for verification
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Choose File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
