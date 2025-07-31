import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  BookOpen, 
  Award, 
  CheckCircle, 
  Users,
  ArrowRight,
  Clock,
  Star,
  DollarSign,
  MapPin
} from "lucide-react";

const certificationSteps = [
  {
    id: 1,
    title: "Application",
    description: "Submit credentials and coaching philosophy",
    icon: FileText,
    duration: "5 minutes",
    status: "completed"
  },
  {
    id: 2,
    title: "Training Modules",
    description: "Complete PCP methodology courses",
    icon: BookOpen,
    duration: "2-4 hours",
    status: "in-progress"
  },
  {
    id: 3,
    title: "Assessment",
    description: "Practical coaching evaluation",
    icon: Award,
    duration: "30 minutes",
    status: "upcoming"
  },
  {
    id: 4,
    title: "Certification",
    description: "Receive official PCP credentials",
    icon: CheckCircle,
    duration: "Instant",
    status: "locked"
  },
  {
    id: 5,
    title: "Platform Launch",
    description: "Start accepting students",
    icon: Users,
    duration: "Immediate",
    status: "locked"
  }
];

const statusColors = {
  completed: "bg-green-100 text-green-800 border-green-300",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-300", 
  upcoming: "bg-yellow-100 text-yellow-800 border-yellow-300",
  locked: "bg-gray-100 text-gray-600 border-gray-300"
};

const statusIcons = {
  completed: "✅",
  "in-progress": "🔄", 
  upcoming: "⏳",
  locked: "🔒"
};

export function CoachCertificationFlow() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Become a Certified PCP Coach</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join our elite coaching network and earn 40-60% more than traditional coaching platforms
        </p>
      </div>

      {/* Step Flow */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-300 via-blue-300 to-green-300 hidden lg:block"></div>
        
        <div className="grid lg:grid-cols-5 gap-6">
          {certificationSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Step Number Circle */}
                <div className="relative z-10 mx-auto w-12 h-12 bg-white border-4 border-orange-300 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-lg font-bold text-orange-600">{step.id}</span>
                </div>

                <Card className={`${statusColors[step.status as keyof typeof statusColors]} border-2 hover:shadow-lg transition-all duration-300`}>
                  <CardContent className="p-4 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-3 text-current" />
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm mb-3 opacity-80">{step.description}</p>
                    
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">{step.duration}</span>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {statusIcons[step.status as keyof typeof statusIcons]} {step.status.replace('-', ' ')}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Revenue Highlight */}
      <motion.div 
        className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-bold text-green-900">Higher Earnings</h4>
            <p className="text-sm text-green-700">Earn $95-120/hour vs $60-80 elsewhere</p>
          </div>
          <div>
            <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-bold text-green-900">Elite Recognition</h4>
            <p className="text-sm text-green-700">PCP certification is industry-recognized</p>
          </div>
          <div>
            <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-bold text-green-900">Facility Access</h4>
            <p className="text-sm text-green-700">Exclusive access to FPF partner facilities</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}