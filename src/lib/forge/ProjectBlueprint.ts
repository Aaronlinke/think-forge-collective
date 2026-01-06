// ProjectBlueprint - Datenstrukturen für Blueprint-Wissensdatenbank

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  infra: string;
}

export interface BlueprintSection {
  projectName: string;
  vision: string;
  architecture: string;
  techStack: TechStack;
  databaseSchema: string;
  apiEndpoints: string[];
  securityStrategy: string;
  scalingPlan: string;
  priorityFeatures: string[];
}

export interface BlueprintMeta {
  folderStructure: string;
  designPatterns: string[];
  moduleDependencies: Record<string, string[]>;
  stateManagement: string;
  cachingStrategy: string;
  rateLimiting: string;
  errorBoundaryStrategy: string;
}

export interface BlueprintCode {
  backendBoilerplate: string;
  frontendComponents: string[];
  authImplementation: string;
  models: string;
  apiClientConfig: string;
  envConfig: string;
  loggingMiddleware: string;
}

export interface BlueprintSecurity {
  injectionPrevention: string;
  cspPolicy: string;
  csrfImplementation: string;
  advancedRateLimit: string;
  encryptionStandard: string;
  securityHeaders: string[];
  sanitizationLogic: string;
  auditLogDesign: string;
}

export interface BlueprintInfra {
  dockerConfig: string;
  k8sManifests: string;
  ciCdPipeline: string;
  terraformPlan: string;
  monitoringStack: string;
  autoScalingRules: string;
  backupStrategy: string;
  healthCheckEndpoints: string[];
}

export interface BlueprintTesting {
  unitTestSuite: string;
  integrationTests: string;
  e2eScenarios: string[];
  loadTestingParams: string;
  perfOptimizations: string;
  dbOptimization: string;
  bundleOptimization: string;
  latencyImprovements: string;
}

export interface BlueprintDocs {
  apiDocumentation: string;
  adminDashboardFeatures: string[];
  analyticsStrategy: string;
  featureFlags: string;
  multiTenancy: string;
  whiteLabeling: string;
  operationsRunbook: string;
  troubleshootingGuide?: string;
  executiveSummary?: string;
}

export interface ProjectBlueprint {
  id: string;
  name: string;
  shortName: string;
  category: 'crypto' | 'propulsion' | 'forensic' | 'kernel' | 'unified';
  sections: {
    overview: BlueprintSection;
    meta: BlueprintMeta;
    code: BlueprintCode;
    security: BlueprintSecurity;
    infra: BlueprintInfra;
    testing: BlueprintTesting;
    docs: BlueprintDocs;
  };
  // Extracted concepts for the collective
  concepts: string[];
  techTerms: string[];
  dependencies: string[];
  createdAt: number;
}

export interface ConceptNode {
  concept: string;
  foundIn: string[]; // Blueprint IDs
  relatedConcepts: string[];
  frequency: number;
  category: 'tech' | 'pattern' | 'security' | 'architecture' | 'crypto';
}

export interface BlueprintConnection {
  from: string;
  to: string;
  sharedConcepts: string[];
  strength: number;
}
