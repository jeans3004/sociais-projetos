"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donationSchema } from "@/lib/validators";
import { Donation, DonationFormData, Student, PRODUCT_TYPES, ProductType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { StudentCombobox } from "@/components/StudentCombobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStudents } from "@/lib/firebase/students";

interface DonationFormProps {
  donation?: Donation | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DonationFormData) => Promise<void>;
}

export function DonationForm({
  donation,
  open,
  onClose,
  onSubmit,
}: DonationFormProps) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      studentId: "",
      products: [{ product: "Arroz", quantity: 1, unit: "kg" }],
      date: new Date(),
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const studentIdValue = watch("studentId");

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (donation) {
      reset({
        studentId: donation.studentId,
        products: donation.products,
        date: donation.date.toDate(),
        notes: donation.notes || "",
      });
    } else {
      reset({
        studentId: "",
        products: [{ product: "Arroz", quantity: 1, unit: "kg" }],
        date: new Date(),
        notes: "",
      });
    }
  }, [donation, reset]);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data.filter((s) => s.status === "active"));
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  const onSubmitForm = async (data: DonationFormData) => {
    try {
      setLoading(true);
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {donation ? "Editar Doação" : "Nova Doação"}
          </DialogTitle>
          <DialogDescription>
            Registre uma doação de produtos no sistema. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Aluno *</Label>
            <StudentCombobox
              students={students}
              value={studentIdValue}
              onValueChange={(value) => setValue("studentId", value)}
              placeholder="Digite para buscar um aluno..."
            />
            {errors.studentId && (
              <p className="text-sm text-destructive">
                {errors.studentId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <Input
                  type="date"
                  value={
                    field.value instanceof Date
                      ? field.value.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              )}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Produtos Doados *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ product: "Arroz", quantity: 1, unit: "kg" })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Produto
              </Button>
            </div>

            {errors.products && (
              <p className="text-sm text-destructive">
                {errors.products.message}
              </p>
            )}

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-start p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Produto</Label>
                        <Controller
                          control={control}
                          name={`products.${index}.product`}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PRODUCT_TYPES.map((product) => (
                                  <SelectItem key={product} value={product}>
                                    {product}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.products?.[index]?.product && (
                          <p className="text-xs text-destructive">
                            {errors.products[index]?.product?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Unidade</Label>
                        <Controller
                          control={control}
                          name={`products.${index}.unit`}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">Kg</SelectItem>
                                <SelectItem value="un">Unidade</SelectItem>
                                <SelectItem value="lt">Litro</SelectItem>
                                <SelectItem value="pacote">Pacote</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.products?.[index]?.unit && (
                          <p className="text-xs text-destructive">
                            {errors.products[index]?.unit?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Quantidade</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-9"
                        {...register(`products.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.products?.[index]?.quantity && (
                        <p className="text-xs text-destructive">
                          {errors.products[index]?.quantity?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 mt-5"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              {...register("notes")}
              placeholder="Observações adicionais (opcional)"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : donation ? "Salvar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
