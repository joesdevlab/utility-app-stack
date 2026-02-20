"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  ClipboardCheck,
  ExternalLink,
  FileText,
  GraduationCap,
  HardHat,
  Lightbulb,
  Shield,
  Target,
  Wrench,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface AccordionSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

export default function BCITOCompliancePage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["what-is-bcito"]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const sections: AccordionSection[] = [
    {
      id: "what-is-bcito",
      icon: <GraduationCap className="h-5 w-5 text-orange-600" />,
      title: "What is BCITO?",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            BCITO (Building and Construction Industry Training Organisation) is New Zealand&apos;s
            leading industry training organisation for the building and construction sector.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            As an apprentice, you&apos;re required to maintain detailed records of your on-the-job
            training, including tasks completed, hours worked, skills developed, and tools used.
          </p>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
            <p className="text-sm font-medium text-orange-800">
              💡 Apprentice Log helps you meet these requirements by automatically formatting
              your voice recordings into BCITO-compliant entries.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "logbook-requirements",
      icon: <ClipboardCheck className="h-5 w-5 text-blue-600" />,
      title: "Logbook Requirements",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Your BCITO logbook entries should capture the following information:
          </p>

          <div className="grid gap-3">
            <RequirementCard
              icon={<FileText className="h-4 w-4" />}
              title="Task Descriptions"
              description="Detailed description of work performed each day"
              example="Installed weatherboards on north-facing wall using pneumatic nailer"
            />
            <RequirementCard
              icon={<Clock className="h-4 w-4" />}
              title="Hours Worked"
              description="Time spent on each task or total daily hours"
              example="4.5 hours on cladding, 2 hours on trim work"
            />
            <RequirementCard
              icon={<Wrench className="h-4 w-4" />}
              title="Tools Used"
              description="Equipment and tools used during tasks"
              example="Nail gun, spirit level, circular saw, tape measure"
            />
            <RequirementCard
              icon={<BookOpen className="h-4 w-4" />}
              title="Skills Developed"
              description="BCITO unit standards or competencies practiced"
              example="LBP 3667 - Install external cladding systems"
            />
            <RequirementCard
              icon={<Shield className="h-4 w-4" />}
              title="Safety Observations"
              description="Health and safety practices followed"
              example="Conducted toolbox talk, wore PPE, set up scaffolding correctly"
            />
          </div>
        </div>
      ),
    },
    {
      id: "documentation",
      icon: <FileText className="h-5 w-5 text-green-600" />,
      title: "Required Documentation",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Throughout your apprenticeship, you&apos;ll need to maintain these records:
          </p>

          <div className="space-y-2">
            <DocumentItem
              title="Daily/Weekly Logbook"
              description="Regular entries of work activities, typically signed off by your supervisor"
              required
            />
            <DocumentItem
              title="Supervisor Sign-offs"
              description="Your supervisor verifies completed work and hours"
              required
            />
            <DocumentItem
              title="Unit Standard Evidence"
              description="Proof of competencies achieved against BCITO unit standards"
              required
            />
            <DocumentItem
              title="Photos of Work"
              description="Visual evidence of completed tasks (recommended)"
            />
            <DocumentItem
              title="Training Records"
              description="Certificates from any courses or training attended"
            />
            <DocumentItem
              title="Site Induction Records"
              description="Documentation of site safety inductions"
            />
          </div>
        </div>
      ),
    },
    {
      id: "tips",
      icon: <Lightbulb className="h-5 w-5 text-amber-600" />,
      title: "Compliance Tips",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <TipCard
              number={1}
              title="Log Daily"
              description="Record entries at the end of each workday while details are fresh. Use voice recording on your commute home!"
            />
            <TipCard
              number={2}
              title="Be Specific"
              description="Instead of 'did framing work', say 'Installed 90x45 wall framing for bathroom addition using nail gun and spirit level'"
            />
            <TipCard
              number={3}
              title="Track All Hours"
              description="Include travel time, training, and any overtime. Every hour counts toward your qualification."
            />
            <TipCard
              number={4}
              title="Mention Safety"
              description="Include safety observations in your entries - PPE worn, hazards identified, safe work practices followed."
            />
            <TipCard
              number={5}
              title="Take Photos"
              description="Photograph your work before and after. Visual evidence supports your logbook entries."
            />
            <TipCard
              number={6}
              title="Get Regular Sign-offs"
              description="Don't wait until the end of the month. Get your supervisor to sign off entries weekly."
            />
          </div>
        </div>
      ),
    },
    {
      id: "unit-standards",
      icon: <Target className="h-5 w-5 text-purple-600" />,
      title: "Common Unit Standards",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Here are some common BCITO unit standards you may work toward:
          </p>

          <div className="grid gap-2">
            <UnitStandardBadge code="LBP 3667" title="Install external cladding systems" />
            <UnitStandardBadge code="LBP 3668" title="Install windows and doors" />
            <UnitStandardBadge code="LBP 3670" title="Install interior linings" />
            <UnitStandardBadge code="LBP 3669" title="Install insulation" />
            <UnitStandardBadge code="LBP 3671" title="Install wall and ceiling framing" />
            <UnitStandardBadge code="LBP 3673" title="Install roof framing" />
            <UnitStandardBadge code="LBP 3679" title="Install floor systems" />
            <UnitStandardBadge code="LBP 3683" title="Health and safety in construction" />
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Note: Unit standards vary by trade. Check with your employer or BCITO for your specific requirements.
          </p>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="px-4 py-4">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <Card className="border-gray-200 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 px-4 py-5">
              <div className="flex items-center gap-4">
                <Link href="/app/settings">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/20 hover:bg-white/30 text-white">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">BCITO Compliance</h2>
                  <p className="text-sm text-white/80">
                    Your guide to apprentice logbook requirements
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <HardHat className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <CardContent className="py-4 px-4 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">4 years</p>
                    <p className="text-xs text-gray-500">Typical Duration</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">8,000+</p>
                    <p className="text-xs text-gray-500">Required Hours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Accordion Sections */}
        <div className="space-y-3">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden border-gray-200">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    {section.icon}
                  </div>
                  <span className="flex-1 font-semibold text-gray-900">
                    {section.title}
                  </span>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.includes(section.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="pt-0 pb-4 px-4 border-t border-gray-100">
                        {section.content}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* External Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Official Resources
          </h3>
          <div className="space-y-2">
            <ExternalLinkButton
              href="https://bcito.org.nz"
              title="BCITO Website"
              description="Official BCITO information and resources"
            />
            <ExternalLinkButton
              href="https://bcito.org.nz/apprentices/"
              title="Apprentice Portal"
              description="Access your BCITO apprentice account"
            />
            <ExternalLinkButton
              href="https://www.building.govt.nz"
              title="Building.govt.nz"
              description="NZ building regulations and standards"
            />
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-400">
            This information is provided as a guide only. Please refer to official BCITO
            documentation for complete requirements.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

// Sub-components

function RequirementCard({
  icon,
  title,
  description,
  example,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  example: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-gray-600">{icon}</div>
        <span className="font-medium text-sm text-gray-900">{title}</span>
      </div>
      <p className="text-xs text-gray-600 mb-2">{description}</p>
      <div className="bg-white rounded px-2 py-1.5 border border-gray-200">
        <p className="text-xs text-gray-500 italic">&ldquo;{example}&rdquo;</p>
      </div>
    </div>
  );
}

function DocumentItem({
  title,
  description,
  required,
}: {
  title: string;
  description: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${required ? "bg-red-500" : "bg-gray-300"}`} />
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-900">{title}</span>
          {required && (
            <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">Required</Badge>
          )}
        </div>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function TipCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
      <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
        {number}
      </div>
      <div>
        <span className="font-medium text-sm text-gray-900">{title}</span>
        <p className="text-xs text-gray-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function UnitStandardBadge({ code, title }: { code: string; title: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
      <Badge className="bg-purple-600 text-white border-0 text-[10px] font-mono shrink-0">
        {code}
      </Badge>
      <span className="text-xs text-gray-700">{title}</span>
    </div>
  );
}


function ExternalLinkButton({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-200 hover:bg-orange-50/30 transition-colors group"
    >
      <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center shrink-0 transition-colors">
        <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-orange-600" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm text-gray-900 block">{title}</span>
        <span className="text-xs text-gray-500">{description}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 shrink-0" />
    </a>
  );
}
