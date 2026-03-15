import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Edit2, Trash2, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BeerForm } from "./BeerForm";
import { useListBeers, useDeleteBeer, useReorderBeers, getListBeersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Beer } from "@workspace/api-client-react";

export function BeerList() {
  const { data: initialBeers, isLoading } = useListBeers();
  const [beers, setBeers] = useState<Beer[]>([]);
  const [editingBeer, setEditingBeer] = useState<Beer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutateAsync: deleteBeer } = useDeleteBeer();
  const { mutateAsync: reorderBeers } = useReorderBeers();

  useEffect(() => {
    if (initialBeers) {
      setBeers([...initialBeers].sort((a, b) => a.position - b.position));
    }
  }, [initialBeers]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(beers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistic update
    setBeers(items);

    try {
      await reorderBeers({
        data: { beerIds: items.map(b => b.id) }
      });
      queryClient.invalidateQueries({ queryKey: getListBeersQueryKey() });
    } catch (error) {
      toast({ title: "Error", description: "Failed to reorder beers", variant: "destructive" });
      if (initialBeers) {
        setBeers([...initialBeers].sort((a, b) => a.position - b.position));
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this beer?")) return;
    try {
      await deleteBeer({ id });
      queryClient.invalidateQueries({ queryKey: getListBeersQueryKey() });
      toast({ title: "Deleted", description: "Beer removed successfully", variant: "default" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete beer", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading beers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Tap List</h2>
        <Button onClick={() => { setEditingBeer(null); setIsFormOpen(true); }}>
          Add New Beer
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="beers-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {beers.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                  No beers on tap yet. Add one to get started!
                </div>
              )}
              {beers.map((beer, index) => (
                <Draggable key={beer.id.toString()} draggableId={beer.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`p-4 flex items-center gap-4 transition-colors ${
                        snapshot.isDragging ? "bg-accent/10 border-accent/50 shadow-2xl" : "hover:border-border"
                      } ${!beer.available ? "opacity-60 grayscale" : ""}`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h4 className="font-bold text-lg truncate">{beer.beerName}</h4>
                          {!beer.available && (
                            <span className="flex items-center gap-1 text-xs font-semibold bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                              <EyeOff className="w-3 h-3" /> Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {beer.brewery} • {beer.style} • {beer.abv}
                        </p>
                      </div>

                      <div className="text-right shrink-0 px-4">
                        <div className="font-bold text-lg">{beer.price}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 border-l pl-4 border-border/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingBeer(beer); setIsFormOpen(true); }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(beer.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <BeerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        beer={editingBeer}
      />
    </div>
  );
}
