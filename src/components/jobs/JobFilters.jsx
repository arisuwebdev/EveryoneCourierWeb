import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

export default function JobFilters({ filters, setFilters }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm sticky top-4">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Location Search */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Search by pickup or delivery area"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>

        {/* Package Size */}
        <div className="space-y-2">
          <Label>Package Size</Label>
          <Select
            value={filters.packageSize}
            onValueChange={(value) => handleFilterChange('packageSize', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range ($)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
            <Input
              placeholder="Max"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>
        </div>

        {/* Urgent Only */}
        <div className="flex items-center space-x-3">
          <Switch
            id="urgent"
            checked={filters.urgent}
            onCheckedChange={(checked) => handleFilterChange('urgent', checked)}
          />
          <Label htmlFor="urgent" className="text-sm font-medium">
            Urgent jobs only
          </Label>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => setFilters({
            location: "",
            packageSize: "all",
            minPrice: "",
            maxPrice: "",
            urgent: false
          })}
          className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          Clear all filters
        </button>
      </CardContent>
    </Card>
  );
}