export interface GenerateContractInput {
  templateId: string
  collaborationId: string
  customTerms?: Record<string, string>
}

export interface SignContractInput {
  signature: string
}

export interface ContractAuditEntry {
  id: string
  contractId: string
  signerId: string
  signerRole: string
  ipAddress: string
  signedAt: Date
}

export interface FTCCheckResult {
  id: string
  contentId: string
  hasDisclosure: boolean
  disclosureType: string | null
  isCompliant: boolean
  issues: string[]
  checkedAt: Date
}

export interface ContractTemplateSummary {
  id: string
  name: string
  description: string | null
  category: string | null
  termsTemplate: string
  createdAt: Date
}
