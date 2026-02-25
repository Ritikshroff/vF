"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  Edit,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Star,
  Mail,
  ExternalLink,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatCompactNumber, getInitials } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useListingDetail, useListingApplications } from "@/hooks/queries/use-marketplace";
import { useCollaborations } from "@/hooks/queries/use-collaborations";
import { useReviewApplication } from "@/hooks/mutations/use-marketplace-mutations";
import { useCreateCollaboration } from "@/hooks/mutations/use-collaboration-mutations";

type Application = {
  id: string;
  status: string;
  coverLetter: string | null;
  proposedRate: number | null;
  createdAt: string;
  influencer: {
    id: string;
    fullName: string;
    avatar: string | null;
    bio: string | null;
    rating: any;
    platforms: Array<{
      platform: string;
      followers: number;
    }>;
  };
};

type Collaboration = {
  id: string;
  status: string;
  agreedAmount: number;
  influencer: {
    id: string;
    fullName: string;
    avatar: string | null;
    rating: any;
    platforms: Array<{
      platform: string;
      followers: number;
    }>;
  };
};

export default function BrandCampaignDetailPage() {
  const params = useParams();
  const listingId = params.id as string;

  const { data: listing, isLoading: listingLoading } = useListingDetail(listingId);
  const { data: appsRaw, isLoading: appsLoading } = useListingApplications(listingId);
  const campaignId = (listing as any)?.campaign?.id;
  const { data: collabsRaw, isLoading: collabsLoading } = useCollaborations(
    campaignId ? { campaignId } : undefined
  );

  const reviewMutation = useReviewApplication();
  const createCollabMutation = useCreateCollaboration();

  const [activeTab, setActiveTab] = useState<
    "overview" | "applicants" | "accepted" | "rejected" | "performance"
  >("overview");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const isLoading = listingLoading || appsLoading;
  const applications: Application[] = Array.isArray(appsRaw) ? appsRaw : appsRaw?.data ?? [];
  const collaborations: Collaboration[] = Array.isArray(collabsRaw) ? collabsRaw : collabsRaw?.data ?? [];

  const handleAcceptApplication = (applicationId: string, influencerId: string) => {
    if (!listing) return;
    const listingData = listing as any;

    // Review application as ACCEPTED
    reviewMutation.mutate(
      { applicationId, data: { status: "ACCEPTED" } },
      {
        onSuccess: () => {
          // Also create a collaboration
          createCollabMutation.mutate({
            campaignId: listingData.campaign.id,
            influencerId,
            agreedAmount: listingData.budgetMin || 0,
            message: "Your application has been accepted!",
          });
        },
      }
    );
  };

  const handleRejectApplication = (applicationId: string) => {
    reviewMutation.mutate(
      { applicationId, data: { status: "REJECTED" } },
      { onSuccess: () => setRejectingId(null) }
    );
  };

  if (isLoading) {
    return (
      <div className="container py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container py-4 sm:py-8">
        <Card className="text-center py-8 sm:py-16">
          <CardContent>
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Campaign not found</h3>
            <Link href="/brand/campaigns">
              <Button>Back to Campaigns</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const listingData = listing as any;
  const pendingApplications = applications.filter(
    (a) => a.status === "PENDING" || a.status === "SUBMITTED"
  );
  const rejectedApplications = applications.filter((a) => a.status === "REJECTED");
  const acceptedCollaborations = collaborations.filter(
    (c) => c.status === "PROPOSAL_SENT" || c.status === "ACCEPTED" || c.status === "IN_PROGRESS" || c.status === "COMPLETED" || c.status === "CONTRACT_SENT" || c.status === "CONTRACT_SIGNED"
  );

  const spotsRemaining = (listingData.totalSlots || 1) - (listingData.filledSlots || 0);

  const requirementsList = listingData.requirements
    ? listingData.requirements.split("\n").filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container py-3 sm:py-4 lg:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Back Button */}
          <motion.div variants={staggerItem} className="mb-3 sm:mb-6">
            <Link href="/brand/campaigns">
              <Button variant="ghost" size="sm" className="gap-2 min-h-[44px]">
                <ArrowLeft className="h-4 w-4" />
                Back to Campaigns
              </Button>
            </Link>
          </motion.div>

          {/* Header Section */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <Card className="border border-border">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold flex-1 min-w-0">
                        {listingData.title}
                      </h1>
                      <Badge
                        variant={
                          listingData.status === "OPEN"
                            ? "success"
                            : listingData.status === "DRAFT"
                              ? "warning"
                              : "default"
                        }
                      >
                        {listingData.status}
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm text-muted mb-3 sm:mb-4 line-clamp-3">
                      {listingData.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {listingData.campaign?.category && (
                        <Badge variant="outline" className="text-xs">
                          {listingData.campaign.category}
                        </Badge>
                      )}
                      {(listingData.targetPlatforms || []).map((platform: string) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform.charAt(0) + platform.slice(1).toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {listingData.status === "DRAFT" && (
                      <Button variant="outline" size="sm" className="min-h-[44px]">
                        <Edit className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="min-h-[44px]">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border">
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted mb-1">Budget</div>
                    <div className="text-base sm:text-lg lg:text-xl font-bold gradient-text">
                      {formatCurrency(listingData.budgetMin || 0)}-
                      {formatCurrency(listingData.budgetMax || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted mb-1">Influencers</div>
                    <div className="text-base sm:text-lg lg:text-xl font-bold gradient-text">
                      {listingData.filledSlots || 0}/{listingData.totalSlots || 1}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted mb-1">Applicants</div>
                    <div className="text-base sm:text-lg lg:text-xl font-bold gradient-text">
                      {applications.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted mb-1">Deadline</div>
                    <div className="text-base sm:text-lg lg:text-xl font-bold gradient-text">
                      {listingData.applicationDeadline
                        ? new Date(listingData.applicationDeadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={staggerItem} className="mb-3 sm:mb-4 lg:mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                { value: "overview" as const, label: "Overview" },
                {
                  value: "applicants" as const,
                  label: `Applicants (${pendingApplications.length})`,
                },
                {
                  value: "accepted" as const,
                  label: `Accepted (${acceptedCollaborations.length})`,
                },
                {
                  value: "rejected" as const,
                  label: `Rejected (${rejectedApplications.length})`,
                },
                { value: "performance" as const, label: "Performance" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm lg:text-base font-medium whitespace-nowrap transition-all min-h-[44px] ${
                    activeTab === tab.value
                      ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
                      : "bg-surface text-muted hover:text-foreground border border-border"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6"
              >
                {/* Campaign Details */}
                <Card>
                  <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2">
                    <CardTitle className="text-sm sm:text-base lg:text-lg">Campaign Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 space-y-3">
                    <div>
                      <div className="text-xs sm:text-sm font-medium mb-1.5">Niches</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(listingData.targetNiches || []).length > 0
                          ? listingData.targetNiches.map((niche: string) => (
                              <Badge key={niche} variant="outline" className="text-xs">
                                {niche}
                              </Badge>
                            ))
                          : <span className="text-xs text-muted">No specific niches</span>}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs sm:text-sm font-medium mb-1.5">Target Audience</div>
                      <div className="space-y-1 text-xs sm:text-sm text-muted">
                        {listingData.targetAgeRange && <div>Age: {listingData.targetAgeRange}</div>}
                        {listingData.targetGender && <div>Gender: {listingData.targetGender}</div>}
                        {(listingData.targetLocations || []).length > 0 && (
                          <div>Locations: {listingData.targetLocations.slice(0, 3).join(", ")}</div>
                        )}
                      </div>
                    </div>

                    {requirementsList.length > 0 && (
                      <div>
                        <div className="text-xs sm:text-sm font-medium mb-1.5">Requirements</div>
                        <div className="space-y-1 text-xs sm:text-sm text-muted">
                          {requirementsList.map((req: string, idx: number) => (
                            <div key={idx}>{req}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(listingData.minFollowers || listingData.maxFollowers) && (
                      <div>
                        <div className="text-xs sm:text-sm font-medium mb-1.5">Follower Range</div>
                        <div className="space-y-1 text-xs sm:text-sm text-muted">
                          {listingData.minFollowers && (
                            <div>Min: {formatCompactNumber(listingData.minFollowers)}</div>
                          )}
                          {listingData.maxFollowers && (
                            <div>Max: {formatCompactNumber(listingData.maxFollowers)}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2">
                    <CardTitle className="text-sm sm:text-base lg:text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 space-y-3">
                    {listingData.applicationDeadline && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted shrink-0" />
                        <div>
                          <div className="text-[10px] sm:text-xs text-muted">Application Deadline</div>
                          <div className="text-sm sm:text-base font-semibold">
                            {new Date(listingData.applicationDeadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                    {listingData.campaign?.startDate && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted shrink-0" />
                        <div>
                          <div className="text-[10px] sm:text-xs text-muted">Campaign Period</div>
                          <div className="text-sm sm:text-base font-semibold">
                            {new Date(listingData.campaign.startDate).toLocaleDateString()} -{" "}
                            {new Date(listingData.campaign.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-muted shrink-0" />
                      <div>
                        <div className="text-[10px] sm:text-xs text-muted">Compensation</div>
                        <div className="text-sm sm:text-base font-semibold">
                          {listingData.compensationType
                            ? listingData.compensationType.charAt(0) + listingData.compensationType.slice(1).toLowerCase()
                            : "Negotiable"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Spots Remaining */}
                <Card className="border border-brand-primary/20">
                  <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-brand-primary" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text mb-1.5">
                      {spotsRemaining} spots
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted mb-3">
                      remaining out of {listingData.totalSlots || 1}
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all"
                        style={{
                          width: `${(listingData.totalSlots || 1) > 0
                            ? ((listingData.filledSlots || 0) / (listingData.totalSlots || 1)) * 100
                            : 0}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Applicants Tab */}
            {activeTab === "applicants" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {pendingApplications.length === 0 ? (
                  <Card className="text-center py-8 sm:py-16">
                    <CardContent>
                      <Users className="h-12 w-12 sm:h-16 sm:w-16 text-muted mx-auto mb-4" />
                      <h3 className="text-base sm:text-xl font-semibold mb-2">No applicants yet</h3>
                      <p className="text-xs sm:text-sm text-muted">
                        Check back later for influencer applications
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {pendingApplications.map((application) => (
                      <Card
                        key={application.id}
                        className="border border-border hover:border-brand-primary/40 transition-all"
                      >
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                          <div className="flex gap-3 sm:gap-4">
                            <Avatar
                              className="h-12 w-12 sm:h-16 sm:w-16 shrink-0"
                              src={application.influencer.avatar || undefined}
                              fallback={getInitials(application.influencer.fullName)}
                            />

                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-1 truncate">
                                {application.influencer.fullName}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted mb-2 line-clamp-2">
                                {application.influencer.bio || "No bio available"}
                              </p>

                              {/* Cover letter */}
                              {application.coverLetter && (
                                <div className="mb-2 p-2 rounded bg-surface text-xs sm:text-sm text-muted line-clamp-2">
                                  &ldquo;{application.coverLetter}&rdquo;
                                </div>
                              )}

                              {/* Platforms */}
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                {application.influencer.platforms?.slice(0, 2).map((p) => (
                                  <div key={p.platform} className="text-xs sm:text-sm">
                                    <div className="text-[10px] sm:text-xs text-muted">
                                      {p.platform.charAt(0) + p.platform.slice(1).toLowerCase()}
                                    </div>
                                    <div className="font-semibold">
                                      {formatCompactNumber(p.followers)}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Proposed rate */}
                              {application.proposedRate && (
                                <div className="text-xs sm:text-sm mb-2">
                                  <span className="text-muted">Proposed: </span>
                                  <span className="font-semibold">
                                    {formatCurrency(application.proposedRate)}
                                  </span>
                                </div>
                              )}

                              {/* Applied date */}
                              <div className="text-[10px] sm:text-xs text-muted mb-3 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Applied {new Date(application.createdAt).toLocaleDateString()}
                              </div>

                              {/* Actions */}
                              {rejectingId === application.id ? (
                                <div className="space-y-2">
                                  <p className="text-xs sm:text-sm text-muted">
                                    Reject this application?
                                  </p>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 min-h-[44px] border-red-500/30 text-red-500 hover:bg-red-500/10"
                                      onClick={() => handleRejectApplication(application.id)}
                                      disabled={reviewMutation.isPending}
                                    >
                                      {reviewMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Confirm
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="flex-1 min-h-[44px]"
                                      onClick={() => setRejectingId(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <Button
                                    variant="gradient"
                                    size="sm"
                                    className="flex-1 min-h-[44px]"
                                    onClick={() =>
                                      handleAcceptApplication(
                                        application.id,
                                        application.influencer.id
                                      )
                                    }
                                    disabled={spotsRemaining === 0 || reviewMutation.isPending}
                                  >
                                    {reviewMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        Accept
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 min-h-[44px] border-red-500/30 text-red-500 hover:bg-red-500/10"
                                    onClick={() => setRejectingId(application.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Link
                                    href={`/brand/discover/${application.influencer.id}`}
                                    className="shrink-0"
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="min-h-[44px] px-3"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Accepted Tab */}
            {activeTab === "accepted" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {acceptedCollaborations.length === 0 ? (
                  <Card className="text-center py-8 sm:py-16">
                    <CardContent>
                      <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-muted mx-auto mb-4" />
                      <h3 className="text-base sm:text-xl font-semibold mb-2">
                        No accepted influencers
                      </h3>
                      <p className="text-xs sm:text-sm text-muted">
                        Review and accept applicants to get started
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {acceptedCollaborations.map((collab) => (
                      <Card
                        key={collab.id}
                        className="border border-brand-primary/20 bg-brand-primary/5"
                      >
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                          <div className="flex flex-col items-center text-center">
                            <Avatar
                              className="h-14 w-14 sm:h-20 sm:w-20 mb-3 sm:mb-4"
                              src={collab.influencer.avatar || undefined}
                              fallback={getInitials(collab.influencer.fullName)}
                            />

                            <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-1">
                              {collab.influencer.fullName}
                            </h3>
                            {collab.influencer.rating && (
                              <div className="flex items-center gap-1 mb-2 sm:mb-3">
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-500 text-yellow-500" />
                                <span className="text-xs sm:text-sm font-medium">
                                  {Number(collab.influencer.rating).toFixed(1)}
                                </span>
                              </div>
                            )}

                            <div className="w-full space-y-1.5 mb-3">
                              {collab.influencer.platforms?.slice(0, 2).map((p) => (
                                <div key={p.platform} className="flex justify-between text-xs sm:text-sm">
                                  <span className="text-muted">
                                    {p.platform.charAt(0) + p.platform.slice(1).toLowerCase()}
                                  </span>
                                  <span className="font-semibold">
                                    {formatCompactNumber(p.followers)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <Badge
                              variant={
                                collab.status === "IN_PROGRESS"
                                  ? "success"
                                  : collab.status === "COMPLETED"
                                    ? "outline"
                                    : "default"
                              }
                              className="mb-3 text-xs"
                            >
                              {collab.status === "IN_PROGRESS"
                                ? "In Progress"
                                : collab.status === "COMPLETED"
                                  ? "Completed"
                                  : collab.status === "PROPOSAL_SENT"
                                    ? "Accepted"
                                    : collab.status.charAt(0) + collab.status.slice(1).toLowerCase().replace(/_/g, " ")}
                            </Badge>

                            <div className="flex gap-2 w-full">
                              <Button variant="outline" size="sm" className="flex-1 min-h-[44px]">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Link href={`/brand/discover/${collab.influencer.id}`} className="flex-1">
                                <Button variant="ghost" size="sm" className="w-full min-h-[44px]">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Rejected Tab */}
            {activeTab === "rejected" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {rejectedApplications.length === 0 ? (
                  <Card className="text-center py-8 sm:py-16">
                    <CardContent>
                      <XCircle className="h-12 w-12 sm:h-16 sm:w-16 text-muted mx-auto mb-4" />
                      <h3 className="text-base sm:text-xl font-semibold mb-2">
                        No rejected applications
                      </h3>
                      <p className="text-xs sm:text-sm text-muted">
                        Rejected applications will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {rejectedApplications.map((application) => (
                      <Card
                        key={application.id}
                        className="border border-red-500/10 bg-red-500/5 opacity-75"
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex gap-3">
                            <Avatar
                              className="h-10 w-10 sm:h-12 sm:w-12 shrink-0"
                              src={application.influencer.avatar || undefined}
                              fallback={getInitials(application.influencer.fullName)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-semibold truncate">
                                  {application.influencer.fullName}
                                </h3>
                                <Badge variant="error" className="text-[10px] shrink-0">
                                  Rejected
                                </Badge>
                              </div>
                              <p className="text-xs text-muted line-clamp-1">
                                {application.influencer.bio || "No bio"}
                              </p>
                              {application.proposedRate && (
                                <div className="text-xs text-muted mt-1">
                                  Proposed: {formatCurrency(application.proposedRate)}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="text-center py-8 sm:py-16">
                  <CardContent>
                    <TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 text-muted mx-auto mb-4" />
                    <h3 className="text-base sm:text-xl font-semibold mb-2">
                      No performance data yet
                    </h3>
                    <p className="text-xs sm:text-sm text-muted">
                      Performance metrics will appear once influencers start delivering content
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
