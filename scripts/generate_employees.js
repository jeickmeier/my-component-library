// Helper functions
function getRandomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function getRandomDate(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    return randomDate.toISOString().split('T')[0];
}

function getRandomName() {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jennifer', 'Thomas', 'Lisa', 'Daniel', 'Karen', 'Christopher', 'Alice', 'Bob', 'Mary', 'James', 'Patricia', 'William', 'Elizabeth'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

// Department configurations
const departments = ['engineering', 'marketing', 'sales', 'hr'];
const baseSalaries = {
    'engineering': 80000,
    'marketing': 70000,
    'sales': 75000,
    'hr': 65000
};
const baseProjects = {
    'engineering': 5,
    'marketing': 3,
    'sales': 4,
    'hr': 2
};

function generateEmployee(id) {
    const department = departments[Math.floor(Math.random() * departments.length)];
    const startDate = getRandomDate('2015-01-01', '2024-03-01');
    const yearsExperience = (new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24 * 365);
    const experienceMultiplier = 1 + (yearsExperience * 0.05);
    const randomMultiplier = getRandomFloat(0.9, 1.2);
    const salary = Math.floor(baseSalaries[department] * experienceMultiplier * randomMultiplier);
    
    const projectCount = Math.min(15, Math.max(1, 
        Math.floor(baseProjects[department] * (1 + yearsExperience * 0.1))
    ));

    return {
        id: `emp${id.toString().padStart(3, '0')}`,
        name: getRandomName(),
        department: department,
        salary: salary,
        startDate: startDate,
        status: ['active', 'onLeave', 'terminated'][Math.floor(Math.random() * 3)],
        performance: getRandomFloat(1, 5),
        fullTime: Math.random() > 0.2,
        projectCount: projectCount
    };
}

// Generate 500 employees
const employees = Array.from({length: 500}, (_, i) => generateEmployee(i + 1));

// Convert to JSON string
const jsonString = JSON.stringify(employees, null, 2);

// Create and download the file
const blob = new Blob([jsonString], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'large-employees.json';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url); 