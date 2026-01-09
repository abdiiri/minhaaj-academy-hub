import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useStaff, StaffInsert, StaffMember } from '@/hooks/useStaff';
import { useAuth } from '@/contexts/AuthContext';
import { StaffForm } from '@/components/forms/StaffForm';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Users,
  Mail,
  Phone,
  Loader2,
  ShieldAlert
} from 'lucide-react';

export default function StaffPage() {
  const { staff, loading, addStaff, updateStaff, deleteStaff } = useStaff();
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  
  const isAdmin = role === 'admin';
  
  // Form state
  const [formData, setFormData] = useState<StaffInsert>({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'teacher',
    subjects: [],
    assigned_classes: [],
    join_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const filteredStaff = staff.filter(s => 
    s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      employee_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'teacher',
      subjects: [],
      assigned_classes: [],
      join_date: new Date().toISOString().split('T')[0],
      status: 'active'
    });
  };

  const handleAdd = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.employee_id) return;
    const result = await addStaff(formData);
    if (result) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData({
      employee_id: member.employee_id,
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      subjects: member.subjects,
      assigned_classes: member.assigned_classes,
      join_date: member.join_date,
      status: member.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingStaff) return;
    const result = await updateStaff(editingStaff.id, formData);
    if (result) {
      setIsEditDialogOpen(false);
      setEditingStaff(null);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteStaff(deleteId);
    setDeleteId(null);
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    resetForm();
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
              <Users className="h-8 w-8 text-primary" />
              Staff
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage teachers and administrative staff
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin ? (
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                    <DialogDescription>
                      Enter the staff member's details to add them to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <StaffForm 
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleAdd}
                    onCancel={handleCancel}
                    submitLabel="Add Staff"
                    showPasswordField={true}
                  />
                </DialogContent>
              </Dialog>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <ShieldAlert className="h-4 w-4" />
                <span>View only - Admin access required</span>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or employee ID..."
                className="pl-10 max-w-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Staff Cards */}
        {filteredStaff.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No staff members yet</h3>
              <p className="text-muted-foreground mb-4">Add your first staff member to get started.</p>
              {isAdmin && (
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }} className="gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((member) => (
              <Card key={member.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full gradient-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                        {member.first_name[0]}{member.last_name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {member.first_name} {member.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {member.employee_id}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      member.status === 'active' 
                        ? 'bg-success/10 text-success border-success/20' 
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }>
                      {member.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{member.phone || 'No phone'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    <Badge variant="outline" className="bg-primary/5 capitalize">
                      {member.role.replace('_', ' ')}
                    </Badge>
                    {member.subjects?.slice(0, 2).map(subject => (
                      <Badge key={subject} variant="outline" className="bg-muted">
                        {subject}
                      </Badge>
                    ))}
                    {member.subjects && member.subjects.length > 2 && (
                      <Badge variant="outline" className="bg-muted">
                        +{member.subjects.length - 2}
                      </Badge>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(member)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>
                Update the staff member's details.
              </DialogDescription>
            </DialogHeader>
            <StaffForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleUpdate}
              onCancel={handleCancel}
              submitLabel="Save Changes"
              showPasswordField={false}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this staff member? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
