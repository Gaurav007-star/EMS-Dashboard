import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { Trash2, RotateCcw, Search, ArrowLeft, Calendar, User } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../components/ui/input-group";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "../components/ui/pagination";

interface DeletedEmployee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  role: string;
  deletedAt: string;
  profileImage: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const Bin: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<DeletedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: "restore" | "permanent"; employeeId: string; employeeName: string }>({ isOpen: false, type: "restore", employeeId: "", employeeName: "" });
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBinEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({ search, page: String(page), limit: "10" });
      const res = await api.get(`/employees/bin?${queryParams.toString()}`);
      if (res.data.success) {
        setEmployees(res.data.employees);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch bin contents.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { const t = setTimeout(fetchBinEmployees, 300); return () => clearTimeout(t); }, [fetchBinEmployees]);

  const handleRestore = async () => {
    setActionError(null);
    setIsProcessing(true);
    try {
      const res = await api.post(`/employees/${actionModal.employeeId}/restore`);
      if (res.data.success) {
        setActionModal({ isOpen: false, type: "restore", employeeId: "", employeeName: "" });
        fetchBinEmployees();
        window.dispatchEvent(new Event('bin-updated'));
        toast.success('Employee restored successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to restore employee.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanentDelete = async () => {
    setActionError(null);
    setIsProcessing(true);
    try {
      const res = await api.delete(`/employees/${actionModal.employeeId}/permanent`);
      if (res.data.success) {
        setActionModal({ isOpen: false, type: "permanent", employeeId: "", employeeName: "" });
        fetchBinEmployees();
        window.dispatchEvent(new Event('bin-updated'));
        toast.success('Employee permanently deleted');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to permanently delete.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const getRoleBadge = (role: string) => {
    if (role === "Super Admin") return <Badge variant="destructive">{role}</Badge>;
    if (role === "HR Manager") return <Badge variant="default">{role}</Badge>;
    return <Badge variant="secondary">{role}</Badge>;
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/employees")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={13} />
        Directory
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Bin</h1>
          <p className="text-sm text-muted-foreground mt-1">Soft-deleted employees can be restored or permanently removed</p>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs">
          <Trash2 size={13} />
          {pagination.total} item{pagination.total !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="relative max-w-sm">
        <InputGroup>
          <InputGroupAddon><Search /></InputGroupAddon>
          <InputGroupInput placeholder="Search by name, email or ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </InputGroup>
      </div>

      {error && <div className="bg-destructive/8 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary" size={28} />
            <p className="text-muted-foreground text-xs">Loading bin...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
              <Trash2 size={20} className="text-muted-foreground/60" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">{search ? "No results match your search" : "Bin is empty"}</p>
            {!search && <p className="text-muted-foreground/60 text-xs">Deleted employees will appear here</p>}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Deleted On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {emp.profileImage ? (
                        <img src={emp.profileImage} alt={emp.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User size={14} className="text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight">{emp.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{emp.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{emp.department}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{emp.designation}</TableCell>
                  <TableCell>{getRoleBadge(emp.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar size={12} />
                      {formatDate(emp.deletedAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="icon" onClick={() => setActionModal({ isOpen: true, type: "restore", employeeId: emp._id, employeeName: emp.name })} className="h-8 w-8 text-muted-foreground hover:text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200" title="Restore Employee">
                        <RotateCcw size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setActionModal({ isOpen: true, type: "permanent", employeeId: emp._id, employeeName: emp.name })} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20" title="Permanently Delete">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {pagination.total > 0 && (
        <div className="w-full h-max flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} deleted
          </p>
          {pagination.totalPages > 1 && (
            <Pagination className="w-max">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} className={pagination.page <= 1 ? "pointer-events-none opacity-40" : "cursor-pointer"} />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(pagination.totalPages, p + 1)); }} className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog open={actionModal.isOpen} onOpenChange={(open) => !open && setActionModal({ isOpen: false, type: "restore", employeeId: "", employeeName: "" })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{actionModal.type === "restore" ? "Restore Employee" : "Permanent Delete"}</DialogTitle>
            <DialogDescription>
              {actionModal.type === "restore" ? (
                <>Are you sure you want to restore <span className="font-semibold text-foreground">{actionModal.employeeName}</span>? They will reappear in the employee directory.</>
              ) : (
                <>Are you sure you want to permanently delete <span className="font-semibold text-foreground">{actionModal.employeeName}</span>? This action cannot be undone.</>
              )}
            </DialogDescription>
          </DialogHeader>
          {actionError && <div className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-2 rounded-lg text-xs">{actionError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setActionModal({ isOpen: false, type: "restore", employeeId: "", employeeName: "" })} disabled={isProcessing}>Cancel</Button>
            <Button type="button" variant={actionModal.type === "restore" ? "default" : "destructive"} onClick={actionModal.type === "restore" ? handleRestore : handlePermanentDelete} disabled={isProcessing}>
              {isProcessing ? "Processing..." : actionModal.type === "restore" ? "Restore" : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Loader2: React.FC<{ className?: string; size?: number }> = ({ className, size = 20 }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={size} height={size}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);
