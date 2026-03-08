import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangeFilterProps {
  from: Date | undefined;
  to: Date | undefined;
  onFromChange: (date: Date | undefined) => void;
  onToChange: (date: Date | undefined) => void;
}

const DateRangeFilter = ({ from, to, onFromChange, onToChange }: DateRangeFilterProps) => {
  const hasFilter = from || to;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 justify-start text-left font-normal text-xs",
              !from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
            {from ? format(from, "dd MMM yyyy") : "From"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={from}
            onSelect={onFromChange}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <span className="text-xs text-muted-foreground">→</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 justify-start text-left font-normal text-xs",
              !to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
            {to ? format(to, "dd MMM yyyy") : "To"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={to}
            onSelect={onToChange}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => { onFromChange(undefined); onToChange(undefined); }}
        >
          <X className="w-3.5 h-3.5 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
};

export default DateRangeFilter;
