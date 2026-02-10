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
  XCircle,
  Clock,
  Send,
  Star,
  Mail,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  fetchCampaignById,
  acceptInfluencerForCampaign,
} from "@/services/campaigns";
import { getAllInfluencers } from "@/mock-data/influencers";
import type { Campaign } from "@/mock-data/campaigns";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function BrandCampaignDetailPage() {
  const params = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "applicants" | "accepted" | "performance"
  >("overview");

  useEffect(() => {
    loadCampaign();
  }, [params.id]);

  const loadCampaign = async () => {
    try {
      const campaignId = params.id as string;
      const data = await fetchCampaignById(campaignId);
      setCampaign(data);
    } catch (error) {
      console.error("Error loading campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInfluencer = async (influencerId: string) => {
    if (!campaign) return;

    try {
      await acceptInfluencerForCampaign(campaign.id, influencerId);
      alert("Influencer accepted!");
      loadCampaign();
    } catch (error: any) {
      alert(error.message || "Failed to accept influencer");
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

  if (!campaign) {
    return (
      <div className="container py-8">
        <Card className="text-center py-16">
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">Campaign not found</h3>
            <Link href="/brand/campaigns">
              <Button>Back to Campaigns</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allInfluencers = getAllInfluencers();
  const appliedInfluencers = allInfluencers.filter((inf) =>
    campaign.applied_influencers.includes(inf.id),
  );
  const acceptedInfluencers = allInfluencers.filter((inf) =>
    campaign.accepted_influencers.includes(inf.id),
  );
  const invitedInfluencers = allInfluencers.filter((inf) =>
    campaign.invited_influencers.includes(inf.id),
  );

  const spotsRemaining =
    campaign.max_influencers - campaign.accepted_influencers.length;

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

          {/* Header Section - Mobile Optimized */}
          <motion.div variants={staggerItem} className="mb-6 md:mb-8">
            <Card className="border-2">
              <CardContent className="p-4 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                      <h1 className="text-2xl md:text-4xl font-bold flex-1 min-w-0">
                        {campaign.title}
                      </h1>
                      <Badge
                        variant={
                          campaign.status === "active"
                            ? "success"
                            : campaign.status === "draft"
                              ? "warning"
                              : "default"
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </div>

                    <p className="text-sm md:text-base text-[rgb(var(--muted))] mb-4">
                      {campaign.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{campaign.category}</Badge>
                      {campaign.platforms.map((platform) => (
                        <Badge key={platform} variant="outline">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {campaign.status === "draft" && (
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

                {/* Stats Grid - Mobile 2 cols */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[rgb(var(--border))]">
                  <div>
                    <div className="text-xs text-[rgb(var(--muted))] mb-1">
                      Budget
                    </div>
                    <div className="text-lg md:text-xl font-bold gradient-text">
                      {formatCurrency(campaign.budget.min)}-
                      {formatCurrency(campaign.budget.max)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[rgb(var(--muted))] mb-1">
                      Influencers
                    </div>
                    <div className="text-lg md:text-xl font-bold gradient-text">
                      {campaign.accepted_influencers.length}/
                      {campaign.max_influencers}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[rgb(var(--muted))] mb-1">
                      Applicants
                    </div>
                    <div className="text-lg md:text-xl font-bold gradient-text">
                      {campaign.applied_influencers.length}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[rgb(var(--muted))] mb-1">
                      Deadline
                    </div>
                    <div className="text-lg md:text-xl font-bold gradient-text">
                      {new Date(
                        campaign.application_deadline,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs - Mobile Scrollable */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { value: "overview" as const, label: "Overview" },
                {
                  value: "applicants" as const,
                  label: `Applicants (${appliedInfluencers.length})`,
                },
                {
                  value: "accepted" as const,
                  label: `Accepted (${acceptedInfluencers.length})`,
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
                      <div className="text-sm font-medium mb-2">Goals</div>
                      <div className="flex flex-wrap gap-2">
                        {campaign.goals.map((goal) => (
                          <Badge key={goal} variant="outline">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">
                        Target Audience
                      </div>
                      <div className="space-y-2 text-sm text-[rgb(var(--muted))]">
                        <div>
                          Age: {campaign.target_audience.age_range.join(", ")}
                        </div>
                        <div>
                          Gender: {campaign.target_audience.gender.join(", ")}
                        </div>
                        <div>
                          Locations:{" "}
                          {campaign.target_audience.locations
                            .slice(0, 3)
                            .join(", ")}
                          {campaign.target_audience.locations.length > 3 &&
                            " ..."}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">
                        Requirements
                      </div>
                      <div className="space-y-2 text-sm text-[rgb(var(--muted))]">
                        <div>
                          Min Followers:{" "}
                          {formatCompactNumber(
                            campaign.requirements.min_followers,
                          )}
                        </div>
                        <div>
                          Min Engagement:{" "}
                          {campaign.requirements.min_engagement_rate}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Deliverables */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Deliverables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 sm:space-y-3">
                      {campaign.requirements.deliverables.map(
                        (deliverable, index) => (
                          <div
                            key={index}
                            className="flex gap-3 p-3 rounded-lg bg-[rgb(var(--surface))]"
                          >
                            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] flex items-center justify-center text-white font-bold text-sm">
                              {deliverable.quantity}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1">
                                {deliverable.type}
                              </h4>
                              <p className="text-xs text-[rgb(var(--muted))]">
                                {deliverable.description}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-[rgb(var(--muted))]" />
                      <div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          Application Deadline
                        </div>
                        <div className="font-semibold">
                          {new Date(
                            campaign.application_deadline,
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-[rgb(var(--muted))]" />
                      <div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          Campaign Period
                        </div>
                        <div className="font-semibold">
                          {new Date(
                            campaign.campaign_start_date,
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            campaign.campaign_end_date,
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-[rgb(var(--muted))]" />
                      <div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          Content Due
                        </div>
                        <div className="font-semibold">
                          {new Date(
                            campaign.content_due_date,
                          ).toLocaleDateString()}
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
                      remaining out of {campaign.max_influencers}
                    </div>
                    <div className="h-2 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] rounded-full transition-all"
                        style={{
                          width: `${(campaign.accepted_influencers.length / campaign.max_influencers) * 100}%`,
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
                {appliedInfluencers.length === 0 ? (
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
                    {appliedInfluencers.map((influencer) => (
                      <Card
                        key={influencer.id}
                        className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all"
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <Avatar className="h-16 w-16 shrink-0">
                              <img
                                src={influencer.avatar}
                                alt={influencer.fullName}
                              />
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold mb-1">
                                {influencer.fullName}
                              </h3>
                              <p className="text-sm text-[rgb(var(--muted))] mb-3 line-clamp-2">
                                {influencer.bio}
                              </p>

                              {/* Stats */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                {influencer.platforms
                                  .slice(0, 2)
                                  .map((platform) => (
                                    <div
                                      key={platform?.platform}
                                      className="text-sm"
                                    >
                                      <div className="text-xs text-[rgb(var(--muted))]">
                                        {platform.platform}
                                      </div>
                                      <div className="font-semibold">
                                        {formatCompactNumber(
                                          platform.followers,
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <Button
                                  variant="gradient"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() =>
                                    handleAcceptInfluencer(influencer.id)
                                  }
                                  disabled={spotsRemaining === 0}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Link
                                  href={`/brand/discover/${influencer.id}`}
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
                {acceptedInfluencers.length === 0 ? (
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
                    {acceptedInfluencers.map((influencer) => (
                      <Card
                        key={influencer.id}
                        className="border-2 border-green-500/20 bg-green-500/5"
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col items-center text-center">
                            <Avatar className="h-20 w-20 mb-4">
                              <img
                                src={influencer.avatar}
                                alt={influencer.fullName}
                              />
                            </Avatar>

                            <h3 className="text-lg font-bold mb-1">
                              {influencer.fullName}
                            </h3>
                            <div className="flex items-center gap-1 mb-3">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm font-medium">
                                {influencer.rating}
                              </span>
                            </div>

                            <div className="w-full space-y-2 mb-4">
                              {influencer.platforms
                                .slice(0, 2)
                                .map((platform) => (
                                  <div
                                    key={platform?.platform}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="text-[rgb(var(--muted))]">
                                      {platform.platform}
                                    </span>
                                    <span className="font-semibold">
                                      {formatCompactNumber(platform.followers)}
                                    </span>
                                  </div>
                                ))}
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
                                href={`/brand/discover/${influencer.id}`}
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
                {campaign.performance ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    <Card className="border-2">
                      <CardContent className="p-4 sm:p-6">
                        <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mb-3 sm:mb-4" />
                        <div className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
                          {formatCompactNumber(
                            campaign.performance.total_reach,
                          )}
                        </div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          Total Reach
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardContent className="p-4 sm:p-6">
                        <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mb-3 sm:mb-4" />
                        <div className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
                          {formatCompactNumber(
                            campaign.performance.total_engagement,
                          )}
                        </div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          Total Engagement
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardContent className="p-4 sm:p-6">
                        <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mb-3 sm:mb-4" />
                        <div className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
                          {formatCompactNumber(
                            campaign.performance.total_conversions,
                          )}
                        </div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          Conversions
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-green-500/20 bg-green-500/5">
                      <CardContent className="p-4 sm:p-6">
                        <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mb-3 sm:mb-4" />
                        <div className="text-2xl sm:text-3xl font-bold text-green-500 mb-2">
                          {campaign.performance.roi}%
                        </div>
                        <div className="text-sm text-[rgb(var(--muted))]">
                          ROI
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="text-center py-16">
                    <CardContent>
                      <TrendingUp className="h-16 w-16 text-[rgb(var(--muted))] mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No performance data yet
                      </h3>
                      <p className="text-[rgb(var(--muted))]">
                        Performance metrics will appear once the campaign is
                        active
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
