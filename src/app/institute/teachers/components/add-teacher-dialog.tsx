"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, User, Phone, MapPin, IndianRupee, BookOpen, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { createTeacher } from "@/actions/teacher"

const formSchema = z.object({
  name: z.string().min(2, "Teacher name must be at least 2 characters."),
  phoneNo: z.string().optional(),
  address: z.string().optional(),
  salary: z.string().optional(),
  subjects: z.string().optional(),
})

export function AddTeacherDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNo: "",
      address: "",
      salary: "",
      subjects: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", values.name)
      if (values.phoneNo) formData.append("phoneNo", values.phoneNo)
      if (values.address) formData.append("address", values.address)
      if (values.salary) formData.append("salary", values.salary)
      if (values.subjects) formData.append("subjects", values.subjects)

      const result = await createTeacher(formData)

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Failed to add teacher",
          description: result.error,
        })
      } else {
        toast({
          title: "Teacher Added",
          description: `${values.name} has been registered to your institute.`,
        })
        form.reset()
        setOpen(false)
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold shadow-sm transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Add Teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-6 bg-white rounded-2xl border border-[#e3e8e5]">
        <DialogHeader className="mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-3">
            <User className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-[#1a201c]">Add New Faculty Member</DialogTitle>
          <DialogDescription className="text-xs text-[#5e6b63]">
            Register a new teacher to your coaching institute and assign subjects.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-[#1a201c]">Full Name *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-[#8b9a90]" />
                      <Input placeholder="Dr. Rajesh Sharma" className="pl-9 h-10 border-[#e3e8e5] text-xs focus-visible:ring-primary focus-visible:border-primary" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="phoneNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-[#1a201c]">Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#8b9a90]" />
                        <Input placeholder="+91 9876543210" className="pl-9 h-10 border-[#e3e8e5] text-xs focus-visible:ring-primary focus-visible:border-primary" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-[#1a201c]">Monthly Salary (₹)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-[#8b9a90]" />
                        <Input placeholder="50000" type="number" className="pl-9 h-10 border-[#e3e8e5] text-xs focus-visible:ring-primary focus-visible:border-primary" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-[#1a201c]">Subjects Taught</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-[#8b9a90]" />
                      <Input placeholder="Physics, Mathematics (comma separated)" className="pl-9 h-10 border-[#e3e8e5] text-xs focus-visible:ring-primary focus-visible:border-primary" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-[#1a201c]">Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[#8b9a90]" />
                      <Input placeholder="Residential address / City" className="pl-9 h-10 border-[#e3e8e5] text-xs focus-visible:ring-primary focus-visible:border-primary" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-10 px-4 text-xs font-medium border-[#e3e8e5]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-sm"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Teacher"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
