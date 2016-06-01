export interface ProjectBuildPlan {
  sourcePatterns: string;
  compileOutputFolder: string;
  cleanPatterns: string[];
  testPatterns: string[];
}