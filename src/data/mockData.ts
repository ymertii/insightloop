export const interventions = [
  { id: "A1", title: "Workload Redesign and Redistribution", category: "Structural", jdDimension: "Workload", expectedImpact: 0.9, estimatedCost: 0.6, speed: 0.3, readinessNeed: 0.8, description: "Systematic review and reallocation of tasks to balance demands." },
  { id: "A2", title: "Participatory Intervention Process", category: "Process", jdDimension: "Control", expectedImpact: 0.8, estimatedCost: 0.4, speed: 0.4, readinessNeed: 0.7, description: "Involving employees in identifying stressors and designing solutions." },
  { id: "A3", title: "Managerial Coaching and Leadership Training", category: "Training", jdDimension: "Support", expectedImpact: 0.85, estimatedCost: 0.7, speed: 0.5, readinessNeed: 0.6, description: "Equipping leaders with skills to support team wellbeing and recognize burnout." },
  { id: "A4", title: "Flexible Work Policies and Schedule Control", category: "Policy", jdDimension: "Control", expectedImpact: 0.75, estimatedCost: 0.2, speed: 0.8, readinessNeed: 0.5, description: "Allowing employees autonomy over when and where they work." },
  { id: "A5", title: "Team Restructuring and Role Redesign", category: "Structural", jdDimension: "Workload", expectedImpact: 0.8, estimatedCost: 0.5, speed: 0.3, readinessNeed: 0.8, description: "Changing team compositions and clarifying role boundaries." },
  { id: "A6", title: "Conflict Resolution and Mediation Programs", category: "Process", jdDimension: "Support", expectedImpact: 0.6, estimatedCost: 0.4, speed: 0.6, readinessNeed: 0.6, description: "Structured programs to address interpersonal friction." },
  { id: "A7", title: "Peer Support Networks and Mentoring", category: "Support", jdDimension: "Support", expectedImpact: 0.7, estimatedCost: 0.2, speed: 0.7, readinessNeed: 0.4, description: "Creating formal and informal networks for peer-to-peer support." },
  { id: "A8", title: "Recognition and Reward System Redesign", category: "Policy", jdDimension: "Fairness", expectedImpact: 0.75, estimatedCost: 0.6, speed: 0.5, readinessNeed: 0.5, description: "Aligning rewards with effort and ensuring equitable distribution." },
  { id: "A9", title: "Autonomy and Control Enhancement", category: "Process", jdDimension: "Control", expectedImpact: 0.8, estimatedCost: 0.1, speed: 0.6, readinessNeed: 0.7, description: "Delegating decision-making authority to lower levels." },
  { id: "A10", title: "Internal Communication Improvement", category: "Process", jdDimension: "Fairness", expectedImpact: 0.65, estimatedCost: 0.2, speed: 0.7, readinessNeed: 0.4, description: "Enhancing transparency and frequency of organizational updates." },
  { id: "A11", title: "Career Development Pathways", category: "Policy", jdDimension: "Support", expectedImpact: 0.7, estimatedCost: 0.5, speed: 0.4, readinessNeed: 0.6, description: "Creating clear progression routes and skill development opportunities." },
  { id: "A12", title: "Role Clarity and Job Description Initiative", category: "Structural", jdDimension: "Workload", expectedImpact: 0.75, estimatedCost: 0.2, speed: 0.6, readinessNeed: 0.5, description: "Updating and clarifying expectations for all roles." },
  { id: "A13", title: "Mindfulness and Stress Reduction Workshops", category: "Individual", jdDimension: "Support", expectedImpact: 0.4, estimatedCost: 0.3, speed: 0.9, readinessNeed: 0.2, description: "Providing tools for individual stress management." },
  { id: "A14", title: "Digital Wellness Platforms", category: "Individual", jdDimension: "Support", expectedImpact: 0.5, estimatedCost: 0.4, speed: 0.9, readinessNeed: 0.2, description: "App-based resources for mental health and wellbeing." },
  { id: "A15", title: "Job Crafting Intervention Training", category: "Training", jdDimension: "Control", expectedImpact: 0.65, estimatedCost: 0.4, speed: 0.6, readinessNeed: 0.5, description: "Teaching employees to proactively shape their roles." },
  { id: "A16", title: "Process Redesign for High-Demand Roles", category: "Structural", jdDimension: "Workload", expectedImpact: 0.85, estimatedCost: 0.7, speed: 0.2, readinessNeed: 0.8, description: "Lean or agile redesign of specific high-stress workflows." },
  { id: "A17", title: "Organizational Mental Health Support Programs", category: "Support", jdDimension: "Support", expectedImpact: 0.7, estimatedCost: 0.8, speed: 0.5, readinessNeed: 0.4, description: "EAP, counseling, and clinical support access." },
  { id: "A18", title: "Recovery Time and Work-Life Boundary Policies", category: "Policy", jdDimension: "Workload", expectedImpact: 0.8, estimatedCost: 0.1, speed: 0.8, readinessNeed: 0.6, description: "Enforcing right-to-disconnect and mandatory recovery periods." }
];

export const departments = [
  { id: "D1", name: "Management", employeeCount: 12, burnoutScore: 2.8, stressScore: 3.1, resourceIndex: 3.5, fairness: 3.8, riskLevel: "High", trend: "up", manager: "Sarah Jenkins" },
  { id: "D2", name: "Finance", employeeCount: 45, burnoutScore: 2.9, stressScore: 2.8, resourceIndex: 3.2, fairness: 3.5, riskLevel: "High", trend: "stable", manager: "David Chen" },
  { id: "D3", name: "Marketing", employeeCount: 38, burnoutScore: 3.1, stressScore: 3.2, resourceIndex: 2.9, fairness: 3.1, riskLevel: "High", trend: "up", manager: "Elena Rodriguez" },
  { id: "D4", name: "Sales", employeeCount: 120, burnoutScore: 3.4, stressScore: 3.8, resourceIndex: 2.7, fairness: 2.8, riskLevel: "Critical", trend: "up", manager: "Marcus Johnson" },
  { id: "D5", name: "Operations", employeeCount: 250, burnoutScore: 3.2, stressScore: 3.5, resourceIndex: 2.6, fairness: 2.5, riskLevel: "Critical", trend: "stable", manager: "Lisa Wong" },
  { id: "D6", name: "IT", employeeCount: 65, burnoutScore: 3.0, stressScore: 3.1, resourceIndex: 3.0, fairness: 3.2, riskLevel: "High", trend: "down", manager: "James Wilson" },
  { id: "D7", name: "Product", employeeCount: 42, burnoutScore: 3.1, stressScore: 3.3, resourceIndex: 3.1, fairness: 3.4, riskLevel: "High", trend: "stable", manager: "Anna Kowalski" },
  { id: "D8", name: "DevOps", employeeCount: 28, burnoutScore: 3.8, stressScore: 4.1, resourceIndex: 2.2, fairness: 2.9, riskLevel: "Critical", trend: "up", manager: "Tom Baker" },
  { id: "D9", name: "HR", employeeCount: 18, burnoutScore: 2.9, stressScore: 3.0, resourceIndex: 3.4, fairness: 3.6, riskLevel: "High", trend: "stable", manager: "Rachel Green" },
  { id: "D10", name: "Legal", employeeCount: 15, burnoutScore: 2.7, stressScore: 2.9, resourceIndex: 3.6, fairness: 3.9, riskLevel: "Moderate", trend: "down", manager: "Robert Taylor" },
  { id: "D11", name: "Customer Services", employeeCount: 180, burnoutScore: 3.5, stressScore: 3.7, resourceIndex: 2.4, fairness: 2.6, riskLevel: "Critical", trend: "up", manager: "Michelle Davis" },
  { id: "D12", name: "Business Development", employeeCount: 35, burnoutScore: 3.3, stressScore: 3.6, resourceIndex: 2.8, fairness: 2.2, riskLevel: "Critical", trend: "stable", manager: "Chris Evans" }
];

export const personas = [
  { id: "P1", name: "Overloaded Builders", description: "High workload, low control. Often found in technical and product roles.", dominantPattern: "Exhaustion + Low Autonomy", affectedDepartments: ["DevOps", "IT", "Product"], recommendedBundle: ["A1", "A5", "A9"] },
  { id: "P2", name: "Pressure Sellers", description: "High stress, high reward dependency. Driven by quotas.", dominantPattern: "High Stress + Variable Fairness", affectedDepartments: ["Sales", "Business Development"], recommendedBundle: ["A8", "A12", "A18"] },
  { id: "P3", name: "Service Strain Cluster", description: "Emotional labor heavy, low autonomy.", dominantPattern: "Cynicism + Low Support", affectedDepartments: ["Customer Services", "Operations"], recommendedBundle: ["A4", "A7", "A13"] },
  { id: "P4", name: "Justice Deficit Group", description: "Feel efforts are not recognized or rewarded fairly.", dominantPattern: "Low Fairness + Cynicism", affectedDepartments: ["Business Development", "Operations"], recommendedBundle: ["A8", "A10", "A2"] },
  { id: "P5", name: "High-Stress Leaders", description: "High control but overwhelming demands and isolation.", dominantPattern: "High Efficacy + High Exhaustion", affectedDepartments: ["Management", "HR"], recommendedBundle: ["A3", "A7", "A18"] },
  { id: "P6", name: "Stable but Fragile Contributors", description: "Currently okay, but trending towards burnout due to systemic issues.", dominantPattern: "Moderate Stress + Declining Resources", affectedDepartments: ["Finance", "Legal", "Marketing"], recommendedBundle: ["A11", "A14", "A15"] }
];

export const reports = [
  { id: "R1", title: "Q3 Organizational Health Executive Summary", type: "Executive Summary", scope: "Company", date: "2026-04-01", author: "AI Narrative Engine", status: "Published", category: "Organization" as any },
  { id: "R2", title: "DevOps Burnout Diagnostic", type: "Department Diagnostic", scope: "Department", date: "2026-04-05", author: "AI Narrative Engine", status: "Published", category: "Department" as any },
  { id: "R3", title: "Sales Fairness & Reward Analysis", type: "Deep Dive", scope: "Department", date: "2026-04-08", author: "HR Analytics", status: "Draft", category: "Department" as any },
  { id: "R4", title: "Intervention Ranking: Workload vs Control", type: "Intervention Recommendation", scope: "Company", date: "2026-04-10", author: "AI Narrative Engine", status: "Published", category: "Organization" as any }
];

export const calculateTopsis = (weights: { cost: number, speed: number, impact: number, readiness: number }) => {
  // Mock TOPSIS calculation based on weights
  // In a real app, this would normalize the matrix, apply weights, find ideal/anti-ideal solutions, and calculate relative closeness.
  // Here we simulate it by calculating a weighted score.
  // Cost is negative (lower is better), Speed is positive (higher is better), Impact is positive, Readiness is positive.
  
  const results = interventions.map(inv => {
    // Normalize mock values (0-1 range)
    const costScore = (1 - inv.estimatedCost) * (weights.cost / 100);
    const speedScore = inv.speed * (weights.speed / 100);
    const impactScore = inv.expectedImpact * (weights.impact / 100);
    const readinessScore = inv.readinessNeed * (weights.readiness / 100);
    
    const score = costScore + speedScore + impactScore + readinessScore;
    
    return {
      ...inv,
      closenessCoefficient: score.toFixed(3)
    };
  });
  
  return results.sort((a, b) => parseFloat(b.closenessCoefficient) - parseFloat(a.closenessCoefficient));
};
