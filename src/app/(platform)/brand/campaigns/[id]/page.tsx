"use client";

import { useState, useEffect } from "react";
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
  Star,
  Mail,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { api } from "@/lib/api-client";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

type ListingDetail = {
  id: string;
  title: string;
  description: string;
  status: string;
  budgetMin: number | null;
  budgetMax: number | null;
  compensationType: string;
  requirements: string | null;
  targetNiches: string[];
  targetPlatforms: string[];
  targetLocations: string[];
  targetAgeRange: string | null;
  targetGender: string | null;
  minFollowers: number | null;
  maxFollowers: number | null;
  totalSlots: number;
  filledSlots: number;
  applicationDeadline: string | null;
  isFeatured: boolean;
  campaign: {
    id: string;
    title: string;
    description: string;
    category: string;
    startDate: string;
    endDate: string;
    maxInfluencers: number;
    status: string;
  };
  brand: {
    id: string;
    companyName: string;
    logo: string | null;
  };
  _count?: {
    applications: number;
  };
};

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
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "applicants" | "accepted" | "performance"
  >("overview");

  useEffect(() => {
    loadCampaign();
  }, [params.id]);

  const loadCampaign = async () => {
    try {
      const listingId = params.id as string;

      // Fetch listing details
      const listingRes = await api.get<any>(`/marketplace/listings/${listingId}`);
      if (listingRes.error) throw new Error(listingRes.error);
      setListing(listingRes.data);

      // Fetch applications and collaborations in parallel
      const [appsRes, collabsRes] = await Promise.allSettled([
        api.get<any>(`/marketplace/listings/${listingId}/applications`),
        api.get<any>("/collaborations", { campaignId: listingRes.data?.campaign?.id }),
      ]);

      if (appsRes.status === "fulfilled" && !appsRes.value.error) {
        setApplications(appsRes.value.data?.data || []);
      }
      if (collabsRes.status === "fulfilled" && !collabsRes.value.error) {
        setCollaborations(collabsRes.value.data?.data || []);
      }
    } catch (err) {
      console.error("Error loading campaign:", err);
      setError("Failed to load campaign details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: string, influencerId: string) => {
    if (!listing) return;

    try {
      // Create a collaboration for the accepted influencer
      const res = await api.post<any>("/collaborations", {
        campaignId: listing.campaign.id,
        influencerId,
        agreedAmount: listing.budgetMin || 0,
        message: "Your application has been accepted!",
      });

      if (res.error) throw new Error(res.error);

      // Update application status locally
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId ? { ...a, status: "ACCEPTED" } : a
        )
      );

      // Reload to get updated data
      loadCampaign();
    } catch (err: any) {
      console.error("Error accepting application:", err);
      alert(err.message || "Failed to accept application");
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[rgb(var(--surface))] rounded w-1/3" />
          <div className="h-64 bg-[rgb(var(--surface))] rounded" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container py-8">
        <Card className="text-center py-16">
          <CardContent>
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-[rgb(var(--muted))]" />
            <h3 className="text-xl font-semibold mb-2">
              {error || "Campaign not found"}
            </h3>
            <Link href="/brand/campaigns">
              <Button>Back to Campaigns</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingApplications = applications.filter((a) => a.status === "PENDING" || a.status === "SUBMITTED");
  const acceptedCollaborations = collaborations.filter(
    (c) => c.status === "ACCEPTED" || c.status === "IN_PROGRESS" || c.status === "COMPLETED"
  );

  const spotsRemaining = listing.totalSlots - listing.filledSlots;

  const requirementsList = listing.requirements
    ? listing.requirements.split("\n").filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-4 md:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Back Button */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <Link href="/brand/campaigns">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Campaigns
              </Button>
            </Link>
          </motion.div>

          {/* Header Section */}
          <motion.div variants={staggerItem} className="mb-6 md:mb-8">
            <Card className="border-2">
              <CardContent className="p-4 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                      <h1 className="text-2xl md:text-4xl font-bold flex-1 min-w-0">
                        {listing.title}
                      </h1>
                      <Badge
                        variant={
                          listing.status === "OPEN"
                            ? "success"
                            : listing.status === "DRAFT"
                              ? "warning"
                              : "default"
                        }
                      >
                        {listing.status}
                      </Badge>
                    </div>

                    <p className="text-sm md:text-base text-[rgb(var(--muted))] mb-4">
                      {listing.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{listing.campaign.category}</Badge>
                      {listing.targetPlatforms.map((platform) => (
                        <Badge key={platform} variant="outline">
                          {platform.charAt(0) + platform.slice(1).toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {listing.status === "DRAFT" && (
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        <span className="hidden md:inline">Edit</span>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[rgb(var(--border))]">
                  <div>
                    <div className="text-xs text-[rgb(var(--muted))] mb-1">
                      Budget
                    </div>
                    <div className="text-lg md:text-xl font-bold gradient-text">
                      {formatCurrency(listing.budgetMin || 0)}-
                      {formatCurrency(listing.budgetMax || 0)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[rgb(var(--muted))] mb-1">
                      Influencers
                    </div>
                    <div className="text-lg md:text-xl font-bold gradient-text">
                      {listing.filledSlots}/{listing.totalSlots}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[rgb(var(--muted))] mb-1">
                      Applicants
                    </div>
                    <div className="text-lg md:text-xl font-bold gradient-text">
                      {applications.length}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[rgb(var(--muted))] mb-1">
                      Deadline
                    </div>
                    <div className="text-lg md:text-xl font-bold gradient-text">
                      {listing.applicationDeadline
                        ? new Date(listing.applicationDeadline).toLocaleDateString("en-US", {
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
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
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
                { value: "performance" as const, label: "Performance" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.value
                      ? "bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg"
                      : "bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                variants={staggerItem}
                className="grid lg:grid-cols-2 gap-4 sm:gap-6"
              >
                {/* Campaign Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Campaign Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Niches</div>
                      <div className="flex flex-wrap gap-2">
                        {listing.targetNiches.length > 0
                          ? listing.targetNiches.map((niche) => (
                              <Badge key={niche} variant="outline">
                                {niche}
                              </Badge>
                            ))
                          : <span className="text-sm text-[rgb(var(--muted))]">No specific niches</span>}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">
                        Target Audience
                      </div>
                      <div className="space-y-2 text-sm text-[rgb(var(--muted))]">
                        {listing.targetAgeRange && (
                          <div>Age: {listing.targetAgeRange}</div>
                        )}
                        {listing.targetGender && (
                          <div>Gender: {listing.targetGender}</div>
                        )}
                        {listing.targetLocations.length > 0 && (
                          <div>
                            Locations: {listing.targetLocations.slice(0, 3).join(", ")}
                            {listing.targetLocations.length > 3 && " ..."}
                          </div>
                        )}
                      </div>
                    </div>

                    {requirementsList.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Requirements
                        </div>
                        <div className="space-y-2 text-sm text-[rgb(var(--muted))]">
                          {requirementsList.map((req, idx) => (
                            <div key={idx}>{req}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(listing.minFollowers || listing.maxFollowers) && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Follower Requirements
                        </div>
                        <div className="space-y-2 text-sm text-[rgb(var(--muted))]">
                          {listing.minFollowers && (
                            <div>Min Followers: {formatCompactNumber(listing.minFollowers)}</div>
                          )}
                          {listing.maxFollowers && (
                            <div>Max Followers: {formatCompactNumber(listing.maxFollowers)}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {listing.applicationDeadline && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-[rgb(var(--muted))]" />
                        <div>
                          <div className="text-sm text-[rgb(var(--muted))]">
                            Application Deadline
                          </div>
                          <div className="font-semibold">
                            {new Date(listing.applicationDeadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-[rgb(var(--muted))]" />
                      <div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          Campaign Period
                        </div>
                        <div className="font-semibold">
                          {new Date(listing.campaign.startDate).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(listing.campaign.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-[rgb(var(--muted))]" />
                      <div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          Compensation
                        </div>
                        <div className="font-semibold">
                          {listing.compensationType.charAt(0) + listing.compensationType.slice(1).toLowerCase()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Spots Remaining */}
                <Card className="border-2 border-[rgb(var(--brand-primary))]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Users className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-2">
                      {spotsRemaining} spots
                    </div>
                    <div className="text-xs sm:text-sm text-[rgb(var(--muted))] mb-3 sm:mb-4">
                      remaining out of {listing.totalSlots}
                    </div>
                    <div className="h-2 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] rounded-full transition-all"
                        style={{
                          width: `${listing.totalSlots > 0 ? (listing.filledSlots / listing.totalSlots) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Applicants Tab */}
            {activeTab === "applicants" && (
              <motion.div variants={staggerItem}>
                {pendingApplications.length === 0 ? (
                  <Card className="text-center py-16">
                    <CardContent>
                      <Users className="h-16 w-16 text-[rgb(var(--muted))] mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No applicants yet
                      </h3>
                      <p className="text-[rgb(var(--muted))]">
                        Check back later for influencer applications
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {pendingApplications.map((application) => (
                      <Card
                        key={application.id}
                        className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all"
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <Avatar className="h-16 w-16 shrink-0">
                              {application.influencer.avatar ? (
                                <img
                                  src={application.influencer.avatar}
                                  alt={application.influencer.fullName}
                                />
                              ) : (
                                <Users className="h-8 w-8" />
                              )}
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold mb-1">
                                {application.influencer.fullName}
                              </h3>
                              <p className="text-sm text-[rgb(var(--muted))] mb-3 line-clamp-2">
                                {application.influencer.bio || "No bio available"}
                              </p>

                              {/* Cover letter excerpt */}
                              {application.coverLetter && (
                                <div className="mb-3 p-2 rounded bg-[rgb(var(--surface))] text-sm text-[rgb(var(--muted))] line-clamp-2">
                                  "{application.coverLetter}"
                                </div>
                              )}

                              {/* Stats */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                {application.influencer.platforms
                                  ?.slice(0, 2)
                                  .map((platform) => (
                                    <div key={platform.platform} className="text-sm">
                                      <div className="text-xs text-[rgb(var(--muted))]">
                                        {platform.platform.charAt(0) + platform.platform.slice(1).toLowerCase()}
                                      </div>
                                      <div className="font-semibold">
                                        {formatCompactNumber(platform.followers)}
                                      </div>
                                    </div>
                                  ))}
                              </div>

                              {/* Proposed rate */}
                              {application.proposedRate && (
                                <div className="text-sm mb-3">
                                  <span className="text-[rgb(var(--muted))]">Proposed rate: </span>
                                  <span className="font-semibold">{formatCurrency(application.proposedRate)}</span>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-2">
                                <Button
                                  variant="gradient"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() =>
                                    handleAcceptApplication(application.id, application.influencer.id)
                                  }
                                  disabled={spotsRemaining === 0}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Link
                                  href={`/brand/discover/${application.influencer.id}`}
                                  className="flex-1"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </Link>
                              </div>
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
              <motion.div variants={staggerItem}>
                {acceptedCollaborations.length === 0 ? (
                  <Card className="text-center py-16">
                    <CardContent>
                      <CheckCircle2 className="h-16 w-16 text-[rgb(var(--muted))] mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No accepted influencers
                      </h3>
                      <p className="text-[rgb(var(--muted))]">
                        Review and accept applicants to get started
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {acceptedCollaborations.map((collab) => (
                      <Card
                        key={collab.id}
                        className="border-2 border-green-500/20 bg-green-500/5"
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col items-center text-center">
                            <Avatar className="h-20 w-20 mb-4">
                              {collab.influencer.avatar ? (
                                <img
                                  src={collab.influencer.avatar}
                                  alt={collab.influencer.fullName}
                                />
                              ) : (
                                <Users className="h-10 w-10" />
                              )}
                            </Avatar>

                            <h3 className="text-lg font-bold mb-1">
                              {collab.influencer.fullName}
                            </h3>
                            {collab.influencer.rating && (
                              <div className="flex items-center gap-1 mb-3">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span className="text-sm font-medium">
                                  {Number(collab.influencer.rating).toFixed(1)}
                                </span>
                              </div>
                            )}

                            <div className="w-full space-y-2 mb-4">
                              {collab.influencer.platforms
                                ?.slice(0, 2)
                                .map((platform) => (
                                  <div
                                    key={platform.platform}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="text-[rgb(var(--muted))]">
                                      {platform.platform.charAt(0) + platform.platform.slice(1).toLowerCase()}
                                    </span>
                                    <span className="font-semibold">
                                      {formatCompactNumber(platform.followers)}
                                    </span>
                                  </div>
                                ))}
                            </div>

                            <div className="text-sm mb-3">
                              <Badge
                                variant={
                                  collab.status === "IN_PROGRESS"
                                    ? "success"
                                    : collab.status === "COMPLETED"
                                      ? "outline"
                                      : "default"
                                }
                              >
                                {collab.status === "IN_PROGRESS"
                                  ? "In Progress"
                                  : collab.status === "COMPLETED"
                                    ? "Completed"
                                    : "Accepted"}
                              </Badge>
                            </div>

                            <div className="flex gap-2 w-full">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Link
                                href={`/brand/discover/${collab.influencer.id}`}
                                className="flex-1"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full"
                                >
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

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <motion.div variants={staggerItem}>
                <Card className="text-center py-16">
                  <CardContent>
                    <TrendingUp className="h-16 w-16 text-[rgb(var(--muted))] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No performance data yet
                    </h3>
                    <p className="text-[rgb(var(--muted))]">
                      Performance metrics will appear once the campaign is
                      active and influencers start delivering content
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
