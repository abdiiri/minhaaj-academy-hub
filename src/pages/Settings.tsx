import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
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
  MapPin
} from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();

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
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full">
            <TabsTrigger value="school">
              <School className="h-4 w-4 mr-2" />
              School
            </TabsTrigger>
            <TabsTrigger value="academic">
              <Calendar className="h-4 w-4 mr-2" />
              Academic
            </TabsTrigger>
            <TabsTrigger value="fees">
              <CreditCard className="h-4 w-4 mr-2" />
              Fees
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

          {/* Fee Settings */}
          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Fee Configuration</CardTitle>
                <CardDescription>
                  Manage fee structure and payment settings
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
                      <h4 className="font-medium">Admin</h4>
                      <Button variant="outline" size="sm">Edit Permissions</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Full access to all features including student management, staff management, payments, results, and settings.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Staff / Teacher</h4>
                      <Button variant="outline" size="sm">Edit Permissions</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      View assigned classes, enter and manage results, view students in their classes.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Parent</h4>
                      <Button variant="outline" size="sm">Edit Permissions</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      View student profile, fee balance, payment instructions, and upload payment confirmation.
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
      </div>
    </DashboardLayout>
  );
}
