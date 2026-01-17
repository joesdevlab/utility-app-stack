"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, DollarSign, BadgeCheck, AlertCircle } from "lucide-react";
import type { Medicine } from "@/types";

interface MedicineCardProps {
  medicine: Medicine;
  isScanned?: boolean;
  isCheapest?: boolean;
  delay?: number;
}

export function MedicineCard({
  medicine,
  isScanned = false,
  isCheapest = false,
  delay = 0,
}: MedicineCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        className={`relative overflow-hidden ${
          isScanned
            ? "border-amber-500/50 bg-amber-500/5"
            : isCheapest
            ? "border-emerald-500/50 bg-emerald-500/5"
            : ""
        }`}
      >
        {/* Badge */}
        {isScanned && (
          <div className="absolute top-0 right-0">
            <Badge className="rounded-none rounded-bl-lg bg-amber-500">
              Scanned
            </Badge>
          </div>
        )}
        {isCheapest && !isScanned && (
          <div className="absolute top-0 right-0">
            <Badge className="rounded-none rounded-bl-lg bg-emerald-500">
              Best Value
            </Badge>
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                medicine.isGeneric
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-amber-500/10 text-amber-500"
              }`}
            >
              <Pill className="h-6 w-6" />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold truncate">{medicine.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {medicine.activeIngredient} {medicine.strength}
                  </p>
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs font-normal">
                  {medicine.form}
                </Badge>
                <Badge variant="outline" className="text-xs font-normal">
                  {medicine.packSize} pack
                </Badge>
                {medicine.isGeneric && (
                  <Badge
                    variant="outline"
                    className="text-xs font-normal border-emerald-500/30 text-emerald-600"
                  >
                    Generic
                  </Badge>
                )}
              </div>

              {/* Price Row */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-bold">
                    ${medicine.price.toFixed(2)}
                  </span>
                </div>

                {medicine.isSubsidized && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      ${medicine.subsidyPrice?.toFixed(2)} with prescription
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface SavingsCardProps {
  savings: number;
  subsidyAvailable: boolean;
}

export function SavingsCard({ savings, subsidyAvailable }: SavingsCardProps) {
  if (savings <= 0 && !subsidyAvailable) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Potential savings</p>
              <p className="text-2xl font-bold">${savings.toFixed(2)}</p>
            </div>
          </div>

          {subsidyAvailable && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm text-emerald-100">
                Ask your GP for a prescription — it could cost only $5!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
