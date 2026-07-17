"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Employee_1 = require("./models/Employee");
const seedDatabase = async () => {
    try {
        // Clear existing data
        await Employee_1.Employee.deleteMany({});
        console.log('Cleared existing employees.');
        // ============================================================
        // 1. Super Admins (2)
        // ============================================================
        const admin1 = new Employee_1.Employee({
            employeeId: 'admin123',
            name: 'admin123',
            email: 'admin123@ems.com',
            phone: '1234567890',
            department: 'Administration',
            designation: 'Super Administrator',
            salary: 150000,
            joiningDate: new Date('2024-01-01'),
            status: 'Active',
            role: 'Super Admin',
            reportingManager: null,
            profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            password: 'admin123',
        });
        const savedAdmin1 = await admin1.save();
        console.log('Created Super Admin: admin123 / admin123');
        const admin2 = new Employee_1.Employee({
            employeeId: 'admin456',
            name: 'Priya Sharma',
            email: 'priya.s@ems.com',
            phone: '1234567891',
            department: 'Administration',
            designation: 'Super Administrator',
            salary: 145000,
            joiningDate: new Date('2024-02-15'),
            status: 'Active',
            role: 'Super Admin',
            reportingManager: null,
            profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=250',
            password: 'admin456',
        });
        const savedAdmin2 = await admin2.save();
        console.log('Created Super Admin: admin456 / admin456');
        // ============================================================
        // 2. HR Managers (5) — report to Super Admins
        // ============================================================
        const hr1 = new Employee_1.Employee({
            employeeId: 'hr123',
            name: 'HR Manager User',
            email: 'hr123@ems.com',
            phone: '9876543210',
            department: 'Human Resources',
            designation: 'HR Manager',
            salary: 85000,
            joiningDate: new Date('2024-06-15'),
            status: 'Active',
            role: 'HR Manager',
            reportingManager: savedAdmin1._id,
            profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
            password: 'hr123',
        });
        const savedHR1 = await hr1.save();
        console.log('Created HR Manager: hr123 / hr123');
        const hr2 = new Employee_1.Employee({
            employeeId: 'hr124',
            name: 'Rajesh Kumar',
            email: 'rajesh.k@ems.com',
            phone: '9876543211',
            department: 'Human Resources',
            designation: 'HR Manager',
            salary: 82000,
            joiningDate: new Date('2024-07-01'),
            status: 'Active',
            role: 'HR Manager',
            reportingManager: savedAdmin1._id,
            profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
            password: 'hr124',
        });
        const savedHR2 = await hr2.save();
        console.log('Created HR Manager: hr124 / hr124');
        const hr3 = new Employee_1.Employee({
            employeeId: 'hr125',
            name: 'Angela Torres',
            email: 'angela.t@ems.com',
            phone: '9876543212',
            department: 'Human Resources',
            designation: 'HR Manager',
            salary: 83000,
            joiningDate: new Date('2024-08-10'),
            status: 'Active',
            role: 'HR Manager',
            reportingManager: savedAdmin2._id,
            profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
            password: 'hr125',
        });
        const savedHR3 = await hr3.save();
        console.log('Created HR Manager: hr125 / hr125');
        const hr4 = new Employee_1.Employee({
            employeeId: 'hr126',
            name: 'James Mitchell',
            email: 'james.m@ems.com',
            phone: '9876543213',
            department: 'Human Resources',
            designation: 'HR Manager',
            salary: 80000,
            joiningDate: new Date('2024-09-01'),
            status: 'Active',
            role: 'HR Manager',
            reportingManager: savedAdmin2._id,
            profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
            password: 'hr126',
        });
        const savedHR4 = await hr4.save();
        console.log('Created HR Manager: hr126 / hr126');
        const hr5 = new Employee_1.Employee({
            employeeId: 'hr127',
            name: 'Nina Patel',
            email: 'nina.p@ems.com',
            phone: '9876543214',
            department: 'Human Resources',
            designation: 'HR Manager',
            salary: 84000,
            joiningDate: new Date('2024-10-05'),
            status: 'Active',
            role: 'HR Manager',
            reportingManager: savedAdmin1._id,
            profileImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250',
            password: 'hr127',
        });
        const savedHR5 = await hr5.save();
        console.log('Created HR Manager: hr127 / hr127');
        // ============================================================
        // 3. Employees (18) — report to various HR Managers
        // ============================================================
        const employees = [
            {
                employeeId: 'EMP-10001',
                name: 'Sarah Jenkins',
                email: 'sarah.j@ems.com',
                phone: '5550192834',
                department: 'Engineering',
                designation: 'Senior Frontend Engineer',
                salary: 95000,
                joiningDate: new Date('2025-01-10'),
                status: 'Active',
                reportingManager: savedHR1._id,
                profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10002',
                name: 'Michael Chen',
                email: 'michael.c@ems.com',
                phone: '5550192835',
                department: 'Engineering',
                designation: 'Backend Developer',
                salary: 80000,
                joiningDate: new Date('2025-03-22'),
                status: 'Active',
                reportingManager: savedHR1._id,
                profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10003',
                name: 'David Kojo',
                email: 'david.k@ems.com',
                phone: '5550192836',
                department: 'Design',
                designation: 'UI/UX Designer',
                salary: 75000,
                joiningDate: new Date('2025-05-01'),
                status: 'Active',
                reportingManager: savedHR1._id,
                profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10004',
                name: 'Former Colleague',
                email: 'former.c@ems.com',
                phone: '5550192837',
                department: 'Marketing',
                designation: 'Social Media Manager',
                salary: 60000,
                joiningDate: new Date('2024-02-01'),
                status: 'Inactive',
                reportingManager: savedHR1._id,
                profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10005',
                name: 'Emily Watson',
                email: 'emily.w@ems.com',
                phone: '5550192838',
                department: 'Finance',
                designation: 'Financial Analyst',
                salary: 78000,
                joiningDate: new Date('2025-02-14'),
                status: 'Active',
                reportingManager: savedHR2._id,
                profileImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10006',
                name: 'Carlos Rodriguez',
                email: 'carlos.r@ems.com',
                phone: '5550192839',
                department: 'Sales',
                designation: 'Sales Executive',
                salary: 65000,
                joiningDate: new Date('2025-04-18'),
                status: 'Active',
                reportingManager: savedHR2._id,
                profileImage: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10007',
                name: 'Aisha Bello',
                email: 'aisha.b@ems.com',
                phone: '5550192840',
                department: 'Engineering',
                designation: 'DevOps Engineer',
                salary: 92000,
                joiningDate: new Date('2025-01-25'),
                status: 'Active',
                reportingManager: savedHR2._id,
                profileImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10008',
                name: 'Tom Bradley',
                email: 'tom.b@ems.com',
                phone: '5550192841',
                department: 'Operations',
                designation: 'Operations Manager',
                salary: 88000,
                joiningDate: new Date('2024-11-30'),
                status: 'Active',
                reportingManager: savedHR3._id,
                profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10009',
                name: 'Sophia Lee',
                email: 'sophia.l@ems.com',
                phone: '5550192842',
                department: 'Design',
                designation: 'Graphic Designer',
                salary: 68000,
                joiningDate: new Date('2025-06-01'),
                status: 'Active',
                reportingManager: savedHR3._id,
                profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10010',
                name: 'Ryan O\'Connor',
                email: 'ryan.o@ems.com',
                phone: '5550192843',
                department: 'Marketing',
                designation: 'Content Strategist',
                salary: 72000,
                joiningDate: new Date('2025-03-10'),
                status: 'Active',
                reportingManager: savedHR3._id,
                profileImage: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10011',
                name: 'Mei Lin',
                email: 'mei.l@ems.com',
                phone: '5550192844',
                department: 'Engineering',
                designation: 'QA Engineer',
                salary: 76000,
                joiningDate: new Date('2025-04-22'),
                status: 'Active',
                reportingManager: savedHR4._id,
                profileImage: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10012',
                name: 'Oscar Rivera',
                email: 'oscar.r@ems.com',
                phone: '5550192845',
                department: 'Sales',
                designation: 'Sales Manager',
                salary: 90000,
                joiningDate: new Date('2024-12-05'),
                status: 'Active',
                reportingManager: savedHR4._id,
                profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10013',
                name: 'Fatima Al-Hassan',
                email: 'fatima.h@ems.com',
                phone: '5550192846',
                department: 'Finance',
                designation: 'Accountant',
                salary: 70000,
                joiningDate: new Date('2025-02-28'),
                status: 'Active',
                reportingManager: savedHR4._id,
                profileImage: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10014',
                name: 'Lucas Weber',
                email: 'lucas.w@ems.com',
                phone: '5550192847',
                department: 'Engineering',
                designation: 'Mobile Developer',
                salary: 87000,
                joiningDate: new Date('2025-05-15'),
                status: 'Active',
                reportingManager: savedHR5._id,
                profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10015',
                name: 'Priyanka Gupta',
                email: 'priyanka.g@ems.com',
                phone: '5550192848',
                department: 'Operations',
                designation: 'Logistics Coordinator',
                salary: 62000,
                joiningDate: new Date('2025-06-20'),
                status: 'Active',
                reportingManager: savedHR5._id,
                profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10016',
                name: 'Derek Foster',
                email: 'derek.f@ems.com',
                phone: '5550192849',
                department: 'Marketing',
                designation: 'SEO Specialist',
                salary: 67000,
                joiningDate: new Date('2025-07-01'),
                status: 'Active',
                reportingManager: savedHR5._id,
                profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10017',
                name: 'Isabella Rossi',
                email: 'isabella.r@ems.com',
                phone: '5550192850',
                department: 'Design',
                designation: 'Product Designer',
                salary: 82000,
                joiningDate: new Date('2025-03-05'),
                status: 'Active',
                reportingManager: savedHR2._id,
                profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250',
            },
            {
                employeeId: 'EMP-10018',
                name: 'Samuel Brooks',
                email: 'samuel.b@ems.com',
                phone: '5550192851',
                department: 'Finance',
                designation: 'Data Analyst',
                salary: 74000,
                joiningDate: new Date('2025-01-20'),
                status: 'Active',
                reportingManager: savedHR1._id,
                profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
            },
        ];
        for (const emp of employees) {
            const e = new Employee_1.Employee({
                ...emp,
                role: 'Employee',
                password: 'password123',
            });
            await e.save();
        }
        console.log(`Created ${employees.length} employees`);
        console.log('Database seeding completed successfully!');
        console.log('Summary: 2 Super Admins, 5 HR Managers, 18 Employees = 25 total');
    }
    catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
};
exports.default = seedDatabase;
