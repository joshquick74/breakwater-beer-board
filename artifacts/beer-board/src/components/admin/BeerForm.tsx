import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateBeer, useUpdateBeer } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListBeersQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import type { Beer } from "@workspace/api-client-react";

const beerSchema = z.object({
  tapNumber: z.coerce.number().min(1, "Tap number is required"),
  beerName: z.string().min(1, "Beer name is required"),
  brewery: z.string().min(1, "Brewery is required"),
  style: z.string().min(1, "Style is required"),
  abv: z.string().min(1, "ABV is required"),
  price: z.string().min(1, "Price is required"),
  available: z.boolean().default(true),
});

type BeerFormValues = z.infer<typeof beerSchema>;

interface BeerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beer?: Beer | null;
}

export function BeerForm({ open, onOpenChange, beer }: BeerFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BeerFormValues>({
    resolver: zodResolver(beerSchema),
    defaultValues: {
      tapNumber: 1,
      beerName: "",
      brewery: "",
      style: "",
      abv: "",
      price: "",
      available: true,
    },
  });

  useEffect(() => {
    if (beer && open) {
      form.reset({
        tapNumber: beer.tapNumber,
        beerName: beer.beerName,
        brewery: beer.brewery,
        style: beer.style,
        abv: beer.abv,
        price: beer.price,
        available: beer.available,
      });
    } else if (!beer && open) {
      form.reset({
        tapNumber: 1,
        beerName: "",
        brewery: "",
        style: "",
        abv: "",
        price: "",
        available: true,
      });
    }
  }, [beer, open, form]);

  const { mutateAsync: createBeer } = useCreateBeer();
  const { mutateAsync: updateBeer } = useUpdateBeer();

  const onSubmit = async (data: BeerFormValues) => {
    setIsSubmitting(true);
    try {
      if (beer) {
        await updateBeer({
          id: beer.id,
          data,
        });
        toast({ title: "Success", description: "Beer updated successfully", variant: "default" });
      } else {
        await createBeer({
          data,
        });
        toast({ title: "Success", description: "Beer created successfully", variant: "default" });
      }
      queryClient.invalidateQueries({ queryKey: getListBeersQueryKey() });
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save beer", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{beer ? "Edit Beer" : "Add New Beer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tapNumber">Tap Number</Label>
              <Input
                id="tapNumber"
                type="number"
                inputMode="numeric"
                className="h-11 sm:h-10"
                {...form.register("tapNumber")}
              />
              {form.formState.errors.tapNumber && (
                <p className="text-sm text-destructive">{form.formState.errors.tapNumber.message}</p>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-3 sm:py-2 sm:self-end">
              <Switch
                id="available"
                checked={form.watch("available")}
                onCheckedChange={(checked) => form.setValue("available", checked)}
              />
              <Label htmlFor="available" className="cursor-pointer text-sm font-medium">
                Currently Available
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brewery">Brewery</Label>
            <Input
              id="brewery"
              autoCapitalize="words"
              autoComplete="off"
              className="h-11 sm:h-10"
              placeholder="e.g. Russian River"
              {...form.register("brewery")}
            />
            {form.formState.errors.brewery && (
              <p className="text-sm text-destructive">{form.formState.errors.brewery.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="beerName">Beer Name</Label>
            <Input
              id="beerName"
              autoCapitalize="words"
              autoComplete="off"
              className="h-11 sm:h-10"
              placeholder="e.g. Pliny the Elder"
              {...form.register("beerName")}
            />
            {form.formState.errors.beerName && (
              <p className="text-sm text-destructive">{form.formState.errors.beerName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Input
                id="style"
                autoCapitalize="words"
                autoComplete="off"
                className="h-11 sm:h-10"
                placeholder="e.g. DIPA"
                {...form.register("style")}
              />
              {form.formState.errors.style && (
                <p className="text-sm text-destructive">{form.formState.errors.style.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="abv">ABV %</Label>
              <Input
                id="abv"
                inputMode="decimal"
                autoComplete="off"
                className="h-11 sm:h-10"
                placeholder="e.g. 8.0%"
                {...form.register("abv")}
              />
              {form.formState.errors.abv && (
                <p className="text-sm text-destructive">{form.formState.errors.abv.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                inputMode="decimal"
                autoComplete="off"
                className="h-11 sm:h-10"
                placeholder="e.g. $8"
                {...form.register("price")}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto h-11 sm:h-10"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 sm:h-10"
            >
              {isSubmitting ? "Saving..." : beer ? "Update Beer" : "Add Beer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
