import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { EmployeeForm } from "./EmployeeForm";
import {
  Search,
  ArrowUpDown,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  UserX,
  AlertTriangle,
  ArrowLeft,
  User,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../components/ui/input-group";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { DEPARTMENT_LIST } from "../lib/constants";

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: "Active" | "Inactive";
  role: "Super Admin" | "HR Manager" | "Employee";
  joiningDate: string;
  profileImage: string;
  reportingManager: {
    _id: string;
    name: string;
    employeeId: string;
  } | null;
}

export const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; employeeId: string; employeeName: string }>({
    isOpen: false,
    employeeId: '',
    employeeName: '',
  });
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        search,
        department: department === "all" ? "" : department,
        role: role === "all" ? "" : role,
        status: status === "all" ? "" : status,
        sortBy,
        sortOrder,
        page: String(page),
        limit: "10",
      });

      const res = await api.get(`/employees?${queryParams.toString()}`);
      if (res.data.success) {
        setEmployees(res.data.employees);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err: any) {
      console.error("Error fetching employees:", err);
      setError(
        err.response?.data?.message || "Failed to fetch employees list.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, department, role, status, sortBy, sortOrder]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, department, role, status, sortBy, sortOrder, page]);

  const handleDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      const res = await api.delete(`/employees/${deleteModal.employeeId}`);
      if (res.data.success) {
        setDeleteModal({ isOpen: false, employeeId: '', employeeName: '' });
        fetchEmployees();
        window.dispatchEvent(new Event('bin-updated'));
      }
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || "Error occurred while deleting employee.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddModal = () => {
    setSelectedEmployeeId(null);
    setIsFormOpen(true);
  };

  const openEditModal = (id: string) => {
    setSelectedEmployeeId(id);
    setIsFormOpen(true);
  };

  const getStatusBadge = (empStatus: "Active" | "Inactive") => {
    if (empStatus === "Active") {
      return (
        <Badge variant="success" className="gap-1 px-2.5">
          <UserCheck size={12} />
          <span>Active</span>
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1 px-2.5">
        <UserX size={12} />
        <span>Inactive</span>
      </Badge>
    );
  };

  const getRoleBadge = (empRole: string) => {
    switch (empRole) {
      case "Super Admin":
        return <Badge variant="destructive">{empRole}</Badge>;
      case "HR Manager":
        return <Badge variant="default">{empRole}</Badge>;
      default:
        return <Badge variant="secondary">{empRole}</Badge>;
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={13} />
        Dashboard
      </button>

      {/* Title Header Section */}
      <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight font-display text-foreground">
            Employee Directory
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Manage profiles, roles, salary parameters, and reporting
            dependencies.
          </p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus size={16} />
          <span>Add Employee</span>
        </Button>
      </Card>

      {/* Search & Filters Panel */}
      <Card className="p-6 border border-border shadow-sm">
        <div className="flex items-center flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                placeholder="Search by name, email, or employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {employees.length > 0 && (
                <InputGroupAddon align="inline-end">
                  {employees.length} result{employees.length !== 1 ? "s" : ""}
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
            <div className="space-y-1.5">
              {/* <Label className="text-xs">Department</Label> */}
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENT_LIST.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              {/* <Label className="text-xs">Role</Label> */}
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="HR Manager">HR Manager</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              {/* <Label className="text-xs">Status</Label> */}
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Directory Table */}
      <Card className="shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary" size={36} />
            <p className="text-muted-foreground text-sm font-medium">
              Querying database records...
            </p>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground font-medium text-sm">
              No employees match your search criteria.
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Try resetting search keywords or active filters.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="select-none cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    <span>Name / ID</span>
                    <ArrowUpDown size={12} />
                  </div>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead
                  className="select-none cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSort("joiningDate")}
                >
                  <div className="flex items-center gap-1">
                    <span>Joined</span>
                    <ArrowUpDown size={12} />
                  </div>
                </TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {emp.profileImage ? (
                        <img
                          src={emp.profileImage}
                          alt={emp.name}
                          className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border shrink-0">
                          <User size={18} className="text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-foreground leading-tight">
                          {emp.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <Mail size={12} />
                      <span className="truncate max-w-[150px]">
                        {emp.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <Phone size={12} />
                      <span>{emp.phone}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-center">
                      {emp.department === "Human Resources"
                        ? "Hr"
                        : emp.department}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    {getRoleBadge(emp.role)}
                  </TableCell>

                  <TableCell className="text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>
                        {new Date(emp.joiningDate).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs font-semibold text-muted-foreground">
                    {emp.reportingManager ? (
                      <div>
                        <span className="text-foreground font-bold block leading-none">
                          {emp.reportingManager.name}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-mono block mt-1 uppercase tracking-tight">
                          {emp.reportingManager.employeeId}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground font-medium">
                        None
                      </span>
                    )}
                  </TableCell>

                  <TableCell>{getStatusBadge(emp.status)}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(emp._id)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-accent border border-transparent hover:border-border"
                        title="Edit Employee"
                      >
                        <Edit2 size={14} />
                      </Button>
                      {currentUser?.role === "Super Admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteModal({ isOpen: true, employeeId: emp._id, employeeName: emp.name })}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="w-full h-max flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} employees
          </p>
          {pagination.totalPages > 1 && (
          <Pagination className="w-max ">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                  className={pagination.page <= 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  const total = pagination.totalPages;
                  const current = pagination.page;
                  if (total <= 5) return true;
                  if (p === 1 || p === total) return true;
                  if (Math.abs(p - current) <= 1) return true;
                  return false;
                })
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === '...' ? (
                    <PaginationItem key={`dots-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        isActive={pagination.page === item}
                        onClick={(e) => { e.preventDefault(); setPage(item); }}
                        className="cursor-pointer"
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(pagination.totalPages, p + 1)); }}
                  className={pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          )}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <EmployeeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={fetchEmployees}
        employeeId={selectedEmployeeId}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal({ isOpen: false, employeeId: '', employeeName: '' })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Move to Bin</DialogTitle>
            <DialogDescription>
              Are you sure you want to move <span className="font-semibold text-foreground">{deleteModal.employeeName}</span> to the bin?
              They can be restored later from the Bin section. Reporting lines will be set to None.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-2 rounded-lg text-xs">
              {deleteError}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModal({ isOpen: false, employeeId: '', employeeName: '' })}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Moving...' : 'Move to Bin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Loader2: React.FC<{ className?: string; size?: number }> = ({
  className,
  size = 20,
}) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width={size}
    height={size}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
