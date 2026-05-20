export type DealStage =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface PipelineDeal {
  id: string;
  userId: string;
  leadId: string | null;
  customerId: string | null;
  title: string;
  stage: DealStage;
  value: number | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    name: string;
    email: string | null;
    company: string | null;
  } | null;
  customer?: {
    id: string;
    name: string;
    email: string | null;
    company: string | null;
  } | null;
}

export interface PipelineColumn {
  id: DealStage;
  title: string;
  deals: PipelineDeal[];
}

export interface PipelineResponse {
  columns: PipelineColumn[];
}

export interface UpdateDealStageInput {
  stage: DealStage;
}
