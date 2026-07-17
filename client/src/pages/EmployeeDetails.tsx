import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EmployeeForm } from './EmployeeForm';
import {
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Shield,
  Edit,
  ArrowLeft,
  ChevronRight,
  Users,
  GitFork,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface EmployeeDetail {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: 'Active' | 'Inactive';
  role: 'Super Admin' | 'HR Manager' | 'Employee';
  profileImage: string;
  reportingManager: {
    _id: string;
    name: string;
    employeeId: string;
    designation: string;
    profileImage: string;
  } | null;
}

interface Reportee {
  _id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  profileImage: string;
}

export const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [reportees, setReportees] = useState<Reportee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchDetails = async () => {
    if (!id || !currentUser) return;

    if (currentUser.role === 'Employee' && currentUser.id !== id) {
      setError('Access Denied: You are restricted to viewing your own profile details only.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const detailRes = await api.get(`/employees/${id}`);
      if (detailRes.data.success) {
        setEmployee(detailRes.data.employee);

        if (detailRes.data.employee._id === currentUser.id) {
          updateUser({
            name: detailRes.data.employee.name,
            email: detailRes.data.employee.email,
            profileImage: detailRes.data.employee.profileImage,
            role: detailRes.data.employee.role,
          });
        }
      }

      const reporteesRes = await api.get(`/employees/${id}/reportees`);
      if (reporteesRes.data.success) {
        setReportees(reporteesRes.data.reportees);
      }
    } catch (err: any) {
      console.error('Error fetching employee details:', err);
      setError(err.response?.data?.message || 'Failed to retrieve employee record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-muted-foreground text-sm font-medium">Loading profile details...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <Card className="p-8 max-w-lg mx-auto text-center space-y-4 border border-border shadow-sm">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/25">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">Profile View Restricted</h2>
          <p className="text-muted-foreground text-sm mt-1">{error || 'This employee profile could not be found.'}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(currentUser?.role === 'Employee' ? `/employees/${currentUser.id}` : '/employees')}
        >
          {currentUser?.role === 'Employee' ? 'Return to My Profile' : 'Go to Directory'}
        </Button>
      </Card>
    );
  }

  const showStatsAndEmployeeList = currentUser?.role === 'Super Admin' || currentUser?.role === 'HR Manager';

  const getStatusBadge = (empStatus: 'Active' | 'Inactive') => {
    if (empStatus === 'Active') {
      return <Badge variant="success">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const getRoleBadge = (empRole: string) => {
    switch (empRole) {
      case 'Super Admin':
        return <Badge variant="destructive">{empRole}</Badge>;
      case 'HR Manager':
        return <Badge variant="default">{empRole}</Badge>;
      default:
        return <Badge variant="secondary">{empRole}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link + Edit */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(showStatsAndEmployeeList ? '/employees' : '/hierarchy')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          {showStatsAndEmployeeList ? 'Directory' : 'Hierarchy'}
        </button>

        {(currentUser?.id === employee._id || showStatsAndEmployeeList) && (
          <Button
            variant="outline"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1.5 h-9"
          >
            <Edit size={14} />
            <span>Edit Profile</span>
          </Button>
        )}
      </div>

      {/* Main Profile Showcase Card */}
      <Card className="p-6 md:p-8 border border-border shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden bg-card">
        <div className="absolute top-0 right-0 w-24 h-24 bg-muted/30 rounded-bl-full border-l border-b border-border" />

        <div className="shrink-0">
          {employee.profileImage ? (
            <img
              src={employee.profileImage}
              alt={employee.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-muted shadow-md ring-1 ring-border"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-muted border-4 border-muted shadow-inner ring-1 ring-border flex items-center justify-center text-muted-foreground">
              <User size={48} />
            </div>
          )}
        </div>

        <div className="text-center md:text-left space-y-2 flex-1 z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-display">
              {employee.name}
            </h1>
            <p className="text-primary font-bold uppercase text-xs tracking-wider mt-0.5 font-display">
              {employee.designation}
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
            <Badge variant="outline">
              {employee.department}
            </Badge>
            {getRoleBadge(employee.role)}
            {getStatusBadge(employee.status)}
          </div>
          <p className="text-muted-foreground text-xs font-mono font-bold pt-1">Employee ID: {employee.employeeId}</p>
        </div>
      </Card>

      {/* Detail Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Contact and Administrative info */}
          <Card className="shadow-sm border border-border">
            <CardHeader className="pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-lg font-bold text-foreground font-display">Profile Metadata</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact card grid */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Information</h3>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-muted text-muted-foreground p-2.5 rounded-xl border border-border">
                      <Mail size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Email</span>
                      <span className="text-sm font-semibold text-foreground">{employee.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-muted text-muted-foreground p-2.5 rounded-xl border border-border">
                      <Phone size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Phone</span>
                      <span className="text-sm font-semibold text-foreground">{employee.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Employment Details</h3>

                  <div className="flex items-center gap-3">
                    <div className="bg-muted text-muted-foreground p-2.5 rounded-xl border border-border">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Joining Date</span>
                      <span className="text-sm font-semibold text-foreground">
                        {new Date(employee.joiningDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {(currentUser?.id === employee._id || showStatsAndEmployeeList) && (
                    <div className="flex items-center gap-3">
                      <div className="bg-muted text-muted-foreground p-2.5 rounded-xl border border-border">
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Salary (Annual USD)</span>
                        <span className="text-sm font-bold text-foreground">
                          ${employee.salary ? employee.salary.toLocaleString() : '0'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Direct Reports */}
          <Card className="shadow-sm border border-border">
            <CardHeader className="flex flex-row items-center gap-2 pb-2 border-b border-border bg-muted/20">
              <Users size={18} className="text-muted-foreground" />
              <CardTitle className="text-lg font-bold text-foreground font-display">
                Direct Reports ({reportees.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {reportees.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">No team members report to this employee.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reportees.map((rep) => (
                    <div
                      key={rep._id}
                      onClick={() => navigate(`/employees/${rep._id}`)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/45 hover:bg-muted/50 cursor-pointer transition-all duration-200"
                    >
                      {rep.profileImage ? (
                        <img
                          src={rep.profileImage}
                          alt={rep.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User size={18} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="truncate flex-1">
                        <h4 className="text-xs font-bold text-foreground truncate leading-snug">{rep.name}</h4>
                        <p className="text-[10px] text-primary font-semibold truncate leading-none uppercase mt-0.5">
                          {rep.designation}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-1">Dept: {rep.department}</p>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Reporting Manager card */}
        <div className="space-y-6">
          <Card className="shadow-sm border border-border">
            <CardHeader className="flex flex-row items-center gap-2 pb-2 border-b border-border bg-muted/20">
              <GitFork size={18} className="text-muted-foreground" />
              <CardTitle className="text-lg font-bold text-foreground font-display">Reporting Line</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {employee.reportingManager ? (
                <div className="space-y-4">
                  <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider block">
                    Reporting Manager
                  </span>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted border border-border rounded-xl">
                    {employee.reportingManager.profileImage ? (
                      <img
                        src={employee.reportingManager.profileImage}
                        alt={employee.reportingManager.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border">
                        <User size={20} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="truncate flex-1">
                      <h4 className="text-xs font-bold text-foreground truncate">{employee.reportingManager.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
                        {employee.reportingManager.designation}
                      </p>
                      <span className="text-[9px] text-muted-foreground font-mono mt-1 block uppercase">
                        {employee.reportingManager.employeeId}
                      </span>
                    </div>
                  </div>

                  {showStatsAndEmployeeList && (
                    <Button
                      onClick={() => navigate(`/employees/${employee.reportingManager?._id}`)}
                      className="w-full"
                    >
                      <span>View Manager Profile</span>
                      <ChevronRight size={12} />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground space-y-1">
                  <p className="text-sm font-semibold">No manager assigned</p>
                  <p className="text-xs">This employee reports to no one (root node).</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Form Modal */}
      <EmployeeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={fetchDetails}
        employeeId={employee._id}
      />
    </div>
  );
};
