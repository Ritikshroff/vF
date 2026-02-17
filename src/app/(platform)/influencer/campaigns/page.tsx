"use client";

import { useState, useEffect, useMemo } from "react";
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
import { api } from "@/lib/api-client";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

// --- Types matching real API responses ---

type MarketplaceListing = {
  id: string;
  title: string;
  description: string;
  status: string;
  budgetMin: number | null;
  budgetMax: number | null;
  targetPlatforms: string[];
  targetNiches: string[];
  requirements: string | null;
  totalSlots: number;
  filledSlots: number;
  applicationDeadline: string | null;
  campaign: {
    id: string;
    startDate: string;
    endDate: string;
    maxInfluencers: number;
    category: string;
  };
};

type Collaboration = {
  id: string;
  status: string;
  agreedAmount: number;
  startDate: string | null;
  endDate: string | null;
  campaign: {
    id: string;
    title: string;
    description: string;
    category: string;
  };
  brand: { companyName: string };
};

type MyApplication = {
  id: string;
  status: string;
  proposedRate: number | null;
  listing: {
    id: string;
    title: string;
    description: string;
    budgetMin: number | null;
    budgetMax: number | null;
    targetPlatforms: string[];
    campaign: { category: string; startDate: string };
  };
};

type CampaignStatus =
  | "available"
  | "invited"
  | "applied"
  | "active"
  | "completed";

export default function InfluencerCampaignsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CampaignStatus>("available");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCampaigns();
  }, [user]);

  const loadCampaigns = async () => {
    if (!user) return;

    try {
      const [listingsRes, collabRes, appsRes] = await Promise.allSettled([
        api.get<{ data: MarketplaceListing[]; total: number }>(
          "/marketplace/listings",
          { pageSize: "50" }
        ),
        api.get<{ data: Collaboration[]; total: number }>("/collaborations"),
        api.get<{ data: MyApplication[]; total: number }>(
          "/marketplace/my-applications"
        ),
      ]);

      if (listingsRes.status === "fulfilled" && !listingsRes.value.error) {
        setListings(listingsRes.value.data?.data || []);
      }
      if (collabRes.status === "fulfilled" && !collabRes.value.error) {
        setCollaborations(collabRes.value.data?.data || []);
      }
      if (appsRes.status === "fulfilled" && !appsRes.value.error) {
        setMyApplications(appsRes.value.data?.data || []);
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data by tab + search query
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();

    switch (filter) {
      case "available": {
        const openListings = listings.filter((l) => l.status === "OPEN");
        if (!q) return openListings;
        return openListings.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q)
        );
      }
      case "invited": {
        const invited = collaborations.filter((c) => c.status === "INVITED");
        if (!q) return invited;
        return invited.filter(
          (c) =>
            c.campaign.title.toLowerCase().includes(q) ||
            c.campaign.description.toLowerCase().includes(q)
        );
      }
      case "applied": {
        const pending = myApplications.filter(
          (a) => a.status === "PENDING" || a.status === "SUBMITTED"
        );
        if (!q) return pending;
        return pending.filter(
          (a) =>
            a.listing.title.toLowerCase().includes(q) ||
            a.listing.description.toLowerCase().includes(q)
        );
      }
      case "active": {
        const active = collaborations.filter(
          (c) => c.status === "IN_PROGRESS" || c.status === "ACCEPTED"
        );
        if (!q) return active;
        return active.filter(
          (c) =>
            c.campaign.title.toLowerCase().includes(q) ||
            c.campaign.description.toLowerCase().includes(q)
        );
      }
      case "completed": {
        const completed = collaborations.filter(
          (c) => c.status === "COMPLETED"
        );
        if (!q) return completed;
        return completed.filter(
          (c) =>
            c.campaign.title.toLowerCase().includes(q) ||
            c.campaign.description.toLowerCase().includes(q)
        );
      }
      default:
        return [];
    }
  }, [filter, searchQuery, listings, collaborations, myApplications]);

  const stats = useMemo(
    () => ({
      available: listings.filter((l) => l.status === "OPEN").length,
      invited: collaborations.filter((c) => c.status === "INVITED").length,
      applied: myApplications.filter(
        (a) => a.status === "PENDING" || a.status === "SUBMITTED"
      ).length,
      active: collaborations.filter(
        (c) => c.status === "IN_PROGRESS" || c.status === "ACCEPTED"
      ).length,
    }),
    [listings, collaborations, myApplications]
  );

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

  // --- Render helpers for each card type ---

  const renderListingCard = (listing: MarketplaceListing) => (
    <motion.div
      key={`listing-${listing.id}`}
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
                {listing.title}
              </h3>
              <Badge variant="outline" className="shrink-0">
                {listing.campaign.category}
              </Badge>
            </div>
            <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-2 sm:mb-3">
              {listing.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-[rgb(var(--muted))]" />
              <span className="text-[rgb(var(--muted))] truncate">
                {formatCurrency(listing.budgetMin || 0)}-
                {formatCurrency(listing.budgetMax || 0)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-[rgb(var(--muted))]" />
              <span className="text-[rgb(var(--muted))]">
                {listing.filledSlots}/{listing.totalSlots}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-[rgb(var(--muted))]" />
              <span className="text-[rgb(var(--muted))] truncate">
                {new Date(listing.campaign.startDate).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )}
              </span>
            </div>
            {listing.applicationDeadline && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-[rgb(var(--muted))]" />
                <span className="text-[rgb(var(--muted))] truncate">
                  Due{" "}
                  {new Date(listing.applicationDeadline).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" }
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Platforms */}
          {listing.targetPlatforms.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {listing.targetPlatforms.slice(0, 3).map((platform) => {
                const Icon = getPlatformIcon(platform);
                return (
                  <Badge key={platform} variant="outline" className="gap-1">
                    <Icon className="h-3 w-3" />
                    {platform.charAt(0) + platform.slice(1).toLowerCase()}
                  </Badge>
                );
              })}
              {listing.targetPlatforms.length > 3 && (
                <Badge variant="outline">
                  +{listing.targetPlatforms.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Niches */}
          {listing.targetNiches.length > 0 && (
            <div className="mb-4 pb-4 border-b border-border">
              <div className="text-xs text-muted mb-2 font-medium">
                Niches:
              </div>
              <div className="flex flex-wrap gap-1">
                {listing.targetNiches.slice(0, 3).map((niche, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-surface rounded"
                  >
                    {niche}
                  </span>
                ))}
                {listing.targetNiches.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-surface rounded">
                    +{listing.targetNiches.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-2">
            <Link
              href={`/marketplace/${listing.id}`}
              className="w-full"
            >
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
            <Link
              href={`/marketplace/${listing.id}`}
              className="w-full"
            >
              <Button variant="gradient" size="sm" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderCollaborationCard = (collab: Collaboration) => (
    <motion.div
      key={`collab-${collab.id}`}
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
                {collab.campaign.title}
              </h3>
              <Badge variant="outline" className="shrink-0">
                {collab.campaign.category}
              </Badge>
            </div>
            <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-2 sm:mb-3">
              {collab.campaign.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-[rgb(var(--muted))]" />
              <span className="text-[rgb(var(--muted))] truncate">
                {formatCurrency(collab.agreedAmount)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-[rgb(var(--muted))]" />
              <span className="text-[rgb(var(--muted))]">
                {collab.brand.companyName}
              </span>
            </div>
            {collab.startDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-[rgb(var(--muted))]" />
                <span className="text-[rgb(var(--muted))] truncate">
                  {new Date(collab.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-[rgb(var(--muted))]" />
              <span className="text-[rgb(var(--muted))]">
                {collab.status === "INVITED"
                  ? "Invited"
                  : collab.status === "ACCEPTED"
                    ? "Accepted"
                    : collab.status === "IN_PROGRESS"
                      ? "In Progress"
                      : collab.status === "COMPLETED"
                        ? "Completed"
                        : collab.status}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-2">
            <Link
              href={`/influencer/campaigns/${collab.id}`}
              className="w-full"
            >
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
            {collab.status === "INVITED" && (
              <Button variant="gradient" size="sm" className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Accept Invite
              </Button>
            )}
            {(collab.status === "IN_PROGRESS" ||
              collab.status === "ACCEPTED") && (
              <Badge variant="success" className="w-full justify-center py-2">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                In Progress
              </Badge>
            )}
            {collab.status === "COMPLETED" && (
              <Badge variant="outline" className="w-full justify-center py-2">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderApplicationCard = (app: MyApplication) => (
    <motion.div
      key={`app-${app.id}`}
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
                {app.listing.title}
              </h3>
              <Badge variant="outline" className="shrink-0">
                {app.listing.campaign.category}
              </Badge>
            </div>
            <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-2 sm:mb-3">
              {app.listing.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-[rgb(var(--muted))]" />
              <span className="text-[rgb(var(--muted))] truncate">
                {app.proposedRate
                  ? formatCurrency(app.proposedRate)
                  : `${formatCurrency(app.listing.budgetMin || 0)}-${formatCurrency(app.listing.budgetMax || 0)}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-[rgb(var(--muted))]" />
              <span className="text-[rgb(var(--muted))] truncate">
                {new Date(
                  app.listing.campaign.startDate
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Platforms */}
          {app.listing.targetPlatforms.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {app.listing.targetPlatforms.slice(0, 3).map((platform) => {
                const Icon = getPlatformIcon(platform);
                return (
                  <Badge key={platform} variant="outline" className="gap-1">
                    <Icon className="h-3 w-3" />
                    {platform.charAt(0) + platform.slice(1).toLowerCase()}
                  </Badge>
                );
              })}
              {app.listing.targetPlatforms.length > 3 && (
                <Badge variant="outline">
                  +{app.listing.targetPlatforms.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-2">
            <Link
              href={`/marketplace/${app.listing.id}`}
              className="w-full"
            >
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
            <Badge variant="warning" className="w-full justify-center py-2">
              <Clock className="h-4 w-4 mr-1" />
              Application Pending
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
          ) : filteredItems.length === 0 ? (
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
              {filter === "available" &&
                (filteredItems as MarketplaceListing[]).map(renderListingCard)}
              {(filter === "invited" ||
                filter === "active" ||
                filter === "completed") &&
                (filteredItems as Collaboration[]).map(renderCollaborationCard)}
              {filter === "applied" &&
                (filteredItems as MyApplication[]).map(renderApplicationCard)}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
