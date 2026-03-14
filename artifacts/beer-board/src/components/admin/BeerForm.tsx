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
import { getAuthHeaders } from "@/lib/utils";
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
        }, { request: { headers: getAuthHeaders() } });
        toast({ title: "Success", description: "Beer updated successfully", variant: "default" });
      } else {
        await createBeer({
          data,
        }, { request: { headers: getAuthHeaders() } });
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{beer ? "Edit Beer" : "Add New Beer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tapNumber">Tap Number</Label>
              <Input
                id="tapNumber"
                type="number"
                {...form.register("tapNumber")}
              />
              {form.formState.errors.tapNumber && (
                <p className="text-sm text-destructive">{form.formState.errors.tapNumber.message}</p>
              )}
            </div>
            <div className="space-y-2 flex flex-col justify-end pb-2">
              <div className="flex items-center gap-3">
                <Switch
                  id="available"
                  checked={form.watch("available")}
                  onCheckedChange={(checked) => form.setValue("available", checked)}
                />
                <Label htmlFor="available" className="cursor-pointer">Currently Available</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brewery">Brewery</Label>
            <Input id="brewery" {...form.register("brewery")} placeholder="e.g. Russian River" />
            {form.formState.errors.brewery && (
              <p className="text-sm text-destructive">{form.formState.errors.brewery.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="beerName">Beer Name</Label>
            <Input id="beerName" {...form.register("beerName")} placeholder="e.g. Pliny the Elder" />
            {form.formState.errors.beerName && (
              <p className="text-sm text-destructive">{form.formState.errors.beerName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Input id="style" {...form.register("style")} placeholder="e.g. DIPA" />
              {form.formState.errors.style && (
                <p className="text-sm text-destructive">{form.formState.errors.style.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="abv">ABV %</Label>
              <Input id="abv" {...form.register("abv")} placeholder="e.g. 8.0%" />
              {form.formState.errors.abv && (
                <p className="text-sm text-destructive">{form.formState.errors.abv.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" {...form.register("price")} placeholder="e.g. $8" />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : beer ? "Update Beer" : "Add Beer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
