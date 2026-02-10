"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  Star,
  MapPin,
  Instagram,
  Youtube,
  Facebook,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { fetchInfluencerCampaigns } from "@/services/campaigns";
import {
  getInfluencerByUserId,
  getAllInfluencers,
  type InfluencerProfile,
} from "@/mock-data/influencers";
import type { Campaign } from "@/mock-data/campaigns";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

type CampaignStatus =
  | "available"
  | "invited"
  | "applied"
  | "active"
  | "completed";

export default function InfluencerCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CampaignStatus>("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [influencer, setInfluencer] = useState<InfluencerProfile | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, [user]);

  const loadCampaigns = async () => {
    if (!user) return;

    try {
      const inf = getInfluencerByUserId(user.id);
      if (inf) {
        setInfluencer(inf);
        const data = await fetchInfluencerCampaigns(inf.id);
        setCampaigns(data);
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCampaigns = () => {
    if (!influencer) return [];

    let filtered = campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase());

      switch (filter) {
        case "available":
          return (
            campaign.status === "active" &&
            !campaign.invited_influencers.includes(influencer.id) &&
            !campaign.applied_influencers.includes(influencer.id) &&
            !campaign.accepted_influencers.find((a) => a === influencer.id)
          );
        case "invited":
          return campaign.invited_influencers.includes(influencer.id);
        case "applied":
          return campaign.applied_influencers.includes(influencer.id);
        case "active":
          return campaign.accepted_influencers.includes(influencer.id);
        case "completed":
          return (
            campaign.status === "completed" &&
            campaign.accepted_influencers.includes(influencer.id)
          );
        default:
          return false;
      }
    });

    return filtered.filter((c) => c && c.status === "active");
  };

  const filteredCampaigns = getFilteredCampaigns();

  const stats = {
    available: campaigns.filter(
      (c) =>
        c.status === "active" &&
        influencer &&
        !c.invited_influencers.includes(influencer.id) &&
        !c.applied_influencers.includes(influencer.id) &&
        !c.accepted_influencers.includes(influencer.id),
    ).length,
    invited: campaigns.filter(
      (c) => influencer && c.invited_influencers.includes(influencer.id),
    ).length,
    applied: campaigns.filter(
      (c) => influencer && c.applied_influencers.includes(influencer.id),
    ).length,
    active: campaigns.filter(
      (c) => influencer && c.accepted_influencers.includes(influencer.id),
    ).length,
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return Instagram;
      case "youtube":
        return Youtube;
      case "facebook":
        return Facebook;
      default:
        return Users;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container py-4 md:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header - Mobile Optimized */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 gradient-text">
                  Browse Campaigns
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted">
                  Find exciting collaboration opportunities
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards - Mobile Responsive Grid */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
          >
            {[
              {
                label: "Available",
                value: stats.available,
                color: "from-blue-500 to-cyan-500",
              },
              {
                label: "Invited",
                value: stats.invited,
                color: "from-purple-500 to-pink-500",
              },
              {
                label: "Applied",
                value: stats.applied,
                color: "from-orange-500 to-yellow-500",
              },
              {
                label: "Active",
                value: stats.active,
                color: "from-green-500 to-emerald-500",
              },
            ].map((stat) => (
              <Card key={stat.label} className="border-2">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-[rgb(var(--muted))]">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Search & Filters - Mobile Optimized */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--muted))]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns..."
                  className="pl-10 sm:pl-12 h-12 min-h-[44px]"
                />
              </div>
            </div>

            {/* Filter Tabs - Mobile Scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                { value: "available" as const, label: "Available" },
                { value: "invited" as const, label: "Invited" },
                { value: "applied" as const, label: "Applied" },
                { value: "active" as const, label: "Active" },
                { value: "completed" as const, label: "Completed" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 min-h-[44px] rounded-full text-sm sm:text-base font-medium whitespace-nowrap transition-all ${
                    filter === tab.value
                      ? "bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg"
                      : "bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Campaigns Grid - Mobile Optimized */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="h-6 bg-[rgb(var(--surface))] rounded mb-3" />
                    <div className="h-4 bg-[rgb(var(--surface))] rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Card className="text-center py-8 sm:py-12 lg:py-16">
              <CardContent>
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[rgb(var(--surface))] mb-4">
                  <Search className="h-8 w-8 sm:h-10 sm:w-10 text-[rgb(var(--muted))]" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2">
                  No campaigns found
                </h3>
                <p className="text-sm sm:text-base text-[rgb(var(--muted))]">
                  {searchQuery
                    ? "Try adjusting your search"
                    : `No ${filter} campaigns at the moment`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {filteredCampaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all h-full flex flex-col">
                    <CardContent className="p-3 sm:p-4 lg:p-6 flex flex-col h-full">
                      {/* Header */}
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold line-clamp-2 flex-1">
                            {campaign.title}
                          </h3>
                          <Badge variant="outline" className="shrink-0">
                            {campaign.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-2 sm:mb-3">
                          {campaign.description}
                        </p>
                      </div>

                      {/* Stats Grid - Mobile 2 cols */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-[rgb(var(--muted))]" />
                          <span className="text-[rgb(var(--muted))] truncate">
                            {formatCurrency(campaign.budget.min)}-
                            {formatCurrency(campaign.budget.max)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-[rgb(var(--muted))]" />
                          <span className="text-[rgb(var(--muted))]">
                            {campaign.accepted_influencers.length}/
                            {campaign.max_influencers}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-[rgb(var(--muted))]" />
                          <span className="text-[rgb(var(--muted))] truncate">
                            {new Date(
                              campaign.campaign_start_date,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-[rgb(var(--muted))]" />
                          <span className="text-[rgb(var(--muted))]">
                            {campaign.applied_influencers.length} applied
                          </span>
                        </div>
                      </div>

                      {/* Platforms */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {campaign.platforms.slice(0, 3).map((platform) => {
                          const Icon = getPlatformIcon(platform);
                          return (
                            <Badge
                              key={platform}
                              variant="outline"
                              className="gap-1"
                            >
                              <Icon className="h-3 w-3" />
                              {platform}
                            </Badge>
                          );
                        })}
                        {campaign.platforms.length > 3 && (
                          <Badge variant="outline">
                            +{campaign.platforms.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Deliverables Preview */}
                      <div className="mb-4 pb-4 border-b border-border">
                        <div className="text-xs text-muted mb-2 font-medium">
                          Deliverables:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {campaign.requirements.deliverables
                            .slice(0, 3)
                            .map((del, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-surface rounded"
                              >
                                {del.type}
                              </span>
                            ))}
                          {campaign.requirements.deliverables.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-surface rounded">
                              +{campaign.requirements.deliverables.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions - at bottom */}
                      <div className="mt-auto flex flex-col gap-2">
                        <Link
                          href={`/influencer/campaigns/${campaign.id}`}
                          className="w-full"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        {filter === "available" && (
                          <Button
                            variant="gradient"
                            size="sm"
                            className="w-full"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Apply Now
                          </Button>
                        )}
                        {filter === "invited" && (
                          <Button
                            variant="gradient"
                            size="sm"
                            className="w-full"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Accept Invite
                          </Button>
                        )}
                        {filter === "applied" && (
                          <Badge
                            variant="warning"
                            className="w-full justify-center py-2"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Application Pending
                          </Badge>
                        )}
                        {filter === "active" && (
                          <Badge
                            variant="success"
                            className="w-full justify-center py-2"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
