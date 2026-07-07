// import React, { useState, useEffect, useCallback } from "react";
// import { DeliveryJob, User, Payment } from "@/entities/all";
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { MapPin, Package, DollarSign, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import PaymentBreakdown from "../components/payments/PaymentBreakdown";
import PaymentModal from "../components/payments/PaymentModal";

export default function PostJob() {
  const navigate = useNavigate();
  // const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [jobData, setJobData] = useState({
    title: "",
    pickup_address: "",
    delivery_address: "",
    package_description: "",
    package_size: "medium",
    vehicle_required: "any",
    price: "",
    urgent: false,
    pickup_date: "",
    delivery_date: "",
    special_instructions: ""
  });
  const [basePrice, setBasePrice] = useState("");

  // const loadUser = useCallback(async () => {
  //   try {
  //     const currentUser = await User.me();
  //     setUser(currentUser);
  //   } catch (error) {
  //     navigate(createPageUrl("Dashboard"));
  //   }
  // }, [navigate]);

  // useEffect(() => {
  //   loadUser();
  // }, [loadUser]);

  const handleInputChange = (field, value) => {
    setJobData(prev => {
      const updated = { ...prev, [field]: value };
      // When vehicle changes, auto-adjust price if a base price is set
      if (field === 'vehicle_required') {
        const bp = parseFloat(basePrice);
        if (!isNaN(bp) && bp > 0) {
          updated.price = value === 'ute' ? (bp * 2).toFixed(2) : bp.toFixed(2);
        }
      }
      // When price changes manually, update base price (only if not ute-doubled)
      if (field === 'price' && prev.vehicle_required !== 'ute') {
        setBasePrice(value);
      }
      return updated;
    });
  };

  const handlePriceChange = (value) => {
    setBasePrice(value);
    const bp = parseFloat(value);
    const finalPrice = (!isNaN(bp) && bp > 0 && jobData.vehicle_required === 'ute')
      ? (bp * 2).toFixed(2)
      : value;
    setJobData(prev => ({ ...prev, price: finalPrice }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   if (!jobData.price || parseFloat(jobData.price) <= 0) {
  //     alert("Please enter a valid payment amount");
  //     return;
  //   }

  //   setShowPaymentModal(true);
  // };

  const handleSubmit = (e) => {
  e.preventDefault();

  console.log(jobData);
  alert("Job submitted successfully!");
};

  // const handlePaymentComplete = async (paymentInfo) => {
  //   setIsSubmitting(true);
  //   setShowPaymentModal(false);

  //   try {
  //     // Create the job
  //     const newJob = await DeliveryJob.create({
  //       ...jobData,
  //       price: parseFloat(jobData.price),
  //       customer_id: user.id
  //     });

  //     // Create payment record
  //     await Payment.create({
  //       job_id: newJob.id,
  //       customer_id: user.id,
  //       courier_id: null, // Will be set when courier is assigned
  //       ...paymentInfo,
  //       processed_at: new Date().toISOString()
  //     });
      
  //     navigate(createPageUrl("Dashboard"));
  //   } catch (error) {
  //     console.error("Error creating job:", error);
  //     alert("Error creating job. Please try again.");
  //   }
    
  //   setIsSubmitting(false);
  // };

  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  // if (!user.id_verified) {
  //   return (
  //     <div className="min-h-screen p-4 md:p-8">
  //       <div className="max-w-2xl mx-auto">
  //         <Alert className="border-amber-200 bg-amber-50">
  //           <AlertTriangle className="h-4 w-4 text-amber-600" />
  //           <AlertDescription className="text-amber-900">
  //             You need to verify your identity before posting delivery jobs. 
  //             Please complete your verification in your profile.
  //           </AlertDescription>
  //         </Alert>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Post a Delivery Job</h1>
          <p className="text-slate-600">
            Find someone traveling your route to deliver your package
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-blue-600" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Job Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={jobData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Deliver documents to downtown office"
                      required
                    />
                  </div>

                  {/* Addresses */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="pickup">Pickup Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          id="pickup"
                          value={jobData.pickup_address}
                          onChange={(e) => handleInputChange('pickup_address', e.target.value)}
                          placeholder="Where to collect the package"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery">Delivery Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          id="delivery"
                          value={jobData.delivery_address}
                          onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                          placeholder="Where to deliver the package"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="space-y-2">
                    <Label htmlFor="package">Package Description</Label>
                    <Textarea
                      id="package"
                      value={jobData.package_description}
                      onChange={(e) => handleInputChange('package_description', e.target.value)}
                      placeholder="Describe what needs to be delivered"
                      className="h-24"
                      required
                    />
                  </div>

                  {/* Package Size, Vehicle & Price */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Package Size</Label>
                      <Select
                        value={jobData.package_size}
                        onValueChange={(value) => handleInputChange('package_size', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (fits in a bag)</SelectItem>
                          <SelectItem value="medium">Medium (box size)</SelectItem>
                          <SelectItem value="large">Large (requires car trunk)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Vehicle Required</Label>
                      <Select
                        value={jobData.vehicle_required}
                        onValueChange={(value) => handleInputChange('vehicle_required', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Vehicle</SelectItem>
                          <SelectItem value="bicycle">🚲 Bicycle</SelectItem>
                          <SelectItem value="motorcycle">🏍️ Motorcycle</SelectItem>
                          <SelectItem value="car">🚗 Car</SelectItem>
                          <SelectItem value="van">🚐 Van</SelectItem>
                          <SelectItem value="ute">🛻 Ute (2× price applies)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Price with ute warning */}
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Base Payment Amount ($)
                      {jobData.vehicle_required === 'ute' && (
                        <span className="ml-2 text-xs font-normal text-amber-600">Ute required — final price is doubled</span>
                      )}
                    </Label>
                    <div className="flex gap-3 items-center">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={basePrice}
                          onChange={(e) => handlePriceChange(e.target.value)}
                          placeholder="How much you'll pay"
                          className="pl-10"
                          required
                        />
                      </div>
                      {jobData.vehicle_required === 'ute' && basePrice && parseFloat(basePrice) > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm font-semibold text-amber-800 whitespace-nowrap">
                          Total: ${(parseFloat(basePrice) * 2).toFixed(2)}
                        </div>
                      )}
                    </div>
                    {jobData.vehicle_required === 'ute' && (
                      <p className="text-xs text-amber-600">
                        🛻 Ute deliveries require significantly more space and effort. The price is automatically doubled to attract suitable couriers.
                      </p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="pickup_date">Preferred Pickup Date</Label>
                      <Input
                        id="pickup_date"
                        type="date"
                        value={jobData.pickup_date}
                        onChange={(e) => handleInputChange('pickup_date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery_date">Preferred Delivery Date</Label>
                      <Input
                        id="delivery_date"
                        type="date"
                        value={jobData.delivery_date}
                        onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      value={jobData.special_instructions}
                      onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                      placeholder="Any special handling instructions or requirements"
                      className="h-20"
                    />
                  </div>

                  {/* Urgent Toggle */}
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="urgent"
                      checked={jobData.urgent}
                      onCheckedChange={(checked) => handleInputChange('urgent', checked)}
                    />
                    <Label htmlFor="urgent" className="text-sm font-medium">
                      This is urgent (higher visibility)
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-lg py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Job...
                      </>
                    ) : (
                      'Continue to Payment'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Payment Breakdown Sidebar */}
          <div className="space-y-6">
            {jobData.price && parseFloat(jobData.price) > 0 && (
              <PaymentBreakdown 
                jobAmount={parseFloat(jobData.price)} 
                showDetails={true}
              />
            )}
            
            <Card className="bg-gradient-to-r from-slate-50 to-blue-50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">How it works</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Post your delivery job</li>
                  <li>• Couriers apply to take the job</li>
                  <li>• Choose your preferred courier</li>
                  <li>• Payment is held securely</li>
                  <li>• Courier gets paid after delivery</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          jobAmount={parseFloat(jobData.price) || 0}
          jobId={null}
          courierStripeAccountId={null}
          onPaymentComplete={handlePaymentComplete}
        /> */}
      </div>
    </div>
  );
}