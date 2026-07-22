import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Search, User } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";

export default function QuickActions() {
  const { user } = useAuth();
  const actions = [
    {
      title: "Post New Job",
      description: "Get your package delivered",
      icon: Plus,
      url: "/post-job",
      color: "bg-blue-500 hover:bg-blue-600",
      disabled: user?.user_type === "COURIER",
    },
    {
      title: "Find Jobs",
      description: "Earn money delivering packages",
      icon: Search,
      url: "/find-jobs",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Update Profile",
      description: "Manage your account settings",
      icon: User,
      url: "/profile",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {actions.map((action, index) =>
  action.disabled ? (
    <Button
      key={index}
      disabled
      variant="outline"
      className="w-full h-auto p-6 flex flex-col items-center gap-3 opacity-50 cursor-not-allowed border-2 border-slate-200"
    >
      <action.icon className="w-8 h-8" />
      <div className="text-center">
        <p className="font-semibold">{action.title}</p>
        <p className="text-sm opacity-80">{action.description}</p>
      </div>
    </Button>
  ) : (
    <Link key={index} to={action.url}>
      <Button
        variant="outline"
        className={`w-full h-auto p-6 flex flex-col items-center gap-3 transition-all duration-300 hover:shadow-lg ${action.color} hover:text-white border-2 border-slate-200 hover:border-transparent`}
      >
        <action.icon className="w-8 h-8" />
        <div className="text-center">
          <p className="font-semibold">{action.title}</p>
          <p className="text-sm opacity-80">{action.description}</p>
        </div>
      </Button>
    </Link>
  )
)}

        </div>
      </CardContent>
    </Card>
  );
}
