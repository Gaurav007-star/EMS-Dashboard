import { Employee, IEmployee } from '../models/Employee';

/**
 * Checks if assigning newManagerId as reportingManager for employeeId will create a cycle.
 * Returns true if a cycle is detected, false otherwise.
 */
export const willCreateCircularReporting = async (
  employeeId: string,
  newManagerId: string | null
): Promise<boolean> => {
  if (!newManagerId) return false;

  // Cannot report to self
  if (employeeId === newManagerId) return true;

  let currentId: string | null = newManagerId;

  // We trace upwards from the proposed manager to see if we ever reach the employee
  while (currentId) {
    const manager: IEmployee | null = await Employee.findById(currentId);
    if (!manager) break;

    // Check if the current manager's reporting manager matches the target employee
    if (manager.reportingManager) {
      const parentId = manager.reportingManager.toString();
      if (parentId === employeeId) {
        return true; // Cycle detected
      }
      currentId = parentId;
    } else {
      currentId = null;
    }
  }

  return false;
};

interface ITreeNode {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: string;
  status: string;
  profileImage: string;
  children: ITreeNode[];
}

/**
 * Builds a nested tree hierarchy of employees.
 */
export const buildOrgTree = (employees: any[]): ITreeNode[] => {
  const map: { [key: string]: ITreeNode } = {};
  const roots: ITreeNode[] = [];

  // Initialize nodes
  employees.forEach((emp) => {
    map[emp._id.toString()] = {
      _id: emp._id.toString(),
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
      role: emp.role,
      status: emp.status,
      profileImage: emp.profileImage || '',
      children: [],
    };
  });

  // Link children to parents
  employees.forEach((emp) => {
    const node = map[emp._id.toString()];
    const parentId = emp.reportingManager ? emp.reportingManager.toString() : null;

    if (parentId && map[parentId]) {
      map[parentId].children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};
