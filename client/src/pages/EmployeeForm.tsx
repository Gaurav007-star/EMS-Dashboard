import React, { useState, useEffect } from 'react';
import api, { uploadToImageKit } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Upload, Loader2, User, Mail, Phone, DollarSign, CalendarDays } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../components/ui/input-group';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { DEPARTMENTS, DEPARTMENT_LIST } from '../lib/constants';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  employeeId: string | null;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number | '';
  joiningDate: string;
  status: 'Active' | 'Inactive';
  role: 'Super Admin' | 'HR Manager' | 'Employee';
  reportingManager: string;
  profileImage: string;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeId,
}) => {
  const { user: currentUser } = useAuth();
  
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    role: 'Employee',
    reportingManager: '',
    profileImage: '',
  });

  const [managers, setManagers] = useState<any[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchManagers = async () => {
      try {
        const res = await api.get('/employees?status=Active');
        if (res.data.success) {
          const eligibleManagers = res.data.employees.filter((emp: any) => emp._id !== employeeId);
          setManagers(eligibleManagers);
        }
      } catch (err) {
        console.error('Error fetching manager list:', err);
      }
    };

    fetchManagers();
  }, [isOpen, employeeId]);

  useEffect(() => {
    if (!isOpen || !employeeId) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        salary: '',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        role: 'Employee',
        reportingManager: '',
        profileImage: '',
      });
      setSubmitError(null);
      return;
    }

    const fetchEmployeeDetails = async () => {
      try {
        setLoadingDetails(true);
        const res = await api.get(`/employees/${employeeId}`);
        if (res.data.success) {
          const emp = res.data.employee;
          setFormData({
            name: emp.name || '',
            email: emp.email || '',
            phone: emp.phone || '',
            department: emp.department || '',
            designation: emp.designation || '',
            salary: emp.salary ?? '',
            joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
            status: emp.status || 'Active',
            role: emp.role || 'Employee',
            reportingManager: emp.reportingManager?._id || emp.reportingManager || '',
            profileImage: emp.profileImage || '',
          });
        }
      } catch (err: any) {
        console.error('Error loading employee info:', err);
        setSubmitError('Failed to load employee details.');
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchEmployeeDetails();
  }, [isOpen, employeeId]);

  const isSelfEdit = currentUser?.id === employeeId;
  const isEmployee = currentUser?.role === 'Employee';
  const restrictFields = isSelfEdit && isEmployee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'salary' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value === 'none' ? '' : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setSubmitError(null);
    try {
      const imageUrl = await uploadToImageKit(file);
      setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
    } catch (err: any) {
      console.error('ImageKit Upload Failed:', err);
      setSubmitError('Failed to upload image. Please verify ImageKit keys in backend configuration.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setSubmitError('Please fill out all required fields.');
      return;
    }

    // Phone format validation: optional +, then digits/spaces/hyphens/parens, 7–15 digits total
    const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;
    const digitCount = formData.phone.replace(/\D/g, '').length;
    if (!phoneRegex.test(formData.phone.trim()) || digitCount < 7 || digitCount > 15) {
      setSubmitError('Invalid phone number. Use 7–15 digits, optionally with +, spaces, hyphens, or parentheses. Example: +1 555-019-2834');
      return;
    }

    if (!restrictFields && (!formData.department.trim() || !formData.designation.trim() || formData.salary === '')) {
      setSubmitError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        reportingManager: formData.reportingManager === '' ? null : formData.reportingManager,
      };

      if (employeeId) {
        const res = await api.put(`/employees/${employeeId}`, payload);
        if (res.data.success) {
          onSave();
          onClose();
        }
      } else {
        const res = await api.post('/employees', payload);
        if (res.data.success) {
          onSave();
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Error saving employee:', err);
      setSubmitError(err.response?.data?.message || 'Error occurred while saving employee record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {employeeId ? 'Edit Employee Details' : 'Add New Employee'}
          </DialogTitle>
          <DialogDescription>
            {employeeId ? 'Modify profile info and credentials' : 'Register a new employee into the system'}
          </DialogDescription>
        </DialogHeader>

        {loadingDetails ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary mb-2" size={32} />
            <p className="text-muted-foreground text-sm font-medium">Fetching details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-xl flex items-start gap-2.5 text-sm">
                <span>{submitError}</span>
              </div>
            )}

            {/* Profile Image Upload Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
              <div className="relative">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-card shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold border-2 border-card shadow-inner">
                    N/A
                  </div>
                )}
                {imageUploading && (
                  <div className="absolute inset-0 bg-background/60 rounded-full flex items-center justify-center text-foreground">
                    <Loader2 className="animate-spin" size={16} />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <p className="text-xs font-bold text-foreground">Profile Photo</p>
                <p className="text-[11px] text-muted-foreground font-medium">Accepts image files. Uploaded directly to ImageKit.</p>
                <label className="inline-flex items-center gap-1.5 bg-card border border-border hover:bg-muted text-foreground font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-sm transition-colors mt-2">
                  <Upload size={14} />
                  <span>Choose image</span>
                  <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                </label>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name *</Label>
                <InputGroup>
                  <InputGroupAddon><User /></InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                  />
                </InputGroup>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Email Address *</Label>
                <InputGroup>
                  <InputGroupAddon><Mail /></InputGroupAddon>
                  <InputGroupInput
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. john@ems.com"
                  />
                </InputGroup>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Phone Number *</Label>
                <InputGroup>
                  <InputGroupAddon><Phone /></InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 555-019-2834"
                  />
                </InputGroup>
              </div>

              {!restrictFields && (<>
              <div className="space-y-1.5">
                <Label className="text-xs">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(v) => {
                    const dept = v === 'none' ? '' : v;
                    setFormData((prev) => {
                      const validDesignations = dept ? DEPARTMENTS[dept] ?? [] : [];
                      return {
                        ...prev,
                        department: dept,
                        designation: validDesignations.includes(prev.designation) ? prev.designation : '',
                      };
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENT_LIST.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Designation *</Label>
                <Select
                  value={formData.designation}
                  onValueChange={(v) => handleSelectChange('designation', v)}
                  disabled={!formData.department}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.department ? 'Select designation' : 'Select department first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(DEPARTMENTS[formData.department] ?? []).map((desig) => (
                      <SelectItem key={desig} value={desig}>{desig}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Salary (USD Annual) *</Label>
                <InputGroup>
                  <InputGroupAddon><DollarSign /></InputGroupAddon>
                  <InputGroupInput
                    type="number"
                    name="salary"
                    required
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="e.g. 80000"
                  />
                </InputGroup>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Joining Date *</Label>
                <InputGroup>
                  <InputGroupAddon><CalendarDays /></InputGroupAddon>
                  <InputGroupInput
                    type="date"
                    name="joiningDate"
                    required
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Status *</Label>
                <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">System Role *</Label>
                <Select value={formData.role} onValueChange={(v) => handleSelectChange('role', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser?.role === 'Super Admin' && (
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                    )}
                    <SelectItem value="HR Manager">HR Manager</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Reporting Manager</Label>
                <Select value={formData.reportingManager} onValueChange={(v) => handleSelectChange('reportingManager', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="No Manager (Root Node)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Manager (Root Node)</SelectItem>
                    {managers.map((mgr) => (
                      <SelectItem key={mgr._id} value={mgr._id}>
                        {mgr.name} ({mgr.designation} - {mgr.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </>)}
            </div>

            {/* Footer Buttons */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || imageUploading}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="animate-spin" size={14} />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Employee'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
