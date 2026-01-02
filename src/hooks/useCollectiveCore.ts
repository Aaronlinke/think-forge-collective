import { useState, useEffect, useCallback } from 'react';
import { 
  getCollectiveCore, 
  CollectiveState, 
  CollectiveCore,
  WordConnection 
} from '@/lib/collective/CollectiveCore';
import { GeneratedKey } from '@/lib/math/OMNIGENESIS';
import { EvaluationResult, TruthValue } from '@/lib/svrc/DecisionEngine';

export const useCollectiveCore = () => {
  const [core] = useState<CollectiveCore>(() => getCollectiveCore());
  const [state, setState] = useState<CollectiveState>(() => core.getState());
  const [isRunning, setIsRunning] = useState(false);
  
  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = core.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, [core]);
  
  // Auto-pulse when running
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      core.pulse();
    }, 100);
    
    return () => clearInterval(interval);
  }, [isRunning, core]);
  
  // Actions
  const pulse = useCallback(() => {
    return core.pulse();
  }, [core]);
  
  const startPulsing = useCallback(() => {
    setIsRunning(true);
  }, []);
  
  const stopPulsing = useCallback(() => {
    setIsRunning(false);
  }, []);
  
  const togglePulsing = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);
  
  const processInput = useCallback((text: string) => {
    core.processInput(text);
  }, [core]);
  
  const generateKeys = useCallback((count?: number): GeneratedKey[] => {
    return core.generateCryptoKeys(count);
  }, [core]);
  
  const evaluateStatement = useCallback((statement: string): EvaluationResult => {
    return core.evaluateStatement(statement);
  }, [core]);
  
  const addAxiom = useCallback((
    id: string, 
    statement: string, 
    value: TruthValue, 
    dependencies?: string[]
  ) => {
    core.addAxiom(id, statement, value, dependencies);
  }, [core]);
  
  const getWordNetwork = useCallback((): WordConnection[] => {
    return core.getWordNetwork();
  }, [core]);
  
  const reset = useCallback(() => {
    core.reset();
    setIsRunning(false);
  }, [core]);
  
  return {
    state,
    isRunning,
    pulse,
    startPulsing,
    stopPulsing,
    togglePulsing,
    processInput,
    generateKeys,
    evaluateStatement,
    addAxiom,
    getWordNetwork,
    reset,
    core
  };
};
