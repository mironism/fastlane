"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Waves, 
  Ship, 
  Mountain, 
  Globe, 
  Calendar, 
  Settings, 
  QrCode, 
  CheckCircle,
  Rocket,
  Smartphone,
  Link,
  DollarSign,
  BarChart3,
  Clock
} from "lucide-react"
import { useLeads } from "@/hooks/use-leads"
import { toast } from "sonner"

export default function Home() {
  const { submitLead, isSubmitting, isSubmitted } = useLeads()
  const [formData, setFormData] = useState({
    business_name: '',
    contact_email: '',
    business_type: '',
    message: ''
  })

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.business_name || !formData.contact_email) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await submitLead(formData)
      toast.success('Thank you! We\'ll be in touch soon.')
      setFormData({
        business_name: '',
        contact_email: '',
        business_type: '',
        message: ''
      })
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Value Proposition */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                🚀 Grow Your Business
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Transform Your Business with{" "}
                <span className="text-blue-600">Online Booking</span>
              </h1>
              <p className="text-xl text-blue-600 font-semibold mb-2">
                Get more customers and revenue
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Stop losing bookings to competitors. FastLane helps you capture every customer and streamline your operations
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-slate-700">Never miss a booking - 24/7 availability</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-slate-700">Instant bookings via QR codes</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-slate-700">Fill up your schedule faster</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-slate-700">Reduce no-shows with confirmed bookings</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg"
                onClick={() => window.location.href = '/auth'}
              >
                Start Your Free Trial
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-lg"
                onClick={() => window.location.href = '/vendor/6e1d3b18-4881-4305-bbd1-a7b92767b484'}
              >
                See Demo
              </Button>
            </div>
          </div>

          {/* Right Side - Hero Image */}
          <div className="flex justify-center">
            <div className="relative aspect-[4/3] w-full max-w-lg rounded-lg overflow-hidden shadow-lg">
              <Image 
                src="/images/landing/hero/hero-activities.jpg"
                alt="Sports and Activities"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 512px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Business Types */}
      <section className="bg-white py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
              Perfect for Any Service Business
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              FastLane works for any business that takes bookings. Join thousands of service providers already growing with our platform.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: MapPin,
                  title: "Tour Guides",
                  description: "Guided Tours & Experiences"
                },
                {
                  icon: Waves,
                  title: "Water Sports",
                  description: "Equipment Rentals & Water Activities"
                },
                {
                  icon: Ship,
                  title: "Boat Tours",
                  description: "Boat Excursions & Marine Tours"
                },
                {
                  icon: Mountain,
                  title: "Adventure Activities",
                  description: "Outdoor Adventures & Extreme Sports"
                },
                {
                  icon: Globe,
                  title: "Cultural Experiences",
                  description: "Cultural Tours & Local Experiences"
                },
                {
                  icon: Calendar,
                  title: "Any Service Business",
                  description: "Appointments & Service Bookings"
                }
              ].map((business, index) => (
                <Card key={index} className="text-center border-slate-200 hover:shadow-md transition-all duration-300 bg-white hover:bg-slate-50">
                  <CardContent className="pt-6 pb-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <business.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{business.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{business.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - How It Works */}
      <section className="bg-gradient-to-br from-blue-50 to-sky-50 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
              How FastLane Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get your business online and accepting bookings in three simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Settings,
                  step: "1",
                  title: "Create Your Activity Listings",
                  description: "Add your services, set availability, and customize booking details"
                },
                {
                  icon: QrCode,
                  step: "2",
                  title: "Share Your QR Code",
                  description: "Customers scan to instantly access your booking page - no app downloads needed"
                },
                {
                  icon: CheckCircle,
                  step: "3",
                  title: "Accept & Manage Bookings",
                  description: "Real-time notifications, easy check-ins, and streamlined customer management"
                }
              ].map((step, index) => (
                <Card key={index} className="relative text-center border-slate-200 hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="pt-6 pb-4">
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                    </div>
                    
                    {/* Icon */}
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 mt-2">
                      <step.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Benefits */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
              Why Choose FastLane?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built for modern businesses that want to grow without complexity
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-3">
            {[
              {
                icon: Rocket,
                title: "Instant Setup",
                description: "Get online in minutes, not weeks",
                details: "No technical knowledge required. Our simple setup wizard gets your booking page live in under 10 minutes. Add your activities, set your availability, and start taking bookings immediately."
              },
              {
                icon: Link,
                title: "QR Code Magic",
                description: "Customers book instantly by scanning",
                details: "Print QR codes on flyers, business cards, or display them at your location. Customers scan and book immediately - no app downloads, no complicated processes."
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                description: "Accept bookings even when you're sleeping",
                details: "Your booking page never closes. Customers can reserve spots at 2 AM or while you're serving other guests. Wake up to new bookings every morning."
              }
            ].map((benefit, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="px-5 py-4">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                      <p className="text-blue-600 font-medium text-sm mb-3">{benefit.description}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{benefit.details}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 - CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              Join hundreds of businesses already using FastLane to grow their bookings
            </p>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Get Started Today</CardTitle>
                <CardDescription>Tell us about your business and we'll get you set up</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input 
                        id="businessName" 
                        placeholder="Your business name"
                        value={formData.business_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Contact Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com"
                        value={formData.contact_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select 
                      value={formData.business_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tour-guide">Tour Guide</SelectItem>
                        <SelectItem value="water-sports">Water Sports</SelectItem>
                        <SelectItem value="boat-tours">Boat Tours</SelectItem>
                        <SelectItem value="adventure">Adventure Activities</SelectItem>
                        <SelectItem value="cultural">Cultural Experiences</SelectItem>
                        <SelectItem value="other">Other Service Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us about your business and any specific needs..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button 
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Start Free Trial'}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex-1 border-slate-300 py-6 text-lg"
                      onClick={() => window.location.href = '/vendor/6e1d3b18-4881-4305-bbd1-a7b92767b484'}
                    >
                      Schedule Demo
                    </Button>
                  </div>
                </form>

                <div className="text-center text-sm text-slate-500 space-y-1">
                  <p>✓ No credit card required</p>
                  <p>✓ Setup support included</p>
                  <p>✓ Cancel anytime</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">FastLane</h3>
            <p className="text-slate-400 mb-8">
              Transforming businesses with simple online booking
            </p>
            <div className="text-sm text-slate-500">
              © 2024 FastLane. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
