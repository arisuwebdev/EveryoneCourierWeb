import React, { useState, useEffect } from "react";
// import { User } from "../../base44/entities/";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from "../lib/AuthContext";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import {
  Package,
  Truck,
  DollarSign,
  Shield,
  Clock,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // useEffect(() => {
  //   const checkUser = async () => {
  //     try {
  //       const currentUser = await User.me();
  //       setUser(currentUser);
  //     } catch (error) {
  //       // User not logged in
  //     }
  //     setIsLoading(false);
  //   };
  //   checkUser();
  // }, []);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // const handleGetStarted = async () => {
  //   if (user) {
  //     navigate(createPageUrl("Dashboard"));
  //   } else {
  //     await User.login();
  //   }
  // };
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(createPageUrl("Home"));
    } else {
      navigate(createPageUrl("Login"));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl blur-2xl opacity-50 animate-pulse group-hover:opacity-70 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/30 px-8 py-5 rounded-3xl shadow-2xl">
                  {/* Icon mark */}
                  <div className="bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
                    <Package className="w-10 h-10 text-white" />
                  </div>
                  {/* Text lockup */}
                  <div className="text-left">
                    <div className="text-2xl md:text-3xl font-black leading-none tracking-tight">
                      <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Everyone's
                      </span>
                    </div>
                    <div className="text-2xl md:text-3xl font-black leading-none tracking-tight">
                      <span className="text-gray-800">a </span>
                      <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Courier
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-purple-500 tracking-widest uppercase mt-1">
                      Peer-to-Peer Delivery
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Badge className="mb-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0 px-4 py-2 text-sm shadow-lg">
              🚀 The Future of Peer-to-Peer Delivery
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Everyone's a
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Courier
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect people who need deliveries with travelers already heading
              that way.
              <strong>
                {" "}
                Save money, earn extra income, help your community.
              </strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() =>
                  navigate(isAuthenticated ? "/dashboard" : "/login")
                }
                className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 animate-pulse"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2 text-purple-700 font-semibold">
                <Shield className="w-5 h-5" />
                <span>Secure & Verified</span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex justify-center items-center gap-8 text-sm font-semibold">
              <div className="flex items-center gap-2 text-yellow-600">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Users className="w-5 h-5" />
                <span>10K+ Users</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Package className="w-5 h-5" />
                <span>50K+ Deliveries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and designed for real people
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* For Customers */}
            <Card className="relative overflow-hidden border-2 border-pink-200 shadow-xl hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full transform translate-x-16 -translate-y-16 opacity-20"></div>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full">
                    <Package className="w-6 h-6 text-pink-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Need Something Delivered?
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Post Your Job</p>
                      <p className="text-gray-600 text-sm">
                        Describe what needs delivering and set your price
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Choose Your Courier</p>
                      <p className="text-gray-600 text-sm">
                        Review applications from verified travelers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">Track & Receive</p>
                      <p className="text-gray-600 text-sm">
                        Follow your delivery and pay when complete
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Couriers */}
            <Card className="relative overflow-hidden border-2 border-green-200 shadow-xl hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-teal-500 rounded-full transform translate-x-16 -translate-y-16 opacity-20"></div>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-teal-100 rounded-full">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Traveling Somewhere?
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Browse Jobs</p>
                      <p className="text-gray-600 text-sm">
                        Find deliveries along your route
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Apply & Get Selected</p>
                      <p className="text-gray-600 text-sm">
                        Show you're the right person for the job
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">Deliver & Earn</p>
                      <p className="text-gray-600 text-sm">
                        Complete delivery and get paid instantly
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Why Choose Everyone's a Courier?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Save Money
              </h3>
              <p className="text-gray-600">
                Pay less than traditional delivery services while supporting
                your community
              </p>
            </Card>

            <Card className="text-center p-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-green-400 to-teal-500 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Flexible Timing
              </h3>
              <p className="text-gray-600">
                Deliveries that work around real people's schedules and routes
              </p>
            </Card>

            <Card className="text-center p-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Secure & Safe
              </h3>
              <p className="text-gray-600">
                ID verification, secure payments, and user ratings keep everyone
                protected
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-500/20 animate-pulse"></div>
        <div className="max-w-4xl mx-auto text-center px-4 relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of people saving money and earning extra income
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() =>
                navigate(isAuthenticated ? "/dashboard" : "/register")
              }
              className="bg-white text-purple-600 hover:bg-yellow-100 px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-white/50 transition-all duration-300"
            >
              {isAuthenticated ? "Go to Dashboard" : "Sign Up Free"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="mt-8 flex justify-center items-center gap-6 text-white/90 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Get started in minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {/* <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">Everyone's a Courier</h3>
          </div>
          <p className="text-gray-300">
            Making delivery simple, affordable, and community-driven.
          </p>
        </div>
      </footer> */}
    </div>
  );
}
