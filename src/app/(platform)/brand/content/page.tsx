"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Download,
  ExternalLink,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { fetchInfluencerContent } from "@/services/content";
import { fetchBrandCampaigns } from "@/services/campaigns";
import { getBrandByUserId, getAllBrands } from "@/mock-data/brands";
import { getAllInfluencers } from "@/mock-data/influencers";
import type { ContentItem } from "@/mock-data/content";
import { formatCompactNumber } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

// Extended content type with approval status
type ReviewableContent = ContentItem & {
  influencer_name?: string;
  influencer_avatar?: string;
  review_status?: "pending" | "approved" | "rejected" | "revision_requested";
};

export default function BrandContentReviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ReviewableContent[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCampaign, setFilterCampaign] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("pending");

  useEffect(() => {
    loadContent();
  }, [user]);

  const loadContent = async () => {
    if (!user) return;

    try {
      let brand = getBrandByUserId(user.id);

      // Fallback: use first brand for demo
      if (!brand) {
        console.warn(
          `No brand found for user ID: ${user.id}, using fallback brand`,
        );
        brand = getAllBrands()[0];
      }

      if (brand) {
        // Get brand's campaigns
        const campaignsData = await fetchBrandCampaigns(brand.id);
        setCampaigns(campaignsData);

        // Get all influencers
        const allInfluencers = getAllInfluencers();

        // Get content from all accepted influencers across all campaigns
        const allContent: ReviewableContent[] = [];

        for (const campaign of campaignsData) {
          for (const infId of campaign.accepted_influencers) {
            const influencer = allInfluencers.find((i) => i.id === infId);
            if (influencer) {
              const infContent = await fetchInfluencerContent(infId, {
                campaign_id: campaign.id,
                status: "published",
              });

              // Add influencer info and mock review status
              const enrichedContent = infContent.map((c) => ({
                ...c,
                influencer_name: influencer.fullName,
                influencer_avatar: influencer.avatar,
                review_status: (Math.random() > 0.7
                  ? "pending"
                  : Math.random() > 0.5
                    ? "approved"
                    : "revision_requested") as any,
              }));

              allContent.push(...enrichedContent);
            }
          }
        }

        setContent(allContent);
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (contentId: string) => {
    setContent(
      content.map((c) =>
        c.id === contentId ? { ...c, review_status: "approved" as const } : c,
      ),
    );
  };

  const handleReject = (contentId: string) => {
    setContent(
      content.map((c) =>
        c.id === contentId ? { ...c, review_status: "rejected" as const } : c,
      ),
    );
  };

  const handleRequestRevision = (contentId: string) => {
    setContent(
      content.map((c) =>
        c.id === contentId
          ? { ...c, review_status: "revision_requested" as const }
          : c,
      ),
    );
  };

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.influencer_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCampaign =
      filterCampaign === "all" || item.campaign_id === filterCampaign;

    const matchesStatus =
      filterStatus === "all" || item.review_status === filterStatus;

    return matchesSearch && matchesCampaign && matchesStatus;
  });

  const stats = {
    total: content.length,
    pending: content.filter((c) => c.review_status === "pending").length,
    approved: content.filter((c) => c.review_status === "approved").length,
    revision: content.filter((c) => c.review_status === "revision_requested")
      .length,
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "revision_requested":
        return "warning";
      case "pending":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
        return CheckCircle2;
      case "rejected":
        return XCircle;
      case "revision_requested":
      case "pending":
        return Clock;
      default:
        return Clock;
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[rgb(var(--surface))] rounded w-1/3" />
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[rgb(var(--surface))] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-4 md:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-5xl font-bold mb-2 gradient-text">
              Content Review
            </h1>
            <p className="text-sm lg:text-base xl:text-lg text-[rgb(var(--muted))]">
              Review and approve content from your influencer partners
            </p>
          </motion.div>

          {/* Stats Grid - Mobile 2 cols */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
          >
            <Card className="border-2">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text mb-1">
                  {stats.total}
                </div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-[rgb(var(--muted))]">
                  Total Submissions
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-500/20 bg-orange-500/5">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500 mb-1">
                  {stats.pending}
                </div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-[rgb(var(--muted))]">
                  Awaiting Review
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500/20 bg-green-500/5">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-500 mb-1">
                  {stats.approved}
                </div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-[rgb(var(--muted))]">
                  Approved
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text mb-1">
                  {stats.revision}
                </div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-[rgb(var(--muted))]">
                  Revision Needed
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search & Filters */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-[rgb(var(--muted))]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search content or influencers..."
                  className="pl-10 md:pl-12 h-12 md:h-14"
                />
              </div>
            </div>

            {/* Filter Tabs - Mobile Scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {/* Status Filters */}
              {[
                { value: "pending", label: "Pending Review" },
                { value: "approved", label: "Approved" },
                { value: "revision_requested", label: "Needs Revision" },
                { value: "all", label: "All" },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilterStatus(status.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filterStatus === status.value
                      ? "bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg"
                      : "bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
                  }`}
                >
                  {status.label}
                </button>
              ))}

              <div className="h-8 w-px bg-[rgb(var(--border))]" />

              {/* Campaign Filters */}
              <button
                onClick={() => setFilterCampaign("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filterCampaign === "all"
                    ? "bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg"
                    : "bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
                }`}
              >
                All Campaigns
              </button>
              {campaigns.slice(0, 3).map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => setFilterCampaign(campaign.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filterCampaign === campaign.id
                      ? "bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg"
                      : "bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
                  }`}
                >
                  {campaign.title.slice(0, 20)}...
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content List */}
          {filteredContent.length === 0 ? (
            <Card className="text-center py-12 md:py-16">
              <CardContent>
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[rgb(var(--surface))] mb-4">
                  <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-[rgb(var(--muted))]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  No content to review
                </h3>
                <p className="text-sm md:text-base text-[rgb(var(--muted))]">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "All content has been reviewed"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              {filteredContent.map((item) => {
                const StatusIcon = getStatusIcon(item.review_status);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                          {/* Thumbnail */}
                          <div className="relative w-full lg:w-80 aspect-video lg:aspect-square shrink-0 rounded-lg overflow-hidden bg-[rgb(var(--surface))]">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Content Info */}
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-2">
                                  {item.title}
                                </h3>
                                <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-3">
                                  {item.description}
                                </p>
                              </div>

                              <Badge
                                variant={
                                  getStatusColor(item.review_status) as any
                                }
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {item.review_status?.replace("_", " ")}
                              </Badge>
                            </div>

                            {/* Influencer & Campaign Info */}
                            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-[rgb(var(--border))]">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <img
                                    src={item.influencer_avatar}
                                    alt={item.influencer_name}
                                  />
                                </Avatar>
                                <div>
                                  <div className="text-xs text-[rgb(var(--muted))]">
                                    Influencer
                                  </div>
                                  <div className="text-sm font-semibold">
                                    {item.influencer_name}
                                  </div>
                                </div>
                              </div>

                              {item.campaign_name && (
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded-lg bg-[rgb(var(--surface))]">
                                    <Calendar className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs text-[rgb(var(--muted))]">
                                      Campaign
                                    </div>
                                    <div className="text-sm font-semibold">
                                      {item.campaign_name}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{item.platform}</Badge>
                                <Badge variant="outline">{item.type}</Badge>
                              </div>
                            </div>

                            {/* Metrics */}
                            {item.metrics && (
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="text-center p-3 rounded-lg bg-[rgb(var(--surface))]">
                                  <Eye className="h-5 w-5 mx-auto mb-2 text-[rgb(var(--muted))]" />
                                  <div className="text-lg font-bold">
                                    {formatCompactNumber(item.metrics.views)}
                                  </div>
                                  <div className="text-xs text-[rgb(var(--muted))]">
                                    Views
                                  </div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-[rgb(var(--surface))]">
                                  <ThumbsUp className="h-5 w-5 mx-auto mb-2 text-[rgb(var(--muted))]" />
                                  <div className="text-lg font-bold">
                                    {formatCompactNumber(item.metrics.likes)}
                                  </div>
                                  <div className="text-xs text-[rgb(var(--muted))]">
                                    Likes
                                  </div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-[rgb(var(--surface))]">
                                  <MessageCircle className="h-5 w-5 mx-auto mb-2 text-[rgb(var(--muted))]" />
                                  <div className="text-lg font-bold">
                                    {formatCompactNumber(item.metrics.comments)}
                                  </div>
                                  <div className="text-xs text-[rgb(var(--muted))]">
                                    Comments
                                  </div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-[rgb(var(--surface))]">
                                  <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-[rgb(var(--muted))]" />
                                  <div className="text-lg font-bold">
                                    {item.metrics.engagement_rate.toFixed(1)}%
                                  </div>
                                  <div className="text-xs text-[rgb(var(--muted))]">
                                    Engagement
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              {item.review_status === "pending" && (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600"
                                    onClick={() => handleApprove(item.id)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleRequestRevision(item.id)
                                    }
                                  >
                                    Request Revision
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReject(item.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}

                              {item.url && (
                                <Button variant="outline" size="sm">
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View Original
                                  </a>
                                </Button>
                              )}

                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>

                              <Link href="/brand/messages">
                                <Button variant="ghost" size="sm">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Message
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
