import { prisma } from '@/lib/db/prisma'

export async function listTemplates(brandId: string) {
  return prisma.contractTemplate.findMany({
    where: { brandId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getTemplate(templateId: string) {
  const template = await prisma.contractTemplate.findUnique({ where: { id: templateId } })
  if (!template) throw new Error('Template not found')
  return template
}

export async function signContract(contractId: string, userId: string, role: string, ipAddress: string, userAgent: string) {
  return prisma.$transaction(async (tx) => {
    // Record the audit entry
    const audit = await tx.contractSignatureAudit.create({
      data: { contractId, signerId: userId, signerRole: role, ipAddress, userAgent },
    })
    // Update the collaboration contract signature fields
    const updateData: Record<string, unknown> = {}
    if (role === 'BRAND') {
      updateData.brandSignature = `signed-${userId}`
      updateData.brandSignedAt = new Date()
    } else {
      updateData.influencerSignature = `signed-${userId}`
      updateData.influencerSignedAt = new Date()
    }
    const contract = await tx.collaborationContract.update({
      where: { id: contractId },
      data: updateData,
    })
    // Check if fully signed
    if (contract.brandSignedAt && contract.influencerSignedAt) {
      await tx.collaborationContract.update({
        where: { id: contractId },
        data: { isFullySigned: true },
      })
    }
    return audit
  })
}

export async function getContractAuditTrail(contractId: string) {
  return prisma.contractSignatureAudit.findMany({
    where: { contractId },
    orderBy: { signedAt: 'desc' },
  })
}

export async function checkFTCCompliance(contentId: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId }, select: { id: true, title: true, description: true, tags: true } })
  if (!content) throw new Error('Content not found')

  const text = `${content.title} ${content.description || ''} ${content.tags.join(' ')}`.toLowerCase()
  const disclosurePatterns = ['#ad', '#sponsored', '#paid', 'paid partnership', 'sponsored by', '#gifted']
  const hasDisclosure = disclosurePatterns.some((pattern) => text.includes(pattern))
  const disclosureType = disclosurePatterns.find((pattern) => text.includes(pattern)) || null
  const issues: string[] = []
  if (!hasDisclosure) issues.push('No FTC disclosure found (e.g., #ad, #sponsored)')

  return prisma.fTCComplianceCheck.create({
    data: { contentId, hasDisclosure, disclosureType, isCompliant: hasDisclosure, issues },
  })
}

export async function listFTCChecks(brandId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize
  const [data, total] = await Promise.all([
    prisma.fTCComplianceCheck.findMany({
      where: { content: { influencer: { collaborations: { some: { brandId } } } } },
      include: { content: { select: { id: true, title: true, type: true, platform: true } } },
      skip, take: pageSize, orderBy: { checkedAt: 'desc' },
    }),
    prisma.fTCComplianceCheck.count({ where: { content: { influencer: { collaborations: { some: { brandId } } } } } }),
  ])
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}
