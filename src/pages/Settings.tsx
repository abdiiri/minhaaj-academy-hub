import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useFeeStructures, FeeStructureInsert } from '@/hooks/useFeeStructures';
import logo from '@/assets/logo.png';
import { 
  Settings as SettingsIcon, 
  School,
  Calendar,
  CreditCard,
  Users,
  Download,
  Upload,
  Save,
  Globe,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ShieldAlert
} from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const { role } = useAuth();
  const { feeStructures, loading: feesLoading, addFeeStructure, updateFeeStructure, deleteFeeStructure } = useFeeStructures();
  
  const isAdmin = role === 'admin';

  // Fee structure state
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<typeof feeStructures[0] | null>(null);
  const [deleteFeeId, setDeleteFeeId] = useState<string | null>(null);
  const [feeFormData, setFeeFormData] = useState<FeeStructureInsert>({
    level: '',
    curriculum: 'CBE',
    academic_year: '2025/2026',
    tuition_fee: 0,
    activity_fee: 0,
    transport_fee: 0,
    lunch_fee: 0,
  });

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been updated successfully.',
    });
  };

  const handleExportBackup = () => {
    toast({
      title: 'Backup Started',
      description: 'Your data backup is being prepared for download...',
    });
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
      curriculum: 'CBE',
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

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure school details, academic year, and system preferences
          </p>
        </div>

        <Tabs defaultValue="school" className="space-y-4">
          <TabsList className="grid grid-cols-2 lg:grid-cols-6 w-full">
            <TabsTrigger value="school">
              <School className="h-4 w-4 mr-2" />
              School
            </TabsTrigger>
            <TabsTrigger value="academic">
              <Calendar className="h-4 w-4 mr-2" />
              Academic
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="fee-structure">
                <DollarSign className="h-4 w-4 mr-2" />
                Fee Structure
              </TabsTrigger>
            )}
            <TabsTrigger value="fees">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="backup">
              <Download className="h-4 w-4 mr-2" />
              Backup
            </TabsTrigger>
          </TabsList>

          {/* School Details */}
          <TabsContent value="school">
            <Card>
              <CardHeader>
                <CardTitle>School Information</CardTitle>
                <CardDescription>
                  Update your school's basic information and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                    <img src={logo} alt="School Logo" className="h-full w-full object-contain p-2" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Recommended: 200x200px, PNG or JPG
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>School Name</Label>
                    <Input defaultValue="Minhaaj Academy" />
                  </div>
                  <div className="space-y-2">
                    <Label>School Group</Label>
                    <Input defaultValue="California Group of Schools (CGOS)" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input defaultValue="Faith. Foundation. Future" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input defaultValue="cgos.co.ke" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input defaultValue="minhaj@cgos.co.ke" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Numbers
                    </Label>
                    <Input defaultValue="+254 793 746 424, +254 700 247 273" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    <Textarea defaultValue="3rd Parklands Avenue / Kusii Lane, Nairobi" rows={2} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} className="gradient-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Year */}
          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>Academic Year Settings</CardTitle>
                <CardDescription>
                  Configure the current academic year and terms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select defaultValue="2025-2026">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-2025">2024 / 2025</SelectItem>
                        <SelectItem value="2025-2026">2025 / 2026</SelectItem>
                        <SelectItem value="2026-2027">2026 / 2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Term</Label>
                    <Select defaultValue="term1">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="term1">Term 1</SelectItem>
                        <SelectItem value="term2">Term 2</SelectItem>
                        <SelectItem value="term3">Term 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Term Start Date</Label>
                    <Input type="date" defaultValue="2025-01-06" />
                  </div>
                  <div className="space-y-2">
                    <Label>Term End Date</Label>
                    <Input type="date" defaultValue="2025-04-04" />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Curriculums Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="bg-primary/5">CBE (Competency Based Education)</Button>
                    <Button variant="outline" size="sm" className="bg-secondary/5">Edexcel iProgress</Button>
                    <Button variant="outline" size="sm" className="bg-accent/5">Islamic Studies</Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} className="gradient-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fee Structure (Admin Only) */}
          {isAdmin && (
            <TabsContent value="fee-structure">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Fee Structure Management
                      </CardTitle>
                      <CardDescription>Set term fees per class level and academic year</CardDescription>
                    </div>
                    <Button size="sm" className="gradient-primary" onClick={() => setIsFeeDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Fee Structure
                    </Button>
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
                      <p className="text-muted-foreground mb-4">Add fee structures to set tuition fees per class.</p>
                      <Button onClick={() => setIsFeeDialogOpen(true)} className="gradient-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Fee Structure
                      </Button>
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
                            <TableHead className="text-right">Actions</TableHead>
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
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Payment Settings */}
          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Payment Configuration</CardTitle>
                <CardDescription>
                  Manage payment methods and gateway settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>M-PESA Paybill</Label>
                    <Input defaultValue="522522" />
                  </div>
                  <div className="space-y-2">
                    <Label>M-PESA Account Prefix</Label>
                    <Input defaultValue="MINHAAJ" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input defaultValue="KCB Bank" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Account Number</Label>
                    <Input defaultValue="1234567890" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} className="gradient-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Roles & Permissions</CardTitle>
                <CardDescription>
                  Manage user access levels and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-primary" />
                        Admin
                      </h4>
                      <Badge className="bg-primary/10 text-primary">Full Access</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Full access to all features: Set fees, confirm payments, manage staff, students, classes, and settings.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Staff / Teacher</h4>
                      <Badge variant="outline">Limited Access</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      View assigned classes, enter results, mark payments as "Received". Cannot confirm payments, manage staff, or set fees.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Parent</h4>
                      <Badge variant="outline">View Only</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      View student profile, fee balance, payment history. Submit payments with proof.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup & Restore */}
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>
                  Export data to Excel or restore from backup files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border rounded-lg space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-success/10 rounded-xl">
                        <Download className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <h4 className="font-medium">Export Data</h4>
                        <p className="text-sm text-muted-foreground">Download all data as Excel files</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" onClick={handleExportBackup}>
                        Students Data (.xlsx)
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={handleExportBackup}>
                        Staff Data (.xlsx)
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={handleExportBackup}>
                        Payment Records (.xlsx)
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={handleExportBackup}>
                        Results Data (.xlsx)
                      </Button>
                      <Button className="w-full gradient-primary" onClick={handleExportBackup}>
                        <Download className="h-4 w-4 mr-2" />
                        Export All Data
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-warning/10 rounded-xl">
                        <Upload className="h-6 w-6 text-warning" />
                      </div>
                      <div>
                        <h4 className="font-medium">Import / Restore</h4>
                        <p className="text-sm text-muted-foreground">Upload Excel files to import data</p>
                      </div>
                    </div>
                    <div className="p-8 border-2 border-dashed rounded-lg text-center">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm font-medium mb-1">Drop files here or click to upload</p>
                      <p className="text-xs text-muted-foreground">
                        Supports .xlsx, .xls files
                      </p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Fee Structure Dialog */}
        <Dialog open={isFeeDialogOpen} onOpenChange={(open) => {
          setIsFeeDialogOpen(open);
          if (!open) {
            setEditingFee(null);
            setFeeFormData({
              level: '',
              curriculum: 'CBE',
              academic_year: '2025/2026',
              tuition_fee: 0,
              activity_fee: 0,
              transport_fee: 0,
              lunch_fee: 0,
            });
          }
        }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFee ? 'Edit Fee Structure' : 'Add Fee Structure'}</DialogTitle>
              <DialogDescription>Set tuition fees for a class level and academic year.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Level / Class</Label>
                  <Input 
                    placeholder="e.g. Grade 1, PP1, Form 1" 
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
                      <SelectItem value="CBE">CBE</SelectItem>
                      <SelectItem value="Edexcel">Edexcel</SelectItem>
                      <SelectItem value="Islamic">Islamic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select value={feeFormData.academic_year} onValueChange={v => setFeeFormData(prev => ({ ...prev, academic_year: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                    <SelectItem value="2025/2026">2025/2026</SelectItem>
                    <SelectItem value="2026/2027">2026/2027</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Total Fee: <span className="font-bold text-foreground">
                    KES {((feeFormData.tuition_fee || 0) + (feeFormData.activity_fee || 0) + (feeFormData.transport_fee || 0) + (feeFormData.lunch_fee || 0)).toLocaleString()}
                  </span>
                </p>
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
