"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Layers3, BookOpen, Clock, UserSquare2, Loader2, Sparkles, GraduationCap } from "lucide-react"

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
import { CustomSelect } from "@/components/ui/custom-select"
import { useToast } from "@/hooks/use-toast"
import { createBatch } from "@/actions/batch"

const formSchema = z.object({
  className: z.string().min(1, "Class is required (e.g. Class 12, Class 11)."),
  batchName: z.string().min(1, "Batch name is required (e.g. Batch A, Morning Batch)."),
  subject: z.string().min(1, "Subject is required (e.g. Physics, Mathematics)."),
  timing: z.string().optional(),
  teacherId: z.string().optional(),
})

interface TeacherOption {
  id: string
  name: string
  subjects?: string | null
}

const commonClassSuggestions = [
  "Class 12",
  "Class 11",
  "Class 10",
  "Class 9",
  "Class 8",
  "Dropper",
  "Undergraduate",
]

export function AddBatchDialog({ teachers = [] }: { teachers: TeacherOption[] }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      className: "",
      batchName: "",
      subject: "",
      timing: "",
      teacherId: "none",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("className", values.className)
      formData.append("batchName", values.batchName)
      formData.append("subject", values.subject)
      if (values.timing) formData.append("timing", values.timing)
      if (values.teacherId && values.teacherId !== "none") {
        formData.append("teacherId", values.teacherId)
      }

      const result = await createBatch(formData)

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Failed to create batch",
          description: result.error,
        })
      } else {
        toast({
          title: "Batch created",
          description: `${values.className} - ${values.batchName} created.`,
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
          Add Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] p-6 bg-white rounded-2xl border border-[#e3e8e5]">
        <DialogHeader className="mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-3">
            <Layers3 className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-[#1a201c]">New batch</DialogTitle>
          <DialogDescription className="text-xs text-[#5e6b63]">
            Add a batch with a schedule and assigned teacher.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Class */}
              <FormField
                control={form.control}
                name="className"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-[#1a201c]">
                      Class *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-[#8b9a90]" />
                        <Input
                          list="class-suggestions"
                          placeholder="e.g. Class 12"
                          className="pl-9 h-10 border-[#e3e8e5] text-xs rounded-xl focus:border-primary focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/25 transition-all"
                          {...field}
                        />
                        <datalist id="class-suggestions">
                          {commonClassSuggestions.map((cls) => (
                            <option key={cls} value={cls} />
                          ))}
                        </datalist>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* Batch Name */}
              <FormField
                control={form.control}
                name="batchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-[#1a201c]">
                      Batch name *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Sparkles className="absolute left-3 top-2.5 h-4 w-4 text-[#8b9a90]" />
                        <Input
                          placeholder="e.g. Batch A"
                          className="pl-9 h-10 border-[#e3e8e5] text-xs rounded-xl focus:border-primary focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/25 transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-[#1a201c]">
                    Subject *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-[#8b9a90]" />
                      <Input
                        placeholder="e.g. Physics, Mathematics, Organic Chemistry"
                        className="pl-9 h-10 border-[#e3e8e5] text-xs rounded-xl focus:border-primary focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/25 transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-[#1a201c]">
                    Timing (Optional)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-[#8b9a90]" />
                      <Input
                        placeholder="e.g. Mon, Wed, Fri · 09:00 AM - 10:30 AM"
                        className="pl-9 h-10 border-[#e3e8e5] text-xs rounded-xl focus:border-primary focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/25 transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-[#1a201c]">
                    Teacher (Optional)
                  </FormLabel>
                  <FormControl>
                    <CustomSelect
                      value={field.value || "none"}
                      onChange={field.onChange}
                      options={[
                        { value: "none", label: "Unassigned" },
                        ...teachers.map((t) => ({
                          value: t.id,
                          label: t.name,
                          description: t.subjects ? `Subjects: ${t.subjects}` : undefined,
                        })),
                      ]}
                      icon={UserSquare2}
                      placeholder="Select teacher"
                      searchPlaceholder="Search teachers..."
                      searchable={teachers.length > 5}
                      className="w-full h-10"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-10 px-4 text-xs font-medium border-[#e3e8e5] rounded-xl focus:outline-none focus-visible:outline-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-sm rounded-xl focus:outline-none focus-visible:outline-none"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                Create Batch
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
