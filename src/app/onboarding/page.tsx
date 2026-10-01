"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Building2, Phone, MapPin, Loader2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { completeOnboarding } from "@/actions/onboarding"

const formSchema = z.object({
  name: z.string().min(2, "Institute name must be at least 2 characters."),
  phoneNo: z.string().min(10, "Please enter a valid phone number."),
  location: z.string().min(2, "Please enter a location."),
})

export default function OnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNo: "",
      location: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("phoneNo", values.phoneNo)
      formData.append("location", values.location)
      
      const result = await completeOnboarding(formData)
      
      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Setup failed",
          description: result.error,
        })
        setIsSubmitting(false)
      } else if (result?.success) {
        toast({
          title: "Setup completed!",
          description: "Welcome to your institute dashboard.",
        })
        window.location.href = "/institute"
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again later.",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f7f8fa]">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full max-w-xl mx-auto">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          
          <div className="mb-8">
            <div className="w-[42px] h-[42px] flex items-center justify-center rounded-[10px] text-white shadow-[0_4px_10px_rgba(37,99,235,0.22)] mb-6 bg-gradient-to-br from-blue-500 to-primary">
              <Building2 className="w-5 h-5" strokeWidth={2.4} />
            </div>
            <h2 className="text-[24px] font-bold tracking-tight text-[#111318]">Set up your institute</h2>
            <p className="text-[14px] text-[#5f636d] mt-2">
              Welcome to Edmingle! Let's get your coaching center configured.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-[#e7e9ed] shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px] font-medium text-[#34373e]">Institute Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-[#8b9099]" />
                          <Input placeholder="Apex Academy" className="pl-9 h-10 border-[#e7e9ed] focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px] font-medium text-[#34373e]">Contact Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-[#8b9099]" />
                          <Input placeholder="+91 9876543210" className="pl-9 h-10 border-[#e7e9ed] focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px] font-medium text-[#34373e]">City / Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#8b9099]" />
                          <Input placeholder="Mumbai, India" className="pl-9 h-10 border-[#e7e9ed] focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button type="submit" disabled={isSubmitting} className="w-full h-10 text-[13px] font-semibold bg-primary hover:bg-primary-hover text-white shadow-sm">
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
