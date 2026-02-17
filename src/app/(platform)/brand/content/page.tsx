"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MessageCircle,
  ExternalLink,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api-client";
import { staggerContainer, staggerItem } from "@/lib/animations";

type DeliverableVersion = {
  id: string;
  version: number;
  contentUrl: string | null;
  notes: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
};

type Deliverable = {
  id: string;
  type: string;
  platform: string;
  description: string | null;
  status: string;
  quantity: number;
  dueDate: string | null;
  versions: DeliverableVersion[];
  milestone: { id: string; title: string } | null;
};

type Collaboration = {
  id: string;
  status: string;
  campaign: {
    id: string;
    title: string;
    category: string;
  };
  influencer: {
    id: string;
    fullName: string;
    avatar: string | null;
  };
};

type ReviewableContent = Deliverable & {
  collaborationId: string;
  campaignTitle: string;
  campaignId: string;
  influencerName: string;
  influencerAvatar: string | null;
};

export default function BrandContentReviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ReviewableContent[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string; title: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCampaign, setFilterCampaign] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("SUBMITTED");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, [user]);

  const loadContent = async () => {
    if (!user) return;

    try {
      // Get all brand collaborations
      const collabRes = await api.get<{ data: Collaboration[]; total: number }>("/collaborations");
      if (collabRes.error) throw new Error(collabRes.error);

      const collaborations: Collaboration[] = collabRes.data?.data || [];

      // Extract unique campaigns
      const campaignMap = new Map<string, string>();
      collaborations.forEach((c) => {
        campaignMap.set(c.campaign.id, c.campaign.title);
      });
      setCampaigns(
        Array.from(campaignMap.entries()).map(([id, title]) => ({ id, title }))
      );

      // Fetch deliverables for each collaboration
      const allContent: ReviewableContent[] = [];

      const deliverableResults = await Promise.allSettled(
        collaborations.map((collab) =>
          api.get<any>(`/collaborations/${collab.id}/deliverables`)
        )
      );

      collaborations.forEach((collab, index) => {
        const result = deliverableResults[index];
        if (result.status === "fulfilled" && !result.value.error) {
          const deliverables: Deliverable[] = result.value.data?.data || result.value.data || [];
          if (Array.isArray(deliverables)) {
            deliverables.forEach((del) => {
              allContent.push({
                ...del,
                collaborationId: collab.id,
                campaignTitle: collab.campaign.title,
                campaignId: collab.campaign.id,
                influencerName: collab.influencer.fullName,
                influencerAvatar: collab.influencer.avatar,
              });
            });
          }
        }
      });

      setContent(allContent);
    } catch (err) {
      console.error("Error loading content:", err);
      setError("Failed to load content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (
    collaborationId: string,
    deliverableId: string,
    action: "APPROVED" | "REJECTED" | "REVISION_REQUESTED"
  ) => {
    try {
      const res = await api.post<any>(
        `/collaborations/${collaborationId}/deliverables/${deliverableId}/review`,
        { status: action }
      );
      if (res.error) throw new Error(res.error);

      setContent((prev) =>
        prev.map((c) =>
          c.id === deliverableId ? { ...c, status: action } : c
        )
      );
    } catch (err) {
      console.error("Error reviewing deliverable:", err);
      setContent((prev) =>
        prev.map((c) =>
          c.id === deliverableId ? { ...c, status: action } : c
        )
      );
    }
  };

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      (item.type?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.influencerName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesCampaign =
      filterCampaign === "all" || item.campaignId === filterCampaign;

    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesCampaign && matchesStatus;
  });

  const stats = {
    total: content.length,
    pending: content.filter((c) => c.status === "SUBMITTED").length,
    approved: content.filter((c) => c.status === "APPROVED").length,
    revision: content.filter((c) => c.status === "REVISION_REQUESTED").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "destructive";
      case "REVISION_REQUESTED":
        return "warning";
      case "SUBMITTED":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return CheckCircle2;
      case "REJECTED":
        return XCircle;
      default:
        return Clock;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
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

  if (error) {
    return (
      <div className="container py-8">
        <Card className="text-center py-16">
          <CardContent>
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold mb-2">Error</h3>
            <p className="text-[rgb(var(--muted))] mb-4">{error}</p>
            <Button onClick={loadContent}>Try Again</Button>
          </CardContent>
        </Card>
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

          {/* Stats Grid */}
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
                  Total Deliverables
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

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { value: "SUBMITTED", label: "Pending Review" },
                { value: "APPROVED", label: "Approved" },
                { value: "REVISION_REQUESTED", label: "Needs Revision" },
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
                  {campaign.title.length > 20
                    ? campaign.title.slice(0, 20) + "..."
                    : campaign.title}
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
                const StatusIcon = getStatusIcon(item.status);
                const latestVersion = item.versions?.[0];

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all">
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                          {/* Thumbnail / Preview */}
                          <div className="relative w-full lg:w-80 aspect-video lg:aspect-square shrink-0 rounded-lg overflow-hidden bg-[rgb(var(--surface))] flex items-center justify-center">
                            {latestVersion?.contentUrl ? (
                              <img
                                src={latestVersion.contentUrl}
                                alt={item.type}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center p-4">
                                <Eye className="h-8 w-8 mx-auto mb-2 text-[rgb(var(--muted))]" />
                                <p className="text-sm text-[rgb(var(--muted))]">
                                  {item.status === "PENDING"
                                    ? "Awaiting submission"
                                    : "No preview available"}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Content Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-2">
                                  {item.type} - {item.platform}
                                </h3>
                                <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-3">
                                  {item.description || `${item.type} deliverable for ${item.campaignTitle}`}
                                </p>
                              </div>

                              <Badge variant={getStatusColor(item.status) as any}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {formatStatus(item.status)}
                              </Badge>
                            </div>

                            {/* Influencer & Campaign Info */}
                            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-[rgb(var(--border))]">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  {item.influencerAvatar ? (
                                    <img
                                      src={item.influencerAvatar}
                                      alt={item.influencerName}
                                    />
                                  ) : (
                                    <User className="h-4 w-4" />
                                  )}
                                </Avatar>
                                <div>
                                  <div className="text-xs text-[rgb(var(--muted))]">
                                    Influencer
                                  </div>
                                  <div className="text-sm font-semibold">
                                    {item.influencerName}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-[rgb(var(--surface))]">
                                  <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-xs text-[rgb(var(--muted))]">
                                    Campaign
                                  </div>
                                  <div className="text-sm font-semibold">
                                    {item.campaignTitle}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{item.platform}</Badge>
                                <Badge variant="outline">{item.type}</Badge>
                              </div>
                            </div>

                            {/* Version Info */}
                            {item.versions.length > 0 && (
                              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="text-center p-3 rounded-lg bg-[rgb(var(--surface))]">
                                  <div className="text-lg font-bold">
                                    v{item.versions[0]?.version || 1}
                                  </div>
                                  <div className="text-xs text-[rgb(var(--muted))]">
                                    Latest Version
                                  </div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-[rgb(var(--surface))]">
                                  <div className="text-lg font-bold">
                                    {item.versions.length}
                                  </div>
                                  <div className="text-xs text-[rgb(var(--muted))]">
                                    Total Versions
                                  </div>
                                </div>
                                {item.dueDate && (
                                  <div className="text-center p-3 rounded-lg bg-[rgb(var(--surface))]">
                                    <div className="text-lg font-bold">
                                      {new Date(item.dueDate).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </div>
                                    <div className="text-xs text-[rgb(var(--muted))]">
                                      Due Date
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Submission notes */}
                            {latestVersion?.notes && (
                              <div className="mb-3 p-3 rounded-lg bg-[rgb(var(--surface))]">
                                <div className="text-xs text-[rgb(var(--muted))] mb-1">
                                  Submission Notes
                                </div>
                                <p className="text-sm">{latestVersion.notes}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              {item.status === "SUBMITTED" && (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600"
                                    onClick={() =>
                                      handleReview(item.collaborationId, item.id, "APPROVED")
                                    }
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleReview(item.collaborationId, item.id, "REVISION_REQUESTED")
                                    }
                                  >
                                    Request Revision
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleReview(item.collaborationId, item.id, "REJECTED")
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}

                              {latestVersion?.contentUrl && (
                                <a
                                  href={latestVersion.contentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="outline" size="sm">
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View Original
                                  </Button>
                                </a>
                              )}

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
