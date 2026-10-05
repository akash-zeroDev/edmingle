"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, Phone, Mail, MapPin, BookOpen, GraduationCap } from "lucide-react"
import { enrollStudent } from "@/actions/student"
import { useToast } from "@/hooks/use-toast"
import { CustomSelect } from "@/components/ui/custom-select"

export function EnrollStudentForm({ batches }: { batches: any[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phoneNo: "",
    parentPhone: "",
    email: "",
    address: "",
  });

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const uniqueClasses = Array.from(new Set(batches.map(b => b.className)));
  const eligibleBatches = batches.filter(b => b.className === selectedClass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    const result = await enrollStudent({
      ...formData,
      batchId: selectedBatchId || undefined
    });
    setIsSubmitting(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Student enrolled.",
      });
      router.push("/institute/students");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-[800px] flex flex-col gap-8">
      
      {/* Personal Details Section */}
      <div className="bg-white rounded-2xl border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#e7e9ed] bg-[#fafbfc]">
          <h2 className="text-[15px] font-bold text-[#1a201c] flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Personal Details
          </h2>
          <p className="text-[12px] text-[#5e6b63] mt-1">Basic information about the student.</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[12px] font-semibold text-[#1a201c] mb-2">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1b0a6]" />
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. John Doe"
                className="w-full h-11 pl-10 pr-4 text-[13px] bg-white border border-[#e3e8e5] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[#1a201c] placeholder:text-[#a1b0a6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#1a201c] mb-2">Student Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1b0a6]" />
              <input 
                type="tel" 
                value={formData.phoneNo}
                onChange={e => setFormData({...formData, phoneNo: e.target.value})}
                placeholder="+91 99999 99999"
                className="w-full h-11 pl-10 pr-4 text-[13px] bg-white border border-[#e3e8e5] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[#1a201c] placeholder:text-[#a1b0a6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#1a201c] mb-2">Parent Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1b0a6]" />
              <input 
                type="tel" 
                value={formData.parentPhone}
                onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                placeholder="+91 99999 99999"
                className="w-full h-11 pl-10 pr-4 text-[13px] bg-white border border-[#e3e8e5] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[#1a201c] placeholder:text-[#a1b0a6]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[12px] font-semibold text-[#1a201c]">Email address</label>
              <span className="text-[10px] font-medium text-[#5e6b63] bg-slate-100 px-1.5 py-0.5 rounded">Optional</span>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1b0a6]" />
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="student@example.com"
                className="w-full h-11 pl-10 pr-4 text-[13px] bg-white border border-[#e3e8e5] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[#1a201c] placeholder:text-[#a1b0a6]"
              />
            </div>
            <p className="text-[11px] text-[#5e6b63] mt-1.5">
              An invite link will be sent to this email.
            </p>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#1a201c] mb-2">Location / Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1b0a6]" />
              <input 
                type="text" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="e.g. South Extension, New Delhi"
                className="w-full h-11 pl-10 pr-4 text-[13px] bg-white border border-[#e3e8e5] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[#1a201c] placeholder:text-[#a1b0a6]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Batch Assignment Section */}
      <div className="bg-white rounded-2xl border border-[#e7e9ed] shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#e7e9ed] bg-[#fafbfc]">
          <h2 className="text-[15px] font-bold text-[#1a201c] flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            Batch (Optional)
          </h2>
          <p className="text-[12px] text-[#5e6b63] mt-1">Assign an initial batch.</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[12px] font-semibold text-[#1a201c] mb-2">Class</label>
            <CustomSelect
              value={selectedClass}
              onChange={(val) => {
                setSelectedClass(val);
                setSelectedBatchId("");
              }}
              options={uniqueClasses.map((c) => ({ value: c, label: c }))}
              placeholder="Select class"
              searchPlaceholder="Search classes..."
              searchable={uniqueClasses.length > 5}
              size="lg"
            />
          </div>

          {selectedClass && (
            <div>
              <label className="block text-[12px] font-semibold text-[#1a201c] mb-2">Batch</label>
              <CustomSelect
                value={selectedBatchId}
                onChange={setSelectedBatchId}
                options={eligibleBatches.map((b) => ({
                  value: b.id,
                  label: b.subject,
                  description: b.timing ? `Timing: ${b.timing}` : undefined,
                }))}
                placeholder="Select batch"
                searchPlaceholder="Search batches..."
                searchable={eligibleBatches.length > 5}
                size="lg"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push("/institute/students")}
          className="h-11 px-6 rounded-xl border-[#e3e8e5] text-[#5e6b63] hover:bg-[#f8faf9]"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !formData.name}
          className="h-11 px-8 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm transition-all font-semibold"
        >
          {isSubmitting ? "Saving..." : "Add student"}
        </Button>
      </div>

    </form>
  )
}
