// BlueprintRegistry - Zentrale Registry aller Blueprints mit Word-Extraction

import { 
  ProjectBlueprint, 
  BlueprintSection,
  BlueprintMeta,
  BlueprintCode,
  BlueprintSecurity,
  BlueprintInfra,
  BlueprintTesting,
  BlueprintDocs,
  ConceptNode,
  BlueprintConnection,
  TechStack
} from './ProjectBlueprint';

// Technical terms that should be recognized as concepts
const TECH_CONCEPTS = new Set([
  'rust', 'python', 'react', 'typescript', 'fastapi', 'postgresql', 'redis',
  'kubernetes', 'docker', 'terraform', 'aws', 'eks', 'hsm', 'secp256k1',
  'bigint', 'modular', 'arithmetic', 'cryptographic', 'wasm', 'webgl',
  'pyo3', 'ffi', 'grpc', 'protobuf', 'timescaledb', 'tokio', 'crossbeam',
  'oauth2', 'jwt', 'tls', 'mtls', 'aes', 'sha256', 'hmac', 'zeroize',
  'hexagonal', 'microservice', 'sidecar', 'capability', 'pola', 'worm',
  'lll', 'lattice', 'entropy', 'inversion', 'algebraic', 'deterministic',
  'fpga', 'gan', 'amplifier', 'propulsion', 'telemetry', 'spsc', 'lockfree',
  'omnigenesis', 'linke', 'chronoplast', 'loombus', 'loomos', 'moiré'
]);

export class BlueprintRegistry {
  private blueprints: Map<string, ProjectBlueprint> = new Map();
  private conceptGraph: Map<string, ConceptNode> = new Map();
  private connections: BlueprintConnection[] = [];
  private wordIndex: Map<string, Set<string>> = new Map(); // word -> blueprint IDs
  
  async loadBlueprints(): Promise<void> {
    const blueprintFiles = [
      { id: 'lckde', path: '/data/blueprint-lckde.json', name: 'LCKDE', category: 'crypto' as const },
      { id: 'loue', path: '/data/blueprint-loue.json', name: 'LOUE', category: 'unified' as const },
      { id: 'lightdrive', path: '/data/blueprint-lightdrive.json', name: 'LightDrive MK3', category: 'propulsion' as const },
      { id: 'apex', path: '/data/blueprint-apex.json', name: 'OmniGenesis Apex', category: 'forensic' as const },
      { id: 'sultan', path: '/data/blueprint-sultan.json', name: 'BLACK_SULTAN_OS', category: 'kernel' as const }
    ];
    
    for (const file of blueprintFiles) {
      try {
        const response = await fetch(file.path);
        if (response.ok) {
          const data = await response.json();
          const blueprint = this.parseBlueprint(file.id, file.name, file.category, data);
          this.blueprints.set(file.id, blueprint);
          this.indexBlueprint(blueprint);
        }
      } catch (error) {
        console.warn(`Failed to load blueprint ${file.id}:`, error);
      }
    }
    
    this.buildConceptGraph();
    this.calculateConnections();
  }
  
  private parseBlueprint(
    id: string, 
    name: string, 
    category: ProjectBlueprint['category'],
    data: Record<string, unknown>
  ): ProjectBlueprint {
    // Handle different JSON structures
    const section0 = (data['0'] as Record<string, unknown>) || data;
    const section1 = (data['1'] as Record<string, unknown>) || {};
    const section2 = (data['2'] as Record<string, unknown>) || {};
    const section3 = (data['3'] as Record<string, unknown>) || {};
    const section4 = (data['4'] as Record<string, unknown>) || {};
    const section5 = (data['5'] as Record<string, unknown>) || {};
    const section6 = (data['6'] as Record<string, unknown>) || {};
    
    // Handle array wrapper (LightDrive has [{ ... }])
    const overview0 = Array.isArray(section0) ? section0[0] : section0;
    
    const techStack = (overview0.techStack || {}) as TechStack;
    
    const overview: BlueprintSection = {
      projectName: (overview0.projectName as string) || name,
      vision: (overview0.vision as string) || '',
      architecture: (overview0.architecture as string) || '',
      techStack: {
        frontend: techStack.frontend || '',
        backend: techStack.backend || '',
        database: techStack.database || '',
        infra: techStack.infra || ''
      },
      databaseSchema: (overview0.databaseSchema as string) || '',
      apiEndpoints: (overview0.apiEndpoints as string[]) || [],
      securityStrategy: (overview0.securityStrategy as string) || '',
      scalingPlan: (overview0.scalingPlan as string) || '',
      priorityFeatures: (overview0.priorityFeatures as string[]) || []
    };
    
    const meta: BlueprintMeta = {
      folderStructure: (section1.folderStructure as string) || '',
      designPatterns: (section1.designPatterns as string[]) || [],
      moduleDependencies: (section1.moduleDependencies as Record<string, string[]>) || {},
      stateManagement: (section1.stateManagement as string) || '',
      cachingStrategy: (section1.cachingStrategy as string) || '',
      rateLimiting: (section1.rateLimiting as string) || '',
      errorBoundaryStrategy: (section1.errorBoundaryStrategy as string) || ''
    };
    
    const code: BlueprintCode = {
      backendBoilerplate: (section2.backendBoilerplate as string) || '',
      frontendComponents: (section2.frontendComponents as string[]) || [],
      authImplementation: (section2.authImplementation as string) || '',
      models: (section2.models as string) || '',
      apiClientConfig: (section2.apiClientConfig as string) || '',
      envConfig: (section2.envConfig as string) || '',
      loggingMiddleware: (section2.loggingMiddleware as string) || ''
    };
    
    const security: BlueprintSecurity = {
      injectionPrevention: (section3.injectionPrevention as string) || '',
      cspPolicy: (section3.cspPolicy as string) || '',
      csrfImplementation: (section3.csrfImplementation as string) || '',
      advancedRateLimit: (section3.advancedRateLimit as string) || '',
      encryptionStandard: (section3.encryptionStandard as string) || '',
      securityHeaders: (section3.securityHeaders as string[]) || [],
      sanitizationLogic: (section3.sanitizationLogic as string) || '',
      auditLogDesign: (section3.auditLogDesign as string) || ''
    };
    
    const infra: BlueprintInfra = {
      dockerConfig: (section4.dockerConfig as string) || '',
      k8sManifests: (section4.k8sManifests as string) || '',
      ciCdPipeline: (section4.ciCdPipeline as string) || '',
      terraformPlan: (section4.terraformPlan as string) || '',
      monitoringStack: (section4.monitoringStack as string) || '',
      autoScalingRules: (section4.autoScalingRules as string) || '',
      backupStrategy: (section4.backupStrategy as string) || '',
      healthCheckEndpoints: (section4.healthCheckEndpoints as string[]) || []
    };
    
    const testing: BlueprintTesting = {
      unitTestSuite: (section5.unitTestSuite as string) || '',
      integrationTests: (section5.integrationTests as string) || '',
      e2eScenarios: (section5.e2eScenarios as string[]) || [],
      loadTestingParams: (section5.loadTestingParams as string) || '',
      perfOptimizations: (section5.perfOptimizations as string) || '',
      dbOptimization: (section5.dbOptimization as string) || '',
      bundleOptimization: (section5.bundleOptimization as string) || '',
      latencyImprovements: (section5.latencyImprovements as string) || ''
    };
    
    const docs: BlueprintDocs = {
      apiDocumentation: (section6.apiDocumentation as string) || '',
      adminDashboardFeatures: (section6.adminDashboardFeatures as string[]) || [],
      analyticsStrategy: (section6.analyticsStrategy as string) || '',
      featureFlags: (section6.featureFlags as string) || '',
      multiTenancy: (section6.multiTenancy as string) || '',
      whiteLabeling: (section6.whiteLabeling as string) || '',
      operationsRunbook: (section6.operationsRunbook as string) || '',
      troubleshootingGuide: (section6.troubleshootingGuide as string) || undefined,
      executiveSummary: (section6.executiveSummary as string) || undefined
    };
    
    // Extract all text for concept mining
    const allText = this.extractAllText(overview, meta, code, security, infra, testing, docs);
    const { concepts, techTerms, dependencies } = this.extractConcepts(allText, meta.moduleDependencies);
    
    return {
      id,
      name,
      shortName: id.toUpperCase(),
      category,
      sections: { overview, meta, code, security, infra, testing, docs },
      concepts,
      techTerms,
      dependencies,
      createdAt: Date.now()
    };
  }
  
  private extractAllText(
    overview: BlueprintSection,
    meta: BlueprintMeta,
    code: BlueprintCode,
    security: BlueprintSecurity,
    infra: BlueprintInfra,
    testing: BlueprintTesting,
    docs: BlueprintDocs
  ): string {
    const parts = [
      overview.projectName,
      overview.vision,
      overview.architecture,
      overview.databaseSchema,
      overview.securityStrategy,
      overview.scalingPlan,
      ...overview.apiEndpoints,
      ...overview.priorityFeatures,
      meta.folderStructure,
      ...meta.designPatterns,
      meta.stateManagement,
      meta.cachingStrategy,
      code.backendBoilerplate,
      ...code.frontendComponents,
      code.authImplementation,
      security.injectionPrevention,
      security.encryptionStandard,
      ...security.securityHeaders,
      infra.dockerConfig,
      infra.k8sManifests,
      infra.terraformPlan,
      testing.unitTestSuite,
      ...testing.e2eScenarios,
      docs.apiDocumentation,
      ...docs.adminDashboardFeatures
    ];
    
    return parts.join(' ');
  }
  
  private extractConcepts(
    text: string, 
    dependencies: Record<string, string[]>
  ): { concepts: string[]; techTerms: string[]; dependencies: string[] } {
    const words = text.toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    const concepts = new Set<string>();
    const techTerms = new Set<string>();
    
    for (const word of words) {
      if (TECH_CONCEPTS.has(word)) {
        techTerms.add(word);
        concepts.add(word);
      }
    }
    
    // Extract dependencies
    const allDeps: string[] = [];
    for (const deps of Object.values(dependencies)) {
      allDeps.push(...deps);
    }
    
    return {
      concepts: Array.from(concepts),
      techTerms: Array.from(techTerms),
      dependencies: allDeps
    };
  }
  
  private indexBlueprint(blueprint: ProjectBlueprint): void {
    const allText = this.extractAllText(
      blueprint.sections.overview,
      blueprint.sections.meta,
      blueprint.sections.code,
      blueprint.sections.security,
      blueprint.sections.infra,
      blueprint.sections.testing,
      blueprint.sections.docs
    );
    
    const words = allText.toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    for (const word of words) {
      if (!this.wordIndex.has(word)) {
        this.wordIndex.set(word, new Set());
      }
      this.wordIndex.get(word)!.add(blueprint.id);
    }
  }
  
  private buildConceptGraph(): void {
    for (const blueprint of this.blueprints.values()) {
      for (const concept of blueprint.concepts) {
        if (!this.conceptGraph.has(concept)) {
          this.conceptGraph.set(concept, {
            concept,
            foundIn: [],
            relatedConcepts: [],
            frequency: 0,
            category: this.categorizeConcept(concept)
          });
        }
        
        const node = this.conceptGraph.get(concept)!;
        node.foundIn.push(blueprint.id);
        node.frequency++;
        
        // Find related concepts from same blueprint
        for (const other of blueprint.concepts) {
          if (other !== concept && !node.relatedConcepts.includes(other)) {
            node.relatedConcepts.push(other);
          }
        }
      }
    }
  }
  
  private categorizeConcept(concept: string): ConceptNode['category'] {
    const crypto = ['secp256k1', 'bigint', 'modular', 'cryptographic', 'aes', 'sha256', 'hmac', 'zeroize', 'omnigenesis', 'linke', 'lll', 'lattice', 'entropy'];
    const patterns = ['hexagonal', 'microservice', 'sidecar', 'capability', 'pola', 'spsc', 'lockfree'];
    const security = ['oauth2', 'jwt', 'tls', 'mtls', 'worm', 'hsm'];
    const arch = ['kubernetes', 'docker', 'terraform', 'aws', 'eks', 'grpc', 'protobuf'];
    
    if (crypto.includes(concept)) return 'crypto';
    if (patterns.includes(concept)) return 'pattern';
    if (security.includes(concept)) return 'security';
    if (arch.includes(concept)) return 'architecture';
    return 'tech';
  }
  
  private calculateConnections(): void {
    const blueprintIds = Array.from(this.blueprints.keys());
    
    for (let i = 0; i < blueprintIds.length; i++) {
      for (let j = i + 1; j < blueprintIds.length; j++) {
        const bp1 = this.blueprints.get(blueprintIds[i])!;
        const bp2 = this.blueprints.get(blueprintIds[j])!;
        
        const shared = bp1.concepts.filter(c => bp2.concepts.includes(c));
        
        if (shared.length > 0) {
          this.connections.push({
            from: bp1.id,
            to: bp2.id,
            sharedConcepts: shared,
            strength: shared.length / Math.max(bp1.concepts.length, bp2.concepts.length)
          });
        }
      }
    }
  }
  
  // === PUBLIC API ===
  
  getBlueprint(id: string): ProjectBlueprint | undefined {
    return this.blueprints.get(id);
  }
  
  getAllBlueprints(): ProjectBlueprint[] {
    return Array.from(this.blueprints.values());
  }
  
  searchBlueprints(query: string): ProjectBlueprint[] {
    const words = query.toLowerCase().split(/\s+/);
    const scores = new Map<string, number>();
    
    for (const word of words) {
      const matchingIds = this.wordIndex.get(word);
      if (matchingIds) {
        for (const id of matchingIds) {
          scores.set(id, (scores.get(id) || 0) + 1);
        }
      }
    }
    
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => this.blueprints.get(id)!)
      .filter(Boolean);
  }
  
  getConceptGraph(): ConceptNode[] {
    return Array.from(this.conceptGraph.values());
  }
  
  getConnections(): BlueprintConnection[] {
    return this.connections;
  }
  
  getWordIndex(): Map<string, Set<string>> {
    return this.wordIndex;
  }
  
  getStats(): {
    totalBlueprints: number;
    totalConcepts: number;
    totalConnections: number;
    totalWords: number;
  } {
    return {
      totalBlueprints: this.blueprints.size,
      totalConcepts: this.conceptGraph.size,
      totalConnections: this.connections.length,
      totalWords: this.wordIndex.size
    };
  }
}

// Singleton
let registryInstance: BlueprintRegistry | null = null;

export const getBlueprintRegistry = (): BlueprintRegistry => {
  if (!registryInstance) {
    registryInstance = new BlueprintRegistry();
  }
  return registryInstance;
};
